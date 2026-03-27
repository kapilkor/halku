/**
 * halkuCompiler.ts
 *
 * Transforms Halku source (a superset of JS with sugar keywords)
 * into valid JavaScript, then wraps it in a strict IIFE.
 *
 * Keyword table (13 keywords):
 *  Halku        →  JavaScript
 *  ─────────────────────────────
 *  print        →  console.log
 *  warn         →  console.warn
 *  info         →  console.info
 *  err          →  console.error
 *  fn           →  function
 *  let!         →  const
 *  loop         →  for
 *  each         →  forEach
 *  when         →  if
 *  otherwise    →  else
 *  ret          →  return
 *  wait         →  await
 *  task         →  async function
 */

export interface CompileResult {
  ok: boolean;
  js: string;
  error?: string;
}

// Order matters — longer / more specific tokens first
const KEYWORD_MAP: [RegExp, string][] = [
  // Multi-word first
  [/\btask\s+/g, "async function "],
  // Single-word
  [/\bprint\s*\(/g, "console.log("],
  [/\bwarn\s*\(/g, "console.warn("],
  [/\binfo\s*\(/g, "console.info("],
  [/\berr\s*\(/g, "console.error("],
  [/\blet!/g, "const"],
  [/\bfn\b/g, "function"],
  [/\bloop\b/g, "for"],
  [/\beach\b/g, "forEach"],
  [/\bwhen\b/g, "if"],
  [/\botherwise\b/g, "else"],
  [/\bret\b/g, "return"],
  [/\bwait\b/g, "await"],
];

/**
 * Strip single-line comments before mapping so we don't accidentally
 * replace keywords inside comment text.
 */
function stripLineComments(src: string): string {
  // Replace // ... (not inside strings) – simple heuristic
  return src.replace(/\/\/[^\n]*/g, (match) => " ".repeat(match.length));
}

export function halkuCompile(source: string): CompileResult {
  try {
    let js = source;

    // Preserve string literals by temporarily replacing them
    const stringLiterals: string[] = [];
    js = js.replace(
      /(["'`])(?:(?!\1)[^\\]|\\.|\n)*?\1/g,
      (match) => {
        stringLiterals.push(match);
        return `__STR_${stringLiterals.length - 1}__`;
      }
    );

    // Strip comments on the comment-safe version
    const stripped = stripLineComments(js);

    // Apply keyword substitutions
    let transformed = stripped;
    for (const [pattern, replacement] of KEYWORD_MAP) {
      transformed = transformed.replace(pattern, replacement);
    }

    // Restore string literals
    transformed = transformed.replace(
      /__STR_(\d+)__/g,
      (_, idx) => stringLiterals[Number(idx)]
    );

    // Wrap in IIFE — isolates variable scope without strict mode
    // (strict mode is handled by the Worker's module context)
    const iife = `(function() {\n${transformed}\n})();`;

    return { ok: true, js: iife };
  } catch (e: unknown) {
    return {
      ok: false,
      js: "",
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

/**
 * Returns the full keyword reference table for display purposes.
 */
export const KEYWORD_REFERENCE = [
  { halku: "print(...)", js: "console.log(...)" },
  { halku: "warn(...)", js: "console.warn(...)" },
  { halku: "info(...)", js: "console.info(...)" },
  { halku: "err(...)", js: "console.error(...)" },
  { halku: "fn", js: "function" },
  { halku: "let!", js: "const" },
  { halku: "loop", js: "for" },
  { halku: "each", js: "forEach" },
  { halku: "when", js: "if" },
  { halku: "otherwise", js: "else" },
  { halku: "ret", js: "return" },
  { halku: "wait", js: "await" },
  { halku: "task", js: "async function" },
] as const;
