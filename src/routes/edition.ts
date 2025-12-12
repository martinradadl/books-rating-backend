import express from "express";
import * as editionController from "../controllers/edition";

const router = express.Router();

router.post("/", editionController.add);
router.get("/more-editions", editionController.getMoreEditions);
router.get("/same-author", editionController.getBooksBySameAuthor);
router.get("/related-books", editionController.getRelatedBooks);
router.get("/:id", editionController.getById);
router.get("/", editionController.getAll);

export default router;
