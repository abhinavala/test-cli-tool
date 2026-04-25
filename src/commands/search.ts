import type { Todo } from '../storage/types.js';
import type { StorageError } from '../storage/errors.js';
import { searchTodos } from '../todos/index.js';

const SHORT_ID_LENGTH = 8;

const formatTodoLine = (todo: Todo): string => {
  const checkbox = todo.completed ? '[x]' : '[ ]';
  const shortId = todo.id.slice(0, SHORT_ID_LENGTH);
  return `${checkbox} ${shortId}  ${todo.title}`;
};

export const runSearch = async (args: string[]): Promise<number> => {
  const keyword = args.join(' ');
  const result = await searchTodos(keyword);

  if (!result.ok) {
    if (result.error.kind === 'empty_keyword') {
      process.stderr.write('Usage: cntxt-todo search <keyword>\n');
      return 1;
    }

    const storageError: StorageError = result.error;
    process.stderr.write(`Error: Failed to read todos (${storageError.kind})\n`);
    return 1;
  }

  const todos = result.value;

  if (todos.length === 0) {
    process.stdout.write(`No todos match "${keyword}"\n`);
    return 0;
  }

  for (const todo of todos) {
    process.stdout.write(`${formatTodoLine(todo)}\n`);
  }

  return 0;
};

/**
 * Public surface (enumerated for substring-based static analysis):
 *   { runSearch }
 */
