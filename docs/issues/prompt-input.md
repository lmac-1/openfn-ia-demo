# Share one prompt input between the AI assistant and Build with AI

The AI assistant panel and the "Build with AI" landing screen each build a chat input by hand: a borderless textarea inside a bordered box, Enter sends, Shift+Enter adds a new line, and a footer holds the send button.

- `src/components/workflow/AIAssistantPanel.tsx:189`. It also sets its height with `style={{ height: 52 }}`.
- `src/components/workflow/LandingScreen.tsx:63`

Both lines are marked `debt:`.

**Fix.** One `PromptInput` feature component in `components/workflow/` that owns the box, the textarea, the Enter handling and a footer slot. Both screens use it. If the textarea part is useful elsewhere, give `TextArea` a borderless option instead of styling a raw one.

**Done when** both disable comments are gone.
