import Alert from "../Alert";
import Button from "../Button";
import { TextArea, TextInput } from "../Inputs";
import SectionHeader from "../SectionHeader";
import NameField from "../NameField";
import TextLink from "../TextLink";
import Toggle from "../Toggle";
import SandboxSettingsBanner from "./SandboxSettingsBanner";
import Card from "../Card";
import type { Project } from "../../types/projects";
import { errorMessage } from "../../utils/errors";
import { urlSafeName } from "../../utils/format";
import { useForm } from "../../utils/useForm";
import { blank } from "../../utils/validate";

interface Props {
  project: Project;
  /** Project environment, shown read-only. */
  env: string;
  /** The parent, when `project` is a sandbox. */
  parentProject?: Project | undefined;
  canEditProject: boolean;
  canDeleteProject: boolean;
  /** Saves the identity or concurrency form. Rejects on failure, which the form shows inline. */
  onUpdate: (changes: Partial<Pick<Project, "name" | "description" | "concurrency">>) => Promise<void>;
}

/**
 * The Setup tab (`#project`, settings.html.heex:67-313): Project Identity
 * form, Concurrency Override, Export, and the danger zone. As in Lightning,
 * Identity's Save is enabled whenever the user can edit; Concurrency's waits
 * for a change.
 */
export default function ProjectSetupPanel({ project, env, parentProject, canEditProject, canDeleteProject, onUpdate }: Props) {
  const sandbox = project.parentId !== null;
  const identity = useForm({
    initial: { rawName: project.name, description: project.description },
    validate: ({ rawName }) => ({ rawName: blank(urlSafeName(rawName)) }),
  });
  const concurrency = useForm({ initial: { serial: project.concurrency === 1 } });

  return (
    <>
      <SectionHeader
        title={sandbox ? "Sandbox setup" : "Project setup"}
        subtitle={
          sandbox
            ? "Sandboxes are isolated copies of a project for safe experimentation."
            : "Projects are isolated workspaces that contain workflows, accessible to certain users."
        }
        permissionsSection={canEditProject ? undefined : "basic settings, but you can export a copy."}
      />
      {sandbox && <SandboxSettingsBanner variant="local" />}
      <Card
        title={sandbox ? "Sandbox Identity" : "Project Identity"}
        description={
          sandbox ? (
            <>
              Identifies this sandbox within its parent:{" "}
              {parentProject && (
                <TextLink to={`/projects/${parentProject.id}/settings`}>{parentProject.name}</TextLink>
              )}
            </>
          ) : (
            "This metadata helps you identify the types of workflows managed in this project and the people that have access."
          )
        }
      >
        <form
          id="project-settings-form"
          className="space-y-4"
          onSubmit={identity.submit(({ rawName, description }) => onUpdate({ name: urlSafeName(rawName), description }))}
        >
          <NameField
            id="project-settings-form_raw_name"
            label="Project name"
            disabled={!canEditProject}
            {...identity.fieldProps("rawName")}
            badgeLabel="Your project will be named"
          />
          <TextInput
            id="project-settings-form_env"
            label="Project environment"
            hint="Credentials will be loaded with values from this environment."
            value={env}
            disabled
            readOnly
          />
          <TextArea
            id="project-settings-form_description"
            label="Project description"
            hint="A short description of a project (max 240 characters)"
            disabled={!canEditProject}
            maxLength={240}
            {...identity.fieldProps("description")}
          />
          {identity.error && <Alert type="danger">{errorMessage(identity.error)}</Alert>}
          <Button
            id="project-identity-submit-btn"
            type="submit"
            disabled={!canEditProject}
            pending={identity.pending}
          >
            Save
          </Button>
        </form>
      </Card>

      <Card
        title="Concurrency Override"
        description={
          <>
            By default, runs are executed concurrently in accordance to limits set on individual workflows. In some
            situations, you may want to prevent concurrent execution across all workflows in a project.
            <span className="mt-2 block">
              Disabling parallel run execution ensures that only one run is executed at a time, regardless of
              workflow, for this entire project.
            </span>
          </>
        }
      >
        <form
          id="project-concurrency-form"
          className="space-y-4"
          onSubmit={concurrency.submit(({ serial }) => onUpdate({ concurrency: serial ? 1 : null }))}
        >
          <Toggle
            id="project-concurrency-switch"
            checked={concurrency.values.serial}
            onChange={(serial) => concurrency.set("serial", serial)}
            disabled={!canEditProject}
            label="Disable parallel execution"
            note="(No more than one run at a time)"
          />
          {concurrency.values.serial && concurrency.dirty && (
            <Alert type="warning" header="Heads Up!">
              <p>Disabling parallel run execution may significantly reduce the overall throughput of your project.</p>
            </Alert>
          )}
          {concurrency.error && <Alert type="danger">{errorMessage(concurrency.error)}</Alert>}
          <Button
            id="project-concurrency-submit-btn"
            type="submit"
            disabled={!(concurrency.dirty && canEditProject)}
            pending={concurrency.pending}
          >
            Save
          </Button>
        </form>
      </Card>

      <Card
        title="Export your Project"
        description="Export your project as code, to save this version or edit your project locally."
      >
        <Button>Export project</Button>
      </Card>

      {canDeleteProject && (
        <Card
          title="The danger zone"
          description={
            sandbox
              ? "Deleting this sandbox is irreversible. It removes every workflow, trigger, version, keychain clone, and dataclip that lives only inside it."
              : "Deleting your project is irreversible"
          }
        >
          <Button theme="danger" to={`/projects/${project.id}/settings/delete`}>
            {sandbox ? "Delete sandbox" : "Delete project"}
          </Button>
        </Card>
      )}
    </>
  );
}
