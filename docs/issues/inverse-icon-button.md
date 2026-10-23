# Give IconButton an inverse tone for the sidebar toggle

The sidebar collapse toggle is a hand-built button with its own SVG, because `IconButton` has no style for a dark background.

- `src/components/shell/Sidebar.tsx:192`

It's a lint exception.

**Fix.** Add an `inverse` tone to `IconButton` (light icon, subtle hover on a dark background). `IconButton` already takes an SVG as `icon`. Keep the `sidebar-toggle-btn` hook, or move the themes to `data-ui="icon-button"` with the new `data-variant`, and check every theme's sidebar after.

**Done when** the disable comment is gone and the toggle looks the same in each theme.
