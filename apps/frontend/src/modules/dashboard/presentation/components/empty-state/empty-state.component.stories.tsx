import type { Meta, StoryObj } from "@storybook/react-vite";

import { EmptyState } from "./empty-state.component";

const meta: Meta<typeof EmptyState> = {
    component: EmptyState,
    title: "Dashboard/EmptyState",
};

export default meta;

type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {};
