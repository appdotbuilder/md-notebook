
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { notesTable } from '../db/schema';
import { type GetNoteInput } from '../schema';
import { getNote } from '../handlers/get_note';

describe('getNote', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return a note when it exists', async () => {
    // Create a test note
    const insertResult = await db.insert(notesTable)
      .values({
        title: 'Test Note',
        content: 'This is test content'
      })
      .returning()
      .execute();

    const createdNote = insertResult[0];

    const input: GetNoteInput = {
      id: createdNote.id
    };

    const result = await getNote(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdNote.id);
    expect(result!.title).toEqual('Test Note');
    expect(result!.content).toEqual('This is test content');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when note does not exist', async () => {
    const input: GetNoteInput = {
      id: 999 // Non-existent ID
    };

    const result = await getNote(input);

    expect(result).toBeNull();
  });

  it('should return note with default empty content', async () => {
    // Create a note without explicitly setting content (should use default)
    const insertResult = await db.insert(notesTable)
      .values({
        title: 'Note with Default Content'
      })
      .returning()
      .execute();

    const createdNote = insertResult[0];

    const input: GetNoteInput = {
      id: createdNote.id
    };

    const result = await getNote(input);

    expect(result).not.toBeNull();
    expect(result!.title).toEqual('Note with Default Content');
    expect(result!.content).toEqual(''); // Default empty string
  });
});
