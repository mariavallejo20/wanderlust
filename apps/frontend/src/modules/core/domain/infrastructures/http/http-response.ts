export interface HttpResponse<D> {
    data: D;
    status: number;
    statusText: string;
}
