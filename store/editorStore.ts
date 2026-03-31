import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { halkuCompile } from "@/lib/halkuCompiler";
import { halkuRun } from "@/lib/halkuRunner";
import { OutputLine, RunResult } from "@/lib/outputTypes";
import { isHalkuLang, runHalkuLang, applyCustomMapping } from "@/lang/halkuLang";

export type DetectedLanguage = 'halku' | 'halkuLang';

const DEFAULT_CODE = `// HalkuLang — simple start


maan le name = "Halku";
maan le i = 0;

jab tak re (i < 10) {
  sun re "Main " + name + " hun re!!";
  badha re i;
}

`;

export interface EditorStore {
  // ── Editor state ──
  code:             string;
  detectedLanguage: DetectedLanguage;
  setCode:          (code: string) => void;
  resetCode:        () => void;

  // ── Custom mapping state ──
  customMapping: Record<string, string>;
  setCustomMapping: (mapping: Record<string, string>) => void;
  updateCustomMapping: (key: string, value: string) => void;
  resetCustomMapping: () => void;

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

      // ── Custom Mapping ──
      customMapping: {},
      setCustomMapping: (mapping) => set({ customMapping: mapping }),
      updateCustomMapping: (key, value) =>
        set((state) => ({
          customMapping: { ...state.customMapping, [key]: value }
        })),
      resetCustomMapping: () => set({ customMapping: {} }),

      // ── Execution ──
      output: [],
      isRunning: false,
      hasError: false,
      lastRunResult: null,

      runCode: async () => {
        const { code, customMapping } = get();
        // 1. Apply any custom mappings (user words -> standard halku words)
        const mappedCode = applyCustomMapping(code, customMapping);
        
        // 2. Detect language based on the mapped code
        const lang = isHalkuLang(mappedCode) ? 'halkuLang' : 'halku';

        set({ isRunning: true, output: [], hasError: false, detectedLanguage: lang }, false, 'runStart');

        const onLine = (line: OutputLine) =>
          set((s) => ({ output: [...s.output, line] }), false, 'streamLine');

        let result: RunResult;

        if (lang === 'halkuLang') {
          // ── HalkuLang: synchronous interpreter (has its own step-limit safety) ──
          result = runHalkuLang(mappedCode, onLine);
        } else {
          // ── Halku/JS: compile + Worker ──
          const compiled = halkuCompile(mappedCode);
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
