export const LOOKUP_RATING_DATA_QUERY = (bookId: string) => ({
  $lookup: {
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
  },
});
