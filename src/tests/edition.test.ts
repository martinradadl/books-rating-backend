import { afterEach, describe, expect, it, vi } from "vitest";
import {
  defaultGetAllQueryObject,
  defaultGetByIdQueryObject,
  initializeReqResMocks,
  mockedCatchDuplicateKeyError,
  mockedCatchError,
} from "./utils";
import { Edition } from "../models/edition";
import { Book } from "../models/book";
import { add, getAll, getById } from "../controllers/edition";
import {
  fakeEdition,
  fakeEditionsList,
  getEditionsPage,
} from "./fake-data/edition";
import { fakeBook } from "./fake-data/book";

vi.mock("../models/edition.ts");
vi.mock("../models/book.ts");

describe("Edition Controller", () => {
  describe("Add Edition Controller", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when error is thrown adding an edition", async () => {
      const { req, res } = initializeReqResMocks();

      vi.mocked(Book.findById, true).mockResolvedValue(fakeEdition);
      vi.mocked(Edition.create, true).mockImplementation(() => {
        throw mockedCatchError;
      });

      await add(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 404 when book is not found", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Book.findById, true).mockResolvedValue(null);

      await add(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({
        message: "Add not successful",
        error: "Book not found",
      });
    });

    it("should return 409 when edition already exists", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Book.findById, true).mockResolvedValue(fakeBook);
      vi.mocked(Edition.create).mockImplementation(() => {
        throw mockedCatchDuplicateKeyError(fakeEdition.ISBN);
      });

      await add(req, res);

      expect(res.statusCode).toBe(409);
      expect(res._getJSONData()).toEqual({
        message: `Adding not successful, an edition with ISBN ${fakeEdition.ISBN} already exists`,
      });
    });

    it("should return 200 and the created edition", async () => {
      const { req, res } = initializeReqResMocks();

      vi.mocked(Book.findById, true).mockResolvedValue(fakeBook);
      vi.mocked(Edition.create, true).mockResolvedValue(fakeEdition as any);

      await add(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeEdition);
    });
  });

  describe("Get Edition by ID", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when getting an edition by id", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Edition.findById, true).mockImplementation(() => {
        throw mockedCatchError;
      });

      await getById(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 200 and the selected edition", async () => {
      const { req, res } = initializeReqResMocks();

      //@ts-expect-error Unsolved error with mockImplementation function
      vi.mocked(Edition.findById, true).mockImplementation(() => {
        return defaultGetByIdQueryObject(fakeEdition);
      });

      await getById(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeEdition);
    });
  });

  describe("Get All Editions", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when getting all editions", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Edition.find, true).mockImplementation(() => {
        throw mockedCatchError;
      });

      await getAll(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 200 and all editions list", async () => {
      const { req, res } = initializeReqResMocks();

      const result = getEditionsPage();
      //@ts-expect-error Unsolved error with mockImplementation function
      vi.mocked(Edition.find, true).mockImplementation(() => {
        return defaultGetAllQueryObject(result);
      });

      await getAll(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeEditionsList);
    });
  });
});
