import express from "express";
import * as authorController from "../controllers/author";

const router = express.Router();

router.post("/", authorController.add);
router.get("/:id", authorController.getById);
router.get("/", authorController.getAll);

export default router;
