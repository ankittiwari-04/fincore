import { z } from 'zod';
import { Role } from './auth.validator';

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export const updateRoleSchema = z.object({
  role: z.nativeEnum(Role, {
    errorMap: () => ({ message: 'Role must be ADMIN, ANALYST, or VIEWER' }),
  }),
});

export const updateStatusSchema = z.object({
  status: z.nativeEnum(Status, {
    errorMap: () => ({ message: 'Status must be ACTIVE or INACTIVE' }),
  }),
});

export const updateUserProfileSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be at most 50 characters').optional(),
    email: z.string().email('Invalid email format').optional(),
  })
  .refine((data) => data.name !== undefined || data.email !== undefined, {
    message: 'Provide at least one field to update: name or email',
  });

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
