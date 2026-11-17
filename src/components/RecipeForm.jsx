import { forwardRef, useEffect, useRef, useState } from "react";
import { normalizeIngredients } from "../../shared/ingredients.js";
import { validateRecipe } from "../../shared/validateRecipe.js";
import { formatLocation } from "../format.js";
import IngredientTags from "./IngredientTags.jsx";

const FIELD_IDS = {
  name: "recipe-name",
  country: "recipe-country",
  prepTimeMinutes: "recipe-prep-time",
  ingredients: "recipe-ingredients",
  steps: "recipe-steps",
};

const FIELD_ORDER = ["name", "country", "prepTimeMinutes", "ingredients", "steps", "location"];

const EMPTY_VALUES = { name: "", country: "", prepTimeMinutes: "", steps: "" };

const TextField = forwardRef(function TextField(
  { field, label, error, help, multiline = false, ...inputProps },
  ref,
) {
  const id = FIELD_IDS[field];
  const Control = multiline ? "textarea" : "input";
  const describedBy = [help ? `${id}-help` : null, error ? `${id}-error` : null].filter(Boolean).join(" ");
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {help && (
        <p className="field-help" id={`${id}-help`}>
          {help}
        </p>
      )}
      <Control
        ref={ref}
        id={id}
        name={field}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy || undefined}
        {...inputProps}
      />
      {error && (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
});

/**
 * The add-recipe form. `onSubmit` receives the validated recipe and returns a promise;
 * if it rejects, the error's message (and any per-field messages) are shown in the form.
 */
export default function RecipeForm({ location, onSubmit, onCancel, onUseMapCenter }) {
  const [values, setValues] = useState(EMPTY_VALUES);
  const [ingredients, setIngredients] = useState([]);
  const [ingredientDraft, setIngredientDraft] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const update = (field) => (event) => setValues((current) => ({ ...current, [field]: event.target.value }));

  function showErrors(fieldErrors, message) {
    setErrors(fieldErrors);
    setFormError(message);
    const first = FIELD_ORDER.find((field) => fieldErrors[field] && FIELD_IDS[field]);
    if (first) document.getElementById(FIELD_IDS[first])?.focus();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;

    // Text still in the ingredient box counts as a tag, so it is not silently lost.
    const allIngredients = normalizeIngredients([...ingredients, ...ingredientDraft.split(",")]);
    setIngredients(allIngredients);
    setIngredientDraft("");

    const { value, errors: fieldErrors } = validateRecipe({ ...values, ingredients: allIngredients, location });
    if (fieldErrors) {
      const count = Object.keys(fieldErrors).length;
      showErrors(fieldErrors, `Please fix ${count} ${count === 1 ? "field" : "fields"} before saving.`);
      return;
    }

    setErrors({});
    setFormError("");
    setSaving(true);
    try {
      await onSubmit(value);
    } catch (error) {
      setSaving(false);
      showErrors(error.fields || {}, `The recipe was not saved. ${error.message}`);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      event.stopPropagation();
      onCancel();
    }
  }

  return (
    <form className="recipe-form" onSubmit={handleSubmit} onKeyDown={handleKeyDown} noValidate>
      <h2 id="recipe-form-heading">Add a recipe</h2>

      <div className="field location-field">
        <p className="location-value">
          <span className="field-label">Location:</span> {formatLocation(location)}
        </p>
        <p className="field-help">Click the map or drag the pin to move it, or pan the map and use its centre.</p>
        <button type="button" className="button button-secondary" onClick={onUseMapCenter}>
          Use map centre
        </button>
        {errors.location && <p className="field-error">{errors.location}</p>}
      </div>

      <TextField
        field="name"
        label="Recipe name"
        value={values.name}
        onChange={update("name")}
        error={errors.name}
        ref={nameRef}
        maxLength={120}
        autoComplete="off"
      />
      <TextField
        field="country"
        label="Country"
        value={values.country}
        onChange={update("country")}
        error={errors.country}
        maxLength={80}
        autoComplete="country-name"
      />
      <TextField
        field="prepTimeMinutes"
        label="Preparation time (minutes)"
        type="number"
        inputMode="numeric"
        min={1}
        max={10080}
        step={1}
        value={values.prepTimeMinutes}
        onChange={update("prepTimeMinutes")}
        error={errors.prepTimeMinutes}
      />
      <IngredientTags
        id={FIELD_IDS.ingredients}
        tags={ingredients}
        onChange={setIngredients}
        draft={ingredientDraft}
        onDraftChange={setIngredientDraft}
        error={errors.ingredients}
      />
      <TextField
        field="steps"
        label="Recipe steps"
        help="Write each step on its own line."
        multiline
        rows={6}
        value={values.steps}
        onChange={update("steps")}
        error={errors.steps}
        maxLength={10000}
      />

      {formError && (
        <p className="form-error" role="alert">
          {formError}
        </p>
      )}

      <div className="form-actions">
        <button type="submit" className="button" disabled={saving}>
          {saving ? "Saving…" : "Save recipe"}
        </button>
        <button type="button" className="button button-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
