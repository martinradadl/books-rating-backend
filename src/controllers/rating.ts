import { Request, Response } from "express";
import * as ratingModel from "../models/rating";
import { parseToObjectId } from "../helpers/utils";

export const add = async (req: Request, res: Response) => {
  try {
    const newRating = await ratingModel.Rating.create(req.body);
    res.status(200).json(newRating);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const getRatingDistributionByScore = async (
  req: Request,
  res: Response,
) => {
  try {
    const bookId = parseToObjectId(req.params.bookId);

    const [ratingDistribution] = await ratingModel.Rating.aggregate([
      {
        $match: {
          book: bookId,
        },
      },
      {
        $group: {
          _id: "$score",
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$count" },
          ratings: {
            $push: {
              k: { $toString: "$_id" },
              v: "$count",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          total: 1,
          ratings: {
            $mergeObjects: [
              { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 },
              { $arrayToObject: "$ratings" },
            ],
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$ratings", { total: "$total" }],
          },
        },
      },
    ]);

    res.status(200).json(ratingDistribution);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};
