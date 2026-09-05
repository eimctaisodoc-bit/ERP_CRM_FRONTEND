import React, { useEffect, useId, useState } from "react";
import { ArrowRight } from "lucide-react";
import { NepaliDatePicker } from "nepali-datepicker-reactjs";
import "nepali-datepicker-reactjs/dist/index.css";

export default function DateUsage({
  onChange,
  range = true,
  defaultValue,
  id,
  placeholder = "YYYY-MM-DD (e.g. 2082-05-09)",
}) {
  const generatedId = useId().replace(/:/g, "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const getDateValue = (value) => {
      if (typeof value === "string") return value;
      if (!value || typeof value !== "object") return "";
      return value.value || value.formattedDate || value.bsDate || "";
    };

    if (!defaultValue) {
      setStartDate("");
      setEndDate("");
      return;
    }

    if (Array.isArray(defaultValue)) {
      setStartDate(getDateValue(defaultValue[0]));
      setEndDate(getDateValue(defaultValue[1]));
      return;
    }

    if (typeof defaultValue === "object") {
      setStartDate(getDateValue(defaultValue.from));
      setEndDate(getDateValue(defaultValue.to));
      return;
    }

    const dates = String(defaultValue).split(" - ");
    setStartDate(dates[0] || "");
    setEndDate(dates[1] || "");
  }, [defaultValue]);

  const updateDates = (nextStartDate, nextEndDate) => {
    setStartDate(nextStartDate);
    setEndDate(nextEndDate);

    if (onChange) {
      onChange(
        range
          ? { from: nextStartDate, to: nextEndDate }
          : nextStartDate
      );
    }
  };

  return (
    <div className="date-usage">
      <div className="date-usage-field">

        {range && (<label htmlFor={id ? `${id}-from` : `${generatedId}-from`}>Start date (BS)
        </label>)}

        <NepaliDatePicker
          inputClassName="date-usage-input"
          placeholder={placeholder}
          value={startDate}
          onChange={(value) => updateDates(value || "", endDate)}
          options={{ calenderLocale: "ne", valueLocale: "ne" }}
          id={id ? `${id}-from` : `${generatedId}-from`}
        />
       
      </div>

      {range && (
        <div className="date-usage-field">
          <label htmlFor={id ? `${id}-to` : `${generatedId}-to`}>
            End date (BS)
          </label>
          <NepaliDatePicker
            inputClassName="date-usage-input"
            placeholder={placeholder}
            value={endDate}
            onChange={(value) => updateDates(startDate, value || "")}
            options={{ calenderLocale: "ne", valueLocale: "ne" }}
            id={id ? `${id}-to` : `${generatedId}-to`}
          />
        </div>
      )}

      <style>{`
        .date-usage {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 10px;
          width: 100%;
         
          background: #ffffff;
          border-radius: 8px;
          position: relative;
          z-index: 9999;
        }
        .date-usage-field {
          position: relative;
          width: 100%;
          padding-bottom: 18px;
          z-index: 1;
        }
        .date-usage-field:focus-within {
          z-index: 20;
        }
        .date-usage-field > label {
          display: block;
          margin-bottom: 6px;
          
        font-size: 0.75rem;
  line-height: 1rem; 
  color: #6b7280;
         
        }
        .date-usage-input {
          width: 100%;
          min-height: 40px;
          padding: 9px 12px;
          color: #0f172a;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          box-sizing: border-box;
        }
        .date-usage-input:focus {
          outline: 2px solid #bfdbfe;
          border-color: #2563eb;
        }
        .date-usage-arrow {
          flex: 0 0 auto;
          align-self: center;
          transform: rotate(90deg);
          color: #64748b;
          z-index: 2;
        }
        #ndp-nepali-box {
          z-index: 99999 !important;
        }
        @media (max-width: 480px) {
          .date-usage {
            gap: 6px;
            padding: 8px;
          }
        }
      `}</style>
    </div>
  );
}