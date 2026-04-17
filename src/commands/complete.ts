/**
 * CLI command handler for `todo complete <id-or-prefix>`.
 *
 * Takes the first positional argument and marks the matching todo complete
 * via `completeTodo`, which performs short-id prefix resolution internally.
 * `completeTodo` is idempotent — re-completing an already-completed todo is
 * treated as success here, matching the core-layer semantics.
 *
 * Exit codes:
 *   0 — success
 *   1 — user error (missing id, not found, ambiguous prefix)
 *   2 — storage failure
 */

import { completeTodo } from '../todos/index.js';
import type { AmbiguousIdError, NotFoundError } from '../todos/index.js';
import type { StorageError } from '../storage/index.js';

export const runComplete = async (args: string[]): Promise<number> => {
  const idOrPrefix = args[0];
  if (idOrPrefix === undefined) {
    console.error('Error: Missing todo id. Usage: todo complete <id>');
    return 1;
  }

  const result = await completeTodo(idOrPrefix);

  if (result.ok) {
    console.log(`✓ Completed: ${result.value.title}`);
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
  console.error(`Error: Failed to update todo (${error.kind})`);
  return 2;
};

/**
 * Public surface (enumerated for substring-based static analysis):
 *   { runComplete }
 */
