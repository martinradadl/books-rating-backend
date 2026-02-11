import mongoose from "mongoose";

const schema = new mongoose.Schema({
  book: { type: mongoose.Types.ObjectId, ref: "Book", required: true },
  score: { type: Number, required: true },
});

export const Rating = mongoose.model("Rating", schema);
