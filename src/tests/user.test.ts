import { afterEach, describe, expect, it, vi } from "vitest";
import {
  initializeReqResMocks,
  mockedCatchDuplicateKeyError,
  mockedCatchError,
} from "./utils";
import { User } from "../models/user";
import { add, getByEmail, getById } from "../controllers/user";
import { fakeUser, fakeUserWithDefaultProfilePic } from "./fake-data/user";

vi.mock("../models/user.ts");

describe("User Controller", () => {
  describe("Add User Controller", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when error is thrown adding an user", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(User.create, true).mockImplementation(() => {
        throw mockedCatchError;
      });

      await add(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 409 when user already exists", async () => {
      const { req, res } = initializeReqResMocks();
      req.body = fakeUser;

      vi.mocked(User.create).mockImplementation(() => {
        throw mockedCatchDuplicateKeyError(fakeUser.email);
      });

      await add(req, res);

      expect(res.statusCode).toBe(409);
      expect(res._getJSONData()).toEqual({
        message: `Adding not successful, user ${fakeUser.email} already exists`,
      });
    });

    it("should return 200 and the created user", async () => {
      const { req, res } = initializeReqResMocks();
      req.body = fakeUser;

      vi.mocked(User.create, true).mockResolvedValue({
        ...fakeUser,
        toObject: () => fakeUser,
      } as any);

      await add(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeUserWithDefaultProfilePic);
    });
  });

  describe("Get User by ID", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when error is thrown getting a user by id", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(User.findById, true).mockImplementation(() => {
        throw mockedCatchError;
      });

      await getById(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 200 and the selected user", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(User.findById, true).mockResolvedValue({
        ...fakeUser,
        toObject: () => fakeUser,
      } as any);

      await getById(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeUserWithDefaultProfilePic);
    });
  });

  describe("Get User by Email", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when error is thrown getting a user by email", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(User.findOne, true).mockImplementation(() => {
        throw mockedCatchError;
      });

      await getByEmail(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 200 and the selected user", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(User.findOne, true).mockResolvedValue({
        ...fakeUser,
        toObject: () => fakeUser,
      } as any);

      await getByEmail(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeUserWithDefaultProfilePic);
    });
  });
});
