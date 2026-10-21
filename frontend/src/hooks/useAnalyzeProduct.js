import { useState } from 'react';
import { collectionApi } from '../api/collectionApi';

const useAnalyzeProduct = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const analyze = async (payload) => {
        try {
            setLoading(true);
            setError(null);
            console.log("gửi request")
            const response = await collectionApi.analyzeProduct(payload);
            return response;

        } catch (err) {
            setError(err.message);
            throw new Error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        analyze,
        loading,
        error
    };
};

export default useAnalyzeProduct;
