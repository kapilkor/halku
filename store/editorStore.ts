import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { halkuCompile } from "@/lib/halkuCompiler";
import { halkuRun } from "@/lib/halkuRunner";
import { OutputLine, RunResult } from "@/lib/outputTypes";
import { isHalkuLang, runHalkuLang } from "@/lang/halkuLang";

export type DetectedLanguage = 'halku' | 'halkuLang';

const DEFAULT_MODE_CODE = `halku re
maan le a = 10

jab tak re (a < 5) {
sun re(a)
a++
}
bye halku`;

const CUSTOM_MODE_CODE = `halku re
maan le a = 10

jab tak re (a < 5) {
sun re(a)
a++
}
bye halku`;

export interface EditorStore {
  // ── Editor state ──
  mode:             "default" | "custom";
  setMode:          (mode: "default" | "custom") => void;
  code:             string;
  defaultCode:      string;
  customCode:       string;
  detectedLanguage: DetectedLanguage;
  setCode:          (code: string) => void;
  resetCode:        () => void;

  // ── Mappings ──
  customMapping: Record<string, string>;
  setCustomMapping: (mapping: Record<string, string>) => void;
  updateMapping: (userWord: string, halkuWord: string) => void;
  removeMapping: (userWord: string) => void;
  clearMapping: () => void;

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
    persist(
      (set, get) => ({
        // ── Editor ──
        mode:             "default",
        defaultCode:      DEFAULT_MODE_CODE,
        customCode:       CUSTOM_MODE_CODE,
        setMode:          (mode) => 
          set((state) => ({ 
            mode, 
            code: mode === "default" ? state.defaultCode : state.customCode,
            output: [],
            hasError: false,
            lastRunResult: null
          }), false, "setMode"),
        code:             DEFAULT_MODE_CODE,
        detectedLanguage: 'halkuLang' as DetectedLanguage,
        setCode: (code) =>
          set(
            (state) => ({ 
              code, 
              defaultCode: state.mode === 'default' ? code : state.defaultCode,
              customCode: state.mode === 'custom' ? code : state.customCode,
              detectedLanguage: isHalkuLang(code) ? 'halkuLang' : 'halku' 
            }),
            false,
            'setCode'
          ),
        resetCode: () =>
          set(
            (state) => {
              const isDefault = state.mode === "default";
              return { 
                code: isDefault ? DEFAULT_MODE_CODE : CUSTOM_MODE_CODE, 
                defaultCode: isDefault ? DEFAULT_MODE_CODE : state.defaultCode,
                customCode: isDefault ? state.customCode : CUSTOM_MODE_CODE,
                detectedLanguage: 'halkuLang', 
                output: [], 
                hasError: false, 
                lastRunResult: null 
              };
            },
            false,
            'resetCode'
          ),

        // ── Mappings ──
      customMapping: {},
      setCustomMapping: (mapping) => {
        set({ customMapping: mapping }, false, 'setCustomMapping');
        console.log("Custom Mapping Updated:", mapping);
      },
      updateMapping: (userWord, halkuWord) => {
        const u = userWord.trim();
        const h = halkuWord.trim();
        if (!u || !h) return;
        set(
          (state) => {
            const next = { ...state.customMapping, [u]: h };
            console.log("Custom Mapping Updated:", next);
            return { customMapping: next };
          },
          false,
          'updateMapping'
        );
      },
      removeMapping: (userWord) => {
        set(
          (state) => {
            const u = userWord.trim();
            const next = { ...state.customMapping };
            delete next[u];
            console.log("Custom Mapping Updated:", next);
            return { customMapping: next };
          },
          false,
          'removeMapping'
        );
      },
      clearMapping: () => {
        set({ customMapping: {} }, false, 'clearMapping');
        console.log("Custom Mapping Updated:", {});
      },

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
      { 
        name: "halku-editor-storage",
        partialize: (state) => ({
          mode: state.mode,
          code: state.code,
          defaultCode: state.defaultCode,
          customCode: state.customCode,
          // customMapping is EXCLUDED from persistence (session-only based on requirements)
        })
      }
    ),
    { name: "EditorStore" }
  )
);
