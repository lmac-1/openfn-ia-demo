import { useEffect, useState } from "react";

/** Re-renders every `ms` while `active`, for elapsed times that are still running. */
export function useTick(active: boolean, ms = 1000) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const handle = setInterval(() => setTick((n) => n + 1), ms);
    return () => clearInterval(handle);
  }, [active, ms]);
}
