import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RegisterInput, LoginInput, Role } from '../validators/auth.validator';
import { AppError } from '../utils/AppError';
import { config } from '../config/env';

const prisma = new PrismaClient();

/**
 * Registers a new user with the provided data.
 * @param data - Registration values
 * @returns The created user (omitting the password)
 */
export async function registerUser(data: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new AppError('Email already in use', 409);
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: Role.VIEWER,
    },
  });

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Logs in an existing user and provides a JWT token.
 * @param data - Login values
 * @returns The authenticated user (omitting the password) and JWT token
 */
export async function loginUser(data: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new AppError('Incorrect email or password. Please enter the correct password and try again.', 401);
  }

  if (user.status === 'INACTIVE') {
    throw new AppError('Your account has been deactivated', 403);
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Incorrect email or password. Please enter the correct password and try again.', 401);
  }

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role as Role,
  };

  const token = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as any,
  });

  const { password, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token,
  };
}

/**
 * Retrieves the currently authenticated user by ID.
 * @param userId - ID of the user
 * @returns The user (omitting the password)
 */
export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Loads the user from the database and ensures the account is active.
 * Used after JWT verification so role changes and deactivation take effect immediately.
 */
export async function resolveSessionUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true, status: true },
  });

  if (!user) {
    throw new AppError('User not found', 401);
  }

  if (user.status !== 'ACTIVE') {
    throw new AppError('Your account has been deactivated', 403);
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role as Role,
  };
}
