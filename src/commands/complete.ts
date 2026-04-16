import { completeTodo } from '../core/todos.js';

/**
 * Command handler for `todo complete <id-or-prefix>`.
 *
 * Reads the id/prefix from args[0] and delegates to the core
 * `completeTodo` function. Writes a user-friendly message to stdout/stderr
 * and returns an appropriate process exit code.
 *
 * Exit codes:
 *   0 — todo marked complete
 *   1 — user/input error (missing id, no match, ambiguous prefix)
 *   2 — storage I/O failure
 */
export async function runComplete(args: string[]): Promise<number> {
  if (args.length === 0) {
    process.stderr.write('Error: Missing todo id. Usage: todo complete <id>\n');
    return 1;
  }

  const idOrPrefix = args[0] as string;
  const result = await completeTodo(idOrPrefix);

  if (result.ok) {
    process.stdout.write(`\u2713 Completed: ${result.value.title}\n`);
    return 0;
  }

  const error = result.error;

  switch (error.type) {
    case 'NotFound': {
      process.stderr.write(`Error: No todo found matching "${idOrPrefix}"\n`);
      return 1;
    }
    case 'Ambiguous': {
      const idLines = error.matches.map((id) => `  ${id}`).join('\n');
      process.stderr.write(
        `Error: "${idOrPrefix}" matches multiple todos:\n${idLines}\nUse a longer prefix.\n`,
      );
      return 1;
    }
    case 'Storage': {
      process.stderr.write(`Error: Failed to update todo (${error.kind})\n`);
      return 2;
    }
  }
}
