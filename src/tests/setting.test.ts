import { afterEach, describe, expect, it, vi } from "vitest";
import {
  initializeReqResMocks,
  mockedCatchDuplicateKeyError,
  mockedCatchError,
} from "./utils";
import { Setting } from "../models/setting";
import { add, getAll, getById } from "../controllers/setting";
import { fakeSetting, fakeSettingsList } from "./fake-data/setting";

vi.mock("../models/setting.ts");

describe("Setting Controller", () => {
  describe("Add Setting Controller", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when error is thrown adding an setting", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Setting.create, true).mockImplementation(() => {
        throw mockedCatchError;
      });

      await add(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 409 when setting already exists", async () => {
      const { req, res } = initializeReqResMocks();
      req.body = fakeSetting;

      vi.mocked(Setting.create).mockImplementation(() => {
        throw mockedCatchDuplicateKeyError(fakeSetting.name);
      });

      await add(req, res);

      expect(res.statusCode).toBe(409);
      expect(res._getJSONData()).toEqual({
        message: `Adding not successful, setting ${fakeSetting.name} already exists`,
      });
    });

    it("should return 200 and the created setting", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Setting.create, true).mockResolvedValue(fakeSetting as any);

      await add(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeSetting);
    });
  });

  describe("Get Setting by ID", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when error is thrown getting a setting by id", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Setting.findById, true).mockImplementation(() => {
        throw mockedCatchError;
      });

      await getById(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 200 and the selected setting", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Setting.findById, true).mockResolvedValue(fakeSetting as any);

      await getById(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeSetting);
    });
  });

  describe("Get All Settings", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when error is thrown getting all settings", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Setting.find, true).mockImplementation(() => {
        throw mockedCatchError;
      });

      await getAll(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 200 and all settings list", async () => {
      const { req, res } = initializeReqResMocks();

      vi.mocked(Setting.find, true).mockResolvedValue(fakeSettingsList);

      await getAll(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeSettingsList);
    });
  });
});
