import { Router } from "express";
import {
  createDepartment,
  getDepartment,
  joinDepartment,
  leaveDepartment,
  listDepartments,
} from "../controllers/departmentController.js";
import { authMiddleware, requireAdmin } from "../middlewares/authMiddleware.js";
import { validateBody } from "../middlewares/validate.js";
import { createDepartmentSchema } from "../validators/department.validators.js";

export const departmentRouter = Router();

departmentRouter.use(authMiddleware);

departmentRouter.get("/", listDepartments);
departmentRouter.get("/:id", getDepartment);
departmentRouter.post(
  "/",
  requireAdmin,
  validateBody(createDepartmentSchema),
  createDepartment,
);
departmentRouter.post("/:id/join", joinDepartment);
departmentRouter.post("/:id/leave", leaveDepartment);
