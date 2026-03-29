/**
 * interpreter.ts — HalkuLang Tree-Walking Interpreter
 * ─────────────────────────────────────────────────────────────────
 * Executes a HalkuLang AST produced by the Parser.
 *
 * Safety limits (prevent browser freeze):
 *   MAX_STEPS       = 100,000 total loop iterations
 *   MAX_CALL_DEPTH  = 500     nested function calls
 *   MAX_OUTPUT      = 500     printed lines
 *
 * Control flow signals (break / continue / return) are implemented
 * as thrown JS objects rather than exceptions — they're caught at
 * the appropriate scope level.
 */

import type {
  Program, Block, Statement, Expression,
  VariableDeclaration, PrintStatement,
  IfStatement, WhileStatement, ForStatement,
  FunctionDeclaration, ReturnStatement,
  IncrementStatement, DecrementStatement,
  ExpressionStatement,
  AssignmentExpression, BinaryExpression, UnaryExpression,
  CallExpression, Identifier,
} from './ast-types';

// ═══════════════════════════════════════════════════════════════════
// RUNTIME VALUES
// ═══════════════════════════════════════════════════════════════════

export type HalkuValue = number | string | boolean | null | HalkuFunction;

export interface HalkuFunction {
  readonly kind:    'function';
  readonly name:    string;
  readonly params:  string[];
  readonly body:    Block;
  readonly closure: Environment;
}

// ─── Control flow signals (thrown, not Error subclasses) ──────────────────────

const BREAK_SIGNAL    = Symbol('BREAK');
const CONTINUE_SIGNAL = Symbol('CONTINUE');

class ReturnSignal {
  constructor(public readonly value: HalkuValue) {}
}

// ─── Runtime Error ────────────────────────────────────────────────────────────

export class RuntimeError extends Error {
  constructor(msg: string, public line?: number) {
    super(line ? `[Line ${line}] RuntimeError: ${msg}` : `RuntimeError: ${msg}`);
    this.name = 'RuntimeError';
  }
}

// ═══════════════════════════════════════════════════════════════════
// ENVIRONMENT (variable scope)
// ═══════════════════════════════════════════════════════════════════

export class Environment {
  private vars = new Map<string, HalkuValue>();

  constructor(private readonly parent: Environment | null = null) {
    console.log('Environment: created new environment');
  }

  get(name: string, line?: number): HalkuValue {
    console.log(`Environment: getting variable "${name}"`);
    if (this.vars.has(name)) return this.vars.get(name)!;
    if (this.parent)          return this.parent.get(name, line);
    throw new RuntimeError(`Undefined variable '${name}'`, line);
  }

  set(name: string, value: HalkuValue): void {
    console.log(`Environment: setting variable "${name}" to`, value);
    // Walk up to find existing binding, else create in current scope
    if (this.vars.has(name)) { this.vars.set(name, value); return; }
    if (this.parent?.has(name)) { this.parent.set(name, value); return; }
    this.vars.set(name, value);
  }

  define(name: string, value: HalkuValue): void {
    console.log(`Environment: defining variable "${name}" with value`, value);
    this.vars.set(name, value);
  }

  has(name: string): boolean {
    const exists = this.vars.has(name) || (this.parent?.has(name) ?? false);
    console.log(`Environment: checking if variable "${name}" exists:`, exists);
    return exists;
  }
}

// ═══════════════════════════════════════════════════════════════════
// INTERPRETER
// ═══════════════════════════════════════════════════════════════════

export interface InterpreterCallbacks {
  print: (line: string) => void;
}

const MAX_STEPS      = 100_000;
const MAX_CALL_DEPTH = 500;
const MAX_OUTPUT     = 500;

export class Interpreter {
  private steps     = 0;
  private callDepth = 0;
  private outCount  = 0;

  private readonly global = new Environment();

  constructor(private readonly cb: InterpreterCallbacks) {
    console.log('Interpreter: initialized');
  }

  // ── Entry ─────────────────────────────────────────────────────────────────

  run(program: Program): void {
    console.log('Interpreter: starting run with program:', program);
    try {
      this.execBlock({ type: 'Block', body: program.body }, this.global);
      console.log('Interpreter: run finished successfully');
    } catch (e) {
      console.error('Interpreter: run failed with error:', e);
      if (e instanceof RuntimeError) {
        this.cb.print(e.message);
      } else if (e === BREAK_SIGNAL || e === CONTINUE_SIGNAL || e instanceof ReturnSignal) {
        // This should be caught lower down, but as a safeguard:
        this.cb.print(new RuntimeError("Illegal control flow statement").message);
      } else {
        this.cb.print(new RuntimeError("An unknown error occurred").message);
      }
    }
  }

  // ── Block ─────────────────────────────────────────────────────────────────

  private execBlock(block: Block, env: Environment): void {
    console.log('Interpreter: executing block:', block);
    for (const stmt of block.body) {
      this.execStatement(stmt, env);
    }
  }

  // ── Statement dispatch ───────────────────────────────────────────────────

  private execStatement(stmt: Statement, env: Environment): void {
    console.log('Interpreter: executing statement:', stmt);
    switch (stmt.type) {
      case 'VariableDeclaration':  return this.execVarDecl(stmt, env);
      case 'PrintStatement':       return this.execPrint(stmt, env);
      case 'IfStatement':          return this.execIf(stmt, env);
      case 'WhileStatement':       return this.execWhile(stmt, env);
      case 'ForStatement':         return this.execFor(stmt, env);
      case 'FunctionDeclaration':  return this.execFuncDecl(stmt, env);
      case 'ReturnStatement':      return this.execReturn(stmt, env);
      case 'BreakStatement':       console.log('Interpreter: throwing BREAK signal'); throw BREAK_SIGNAL;
      case 'ContinueStatement':    console.log('Interpreter: throwing CONTINUE signal'); throw CONTINUE_SIGNAL;
      case 'IncrementStatement':   return this.execIncr(stmt, env);
      case 'DecrementStatement':   return this.execDecr(stmt, env);
      case 'ExpressionStatement':  this.evalExpr(stmt.expression, env); return;
    }
  }

  // ── Statement implementations ─────────────────────────────────────────────

  private execVarDecl(stmt: VariableDeclaration, env: Environment): void {
    env.define(stmt.name, this.evalExpr(stmt.value, env));
  }

  private execPrint(stmt: PrintStatement, env: Environment): void {
    if (this.outCount >= MAX_OUTPUT) {
      throw new RuntimeError(`Output limit (${MAX_OUTPUT} lines) exceeded`);
    }
    const val = this.evalExpr(stmt.value, env);
    this.cb.print(this.display(val));
    this.outCount++;
  }

  private execIf(stmt: IfStatement, env: Environment): void {
    if (this.isTruthy(this.evalExpr(stmt.condition, env))) {
      this.execBlock(stmt.consequent, new Environment(env));
      return;
    }
    for (const ei of stmt.elseIfs) {
      if (this.isTruthy(this.evalExpr(ei.condition, env))) {
        this.execBlock(ei.body, new Environment(env));
        return;
      }
    }
    if (stmt.alternate) {
      this.execBlock(stmt.alternate, new Environment(env));
    }
  }

  private execWhile(stmt: WhileStatement, env: Environment): void {
    while (this.isTruthy(this.evalExpr(stmt.condition, env))) {
      this.tickStep(stmt.line);
      try {
        this.execBlock(stmt.body, new Environment(env));
      } catch (sig) {
        if (sig === BREAK_SIGNAL)    break;
        if (sig === CONTINUE_SIGNAL) continue;
        throw sig;
      }
    }
  }

  private execFor(stmt: ForStatement, env: Environment): void {
    const forEnv = new Environment(env); // init scope

    // Init
    if (stmt.init) {
      if (stmt.init.type === 'VariableDeclaration') {
        this.execVarDecl(stmt.init, forEnv);
      } else {
        this.evalExpr(stmt.init.expression, forEnv);
      }
    }

    // Loop
    while (true) {
      this.tickStep(stmt.line);

      // Condition
      if (stmt.condition && !this.isTruthy(this.evalExpr(stmt.condition, forEnv))) break;

      try {
        this.execBlock(stmt.body, new Environment(forEnv));
      } catch (sig) {
        if (sig === BREAK_SIGNAL)    break;
        if (sig === CONTINUE_SIGNAL) { /* fall through to update */ }
        else throw sig;
      }

      // Update
      if (stmt.update) {
        if (stmt.update.type === 'IncrementStatement') {
          this.execIncr(stmt.update, forEnv);
        } else if (stmt.update.type === 'DecrementStatement') {
          this.execDecr(stmt.update, forEnv);
        } else {
          this.evalExpr(stmt.update.expression, forEnv);
        }
      }
    }
  }

  private execFuncDecl(stmt: FunctionDeclaration, env: Environment): void {
    const fn: HalkuFunction = {
      kind:    'function',
      name:    stmt.name,
      params:  stmt.params,
      body:    stmt.body,
      closure: env,
    };
    env.define(stmt.name, fn);
  }

  private execReturn(stmt: ReturnStatement, env: Environment): void {
    const value = stmt.value ? this.evalExpr(stmt.value, env) : null;
    throw new ReturnSignal(value);
  }

  private execIncr(stmt: IncrementStatement, env: Environment): void {
    const cur = env.get(stmt.name, stmt.line);
    if (typeof cur !== 'number') {
      throw new RuntimeError(`"badha re" expects a number, got ${typeof cur}`, stmt.line);
    }
    env.set(stmt.name, cur + 1);
  }

  private execDecr(stmt: DecrementStatement, env: Environment): void {
    const cur = env.get(stmt.name, stmt.line);
    if (typeof cur !== 'number') {
      throw new RuntimeError(`"ghata re" expects a number, got ${typeof cur}`, stmt.line);
    }
    env.set(stmt.name, cur - 1);
  }

  // ── Expression evaluator ──────────────────────────────────────────────────

  private evalExpr(expr: Expression, env: Environment): HalkuValue {
    switch (expr.type) {
      case 'NumberLiteral':  return expr.value;
      case 'StringLiteral':  return expr.value;
      case 'BooleanLiteral': return expr.value;
      case 'NullLiteral':    return expr.value;

      case 'Identifier':
        return env.get(expr.name, expr.line);

      case 'AssignmentExpression':
        return this.evalAssignment(expr, env);

      case 'BinaryExpression':
        return this.evalBinary(expr, env);

      case 'UnaryExpression':
        return this.evalUnary(expr, env);

      case 'CallExpression':
        return this.evalCall(expr, env);
    }
  }

  private evalAssignment(expr: AssignmentExpression, env: Environment): HalkuValue {
    const value = this.evalExpr(expr.value, env);
    if (!env.has(expr.name)) {
      throw new RuntimeError(`Undefined variable '${expr.name}'`, expr.line);
    }
    env.set(expr.name, value);
    return value;
  }

  private evalBinary(expr: BinaryExpression, env: Environment): HalkuValue {
    const L = this.evalExpr(expr.left,  env);
    const R = this.evalExpr(expr.right, env);
    switch (expr.operator) {
      case '+':  return typeof L === 'string' || typeof R === 'string'
                   ? String(this.display(L)) + String(this.display(R))
                   : (L as number) + (R as number);
      case '-':  return (L as number) - (R as number);
      case '*':  return (L as number) * (R as number);
      case '/':  if ((R as number) === 0) throw new RuntimeError('Division by zero');
                 return (L as number) / (R as number);
      case '%':  return (L as number) % (R as number);
      case '==': return L === R;
      case '!=': return L !== R;
      case '<':  return (L as number) <  (R as number);
      case '>':  return (L as number) >  (R as number);
      case '<=': return (L as number) <= (R as number);
      case '>=': return (L as number) >= (R as number);
      case '&&': return this.isTruthy(L) ? R : L;
      case '||': return this.isTruthy(L) ? L : R;
      default:   throw new RuntimeError(`Unknown operator '${expr.operator}'`);
    }
  }

  private evalUnary(expr: UnaryExpression, env: Environment): HalkuValue {
    const val = this.evalExpr(expr.operand, env);
    switch (expr.operator) {
      case '-': return -(val as number);
      case '!': return !this.isTruthy(val);
      default:  throw new RuntimeError(`Unknown unary operator '${expr.operator}'`);
    }
  }

  private evalCall(expr: CallExpression, env: Environment): HalkuValue {
    if (this.callDepth >= MAX_CALL_DEPTH) {
      throw new RuntimeError(`Maximum call depth (${MAX_CALL_DEPTH}) exceeded — stack overflow`, expr.line);
    }

    const callee = env.get(expr.callee, expr.line);
    if (!callee || typeof callee !== 'object' || (callee as HalkuFunction).kind !== 'function') {
      throw new RuntimeError(`'${expr.callee}' is not a function`, expr.line);
    }

    const fn = callee as HalkuFunction;
    if (expr.args.length !== fn.params.length) {
      throw new RuntimeError(
        `'${fn.name}' expects ${fn.params.length} argument(s), got ${expr.args.length}`,
        expr.line
      );
    }

    // Create a new scope rooted at the function's closure
    const fnEnv = new Environment(fn.closure);
    for (let i = 0; i < fn.params.length; i++) {
      fnEnv.define(fn.params[i], this.evalExpr(expr.args[i], env));
    }

    this.callDepth++;
    try {
      this.execBlock(fn.body, fnEnv);
      return null;
    } catch (sig) {
      if (sig instanceof ReturnSignal) return sig.value;
      throw sig;
    } finally {
      this.callDepth--;
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private isTruthy(val: HalkuValue): boolean {
    if (val === null || val === false || val === 0 || val === '') return false;
    return true;
  }

  private display(val: HalkuValue): string {
    if (val === null)    return 'null';
    if (typeof val === 'object') return `[function ${(val as HalkuFunction).name}]`;
    return String(val);
  }

  /** Increment step counter — throws on infinite loop */
  private tickStep(line?: number): void {
    this.steps++;
    if (this.steps > MAX_STEPS) {
      throw new RuntimeError(
        `max loop steps (${MAX_STEPS}) exceeded — possible infinite loop`,
        line
      );
    }
  }
}
