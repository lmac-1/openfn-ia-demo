/** Channels (the HTTP proxy) and the requests made through them. Types only: no data, no behaviour. */

export interface Channel {
  id: string;
  projectId: string;
  name: string;
  enabled: boolean;
  destinationUrl: string;
  /** Project credential used to authenticate with the destination. */
  destinationCredentialId: string | null;
  /** Webhook auth methods clients use to call the channel. */
  clientAuthMethodIds: string[];
  requestCount: number;
  lastActivityAt: string | null;
  /** Bumped on every save; channel requests record the version they ran against. */
  lockVersion: number;
}

/** One row of the channels index table: what it shows, with the links the host builds. */
export interface ChannelRow {
  id: string;
  name: string;
  enabled: boolean;
  destinationUrl: string;
  /** The URL client systems call; the host knows its own address. */
  proxyUrl: string;
  requestCount: number;
  lastActivityAt: string | null;
  /** The channel logs, filtered to this channel. */
  logsHref: string;
}

/** What the New / Edit Channel form edits and saves. */
export interface ChannelFormValues {
  name: string;
  enabled: boolean;
  destinationUrl: string;
  /** A project credential id, or "" for none. */
  destinationCredentialId: string;
  /** Webhook auth method ids. */
  clientAuthMethodIds: string[];
}

/** What the form needs from the host: the options, and the channel when editing. */
export interface ChannelForm {
  /** Absent (or null, as JSON has it) for a new channel. */
  channel?: (ChannelFormValues & { id: string; proxyUrl: string }) | null | undefined;
  /** The project's credentials (Destination Credential). */
  credentialOptions: { id: string; name: string }[];
  /** The project's webhook auth methods (Client Credentials). */
  authMethodOptions: { id: string; name: string }[];
}

export type ChannelRequestState = "pending" | "success" | "failed" | "timeout" | "error";

export interface ChannelEvent {
  type: "destination_response" | "error";
  /** Null on a wiped request. */
  requestMethod: string | null;
  requestPath: string | null;
  requestQueryString: string | null;
  requestHeaders: [string, string][] | null;
  requestBodyPreview: string | null;
  requestBodySize: number | null;
  requestBodyHash: string | null;
  responseStatus: number | null;
  responseHeaders: [string, string][] | null;
  responseBodyPreview: string | null;
  responseBodySize: number | null;
  responseBodyHash: string | null;
  /** Microseconds. */
  latencyUs: number | null;
  ttfbUs: number | null;
  queueUs: number | null;
  connectUs: number | null;
  requestSendUs: number | null;
  responseDurationUs: number | null;
  reusedConnection: boolean;
  errorMessage: string | null;
}

export interface ChannelRequest {
  id: string;
  /** The client-facing request id (shown in the table). */
  requestId: string;
  channelId: string;
  projectId: string;
  state: ChannelRequestState;
  startedAt: string;
  completedAt: string | null;
  clientIdentity: string | null;
  clientAuth: string;
  destinationAuth: string;
  isWiped: boolean;
  /** The channel's config as it was when the request ran. */
  snapshot: { name: string; destinationUrl: string; lockVersion: number };
  events: ChannelEvent[];
}

/** One row of History's Channel Logs table: what it shows, with the path and error already picked from the events. */
export interface ChannelLogRow {
  id: string;
  /** The client-facing request id, shown short with the full one as the title. */
  requestId: string;
  channelId: string;
  channelName: string;
  startedAt: string;
  state: ChannelRequestState;
  /** The path of the request the destination answered; null when there was none or it was wiped. */
  requestPath: string | null;
  errorMessage: string | null;
}

/** What the channel request page shows of a request: the host sends no other id, and only the primary event. */
export type ChannelRequestDetail = Omit<ChannelRequest, "requestId" | "channelId" | "projectId">;

/** The channel a request ran through, as the request page shows it: its current name, destination and version. */
export type ChannelRequestChannel = Pick<Channel, "id" | "projectId" | "name" | "destinationUrl" | "lockVersion">;
