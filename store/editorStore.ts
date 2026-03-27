import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { halkuCompile } from "@/lib/halkuCompiler";
import { halkuRun } from "@/lib/halkuRunner";
import { OutputLine, RunResult } from "@/lib/outputTypes";
import { isHalkuLang, runHalkuLang } from "@/lang/halkuLang";

export type DetectedLanguage = 'halku' | 'halkuLang';

const DEFAULT_CODE = `// Welcome to Halku 💪
// Halku keywords work alongside plain JavaScript.
// print  warn  err  info  fn  let!  loop  each  when  otherwise  ret  wait  task

fn greet(name) {
  ret \`Hello, \${name}!\`;
}

print(greet("World"));

let! numbers = [1, 2, 3, 4, 5];
let! doubled = numbers.map(n => n * 2);
print("Doubled:", doubled);

when (doubled.length > 0) {
  print("✅ All done in Halku!");
} otherwise {
  warn("No numbers found.");
}

// Try: while(true){} → will time out safely after 5s

/*
// ==========================================
// Or try the new HalkuLang:
// Just uncomment the block below and click run!
// ==========================================

hi halku
  maan le naam = "Duniya";
  sun re "Namaste, " + naam + "!";

  maan le nalla_hai = nalla;
  sun re nalla_hai;

  iske liye (maan le i = 0; i < 3; badha re i) {
    sun re "i = " + i;
  }
bye halku
*/
`;

export interface EditorStore {
  // ── Editor state ──
  code:             string;
  detectedLanguage: DetectedLanguage;
  setCode:          (code: string) => void;
  resetCode:        () => void;

  // ── Execution state ──
  output:        OutputLine[];
  isRunning:     boolean;
  hasError:      boolean;
  lastRunResult: RunResult | null;

  // ── Actions ──
  runCode:     () => Promise<void>;
  clearOutput: () => void;
}

export const useEditorStore = create<EditorStore>()(
  devtools(
    (set, get) => ({
      // ── Editor ──
      code:             DEFAULT_CODE,
      detectedLanguage: 'halku' as DetectedLanguage,
      setCode: (code) =>
        set(
          { code, detectedLanguage: isHalkuLang(code) ? 'halkuLang' : 'halku' },
          false,
          'setCode'
        ),
      resetCode: () =>
        set(
          { code: DEFAULT_CODE, detectedLanguage: 'halku', output: [], hasError: false, lastRunResult: null },
          false,
          'resetCode'
        ),

      // ── Execution ──
      output: [],
      isRunning: false,
      hasError: false,
      lastRunResult: null,

      runCode: async () => {
        const { code } = get();
        const lang = isHalkuLang(code) ? 'halkuLang' : 'halku';

        set({ isRunning: true, output: [], hasError: false, detectedLanguage: lang }, false, 'runStart');

        const onLine = (line: OutputLine) =>
          set((s) => ({ output: [...s.output, line] }), false, 'streamLine');

        let result: RunResult;

        if (lang === 'halkuLang') {
          // ── HalkuLang: synchronous interpreter (has its own step-limit safety) ──
          result = runHalkuLang(code, onLine);
        } else {
          // ── Halku/JS: compile + Worker ──
          const compiled = halkuCompile(code);
          if (!compiled.ok) {
            const errLine: OutputLine = {
              id: Date.now(), type: 'error',
              text: `Compile error: ${compiled.error}`,
              timestamp: Date.now(),
            };
            set({ output: [errLine], hasError: true, isRunning: false, lastRunResult: null }, false, 'compileError');
            return;
          }
          result = await halkuRun(compiled.js, onLine);
        }

        set({ isRunning: false, hasError: result.hasError, lastRunResult: result }, false, 'runComplete');
      },

      clearOutput: () =>
        set(
          { output: [], hasError: false, lastRunResult: null },
          false,
          "clearOutput"
        ),
    }),
    { name: "EditorStore" }
  )
);
