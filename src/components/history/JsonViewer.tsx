import { useMemo } from "react";
import CodeViewer from "../CodeViewer";
import CopyButton from "../CopyButton";

/**
 * A dataclip body in the dark code viewer (react/components/CodeViewer.tsx,
 * DataclipViewer.tsx): pretty-printed JSON in Monaco with a copy button in
 * the top-right corner. The body is stringified once per value, so a parent
 * re-rendering (a run page receiving logs) costs nothing here.
 */
export default function JsonViewer({ value, ariaLabel = "Dataclip" }: { value: unknown; ariaLabel?: string }) {
  const content = useMemo(() => (typeof value === "string" ? value : JSON.stringify(value, null, 2)), [value]);

  return (
    <div className="h-full relative">
      {content && <CopyButton value={content} size="sm" className="absolute top-3 right-3 z-10" />}
      <CodeViewer value={content} language="json" ariaLabel={ariaLabel} />
    </div>
  );
}
