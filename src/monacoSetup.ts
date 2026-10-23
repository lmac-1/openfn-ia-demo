/**
 * The replica's Monaco host setup: workers and the bundled copy of Monaco.
 * This belongs to the host, not the components: `?worker` only exists under
 * Vite. Lightning does the same in assets/js/monaco/index.tsx with esbuild.
 * Imported by main.tsx and Storybook's preview, before anything renders.
 */
import * as monaco from "monaco-editor";
import { loader } from "@monaco-editor/react";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import JsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import TsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

self.MonacoEnvironment = {
  getWorker: (_moduleId: string, label: string) => {
    switch (label) {
      case "json":
        return new JsonWorker();
      case "typescript":
      case "javascript":
        return new TsWorker();
      default:
        return new EditorWorker();
    }
  },
};

// Use this bundle's Monaco rather than @monaco-editor/react's CDN default.
loader.config({ monaco });
