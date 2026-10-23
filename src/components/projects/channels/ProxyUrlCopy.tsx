import Tooltip from "../../Tooltip";
import { cn } from "../../../utils/cn";

/**
 * A channel's proxy URL that copies itself on click (ChannelLive.Helpers
 * .proxy_url_copy): the tooltip offers the copy and says "Copied!" after it,
 * as Lightning's Copy hook does. The host and path truncate from the left so
 * the channel id stays visible. `icon` adds the inbound arrow used in the
 * channels table. The host builds the URL; it knows its own address.
 */
export default function ProxyUrlCopy({ url, icon = false, className }: { url: string; icon?: boolean; className?: string }) {
  const [scheme, rest] = url.includes("://") ? [url.split("://")[0] + "://", url.split("://")[1]] : ["", url];

  return (
    <Tooltip content="Copy proxy URL" copy={url}>
      <div
        role="button"
        tabIndex={0}
        aria-label="Copy proxy URL"
        // Enter and Space copy too; the Tooltip's click handler does the work.
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.currentTarget.click();
          }
        }}
        className={cn("group flex min-w-0 cursor-pointer items-center gap-1.5 text-gray-500 hover:text-gray-700", className)}
      >
        {icon && <span className="hero-arrow-right-end-on-rectangle h-4 w-4 shrink-0 text-gray-300" />}
        <span className="flex min-w-0 font-mono text-xs">
          <span className="shrink-0">{scheme}</span>
          <span className="truncate" style={{ direction: "rtl", textAlign: "left" }}>
            {rest}
          </span>
        </span>
        <span className="hero-clipboard-document h-4 w-4 shrink-0 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </Tooltip>
  );
}
