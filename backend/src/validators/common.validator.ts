import { z } from "zod";

export const uuidParamSchema = z.object({
  id: z.string().uuid({ message: "Invalid ticket id" }),
});
