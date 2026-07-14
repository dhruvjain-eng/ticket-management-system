import type { Request, Response } from "express";
import * as userService from "../services/user.service.js";

export async function listUsers(_req: Request, res: Response): Promise<void> {
  const users = await userService.listUsers();

  res.status(200).json({
    data: users,
    meta: { count: users.length },
  });
}
