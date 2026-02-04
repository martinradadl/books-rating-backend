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
  getById,
  getLatestReleases,
} from "../controllers/book-list";
import {
  fakeBookList,
  fakeListOfAllBookLists,
  fakeListOfAllBookListsWithToObject,
  fakeListOfAllBookListsWithURL,
  getBookListsPageWithToObject,
} from "./fake-data/book-list";
import { Edition } from "../models/edition";
import { fakeEditionsList } from "./fake-data/edition";

vi.mock("../models/book-list.ts");
vi.mock("../models/edition.ts");

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

  describe("Get Book List by ID", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when error is thrown getting an book list by id", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(BookList.findById, true).mockImplementation(() => {
        throw mockedCatchError;
      });

      await getById(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 200 and the selected book list", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(BookList.findById, true).mockResolvedValue(fakeBookList as any);

      await getById(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeBookList);
    });
  });

  describe("Get Latest Releases", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when error is thrown getting latest releases", async () => {
      const { req, res } = initializeReqResMocks();

      vi.mocked(Edition.aggregate, true).mockImplementation(() => {
        throw mockedCatchError;
      });

      await getLatestReleases(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 200 and latest releases", async () => {
      const { req, res } = initializeReqResMocks();

      vi.mocked(Edition.aggregate, true).mockResolvedValue(fakeEditionsList);

      await getLatestReleases(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeEditionsList);
    });
  });
});
