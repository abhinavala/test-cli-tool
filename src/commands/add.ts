import { addTodo } from '../core/todos';

export async function runAdd(args: string[]): Promise<number> {
  const title = args.join(' ');
  const result = await addTodo(title);

  if (result.ok) {
    const shortId = result.value.id.slice(0, 8);
    process.stdout.write(`✓ Added: ${result.value.title} (${shortId})\n`);
    return 0;
  }

  const error = result.error;

  switch (error.kind) {
    case 'empty_title':
      process.stderr.write('Error: Title cannot be empty\n');
      return 1;
    case 'title_too_long':
      process.stderr.write(
        `Error: Title must be 500 characters or fewer (got ${title.length})\n`,
      );
      return 1;
    default:
      process.stderr.write(`Error: Failed to save todo (${error.kind})\n`);
      return 2;
  }
}
