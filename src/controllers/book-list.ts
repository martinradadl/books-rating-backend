import { Request, Response } from "express";
import * as bookListModel from "../models/book-list";
import * as editionModel from "../models/edition";
import { MONGO_ERRORS } from "../helpers/constants";

export const addBookList = async (req: Request, res: Response) => {
  try {
    const { title, description, books, bookLists } = req.body;

    const newBookList = await bookListModel.BookList.create({
      title,
      books,
      bookLists,
      description,
    });

    res.status(200).json(newBookList);
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message.includes(MONGO_ERRORS.DuplicateKey)) {
        const bookListTitle = err.message.split(`"`)[1];
        res.status(409).json({
          message: `Adding not successful, book list ${bookListTitle} already exists`,
        });
        return;
      }

      res.status(500).json({ message: err.message });
    }
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query?.page as string) || 1;
    const limit = parseInt(req.query?.limit as string) || 0;

    const bookLists = await bookListModel.BookList.find()
      .limit(limit)
      .skip((page - 1) * limit)
      .populate("books")
      .populate("bookLists");

    console.log("bookLists: ", bookLists);

    const result = bookLists.map((list) => {
      console.log("list: ", list);
      return {
        ...list.toObject(),
        urlPath: String(list.title).toLowerCase().replace(/\s+/g, "-"),
      };
    });

    console.log("result: ", result);

    res.status(200).json(result);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const bookListId = req.params.id;
    const bookList = await bookListModel.BookList.findById(bookListId);
    res.status(200).json(bookList);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const getLatestReleases = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query?.limit as string) || 0;

    const latestReleasesList = await editionModel.Edition.aggregate([
      { $sort: { published: -1 } },
      {
        $group: {
          _id: "$book",
          latestEdition: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$latestEdition" } },
      { $sort: { published: -1 } },
      { $limit: limit },
    ]);

    res.status(200).json(latestReleasesList);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};
