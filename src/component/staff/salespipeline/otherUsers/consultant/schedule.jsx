import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
    CheckCircle2,
    Clock,
    MapPin,
    Users,
    ChevronLeft,
    ChevronRight,
    FileText,
    Check,
    X,
    AlertCircle,
    BookOpen,
    Layers,
    SlidersHorizontal,
    RefreshCw,
    GraduationCap,
    Upload,
    Calendar,
    Ellipsis,
    Info,
    ClipboardList,
    Flag,
    Building2,
    UploadCloud,
} from "lucide-react";

// Assuming these utilities exist in your project
import { getBsDisplayData, getMonthDays } from "../../calendar";

// ─── Typography & Theming Constants ───────────────────────────────────────────
const fontLight = { fontFamily: "'Roboto Slab', serif", fontWeight: 300 };
const fontBold = { fontFamily: "'Roboto Slab', serif", fontWeight: 700 };

const HOLIDAYS = [
    { date: "2083-01-01", name: "New Year" },
    { date: "2083-02-15", name: "Republic Day" },
];

const YEAR_OPTIONS = [2080, 2081, 2082, 2083, 2084];

// Multi-color Theme: Blue, Amber, Orange, Slate, Green (for tasks)
const ACTIVITY_COLORS = {
    Audit: "bg-emerald-500",
    Review: "bg-blue-500",
    Training: "bg-amber-500",
    Document: "bg-orange-500",
    Other: "bg-slate-500",
};
const ACTIVITY_BORDER = {
    Audit: "border-emerald-400",
    Review: "border-blue-400",
    Training: "border-amber-400",
    Document: "border-orange-400",
    Other: "border-slate-400",
};
const ACTIVITY_LIGHT = {
    Audit: "bg-emerald-50 text-emerald-900 border-emerald-200",
    Review: "bg-blue-50 text-blue-900 border-blue-200",
    Training: "bg-amber-50 text-amber-900 border-amber-200",
    Document: "bg-orange-50 text-orange-900 border-orange-200",
    Other: "bg-slate-50 text-slate-900 border-slate-200",
};

const STATUS_OPTIONS = ["All", "Completed", "In Progress", "Upcoming"];
const STATUS_STYLE = {
    Accept: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Postpond: "bg-amber-100 text-amber-800 border-amber-200",
    Rejected: "bg-red-100 text-red-800 border-red-200",
    Pending: "bg-slate-100 text-slate-700 border-slate-200",
};

const CALENDAR_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ─── Initial Data (15 Mock Activities) ────────────────────────────────────────
const INITIAL_ACTIVITIES = [
    { id: 1, date: "2083-02-01", type: "Audit", title: "Syllabus Compliance Review", desc: "Comprehensive evaluation of syllabus guidelines.", Fromtime: "10:00 AM", toTime: "11:00 AM", location: "Senate Board Room", client: "Kathmandu Valley College", status: "Completed", visitStatus: "Accept" },
    { id: 2, date: "2083-02-03", type: "Review", title: "Annual Curriculum Review", desc: "Reviewing changes in the IT faculty modules.", Fromtime: "11:00 AM", toTime: "01:00 PM", location: "Block A", client: "Tribhuvan University", status: "In Progress", visitStatus: "Accept" },
    { id: 3, date: "2083-02-05", type: "Training", title: "ISO Standards Briefing", desc: "Staff training module for updated ISO guidelines.", Fromtime: "02:00 PM", toTime: "04:00 PM", location: "Main Hall", client: "Internal Staff", status: "Upcoming", visitStatus: "Pending" },
    { id: 4, date: "2083-02-07", type: "Document", title: "Policy Drafting", desc: "Drafting new internal assessment policies.", Fromtime: "09:00 AM", toTime: "04:00 PM", location: "HQ Office", client: "Ministry of Education", status: "Upcoming", visitStatus: "Pending" },
    { id: 5, date: "2083-02-08", type: "Other", title: "Campus Infrastructure Tour", desc: "Evaluating infrastructure capabilities.", Fromtime: "10:00 AM", toTime: "12:00 PM", location: "Pokhara Branch", client: "Pokhara University", status: "Completed", visitStatus: "Accept" },
    { id: 6, date: "2083-02-10", type: "Audit", title: "Financial Audit Q1", desc: "Quarterly financial compliance review.", Fromtime: "09:00 AM", toTime: "03:00 PM", location: "Finance Dept", client: "ABC Corp", status: "Upcoming", visitStatus: "Pending" },
    { id: 7, date: "2083-02-12", type: "Training", title: "Fire Safety Drill", desc: "Mandatory campus safety training.", Fromtime: "01:00 PM", toTime: "02:30 PM", location: "Courtyard", client: "Internal Staff", status: "Upcoming", visitStatus: "Pending" },
    { id: 8, date: "2083-02-14", type: "Review", title: "Peer Assessment Panel", desc: "Faculty peer review session.", Fromtime: "10:00 AM", toTime: "12:00 PM", location: "Room 102", client: "KVC Faculty", status: "In Progress", visitStatus: "Postpond" },
    { id: 9, date: "2083-02-17", type: "Document", title: "Accreditation Filing", desc: "UGC accreditation paperwork finalization.", Fromtime: "10:00 AM", toTime: "05:00 PM", location: "UGC Office", client: "University Grants Commission", status: "Upcoming", visitStatus: "Pending" },
    { id: 10, date: "2083-02-18", type: "Other", title: "Vendor Alignment Meeting", desc: "Discussing new IT procurement processes.", Fromtime: "11:00 AM", toTime: "12:00 PM", location: "Meeting Room B", client: "TechSupplies Inc.", status: "Upcoming", visitStatus: "Accept" },
    { id: 11, date: "2083-02-20", type: "Audit", title: "Library Resources Audit", desc: "Checking book inventory and digital logs.", Fromtime: "08:00 AM", toTime: "12:00 PM", location: "Central Library", client: "Tribhuvan University", status: "Completed", visitStatus: "Accept" },
    { id: 12, date: "2083-02-22", type: "Training", title: "New ERP System Onboarding", desc: "Teaching staff how to use the new management portal.", Fromtime: "02:00 PM", toTime: "05:00 PM", location: "Computer Lab 1", client: "Internal Staff", status: "Upcoming", visitStatus: "Pending" },
    { id: 13, date: "2083-02-25", type: "Review", title: "Student Feedback Analysis", desc: "Reviewing end-of-semester feedback logs.", Fromtime: "03:00 PM", toTime: "04:30 PM", location: "Faculty Lounge", client: "Internal Staff", status: "Completed", visitStatus: "Accept" },
    { id: 14, date: "2083-02-27", type: "Document", title: "Annual Report Generation", desc: "Compiling statistical data for the yearly public report.", Fromtime: "09:00 AM", toTime: "05:00 PM", location: "Admin Block", client: "Board of Directors", status: "In Progress", visitStatus: "Accept" },
    { id: 15, date: "2083-02-28", type: "Other", title: "Alumni Association Meetup", desc: "Networking and fundraising discussions.", Fromtime: "05:00 PM", toTime: "08:00 PM", location: "Grand Hotel", client: "Alumni Network", status: "Upcoming", visitStatus: "Pending" }
];

const INITIAL_FOLLOW_UPS = [
    { id: "f1", initials: "RM", color: "bg-amber-100 text-amber-800 border-amber-200", officer: "Raj Mani Sharma", activity: "ISO 21001 Curricular Audit", date: "Jestha 9, 2081", status: "Accept" },
    { id: "f2", initials: "SP", color: "bg-emerald-100 text-emerald-800 border-emerald-200", officer: "Sunita Poudel", activity: "Internal Assessment", date: "Jestha 9, 2081", status: "Pending" },
    { id: "f3", initials: "AK", color: "bg-blue-100 text-blue-800 border-blue-200", officer: "Arun Kumar Yadav", activity: "Advisory Board Review", date: "Jestha 14, 2081", status: "Postpond" },
    { id: "f4", initials: "NK", color: "bg-orange-100 text-orange-800 border-orange-200", officer: "Neha Kawasaki", activity: "Action Documentation", date: "Jestha 15, 2083", status: "Rejected" },
];

const ATTEND_BUTTONS = [
    { label: "Accept", icon: <Check className="w-3 h-3" />, active: "bg-emerald-600 text-white border-emerald-700" },
    { label: "Postpond", icon: <Clock className="w-3 h-3" />, active: "bg-amber-600 text-white border-amber-700" },
    { label: "Rejected", icon: <X className="w-3 h-3" />, active: "bg-red-600 text-white border-red-700" }
];

// ─── Main Component ───────────────────────────────────────────────────────────

export const Schedule = () => {
    // UI Modal/Drawer States
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [jobCardActivity, setJobCardActivity] = useState(null);
    const [dprActivity, setDprActivity] = useState(null);
    const [drawerDay, setDrawerDay] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Calendar & Data States
    const baseData = useMemo(() => getBsDisplayData(null, HOLIDAYS), []);
    const { months, today } = baseData;
    const [selectedYear, setSelectedYear] = useState(today.bsYear);
    const [selectedMonth, setSelectedMonth] = useState(today.bsMonthIndex);
    const [selectedDay, setSelectedDay] = useState(today.bsDate);

    const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
    const [followUps, setFollowUps] = useState([]);
    const [isLoadingFollowUps, setIsLoadingFollowUps] = useState(true);

    // Filter States
    const [activeLegendFilter, setLegendFilter] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    // File Upload States
    const [files, setFiles] = useState([]);
    const [dragActive, setDragActive] = useState(false);

    // Fetch Fake Data
    useEffect(() => {
        const fetchFollowUps = async () => {
            setIsLoadingFollowUps(true);
            setTimeout(() => {
                setFollowUps(INITIAL_FOLLOW_UPS);
                setIsLoadingFollowUps(false);
            }, 600);
        };
        fetchFollowUps();
    }, []);

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isDrawerOpen) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "unset";
        return () => { document.body.style.overflow = "unset"; };
    }, [isDrawerOpen]);

    // Calendar Generation
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

    // Activity Mapping
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

    // Drawer Filtering
    const filteredActivities = useMemo(() => {
        if (!drawerDay) return [];
        const formattedMonth = String(selectedMonth + 1).padStart(2, '0');
        const formattedDay = String(drawerDay).padStart(2, '0');
        const fullDrawerDateStr = `${selectedYear}-${formattedMonth}-${formattedDay}`;

        const q = searchQuery.toLowerCase();
        return (dayActivityMap[fullDrawerDateStr] || []).filter(a => {
            if (statusFilter !== "All" && a.status !== statusFilter) return false;
            if (activeLegendFilter && a.type !== activeLegendFilter) return false;
            if (q && ![a.title, a.client, a.location].some(s => s.toLowerCase().includes(q))) return false;
            return true;
        });
    }, [dayActivityMap, drawerDay, selectedYear, selectedMonth, searchQuery, statusFilter, activeLegendFilter]);

    // Navigation Handlers
    const handlePrevMonth = useCallback(() => { setSelectedMonth(p => (p === 0 ? (setSelectedYear(y => y - 1), 11) : p - 1)); setSelectedDay(null); }, []);
    const handleNextMonth = useCallback(() => { setSelectedMonth(p => (p === 11 ? (setSelectedYear(y => y + 1), 0) : p + 1)); setSelectedDay(null); }, []);
    const handleJumpToToday = useCallback(() => { setSelectedYear(today.bsYear); setSelectedMonth(today.bsMonthIndex); setSelectedDay(today.bsDate); setDrawerDay(null); setIsDrawerOpen(false); }, [today]);
    const handleMonthSelectChange = useCallback((e) => { setSelectedMonth(Number(e.target.value)); setSelectedDay(null); }, []);
    const handleYearSelectChange = useCallback((e) => { setSelectedYear(Number(e.target.value)); setSelectedDay(null); }, []);

    // Interaction Handlers
    const handleSelectDay = useCallback((date) => {
        if (!date) return;
        setSelectedDay(date);
        setDrawerDay(date);
        setIsDrawerOpen(true);
    }, []);
    const handleUpdateVisit = useCallback((id, status) => setActivities(p => p.map(a => a.id === id ? { ...a, visitStatus: status } : a)), []);
    const handleLegendFilter = useCallback((name) => setLegendFilter(p => p === name ? null : name), []);

    // File Upload Handlers
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndAddFiles(e.dataTransfer.files);
        }
    };

    const handleFileChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            validateAndAddFiles(e.target.files);
        }
    };

    const validateAndAddFiles = (newFiles) => {
        const maxSize = 25 * 1024 * 1024; // 25 MB
        const validFiles = Array.from(newFiles).filter(file => {
            const isValidSize = file.size <= maxSize;
            const isValidType = file.type.startsWith('image/') ||
                file.name.match(/\.(doc|docx|xls|xlsx|ppt|pptx)$/i);
            return isValidSize && isValidType;
        });

        setFiles(prev => [...prev, ...validFiles]);

        if (validFiles.length < newFiles.length) {
            alert("Some files were rejected. Only images, Word, Excel, and PPT files up to 25MB are allowed.");
        }
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const currentMonthLabel = months.find(m => m.monthIndex === selectedMonth)?.label ?? "";

    return (
        <div className="w-full bg-slate-50/50 text-slate-800 antialiased pb-16" style={fontLight}>
            <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6">
                <div className="flex flex-col gap-6">

                    {/* ── CALENDAR SECTION ────────────────────────────────────── */}
                    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 md:p-6 overflow-hidden">
                        
                        {/* Controls */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <h2 style={fontBold} className="text-2xl text-slate-900 flex items-center gap-3">
                                <Calendar className="w-6 h-6 text-blue-600" />
                                {currentMonthLabel} {selectedYear}
                            </h2>

                            <div className="flex flex-wrap items-center gap-3">
                                <button onClick={handleJumpToToday} style={fontBold} className="h-9 px-4 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs hover:bg-slate-50 shadow-sm transition-all cursor-pointer">Today</button>
                                
                                <div className="flex items-center gap-1.5 h-9 bg-white px-2 rounded-lg border border-slate-200 shadow-sm">
                                    <select value={selectedMonth} onChange={handleMonthSelectChange} style={fontBold} className="bg-transparent text-sm text-slate-800 outline-none cursor-pointer">
                                        {months.map(m => <option key={m.monthIndex} value={m.monthIndex}>{m.label}</option>)}
                                    </select>
                                    <span className="text-slate-300">|</span>
                                    <select value={selectedYear} onChange={handleYearSelectChange} style={fontBold} className="bg-transparent text-sm text-slate-800 outline-none cursor-pointer">
                                        {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>

                                <div className="flex h-9 items-center rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
                                    <button onClick={handlePrevMonth} className="h-full px-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
                                    <button onClick={handleNextMonth} className="h-full px-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-2 mb-2">
                            {CALENDAR_DAYS.map(d => (
                                <div key={d} style={fontBold} className={`text-xs py-2 text-center uppercase tracking-widest ${d === "Sat" ? "text-orange-500" : "text-slate-500"}`}>
                                    {d}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-2">
                            {calendarGrid.map((cell) => {
                                if (cell._blank) return <div key={cell.key} className="min-h-[110px] rounded-xl bg-slate-50/50 border border-transparent" aria-hidden="true" />;

                                const formattedMonth = String(selectedMonth + 1).padStart(2, '0');
                                const formattedDay = String(cell.date).padStart(2, '0');
                                const fullCellDateStr = `${selectedYear}-${formattedMonth}-${formattedDay}`;

                                const dayEvents = dayActivityMap[fullCellDateStr] || [];
                                const isSelected = cell.date === selectedDay;
                                const isToday = cell.isToday;
                                const isHoliday = cell.isHoliday || cell.isCustomHoliday;

                                const isFiltered = !!activeLegendFilter && dayEvents.some(e => e.type === activeLegendFilter);
                                const isDimmed = !!activeLegendFilter && !isFiltered;

                                return (
                                    <div
                                        key={`${selectedYear}-${selectedMonth}-${cell.date}`}
                                        tabIndex={isHoliday ? -1 : 0}
                                        onClick={() => !isHoliday && handleSelectDay(cell.date)}
                                        className={`
                                            min-h-[110px] flex flex-col rounded-xl p-2.5 transition-all relative overflow-hidden group border
                                            ${isHoliday ? "bg-red-50/20 border-red-300 cursor-not-allowed opacity-80" : 
                                              isSelected ? "bg-blue-50/40 border-blue-400 shadow-md z-10 cursor-pointer" : 
                                              "bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm cursor-pointer"}
                                            ${isToday && !isSelected && !isHoliday ? "ring-2 ring-amber-400 ring-offset-2" : ""}
                                            ${isDimmed ? "opacity-30" : "opacity-100"}
                                        `}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span style={fontBold} className={`text-sm w-7 h-7 rounded-full flex items-center justify-center transition-colors 
                                                    ${isSelected ? "bg-blue-600 text-white shadow-sm" : isToday ? "bg-amber-500 text-white shadow-sm" : isHoliday ? "text-red-600" : "text-slate-800"}`}
                                                >
                                                    {cell.date}
                                                </span>
                                                
                                                {/* Pulse ONLY on days with Tasks */}
                                                {dayEvents.length > 0 && !isHoliday && (
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {cell.isCustomHoliday && (
                                            <span style={fontBold} className="text-[9px] px-1.5 py-0.5 rounded bg-red-100/80 text-red-700 truncate w-fit mb-1 border border-red-200">
                                                {cell.customHolidayName}
                                            </span>
                                        )}

                                        <div className="mt-auto flex flex-col gap-1 overflow-hidden">
                                            {dayEvents.slice(0, 2).map(ev => (
                                                <div key={ev.id} className={`text-[10px] font-bold px-1.5 py-1 rounded border truncate ${ACTIVITY_LIGHT[ev.type] || "bg-slate-50 text-slate-700 border-slate-200"}`}>
                                                    {ev.title}
                                                </div>
                                            ))}
                                            {dayEvents.length > 2 && (
                                                <span className="text-[9px] text-blue-600 font-bold pl-1">+{dayEvents.length - 2} more</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend Filter */}
                        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <span style={fontBold} className="text-xs text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <SlidersHorizontal className="w-4 h-4" /> Filter Categories
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(ACTIVITY_COLORS).map(([name, cls]) => {
                                    const active = activeLegendFilter === name;
                                    return (
                                        <button
                                            key={name}
                                            onClick={() => handleLegendFilter(name)}
                                            style={fontBold}
                                            className={`cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border transition-all shadow-sm
                                                ${active ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}
                                            `}
                                        >
                                            <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${cls}`} />{name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* ── FOLLOW-UP LEDGER ─────────────────────────────────────── */}
                    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
                        <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-4">
                            <div>
                                <h2 style={fontBold} className="text-lg text-slate-900">Target Follow-up Ledger</h2>
                                <p className="text-sm text-slate-500 mt-1">Track academic assurance officer attendance</p>
                            </div>
                            <span style={fontBold} className="text-[10px] text-blue-700 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 shadow-sm">Live Sync</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 border-y border-slate-200">
                                    <tr>
                                        <th style={fontBold} className="py-3 px-4 text-slate-600 font-bold">Assurance Officer</th>
                                        <th style={fontBold} className="py-3 px-4 text-slate-600 font-bold">Audit Scope</th>
                                        <th style={fontBold} className="py-3 px-4 text-slate-600 font-bold">Scheduled Date</th>
                                        <th style={fontBold} className="py-3 px-4 text-slate-600 font-bold">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {isLoadingFollowUps ? (
                                        <tr>
                                            <td colSpan="4" className="text-center py-10">
                                                <RefreshCw className="w-6 h-6 text-blue-500 animate-spin mx-auto mb-2" />
                                                <span className="text-slate-500 text-sm">Syncing ledger...</span>
                                            </td>
                                        </tr>
                                    ) : (
                                        followUps.map(f => (
                                            <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="py-4 px-4 flex items-center gap-3">
                                                    <span style={fontBold} className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs shadow-sm border ${f.color}`}>
                                                        {f.initials}
                                                    </span>
                                                    <div>
                                                        <span style={fontBold} className="text-slate-900 block">{f.officer}</span>
                                                        <span className="text-[10px] text-slate-400 uppercase tracking-widest">Lead Auditor</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-slate-600">{f.activity}</td>
                                                <td className="py-4 px-4 text-slate-600">{f.date}</td>
                                                <td className="py-4 px-4">
                                                    <span style={fontBold} className={`inline-flex px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider border shadow-sm ${STATUS_STYLE[f.status] || STATUS_STYLE.Pending}`}>
                                                        {f.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </main>

            {/* ── FULL WIDTH RIGHT DRAWER (Z-50, Smooth transition) ──────────────────────── */}
            <div className={`fixed inset-0 z-50 transition-all duration-500 ease-in-out ${isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
                <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsDrawerOpen(false)} />

                <aside
                    onClick={(e) => e.stopPropagation()}
                    className={`absolute top-0 right-0 h-full w-full sm:max-w-md bg-slate-50 shadow-2xl flex flex-col transition-transform duration-500 ease-in-out border-l border-slate-200 ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}
                >
                    {/* Header */}
                    <div className="bg-white border-b border-slate-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p style={fontBold} className="text-[10px] uppercase tracking-widest text-blue-600 mb-1">Day Overview</p>
                                <h2 style={fontBold} className="text-xl text-slate-900">
                                    {months.find(m => m.monthIndex === selectedMonth)?.label} {drawerDay ? String(drawerDay).split('-').pop() : ""}, {selectedYear}
                                </h2>
                            </div>
                            <button onClick={() => setIsDrawerOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer">
                                <X size={16} />
                            </button>
                        </div>
                        
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search day programs..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all"
                            />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={fontBold}
                                className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 focus:bg-white transition-all"
                            >
                                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Drawer Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        
                        {/* Day Activities List */}
                        <div className="space-y-4">
                            <h3 style={fontBold} className="text-sm text-slate-800 flex items-center gap-2 mb-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Planned Activities
                            </h3>
                            {filteredActivities.length === 0 ? (
                                <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 border-dashed">
                                    <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <AlertCircle className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <p style={fontBold} className="text-slate-600 text-sm">No events found.</p>
                                </div>
                            ) : (
                                filteredActivities.map((act) => (
                                    <div key={act.id} className={`bg-white rounded-2xl border p-5 shadow-sm transition-all ${ACTIVITY_BORDER[act.type] ? `border-l-4 ${ACTIVITY_BORDER[act.type]}` : 'border-slate-200'}`}>
                                        <div className="flex justify-between items-start gap-3 mb-4">
                                            <div className="flex gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${ACTIVITY_LIGHT[act.type]}`}>
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <h3 style={fontBold} className="text-sm text-slate-900 leading-tight">{act.title}</h3>
                                                    <p className="text-xs text-slate-500 mt-1">{act.desc}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => setSelectedActivity(act)} className="p-1.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 cursor-pointer transition-colors">
                                                <Ellipsis className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="space-y-2.5 text-xs text-slate-600 mb-5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5 text-amber-500" />
                                                <span style={fontBold}>{act.Fromtime || act.time} {act.toTime ? `- ${act.toTime}` : ""}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                                                <span style={fontBold} className="truncate">{act.location}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-3.5 h-3.5 text-emerald-500" />
                                                <span style={fontBold} className="truncate">{act.client}</span>
                                            </div>
                                        </div>

                                        {/* Status Toggle Buttons */}
                                        <div className="pt-4 border-t border-slate-100">
                                            <p style={fontBold} className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">Update Status</p>
                                            <div className="flex gap-2">
                                                {ATTEND_BUTTONS.map(({ label, icon, active }) => (
                                                    <button
                                                        key={label}
                                                        onClick={() => handleUpdateVisit(act.id, label)}
                                                        className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-bold border transition-colors cursor-pointer shadow-sm
                                                            ${act.visitStatus === label ? active : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"}
                                                        `}
                                                    >
                                                        {icon} {label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Generate Job Card / DPR Links */}
                                        <div className="pt-4 mt-4 border-t border-slate-100 flex gap-3">
                                            <button 
                                                onClick={() => setJobCardActivity(act)} 
                                                className="flex-1 py-2 text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 flex justify-center items-center gap-1.5 transition-colors cursor-pointer"
                                            >
                                                <ClipboardList className="w-3.5 h-3.5" /> Generate Job Card
                                            </button>
                                            <button 
                                                onClick={() => setDprActivity(act)} 
                                                className="flex-1 py-2 text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 flex justify-center items-center gap-1.5 transition-colors cursor-pointer"
                                            >
                                                <FileText className="w-3.5 h-3.5" /> Generate DPR
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* File Upload Zone */}
                        <div className="pt-4 border-t border-slate-200">
                            <h3 style={fontBold} className="text-sm text-slate-800 mb-3 flex items-center gap-2">
                                <UploadCloud className="w-4 h-4 text-blue-500" /> Day Attachments & Files
                            </h3>
                            <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById('file-upload').click()}
                                className={`w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer
                                    ${dragActive ? "border-blue-500 bg-blue-50 scale-[1.02]" : "border-slate-300 bg-white hover:bg-slate-50"}
                                `}
                            >
                                <input
                                    id="file-upload"
                                    type="file"
                                    multiple
                                    accept="image/*,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${dragActive ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"}`}>
                                    <Upload className="w-5 h-5" />
                                </div>
                                <p style={fontBold} className="text-sm text-slate-700">Click or drag & drop files here</p>
                                <p className="text-xs text-slate-500 mt-1">Images, Word, Excel, PPT (Max 25MB)</p>
                            </div>

                            {/* Uploaded Files List */}
                            {files.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {files.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <div className="flex flex-col truncate">
                                                    <span style={fontBold} className="text-sm text-slate-700 truncate">{file.name}</span>
                                                    <span className="text-[10px] text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                                                </div>
                                            </div>
                                            <button onClick={() => removeFile(index)} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors cursor-pointer shrink-0">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </aside>
            </div>

            {/* ── MODALS (Z-60 & Z-70) ──────────────────────────────────────────────── */}
            <TasksModal isOpen={!!selectedActivity} onClose={() => setSelectedActivity(null)} act={selectedActivity} onOpenJobCard={(a) => { setJobCardActivity(a); setSelectedActivity(null); }} />
            <JobCardFormModal isOpen={!!jobCardActivity} onClose={() => setJobCardActivity(null)} act={jobCardActivity} onSubmit={(payload) => { console.log("JobCard Details: ", payload); setJobCardActivity(null); }} />
            <DprModal isOpen={!!dprActivity} onClose={() => setDprActivity(null)} act={dprActivity} onSubmit={(payload) => { console.log("DPR Details: ", payload); setDprActivity(null); }} />
            
        </div>
    );
};

// ─── Sub-Components (Modals Layered on Top) ───────────────────────────────────

const TasksModal = ({ isOpen, onClose, act, onOpenJobCard }) => {
    if (!isOpen || !act) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={fontLight}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transform transition-all">
                
                <div className="p-5 border-b border-slate-100 flex justify-between items-start">
                    <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border shadow-sm ${ACTIVITY_LIGHT[act.type] || 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                            <Flag className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 style={fontBold} className="text-lg text-slate-900 leading-tight">{act.title}</h3>
                            <p className="text-sm text-slate-500 mt-1">{act.desc}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center cursor-pointer shrink-0">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6 bg-slate-50">
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <span style={fontBold} className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">Type</span>
                            <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${ACTIVITY_COLORS[act.type] || 'bg-slate-400'}`}></span>
                                <span style={fontBold} className="text-sm text-slate-800">{act.type}</span>
                            </div>
                        </div>
                        <div>
                            <span style={fontBold} className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">Status</span>
                            <span style={fontBold} className="text-sm text-slate-800 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {act.status}
                            </span>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <Building2 className="w-5 h-5 text-blue-500 shrink-0" />
                            <div>
                                <span style={fontBold} className="text-[10px] text-slate-400 uppercase tracking-widest block">Institution</span>
                                <span style={fontBold} className="text-sm text-slate-900">{act.client}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-amber-500 shrink-0" />
                            <div>
                                <span style={fontBold} className="text-[10px] text-slate-400 uppercase tracking-widest block">Location</span>
                                <span style={fontBold} className="text-sm text-slate-900">{act.location}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                            <Calendar className="w-5 h-5 text-orange-500 shrink-0" />
                            <div>
                                <span style={fontBold} className="text-[10px] text-slate-400 uppercase tracking-widest block">Timeline</span>
                                <span style={fontBold} className="text-sm text-slate-900">
                                    {act.Fromdate || act.date} ({act.Fromtime || act.time})
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-600">
                        <Info className="w-4 h-4" />
                        <span className="text-xs font-medium">Verify before generating Job Card</span>
                    </div>
                    <button onClick={() => onOpenJobCard(act)} style={fontBold} className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm text-white shadow-sm hover:bg-blue-700 transition-all cursor-pointer active:scale-95">
                        <ClipboardList className="w-4 h-4" /> Open Job Card
                    </button>
                </div>
            </div>
        </div>
    );
};

const getInitialJobCardForm = (act) => ({
    jobCardNo: act?.jobCard?.jobCardNo || `JC-${act?.id || Date.now()}`,
    assignedTo: act?.jobCard?.assignedTo || "",
    serviceType: act?.jobCard?.serviceType || act?.type || "",
    serviceDate: act?.jobCard?.serviceDate || act?.Fromdate || act?.date || "",
    timeWindow: act?.jobCard?.timeWindow || `${act?.Fromtime || act?.time || ""}`.trim(),
    scope: act?.jobCard?.scope || act?.desc || "",
    remarks: act?.jobCard?.remarks || "",
});

const JobCardFormModal = ({ isOpen, onClose, act, onSubmit }) => {
    const [form, setForm] = useState(() => getInitialJobCardForm(act));

    useEffect(() => { if (isOpen) setForm(getInitialJobCardForm(act)); }, [isOpen, act]);

    if (!isOpen || !act) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit?.({ activityId: act.id, ...form });
    };

    const canSave = form.jobCardNo.trim() && form.assignedTo.trim();

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={fontLight}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shadow-sm border border-amber-200">
                            <ClipboardList className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 style={fontBold} className="text-lg text-slate-900">Job Card Generation</h2>
                            <p className="text-xs text-slate-500">{act.title}</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 flex items-center justify-center transition-colors cursor-pointer">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label style={fontBold} className="text-[10px] text-slate-500 uppercase tracking-widest">Job Card No.</label>
                            <input value={form.jobCardNo} onChange={(e) => setForm(p => ({...p, jobCardNo: e.target.value}))} required className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none transition-all" />
                        </div>
                        <div>
                            <label style={fontBold} className="text-[10px] text-slate-500 uppercase tracking-widest">Assigned To</label>
                            <input value={form.assignedTo} onChange={(e) => setForm(p => ({...p, assignedTo: e.target.value}))} required placeholder="Lead Auditor Name" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none transition-all" />
                        </div>
                        <div>
                            <label style={fontBold} className="text-[10px] text-slate-500 uppercase tracking-widest">Service Date</label>
                            <input value={form.serviceDate} onChange={(e) => setForm(p => ({...p, serviceDate: e.target.value}))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none transition-all" />
                        </div>
                        <div>
                            <label style={fontBold} className="text-[10px] text-slate-500 uppercase tracking-widest">Time Window</label>
                            <input value={form.timeWindow} onChange={(e) => setForm(p => ({...p, timeWindow: e.target.value}))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none transition-all" />
                        </div>
                    </div>
                    <div>
                        <label style={fontBold} className="text-[10px] text-slate-500 uppercase tracking-widest">Work Scope Description</label>
                        <textarea rows={3} value={form.scope} onChange={(e) => setForm(p => ({...p, scope: e.target.value}))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none transition-all" />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100 bg-white">
                    <button type="button" onClick={onClose} style={fontBold} className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer text-sm">Cancel</button>
                    <button type="submit" disabled={!canSave} style={fontBold} className={`px-6 py-2.5 rounded-lg text-white shadow-md transition-all text-sm ${canSave ? "bg-amber-600 hover:bg-amber-700 cursor-pointer active:scale-95" : "bg-slate-300 cursor-not-allowed"}`}>Confirm Generation</button>
                </div>
            </form>
        </div>
    );
};

const DprModal = ({ isOpen, onClose, act, onSubmit }) => {
    const [summary, setSummary] = useState("");

    useEffect(() => { if (!isOpen) setSummary(""); }, [isOpen]);

    if (!isOpen || !act) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit?.({ activityId: act.id, type: "DPR", summary });
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={fontLight}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-blue-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shadow-sm border border-blue-200">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 style={fontBold} className="text-lg text-slate-900">Generate DPR</h2>
                            <p className="text-xs text-slate-500">Daily Progress Report</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 flex items-center justify-center transition-colors cursor-pointer">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-5 text-sm text-slate-700">
                        <strong className="block text-slate-900 mb-1">{act.title}</strong>
                        Date: {act.Fromdate || act.date} &middot; Client: {act.client}
                    </div>

                    <div>
                        <label style={fontBold} className="text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 block">Progress Summary</label>
                        <textarea 
                            rows={4} 
                            required
                            placeholder="Enter the daily progress..."
                            value={summary} 
                            onChange={(e) => setSummary(e.target.value)} 
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all resize-none" 
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100 bg-white">
                    <button type="button" onClick={onClose} style={fontBold} className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer text-sm">Close</button>
                    <button type="submit" style={fontBold} className={`px-6 py-2.5 rounded-lg text-white shadow-md transition-all text-sm ${summary.trim() ? "bg-blue-600 hover:bg-blue-700 cursor-pointer active:scale-95" : "bg-slate-300 cursor-not-allowed"}`}>Submit Report</button>
                </div>
            </form>
        </div>
    );
};