import { z } from 'zod';

export enum RecordType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export const createRecordSchema = z.object({
  amount: z.number().positive('Amount must be a positive number'),
  type: z.nativeEnum(RecordType, {
    errorMap: () => ({ message: 'Type must be INCOME or EXPENSE' }),
  }),
  category: z.string().min(2, 'Category must be at least 2 characters').max(50, 'Category must be at most 50 characters'),
  date: z.coerce.date({
    errorMap: () => ({ message: 'Invalid date format' }),
  }),
  notes: z.string().max(200, 'Notes must be at most 200 characters').optional(),
});

export const updateRecordSchema = createRecordSchema.partial();

export const recordFilterSchema = z.object({
  type: z.nativeEnum(RecordType).optional(),
  category: z.string().optional(),
  search: z
    .string()
    .max(100)
    .optional()
    .transform((s) => (s && s.trim() ? s.trim() : undefined)),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export type CreateRecordInput = z.infer<typeof createRecordSchema>;
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>;
export type RecordFilterInput = z.infer<typeof recordFilterSchema>;
