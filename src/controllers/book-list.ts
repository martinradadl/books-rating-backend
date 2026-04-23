import { Request, Response } from "express";
import * as bookListModel from "../models/book-list";
import { MONGO_ERRORS } from "../helpers/constants";
import {
  RATING_DATA_LOOKUP_QUERY,
  UNWIND_PRESERVE_NULL_AND_EMPTY_ARRAYS_QUERY,
} from "../helpers/queries";

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

    const result = bookLists.map((list) => {
      return {
        ...list.toObject(),
        urlPath: String(list.title).toLowerCase().replace(/\s+/g, "-"),
      };
    });

    res.status(200).json(result);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const getByTitle = async (req: Request, res: Response) => {
  try {
    const rawTitle = req.params.title;
    const titlePattern = rawTitle.replace(/-/g, " ");

    const page = parseInt(req.query?.page as string) || 1;
    const limit = parseInt(req.query?.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [bookList] = await bookListModel.BookList.aggregate([
      {
        $match: { title: { $regex: `^${titlePattern}$`, $options: "i" } },
      },
      {
        $lookup: {
          from: "editions",
          localField: "books",
          foreignField: "_id",
          as: "books",
          pipeline: [
            { $sort: { createdAt: -1 } },

            {
              $facet: {
                data: [
                  { $skip: skip },
                  { $limit: limit },

                  {
                    $lookup: {
                      from: "books",
                      localField: "book",
                      foreignField: "_id",
                      as: "book",
                    },
                  },
                  {
                    $unwind: {
                      path: "$book",
                      preserveNullAndEmptyArrays: true,
                    },
                  },

                  {
                    $lookup: {
                      from: "authors",
                      localField: "book.author",
                      foreignField: "_id",
                      as: "book.author",
                    },
                  },
                  {
                    $unwind: {
                      path: "$book.author",
                      preserveNullAndEmptyArrays: true,
                    },
                  },

                  {
                    $lookup: RATING_DATA_LOOKUP_QUERY("$book._id"),
                  },
                  {
                    $unwind:
                      UNWIND_PRESERVE_NULL_AND_EMPTY_ARRAYS_QUERY(
                        "$ratingData",
                      ),
                  },
                  {
                    $addFields: {
                      averageRating: {
                        $ifNull: ["$ratingData.averageRating", 0],
                      },
                      ratingCount: { $ifNull: ["$ratingData.ratingCount", 0] },
                    },
                  },
                  {
                    $project: { ratingData: 0 },
                  },
                ],

                totalCount: [{ $count: "count" }],
              },
            },
            {
              $unwind: {
                path: "$totalCount",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $addFields: {
                booksCount: { $ifNull: ["$totalCount.count", 0] },
              },
            },
            {
              $project: {
                totalCount: 0,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$books",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          booksCount: { $ifNull: ["$books.booksCount", 0] },
          books: { $ifNull: ["$books.data", []] },
        },
      },
    ]);

    res.status(200).json(bookList);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};
