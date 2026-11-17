import mongoose from "mongoose";
import { MAX_INGREDIENTS, MAX_INGREDIENT_LENGTH } from "../shared/ingredients.js";

const locationSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true, min: -90, max: 90 },
    lng: { type: Number, required: true, min: -180, max: 180 },
  },
  { _id: false },
);

const recipeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    country: { type: String, required: true, trim: true, maxlength: 80 },
    prepTimeMinutes: { type: Number, required: true, min: 1, max: 10080 },
    ingredients: {
      type: [{ type: String, trim: true, maxlength: MAX_INGREDIENT_LENGTH }],
      validate: {
        validator: (tags) => tags.length > 0 && tags.length <= MAX_INGREDIENTS,
        message: `A recipe needs between 1 and ${MAX_INGREDIENTS} ingredients.`,
      },
    },
    steps: { type: String, required: true, trim: true, maxlength: 10000 },
    location: { type: locationSchema, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: (_doc, ret) => {
        ret.id = String(ret._id);
        delete ret._id;
        return ret;
      },
    },
  },
);

export const Recipe = mongoose.models.Recipe || mongoose.model("Recipe", recipeSchema);
