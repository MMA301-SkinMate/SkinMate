import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createCollectionProduct, deleteCollectionProduct, listCollectionProducts, updateCollectionProduct } from '../api/collectionApi';

const CollectionContext = createContext(null);

export function CollectionProvider({ children }) {
  const [collection, setCollection] = useState([]);
  const [isCollectionLoading, setIsCollectionLoading] = useState(false);
  const [collectionError, setCollectionError] = useState(null);

  const refreshCollection = useCallback(async () => {
    setIsCollectionLoading(true);
    setCollectionError(null);
    try {
      const result = await listCollectionProducts();
      setCollection(result.products || []);
    } catch (error) {
      setCollectionError(error.message || 'Unable to load your skincare collection.');
    } finally {
      setIsCollectionLoading(false);
    }
  }, []);

  useEffect(() => { refreshCollection(); }, [refreshCollection]);

  const addProductToCollection = async payload => {
    const result = await createCollectionProduct(payload);
    setCollection(current => [result.product, ...current]);
    return result.product;
  };
  const updateProduct = async (id, payload) => {
    const result = await updateCollectionProduct(id, payload);
    setCollection(current => current.map(product => product.id === id ? result.product : product));
    return result.product;
  };
  const deleteProduct = async id => {
    await deleteCollectionProduct(id);
    setCollection(current => current.filter(product => product.id !== id));
  };
  const markAsEmpty = id => updateProduct(id, { status: 'finished' });
  const restoreProduct = id => updateProduct(id, { status: 'active', continueAfterExpiry: false });
  const markAsExpired = id => updateProduct(id, { status: 'expired', continueAfterExpiry: false });

  const value = useMemo(() => ({ collection, isCollectionLoading, collectionError, refreshCollection, addProductToCollection, updateProduct, deleteProduct, markAsEmpty, restoreProduct, markAsExpired }), [collection, isCollectionLoading, collectionError, refreshCollection]);
  return <CollectionContext.Provider value={value}>{children}</CollectionContext.Provider>;
}

export function useCollection() {
  const value = useContext(CollectionContext);
  if (!value) throw new Error('useCollection must be used inside CollectionProvider');
  return value;
}
