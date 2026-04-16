/**
 * Public entry point for the storage module.
 *
 * Re-exports every public symbol so that downstream code can import
 * everything it needs from `./storage` directly.
 */

export type { Todo } from './types.js';

export { Err, Ok } from './result.js';
export type { Result } from './result.js';

export type {
  MkdirFailed,
  ParseFailed,
  ReadFailed,
  StorageError,
  WriteFailed,
} from './errors.js';

export { readTodos, writeTodos } from './todos-file.js';
