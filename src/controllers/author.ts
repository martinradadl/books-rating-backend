import { Request, Response } from "express";
import * as authorModel from "../models/author";

export const add = async (req: Request, res: Response) => {
  try {
    const { name, profilePic, description } = req.body;
    const newAuthor = await authorModel.Author.create({
      name,
      profilePic,
      description,
    });
    res.status(200).json(newAuthor);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const authorId = req.params.id;
    const author = await authorModel.Author.findById(authorId);
    res.status(200).json(author);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query?.page as string) || 1;
    const limit = parseInt(req.query?.limit as string) || 0;

    const authorsList = await authorModel.Author.find()
      .limit(limit)
      .skip((page - 1) * limit);

    res.status(200).json(authorsList);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};
