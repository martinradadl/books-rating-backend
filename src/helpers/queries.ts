import { PipelineStage } from "mongoose";

export const GROUP_FIRST_EDITION_BY_BOOK_QUERY = {
  _id: "$book",
  edition: { $first: "$$ROOT" },
};

export const FILTER_BY_GENRE = (genreName: string): PipelineStage[] =>
  genreName
    ? [
        {
          $lookup: {
            from: "genres",
            localField: "book.relatedGenres",
            foreignField: "_id",
            as: "genres",
          },
        },
        {
          $match: {
            "genres.name": genreName,
          },
        },
      ]
    : [];
