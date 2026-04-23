import express from "express";
import * as genreController from "../controllers/genre";

const router = express.Router();

router.post("/", genreController.add);
router.get("/:id", genreController.getById);
router.get("/slug/:slug", genreController.getByUrlSlug);
router.get("/", genreController.getAll);
router.get("/related-genres/:slug", genreController.getRelatedGenres);

export default router;
