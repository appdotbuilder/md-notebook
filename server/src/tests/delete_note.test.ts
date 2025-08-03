
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { notesTable } from '../db/schema';
import { type DeleteNoteInput } from '../schema';
import { deleteNote } from '../handlers/delete_note';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: DeleteNoteInput = {
  id: 1
};

describe('deleteNote', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing note successfully', async () => {
    // Create a test note first
    const insertResult = await db.insert(notesTable)
      .values({
        title: 'Test Note',
        content: 'This note will be deleted'
      })
      .returning()
      .execute();

    const createdNote = insertResult[0];

    // Delete the note
    const result = await deleteNote({ id: createdNote.id });

    // Should return success: true
    expect(result.success).toBe(true);

    // Verify note is actually deleted from database
    const notes = await db.select()
      .from(notesTable)
      .where(eq(notesTable.id, createdNote.id))
      .execute();

    expect(notes).toHaveLength(0);
  });

  it('should return success: false for non-existent note', async () => {
    // Try to delete a note that doesn't exist
    const result = await deleteNote({ id: 999 });

    // Should return success: false
    expect(result.success).toBe(false);
  });

  it('should not affect other notes when deleting one', async () => {
    // Create multiple test notes
    const insertResult = await db.insert(notesTable)
      .values([
        { title: 'Note 1', content: 'First note' },
        { title: 'Note 2', content: 'Second note' },
        { title: 'Note 3', content: 'Third note' }
      ])
      .returning()
      .execute();

    const noteToDelete = insertResult[1]; // Delete the second note

    // Delete one note
    const result = await deleteNote({ id: noteToDelete.id });

    expect(result.success).toBe(true);

    // Verify only the targeted note was deleted
    const remainingNotes = await db.select()
      .from(notesTable)
      .execute();

    expect(remainingNotes).toHaveLength(2);
    expect(remainingNotes.find(note => note.id === noteToDelete.id)).toBeUndefined();
    expect(remainingNotes.find(note => note.id === insertResult[0].id)).toBeDefined();
    expect(remainingNotes.find(note => note.id === insertResult[2].id)).toBeDefined();
  });
});
