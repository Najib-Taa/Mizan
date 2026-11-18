// Point de lancement de l'application et lien vers les événements
import { getSpot, getMetalHistory } from "./api.js";
import { calculateValue } from "./calculator.js";
import { calculateVariation, renderHistoryChart, selectHistoryPoints } from "./history.js";
import {
  formatUpdatedAt,
  getMetalPrices,
  renderEstimate,
  renderPriceCards,
  showStatus
} from "./ui.js";

const $ = selector => document.querySelector(selector);
const currencySelect = $("#currency-select");
const refreshButton = $("#refresh-button");
const retryButton = $("#retry-button");
const statusMessage = $("#status-message");
const priceCards = $("#price-cards");
const updatedAt = $("#updated-at");
const historyMetal = $("#history-metal");
const historyPeriod = $("#history-period");
const historyStatus = $("#history-status");
const historyChart = $("#history-chart");
const calculatorForm = $("#calculator-form");
const weightInput = $("#weight-input");
const calculatorMetal = $("#calculator-metal");
const calculatorError = $("#calculator-error");
const calculatorResult = $("#calculator-result");

let currentSpot = null;
let lastFailedRequest = null;
let loadingSpot = false;
let loadingHistory = false;

function getSavedCurrency() {
  try {
    const currency = localStorage.getItem("mizan-currency");
    return ["MAD", "USD", "EUR"].includes(currency) ? currency : "MAD";
  } catch {
    return "MAD";
  }
}

function saveCurrency(currency) {
  try {
    localStorage.setItem("mizan-currency", currency);
  } catch {
    showStatus(statusMessage, "Impossible de mémoriser la devise dans ce navigateur.", "warning");
  }
}

function updateButtons() {
  refreshButton.disabled = loadingSpot;
  currencySelect.disabled = loadingSpot;
  historyMetal.disabled = loadingHistory;
  historyPeriod.disabled = loadingHistory;
  retryButton.disabled = loadingSpot || loadingHistory;
  retryButton.hidden = !lastFailedRequest;
}

async function getVariations(data) {
  const metals = getMetalPrices(data);
  const variations = {};
  let hasError = false;

  for (const metal of metals) {
    try {
      const history = await getMetalHistory(metal.metal);
      variations[metal.metal] = calculateVariation(history.points, data.fx_rate);
      if (!variations[metal.metal]) hasError = true;
    } catch {
      hasError = true;
    }
  }

  return { variations, hasError };
}

async function loadSpot() {
  if (loadingSpot) return;

  loadingSpot = true;
  updateButtons();
  showStatus(statusMessage, "Chargement des cours…");

  try {
    const currency = currencySelect.value;
    const data = await getSpot(currency);

    if (data.data_state?.status === "unavailable") {
      throw new Error("Les cours sont momentanément indisponibles.");
    }

    if (!getMetalPrices(data).length) {
      throw new Error("La réponse de l'API ne contient aucun prix exploitable.");
    }

    currentSpot = data;
    updatedAt.textContent = formatUpdatedAt(data.price_as_of || data.updated_at);
    renderPriceCards(priceCards, data, currency);

    const result = await getVariations(data);
    renderPriceCards(priceCards, data, currency, result.variations);

    const date = new Date(data.updated_at);
    const isOld = data.data_state?.status === "stale" || data.fx_stale ||
      (Number.isFinite(date.getTime()) && Date.now() - date.getTime() > 5 * 60 * 1000);

    if (result.hasError) {
      showStatus(statusMessage, "Prix disponibles, mais certaines variations ne sont pas disponibles.", "warning");
      lastFailedRequest = loadSpot;
    } else if (isOld) {
      showStatus(statusMessage, "Attention : certaines données peuvent être anciennes.", "warning");
      lastFailedRequest = null;
    } else {
      showStatus(statusMessage, "Les cours ont été récupérés avec succès.", "success");
      lastFailedRequest = null;
    }
} catch (error) {
  showStatus(statusMessage, error.message, "error");
  lastFailedRequest = loadSpot;
}

  loadingSpot = false;
  updateButtons();
}

async function loadHistory(forceRefresh = false) {
  if (loadingHistory) return;

  loadingHistory = true;
  updateButtons();
  showStatus(historyStatus, "Chargement de l'historique…");

  try {
    const data = await getMetalHistory(historyMetal.value, forceRefresh);
    const points = selectHistoryPoints(data.points, historyPeriod.value);

    if (!points.length) {
      throw new Error("Aucun point historique disponible pour cette période.");
    }

    renderHistoryChart(historyChart, points);
    showStatus(historyStatus, `${points.length} point(s) affiché(s) en USD par once troy (31,1035 g de métal).`, "success");
    if (lastFailedRequest === loadHistory) lastFailedRequest = null;
  } catch (error) {
    renderHistoryChart(historyChart, []);
    showStatus(historyStatus, error.message, "error");
    lastFailedRequest = loadHistory;
  }

  loadingHistory = false;
  updateButtons();
}

currencySelect.value = getSavedCurrency();
currencySelect.addEventListener("change", () => {
  saveCurrency(currencySelect.value);
  currentSpot = null;
  priceCards.replaceChildren();
  updatedAt.textContent = "Mise à jour en cours…";
  loadSpot();
});

refreshButton.addEventListener("click", loadSpot);
retryButton.addEventListener("click", () => {
  if (lastFailedRequest === loadHistory) {
    loadHistory(true);
  } else if (lastFailedRequest) {
    lastFailedRequest();
  }
});
historyMetal.addEventListener("change", loadHistory);
historyPeriod.addEventListener("change", loadHistory);

calculatorForm.addEventListener("submit", event => {
  event.preventDefault();
  calculatorError.textContent = "";

  try {
    if (!currentSpot) throw new Error("Attendez le chargement des cours avant de calculer.");

    const prices = getMetalPrices(currentSpot);
    const selected = prices.find(item => item.metal === calculatorMetal.value);
    const value = calculateValue(weightInput.value, selected?.price);
    renderEstimate(calculatorResult, value, currencySelect.value);
  } catch (error) {
    calculatorError.textContent = error.message;
  }
});


loadSpot();
loadHistory();
