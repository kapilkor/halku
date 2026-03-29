/**
 * halkuLang.ts — HalkuLang Entry Point
 * ─────────────────────────────────────────────────────────────────
 * Public API:
 *
 *   isHalkuLang(code)     → boolean   auto-detect HalkuLang source
 *   runHalkuLang(code, onLine) → RunResult
 *
 * Pipeline: source → tokenize → parse → interpret → output lines
 *
 * Execution is synchronous (the Interpreter is our own sandboxed
 * TS code with step limits — no Worker needed, no infinite-loop risk).
 */

import { tokenize, LexError } from './tokenizer';
import { parse,    ParseError } from './parser';
import { Interpreter, RuntimeError } from './interpreter';
import type { RunResult, OutputLine, OutputType } from '@/lib/outputTypes';

// ─── Detection keywords ───────────────────────────────────────────────────────

const DETECT_KEYWORDS = [
  'halku re', 'bye halku', 'maan le', 'sun re', 'bhai agar', 'nahi toh',
  'jab tak re', 'iske liye', 'badha re', 'ghata re',
  'de re', 'bas kar re', 'agla dekh re',
];

/**
 * Returns true if the source looks like HalkuLang.
 * We check for any of the distinctive multi-word keywords.
 */
export function isHalkuLang(code: string): boolean {
  return DETECT_KEYWORDS.some((kw) => code.includes(kw));
}

/**
 * Strips optional wrapper block syntax from code.
 * 
 * Supports:
 *   hi halku re
 *   ...code...
 *   bye halku
 * 
 * This wrapper is purely visual and optional. If found, it's removed
 * before parsing. If not found, code is passed through unchanged.
 * 
 * Edge cases handled:
 * - Extra whitespace around keywords
 * - Missing closing wrapper (ignored, no error)
 * - Partial wrapper (ignored, no error)
 * - Comments or blank lines before/after wrapper
 * - Indentation inside wrapper is preserved relatively but dedented
 * 
 * @param code Raw source code
 * @returns Unwrapped and dedented code (or original if no wrapper found)
 */
export function stripWrapperBlock(code: string): string {
  const lines = code.split('\n');
  
  // Find the line indices for wrapper start and end
  let startIdx = -1;
  let endIdx = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim().toLowerCase();
    
    if (startIdx === -1 && /^hi\s+halku\s+re\s*$/.test(trimmed)) {
      startIdx = i;
    }
    
    if (startIdx !== -1 && /^bye\s+halku\s*$/.test(trimmed)) {
      endIdx = i;
      break; // Found closing, stop looking
    }
  }
  
  // If we found both wrapper markers
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    // Extract lines before wrapper, inner lines, and lines after wrapper
    const beforeWrapper = lines.slice(0, startIdx);
    const innerLines = lines.slice(startIdx + 1, endIdx);
    const afterWrapper = lines.slice(endIdx + 1);
    
    // Dedent inner lines
    const nonEmptyLines = innerLines.filter(line => line.trim().length > 0);
    
    let dedentedInner: string[];
    
    if (nonEmptyLines.length === 0) {
      dedentedInner = [];
    } else {
      // Find minimum indentation
      const minIndent = Math.min(
        ...nonEmptyLines.map(line => {
          const match = line.match(/^(\s*)/);
          return match ? match[1].length : 0;
        })
      );
      
      // Dedent by minimum indent
      dedentedInner = innerLines.map(line => {
        if (line.trim().length === 0) {
          return ''; // keep empty lines empty
        }
        return line.slice(minIndent);
      });
    }
    
    // Recombine: before + inner(dedented) + after
    return [
      ...beforeWrapper,
      ...dedentedInner,
      ...afterWrapper
    ].join('\n');
  }
  
  // No wrapper or malformed → return unchanged
  return code;
}

/**
 * Applies custom keyword mappings to the source code before execution.
 * @param code The original source code
 * @param mapping Record of { "userWord": "halkuWord" }
 * @returns Source code with user words replaced by standard HalkuLang words
 */
export const applyCustomMapping = (code: string, mapping: Record<string, string>): string => {
  let result = code;
  // Sort keys by length descending to avoid partial matches (e.g. replacing "bol" inside "bol re")
  const sortedKeys = Object.keys(mapping).sort((a, b) => b.length - a.length);
  
  sortedKeys.forEach((userWord) => {
    const halkuTarget = mapping[userWord];
    // Replace whole words, handling multi-word expressions securely
    // We use a regex that matches the exact phrase bounded by non-word boundaries or start/end
    // To handle spaces in phrases like "bol re", we escape the phrase for the regex
    const escapedUserWord = userWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<=\\b|^)${escapedUserWord}(?=\\b|$)`, 'g');
    result = result.replace(regex, halkuTarget);
  });
  return result;
};

// ─── ID generator ─────────────────────────────────────────────────────────────

let _id = 0;
const nextId = () => ++_id;

// ─── Runner ───────────────────────────────────────────────────────────────────

/**
 * Execute HalkuLang source code synchronously.
 *
 * @param code   Raw HalkuLang source
 * @param onLine Streaming callback — called for every output line
 * @returns      Full RunResult (lines, hasError, durationMs)
 */
export function runHalkuLang(
  code: string,
  onLine: (line: OutputLine) => void
): RunResult {
  const lines:    OutputLine[] = [];
  let   hasError               = false;
  const start                  = performance.now();

  const emit = (text: string, type: OutputType = 'log') => {
    const line: OutputLine = { id: nextId(), type, text, timestamp: Date.now() };
    if (type === 'error') hasError = true;
    lines.push(line);
    onLine(line);
  };

  try {
    // Strip optional wrapper block if present (hi halku re ... bye halku)
    const unwrappedCode = stripWrapperBlock(code);

    const tokens = tokenize(unwrappedCode);

    // 2. Parse
    const ast = parse(tokens);

    // 3. Interpret
    const interpreter = new Interpreter({ print: (text) => emit(text, 'log') });
    interpreter.run(ast);

  } catch (err: unknown) {
    if (
      err instanceof LexError    ||
      err instanceof ParseError  ||
      err instanceof RuntimeError
    ) {
      emit(err.message, 'error');
    } else {
      emit(`Unexpected error: ${String(err)}`, 'error');
    }
  }

  return { lines, hasError, durationMs: performance.now() - start };
}

// ─── Example code shown when HalkuLang mode is first detected ────────────────

export const HALKULANG_DEFAULT = `// HalkuLang — Hindi-English hybrid scripting

hi halku re
  maan le naam = "Duniya";
  sun re "Namaste, " + naam + "!";

  // Counting with jab tak re (while)
  maan le ginti = 0;

  jab tak re (ginti < 5) {
    sun re ginti;
    badha re ginti;
  }

  // function: factorial
  function factorial(n) {
    bhai agar (n <= 1) {
      de re 1;
    }
    de re n * factorial(n - 1);
  }

  sun re "5! = " + factorial(5);

  // for loop
  iske liye (maan le i = 0; i < 3; badha re i) {
    sun re "for loop i = " + i;
  }
bye halku
`;
