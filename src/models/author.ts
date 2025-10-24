import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: String,
  profilePic: String,
  description: String,
});

export const Author = mongoose.model("Author", schema);
