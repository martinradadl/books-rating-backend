import mongoose from "mongoose";

export const objectId = (id: string) => {
  return new mongoose.Types.ObjectId(id);
};
