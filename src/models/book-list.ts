import mongoose from "mongoose";
import * as editionModel from "../models/edition";

const schema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  description: { type: String },
  books: [{ type: mongoose.Types.ObjectId, ref: "Edition" }],
  relatedGenres: [{ type: mongoose.Types.ObjectId, ref: "Genre" }],
});

schema.pre("validate", async function (next) {
  const uniqueIds = [
    ...new Map(this.books.map((id) => [id.toString(), id])).values(),
  ];
  this.books = uniqueIds;

  const existingEditions = await editionModel.Edition.find({
    _id: { $in: this.books },
  }).select("_id");

  const validIds = existingEditions.map((e) => e._id.toString());
  this.books = this.books.filter((id) => validIds.includes(id.toString()));

  next();
});

export const BookList = mongoose.model("BookList", schema);
