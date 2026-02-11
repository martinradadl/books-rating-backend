import { Request, Response } from "express";
import * as ratingModel from "../models/rating";
import mongoose from "mongoose";

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

export const getCountByBook = async (req: Request, res: Response) => {
  try {
    const bookId = req.params.bookId;

    const count = await ratingModel.Rating.countDocuments({
      book: bookId,
    });

    res.status(200).json(count);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const getMeanRatingByBook = async (req: Request, res: Response) => {
  try {
    const bookId = new mongoose.Types.ObjectId(req.params.bookId);

    const result = await ratingModel.Rating.aggregate([
      {
        $match: {
          book: bookId,
        },
      },
      {
        $group: {
          _id: null,
          averageScore: { $avg: "$score" },
        },
      },
    ]);

    const averageScore = result.length ? result[0].averageScore : 0;

    res.status(200).json(averageScore);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};
