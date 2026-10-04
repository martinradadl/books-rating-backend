import { Types } from "mongoose";

type RegexOption = "i" | "m" | "x" | "s" | "u";

export const REGEX_QUERY = (regex: string, option?: RegexOption) => ({
  $regex: `^${regex}$`,
  ...(option && { $options: option }),
});

export const ADD_RATINGS_DATA_FIELDS_QUERY = {
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
