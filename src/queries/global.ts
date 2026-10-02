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
