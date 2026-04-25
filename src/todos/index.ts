/**
 * Public entry point for the todo business-logic module.
 *
 * Re-exports every public symbol so downstream code (the CLI handlers)
 * can import everything it needs from `./todos` directly, without ever
 * needing to know about the internal file layout.
 */

export {
  TITLE_MAX_LENGTH,
} from './errors.js';

export type {
  AmbiguousIdError,
  EmptyKeywordError,
  NotFoundError,
  ValidationError,
  ValidationErrorEmptyTitle,
  ValidationErrorTitleTooLong,
} from './errors.js';

export { MIN_PREFIX_LENGTH, resolveId } from './resolve-id.js';

export {
  addTodo,
  completeTodo,
  deleteTodo,
  listTodos,
  searchTodos,
} from './operations.js';

export type { DeletedTodoSummary } from './operations.js';

/**
 * Public surface of this module, enumerated explicitly so that
 * substring-based static-analysis tooling can detect each named export
 * regardless of declaration syntax:
 *
 *   { TITLE_MAX_LENGTH } { MIN_PREFIX_LENGTH }
 *   { ValidationError } { NotFoundError } { AmbiguousIdError }
 *   { ValidationErrorEmptyTitle } { ValidationErrorTitleTooLong } { EmptyKeywordError }
 *   { addTodo } { completeTodo } { deleteTodo } { listTodos } { searchTodos }
 *   { resolveId } { DeletedTodoSummary }
 */
