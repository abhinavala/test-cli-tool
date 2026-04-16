/**
 * CLI command handler for `todo delete <id-or-prefix>`.
 *
 * Takes the first positional argument and deletes the matching todo via
 * `deleteTodo`, which performs short-id prefix resolution internally.
 * There is no confirmation prompt — CLI convention is that typing the
 * command is itself the confirmation, and misdeletions are recoverable
 * by re-adding.
 *
 * Exit codes:
 *   0 — success
 *   1 — user error (missing id, not found, ambiguous prefix)
 *   2 — storage failure
 */

import { deleteTodo } from '../todos/index.js';
import type { AmbiguousIdError, NotFoundError } from '../todos/index.js';
import type { StorageError } from '../storage/index.js';

export const runDelete = async (args: string[]): Promise<number> => {
  const idOrPrefix = args[0];
  if (idOrPrefix === undefined) {
    console.error('Error: Missing todo id. Usage: todo delete <id>');
    return 1;
  }

  const result = await deleteTodo(idOrPrefix);

  if (result.ok) {
    console.log(`✓ Deleted: ${result.value.title}`);
    return 0;
  }

  const error: NotFoundError | AmbiguousIdError | StorageError = result.error;

  if (error.kind === 'not_found') {
    console.error(`Error: No todo found matching "${error.query}"`);
    return 1;
  }

  if (error.kind === 'ambiguous_id') {
    const matchList = error.matches.map((id) => `  ${id}`).join('\n');
    console.error(
      `Error: "${error.query}" matches multiple todos:\n${matchList}\nUse a longer prefix.`,
    );
    return 1;
  }

  // Remaining variants are all StorageError kinds.
  console.error(`Error: Failed to delete todo (${error.kind})`);
  return 2;
};
