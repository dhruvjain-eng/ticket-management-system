import { Router } from "express";
import { getUserById, listUsers } from "../controllers/user.controller.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/async-handler.js";
import { uuidParamSchema } from "../validators/common.validator.js";

export const userRoutes = Router();

userRoutes.get("/", asyncHandler(listUsers));

userRoutes.get(
  "/:id",
  validate({ params: uuidParamSchema }),
  asyncHandler(getUserById),
);
