import mongoose from "mongoose";

const schema = new mongoose.Schema({
  originalTitle: { type: String, required: true },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Author",
    required: true,
  },
  relatedGenres: [{ type: mongoose.Types.ObjectId, ref: "Genre" }],
  firstPublished: Date,
  characters: [{ type: mongoose.Types.ObjectId, ref: "Character" }],
  settings: [{ type: mongoose.Types.ObjectId, ref: "Setting" }],
});

schema.index({ originalTitle: 1, authorId: 1 }, { unique: true });

export const Book = mongoose.model("Book", schema);
