import React, { useEffect, useMemo, useState } from "react";
import {
    CalendarDaysIcon,
    CalendarIcon,
    CalendarRangeIcon,
    LayersIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Select from "react-select";
import { ValidateStyle } from "../../../../../data/data";
import { getBsDisplayData, nepaliDays } from "./calendar";
import { ScheduleRemark } from "./scheduleRemark";
import JobAssignModal from "./scheduleform";

const timeFrames = [
    "09:00 - 09:30",
    "09:30 - 10:00",
    "10:00 - 10:30",
    "10:30 - 11:00",
    "11:00 - 11:30",
    "11:30 - 12:00",
    "12:00 - 12:30",
    "12:30 - 01:00",
    "01:00 - 01:30",
    "01:30 - 02:00",
    "02:00 - 02:30",
    "02:30 - 03:00",
    "03:00 - 03:30",
    "03:30 - 04:00",
    "04:00 - 04:30",
    "04:30 - 05:00",
    "05:00 - 05:30",
    "05:30 - 06:00",
];

const customHolidays = [
    { date: "2083-02-12", name: "New Year 2083" },
];

export const ClientScheduleCalendar = () => {
    // Pass customHolidays to the initial state
    const [calendarData, setCalendarData] = useState(() => getBsDisplayData(null, customHolidays));
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [hoveredGridId, setHoveredGridId] = useState(null);
    const [selectedMonthIndex, setSelectedMonthIndex] = useState(null);
    const [selectedWeekIndex, setSelectedWeekIndex] = useState(null);

    // Auto update by system date/time
    useEffect(() => {
        const timer = setInterval(() => {
            // Pass customHolidays to the interval update
            setCalendarData(getBsDisplayData(null, customHolidays));
        }, 60 * 1000);

        return () => clearInterval(timer);
    }, []);

    const {
        today,
        allMonthsWeeks,
        currentYear,
        currentMonth,
        currentWeek,
        currentDayInWeek,
    } = calendarData;

    const yearOptions = useMemo(() => {
        return [
            {
                value: today.bsYear,
                label: String(today.bsYear),
                year: today.bsYear,
            },
        ];
    }, [today.bsYear]);

    const monthOptions = useMemo(() => {
        return allMonthsWeeks.map((month) => ({
            value: month.monthIndex,
            label: month.monthName,
            monthName: month.monthName,
            monthIndex: month.monthIndex,
            monthNumber: month.monthNumber,
            totalDays: month.totalDays,
            isCurrentMonth: month.isCurrentMonth,
        }));
    }, [allMonthsWeeks]);

    const activeMonthIndex =
        selectedMonthIndex !== null ? selectedMonthIndex : today.bsMonthIndex;

    const selectedMonthData =
        allMonthsWeeks.find((month) => month.monthIndex === activeMonthIndex) ||
        allMonthsWeeks[0];

    const selectedMonthOption =
        monthOptions.find((month) => month.value === selectedMonthData?.monthIndex) ||
        null;

    const weekOptions = useMemo(() => {
        if (!selectedMonthData?.weeks) return [];

        return selectedMonthData.weeks.map((week) => ({
            value: week.weekIndex,
            label: `${week.weekName} (${week.range})`,
            range: week.range,
            weekName: week.weekName,
            weekIndex: week.weekIndex,
            monthName: week.monthName,
            monthIndex: week.monthIndex,
            monthNumber: week.monthNumber,
            totalDays: week.totalDays,
            isCurrentWeek: week.isCurrentWeek,
        }));
    }, [selectedMonthData]);

    const activeWeekIndex =
        selectedWeekIndex !== null
            ? selectedWeekIndex
            : selectedMonthData?.currentWeek?.weekIndex || 1;

    const rawSelectedWeekData =
        selectedMonthData?.weeks?.find(
            (week) => week.weekIndex === activeWeekIndex
        ) ||
        selectedMonthData?.weeks?.[0] ||
        null;

    const selectedWeekData = rawSelectedWeekData
        ? {
            ...rawSelectedWeekData,
            weeksDay: rawSelectedWeekData.weeksDay.map((dayItem) => {
                const year = today.bsYear;
                const month = selectedMonthData.monthNumber;
                const date = dayItem.date;
                const fullDate = `${year}-${String(month).padStart(2, "0")}-${String(date).padStart(2, "0")}`;

                return {
                    ...dayItem,
                    bsYear: year,
                    bsMonth: month,
                    bsMonthName: selectedMonthData.monthName,
                    bsDate: date,
                    fullDate,
                    dayName: dayItem.day,
                };
            }),
        }
        : null;

    const selectedWeekOption =
        weekOptions.find((week) => week.value === selectedWeekData?.weekIndex) ||
        null;

    const selectedWeekDays = selectedWeekData?.weeksDay || [];

    const handleMonthChange = (selectedOption) => {
        setSelectedMonthIndex(selectedOption?.value ?? null);
        setSelectedWeekIndex(null);
    };

    const handleWeekChange = (selectedOption) => {
        setSelectedWeekIndex(selectedOption?.value ?? null);
    };

    const handleGridClick = (dayItem, time) => {
        setAssignModalOpen(true);
    };

    return (
        <main className="min-h-screen bg-transparent py-4">
            <div className="w-full bg-transparent p-3">
                <ScheduleRemark />

                {/* Form Area */}
                <div className="mt-6 space-y-5">
                    <div className="flex items-center gap-2">
                        <span className="rounded bg-orange-50 p-2">
                            <CalendarDaysIcon size={14} className="text-orange-500" />
                        </span>
                        <span className="block font-['Roboto_Slab'] text-base font-semibold text-slate-800">
                            Year / Months / Weeks:
                        </span>
                    </div>

                    {/* Form Row */}
                    <div className="flex w-full flex-col items-end gap-3 md:flex-row md:justify-around">
                        {/* Year */}
                        <div className="w-full space-y-2 md:w-[140px]">
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                                <span className="rounded bg-amber-50 p-1.5">
                                    <CalendarIcon size={13} className="text-amber-500" />
                                </span>
                                Year
                            </label>

                            <Select
                                options={yearOptions}
                                value={yearOptions[0]}
                                styles={ValidateStyle(false, true, "40px")}
                                isDisabled={true}
                                isSearchable={false}
                                isClearable={false}
                            />
                        </div>

                        {/* Month */}
                        <div className="w-full space-y-2 md:w-[200px]">
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                                <span className="rounded bg-blue-50 p-1.5">
                                    <CalendarDaysIcon size={13} className="text-blue-500" />
                                </span>
                                Month
                            </label>

                            <Select
                                options={monthOptions}
                                value={selectedMonthOption}
                                placeholder="Select Month"
                                styles={ValidateStyle(false, false, "40px")}
                                isSearchable={false}
                                onChange={handleMonthChange}
                            />
                        </div>

                        {/* Week */}
                        <div className="w-full space-y-2 md:w-[180px]">
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                                <span className="rounded bg-orange-50 p-1.5">
                                    <CalendarRangeIcon size={13} className="text-orange-500" />
                                </span>
                                Week
                            </label>

                            <Select
                                options={weekOptions}
                                value={selectedWeekOption}
                                placeholder="Select Week"
                                styles={ValidateStyle(false, false, "40px")}
                                isSearchable={false}
                                onChange={handleWeekChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Calendar Table */}
                <div className="w-full overflow-x-auto rounded-lg border mt-3 border-slate-200">
                    <table className="w-full min-w-[900px] border-collapse text-sm">
                        <thead>
                            <tr className="bg-slate-900 text-white">
                                <th className="w-fit border w-[400px] border-slate-300 px-2 text-left font-semibold">
                                    TimeFrame
                                </th>

                                {selectedWeekDays.map((dayItem) => {
                                    const isDisabled = dayItem.isHoliday;

                                    return (
                                        <th
                                            key={`${selectedMonthData?.monthIndex}-${selectedWeekData?.weekIndex}-${dayItem.date}`}
                                            className={`
                                                border border-slate-300  p-1.5 text-center font-semibold
                                                ${isDisabled
                                                    ? "bg-red-700 text-white"
                                                    : dayItem.isToday
                                                        ? "bg-amber-500 text-slate-950"
                                                        : ""
                                                }
                                            `}
                                        >
                                            <div className="text-sm font-bold">
                                                {nepaliDays[(dayItem?.day) - 1]}
                                            </div>

                                            <div className="mt-1 flex flex-col items-center text-[10px] font-medium opacity-80">
                                                <span>Day {dayItem.day}</span>
                                                {/* Show custom holiday name in the header if it exists */}
                                                {dayItem.isCustomHoliday && (
                                                    <span className="text-[9px] text-red-200 mt-0.5 max-w-[100px] truncate leading-tight">
                                                        {dayItem.customHolidayName}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>

                        <tbody className="bg-white">
                            {timeFrames.map((time) => (
                                <tr
                                    key={time}
                                    className="group transition-all duration-200 hover:bg-slate-50/70"
                                >
                                    {/* Time Column */}
                                    <td className="w-15 border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-2 text-center align-center">
                                        <div className="-mt-1.5 text-md font-semibold tracking-wide text-slate-500 group-hover:text-slate-700">
                                            {time}
                                        </div>
                                    </td>

                                    {/* Calendar Grid Cells */}
                                    {selectedWeekDays.map((dayItem, idx) => {
                                        // Rely on the combined `isHoliday` flag from the updated utility
                                        const isDisabled = dayItem.isHoliday;

                                        const isHovered = hoveredGridId === `${time}-${selectedMonthData?.monthIndex}-${dayItem.date}`;
                                        const gridId = `${time}-${selectedMonthData?.monthIndex}-${dayItem.date}`;

                                        return (
                                            <td
                                                key={gridId}
                                                className={`
                                                    group relative h-20 border border-slate-100 p-1.5 align-center transition-all duration-200
                                                    ${isDisabled
                                                        ? "cursor-not-allowed bg-red-100 opacity-60"
                                                        : "cursor-pointer hover:bg-slate-50"
                                                    }
                                                `}
                                                onClick={() => {
                                                    if (!isDisabled) {
                                                        handleGridClick(dayItem, time);
                                                    }
                                                }}
                                                onMouseEnter={() =>
                                                    !isDisabled && setHoveredGridId(gridId)
                                                }
                                                onMouseLeave={() => setHoveredGridId(null)}
                                            >
                                                {/* Hover label */}
                                                {!isDisabled && isHovered && (
                                                    <span className="absolute left-1 bottom-1 text-[10px] font-medium text-slate-800">
                                                        + assign
                                                    </span>
                                                )}

                                                <div className="flex h-full w-full flex-col">
                                                    {/* Date Badge */}
                                                    <div className="flex items-center justify-between">
                                                        <span
                                                            className={`
                                                                flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-bold transition-all duration-200
                                                                ${isDisabled && dayItem.isToday
                                                                    ? "animate-pulse bg-red-700 text-white shadow-sm shadow-red-300" :
                                                                    isDisabled
                                                                        ? "bg-red-700 text-white shadow-sm shadow-red-200"
                                                                        : dayItem.isToday
                                                                            ? "bg-blue-500 text-white shadow-sm shadow-blue-200"
                                                                            : "bg-slate-200 text-slate-600 group-hover:bg-amber-50 group-hover:text-amber-700"
                                                                }
                                                            `}
                                                        >
                                                            {dayItem.date}
                                                            {isDisabled && (
                                                                <span className="ml-1 text-[9px] font-normal text-red-100 truncate max-w-[60px]">
                                                                    ({dayItem.isCustomHoliday ? dayItem.customHolidayName : "Holiday"})
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {assignModalOpen && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                        {/* Soft backdrop */}
                        <motion.div
                            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setAssignModalOpen(false)}
                        />

                        {/* Modal with spring */}
                        <motion.div
                            className="relative z-10"
                            initial={{ opacity: 0, scale: 0.95, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 8 }}
                            transition={{
                                duration: 0.25,
                                ease: [0.25, 0.46, 0.45, 0.94],
                            }}
                        >
                            <JobAssignModal onClose={() => setAssignModalOpen(false)} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
};