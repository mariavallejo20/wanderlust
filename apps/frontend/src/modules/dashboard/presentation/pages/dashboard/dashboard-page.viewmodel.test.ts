import { errAsync, okAsync } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { FallbackError } from "@core/domain/errors/fallback.error";

import { createMockTrip } from "@trip/domain/mocks/trip.mock";
import type { TripsGetAllUseCase } from "@trip/domain/usecases/trips-get-all.usecase";

import { DashboardPageViewModel } from "./dashboard-page.viewmodel";

function makeUseCase(
    overrides?: Partial<TripsGetAllUseCase>,
): TripsGetAllUseCase {
    return {
        execute: vi.fn(() => okAsync([])),
        ...overrides,
    } as unknown as TripsGetAllUseCase;
}

describe("DashboardPageViewModel", () => {
    describe("filteredTrips", () => {
        it("returns all trips when both filters are cleared", () => {
            const vm = new DashboardPageViewModel(makeUseCase());
            const trips = [
                createMockTrip({ status: "DRAFT" }),
                createMockTrip({
                    id: "22345678-1234-4123-a123-123456789012",
                    status: "UPCOMING",
                }),
            ];
            vm.trips = trips;

            expect(vm.filteredTrips).toHaveLength(2);
        });

        it("filters by activeStatus", () => {
            const vm = new DashboardPageViewModel(makeUseCase());
            vm.trips = [
                createMockTrip({ status: "DRAFT" }),
                createMockTrip({
                    id: "22345678-1234-4123-a123-123456789012",
                    status: "UPCOMING",
                }),
                createMockTrip({
                    id: "32345678-1234-4123-a123-123456789012",
                    status: "DRAFT",
                }),
            ];
            vm.setActiveStatus("DRAFT");

            const result = vm.filteredTrips;
            expect(result).toHaveLength(2);
            expect(result.every((t) => t.status === "DRAFT")).toBe(true);
        });

        it("filters by searchQuery (case-insensitive)", () => {
            const vm = new DashboardPageViewModel(makeUseCase());
            vm.trips = [
                createMockTrip({ title: "Viaje a Roma" }),
                createMockTrip({
                    id: "22345678-1234-4123-a123-123456789012",
                    title: "Viaje a París",
                }),
            ];
            vm.setSearchQuery("roma");

            const result = vm.filteredTrips;
            expect(result).toHaveLength(1);
            expect(result[0].title).toBe("Viaje a Roma");
        });

        it("combines status and search filters", () => {
            const vm = new DashboardPageViewModel(makeUseCase());
            vm.trips = [
                createMockTrip({ title: "París UPCOMING", status: "UPCOMING" }),
                createMockTrip({
                    id: "22345678-1234-4123-a123-123456789012",
                    title: "Roma UPCOMING",
                    status: "UPCOMING",
                }),
                createMockTrip({
                    id: "32345678-1234-4123-a123-123456789012",
                    title: "París DRAFT",
                    status: "DRAFT",
                }),
            ];
            vm.setActiveStatus("UPCOMING");
            vm.setSearchQuery("paris");

            const result = vm.filteredTrips;
            expect(result).toHaveLength(1);
            expect(result[0].title).toBe("París UPCOMING");
        });
    });

    describe("didMount", () => {
        it("populates trips and sets isLoading=false on success", async () => {
            const trip = createMockTrip();
            const useCase = makeUseCase({
                execute: vi.fn(() => okAsync([trip])),
            });
            const vm = new DashboardPageViewModel(useCase);

            await vm.didMount();

            expect(vm.trips).toHaveLength(1);
            expect(vm.trips[0].id).toBe(trip.id);
            expect(vm.isLoading).toBe(false);
            expect(vm.error).toBeNull();
        });

        it("sets error and isLoading=false on failure", async () => {
            const error = new FallbackError("network error");
            const useCase = makeUseCase({
                execute: vi.fn(() => errAsync(error)),
            });
            const vm = new DashboardPageViewModel(useCase);

            await vm.didMount();

            expect(vm.error).toBe(error);
            expect(vm.isLoading).toBe(false);
            expect(vm.trips).toHaveLength(0);
        });
    });
});
