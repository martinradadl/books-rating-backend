import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  profilePic: String,
  description: String,
  birthplace: String,
  birthdate: Date,
  deathdate: Date,
});

export const Author = mongoose.model("Author", schema);
