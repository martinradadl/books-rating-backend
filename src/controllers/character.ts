import { Request, Response } from "express";
import { MONGO_ERRORS } from "../helpers/constants";
import * as characterModel from "../models/character";

export const add = async (req: Request, res: Response) => {
  try {
    const newCharacter = await characterModel.Character.create(req.body);

    res.status(200).json(newCharacter);
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message.includes(MONGO_ERRORS.DuplicateKey)) {
        const name = err.message.split(`"`)[1];
        res.status(409).json({
          message: `Adding not successful, character ${name} already exists`,
        });
        return;
      }

      res.status(500).json({ message: err.message });
    }
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const character = await characterModel.Character.findById(req.params.id);
    res.status(200).json(character);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const getAll = async (_req: Request, res: Response) => {
  try {
    const charactersList = await characterModel.Character.find();
    res.status(200).json(charactersList);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};
