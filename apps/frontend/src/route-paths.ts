export const RoutePaths = {
    dashboard: "/",
    tripDetail: (tripId: string) => `/trips/${tripId}`,
    itinerary: (tripId: string) => `/trips/${tripId}/itinerary`,
    budget: (tripId: string) => `/trips/${tripId}/budget`,
    mapView: (tripId: string) => `/trips/${tripId}/map`,
    shared: (shareId: string) => `/shared/${shareId}`,
} as const;
