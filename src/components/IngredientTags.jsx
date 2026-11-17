import { useRef, useState } from "react";
import { MAX_INGREDIENT_LENGTH, cleanIngredient, normalizeIngredients } from "../../shared/ingredients.js";

/**
 * Ingredient entry as individual tags. Enter, a comma, or the Add button turns the
 * typed text into tags; each tag has its own remove button.
 */
export default function IngredientTags({ id, tags, onChange, draft, onDraftChange, error }) {
  const inputRef = useRef(null);
  const [hint, setHint] = useState("");
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  function addDraft() {
    const parts = draft.split(",").map(cleanIngredient).filter(Boolean);
    if (parts.length === 0) return;

    const tooLong = parts.find((part) => part.length > MAX_INGREDIENT_LENGTH);
    if (tooLong) {
      setHint(`Keep each ingredient to ${MAX_INGREDIENT_LENGTH} characters or fewer.`);
      return;
    }

    const next = normalizeIngredients([...tags, ...parts]);
    const added = next.slice(tags.length);
    setHint(
      added.length === 0
        ? `“${parts[0]}” is already in the list.`
        : `Added ${added.join(", ")}.`,
    );
    onChange(next);
    onDraftChange("");
  }

  function removeTag(tag) {
    onChange(tags.filter((existing) => existing !== tag));
    setHint(`Removed ${tag}.`);
    inputRef.current?.focus();
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addDraft();
    }
  }

  const describedBy = [hintId, error ? errorId : null].filter(Boolean).join(" ");

  return (
    <div className="field">
      <label htmlFor={id}>Ingredients</label>
      <p className="field-help" id={`${id}-help`}>
        Add one ingredient at a time. Press Enter or type a comma to add it.
      </p>
      <div className="tag-entry">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={handleKeyDown}
          aria-describedby={`${id}-help ${describedBy}`}
          aria-invalid={error ? "true" : undefined}
          autoComplete="off"
        />
        <button type="button" className="button button-secondary" onClick={addDraft}>
          Add
        </button>
      </div>
      <p id={hintId} className="field-help" aria-live="polite">
        {hint}
      </p>
      {error && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
      {tags.length > 0 && (
        <ul className="tag-list" aria-label="Added ingredients">
          {tags.map((tag) => (
            <li key={tag} className="tag">
              <span>{tag}</span>
              <button
                type="button"
                className="tag-remove"
                onClick={() => removeTag(tag)}
                aria-label={`Remove ${tag}`}
              >
                <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
