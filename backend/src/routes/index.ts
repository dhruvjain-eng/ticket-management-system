import { Router } from "express";
import { ticketRoutes } from "./ticket.routes.js";
import { userRoutes } from "./user.routes.js";

export const apiRouter = Router();

apiRouter.use("/users", userRoutes);
apiRouter.use("/tickets", ticketRoutes);
