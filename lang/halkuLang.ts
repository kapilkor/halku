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
  'hi halku', 'bye halku', 'maan le', 'sun re', 'bhai agar', 'nahi toh',
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
    // Extract block between `hi halku` and `bye halku`
    const startIndex = code.indexOf('hi halku');
    const endIndex = code.indexOf('bye halku', startIndex + 1);

    let activeCode = code;
    if (startIndex !== -1 && endIndex !== -1) {
      activeCode = code.substring(startIndex + 'hi halku'.length, endIndex);
    } else if (startIndex !== -1) {
      // Missing bye halku
      throw new LexError("Expected 'bye halku' to end the program", 1, 1);
    } else if (endIndex !== -1) {
      // Missing hi halku
      throw new LexError("Expected 'hi halku' to start the program", 1, 1);
    } else {
      // Neither found — technically an empty program if not throwing, but we'll let tokenizer parse empty string
      activeCode = '';
    }

    // 1. Tokenize
    const tokens = tokenize(activeCode);

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

hi halku
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
