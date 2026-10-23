# Errors

Every error from the API (except the token endpoint, see [Authentication](./authentication.md)) is an
[RFC 9457](https://www.rfc-editor.org/rfc/rfc9457) problem document:

```json
{
  "type": "about:blank",
  "title": "Unprocessable Content",
  "status": 422,
  "code": "invalid",
  "detail": "The request is not valid. See errors.",
  "errors": [
    { "pointer": "#/members/0/email", "code": "not_found", "detail": "does not exist" }
  ]
}
```

- Branch on `status` and `code`. `detail` is fixed text for people and may
  change.
- `errors` appears only when the problem lies in particular parts of the
  request. Each entry has a `code`, a `detail` and exactly one location:
  `pointer` (a JSON pointer into the body), `parameter` (a query parameter),
  `header` or `path`. Entries never quote a value you sent.
- The content type is `application/problem+json` when your `Accept` header
  names it, and `application/json` otherwise. The body is the same either way.
- Some problems carry extra members, such as `existing` on a duplicate user.

## Order of checks

Lightning checks a request in a fixed order, so one condition always gets one
status. A body that can't be read at all (400 `malformed`, 413 or 415) is
refused before any of these.

1. Authentication. A missing or bad token is 401.
2. Scope. A service account token without the scope the route needs is 403
   `insufficient_scope`, even if the id doesn't exist or the body is wrong.
3. Standing. If you can't see the resource, it is 404 `not_found`, exactly as
   if it didn't exist.
4. Role. If you can see it but your role doesn't allow the action, it is 403
   `forbidden`.
5. State. A project or credential scheduled for deletion is 409
   `scheduled_for_deletion`.
6. Body. Every problem with the body is reported together in one 422 `invalid`.
7. Plan limits. 402 `exceeds_limit` (429 on webhooks).

## Response codes

| Status | `code` | Meaning |
| --- | --- | --- |
| 400 | `bad_request` | The request could not be read. |
| 400 | `invalid_request` | The `Authorization` header is malformed: nothing after `Bearer`, whitespace inside the token, or the header sent twice. |
| 400 | `malformed` | The body is not valid JSON, or not a JSON object. |
| 400 | `invalid_parameter` | A query parameter is not valid. `errors` names each one. |
| 400 | `invalid_header` | A request header is not valid. |
| 401 | `unauthenticated` | No `Authorization` header. |
| 401 | `invalid_token` | The token is expired or bad, or this route doesn't accept its kind. |
| 401 | `invalid_credentials` | Planned. Signing in failed. The same for every reason, so it can't be used to find accounts. |
| 401 | `mfa_required` | Planned. Signing in needs an MFA code too. |
| 402 | `exceeds_limit` | This would exceed a limit of your plan. |
| 403 | `forbidden` | You may see this but not do this, or the project requires MFA you haven't set up. |
| 403 | `insufficient_scope` | The token lacks the scope this route needs. |
| 403 | `step_up_required` | Planned. The person must enter their password or an MFA code again first. See [session tokens](./authentication.md#session-tokens). |
| 403 | `trigger_disabled` | The webhook's trigger is disabled. |
| 404 | `not_found` | Not found, or you don't have access to it. |
| 406 | `not_acceptable` | The resource can't be returned in the format you asked for. |
| 408 | `request_timeout` | The request body did not arrive in time. |
| 409 | `scheduled_for_deletion` | The project or credential is scheduled for deletion. |
| 409 | `id_taken` | The id belongs to a resource you can't change (another project's collection, or another owner's credential). |
| 409 | `taken` | A value that must be unique is already in use. `errors` points at it. |
| 409 | `being_edited` | The workflow is open in the editor. |
| 409 | `concurrent_edit` | Another request changed or deleted this record. Fetch it again and retry. |
| 409 | `in_use` | The credential has been used by runs and can't be deleted. |
| 409 | `ambiguous_name` | More than one collection has this name. Add `project_id`. |
| 413 | `content_too_large` | The body is too large. |
| 414 | `uri_too_long` | The query string is too long. |
| 415 | `unsupported_media_type` | The body must be JSON. |
| 422 | `invalid` | The body is not valid. `errors` lists every problem. |
| 429 | `too_many_runs` | Too many runs. Try again later. |
| 429 | `too_many_requests` | Too many requests. Try again later. |
| 500 | `internal` | Something went wrong in Lightning. |
| 501 | `not_implemented` | Not available on this instance. |
| 503 | `service_unavailable` | Try again shortly. |
| 503 | `not_ready` | Not ready yet. Sent with `Retry-After`. |
| 504 | `timeout` | A synchronous webhook's workflow did not finish in time. |

Every 401 carries a `WWW-Authenticate` header. A 403 `insufficient_scope`
carries one naming the scope you need, for example
`WWW-Authenticate: Bearer error="insufficient_scope", scope="credentials:write"`.

## Entry codes

Codes that can appear on an entry in `errors`:

`already_scheduled`, `credential_not_allowed`, `cycle`, `dataclip_wiped`,
`deleting`, `discovery_failed`, `duplicate`, `exceeds_limit`, `exclusive`,
`format`, `invalid`, `missing_trigger_edge`, `mismatch`, `must_accept`,
`no_access`, `not_allowed`, `not_found`, `not_supported`, `one_body`,
`one_enabled`, `one_enabled_edge`, `one_owner`, `out_of_range`, `required`,
`reserved`, `scope_not_granted`, `single_target`, `storage_failed`, `taken`,
`too_long`, `too_many_secrets`, `too_short`, `tree_branch_conflict`,
`trigger_removed`, `type`, `unchanged`, `unknown_key`, `wrong_length`.

Response codes and entry codes are part of the API contract. Renaming or
removing one is a breaking change.

## Unknown routes

Any path under `/api` or `/collections` that doesn't exist answers a 404
`not_found` problem document, before authentication.
