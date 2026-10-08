// ==============================================================================
// OmniSpec URL State Serialization Engine
// Synchronizes comparison selection and user weights with query parameters.
// ==============================================================================

/**
 * Parses comparison state from current window location
 * @returns {{ productIds: string[], weights: Record<string, number> }}
 */
export function parseUrlComparisonState() {
  if (typeof window === 'undefined') {
    return { productIds: [], weights: {} };
  }

  const params = new URLSearchParams(window.location.search);
  const compareParam = params.get('c');
  const weightsParam = params.get('w');

  const productIds = compareParam
    ? compareParam.split(',').map(id => id.trim()).filter(Boolean).slice(0, 4)
    : [];

  const weights = {};
  if (weightsParam) {
    weightsParam.split(',').forEach(pair => {
      const [key, val] = pair.split(':');
      if (key && val && !isNaN(Number(val))) {
        weights[key.trim()] = Number(val);
      }
    });
  }

  return { productIds, weights };
}

/**
 * Serializes state to query parameters and updates browser address bar without reload
 */
export function syncStateToUrl(productIds = [], weights = {}) {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);

  if (productIds.length > 0) {
    url.searchParams.set('c', productIds.join(','));
  } else {
    url.searchParams.delete('c');
  }

  // Only serialize weights that differ from standard 1.0
  const nonDefaultWeights = Object.entries(weights)
    .filter(([_, val]) => typeof val === 'number' && Math.abs(val - 1.0) > 0.01)
    .map(([k, v]) => `${k}:${v}`)
    .join(',');

  if (nonDefaultWeights) {
    url.searchParams.set('w', nonDefaultWeights);
  } else {
    url.searchParams.delete('w');
  }

  window.history.replaceState({}, '', url.toString());
}

/**
 * Generates an absolute shareable URL for copying
 */
export function generateShareUrl(productIds = [], weights = {}) {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.origin + window.location.pathname);

  if (productIds.length > 0) {
    url.searchParams.set('c', productIds.join(','));
  }

  const nonDefaultWeights = Object.entries(weights)
    .filter(([_, val]) => typeof val === 'number' && Math.abs(val - 1.0) > 0.01)
    .map(([k, v]) => `${k}:${v}`)
    .join(',');

  if (nonDefaultWeights) {
    url.searchParams.set('w', nonDefaultWeights);
  }

  return url.toString();
}
