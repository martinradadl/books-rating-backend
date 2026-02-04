import express from "express";
import * as bookListController from "../controllers/book-list";

const router = express.Router();

router.post("/", bookListController.addBookList);
router.get("/", bookListController.getAll);
router.get("/latest-releases", bookListController.getLatestReleases);
router.get("/:id", bookListController.getById);

export default router;
