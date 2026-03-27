/**
 * ast-types.ts
 * ─────────────────────────────────────────────────────────────────
 * Token types and AST node definitions for HalkuLang.
 * No external dependencies — pure TypeScript.
 */

// ═══════════════════════════════════════════════════════════════════
// TOKEN TYPES
// ═══════════════════════════════════════════════════════════════════

export const TT = {
  // ── Multi-word keywords ──
  MAAN_LE:       'MAAN_LE',        // maan le  → variable declaration
  SUN_RE:        'SUN_RE',          // sun re   → print
  BHAI_AGAR:     'BHAI_AGAR',      // bhai agar     → if
  NAHI_TOH_AGAR: 'NAHI_TOH_AGAR',  // nahi toh agar → else if  (try BEFORE nahi toh)
  NAHI_TOH:      'NAHI_TOH',       // nahi toh      → else
  JAB_TAK_RE:    'JAB_TAK_RE',     // jab tak re    → while
  ISKE_LIYE:     'ISKE_LIYE',      // iske liye     → for
  BADHA_RE:      'BADHA_RE',       // badha re   → increment
  GHATA_RE:      'GHATA_RE',       // ghata re   → decrement
  DE_RE:         'DE_RE',           // de re      → return
  BAS_KAR_RE:    'BAS_KAR_RE',     // bas kar re → break
  AGLA_DEKH_RE:  'AGLA_DEKH_RE',  // agla dekh re → continue
  FUNCTION:      'FUNCTION',        // function

  // ── Boolean literals ──
  SACH:          'SACH',   // true
  JHOOT:         'JHOOT',  // false
  NALLA:         'NALLA',  // null

  // ── Value tokens ──
  NUMBER:        'NUMBER',
  STRING:        'STRING',
  IDENTIFIER:    'IDENTIFIER',

  // ── Two-char operators (check before single-char) ──
  EQ:      '==',
  NEQ:     '!=',
  LTE:     '<=',
  GTE:     '>=',
  AND:     '&&',
  OR:      '||',

  // ── Single-char operators ──
  ASSIGN:  '=',
  LT:      '<',
  GT:      '>',
  PLUS:    '+',
  MINUS:   '-',
  STAR:    '*',
  SLASH:   '/',
  PERCENT: '%',
  BANG:    '!',

  // ── Symbols ──
  LPAREN:    '(',
  RPAREN:    ')',
  LBRACE:    '{',
  RBRACE:    '}',
  SEMICOLON: ';',
  COMMA:     ',',

  // ── Special ──
  EOF: 'EOF',
} as const;

export type TokenType = (typeof TT)[keyof typeof TT];

export interface Token {
  type:  TokenType;
  value: string;   // source text that produced this token
  line:  number;
  col:   number;
}

// ═══════════════════════════════════════════════════════════════════
// AST NODES
// ═══════════════════════════════════════════════════════════════════

// ── Top-level ────────────────────────────────────────────────────────

export interface Program {
  type: 'Program';
  body: Statement[];
}

export interface Block {
  type: 'Block';
  body: Statement[];
}

// ── Statements ──────────────────────────────────────────────────────

export type Statement =
  | VariableDeclaration
  | PrintStatement
  | IfStatement
  | WhileStatement
  | ForStatement
  | FunctionDeclaration
  | ReturnStatement
  | BreakStatement
  | ContinueStatement
  | IncrementStatement
  | DecrementStatement
  | ExpressionStatement;

export interface VariableDeclaration {
  type:  'VariableDeclaration';
  name:  string;
  value: Expression;
  line:  number;
}

export interface PrintStatement {
  type:  'PrintStatement';
  value: Expression;
}

export interface IfStatement {
  type:       'IfStatement';
  condition:  Expression;
  consequent: Block;
  elseIfs:    ElseIfClause[];
  alternate:  Block | null;
}

export interface ElseIfClause {
  type:      'ElseIfClause';
  condition: Expression;
  body:      Block;
}

export interface WhileStatement {
  type:      'WhileStatement';
  condition: Expression;
  body:      Block;
  line:      number;
}

export interface ForStatement {
  type:      'ForStatement';
  init:      VariableDeclaration | ExpressionStatement | null;
  condition: Expression | null;
  update:    IncrementStatement | DecrementStatement | ExpressionStatement | null;
  body:      Block;
  line:      number;
}

export interface FunctionDeclaration {
  type:   'FunctionDeclaration';
  name:   string;
  params: string[];
  body:   Block;
  line:   number;
}

export interface ReturnStatement {
  type:  'ReturnStatement';
  value: Expression | null;
}

export interface BreakStatement    { type: 'BreakStatement'    }
export interface ContinueStatement { type: 'ContinueStatement' }

export interface IncrementStatement {
  type: 'IncrementStatement';
  name: string;
  line: number;
}

export interface DecrementStatement {
  type: 'DecrementStatement';
  name: string;
  line: number;
}

export interface ExpressionStatement {
  type:       'ExpressionStatement';
  expression: Expression;
}

// ── Expressions ─────────────────────────────────────────────────────

export type Expression =
  | AssignmentExpression
  | BinaryExpression
  | UnaryExpression
  | CallExpression
  | Identifier
  | NumberLiteral
  | StringLiteral
  | BooleanLiteral
  | NullLiteral;

export interface AssignmentExpression {
  type:  'AssignmentExpression';
  name:  string;
  value: Expression;
  line:  number;
}

export interface BinaryExpression {
  type:     'BinaryExpression';
  operator: string;
  left:     Expression;
  right:    Expression;
}

export interface UnaryExpression {
  type:     'UnaryExpression';
  operator: string;
  operand:  Expression;
}

export interface CallExpression {
  type:   'CallExpression';
  callee: string;
  args:   Expression[];
  line:   number;
}

export interface Identifier {
  type: 'Identifier';
  name: string;
  line: number;
}

export interface NumberLiteral  { type: 'NumberLiteral';  value: number  }
export interface StringLiteral  { type: 'StringLiteral';  value: string  }
export interface BooleanLiteral { type: 'BooleanLiteral'; value: boolean }
export interface NullLiteral    { type: 'NullLiteral';    value: null    }
