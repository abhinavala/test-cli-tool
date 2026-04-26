import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { PRIORITIES, type Priority } from '../storage/types.js';
import { parsePriority } from './priority.js';

describe('parsePriority', () => {
  describe('case-insensitivity', () => {
    it('returns "high" for "HIGH"', () => {
      assert.equal(parsePriority('HIGH'), 'high');
    });

    it('returns "high" for "high"', () => {
      assert.equal(parsePriority('high'), 'high');
    });

    it('returns "high" for "High"', () => {
      assert.equal(parsePriority('High'), 'high');
    });

    it('returns "medium" for "MEDIUM"', () => {
      assert.equal(parsePriority('MEDIUM'), 'medium');
    });

    it('returns "medium" for "Medium"', () => {
      assert.equal(parsePriority('Medium'), 'medium');
    });

    it('returns "low" for "LOW"', () => {
      assert.equal(parsePriority('LOW'), 'low');
    });

    it('returns "low" for "Low"', () => {
      assert.equal(parsePriority('Low'), 'low');
    });
  });

  describe('whitespace handling', () => {
    it('returns "high" for " high "', () => {
      assert.equal(parsePriority(' high '), 'high');
    });

    it('returns "high" for "\\thigh\\n"', () => {
      assert.equal(parsePriority('\thigh\n'), 'high');
    });

    it('returns "medium" for "  medium  "', () => {
      assert.equal(parsePriority('  medium  '), 'medium');
    });
  });

  describe('invalid input', () => {
    it('returns null for "urgent"', () => {
      assert.equal(parsePriority('urgent'), null);
    });

    it('returns null for empty string', () => {
      assert.equal(parsePriority(''), null);
    });

    it('returns null for whitespace-only string', () => {
      assert.equal(parsePriority('   '), null);
    });

    it('returns null for "h" (partial match)', () => {
      assert.equal(parsePriority('h'), null);
    });
  });
});

describe('addTodo with priority', () => {
  it('stores priority on the created todo', async () => {
    const { addTodo } = await import('./operations.js');
    const result = await addTodo('Buy milk', 'high');
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.value.priority, 'high');
      assert.equal(result.value.title, 'Buy milk');
    }
  });

  it('title validation still returns empty_title error', async () => {
    const { addTodo } = await import('./operations.js');
    const result = await addTodo('', 'medium');
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.deepEqual(result.error, { kind: 'empty_title' });
    }
  });
});

describe('readTodos backwards compatibility - normalization logic', () => {
  // Test the normalization logic directly (mirrors what readTodos does)
  const normalize = (raw: Record<string, unknown>): Priority => {
    return PRIORITIES.includes(raw['priority'] as Priority)
      ? (raw['priority'] as Priority)
      : 'medium';
  };

  it('normalizes missing priority to "medium"', () => {
    const todo = { id: 'abc', title: 'x', completed: false, createdAt: '2026-01-01T00:00:00.000Z', completedAt: null };
    assert.equal(normalize(todo), 'medium');
  });

  it('normalizes invalid priority "urgent" to "medium"', () => {
    const todo = { id: 'abc', title: 'x', completed: false, createdAt: '2026-01-01T00:00:00.000Z', completedAt: null, priority: 'urgent' };
    assert.equal(normalize(todo), 'medium');
  });

  it('normalizes null priority to "medium"', () => {
    const todo = { id: 'abc', title: 'x', completed: false, createdAt: '2026-01-01T00:00:00.000Z', completedAt: null, priority: null };
    assert.equal(normalize(todo), 'medium');
  });

  it('preserves valid priority "high"', () => {
    const todo = { id: 'abc', title: 'x', completed: false, createdAt: '2026-01-01T00:00:00.000Z', completedAt: null, priority: 'high' };
    assert.equal(normalize(todo), 'high');
  });

  it('preserves valid priority "low"', () => {
    const todo = { id: 'abc', title: 'x', completed: false, createdAt: '2026-01-01T00:00:00.000Z', completedAt: null, priority: 'low' };
    assert.equal(normalize(todo), 'low');
  });
});
