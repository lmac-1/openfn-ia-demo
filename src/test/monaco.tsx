/* eslint-disable react-refresh/only-export-components -- a test mock, never hot-reloaded */
/**
 * A stand-in for @monaco-editor/react under jsdom, where Monaco can't run.
 * Wired up for every test in src/test/setup.ts. It keeps a plain-text model
 * and draws each line as a div, so tests can find text, see which lines
 * carry the step bar (`data-highlighted`), and read what CodeViewer did to
 * the model through `editors`.
 */
import { useEffect, useReducer, useState } from "react";
import type { EditorProps } from "@monaco-editor/react";

class Range {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
  constructor(startLineNumber: number, startColumn: number, endLineNumber: number, endColumn: number) {
    this.startLineNumber = startLineNumber;
    this.startColumn = startColumn;
    this.endLineNumber = endLineNumber;
    this.endColumn = endColumn;
  }
}

class FakeModel {
  lines = [""];
  setValueCalls = 0;
  applyEditsCalls = 0;
  onChange = () => {};
  getValue() {
    return this.lines.join("\n");
  }
  setValue(value: string) {
    this.setValueCalls++;
    this.lines = value.split("\n");
    this.onChange();
  }
  getLineCount() {
    return this.lines.length;
  }
  getLineMaxColumn(line: number) {
    return this.lines[line - 1]!.length + 1;
  }
  private offset(line: number, column: number) {
    return this.lines.slice(0, line - 1).reduce((n, l) => n + l.length + 1, 0) + column - 1;
  }
  applyEdits(edits: { range: Range; text: string }[]) {
    this.applyEditsCalls++;
    for (const { range, text } of edits) {
      const value = this.getValue();
      const from = this.offset(range.startLineNumber, range.startColumn);
      const to = this.offset(range.endLineNumber, range.endColumn);
      this.lines = (value.slice(0, from) + text + value.slice(to)).split("\n");
    }
    this.onChange();
  }
}

type Decoration = { range: Range };

export class FakeEditor {
  model = new FakeModel();
  highlighted = new Set<number>();
  ranges: { start: number; end: number }[] = [];
  revealed: number[] = [];
  getModel() {
    return this.model;
  }
  createDecorationsCollection(decorations: Decoration[]) {
    const collection = {
      set: (next: Decoration[]) => {
        this.ranges = next.map(({ range }) => ({ start: range.startLineNumber, end: range.endLineNumber }));
        this.highlighted = new Set(
          next.flatMap(({ range }) =>
            Array.from({ length: range.endLineNumber - range.startLineNumber + 1 }, (_, i) => range.startLineNumber + i)
          )
        );
        this.model.onChange();
      },
    };
    collection.set(decorations);
    return collection;
  }
  revealLineNearTop(line: number) {
    this.revealed.push(line);
  }
  options: EditorProps["options"] = {};
  theme: EditorProps["theme"] = undefined;
  onType: EditorProps["onChange"] = undefined;
  /** What a user typing the whole text would do: the model changes, then onChange fires. */
  type(value: string) {
    this.model.setValue(value);
    this.onType?.(value, undefined as never);
  }
}

/** Every editor mounted, newest last. */
export const editors: FakeEditor[] = [];

const monaco = {
  Range,
  editor: { defineTheme: () => {} },
  languages: {
    getLanguages: () => [],
    register: () => {},
    setMonarchTokensProvider: () => {},
    typescript: { javascriptDefaults: { setCompilerOptions: (options: object) => (compilerOptions.javascript = options) } },
  },
};

/** What the last mount passed to javascriptDefaults.setCompilerOptions. */
export const compilerOptions: { javascript?: object } = {};

export default function Editor({ beforeMount, onMount, options, theme, language, value, onChange }: EditorProps) {
  const [editor] = useState(() => new FakeEditor());
  const [, redraw] = useReducer((n: number) => n + 1, 0);
  editor.options = options;
  editor.theme = theme;
  editor.onType = onChange;
  useEffect(() => {
    editor.model.onChange = redraw;
    editors.push(editor);
    const api = monaco as unknown as Parameters<NonNullable<EditorProps["beforeMount"]>>[0];
    beforeMount?.(api);
    onMount?.(editor as unknown as Parameters<NonNullable<EditorProps["onMount"]>>[0], api);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once, like Monaco
  }, []);
  // A controlled value replaces the model's text when it differs, as the real one does.
  useEffect(() => {
    if (value !== undefined && value !== editor.model.getValue()) editor.model.setValue(value);
  }, [editor, value]);
  return (
    <div role="textbox" aria-readonly={options?.readOnly} aria-label={options?.ariaLabel} data-language={language}>
      {editor.model.lines.map((line, i) => (
        <div key={i} data-line={i + 1} data-highlighted={editor.highlighted.has(i + 1) || undefined}>
          {line}
        </div>
      ))}
    </div>
  );
}
