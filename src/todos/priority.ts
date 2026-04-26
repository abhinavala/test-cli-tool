import { PRIORITIES, type Priority } from '../storage/types.js';

/**
 * Parse a user-supplied string into a `Priority`.
 *
 * Trims leading/trailing whitespace, lowercases the input, then checks
 * membership in `PRIORITIES`. Returns the matched `Priority` on success,
 * or `null` when the input is empty, whitespace-only, or not a valid priority.
 *
 * This is a pure function with no I/O.
 */
export const parsePriority = (input: string): Priority | null => {
  const trimmed = input.trim().toLowerCase();
  if (PRIORITIES.includes(trimmed as Priority)) {
    return trimmed as Priority;
  }
  return null;
};

/**
 *   { parsePriority }
 */
