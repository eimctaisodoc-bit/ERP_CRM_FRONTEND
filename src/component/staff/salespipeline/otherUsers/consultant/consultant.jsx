import React, { useState } from "react";
import {
    CalendarDays,
    ClipboardCheck,
    Clock3,
    Calendar1Icon,
    ArrowLeft,
    Layers
} from "lucide-react";
import FileUpload from "../fileUpload";
import { Schedule } from "./schedule";

// ─── Typography Constants ─────────────────────────────────────────────────────
const fontLight = { fontFamily: "'Roboto Slab', serif", fontWeight: 300 };
const fontBold = { fontFamily: "'Roboto Slab', serif", fontWeight: 700 };

// --- Main Component: Portal Dashboard ---
export const Consultant_sales = () => {
    // Sample Core Grid Datasets
    const cardsData = [
        {
            id: 1,
            badge: "Work Scheduling",
            title: "Quality Review Controls",
            description: "Inspect active client milestones and verify regulation metrics to ensure compliance protocols.",
            scheduleCount: "04",
            pendingTasks: "02",
            comp: <Schedule />
        },
        
    ];

    // Track the currently active card ID (null means grid view)
    const [activeWorkspaceId, setActiveWorkspaceId] = useState(null);
    const [openUpload, setOpenUpload] = useState(false);

    const handleCardClick = (id) => {
        setActiveWorkspaceId(id);
    };

    const handleCloseAll = () => {
        setActiveWorkspaceId(null);
    };

    // Find the active card data to display its title and component
    const activeCard = cardsData.find((c) => c.id === activeWorkspaceId);

    return (
        <div className="min-h-screen bg-white relative w-full pb-12" style={fontLight}>
          
            <main className="w-full mx-auto w-full  pt-8">

                {/* Grid View Mode */}
                {!activeWorkspaceId ? (
                    <div className="w-full animate-in fade-in duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <h3 style={fontBold} className="text-sm text-slate-500 uppercase tracking-widest">
                                Available Workspaces
                            </h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                            {cardsData.map((card) => (
                                <div
                                    key={card.id}
                                    className="group relative overflow-hidden cursor-pointer w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-amber-300 flex flex-col"
                                    onClick={() => handleCardClick(card.id)}
                                >
                                    {/* Abstract Background SVG */}
                                    <div className="absolute -right-8 -top-8 opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500 pointer-events-none">
                                        <svg width="150" height="150" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="100" cy="100" r="90" stroke="#F59E0B" strokeWidth="20" />
                                            <circle cx="100" cy="100" r="50" stroke="#EA580C" strokeWidth="15" />
                                        </svg>
                                    </div>

                                    {/* Top Section */}
                                    <div className="relative z-10 flex items-start justify-between mb-5">
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-600 text-[11px] uppercase tracking-wider font-bold">
                                            <ClipboardCheck size={12} className="text-blue-500" />
                                            {card.badge}
                                        </div>

                                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors shadow-sm">
                                            <CalendarDays size={18} />
                                        </div>
                                    </div>

                                    {/* Content Area */}
                                    <div className="relative z-10 flex-grow">
                                        <h2 style={fontBold} className="text-lg text-slate-900 mb-2 leading-tight group-hover:text-blue-700 transition-colors">
                                            {card.title}
                                        </h2>
                                        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                                            {card.description}
                                        </p>
                                    </div>

                                    {/* Bottom Stats */}
                                    <div className="relative z-10 grid grid-cols-2 gap-3 mt-auto">
                                        <div className="bg-transparent rounded-xl p-3 border border-slate-100 group-hover:border-slate-200 transition-colors">
                                            <div className="flex items-center gap-1.5 mb-1.5 text-slate-400">
                                                <CalendarDays size={12} />
                                                <span style={fontBold} className="text-[10px] uppercase tracking-widest">
                                                    Schedules
                                                </span>
                                            </div>
                                            <strong style={fontBold} className="text-xl text-slate-800">
                                                {card.scheduleCount}
                                            </strong>
                                        </div>

                                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 group-hover:border-slate-200 transition-colors">
                                            <div className="flex items-center gap-1.5 mb-1.5 text-slate-400">
                                                <Clock3 size={12} />
                                                <span style={fontBold} className="text-[10px] uppercase tracking-widest">
                                                    Pending
                                                </span>
                                            </div>
                                            <strong style={fontBold} className="text-xl text-slate-800">
                                                {card.pendingTasks}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Active Workspace Direct Render Mode */
                    <div className="w-full relative animate-in slide-in-from-bottom-4 duration-500">
                        
                        {/* Control Bar */}
                        <div className="flex items-center justify-between 
                        mb-4 bg-white p-3 rounded-md border w-fit border-slate-200 shadow-sm">
                            <button 
                                onClick={handleCloseAll}
                                style={fontBold}
                                className="flex items-center 
                                gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors 
                                cursor-pointer px-2"
                            >
                                <ArrowLeft size={16} />
                                Back to Grid
                            </button>
                           
                        </div>

                        {/* Directly Render the Attached Component (e.g., <Schedule />) */}
                        <div className="w-full relative">
                            {activeCard?.comp ? (
                                React.isValidElement(activeCard.comp) 
                                    ? activeCard.comp 
                                    : typeof activeCard.comp === "function" 
                                        ? React.createElement(activeCard.comp) 
                                        : null
                            ) : (
                                <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200 shadow-sm">
                                    Module component not attached.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};