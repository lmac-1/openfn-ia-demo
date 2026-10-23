import { cn } from "../utils/cn";
import Tooltip from "./Tooltip";

interface Props {
  /** Tooltip text, shown on hover. */
  title: string;
  icon?: string;
  iconClass?: string;
  className?: string;
}

/**
 * Lightning's `Common.tooltip` (live/components/common.ex): a small faded
 * primary info icon next to a label, with its tooltip above.
 */
export default function InfoTooltip({
  title,
  icon = "hero-information-circle-solid",
  iconClass = "w-4 h-4 text-primary-600 opacity-50",
  className,
}: Props) {
  return (
    <Tooltip content={title} side="top">
      <button
        type="button"
        className={cn(
          "relative ml-1 cursor-pointer rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600",
          className,
        )}
        aria-label={title}
      >
        <span className={cn(icon, iconClass)} />
      </button>
    </Tooltip>
  );
}
