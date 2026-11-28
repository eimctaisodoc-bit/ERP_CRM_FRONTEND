import React from 'react';


const Skeleton = ({ className = '', style }) => {
    return (
        <div
            aria-hidden="true"
            className={`relative isolate overflow-hidden rounded-md bg-slate-200/80 ${className}`}
            style={style}
        >
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_ease-in-out_infinite] motion-reduce:animate-none bg-gradient-to-r from-transparent via-white/80 to-transparent" />
        </div>
    );
};

const SkeletonPage = () => {
    return (
        <div className="flex h-screen w-full bg-[#fcfdfe] text-slate-900 antialiased overflow-hidden" aria-busy="true" aria-label="Loading application">
            {/* Sidebar Navigation */}
            <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100 p-6 shrink-0">
                <div className="flex items-center gap-3 mb-10">
                    <Skeleton className="w-9 h-9 rounded-xl" />
                    <Skeleton className="w-28 h-5 rounded-lg" />
                </div>

                <div className="flex-1 space-y-8">
                    <div className="space-y-4">
                        <Skeleton className="w-16 h-2.5 rounded-xl opacity-40 mb-2" />
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="w-full h-10 rounded-xl" />
                        ))}
                    </div>

                    <div className="space-y-4">
                        <Skeleton className="w-20 h-2.5 rounded-xl opacity-40 mb-2" />
                        {[...Array(2)].map((_, i) => (
                            <Skeleton key={i} className="w-full h-10 rounded-xl" />
                        ))}
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="w-24 h-3 rounded-full" />
                        <Skeleton className="w-16 h-2 rounded-full opacity-50" />
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-6 md:p-10">

                {/* Header */}
                <header className="flex justify-between items-center mb-10">
                    <div className="space-y-3">
                        <Skeleton className="w-64 h-9 rounded-xl" />
                        <Skeleton className="w-40 h-3 rounded-full opacity-40" />
                    </div>
                    <div className="flex items-center gap-4">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <Skeleton className="w-36 h-10 rounded-xl" />
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="p-6 bg-white border border-slate-100 rounded-3xl space-y-5 shadow-sm shadow-slate-200/50">
                            <Skeleton className="w-10 h-10 rounded-xl" />
                            <div className="space-y-2">
                                <Skeleton className="w-16 h-2.5 rounded-full opacity-40" />
                                <Skeleton className="w-28 h-8 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Chart Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex justify-between items-end h-80 px-4">
                            {[20, 45, 32, 68, 51, 35, 75, 43, 61, 28, 54, 39].map((height, i) => (
                                <Skeleton
                                    key={i}
                                    className="w-full mx-1 rounded-t-lg"
                                    style={{ height: `${height}%` }}
                                />
                            ))}
                        </div>
                        <div className="flex justify-between px-2">
                            {[...Array(6)].map((_, i) => <Skeleton key={i} className="w-12 h-2 rounded-full opacity-30" />)}
                        </div>
                    </div>
                    <Skeleton className="h-[22rem] rounded-[2.5rem]" />
                </div>

                {/* Table Section */}
                <section className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm shadow-slate-200/50">
                    <div className="px-8 py-7 border-b border-slate-50 flex justify-between items-center">
                        <Skeleton className="w-48 h-6 rounded-lg" />
                        <div className="flex gap-2">
                            <Skeleton className="w-8 h-8 rounded-lg" />
                            <Skeleton className="w-8 h-8 rounded-lg" />
                        </div>
                    </div>

                    <div className="px-8">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className={`flex items-center justify-between py-6 ${i !== 4 ? 'border-b border-slate-100/50' : ''}`}>
                                <div className="flex items-center gap-5">
                                    <Skeleton className="w-11 h-11 rounded-xl" />
                                    <div className="space-y-2.5">
                                        <Skeleton className="w-44 h-3.5 rounded-full" />
                                        <Skeleton className="w-28 h-2.5 rounded-full opacity-40" />
                                    </div>
                                </div>
                                <div className="hidden md:flex gap-12">
                                    <Skeleton className="w-24 h-3 rounded-full opacity-60" />
                                    <Skeleton className="w-20 h-3 rounded-full opacity-60" />
                                </div>
                                <Skeleton className="w-16 h-7 rounded-full" />
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

const ScheduleSkeleton = () => (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6" aria-busy="true" aria-label="Loading schedule">
        <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-56 rounded-lg" />
                    <Skeleton className="h-4 w-72 max-w-full rounded-full" />
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-10 w-28 rounded-lg" />
                    <Skeleton className="h-10 w-32 rounded-lg" />
                </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                    <Skeleton className="h-6 w-40 rounded-lg" />
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-9 rounded-lg" />
                        <Skeleton className="h-9 w-9 rounded-lg" />
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 7 }, (_, index) => (
                        <Skeleton key={`day-${index}`} className="h-5 rounded-full" />
                    ))}
                    {Array.from({ length: 35 }, (_, index) => (
                        <Skeleton key={`date-${index}`} className="h-16 rounded-lg sm:h-24" />
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export { Skeleton, ScheduleSkeleton };
export default SkeletonPage;