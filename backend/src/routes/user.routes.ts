import { Router } from "express";
import { listUsers } from "../controllers/user.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

export const userRoutes = Router();

userRoutes.get("/", asyncHandler(listUsers));
