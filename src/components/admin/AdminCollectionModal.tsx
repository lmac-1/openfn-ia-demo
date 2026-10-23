import type { CollectionFormValues } from "../../types/admin";
import { urlSafeName } from "../../utils/format";
import { useForm } from "../../utils/useForm";
import { blank } from "../../utils/validate";
import FormModal from "../FormModal";
import { Select } from "../Inputs";
import NameField from "../NameField";

interface Props {
  /** The collection being edited; omit to create one. */
  collection?: { id: string; name: string; projectId: string } | undefined;
  /** Every project on the instance, as [name, id], sorted by name. */
  projectOptions: [label: string, value: string][];
  onCancel: () => void;
  /** Saves. Rejects with field errors (`rawName`, `projectId`) or a message, which keep the modal open. */
  onSave: (values: CollectionFormValues) => Promise<void>;
}

/**
 * The superuser create / edit collection modal
 * (collection_live/collection_creation_modal.ex): a name, with the URL-safe
 * name it will get, and the project it belongs to. Server field errors show
 * on their fields; the host announces success and the page closes the modal.
 */
export default function AdminCollectionModal({ collection, projectOptions, onCancel, onSave }: Props) {
  const key = collection?.id ?? "new";
  const form = useForm<CollectionFormValues>({
    initial: { rawName: collection?.name ?? "", projectId: collection?.projectId ?? projectOptions[0]?.[1] ?? "" },
    validate: ({ rawName, projectId }) => ({ rawName: blank(urlSafeName(rawName)), projectId: blank(projectId) }),
  });

  return (
    <FormModal
      open
      onClose={onCancel}
      size="xl"
      title={collection ? "Edit Collection" : "Create Collection"}
      formId={`collection-form-${key}`}
      onSubmit={form.modalSubmit(onSave)}
      submitLabel="Save"
      submitId={`save-collection-${key}`}
      cancelId={`cancel-collection-creation-${key}`}
    >
      <NameField
        id="collection_raw_name"
        hint="Collection names must be unique across all projects within this instance. They are used in URLs and as titles, so duplicates are not allowed."
        required
        {...form.fieldProps("rawName")}
        badgeLabel="This collection will be named"
      />
      <Select id="collection_project_id" label="Project" required options={projectOptions} {...form.fieldProps("projectId")} />
    </FormModal>
  );
}
