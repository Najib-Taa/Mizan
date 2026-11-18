// Calculs et vérification du poids
export function calculateValue(weight, pricePerGram) {
  if (String(weight).trim() === "") {
    throw new Error("Saisissez le poids du bijou.");
  }

  const grams = Number(weight);

  if (!Number.isFinite(grams) || grams < 0) {
    throw new Error("Saisissez un poids positif ou nul.");
  }

  if (!Number.isFinite(pricePerGram) || pricePerGram <= 0) {
    throw new Error("Le prix du métal n'est pas disponible.");
  }

  return grams * pricePerGram;
}
