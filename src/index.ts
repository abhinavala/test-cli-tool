#!/usr/bin/env node
import { runAdd } from './commands/add.js';
import { runList } from './commands/list.js';
import { runComplete } from './commands/complete.js';
import { runDelete } from './commands/delete.js';

const USAGE = `Usage: todo <command> [args]

Commands:
  add <title>         Add a new todo
  list                List all todos
  complete <id>       Mark a todo as complete
  delete <id>         Delete a todo

Ids can be full UUIDs or unique prefixes of 3+ characters.
`;

export async function main(argv: string[]): Promise<number> {
  if (argv.length === 0 || argv[0] === '--help' || argv[0] === '-h') {
    process.stdout.write(USAGE);
    return 0;
  }

  const command = argv[0];
  const rest = argv.slice(1);

  switch (command) {
    case 'add':
      return runAdd(rest);
    case 'list':
      return runList(rest);
    case 'complete':
      return runComplete(rest);
    case 'delete':
      return runDelete(rest);
    default:
      process.stderr.write(`Error: Unknown command '${command}'\n`);
      process.stderr.write(USAGE);
      return 1;
  }
}

(async () => {
  try {
    process.exitCode = await main(process.argv.slice(2));
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exitCode = 2;
  }
})();
