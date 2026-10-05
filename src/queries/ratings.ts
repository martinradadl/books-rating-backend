import { MATCH_BY_BOOK_ID_QUERY } from "./global";

export const LOOKUP_RATING_DATA_QUERY = (bookId: string) => ({
  $lookup: {
    from: "ratings",
    let: { bookId },
    pipeline: [
      MATCH_BY_BOOK_ID_QUERY,
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$score" },
          ratingCount: { $sum: 1 },
        },
      },
    ],
    as: "ratingData",
  },
});
