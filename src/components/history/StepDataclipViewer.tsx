import type { Step, StepDataclip } from "../../types/history";
import JsonViewer from "./JsonViewer";
import TextPingLoader from "./TextPingLoader";
import WipedDataViewer from "./WipedDataViewer";

/**
 * A selected step's input or output on the run page (viewers.ex
 * `step_dataclip_viewer`): the wiped box, a "could not be saved" note,
 * "Nothing yet" while running, or the JSON body. A dataclip whose body has
 * not arrived yet shows an empty viewer, as Lightning's does while it fetches.
 */
export default function StepDataclipViewer({
  step,
  dataclip,
  inputOrOutput,
  runFinished,
  projectId,
  canEditDataRetention,
  adminContacts,
}: {
  step: Pick<Step, "inputDataclipId" | "outputDataclipId" | "finishedAt"> | undefined;
  dataclip: StepDataclip | undefined;
  inputOrOutput: "input" | "output";
  runFinished: boolean;
  projectId: string;
  canEditDataRetention: boolean;
  /** Named in the wiped notice when the viewer cannot change the policy. */
  adminContacts?: string[];
}) {
  const field = inputOrOutput === "input" ? step?.inputDataclipId : step?.outputDataclipId;
  const wiped = dataclip?.wiped || (step?.finishedAt && !field);
  if (wiped) {
    return (
      <WipedDataViewer
        dataLabel={inputOrOutput}
        projectId={projectId}
        canEditDataRetention={canEditDataRetention}
        adminContacts={adminContacts ?? []}
      />
    );
  }
  if (!dataclip) {
    return runFinished ? (
      <div className="m-2 p-12 text-center">No {inputOrOutput} state could be saved for this run.</div>
    ) : (
      <div className="rounded-md bg-gray-700 p-12 text-center font-mono text-xs text-gray-200 @md:text-base">
        <TextPingLoader>Nothing yet</TextPingLoader>
      </div>
    );
  }
  return (
    // Monaco fills a sized box; a min-height alone doesn't give it one.
    <div className="relative h-full min-h-96 grow">
      <div className="absolute inset-0">
        <JsonViewer value={dataclip.body ?? ""} ariaLabel={inputOrOutput === "input" ? "Input" : "Output"} />
      </div>
    </div>
  );
}
