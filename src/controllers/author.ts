import { Request, Response } from "express";
import * as authorModel from "../models/author";
import { MONGO_ERRORS } from "../helpers/constants";

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
      if (err.message.includes(MONGO_ERRORS.DuplicateKey)) {
        const authorName = err.message.split(`\"`)[1];
        res.status(409).json({
          message: `Adding not successful, author ${authorName} already exists`,
        });
        return;
      }

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
