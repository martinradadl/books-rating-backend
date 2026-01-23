import { afterEach, describe, expect, it, vi } from "vitest";
import {
  defaultGetAllQueryObject,
  initializeReqResMocks,
  mockedCatchDuplicateKeyError,
  mockedCatchError,
} from "./utils";
import { Author } from "../models/author";
import { add, getAll, getById } from "../controllers/author";
import {
  fakeAuthor,
  fakeAuthorsList,
  getAuthorsPage,
} from "./fake-data/author";

vi.mock("../models/author.ts");

describe("Author Controller", () => {
  describe("Add Author Controller", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when error is thrown adding an author", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Author.create, true).mockImplementation(() => {
        throw mockedCatchError;
      });

      await add(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 409 when author already exists", async () => {
      const { req, res } = initializeReqResMocks();
      req.body = fakeAuthor;

      vi.mocked(Author.create).mockImplementation(() => {
        throw mockedCatchDuplicateKeyError(fakeAuthor.name);
      });

      await add(req, res);

      expect(res.statusCode).toBe(409);
      expect(res._getJSONData()).toEqual({
        message: `Adding not successful, author ${fakeAuthor.name} already exists`,
      });
    });

    it("should return 200 and the created author", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Author.create, true).mockResolvedValue(fakeAuthor as any);

      await add(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeAuthor);
    });
  });

  describe("Get Author by ID", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when error is thrown getting an author by id", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Author.findById, true).mockImplementation(() => {
        throw mockedCatchError;
      });

      await getById(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 200 and the selected author", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Author.findById, true).mockResolvedValue(fakeAuthor as any);

      await getById(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeAuthor);
    });
  });

  describe("Get All Authors", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when error is thrown getting all authors", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Author.find, true).mockImplementation(() => {
        throw mockedCatchError;
      });

      await getAll(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 200 and all authors list", async () => {
      const { req, res } = initializeReqResMocks();

      const result = getAuthorsPage();
      //@ts-expect-error Unsolved error with mockImplementation function
      vi.mocked(Author.find, true).mockImplementation(() => {
        return defaultGetAllQueryObject(result);
      });

      await getAll(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeAuthorsList);
    });
  });
});
