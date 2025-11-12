import { Request, Response } from "express";
import { MONGO_ERRORS } from "../helpers/constants";
import * as settingModel from "../models/setting";

export const add = async (req: Request, res: Response) => {
  try {
    const newSetting = await settingModel.Setting.create(req.body);

    res.status(200).json(newSetting);
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message.includes(MONGO_ERRORS.DuplicateKey)) {
        const name = err.message.split(`"`)[1];
        res.status(409).json({
          message: `Adding not successful, setting ${name} already exists`,
        });
        return;
      }

      res.status(500).json({ message: err.message });
    }
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const setting = await settingModel.Setting.findById(req.params.id);
    res.status(200).json(setting);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const getAll = async (_req: Request, res: Response) => {
  try {
    const settingsList = await settingModel.Setting.find();
    res.status(200).json(settingsList);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};
