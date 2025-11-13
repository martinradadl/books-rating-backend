import { Request, Response } from "express";
import * as bookModel from "../models/book";
import * as authorModel from "../models/author";
import { MONGO_ERRORS } from "../helpers/constants";

export const add = async (req: Request, res: Response) => {
  try {
    const {
      originalTitle,
      authorId,
      relatedGenres,
      firstPublished,
      characters,
      settings,
    } = req.body;

    const author = await authorModel.Author.findById(authorId);

    if (!author) {
      return res.status(404).json({
        message: "Add not successful",
        error: "Author not found",
      });
    }

    const newBook = await bookModel.Book.create({
      originalTitle,
      authorId,
      relatedGenres,
      firstPublished,
      characters,
      settings,
    });

    res.status(200).json(newBook);
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message.includes(MONGO_ERRORS.DuplicateKey)) {
        const title = err.message.split(`"`)[1];
        res.status(409).json({
          message: `Adding not successful, title ${title} from this author already exists`,
        });
        return;
      }

      res.status(500).json({ message: err.message });
    }
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const bookId = req.params.bookId;
    const book = await bookModel.Book.findById(bookId);
    res.status(200).json(book);
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

    const booksList = await bookModel.Book.find()
      .limit(limit)
      .skip((page - 1) * limit);

    res.status(200).json(booksList);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};
