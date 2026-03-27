/**
 * example.ts — HalkuLang Example Usage
 * ─────────────────────────────────────────────────────────────────
 * Demonstrates how to use the HalkuLang pipeline:
 *   source → tokenize → parse → interpret → output
 *
 * Run with:  npx ts-node lang/example.ts
 * Or:        npx tsx lang/example.ts
 */

import { tokenize } from './tokenizer';
import { parse }    from './parser';
import { Interpreter } from './interpreter';
import { isHalkuLang, runHalkuLang } from './halkuLang';

// ─── Example 1: Required spec example ────────────────────────────────────────
//
// Input:
//   maan le a = 3;
//   maan le b = 0;
//   jab tak re (b < 5) { sun re b; badha re b; }
//
// Expected output: 0  1  2  3  4

const SPEC_EXAMPLE = `
hi halku
  maan le a = 3;
  maan le b = 0;

  jab tak re (b < 5) {
    sun re b;
    badha re b;
  }
bye halku
`;

// ─── Example 2: Full feature showcase ────────────────────────────────────────

const FULL_EXAMPLE = `
hi halku
  // Variables
  maan le naam = "Duniya";
  sun re "Namaste, " + naam + "!";

  // Booleans and Null
  maan le sach_hai = sach;
  maan le jhoot_hai = jhoot;
  maan le nalla_hai = nalla;
  sun re sach_hai;
  sun re jhoot_hai;
  sun re nalla_hai;

  // While loop with badha re / ghata re
  maan le ginti = 0;
  jab tak re (ginti < 5) {
    sun re ginti;
    badha re ginti;
  }

  // For loop (iske liye)
  iske liye (maan le i = 0; i < 3; badha re i) {
    sun re "i = " + i;
  }

  // If / else if / else
  maan le x = 10;
  bhai agar (x > 15) {
    sun re "bada hai";
  } nahi toh agar (x == 10) {
    sun re "bilkul dus";
  } nahi toh {
    sun re "chota hai";
  }

  // Function declaration and call
  function factorial(n) {
    bhai agar (n <= 1) {
      de re 1;
    }
    de re n * factorial(n - 1);
  }

  sun re "5! = " + factorial(5);

  // Break and Continue
  maan le j = 0;
  jab tak re (j < 10) {
    bhai agar (j == 3) {
      badha re j;
      agla dekh re;
    }
    bhai agar (j == 6) {
      bas kar re;
    }
    sun re j;
    badha re j;
  }
bye halku
`;

// ─── Helper: print a separator line ──────────────────────────────────────────

function separator(title: string): void {
  const line = '─'.repeat(50);
  console.log(`\n${line}`);
  console.log(` ${title}`);
  console.log(`${line}`);
}

// ─── Helper: run with the low-level pipeline (tokenize → parse → interpret) ──

function runRaw(src: string, label: string): void {
  separator(label + ' [raw pipeline]');
  try {
    const tokens = tokenize(src);
    console.log(`Tokens (${tokens.length}):`);
    tokens.slice(0, 10).forEach((t) =>
      console.log(`  ${t.type.padEnd(16)} "${t.value}"  [${t.line}:${t.col}]`)
    );
    if (tokens.length > 10) console.log(`  ... (${tokens.length - 10} more)`);

    const ast = parse(tokens);
    console.log(`\nAST root: ${ast.type}, statements: ${ast.body.length}`);

    console.log('\nOutput:');
    const interpreter = new Interpreter({
      print: (line) => console.log('  ' + line),
    });
    interpreter.run(ast);
  } catch (err) {
    console.error('Error:', err instanceof Error ? err.message : String(err));
  }
}

// ─── Helper: run with the high-level API ─────────────────────────────────────

function runHighLevel(src: string, label: string): void {
  separator(label + ' [high-level API]');

  // Auto-detection
  console.log(`isHalkuLang: ${isHalkuLang(src)}`);
  console.log('\nOutput:');

  const result = runHalkuLang(src, (line) => {
    const prefix = line.type === 'error' ? '[ERR] ' : '      ';
    console.log(prefix + line.text);
  });

  console.log(`\nFinished in ${result.durationMs.toFixed(2)}ms`);
  console.log(`Lines: ${result.lines.length}, hasError: ${result.hasError}`);
}

// ─── Run all examples ─────────────────────────────────────────────────────────

console.log('╔══════════════════════════════════════════════════════╗');
console.log('║           HalkuLang Interpreter — Demo               ║');
console.log('╚══════════════════════════════════════════════════════╝');

// Required spec example (low-level + high-level)
runRaw(SPEC_EXAMPLE, 'Spec Example: jab tak re b < 5');
runHighLevel(SPEC_EXAMPLE, 'Spec Example');

// Full feature showcase
runHighLevel(FULL_EXAMPLE, 'Full Feature Showcase');

// ─── Inline error example ─────────────────────────────────────────────────────

separator('Error handling');
runHighLevel(`
maan le x = 10;
sun re x + y;       // y is not defined → RuntimeError
`, 'Undefined variable');

runHighLevel(`
maan le z = @;      // '@' is not a valid char → LexError
`, 'Lex error');
