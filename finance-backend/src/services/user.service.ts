import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { Role } from '../validators/auth.validator';
import { Status, UpdateUserProfileInput } from '../validators/user.validator';

const prisma = new PrismaClient();

export const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

export const updateUserRole = async (id: string, role: Role) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  return await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, email: true, name: true, role: true, status: true },
  });
};

export const updateUserStatus = async (id: string, status: Status) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  return await prisma.user.update({
    where: { id },
    data: { status },
    select: { id: true, email: true, name: true, role: true, status: true },
  });
};

export const updateUserProfile = async (id: string, data: UpdateUserProfileInput) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (data.email && data.email !== user.email) {
    const taken = await prisma.user.findUnique({ where: { email: data.email } });
    if (taken) {
      throw new AppError('Email already in use', 409);
    }
  }

  return await prisma.user.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email }),
    },
    select: { id: true, email: true, name: true, role: true, status: true, createdAt: true, updatedAt: true },
  });
};

export const deleteUser = async (id: string, currentUserId: string) => {
  if (id === currentUserId) {
    throw new AppError('Cannot delete yourself', 400);
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  await prisma.user.delete({ where: { id } });
};
