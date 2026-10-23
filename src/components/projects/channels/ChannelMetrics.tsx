import MetricCard from "../MetricCard";
import TextLink from "../../TextLink";

/** The two stat cards above the channels table: Total Channels and Total Requests, with "View all" to the channel logs. */
export default function ChannelMetrics({
  totalChannels,
  totalRequests,
  logsHref,
}: {
  totalChannels: number;
  totalRequests: number;
  /** The project's channel logs. */
  logsHref: string;
}) {
  return (
    <div className="mb-8 grid grid-cols-2 gap-6">
      <MetricCard title="Total Channels" value={totalChannels} />
      <MetricCard title="Total Requests" value={totalRequests} link={<TextLink to={logsHref}>View all</TextLink>} />
    </div>
  );
}
