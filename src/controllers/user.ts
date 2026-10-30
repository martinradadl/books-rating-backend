import { Request, Response } from "express";
import {
  DEFAULT_PROFILE_PIC,
  EMAIL_REGEX,
  MONGO_ERRORS,
} from "../helpers/constants";
import * as userModel from "../models/user";

export const add = async (req: Request, res: Response) => {
  try {
    const newUser = await userModel.User.create(req.body);

    if (!EMAIL_REGEX.test(req.body.email)) {
      res.status(400).json({
        message: "Invalid email format",
      });
      return;
    }

    res.status(200).json({
      ...newUser.toObject(),
      profilePic: newUser.profilePic || DEFAULT_PROFILE_PIC,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message.includes(MONGO_ERRORS.DuplicateKey)) {
        const email = err.message.split(`"`)[1];
        res.status(409).json({
          message: `Adding not successful, user ${email} already exists`,
        });
        return;
      }

      res.status(500).json({ message: err.message });
    }
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const user = await userModel.User.findById(req.params.id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      ...user.toObject(),
      profilePic: user.profilePic || DEFAULT_PROFILE_PIC,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const getByEmail = async (req: Request, res: Response) => {
  try {
    const user = await userModel.User.findOne({ email: req.params.email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      ...user.toObject(),
      profilePic: user.profilePic || DEFAULT_PROFILE_PIC,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};
