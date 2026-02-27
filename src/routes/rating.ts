import express from "express";
import * as ratingController from "../controllers/rating";

const router = express.Router();

router.post("/", ratingController.add);
router.get(
  "/distribution/:bookId",
  ratingController.getRatingDistributionByScore,
);

export default router;
