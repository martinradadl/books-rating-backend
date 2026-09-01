import { Request, Response } from "express";
import * as bookListModel from "../models/book-list";
import * as ratingModel from "../models/rating";
import { MONGO_ERRORS } from "../helpers/constants";
import {
  RATING_DATA_LOOKUP_QUERY,
  UNWIND_PRESERVE_NULL_AND_EMPTY_ARRAYS_QUERY,
} from "../helpers/queries";
import mongoose from "mongoose";
import { parseUrlSlugToCapitalizedString } from "../helpers/utils";

export const addBookList = async (req: Request, res: Response) => {
  try {
    const { title, description, books } = req.body;

    const newBookList = await bookListModel.BookList.create({
      title,
      books,
      description,
    });

    res.status(200).json(newBookList);
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message.includes(MONGO_ERRORS.DuplicateKey)) {
        const bookListTitle = err.message.split(`"`)[1];
        res.status(409).json({
          message: `Adding not successful, book list ${bookListTitle} already exists`,
        });
        return;
      }

      res.status(500).json({ message: err.message });
    }
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query?.page as string) || 1;
    const limit = parseInt(req.query?.limit as string) || 0;
    const itemLimit = parseInt(req.query?.itemLimit as string) || 0;
    const withCarouselData = req.query?.carouselData === "true";
    const withBooksCount = req.query?.booksCount === "true";

    const query = bookListModel.BookList.find()
      .limit(limit)
      .skip((page - 1) * limit)
      .populate({
        path: "books",
        ...(itemLimit > 0 && {
          perDocumentLimit: itemLimit,
        }),
        ...(withCarouselData && {
          populate: {
            path: "book",
            populate: {
              path: "author",
              select: "name",
            },
          },
        }),
      });

    const bookLists = await query;

    let booksCountMap = new Map<string, number>();
    let bookListsEditionsWithRatingData = [] as unknown[];

    if (withBooksCount) {
      const bookListIds = bookLists.map((list) => list._id);

      const booksCounts = await bookListModel.BookList.aggregate<{
        _id: mongoose.Types.ObjectId;
        booksCount: number;
      }>([
        {
          $match: {
            _id: { $in: bookListIds },
          },
        },
        {
          $project: {
            booksCount: { $size: "$books" },
          },
        },
      ]);

      booksCountMap = new Map(
        booksCounts.map((item) => [String(item._id), item.booksCount]),
      );
    }

    if (withCarouselData) {
      type PopulatedEdition = {
        book: {
          _id: mongoose.Types.ObjectId;
        };
        toObject: () => Record<string, unknown>;
      };

      const bookIds = bookLists.flatMap((list) =>
        (list.books as unknown as PopulatedEdition[]).map(
          (edition) => edition.book._id,
        ),
      );

      const ratingData = await ratingModel.Rating.aggregate<{
        _id: mongoose.Types.ObjectId;
        averageRating: number;
        ratingCount: number;
      }>([
        {
          $match: {
            book: { $in: bookIds },
          },
        },
        {
          $group: {
            _id: "$book",
            averageRating: { $avg: "$score" },
            ratingCount: { $sum: 1 },
          },
        },
      ]);

      const ratingsMap = new Map(
        ratingData.map((rating) => [
          String(rating._id),
          {
            averageRating: rating.averageRating ?? 0,
            ratingCount: rating.ratingCount ?? 0,
          },
        ]),
      );

      bookListsEditionsWithRatingData = bookLists.map((list) => {
        const editions = list.books as unknown as PopulatedEdition[];

        return editions.map((edition) => {
          const rating = ratingsMap.get(String(edition.book?._id));

          return {
            ...edition.toObject(),
            averageRating: rating?.averageRating ?? 0,
            ratingCount: rating?.ratingCount ?? 0,
          };
        });
      });
    }

    const result = bookLists.map((list, index) => {
      return {
        ...list.toObject(),
        ...(withCarouselData && {
          books: bookListsEditionsWithRatingData[index],
        }),
        urlPath: String(list.toObject().title)
          .toLowerCase()
          .replace(/\s+/g, "-"),
        ...(withBooksCount && {
          booksCount: booksCountMap.get(String(list.toObject()._id)) ?? 0,
        }),
      };
    });

    res.status(200).json(result);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const getByTitle = async (req: Request, res: Response) => {
  try {
    const rawTitle = req.params.title;
    const titlePattern = rawTitle.replace(/-/g, " ");

    const page = parseInt(req.query?.page as string) || 1;
    const limit = parseInt(req.query?.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [bookList] = await bookListModel.BookList.aggregate([
      {
        $match: { title: { $regex: `^${titlePattern}$`, $options: "i" } },
      },
      {
        $lookup: {
          from: "editions",
          localField: "books",
          foreignField: "_id",
          as: "books",
          pipeline: [
            { $sort: { createdAt: -1 } },

            {
              $facet: {
                data: [
                  { $skip: skip },
                  { $limit: limit },

                  {
                    $lookup: {
                      from: "books",
                      localField: "book",
                      foreignField: "_id",
                      as: "book",
                    },
                  },
                  {
                    $unwind: {
                      path: "$book",
                      preserveNullAndEmptyArrays: true,
                    },
                  },

                  {
                    $lookup: {
                      from: "authors",
                      localField: "book.author",
                      foreignField: "_id",
                      as: "book.author",
                    },
                  },
                  {
                    $unwind: {
                      path: "$book.author",
                      preserveNullAndEmptyArrays: true,
                    },
                  },

                  {
                    $lookup: RATING_DATA_LOOKUP_QUERY("$book._id"),
                  },
                  {
                    $unwind:
                      UNWIND_PRESERVE_NULL_AND_EMPTY_ARRAYS_QUERY(
                        "$ratingData",
                      ),
                  },
                  {
                    $addFields: {
                      averageRating: {
                        $ifNull: ["$ratingData.averageRating", 0],
                      },
                      ratingCount: { $ifNull: ["$ratingData.ratingCount", 0] },
                    },
                  },
                  {
                    $project: { ratingData: 0 },
                  },
                ],

                totalCount: [{ $count: "count" }],
              },
            },
            {
              $unwind: {
                path: "$totalCount",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $addFields: {
                booksCount: { $ifNull: ["$totalCount.count", 0] },
              },
            },
            {
              $project: {
                totalCount: 0,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$books",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          booksCount: { $ifNull: ["$books.booksCount", 0] },
          books: { $ifNull: ["$books.data", []] },
        },
      },
    ]);

    res.status(200).json(bookList);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const getByRelatedGenre = async (req: Request, res: Response) => {
  try {
    const genreNameSlug = req.params.name;
    const genreName = parseUrlSlugToCapitalizedString(genreNameSlug);

    const page = parseInt(req.query?.page as string) || 1;
    const limit = parseInt(req.query?.limit as string) || 8;
    const itemLimit = parseInt(req.query?.itemLimit as string) || 0;
    const skip = (page - 1) * limit;

    const result = await bookListModel.BookList.aggregate([
      {
        $lookup: {
          from: "genres",
          localField: "relatedGenres",
          foreignField: "_id",
          as: "matchedGenres",
        },
      },

      {
        $match: {
          "matchedGenres.name": genreName,
        },
      },

      {
        $facet: {
          bookLists: [
            {
              $set: {
                booksCount: { $size: "$books" },
              },
            },

            {
              $skip: skip,
            },

            {
              $limit: limit,
            },

            ...(itemLimit > 0
              ? [
                  {
                    $set: {
                      books: { $slice: ["$books", itemLimit] },
                    },
                  },
                ]
              : []),

            {
              $lookup: {
                from: "editions",
                localField: "books",
                foreignField: "_id",
                as: "books",
              },
            },

            {
              $project: {
                matchedGenres: 0,
              },
            },
          ],

          bookListsCount: [
            {
              $count: "count",
            },
          ],
        },
      },

      {
        $project: {
          bookLists: 1,
          bookListsCount: {
            $ifNull: [{ $arrayElemAt: ["$bookListsCount.count", 0] }, 0],
          },
        },
      },
    ]);

    const { bookLists, bookListsCount } = result[0];

    res.status(200).json({
      bookLists,
      bookListsCount,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};
