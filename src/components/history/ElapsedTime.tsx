import { formatElapsed } from "../../utils/format";
import { useTick } from "../../utils/useTick";

/**
 * How long a run or step took (hooks/ElapsedIndicator.ts): "212 ms", "4 s",
 * "2 m", or "Not started". Ticks once a second until it finishes, and only
 * this element re-renders for it.
 */
export default function ElapsedTime({ startedAt, finishedAt }: { startedAt: string | null; finishedAt: string | null }) {
  useTick(!!startedAt && !finishedAt);
  return <>{formatElapsed(startedAt, finishedAt)}</>;
}
