import { afterEach, describe, expect, it, vi } from "vitest";
import { initializeReqResMocks, mockedCatchError } from "./utils";
import { Rating } from "../models/rating";
import { Edition } from "../models/edition";
import {
  add,
  getBestRatedBooks,
  getByBook,
  getCountByBook,
  getMeanRatingByBook,
  getMostRatedBooks,
} from "../controllers/rating";
import {
  fakeMostRatedBooks,
  fakeRating,
  fakeRatingsList,
} from "./fake-data/rating";
import { fakeEditionsList } from "./fake-data/edition";

vi.mock("../models/rating.ts");
vi.mock("../models/edition.ts");

describe("Rating Controller", () => {
  describe("Add Rating Controller", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when error is thrown adding an rating", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Rating.create, true).mockImplementation(() => {
        throw mockedCatchError;
      });

      await add(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 200 and the created rating", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Rating.create, true).mockResolvedValue(fakeRating as any);

      await add(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeRating);
    });
  });

  describe("Get Ratings by Book ID", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when error is thrown getting ratings by book id", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Rating.find, true).mockImplementation(() => {
        throw mockedCatchError;
      });

      await getByBook(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 200 and the selected ratings", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Rating.find, true).mockResolvedValue(fakeRatingsList as any);

      await getByBook(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeRatingsList);
    });
  });

  describe("Get Ratings Count By Book", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when error is thrown getting all ratings", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Rating.countDocuments, true).mockImplementation(() => {
        throw mockedCatchError;
      });

      await getCountByBook(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 200 and ratings count", async () => {
      const { req, res } = initializeReqResMocks();

      const fakeCountValue = 3;
      vi.mocked(Rating.countDocuments, true).mockResolvedValue(fakeCountValue);

      await getCountByBook(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeCountValue);
    });
  });

  describe("Get Rating Average By Book", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when error is thrown getting rating average", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Rating.aggregate, true).mockImplementation(() => {
        throw mockedCatchError;
      });

      await getMeanRatingByBook(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 200 and ratings average", async () => {
      const { req, res } = initializeReqResMocks();

      const fakeAvgScore = 3;
      vi.mocked(Rating.aggregate, true).mockResolvedValue([
        { averageScore: fakeAvgScore },
      ]);

      await getMeanRatingByBook(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeAvgScore);
    });
  });

  describe("Get Most Rated Books", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when error is thrown getting books", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Rating.aggregate, true).mockImplementation(() => {
        throw mockedCatchError;
      });

      await getMostRatedBooks(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 200 and most rated books", async () => {
      const { req, res } = initializeReqResMocks();

      vi.mocked(Rating.aggregate, true).mockResolvedValue(fakeMostRatedBooks);
      vi.mocked(Edition.aggregate, true).mockResolvedValue(fakeEditionsList);

      await getMostRatedBooks(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeEditionsList);
    });
  });

  describe("Get Most Rated Books", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when error is thrown getting books", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Rating.aggregate, true).mockImplementation(() => {
        throw mockedCatchError;
      });

      await getBestRatedBooks(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 200 and best rated books", async () => {
      const { req, res } = initializeReqResMocks();

      vi.mocked(Rating.aggregate, true).mockResolvedValue(fakeMostRatedBooks);
      vi.mocked(Edition.aggregate, true).mockResolvedValue(fakeEditionsList);

      await getBestRatedBooks(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeEditionsList);
    });
  });
});
