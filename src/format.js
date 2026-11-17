export function formatPrepTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${minutes} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

export function formatLocation({ lat, lng }) {
  const latText = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? "N" : "S"}`;
  const lngText = `${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? "E" : "W"}`;
  return `${latText}, ${lngText}`;
}
