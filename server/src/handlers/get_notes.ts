
import { db } from '../db';
import { notesTable } from '../db/schema';
import { type Note } from '../schema';
import { desc } from 'drizzle-orm';

export const getNotes = async (): Promise<Note[]> => {
  try {
    const results = await db.select()
      .from(notesTable)
      .orderBy(desc(notesTable.updated_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Get notes failed:', error);
    throw error;
  }
};
