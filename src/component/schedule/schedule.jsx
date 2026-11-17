import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import Select from "react-select";
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



import { downloadHolidayExcel, useReadExcelFile, Dropstyle } from "../../data/data";

import { getMonthDays, getBsDisplayData } from "../staff/salespipeline/calendar";

import JobAssignModal from "./scheduleform";
import ScheduleDrawer from "./scheduleDrawer";
import { UseAdd } from "../hooks/useadd";
import { ComponentLoader } from "../loader";
import { ErrorNotify, SuccessNotify, waitingNotify } from "../hotToaster";
import SmallAmberToggle from "../admin/scheduling/toogle";


// ─── Typography & Theming Constants ───────────────────────────────────────────
const fontLight = { fontFamily: "'Roboto Slab', serif", fontWeight: 300 };
const fontBold = { fontFamily: "'Roboto Slab', serif", fontWeight: 700 };

const YEAR_OPTIONS = [2080, 2081, 2082, 2083, 2084];

// Multi-color Theme: Blue, Amber, Orange, White, Slate, Green (for tasks) 
const ACTIVITY_COLORS = {
    Today: "bg-amber-500",
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
const sampleToday = getBsDisplayData().today;
const formatSampleDate = (day) =>
    `${sampleToday.bsYear}-${String(sampleToday.bsMonthNumber).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
const nextSampleDay = Math.min(sampleToday.bsDate + 2, sampleToday.totalDaysInMonth);



// Helper to safely extract English Day (AD date) 
const getEnglishDay = (cell) => {
    if (cell.adDate) {
        const d = new Date(cell.adDate);
        if (!isNaN(d.getTime())) return d.getDate();
    }
    return cell.adDay || cell.enDay || "";
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const Schedule = ({
    onClose,
    INITIAL_ACTIVITIES: initialActivities = [],
    HOLIDAYS: initialHolidays = [],
    companyOptions: providedCompanyOptions,
    jobRole = "",
    authoritative = {}
}) => {

    const { Office_uploadHoliday, saveOfficeHoliday } = UseAdd({
        isEnabled: jobRole === "CRO" || jobRole === "cro" || jobRole === "Cro"
    });


    console.log('companyOptions', providedCompanyOptions);
    const [activities, setActivities] = useState(initialActivities);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [jobCardActivity, setJobCardActivity] = useState(null);
    const [activeLegendFilter, setLegendFilter] = useState(null);
    const [filterValue, setFilterValue] = useState({ label: "All", value: "All" });
    const [isOn, setIsOn] = useState(false);

    const handleToggle = useCallback((newValue) => {
        setIsOn(newValue);
    }, []);

    const organizationSelectOptions = useMemo(() => {
        const options = Array.isArray(providedCompanyOptions)
            ? providedCompanyOptions
            : [];
        return options.some(option => option.value === "All")
            ? options
            : [{ label: "All", value: "All" }, ...options];
    }, [providedCompanyOptions]);

    // console.log("consultant", providedCompanyOptions);

    const filteredActivities = useMemo(() => {
        if (!filterValue || filterValue.value === "All") return activities;

        return activities.filter(activity => {
            const organizationId = activity.organizationId ?? activity.organization?._id;
            if (organizationId != null) return String(organizationId) === filterValue.value;
            return (activity.client || activity.organization?.organizationName) === filterValue.label;
        });
    }, [activities, filterValue]);

    const fileInputRef = useRef(null);
    const uploadInProgressRef = useRef(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const {
        holidays: uploadedHolidays,
        loading: isUploading,
        error: uploadError,
        readExcelFile,
    } = useReadExcelFile();

    console.log('holiday', uploadedHolidays)

    const serverHolidays = Office_uploadHoliday.data?.data?.holidays;
    const serverHolidayRecord = Office_uploadHoliday.data?.data;
    const holidays = uploadedFile && !uploadError
        ? uploadedHolidays
        : Array.isArray(serverHolidays)
            ? serverHolidays
            : initialHolidays;
    const baseData = useMemo(() => getBsDisplayData(null, holidays), [holidays]);
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

    useEffect(() => {
        if (Office_uploadHoliday.isError) {
            ErrorNotify(
                Office_uploadHoliday.error?.response?.data?.message
                || Office_uploadHoliday.error?.message
                || "Failed to load holidays"
            );
        }
    }, [Office_uploadHoliday.isError, Office_uploadHoliday.error]);

    const handleDeleteEvent = async (activityId) => {
        setActivities(prev => prev.filter(act => act.id !== activityId));
        setSelectedActivity(null);
    };

    const triggerFileUpload = () => {
        if (uploadInProgressRef.current || isUploading || saveOfficeHoliday.isPending) return;
        fileInputRef.current?.click();
    };

    const handleFileSelect = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file || uploadInProgressRef.current || isUploading || saveOfficeHoliday.isPending) return;

        uploadInProgressRef.current = true;
        setUploadedFile(file);

        try {
            const importedHolidays = await readExcelFile(file);
            if (importedHolidays.length === 0) {
                setUploadedFile(null);
                ErrorNotify("The selected file contains no valid holidays.");
                return;
            }

            const selectedAuthorityId = typeof authoritative === "string"
                ? authoritative
                : authoritative?._id;
            const authorities = Array.isArray(serverHolidayRecord?.authoritative)
                ? serverHolidayRecord.authoritative
                : [];
            const uniqueAuthorities = [];
            const seenAuthorityIds = new Set();
            [...authorities, ...(selectedAuthorityId ? [selectedAuthorityId] : [])].forEach((entry) => {
                const entryId = typeof entry === "string" ? entry : entry?._id;
                if (entryId && seenAuthorityIds.has(String(entryId))) return;
                if (entryId) seenAuthorityIds.add(String(entryId));
                uniqueAuthorities.push(entry);
            });

            const updatedAt = new Date().toISOString();
            waitingNotify("Saving holiday calendar...");
            await saveOfficeHoliday.mutateAsync({
                ...(serverHolidayRecord?._id ? { _id: serverHolidayRecord._id } : {}),
                holidays: importedHolidays,
                authoritative: uniqueAuthorities,
                lastUpdated: [updatedAt],
                updatedBy: selectedAuthorityId || null,
                remarks: "Holiday calendar imported",
            });
            SuccessNotify("Holiday calendar saved successfully.");
        } catch (error) {
            setUploadedFile(null);
            ErrorNotify(
                error?.response?.data?.message
                || error?.message
                || "Failed to save holiday calendar"
            );
        } finally {
            uploadInProgressRef.current = false;
        }
    };

    const monthDays = useMemo(() => {
        const isCurrentYearMonth = selectedYear === today.bsYear && selectedMonth === today.bsMonthIndex;
        return getMonthDays(selectedYear, selectedMonth, isCurrentYearMonth ? today.bsDate : null, holidays);
    }, [selectedYear, selectedMonth, today.bsYear, today.bsMonthIndex, today.bsDate, holidays]);

    const calendarGrid = useMemo(() => {
        if (!monthDays.length) return [];
        const offset = monthDays[0].dayIndex;
        const blanks = Array.from({ length: offset }, (_, i) => ({ _blank: true, key: `blank-${i}` }));
        return [...blanks, ...monthDays];
    }, [monthDays]);

    const dayActivityMap = useMemo(() => {
        const map = {};
        filteredActivities.forEach(a => {
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
    }, [filteredActivities]);

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
            className="min-h-screen w-full overflow-x-hidden bg-white pb-12 text-slate-800 antialiased sm:pb-16 select-none"
            style={fontLight}
            onMouseUp={() => {
                if (isDragging) handleMouseUp(dragEnd, false);
            }}
        >
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #94a3b8; }
            `}</style>

            <main className="mx-auto w-full max-w-400  ">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md sm:rounded-3xl">

                    {/* Header Controls */}
                    <div className="sticky top-0 z-30 flex flex-col gap-4 border-b border-slate-100 bg-white/95 backdrop-blur-md px-4 py-5 sm:px-6 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
                        <h1
                            style={fontBold}
                            className="flex items-center gap-2 text-lg sm:text-xl text-slate-900 tracking-tight"
                        >
                            <Calendar className="h-5 w-5 shrink-0 text-amber-600" />
                            {currentMonthLabel} {selectedYear}
                        </h1>

                        <div className="flex w-full flex-wrap items-center gap-2.5 sm:gap-3.5 lg:w-auto lg:justify-end">
                            {(jobRole === "CRO" || jobRole === "cro" || jobRole === "Cro") && (
                                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                            )}
                            <div className="flex h-10 w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3  sm:w-auto sm:justify-start">
                                <span style={fontBold} className="text-sm text-slate-700">Me</span>
                                <SmallAmberToggle
                                    checked={isOn}
                                    onChange={handleToggle}
                                    ariaLabel="Show only my schedule"
                                />
                            </div>
                            <div className="w-full min-w-0 sm:w-64 lg:w-72">
                                <Select
                                    options={organizationSelectOptions}
                                    styles={Dropstyle('40px', '13px', isOn)}
                                    onChange={setFilterValue}
                                    value={filterValue}
                                    placeholder="Search or filter organizations..."
                                    className={` ${isOn ? 'cursor-not-allowed' : 'cursor-pointer'} w-full text-sm`}
                                    isClearable
                                    isDisabled={isOn}
                                    aria-label="Filter schedule by organization"
                                />
                            </div>

                            {(jobRole === "CRO" || jobRole === "cro" || jobRole === "Cro") && (
                                <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 p-1 shadow-2xs">
                                    <button
                                        type="button"
                                        onClick={downloadHolidayExcel}
                                        style={fontBold}
                                        className="cursor-pointer h-10 px-3.5 flex items-center gap-2 bg-white rounded-lg text-xs text-slate-700 shadow-2xs border border-slate-200/80 hover:bg-slate-50 transition-all"
                                    >
                                        <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                                        <span className="hidden sm:inline-block">Template</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={triggerFileUpload}
                                        disabled={isUploading || saveOfficeHoliday.isPending}
                                        style={fontBold}
                                        className={`h-10 px-3.5 flex items-center gap-2 rounded-lg text-xs text-white shadow-sm transition-all ${isUploading || saveOfficeHoliday.isPending
                                            ? "bg-blue-400 cursor-not-allowed"
                                            : "bg-blue-600 hover:bg-blue-700 cursor-pointer active:scale-95"
                                            }`}
                                    >
                                        {isUploading || saveOfficeHoliday.isPending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Upload className="w-4 h-4" />
                                        )}

                                        <span className="hidden sm:inline-block">
                                            {isUploading
                                                ? "Reading file..."
                                                : saveOfficeHoliday.isPending
                                                    ? "Saving..."
                                                    : "Import Data"}
                                        </span>
                                    </button>
                                </div>
                            )}

                            {Office_uploadHoliday.isError && (
                                <p role="alert" className="w-full text-sm text-red-600 lg:w-auto">
                                    {Office_uploadHoliday.error?.response?.data?.message
                                        || Office_uploadHoliday.error?.message
                                        || "Failed to load holidays"}
                                </p>
                            )}

                            {uploadError && (
                                <p role="alert" className="w-full text-sm text-red-600 lg:w-auto">
                                    {uploadError}
                                </p>
                            )}

                            <button onClick={handleJumpToToday} style={fontBold} className="h-10 cursor-pointer rounded-xl border border-slate-200 bg-white px-4 text-xs text-slate-700 shadow-2xs transition-all hover:bg-slate-50 active:scale-95">Today</button>

                            <div className="flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 shadow-2xs">
                                <select value={selectedMonth} onChange={handleMonthSelectChange} style={fontBold} className="cursor-pointer bg-transparent text-sm text-slate-800 outline-none">
                                    {months.map(m => <option key={m.monthIndex} value={m.monthIndex}>{m.label}</option>)}
                                </select>
                                <span className="text-slate-300 font-light">/</span>
                                <select value={selectedYear} onChange={handleYearSelectChange} style={fontBold} className="cursor-pointer bg-transparent text-sm text-slate-800 outline-none">
                                    {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>

                            <div className="flex h-10 items-center rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
                                <button aria-label="Previous month" onClick={handlePrevMonth} className="h-full cursor-pointer rounded-lg px-2.5 text-slate-500 transition-colors hover:bg-slate-100"><ChevronLeft className="w-4 h-4" /></button>
                                <button aria-label="Next month" onClick={handleNextMonth} className="h-full cursor-pointer rounded-lg px-2.5 text-slate-500 transition-colors hover:bg-slate-100"><ChevronRight className="w-4 h-4" /></button>
                            </div>

                            {onClose && (
                                <button aria-label="Close calendar" onClick={onClose} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Calendar Grid Container */}
                    <div className="bg-white px-4 py-5 sm:p-6">
                        {Office_uploadHoliday.isLoading ? (
                            <div className="flex min-h-60 flex-col items-center justify-center gap-3" aria-busy="true" aria-live="polite">
                                <ComponentLoader />
                                <span className="text-sm text-slate-500">Loading holiday calendar...</span>
                            </div>
                        ) : (
                            <>
                                {/* Days Header */}
                                <div className="mb-3 grid min-w-200 grid-cols-7 gap-3">
                                    {CALENDAR_DAYS.map(d => (
                                        <div key={d} style={fontBold} className={`text-xs py-2 text-center uppercase tracking-widest ${d === "Sat" ? "text-orange-600 font-bold" : "text-slate-500"}`}>
                                            {d}
                                        </div>
                                    ))}
                                </div>

                                {/* Main Grid - Enhanced Larger Grid for Better Task Visibility */}
                                <div className="custom-scrollbar overflow-x-auto pb-4">
                                    <div className="grid min-w-200 grid-cols-7 gap-3">
                                        {calendarGrid.map((cell) => {
                                            if (cell._blank) return <div key={cell.key} className="min-h-38 rounded-2xl border border-transparent bg-slate-50/50 sm:min-h-44" aria-hidden="true" />;

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
                                                        min-h-38 flex flex-col rounded-2xl p-3 transition-all relative overflow-hidden group sm:min-h-44 sm:p-3.5
                                                        ${isHoliday ? "bg-red-50/20 cursor-not-allowed border-2 border-red-400" : "bg-white cursor-pointer border border-slate-200/90 hover:border-blue-500 hover:shadow-lg"}
                                                        ${inDragRange && !isHoliday ? "bg-blue-100/70 border-2 border-blue-500 shadow-md z-20" : ""}
                                                        ${isSelected && !isHoliday && !inDragRange ? "bg-blue-50/40 border-2 border-blue-500 shadow-sm z-10" : ""}
                                                        ${isToday && !isSelected && !isHoliday && !inDragRange ? "bg-amber-50/30 border-2 border-amber-400 shadow-sm z-10" : ""}
                                                        ${isDimmed ? "opacity-30" : "opacity-100"}
                                                    `}
                                                >
                                                    {/* Cell Header */}
                                                    <div className="flex items-start justify-between mb-2.5">
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                style={fontBold}
                                                                className={`text-base flex items-center justify-center transition-all 
                                                                    ${(isSelected || inDragRange) && !isHoliday ? "w-8 h-8 rounded-full bg-blue-600 text-white shadow-sm" :
                                                                        isToday && !isHoliday ? "w-8 h-8 rounded-full bg-amber-500 text-white shadow-md ring-2 ring-amber-200 ring-offset-1" :
                                                                            isHoliday ? "text-red-700 w-8 h-8 flex items-center justify-center" :
                                                                                "text-slate-800 w-8 h-8 flex items-center justify-center"}`}
                                                            >
                                                                {cell.date}
                                                            </span>

                                                            {englishDay && (
                                                                <span style={fontLight} className="text-xs text-slate-400 font-medium mt-0.5">
                                                                    {englishDay}
                                                                </span>
                                                            )}

                                                            {dayEvents.length > 0 && !isHoliday && (
                                                                <span className="relative flex h-2 w-2 ml-1 group-hover:hidden" title="Tasks Scheduled">
                                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                                </span>
                                                            )}
                                                        </div>

                                                        {!isHoliday && (jobRole === "CRO" || jobRole === "cro" || jobRole === "Cro") && (
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
                                                                className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:scale-95"
                                                            >
                                                                <Plus className="w-3.5 h-3.5" /> Assign
                                                            </button>
                                                        )}
                                                        {!isHoliday && !(jobRole === "CRO" || jobRole === "cro" || jobRole === "Cro") && (
                                                            <span
                                                                title={`${dayEvents.length} ${dayEvents.length === 1 ? "task" : "tasks"}`}
                                                                className="text-[11px] px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                {dayEvents.length} {dayEvents.length === 1 ? "task" : "tasks"}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Holiday Badge */}
                                                    {isHoliday && holidaysRaw.length > 0 && (
                                                        <div className="mt-auto flex items-center gap-1 pt-2">
                                                            <span
                                                                style={fontBold}
                                                                title={holidaysRaw.join(", ")}
                                                                className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[11px] text-red-800 shadow-2xs truncate max-w-full"
                                                            >
                                                                {holidaysRaw[0]}
                                                                {holidaysRaw.length > 1 && ` +${holidaysRaw.length - 1}`}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Tasks Container - Increased Max Height for Enhanced Grid View */}
                                                    <div className="mt-auto flex max-h-32 flex-col gap-1.5 overflow-y-auto custom-scrollbar pr-0.5">
                                                        {dayEvents.map(ev => (
                                                            <div
                                                                key={ev.id}
                                                                onMouseDown={(e) => e.stopPropagation()}
                                                                onMouseUp={(e) => e.stopPropagation()}
                                                                onClick={(e) => { e.stopPropagation(); setSelectedActivity(ev); }}
                                                                className={`
                                                                    cursor-pointer text-xs px-2.5 py-2 rounded-lg border shadow-2xs
                                                                    transition-transform hover:-translate-y-0.5 hover:shadow-md
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
                                {/* Filters Legend */}
                                <div className="mt-6 flex flex-col items-start justify-between gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:gap-4">
                                    <span style={fontBold} className="text-xs text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <SlidersHorizontal className="w-4 h-4 text-slate-500" /> Filter Categories
                                    </span>
                                    <div className="flex w-full flex-wrap gap-2.5 sm:w-auto sm:justify-end">
                                        {Object.entries(ACTIVITY_COLORS).map(([name, cls]) => {
                                            const active = activeLegendFilter === name;
                                            return (
                                                <button
                                                    key={name}
                                                    onClick={() => setLegendFilter(active ? null : name)}
                                                    style={fontBold}
                                                    className={`
                                                cursor-pointer flex items-center gap-2 px-3.5 py-2 rounded-full text-xs border transition-all shadow-2xs
                                                ${active ? "bg-slate-900 text-white border-slate-900 shadow-sm" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"}
                                            `}
                                                >
                                                    <span className={`w-2.5 h-2.5 rounded-full shadow-2xs ${cls}`} />{name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>

            {/* Modals */}
            {(jobRole === "CRO" || jobRole === "cro" || jobRole === "Cro") ? (
                <JobAssignModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setDragStart(null);
                        setDragEnd(null);
                    }}
                    selectedCompany={filterValue}
                    isMe={isOn}
                    fromDate={selectedRange.fromDate}
                    toDate={selectedRange.toDate}
                />
            ) : (
                <ScheduleDrawer
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setDragStart(null);
                        setDragEnd(null);
                    }}
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

// ─── Sub-Components ───────────────────────────────────────────────────────────

const TasksModal = ({ isOpen, onClose, act, onOpenJobCard, onDelete }) => {
    if (!isOpen || !act) return null;

    return (
        <div className="fixed inset-0 w-full h-full flex items-center justify-center z-50 p-4 transition-opacity" style={fontLight}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <div className="bg-slate-50 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col transform transition-all border border-slate-200">

                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-200 bg-white flex justify-between items-start gap-4">
                    <div className="flex items-start gap-4">
                        <div className={`mt-1 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm ${ACTIVITY_LIGHT[act.type] || 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
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
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs grid grid-cols-2 gap-4">
                            <div>
                                <span style={fontBold} className="text-[11px] text-slate-400 uppercase tracking-widest block mb-1.5">Type</span>
                                <div className="flex items-center gap-2">
                                    <span className={`w-2.5 h-2.5 rounded-full shadow-2xs ${ACTIVITY_COLORS[act.type] || 'bg-emerald-500'}`}></span>
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

                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col gap-5">
                            <div className="flex items-start gap-3">
                                <Building2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                <div>
                                    <span style={fontBold} className="text-[11px] text-slate-400 uppercase tracking-widest block mb-1">Institution / Client</span>
                                    <span style={fontBold} className="text-sm text-slate-900">{act.client || "N/A"}</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                    <span style={fontBold} className="text-[11px] text-slate-400 uppercase tracking-widest block mb-1">Location</span>
                                    <span style={fontBold} className="text-sm text-slate-900">{act.location || "N/A"}</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 pt-4 border-t border-slate-100">
                                <Clock className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
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
                        <button onClick={() => onDelete(act.id)} className="cursor-pointer p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-200" title="Delete Task">
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="cursor-pointer p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-transparent hover:border-blue-200" title="Edit Task">
                            <Edit3 className="w-4 h-4" />
                        </button>
                    </div>

                    <button type="button" onClick={onOpenJobCard} style={fontBold} className="cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm text-white shadow-md hover:bg-blue-700 transition-all active:scale-95">
                        <ClipboardList className="w-4 h-4" />
                        {act?.jobCard ? "Edit Job Card" : "Assign Job"}
                    </button>
                </div>
            </div>
        </div>
    );
};