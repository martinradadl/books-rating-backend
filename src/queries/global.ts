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

export const LOOKUP_AUTHOR_BOOKS_QUERY = {
  $lookup: {
    from: "books",
    localField: "_id",
    foreignField: "author",
    as: "books",
  },
};

export const LOOKUP_AUTHOR_BOOKS_RATINGS_QUERY = {
  $lookup: {
    from: "ratings",
    localField: "books._id",
    foreignField: "book",
    as: "ratings",
  },
};
