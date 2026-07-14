import { Router } from "express";
import { userRoutes } from "./user.routes.js";

export const apiRouter = Router();

apiRouter.use("/users", userRoutes);
