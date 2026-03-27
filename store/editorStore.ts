import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { halkuCompile } from "@/lib/halkuCompiler";
import { halkuRun } from "@/lib/halkuRunner";
import { OutputLine, RunResult } from "@/lib/outputTypes";
import { isHalkuLang, runHalkuLang } from "@/lang/halkuLang";

export type DetectedLanguage = 'halku' | 'halkuLang';

const DEFAULT_CODE = `// HalkuLang — Hindi-English hybrid scripting

hi halku
  maan le naam = "Duniya";
  sun re "Namaste, " + naam + "!";

  // Types
  maan le sach_hai = sach;
  maan le nalla_hai = nalla;
  sun re sach_hai;
  sun re nalla_hai;

  // Loops (jab tak re = while)
  maan le ginti = 0;
  jab tak re (ginti < 3) {
    sun re "Loop ginti = " + ginti;
    badha re ginti;
  }

  // Conditions
  maan le a = 10;
  bhai agar (a < 5) {
    sun re "a is small";
  } nahi toh agar (a < 15) {
    sun re "a is medium";
  } nahi toh {
    sun re "a is large";
  }

  // function
  function factorial(n) {
    bhai agar (n <= 1) {
      de re 1;
    }
    de re n * factorial(n - 1);
  }

  sun re "5! = " + factorial(5);

bye halku
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
      detectedLanguage: 'halkuLang' as DetectedLanguage,
      setCode: (code) =>
        set(
          { code, detectedLanguage: isHalkuLang(code) ? 'halkuLang' : 'halku' },
          false,
          'setCode'
        ),
      resetCode: () =>
        set(
          { code: DEFAULT_CODE, detectedLanguage: 'halkuLang', output: [], hasError: false, lastRunResult: null },
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
