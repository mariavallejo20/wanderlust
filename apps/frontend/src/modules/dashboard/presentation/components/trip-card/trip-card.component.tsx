import {
    CalendarOutlined,
    ClockCircleOutlined,
    EnvironmentOutlined,
} from "@ant-design/icons";
import { DateTime } from "luxon";
import type { FC } from "react";

import { WlCard } from "@core/presentation/components/data-display/card/wl-card.component";
import { WlTag } from "@core/presentation/components/data-display/tag/wl-tag.component";
import {
    WlTypographyText,
    WlTypographyTitle,
} from "@core/presentation/components/general/typography/wl-typography.component";
import { WlFlex } from "@core/presentation/components/layout/flex/wl-flex.component";
import { useAppTranslation } from "@core/presentation/hook/use-app-translation/use-app-translation.hook";

import type { Trip, TripStatus } from "@trip/domain/models/trip.model";

const STATUS_ACCENT: Record<TripStatus, string> = {
    DRAFT: "#f59e0b",
    UPCOMING: "#0891b2",
    IN_PROGRESS: "#22c55e",
    COMPLETED: "#94a3b8",
};

const STATUS_TAG_COLOR: Record<TripStatus, string> = {
    DRAFT: "gold",
    UPCOMING: "cyan",
    IN_PROGRESS: "success",
    COMPLETED: "default",
};

const STATUS_LABEL_KEY = {
    DRAFT: "status.DRAFT",
    UPCOMING: "status.UPCOMING",
    IN_PROGRESS: "status.IN_PROGRESS",
    COMPLETED: "status.COMPLETED",
} as const satisfies Record<TripStatus, string>;

function formatDate(iso: string): string {
    return DateTime.fromISO(iso).toLocaleString({
        day: "numeric",
        month: "short",
    });
}

interface TripCardProps {
    trip: Trip;
    onClick: (id: string) => void;
}

export const TripCard: FC<TripCardProps> = ({ trip, onClick }) => {
    const { t } = useAppTranslation("dashboard");
    const accent = STATUS_ACCENT[trip.status];

    const cover = (
        <WlFlex
            align="flex-end"
            style={{
                height: 80,
                padding: "0 16px 14px",
                background: `linear-gradient(135deg, ${accent}18 0%, ${accent}45 100%)`,
                borderBottom: `1px solid ${accent}25`,
                cursor: "pointer",
            }}
        >
            <WlFlex
                align="center"
                gap={6}
            >
                <EnvironmentOutlined style={{ color: accent, fontSize: 13 }} />
                <WlTypographyText
                    strong
                    style={{ color: accent, fontSize: 13 }}
                >
                    {trip.destination}
                </WlTypographyText>
            </WlFlex>
        </WlFlex>
    );

    return (
        <WlCard
            hoverable
            cover={cover}
            onClick={() => onClick(trip.id)}
            styles={{ body: { padding: "16px" } }}
            className="tw:w-full tw:overflow-hidden"
        >
            <WlFlex
                vertical
                gap={12}
            >
                {/* Title + badge */}
                <WlFlex
                    justify="space-between"
                    align="flex-start"
                    gap={8}
                >
                    <WlTypographyTitle
                        level={5}
                        className="tw:mb-0! tw:leading-snug! tw:flex-1"
                        ellipsis={{ rows: 2 }}
                    >
                        {trip.title}
                    </WlTypographyTitle>
                    <WlTag
                        color={STATUS_TAG_COLOR[trip.status]}
                        className="tw:shrink-0"
                    >
                        {t(STATUS_LABEL_KEY[trip.status])}
                    </WlTag>
                </WlFlex>

                {/* Dates + duration */}
                <WlFlex
                    justify="space-between"
                    align="center"
                    className="tw:pt-3 tw:border-t tw:border-t-gray-100"
                >
                    <WlFlex
                        align="center"
                        gap={5}
                    >
                        <CalendarOutlined
                            style={{ color: "#9ca3af", fontSize: 12 }}
                        />
                        <WlTypographyText
                            type="secondary"
                            className="tw:text-xs!"
                        >
                            {formatDate(trip.startDate)} —{" "}
                            {formatDate(trip.endDate)}
                        </WlTypographyText>
                    </WlFlex>
                    <WlFlex
                        align="center"
                        gap={4}
                    >
                        <ClockCircleOutlined
                            style={{ color: "#9ca3af", fontSize: 12 }}
                        />
                        <WlTypographyText
                            type="secondary"
                            className="tw:text-xs!"
                        >
                            {t("tripCard.duration", {
                                count: trip.durationInDays,
                            })}
                        </WlTypographyText>
                    </WlFlex>
                </WlFlex>
            </WlFlex>
        </WlCard>
    );
};
