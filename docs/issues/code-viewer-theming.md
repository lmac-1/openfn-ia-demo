# Themes can't fully restyle CodeViewer

`CodeViewer` (`src/components/CodeViewer.tsx`) is Monaco, which takes its colours and font from a JS theme, not from the page's CSS. Every app theme shows the same dark slate viewer in Fira Code, so under GDS the log and dataclip viewers don't match the rest of the page.

What CSS can and can't reach, checked in the browser:

- **The editor's own colours can be changed.** Background, foreground, line numbers, current line and selection are Monaco CSS variables. A theme layer can override them on the hook, e.g. `html[data-theme="gds"] [data-ui="code-viewer"] .monaco-editor { --vscode-editor-background: …; }`.
- **Token colours can't.** JSON keys and strings, and the italic log source, are numbered `mtkN` classes that Monaco generates from the JS theme. The numbers change when the theme changes.
- **The font can't.** `fontFamily` is an editor option that Monaco measures in JS, so `--font-mono` doesn't apply.
- **Only one theme per page.** `monaco.editor.setTheme` is global, so a second JS theme would restyle every editor on the page, including Lightning's workflow editor.

**Fix.** If GDS needs its own viewer, give `CodeViewer` a second JS theme (a light one for GDS) and pick it from the app theme. Then decide what the workflow editor shows under GDS, because it shares the global theme. For the editor's colours alone, a `--vscode-*` block on `[data-ui="code-viewer"]` in `theme.css` is enough.

**Done when** the GDS theme's code viewers use GDS colours, or we decide they stay dark.
