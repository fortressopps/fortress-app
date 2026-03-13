import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useApi — generic data-fetching hook
 *
 * @param {Function} apiFn   — async function that returns data
 * @param {Array}    deps    — dependency array (triggers refetch)
 * @returns {{ data, loading, error, refetch }}
 *
 * Usage:
 *   const { data: goals, loading, error, refetch } = useApi(getGoals, []);
 */
export function useApi(apiFn, deps = []) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const cancelledRef = useRef(false);

    const execute = useCallback(async () => {
        cancelledRef.current = false;
        setLoading(true);
        setError(null);
        try {
            const result = await apiFn();
            if (!cancelledRef.current) {
                setData(result);
            }
        } catch (err) {
            if (!cancelledRef.current) {
                const { extractError } = await import('../api/apiError.js');
                setError(extractError(err));
            }
        } finally {
            if (!cancelledRef.current) {
                setLoading(false);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    useEffect(() => {
        execute();
        return () => {
            cancelledRef.current = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [execute]);

    return { data, loading, error, refetch: execute };
}
