import Pill from "../Pill";
import Tooltip from "../Tooltip";

/**
 * The workflow version a run used (Common.snapshot_version_chip): "latest"
 * in primary, or an older snapshot's version number in yellow. The tooltip
 * is also the chip's label, as Lightning's Tooltip hook made it.
 */
export default function SnapshotVersionChip({ version, tooltip }: { version: string; tooltip?: string }) {
  return (
    <Tooltip content={tooltip}>
      {/* Pill takes no ref, so this span is the tooltip's trigger. */}
      <span aria-label={tooltip}>
        <Pill square color={version === "latest" ? "primary" : "yellow"}>
          {version}
        </Pill>
      </span>
    </Tooltip>
  );
}
