import { z } from "zod";

const trimmedString = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min, { message: `Must be at least ${min} character(s)` })
    .max(max, { message: `Must be at most ${max} characters` });

export const createCommentBodySchema = z.object({
  message: trimmedString(1, 5_000),
  createdById: z.string().uuid({ message: "Invalid createdById" }),
});

export type CreateCommentBody = z.infer<typeof createCommentBodySchema>;
