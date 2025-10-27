import mongoose from "mongoose";

const schema = new mongoose.Schema({
  originalTitle: String,
  authorId: { type: mongoose.Types.ObjectId, ref: "Author" },
  relatedGenres: [{ type: mongoose.Types.ObjectId, ref: "Genre" }],
  firstPublished: Date,
});

export const Book = mongoose.model("Book", schema);
