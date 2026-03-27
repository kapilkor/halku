/**
 * tokenizer.ts — HalkuLang Lexer
 * ─────────────────────────────────────────────────────────────────
 * Converts HalkuLang source code into a flat array of Tokens.
 *
 * Key design:
 *  • Multi-word keywords are matched greedily (longest first).
 *  • Word-boundary check after every keyword match prevents
 *    "sun re" from matching inside "sun reboot".
 *  • Line/col tracking for precise error messages.
 *  • `//` single-line comments are silently consumed.
 */

import { TT, Token, TokenType } from './ast-types';

// ─── Keyword table (sorted longest-first for greedy matching) ─────────────────

const KEYWORD_TABLE: Array<{ kw: string; tt: TokenType }> = [
  { kw: 'nahi toh agar', tt: TT.NAHI_TOH_AGAR },  // 14 — MUST precede nahi toh
  { kw: 'agla dekh re',  tt: TT.AGLA_DEKH_RE  },  // 12
  { kw: 'bas kar re',    tt: TT.BAS_KAR_RE    },  // 10
  { kw: 'jab tak re',    tt: TT.JAB_TAK_RE    },  // 10
  { kw: 'iske liye',     tt: TT.ISKE_LIYE     },  //  9
  { kw: 'bhai agar',     tt: TT.BHAI_AGAR     },  //  9
  { kw: 'nahi toh',      tt: TT.NAHI_TOH      },  //  8
  { kw: 'badha re',      tt: TT.BADHA_RE      },  //  8
  { kw: 'ghata re',      tt: TT.GHATA_RE      },  //  8
  { kw: 'function',      tt: TT.FUNCTION      },  //  8
  { kw: 'maan le',       tt: TT.MAAN_LE       },  //  7
  { kw: 'sun re',        tt: TT.SUN_RE        },  //  6
  { kw: 'jhoot',         tt: TT.JHOOT         },  //  5
  { kw: 'de re',         tt: TT.DE_RE         },  //  5
  { kw: 'sach',          tt: TT.SACH          },  //  4
  { kw: 'nalla',         tt: TT.NALLA         },  //  5
];

// Characters that form identifiers
const isAlpha    = (c: string) => /[a-zA-Z_]/.test(c);
const isAlphaNum = (c: string) => /[a-zA-Z0-9_]/.test(c);
const isDigit    = (c: string) => /[0-9]/.test(c);

// ─── Lexer Error ──────────────────────────────────────────────────────────────

export class LexError extends Error {
  constructor(msg: string, public line: number, public col: number) {
    super(`[Line ${line}, Col ${col}] LexError: ${msg}`);
    this.name = 'LexError';
  }
}

// ─── Tokenizer class ──────────────────────────────────────────────────────────

export class Tokenizer {
  private pos  = 0;
  private line = 1;
  private col  = 1;

  constructor(private readonly src: string) {}

  // ── Public entry point ────────────────────────────────────────────────────

  tokenize(): Token[] {
    const tokens: Token[] = [];

    while (!this.atEnd()) {
      this.skipWhitespaceAndComments();
      if (this.atEnd()) break;

      const tok = this.nextToken();
      if (tok) tokens.push(tok);
    }

    tokens.push(this.makeToken(TT.EOF, '', this.line, this.col));
    return tokens;
  }

  // ── Core scanner ─────────────────────────────────────────────────────────

  private nextToken(): Token {
    const startLine = this.line;
    const startCol  = this.col;

    // 1. Try keyword table (longest match first)
    const kwToken = this.tryKeyword(startLine, startCol);
    if (kwToken) return kwToken;

    // 2. Identifier (after keywords to avoid false matches)
    if (isAlpha(this.peek())) return this.scanIdentifier(startLine, startCol);

    // 3. Number
    if (isDigit(this.peek())) return this.scanNumber(startLine, startCol);

    // 4. String
    if (this.peek() === '"') return this.scanString(startLine, startCol);

    // 5. Two-char operators (check before single-char)
    const two = this.src.slice(this.pos, this.pos + 2);
    const twoMap: Record<string, TokenType> = {
      '==': TT.EQ, '!=': TT.NEQ, '<=': TT.LTE,
      '>=': TT.GTE, '&&': TT.AND, '||': TT.OR,
    };
    if (two in twoMap) {
      this.advance(); this.advance();
      return this.makeToken(twoMap[two], two, startLine, startCol);
    }

    // 6. Single-char operators and symbols
    const one = this.peek();
    const oneMap: Record<string, TokenType> = {
      '=': TT.ASSIGN, '<': TT.LT,  '>': TT.GT,
      '+': TT.PLUS,   '-': TT.MINUS, '*': TT.STAR,
      '/': TT.SLASH,  '%': TT.PERCENT, '!': TT.BANG,
      '(': TT.LPAREN, ')': TT.RPAREN,
      '{': TT.LBRACE, '}': TT.RBRACE,
      ';': TT.SEMICOLON, ',': TT.COMMA,
    };
    if (one in oneMap) {
      this.advance();
      return this.makeToken(oneMap[one], one, startLine, startCol);
    }

    throw new LexError(`Unexpected character '${one}'`, startLine, startCol);
  }

  // ── Keyword matching ──────────────────────────────────────────────────────

  private tryKeyword(line: number, col: number): Token | null {
    for (const { kw, tt } of KEYWORD_TABLE) {
      if (this.src.startsWith(kw, this.pos)) {
        const after = this.src[this.pos + kw.length];
        // Word boundary: after keyword must not be alphanumeric
        if (after !== undefined && isAlphaNum(after)) continue;

        // Advance pos/line/col past the keyword text
        const snapshot = { pos: this.pos, line: this.line, col: this.col };
        for (let i = 0; i < kw.length; i++) this.advance();

        return this.makeToken(tt, kw, snapshot.line, snapshot.col);
      }
    }
    return null;
  }

  // ── Sub-scanners ──────────────────────────────────────────────────────────

  private scanIdentifier(line: number, col: number): Token {
    let value = '';
    while (!this.atEnd() && isAlphaNum(this.peek())) {
      value += this.advance();
    }
    // Identifiers that look like leftover keywords become IDENTIFIER
    return this.makeToken(TT.IDENTIFIER, value, line, col);
  }

  private scanNumber(line: number, col: number): Token {
    let value = '';
    while (!this.atEnd() && isDigit(this.peek())) value += this.advance();
    if (this.peek() === '.' && isDigit(this.src[this.pos + 1])) {
      value += this.advance(); // consume '.'
      while (!this.atEnd() && isDigit(this.peek())) value += this.advance();
    }
    return this.makeToken(TT.NUMBER, value, line, col);
  }

  private scanString(line: number, col: number): Token {
    this.advance(); // consume opening "
    let value = '';
    while (!this.atEnd() && this.peek() !== '"') {
      if (this.peek() === '\\') {
        this.advance(); // consume backslash
        const esc = this.advance();
        value += esc === 'n' ? '\n' : esc === 't' ? '\t' : esc;
      } else {
        value += this.advance();
      }
    }
    if (this.atEnd()) {
      throw new LexError('Unterminated string literal', line, col);
    }
    this.advance(); // consume closing "
    return this.makeToken(TT.STRING, value, line, col);
  }

  // ── Whitespace / comments ─────────────────────────────────────────────────

  private skipWhitespaceAndComments(): void {
    while (!this.atEnd()) {
      const c = this.peek();
      if (c === ' ' || c === '\r' || c === '\t') {
        this.advance();
      } else if (c === '\n') {
        this.advance();
      } else if (c === '/' && this.src[this.pos + 1] === '/') {
        // Single-line comment — skip to end of line
        while (!this.atEnd() && this.peek() !== '\n') this.advance();
      } else {
        break;
      }
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private peek(): string { return this.src[this.pos] ?? ''; }

  private advance(): string {
    const c = this.src[this.pos++];
    if (c === '\n') { this.line++; this.col = 1; }
    else             { this.col++; }
    return c;
  }

  private atEnd(): boolean { return this.pos >= this.src.length; }

  private makeToken(type: TokenType, value: string, line: number, col: number): Token {
    return { type, value, line, col };
  }
}

// ─── Convenience export ───────────────────────────────────────────────────────

export function tokenize(src: string): Token[] {
  return new Tokenizer(src).tokenize();
}
