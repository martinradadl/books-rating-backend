import { Request, Response } from "express";
import { MONGO_ERRORS } from "../helpers/constants";
import * as genreModel from "../models/genre";
import * as bookModel from "../models/book";
import * as bookListModel from "../models/book-list";
import * as authorModel from "../models/author";
import {
  parseUrlSlugsToGenresList,
  parseUrlSlugToCapitalizedString,
} from "../helpers/utils";

export const add = async (req: Request, res: Response) => {
  try {
    const newGenre = await genreModel.Genre.create(req.body);

    res.status(200).json(newGenre);
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message.includes(MONGO_ERRORS.DuplicateKey)) {
        const name = err.message.split(`"`)[1];
        res.status(409).json({
          message: `Adding not successful, genre ${name} already exists`,
        });
        return;
      }

      res.status(500).json({ message: err.message });
    }
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const genre = await genreModel.Genre.findById(req.params.id);
    res.status(200).json(genre);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const getByUrlSlug = async (req: Request, res: Response) => {
  try {
    const genreName = parseUrlSlugToCapitalizedString(req.params.slug);

    const genre = await genreModel.Genre.findOne({ name: genreName });
    res.status(200).json(genre);
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
    let parsedList;
    const sortBy = req.query?.sortBy as string;

    if (sortBy === "occurrence") {
      parsedList = await bookModel.Book.aggregate([
        { $unwind: "$relatedGenres" },

        {
          $group: {
            _id: "$relatedGenres",
            count: { $sum: 1 },
          },
        },

        {
          $lookup: {
            from: "genres",
            localField: "_id",
            foreignField: "_id",
            as: "genre",
          },
        },
        { $unwind: "$genre" },

        { $sort: { count: -1 } },

        { $skip: (page - 1) * limit },
        { $limit: limit },

        { $sort: { "genre.name": 1 } },

        {
          $project: {
            _id: "$genre._id",
            name: "$genre.name",
            slug: {
              $replaceAll: {
                input: { $toLower: "$genre.name" },
                find: " ",
                replacement: "-",
              },
            },
            popularity: "$count",
          },
        },
      ]);
    } else {
      const genresList = await genreModel.Genre.find()
        .sort({ name: 1 })
        .limit(limit)
        .skip((page - 1) * limit);

      parsedList = genresList.map((genre) => ({
        name: genre.name,
        _id: genre._id,
        slug: genre.name.toLowerCase().replace(/\s+/g, "-"),
      }));
    }

    res.status(200).json(parsedList);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const getRelatedGenres = async (req: Request, res: Response) => {
  try {
    const genreName = parseUrlSlugToCapitalizedString(req.params.slug);
    const limit = parseInt(req.query?.limit as string) || 6;

    const relatedGenres = await bookModel.Book.aggregate([
      {
        $lookup: {
          from: "genres",
          localField: "relatedGenres",
          foreignField: "_id",
          as: "genres",
        },
      },

      {
        $match: {
          "genres.name": genreName,
        },
      },

      { $unwind: "$relatedGenres" },

      {
        $lookup: {
          from: "genres",
          localField: "relatedGenres",
          foreignField: "_id",
          as: "genre",
        },
      },
      { $unwind: "$genre" },

      {
        $match: {
          "genre.name": { $ne: genreName },
        },
      },

      {
        $group: {
          _id: "$genre._id",
          name: { $first: "$genre.name" },
        },
      },

      { $sort: { count: -1 } },

      { $limit: limit },
    ]);

    const relatedGenresWithSlugs = parseUrlSlugsToGenresList(relatedGenres);

    res.status(200).json(relatedGenresWithSlugs);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const getGenresByAuthor = async (req: Request, res: Response) => {
  try {
    const authorName = parseUrlSlugToCapitalizedString(req.params.slug);
    const limit = Number(req.query.limit) || 3;

    const genres = await authorModel.Author.aggregate([
      {
        $match: {
          name: { $regex: `^${authorName}$`, $options: "i" },
        },
      },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "author",
          as: "books",
        },
      },
      {
        $unwind: "$books",
      },
      {
        $unwind: "$books.relatedGenres",
      },
      {
        $group: {
          _id: "$books.relatedGenres",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: "genres",
          localField: "_id",
          foreignField: "_id",
          as: "genre",
        },
      },
      {
        $unwind: "$genre",
      },
      {
        $project: {
          _id: "$genre._id",
          name: "$genre.name",
          count: 1,
        },
      },
    ]);

    const parsedGenres = parseUrlSlugsToGenresList(genres);

    res.status(200).json(parsedGenres);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const getRandomGenresWithRandomEditions = async (
  req: Request,
  res: Response,
) => {
  try {
    const genresLimit = Number(req.query.genresLimit) || 4;
    const editionsLimit = Number(req.query.editionsLimit) || 5;

    const lists = await genreModel.Genre.aggregate([
      {
        $sample: { size: genresLimit },
      },

      {
        $project: {
          _id: 0,
          genre: "$$ROOT",
        },
      },

      {
        $lookup: {
          from: "books",
          let: { genreId: "$genre._id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$$genreId", "$relatedGenres"],
                },
              },
            },

            {
              $sample: { size: editionsLimit },
            },

            {
              $lookup: {
                from: "editions",
                let: { bookId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$book", "$$bookId"],
                      },
                    },
                  },
                  { $limit: 1 },
                ],
                as: "edition",
              },
            },

            { $unwind: "$edition" },
            { $replaceRoot: { newRoot: "$edition" } },
          ],
          as: "editions",
        },
      },
    ]);

    res.status(200).json(lists);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const searchByName = async (req: Request, res: Response) => {
  try {
    const query = req.query.query;
    const limit = parseInt(req.query?.limit as string) || 4;
    const page = parseInt(req.query?.page as string) || 1;
    const skip = (page - 1) * limit;
    const isGenresOnBookLists = (req.query?.onBookLists as string) === "true";

    const [aggregationResult] = await genreModel.Genre.aggregate([
      {
        $match: {
          name: {
            $regex: query,
            $options: "i",
          },
        },
      },

      ...(isGenresOnBookLists
        ? [
            {
              $lookup: {
                from: "booklists",
                localField: "_id",
                foreignField: "relatedGenres",
                as: "bookLists",
              },
            },
            {
              $addFields: {
                bookListsCount: {
                  $size: "$bookLists",
                },
              },
            },
            {
              $match: {
                bookListsCount: { $gt: 0 },
              },
            },
            {
              $sort: {
                bookListsCount: -1 as const,
              },
            },
          ]
        : []),

      {
        $facet: {
          results: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                name: 1,
                ...(isGenresOnBookLists ? { bookListsCount: 1 } : {}),
              },
            },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    const parsedResults = parseUrlSlugsToGenresList(aggregationResult.results);
    const totalCount = aggregationResult.totalCount[0]?.count ?? 0;

    return res.status(200).json({
      results: parsedResults,
      totalCount,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const getMostCommonRelatedGenresOnBookLists = async (
  req: Request,
  res: Response,
) => {
  try {
    const limit = parseInt(req.query?.limit as string) || 8;

    const relatedGenres = await bookListModel.BookList.aggregate([
      {
        $unwind: "$relatedGenres",
      },
      {
        $group: {
          _id: "$relatedGenres",
          bookListsCount: { $sum: 1 },
        },
      },
      {
        $sort: {
          bookListsCount: -1,
        },
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: "genres",
          localField: "_id",
          foreignField: "_id",
          as: "genre",
        },
      },
      {
        $unwind: "$genre",
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              "$genre",
              {
                bookListsCount: "$bookListsCount",
              },
            ],
          },
        },
      },
    ]);

    const relatedGenresWithSlugs = parseUrlSlugsToGenresList(relatedGenres);

    res.status(200).json(relatedGenresWithSlugs);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};
