// Shared by the API and the add-recipe form so both apply the same rules and messages.
import {
  MAX_INGREDIENTS,
  MAX_INGREDIENT_LENGTH,
  normalizeIngredients,
} from "./ingredients.js";
import { COUNTRY_MAX, NAME_MAX, PREP_MAX, PREP_MIN, STEPS_MAX } from "./limits.js";

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

function requiredText(body, field, label, maxLength, errors) {
  const value = typeof body[field] === "string" ? body[field].trim() : "";
  if (!value) errors[field] = `${label} is required.`;
  else if (value.length > maxLength) errors[field] = `${label} must be ${maxLength} characters or fewer.`;
  return value;
}

function coordinate(value, min, max) {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max ? value : null;
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
  const name = requiredText(body, "name", "Recipe name", NAME_MAX, errors);
  const country = requiredText(body, "country", "Country", COUNTRY_MAX, errors);

  const rawPrepTime = body.prepTimeMinutes;
  const prepTimeMinutes =
    typeof rawPrepTime === "number" || (typeof rawPrepTime === "string" && rawPrepTime.trim() !== "")
      ? Number(rawPrepTime)
      : NaN;
  if (!Number.isInteger(prepTimeMinutes) || prepTimeMinutes < PREP_MIN || prepTimeMinutes > PREP_MAX) {
    errors.prepTimeMinutes = `Preparation time must be a whole number of minutes between ${PREP_MIN} and ${PREP_MAX}.`;
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

  const steps = requiredText(body, "steps", "Recipe steps", STEPS_MAX, errors);

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
