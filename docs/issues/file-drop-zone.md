# Add a FileDropZone primitive for the two hand-built file uploads

Two screens build the same file upload by hand, slightly differently. Each is a dashed card with a hidden `<input type="file">` and a label you click.

- `src/components/workflow/ManualRunPanel.tsx:95`: "Upload a file or drag and drop". Nothing handles a drop, so the drag and drop part doesn't work.
- `src/components/workflow/YAMLImportModal.tsx:46`: the YAML import drop zone.

Both lines are lint exceptions.

**Fix.** Add a `FileDropZone` primitive that takes `accept` and `onFile` and handles both click and drop. Use it in both places, with a story.

**Done when** both disable comments are gone and dropping a file works in both.
