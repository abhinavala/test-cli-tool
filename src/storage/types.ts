/**
 * Core domain types for the cntxt-todo data layer.
 *
 * Dates are kept as ISO 8601 strings (not Date objects) so the data is
 * JSON-safe with no revival step required on read.
 */

/**
 * A single todo item.
 *
 * - `id`: full UUID v4 string identifying the todo.
 * - `title`: the human-readable title supplied by the user.
 * - `completed`: whether the todo has been marked done.
 * - `createdAt`: ISO 8601 timestamp of when the todo was created.
 * - `completedAt`: ISO 8601 timestamp of when it was completed, or `null`
 *   if the todo has not yet been completed.
 */
export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
}
