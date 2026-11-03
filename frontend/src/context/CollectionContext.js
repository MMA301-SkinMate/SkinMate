/**
 * CollectionContext.js
 *
 * Thin context wrapper around useCollection hook.
 * Provides global state so ExpiredProductAlertModal can sit at root level.
 */

import React, { createContext, useContext } from 'react';
import useCollection from '../hooks/useCollection';

const CollectionContext = createContext(null);

export function CollectionProvider({ children }) {
    const value = useCollection();
    return (
        <CollectionContext.Provider value={value}>
            {children}
        </CollectionContext.Provider>
    );
}

export function useCollectionContext() {
    const ctx = useContext(CollectionContext);
    if (!ctx) throw new Error('useCollectionContext must be used inside <CollectionProvider>');
    return ctx;
}

// Backward-compat alias used by ExpiredProductAlertModal and existing screens
export { useCollectionContext as useCollection };
