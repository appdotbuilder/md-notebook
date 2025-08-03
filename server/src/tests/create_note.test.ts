
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { notesTable } from '../db/schema';
import { type CreateNoteInput } from '../schema';
import { createNote } from '../handlers/create_note';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateNoteInput = {
  title: 'Test Note',
  content: 'This is a test note content'
};

describe('createNote', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a note', async () => {
    const result = await createNote(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Note');
    expect(result.content).toEqual('This is a test note content');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save note to database', async () => {
    const result = await createNote(testInput);

    // Query using proper drizzle syntax
    const notes = await db.select()
      .from(notesTable)
      .where(eq(notesTable.id, result.id))
      .execute();

    expect(notes).toHaveLength(1);
    expect(notes[0].title).toEqual('Test Note');
    expect(notes[0].content).toEqual('This is a test note content');
    expect(notes[0].created_at).toBeInstanceOf(Date);
    expect(notes[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create note with default empty content', async () => {
    const inputWithoutContent: CreateNoteInput = {
      title: 'Note Without Content',
      content: ''
    };

    const result = await createNote(inputWithoutContent);

    expect(result.title).toEqual('Note Without Content');
    expect(result.content).toEqual('');
    expect(result.id).toBeDefined();
  });

  it('should create multiple notes with unique IDs', async () => {
    const firstNote = await createNote({ title: 'First Note', content: 'First content' });
    const secondNote = await createNote({ title: 'Second Note', content: 'Second content' });

    expect(firstNote.id).not.toEqual(secondNote.id);
    expect(firstNote.title).toEqual('First Note');
    expect(secondNote.title).toEqual('Second Note');
  });
});
