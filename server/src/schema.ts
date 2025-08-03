
import { z } from 'zod';

// Note schema
export const noteSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Note = z.infer<typeof noteSchema>;

// Input schema for creating notes
export const createNoteInputSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().default('')
});

export type CreateNoteInput = z.infer<typeof createNoteInputSchema>;

// Input schema for updating notes
export const updateNoteInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1, 'Title is required').optional(),
  content: z.string().optional()
});

export type UpdateNoteInput = z.infer<typeof updateNoteInputSchema>;

// Input schema for getting a single note
export const getNoteInputSchema = z.object({
  id: z.number()
});

export type GetNoteInput = z.infer<typeof getNoteInputSchema>;

// Input schema for deleting a note
export const deleteNoteInputSchema = z.object({
  id: z.number()
});

export type DeleteNoteInput = z.infer<typeof deleteNoteInputSchema>;
