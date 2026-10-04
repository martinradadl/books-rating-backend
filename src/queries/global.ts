import { Types } from "mongoose";

type RegexOption = "i" | "m" | "x" | "s" | "u";

export const REGEX_QUERY = (regex: string, option?: RegexOption) => ({
  $regex: `^${regex}$`,
  ...(option && { $options: option }),
});

export const CALCULATE_AND_ADD_RATING_DATA_QUERY = {
  $addFields: {
    ratingCount: { $size: "$ratings" },
    averageRating: {
      $round: [{ $ifNull: [{ $avg: "$ratings.score" }, 0] }, 2],
    },
  },
};

export const UNWIND_PRESERVE_NULL_AND_EMPTY_ARRAYS_QUERY = (path: string) => ({
  $unwind: {
    path,
    preserveNullAndEmptyArrays: true,
  },
});

export const MATCH_BOOK_IDS_QUERY = (bookIds: Types.ObjectId[]) => ({
  $match: {
    book: { $in: bookIds },
  },
});

export const MATCH_BY_BOOK_ID_QUERY = {
  $match: {
    $expr: {
      $eq: ["$book", "$$bookId"],
    },
  },
};

export const COUNT_RESULTS_QUERY = [
  {
    $count: "count",
  },
];
