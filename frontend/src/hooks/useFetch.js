import { useState, useEffect, useCallback, useRef } from 'react'

export const useFetch = (apiFunc, params = null, deps = []) => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Store the apiFunc in a ref to avoid infinite loops if an unstable 
    // function reference (like an anonymous arrow function) is provided.
    const apiFuncRef = useRef(apiFunc)
    apiFuncRef.current = apiFunc

    const fetch = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const response = params
                ? await apiFuncRef.current(params)
                : await apiFuncRef.current()
            setData(response.data?.data || response.data)
        } catch (err) {
            setError(
                err.response?.data?.message || 'Failed to load data'
            )
        } finally {
            setLoading(false)
        }
        // We only re-trigger the fetch when the explicit dependencies change.
        // We exclude apiFuncRef from the dependencies as we handle it internally via the ref.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps)

    useEffect(() => {
        fetch()
    }, [fetch])

    return { data, loading, error, refetch: fetch }
}
