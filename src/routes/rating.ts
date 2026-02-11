import express from "express";
import * as ratingController from "../controllers/rating";

const router = express.Router();

router.post("/", ratingController.add);
router.get("/most-rated", ratingController.getMostRatedBooks);
router.get("/best-rated", ratingController.getBestRatedBooks);
router.get("/count/:bookId", ratingController.getCountByBook);
router.get("/mean/:bookId", ratingController.getMeanRatingByBook);

export default router;
