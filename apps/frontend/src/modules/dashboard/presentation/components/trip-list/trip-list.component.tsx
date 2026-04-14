import type { FC } from "react";

import { WlCard } from "@core/presentation/components/data-display/card/wl-card.component";
import { WlSkeleton } from "@core/presentation/components/feedback/skeleton/wl-skeleton.component";
import {
    WlCol,
    WlRow,
} from "@core/presentation/components/layout/grid/wl-grid.component";

import type { Trip } from "@trip/domain/models/trip.model";

import { TripCard } from "../trip-card/trip-card.component";

interface TripListProps {
    trips: Trip[];
    isLoading: boolean;
    onTripClick: (id: string) => void;
}

export const TripList: FC<TripListProps> = ({
    trips,
    isLoading,
    onTripClick,
}) => {
    if (isLoading) {
        return (
            <WlRow gutter={[16, 16]}>
                {Array.from({ length: 6 }).map((_, i) => (
                    <WlCol
                        key={i}
                        xs={24}
                        sm={12}
                        lg={8}
                    >
                        <WlCard styles={{ body: { padding: "16px" } }}>
                            <WlSkeleton
                                active
                                paragraph={{ rows: 3 }}
                            />
                        </WlCard>
                    </WlCol>
                ))}
            </WlRow>
        );
    }

    if (trips.length === 0) {
        return null;
    }

    return (
        <WlRow gutter={[16, 16]}>
            {trips.map((trip) => (
                <WlCol
                    key={trip.id}
                    xs={24}
                    sm={12}
                    lg={8}
                >
                    <TripCard
                        trip={trip}
                        onClick={onTripClick}
                    />
                </WlCol>
            ))}
        </WlRow>
    );
};
