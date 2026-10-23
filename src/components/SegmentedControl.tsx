import { Radio, RadioGroup } from "@headlessui/react";
import type { ReactNode } from "react";
import { cn } from "../utils/cn";
import { tabStyles } from "./tabStyles";
import Tooltip from "./Tooltip";

export interface SegmentedOption<T extends string = string> {
  value: T;
  label: ReactNode;
  disabled?: boolean;
  /** Tooltip on a disabled option: why it can't be picked. */
  disabledReason?: string;
}

const s = tabStyles.pill;

/**
 * Pick one value from a few, drawn as `Tabs`' pill track. A radio group, not
 * tabs: use it when the choice changes a value rather than swapping panels.
 */
export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name for the group. */
  label: string;
  className?: string;
}) {
  return (
    <RadioGroup value={value} onChange={onChange} aria-label={label} data-ui="segmented-control" className={cn("flex", s.list, className)}>
      {options.map((option) => (
        // A disabled Radio drops its pointer events, so the tooltip hangs off a wrapper.
        <Tooltip key={option.value} content={option.disabled && option.disabledReason}>
          <span className="flex">
            <Radio
              value={option.value}
              disabled={option.disabled ?? false}
              className={({ checked, disabled }) =>
                cn(tabStyles.base, s.tab, checked ? s.selected : s.idle, disabled && tabStyles.disabled)
              }
            >
              {option.label}
            </Radio>
          </span>
        </Tooltip>
      ))}
    </RadioGroup>
  );
}
