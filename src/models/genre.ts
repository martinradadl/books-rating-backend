import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
});

export const Genre = mongoose.model("Genre", schema);
