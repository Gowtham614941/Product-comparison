import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from './components/Navbar';
import IntroPage from './components/IntroPage';
import CatalogView from './components/CatalogView';
import ComparisonMatrix from './components/ComparisonMatrix';
import FloatingDock from './components/FloatingDock';
import PriceAlertModal from './components/PriceAlertModal';
import UserAlertsDrawer from './components/UserAlertsDrawer';
import Footer from './components/Footer';
import ToastContainer from './components/ToastContainer';
import { useCatalog } from './hooks/useCatalog';
import { useAuth } from './hooks/useAuth';
import { parseUrlComparisonState, syncStateToUrl } from './lib/urlState';

export default function App() {
  const {
    categories,
    products,
    allProducts,
    selectedCategorySlug,
    setSelectedCategorySlug,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    maxPrice,
    setMaxPrice,
    loading: catalogLoading,
    refreshCatalog,
    error: catalogError,
    isConfigured
  } = useCatalog();

  const {
    user,
    isAuthenticated,
    loading: authLoading,
    alerts,
    alertsLoading,
    signInWithPassword,
    signUp,
    loginAsGuest,
    loginAsDirectUser,
    signOut,
    createAlert,
    deleteAlert
  } = useAuth();

  // Navigation and Selection State
  const [viewMode, setViewMode] = useState('catalog'); // 'catalog' | 'compare'
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [weights, setWeights] = useState({});

  // Modals & UI State
  const [activeAlertProduct, setActiveAlertProduct] = useState(null);
  const [isAlertsDrawerOpen, setIsAlertsDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Toast Notification Dispatcher
  const showToast = useCallback((message) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 4);
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // 1. Initial URL State Ingestion on Mount
  useEffect(() => {
    const { productIds, weights: urlWeights } = parseUrlComparisonState();
    if (productIds.length > 0) {
      setSelectedProductIds(productIds);
      if (productIds.length >= 2) {
        setViewMode('compare');
      }
    }
    if (Object.keys(urlWeights).length > 0) {
      setWeights(urlWeights);
    }
  }, []);

  // 2. Synchronize State changes back to Address Bar
  useEffect(() => {
    if (isAuthenticated) {
      syncStateToUrl(selectedProductIds, weights);
    }
  }, [selectedProductIds, weights, isAuthenticated]);

  // Derive Selected Products Array
  const selectedProducts = useMemo(() => {
    return selectedProductIds
      .map(id => allProducts.find(p => p.id === id))
      .filter(Boolean);
  }, [selectedProductIds, allProducts]);

  // Selection Handlers
  const handleToggleCompare = useCallback((product) => {
    setSelectedProductIds(prev => {
      if (prev.includes(product.id)) {
        return prev.filter(id => id !== product.id);
      }

      if (prev.length > 0) {
        const firstProd = allProducts.find(p => p.id === prev[0]);
        if (firstProd && product.category_id && firstProd.category_id !== product.category_id) {
          showToast(`Note: Comparing devices from different categories.`);
        }
      }

      if (prev.length >= 4) {
        showToast('Maximum 4 products allowed for side-by-side comparison.');
        return prev;
      }

      const next = [...prev, product.id];
      showToast(`Added ${product.brand} ${product.name} to comparison`);
      return next;
    });
  }, [allProducts, showToast]);

  const handleRemoveProduct = useCallback((productId) => {
    setSelectedProductIds(prev => prev.filter(id => id !== productId));
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedProductIds([]);
    setWeights({});
    setViewMode('catalog');
    showToast('Comparison selection cleared');
  }, [showToast]);

  // Handle Preset Selection from Hero
  const handleSelectPreset = useCallback((presetProductIds) => {
    setSelectedProductIds(presetProductIds);
    setViewMode('compare');
    showToast('Loaded preset side-by-side comparison');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [showToast]);

  // Weight Handlers
  const handleWeightChange = useCallback((specKey, newWeight) => {
    setWeights(prev => ({
      ...prev,
      [specKey]: newWeight
    }));
  }, []);

  const handleResetWeights = useCallback(() => {
    setWeights({});
    showToast('All specification weights reset to default');
  }, [showToast]);

  // Auth Handlers for Intro Page
  const handleLogin = async (email, password) => {
    const res = await signInWithPassword(email, password);
    if (!res.error) {
      showToast(`Welcome back, ${email.split('@')[0]}!`);
    }
    return res;
  };

  const handleSignUp = async (email, password, fullName) => {
    const res = await signUp(email, password, fullName);
    if (!res.error) {
      if (res.rateLimitBypassed) {
        showToast(`Welcome to OmniSpec, ${fullName || email.split('@')[0]}! (Bypassed email rate limit)`);
      } else {
        showToast('Account registered successfully. Welcome to OmniSpec!');
      }
    }
    return res;
  };

  const handleGuestAccess = () => {
    loginAsGuest();
    showToast('Welcome to the OmniSpec interactive preview!');
  };

  const handleBypassAsUser = (email, fullName) => {
    loginAsDirectUser(email, fullName);
    showToast(`Welcome to OmniSpec, ${fullName || email.split('@')[0]}!`);
  };

  const handleSignOut = async () => {
    await signOut();
    setSelectedProductIds([]);
    setViewMode('catalog');
    showToast('Signed out. Returned to introduction page.');
  };

  // If user is not authenticated, render Introduction & Auth Page first!
  if (!isAuthenticated) {
    return (
      <div className="app-shell">
        <IntroPage
          onLogin={handleLogin}
          onSignUp={handleSignUp}
          onGuestAccess={handleGuestAccess}
          onBypassAsUser={handleBypassAsUser}
          authLoading={authLoading}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  // Once authenticated (or entered as guest), render Main Project Workspace
  return (
    <div className="app-shell">
      {/* Top Application Navigation */}
      <Navbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedCount={selectedProductIds.length}
        alertsCount={alerts.length}
        onOpenAlerts={() => setIsAlertsDrawerOpen(true)}
        user={user}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {viewMode === 'catalog' ? (
          <CatalogView
            categories={categories}
            products={products}
            allProducts={allProducts}
            selectedCategorySlug={selectedCategorySlug}
            onSelectCategory={(slug) => {
              setSelectedCategorySlug(slug);
              const el = document.getElementById('catalog-explorer');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            maxPrice={maxPrice}
            onMaxPriceChange={setMaxPrice}
            loading={catalogLoading}
            selectedProductIds={selectedProductIds}
            onToggleCompare={handleToggleCompare}
            onSelectPreset={handleSelectPreset}
            onRefresh={refreshCatalog}
            error={catalogError}
          />
        ) : (
          <ComparisonMatrix
            products={selectedProducts}
            categories={categories}
            weights={weights}
            onWeightChange={handleWeightChange}
            onResetWeights={handleResetWeights}
            onRemoveProduct={handleRemoveProduct}
            onOpenAlertModal={setActiveAlertProduct}
            onBackToCatalog={() => {
              setViewMode('catalog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onToast={showToast}
          />
        )}
      </main>

      {/* Sticky Bottom Comparison Dock */}
      <FloatingDock
        selectedProducts={selectedProducts}
        onRemove={handleRemoveProduct}
        onClear={handleClearSelection}
        onCompareNow={() => setViewMode(viewMode === 'compare' ? 'catalog' : 'compare')}
        isComparing={viewMode === 'compare'}
      />

      {/* Price Alert Modal */}
      {activeAlertProduct && (
        <PriceAlertModal
          product={activeAlertProduct}
          onClose={() => setActiveAlertProduct(null)}
          onCreateAlert={createAlert}
          onToast={showToast}
        />
      )}

      {/* User Alerts Drawer */}
      <UserAlertsDrawer
        isOpen={isAlertsDrawerOpen}
        onClose={() => setIsAlertsDrawerOpen(false)}
        alerts={alerts}
        loading={alertsLoading}
        onDeleteAlert={deleteAlert}
        onToast={showToast}
      />

      {/* Human-Crafted Footer */}
      <Footer onSelectCategory={(slug) => {
        setSelectedCategorySlug(slug);
        setViewMode('catalog');
      }} />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
