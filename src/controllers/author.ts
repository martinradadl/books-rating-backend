import { Request, Response } from "express";
import * as authorModel from "../models/author";
import * as ratingModel from "../models/rating";
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

    const author = await authorModel.Author.findOne({
      name: { $regex: `^${authorName}$`, $options: "i" },
    });

    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }
    console.log("author: ", author);

    const stats = await ratingModel.Rating.aggregate([
      {
        $lookup: {
          from: "books",
          localField: "book",
          foreignField: "_id",
          as: "book",
        },
      },
      {
        $unwind: "$book",
      },
      {
        $match: {
          "book.author": author._id,
        },
      },
      {
        $group: {
          _id: null,
          ratingCount: { $sum: 1 },
          averageRating: { $avg: "$score" },
        },
      },
    ]);
    console.log("after aggregate: ", stats);

    const averageRating = stats[0]?.averageRating ?? 0;
    console.log("rating count: ", stats[0]?.ratingCount ?? 0);
    console.log("average rating: ", averageRating);

    const result = {
      ...author.toObject(),
      ratingCount: stats[0]?.ratingCount ?? 0,
      averageRating: Number(averageRating.toFixed(2)),
    };


    res.status(200).json(result);
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
