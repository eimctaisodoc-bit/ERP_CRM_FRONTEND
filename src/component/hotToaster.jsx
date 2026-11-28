// src/component/hotToaster.jsx
import toast from "react-hot-toast";
import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { Skeleton } from "./skeleton";

const base = {
  minWidth: "280px",
  maxWidth: "380px",
  padding: "14px 16px",
  borderRadius: "14px",
  fontSize: "14px",
  fontWeight: 600,
  lineHeight: 1.4,
};

const themes = {
  success: {
    border: "1px solid #bbf7d0",
    background: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)",
    color: "#166534",
  },
  error: {
    border: "1px solid #fecaca",
    background: "linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)",
    color: "#991b1b",
  },
  warning: {
    border: "1px solid #fbbf24",
    background: "linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)",
    color: "#b45309",
  },
};

const build = (type) => {
  const { icon, ...style } = themes[type];
  return { style: { ...base, ...style }, iconTheme: icon };
};

const POSITION = "top-right";

export const SuccessNotify = (message = "Success!", options = {}) =>
  toast.success(message, {
    id: options.id ?? `success-${message}`, // same message never stacks
    duration: 2500,
    position: POSITION,
    ariaProps: { role: "status", "aria-live": "polite" },
    ...build("success"),
    ...options,
  });

/* -------------------------------------------------------------------------- */
/*  Waiting / loading                                                          */
/*  Returns the toast id. Pass { duration } to auto-close, otherwise it stays  */
/*  until you call dismissWaitingNotify() or resolveWaitingNotify().           */
/* -------------------------------------------------------------------------- */

export const waitingNotify = (message = "Processing...", options = {}) => {
  const id = options.id ?? `waiting-${message}`;
  toast.custom(
    (t) => (
      <div
        role="status"
        aria-live="polite"
        aria-label={message}
        className={`flex min-w-[280px] items-center gap-3 rounded-xl border px-4 py-3 shadow-lg transition-all ${
          t.visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
        }`}
        style={{ ...base, ...themes.warning }}
      >
       {message}
      </div>
    ),
    {
      id,
      duration: 5000,
      position: POSITION,
      ariaProps: { role: "status", "aria-live": "polite" },
      ...options,
    },
  );
  return id;
};

export const dismissWaitingNotify = (message = "Processing...") => {
  toast.dismiss(`waiting-${message}`);
};

/** Turn a waiting toast into a success / error toast in place (no flicker). */
export const resolveWaitingNotify = (
  message = "Processing...",
  { type = "success", text } = {},
) => {
  const id = `waiting-${message}`;
  const opts = { id, duration: 2500, position: POSITION, ...build(type) };
  if (type === "error") toast.error(text || "Something went wrong.", opts);
  else toast.success(text || "Done!", opts);
};

/* -------------------------------------------------------------------------- */
/*  Error                                                                      */
/* -------------------------------------------------------------------------- */

export const ErrorNotify = (message, duration = 3500) => {
  const text = message || "Something went wrong. Please try again.";
  return toast.error(text, {
    id: `error-${text}`, // identical errors replace each other instead of piling up
    duration,
    position: POSITION,
    ariaProps: { role: "alert", "aria-live": "assertive" },
    ...build("error"),
  });
};

/* -------------------------------------------------------------------------- */
/*  Date helper                                                                */
/* -------------------------------------------------------------------------- */

const formatDateTime = (d) => {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kathmandu",
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

/* -------------------------------------------------------------------------- */
/*  Input toast                                                                */
/* -------------------------------------------------------------------------- */

const INPUT_TOAST_ID = "input-notify-single";
let pendingReject = null; // lets us settle the previous promise if replaced

function InputToast({ t, title, placeholder, start, end, onSubmit, onCancel }) {
  const [value, setValue] = useState("");
  const inputRef = useRef(null);
  const canSubmit = value.trim().length > 0;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = () => {
    if (canSubmit) onSubmit(value.trim());
  };

  return (
    <div
      role="dialog"
      aria-label={title}
      className={`w-[320px] max-w-[92vw] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg transition-all duration-200 ${
        t.visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
      }`}
      onKeyDown={(e) => {
        if (e.key === "Escape") onCancel();
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
        <div className="min-w-0">
          <p
            className="text-lg text-slate-700"
            style={{ fontFamily: "'Roboto Slab', serif", fontWeight: 400 }}
          >
            {title}
          </p>

          {start && end && (
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {formatDateTime(start)}
              <span aria-hidden="true"> → </span>
              <span className="sr-only"> to </span>
              <br />
              {formatDateTime(end)}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
          aria-label="Close"
          title="Close"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-4">
        <input
          ref={inputRef}
          type="text"
          value={value}
          maxLength={120}
          placeholder={placeholder}
          aria-label={title}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
        />

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Enter to save · Esc to cancel
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={submit}
              disabled={!canSubmit}
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const InputNotify = (
  title = "Enter value",
  placeholder = "Type here...",
  slotInfo,
) =>
  new Promise((resolve, reject) => {
    // Only one input toast at a time: settle the old promise, close the old toast
    if (pendingReject) {
      pendingReject("cancelled");
      pendingReject = null;
    }
    toast.dismiss(INPUT_TOAST_ID);

    let done = false;

    const finish = (fn, payload) => {
      if (done) return;
      done = true;
      pendingReject = null;
      toast.dismiss(INPUT_TOAST_ID);
      fn(payload);
    };

    pendingReject = (reason) => finish(reject, reason);

    toast.custom(
      (t) => (
        <InputToast
          t={t}
          title={title}
          placeholder={placeholder}
          start={slotInfo?.start}
          end={slotInfo?.end}
          onSubmit={(v) => {
            finish(resolve, v);
            SuccessNotify("Saved", { id: "input-saved", duration: 1500 });
          }}
          onCancel={() => finish(reject, "cancelled")}
        />
      ),
      {
        id: INPUT_TOAST_ID,
        duration: Infinity,
        position: POSITION,
      },
    );
  });
