
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { notesTable } from '../db/schema';
import { type UpdateNoteInput } from '../schema';
import { updateNote } from '../handlers/update_note';
import { eq } from 'drizzle-orm';

describe('updateNote', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Helper to create a test note
  const createTestNote = async () => {
    const result = await db.insert(notesTable)
      .values({
        title: 'Original Title',
        content: 'Original content'
      })
      .returning()
      .execute();
    return result[0];
  };

  it('should update note title only', async () => {
    const testNote = await createTestNote();
    const originalUpdatedAt = testNote.updated_at;

    // Wait a moment to ensure updated_at changes
    await new Promise(resolve => setTimeout(resolve, 10));

    const input: UpdateNoteInput = {
      id: testNote.id,
      title: 'Updated Title'
    };

    const result = await updateNote(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(testNote.id);
    expect(result!.title).toEqual('Updated Title');
    expect(result!.content).toEqual('Original content'); // Should remain unchanged
    expect(result!.created_at).toEqual(testNote.created_at);
    expect(result!.updated_at).not.toEqual(originalUpdatedAt);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should update note content only', async () => {
    const testNote = await createTestNote();
    const originalUpdatedAt = testNote.updated_at;

    // Wait a moment to ensure updated_at changes
    await new Promise(resolve => setTimeout(resolve, 10));

    const input: UpdateNoteInput = {
      id: testNote.id,
      content: 'Updated content'
    };

    const result = await updateNote(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(testNote.id);
    expect(result!.title).toEqual('Original Title'); // Should remain unchanged
    expect(result!.content).toEqual('Updated content');
    expect(result!.created_at).toEqual(testNote.created_at);
    expect(result!.updated_at).not.toEqual(originalUpdatedAt);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should update both title and content', async () => {
    const testNote = await createTestNote();
    const originalUpdatedAt = testNote.updated_at;

    // Wait a moment to ensure updated_at changes
    await new Promise(resolve => setTimeout(resolve, 10));

    const input: UpdateNoteInput = {
      id: testNote.id,
      title: 'Updated Title',
      content: 'Updated content'
    };

    const result = await updateNote(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(testNote.id);
    expect(result!.title).toEqual('Updated Title');
    expect(result!.content).toEqual('Updated content');
    expect(result!.created_at).toEqual(testNote.created_at);
    expect(result!.updated_at).not.toEqual(originalUpdatedAt);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should save changes to database', async () => {
    const testNote = await createTestNote();

    const input: UpdateNoteInput = {
      id: testNote.id,
      title: 'Database Test Title',
      content: 'Database test content'
    };

    await updateNote(input);

    // Verify changes are persisted in database
    const notes = await db.select()
      .from(notesTable)
      .where(eq(notesTable.id, testNote.id))
      .execute();

    expect(notes).toHaveLength(1);
    expect(notes[0].title).toEqual('Database Test Title');
    expect(notes[0].content).toEqual('Database test content');
    expect(notes[0].updated_at).not.toEqual(testNote.updated_at);
  });

  it('should return null for non-existent note', async () => {
    const input: UpdateNoteInput = {
      id: 999999, // Non-existent ID
      title: 'Updated Title'
    };

    const result = await updateNote(input);

    expect(result).toBeNull();
  });

  it('should update only updated_at when no other fields provided', async () => {
    const testNote = await createTestNote();
    const originalUpdatedAt = testNote.updated_at;

    // Wait a moment to ensure updated_at changes
    await new Promise(resolve => setTimeout(resolve, 10));

    const input: UpdateNoteInput = {
      id: testNote.id
    };

    const result = await updateNote(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(testNote.id);
    expect(result!.title).toEqual('Original Title'); // Should remain unchanged
    expect(result!.content).toEqual('Original content'); // Should remain unchanged
    expect(result!.created_at).toEqual(testNote.created_at);
    expect(result!.updated_at).not.toEqual(originalUpdatedAt);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });
});
