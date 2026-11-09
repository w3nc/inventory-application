// Prices are stored as whole centavos (cents) so no rounding is lost.
// These helpers turn "PHP 1,850" into 185000 and back again.

// Reads what a person types: "1850", "1,850", "php 1,850.50", "1850.5".
// Returns centavos, or null when the text is not a price.
function parsePesos(input) {
  if (input === null || input === undefined) return null;

  const cleaned = String(input)
    .trim()
    .replace(/php/gi, "")
    .replace(/[₱,\s]/g, "");

  if (cleaned === "") return null;
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;

  const [pesos, cents = ""] = cleaned.split(".");
  return Number(pesos) * 100 + Number(cents.padEnd(2, "0"));
}

// 185000 becomes "PHP 1,850", and 185050 becomes "PHP 1,850.50".
function formatPesos(cents) {
  const total = Number(cents || 0);
  const pesos = Math.floor(total / 100);
  const rest = total % 100;
  const grouped = pesos.toLocaleString("en-PH");

  return rest === 0
    ? `PHP ${grouped}`
    : `PHP ${grouped}.${String(rest).padStart(2, "0")}`;
}

// For the edit form: 185000 becomes "1850.00" style plain text.
function pesosInputValue(cents) {
  const total = Number(cents || 0);
  return (total / 100).toFixed(2);
}

module.exports = { parsePesos, formatPesos, pesosInputValue };
