import type { Step } from "../../types/history";
import { cn } from "../../utils/cn";

const icons: Record<NonNullable<Step["exitReason"]> | "pending", [string, string]> = {
  pending: ["hero-ellipsis-horizontal-circle-solid", "text-gray-400"],
  success: ["hero-check-circle-solid", "text-green-500"],
  fail: ["hero-x-circle-solid", "text-red-500"],
  crash: ["hero-x-circle-solid", "text-orange-800"],
  cancel: ["hero-no-symbol-solid", "text-gray-600"],
  kill: ["hero-exclamation-circle-solid", "text-yellow-800"],
  exception: ["hero-exclamation-triangle-solid", "text-black"],
  lost: ["hero-exclamation-triangle-solid", "text-black"],
};

/** A killed step's icon by what killed it (run_live/components.ex `step_icon`). */
const killIcons: Record<string, string> = {
  SecurityError: "hero-shield-exclamation-solid",
  ImportError: "hero-shield-exclamation-solid",
  TimeoutError: "hero-clock-solid",
};

/** A step's exit-reason icon (run_live/components.ex `step_icon`). */
export default function StepIcon({ reason, errorType }: { reason: Step["exitReason"]; errorType?: string | null }) {
  const [base, color] = icons[reason ?? "pending"] ?? icons.pending;
  const icon = (reason === "kill" && errorType && killIcons[errorType]) || base;
  return <span className={cn(icon, "mr-1.5 h-5 w-5 flex-shrink-0 inline-block", color)} />;
}
