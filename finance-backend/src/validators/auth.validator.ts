import { z } from 'zod';

// Keep a local Role enum for auth typing across middleware/services.
export enum Role {
  ADMIN = 'ADMIN',
  ANALYST = 'ANALYST',
  VIEWER = 'VIEWER',
}

/**
 * Zod schema for validating user registration input.
 */
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be at most 50 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter (A-Z)")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter (a-z)")
    .regex(/[0-9]/, "Password must contain at least one number (0-9)")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character (e.g. @, #, $)"),
});

/**
 * Zod schema for validating user login input.
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password cannot be empty"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
