import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
    CheckCircle2,
    Clock,
    MapPin,
    ChevronLeft,
    ChevronRight,
    X,
    SlidersHorizontal,
    Upload,
    Calendar,
    ClipboardList,
    Flag,
    Building2,
    FileSpreadsheet,
    Loader2,
    Edit3,
    Trash2,
    Plus
} from "lucide-react";

// Assuming these utilities exist in your project
import { downloadHolidayExcel, readExcelFile } from "../../../data/data";
import { getMonthDays, getBsDisplayData } from "./calendar";

import JobAssignModal from "./scheduleform";

// ─── Typography & Theming Constants ───────────────────────────────────────────
const fontLight = { fontFamily: "'Roboto Slab', serif", fontWeight: 300 };
const fontBold = { fontFamily: "'Roboto Slab', serif", fontWeight: 700 };

const HOLIDAYS = [
    { date: "2083-01-01", name: "New Year" },
    { date: "2083-02-15", name: "Republic Day" },
];

const YEAR_OPTIONS = [2080, 2081, 2082, 2083, 2084];

// Multi-color Theme: Blue, Amber, Orange, White, Slate, Green (for tasks)
const ACTIVITY_COLORS = { 
    // Audit: "bg-emerald-600",     
    // Review: "bg-blue-600",       
   Today : "bg-amber-500",    
    // Document: "bg-orange-600",   
    // Other: "bg-slate-600"        
};
const ACTIVITY_LIGHT = { 
    Audit: "bg-emerald-50 text-emerald-900 border-emerald-200", 
    Review: "bg-blue-50 text-blue-900 border-blue-200", 
    Training: "bg-amber-50 text-amber-900 border-amber-300", 
    Document: "bg-orange-50 text-orange-900 border-orange-200", 
    Other: "bg-slate-50 text-slate-900 border-slate-200" 
};

const CALENDAR_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ─── Initial Data (Mock) ──────────────────────────────────────────────────────
const INITIAL_ACTIVITIES = [
    { id: 1, date: "2083-02-01", type: "Audit", title: "Syllabus Compliance Review", desc: "Comprehensive evaluation.", Fromtime: "10:00 AM", toTime: "11:00 AM", location: "Senate Board Room", client: "Kathmandu Valley College", status: "Completed", visitStatus: "Accept", Fromdate: "2083-02-01", toDate: "2083-02-03" },
    { id: 2, date: "2083-02-01", type: "Review", title: "Faculty Meeting", desc: "Monthly review.", Fromtime: "12:00 PM", toTime: "01:00 PM", location: "Main Hall", client: "Internal", status: "Upcoming", visitStatus: "Pending", Fromdate: "2083-02-01", toDate: "2083-02-01" },
    { id: 3, date: "2083-02-05", type: "Training", title: "Safety Drill", desc: "Campus safety protocol.", Fromtime: "02:00 PM", toTime: "03:00 PM", location: "Grounds", client: "Staff", status: "Upcoming", visitStatus: "Pending", Fromdate: "2083-02-05", toDate: "2083-02-05" },
];

// Helper to safely extract English Day (AD date)
const getEnglishDay = (cell) => {
    if (cell.adDate) {
        const d = new Date(cell.adDate);
        if (!isNaN(d.getTime())) return d.getDate();
    }
    return cell.adDay || cell.enDay || "";
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const Schedule = ({ onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [activities, setActivities] = useState([]);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [jobCardActivity, setJobCardActivity] = useState(null);
    const [activeLegendFilter, setLegendFilter] = useState(null);

    const fileInputRef = useRef(null);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const baseData = useMemo(() => getBsDisplayData(null, HOLIDAYS), []);
    const { months, today } = baseData;
    const [selectedYear, setSelectedYear] = useState(today.bsYear);
    const [selectedMonth, setSelectedMonth] = useState(today.bsMonthIndex);
    const [selectedDay, setSelectedDay] = useState(today.bsDate);

    // ── Drag Selection State ──
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState(null);
    const [dragEnd, setDragEnd] = useState(null);
    const [selectedRange, setSelectedRange] = useState({ fromDate: "", toDate: "" });

    const [isModalOpen, setIsModalOpen] = useState(false);

    // Simulated API Fetch
    useEffect(() => {
        const fetchActivities = async () => {
            setIsLoading(true);
            setTimeout(() => {
                setActivities(INITIAL_ACTIVITIES);
                setIsLoading(false);
            }, 400); 
        };
        fetchActivities();
    }, [selectedYear, selectedMonth]);

    const handleDeleteEvent = async (activityId) => {
        setActivities(prev => prev.filter(act => act.id !== activityId));
        setSelectedActivity(null);
    };

    const triggerFileUpload = () => fileInputRef.current?.click();
    const handleFileSelect = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
            setUploadedFile(file);
            const data = await readExcelFile(file);
            console.log("Excel Data Uploaded:", data);
        } catch (error) {
            console.error("Failed to read file:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const monthDays = useMemo(() => {
        const isCurrentYearMonth = selectedYear === today.bsYear && selectedMonth === today.bsMonthIndex;
        return getMonthDays(selectedYear, selectedMonth, isCurrentYearMonth ? today.bsDate : null, HOLIDAYS);
    }, [selectedYear, selectedMonth, today.bsYear, today.bsMonthIndex, today.bsDate]);

    const calendarGrid = useMemo(() => {
        if (!monthDays.length) return [];
        const offset = monthDays[0].dayIndex;
        const blanks = Array.from({ length: offset }, (_, i) => ({ _blank: true, key: `blank-${i}` }));
        return [...blanks, ...monthDays];
    }, [monthDays]);

    const dayActivityMap = useMemo(() => {
        const map = {};
        activities.forEach(a => {
            const startStr = a.Fromdate || a.date;
            const endStr = a.toDate || startStr;
            if (!startStr) return;
            const [sYear, sMonth, sDay] = startStr.split('-').map(Number);
            const [eYear, eMonth, eDay] = endStr.split('-').map(Number);
            
            if (sYear === eYear && sMonth === eMonth) {
                for (let d = sDay; d <= eDay; d++) {
                    const dateKey = `${sYear}-${String(sMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                    (map[dateKey] ??= []).push(a);
                }
            } else {
                (map[startStr] ??= []).push(a);
                if (startStr !== endStr) (map[endStr] ??= []).push(a);
            }
        });
        return map;
    }, [activities]);

    // ── Drag Event Handlers ──
    const handleMouseDown = (day, isHoliday) => {
        if (isHoliday) return;
        setIsDragging(true);
        setDragStart(day);
        setDragEnd(day);
    };

    const handleMouseEnter = (day, isHoliday) => {
        if (!isDragging) return;
        setDragEnd(day);
    };

    const handleMouseUp = (day, isHoliday) => {
        if (!isDragging) return;
        
        const finalEnd = day && !isHoliday ? day : (dragEnd || dragStart);
        const minDay = Math.min(dragStart, finalEnd);
        const maxDay = Math.max(dragStart, finalEnd);

        const formattedMonth = String(selectedMonth + 1).padStart(2, '0');
        const fromDateStr = `${selectedYear}-${formattedMonth}-${String(minDay).padStart(2, '0')}`;
        const toDateStr = `${selectedYear}-${formattedMonth}-${String(maxDay).padStart(2, '0')}`;

        setSelectedRange({ fromDate: fromDateStr, toDate: toDateStr });
        setSelectedDay(minDay);
        setIsDragging(false);
        setIsModalOpen(true);
    };

    const handlePrevMonth = useCallback(() => { setSelectedMonth(p => (p === 0 ? (setSelectedYear(y => y - 1), 11) : p - 1)); setSelectedDay(null); }, []);
    const handleNextMonth = useCallback(() => { setSelectedMonth(p => (p === 11 ? (setSelectedYear(y => y + 1), 0) : p + 1)); setSelectedDay(null); }, []);
    const handleJumpToToday = useCallback(() => { setSelectedYear(today.bsYear); setSelectedMonth(today.bsMonthIndex); setSelectedDay(today.bsDate); }, [today]);
    const handleMonthSelectChange = useCallback((e) => { setSelectedMonth(Number(e.target.value)); setSelectedDay(null); }, []);
    const handleYearSelectChange = useCallback((e) => { setSelectedYear(Number(e.target.value)); setSelectedDay(null); }, []);

    const currentMonthLabel = months.find(m => m.monthIndex === selectedMonth)?.label ?? "";

    return (
        <div 
            className="min-h-screen w-full overflow-x-hidden bg-slate-50 pb-8 text-slate-800 antialiased sm:pb-12 select-none" 
            style={fontLight}
            onMouseUp={() => {
                if (isDragging) handleMouseUp(dragEnd, false);
            }}
        >
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 4px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #64748b; }
            `}</style>

            <main className="mx-auto w-full max-w-360 px-2 py-3 sm:px-4 sm:py-5 lg:px-6 lg:py-6">
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:rounded-2xl">
                    
                    {/* Header Controls */}
                    <div className="sticky top-0 z-30 flex flex-col gap-4 border-b border-slate-100 bg-white px-3 py-4 sm:px-5 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
                        <h2 style={fontBold} className="flex items-center gap-2.5 text-xl text-slate-900 sm:gap-3 sm:text-2xl">
                            <Calendar className="h-5 w-5 shrink-0 text-blue-600 sm:h-6 sm:w-6" />
                            {currentMonthLabel} {selectedYear}
                        </h2>

                        <div className="flex w-full flex-wrap items-center gap-2 sm:gap-3 lg:w-auto lg:justify-end">
                            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                            
                            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 p-1">
                                <button type="button" onClick={downloadHolidayExcel} style={fontBold} className="cursor-pointer h-9 px-3 flex items-center gap-2 bg-white rounded-md text-xs text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-100 transition-all">
                                    <FileSpreadsheet className="w-4 h-4 text-blue-500" />
                                    <span className="hidden sm:inline-block">Template</span>
                                </button>
                                <button type="button" onClick={triggerFileUpload} disabled={isUploading} style={fontBold} className={`h-9 px-3 flex items-center gap-2 rounded-md text-xs text-white shadow-sm transition-all ${isUploading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'}`}>
                                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                    <span className="hidden sm:inline-block">{isUploading ? "Uploading..." : "Import Data"}</span>
                                </button>
                            </div>

                            <button onClick={handleJumpToToday} style={fontBold} className="h-9 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 shadow-sm transition-all hover:bg-slate-50 sm:px-4">Today</button>
                            
                            <div className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 shadow-sm">
                                <select value={selectedMonth} onChange={handleMonthSelectChange} style={fontBold} className="cursor-pointer bg-transparent text-sm text-slate-800 outline-none">
                                    {months.map(m => <option key={m.monthIndex} value={m.monthIndex}>{m.label}</option>)}
                                </select>
                                <span className="text-slate-300">|</span>
                                <select value={selectedYear} onChange={handleYearSelectChange} style={fontBold} className="cursor-pointer bg-transparent text-sm text-slate-800 outline-none">
                                    {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>

                            <div className="flex h-9 items-center rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
                                <button aria-label="Previous month" onClick={handlePrevMonth} className="h-full cursor-pointer rounded-md px-2 text-slate-500 transition-colors hover:bg-slate-100"><ChevronLeft className="w-4 h-4" /></button>
                                <button aria-label="Next month" onClick={handleNextMonth} className="h-full cursor-pointer rounded-md px-2 text-slate-500 transition-colors hover:bg-slate-100"><ChevronRight className="w-4 h-4" /></button>
                            </div>

                            {onClose && (
                                <button aria-label="Close calendar" onClick={onClose} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Calendar Grid Container */}
                    <div className="bg-white px-3 py-4 sm:p-5">
                        {isLoading ? (
                            <div className="flex min-h-125 items-center justify-center">
                                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                            </div>
                        ) : (
                            <>
                                {/* Days Header */}
                                <div className="mb-2 grid min-w-175 grid-cols-7 gap-2">
                                    {CALENDAR_DAYS.map(d => (
                                        <div key={d} style={fontBold} className={`text-xs py-2 text-center uppercase tracking-widest ${d === "Sat" ? "text-orange-500" : "text-slate-500"}`}>
                                            {d}
                                        </div>
                                    ))}
                                </div>

                                {/* Main Grid */}
                                <div className="custom-scrollbar overflow-x-auto pb-2">
                                    <div className="grid min-w-175 grid-cols-7 gap-2">
                                        {calendarGrid.map((cell) => {
                                            if (cell._blank) return <div key={cell.key} className="min-h-28 rounded-xl border border-transparent bg-slate-50 sm:min-h-30" aria-hidden="true" />;

                                            const formattedMonth = String(selectedMonth + 1).padStart(2, '0');
                                            const formattedDay = String(cell.date).padStart(2, '0');
                                            const fullDateStr = `${selectedYear}-${formattedMonth}-${formattedDay}`;

                                            const dayEvents = dayActivityMap[fullDateStr] || [];
                                            const isSelected = cell.date === selectedDay;
                                            const isToday = cell.isToday;
                                            
                                            const holidaysRaw = cell.customHolidayName ? (Array.isArray(cell.customHolidayName) ? cell.customHolidayName : [cell.customHolidayName]) : [];
                                            const isHoliday = holidaysRaw.length > 0 || cell.isHoliday;

                                            const isFiltered = !!activeLegendFilter && dayEvents.some(e => e.type === activeLegendFilter);
                                            const isDimmed = !!activeLegendFilter && !isFiltered;
                                            const englishDay = getEnglishDay(cell);

                                            // Determine if current day cell is within drag selection range
                                            const inDragRange = isDragging && dragStart !== null && dragEnd !== null &&
                                                cell.date >= Math.min(dragStart, dragEnd) &&
                                                cell.date <= Math.max(dragStart, dragEnd);

                                            return (
                                                <div
                                                    key={`${selectedYear}-${selectedMonth}-${cell.date}`}
                                                    tabIndex={0}
                                                    onDragStart={(e) => e.preventDefault()}
                                                    onMouseDown={() => handleMouseDown(cell.date, isHoliday)}
                                                    onMouseEnter={() => handleMouseEnter(cell.date, isHoliday)}
                                                    onMouseUp={() => handleMouseUp(cell.date, isHoliday)}
                                                    className={`
                                                        min-h-28 flex flex-col rounded-xl p-2 transition-all relative overflow-hidden group sm:min-h-30 sm:p-2.5
                                                        ${isHoliday ? "bg-red-50/20 cursor-not-allowed border-2 border-red-500" : "bg-white cursor-pointer border border-slate-200 hover:border-blue-400 hover:shadow-md"}
                                                        ${inDragRange && !isHoliday ? "bg-blue-100/70 border-2 border-blue-500 shadow-sm z-20" : ""}
                                                        ${isSelected && !isHoliday && !inDragRange ? "bg-blue-50/40 border-2 border-blue-500 shadow-sm z-10" : ""}
                                                        ${isToday && !isSelected && !isHoliday && !inDragRange ? "bg-amber-50/20 border-2 border-amber-300 shadow-sm z-10" : ""}
                                                        ${isDimmed ? "opacity-30" : "opacity-100"}
                                                    `}
                                                >
                                                    {/* Cell Header: Dates, Task Day Pulse & Assign Button */}
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            {/* Number Badge */}
                                                            <span 
                                                                style={fontBold} 
                                                                className={`text-base flex items-center justify-center transition-colors 
                                                                    ${(isSelected || inDragRange) && !isHoliday ? "w-7 h-7 rounded-full bg-blue-600 text-white shadow-sm" : 
                                                                      isToday && !isHoliday ? "w-7 h-7 rounded-full bg-amber-500 text-white shadow-md ring-2 ring-amber-200 ring-offset-1" : 
                                                                      isHoliday ? "text-red-700 w-7 h-7 flex items-center justify-center" : 
                                                                      "text-slate-800 w-7 h-7 flex items-center justify-center"}`}
                                                            >
                                                                {cell.date}
                                                            </span>
                                                            
                                                            {englishDay && (
                                                                <span style={fontLight} className="text-[11px] text-slate-400 mt-0.5">
                                                                    {englishDay}
                                                                </span>
                                                            )}
                                                            
                                                            {/* Pulsing Dot ONLY for Days with Tasks */}
                                                            {dayEvents.length > 0 && !isHoliday && (
                                                                <span className="relative flex h-2 w-2 ml-1 group-hover:hidden" title="Tasks Scheduled">
                                                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                                </span>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Hover Action: + Assign */}
                                                        {!isHoliday && (
                                                            <button 
                                                                onClick={(e) => { 
                                                                    e.stopPropagation(); 
                                                                    const formattedMonth = String(selectedMonth + 1).padStart(2, '0');
                                                                    const dateStr = `${selectedYear}-${formattedMonth}-${String(cell.date).padStart(2, '0')}`;
                                                                    setSelectedRange({ fromDate: dateStr, toDate: dateStr });
                                                                    setSelectedDay(cell.date); 
                                                                    setIsModalOpen(true); 
                                                                }}
                                                                style={fontBold}
                                                                className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:scale-95"
                                                            >
                                                                <Plus className="w-3 h-3" /> Assign
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Holiday Badge */}
                                                    {isHoliday && holidaysRaw.length > 0 && (
                                                        <div className="mb-2">
                                                            <span style={fontBold} className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-red-100 text-red-800 truncate max-w-full border border-red-200 shadow-sm">
                                                                {holidaysRaw[0]} {holidaysRaw.length > 1 && `+${holidaysRaw.length - 1}`}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Tasks Container */}
                                                    <div className="mt-auto flex max-h-17.5 flex-col gap-1.5 overflow-y-auto custom-scrollbar">
                                                        {dayEvents.map(ev => (
                                                            <div
                                                                key={ev.id}
                                                                onClick={(e) => { e.stopPropagation(); setSelectedActivity(ev); }}
                                                                className={`
                                                                    cursor-pointer text-[11px] px-2 py-1.5 rounded-md border 
                                                                    transition-transform hover:-translate-y-px hover:shadow-md
                                                                    ${ACTIVITY_LIGHT[ev.type] || "bg-emerald-50 text-emerald-900 border-emerald-200"}
                                                                `}
                                                            >
                                                                <div style={fontBold} className="truncate">{ev.title}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Filters Legend */}
                        <div className="mt-5 flex flex-col items-start justify-between gap-3 border-t border-slate-100 pt-4 sm:mt-6 sm:flex-row sm:items-center sm:gap-4 sm:pt-5">
                            <span style={fontBold} className="text-xs text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <SlidersHorizontal className="w-4 h-4" /> Filter Categories
                            </span>
                            <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
                                {Object.entries(ACTIVITY_COLORS).map(([name, cls]) => {
                                    const active = activeLegendFilter === name;
                                    return (
                                        <button
                                            key={name}
                                            onClick={() => setLegendFilter(active ? null : name)}
                                            style={fontBold}
                                            className={`
                                                cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border transition-all shadow-sm
                                                ${active ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"}
                                            `}
                                        >
                                            <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${cls}`} />{name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modals */}
            <JobAssignModal 
                isOpen={isModalOpen} 
                onClose={() => {
                    setIsModalOpen(false);
                    setDragStart(null);
                    setDragEnd(null);
                }} 
                fromDate={selectedRange.fromDate}
                toDate={selectedRange.toDate}
            />
            
            <TasksModal
                isOpen={!!selectedActivity}
                onClose={() => setSelectedActivity(null)}
                act={selectedActivity}
                onOpenJobCard={() => { setJobCardActivity(selectedActivity); setSelectedActivity(null); }}
                onDelete={handleDeleteEvent}
            />
        </div>
    );
};

// ─── Sub-Components ───────────────────────────────────────────────────────────

const TasksModal = ({ isOpen, onClose, act, onOpenJobCard, onDelete }) => {
    if (!isOpen || !act) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm w-full h-full flex items-center justify-center z-50 p-4 transition-opacity" style={fontLight}>
            <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col transform transition-all border border-slate-200">
                
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-200 bg-white flex justify-between items-start gap-4">
                    <div className="flex items-start gap-4">
                        <div className={`mt-1 w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border shadow-sm ${ACTIVITY_LIGHT[act.type] || 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
                            <Flag className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 style={fontBold} className="text-xl text-slate-900 leading-tight">{act.title}</h3>
                            <p className="text-sm text-slate-500 mt-1">{act.desc}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="cursor-pointer w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors flex items-center justify-center shrink-0">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body Details */}
                <div className="p-6">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm grid grid-cols-2 gap-4">
                            <div>
                                <span style={fontBold} className="text-[11px] text-slate-400 uppercase tracking-widest block mb-1.5">Type</span>
                                <div className="flex items-center gap-2">
                                    <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${ACTIVITY_COLORS[act.type] || 'bg-emerald-500'}`}></span>
                                    <span style={fontBold} className="text-sm text-slate-800">{act.type}</span>
                                </div>
                            </div>
                            <div>
                                <span style={fontBold} className="text-[11px] text-slate-400 uppercase tracking-widest block mb-1.5">Status</span>
                                <span style={fontBold} className="text-sm text-slate-800 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {act.status}
                                </span>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-5">
                            <div className="flex items-start gap-3">
                                <Building2 className="w-5 h-5 text-blue-500 shrink-0" />
                                <div>
                                    <span style={fontBold} className="text-[11px] text-slate-400 uppercase tracking-widest block mb-1">Institution / Client</span>
                                    <span style={fontBold} className="text-sm text-slate-900">{act.client || "N/A"}</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-amber-500 shrink-0" />
                                <div>
                                    <span style={fontBold} className="text-[11px] text-slate-400 uppercase tracking-widest block mb-1">Location</span>
                                    <span style={fontBold} className="text-sm text-slate-900">{act.location || "N/A"}</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 pt-4 border-t border-slate-100">
                                <Clock className="w-5 h-5 text-orange-500 shrink-0" />
                                <div>
                                    <span style={fontBold} className="text-[11px] text-slate-400 uppercase tracking-widest block mb-1">Schedule Timeline</span>
                                    <span style={fontBold} className="text-sm text-slate-900">
                                        {act.Fromdate || act.date} ({act.Fromtime}) 
                                        <span className="text-slate-300 mx-2">→</span> 
                                        {act.toDate} ({act.toTime})
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Footer */}
                <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button onClick={() => onDelete(act.id)} className="cursor-pointer p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200" title="Delete Task">
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="cursor-pointer p-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200" title="Edit Task">
                            <Edit3 className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <button type="button" onClick={onOpenJobCard} style={fontBold} className="cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm text-white shadow-md hover:bg-blue-700 transition-all active:scale-95">
                        <ClipboardList className="w-4 h-4" />
                        {act?.jobCard ? "Edit Job Card" : "Assign Job"}
                    </button>
                </div>
            </div>
        </div>
    );
};