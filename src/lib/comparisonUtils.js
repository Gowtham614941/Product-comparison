// ==============================================================================
// OmniSpec Comparison Utilities
// Difference detection, formatting, CSV export, and clipboard reporting.
// ==============================================================================

/**
 * Checks whether all compared products have identical values for a given spec key
 */
export function isSpecIdentical(products, specKey) {
  if (!products || products.length <= 1) return false;

  const values = products.map(p => {
    const v = p.specs?.[specKey];
    if (v === undefined || v === null) return '__UNDEFINED__';
    if (typeof v === 'string') return v.trim().toLowerCase();
    return String(v);
  });

  const first = values[0];
  return values.every(v => v === first);
}

/**
 * Formats a spec value with proper units and typography
 */
export function formatSpecValue(val, specDef) {
  if (val === undefined || val === null || val === '') {
    return '—';
  }

  if (specDef?.type === 'bool' || typeof val === 'boolean') {
    return val ? 'Yes' : 'No';
  }

  if (specDef?.type === 'number' || typeof val === 'number') {
    const num = Number(val);
    if (!isNaN(num)) {
      const formatted = num.toLocaleString('en-US');
      return specDef?.unit ? `${formatted} ${specDef.unit}` : formatted;
    }
  }

  return specDef?.unit ? `${val} ${specDef.unit}` : String(val);
}

/**
 * Formats standard USD currency
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '—';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

/**
 * Exports currently compared products matrix to a formatted CSV file
 */
export function exportComparisonToCsv(products, specDefs) {
  if (!products || products.length === 0) return;

  const headers = ['Specification', ...products.map(p => `"${p.brand} ${p.name}"`)];
  const rows = [headers.join(',')];

  // Best Price Row
  const priceRow = [
    '"Best Price"',
    ...products.map(p => {
      const minPrice = p.store_prices && p.store_prices.length > 0
        ? Math.min(...p.store_prices.map(s => Number(s.price)))
        : null;
      return minPrice ? `"${formatCurrency(minPrice)}"` : '"N/A"';
    })
  ];
  rows.push(priceRow.join(','));

  // Specs Rows
  specDefs.forEach(def => {
    const row = [
      `"${def.label}${def.unit ? ` (${def.unit})` : ''}"`,
      ...products.map(p => {
        const val = p.specs?.[def.key];
        const formatted = formatSpecValue(val, def);
        return `"${String(formatted).replace(/"/g, '""')}"`;
      })
    ];
    rows.push(row.join(','));
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.join('\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', `omnispec-comparison-${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
