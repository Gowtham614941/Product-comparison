import React, { useState, useMemo } from 'react';
import { ArrowLeft, Share2, Download, SlidersHorizontal, EyeOff, Eye, Check } from 'lucide-react';
import VerdictBanner from './VerdictBanner';
import WeightAdjuster from './WeightAdjuster';
import CompareTable from './CompareTable';
import { calculateComparisonScores } from '../lib/scoring';
import { generateShareUrl } from '../lib/urlState';
import { exportComparisonToCsv } from '../lib/comparisonUtils';
import './ComparisonMatrix.css';

export default function ComparisonMatrix({
  products = [],
  categories = [],
  weights = {},
  onWeightChange,
  onResetWeights,
  onRemoveProduct,
  onOpenAlertModal,
  onBackToCatalog,
  onToast
}) {
  const [differencesOnly, setDifferencesOnly] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Derive active category from compared products
  const categoryId = products[0]?.category_id;
  const category = categories.find(c => c.id === categoryId) || products[0]?.categories;
  const specDefs = category?.spec_defs || [];

  // Algorithmic Scoring Computation
  const { scores, rowWinners, verdicts } = useMemo(() => {
    return calculateComparisonScores(products, specDefs, weights);
  }, [products, specDefs, weights]);

  if (products.length < 2) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
          Insufficient Products for Comparison
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Select at least 2 products (up to 4) from the catalog to generate an algorithmic comparison.
        </p>
        <button onClick={onBackToCatalog} className="btn btn-primary">
          <ArrowLeft size={16} />
          <span>Browse Catalog Explorer</span>
        </button>
      </div>
    );
  }

  const handleShare = () => {
    const url = generateShareUrl(products.map(p => p.id), weights);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    onToast('Shareable comparison link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleExportCsv = () => {
    exportComparisonToCsv(products, specDefs);
    onToast('Comparison matrix exported to CSV');
  };

  return (
    <div className="container comparison-container">
      {/* Top Header Bar */}
      <div className="compare-header-bar">
        <button onClick={onBackToCatalog} className="btn btn-secondary">
          <ArrowLeft size={16} />
          <span>Catalog Explorer</span>
        </button>

        <div className="compare-tools">
          {/* Differences Only Toggle */}
          <div
            className="toggle-switch-wrap"
            onClick={() => setDifferencesOnly(!differencesOnly)}
            title="Toggle to view only specifications where compared products differ"
          >
            <div className={`toggle-switch ${differencesOnly ? 'active' : ''}`}>
              <div className="toggle-thumb" />
            </div>
            <span className="toggle-label">
              {differencesOnly ? 'Differences Only' : 'All Specifications'}
            </span>
          </div>

          {/* Export to CSV */}
          <button
            onClick={handleExportCsv}
            className="btn btn-secondary"
            title="Export full specification matrix to CSV spreadsheet"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          {/* Share Comparison Link */}
          <button
            onClick={handleShare}
            className="btn btn-primary"
            title="Generate and copy shareable URL"
          >
            {copiedLink ? <Check size={15} /> : <Share2 size={15} />}
            <span>{copiedLink ? 'Link Copied' : 'Share Comparison'}</span>
          </button>
        </div>
      </div>

      {/* 1. Algorithmic Verdict Banners */}
      <VerdictBanner verdicts={verdicts} scores={scores} />

      {/* 2. Interactive Spec Weight Adjuster */}
      <WeightAdjuster
        specDefs={specDefs}
        weights={weights}
        onWeightChange={onWeightChange}
        onReset={onResetWeights}
      />

      {/* 3. Master Side-by-Side Comparison Table */}
      <CompareTable
        products={products}
        specDefs={specDefs}
        scores={scores}
        rowWinners={rowWinners}
        differencesOnly={differencesOnly}
        onRemoveProduct={onRemoveProduct}
        onOpenAlertModal={onOpenAlertModal}
      />
    </div>
  );
}
