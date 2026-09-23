import { Request, Response } from "express";
import * as authorModel from "../models/author";
import { MONGO_ERRORS } from "../helpers/constants";
import { parseUrlSlugToCapitalizedString } from "../helpers/utils";

export const add = async (req: Request, res: Response) => {
  try {
    const { name, profilePic, description } = req.body;
    const newAuthor = await authorModel.Author.create({
      name,
      profilePic,
      description,
    });
    res.status(200).json(newAuthor);
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message.includes(MONGO_ERRORS.DuplicateKey)) {
        const authorName = err.message.split(`"`)[1];
        res.status(409).json({
          message: `Adding not successful, author ${authorName} already exists`,
        });
        return;
      }

      res.status(500).json({ message: err.message });
    }
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const authorId = req.params.id;
    const author = await authorModel.Author.findById(authorId);
    res.status(200).json(author);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const getByUrlSlug = async (req: Request, res: Response) => {
  try {
    const authorName = parseUrlSlugToCapitalizedString(req.params.slug);

    const result = await authorModel.Author.aggregate([
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
        $lookup: {
          from: "ratings",
          localField: "books._id",
          foreignField: "book",
          as: "ratings",
        },
      },
      {
        $addFields: {
          ratingCount: { $size: "$ratings" },
          averageRating: {
            $round: [{ $ifNull: [{ $avg: "$ratings.score" }, 0] }, 2],
          },
        },
      },
      {
        $project: {
          books: 0,
          ratings: 0,
        },
      },
      {
        $limit: 1,
      },
    ]);

    if (!result.length) {
      return res.status(404).json({ message: "Author not found" });
    }

    return res.status(200).json(result[0]);
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

    const authorsList = await authorModel.Author.find()
      .limit(limit)
      .skip((page - 1) * limit);

    res.status(200).json(authorsList);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};
