# Jobs

## List and get jobs

Status: **Public**

Tokens: personal access token. Read only. Service account support is planned.

```
GET /api/jobs
GET /api/jobs?project_id=:project_id
GET /api/projects/:project_id/jobs
GET /api/jobs/:id
```

Lists are paged. Each job:

```json
{
  "type": "jobs",
  "id": "…",
  "attributes": { "name": "Extract data" },
  "relationships": {},
  "links": { "self": "https://.../api/jobs/…" }
}
```

A list returns `{"data": [...], "included": [], "links": {...}}`. A single job
returns `{"data": <job>, "included": [], "links": {"self": …}}`.
