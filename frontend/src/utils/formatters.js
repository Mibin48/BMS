// Format date: "15 Jan 2025"
export const formatDate = (date) => {
    if (!date) return '--'
    return new Date(date)
        .toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
}

// Format date + time: "15 Jan 2025, 10:30 am"
export const formatDateTime = (date) => {
    if (!date) return '--'
    return new Date(date)
        .toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
}

// Relative time: "2 days ago"
export const timeAgo = (date) => {
    if (!date) return '--'
    const seconds = Math.floor(
        (new Date() - new Date(date)) / 1000
    )
    const intervals = [
        [31536000, 'year'],
        [2592000, 'month'],
        [86400, 'day'],
        [3600, 'hour'],
        [60, 'minute']
    ]
    for (const [secs, unit] of intervals) {
        const count =
            Math.floor(seconds / secs)
        if (count >= 1)
            return `${count} ${unit}${count !== 1 ? 's' : ''
                } ago`
    }
    return 'just now'
}

// Format ML to readable: "450ml" or "1.2L"
export const formatML = (ml) => {
    if (!ml) return '0ml'
    if (ml >= 1000)
        return `${(ml / 1000).toFixed(1)}L`
    return `${ml}ml`
}

// Format number with commas: 1,234
export const formatNumber = (n) => {
    if (n === null || n === undefined)
        return '--'
    return n.toLocaleString('en-IN')
}
