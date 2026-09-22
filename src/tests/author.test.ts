import { afterEach, describe, expect, it, vi } from "vitest";
import {
  defaultGetAllQueryObject,
  initializeReqResMocks,
  mockedCatchDuplicateKeyError,
  mockedCatchError,
} from "./utils";
import { Author } from "../models/author";
import { Rating } from "../models/rating";
import { add, getAll, getById, getByUrlSlug } from "../controllers/author";
import {
  fakeAuthor,
  fakeAuthorsList,
  getAuthorsPage,
} from "./fake-data/author";

vi.mock("../models/author.ts");
vi.mock("../models/rating.ts");

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

  describe("Get by URL Slug", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when url is not set", async () => {
      const { req, res } = initializeReqResMocks();
      req.params = { slug: "undefined" };
      vi.mocked(Author.findOne, true).mockImplementation(() => {
        throw mockedCatchError;
      });

      await getByUrlSlug(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 200 and the selected author", async () => {
      const { req, res } = initializeReqResMocks();
      req.params = { slug: "fake-author" };
      const fakeAuthorWithToObject = {
        toObject: vi.fn().mockReturnValue({
          ...fakeAuthor,
        }),
      };

      vi.mocked(Author.findOne, true).mockResolvedValue(fakeAuthorWithToObject as any);

      vi.mocked(Rating.aggregate, true).mockResolvedValue([
        { ratingCount: 10, averageRating: 4.24 },
      ]);

      await getByUrlSlug(req, res);

      const result = {
        ...fakeAuthorWithToObject.toObject(),
        ratingCount: 10,
        averageRating: 4.24,
      };

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(result);
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
