import type { Meta, StoryObj } from "@storybook/react";
import BackupCodesPage from "./BackupCodesPage";
import { backupCodes } from "../../mock-data/tokens";
import { withCanvas, withRouter } from "../../stories/decorators";

const meta: Meta<typeof BackupCodesPage> = {
  title: "Pages/Profile/BackupCodesPage",
  component: BackupCodesPage,
  // PageContent fills its parent, so give it a screen to fill.
  decorators: [withRouter, withCanvas("h-screen")],
  parameters: { layout: "fullscreen" },
  args: {
    codes: backupCodes,
    mfaEnabled: true,
    onRegenerate: async () => {},
    onPrint: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof BackupCodesPage>;

export const WithMfa: Story = {};
export const MfaDisabled: Story = { args: { mfaEnabled: false } };
