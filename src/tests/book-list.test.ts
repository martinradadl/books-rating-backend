import { afterEach, describe, expect, it, vi } from "vitest";
import {
  defaultGetAllQueryObjectAndPopulate,
  initializeReqResMocks,
  mockedCatchDuplicateKeyError,
  mockedCatchError,
} from "./utils";
import { BookList } from "../models/book-list";
import { addBookList, getAll, getByTitle } from "../controllers/book-list";
import {
  fakeBookList,
  fakeListOfAllBookListsWithURL,
  getBookListsPageWithToObject,
} from "./fake-data/book-list";

vi.mock("../models/book-list.ts");

describe("Book List Controller", () => {
  describe("Add Book List Controller", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when error is thrown adding a book list", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(BookList.create, true).mockImplementation(() => {
        throw mockedCatchError;
      });

      await addBookList(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 409 when book list already exists", async () => {
      const { req, res } = initializeReqResMocks();
      req.body = fakeBookList;

      vi.mocked(BookList.create).mockImplementation(() => {
        throw mockedCatchDuplicateKeyError(fakeBookList.title);
      });

      await addBookList(req, res);

      expect(res.statusCode).toBe(409);
      expect(res._getJSONData()).toEqual({
        message: `Adding not successful, book list ${fakeBookList.title} already exists`,
      });
    });

    it("should return 200 and the created book list", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(BookList.create, true).mockResolvedValue(fakeBookList as any);

      await addBookList(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeBookList);
    });
  });

  describe("Get All Book Lists", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when error is thrown getting all book lists", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(BookList.find, true).mockImplementation(() => {
        throw mockedCatchError;
      });

      await getAll(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 200 all the lists", async () => {
      const { req, res } = initializeReqResMocks();

      const result = getBookListsPageWithToObject();
      //@ts-expect-error Unsolved error with mockImplementation function
      vi.mocked(BookList.find, true).mockImplementation(() => {
        return defaultGetAllQueryObjectAndPopulate(result, 2);
      });

      await getAll(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeListOfAllBookListsWithURL);
    });
  });

  describe("Get Book List by Title", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when error is thrown getting an book list by title", async () => {
      const { req, res } = initializeReqResMocks();
      req.params.title = "fake-title";

      vi.mocked(BookList.aggregate, true).mockImplementation(() => {
        throw mockedCatchError;
      });

      await getByTitle(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 200 and the selected book list", async () => {
      const { req, res } = initializeReqResMocks();
      req.params.title = "fake-title";

      vi.mocked(BookList.aggregate, true).mockResolvedValue([
        fakeBookList as any,
      ]);

      await getByTitle(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeBookList);
    });
  });
});
