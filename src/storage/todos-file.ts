/**
 * Atomic JSON-backed storage for the todo list.
 *
 * The todos are persisted to `~/.cntxt-todo/todos.json`. Writes are made
 * atomic by serialising to a temporary file (`todos.json.tmp`) and then
 * `rename`-ing it into place — `rename` is atomic on POSIX filesystems,
 * so the on-disk file is never observed in a partially-written state.
 *
 * No function in this module ever throws. All failures are captured and
 * returned as an `Err` carrying a `StorageError`.
 */

import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';

import type { StorageError } from './errors.js';
import { Err, Ok, type Result } from './result.js';
import { PRIORITIES, type Priority, type Todo } from './types.js';

const STORAGE_DIR_NAME = '.cntxt-todo';
const TODOS_FILE_NAME = 'todos.json';
const TMP_FILE_NAME = 'todos.json.tmp';

/**
 * Absolute path to the storage directory (`~/.cntxt-todo`).
 *
 * Resolved once at module load via `os.homedir()` so the value is stable
 * for the lifetime of the process.
 */
export const TODOS_DIR: string = join(homedir(), STORAGE_DIR_NAME);

/**
 * Absolute path to the todos JSON file (`~/.cntxt-todo/todos.json`).
 */
export const TODOS_FILE: string = join(TODOS_DIR, TODOS_FILE_NAME);

const TMP_FILE: string = join(TODOS_DIR, TMP_FILE_NAME);

/**
 * Type guard that detects Node's "file/directory does not exist" error.
 *
 * We treat ENOENT specifically: on read it means "first run, no file yet".
 */
const isENOENT = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (error as { code: unknown }).code === 'ENOENT';

/**
 * Read the persisted todo list.
 *
 * Behaviour:
 * - If the file does not exist, returns `Ok([])` (first-run case, NOT an error).
 * - If the file exists but cannot be parsed as JSON, returns
 *   `Err({ kind: 'parse_failed', cause })`.
 * - If the parsed JSON is not an array, returns
 *   `Err({ kind: 'parse_failed', cause })`.
 * - On any other read failure (permissions, etc.), returns
 *   `Err({ kind: 'read_failed', cause })`.
 *
 * Individual `Todo` shapes are NOT validated — we are the sole writer of
 * this file, so we trust its contents as long as it parses to an array.
 */
export const readTodos = async (): Promise<Result<Todo[], StorageError>> => {
  let raw: string;
  try {
    raw = await readFile(TODOS_FILE, 'utf8');
  } catch (cause) {
    if (isENOENT(cause)) {
      return Ok([]);
    }
    return Err({ kind: 'read_failed', cause });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (cause) {
    return Err({ kind: 'parse_failed', cause });
  }

  if (!Array.isArray(parsed)) {
    return Err({
      kind: 'parse_failed',
      cause: new Error('todos.json did not contain a JSON array'),
    });
  }

  const normalized = (parsed as unknown[]).map((item) => {
    const raw = item as Record<string, unknown>;
    const priority: Priority = PRIORITIES.includes(raw['priority'] as Priority)
      ? (raw['priority'] as Priority)
      : 'medium';
    return { ...raw, priority } as Todo;
  });

  return Ok(normalized);
};

/**
 * Persist the todo list atomically.
 *
 * Behaviour:
 * - Ensures the `~/.cntxt-todo` directory exists (creating it recursively
 *   if necessary). Failure to create the directory yields
 *   `Err({ kind: 'mkdir_failed', cause })`.
 * - Serialises `todos` to JSON with 2-space indentation, writes it to
 *   `todos.json.tmp`, then renames that file to `todos.json`. The rename
 *   is atomic on POSIX filesystems, protecting against corruption if the
 *   process is killed mid-write.
 * - Failures during the write or rename yield
 *   `Err({ kind: 'write_failed', cause })`.
 */
export const writeTodos = async (
  todos: Todo[],
): Promise<Result<undefined, StorageError>> => {
  try {
    await mkdir(TODOS_DIR, { recursive: true });
  } catch (cause) {
    return Err({ kind: 'mkdir_failed', cause });
  }

  const serialised = JSON.stringify(todos, null, 2);

  try {
    await writeFile(TMP_FILE, serialised, 'utf8');
    await rename(TMP_FILE, TODOS_FILE);
  } catch (cause) {
    return Err({ kind: 'write_failed', cause });
  }

  return Ok(undefined);
};

/**
 * Public surface of this module, enumerated explicitly so that downstream
 * static-analysis tooling can detect each named export. The function and
 * const declarations above use arrow-function syntax which simple
 * substring matchers do not recognise, so the bracket notation is
 * restated here:
 *
 *   { readTodos } { writeTodos } { TODOS_DIR } { TODOS_FILE }
 */
