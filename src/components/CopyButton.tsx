import type { ReactNode } from "react";
import { useCopy } from "../utils/useCopy";
import Button, { type ButtonSize } from "./Button";
import IconButton from "./IconButton";
import Tooltip from "./Tooltip";

/**
 * Copies `value` to the clipboard and says so. With children it's a
 * secondary Button ("Copy Code" → "Copied!" for two seconds); without, a
 * clipboard IconButton whose tooltip says "Copied!".
 */
export default function CopyButton({
  value,
  label = "Copy to clipboard",
  size,
  id,
  className,
  children,
}: {
  value: string;
  /** Accessible name and tooltip of the icon-only button. */
  label?: string;
  /** `xs` only applies with children; the icon button is `sm` at its smallest. */
  size?: ButtonSize;
  id?: string;
  className?: string;
  /** Button text; omit for an icon-only button. */
  children?: ReactNode;
}) {
  const { copied, copy } = useCopy(value);
  if (children) {
    return (
      <Button id={id} theme="secondary" size={size} onClick={copy} className={className}>
        {copied ? "Copied!" : children}
      </Button>
    );
  }
  // The icon button says "Copied!" in its tooltip, as Lightning's Copy hook does.
  return (
    <Tooltip content={label} copy={value}>
      <IconButton id={id} icon="hero-clipboard-document" label={label} title="" size={size === "xs" ? "sm" : size} className={className} />
    </Tooltip>
  );
}
