import { Request, Response } from "express";
import * as ratingModel from "../models/rating";

export const add = async (req: Request, res: Response) => {
  try {
    const newRating = await ratingModel.Rating.create(req.body);

    res.status(200).json(newRating);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};
