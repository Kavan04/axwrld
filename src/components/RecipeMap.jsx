import { divIcon, icon } from "leaflet";
import { forwardRef, useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { formatPrepTime } from "../format.js";
import markerUrl from "../map-marker.webp";

const recipeIcon = icon({
  iconUrl: markerUrl,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -32],
});

const draftIcon = divIcon({
  className: "draft-pin",
  html: '<span class="draft-pin-dot"></span>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

/** Plain {lat, lng} with longitude wrapped into -180..180, as the API expects. */
export function toLocation(latLng) {
  const wrapped = latLng.wrap();
  return { lat: Number(wrapped.lat.toFixed(6)), lng: Number(wrapped.lng.toFixed(6)) };
}

function MapAccessibility({ label, describedBy }) {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    container.setAttribute("role", "region");
    container.setAttribute("aria-label", label);
    container.setAttribute("aria-describedby", describedBy);
  }, [map, label, describedBy]);
  return null;
}

// The map narrows when the form panel opens; tell Leaflet so its centre and tiles stay correct.
function TrackContainerSize() {
  const map = useMap();
  useEffect(() => {
    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}

function MapClicks({ onPick }) {
  useMapEvents({
    click(event) {
      onPick(toLocation(event.latlng), event.target.getContainer());
    },
  });
  return null;
}

/** Leaflet map with a marker per saved recipe and, while adding, a draggable pin. */
const RecipeMap = forwardRef(function RecipeMap({ recipes, draft, onPick, onMoveDraft, describedBy }, ref) {
  return (
    <MapContainer
      ref={ref}
      className="recipe-map"
      center={[20, 0]}
      zoom={2}
      minZoom={2}
      worldCopyJump
    >
      <MapAccessibility label="World map of recipes" describedBy={describedBy} />
      <TrackContainerSize />
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapClicks onPick={onPick} />

      {recipes.map((recipe) => (
        <Marker
          key={recipe.id}
          position={[recipe.location.lat, recipe.location.lng]}
          icon={recipeIcon}
          alt={`${recipe.name} (${recipe.country})`}
          title={recipe.name}
        >
          <Popup>
            <article className="recipe-popup">
              <h3>{recipe.name}</h3>
              <p>
                {recipe.country} · {formatPrepTime(recipe.prepTimeMinutes)}
              </p>
              <ul className="tag-list" aria-label="Ingredients">
                {recipe.ingredients.map((ingredient) => (
                  <li key={ingredient} className="tag">
                    {ingredient}
                  </li>
                ))}
              </ul>
              <details className="recipe-steps">
                <summary>Steps</summary>
                <p>{recipe.steps}</p>
              </details>
            </article>
          </Popup>
        </Marker>
      ))}

      {draft && (
        <Marker
          position={[draft.lat, draft.lng]}
          icon={draftIcon}
          title="New recipe location"
          draggable
          eventHandlers={{ dragend: (event) => onMoveDraft(toLocation(event.target.getLatLng())) }}
        />
      )}
    </MapContainer>
  );
});

export default RecipeMap;
