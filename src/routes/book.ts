import express from "express";
import * as bookController from "../controllers/book";

const router = express.Router();

router.post("/", bookController.add);
router.get("/:id", bookController.getById);
router.get("/", bookController.getAll);

export default router;
