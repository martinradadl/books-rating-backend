import { afterEach, describe, expect, it, vi } from "vitest";
import { initializeReqResMocks, mockedCatchError } from "./utils";
import { Rating } from "../models/rating";
import { add, getRatingDistributionByScore } from "../controllers/rating";
import { fakeRating, fakeRatingDistribution } from "./fake-data/rating";

vi.mock("../models/rating.ts");

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

  describe("Get Rating Distribution By Score Controller", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when error is thrown getting rating distribution", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Rating.aggregate, true).mockImplementation(() => {
        throw mockedCatchError;
      });

      await getRatingDistributionByScore(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 200 and get rating distribution", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Rating.aggregate, true).mockResolvedValue([
        fakeRatingDistribution,
      ]);

      await getRatingDistributionByScore(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeRatingDistribution);
    });
  });
});
