# Use Headless UI's RadioGroup for card-style choices

Two "pick one card" choosers hide a radio button inside a clickable card.

- `src/components/project-settings/WebhookAuthMethodFormModal.tsx:54`: the Basic / API key cards.
- `src/components/projects/sandboxes/ColorPalette.tsx:32`: the sandbox colour swatches.

Both lines are lint exceptions.

**Fix.** Headless UI's `RadioGroup` does this job, with the keyboard handling and ARIA included. Wrap it in a small `RadioCards` primitive (or extend `Radio` in `Inputs.tsx`) and use it in both places, with a story.

**Done when** both disable comments are gone and arrow keys move between the cards.
