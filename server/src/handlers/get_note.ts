
import { db } from '../db';
import { notesTable } from '../db/schema';
import { type GetNoteInput, type Note } from '../schema';
import { eq } from 'drizzle-orm';

export const getNote = async (input: GetNoteInput): Promise<Note | null> => {
  try {
    const result = await db.select()
      .from(notesTable)
      .where(eq(notesTable.id, input.id))
      .execute();

    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error('Get note failed:', error);
    throw error;
  }
};
