import express from "express";
import * as characterController from "../controllers/character";

const router = express.Router();

router.post("/", characterController.add);
router.get("/:id", characterController.getById);
router.get("/", characterController.getAll);

export default router;
