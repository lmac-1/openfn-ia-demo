import type { ReactNode } from "react";
import { Link } from "../routing/router";
import { cn } from "../utils/cn";
import { tabStyles } from "./tabStyles";

export interface Tab<T extends string = string> {
  id: T;
  label: ReactNode;
  /** Hero icon class shown before the label. */
  icon?: string;
  /** Make the tab a route link (e.g. History's Work Orders / Channel Logs). */
  to?: string;
  disabled?: boolean;
  /** Tooltip on a disabled tab: why it can't be opened. */
  disabledReason?: string;
}

interface Props<T extends string> {
  tabs: Tab<T>[];
  active: T;
  /** Called when a tab is chosen. Route tabs navigate on their own unless this is set. */
  onChange?: (id: T) => void;
  /** `underline`: text over a rule. `pill`: segments on a gray track. */
  variant?: "underline" | "pill";
  orientation?: "horizontal" | "vertical";
  /** Pill tabs share the row's width equally. */
  fill?: boolean;
  /** Accessible name for the tab list. */
  label?: string;
  /** Extra controls at the end of the row, e.g. an add button. */
  after?: ReactNode;
  className?: string;
}

/**
 * A row (or column) of tabs. Renders only the tabs; show the active panel
 * yourself.
 */
export default function Tabs<T extends string>({
  tabs,
  active,
  onChange,
  variant = "underline",
  orientation = "horizontal",
  fill = false,
  label,
  after,
  className,
}: Props<T>) {
  const s = tabStyles[variant];
  const vertical = orientation === "vertical";
  const list = (
    <div
      role="tablist"
      aria-label={label}
      aria-orientation={orientation}
      data-ui="tabs"
      data-variant={variant}
      data-orientation={orientation}
      className={cn("flex", vertical ? "flex-col" : "flex-row", s.list, variant === "pill" && after && "flex-1")}
    >
      {tabs.map((tab) => {
        const selected = tab.id === active;
        const classes = cn(
          tabStyles.base,
          s.tab,
          variant === "underline" && !vertical && "-mb-px",
          fill && "flex-1 justify-center",
          selected ? s.selected : s.idle,
          tab.disabled && tabStyles.disabled
        );
        const content = (
          <>
            {tab.icon && <span className={cn(tab.icon, "h-5 w-5 shrink-0")} aria-hidden="true" />}
            {tab.label}
          </>
        );
        const shared = {
          role: "tab",
          "aria-selected": selected,
          "aria-disabled": tab.disabled || undefined,
          title: tab.disabled ? tab.disabledReason : undefined,
          className: classes,
        };
        if (tab.to && !tab.disabled) {
          return (
            <Link
              key={tab.id}
              to={tab.to}
              {...shared}
              onClick={(e) => {
                if (!onChange) return;
                e.preventDefault();
                onChange(tab.id);
              }}
            >
              {content}
            </Link>
          );
        }
        return (
          <button key={tab.id} type="button" {...shared} disabled={tab.disabled} onClick={() => onChange?.(tab.id)}>
            {content}
          </button>
        );
      })}
    </div>
  );

  if (!after && variant === "pill") return <div className={className}>{list}</div>;
  return (
    <div
      className={cn(
        "flex",
        vertical ? "flex-col" : "items-center gap-x-4",
        variant === "underline" && !vertical && "border-b border-gray-200",
        className
      )}
    >
      {list}
      {after}
    </div>
  );
}
