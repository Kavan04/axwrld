// Ingredient tags are the training input for the phase-2 recipe model, so the
// browser and the API normalise them with this one function.

export const MAX_INGREDIENTS = 50;
export const MAX_INGREDIENT_LENGTH = 60;

/** Trim and collapse inner whitespace; returns "" for anything that is not a string. */
export function cleanIngredient(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

/**
 * Turn a list of ingredient strings into tags: trimmed, non-empty, and
 * de-duplicated case-insensitively (the first spelling wins).
 */
export function normalizeIngredients(values) {
  const seen = new Set();
  const tags = [];
  for (const value of values) {
    const tag = cleanIngredient(value);
    const key = tag.toLocaleLowerCase();
    if (tag && !seen.has(key)) {
      seen.add(key);
      tags.push(tag);
    }
  }
  return tags;
}
