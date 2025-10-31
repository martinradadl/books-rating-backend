import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: { String, unique: true },
});

export const Setting = mongoose.model("Setting", schema);
