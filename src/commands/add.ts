import { addTodo } from '../todos/index.js';
import type { ValidationError } from '../todos/index.js';
import type { StorageError } from '../storage/index.js';

export async function runAdd(args: string[]): Promise<number> {
  const title = args.join(' ');
  const result = await addTodo(title);

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
