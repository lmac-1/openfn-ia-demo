# Button and Pill variants for the four hand-built buttons

`Button` only has solid themes, so four buttons that look different are built by hand:

- `src/components/workflow/EditorHeader.tsx:77`: the workflow name in the editor header, plain text that renames on click.
- `src/components/history/LogViewer.tsx:31`: the log-level menu trigger (icon, level, chevron).
- `src/components/workflow/VersionDropdown.tsx:29`: the "latest" / "v3" menu trigger, styled to look like a `Pill`.
- `src/components/shell/PickerButton.tsx:34`: the project picker. It's a secondary button, except in a sandbox, where it takes the sandbox colour at runtime.

All four are marked `debt:`.

**Fix.**
- A `plain` theme on `Button` (text only, hover colour) for the first two.
- Let `Pill` render as a button (or take an `onClick`), so a menu trigger can be a `Pill`.
- Let `Button` take a custom background colour for the sandbox picker, or give it a `sandbox` theme that reads the colour from a CSS variable.

Each one needs its `data-variant` hook and a story. Check the GDS theme after.

**Done when** all four disable comments are gone.
