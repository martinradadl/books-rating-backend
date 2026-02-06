import mongoose from "mongoose";
import * as editionModel from "../models/edition";

const schema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  description: { type: String },
  books: [{ type: mongoose.Types.ObjectId, ref: "Edition" }],
  bookLists: [{ type: mongoose.Types.ObjectId, ref: "BookList" }],
});

schema.pre("validate", async function (next) {
  const hasBooks = Array.isArray(this.books) && this.books.length > 0;
  const hasBookLists =
    Array.isArray(this.bookLists) && this.bookLists.length > 0;

  if (hasBooks === hasBookLists) {
    return next(
      new Error(
        "A BookList must contain either books or bookLists (exactly one)"
      )
    );
  }

  if (hasBooks) {
    const uniqueIds = [
      ...new Map(this.books.map((id) => [id.toString(), id])).values(),
    ];
    this.books = uniqueIds;

    const existingEditions = await editionModel.Edition.find({
      _id: { $in: this.books },
    }).select("_id");

    const validIds = existingEditions.map((e) => e._id.toString());
    this.books = this.books.filter((id) => validIds.includes(id.toString()));
  }

  if (hasBookLists) {
    const uniqueIds = [
      ...new Map(this.bookLists.map((id) => [id.toString(), id])).values(),
    ];
    this.bookLists = uniqueIds;

    const existingBookLists = await BookList.find({
      _id: { $in: this.bookLists },
    }).select("_id");

    const validIds = existingBookLists.map((e) => e._id.toString());
    this.bookLists = this.bookLists.filter((id) =>
      validIds.includes(id.toString())
    );
  }

  next();
});

export const BookList = mongoose.model("BookList", schema);
