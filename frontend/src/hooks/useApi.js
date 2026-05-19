import { useState, useCallback } from 'react'

export const useApi = (apiFunc, options = {}) => {
    const {
        onSuccess,
        onError,
        initialData = null
    } = options

    const [data, setData] = useState(initialData)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const execute = useCallback(async (...args) => {
        setLoading(true)
        setError(null)
        try {
            const response = await apiFunc(...args)
            const result = response.data?.data || response.data
            setData(result)
            onSuccess?.(result)
            return result
        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.message ||
                'Something went wrong'
            setError(message)
            onError?.(message)
            throw err
        } finally {
            setLoading(false)
        }
    }, [apiFunc])

    const reset = () => {
        setData(initialData)
        setError(null)
        setLoading(false)
    }

    return {
        data,
        loading,
        error,
        execute,
        reset,
        setData
    }
}
