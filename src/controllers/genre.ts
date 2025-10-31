import { Request, Response } from "express";
import { MONGO_ERRORS } from "../helpers/constants";
import * as genreModel from "../models/genre";

export const add = async (req: Request, res: Response) => {
  try {
    const newGenre = await genreModel.Genre.create(req.body);

    res.status(200).json(newGenre);
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message.includes(MONGO_ERRORS.DuplicateKey)) {
        const name = err.message.split(`\"`)[1];
        res.status(409).json({
          message: `Adding not successful, genre ${name} already exists`,
        });
        return;
      }

      res.status(500).json({ message: err.message });
    }
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const genre = await genreModel.Genre.findById(req.params.id);
    res.status(200).json(genre);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const getAll = async (_req: Request, res: Response) => {
  try {
    const genresList = await genreModel.Genre.find();
    const parsedList = genresList.map((genre) => ({
      name: genre.name,
      _id: genre._id,
    }));
    res.status(200).json(parsedList);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};
