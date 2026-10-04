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
