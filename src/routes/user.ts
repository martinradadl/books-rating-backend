import express from "express";
import * as userController from "../controllers/user";

const router = express.Router();

router.post("/", userController.add);
router.get("/email/:email", userController.getByEmail);
router.get("/:id", userController.getById);

export default router;
