import express from "express";
import * as genreController from "../controllers/genre";

const router = express.Router();

router.post("/", genreController.add);
router.get("/:id", genreController.getById);
router.get("/", genreController.getAll);

export default router;
