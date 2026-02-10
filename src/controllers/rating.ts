import { Request, Response } from "express";
import * as ratingModel from "../models/rating";
import * as editionModel from "../models/edition";
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

export const getByBook = async (req: Request, res: Response) => {
  try {
    const bookId = req.params.bookId;

    const bookRatings = await ratingModel.Rating.find({
      book: bookId,
    });

    res.status(200).json(bookRatings);
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

export const getMostRatedBooks = async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query?.limit) || 5;

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

    res.status(200).json(orderedEditions);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const getBestRatedBooks = async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query?.limit) || 5;

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

    res.status(200).json(orderedEditions);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};
