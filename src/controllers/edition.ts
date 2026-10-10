import { Request, Response } from "express";
import * as editionModel from "../models/edition";
import * as bookModel from "../models/book";
import * as ratingModel from "../models/rating";
import * as authorModel from "../models/author";
import { CAROUSEL_LENGTH_LIMIT, MONGO_ERRORS } from "../helpers/constants";
import {
  getRelatedBookSuggestion,
  parseToObjectId,
  parseUrlSlugToCapitalizedString,
} from "../helpers/utils";
import {
  LOOKUP_AUTHOR_BOOKS_QUERY,
  LOOKUP_AUTHOR_BOOKS_RATINGS_QUERY,
  MATCH_BY_AUTHOR_NAME_QUERY,
} from "../queries/author";
import {
  COUNT_RESULTS_QUERY,
  GET_PIPELINE_STAGE_FROM_SUCCESSFUL_CONDITION,
  REGEX_QUERY,
  SORT_BY_COUNT_DESCENDING_QUERY,
  UNWIND_PRESERVE_NULL_AND_EMPTY_ARRAYS_QUERY,
} from "../queries/global";
import {
  CALCULATE_AND_ADD_RATING_DATA_QUERY,
  LOOKUP_RATING_DATA_QUERY,
} from "../queries/ratings";
import {
  ADD_RATING_DATA_QUERY,
  GROUP_FIRST_EDITION_BY_BOOK_QUERY,
  LOOKUP_AUTHOR_FROM_EDITIONS_QUERY,
  LOOKUP_BOOK_QUERY,
  LOOKUP_GENRES_FROM_EDITIONS_QUERY,
  LOOKUP_RATINGS_FROM_EDITIONS_QUERY,
  PROJECT_TOTAL_COUNT_QUERY,
  REMOVE_TEMPORARY_RATING_DATA_QUERY,
  REMOVE_TEMPORARY_RATINGS_QUERY,
  REPLACE_ROOT_WITH_EDITION_QUERY,
} from "../queries/editions";
import {
  getRelatedGenresByBookId,
  MATCH_BY_GENRE_NAME_QUERY,
  RANK_BY_GENRE_OVERLAP_QUERY,
} from "../queries/genres";
import { MATCH_BOOK_IDS_QUERY, MATCH_BY_BOOK_ID_QUERY } from "../queries/books";

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

      LOOKUP_BOOK_QUERY,
      { $unwind: "$book" },

      LOOKUP_AUTHOR_FROM_EDITIONS_QUERY,
      UNWIND_PRESERVE_NULL_AND_EMPTY_ARRAYS_QUERY("$book.author"),

      LOOKUP_GENRES_FROM_EDITIONS_QUERY("book.relatedGenres"),
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

      LOOKUP_RATING_DATA_QUERY("$book._id"),
      UNWIND_PRESERVE_NULL_AND_EMPTY_ARRAYS_QUERY("$ratingData"),
      ADD_RATING_DATA_QUERY,
      REMOVE_TEMPORARY_RATING_DATA_QUERY,
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
      LOOKUP_BOOK_QUERY,
      { $unwind: "$book" },

      LOOKUP_AUTHOR_FROM_EDITIONS_QUERY,
      { $unwind: "$book.author" },

      {
        $match: {
          "book.author._id": parseToObjectId(authorId),
          "book._id": { $ne: parseToObjectId(bookId) },
        },
      },

      GROUP_FIRST_EDITION_BY_BOOK_QUERY,
      REPLACE_ROOT_WITH_EDITION_QUERY,

      LOOKUP_RATINGS_FROM_EDITIONS_QUERY,
      CALCULATE_AND_ADD_RATING_DATA_QUERY,
      REMOVE_TEMPORARY_RATINGS_QUERY,
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
    const bookId = req.query?.bookId as string;
    const limit = parseInt(req.query?.limit as string) || CAROUSEL_LENGTH_LIMIT;

    const relatedGenres = await getRelatedGenresByBookId(bookId);

    const editionsList = await editionModel.Edition.aggregate([
      LOOKUP_BOOK_QUERY,
      { $unwind: "$book" },

      LOOKUP_AUTHOR_FROM_EDITIONS_QUERY,
      { $unwind: "$book.author" },
      {
        $match: {
          "book.author._id": {
            $ne: parseToObjectId(authorId),
          },
        },
      },

      ...RANK_BY_GENRE_OVERLAP_QUERY(relatedGenres),

      GROUP_FIRST_EDITION_BY_BOOK_QUERY,
      REPLACE_ROOT_WITH_EDITION_QUERY,

      LOOKUP_RATINGS_FROM_EDITIONS_QUERY,
      CALCULATE_AND_ADD_RATING_DATA_QUERY,
      REMOVE_TEMPORARY_RATINGS_QUERY,
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
      LOOKUP_BOOK_QUERY,
      { $unwind: "$book" },

      ...GET_PIPELINE_STAGE_FROM_SUCCESSFUL_CONDITION({
        condition: !!genreName,
        pipelineStages: [
          LOOKUP_GENRES_FROM_EDITIONS_QUERY(),
          MATCH_BY_GENRE_NAME_QUERY(genreName),
        ],
      }),

      LOOKUP_AUTHOR_FROM_EDITIONS_QUERY,
      { $unwind: "$book.author" },

      { $sort: { published: -1 } },

      GROUP_FIRST_EDITION_BY_BOOK_QUERY,
      REPLACE_ROOT_WITH_EDITION_QUERY,

      LOOKUP_RATING_DATA_QUERY("$book._id"),
      UNWIND_PRESERVE_NULL_AND_EMPTY_ARRAYS_QUERY("$ratingData"),
      ADD_RATING_DATA_QUERY,
      REMOVE_TEMPORARY_RATING_DATA_QUERY,

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
      LOOKUP_BOOK_QUERY,
      { $unwind: "$book" },

      ...GET_PIPELINE_STAGE_FROM_SUCCESSFUL_CONDITION({
        condition: !!genreName,
        pipelineStages: [
          LOOKUP_GENRES_FROM_EDITIONS_QUERY(),
          MATCH_BY_GENRE_NAME_QUERY(genreName),
        ],
      }),

      {
        $group: {
          _id: "$book._id",
          count: { $sum: 1 },
        },
      },
      SORT_BY_COUNT_DESCENDING_QUERY,

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
      MATCH_BOOK_IDS_QUERY(bookIds),
      LOOKUP_BOOK_QUERY,
      { $unwind: "$book" },
      LOOKUP_AUTHOR_FROM_EDITIONS_QUERY,
      { $unwind: "$book.author" },

      GROUP_FIRST_EDITION_BY_BOOK_QUERY,
      REPLACE_ROOT_WITH_EDITION_QUERY,

      LOOKUP_RATING_DATA_QUERY("$book._id"),
      UNWIND_PRESERVE_NULL_AND_EMPTY_ARRAYS_QUERY("$ratingData"),
      ADD_RATING_DATA_QUERY,
      REMOVE_TEMPORARY_RATING_DATA_QUERY,
    ]);

    const editionsMap = new Map(
      editions.map((edition) => [edition.book._id.toString(), edition]),
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
      LOOKUP_BOOK_QUERY,
      { $unwind: "$book" },

      ...GET_PIPELINE_STAGE_FROM_SUCCESSFUL_CONDITION({
        condition: !!genreName,
        pipelineStages: [
          LOOKUP_GENRES_FROM_EDITIONS_QUERY(),
          MATCH_BY_GENRE_NAME_QUERY(genreName),
        ],
      }),

      {
        $group: {
          _id: "$book._id",
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
      MATCH_BOOK_IDS_QUERY(bookIds),
      LOOKUP_BOOK_QUERY,
      { $unwind: "$book" },

      LOOKUP_AUTHOR_FROM_EDITIONS_QUERY,
      { $unwind: "$book.author" },

      GROUP_FIRST_EDITION_BY_BOOK_QUERY,
      REPLACE_ROOT_WITH_EDITION_QUERY,

      LOOKUP_RATING_DATA_QUERY("$book._id"),
      UNWIND_PRESERVE_NULL_AND_EMPTY_ARRAYS_QUERY("$ratingData"),
      ADD_RATING_DATA_QUERY,
      REMOVE_TEMPORARY_RATING_DATA_QUERY,
    ]);

    const editionsMap = new Map(
      editions.map((edition) => [edition.book._id.toString(), edition]),
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

export const searchByTitleOrAuthor = async (req: Request, res: Response) => {
  try {
    const query = req.query.query as string;
    const limit = parseInt(req.query?.limit as string) || 4;
    const page = parseInt(req.query?.page as string) || 1;
    const skip = (page - 1) * limit;

    const [aggregationResult] = await editionModel.Edition.aggregate([
      LOOKUP_BOOK_QUERY,
      { $unwind: "$book" },

      LOOKUP_AUTHOR_FROM_EDITIONS_QUERY,
      { $unwind: "$book.author" },

      {
        $match: {
          $or: [
            {
              title: REGEX_QUERY({ regex: query, option: "i" }),
            },
            {
              "book.author.name": REGEX_QUERY({ regex: query, option: "i" }),
            },
          ],
        },
      },

      {
        $group: {
          _id: "$book._id",
          edition: { $first: "$$ROOT" },
        },
      },
      REPLACE_ROOT_WITH_EDITION_QUERY,

      {
        $project: {
          _id: 1,
          book: {
            author: {
              name: 1,
            },
          },
          cover: 1,
          title: 1,
        },
      },

      {
        $facet: {
          results: [{ $skip: skip }, { $limit: limit }],
          totalCount: COUNT_RESULTS_QUERY,
        },
      },
      {
        $project: {
          results: 1,
          totalCount: PROJECT_TOTAL_COUNT_QUERY,
        },
      },
    ]);

    return res.status(200).json({
      results: aggregationResult?.results ?? [],
      totalCount: aggregationResult?.totalCount ?? 0,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const getByAuthor = async (req: Request, res: Response) => {
  try {
    const authorName = parseUrlSlugToCapitalizedString(req.params.name);
    const page = parseInt(req.query?.page as string) || 1;
    const limit = parseInt(req.query?.limit as string) || 10;
    const skip = (page - 1) * limit;

    const result = await authorModel.Author.aggregate([
      MATCH_BY_AUTHOR_NAME_QUERY(authorName),

      LOOKUP_AUTHOR_BOOKS_QUERY,
      {
        $unwind: "$books",
      },

      LOOKUP_AUTHOR_BOOKS_RATINGS_QUERY,

      CALCULATE_AND_ADD_RATING_DATA_QUERY,

      {
        $sort: {
          ratingCount: -1,
          "books._id": 1,
        },
      },

      {
        $lookup: {
          from: "editions",
          let: {
            bookId: "$books._id",
          },
          pipeline: [
            MATCH_BY_BOOK_ID_QUERY,
            {
              $lookup: {
                from: "books",
                localField: "book",
                foreignField: "_id",
                pipeline: [
                  {
                    $project: {
                      _id: 0,
                      firstPublished: 1,
                    },
                  },
                ],
                as: "book",
              },
            },
            {
              $unwind: "$book",
            },
            {
              $sort: {
                _id: 1,
              },
            },
            {
              $limit: 1,
            },
          ],
          as: "edition",
        },
      },

      {
        $unwind: "$edition",
      },

      {
        $facet: {
          editions: [
            {
              $skip: skip,
            },
            {
              $limit: limit,
            },
            {
              $replaceRoot: {
                newRoot: {
                  $mergeObjects: [
                    "$edition",
                    {
                      ratingCount: "$ratingCount",
                      averageRating: "$averageRating",
                    },
                  ],
                },
              },
            },
          ],

          totalCount: COUNT_RESULTS_QUERY,
        },
      },

      {
        $project: {
          editions: 1,
          totalCount: PROJECT_TOTAL_COUNT_QUERY,
        },
      },
    ]);

    if (!result.length) {
      return res.status(404).json({
        message: "Author not found",
      });
    }

    return res.status(200).json(result[0]);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};
