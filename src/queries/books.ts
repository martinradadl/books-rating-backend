import { Types } from "mongoose";

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
