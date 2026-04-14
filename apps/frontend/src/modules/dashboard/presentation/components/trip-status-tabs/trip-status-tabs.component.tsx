import type { FC } from "react";

import { WlTabs } from "@core/presentation/components/navigation/tabs/wl-tabs.component";
import { useAppTranslation } from "@core/presentation/hook/use-app-translation/use-app-translation.hook";

import type { TripStatus } from "@trip/domain/models/trip.model";

const ALL_KEY = "ALL";

interface TripStatusTabsProps {
    activeStatus: TripStatus | null;
    onChange: (status: TripStatus | null) => void;
}

export const TripStatusTabs: FC<TripStatusTabsProps> = ({
    activeStatus,
    onChange,
}) => {
    const { t } = useAppTranslation("dashboard");

    const items = [
        { key: ALL_KEY, label: t("tabs.all") },
        { key: "DRAFT", label: t("tabs.draft") },
        { key: "UPCOMING", label: t("tabs.upcoming") },
        { key: "IN_PROGRESS", label: t("tabs.inProgress") },
        { key: "COMPLETED", label: t("tabs.completed") },
    ];

    const handleChange = (key: string) => {
        onChange(key === ALL_KEY ? null : (key as TripStatus));
    };

    return (
        <WlTabs
            activeKey={activeStatus ?? ALL_KEY}
            onChange={handleChange}
            items={items}
        />
    );
};
