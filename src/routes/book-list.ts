import express from "express";
import * as bookListController from "../controllers/book-list";

const router = express.Router();

router.post("/", bookListController.addBookList);
router.get("/", bookListController.getAll);
router.get("/genres", bookListController.getMostCommonRelatedGenres);
router.get("/genre/:name", bookListController.getByRelatedGenre);
router.get("/:title", bookListController.getByTitle);

export default router;
