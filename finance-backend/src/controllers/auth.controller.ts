import { Request, Response } from 'express';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import * as authService from '../services/auth.service';
import { AppError } from '../utils/AppError';

/**
 * Handles user registration by validating the request body and calling the auth service.
 */
export async function register(req: Request, res: Response) {
  const data = registerSchema.parse(req.body);
  const user = await authService.registerUser(data);

  res.status(201).json({
    status: 'success',
    data: { user },
  });
}

/**
 * Handles user login by validating credentials and returning a token.
 */
export async function login(req: Request, res: Response) {
  const data = loginSchema.parse(req.body);
  const { user, token } = await authService.loginUser(data);

  res.status(200).json({
    status: 'success',
    data: { user, token },
  });
}

/**
 * Retrieves the profile of the currently authenticated user.
 */
export async function getMe(req: Request, res: Response) {
  if (!req.user || !req.user.id) {
    throw new AppError('Authentication required', 401);
  }

  const user = await authService.getMe(req.user.id);

  res.status(200).json({
    status: 'success',
    data: { user },
  });
}
