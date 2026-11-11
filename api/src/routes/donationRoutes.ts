import { Router } from "express";
import { initiateDonation } from "../controllers/donationController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validateBody } from "../middlewares/validate.js";
import { initiateDonationSchema } from "../validators/donation.validators.js";

export const donationRouter = Router();

donationRouter.post(
  "/initiate",
  authMiddleware,
  validateBody(initiateDonationSchema),
  initiateDonation,
);
