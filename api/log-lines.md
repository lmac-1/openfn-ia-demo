# Log lines

## List log lines

Status: **Public**

Tokens: personal access token. Read only. Service account support is planned.

```
GET /api/log_lines
```

Paged. Filters:

| Parameter | Notes |
| --- | --- |
| `project_id`, `workflow_id`, `job_id`, `work_order_id`, `run_id` | UUIDs. |
| `level` | `success`, `always`, `info`, `warn`, `error` or `debug`. |
| `timestamp_after`, `timestamp_before` | ISO 8601. |

Each log line:

```json
{
  "type": "log_lines",
  "id": "…",
  "attributes": {
    "source": "JOB",
    "level": "info",
    "message": "…",
    "timestamp": "…",
    "step_id": "…",
    "run_id": "…"
  }
}
```
