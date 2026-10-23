# Provisioning

Provisioning reads and writes a whole project (workflows, jobs, triggers,
edges, credential links, collections and channels) as one document. It is
what the OpenFn CLI uses for deploys.

Tokens: personal access token, or a GitHub sync token for its own project.
Deploying to an existing project needs owner or admin, and creating a new
project needs a superuser, as for `PUT /api/projects/:id`. Service account
tokens aren't accepted yet; support is planned.

## Deploy a project

Status: **Public**

```
POST /api/provision
```

Send the full project document. Every entity must have a UUID `id`, generated
by you for new ones. Send all existing entities, not just the changed ones:
jobs, triggers and edges you leave out of a workflow are deleted. To delete a
workflow or collection, include it with `"delete": true`. Credential links
and channels can't be removed this way.

```json
{
  "id": "f6ba9a8c-b687-473a-908e-e250686f1eed",
  "name": "my-project",
  "workflows": [
    {
      "id": "f206aa85-4fce-492e-94eb-ffd32c75d178",
      "name": "workflow-one",
      "jobs": [
        { "id": "18ed71de-…", "name": "job-one", "adaptor": "@openfn/language-common@latest", "body": "fn(s => s)" }
      ],
      "triggers": [{ "id": "e0b9f357-…", "type": "webhook", "enabled": true }],
      "edges": [
        { "id": "c239d994-…", "source_trigger_id": "e0b9f357-…", "target_job_id": "18ed71de-…", "condition_type": "always" }
      ]
    }
  ]
}
```

Answers 201 with `{"data": <project document>}` and a `Location` header
pointing at `/api/provision/:id`. While the adaptor catalogue is still loading
it answers 503 `not_ready`.

## Export a project

Status: **Public**

```
GET /api/provision/:id
GET /api/provision/:id?snapshots[]=:snapshot_id
```

Answers 200 `{"data": <project document>}`. The document includes `workflows`
(with `lock_version`), `project_credentials` (`id`, `name`, `owner`),
`collections` (`id`, `name`) and `channels`. Pass `snapshots[]` to get those
workflow versions instead of the current ones.

## Export a project as YAML

Status: **Public**

```
GET /api/provision/yaml?id=:id
```

Answers 200 with `Content-Type: text/yaml`. Takes `snapshots[]` like the JSON
export. A missing `id` answers 400 `invalid_parameter`.
