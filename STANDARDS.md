# Application patterns

CLAUDE.md says how a page is built from primitives. This file says how a page
*behaves*: what every component does when a request is pending, fails, or
changes the data it shows. These are the patterns that have to be in place
before the replica becomes Lightning's frontend, because they decide the shape
of every API call and every page wiring.

Status of each pattern, as of this commit:

| # | Pattern | Status | Where |
|---|---------|--------|-------|
| 1 | Async action | **Done** | `useAction`, `Button pending`, `FormModal`, `ConfirmModal`, `Spinner` |
| 2 | Form with server errors | **Done** | `useForm` (`submit`, `modalSubmit`); render-time validation remains in 3 files (see below) |
| 3 | Server-driven list | Todo | History first |
| 4 | Data down, mutations up | Convention; 5 panels break it | see list below |
| 5 | Resource loading states | Todo | needs `AsyncBoundary`, 404, error page |
| 6 | Confirm then act | Done in `ConfirmModal`; 3 other ways remain | retire `window.confirm`, custom modals |
| 7 | Feedback | Convention; mixed today | page toasts, component never does |
| 8 | Live updates | Todo, after 3 | subscription hook |
| 9 | Permission gating | Mostly done | one disabled-with-reason look |
| 10 | Session and route guards | Todo | router-level guard |
| 11 | Page and wrapper | 19 pages and the Sidebar | History work orders, Sandboxes, project settings, the workflow editor, profile, credentials, the remaining auth pages |

Worked example: `src/pages/profile/TokensPage.tsx` and its
`TokensPage.replica.tsx` wrapper (patterns 1, 4, 6, 7, 11).

## 1. Async action

Every handler that will talk to the server is `() => Promise<void>` and runs
through `useAction` (`src/utils/useAction.ts`), or through a primitive that
does (`FormModal`, `ConfirmModal`).

- **Pending.** The triggering `Button` gets `pending`: disabled, spinner,
  `aria-busy`. A modal's Cancel and backdrop are inert while pending. Nothing
  else on the page locks.
- **Success.** The handler resolves. The caller then closes the modal,
  navigates, or toasts. The primitive never closes itself.
- **Failure.** The handler throws (a `RequestError` from `src/utils/errors.ts`
  once wired). The primitive stays where it was: a modal stays open and shows
  the message as an `Alert` above the form; a page button toasts it with
  `useAction`'s `onError`. The user can retry or cancel.
- **Double submit** is impossible: `run` ignores calls while pending.
- **Until wired,** page mutations `await simulateRequest(...)` from
  `src/mock-data/request.ts`, so the pending state is visible in the demo.
  `failNextRequest()` makes the next call reject, for stories and manual checks.

Rules: no `onClick={() => toast("Saved")}` without an awaited request in
between. No `setTimeout` to fake latency inside a component. A sync handler
is allowed only when nothing will ever go to the server (toggling a local
disclosure, copying to clipboard).

## 2. Form with server errors

One form helper owns values, dirty state, client validation and server
field errors: `useForm` (`src/utils/useForm.ts`).

- `useForm({ initial, validate, clearOnSave })` returns `values`,
  `set(field, value)`, `errors` (per field, `string[]`, client and server
  merged), `dirty`, `reset()`, and `fieldProps(name)` to spread onto
  `TextInput`, `NameField` etc. `clearOnSave` empties the form after a
  successful save (password forms) instead of keeping what was typed.
- A page form submits with `onSubmit={form.submit(save)}`. It runs `save`
  through `useAction` (pattern 1), so `form.pending` goes on the Save button
  and `form.error` shows as an `Alert` by the form (pattern 7). On success
  the submitted values become the saved ones and the form is clean again.
  A `FormModal` form passes `onSubmit={form.modalSubmit(save)}` and closes
  itself inside `save`; the modal shows pending and other failures.
- Client validation runs on blur and on submit, not on every keystroke.
  `blank` from `utils/validate.ts` is the required-field check.
- A `RequestError` with `fieldErrors` from submit lands on the matching
  fields. If any key isn't a form field (Lightning's `current_password`
  where the form says `password`), the submit fails with the error's
  message, so nothing is lost silently. Lightning's changeset messages
  ("can't be blank", "has already been taken") are used verbatim.
- Submit is never disabled because the form is invalid: submitting shows
  every error and doesn't save, so the user can always find out why.
  (Lightning disables it, and the reason can sit on a field you haven't
  touched.)
- The one exception is type-to-confirm (pattern 6): the confirm button stays
  disabled until the typed text matches, and the dialog always shows the
  text to type. The typing is a deliberate pause before something that
  can't be undone, not data entry, and with the text shown there is no
  hidden reason.
- Whether Save waits for changes follows Lightning form by form: Project
  Identity's doesn't, Concurrency's and basic info's do.
- Field ids keep Lightning's (`project-settings-form_raw_name`), so the
  compare tooling and the annotations still line up. An input without an
  `id` gets a generated one, so every label is linked to its control.

Converted: `CreateProjectModal`, `ProjectSetupPanel`, `ProfileForms`. Still
computing `errors={cond ? ["can't be blank"] : []}` in render:
`DataStoragePanel`, `CredentialFormModal`, `AuthResetPasswordPage`. Other
page forms (`UserForm`, `AdminProjectForm`, `AuthProviderForm`, `MfaCard`,
the auth pages) move to `useForm` when next touched.

## 3. Server-driven list

Filtering, sorting and paging are the server's job. The browser holds the
query, not the rows.

- Query state (filters, sort, page, search) lives in the URL via
  `useUrlParams`, using Lightning's own param names (`filters[workflow_id]`,
  `sort_by`, `page`). Reloading the page reproduces the view.
- The host sends the result as plain data: the rows, `page: PageInfo` and,
  for a sorted list, `sort: SortState`. No callbacks for paging or sorting,
  and no browser fallback when they are missing.
- The page links to its own query string only (`useUrlParams().href`),
  never a path, so it knows no routes. A link to another page is an `…Href`
  prop from the host.
- The page turns the URL into a query (today: a mock-data function that
  filters fixtures; later: a request) and gets back `{ rows, total, page,
  pageSize }`.
- `Table` takes rows and a `state: "loading" | "error" | "ready"`, and shows
  the loading and error treatments itself. `EmptyState` stays for "no rows".
- `Pagination` takes `page` and links each page to this URL with `?page=`
  changed, showing five pages either side as Lightning does. No component
  hardcodes `number: 1`.
- A server-sorted header is `<Th sortHref>`, a plain link. `onSort` and
  `useTableSort` are only for small, fully loaded lists (project members,
  tabs).

Build it on History first (`HistoryWorkOrdersPage`): nine filters move from
`useState` into the URL, `matchesSearch` and friends move behind one
`workOrdersQuery(params)` in mock-data, and the table shows loading.

## 4. Data down, mutations up

A component never copies a record list into local state and mutates it.

- Records come in as props. Changes go out as `onAdd`, `onRemove`,
  `onUpdate` callbacks that return `Promise<void>`. The page (later the
  query layer) applies the change and re-renders with new props.
- Local state in a component is for *UI* only: which modal is open, which
  row is expanded, draft text not yet submitted.
- `initialX` props are a smell: `CollaborationPanel.initialMembers`,
  `CollectionsPanel`, `WebhookSecurityPanel`, `SecurityPanel`,
  `CredentialIndex`. Each needs its list lifted to its page and `on*`
  callbacks added.

## 5. Resource loading states

Any page or panel built around one record (a project, a run, a credential)
needs the same four treatments: loading, not found, forbidden, error.

- One `AsyncBoundary` primitive (or equivalent) takes a resource state and
  renders `Spinner`, a not-found page, or an `Alert`, and otherwise its
  children.
- A real `NotFoundPage` and `ErrorPage` under `src/pages/`, routed as the
  catch-all. No more `<Navigate to="/projects">` as the not-found treatment.
- Pages don't invent their own "Project not found" text.

## 6. Confirm then act

`ConfirmModal` is the one way to confirm a destructive action. It supports
type-to-confirm, async `onConfirm` (pattern 1), and stays open on failure.
Type-to-confirm keeps the confirm button disabled until the text matches,
and the dialog says what to type ("To confirm, type alice@example.org
below"). This is the one exception to pattern 2's rule.

Retire: `window.confirm` (`CredentialFormModal`, `WorkflowsTable`), the
bespoke `CredentialDeletionModal` (rebuild on `ConfirmModal` with
`confirmation`, as `UserDeletionModal` is).
The `/…/delete` routes stay, because Lightning has them; they open a
`ConfirmModal`.

## 7. Feedback

- Success is announced by the **host**, never the page: the replica wrapper
  toasts it, and Lightning shows its own flash (put by the server) as the
  same toast. Components report through callbacks. Wording is Lightning's
  flash text.
- Failure that needs reading (a form rejected, a conflict) is an inline
  `Alert` next to what failed. Failure of a one-shot button is an error
  toast.
- A server flash that survives a redirect (login errors, "Project created"
  after navigation) needs a small flash store read once by the shell. The
  `?error=1` simulation on auth pages is a placeholder for it.

## 8. Live updates

History and run show update in place in Lightning (PubSub). The component
contract from pattern 3 must not assume rows are static: rows are keyed by
id, and a subscription hook replaces or inserts rows in the same query
result the page already holds. Build after pattern 3.

## 9. Permission gating

`can*` booleans come from `usePermissions(project)` in the page and are
passed down. Already in place. The remaining rule: a gated action is
*disabled with a reason*, never hidden, unless Lightning hides it. The
reason is `Button`'s `tooltip` or `SectionHeader`'s `permissionsSection`.
No inline role checks in components.

## 10. Session and route guards

`SessionProvider` supplies the user and instance. Still needed, once at the
router: redirect to login when signed out, to `/users/two-factor` when 2FA is
pending, to confirm-required when unconfirmed, to the MFA-required page for
projects that require it, and away from `/settings/*` for non-superusers.
Lightning does this in plugs and `on_mount`; mirror those rules in one
`RouteGuard` component around the route groups in `App.tsx`.

## 11. Page and wrapper

A page that will move to Lightning is two files: the page draws, the wrapper
feeds it. The page file is copied into Lightning unchanged; only the wrapper
is rewritten.

- **`XPage.tsx`** takes everything as props: the records, and an `on*`
  function per action returning `Promise<void>`. It imports nothing from
  `src/mock-data/`, `src/session/` or `react-router-dom`. Its props type
  (`XPageProps`, a comment on each prop) is the contract between the two.
- **`XPage.replica.tsx`** is what `App.tsx` routes to. It holds the fixtures
  in state as the server would, reads URL params, awaits `simulateRequest`,
  fires success toasts and navigates. It is the "page" patterns 4 and 7 mean.
- **In Lightning**, an island wrapper feeds the same `XPage.tsx` from the
  LiveView's `data-*` attributes and turns each `on*` call into a
  `pushEvent`. After an action the LiveView re-renders with new attributes,
  so new props arrive the same way they do in the replica.
- **Shapes are Lightning's**, not the convenient ones: a token arrives
  `masked`, and its secret only once, as `newToken`.
- **The contract is written by hand.** `XPageProps` and the shapes it names
  never build on the replica's model types (`User`, `Project`, `WorkOrder`);
  the replica maps fixtures onto them. Every one is exported from `index.ts`,
  camelCase, and plain JSON apart from the `on*` callbacks.
- **Names say what a shape is**: `…Row` for a table row, `…Ref` for a
  pointer to another record, `…Values` for what a form saves, `…Detail` for
  one record's page, `…Result` for an event's answer. No two exported types
  share a name.
- **Required unless the host may not support it.** Data the host always knows
  is required, `T | null` for none. `?:` hides a feature; it never falls back
  to a route or wording the design system makes up.
- **The page keeps UI state only**: which modal is open, a draft not yet
  saved. Never its own copy of the records.
- **The page gets a story** with plain props: `withRouter`,
  `withCanvas("h-screen")` and `layout: "fullscreen"` (`PageContent` fills
  its parent, so without a height its body is clipped).

## How to add a pattern to a component

1. Read the pattern here and the worked example.
2. Change the primitive first, with its story showing the new state
   (pending, failed, loading).
3. Apply it to one page end to end, through `simulateRequest`.
4. Run `node scripts/design-system-metrics.mjs`; nothing should go up.
5. Update the status table above.
