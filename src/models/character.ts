import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: { type: String, unique: true },
});

export const Character = mongoose.model("Character", schema);
