import { afterEach, describe, expect, it, vi } from "vitest";
import {
  initializeReqResMocks,
  mockedCatchDuplicateKeyError,
  mockedCatchError,
} from "./utils";
import { Character } from "../models/character";
import { add, getAll, getById } from "../controllers/character";
import { fakeCharacter, fakeCharactersList } from "./fake-data/character";

vi.mock("../models/character.ts");

describe("Character Controller", () => {
  describe("Add Character Controller", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when error is thrown adding an character", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Character.create, true).mockImplementation(() => {
        throw mockedCatchError;
      });

      await add(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 409 when character already exists", async () => {
      const { req, res } = initializeReqResMocks();
      req.body = fakeCharacter;

      vi.mocked(Character.create).mockImplementation(() => {
        throw mockedCatchDuplicateKeyError(fakeCharacter.name);
      });

      await add(req, res);

      expect(res.statusCode).toBe(409);
      expect(res._getJSONData()).toEqual({
        message: `Adding not successful, character ${fakeCharacter.name} already exists`,
      });
    });

    it("should return 200 and the created character", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Character.create, true).mockResolvedValue(fakeCharacter as any);

      await add(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeCharacter);
    });
  });

  describe("Get Character by ID", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when error is thrown getting a character by id", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Character.findById, true).mockImplementation(() => {
        throw mockedCatchError;
      });

      await getById(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 200 and the selected character", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Character.findById, true).mockResolvedValue(
        fakeCharacter as any
      );

      await getById(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeCharacter);
    });
  });

  describe("Get All Characters", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when error is thrown getting all characters", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Character.find, true).mockImplementation(() => {
        throw mockedCatchError;
      });

      await getAll(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 200 and all characters list", async () => {
      const { req, res } = initializeReqResMocks();

      vi.mocked(Character.find, true).mockResolvedValue(fakeCharactersList);

      await getAll(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeCharactersList);
    });
  });
});
