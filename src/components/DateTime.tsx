import { formatRelative, formatRelativeDetailed, formatTimeOnly, formatUtc } from "../utils/format";
import { cn } from "../utils/cn";
import Tooltip from "./Tooltip";

/**
 * Lightning's `Common.datetime`: a local, relative timestamp ("today at
 * 6:36 PM"). Hovering shows the UTC value; clicking copies it and the
 * tooltip says "Copied!". "--" when there's no value.
 */
export default function DateTime({
  value,
  format = "relative",
  className,
}: {
  value: string | null | undefined;
  format?: "relative" | "relative_detailed" | "time_only";
  className?: string;
}) {
  if (!value) return <span className={cn("text-gray-400", className)}>--</span>;
  const utc = formatUtc(value);
  const text =
    format === "time_only"
      ? formatTimeOnly(value)
      : format === "relative_detailed"
        ? formatRelativeDetailed(value)
        : formatRelative(value);
  return (
    <Tooltip
      side="top"
      copy={utc}
      content={
        <>
          {utc}
          <span className="block text-xs text-gray-400">Click to copy timestamp</span>
        </>
      }
    >
      {/* A span, not a button, because Lightning puts dates inside links. */}
      <span
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key !== "Enter" && e.key !== " ") return;
          e.preventDefault();
          e.currentTarget.click();
        }}
        className={cn(
          "cursor-pointer select-none rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600",
          className,
        )}
      >
        {text}
      </span>
    </Tooltip>
  );
}
