import React, { useState, useEffect } from "react";
import NepaliDatePicker from "@zener/nepali-datepicker-react";
import { toNepaliDateInputValue } from "../../utils/dateUtils";
import "@zener/nepali-datepicker-react/index.css";

export default function NepaliDateInput({
    value,
    onDateChange,
    placeholder = "Select Date",
    isToday = false,
}) {
    const [date, setDate] = useState(null);

    const todayBS = toNepaliDateInputValue(new Date());

    const isPastDate = (dateValue) =>
        isToday && dateValue && dateValue < todayBS;

    useEffect(() => {
        if (isPastDate(value)) {
            setDate(null);
            onDateChange?.("");
        }
    }, [value, isToday]);

    const handleChange = (selectedDate) => {
        if (!selectedDate) {
            setDate(null);
            onDateChange?.("");
            return;
        }

        const formattedDate = selectedDate.format("YYYY-MM-DD");

        if (isPastDate(formattedDate)) {
            return;
        }

        setDate(selectedDate);
        onDateChange?.(formattedDate);
    };

    const validValue = isPastDate(value) ? null : value;

    return (
        <div className="relative w-full">
            <NepaliDatePicker
                value={validValue !== undefined ? validValue : date}
                type="BS"
                lang="en"
                // disabled={true}
                format="YYYY-MM-DD"
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full cursor-pointer rounded-md border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium shadow-sm transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
        </div>
    );
}