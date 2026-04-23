import { Request, Response } from "express";
import { MONGO_ERRORS } from "../helpers/constants";
import * as genreModel from "../models/genre";
import * as bookModel from "../models/book";
import { parseUrlSlugToCapitalizedString } from "../helpers/utils";

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

    const relatedGenresWithSlugs = relatedGenres.map((genre) => ({
      ...genre,
      slug: genre.name.toLowerCase().replace(/\s+/g, "-"),
    }));

    res.status(200).json(relatedGenresWithSlugs);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};
