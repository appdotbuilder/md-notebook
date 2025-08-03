
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { notesTable } from '../db/schema';
import { getNotes } from '../handlers/get_notes';

describe('getNotes', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no notes exist', async () => {
    const result = await getNotes();
    expect(result).toEqual([]);
  });

  it('should return all notes', async () => {
    // Create test notes
    await db.insert(notesTable)
      .values([
        { title: 'First Note', content: 'First content' },
        { title: 'Second Note', content: 'Second content' }
      ])
      .execute();

    const result = await getNotes();

    expect(result).toHaveLength(2);
    expect(result[0].title).toBeDefined();
    expect(result[0].content).toBeDefined();
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
  });

  it('should return notes ordered by updated_at descending', async () => {
    // Create first note
    const firstNote = await db.insert(notesTable)
      .values({ title: 'First Note', content: 'First content' })
      .returning()
      .execute();

    // Wait a moment to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    // Create second note (will have later updated_at)
    const secondNote = await db.insert(notesTable)
      .values({ title: 'Second Note', content: 'Second content' })
      .returning()
      .execute();

    const result = await getNotes();

    expect(result).toHaveLength(2);
    // Most recently updated should be first
    expect(result[0].id).toEqual(secondNote[0].id);
    expect(result[1].id).toEqual(firstNote[0].id);
    expect(result[0].updated_at >= result[1].updated_at).toBe(true);
  });
});
