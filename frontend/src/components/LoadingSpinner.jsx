export const PageLoader = () => (
    <div className="min-h-screen bg-[#07070B] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
            <div className="relative">
                <div className="w-16 h-16 border-2 border-[#D90025]/20 rounded-full" />
                <div className="absolute inset-0 w-16 h-16 border-2 border-[#D90025] border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="font-mono text-[#D90025] text-xs tracking-[0.3em] animate-pulse">
                LOADING HEM∆...
            </p>
        </div>
    </div>
)

export const SectionLoader = () => (
    <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#D90025] border-t-transparent rounded-full animate-spin" />
            <p className="font-mono text-[#D90025]/60 text-xs tracking-widest">
                LOADING...
            </p>
        </div>
    </div>
)

export const InlineLoader = () => (
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
)
