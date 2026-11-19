import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MAP_LIMIT } from "../shared/limits.js";
import App from "./App.jsx";

const savedRecipes = [
  {
    id: "r1",
    name: "Jollof rice",
    country: "Nigeria",
    prepTimeMinutes: 75,
    ingredients: ["rice", "tomato", "scotch bonnet"],
    steps: "Blend the peppers.\nFry the base, then simmer the rice in it.",
    location: { lat: 6.5244, lng: 3.3792 },
  },
  {
    id: "r2",
    name: "Pierogi",
    country: "Poland",
    prepTimeMinutes: 90,
    ingredients: ["flour", "potato", "twaróg"],
    steps: "Make the dough, fill, boil.",
    location: { lat: 52.2297, lng: 21.0122 },
  },
];

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

let fetchMock;

/** Mock the API: GET /recipes returns `list`; POST /recipes is answered by `onPost`. */
function mockApi({ list = savedRecipes, onPost } = {}) {
  fetchMock = vi.fn(async (url, options = {}) => {
    expect(url).toBe("http://localhost:5050/recipes");
    if ((options.method || "GET") === "GET") return json(list);
    const body = JSON.parse(options.body);
    return onPost ? onPost(body) : json({ ...body, id: "new-id" }, 201);
  });
  vi.stubGlobal("fetch", fetchMock);
}

const postCalls = () => fetchMock.mock.calls.filter(([, options]) => options?.method === "POST");

async function renderLoaded(options) {
  mockApi(options);
  const user = userEvent.setup();
  render(<App />);
  await screen.findByText(/recipes? on the map\./);
  return user;
}

/** Press Tab until `element` has focus, the way a keyboard user would reach it. */
async function tabTo(user, element) {
  for (let i = 0; i < 30 && document.activeElement !== element; i += 1) await user.tab();
  expect(element).toHaveFocus();
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("recipe map", () => {
  it("shows the page landmarks and headings", async () => {
    await renderLoaded();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "axwrld" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Recipe map" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "World map of recipes" })).toBeInTheDocument();
  });

  it("loads saved recipes from the API and shows each as a marker with a popup", async () => {
    const user = await renderLoaded();

    expect(screen.getByRole("status")).toHaveTextContent("2 recipes on the map.");
    const marker = screen.getByRole("button", { name: "Jollof rice (Nigeria)" });
    expect(screen.getByRole("button", { name: "Pierogi (Poland)" })).toBeInTheDocument();

    await user.click(marker);

    const popup = await screen.findByRole("article");
    expect(within(popup).getByRole("heading", { name: "Jollof rice" })).toBeInTheDocument();
    expect(popup).toHaveTextContent("Nigeria · 1 h 15 min");
    const tags = within(within(popup).getByRole("list", { name: "Ingredients" })).getAllByRole("listitem");
    expect(tags.map((tag) => tag.textContent)).toEqual(["rice", "tomato", "scotch bonnet"]);

    const steps = within(popup).getByText(/Blend the peppers/);
    expect(steps).not.toBeVisible();
    const summary = within(popup).getByText("Steps");
    fireEvent.click(summary);
    expect(steps).toBeVisible();
    expect(steps.textContent).toBe("Blend the peppers.\nFry the base, then simmer the rice in it.");
  });

  it("says only the newest recipes are shown when the list reaches the cap, and keeps it at the cap after a save", async () => {
    const list = Array.from({ length: MAP_LIMIT }, (_, i) => ({
      ...savedRecipes[0],
      id: `r${i}`,
      name: `Recipe ${i}`,
    }));
    const user = await renderLoaded({ list });

    expect(screen.getByRole("status")).toHaveTextContent(`Showing only the newest ${MAP_LIMIT} recipes on the map.`);

    await user.click(screen.getByRole("button", { name: "Add recipe" }));
    await user.type(screen.getByLabelText("Recipe name"), "Pho");
    await user.type(screen.getByLabelText("Country"), "Vietnam");
    await user.type(screen.getByLabelText("Preparation time (minutes)"), "45");
    await user.type(screen.getByLabelText("Ingredients"), "noodles");
    await user.type(screen.getByLabelText("Recipe steps"), "Simmer.");
    await user.click(screen.getByRole("button", { name: "Save recipe" }));

    expect(await screen.findByRole("button", { name: "Pho (Vietnam)" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: `Recipe ${MAP_LIMIT - 1} (Nigeria)` })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Recipe 0 (Nigeria)" })).toBeInTheDocument();
  });

  it("shows a visible error with a retry when recipes cannot be loaded", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    const user = userEvent.setup();
    render(<App />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/recipes could not be loaded/i);
    expect(alert).toHaveTextContent("http://localhost:5050");

    mockApi();
    await user.click(within(alert).getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("2 recipes on the map.")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

describe("adding a recipe", () => {
  it("clicking the map drops a pin, opens the form, and returns focus to the map on cancel", async () => {
    const user = await renderLoaded();
    const map = screen.getByRole("region", { name: "World map of recipes" });

    fireEvent.click(map, { clientX: 0, clientY: 0 });

    const form = await screen.findByRole("complementary", { name: "Add a recipe" });
    expect(screen.getByLabelText("Recipe name")).toHaveFocus();
    expect(form).toHaveTextContent(/Location: .*°/);
    expect(screen.getByTitle("New recipe location")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
    expect(screen.queryByTitle("New recipe location")).not.toBeInTheDocument();
    expect(map).toHaveFocus();
  });

  it("Add recipe returns focus to an open form without moving its pin", async () => {
    const user = await renderLoaded();
    const map = screen.getByRole("region", { name: "World map of recipes" });
    fireEvent.click(map, { clientX: 300, clientY: 200 });
    const form = await screen.findByRole("complementary", { name: "Add a recipe" });
    const locationText = within(form).getByText("Location:").parentElement.textContent;

    await user.click(screen.getByRole("button", { name: "Add recipe" }));

    expect(within(form).getByText("Location:").parentElement.textContent).toBe(locationText);
    expect(screen.getByLabelText("Recipe name")).toHaveFocus();
  });

  it("labels every field", async () => {
    const user = await renderLoaded();
    await user.click(screen.getByRole("button", { name: "Add recipe" }));

    for (const label of ["Recipe name", "Country", "Preparation time (minutes)", "Ingredients", "Recipe steps"]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
  });

  it("adds ingredients as individual tags that can be removed", async () => {
    const user = await renderLoaded();
    await user.click(screen.getByRole("button", { name: "Add recipe" }));
    const input = screen.getByLabelText("Ingredients");

    await user.type(input, "  Tomato {Enter}");
    await user.type(input, "basil, garlic,");
    await user.type(input, "TOMATO");
    await user.click(screen.getByRole("button", { name: "Add" }));

    const list = screen.getByRole("list", { name: "Added ingredients" });
    const tagText = () => within(list).getAllByRole("listitem").map((item) => item.textContent.replace("×", ""));
    expect(tagText()).toEqual(["Tomato", "basil", "garlic"]);
    expect(screen.getByText("“TOMATO” is already in the list.")).toBeInTheDocument();
    expect(input).toHaveValue("");

    await user.click(screen.getByRole("button", { name: "Remove basil" }));

    expect(tagText()).toEqual(["Tomato", "garlic"]);
    expect(input).toHaveFocus();
  });

  it("shows validation messages and does not send an incomplete recipe", async () => {
    const user = await renderLoaded();
    await user.click(screen.getByRole("button", { name: "Add recipe" }));

    await user.click(screen.getByRole("button", { name: "Save recipe" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Please fix 5 fields before saving.");
    expect(screen.getByText("Recipe name is required.")).toBeInTheDocument();
    expect(screen.getByText("Country is required.")).toBeInTheDocument();
    expect(screen.getByText(/Preparation time must be a whole number/)).toBeInTheDocument();
    expect(screen.getByText("Add at least one ingredient.")).toBeInTheDocument();
    expect(screen.getByText("Recipe steps is required.")).toBeInTheDocument();
    const name = screen.getByLabelText("Recipe name");
    expect(name).toHaveFocus();
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(name).toHaveAccessibleDescription("Recipe name is required.");
    expect(postCalls()).toHaveLength(0);
  });

  it("shows the server's message when a save is rejected", async () => {
    const user = await renderLoaded({
      onPost: () => json({ error: "Invalid fields: country.", fields: { country: "Country is not recognised." } }, 400),
    });
    await user.click(screen.getByRole("button", { name: "Add recipe" }));
    await user.type(screen.getByLabelText("Recipe name"), "Pho");
    await user.type(screen.getByLabelText("Country"), "Atlantis");
    await user.type(screen.getByLabelText("Preparation time (minutes)"), "45");
    await user.type(screen.getByLabelText("Ingredients"), "noodles");
    await user.type(screen.getByLabelText("Recipe steps"), "Simmer.");

    await user.click(screen.getByRole("button", { name: "Save recipe" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("The recipe was not saved. Invalid fields: country.");
    expect(screen.getByText("Country is not recognised.")).toBeInTheDocument();
    expect(screen.getByLabelText("Country")).toHaveFocus();
    expect(screen.getByRole("complementary", { name: "Add a recipe" })).toBeInTheDocument();
  });

  it("works from the keyboard alone and shows the new recipe on the map without a reload", async () => {
    const user = await renderLoaded({ list: [] });
    const addButton = screen.getByRole("button", { name: "Add recipe" });

    await tabTo(user, addButton);
    await user.keyboard("{Enter}");

    await screen.findByRole("complementary", { name: "Add a recipe" });
    expect(screen.getByLabelText("Recipe name")).toHaveFocus();
    expect(screen.getByTitle("New recipe location")).toBeInTheDocument();

    await user.keyboard("Pho");
    await tabTo(user, screen.getByLabelText("Country"));
    await user.keyboard("Vietnam");
    await tabTo(user, screen.getByLabelText("Preparation time (minutes)"));
    await user.keyboard("45");
    await tabTo(user, screen.getByLabelText("Ingredients"));
    await user.keyboard("rice noodles{Enter}beef{Enter}star anise");
    await tabTo(user, screen.getByLabelText("Recipe steps"));
    await user.keyboard("Simmer the broth.");
    await tabTo(user, screen.getByRole("button", { name: "Save recipe" }));
    await user.keyboard("{Enter}");

    expect(await screen.findByRole("button", { name: "Pho (Vietnam)" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Saved “Pho”. It is now on the map.");
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
    expect(addButton).toHaveFocus();

    expect(postCalls()).toHaveLength(1);
    const sent = JSON.parse(postCalls()[0][1].body);
    expect(sent).toEqual({
      name: "Pho",
      country: "Vietnam",
      prepTimeMinutes: 45,
      ingredients: ["rice noodles", "beef", "star anise"],
      steps: "Simmer the broth.",
      location: { lat: expect.any(Number), lng: expect.any(Number) },
    });
    expect(sent.location.lat).toBeCloseTo(20, 0);
    expect(sent.location.lng).toBeCloseTo(0, 0);
  });
});
