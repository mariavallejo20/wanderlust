import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";

import { TripStatusTabs } from "./trip-status-tabs.component";

const meta: Meta<typeof TripStatusTabs> = {
    component: TripStatusTabs,
    title: "Dashboard/TripStatusTabs",
    args: { onChange: fn() },
};

export default meta;

type Story = StoryObj<typeof TripStatusTabs>;

export const AllActive: Story = {
    args: {
        activeStatus: null,
    },
};

export const DraftActive: Story = {
    args: {
        activeStatus: "DRAFT",
    },
};

export const InProgressActive: Story = {
    args: {
        activeStatus: "IN_PROGRESS",
    },
};
