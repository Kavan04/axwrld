export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5050").replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, { status, fields } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

async function request(path, options) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, options);
  } catch {
    throw new ApiError(`Could not reach the recipe server at ${API_URL}. Check that it is running.`);
  }

  let body = null;
  try {
    body = await response.json();
  } catch {
    // Leave body empty; the status code still says what happened.
  }

  if (!response.ok) {
    throw new ApiError(body?.error || `The recipe server answered with status ${response.status}.`, {
      status: response.status,
      fields: body?.fields,
    });
  }
  return body;
}

export async function fetchRecipes() {
  const recipes = await request("/recipes");
  if (!Array.isArray(recipes)) throw new ApiError("The recipe server sent an unexpected response.");
  return recipes;
}

export function createRecipe(recipe) {
  return request("/recipes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(recipe),
  });
}
