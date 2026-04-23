import { Request, Response } from "express";
import * as editionModel from "../models/edition";
import * as bookModel from "../models/book";
import * as ratingModel from "../models/rating";
import { CAROUSEL_LENGTH_LIMIT, MONGO_ERRORS } from "../helpers/constants";
import {
  getRelatedBookSuggestion,
  parseToObjectId,
  parseUrlSlugToCapitalizedString,
} from "../helpers/utils";
import {
  FILTER_EDITIONS_BY_GENRE_QUERY,
  GROUP_FIRST_EDITION_BY_BOOK_QUERY,
  RATING_ADD_FIELDS_QUERY,
  RATING_DATA_LOOKUP_QUERY,
  UNWIND_PRESERVE_NULL_AND_EMPTY_ARRAYS_QUERY,
} from "../helpers/queries";

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
    const editionId = parseToObjectId(req.params.id);

    const [edition] = await editionModel.Edition.aggregate([
      { $match: { _id: editionId } },

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
        $lookup: {
          from: "authors",
          localField: "book.author",
          foreignField: "_id",
          as: "book.author",
        },
      },
      { $unwind: UNWIND_PRESERVE_NULL_AND_EMPTY_ARRAYS_QUERY("$book.author") },

      {
        $lookup: {
          from: "genres",
          localField: "book.relatedGenres",
          foreignField: "_id",
          as: "book.relatedGenres",
        },
      },
      {
        $lookup: {
          from: "characters",
          localField: "book.characters",
          foreignField: "_id",
          as: "book.characters",
        },
      },
      {
        $lookup: {
          from: "settings",
          localField: "book.settings",
          foreignField: "_id",
          as: "book.settings",
        },
      },

      {
        $lookup: RATING_DATA_LOOKUP_QUERY("$book._id"),
      },
      {
        $unwind: UNWIND_PRESERVE_NULL_AND_EMPTY_ARRAYS_QUERY("$ratingData"),
      },

      {
        $addFields: {
          averageRating: { $ifNull: ["$ratingData.averageRating", 0] },
          ratingCount: { $ifNull: ["$ratingData.ratingCount", 0] },
        },
      },

      {
        $project: {
          ratingData: 0,
        },
      },
    ]);

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
      .skip((page - 1) * limit)
      .populate({
        path: "book",
        populate: [
          { path: "author" },
          { path: "relatedGenres" },
          { path: "characters" },
          { path: "settings" },
        ],
      });

    res.status(200).json(editionsList);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const getMoreEditions = async (req: Request, res: Response) => {
  try {
    const editionId = req.query?.editionId as string;
    const bookId = req.query?.bookId;
    const limit = parseInt(req.query?.limit as string) || CAROUSEL_LENGTH_LIMIT;

    const editionsList = await editionModel.Edition.find({
      book: bookId,
      _id: { $ne: parseToObjectId(editionId) },
    })
      .limit(limit)
      .populate({
        path: "book",
        populate: [{ path: "author" }],
      });

    res.status(200).json(editionsList);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const getBooksBySameAuthor = async (req: Request, res: Response) => {
  try {
    const authorId = req.query?.authorId as string;
    const bookId = req.query?.bookId as string;
    const limit = parseInt(req.query?.limit as string) || CAROUSEL_LENGTH_LIMIT;

    const editionsList = await editionModel.Edition.aggregate([
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
        $lookup: {
          from: "authors",
          localField: "book.author",
          foreignField: "_id",
          as: "book.author",
        },
      },
      { $unwind: "$book.author" },
      {
        $match: {
          "book.author._id": parseToObjectId(authorId),
          "book._id": { $ne: parseToObjectId(bookId) },
        },
      },
      {
        $group: GROUP_FIRST_EDITION_BY_BOOK_QUERY,
      },
      {
        $replaceRoot: { newRoot: "$edition" },
      },
      {
        $lookup: {
          from: "ratings",
          localField: "book._id",
          foreignField: "book",
          as: "ratings",
        },
      },
      {
        $addFields: RATING_ADD_FIELDS_QUERY,
      },
      {
        $project: {
          ratings: 0,
        },
      },
      { $limit: limit },
    ]);

    res.status(200).json(editionsList);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const getRelatedBooks = async (req: Request, res: Response) => {
  try {
    const authorId = req.query?.authorId as string;
    const bookId = req.query?.bookId;
    const limit = parseInt(req.query?.limit as string) || CAROUSEL_LENGTH_LIMIT;

    const baseBook = await bookModel.Book.findById(bookId)
      .select("relatedGenres")
      .lean();
    const relatedGenres = baseBook?.relatedGenres;

    const editionsList = await editionModel.Edition.aggregate([
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
        $lookup: {
          from: "authors",
          localField: "book.author",
          foreignField: "_id",
          as: "book.author",
        },
      },
      { $unwind: "$book.author" },
      {
        $match: {
          "book.author._id": {
            $ne: parseToObjectId(authorId),
          },
        },
      },
      {
        $addFields: {
          genreOverlap: {
            $size: { $setIntersection: ["$book.relatedGenres", relatedGenres] },
          },
        },
      },
      { $match: { genreOverlap: { $gt: 0 } } },
      {
        $sort: { genreOverlap: -1 },
      },
      {
        $group: GROUP_FIRST_EDITION_BY_BOOK_QUERY,
      },
      {
        $replaceRoot: { newRoot: "$edition" },
      },
      {
        $lookup: {
          from: "ratings",
          localField: "book._id",
          foreignField: "book",
          as: "ratings",
        },
      },
      {
        $addFields: RATING_ADD_FIELDS_QUERY,
      },
      {
        $project: {
          ratings: 0,
        },
      },
      { $limit: limit },
    ]);

    res.status(200).json(editionsList);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const getLatestReleases = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query?.limit as string) || 0;
    const genreName = parseUrlSlugToCapitalizedString(
      req.query?.genre as string,
    );

    const latestReleasesList = await editionModel.Edition.aggregate([
      ...FILTER_EDITIONS_BY_GENRE_QUERY(genreName),

      { $sort: { published: -1 } },
      {
        $group: GROUP_FIRST_EDITION_BY_BOOK_QUERY,
      },
      { $replaceRoot: { newRoot: "$edition" } },
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

export const getMostRatedBooks = async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query?.limit) || 5;
    const enableSuggestion = req.query?.enableSuggestion === "true" || false;
    let suggestion;
    const genreName = parseUrlSlugToCapitalizedString(
      req.query?.genre as string,
    );

    const topBooks = await ratingModel.Rating.aggregate([
      ...FILTER_EDITIONS_BY_GENRE_QUERY(genreName),
      {
        $group: {
          _id: genreName ? "$book._id" : "$book",
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

    if (enableSuggestion) {
      const index = Math.floor(Math.random() * bookIds.length);
      const randomBookId = bookIds[index];
      suggestion = await getRelatedBookSuggestion(randomBookId);
    }

    const editions = await editionModel.Edition.aggregate([
      { $match: { book: { $in: bookIds } } },
      {
        $group: GROUP_FIRST_EDITION_BY_BOOK_QUERY,
      },
      { $replaceRoot: { newRoot: "$edition" } },
    ]);

    const editionsMap = new Map(
      editions.map((edition) => [edition.book.toString(), edition]),
    );

    const orderedEditions = bookIds.map((id) => editionsMap.get(id.toString()));

    const response = { list: orderedEditions, suggestion };
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
    const enableSuggestion = req.query?.enableSuggestion === "true" || false;
    let suggestion;
    const genreName = parseUrlSlugToCapitalizedString(
      req.query?.genre as string,
    );

    const topBooks = await ratingModel.Rating.aggregate([
      ...FILTER_EDITIONS_BY_GENRE_QUERY(genreName),

      {
        $group: {
          _id: genreName ? "$book._id" : "$book",
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

    if (enableSuggestion) {
      const index = Math.floor(Math.random() * bookIds.length);
      const randomBookId = bookIds[index];
      suggestion = await getRelatedBookSuggestion(randomBookId);
    }

    const editions = await editionModel.Edition.aggregate([
      { $match: { book: { $in: bookIds } } },
      {
        $group: GROUP_FIRST_EDITION_BY_BOOK_QUERY,
      },
      { $replaceRoot: { newRoot: "$edition" } },
    ]);

    const editionsMap = new Map(
      editions.map((edition) => [edition.book.toString(), edition]),
    );

    const orderedEditions = topBooks.map((item) =>
      editionsMap.get(item._id.toString()),
    );

    const response = { list: orderedEditions, suggestion };
    res.status(200).json(response);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};
