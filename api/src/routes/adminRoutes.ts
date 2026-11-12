import { Router } from "express";
import {
  getDonationSummary,
  listMembers,
} from "../controllers/adminController.js";
import { authMiddleware, requireAdmin } from "../middlewares/authMiddleware.js";

export const adminRouter = Router();

adminRouter.use(authMiddleware, requireAdmin);
adminRouter.get("/members", listMembers);
adminRouter.get("/donations/summary", getDonationSummary);
