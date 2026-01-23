import { afterEach, describe, expect, it, vi } from "vitest";
import {
  defaultGetAllQueryObjectAndSort,
  initializeReqResMocks,
  mockedCatchDuplicateKeyError,
  mockedCatchError,
} from "./utils";
import { Genre } from "../models/genre";
import { add, getAll, getById } from "../controllers/genre";
import {
  fakeGenre,
  fakeGenresListWithURL,
  getGenresPage,
} from "./fake-data/genre";

vi.mock("../models/genre.ts");

describe("Genre Controller", () => {
  describe("Add Genre Controller", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when error is thrown adding an genre", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Genre.create, true).mockImplementation(() => {
        throw mockedCatchError;
      });

      await add(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 409 when genre already exists", async () => {
      const { req, res } = initializeReqResMocks();
      req.body = fakeGenre;

      vi.mocked(Genre.create).mockImplementation(() => {
        throw mockedCatchDuplicateKeyError(fakeGenre.name);
      });

      await add(req, res);

      expect(res.statusCode).toBe(409);
      expect(res._getJSONData()).toEqual({
        message: `Adding not successful, genre ${fakeGenre.name} already exists`,
      });
    });

    it("should return 200 and the created genre", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Genre.create, true).mockResolvedValue(fakeGenre as any);

      await add(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeGenre);
    });
  });

  describe("Get Genre by ID", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when error is thrown getting a genre by id", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Genre.findById, true).mockImplementation(() => {
        throw mockedCatchError;
      });

      await getById(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 200 and the selected genre", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Genre.findById, true).mockResolvedValue(fakeGenre as any);

      await getById(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeGenre);
    });
  });

  describe("Get All Genres", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when error is thrown getting all genres", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Genre.find, true).mockImplementation(() => {
        throw mockedCatchError;
      });

      await getAll(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 200 and all genres list", async () => {
      const { req, res } = initializeReqResMocks();

      const result = getGenresPage();
      //@ts-expect-error Unsolved error with mockImplementation function
      vi.mocked(Genre.find, true).mockImplementation(() => {
        return defaultGetAllQueryObjectAndSort(result);
      });

      await getAll(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeGenresListWithURL);
    });
  });
});
