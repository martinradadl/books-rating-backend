import { Request, Response } from "express";
import * as editionModel from "../models/edition";
import * as bookModel from "../models/book";
import { MONGO_ERRORS } from "../helpers/constants";
import mongoose from "mongoose";

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
    const editionId = req.params.id;
    const edition = await editionModel.Edition.findById(editionId).populate({
      path: "book",
      populate: [
        { path: "author" },
        { path: "relatedGenres" },
        { path: "characters" },
        { path: "settings" },
      ],
    });

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
    const editionId = req.query?.editionId;
    const bookId = req.query?.bookId;

    const editionsList = await editionModel.Edition.find({
      book: bookId,
      _id: { $ne: new mongoose.Types.ObjectId(editionId as string) },
    }).populate({
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
    const authorId = req.query?.authorId;
    const bookId = req.query?.bookId;

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
          "book.author._id": new mongoose.Types.ObjectId(authorId as string),
          "book._id": { $ne: new mongoose.Types.ObjectId(bookId as string) },
        },
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
    const authorId = req.query?.authorId;
    const bookId = req.query?.bookId;

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
            $ne: new mongoose.Types.ObjectId(authorId as string),
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
        $group: {
          _id: "$book",
          edition: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: { newRoot: "$edition" },
      },
    ]);

    res.status(200).json(editionsList);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};
