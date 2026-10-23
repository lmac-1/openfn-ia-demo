import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { cn } from "../../utils/cn";
import { setUpMonaco } from "../monacoTheme";

interface Props {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  className?: string;
  ariaLabel?: string;
  /** Monaco's language id. */
  language?: string;
  /** Merged over the defaults, as Lightning's CollaborativeMonaco takes them. */
  options?: editor.IStandaloneEditorConstructionOptions;
}

// Lightning's job editor defaults (CollaborativeMonaco.tsx baseEditorOptions).
const defaults: editor.IStandaloneEditorConstructionOptions = {
  fontSize: 14,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  wordWrap: "on",
  lineNumbers: "on",
  folding: true,
  renderWhitespace: "selection",
  tabSize: 2,
  insertSpaces: true,
  automaticLayout: true,
  fixedOverflowWidgets: true,
  codeLens: false,
  wordBasedSuggestions: "off",
  showFoldingControls: "always",
  suggest: {
    showModules: true,
    showKeywords: false,
    showFiles: false,
    showClasses: false,
    showInterfaces: false,
    showConstructors: false,
    showDeprecated: false,
  },
};

// As CollaborativeMonaco's onMount: job code is a script, with no browser lib.
const onMount: OnMount = (_editor, monaco) => {
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({ allowNonTsExtensions: true, noLib: true });
};

/**
 * Lightning's Monaco code editor with the shared "default" theme. The host
 * sets up Monaco's workers and loader (src/monacoSetup.ts in the replica).
 */
export default function CodeEditor({
  value,
  onChange,
  readOnly = false,
  className,
  ariaLabel = "Job code",
  language = "javascript",
  options,
}: Props) {
  return (
    <div className={cn("h-full w-full", className)}>
      <Editor
        height="100%"
        value={value}
        onChange={(next) => onChange?.(next ?? "")}
        language={language}
        theme="default"
        beforeMount={setUpMonaco}
        onMount={onMount}
        options={{ ...defaults, readOnly, ariaLabel, ...options }}
      />
    </div>
  );
}
