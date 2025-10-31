import express from "express";
import * as editionController from "../controllers/edition";

const router = express.Router();

router.post("/", editionController.add);
router.get("/:id", editionController.getById);
router.get("/", editionController.getAll);

export default router;
