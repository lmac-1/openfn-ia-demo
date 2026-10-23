import * as RadixTooltip from "@radix-ui/react-tooltip";
import { useRef, useState, type ReactNode, type SyntheticEvent } from "react";
import { useCopy } from "../utils/useCopy";

/**
 * Lightning's React `Tooltip` (assets/js/components/Tooltip.tsx), on Radix.
 * The child must be a single element that can take a ref; it becomes the
 * trigger. No `content` renders the child alone. With `copy`, clicking the
 * child copies that text and the tooltip says "Copied!" for 1.5 seconds,
 * then hides, like Lightning's Tooltip and Copy hooks.
 */
export default function Tooltip({
  children,
  content,
  copy,
  side = "bottom",
  align = "center",
  delayDuration = 200,
}: {
  children: ReactNode;
  content: ReactNode;
  /** Text to copy when the child is clicked. */
  copy?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  delayDuration?: number;
}) {
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const { copied, copy: copyNow } = useCopy(copy ?? "", 1500);
  if (!content) return <>{children}</>;
  // Like Lightning's Copy hook, the click copies and goes no further, even inside a link or a clickable row.
  const onCopy = (e: SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    copyNow();
    setOpen(false); // "Copied!" holds it open, then it hides.
  };
  return (
    <RadixTooltip.Provider delayDuration={delayDuration}>
      <RadixTooltip.Root open={open || copied} onOpenChange={setOpen}>
        <RadixTooltip.Trigger
          asChild
          ref={trigger}
          // Preventing the press stops Radix closing the tooltip, so it doesn't blink before "Copied!".
          {...(copy !== undefined && { onClick: onCopy, onPointerDown: (e: SyntheticEvent) => e.preventDefault() })}
        >
          {children}
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          {/* z-300: the same layer as Menu and Popover panels, above modals. */}
          <RadixTooltip.Content
            side={side}
            align={align}
            sideOffset={5}
            // A press on the trigger is the trigger's to handle (it closes unless the trigger prevents it), not a press outside.
            onPointerDownOutside={(e) => trigger.current?.contains(e.target as Node) && e.preventDefault()}
            className="z-300 max-w-xs overflow-hidden rounded-md bg-primary-950 px-3 py-1.5 text-center text-xs text-primary-50 shadow-md"
            data-ui="tooltip"
          >
            {copied ? "Copied!" : content}
            <RadixTooltip.Arrow className="fill-primary-950" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
      {copy !== undefined && (
        <span role="status" className="sr-only">
          {copied ? "Copied to clipboard" : ""}
        </span>
      )}
    </RadixTooltip.Provider>
  );
}
