import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { Role } from '../validators/auth.validator';

/**
 * Middleware factory to authorize requests based on user roles.
 * @param roles - The allowed roles.
 */
export default function authorizeRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError('You do not have permission to perform this action', 403);
    }

    next();
  };
}
