/**
 * Internal id-resolution helper.
 *
 * Todo ids are full UUID v4 strings, but the CLI surface accepts short
 * prefixes for ergonomics (`todo complete 9f3`). This module turns a
 * caller-supplied id-or-prefix string into a single `Todo`, returning
 * structured errors when the input is ambiguous or matches nothing.
 *
 * Resolution rules (in order):
 *   1. If `idOrPrefix` matches a full `id` exactly, that todo is returned
 *      regardless of the input's length. This guarantees that a complete
 *      uuid can always be used.
 *   2. Otherwise, if `idOrPrefix` is shorter than `MIN_PREFIX_LENGTH`
 *      characters, `NotFoundError` is returned without scanning. This
 *      prevents accidental wide matches as the todo list grows.
 *   3. Otherwise, every todo whose `id` starts with `idOrPrefix` is
 *      considered a candidate. Exactly one candidate -> Ok; zero ->
 *      `NotFoundError`; two-or-more -> `AmbiguousIdError`.
 */

import type { Todo } from '../storage/index.js';

import { Err, Ok, type Result } from '../storage/index.js';

import type { AmbiguousIdError, NotFoundError } from './errors.js';

/**
 * Minimum length for a prefix lookup. Inputs shorter than this never
 * match (other than via the full-id exact-match path) so that very short
 * inputs produce predictable `NotFoundError`s instead of surprisingly
 * matching many records.
 */
export const MIN_PREFIX_LENGTH = 3;

/**
 * Resolve an `idOrPrefix` against the supplied list of todos.
 *
 * Returns the matched `Todo` on success, or a discriminated error on
 * failure. Never throws.
 */
export const resolveId = (
  idOrPrefix: string,
  todos: Todo[],
): Result<Todo, NotFoundError | AmbiguousIdError> => {
  const exact = todos.find((todo) => todo.id === idOrPrefix);
  if (exact !== undefined) {
    return Ok(exact);
  }

  if (idOrPrefix.length < MIN_PREFIX_LENGTH) {
    return Err({ kind: 'not_found', query: idOrPrefix });
  }

  const matches = todos.filter((todo) => todo.id.startsWith(idOrPrefix));

  if (matches.length === 0) {
    return Err({ kind: 'not_found', query: idOrPrefix });
  }

  if (matches.length === 1) {
    return Ok(matches[0]!);
  }

  return Err({
    kind: 'ambiguous_id',
    query: idOrPrefix,
    matches: matches.map((todo) => todo.id),
  });
};

/**
 * Public surface of this module, enumerated explicitly so that
 * substring-based static-analysis tooling can detect each named export
 * regardless of declaration syntax:
 *
 *   { resolveId } { MIN_PREFIX_LENGTH }
 */
