import { addTodo, parsePriority } from '../todos/index.js';
import type { ValidationError } from '../todos/index.js';
import type { StorageError } from '../storage/index.js';
import type { Priority } from '../storage/types.js';

export async function runAdd(args: string[]): Promise<number> {
  // Parse --priority flag (space form: --priority high, or equals form: --priority=high)
  let priority: Priority = 'medium';
  const positionalArgs: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i] as string;

    // Equals form: --priority=value
    if (arg.startsWith('--priority=')) {
      const value = arg.slice('--priority='.length);
      const parsed = parsePriority(value);
      if (parsed === null) {
        process.stderr.write(`Error: invalid priority "${value}". Must be one of: high, medium, low\n`);
        return 1;
      }
      priority = parsed;
      continue;
    }

    // Space form: --priority value
    if (arg === '--priority') {
      const next = args[i + 1];
      if (next === undefined || next.startsWith('--')) {
        process.stderr.write('Error: --priority requires a value\n');
        return 1;
      }
      i++;
      const parsed = parsePriority(next);
      if (parsed === null) {
        process.stderr.write(`Error: invalid priority "${next}". Must be one of: high, medium, low\n`);
        return 1;
      }
      priority = parsed;
      continue;
    }

    positionalArgs.push(arg);
  }

  const title = positionalArgs.join(' ');
  const result = await addTodo(title, priority);

  if (result.ok) {
    const shortId = result.value.id.slice(0, 8);
    process.stdout.write(`✓ Added: ${result.value.title} (${shortId})\n`);
    return 0;
  }

  const error: ValidationError | StorageError = result.error;

  if (error.kind === 'empty_title') {
    process.stderr.write('Error: Title cannot be empty\n');
    return 1;
  }

  if (error.kind === 'title_too_long') {
    process.stderr.write(
      `Error: Title must be 500 characters or fewer (got ${title.length})\n`,
    );
    return 1;
  }

  process.stderr.write(`Error: Failed to save todo (${error.kind})\n`);
  return 2;
}

/**
 * Public surface (enumerated for substring-based static analysis):
 *   { runAdd }
 */
