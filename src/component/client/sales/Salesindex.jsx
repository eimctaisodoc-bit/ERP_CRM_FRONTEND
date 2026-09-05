import { useState, useRef, useEffect } from "react";
import React from "react";
import {
    Pin, PinOff, CalendarDays,
    ClipboardCheck,
    Clock3,
    ArrowUpRight, Square, X, Copy,
    Calendar1Icon
} from "lucide-react";
import { Schedule } from "./Stage/schedule";
import FileUpload from "./Stage/fileUpload";

// --- Sub-Component: Independent Window Panel ---
const WorkspaceWindow = ({ card, onClose }) => {
    const [width, setWidth] = useState(false);
    const [isPinned, setIsPinned] = useState(true); // Windows open as pinned by default
    const [position, setPosition] = useState({ x: 24, y: 140 + card.id * 15 });
    const [isDragging, setIsDragging] = useState(false);

    const dragRef = useRef({ startX: 0, startY: 0, posX: 0, posY: 0 });

    const handleMouseDown = (e) => {
        // If window is pinned or clicking an action button, abort drag calculations
        if (isPinned || e.target.closest("button")) return;

        setIsDragging(true);
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            posX: position.x,
            posY: position.y,
        };
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            const dx = e.clientX - dragRef.current.startX;
            const dy = e.clientY - dragRef.current.startY;

            setPosition({
                x: dragRef.current.posX + dx,
                y: dragRef.current.posY + dy,
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
        }

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging]);

    // Dynamic window styles based on pinned vs floating states
    const windowStyles = isPinned
        ? { position: "relative", width: "100%" }
        : {
            position: "absolute",
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: width ? "450px" : "100%",
            maxWidth: width ? "450px" : "100%",
            zIndex: 50,
        };
    const dynamicCard = card.comp ?? null;
    console.log("🚀 ~ file: Salesindex.jsx:172 ~ WorkspaceWindow ~ dynamicCard:", dynamicCard)
    return (
        <div
            style={windowStyles}
            className={`font-['Roboto_Slab',serif] bg-white 
                rounded-md  border border-amber-200 
                overflow-hidden mb-3 transition-[width] duration-200 
                ease-in-out ${isDragging ? "select-none" : "select-auto"
                }`}
        >
            <div
                onMouseDown={handleMouseDown}
                className={`flex items-center justify-between border-b
                     border-amber-200 bg-amber-50 px-4 py-3 
                     ${isPinned ? "cursor-default" : isDragging ? "cursor-grabbing" : "cursor-grab"
                    }`}
            >
                {/* Left Windows Metadata */}
                <div className="flex items-center gap-3 pointer-events-none">
                    <div className="flex gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                        <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                        <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-sm font-semibold text-amber-950">
                            {card.title} Panel {isPinned && <span className="text-xs font-normal text-amber-600 ml-1.5">(Pinned)</span>}
                        </h2>
                        <p className="text-[11px] text-amber-700">
                            ID: {card.id} • Management Workspace
                        </p>
                    </div>
                </div>

                {/* System Windows Controls */}
                <div className="flex items-center gap-1.5">
                    {/* Toggle Pin/Unpin Functional Button */}
                    <button
                        className={`flex cursor-pointer h-8 w-8 items-center justify-center rounded-md border transition ${isPinned
                            ? "border-amber-300 bg-amber-200/50 text-amber-900"
                            : "border-transparent text-slate-500 hover:border-amber-200 hover:bg-white hover:text-slate-700"
                            }`}
                        onClick={() => setIsPinned(!isPinned)}
                        title={isPinned ? "Unpin Window to Drag" : "Pin Window to Layout"}
                    >
                        {isPinned ? <Pin size={15} strokeWidth={2.2} /> : <PinOff size={15} strokeWidth={2.2} />}
                    </button>

                    {/* Sizing Toggle (Only interactive when unpinned/floating) */}

                    <button
                        disabled={isPinned}
                        className={`flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-slate-500 transition ${isPinned
                            ? "opacity-30 cursor-not-allowed"
                            : "cursor-pointer hover:border-amber-200 hover:bg-white hover:text-slate-700"
                            }`}
                        onClick={() => setWidth(!width)}
                        title="Toggle Floating Window Compact Width"
                    >
                        {width ? <Square size={14} strokeWidth={2.2} /> : <Copy size={14} strokeWidth={2.2} />}
                    </button>

                    {/* Close trigger returns card back to grid view */}
                    <button
                        className="flex cursor-pointer h-8 w-8 items-center justify-center rounded-md border border-transparent text-red-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        onClick={onClose}
                    >
                        <X size={15} strokeWidth={2.2} />
                    </button>
                </div>
            </div>

            {/* Workspace Dynamic Content Body */}
            <div className="space-y-4 p-3">
                <div className=" bg-white ">
                    {dynamicCard && (
                        <div className="">
                            {React.isValidElement(dynamicCard)
                                ? dynamicCard
                                : typeof dynamicCard === "function"
                                    ? React.createElement(dynamicCard)
                                    : null}
                        </div>
                    )}
                </div>


            </div>
        </div>
    );
};

// --- Main Component: Portal Dashboard ---
export const Client_sales = () => {
    // Sample Core Grid Datasets
    const cardsData = [
        {
            id: 1,
            badge: "Finance",
            title: "Plan & Track Activities",
            description: "Organize audits, training sessions and follow-up activities using a clean scheduling workflow.",
            scheduleCount: "12",
            pendingTasks: "08",
        },
        {
            id: 2,
            badge: "Scheduling",
            title: "Quality Review Controls",
            description: "Inspect active client milestones and verify regulation metrics to ensure compliance protocols.",
            scheduleCount: "04",
            pendingTasks: "02",
            comp: <Schedule />
        },
        {
            id: 3,
            badge: "Analytics",
            title: "Client Evaluation Metrics",
            description: "Review system operational data, report feedback, and track key milestone performance metrics.",
            scheduleCount: "09",
            pendingTasks: "15",
        },
    ];

    const [openWindowIds, setOpenWindowIds] = useState([]);
    const [openUpload, setOpenUpload] = useState(false);
    // Check if ANY window is open right now
    const isAnyWindowOpen = openWindowIds.length > 0;

    const handleCardClick = (id) => {
        if (!openWindowIds.includes(id)) {
            setOpenWindowIds([...openWindowIds, id]);
        }
    };

    const handleCloseWindow = (id) => {
        setOpenWindowIds(openWindowIds.filter((windowId) => windowId !== id));
    };

    return (
        <div className="min-h-screen bg-white font-['Roboto_Slab',serif] relative pb-12">
            {/* Header */}
            <header className="sticky top-0 z-40 w-full border-b border-amber-200 bg-white/95 backdrop-blur-sm">
                <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <div className="min-w-0 flex-1">
                        <h1 className="truncate bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 bg-clip-text text-xl font-bold tracking-tight text-transparent sm:text-2xl lg:text-3xl">
                            ISO 21001 Portal
                        </h1>
                        <p className="mt-1 max-w-2xl text-xs font-normal leading-relaxed text-slate-500 sm:text-sm">
                            Manage your jobs, activities and client engagement
                        </p>
                    </div>
                    <div >
                        <span className="inline-flex items-center gap-1 
                        rounded-md bg-amber-50 p-3 cursor-pointer text-xs font-medium text-amber-700" onClick={() => setOpenUpload(true)}>
                            <Calendar1Icon size={18} className="text-amber-600" />
                        </span>

                    </div>
                </div>
            </header>
            <FileUpload
                isOpen={openUpload}
                onClose={() => setOpenUpload(false)}
            />
            {/* Main Layout Grid Container */}
            <main className="max-w-7xl mx-auto ">

                {/* Grid View Mode: Only visible when ALL windows are closed */}
                {!isAnyWindowOpen && (
                    <div className="w-full">
                        <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">Available Workspaces</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                            {cardsData.map((card) => (
                                <div
                                    key={card.id}
                                    className="group relative overflow-hidden cursor-pointer w-full bg-white border border-amber-200 rounded-md p-6 transition-all duration-300 hover:border-amber-400 hover:bg-amber-50/30"
                                    onClick={() => handleCardClick(card.id)}
                                >
                                    {/* SVG Background */}
                                    <div className="absolute -right-10 -top-10 opacity-[0.06] pointer-events-none">
                                        <svg
                                            width="180"
                                            height="180"
                                            viewBox="0 0 200 200"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <circle cx="100" cy="100" r="90" stroke="#F59E0B" strokeWidth="18" />
                                            <circle cx="100" cy="100" r="55" stroke="#FBBF24" strokeWidth="10" />
                                        </svg>
                                    </div>

                                    {/* Top Section */}
                                    <div className="relative z-10 flex items-start justify-between mb-5">
                                        <div>
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
                                                <ClipboardCheck size={13} />
                                                {card.badge}
                                            </div>
                                        </div>

                                        <div className="w-10 h-10 rounded-md border border-amber-200 bg-white flex items-center justify-center text-amber-600 group-hover:bg-amber-100 transition-all">
                                            <CalendarDays size={18} />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="relative z-10">
                                        <h2 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">
                                            {card.title}
                                        </h2>

                                        <p className="text-xs leading-5 text-slate-500 mb-5">
                                            {card.description}
                                        </p>

                                        {/* Stats */}
                                        <div className="grid grid-cols-2 gap-3 mb-5">
                                            <div className="bg-slate-50 border border-slate-200 rounded-md p-3">
                                                <div className="flex items-center gap-2 mb-1 text-slate-500">
                                                    <CalendarDays size={13} />
                                                    <span className="text-[10px] uppercase tracking-wide">
                                                        Schedules
                                                    </span>
                                                </div>

                                                <strong className="text-lg font-bold text-slate-800">
                                                    {card.scheduleCount}
                                                </strong>
                                            </div>

                                            <div className="bg-slate-50 border border-slate-200 rounded-md p-3">
                                                <div className="flex items-center gap-2 mb-1 text-slate-500">
                                                    <Clock3 size={13} />
                                                    <span className="text-[10px] uppercase tracking-wide">
                                                        Pending
                                                    </span>
                                                </div>

                                                <strong className="text-lg font-bold text-slate-800">
                                                    {card.pendingTasks}
                                                </strong>
                                            </div>
                                        </div>



                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {/* Workspace View Mode: Visible only when windows are open, occupies full container width */}

                {isAnyWindowOpen && (
                    <div className="w-full  rounded-md p-2  relative">



                        {/* Render full-width active window layers */}
                        {cardsData.map((card) => {
                            if (!openWindowIds.includes(card.id)) return null;
                            return (
                                <WorkspaceWindow
                                    key={card.id}
                                    card={card}
                                    onClose={() => handleCloseWindow(card.id)}
                                />
                            );
                        })}
                    </div>
                )}

            </main>
        </div>
    );
};
