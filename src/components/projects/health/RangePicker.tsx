import { HEALTH_RANGES } from "../../../constants";
import type { HealthRange } from "../../../types/workflow-health";
import SegmentedControl from "../../SegmentedControl";

/**
 * The health page's time range (assets/js/health/RangePicker.tsx): a radio
 * group, not tabs, since it picks a value rather than swapping panels. A
 * range longer than the project keeps history is disabled, and hovering it
 * names the retention.
 */
export default function RangePicker({
  days,
  onChange,
  retentionDays = null,
}: {
  days: HealthRange["days"];
  onChange: (days: HealthRange["days"]) => void;
  retentionDays?: number | null;
}) {
  return (
    <SegmentedControl<HealthRange["days"]>
      label="Time range"
      value={days}
      onChange={onChange}
      options={HEALTH_RANGES.map((range) => ({
        value: range.days,
        label: range.label,
        disabled: retentionDays !== null && Number(range.days) > retentionDays,
        disabledReason: `Only ${retentionDays} days of history are kept for this project.`,
      }))}
    />
  );
}
