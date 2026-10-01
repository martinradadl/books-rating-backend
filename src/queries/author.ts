import { REGEX_QUERY } from "./global";

export const AUTHOR_NAME_REGEX_QUERY = (authorName: string) => ({
  name: REGEX_QUERY(authorName, "i"),
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
