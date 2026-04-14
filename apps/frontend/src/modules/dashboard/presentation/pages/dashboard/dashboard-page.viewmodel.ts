import { inject, injectable } from "inversify";
import {
    action,
    computed,
    makeObservable,
    observable,
    runInAction,
} from "mobx";

import type { WanderlustError } from "@core/domain/errors/wanderlust.error";
import { BaseViewModel } from "@core/presentation/view-model/base/base.viewmodel";

import type { Trip, TripStatus } from "@trip/domain/models/trip.model";
import type { TripsGetAllUseCase } from "@trip/domain/usecases/trips-get-all.usecase";
import { TripTypes } from "@trip/trip-types.di";

@injectable()
export class DashboardPageViewModel extends BaseViewModel {
    @observable trips: Trip[] = [];
    @observable isLoading = true;
    @observable error: WanderlustError | null = null;
    @observable activeStatus: TripStatus | null = null;
    @observable searchQuery = "";

    constructor(
        @inject(TripTypes.TripsGetAllUseCase)
        private readonly tripsGetAll: TripsGetAllUseCase,
    ) {
        super();
        makeObservable(this);
    }

    @computed get filteredTrips(): Trip[] {
        let result = this.trips;

        if (this.activeStatus !== null) {
            result = result.filter((t) => t.status === this.activeStatus);
        }

        if (this.searchQuery.trim() !== "") {
            const query = this.searchQuery.toLowerCase();
            result = result.filter((t) =>
                t.title.toLowerCase().includes(query),
            );
        }

        return result;
    }

    @action setActiveStatus(status: TripStatus | null): void {
        this.activeStatus = status;
    }

    @action setSearchQuery(query: string): void {
        this.searchQuery = query;
    }

    override async didMount(): Promise<void> {
        await this.loadTrips();
    }

    @action private async loadTrips(): Promise<void> {
        this.error = null;

        const result = await this.tripsGetAll.execute();

        result.match(
            (trips) => {
                runInAction(() => {
                    this.trips = trips;
                    this.isLoading = false;
                });
            },
            (error) => {
                runInAction(() => {
                    this.error = error;
                    this.isLoading = false;
                });
            },
        );
    }
}
