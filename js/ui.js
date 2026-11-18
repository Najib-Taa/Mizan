// Créez des fiches et consultez les dossiers
function formatMoney(value, currency, digits = 2) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(value);
}

export function showStatus(element, message, state = "") {
  element.textContent = message;
  element.dataset.state = state;
}

export function getMetalPrices(data) {
  const metals = [];
  const gold = Number(data.xau?.price);
  const silver = Number(data.silver_usd_oz) * Number(data.fx_rate) / 31.1034768;

  if (Number.isFinite(gold) && gold > 0) {
    metals.push({ metal: "gold", name: "Or", price: gold });
  }

  if (Number.isFinite(silver) && silver > 0) {
    metals.push({ metal: "silver", name: "Argent", price: silver });
  }

  return metals;
}

export function renderPriceCards(container, data, currency, variations = {}) {
  container.replaceChildren();

  getMetalPrices(data).forEach(metal => {
    const card = document.createElement("article");
    card.className = "price-card";

    const title = document.createElement("h3");
    title.textContent = metal.name;

    const price = document.createElement("p");
    price.className = "price-value";
    price.textContent = formatMoney(metal.price, currency, 4);

    const unit = document.createElement("p");
    unit.className = "price-unit";
    unit.textContent = "par gramme";

    const change = document.createElement("p");
    change.className = "price-meta";
    const variation = variations[metal.metal];

    if (variation) {
      const arrow = variation.direction === "up" ? "↑" : variation.direction === "down" ? "↓" : "→";
      change.textContent = `Variation : ${arrow} ${formatMoney(variation.amountPerGram, currency, 4)} (${variation.percentage.toFixed(2)} %)`;
      change.dataset.direction = variation.direction;
    } else {
      change.textContent = "Variation : indisponible pour le moment.";
    }

    card.append(title, price, unit, change);
    container.append(card);
  });

  if (!container.children.length) {
    const message = document.createElement("p");
    message.className = "chart-empty";
    message.textContent = "Aucun prix exploitable n'a été reçu.";
    container.append(message);
  }
}

export function formatUpdatedAt(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "Date de mise à jour indisponible";

  return `Mise à jour : ${new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date)}`;
}

export function renderEstimate(container, value, currency) {
  container.textContent = `Valeur estimée : ${formatMoney(value, currency)}`;
}
