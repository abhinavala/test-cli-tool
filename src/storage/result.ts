/**
 * Result type primitives.
 *
 * A `Result<T, E>` is a discriminated union representing either a successful
 * value of type `T` or a failure of type `E`. This is used throughout the
 * storage layer (and downstream code) instead of throwing exceptions, so
 * that error handling is explicit in the type system.
 */

export type Ok<T> = { ok: true; value: T };
export type Err<E> = { ok: false; error: E };

export type Result<T, E> = Ok<T> | Err<E>;

/**
 * Construct a successful Result.
 */
export const Ok = <T>(value: T): Ok<T> => ({ ok: true, value });

/**
 * Construct a failed Result.
 */
export const Err = <E>(error: E): Err<E> => ({ ok: false, error });
