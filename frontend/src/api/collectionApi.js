import axiosClient from './axiosClient';

// ---------------------------------------------------------------------------
// Internal response unwrapper
// ---------------------------------------------------------------------------
const unwrap = (body) => {
    if (body?.data !== undefined) return body.data;
    return body;
};

// ---------------------------------------------------------------------------
// Collection API
// ---------------------------------------------------------------------------
export const collectionApi = {
    // Scan-flow (called from ProductInfoDetail / AddProduct screens)
    analyzeProduct:        (data)      => axiosClient.post('/collections/analyze', data).then(res => res),
    saveDraft:             (data)      => axiosClient.post('/collections/draft', data).then(unwrap),
    addProduct:            (data)      => axiosClient.post('/collections/add', data).then(unwrap),

    // Collection CRUD
    /** tab: 'active' | 'used' */
    getAllProducts:         (tab = 'active') => axiosClient.get('/collections', { params: { tab } }).then(unwrap),
    getProductById:        (id)        => axiosClient.get(`/collections/${id}`).then(unwrap),
    updateProduct:         (id, data)  => axiosClient.patch(`/collections/${id}`, data).then(unwrap),
    deleteProduct:         (id)        => axiosClient.delete(`/collections/${id}`).then(res => res),
    markAsUsedUp:          (id)        => axiosClient.post(`/collections/${id}/finish`).then(unwrap),

    // Expiry-alert flow
    getExpiredAlerts:      ()          => axiosClient.get('/collections/expired-alerts').then(unwrap),
    resolveExpiredAlert:   (id, action) => axiosClient.post(`/collections/${id}/resolve-expiry`, { action }).then(unwrap),
};

// ---------------------------------------------------------------------------
// Named exports kept for backward-compat with scan / AddProduct screens
// ---------------------------------------------------------------------------
export const listCollectionProducts    = (params) => axiosClient.get('/collections', { params }).then(res => res);
export const createCollectionProduct   = (data)   => axiosClient.post('/collections/add', data).then(unwrap);
export const updateCollectionProduct   = (id, d)  => axiosClient.patch(`/collections/${id}`, d).then(unwrap);
export const deleteCollectionProduct   = (id)     => axiosClient.delete(`/collections/${id}`).then(res => res);

export default collectionApi;
