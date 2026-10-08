// ==============================================================================
// OmniSpec Algorithmic Scoring & Market Timing Intelligence Engine
// Implements Multi-Attribute Utility Theory (MAUT), Value-for-Money Indexing,
// and Historical Price Volatility Analysis.
// ==============================================================================

export const WEIGHT_LEVELS = {
  IGNORE: { label: 'Ignore', value: 0.0, multiplier: '0x' },
  NORMAL: { label: 'Normal', value: 1.0, multiplier: '1.0x' },
  HIGH: { label: 'High', value: 1.75, multiplier: '1.75x' },
  TOP: { label: 'Top Priority', value: 2.5, multiplier: '2.5x' },
};

/**
 * Returns lowest price across all stores for a given product
 */
export function getProductBestPrice(product) {
  if (!product?.store_prices || product.store_prices.length === 0) {
    return null;
  }
  const prices = product.store_prices
    .map(sp => Number(sp.price))
    .filter(p => !isNaN(p) && p > 0);

  if (prices.length === 0) return null;
  return Math.min(...prices);
}

/**
 * Calculates row winner product IDs for a specific specification
 */
export function calculateRowWinner(specDef, products) {
  if (!specDef || specDef.dir === 0 || !products || products.length === 0) {
    return [];
  }

  const { key, dir, type } = specDef;
  const validEntries = products
    .map(p => ({
      id: p.id,
      val: p.specs?.[key]
    }))
    .filter(e => e.val !== undefined && e.val !== null && e.val !== '');

  if (validEntries.length < 2) return [];

  // Check if all are identical
  const firstVal = validEntries[0].val;
  const allIdentical = validEntries.every(e => e.val === firstVal);
  if (allIdentical) return [];

  if (type === 'bool') {
    const targetVal = dir === 1 ? true : false;
    const winners = validEntries.filter(e => Boolean(e.val) === targetVal).map(e => e.id);
    return winners.length === products.length ? [] : winners;
  }

  if (type === 'number' || typeof validEntries[0].val === 'number' || !isNaN(Number(validEntries[0].val))) {
    const numericEntries = validEntries.map(e => ({ id: e.id, num: Number(e.val) })).filter(e => !isNaN(e.num));
    if (numericEntries.length === 0) return [];

    let targetNum;
    if (dir === 1) {
      // Higher is better
      targetNum = Math.max(...numericEntries.map(e => e.num));
    } else {
      // Lower is better (dir === -1)
      targetNum = Math.min(...numericEntries.map(e => e.num));
    }

    return numericEntries.filter(e => Math.abs(e.num - targetNum) < 0.0001).map(e => e.id);
  }

  return [];
}

/**
 * Normalizes spec value between 0.0 and 1.0 across compared products
 */
function normalizeSpecValue(val, specDef, allValues) {
  if (val === undefined || val === null || val === '') return null;
  const { dir, type } = specDef;

  if (type === 'bool') {
    const boolVal = Boolean(val);
    if (dir === 1) return boolVal ? 1.0 : 0.0;
    if (dir === -1) return boolVal ? 0.0 : 1.0;
    return 0.5;
  }

  const numVal = Number(val);
  if (isNaN(numVal)) return null;

  const validNumbers = allValues.map(v => Number(v)).filter(n => !isNaN(n));
  if (validNumbers.length <= 1) return 1.0;

  const min = Math.min(...validNumbers);
  const max = Math.max(...validNumbers);

  if (max === min) return 1.0;

  if (dir === 1) {
    // Higher is better
    return (numVal - min) / (max - min);
  } else if (dir === -1) {
    // Lower is better
    return (max - numVal) / (max - min);
  }

  return 0.5; // neutral
}

/**
 * Evaluates full multi-attribute utility score for all compared products
 * @param {Array} products - List of products being compared
 * @param {Array} specDefs - Specification definitions from category
 * @param {Object} userWeights - Map of spec key -> weight multiplier (e.g. { battery: 1.75 })
 */
export function calculateComparisonScores(products, specDefs = [], userWeights = {}) {
  if (!products || products.length === 0) {
    return {
      scores: {},
      verdicts: { bestSpecs: null, bestValue: null, lowestPrice: null },
      rowWinners: {}
    };
  }

  const scores = {};
  const rowWinners = {};

  // 1. Compute row winners for visual highlighting
  specDefs.forEach(def => {
    rowWinners[def.key] = calculateRowWinner(def, products);
  });

  // Pre-collect values per scorable spec
  const valuesBySpec = {};
  specDefs.forEach(def => {
    if (def.dir !== 0 && (def.type === 'number' || def.type === 'bool')) {
      valuesBySpec[def.key] = products
        .map(p => p.specs?.[def.key])
        .filter(v => v !== undefined && v !== null && v !== '');
    }
  });

  // 2. Compute individual product scores
  products.forEach(product => {
    let weightedSum = 0;
    let totalWeight = 0;
    const specScores = {};

    specDefs.forEach(def => {
      if (def.dir === 0) return; // neutral spec excluded from algorithmic score

      const val = product.specs?.[def.key];
      const weight = userWeights[def.key] !== undefined ? userWeights[def.key] : 1.0;

      if (weight <= 0) return; // user chose to ignore this spec

      const norm = normalizeSpecValue(val, def, valuesBySpec[def.key] || []);

      if (norm !== null) {
        weightedSum += norm * weight;
        totalWeight += weight;
        specScores[def.key] = norm * 100;
      }
    });

    const overallScore = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 50;
    const bestPrice = getProductBestPrice(product);

    // Value score = overall score / (best price / 10,000)
    let valueScore = 0;
    if (bestPrice && bestPrice > 0) {
      valueScore = overallScore / (bestPrice / 10000);
    }

    scores[product.id] = {
      overallScore: Math.round(overallScore * 10) / 10,
      valueScore: Math.round(valueScore * 10) / 10,
      bestPrice,
      specScores
    };
  });

  // 3. Determine Verdict Winners
  let bestSpecsProduct = null;
  let bestValueProduct = null;
  let lowestPriceProduct = null;

  let maxOverall = -1;
  let maxValue = -1;
  let minPrice = Infinity;

  products.forEach(p => {
    const s = scores[p.id];
    if (!s) return;

    if (s.overallScore > maxOverall) {
      maxOverall = s.overallScore;
      bestSpecsProduct = p;
    }

    if (s.valueScore > maxValue && s.bestPrice !== null) {
      maxValue = s.valueScore;
      bestValueProduct = p;
    }

    if (s.bestPrice !== null && s.bestPrice < minPrice) {
      minPrice = s.bestPrice;
      lowestPriceProduct = p;
    }
  });

  return {
    scores,
    rowWinners,
    verdicts: {
      bestSpecs: bestSpecsProduct ? { product: bestSpecsProduct, score: maxOverall } : null,
      bestValue: bestValueProduct ? { product: bestValueProduct, score: maxValue } : null,
      lowestPrice: lowestPriceProduct ? { product: lowestPriceProduct, price: minPrice } : null,
    }
  };
}

/**
 * Market Timing Oracle: "Wait or Buy" Price Recommendation
 * Based on current price vs. historical average and historical low
 * Requires at least 3 historical data points
 */
export function evaluateMarketTiming(currentPrice, priceHistory = []) {
  if (!currentPrice || !priceHistory || priceHistory.length < 3) {
    return {
      status: 'INSUFFICIENT_DATA',
      label: 'Insufficient History',
      color: 'slate',
      reason: 'Requires at least 3 historical price logs to establish market volatility bounds.',
      lowPrice: null,
      avgPrice: null,
      deviation: 0
    };
  }

  const prices = priceHistory.map(h => Number(h.price)).filter(p => !isNaN(p) && p > 0);
  if (prices.length < 3) {
    return {
      status: 'INSUFFICIENT_DATA',
      label: 'Insufficient History',
      color: 'slate',
      reason: 'Requires at least 3 verified price records.',
      lowPrice: null,
      avgPrice: null,
      deviation: 0
    };
  }

  const lowPrice = Math.min(...prices);
  const avgPrice = prices.reduce((acc, p) => acc + p, 0) / prices.length;

  // Buy if within 2% of historical low
  if (currentPrice <= lowPrice * 1.02) {
    const diff = Math.round(((lowPrice - currentPrice) / lowPrice) * 100);
    return {
      status: 'STRONG_BUY',
      label: 'Strong Buy',
      color: 'emerald',
      reason: currentPrice <= lowPrice
        ? 'Currently at all-time recorded low price.'
        : `Within 2% of the historical low ($${lowPrice.toFixed(2)}).`,
      lowPrice,
      avgPrice,
      deviation: diff
    };
  }

  // Wait if more than 5% above historical average
  if (currentPrice >= avgPrice * 1.05) {
    const diff = Math.round(((currentPrice - avgPrice) / avgPrice) * 100);
    return {
      status: 'WAIT',
      label: 'Wait to Buy',
      color: 'amber',
      reason: `${diff}% above historical average ($${avgPrice.toFixed(2)}). A price drop is probable.`,
      lowPrice,
      avgPrice,
      deviation: diff
    };
  }

  // Otherwise fair
  return {
    status: 'FAIR',
    label: 'Fair Market Price',
    color: 'indigo',
    reason: `Hovering near historical average ($${avgPrice.toFixed(2)}). Reasonable purchase timing.`,
    lowPrice,
    avgPrice,
    deviation: 0
  };
}
