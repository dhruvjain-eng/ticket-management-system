import type { Request, Response } from "express";
import * as commentService from "../services/comment.service.js";
import { getValidated } from "../utils/get-validated.js";
import type { CreateCommentBody } from "../validators/comment.validator.js";

export async function addComment(_req: Request, res: Response): Promise<void> {
  const { id: ticketId } = getValidated<{ id: string }>(res, "params");
  const body = getValidated<CreateCommentBody>(res, "body");
  const comment = await commentService.createComment(ticketId, body);

  res.status(201).json({ data: comment });
}
