import express from "express";
import * as genreController from "../controllers/genre";

const router = express.Router();

router.post("/", genreController.add);
router.get("/discover", genreController.getRandomGenresWithRandomEditions);
router.get("/related-genres/:slug", genreController.getRelatedGenres);
router.get("/slug/:slug", genreController.getByUrlSlug);
router.get("/", genreController.getAll);
router.get("/:id", genreController.getById);

export default router;
