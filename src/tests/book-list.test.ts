import { afterEach, describe, expect, it, vi } from "vitest";
import {
  defaultGetAllQueryObjectAndPopulate,
  initializeReqResMocks,
  mockedCatchDuplicateKeyError,
  mockedCatchError,
} from "./utils";
import { BookList } from "../models/book-list";
import {
  addBookList,
  getAll,
  getByRelatedGenre,
  getByTitle,
  getMostCommonRelatedGenres,
} from "../controllers/book-list";
import {
  fakeBookList,
  fakeBooksCountAggregateResult,
  fakeBooksCountMap,
  fakeListOfAllBookListsWithURL,
  fakeListOfAllBookListsWithURLAndToObject,
  getBookListsPageWithToObject,
} from "./fake-data/book-list";
import { fakeGenresList, fakeGenresListWithURL } from "./fake-data/genre";

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
        return defaultGetAllQueryObjectAndPopulate(result);
      });

      console.log("result: ", result);

      await getAll(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(
        fakeListOfAllBookListsWithURLAndToObject,
      );
    });

    it("should return 200 all the lists with itemLimit", async () => {
      const { req, res } = initializeReqResMocks();
      req.query = { itemLimit: "2" };

      const result = getBookListsPageWithToObject();
      //@ts-expect-error Unsolved error with mockImplementation function
      vi.mocked(BookList.find, true).mockImplementation(() => {
        return defaultGetAllQueryObjectAndPopulate(result);
      });

      await getAll(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeListOfAllBookListsWithURL);
    });

    it("should return 200 all the lists with books count", async () => {
      const { req, res } = initializeReqResMocks();
      req.query = { booksCount: "true" };

      const result = getBookListsPageWithToObject();

      //@ts-expect-error Unsolved error with mockImplementation function
      vi.mocked(BookList.find, true).mockImplementation(() => {
        return defaultGetAllQueryObjectAndPopulate(result);
      });

      vi.mocked(BookList.aggregate, true).mockResolvedValue(
        fakeBooksCountAggregateResult,
      );

      await getAll(req, res);

      const fakeListOfAllBookListsWithBooksCount =
        fakeListOfAllBookListsWithURLAndToObject.map((list) => {
          return {
            ...list,
            booksCount: fakeBooksCountMap.get(String(list._id)) ?? 0,
          };
        });

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeListOfAllBookListsWithBooksCount);
    });
  });

  describe("Get Book List by Title", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when error is thrown getting a book list by title", async () => {
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

  describe("Get Book List by Related Genre", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when error is thrown getting the book lists with selected related genre", async () => {
      const { req, res } = initializeReqResMocks();
      req.params.name = "fake-genre";

      vi.mocked(BookList.aggregate, true).mockImplementation(() => {
        throw mockedCatchError;
      });

      await getByRelatedGenre(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 200 and the matched book lists", async () => {
      const { req, res } = initializeReqResMocks();
      req.params.name = "fake-genre";
      const bookListsCount = 2;

      vi.mocked(BookList.aggregate, true).mockResolvedValue([
        { bookLists: fakeBookList as any, bookListsCount },
      ]);

      await getByRelatedGenre(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        bookLists: fakeBookList as any,
        bookListsCount,
      });
    });
  });

  describe("Get Most Common Related Genres", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when error is thrown getting the related genres lists", async () => {
      const { req, res } = initializeReqResMocks();

      vi.mocked(BookList.aggregate, true).mockImplementation(() => {
        throw mockedCatchError;
      });

      await getMostCommonRelatedGenres(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 200 and the most common related genres lists", async () => {
      const { req, res } = initializeReqResMocks();

      vi.mocked(BookList.aggregate, true).mockResolvedValue(
        fakeGenresList as any,
      );

      await getMostCommonRelatedGenres(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeGenresListWithURL(true));
    });
  });
});
