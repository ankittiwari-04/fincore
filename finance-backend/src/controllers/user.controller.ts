import { Request, Response } from 'express';
import * as userService from '../services/user.service';
import { updateRoleSchema, updateStatusSchema, updateUserProfileSchema } from '../validators/user.validator';

export const getAllUsers = async (req: Request, res: Response) => {
  const users = await userService.getAllUsers();
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users },
  });
};

export const getUserById = async (req: Request, res: Response) => {
  const user = await userService.getUserById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: { user },
  });
};

export const updateUserRole = async (req: Request, res: Response) => {
  const { role } = updateRoleSchema.parse(req.body);
  const user = await userService.updateUserRole(req.params.id, role);
  res.status(200).json({
    status: 'success',
    data: { user },
  });
};

export const updateUserStatus = async (req: Request, res: Response) => {
  const { status } = updateStatusSchema.parse(req.body);
  const user = await userService.updateUserStatus(req.params.id, status);
  res.status(200).json({
    status: 'success',
    data: { user },
  });
};

export const updateUserProfile = async (req: Request, res: Response) => {
  const body = updateUserProfileSchema.parse(req.body);
  const user = await userService.updateUserProfile(req.params.id, body);
  res.status(200).json({
    status: 'success',
    data: { user },
  });
};

export const deleteUser = async (req: Request, res: Response) => {
  await userService.deleteUser(req.params.id, req.user!.id);
  res.status(204).send();
};
