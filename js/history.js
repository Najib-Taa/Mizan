
function getDate(point) {
  if (point.d) return new Date(`${point.d}T00:00:00Z`);

  const time = Number(point.t);

  if (Number.isFinite(time)) {
    return new Date(time > 1e12 ? time : time * 1000);
  }

  return new Date(point.t);
}

function sortPoints(points) {
  return [...points].sort((a, b) => getDate(a) - getDate(b));
}

export function selectHistoryPoints(points, days) {
  if (!Array.isArray(points)) {
    throw new Error("Format de l'historique invalide.");
  }

  const validPoints = sortPoints(points.filter(point =>
    point.c !== null &&
    point.c !== undefined &&
    Number.isFinite(Number(point.c)) &&
    !Number.isNaN(getDate(point).getTime())
  ));

  if (!validPoints.length) return [];

  const lastDate = getDate(validPoints[validPoints.length - 1]);
  const firstDate = new Date(lastDate);

  firstDate.setUTCDate(firstDate.getUTCDate() - Number(days) + 1);

  return validPoints.filter(point => getDate(point) >= firstDate);
}

export function calculateVariation(points, fxRate) {
  if (!Array.isArray(points) || points.length < 2) return null;

  const ordered = sortPoints(points);
  const previous = Number(ordered[ordered.length - 2].c);
  const latest = Number(ordered[ordered.length - 1].c);
  const rate = Number(fxRate);

  if (![previous, latest, rate].every(Number.isFinite) || previous <= 0 || rate <= 0) {
    return null;
  }

  const change = latest - previous;

  return {
    amountPerGram: change * rate / 31.1034768,
    percentage: change / previous * 100,
    direction: change > 0 ? "up" : change < 0 ? "down" : "same"
  };
}

export function renderHistoryChart(container, points) {
  container.replaceChildren();

  const validPoints = sortPoints(points.filter(point =>
    point.c !== null &&
    point.c !== undefined &&
    Number.isFinite(Number(point.c)) &&
    !Number.isNaN(getDate(point).getTime())
  ));

  if (!validPoints.length) {
    const message = document.createElement("p");
    message.className = "chart-empty";
    message.textContent = "Aucune donnée historique disponible pour cette période.";
    container.append(message);
    return;
  }

  const values = validPoints.map(point => Number(point.c));
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);

  const range = maximum - minimum;
  const padding = range === 0 ? Math.abs(maximum) * 0.1 || 1 : range * 0.1;
  const baseline = Math.max(0, minimum - padding);
  const totalRange = maximum - baseline || 1;

  validPoints.forEach(point => {
    const value = Number(point.c);
    const date = getDate(point);

    const item = document.createElement("div");
    item.className = "chart-item";

    const bar = document.createElement("div");
    bar.className = "chart-bar";

    const height = ((value - baseline) / totalRange) * 100;
    bar.style.height = `${Math.max(8, height)}%`;

    const formattedDate = date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      timeZone: "UTC"
    });

    const formattedPrice = new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "USD"
    }).format(value);

    bar.title = `${formattedDate} : ${formattedPrice} / once troy`;
    bar.setAttribute("aria-label", `${formattedDate} : ${formattedPrice} par once troy`);

    const priceLabel = document.createElement("span");
    priceLabel.className = "chart-price";
    priceLabel.textContent = new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: 2
    }).format(value);

    const dateLabel = document.createElement("span");
    dateLabel.className = "chart-date";
    dateLabel.textContent = formattedDate;

    item.append(priceLabel, bar, dateLabel);
    container.append(item);
  });
}
