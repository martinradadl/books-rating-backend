import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

export const Character = mongoose.model("Character", schema);
