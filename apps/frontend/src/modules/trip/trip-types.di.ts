export const TripTypes = Object.seal({
    TripRepository: Symbol.for("TripRepository"),
    TripDatasource: Symbol.for("TripDatasource"),
    TripsGetAllUseCase: Symbol.for("TripsGetAllUseCase"),
    TripGetByIdUseCase: Symbol.for("TripGetByIdUseCase"),
    TripCreateUseCase: Symbol.for("TripCreateUseCase"),
    TripUpdateUseCase: Symbol.for("TripUpdateUseCase"),
    TripDeleteUseCase: Symbol.for("TripDeleteUseCase"),
});
