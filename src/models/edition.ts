import mongoose from "mongoose";

const schema = new mongoose.Schema({
  title: { type: String, required: true },
  cover: String,
  bookId: { type: mongoose.Types.ObjectId, ref: "Book", required: true },
  description: String,
  published: Date,
  pagesCount: Number,
  format: String,
  ISBN: { type: String, unique: true, sparse: true },
  ASIN: { type: String, unique: true, sparse: true },
  language: String,
  setting: [{ type: mongoose.Types.ObjectId, ref: "Setting" }],
  characters: [{ type: mongoose.Types.ObjectId, ref: "Character" }],
});

schema.pre("validate", function (next) {
  if (!this.ISBN && !this.ASIN) {
    this.invalidate("ISBN/ASIN", "Either ISBN or ASIN is required");
  }
  next();
});

export const Edition = mongoose.model("Edition", schema);
