import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";

import { SearchBar } from "./search-bar.component";

const meta: Meta<typeof SearchBar> = {
    component: SearchBar,
    title: "Dashboard/SearchBar",
    args: { onSearch: fn() },
};

export default meta;

type Story = StoryObj<typeof SearchBar>;

export const Default: Story = {};

export const CustomPlaceholder: Story = {
    args: {
        placeholder: "Buscar por destino...",
    },
};
