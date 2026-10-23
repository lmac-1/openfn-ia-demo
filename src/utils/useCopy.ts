import { useEffect, useState } from "react";

/** Copies text to the clipboard; `copied` is true for `ms` (two seconds) afterwards. */
export function useCopy(value: string, ms = 2000) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), ms);
    return () => clearTimeout(t);
  }, [copied, ms]);
  const copy = () => {
    navigator.clipboard?.writeText(value).catch(() => {});
    setCopied(true);
  };
  return { copied, copy };
}
