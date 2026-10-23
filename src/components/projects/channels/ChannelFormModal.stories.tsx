import type { Meta, StoryObj } from "@storybook/react";
import ChannelFormModal from "./ChannelFormModal";
import { channels, projectCredentialOptions, webhookAuthMethods } from "../../../mock-data/channels";
import { projects } from "../../../mock-data/projects";
import { withRouter } from "../../../stories/decorators";
import { channelProxyUrl } from "../../../utils/urls";

const existing = channels[0]!;

const meta: Meta<typeof ChannelFormModal> = {
  title: "Projects/Channels/ChannelFormModal",
  component: ChannelFormModal,
  decorators: [withRouter],
  args: {
    form: { credentialOptions: projectCredentialOptions, authMethodOptions: webhookAuthMethods },
    settingsHref: `/projects/${projects[0]!.id}/settings`,
    onClose: () => {},
    onSave: () => Promise.resolve(),
  },
};
export default meta;
type Story = StoryObj<typeof ChannelFormModal>;

export const New: Story = {};
export const Edit: Story = {
  args: {
    form: {
      channel: {
        id: existing.id,
        proxyUrl: channelProxyUrl(existing.id),
        name: existing.name,
        enabled: existing.enabled,
        destinationUrl: existing.destinationUrl,
        destinationCredentialId: existing.destinationCredentialId ?? "",
        clientAuthMethodIds: existing.clientAuthMethodIds,
      },
      credentialOptions: projectCredentialOptions,
      authMethodOptions: webhookAuthMethods,
    },
  },
};

/** A project with no webhook auth methods yet. */
export const NoAuthMethods: Story = {
  args: { form: { credentialOptions: projectCredentialOptions, authMethodOptions: [] } },
};
