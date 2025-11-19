import { afterEach, describe, expect, it, vi } from "vitest";
import {
  defaultGetAllQueryObject,
  defaultGetByIdQueryObject,
  initializeReqResMocks,
  mockedCatchDuplicateKeyError,
  mockedCatchError,
} from "./utils";
import { Book } from "../models/book";
import { Author } from "../models/author";
import { add, getAll, getById } from "../controllers/book";
import { fakeBook, fakeBooksList, getBooksPage } from "./fake-data/book";
import { fakeAuthor } from "./fake-data/author";

vi.mock("../models/book.ts");
vi.mock("../models/author.ts");

describe("Book Controller", () => {
  describe("Add Book Controller", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when error is thrown adding an book", async () => {
      const { req, res } = initializeReqResMocks();

      vi.mocked(Author.findById, true).mockResolvedValue(fakeBook);
      vi.mocked(Book.create, true).mockImplementation(() => {
        throw mockedCatchError;
      });

      await add(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 404 when author is not found", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Author.findById, true).mockResolvedValue(null);

      await add(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({
        message: "Add not successful",
        error: "Author not found",
      });
    });

    it("should return 409 when book already exists", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Author.findById, true).mockResolvedValue(fakeAuthor);
      vi.mocked(Book.create).mockImplementation(() => {
        throw mockedCatchDuplicateKeyError(fakeBook.originalTitle);
      });

      await add(req, res);

      expect(res.statusCode).toBe(409);
      expect(res._getJSONData()).toEqual({
        message: `Adding not successful, title ${fakeBook.originalTitle} from this author already exists`,
      });
    });

    it("should return 200 and the created book", async () => {
      const { req, res } = initializeReqResMocks();

      vi.mocked(Author.findById, true).mockResolvedValue(fakeAuthor);
      vi.mocked(Book.create, true).mockResolvedValue(fakeBook as any);

      await add(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeBook);
    });
  });

  describe("Get Book by ID", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when error is thrown getting a book by id", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Book.findById, true).mockImplementation(() => {
        throw mockedCatchError;
      });

      await getById(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 200 and the selected book", async () => {
      const { req, res } = initializeReqResMocks();
      //@ts-expect-error Unsolved error with mockImplementation function
      vi.mocked(Book.findById, true).mockImplementation(() => {
        return defaultGetByIdQueryObject(fakeBook, 4);
      });

      await getById(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeBook);
    });
  });

  describe("Get All Books", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when error is thrown getting all books", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Book.find, true).mockImplementation(() => {
        throw mockedCatchError;
      });

      await getAll(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 200 and all books list", async () => {
      const { req, res } = initializeReqResMocks();

      const result = getBooksPage();
      //@ts-expect-error Unsolved error with mockImplementation function
      vi.mocked(Book.find, true).mockImplementation(() => {
        return defaultGetAllQueryObject(result, 4);
      });

      await getAll(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeBooksList);
    });
  });
});
