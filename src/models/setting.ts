import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: String,
});

export const Setting = mongoose.model("Setting", schema);
