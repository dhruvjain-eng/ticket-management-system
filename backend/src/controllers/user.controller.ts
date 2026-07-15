import type { Request, Response } from "express";
import * as userService from "../services/user.service.js";
import { AppError } from "../utils/app-error.js";
import { getValidated } from "../utils/get-validated.js";

export async function listUsers(_req: Request, res: Response): Promise<void> {
  const users = await userService.listUsers();

  res.status(200).json({
    data: users,
    meta: { count: users.length },
  });
}

export async function getUserById(_req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(res, "params");
  const user = await userService.getUserById(id);

  if (!user) {
    throw new AppError(404, "NOT_FOUND", "User not found");
  }

  res.status(200).json({ data: user });
}
