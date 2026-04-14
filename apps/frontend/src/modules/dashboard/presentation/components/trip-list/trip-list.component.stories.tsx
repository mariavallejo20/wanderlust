import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";

import { createMockTrip } from "@trip/domain/mocks/trip.mock";

import { TripList } from "./trip-list.component";

const meta: Meta<typeof TripList> = {
    component: TripList,
    title: "Dashboard/TripList",
    args: { onTripClick: fn() },
};

export default meta;

type Story = StoryObj<typeof TripList>;

export const Loading: Story = {
    args: {
        trips: [],
        isLoading: true,
    },
};

export const WithTrips: Story = {
    args: {
        isLoading: false,
        trips: [
            createMockTrip({ title: "Viaje a Roma", status: "UPCOMING" }),
            createMockTrip({
                id: "22345678-1234-4123-a123-123456789012",
                title: "Ruta por Escocia",
                status: "DRAFT",
            }),
            createMockTrip({
                id: "32345678-1234-4123-a123-123456789012",
                title: "Aventura en Tokio",
                status: "COMPLETED",
            }),
        ],
    },
};

export const Empty: Story = {
    args: {
        isLoading: false,
        trips: [],
    },
};
