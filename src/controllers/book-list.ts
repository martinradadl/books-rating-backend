import { Request, Response } from "express";
import * as bookListModel from "../models/book-list";
import * as editionModel from "../models/edition";
import * as bookModel from "../models/book";
import * as ratingModel from "../models/rating";
import { MONGO_ERRORS } from "../helpers/constants";
import { parseToObjectId } from "../helpers/utils";

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

export const getRelatedBookRecommendation = async (bookId: string) => {
  try {
    const book = await bookModel.Book.findById(bookId)
      .select("relatedGenres")
      .lean();
    const relatedGenres = book?.relatedGenres;

    console.log("relatedGenres: ", relatedGenres);

    console.log("before recommendation");

    const [recommendation] = await editionModel.Edition.aggregate([
      {
        $lookup: {
          from: "books",
          localField: "book",
          foreignField: "_id",
          as: "book",
        },
      },
      { $unwind: "$book" },
      {
        $match: {
          "book._id": {
            $ne: parseToObjectId(bookId),
          },
        },
      },
      {
        $addFields: {
          genreOverlap: {
            $size: {
              $setIntersection: ["$book.relatedGenres", relatedGenres],
            },
          },
        },
      },
      { $match: { genreOverlap: { $gt: 0 } } },
      {
        $sort: { genreOverlap: -1 },
      },
      {
        $group: {
          _id: "$book",
          edition: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: { newRoot: "$edition" },
      },
      { $project: { genreOverlap: 0 } },
      { $limit: 1 },
    ]);

    console.log("recommendation: ", [recommendation]);
    return recommendation;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log(err.message);
    }
  }
};

export const getMostRatedBooks = async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query?.limit) || 5;
    const enableRecommendation =
      req.query?.enableRecommendation === "true" || false;
    let recommendation;

    const topBooks = await ratingModel.Rating.aggregate([
      {
        $group: {
          _id: "$book",
          ratingsCount: { $sum: 1 },
        },
      },
      {
        $sort: { ratingsCount: -1 },
      },
      {
        $limit: limit,
      },
    ]);

    const bookIds = topBooks.map((book) => book._id);

    if (enableRecommendation) {
      const index = Math.floor(Math.random() * bookIds.length);
      const randomBookId = bookIds[index];

      console.log("randomBookId: ", randomBookId);
      recommendation = await getRelatedBookRecommendation(randomBookId);

      console.log("just after rec: ", recommendation);
    }

    const editions = await editionModel.Edition.aggregate([
      { $match: { book: { $in: bookIds } } },
      {
        $group: {
          _id: "$book",
          edition: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$edition" } },
    ]);

    const editionsMap = new Map(
      editions.map((edition) => [edition.book.toString(), edition]),
    );

    const orderedEditions = bookIds.map((id) => editionsMap.get(id.toString()));

    const response = { list: orderedEditions, recommendation };
    res.status(200).json(response);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const getBestRatedBooks = async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query?.limit) || 5;
    const enableRecommendation =
      req.query?.enableRecommendation === "true" || false;
    let recommendation;

    const topBooks = await ratingModel.Rating.aggregate([
      {
        $group: {
          _id: "$book",
          averageScore: { $avg: "$score" },
        },
      },
      {
        $sort: { averageScore: -1 },
      },
      {
        $limit: limit,
      },
    ]);

    const bookIds = topBooks.map((book) => book._id);

    if (enableRecommendation) {
      const index = Math.floor(Math.random() * bookIds.length);
      const randomBookId = bookIds[index];
      recommendation = await getRelatedBookRecommendation(randomBookId);
    }

    const editions = await editionModel.Edition.aggregate([
      { $match: { book: { $in: bookIds } } },
      {
        $group: {
          _id: "$book",
          edition: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$edition" } },
    ]);

    const editionsMap = new Map(
      editions.map((edition) => [edition.book.toString(), edition]),
    );

    const orderedEditions = topBooks.map((item) =>
      editionsMap.get(item._id.toString()),
    );

    const response = { list: orderedEditions, recommendation };
    res.status(200).json(response);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};
