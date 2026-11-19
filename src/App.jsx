import { useCallback, useEffect, useRef, useState } from "react";
import { MAP_LIMIT } from "../shared/limits.js";
import { fetchRecipes, createRecipe } from "./api.js";
import RecipeForm from "./components/RecipeForm.jsx";
import RecipeMap, { toLocation } from "./components/RecipeMap.jsx";

function countText(count) {
  if (count >= MAP_LIMIT) return `Showing only the newest ${MAP_LIMIT} recipes on the map.`;
  return count === 1 ? "1 recipe on the map." : `${count} recipes on the map.`;
}

export default function App() {
  const [recipes, setRecipes] = useState([]);
  const [loadState, setLoadState] = useState("loading");
  const [loadError, setLoadError] = useState("");
  const [draft, setDraft] = useState(null);
  const [notice, setNotice] = useState("");
  const mapRef = useRef(null);
  const returnFocusRef = useRef(null);

  const loadRecipes = useCallback(async () => {
    setLoadState("loading");
    try {
      setRecipes(await fetchRecipes());
      setLoadState("ready");
    } catch (error) {
      setLoadError(error.message);
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  // Clicking the map opens the form at that spot, or moves the pin if the form is already open.
  function pickLocation(location, mapContainer) {
    if (!draft) returnFocusRef.current = mapContainer;
    setDraft(location);
    setNotice("");
  }

  function moveDraftToMapCenter() {
    const map = mapRef.current;
    if (map) setDraft(toLocation(map.getCenter()));
  }

  function startFromMapCenter(event) {
    if (draft) {
      document.getElementById("recipe-name")?.focus();
      return;
    }
    returnFocusRef.current = event.currentTarget;
    setNotice("");
    moveDraftToMapCenter();
  }

  function closeForm() {
    returnFocusRef.current?.focus();
    returnFocusRef.current = null;
    setDraft(null);
  }

  async function saveRecipe(recipe) {
    const saved = await createRecipe(recipe);
    setRecipes((current) => [saved, ...current].slice(0, MAP_LIMIT));
    setNotice(`Saved “${saved.name}”. It is now on the map.`);
    closeForm();
  }

  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <h1>axwrld</h1>
          <p className="tagline">A global map of authentic home recipes, pinned to where they come from.</p>
        </div>
      </header>

      <main className="layout">
        <section className="map-section" aria-labelledby="map-heading">
          <div className="map-toolbar">
            <h2 id="map-heading">Recipe map</h2>
            <button type="button" className="button" onClick={startFromMapCenter}>
              Add recipe
            </button>
          </div>
          <p id="map-help" className="map-help">
            Select a marker to see its recipe. To add one, click the map, or pan with the arrow keys and choose
            “Add recipe” to use the centre of the map. Once the form is open, drag the pin or choose “Use map
            centre” to move it.
          </p>

          <div className="map-status">
            <p role="status">
              {notice || (loadState === "loading" ? "Loading recipes…" : loadState === "ready" ? countText(recipes.length) : "")}
            </p>
            {loadState === "error" && (
              <div className="load-error" role="alert">
                <p>Recipes could not be loaded. {loadError}</p>
                <button type="button" className="button button-secondary" onClick={loadRecipes}>
                  Try again
                </button>
              </div>
            )}
          </div>

          <RecipeMap
            ref={mapRef}
            recipes={recipes}
            draft={draft}
            onPick={pickLocation}
            onMoveDraft={setDraft}
            describedBy="map-help"
          />
        </section>

        {draft && (
          <aside className="form-panel" aria-labelledby="recipe-form-heading">
            <RecipeForm location={draft} onSubmit={saveRecipe} onCancel={closeForm} onUseMapCenter={moveDraftToMapCenter} />
          </aside>
        )}
      </main>
    </>
  );
}
