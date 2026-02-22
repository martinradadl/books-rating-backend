import mongoose from "mongoose";
import * as bookModel from "../models/book";
import * as editionModel from "../models/edition";

export const parseToObjectId = (id: string) => {
  return new mongoose.Types.ObjectId(id);
};

export const getRelatedBookSuggestion = async (bookId: string) => {
  const book = await bookModel.Book.findById(bookId)
    .select("relatedGenres")
    .lean();
  const relatedGenres = book?.relatedGenres;

  const [suggestion] = await editionModel.Edition.aggregate([
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
      $match: {
        "book._id": {
          $ne: parseToObjectId(bookId),
        },
      },
    },
    {
      $addFields: {
        genreOverlap: {
          $size: {
            $setIntersection: ["$book.relatedGenres", relatedGenres],
          },
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
    {
      $lookup: {
        from: "genres",
        localField: "book.relatedGenres",
        foreignField: "_id",
        as: "book.relatedGenres",
      },
    },
    { $project: { genreOverlap: 0 } },
    { $limit: 1 },
  ]);

  return suggestion;
};
