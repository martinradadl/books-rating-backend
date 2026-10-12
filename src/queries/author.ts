import { REGEX_QUERY } from "./global";

export const MATCH_BY_AUTHOR_NAME_QUERY = (authorName: string) => ({
  $match: {
    name: REGEX_QUERY({ regex: authorName, option: "i", exact: true }),
  },
});

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
