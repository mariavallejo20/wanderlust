import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";

import { createMockTrip } from "@trip/domain/mocks/trip.mock";

import { TripCard } from "./trip-card.component";

const meta: Meta<typeof TripCard> = {
    component: TripCard,
    title: "Dashboard/TripCard",
    args: { onClick: fn() },
};

export default meta;

type Story = StoryObj<typeof TripCard>;

export const Default: Story = {
    args: {
        trip: createMockTrip({
            title: "Viaje a Roma",
            destination: "Italia",
            status: "DRAFT",
        }),
    },
};

export const InProgress: Story = {
    args: {
        trip: createMockTrip({
            title: "Road Trip por la Costa",
            destination: "España",
            status: "IN_PROGRESS",
        }),
    },
};

export const Completed: Story = {
    args: {
        trip: createMockTrip({
            title: "Aventura en Tokio",
            destination: "Japón",
            status: "COMPLETED",
        }),
    },
};
