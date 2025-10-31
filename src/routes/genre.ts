import express from "express";
import * as genreController from "../controllers/genre";

const router = express.Router();

router.post("/", genreController.add);

export default router;
