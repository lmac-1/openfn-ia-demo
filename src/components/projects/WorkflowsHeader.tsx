import Button from "../Button";
import TableTitle from "../TableTitle";
import SearchInput from "../SearchInput";
import { useRouter } from "../../routing/router";

/**
 * Above the workflows metrics (DashboardComponents.workflows_header):
 * "Workflows (n)", the search box and "Create new workflow".
 */
export default function WorkflowsHeader({
  count,
  projectId,
  canCreate = true,
  searchTerm,
  onSearch,
  onClear,
}: {
  count: number;
  projectId: string;
  canCreate?: boolean;
  searchTerm: string;
  onSearch: (term: string) => void;
  /** The clear button, when it differs from searching for "". */
  onClear?: (() => void) | undefined;
}) {
  const { navigate } = useRouter();
  return (
    <TableTitle title="Workflows" count={count} className="mb-6">
      <SearchInput value={searchTerm} onChange={onSearch} onClear={onClear} clearButtonId="clear_search_button" className="w-96" />
      {/* A button, as in Lightning, so it can be disabled with a reason. */}
      <Button
        id="new-workflow-button"
        className="whitespace-nowrap"
        onClick={() => navigate(`/projects/${projectId}/w/new`)}
        disabled={!canCreate}
        tooltip={canCreate ? undefined : "You are not authorized to perform this action."}
      >
        Create new workflow
      </Button>
    </TableTitle>
  );
}
