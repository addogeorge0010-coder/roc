import { Router } from "express";
import {
  google,
  login,
  logout,
  refresh,
  register,
  session,
} from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validateBody } from "../middlewares/validate.js";
import {
  googleSignInSchema,
  loginSchema,
  registerSchema,
  sessionTokenSchema,
} from "../validators/auth.validators.js";

export const authRouter = Router();

authRouter.post("/register", validateBody(registerSchema), register);
authRouter.post("/login", validateBody(loginSchema), login);
authRouter.post("/google", validateBody(googleSignInSchema), google);
authRouter.post("/refresh", validateBody(sessionTokenSchema), refresh);
authRouter.post("/logout", validateBody(sessionTokenSchema), logout);
authRouter.get("/session", authMiddleware, session);
