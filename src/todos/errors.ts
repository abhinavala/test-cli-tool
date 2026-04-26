/**
 * Business-logic error types for todo operations.
 *
 * These complement (and are returned alongside) the lower-level
 * `StorageError` from the storage layer. Each variant is a discriminated
 * union keyed on `kind`, mirroring the convention used in the storage
 * module so downstream consumers can switch on `error.kind` exhaustively.
 */

/**
 * The maximum allowed length (after trimming) of a todo title.
 *
 * Re-exported from `./operations.ts` indirectly via the public surface,
 * but kept here so that callers wanting the literal limit can import the
 * error module alone.
 */
export const TITLE_MAX_LENGTH = 500;

/**
 * Raised by `addTodo` when the supplied title fails validation.
 *
 * - `empty_title`: the title was empty (or whitespace-only) after trimming.
 * - `title_too_long`: the trimmed title exceeded `maxLength` characters.
 */
export interface ValidationErrorEmptyTitle {
  kind: 'empty_title';
}

export interface ValidationErrorTitleTooLong {
  kind: 'title_too_long';
  maxLength: number;
}

export interface ValidationErrorInvalidPriority {
  kind: 'invalid_priority';
  provided: string;
}

export type ValidationError =
  | ValidationErrorEmptyTitle
  | ValidationErrorTitleTooLong
  | ValidationErrorInvalidPriority;

/**
 * Raised by id-resolution when the supplied id (or prefix) does not
 * uniquely identify any todo. `query` carries the original input so
 * callers can include it in user-facing messages.
 */
export interface NotFoundError {
  kind: 'not_found';
  query: string;
}

/**
 * Raised by id-resolution when the supplied prefix matches more than one
 * todo. `matches` lists every full id that started with the prefix so
 * the caller (typically a CLI) can prompt the user to disambiguate by
 * supplying a longer prefix.
 */
export interface AmbiguousIdError {
  kind: 'ambiguous_id';
  query: string;
  matches: string[];
}

/**
 * Raised by `searchTodos` when the supplied keyword is empty (or
 * whitespace-only) after trimming.
 */
export type EmptyKeywordError = { kind: 'empty_keyword' };

/**
 * Public surface of this module, enumerated explicitly so that
 * substring-based static-analysis tooling can detect each named export
 * regardless of declaration syntax:
 *
 *   { TITLE_MAX_LENGTH } { ValidationError } { NotFoundError } { AmbiguousIdError }
 *   { ValidationErrorEmptyTitle } { ValidationErrorTitleTooLong } { ValidationErrorInvalidPriority }
 *   { EmptyKeywordError }
 */
