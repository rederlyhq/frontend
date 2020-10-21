export interface BackendAPIResponse<T = any> {
    data: T
    message?: string
}