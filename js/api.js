// Gestion des requêtes et des réponses API

const API_BASE = "https://xaus.com/api/v1";
const requestLog = [];
const historyCache = new Map();

function saveRequest(url, status, duration) {
  requestLog.unshift({ method: "GET", url, status, duration });

  if (requestLog.length > 8) {
    requestLog.pop();
  }

  document.dispatchEvent(
    new CustomEvent("mizan:request-log", {
      detail: [...requestLog]
    })
  );
}

export async function requestJson(path, params = {}) {
  const url = new URL(`${API_BASE}${path}`);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const start = performance.now();

  try {
    const response = await fetch(url, {
      cache: "no-store"
    });

    const duration = Math.round(performance.now() - start);

    if (!response.ok) {
      saveRequest(url.href, response.status, duration);

      const error = new Error(
        response.status === 429
          ? "Quota API dépassé. Réessayez dans une minute."
          : `Erreur du service API (${response.status}).`
      );

      error.status = response.status;
      error.kind =
        response.status === 429
          ? "quota"
          : response.status >= 500
            ? "server"
            : "client";

      throw error;
    }

    let data;

    try {
      data = await response.json();
    } catch {
      saveRequest(url.href, response.status, duration);

      const error = new Error(
        "La réponse de l'API n'est pas un JSON valide."
      );

      error.kind = "invalid-json";
      throw error;
    }

    saveRequest(url.href, response.status, duration);

    return data;
  } catch (error) {
    if (!error.status && error.kind !== "invalid-json") {
      saveRequest(
        url.href,
        "Réseau",
        Math.round(performance.now() - start)
      );

      if (!navigator.onLine) {
        error.kind = "offline";
        error.message = "Aucune connexion Internet. Vérifiez votre réseau.";
      } else {
        error.kind = "network";
        error.message = "Impossible de contacter le service des cours. Vérifiez votre connexion.";
      }
    }

    throw error;
  }
}

export function getSpot(currency) {
  return requestJson("/spot", {
    currency,
    unit: "gram",
    compact: "1"
  });
}

export function getMetalHistory(metal, forceRefresh = false) {
  if (forceRefresh) {
    historyCache.delete(metal);
  }

  if (historyCache.has(metal)) {
    return historyCache.get(metal);
  }

  const symbol = metal === "silver" ? "silver" : "xau";

  const request = requestJson("/chart", {
    symbol,
    range: "1mo",
    interval: "1d"
  })
    .then(data => {
      if (!Array.isArray(data.points)) {
        throw new Error("Format de l'historique invalide.");
      }

      return data;
    })
    .catch(error => {
      historyCache.delete(metal);
      throw error;
    });

  historyCache.set(metal, request);

  return request;
}
