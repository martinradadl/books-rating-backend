import mongoose from "mongoose";
import * as bookModel from "../models/book";
import * as editionModel from "../models/edition";
import {
  GROUP_FIRST_EDITION_BY_BOOK_QUERY,
  LOOKUP_BOOK_QUERY,
  LOOKUP_GENRES_FROM_EDITIONS_QUERY,
  REPLACE_ROOT_WITH_EDITION_QUERY,
} from "../queries/editions";
import { RANK_BY_GENRE_OVERLAP_QUERY } from "../queries/genres";

export const parseToObjectId = (id: string) => {
  return new mongoose.Types.ObjectId(id);
};

export const getRelatedBookSuggestion = async (bookId: string) => {
  const book = await bookModel.Book.findById(bookId)
    .select("relatedGenres")
    .lean<{ relatedGenres: mongoose.Types.ObjectId[] }>();

  const relatedGenres = book?.relatedGenres ?? [];

  const [suggestion] = await editionModel.Edition.aggregate([
    LOOKUP_BOOK_QUERY,
    { $unwind: "$book" },
    {
      $match: {
        "book._id": {
          $ne: parseToObjectId(bookId),
        },
      },
    },

    ...RANK_BY_GENRE_OVERLAP_QUERY(relatedGenres),

    GROUP_FIRST_EDITION_BY_BOOK_QUERY,
    REPLACE_ROOT_WITH_EDITION_QUERY,

    LOOKUP_GENRES_FROM_EDITIONS_QUERY("book.relatedGenres"),
    { $project: { genreOverlap: 0 } },
    { $limit: 1 },
  ]);

  return suggestion;
};

export const parseUrlSlugToCapitalizedString = (slug: string) => {
  if (slug === "undefined") {
    return "";
  }
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const parseUrlSlugsToGenresList = (list: any[]) => {
  return list.map((genre) => ({
    ...genre,
    slug: genre.name.toLowerCase().replace(/\s+/g, "-"),
  }));
};
