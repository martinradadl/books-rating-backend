export const LOOKUP_BOOK_QUERY = {
  $lookup: {
    from: "books",
    localField: "book",
    foreignField: "_id",
    as: "book",
  },
};

export const LOOKUP_AUTHOR_FROM_EDITIONS_QUERY = {
  $lookup: {
    from: "authors",
    localField: "book.author",
    foreignField: "_id",
    as: "book.author",
  },
};

export const LOOKUP_RATINGS_FROM_EDITIONS_QUERY = {
  $lookup: {
    from: "ratings",
    localField: "book._id",
    foreignField: "book",
    as: "ratings",
  },
};

export const REMOVE_TEMPORARY_RATINGS_QUERY = {
  $project: {
    ratings: 0,
  },
};

export const GROUP_FIRST_EDITION_BY_BOOK_QUERY = {
  $group: {
    _id: "$book",
    edition: { $first: "$$ROOT" },
  },
};

export const REPLACE_ROOT_WITH_EDITION_QUERY = {
  $replaceRoot: { newRoot: "$edition" },
};

export const LOOKUP_GENRES_FROM_EDITIONS_QUERY = (as = "genres") => ({
  $lookup: {
    from: "genres",
    localField: "book.relatedGenres",
    foreignField: "_id",
    as,
  },
});

export const ADD_RATING_DATA_QUERY = {
  $addFields: {
    averageRating: {
      $round: [{ $ifNull: ["$ratingData.averageRating", 0] }, 2],
    },
    ratingCount: { $ifNull: ["$ratingData.ratingCount", 0] },
  },
};

export const REMOVE_TEMPORARY_RATING_DATA_QUERY = {
  $project: {
    ratingData: 0,
  },
};

export const PROJECT_TOTAL_COUNT_QUERY = {
  $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0],
};
