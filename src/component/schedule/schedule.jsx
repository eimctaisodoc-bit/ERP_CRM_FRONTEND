import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import Select from "react-select";
import {
    CheckCircle2, Clock, MapPin, ChevronLeft, ChevronRight, X, SlidersHorizontal,
    Upload, Calendar, ClipboardList, Flag, Building2, FileSpreadsheet, Edit3, Trash2, Plus, CalendarX, LoaderCircle
} from "lucide-react";

import { downloadHolidayExcel, useReadExcelFile, Dropstyle } from "../../data/data";
import { getMonthDays, getBsDisplayData } from "../staff/salespipeline/calendar";
import JobAssignModal from "./scheduleform";
import ScheduleDrawer from "./scheduleDrawer";
import { UseAdd } from "../hooks/useadd";
import { Skeleton } from "../skeleton";
import { ErrorNotify, SuccessNotify, waitingNotify } from "../hotToaster";
import SmallAmberToggle from "../admin/scheduling/toogle";

// ─── Design tokens (one place for spacing, sizing, radius) ────────────────────
const fontLight = { fontFamily: "'Roboto Slab', serif", fontWeight: 300 };
const fontBold = { fontFamily: "'Roboto Slab', serif", fontWeight: 700 };

const T = {
    focus: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50",
    control: "h-10 rounded-xl border border-slate-200 bg-white shadow-2xs",          // every header control
    controlBtn: "inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 active:scale-[0.98]",
    primaryBtn: "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.98]",
    label: "text-[11px] uppercase tracking-widest text-slate-400",
    card: "rounded-2xl border border-slate-200 bg-white shadow-2xs",
    gridGap: "gap-1.5 sm:gap-2 lg:gap-3",                                              // identical for header row + day grid
};

const YEAR_OPTIONS = [2080, 2081, 2082, 2083, 2084];
const CALENDAR_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const ACTIVITY_DOT = {
    Audit: "bg-emerald-500", Review: "bg-blue-500", Training: "bg-amber-500", Document: "bg-orange-500", Other: "bg-slate-500",
};
const ACTIVITY_LIGHT = {
    Audit: "bg-emerald-50 text-emerald-900 border-emerald-200",
    Review: "bg-blue-50 text-blue-900 border-blue-200",
    Training: "bg-amber-50 text-amber-900 border-amber-300",
    Document: "bg-orange-50 text-orange-900 border-orange-200",
    Other: "bg-slate-50 text-slate-900 border-slate-200",
};
const DEFAULT_LIGHT = "bg-emerald-50 text-emerald-900 border-emerald-200";

const isCroRole = (role) => String(role || "").toLowerCase() === "cro";
const pad = (n) => String(n).padStart(2, "0");

const getEnglishDay = (cell) => {
    if (cell.adDate) {
        const d = new Date(cell.adDate);
        if (!isNaN(d.getTime())) return d.getDate();
    }
    return cell.adDay || cell.enDay || "";
};

const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
    useEffect(() => {
        const mq = window.matchMedia(query);
        const onChange = (e) => setMatches(e.matches);
        setMatches(mq.matches);
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, [query]);
    return matches;
};

const getHolidayNames = (cell) =>
    cell.customHolidayName ? (Array.isArray(cell.customHolidayName) ? cell.customHolidayName : [cell.customHolidayName]) : [];

// ─── Main component ───────────────────────────────────────────────────────────
export const Schedule = ({
    onClose,
    INITIAL_ACTIVITIES: initialActivities = [],
    HOLIDAYS: initialHolidays = [],
    companyOptions: providedCompanyOptions,
    jobRole = "",
    authoritative = {},
}) => {
    const isCRO = isCroRole(jobRole);
    const isDesktop = useMediaQuery("(min-width: 768px)");   // md: full cells + modal. Below: compact cells + day agenda
    const isWide = useMediaQuery("(min-width: 1280px)");     // xl: 3 task chips per cell, otherwise 2
    const maxChips = isWide ? 3 : 2;

    const { Office_uploadHoliday, saveOfficeHoliday } = UseAdd({ isEnabled: isCRO });

    const [activities, setActivities] = useState(initialActivities);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [, setJobCardActivity] = useState(null);
    const [activeLegendFilter, setLegendFilter] = useState(null);
    const [filterValue, setFilterValue] = useState({ label: "All", value: "All" });
    const [isOn, setIsOn] = useState(false);
    const handleToggle = useCallback((v) => setIsOn(v), []);

    const organizationSelectOptions = useMemo(() => {
        const options = Array.isArray(providedCompanyOptions) ? providedCompanyOptions : [];
        return options.some((o) => o.value === "All") ? options : [{ label: "All", value: "All" }, ...options];
    }, [providedCompanyOptions]);

    const filteredActivities = useMemo(() => {
        if (!filterValue || filterValue.value === "All") return activities;
        return activities.filter((a) => {
            const orgId = a.organizationId ?? a.organization?._id;
            if (orgId != null) return String(orgId) === filterValue.value;
            return (a.client || a.organization?.organizationName) === filterValue.label;
        });
    }, [activities, filterValue]);

    // ── Holiday upload ──
    const fileInputRef = useRef(null);
    const uploadInProgressRef = useRef(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const { holidays: uploadedHolidays, loading: isUploading, error: uploadError, readExcelFile } = useReadExcelFile();
    const isBusy = isUploading || saveOfficeHoliday.isPending;

    const serverHolidays = Office_uploadHoliday.data?.data?.holidays;
    const serverHolidayRecord = Office_uploadHoliday.data?.data;
    const holidays = uploadedFile && !uploadError
        ? uploadedHolidays
        : Array.isArray(serverHolidays) ? serverHolidays : initialHolidays;

    const baseData = useMemo(() => getBsDisplayData(null, holidays), [holidays]);
    const { months, today } = baseData;
    const [selectedYear, setSelectedYear] = useState(today.bsYear);
    const [selectedMonth, setSelectedMonth] = useState(today.bsMonthIndex);
    const [selectedDay, setSelectedDay] = useState(today.bsDate);

    const yearOptions = useMemo(
        () => (YEAR_OPTIONS.includes(selectedYear) ? YEAR_OPTIONS : [...YEAR_OPTIONS, selectedYear].sort()),
        [selectedYear]
    );

    // ── Drag selection (desktop) ──
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState(null);
    const [dragEnd, setDragEnd] = useState(null);
    const [selectedRange, setSelectedRange] = useState({ fromDate: "", toDate: "" });
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (Office_uploadHoliday.isError) {
            ErrorNotify(
                Office_uploadHoliday.error?.response?.data?.message ||
                Office_uploadHoliday.error?.message ||
                "Failed to load holidays"
            );
        }
    }, [Office_uploadHoliday.isError, Office_uploadHoliday.error]);

    const openRange = useCallback((from, to) => {
        const m = pad(selectedMonth + 1);
        setSelectedRange({ fromDate: `${selectedYear}-${m}-${pad(from)}`, toDate: `${selectedYear}-${m}-${pad(to)}` });
        setSelectedDay(from);
        setIsModalOpen(true);
    }, [selectedYear, selectedMonth]);

    useEffect(() => {
        if (!isDragging) return;
        const finish = () => {
            setIsDragging(false);
            if (dragStart == null) return;
            const end = dragEnd ?? dragStart;
            openRange(Math.min(dragStart, end), Math.max(dragStart, end));
        };
        const cancel = (e) => {
            if (e.key === "Escape") { setIsDragging(false); setDragStart(null); setDragEnd(null); }
        };
        window.addEventListener("mouseup", finish);
        window.addEventListener("keydown", cancel);
        return () => {
            window.removeEventListener("mouseup", finish);
            window.removeEventListener("keydown", cancel);
        };
    }, [isDragging, dragStart, dragEnd, openRange]);

    const closeAssignPanel = () => { setIsModalOpen(false); setDragStart(null); setDragEnd(null); };

    const triggerFileUpload = () => {
        if (uploadInProgressRef.current || isBusy) return;
        fileInputRef.current?.click();
    };

    const handleFileSelect = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file || uploadInProgressRef.current || isBusy) return;

        uploadInProgressRef.current = true;
        setUploadedFile(file);
        try {
            const importedHolidays = await readExcelFile(file);
            if (importedHolidays.length === 0) {
                setUploadedFile(null);
                ErrorNotify("The selected file contains no valid holidays.");
                return;
            }
            const selectedAuthorityId = typeof authoritative === "string" ? authoritative : authoritative?._id;
            const authorities = Array.isArray(serverHolidayRecord?.authoritative) ? serverHolidayRecord.authoritative : [];
            const uniqueAuthorities = [];
            const seen = new Set();
            [...authorities, ...(selectedAuthorityId ? [selectedAuthorityId] : [])].forEach((entry) => {
                const id = typeof entry === "string" ? entry : entry?._id;
                if (id && seen.has(String(id))) return;
                if (id) seen.add(String(id));
                uniqueAuthorities.push(entry);
            });

            waitingNotify("Saving holiday calendar...");
            await saveOfficeHoliday.mutateAsync({
                ...(serverHolidayRecord?._id ? { _id: serverHolidayRecord._id } : {}),
                holidays: importedHolidays,
                authoritative: uniqueAuthorities,
                lastUpdated: [new Date().toISOString()],
                updatedBy: selectedAuthorityId || null,
                remarks: "Holiday calendar imported",
            });
            SuccessNotify("Holiday calendar saved successfully.");
        } catch (error) {
            setUploadedFile(null);
            ErrorNotify(error?.response?.data?.message || error?.message || "Failed to save holiday calendar");
        } finally {
            uploadInProgressRef.current = false;
        }
    };

    const handleDeleteEvent = (activityId) => {
        setActivities((prev) => prev.filter((a) => a.id !== activityId));
        setSelectedActivity(null);
    };

    // ── Calendar data ──
    const monthDays = useMemo(() => {
        const isCurrent = selectedYear === today.bsYear && selectedMonth === today.bsMonthIndex;
        return getMonthDays(selectedYear, selectedMonth, isCurrent ? today.bsDate : null, holidays);
    }, [selectedYear, selectedMonth, today.bsYear, today.bsMonthIndex, today.bsDate, holidays]);

    const calendarGrid = useMemo(() => {
        if (!monthDays.length) return [];
        const blanks = Array.from({ length: monthDays[0].dayIndex }, (_, i) => ({ _blank: true, key: `blank-${i}` }));
        return [...blanks, ...monthDays];
    }, [monthDays]);

    const dayActivityMap = useMemo(() => {
        const map = {};
        filteredActivities.forEach((a) => {
            const startStr = a.Fromdate || a.date;
            const endStr = a.toDate || startStr;
            if (!startStr) return;
            const [sY, sM, sD] = startStr.split("-").map(Number);
            const [eY, eM, eD] = endStr.split("-").map(Number);
            if (sY === eY && sM === eM) {
                for (let d = sD; d <= eD; d++) (map[`${sY}-${pad(sM)}-${pad(d)}`] ??= []).push(a);
            } else {
                (map[startStr] ??= []).push(a);
                if (startStr !== endStr) (map[endStr] ??= []).push(a);
            }
        });
        return map;
    }, [filteredActivities]);

    const monthPrefix = `${selectedYear}-${pad(selectedMonth + 1)}-`;
    const monthTaskCount = useMemo(
        () => Object.entries(dayActivityMap).reduce((n, [k, v]) => (k.startsWith(monthPrefix) ? n + v.length : n), 0),
        [dayActivityMap, monthPrefix]
    );

    // ── Navigation ──
    const handlePrevMonth = useCallback(() => {
        if (selectedMonth === 0) { setSelectedYear((y) => y - 1); setSelectedMonth(11); } else setSelectedMonth(selectedMonth - 1);
        setSelectedDay(null);
    }, [selectedMonth]);
    const handleNextMonth = useCallback(() => {
        if (selectedMonth === 11) { setSelectedYear((y) => y + 1); setSelectedMonth(0); } else setSelectedMonth(selectedMonth + 1);
        setSelectedDay(null);
    }, [selectedMonth]);
    const handleJumpToToday = useCallback(() => {
        setSelectedYear(today.bsYear); setSelectedMonth(today.bsMonthIndex); setSelectedDay(today.bsDate);
    }, [today]);
    const handleMonthSelectChange = useCallback((e) => { setSelectedMonth(Number(e.target.value)); setSelectedDay(null); }, []);
    const handleYearSelectChange = useCallback((e) => { setSelectedYear(Number(e.target.value)); setSelectedDay(null); }, []);

    const currentMonthLabel = months.find((m) => m.monthIndex === selectedMonth)?.label ?? "";

    // Mobile agenda data
    const agendaCell = monthDays.find((c) => c.date === selectedDay);
    const agendaEvents = selectedDay ? dayActivityMap[`${monthPrefix}${pad(selectedDay)}`] || [] : [];
    const agendaHolidays = agendaCell ? getHolidayNames(agendaCell) : [];
    const agendaIsHoliday = agendaCell ? agendaHolidays.length > 0 || agendaCell.isHoliday : false;

    return (
        <div className="min-h-screen w-full overflow-x-hidden bg-white pb-8 text-slate-800 antialiased sm:pb-12" style={fontLight}>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #94a3b8; }
                @media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
            `}</style>

            <main className="mx-auto w-full max-w-400">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md sm:rounded-3xl">

                    {/* ── Header: row 1 = title + navigation, row 2 = filters & tools ── */}
                    <header className="border-b border-slate-100 bg-white md:sticky md:top-0 md:z-30 md:bg-white/95 md:backdrop-blur-md">
                        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
                            <h1 style={fontBold} className="flex min-w-0 items-center gap-2.5 text-lg tracking-tight text-slate-900 sm:text-xl">
                                <Calendar className="h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
                                <span className="truncate" aria-live="polite">{currentMonthLabel} {selectedYear}</span>
                            </h1>

                            <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-2.5">
                                <button type="button" onClick={handleJumpToToday} style={fontBold} className={`${T.controlBtn} ${T.focus}`}>
                                    Today
                                </button>

                                <div className={`${T.control} flex min-w-0 flex-1 items-center justify-center gap-1.5 px-3 focus-within:ring-2 focus-within:ring-amber-500/30 sm:flex-none`}>
                                    <select aria-label="Select month" value={selectedMonth} onChange={handleMonthSelectChange} style={fontBold}
                                        className="min-w-0 cursor-pointer bg-transparent text-sm text-slate-800 outline-none">
                                        {months.map((m) => <option key={m.monthIndex} value={m.monthIndex}>{m.label}</option>)}
                                    </select>
                                    <span className="select-none text-slate-300" aria-hidden="true">/</span>
                                    <select aria-label="Select year" value={selectedYear} onChange={handleYearSelectChange} style={fontBold}
                                        className="cursor-pointer bg-transparent text-sm text-slate-800 outline-none">
                                        {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>

                                <div className={`${T.control} flex shrink-0 items-center divide-x divide-slate-200 overflow-hidden`}>
                                    <button type="button" aria-label="Previous month" onClick={handlePrevMonth}
                                        className={`flex h-full w-10 cursor-pointer items-center justify-center text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 ${T.focus}`}>
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <button type="button" aria-label="Next month" onClick={handleNextMonth}
                                        className={`flex h-full w-10 cursor-pointer items-center justify-center text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 ${T.focus}`}>
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>

                                {onClose && (
                                    <button type="button" aria-label="Close calendar" onClick={onClose}
                                        className={`${T.control} flex w-10 shrink-0 cursor-pointer items-center justify-center text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40`}>
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Row 2: toggle | organization filter | CRO tools */}
                        <div className="grid grid-cols-1 items-center gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-3 sm:px-6 md:grid-cols-[auto_minmax(0,26rem)_1fr]">
                            {isCRO && <input type="file" accept=".xlsx,.xls,.csv" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />}

                            <div className={`${T.control} flex items-center justify-between gap-3 px-3.5`}>
                                <span style={fontBold} className="text-sm text-slate-700">My schedule</span>
                                <SmallAmberToggle checked={isOn} onChange={handleToggle} ariaLabel="Show only my schedule" />
                            </div>

                            <div className="min-w-0">
                                <Select
                                    options={organizationSelectOptions}
                                    styles={Dropstyle("40px", "13px", isOn)}
                                    onChange={(v) => setFilterValue(v ?? { label: "All", value: "All" })}
                                    value={filterValue}
                                    placeholder="Filter by organization..."
                                    className={`${isOn ? "cursor-not-allowed" : "cursor-pointer"} w-full text-sm`}
                                    isClearable
                                    isDisabled={isOn}
                                    aria-label="Filter schedule by organization"
                                />
                            </div>

                            {isCRO && (
                                <div className="grid grid-cols-2 gap-2 md:flex md:justify-end">
                                    <button type="button" onClick={downloadHolidayExcel} style={fontBold} className={`${T.controlBtn} ${T.focus}`}>
                                        <FileSpreadsheet className="h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
                                        Template
                                    </button>
                                    <button type="button" onClick={triggerFileUpload} disabled={isBusy} style={fontBold}
                                        className={`${T.primaryBtn} h-10 px-3.5 text-xs ${T.focus} ${isBusy ? "cursor-not-allowed !bg-blue-400" : ""}`}>
                                        {isBusy
                                            ? <LoaderCircle className="h-3.5 w-3.5 animate-spin text-white" strokeWidth={2.5} />
                                            : <Upload className="h-4 w-4 shrink-0" aria-hidden="true" />}
                                        {isBusy ? "Importing..." : "Import data"}
                                    </button>
                                </div>
                            )}
                        </div>

                        {(Office_uploadHoliday.isError || uploadError) && (
                            <div className="border-t border-red-100 bg-red-50 px-4 py-2.5 sm:px-6" role="alert">
                                {Office_uploadHoliday.isError && (
                                    <p className="text-xs font-medium text-red-700 sm:text-sm">
                                        {Office_uploadHoliday.error?.response?.data?.message || Office_uploadHoliday.error?.message || "Failed to load holidays"}
                                    </p>
                                )}
                                {uploadError && <p className="text-xs font-medium text-red-700 sm:text-sm">{uploadError}</p>}
                            </div>
                        )}
                    </header>

                    {/* ── Calendar ── */}
                    <section className="px-3 py-4 sm:p-6" aria-label="Monthly calendar">
                        {Office_uploadHoliday.isLoading ? (
                            <div aria-busy="true" aria-label="Loading holiday calendar">
                                <div className={`mb-2 grid grid-cols-7 ${T.gridGap}`}>
                                    {CALENDAR_DAYS.map((d) => <Skeleton key={d} className="h-5 rounded-full" />)}
                                </div>
                                <div className={`grid grid-cols-7 ${T.gridGap}`}>
                                    {Array.from({ length: 35 }, (_, i) => <Skeleton key={i} className="h-16 rounded-lg sm:h-20 md:h-36 md:rounded-2xl lg:h-40" />)}
                                </div>
                            </div>
                        ) : (
                            <>
                                <p className="mb-3 text-xs text-slate-500">
                                    {!isDesktop ? "Tap a day to see its tasks."
                                        : isCRO ? "Click a day, or drag across days, to assign a job. Press Esc to cancel a drag."
                                            : "Click a day to see its tasks."}
                                </p>

                                {/* Weekday header shares the exact grid + gap of the day grid, so columns always line up */}
                                <div role="grid" aria-label={`${currentMonthLabel} ${selectedYear}`}>
                                    <div className={`mb-2 grid grid-cols-7 ${T.gridGap}`} role="row">
                                        {CALENDAR_DAYS.map((d) => (
                                            <div key={d} role="columnheader" style={fontBold}
                                                className={`py-1.5 text-center text-[10px] tracking-wide sm:text-xs sm:uppercase sm:tracking-widest ${d === "Sat" ? "text-orange-600" : "text-slate-500"}`}>
                                                {d}
                                            </div>
                                        ))}
                                    </div>

                                    <div className={`grid grid-cols-7 select-none ${T.gridGap}`}>
                                        {calendarGrid.map((cell) => {
                                            if (cell._blank) return <div key={cell.key} className="rounded-lg bg-slate-50/50 md:rounded-2xl" aria-hidden="true" />;

                                            const fullDateStr = `${monthPrefix}${pad(cell.date)}`;
                                            const dayEvents = dayActivityMap[fullDateStr] || [];
                                            const isSelected = cell.date === selectedDay;
                                            const isToday = cell.isToday;
                                            const isSaturday = cell.dayIndex === 6;
                                            const holidaysRaw = getHolidayNames(cell);
                                            const isHoliday = holidaysRaw.length > 0 || cell.isHoliday;
                                            const matchesFilter = !activeLegendFilter || dayEvents.some((e) => e.type === activeLegendFilter);
                                            const englishDay = getEnglishDay(cell);
                                            const inDragRange = isDesktop && isDragging && dragStart !== null && dragEnd !== null &&
                                                cell.date >= Math.min(dragStart, dragEnd) && cell.date <= Math.max(dragStart, dragEnd);

                                            const visibleEvents = dayEvents.slice(0, maxChips);
                                            const hiddenCount = dayEvents.length - visibleEvents.length;

                                            const label = [
                                                `${currentMonthLabel} ${cell.date}`,
                                                isToday ? "today" : "",
                                                isHoliday ? `holiday: ${holidaysRaw.join(", ")}` : "",
                                                dayEvents.length ? `${dayEvents.length} ${dayEvents.length === 1 ? "task" : "tasks"}` : "no tasks",
                                            ].filter(Boolean).join(", ");

                                            // Desktop: open assign modal/drawer. Mobile: select the day and show its agenda below.
                                            const activate = () => {
                                                if (isDesktop) { setDragStart(null); openRange(cell.date, cell.date); }
                                                else setSelectedDay(cell.date);
                                            };

                                            const dateBadge = (size) =>
                                                (isSelected || inDragRange) && !isHoliday ? `${size} rounded-full bg-blue-600 text-white shadow-sm`
                                                    : isToday && !isHoliday ? `${size} rounded-full bg-amber-500 text-white shadow-sm ring-2 ring-amber-200 ring-offset-1`
                                                        : isHoliday ? `${size} text-red-700` : `${size} text-slate-800`;

                                            return (
                                                <div
                                                    key={`${selectedYear}-${selectedMonth}-${cell.date}`}
                                                    role="gridcell"
                                                    tabIndex={isHoliday && isDesktop ? -1 : 0}
                                                    aria-label={label}
                                                    aria-selected={isSelected}
                                                    aria-disabled={(isHoliday && isDesktop) || undefined}
                                                    onDragStart={(e) => e.preventDefault()}
                                                    onMouseDown={(e) => {
                                                        if (!isDesktop || isHoliday || e.button !== 0) return;
                                                        setIsDragging(true); setDragStart(cell.date); setDragEnd(cell.date);
                                                    }}
                                                    onMouseEnter={() => { if (isDragging && !isHoliday) setDragEnd(cell.date); }}
                                                    onClick={() => { if (!isDesktop) activate(); }}
                                                    onKeyDown={(e) => {
                                                        if (e.key !== "Enter" && e.key !== " ") return;
                                                        if (isHoliday && isDesktop) return;
                                                        e.preventDefault(); activate();
                                                    }}
                                                    className={`group relative flex min-h-16 min-w-0 flex-col overflow-hidden rounded-lg border p-1.5 transition-colors sm:min-h-20 md:min-h-36 md:rounded-2xl md:p-3 lg:min-h-40 ${T.focus}
                                                        ${isHoliday ? `border-red-300 bg-red-50/40 ${isDesktop ? "cursor-not-allowed" : "cursor-pointer"}`
                                                            : `cursor-pointer border-slate-200 hover:border-blue-400 md:hover:shadow-md ${isSaturday ? "bg-orange-50/30" : "bg-white"}`}
                                                        ${inDragRange && !isHoliday ? "z-20 border-blue-500 bg-blue-100/70 shadow-md" : ""}
                                                        ${isSelected && !isHoliday && !inDragRange ? "z-10 border-blue-500 bg-blue-50/50 ring-1 ring-blue-500" : ""}
                                                        ${isToday && !isSelected && !isHoliday && !inDragRange ? "z-10 border-amber-400 bg-amber-50/40 ring-1 ring-amber-400" : ""}
                                                        ${matchesFilter ? "" : "opacity-30"}`}
                                                >
                                                    {/* Cell header */}
                                                    <div className="flex items-start justify-between gap-1">
                                                        <div className="flex min-w-0 items-center gap-1.5 md:gap-2">
                                                            <span style={fontBold} className={`flex items-center justify-center text-sm transition-colors md:text-base ${dateBadge("h-6 w-6 md:h-8 md:w-8")}`}>
                                                                {cell.date}
                                                            </span>
                                                            {englishDay && (
                                                                <span className="hidden text-xs font-medium text-slate-400 sm:inline" title="English (AD) date">{englishDay}</span>
                                                            )}
                                                        </div>

                                                        {isDesktop && !isHoliday && isCRO && (
                                                            <button type="button"
                                                                onMouseDown={(e) => e.stopPropagation()}
                                                                onKeyDown={(e) => e.stopPropagation()}
                                                                onClick={(e) => { e.stopPropagation(); activate(); }}
                                                                style={fontBold}
                                                                aria-label={`Assign job on ${currentMonthLabel} ${cell.date}`}
                                                                className={`${T.primaryBtn} h-6 shrink-0 gap-1 rounded-md px-2 text-[11px] opacity-0 focus-visible:opacity-100 group-hover:opacity-100 ${T.focus}`}>
                                                                <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Assign
                                                            </button>
                                                        )}
                                                        {isDesktop && !isHoliday && !isCRO && dayEvents.length > 0 && (
                                                            <span className="shrink-0 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                                                                {dayEvents.length} {dayEvents.length === 1 ? "task" : "tasks"}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Cell body */}
                                                    {isDesktop ? (
                                                        <div className="mt-2 flex min-h-0 flex-1 flex-col justify-end gap-1.5">
                                                            {isHoliday && holidaysRaw.length > 0 && (
                                                                <span style={fontBold} title={holidaysRaw.join(", ")}
                                                                    className="block max-w-full truncate rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[11px] text-red-800">
                                                                    {holidaysRaw[0]}{holidaysRaw.length > 1 && ` +${holidaysRaw.length - 1}`}
                                                                </span>
                                                            )}
                                                            {visibleEvents.map((ev) => (
                                                                <button type="button" key={ev.id} title={ev.title}
                                                                    onMouseDown={(e) => e.stopPropagation()}
                                                                    onKeyDown={(e) => e.stopPropagation()}
                                                                    onClick={(e) => { e.stopPropagation(); setSelectedActivity(ev); }}
                                                                    className={`w-full cursor-pointer rounded-lg border px-2 py-1 text-left text-xs transition-shadow hover:shadow-md ${T.focus}
                                                                        ${ACTIVITY_LIGHT[ev.type] || DEFAULT_LIGHT}
                                                                        ${activeLegendFilter && ev.type !== activeLegendFilter ? "opacity-40" : ""}`}>
                                                                    <span style={fontBold} className="block truncate">{ev.title}</span>
                                                                </button>
                                                            ))}
                                                            {hiddenCount > 0 && (
                                                                <button type="button"
                                                                    onMouseDown={(e) => e.stopPropagation()}
                                                                    onKeyDown={(e) => e.stopPropagation()}
                                                                    onClick={(e) => { e.stopPropagation(); activate(); }}
                                                                    style={fontBold}
                                                                    className={`cursor-pointer rounded-md px-1.5 py-0.5 text-left text-[11px] text-blue-700 hover:bg-blue-50 ${T.focus}`}>
                                                                    +{hiddenCount} more
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="mt-auto flex flex-wrap items-center gap-0.5 pt-1">
                                                            {isHoliday && <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden="true" />}
                                                            {dayEvents.slice(0, 3).map((ev) => (
                                                                <span key={ev.id} className={`h-1.5 w-1.5 rounded-full ${ACTIVITY_DOT[ev.type] || "bg-emerald-500"}`} aria-hidden="true" />
                                                            ))}
                                                            {dayEvents.length > 3 && <span className="text-[9px] leading-none text-slate-500">+{dayEvents.length - 3}</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Mobile day agenda (replaces hover/drag interactions on touch screens) */}
                                {!isDesktop && selectedDay && (
                                    <div className={`${T.card} mt-4 p-4`} aria-live="polite">
                                        <div className="flex items-center justify-between gap-3">
                                            <h2 style={fontBold} className="min-w-0 truncate text-base text-slate-900">
                                                {currentMonthLabel} {selectedDay}, {selectedYear}
                                            </h2>
                                            {!agendaIsHoliday && (
                                                <button type="button"
                                                    onClick={() => openRange(selectedDay, selectedDay)}
                                                    style={fontBold}
                                                    className={`${T.primaryBtn} h-9 shrink-0 px-3 text-xs ${T.focus}`}>
                                                    {isCRO ? <><Plus className="h-4 w-4" aria-hidden="true" /> Assign job</> : "Open day"}
                                                </button>
                                            )}
                                        </div>

                                        {agendaHolidays.length > 0 && (
                                            <p style={fontBold} className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                                                Holiday: {agendaHolidays.join(", ")}
                                            </p>
                                        )}

                                        {agendaEvents.length > 0 ? (
                                            <ul className="mt-3 flex flex-col gap-2">
                                                {agendaEvents.map((ev) => (
                                                    <li key={ev.id}>
                                                        <button type="button" onClick={() => setSelectedActivity(ev)}
                                                            className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-left ${T.focus} ${ACTIVITY_LIGHT[ev.type] || DEFAULT_LIGHT}`}>
                                                            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${ACTIVITY_DOT[ev.type] || "bg-emerald-500"}`} aria-hidden="true" />
                                                            <span className="min-w-0 flex-1">
                                                                <span style={fontBold} className="block truncate text-sm">{ev.title}</span>
                                                                {ev.client && <span className="block truncate text-xs opacity-80">{ev.client}</span>}
                                                            </span>
                                                            <ChevronRight className="h-4 w-4 shrink-0 opacity-60" aria-hidden="true" />
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            !agendaIsHoliday && <p className="mt-3 text-sm text-slate-500">No tasks on this day.</p>
                                        )}
                                    </div>
                                )}

                                {/* Empty month state */}
                                {monthTaskCount === 0 && (
                                    <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-500">
                                        <CalendarX className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
                                        <span>No tasks scheduled in {currentMonthLabel} {selectedYear}{filterValue?.value !== "All" ? " for this organization" : ""}.</span>
                                    </div>
                                )}

                                {/* Legend / filter */}
                                <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:pt-5">
                                    <span style={fontBold} className="flex items-center gap-2 text-xs uppercase tracking-widest text-slate-500">
                                        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" /> Filter by type
                                    </span>
                                    <div className="flex flex-wrap gap-2 sm:justify-end" role="group" aria-label="Filter tasks by type">
                                        {Object.entries(ACTIVITY_DOT).map(([name, cls]) => {
                                            const active = activeLegendFilter === name;
                                            return (
                                                <button type="button" key={name} aria-pressed={active}
                                                    onClick={() => setLegendFilter(active ? null : name)}
                                                    style={fontBold}
                                                    className={`flex h-9 cursor-pointer items-center gap-2 rounded-full border px-3.5 text-xs transition-colors ${T.focus}
                                                        ${active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"}`}>
                                                    <span className={`h-2.5 w-2.5 rounded-full ${cls}`} aria-hidden="true" />{name}
                                                </button>
                                            );
                                        })}
                                        {activeLegendFilter && (
                                            <button type="button" onClick={() => setLegendFilter(null)} style={fontBold}
                                                className={`h-9 cursor-pointer rounded-full px-3 text-xs text-slate-500 hover:text-slate-800 hover:underline ${T.focus}`}>
                                                Clear filter
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </section>
                </div>
            </main>

            {isCRO ? (
                <JobAssignModal
                    isOpen={isModalOpen}
                    onClose={closeAssignPanel}
                    selectedCompany={filterValue}
                    isMe={isOn}
                    fromDate={selectedRange.fromDate}
                    toDate={selectedRange.toDate}
                />
            ) : (
                <ScheduleDrawer
                    isOpen={isModalOpen}
                    onClose={closeAssignPanel}
                    fromDate={selectedRange.fromDate}
                    toDate={selectedRange.toDate}
                    activities={filteredActivities}
                />
            )}

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

// ─── Task details modal (bottom sheet on mobile, centered dialog from sm) ─────
const DetailRow = ({ icon: Icon, iconClass, label, children }) => (
    <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconClass}`} aria-hidden="true" />
        <div className="min-w-0">
            <span style={fontBold} className={`mb-1 block ${T.label}`}>{label}</span>
            <span style={fontBold} className="block break-words text-sm text-slate-900">{children}</span>
        </div>
    </div>
);

const TasksModal = ({ isOpen, onClose, act, onOpenJobCard, onDelete }) => {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const closeRef = useRef(null);

    useEffect(() => { setConfirmDelete(false); }, [act?.id, isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        closeRef.current?.focus();
        const onKey = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    if (!isOpen || !act) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" style={fontLight}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
            <div role="dialog" aria-modal="true" aria-labelledby="task-modal-title"
                className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-slate-50 shadow-2xl sm:rounded-3xl">

                <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-6 sm:py-5">
                    <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-sm sm:h-12 sm:w-12 ${ACTIVITY_LIGHT[act.type] || DEFAULT_LIGHT}`}>
                            <Flag className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                            <h3 id="task-modal-title" style={fontBold} className="break-words text-lg leading-tight text-slate-900 sm:text-xl">{act.title}</h3>
                            {act.desc && <p className="mt-1 break-words text-sm text-slate-500">{act.desc}</p>}
                        </div>
                    </div>
                    <button ref={closeRef} type="button" onClick={onClose} aria-label="Close"
                        className={`flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800 ${T.focus}`}>
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="custom-scrollbar flex-1 overflow-y-auto p-4 sm:p-6">
                    <div className="grid gap-4">
                        <div className={`${T.card} grid grid-cols-2 gap-4 p-5`}>
                            <div>
                                <span style={fontBold} className={`mb-1.5 block ${T.label}`}>Type</span>
                                <div className="flex items-center gap-2">
                                    <span className={`h-2.5 w-2.5 rounded-full ${ACTIVITY_DOT[act.type] || "bg-emerald-500"}`} aria-hidden="true" />
                                    <span style={fontBold} className="text-sm text-slate-800">{act.type || "N/A"}</span>
                                </div>
                            </div>
                            <div>
                                <span style={fontBold} className={`mb-1.5 block ${T.label}`}>Status</span>
                                <span style={fontBold} className="flex items-center gap-1.5 text-sm text-slate-800">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" /> {act.status || "N/A"}
                                </span>
                            </div>
                        </div>

                        <div className={`${T.card} flex flex-col gap-5 p-5`}>
                            <DetailRow icon={Building2} iconClass="text-blue-600" label="Institution / client">{act.client || "N/A"}</DetailRow>
                            <DetailRow icon={MapPin} iconClass="text-amber-500" label="Location">{act.location || "N/A"}</DetailRow>
                            <div className="border-t border-slate-100 pt-5">
                                <DetailRow icon={Clock} iconClass="text-orange-500" label="Schedule">
                                    {act.Fromdate || act.date}{act.Fromtime ? ` (${act.Fromtime})` : ""}
                                    <span className="mx-2 text-slate-300" aria-label="to">→</span>
                                    {act.toDate || act.Fromdate || act.date}{act.toTime ? ` (${act.toTime})` : ""}
                                </DetailRow>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col-reverse items-stretch gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="flex items-center justify-center gap-2 sm:justify-start">
                        {confirmDelete ? (
                            <>
                                <span style={fontBold} className="text-sm text-red-700">Delete this task?</span>
                                <button type="button" onClick={() => onDelete(act.id)} style={fontBold}
                                    className={`h-9 cursor-pointer rounded-lg bg-red-600 px-3 text-xs text-white hover:bg-red-700 ${T.focus}`}>Delete</button>
                                <button type="button" onClick={() => setConfirmDelete(false)} style={fontBold}
                                    className={`h-9 cursor-pointer rounded-lg border border-slate-200 px-3 text-xs text-slate-700 hover:bg-slate-50 ${T.focus}`}>Keep</button>
                            </>
                        ) : (
                            <>
                                <button type="button" onClick={() => setConfirmDelete(true)} aria-label="Delete task" title="Delete task"
                                    className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-transparent text-red-500 transition-colors hover:border-red-200 hover:bg-red-50 ${T.focus}`}>
                                    <Trash2 className="h-4 w-4" />
                                </button>
                                <button type="button" onClick={onOpenJobCard} aria-label="Edit task" title="Edit task"
                                    className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-transparent text-blue-600 transition-colors hover:border-blue-200 hover:bg-blue-50 ${T.focus}`}>
                                    <Edit3 className="h-4 w-4" />
                                </button>
                            </>
                        )}
                    </div>

                    <button type="button" onClick={onOpenJobCard} style={fontBold} className={`${T.primaryBtn} h-11 px-6 text-sm ${T.focus}`}>
                        <ClipboardList className="h-4 w-4" aria-hidden="true" />
                        {act?.jobCard ? "Edit job card" : "Assign job"}
                    </button>
                </div>
            </div>
        </div>
    );
};