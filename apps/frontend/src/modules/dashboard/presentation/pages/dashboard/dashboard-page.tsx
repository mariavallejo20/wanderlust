import { observer } from "mobx-react";
import { useNavigate } from "react-router";

import { WlResult } from "@core/presentation/components/feedback/result/wl-result.component";
import { WlSpin } from "@core/presentation/components/feedback/spin/wl-spin.component";
import {
    WlTypographyText,
    WlTypographyTitle,
} from "@core/presentation/components/general/typography/wl-typography.component";
import { WlFlex } from "@core/presentation/components/layout/flex/wl-flex.component";
import { useAppTranslation } from "@core/presentation/hook/use-app-translation/use-app-translation.hook";
import { useViewModel } from "@core/presentation/hook/use-view-model/use-view-model.hook";

import { DashboardTypes } from "@dashboard/dashboard-types.di";
import { EmptyState } from "@dashboard/presentation/components/empty-state/empty-state.component";
import { SearchBar } from "@dashboard/presentation/components/search-bar/search-bar.component";
import { TripList } from "@dashboard/presentation/components/trip-list/trip-list.component";
import { TripStatusTabs } from "@dashboard/presentation/components/trip-status-tabs/trip-status-tabs.component";
import type { DashboardPageViewModel } from "@dashboard/presentation/pages/dashboard/dashboard-page.viewmodel";

import { RoutePaths } from "@wanderlust/route-paths";

export const DashboardPage = observer(() => {
    const vm = useViewModel<DashboardPageViewModel>(
        DashboardTypes.DashboardPageViewModel,
    );
    const navigate = useNavigate();
    const { t } = useAppTranslation("dashboard");

    if (vm.isLoading) {
        return (
            <WlFlex
                justify="center"
                align="center"
                className="tw:min-h-[calc(100vh-64px)]"
            >
                <WlSpin size="large" />
            </WlFlex>
        );
    }

    if (vm.error !== null) {
        return (
            <WlFlex
                justify="center"
                align="center"
                className="tw:min-h-[calc(100vh-64px)]"
            >
                <WlResult
                    status="error"
                    title={t("error.loadFailed")}
                />
            </WlFlex>
        );
    }

    return (
        <WlFlex
            vertical
            className="tw:min-h-[calc(100vh-64px)] tw:bg-[#f0f5f7]"
        >
            {/* ── Page header ───────────────────────────────── */}
            <WlFlex
                vertical
                gap={0}
                style={{
                    background:
                        "linear-gradient(160deg, #e0f2fe 0%, #ecfdf5 100%)",
                    borderBottom: "1px solid #d1e9f0",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Accent line at top — like the reference */}
                <WlFlex
                    style={{
                        height: 3,
                        background:
                            "linear-gradient(90deg, #0891b2 0%, #0e7490 50%, #f59e0b 100%)",
                    }}
                />

                <WlFlex
                    justify="space-between"
                    align="center"
                    wrap
                    gap={[16, 12]}
                    className="tw:mx-auto tw:w-full tw:max-w-7xl tw:px-6 tw:py-5"
                >
                    <WlFlex
                        vertical
                        gap={2}
                    >
                        <WlTypographyTitle
                            level={3}
                            className="tw:mb-0!"
                            style={{ color: "#0d2d2d" }}
                        >
                            {t("pageTitle")}
                        </WlTypographyTitle>
                        <WlTypographyText
                            type="secondary"
                            className="tw:text-sm!"
                        >
                            {vm.filteredTrips.length === vm.trips.length
                                ? `${vm.trips.length} ${vm.trips.length === 1 ? "viaje" : "viajes"}`
                                : `${vm.filteredTrips.length} de ${vm.trips.length} viajes`}
                        </WlTypographyText>
                    </WlFlex>
                    <SearchBar onSearch={(q) => vm.setSearchQuery(q)} />
                </WlFlex>
            </WlFlex>

            {/* ── Tabs + content ────────────────────────────── */}
            <WlFlex
                vertical
                gap={20}
                className="tw:mx-auto tw:w-full tw:max-w-7xl tw:px-6 tw:py-6"
            >
                {/* Tabs on a white card */}
                <WlFlex
                    style={{
                        background: "#fff",
                        borderRadius: 10,
                        padding: "0 16px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    }}
                >
                    <TripStatusTabs
                        activeStatus={vm.activeStatus}
                        onChange={(s) => vm.setActiveStatus(s)}
                    />
                </WlFlex>

                {/* Trip grid or empty state */}
                {vm.filteredTrips.length === 0 ? (
                    <WlFlex
                        justify="center"
                        align="center"
                        style={{
                            background: "#fff",
                            borderRadius: 10,
                            padding: "48px 24px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                        }}
                    >
                        <EmptyState />
                    </WlFlex>
                ) : (
                    <TripList
                        trips={vm.filteredTrips}
                        isLoading={false}
                        onTripClick={(id) =>
                            void navigate(RoutePaths.tripDetail(id))
                        }
                    />
                )}
            </WlFlex>
        </WlFlex>
    );
});
