/**
 * useCollection.js
 *
 * Central hook for all Collection (Tủ đồ) state and actions.
 * Provides: products, loading, error, tab, and all action helpers.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import collectionApi from '../api/collectionApi';

// Statuses that belong in the "Đang sử dụng" tab
const ACTIVE_STATUSES = new Set(['active', 'expired_warning']);
// Statuses that belong in the "Đã sử dụng" tab
const USED_STATUSES = new Set(['used_up']);

export default function useCollection() {
    const [allProducts, setAllProducts]   = useState([]);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState(null);
    const [tab, setTab]                   = useState('active');

    // ── Fetch ─────────────────────────────────────────────────────────────────
    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch both tabs in one call; server already scanned expiry statuses.
            // We ask for 'active' (includes expired_warning) then merge 'used'.
            const [activeRes, usedRes] = await Promise.all([
                collectionApi.getAllProducts('active'),
                collectionApi.getAllProducts('used'),
            ]);

            const active = Array.isArray(activeRes) ? activeRes : [];
            const used   = Array.isArray(usedRes)   ? usedRes   : [];

            setAllProducts([...active, ...used]);
        } catch (err) {
            setError(err?.message || 'Không thể tải tủ đồ. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    // ── Derived lists ──────────────────────────────────────────────────────────
    const activeProducts = useMemo(
        () => allProducts.filter(p => ACTIVE_STATUSES.has(p.status)),
        [allProducts]
    );
    const usedProducts = useMemo(
        () => allProducts.filter(p => USED_STATUSES.has(p.status)),
        [allProducts]
    );
    const productsForTab = tab === 'active' ? activeProducts : usedProducts;

    // Products that have expired_warning AND user hasn't dismissed (continueAfterExpiry=false)
    const pendingExpiredAlerts = useMemo(
        () => allProducts.filter(p => p.status === 'expired_warning' && !p.continueAfterExpiry),
        [allProducts]
    );

    // ── Helpers to patch local state without full reload ───────────────────────
    const patchProduct = useCallback((id, changes) => {
        setAllProducts(prev => prev.map(p =>
            (p._id || p.id) === id ? { ...p, ...changes } : p
        ));
    }, []);

    const removeFromState = useCallback((id) => {
        setAllProducts(prev => prev.filter(p => (p._id || p.id) !== id));
    }, []);

    // ── Actions ────────────────────────────────────────────────────────────────

    /** Edit product fields (openedDate, expirationDate, note, etc.) */
    const updateProduct = useCallback(async (id, payload) => {
        const updated = await collectionApi.updateProduct(id, payload);
        patchProduct(id, updated);
        return updated;
    }, [patchProduct]);

    /**
     * Delete product. Returns { wasInRoutine, replacedWith }.
     * If wasInRoutine === true, caller should show "routine updated" feedback.
     */
    const deleteProduct = useCallback(async (id) => {
        const result = await collectionApi.deleteProduct(id);
        removeFromState(id);
        return result;
    }, [removeFromState]);

    /**
     * Mark product as used_up (đã dùng hết).
     * Returns { product, wasInRoutine, replacedWith }.
     */
    const markAsUsedUp = useCallback(async (id) => {
        const result = await collectionApi.markAsUsedUp(id);
        // Move to used tab locally
        patchProduct(id, { status: 'used_up', continueAfterExpiry: false });
        return result;
    }, [patchProduct]);

    /**
     * Resolve expired-product alert popup.
     *  action = 'stop'     → move to "Đã sử dụng"
     *  action = 'continue' → keep in active with red badge
     */
    const resolveExpiredAlert = useCallback(async (id, action) => {
        const updated = await collectionApi.resolveExpiredAlert(id, action);
        if (action === 'stop') {
            patchProduct(id, { status: 'used_up', continueAfterExpiry: false });
        } else {
            patchProduct(id, { continueAfterExpiry: true });
        }
        return updated;
    }, [patchProduct]);

    // Compatibility aliases for older screens that consume the collection
    // context directly.
    const restoreProduct = useCallback(async (id) => {
        const updated = await collectionApi.updateProduct(id, {
            status: 'active',
            continueAfterExpiry: false,
        });
        patchProduct(id, updated);
        return updated;
    }, [patchProduct]);

    return {
        // State
        allProducts,
        collection: allProducts,
        activeProducts,
        usedProducts,
        productsForTab,
        pendingExpiredAlerts,
        loading,
        isCollectionLoading: loading,
        error,
        collectionError: error,
        tab,
        // Tab control
        setTab,
        // CRUD actions
        load,          // refresh all
        refreshCollection: load,
        updateProduct,
        deleteProduct,
        markAsUsedUp,
        markAsEmpty: markAsUsedUp,
        restoreProduct,
        resolveExpiredAlert,
    };
}

