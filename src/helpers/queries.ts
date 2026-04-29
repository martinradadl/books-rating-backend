import { PipelineStage } from "mongoose";

export const RATING_ADD_FIELDS_QUERY = {
  ratingCount: { $size: "$ratings" },
  averageRating: {
    $cond: [{ $gt: [{ $size: "$ratings" }, 0] }, { $avg: "$ratings.score" }, 0],
  },
};

export const RATING_DATA_LOOKUP_QUERY = (bookId: string) => ({
  from: "ratings",
  let: { bookId },
  pipeline: [
    {
      $match: {
        $expr: { $eq: ["$book", "$$bookId"] },
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$score" },
        ratingCount: { $sum: 1 },
      },
    },
  ],
  as: "ratingData",
});

export const UNWIND_PRESERVE_NULL_AND_EMPTY_ARRAYS_QUERY = (path: string) => ({
  path,
  preserveNullAndEmptyArrays: true,
});

export const GROUP_FIRST_EDITION_BY_BOOK_QUERY = {
  _id: "$book",
  edition: { $first: "$$ROOT" },
};

export const LOOKUP_BOOK = (): PipelineStage[] => [
  {
    $lookup: {
      from: "books",
      localField: "book",
      foreignField: "_id",
      as: "book",
    },
  },
  { $unwind: "$book" },
];

export const FILTER_BY_GENRE = (genreName: string): PipelineStage[] =>
  genreName
    ? [
        {
          $lookup: {
            from: "genres",
            localField: "book.relatedGenres",
            foreignField: "_id",
            as: "genres",
          },
        },
        {
          $match: {
            "genres.name": genreName,
          },
        },
      ]
    : [];

export const LOOKUP_AUTHOR = (): PipelineStage[] => [
  {
    $lookup: {
      from: "authors",
      localField: "book.author",
      foreignField: "_id",
      as: "book.author",
    },
  },
  { $unwind: "$book.author" },
];
