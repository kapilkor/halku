/**
 * parser.ts — HalkuLang Recursive-Descent Parser
 * ─────────────────────────────────────────────────────────────────
 * Consumes a Token[] from the Tokenizer and produces a typed AST.
 *
 * Grammar rules are implemented as private methods named after
 * the rule they produce (parseStatement, parseExpression, etc.).
 * Each method advances the token cursor and returns an AST node.
 */

import { TT, Token, TokenType } from './ast-types';
import type {
  Program, Block, Statement, Expression,
  VariableDeclaration, PrintStatement,
  IfStatement, ElseIfClause,
  WhileStatement, ForStatement,
  FunctionDeclaration,
  ReturnStatement, BreakStatement, ContinueStatement,
  IncrementStatement, DecrementStatement,
  ExpressionStatement,
  AssignmentExpression, BinaryExpression, UnaryExpression,
  CallExpression, Identifier,
  NumberLiteral, StringLiteral, BooleanLiteral,
} from './ast-types';

// ─── Parse Error ──────────────────────────────────────────────────────────────

export class ParseError extends Error {
  constructor(msg: string, public line: number, public col: number) {
    super(`[Line ${line}, Col ${col}] ParseError: ${msg}`);
    this.name = 'ParseError';
  }
}

// ─── Parser ───────────────────────────────────────────────────────────────────

export class Parser {
  private pos = 0;

  constructor(private readonly tokens: Token[]) {}

  // ── Entry point ───────────────────────────────────────────────────────────

  parse(): Program {
    const body: Statement[] = [];
    while (!this.check(TT.EOF)) {
      body.push(this.parseStatement());
    }
    return { type: 'Program', body };
  }

  // ── Statements ────────────────────────────────────────────────────────────

  private parseStatement(): Statement {
    const tok = this.current();

    if (tok.type === TT.MAAN_LE)       return this.parseVarDecl();
    if (tok.type === TT.SUN_RE)        return this.parsePrint();
    if (tok.type === TT.BHAI_AGAR)     return this.parseIf();
    if (tok.type === TT.JAB_TAK_RE)    return this.parseWhile();
    if (tok.type === TT.ISKE_LIYE)     return this.parseFor();
    if (tok.type === TT.FUNCTION)      return this.parseFuncDecl();
    if (tok.type === TT.DE_RE)         return this.parseReturn();
    if (tok.type === TT.BAS_KAR_RE)    return this.parseBreak();
    if (tok.type === TT.AGLA_DEKH_RE)  return this.parseContinue();
    if (tok.type === TT.BADHA_RE)      return this.parseIncr();
    if (tok.type === TT.GHATA_RE)      return this.parseDecr();

    return this.parseExprStatement();
  }

  // maan le name = expr;
  private parseVarDecl(): VariableDeclaration {
    const tok = this.consume(TT.MAAN_LE);
    const name = this.consume(TT.IDENTIFIER, 'Expected variable name after "maan le"').value;
    this.consume(TT.ASSIGN, 'Expected "=" after variable name');
    const value = this.parseExpression();
    this.consume(TT.SEMICOLON, 'Expected ";" after variable declaration');
    return { type: 'VariableDeclaration', name, value, line: tok.line };
  }

  // sun re expr;
  private parsePrint(): PrintStatement {
    this.consume(TT.SUN_RE);
    const value = this.parseExpression();
    this.consume(TT.SEMICOLON, 'Expected ";" after print statement');
    return { type: 'PrintStatement', value };
  }

  // bhai agar (cond) { } [nahi toh agar (cond) { }]* [nahi toh { }]
  private parseIf(): IfStatement {
    this.consume(TT.BHAI_AGAR);
    this.consume(TT.LPAREN, 'Expected "(" after "bhai agar"');
    const condition = this.parseExpression();
    this.consume(TT.RPAREN, 'Expected ")" after condition');
    const consequent = this.parseBlock();

    const elseIfs: ElseIfClause[] = [];
    while (this.check(TT.NAHI_TOH_AGAR)) {
      this.consume(TT.NAHI_TOH_AGAR);
      this.consume(TT.LPAREN, 'Expected "(" after "nahi toh agar"');
      const cond = this.parseExpression();
      this.consume(TT.RPAREN, 'Expected ")"');
      const body = this.parseBlock();
      elseIfs.push({ type: 'ElseIfClause', condition: cond, body });
    }

    let alternate: Block | null = null;
    if (this.check(TT.NAHI_TOH)) {
      this.consume(TT.NAHI_TOH);
      alternate = this.parseBlock();
    }

    return { type: 'IfStatement', condition, consequent, elseIfs, alternate };
  }

  // jab tak re (cond) { }
  private parseWhile(): WhileStatement {
    const tok = this.consume(TT.JAB_TAK_RE);
    this.consume(TT.LPAREN, 'Expected "(" after "jab tak re"');
    const condition = this.parseExpression();
    this.consume(TT.RPAREN, 'Expected ")"');
    const body = this.parseBlock();
    return { type: 'WhileStatement', condition, body, line: tok.line };
  }

  // iske liye ( [maan le i = 0;] | [expr;]   condition;   update ) { }
  private parseFor(): ForStatement {
    const tok = this.consume(TT.ISKE_LIYE);
    this.consume(TT.LPAREN, 'Expected "(" after "iske liye"');

    // Init: variable decl or expression or empty
    let init: VariableDeclaration | ExpressionStatement | null = null;
    if (this.check(TT.MAAN_LE)) {
      init = this.parseVarDecl();                    // consumes its own ";"
    } else if (!this.check(TT.SEMICOLON)) {
      const expr = this.parseExpression();
      this.consume(TT.SEMICOLON, 'Expected ";" after for-init expression');
      init = { type: 'ExpressionStatement', expression: expr };
    } else {
      this.consume(TT.SEMICOLON);                    // empty init
    }

    // Condition
    let condition: Expression | null = null;
    if (!this.check(TT.SEMICOLON)) {
      condition = this.parseExpression();
    }
    this.consume(TT.SEMICOLON, 'Expected ";" after for-condition');

    // Update — no trailing ";" before ")"
    let update: IncrementStatement | DecrementStatement | ExpressionStatement | null = null;
    if (!this.check(TT.RPAREN)) {
      if (this.check(TT.BADHA_RE)) {
        const t = this.consume(TT.BADHA_RE);
        const name = this.consume(TT.IDENTIFIER, 'Expected identifier after "badha re"').value;
        update = { type: 'IncrementStatement', name, line: t.line };
      } else if (this.check(TT.GHATA_RE)) {
        const t = this.consume(TT.GHATA_RE);
        const name = this.consume(TT.IDENTIFIER, 'Expected identifier after "ghata re"').value;
        update = { type: 'DecrementStatement', name, line: t.line };
      } else {
        const expr = this.parseExpression();
        update = { type: 'ExpressionStatement', expression: expr };
      }
    }

    this.consume(TT.RPAREN, 'Expected ")" to close for-header');
    const body = this.parseBlock();
    return { type: 'ForStatement', init, condition, update, body, line: tok.line };
  }

  // function name(p1, p2) { }
  private parseFuncDecl(): FunctionDeclaration {
    const tok = this.consume(TT.FUNCTION);
    const name = this.consume(TT.IDENTIFIER, 'Expected function name').value;
    this.consume(TT.LPAREN, 'Expected "("');

    const params: string[] = [];
    if (!this.check(TT.RPAREN)) {
      params.push(this.consume(TT.IDENTIFIER, 'Expected parameter name').value);
      while (this.check(TT.COMMA)) {
        this.consume(TT.COMMA);
        params.push(this.consume(TT.IDENTIFIER, 'Expected parameter name').value);
      }
    }
    this.consume(TT.RPAREN, 'Expected ")"');
    const body = this.parseBlock();
    return { type: 'FunctionDeclaration', name, params, body, line: tok.line };
  }

  // de re [expr];
  private parseReturn(): ReturnStatement {
    this.consume(TT.DE_RE);
    const value = this.check(TT.SEMICOLON) ? null : this.parseExpression();
    this.consume(TT.SEMICOLON, 'Expected ";" after de re');
    return { type: 'ReturnStatement', value };
  }

  // bas kar re;
  private parseBreak(): BreakStatement {
    this.consume(TT.BAS_KAR_RE);
    this.consume(TT.SEMICOLON, 'Expected ";" after "bas kar re"');
    return { type: 'BreakStatement' };
  }

  // agla dekh re;
  private parseContinue(): ContinueStatement {
    this.consume(TT.AGLA_DEKH_RE);
    this.consume(TT.SEMICOLON, 'Expected ";" after "agla dekh re"');
    return { type: 'ContinueStatement' };
  }

  // badha re name;
  private parseIncr(): IncrementStatement {
    const tok = this.consume(TT.BADHA_RE);
    const name = this.consume(TT.IDENTIFIER, 'Expected identifier after "badha re"').value;
    this.consume(TT.SEMICOLON, 'Expected ";"');
    return { type: 'IncrementStatement', name, line: tok.line };
  }

  // ghata re name;
  private parseDecr(): DecrementStatement {
    const tok = this.consume(TT.GHATA_RE);
    const name = this.consume(TT.IDENTIFIER, 'Expected identifier after "ghata re"').value;
    this.consume(TT.SEMICOLON, 'Expected ";"');
    return { type: 'DecrementStatement', name, line: tok.line };
  }

  // expr;
  private parseExprStatement(): ExpressionStatement {
    const expression = this.parseExpression();
    this.consume(TT.SEMICOLON, 'Expected ";" after expression');
    return { type: 'ExpressionStatement', expression };
  }

  // { statement* }
  private parseBlock(): Block {
    this.consume(TT.LBRACE, 'Expected "{"');
    const body: Statement[] = [];
    while (!this.check(TT.RBRACE) && !this.check(TT.EOF)) {
      body.push(this.parseStatement());
    }
    this.consume(TT.RBRACE, 'Expected "}"');
    return { type: 'Block', body };
  }

  // ── Expression hierarchy ──────────────────────────────────────────────────

  private parseExpression(): Expression { return this.parseAssignment(); }

  // identifier = expr
  private parseAssignment(): Expression {
    if (this.check(TT.IDENTIFIER) && this.peek(1)?.type === TT.ASSIGN) {
      const tok  = this.consume(TT.IDENTIFIER);
      this.consume(TT.ASSIGN);
      const value = this.parseAssignment();     // right-associative
      return { type: 'AssignmentExpression', name: tok.value, value, line: tok.line };
    }
    return this.parseOr();
  }

  private parseOr(): Expression {
    let left = this.parseAnd();
    while (this.check(TT.OR)) {
      const op = this.consume(TT.OR).value;
      left = { type: 'BinaryExpression', operator: op, left, right: this.parseAnd() };
    }
    return left;
  }

  private parseAnd(): Expression {
    let left = this.parseEquality();
    while (this.check(TT.AND)) {
      const op = this.consume(TT.AND).value;
      left = { type: 'BinaryExpression', operator: op, left, right: this.parseEquality() };
    }
    return left;
  }

  private parseEquality(): Expression {
    let left = this.parseComparison();
    while (this.check(TT.EQ) || this.check(TT.NEQ)) {
      const op = this.advance().value;
      left = { type: 'BinaryExpression', operator: op, left, right: this.parseComparison() };
    }
    return left;
  }

  private parseComparison(): Expression {
    let left = this.parseAddition();
    while (this.check(TT.LT) || this.check(TT.GT) || this.check(TT.LTE) || this.check(TT.GTE)) {
      const op = this.advance().value;
      left = { type: 'BinaryExpression', operator: op, left, right: this.parseAddition() };
    }
    return left;
  }

  private parseAddition(): Expression {
    let left = this.parseMultiplication();
    while (this.check(TT.PLUS) || this.check(TT.MINUS)) {
      const op = this.advance().value;
      left = { type: 'BinaryExpression', operator: op, left, right: this.parseMultiplication() };
    }
    return left;
  }

  private parseMultiplication(): Expression {
    let left = this.parseUnary();
    while (this.check(TT.STAR) || this.check(TT.SLASH) || this.check(TT.PERCENT)) {
      const op = this.advance().value;
      left = { type: 'BinaryExpression', operator: op, left, right: this.parseUnary() };
    }
    return left;
  }

  private parseUnary(): Expression {
    if (this.check(TT.MINUS) || this.check(TT.BANG)) {
      const op = this.advance().value;
      return { type: 'UnaryExpression', operator: op, operand: this.parseUnary() };
    }
    return this.parsePrimary();
  }

  private parsePrimary(): Expression {
    const tok = this.current();

    // Number
    if (tok.type === TT.NUMBER) {
      this.advance();
      return { type: 'NumberLiteral', value: parseFloat(tok.value) };
    }

    // String
    if (tok.type === TT.STRING) {
      this.advance();
      return { type: 'StringLiteral', value: tok.value };
    }

    // Boolean
    if (tok.type === TT.SACH  || tok.type === TT.JHOOT) {
      this.advance();
      return { type: 'BooleanLiteral', value: tok.type === TT.SACH };
    }

    // Null
    if (tok.type === TT.NALLA) {
      this.advance();
      return { type: 'NullLiteral', value: null };
    }

    // Identifier or function call
    if (tok.type === TT.IDENTIFIER) {
      this.advance();
      if (this.check(TT.LPAREN)) {
        // Function call
        this.consume(TT.LPAREN);
        const args: Expression[] = [];
        if (!this.check(TT.RPAREN)) {
          args.push(this.parseExpression());
          while (this.check(TT.COMMA)) {
            this.consume(TT.COMMA);
            args.push(this.parseExpression());
          }
        }
        this.consume(TT.RPAREN, 'Expected ")" after arguments');
        return { type: 'CallExpression', callee: tok.value, args, line: tok.line };
      }
      return { type: 'Identifier', name: tok.value, line: tok.line };
    }

    // Grouped expression
    if (tok.type === TT.LPAREN) {
      this.consume(TT.LPAREN);
      const expr = this.parseExpression();
      this.consume(TT.RPAREN, 'Expected ")" after expression');
      return expr;
    }

    throw new ParseError(
      `Unexpected token "${tok.value}" (${tok.type})`,
      tok.line,
      tok.col
    );
  }

  // ── Token cursor helpers ──────────────────────────────────────────────────

  private current(): Token { return this.tokens[this.pos]; }

  private peek(offset = 1): Token | undefined {
    return this.tokens[this.pos + offset];
  }

  private check(type: TokenType): boolean {
    return this.current().type === type;
  }

  private advance(): Token {
    const tok = this.tokens[this.pos];
    if (tok.type !== TT.EOF) this.pos++;
    return tok;
  }

  private consume(type: TokenType, msg?: string): Token {
    if (this.check(type)) return this.advance();
    const t = this.current();
    throw new ParseError(
      msg ?? `Expected "${type}", got "${t.value}" (${t.type})`,
      t.line, t.col
    );
  }
}

// ─── Convenience export ───────────────────────────────────────────────────────

export function parse(tokens: Token[]): Program {
  return new Parser(tokens).parse();
}
