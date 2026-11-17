import express from "express";
import mongoose from "mongoose";
import { Recipe } from "../models/recipeModel.js";
import { validateRecipe } from "../shared/validateRecipe.js";

const router = express.Router();

const invalidFieldsResponse = (fields) => ({
  error: `Invalid fields: ${Object.keys(fields).join(", ")}.`,
  fields,
});

// Upper bound on markers sent to the map in one response.
const MAP_LIMIT = 1000;

// Express 5 forwards rejected promises from these handlers to the app's error handler.
router.get("/", async (_req, res) => {
  const recipes = await Recipe.find().sort({ createdAt: -1 }).limit(MAP_LIMIT);
  res.json(recipes);
});

router.post("/", async (req, res) => {
  const { value, errors } = validateRecipe(req.body);
  if (errors) return res.status(400).json(invalidFieldsResponse(errors));

  try {
    const recipe = await Recipe.create(value);
    return res.status(201).json(recipe);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      const fields = Object.fromEntries(
        Object.entries(error.errors).map(([path, err]) => [path.split(".")[0], err.message]),
      );
      return res.status(400).json(invalidFieldsResponse(fields));
    }
    throw error;
  }
});

export default router;
