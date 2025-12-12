import mongoose from "mongoose";

export const parseToObjectId = (id: string) => {
  return new mongoose.Types.ObjectId(id);
};
