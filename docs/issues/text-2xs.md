# Add a text-2xs size for text smaller than text-xs

Two places need text smaller than `text-xs` (12px), Tailwind's smallest size, so they use arbitrary values:

- `src/components/UserAvatar.tsx:17`: `text-[10px]` for the small avatar initials.
- `src/components/shell/Sidebar.tsx:130`: `text-[8px]` for the version label under the logo.

Both lines are lint exceptions.

**Fix.** Add `--text-2xs: 0.625rem` (10px) to the theme in `src/index.css` and use `text-2xs` in both. The sidebar label grows from 8px to 10px, which also makes it readable.

**Done when** both disable comments are gone.
