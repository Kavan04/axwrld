import mongoose from "mongoose";
import { MAX_INGREDIENTS, MAX_INGREDIENT_LENGTH } from "../shared/ingredients.js";
import { COUNTRY_MAX, NAME_MAX, PREP_MAX, PREP_MIN, STEPS_MAX } from "../shared/limits.js";

const locationSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true, min: -90, max: 90 },
    lng: { type: Number, required: true, min: -180, max: 180 },
  },
  { _id: false },
);

const recipeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: NAME_MAX },
    country: { type: String, required: true, trim: true, maxlength: COUNTRY_MAX },
    prepTimeMinutes: { type: Number, required: true, min: PREP_MIN, max: PREP_MAX },
    ingredients: {
      type: [{ type: String, trim: true, maxlength: MAX_INGREDIENT_LENGTH }],
      validate: {
        validator: (tags) => tags.length > 0 && tags.length <= MAX_INGREDIENTS,
        message: `A recipe needs between 1 and ${MAX_INGREDIENTS} ingredients.`,
      },
    },
    steps: { type: String, required: true, trim: true, maxlength: STEPS_MAX },
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
