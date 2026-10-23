import { useEffect, useMemo, useRef, useState } from "react";
import Editor, { type Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { cn } from "../utils/cn";
import { setUpMonaco } from "./monacoTheme";

/** A run of lines, 1-based and inclusive. */
export interface LineRange {
  start: number;
  end: number;
}

export type CodeViewerLanguage = "json" | "openFnLogs" | "plaintext";

/**
 * Read-only text in Monaco, which only draws the visible lines: logs and
 * dataclips of any size. When `value` extends what's shown (a log growing)
 * the new text is appended to the model; anything else replaces it.
 * `highlighted` lines get the yellow step bar, and a new `revealLine` is
 * scrolled near the top. The host sets up Monaco's workers and loader
 * (src/monacoSetup.ts in the replica); this component only uses the
 * instance it's handed.
 */
export default function CodeViewer({
  value,
  ariaLabel,
  language = "plaintext",
  highlighted,
  revealLine,
  className,
}: {
  value: string;
  /** The editor's accessible name. */
  ariaLabel: string;
  language?: CodeViewerLanguage;
  /** Lines to mark with the step bar. */
  highlighted?: LineRange[] | undefined;
  /** Scrolled near the top whenever it changes. */
  revealLine?: number | undefined;
  className?: string;
}) {
  const [mounted, setMounted] = useState<{ editor: editor.IStandaloneCodeEditor; monaco: Monaco } | null>(null);
  const shown = useRef<string | null>(null);
  const decorations = useRef<editor.IEditorDecorationsCollection | null>(null);

  useEffect(() => {
    const model = mounted?.editor.getModel();
    if (!mounted || !model || value === shown.current) return;
    const old = shown.current;
    if (old && value.startsWith(old)) {
      const line = model.getLineCount();
      const column = model.getLineMaxColumn(line);
      model.applyEdits([{ range: new mounted.monaco.Range(line, column, line, column), text: value.slice(old.length) }]);
    } else {
      model.setValue(value);
    }
    shown.current = value;
  }, [mounted, value]);

  // After the value: setValue drops the old decorations.
  useEffect(() => {
    if (!mounted) return;
    const next = (highlighted ?? []).map((r) => ({
      range: new mounted.monaco.Range(r.start, 1, r.end, 1),
      options: { isWholeLine: true, linesDecorationsClassName: "log-viewer-highlighted" },
    }));
    if (decorations.current) decorations.current.set(next);
    else decorations.current = mounted.editor.createDecorationsCollection(next);
  }, [mounted, highlighted, value]);

  useEffect(() => {
    if (mounted && revealLine) mounted.editor.revealLineNearTop(revealLine);
  }, [mounted, revealLine]);

  const options = useMemo<editor.IStandaloneEditorConstructionOptions>(
    () => ({
      readOnly: true,
      ariaLabel,
      automaticLayout: true,
      fixedOverflowWidgets: true,
      folding: language === "json",
      fontFamily: "'Fira Code VF', 'Fira Code', monospace",
      fontLigatures: true,
      fontSize: 14,
      lineNumbersMinChars: 3,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: "on",
      // Lightning's dataclip viewer adds these; its log viewer doesn't.
      ...(language === "json" && { overviewRulerBorder: false, overviewRulerLanes: 0, tabSize: 2 }),
    }),
    [ariaLabel, language]
  );

  return (
    <div data-ui="code-viewer" className={cn("h-full", className)}>
      <Editor
        height="100%"
        language={language}
        theme="default"
        options={options}
        beforeMount={setUpMonaco}
        onMount={(editor, monaco) => setMounted({ editor, monaco })}
      />
    </div>
  );
}
