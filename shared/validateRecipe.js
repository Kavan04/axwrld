// Shared by the API and the add-recipe form so both apply the same rules and messages.
import {
  MAX_INGREDIENTS,
  MAX_INGREDIENT_LENGTH,
  normalizeIngredients,
} from "./ingredients.js";

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

function requiredText(body, field, label, maxLength, errors) {
  const value = typeof body[field] === "string" ? body[field].trim() : "";
  if (!value) errors[field] = `${label} is required.`;
  else if (value.length > maxLength) errors[field] = `${label} must be ${maxLength} characters or fewer.`;
  return value;
}

function coordinate(value, min, max) {
  const number = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  return typeof number === "number" && Number.isFinite(number) && number >= min && number <= max
    ? number
    : null;
}

/**
 * Validate a recipe as sent to POST /recipes.
 * Returns { value } with the cleaned recipe, or { errors } mapping each invalid field to a message.
 */
export function validateRecipe(body) {
  if (!isPlainObject(body)) {
    return { errors: { body: "Send the recipe as a JSON object." } };
  }

  const errors = {};
  const name = requiredText(body, "name", "Recipe name", 120, errors);
  const country = requiredText(body, "country", "Country", 80, errors);

  const rawPrepTime = body.prepTimeMinutes;
  const prepTimeMinutes =
    typeof rawPrepTime === "number" || (typeof rawPrepTime === "string" && rawPrepTime.trim() !== "")
      ? Number(rawPrepTime)
      : NaN;
  if (!Number.isInteger(prepTimeMinutes) || prepTimeMinutes < 1 || prepTimeMinutes > 10080) {
    errors.prepTimeMinutes = "Preparation time must be a whole number of minutes between 1 and 10080.";
  }

  let ingredients = [];
  if (!Array.isArray(body.ingredients)) {
    errors.ingredients = "Ingredients must be a list of individual ingredient tags.";
  } else if (body.ingredients.some((item) => typeof item !== "string")) {
    errors.ingredients = "Each ingredient must be text.";
  } else {
    ingredients = normalizeIngredients(body.ingredients);
    if (ingredients.length === 0) {
      errors.ingredients = "Add at least one ingredient.";
    } else if (ingredients.length > MAX_INGREDIENTS) {
      errors.ingredients = `Add no more than ${MAX_INGREDIENTS} ingredients.`;
    } else if (ingredients.some((tag) => tag.length > MAX_INGREDIENT_LENGTH)) {
      errors.ingredients = `Each ingredient must be ${MAX_INGREDIENT_LENGTH} characters or fewer.`;
    }
  }

  const steps = requiredText(body, "steps", "Recipe steps", 10000, errors);

  let location = null;
  if (!isPlainObject(body.location)) {
    errors.location = "Location must include lat and lng.";
  } else {
    const lat = coordinate(body.location.lat, -90, 90);
    const lng = coordinate(body.location.lng, -180, 180);
    if (lat === null || lng === null) {
      errors.location = "Location needs a latitude between -90 and 90 and a longitude between -180 and 180.";
    } else {
      location = { lat, lng };
    }
  }

  if (Object.keys(errors).length > 0) return { errors };
  return { value: { name, country, prepTimeMinutes, ingredients, steps, location } };
}
