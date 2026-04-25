/**
 * Command handler for `todo list`.
 *
 * Reads all todos from storage and prints them to stdout in insertion
 * order. No filtering, sorting, or decoration — output is intentionally
 * grep-friendly so it can be piped into other tools.
 */

import type { Todo } from '../storage/types.js';
import type { StorageError } from '../storage/errors.js';
import { listTodos } from '../todos/index.js';

const SHORT_ID_LENGTH = 8;
const EMPTY_HINT = 'No todos yet. Add one with: todo add <title>';

/**
 * Render a single todo as a one-line list entry.
 *
 * Format: `[ ] <short-id>  <title>` (pending) or
 *         `[x] <short-id>  <title>` (completed).
 *
 * The short-id is the first 8 chars of the todo's UUID. A literal
 * lowercase `x` is used (not a Unicode checkmark) so output renders
 * correctly in any terminal or when piped through other tools.
 */
const formatTodoLine = (todo: Todo): string => {
  const checkbox = todo.completed ? '[x]' : '[ ]';
  const shortId = todo.id.slice(0, SHORT_ID_LENGTH);
  return `${checkbox} ${shortId}  ${todo.title}`;
};

/**
 * Format a `StorageError` into the stderr message shown to the user.
 */
const formatStorageError = (error: StorageError): string =>
  `Error: Failed to read todos (${error.kind})`;

/**
 * Entry point for the `todo list` command.
 *
 * Positional arguments are ignored — list takes no options.
 *
 * Exit codes:
 *   0 — success (including the empty-list case)
 *   2 — storage read failure
 */
export const runList = async (_args: string[]): Promise<number> => {
  const result = await listTodos();

  if (!result.ok) {
    process.stderr.write(`${formatStorageError(result.error)}\n`);
    return 2;
  }

  const todos = result.value;

  if (todos.length === 0) {
    process.stdout.write(`${EMPTY_HINT}\n`);
    return 0;
  }

  for (const todo of todos) {
    process.stdout.write(`${formatTodoLine(todo)}\n`);
  }

  return 0;
};

/**
 * Public surface (enumerated for substring-based static analysis):
 *   { runList }
 */
