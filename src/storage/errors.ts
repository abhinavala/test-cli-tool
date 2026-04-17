/**
 * Storage-layer error types.
 *
 * `StorageError` is a discriminated union keyed on `kind`. Each variant
 * carries the original underlying error in `cause` (typed as `unknown`
 * because the source may be a Node.js error, a SyntaxError from JSON
 * parsing, or anything else).
 */

export type ReadFailed = { kind: 'read_failed'; cause: unknown };
export type WriteFailed = { kind: 'write_failed'; cause: unknown };
export type ParseFailed = { kind: 'parse_failed'; cause: unknown };
export type MkdirFailed = { kind: 'mkdir_failed'; cause: unknown };

export type StorageError =
  | ReadFailed
  | WriteFailed
  | ParseFailed
  | MkdirFailed;
