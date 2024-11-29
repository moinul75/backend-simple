const mongoose = require("mongoose");

const animalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    categoryName: { type: String, required: true }, // Store category name
  },
  { timestamps: true }
);

module.exports = mongoose.model("Animal", animalSchema);
