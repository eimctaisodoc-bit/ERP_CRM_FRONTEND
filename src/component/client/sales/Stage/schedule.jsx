import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
    CheckCircle2,
    Clock,
    MapPin,
    Users,
    Plus,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    FileText,
    Check,
    X,
    AlertCircle,
    AlertTriangle,
    BookOpen,
    SlidersHorizontal,
    RefreshCw,
    GraduationCap,
    Upload, ImageIcon, FileSpreadsheet,
    Trash2,
} from "lucide-react";
import { getBsDisplayData, getMonthDays } from "../../../staff/salespipeline/calendar";

// import {
//     getBsDisplayData,
//     getMonthDays,
// } from "../../../staff/salespipeline/innerHelper/calendar";

// ─── Constants ────────────────────────────────────────────────────────────────

// FIX #6: Moved outside component — prevents recreation on every render
const HOLIDAYS = [
    { date: "2083-01-01", name: "New Year" },
    { date: "2083-02-15", name: "Republic Day" },
];

const YEAR_OPTIONS = [2080, 2081, 2082, 2083];

const ACTIVITY_COLORS = {
    Audit: "bg-amber-600",
    Review: "bg-emerald-600",
    Training: "bg-indigo-600",
    Document: "bg-violet-600",
    Other: "bg-slate-600",
};
const ACTIVITY_BORDER = {
    Audit: "border-amber-500",
    Review: "border-emerald-500",
    Training: "border-indigo-500",
    Document: "border-violet-500",
    Other: "border-slate-500",
};
const ACTIVITY_LIGHT = {
    Audit: "bg-amber-50 text-amber-800 border-amber-100",
    Review: "bg-emerald-50 text-emerald-800 border-emerald-100",
    Training: "bg-indigo-50 text-indigo-800 border-indigo-100",
    Document: "bg-violet-50 text-violet-800 border-violet-100",
    Other: "bg-slate-50 text-slate-800 border-slate-100",
};
const ACTIVITY_GRADIENT = {
    Audit: "from-amber-50/60 to-amber-100/20",
    Review: "from-emerald-50/60 to-emerald-100/20",
    Training: "from-indigo-50/60 to-indigo-100/20",
    Document: "from-violet-50/60 to-violet-100/20",
    Other: "from-slate-50/60 to-slate-100/20",
};

const VISIT_STATUS_OPTIONS = ["Came", "Not Came", "Pending", "Rejected"];
const STATUS_OPTIONS = ["All", "Completed", "In Progress", "Upcoming"];

const STATUS_STYLE = {
    Came: "bg-emerald-50 text-emerald-700 border-emerald-100",
    "Not Came": "bg-amber-50 text-amber-700 border-amber-100",
    Pending: "bg-blue-50 text-blue-700 border-blue-100",
    Rejected: "bg-rose-50 text-rose-700 border-rose-100",
};

// FIX #2: Calendar header starts Sunday to match BS dayIndex (0=Sun...6=Sat)
const CALENDAR_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ─── Initial Data ─────────────────────────────────────────────────────────────

const INITIAL_ACTIVITIES = [
    { id: 1, day: 1, type: "Audit", title: "Syllabus Compliance Review", desc: "Comprehensive evaluation of curriculum map alignment with international benchmarks.", time: "10:00 AM – 12:00 PM", location: "Senate Board Room", client: "Kathmandu Valley College", status: "Completed", visitStatus: "Came" },
    { id: 2, day: 1, type: "Audit", title: "Registrar Archiving Audit", desc: "Assessing physical & digital backup configurations for institutional records.", time: "1:30 PM – 4:00 PM", location: "Central Registrar Office", client: "Nami Academic Institute", status: "Completed", visitStatus: "Came" },
    { id: 3, day: 2, type: "Other", title: "Board Assessment Planning", desc: "Drafting quality evaluation roadmap parameters for quarterly target assessments.", time: "2:00 PM – 3:30 PM", location: "Quality Assurance Unit", client: "Global College of Management", status: "Upcoming", visitStatus: "Pending" },
    { id: 4, day: 3, type: "Training", title: "ISO 21001 Auditor Briefing", desc: "Intensive training for internal evaluators on educational organization management systems.", time: "09:00 AM – 1:00 PM", location: "Main Assembly Hall", client: "Apex Academic Center", status: "Completed", visitStatus: "Came" },
    { id: 5, day: 7, type: "Review", title: "Advisory Council Evaluation", desc: "Evaluating executive leadership decisions and regional operational metrics.", time: "11:00 AM – 1:00 PM", location: "Executive Annex Rm 4", client: "Universal College of Sciences", status: "In Progress", visitStatus: "Came" },
    { id: 6, day: 7, type: "Review", title: "Non-Conformity Follow-up", desc: "Assessing remediation plans initiated by the board following the winter audit cycle.", time: "3:00 PM – 5:00 PM", location: "Management Office 302", client: "Nami Academic Institute", status: "Upcoming", visitStatus: "Pending" },
    { id: 7, day: 9, type: "Document", title: "Student Support Audit", desc: "Evaluating psychological counseling and career advisement logs for student support.", time: "10:00 AM – 12:30 PM", location: "Dean of Student Affairs", client: "Patan Academy of Health Sci", status: "Upcoming", visitStatus: "Pending" },
    { id: 8, day: 13, type: "Other", title: "Academic Policy Formulation", desc: "Defining procedural guidelines for continuous performance and progress reviews.", time: "4:00 PM – 5:30 PM", location: "Dean's Boardroom", client: "Prime College", status: "Completed", visitStatus: "Came" },
    { id: 9, day: 17, type: "Review", title: "Corrective Action Seminar", desc: "Presenting metrics to clean outstanding non-conformity list reports.", time: "11:30 AM – 1:00 PM", location: "Quality Council Wing", client: "Universal College of Sciences", status: "In Progress", visitStatus: "Came" },
    { id: 10, day: 21, type: "Document", title: "SOP Guideline Verification", desc: "Proofing departmental guidelines before public distribution to academic units.", time: "1:00 PM – 3:00 PM", location: "Institutional Library", client: "Everest Academy", status: "Upcoming", visitStatus: "Pending" },
    { id: 11, day: 23, type: "Audit", title: "Curriculum Integration Review", desc: "Verifying curriculum structure maps align directly to international standards.", time: "10:00 AM – 12:00 PM", location: "Main Senate Chamber", client: "Kathmandu Valley College", status: "In Progress", visitStatus: "Came" },
    { id: 12, day: 23, type: "Document", title: "SOP Standardization Draft", desc: "Drafting operating manuals for research facility administration and safety compliance.", time: "2:00 PM – 4:30 PM", location: "Research & Dev Lab", client: "Lalitpur Academic Center", status: "Upcoming", visitStatus: "Not Came" },
    { id: 13, day: 24, type: "Other", title: "Safety Compliance Review", desc: "Inspecting laboratory equipment logs and general campus evacuation plans.", time: "09:30 AM – 11:00 AM", location: "Campus Security Office", client: "Global College of Management", status: "Upcoming", visitStatus: "Rejected" },
    { id: 14, day: 28, type: "Review", title: "Management System Review", desc: "Final board audit alignment, executive reporting, and validation processes.", time: "3:30 PM – 5:00 PM", location: "Executive Board Lounge", client: "Apex Academic Center", status: "Upcoming", visitStatus: "Pending" },
];

const INITIAL_FOLLOW_UPS = [
    { id: "f1", initials: "RM", color: "bg-amber-100 text-amber-800 border-amber-200", officer: "Raj Mani Sharma", activity: "ISO 21001 Curricular Audit", date: "Jestha 9, 2081", status: "Came" },
    { id: "f2", initials: "SP", color: "bg-emerald-100 text-emerald-800 border-emerald-200", officer: "Sunita Poudel", activity: "ISO 21001 Internal Assessment", date: "Jestha 9, 2081", status: "Not Came" },
    { id: "f3", initials: "AK", color: "bg-indigo-100 text-indigo-800 border-indigo-200", officer: "Arun Kumar Yadav", activity: "ISO 21001 Advisory Board Review", date: "Jestha 14, 2081", status: "Pending" },
    { id: "f4", initials: "NK", color: "bg-violet-100 text-violet-800 border-violet-200", officer: "Neha Kawasaki", activity: "Corrective Action Documentation", date: "Jestha 15, 2081", status: "Rejected" },
];

// ─── Attend Buttons Config ────────────────────────────────────────────────────

const ATTEND_BUTTONS = [
    { label: "Came", icon: <Check className="w-3 h-3" />, active: "bg-emerald-600 text-white border-emerald-700 shadow-sm" },
    { label: "Rejected", icon: <X className="w-3 h-3" />, active: "bg-rose-600 text-white border-rose-700 shadow-sm" },
    { label: "Not Came", icon: <AlertTriangle className="w-3 h-3" />, active: "bg-amber-600 text-white border-amber-700 shadow-sm" },
    { label: "Pending", icon: <Clock className="w-3 h-3" />, active: "bg-slate-600 text-white border-slate-700 shadow-sm" },
];

// ─── Sub-Components ───────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
    const map = {
        Completed: "bg-emerald-50 text-emerald-800 border-emerald-100",
        "In Progress": "bg-blue-50 text-blue-800 border-blue-100",
        Upcoming: "bg-violet-50 text-violet-800 border-violet-100",
    };
    return (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${map[status] || map.Upcoming}`}>
            {status}
        </span>
    );
};

const ActivityCard = React.memo(({ act, onUpdateVisit, onDelete }) => {
    const [pendingDelete, setPendingDelete] = useState(false);

    const handleDelete = useCallback(() => {
        if (pendingDelete) {
            onDelete(act.id);
        } else {
            setPendingDelete(true);
            setTimeout(() => setPendingDelete(false), 2800);
        }
    }, [pendingDelete, act.id, onDelete]);

    return (
        <article
            className={`border rounded-2xl p-4 bg-gradient-to-br ${ACTIVITY_GRADIENT[act.type]} border-l-4 ${ACTIVITY_BORDER[act.type]} transition-all duration-200 hover:shadow-sm hover:-translate-y-px`}
            aria-label={`Activity: ${act.title}`}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${ACTIVITY_LIGHT[act.type]}`}>
                        <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-sm font-black text-slate-900 tracking-tight leading-snug">{act.title}</h3>
                        <p className="text-[11px] text-slate-500 leading-normal mt-0.5 line-clamp-2">{act.desc}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <StatusBadge status={act.status} />
                    <button
                        onClick={handleDelete}
                        className={`p-1.5 rounded-lg transition-all cursor-pointer ${pendingDelete ? "bg-rose-500 text-white scale-105" : "text-slate-300 hover:text-rose-500 hover:bg-rose-50"}`}
                        aria-label={pendingDelete ? "Confirm delete" : "Delete activity"}
                        title={pendingDelete ? "Click again to confirm deletion" : "Delete"}
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Meta row */}
            <div className="mt-3 grid grid-cols-2 gap-2 bg-white/60 p-2 rounded-xl text-[11px] text-slate-600 border border-white/50">
                <span className="flex items-center gap-1.5 truncate">
                    <Clock className="w-3.5 h-3.5 text-amber-700/75 flex-shrink-0" />
                    <span className="truncate">{act.time}</span>
                </span>
                <span className="flex items-center gap-1.5 truncate" title={act.location}>
                    <MapPin className="w-3.5 h-3.5 text-amber-700/75 flex-shrink-0" />
                    <span className="truncate">{act.location}</span>
                </span>
            </div>

            {/* Institution + attendance */}
            <div className="mt-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Institution</p>
                    <p className="font-bold text-slate-700 truncate flex items-center gap-1 text-xs">
                        <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{act.client}</span>
                    </p>
                </div>
                <div className="text-right flex-shrink-0">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Attendance</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLE[act.visitStatus] || STATUS_STYLE.Pending}`}>
                        {act.visitStatus}
                    </span>
                </div>
            </div>

            {/* Attendance buttons */}
            <div className="mt-4 pt-3.5 border-t border-amber-200/30">
                <p className="text-[10px] text-slate-400 font-black mb-2 uppercase tracking-widest">Update Attendance</p>
                <div className="grid grid-cols-4 gap-1.5">
                    {ATTEND_BUTTONS.map(({ label, icon, active }) => (
                        <button
                            key={label}
                            onClick={() => onUpdateVisit(act.id, label)}
                            className={`flex items-center justify-center gap-1 py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${act.visitStatus === label ? active : "bg-white text-slate-600 border-amber-100 hover:bg-amber-50"}`}
                            aria-pressed={act.visitStatus === label}
                            aria-label={`Mark as ${label}`}
                        >
                            {icon}
                            <span className="hidden sm:inline truncate">{label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </article>
    );
});
ActivityCard.displayName = "ActivityCard";

// ─── Main Schedule Component ──────────────────────────────────────────────────

export const Schedule = () => {

    // ── Base calendar data (today info, month list) ───────────────────────────
    // FIX #6: HOLIDAYS is outside component, so this memo is stable
    const baseData = useMemo(() => getBsDisplayData(null, HOLIDAYS), []);
    const { months, today, currentYear } = baseData;

    // ── Calendar navigation state ─────────────────────────────────────────────
    // FIX #3: selectedYear actually drives getMonthDays now
    const [selectedYear, setSelectedYear] = useState(today.bsYear);
    // FIX #1: initialized as Number, always kept as Number
    const [selectedMonth, setSelectedMonth] = useState(today.bsMonthIndex);

    // ── UI state ──────────────────────────────────────────────────────────────
    const [selectedDay, setSelectedDay] = useState(today.bsDate);
    const [drawerDay, setDrawerDay] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
    const [followUps, setFollowUps] = useState(INITIAL_FOLLOW_UPS);
    const [activeLegendFilter, setLegendFilter] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({
        day: today.bsDate, type: "Audit", title: "", desc: "",
        time: "10:00 AM – 12:00 PM", location: "", client: "",
        status: "Upcoming", visitStatus: "Pending",
    });

    // ── Compute month days (BS, real data) ────────────────────────────────────
    // FIX #3: Uses selectedYear + selectedMonth correctly
    // FIX #3: Only passes todayBsDate when viewing current year+month
    const monthDays = useMemo(() => {
        const isCurrentYearMonth =
            selectedYear === today.bsYear &&
            selectedMonth === today.bsMonthIndex;
        return getMonthDays(
            selectedYear,
            selectedMonth,
            isCurrentYearMonth ? today.bsDate : null,
            HOLIDAYS
        );
    }, [selectedYear, selectedMonth, today.bsYear, today.bsMonthIndex, today.bsDate]);

    // FIX #2: Build padded grid — prepend blank cells so day 1 lands on its correct weekday
    // dayIndex: 0=Sun, 1=Mon … 6=Sat — CALENDAR_DAYS order matches this
    const calendarGrid = useMemo(() => {
        if (!monthDays.length) return [];
        const offset = monthDays[0].dayIndex; // 0=Sun, so no conversion needed
        const blanks = Array.from({ length: offset }, (_, i) => ({
            _blank: true,
            key: `blank-${i}`,
        }));
        return [...blanks, ...monthDays];
    }, [monthDays]);

    // ── Month navigation helpers ──────────────────────────────────────────────
    // FIX #4: Prev/Next month buttons now actually work
    const handlePrevMonth = useCallback(() => {
        setSelectedMonth(prev => {
            if (prev === 0) {
                setSelectedYear(y => y - 1);
                return 11;
            }
            return prev - 1;
        });
        setSelectedDay(null); // clear day selection when navigating
    }, []);

    const handleNextMonth = useCallback(() => {
        setSelectedMonth(prev => {
            if (prev === 11) {
                setSelectedYear(y => y + 1);
                return 0;
            }
            return prev + 1;
        });
        setSelectedDay(null);
    }, []);

    // Lock body scroll when drawer is open
    useEffect(() => {
        document.body.style.overflow = isDrawerOpen ? "hidden" : "unset";
        return () => { document.body.style.overflow = "unset"; };
    }, [isDrawerOpen]);

    // ── Derived data ──────────────────────────────────────────────────────────

    // O(1) day → activities map
    const dayActivityMap = useMemo(() => {
        const map = {};
        activities.forEach(a => { (map[a.day] ??= []).push(a); });
        return map;
    }, [activities]);

    // Stats
    const stats = useMemo(() => {
        const total = activities.length;
        const completed = activities.filter(a => a.status === "Completed").length;
        const inProgress = activities.filter(a => a.status === "In Progress").length;
        const upcoming = activities.filter(a => a.status === "Upcoming").length;
        const clients = new Set(activities.map(a => a.client)).size;
        const pct = (n) => (total ? Math.round((n / total) * 100) : 0);
        return [
            { icon: <BookOpen className="w-5 h-5 text-amber-700" />, label: "Total Audits", value: total, pct: 100, color: "text-slate-900", bar: "bg-amber-600", sub: "All Schedules" },
            { icon: <CheckCircle2 className="w-5 h-5 text-emerald-700" />, label: "Completed", value: completed, pct: pct(completed), color: "text-emerald-700", bar: "bg-emerald-600", sub: "Verified Compliance" },
            { icon: <RefreshCw className="w-4 h-4 text-blue-700" />, label: "In Progress", value: inProgress, pct: pct(inProgress), color: "text-blue-700", bar: "bg-blue-600", sub: "Ongoing Audits" },
            { icon: <Clock className="w-5 h-5 text-violet-700" />, label: "Upcoming", value: upcoming, pct: pct(upcoming), color: "text-violet-700", bar: "bg-violet-600", sub: "Scheduled Pipeline" },
            { icon: <GraduationCap className="w-5 h-5 text-slate-700" />, label: "Institutions", value: clients, pct: 92, color: "text-slate-800", bar: "bg-slate-600", sub: "Affiliated Colleges" },
        ];
    }, [activities]);

    // FIX #5: filteredActivities now drives the DRAWER list (search + status + legend all work)
    const filteredActivities = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return (dayActivityMap[drawerDay] || []).filter(a => {
            if (statusFilter !== "All" && a.status !== statusFilter) return false;
            if (activeLegendFilter && a.type !== activeLegendFilter) return false;
            if (q && ![a.title, a.client, a.location].some(s => s.toLowerCase().includes(q))) return false;
            return true;
        });
    }, [dayActivityMap, drawerDay, searchQuery, statusFilter, activeLegendFilter]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleSelectDay = useCallback((date) => {
        if (!date) return;
        setSelectedDay(date);
        setDrawerDay(date);
        setIsDrawerOpen(true);
    }, []);

    const handleCloseDrawer = useCallback(() => {
        setIsDrawerOpen(false);
    }, []);

    const handleUpdateVisit = useCallback((id, status) =>
        setActivities(p => p.map(a => a.id === id ? { ...a, visitStatus: status } : a)), []);

    const handleDeleteActivity = useCallback((id) =>
        setActivities(p => p.filter(a => a.id !== id)), []);

    const handleUpdateFollowUp = useCallback((id, status) =>
        setFollowUps(p => p.map(f => f.id === id ? { ...f, status } : f)), []);

    const handleLegendFilter = useCallback((name) =>
        setLegendFilter(p => p === name ? null : name), []);

    const handleOpenModal = useCallback((day) => {
        setNewEvent(p => ({ ...p, day: day ?? today.bsDate }));
        setIsModalOpen(true);
    }, [today.bsDate]);

    const handleAddEvent = useCallback((e) => {
        e.preventDefault();
        const event = { ...newEvent, id: Date.now(), day: Number(newEvent.day) };
        setActivities(p => [...p, event]);
        setSelectedDay(event.day);
        setDrawerDay(event.day);
        setIsDrawerOpen(true);
        setIsModalOpen(false);
        setNewEvent(p => ({
            ...p, title: "", desc: "", location: "", client: "",
            day: event.day, status: "Upcoming", visitStatus: "Pending",
        }));
    }, [newEvent]);

    const updateField = useCallback((field) => (e) =>
        setNewEvent(p => ({ ...p, [field]: e.target.value })), []);

    const handleJumpToToday = useCallback(() => {
        setSelectedYear(today.bsYear);
        setSelectedMonth(today.bsMonthIndex);
        setSelectedDay(today.bsDate);
        setDrawerDay(null);
        setIsDrawerOpen(false);
    }, [today.bsYear, today.bsMonthIndex, today.bsDate]);

    // FIX #1: month select always casts to Number
    const handleMonthSelectChange = useCallback((e) => {
        setSelectedMonth(Number(e.target.value));
        setSelectedDay(null);
    }, []);

    const handleYearSelectChange = useCallback((e) => {
        setSelectedYear(Number(e.target.value));
        setSelectedDay(null);
    }, []);

    const canSubmit = newEvent.title.trim() && newEvent.time.trim() &&
        newEvent.location.trim() && newEvent.client.trim();

    // Current month label for display
    const currentMonthLabel = months.find(m => m.monthIndex === selectedMonth)?.label ?? "";
    const selectedMonthLabel = months.find(m => m.monthIndex === selectedMonth)?.label ?? currentMonthLabel;

    // ─── Render ────────────────────────────────────────────────────────────────
    const handleFileUpload = () => { }
    return (
        <div
            className="min-h-screen text-slate-800 antialiased selection:bg-amber-100 pb-16"
            style={{ fontFamily: "'Roboto Slab', Georgia, serif" }}
        >
            <main id="main-content" className="max-w-7xl mx-auto">
                <div className="flex flex-col gap-6">

                    {/* ── CALENDAR SECTION ────────────────────────────────────── */}
                    <section className="bg-white" aria-labelledby="calendar-heading">

                        {/* Controls row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                            <h2 id="calendar-heading" className="text-base font-bold text-slate-900">
                                {currentMonthLabel} {selectedYear}
                            </h2>

                            <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
                                {/* Jump to today */}
                                <button
                                    onClick={handleJumpToToday}
                                    className="border border-amber-200 bg-amber-50 text-amber-900 rounded-xl px-3 py-2 text-xs font-bold hover:bg-amber-100 transition-all active:scale-95 cursor-pointer"
                                    aria-label="Jump to today"
                                >
                                    Today
                                </button>

                                {/* Month select — FIX #1: Number cast in handler */}
                                <select
                                    value={selectedMonth}
                                    onChange={handleMonthSelectChange}
                                    className="text-xs rounded-xl border border-amber-100 bg-[#FAF7F2] px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all"
                                    aria-label="Select Nepali month"
                                >
                                    {months.map((month) => (
                                        <option key={month.monthIndex} value={month.monthIndex}>
                                            {month.label}
                                        </option>
                                    ))}
                                </select>

                                {/* Year select — FIX #3: actually used */}
                                <select
                                    value={selectedYear}
                                    onChange={handleYearSelectChange}
                                    className="text-xs rounded-xl border border-amber-100 bg-[#FAF7F2] px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all"
                                    aria-label="Select year"
                                >
                                    {YEAR_OPTIONS.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>

                                {/* FIX #4: Prev/Next now have working handlers */}
                                <div className="inline-flex rounded-xl border border-amber-100 bg-[#FAF7F2] p-1" role="group" aria-label="Month navigation">
                                    <button
                                        onClick={handlePrevMonth}
                                        className="rounded-lg p-1.5 text-slate-500 hover:bg-amber-50 hover:text-amber-900 transition-all cursor-pointer"
                                        aria-label="Previous month"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={handleNextMonth}
                                        className="rounded-lg p-1.5 text-slate-500 hover:bg-amber-50 hover:text-amber-900 transition-all cursor-pointer"
                                        aria-label="Next month"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* FIX #2: Day-of-week headers now Sun–Sat (matches dayIndex 0–6) */}
                        <div className="grid grid-cols-7 gap-1 mb-1.5" role="row">
                            {CALENDAR_DAYS.map(d => (
                                <div
                                    key={d}
                                    role="columnheader"
                                    className={`text-[10px] font-extrabold py-2 text-center uppercase tracking-widest ${d === "Sat" ? "text-red-400" : "text-slate-400"}`}
                                >
                                    {d}
                                </div>
                            ))}
                        </div>

                        {/* FIX #2: Calendar grid cells with correct offset blanks */}
                        <div
                            className="grid grid-cols-7 gap-1"
                            role="grid"
                            aria-label={`${currentMonthLabel} ${selectedYear} calendar`}
                        >
                            {calendarGrid.map((cell, idx) => {
                                // Render blank offset cells
                                if (cell._blank) {
                                    return (
                                        <div
                                            key={cell.key}
                                            className="min-h-[90px] md:min-h-[108px] rounded-lg bg-slate-50/30 border border-transparent"
                                            aria-hidden="true"
                                        />
                                    );
                                }

                                // Real day cell
                                const isToday = cell.isToday;
                                const isSaturday = cell.isSaturday;
                                const isCustomHoliday = cell.isCustomHoliday;
                                const isHoliday = cell.isHoliday; // Saturday OR custom holiday

                                const isSelected = cell.date === selectedDay;
                                const dayEvents = dayActivityMap[cell.date] || [];
                                const isFiltered = !!activeLegendFilter && dayEvents.some(e => e.type === activeLegendFilter);
                                const isDimmed = !!activeLegendFilter && !isFiltered;

                                // Build cell classes cleanly
                                const cellClasses = [
                                    "min-h-[90px] md:min-h-[108px] flex flex-col justify-between rounded-lg p-2 transition-all duration-150 select-none group outline-none cursor-pointer border",
                                    isSelected
                                        ? "bg-amber-50 border-amber-400 shadow-md z-10"
                                        : isHoliday
                                            ? "bg-red-50 border-red-200"
                                            : "bg-white border-amber-50",
                                    isToday && !isSelected ? "ring-2 ring-blue-400 ring-offset-1" : "",
                                    !isSelected && "hover:border-amber-200 hover:bg-amber-50/40",
                                    isDimmed ? "opacity-25" : "",
                                    isFiltered && !isSelected ? "ring-2 ring-amber-400/60 border-amber-300 bg-amber-50/20" : "",
                                ].filter(Boolean).join(" ");

                                return (
                                    <div
                                        key={`${selectedYear}-${selectedMonth}-${cell.date}`}
                                        role="gridcell"
                                        tabIndex={0}
                                        aria-selected={isSelected}
                                        aria-label={`${cell.date} ${cell.dayName}${isToday ? ", today" : ""}${isHoliday ? ", holiday" : ""}`}
                                        onClick={() => handleSelectDay(cell.date)}
                                        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), handleSelectDay(cell.date))}
                                        className={cellClasses}
                                    >
                                        {/* Date + day name row */}
                                        <div className="flex items-center justify-between">
                                            <span
                                                className={`text-xs md:text-sm font-black w-7 h-7 rounded-lg flex items-center justify-center transition-all
                                                    ${isSelected ? "bg-amber-700 text-white" : isHoliday ? "text-red-600" : "text-slate-700"}
                                                    ${isToday ? "ring-2 ring-blue-500" : ""}
                                                `}
                                            >
                                                {cell.date}
                                            </span>
                                            {/* FIX #8: Use cell.dayName directly */}
                                            <span className={`text-[10px] font-bold ${isSaturday ? "text-red-400" : "text-slate-400"}`}>
                                                {cell.dayName?.slice(0, 3)}
                                            </span>
                                        </div>

                                        {/* Holiday label */}
                                        {isCustomHoliday && (
                                            <span className="text-[9px] font-bold text-red-500 leading-tight truncate mt-0.5">
                                                {cell.customHolidayName}
                                            </span>
                                        )}

                                        {/* Events */}
                                        <div className="mt-1 flex flex-col gap-0.5 overflow-hidden">
                                            {dayEvents.slice(0, 2).map(ev => (
                                                <div
                                                    key={ev.id}
                                                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md leading-tight border truncate ${ACTIVITY_LIGHT[ev.type]}`}
                                                >
                                                    {ev.title}
                                                </div>
                                            ))}
                                            {dayEvents.length > 2 && (
                                                <span className="text-[8px] text-amber-800 font-bold pl-0.5">+{dayEvents.length - 2} more</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend / type filter */}
                        <div className="mt-4 pt-4 border-t border-amber-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 bg-[#FAF7F2]/50 p-3 rounded-lg">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 flex-shrink-0">
                                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                                Filter by type:
                            </span>
                            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter activities by classification">
                                {Object.entries(ACTIVITY_COLORS).map(([name, cls]) => {
                                    const active = activeLegendFilter === name;
                                    return (
                                        <button
                                            key={name}
                                            onClick={() => handleLegendFilter(name)}
                                            aria-pressed={active}
                                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${active ? "bg-amber-800 text-white border-amber-900 shadow-sm scale-105" : "bg-white text-slate-600 border-amber-100 hover:border-amber-300 hover:bg-amber-50"}`}
                                        >
                                            <span className={`w-2 h-2 rounded-full ${cls}`} />
                                            {name}
                                        </button>
                                    );
                                })}
                                {activeLegendFilter && (
                                    <button
                                        onClick={() => setLegendFilter(null)}
                                        className="text-[10px] text-rose-600 font-bold hover:underline flex items-center gap-0.5 cursor-pointer px-1"
                                        aria-label="Clear type filter"
                                    >
                                        <X className="w-3 h-3" /> Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* ── STATS GRID ───────────────────────────────────────────── */}
                    <section className="grid grid-cols-2 md:grid-cols-5 gap-3" aria-label="Summary statistics">
                        {stats.map(s => (
                            <div
                                key={s.label}
                                className="bg-white rounded-lg border border-amber-100/50 shadow-xs p-4 flex flex-col gap-2 transition-all duration-200 hover:-translate-y-0.5 group"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="p-2 bg-amber-50 rounded-lg border border-amber-100/30 group-hover:scale-105 transition-transform">{s.icon}</span>
                                    {s.label !== "Total Audits" && <span className="text-[10px] font-black text-slate-400">{s.pct}%</span>}
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
                                    <p className={`text-2xl font-black mt-0.5 ${s.color}`}>{s.value}</p>
                                </div>
                                <div
                                    className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden"
                                    role="progressbar" aria-valuenow={s.pct} aria-valuemin={0} aria-valuemax={100}
                                >
                                    <div className={`h-full rounded-full transition-all duration-700 ${s.bar}`} style={{ width: `${s.pct}%` }} />
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium italic">{s.sub}</p>
                            </div>
                        ))}
                    </section>

                    {/* ── FOLLOW-UP LEDGER ─────────────────────────────────────── */}
                    <section className="bg-white rounded-lg mt-3 border border-amber-100/70 p-5 md:p-6" aria-labelledby="ledger-heading">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-amber-50">
                            <div>
                                <h2 id="ledger-heading" className="text-base font-bold text-slate-900">Target Follow-up Ledger</h2>
                                <p className="text-xs text-slate-400">Track academic assurance officer attendance</p>
                            </div>
                            <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/50">Live</span>
                        </div>

                        <div className="overflow-x-auto -mx-1">
                            <table className="w-full text-xs min-w-[360px]" aria-label="Follow-up attendance ledger">
                                <thead>
                                    <tr className="text-slate-400 font-bold border-b border-amber-100">
                                        <th scope="col" className="text-left pb-3 pl-2 font-bold">Officer</th>
                                        <th scope="col" className="text-left pb-3 font-bold">Scope</th>
                                        <th scope="col" className="text-left pb-3 font-bold">Date</th>
                                        <th scope="col" className="text-left pb-3 pr-2 font-bold">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-amber-50/50">
                                    {followUps.map(f => (
                                        <tr key={f.id} className="hover:bg-amber-50/20 transition-colors">
                                            <td className="py-3.5 pl-2">
                                                <div className="flex items-center gap-2.5">
                                                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black border flex-shrink-0 ${f.color}`}>
                                                        {f.initials}
                                                    </span>
                                                    <div>
                                                        <span className="font-bold text-slate-900 block leading-tight">{f.officer}</span>
                                                        <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Assurance Lead</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3.5 text-slate-500 max-w-[110px] truncate" title={f.activity}>{f.activity}</td>
                                            <td className="py-3.5 text-slate-500 whitespace-nowrap">{f.date}</td>
                                            <td className="py-3.5 pr-2">
                                                <span
                                                    className={`inline-flex items-center rounded-xl border px-2.5 py-1 text-[10px] font-bold ${STATUS_STYLE[f.status] || STATUS_STYLE.Pending}`}
                                                    aria-label={`Status for ${f.officer}: ${f.status}`}
                                                >
                                                    {f.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </main>

            {/* ── PROGRAMS DRAWER ───────────────────────────────────────────────── */}
            <div
                className={`fixed inset-0 z-50 transition-all duration-300 ${isDrawerOpen
                    ? "opacity-100 pointer-events-auto"
                    : "opacity-0 pointer-events-none"
                    }`}
                onClick={handleCloseDrawer}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

                {/* Drawer */}
                <aside
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Day ${drawerDay} programs`}
                    className={`
            absolute top-0 right-0 h-full
            w-full
            md:w-[40%]
            lg:w-[35%]
            xl:w-[30%]
            min-w-[380px]
            max-w-[650px]
            bg-white
            border-l border-slate-200
            shadow-2xl
            flex flex-col
            transition-transform duration-300 ease-out
            ${isDrawerOpen
                            ? "translate-x-0"
                            : "translate-x-full"
                        }
        `}
                >
                    {/* HEADER */}
                    <div className="sticky top-0 z-20 bg-white border-b border-slate-200">
                        <div className="flex items-start justify-between p-6">
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] font-semibold text-amber-600">
                                    Day Programs
                                </p>

                                <h2 className="mt-1 text-xl font-bold text-slate-900">
                                    {selectedMonthLabel} {drawerDay}, {selectedYear}
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    {(dayActivityMap[drawerDay] || []).length} Programs
                                </p>
                            </div>

                            <button
                                onClick={handleCloseDrawer}
                                className="p-2 rounded-xl cursor-pointer hover:bg-amber-100 transition"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="px-6 pb-4 flex flex-col gap-3">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    placeholder="Search programs..."
                                    className="
                            w-full
                            rounded-xl
                            border
                            border-slate-200
                            px-4
                            py-2.5
                            text-sm
                            focus:outline-none
                            focus:ring-2
                            focus:ring-amber-400
                        "
                                />

                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="
                                absolute
                                right-3
                                top-1/2
                                -translate-y-1/2
                                text-slate-400
                            "
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                                className="
                        rounded-xl
                        border
                        border-slate-200
                        px-4
                        py-2.5
                        text-sm
                        focus:outline-none
                        focus:ring-2
                        focus:ring-amber-400
                    "
                            >
                                {STATUS_OPTIONS.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* CONTENT */}
                    <div className="flex-1 overflow-y-auto">
                        {filteredActivities.length === 0 ? (
                            <div className="h-full flex items-center justify-center p-8">
                                <div className="text-center">
                                    <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />

                                    <h3 className="font-semibold text-slate-700">
                                        No Programs Found
                                    </h3>

                                    <p className="text-sm text-slate-500 mt-1">
                                        Add a new program or clear filters.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 space-y-4">
                                {filteredActivities.map((act) => (
                                    <div
                                        key={act.id}
                                        className="
                                bg-white
                                border
                                border-slate-200
                                rounded-2xl
                                p-4
                                hover:shadow-lg
                                transition-all
                            "
                                    >
                                        {/* Top */}
                                        <div className="flex justify-between gap-3">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-slate-800">
                                                    {act.title}
                                                </h3>

                                                <p className="text-sm text-slate-500 mt-1">
                                                    {act.desc}
                                                </p>
                                            </div>

                                            <div className="flex items-start gap-2">
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                                    {act.status}
                                                </span>

                                                <button
                                                    onClick={() =>
                                                        handleDeleteActivity(act.id)
                                                    }
                                                    className="
                                            p-2
                                            rounded-lg
                                            text-slate-400
                                            hover:bg-red-50
                                            hover:text-red-500
                                        "
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="mt-4 space-y-2 text-sm text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} />
                                                {act.time}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <MapPin size={14} />
                                                {act.location}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Users size={14} />
                                                {act.client}
                                            </div>
                                        </div>

                                        {/* Attendance */}
                                        <div className="mt-4 pt-4 border-t border-slate-100">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-xs uppercase tracking-wide text-slate-500">
                                                    Attendance
                                                </span>

                                                <span
                                                    className={`text-xs px-2 py-1 rounded-full border ${STATUS_STYLE[
                                                        act.visitStatus
                                                    ] ||
                                                        STATUS_STYLE.Pending
                                                        }`}
                                                >
                                                    {act.visitStatus}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                {ATTEND_BUTTONS.map(
                                                    ({
                                                        label,
                                                        icon,
                                                        active,
                                                    }) => (
                                                        <button
                                                            key={label}
                                                            onClick={() =>
                                                                handleUpdateVisit(
                                                                    act.id,
                                                                    label
                                                                )
                                                            }
                                                            className={`
                                                    flex
                                                    items-center
                                                    justify-center
                                                    gap-2
                                                    rounded-xl
                                                    py-2
                                                    text-xs
                                                    font-medium
                                                    border
                                                    transition
                                                    ${act.visitStatus ===
                                                                    label
                                                                    ? active
                                                                    : "bg-white border-slate-200 hover:bg-slate-50"
                                                                }
                                                `}
                                                        >
                                                            {icon}
                                                            {label}
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* FOOTER */}
                    <div className="sticky bottom-0 bg-white border-t border-slate-200 p-5">
                        <button
                            onClick={() => {
                                handleCloseDrawer();
                                handleOpenModal(drawerDay);
                            }}
                            className="
                    w-full
                    flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-amber-600
                    hover:bg-amber-700
                    text-white
                    py-3
                    font-medium
                    transition
                "
                        >
                            <Plus size={18} />
                            Schedule New Program
                        </button>
                    </div>
                </aside>
            </div>

            {/* ── ADD PROGRAM MODAL ─────────────────────────────────────────────── */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                    onClick={e => e.target === e.currentTarget && setIsModalOpen(false)}
                >
                    <style>{`@keyframes _fis { from { opacity:0; transform:scale(.96) translateY(6px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
                    <div
                        className="bg-white rounded-lg max-w-md w-full border border-amber-100 shadow-2xl p-6 relative my-auto"
                        style={{ animation: "_fis 0.15s ease-out" }}
                    >
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 hover:bg-amber-50 p-1.5 rounded-xl transition-all cursor-pointer"
                            aria-label="Close modal"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="mb-5">
                            <h3 id="modal-title" className="text-lg font-bold text-slate-900">Schedule Quality Assessment</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Add a new ISO 21001 evaluation to the calendar.</p>
                        </div>

                        <form
                            onSubmit={handleAddEvent}
                            className="flex flex-col gap-4 text-xs text-slate-700"
                            style={{ fontFamily: "inherit" }}
                            noValidate
                        >
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="ev-day" className="block text-slate-500 font-bold mb-1 uppercase tracking-wider text-[10px]">Day</label>
                                    <input
                                        id="ev-day" type="number" min="1" max={monthDays.length} required
                                        value={newEvent.day}
                                        onChange={updateField("day")}
                                        className="w-full border border-amber-100 rounded-xl px-3 py-2 bg-[#FAF7F2]/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:bg-white text-sm transition-all"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="ev-type" className="block text-slate-500 font-bold mb-1 uppercase tracking-wider text-[10px]">Classification</label>
                                    <select
                                        id="ev-type" value={newEvent.type} onChange={updateField("type")}
                                        className="w-full border border-amber-100 rounded-xl px-3 py-2 bg-[#FAF7F2]/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:bg-white text-sm transition-all cursor-pointer"
                                    >
                                        {Object.keys(ACTIVITY_COLORS).map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="ev-title" className="block text-slate-500 font-bold mb-1 uppercase tracking-wider text-[10px]">Program Title *</label>
                                <input
                                    id="ev-title" type="text" placeholder="e.g. Registrar Compliance Audit" required
                                    value={newEvent.title} onChange={updateField("title")}
                                    className="w-full border border-amber-100 rounded-xl px-3 py-2 bg-[#FAF7F2]/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:bg-white text-sm transition-all"
                                />
                            </div>

                            <div>
                                <label htmlFor="ev-desc" className="block text-slate-500 font-bold mb-1 uppercase tracking-wider text-[10px]">Objective</label>
                                <textarea
                                    id="ev-desc" rows={2} placeholder="Describe the audit scope and objectives…"
                                    value={newEvent.desc} onChange={updateField("desc")}
                                    className="w-full border border-amber-100 rounded-xl px-3 py-2 bg-[#FAF7F2]/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:bg-white text-sm transition-all resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="ev-time" className="block text-slate-500 font-bold mb-1 uppercase tracking-wider text-[10px]">Time Window *</label>
                                    <input
                                        id="ev-time" type="text" placeholder="10:00 AM – 12:00 PM" required
                                        value={newEvent.time} onChange={updateField("time")}
                                        className="w-full border border-amber-100 rounded-xl px-3 py-2 bg-[#FAF7F2]/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:bg-white text-sm transition-all"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="ev-loc" className="block text-slate-500 font-bold mb-1 uppercase tracking-wider text-[10px]">Venue *</label>
                                    <input
                                        id="ev-loc" type="text" placeholder="Senate Hall B" required
                                        value={newEvent.location} onChange={updateField("location")}
                                        className="w-full border border-amber-100 rounded-xl px-3 py-2 bg-[#FAF7F2]/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:bg-white text-sm transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="ev-client" className="block text-slate-500 font-bold mb-1 uppercase tracking-wider text-[10px]">Academic Center *</label>
                                    <input
                                        id="ev-client" type="text" placeholder="Kathmandu Valley College" required
                                        value={newEvent.client} onChange={updateField("client")}
                                        className="w-full border border-amber-100 rounded-xl px-3 py-2 bg-[#FAF7F2]/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:bg-white text-sm transition-all"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="ev-status" className="block text-slate-500 font-bold mb-1 uppercase tracking-wider text-[10px]">Status</label>
                                    <select
                                        id="ev-status" value={newEvent.status} onChange={updateField("status")}
                                        className="w-full border border-amber-100 rounded-xl px-3 py-2 bg-[#FAF7F2]/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:bg-white text-sm transition-all cursor-pointer"
                                    >
                                        {STATUS_OPTIONS.filter(s => s !== "All").map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 mt-1">
                                <button
                                    type="button" onClick={() => setIsModalOpen(false)}
                                    className="border border-slate-200 text-slate-600 rounded-xl px-4 py-2.5 text-xs font-bold hover:bg-[#FAF7F2] active:scale-95 transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit" disabled={!canSubmit}
                                    className="bg-amber-700 hover:bg-amber-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-5 py-2.5 text-xs font-bold shadow-md shadow-amber-700/15 active:scale-95 transition-all cursor-pointer"
                                >
                                    Publish Audit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
