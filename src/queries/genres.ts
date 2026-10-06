import { Types, PipelineStage } from "mongoose";

export const RANK_BY_GENRE_OVERLAP_QUERY = (
  relatedGenres: Types.ObjectId[],
): PipelineStage[] => [
  {
    $addFields: {
      genreOverlap: {
        $size: {
          $setIntersection: ["$book.relatedGenres", relatedGenres],
        },
      },
    },
  },
  {
    $match: {
      genreOverlap: { $gt: 0 },
    },
  },
  {
    $sort: {
      genreOverlap: -1,
    },
  },
];

export const LOOKUP_BOOK_GENRES_AND_UNWIND_QUERY: PipelineStage[] = [
  {
    $lookup: {
      from: "genres",
      localField: "_id",
      foreignField: "_id",
      as: "genre",
    },
  },

  { $unwind: "$genre" },
];

export const GROUP_BY_RELATED_GENRES_AND_COUNT_QUERY = {
  $group: {
    _id: "$relatedGenres",
    count: { $sum: 1 },
  },
};

export const LOOKUP_GENRES_FROM_RELATED_GENRES_QUERY = {
  $lookup: {
    from: "genres",
    localField: "relatedGenres",
    foreignField: "_id",
    as: "genres",
  },
};

export const MATCH_BY_GENRE_NAME_QUERY = (genreName: string) => ({
  $match: {
    "genres.name": genreName,
  },
});
