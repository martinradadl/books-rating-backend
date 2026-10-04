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
