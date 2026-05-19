import { AlertTriangle, RefreshCw } from 'lucide-react'

const ErrorCard = ({
    message = 'Something went wrong',
    onRetry,
    compact = false
}) => {
    if (compact) return (
        <div className="flex items-center gap-2 text-red-400 text-sm font-dm">
            <AlertTriangle className="w-4 h-4" />
            <span>{message}</span>
            {onRetry && (
                <button onClick={onRetry} className="text-[#D90025] underline ml-1">
                    Retry
                </button>
            )}
        </div>
    )

    return (
        <div className="border border-[#D90025]/30 bg-[#D90025]/5 rounded-2xl p-8 text-center">
            <AlertTriangle className="w-10 h-10 text-[#D90025] mx-auto mb-3" />
            <p className="font-syne font-bold text-white text-lg mb-1">
                Something went wrong
            </p>
            <p className="font-dm text-[#9B9BA4] text-sm mb-4">
                {message}
            </p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 mx-auto px-4 py-2 bg-[#D90025]/10 border border-[#D90025]/30 rounded-lg text-[#D90025] font-mono text-xs hover:bg-[#D90025]/20 transition-colors"
                >
                    <RefreshCw className="w-3 h-3" />
                    TRY AGAIN
                </button>
            )}
        </div>
    )
}

export default ErrorCard
