export type Failure = { error: string }

export type Success<T> = { value: T }

export type Result<T> = Success<T> | Failure

export function failure(error: string): Failure {
    return { error }
}

export function isFailure<T>(result: Result<T>): result is Failure {
    return 'error' in result
}
