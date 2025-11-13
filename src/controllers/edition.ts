import { Request, Response } from "express";
import * as editionModel from "../models/edition";
import * as bookModel from "../models/book";
import { MONGO_ERRORS } from "../helpers/constants";

export const add = async (req: Request, res: Response) => {
  try {
    const book = await bookModel.Book.findById(req.body.bookId);

    if (!book) {
      return res.status(404).json({
        message: "Add not successful",
        error: "Book not found",
      });
    }
    const newEdition = await editionModel.Edition.create(req.body);

    res.status(200).json(newEdition);
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message.includes(MONGO_ERRORS.DuplicateKey)) {
        const value = err.message.split(`"`)[1];
        const isASIN = /^[A-Z0-9]{10}$/.test(value);
        res.status(409).json({
          message: `Adding not successful, an edition with ${
            isASIN ? "ASIN" : "ISBN"
          } ${value} already exists`,
        });
        return;
      }

      res.status(500).json({ message: err.message });
    }
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const editionId = req.params.editionId;
    const edition = await editionModel.Edition.findById(editionId);
    res.status(200).json(edition);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query?.page as string) || 1;
    const limit = parseInt(req.query?.limit as string) || 0;

    const editionsList = await editionModel.Edition.find()
      .limit(limit)
      .skip((page - 1) * limit);

    res.status(200).json(editionsList);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};
