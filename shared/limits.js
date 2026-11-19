// Field limits shared by the API validation, the database schema and the add-recipe form.

export const NAME_MAX = 120;
export const COUNTRY_MAX = 80;
export const PREP_MIN = 1;
export const PREP_MAX = 10080;
export const STEPS_MAX = 10000;

// Upper bound on markers sent to the map in one GET /recipes response.
export const MAP_LIMIT = 1000;
