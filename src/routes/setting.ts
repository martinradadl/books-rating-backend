import express from "express";
import * as settingController from "../controllers/setting";

const router = express.Router();

router.post("/", settingController.add);
router.get("/:id", settingController.getById);
router.get("/", settingController.getAll);

export default router;
