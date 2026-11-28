import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  CheckCircle2,
  LoaderCircle,
  Percent,
  Plus,
  Receipt,
  Trash2,
  X,
} from "lucide-react";
import { Skeleton } from "../../../skeleton";

import NepaliDateInput from "../../../nepalidate/testDate";
import {
  dismissWaitingNotify,
  ErrorNotify,
  SuccessNotify,
  waitingNotify,
} from "../../../hotToaster";
import { useGet } from "../../../hooks/useGet";
import { useEdit } from "../../../hooks/useEdit";

/* ------------------------------------------------------------------------ */
/* THEME TOKENS                                                             */
/* ------------------------------------------------------------------------ */

// Brand gradient used on primary buttons
const BRAND = "bg-gradient-to-r from-amber-500 to-orange-500";

// Keyboard focus ring shared by all buttons
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40";

// Shared input style
const INPUT =
  "h-9 w-full cursor-text rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 disabled:cursor-not-allowed disabled:opacity-50";

/* ------------------------------------------------------------------------ */
/* MOTION TOKENS                                                            */
/* ------------------------------------------------------------------------ */

const EASE_OUT = [0.22, 1, 0.36, 1]; // soft, gentle settle

// Parent: staggers its children after the drawer has slid in
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.05 } },
};

// Child cards: fade + rise
const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: EASE_OUT },
  },
};

// Button hover / tap feedback
const btnVariants = {
  hover: { scale: 1.02 },
  tap: { scale: 0.97 },
};

// Icon hover / tap feedback (inherits the button's hover/tap state)
const iconVariants = {
  hover: { rotate: -8, scale: 1.12 },
  tap: { scale: 0.92 },
};

// slower, softer spring for hover/tap feedback
const softSpring = { type: "spring", stiffness: 180, damping: 22 };

// Spread onto a motion element to enable hover/tap unless disabled
const press = (disabled) =>
  disabled ? {} : { whileHover: "hover", whileTap: "tap" };

/* ------------------------------------------------------------------------ */
/* CALCULATIONS                                                             */
/* ------------------------------------------------------------------------ */

const VAT_RATE = 0.13;

// Indian-style number formatting with 2 decimals
const nf = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const fmtMoney = (n) => nf.format(Number.isFinite(n) ? n : 0);

// Create a blank installment row (uid is a local-only key for React / drag)
const createRow = (index = 1) => ({
  uid:
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  monthDate: "",
  amount: "",
  remarks: index === 1 ? "Initial installment" : "",
});

// Build form rows from an array (server data or props), or a single blank row
const buildRows = (list) =>
  Array.isArray(list) && list.length
    ? list.map((r, idx) => {
        const row = createRow(idx + 1);
        return {
          ...row,
          ...r,
          uid: row.uid,
          monthDate: r.monthDate ?? "",
          amount: r.amount != null ? String(r.amount) : "",
          remarks: r.remarks ?? "",
        };
      })
    : [createRow(1)];

// Per-row maths: discount first, then optional 13% VAT
function calculateRowBreakdown(rawAmount, discountPercent, vatEnabled) {
  const numericAmount = parseFloat(rawAmount);

  const safeAmount =
    Number.isFinite(numericAmount) && numericAmount > 0 ? numericAmount : 0;

  const discount = Math.min(100, Math.max(0, parseFloat(discountPercent) || 0));

  const discountedAmount = safeAmount * (1 - discount / 100);

  const exclVat = discountedAmount;

  const inclVat = vatEnabled
    ? discountedAmount * (1 + VAT_RATE)
    : discountedAmount;

  return {
    rawAmount: safeAmount,
    discountedAmount,
    exclVat,
    inclVat,
    vatAmount: inclVat - exclVat,
  };
}

/* ------------------------------------------------------------------------ */
/* API LAYER                                                                */
/* ------------------------------------------------------------------------ */

function useInstallmentApi() {
  const { getInstallmentsTerms_ } = useGet();
  const { UpdateInstallment_ } = useEdit();

  const fetchSchedule = async (MainID) => {
    const response = await getInstallmentsTerms_.mutateAsync({
      params: { MainID },
    });
    const data = response?.data ?? response;
    if (!Array.isArray(data?.installment)) {
      throw new Error("Invalid installment response.");
    }
    return data;
  };

  const saveSchedule = async (MainID, installment) => {
    return UpdateInstallment_.mutateAsync({
      params: { MainID },
      payload: { installment },
    });
  };

  return { fetchSchedule, saveSchedule };
}

/* ------------------------------------------------------------------------ */
/* DRAWER HELPERS                                                           */
/* ------------------------------------------------------------------------ */

// Run a callback when Escape is pressed (only while enabled)
function useEscape(onEscape, enabled = true) {
  const callback = useRef(onEscape);

  callback.current = onEscape;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") callback.current();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled]);
}

// Prevent the page behind the drawer from scrolling
function useBodyLock(active) {
  useEffect(() => {
    if (!active) return;

    const previous = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [active]);
}

/* ------------------------------------------------------------------------ */
/* LOADING OVERLAY                                                          */
/* ------------------------------------------------------------------------ */

// Frosted overlay with a skeleton layout, shown over the drawer content
// while an API request is in flight.
function LoadingOverlay({ show, label }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="loading-overlay"
          role="status"
          aria-live="polite"
          className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
        >
          <motion.div
            className="flex flex-col items-center gap-3 rounded-2xl border border-amber-100 bg-white px-8 py-6 shadow-xl"
            aria-label={label}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
          >
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-3 w-36 rounded-full" />
            <div className="w-full space-y-2">
              <Skeleton className="h-3 w-full rounded-full" />
              <Skeleton className="h-3 w-4/5 rounded-full" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------------ */
/* SIDE DRAWER                                                              */
/* ------------------------------------------------------------------------ */

function SideDrawer({
  open,
  onClose,
  title,
  subtitle,
  footer,
  locked = false, // true while a request is running: blocks closing
  loading = false, // shows the progress bar + overlay
  loadingLabel = "Please wait...",
  embedded = false,
  children,
}) {
  const titleId = useId();

  // Closing is ignored while locked
  const close = () => {
    if (!locked) onClose?.();
  };

  useEscape(close, open && !embedded);
  useBodyLock(open && !embedded);

  if (embedded) {
    return open ? (
      <div>
        <div className="relative">
          {children}
          <LoadingOverlay show={loading} label={loadingLabel} />
        </div>
        {footer && (
          <footer className="mt-4 border-t border-slate-200 bg-white px-4 py-3">
            {footer}
          </footer>
        )}
      </div>
    ) : null;
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120] flex justify-end font-['Roboto_Slab'] text-xs text-slate-800">
          {/* Backdrop */}

          <motion.div
            onClick={close}
            className={`absolute inset-0 bg-slate-950/50 backdrop-blur-md ${locked ? "cursor-not-allowed" : "cursor-pointer"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Drawer */}

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-busy={loading}
            aria-labelledby={titleId}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
            }}
            className="relative flex h-full w-full flex-col bg-slate-50 shadow-2xl sm:max-w-4xl"
          >
            {/* Header */}

            <header className="relative flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-7">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                    <Receipt size={17} />
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                    Contract Billing
                  </span>
                </div>

                <h2
                  id={titleId}
                  className="text-base font-extrabold text-slate-900"
                >
                  {title}
                </h2>

                {subtitle && (
                  <p className="mt-1 text-[11px] text-slate-500">{subtitle}</p>
                )}
              </div>

              <button
                type="button"
                onClick={close}
                disabled={locked}
                className={`cursor-pointer rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS}`}
              >
                <X size={17} />
              </button>

              {loading && (
                <Skeleton className="absolute inset-x-0 -bottom-px h-0.5 w-full rounded-none" />
              )}
            </header>

            {/* Content (relative wrapper so the overlay covers only the body) */}

            <div className="relative min-h-0 flex-1">
              <main className="h-full overflow-y-auto p-4 sm:p-6">
                {children}
              </main>

              <LoadingOverlay show={loading} label={loadingLabel} />
            </div>

            {/* Footer */}

            {footer && (
              <footer className="shrink-0 border-t border-slate-200 bg-white px-4 py-3.5 sm:px-7">
                {footer}
              </footer>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------------ */
/* INSTALLMENT DRAWER                                                       */
/* ------------------------------------------------------------------------ */

export function InstallmentDrawer({
  open = true,
  onClose,
  onSaved, // optional: called with the saved result after a successful save
  contract = null,
  embedded = false,
  deferSave = false,
  onDataChange,
  validateOnMount = false,
  onBusyChange,
  initialDiscount = 0,
  initialVatEnabled = true,
  initialRows = null,
}) {
  const api = useInstallmentApi();

  const contractId =
    contract?.MainID || contract?.mainID || contract?.id || contract?._id || null;

  /* ------------------------------ State ------------------------------ */

  const [discountPercent, setDiscountPercent] = useState(
    initialDiscount ? String(initialDiscount) : "0"
  );
  const [vatEnabled, setVatEnabled] = useState(Boolean(initialVatEnabled));
  const [rows, setRows] = useState(() => buildRows(initialRows));
  const [errors, setErrors] = useState({});

  // Request flags that drive the animations
  const [loadingInitial, setLoadingInitial] = useState(false); // GET
  const [submitting, setSubmitting] = useState(false); // POST / PUT
  const busy = loadingInitial || submitting;

  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy]);

  // Label shown in the overlay for the current request
  const loadingLabel = loadingInitial
    ? "Loading installment schedule..."
    : submitting
    ? "Updating installment schedule..."
    : "Please wait...";

  /* Keep latest initial values without making them effect dependencies,
     so an inline `initialRows={[...]}` can't wipe edits mid-session. */

  const initialsRef = useRef({});

  initialsRef.current = { initialDiscount, initialVatEnabled, initialRows };

  // Keep the latest api object in a ref (its identity changes every render)
  const apiRef = useRef(api);

  apiRef.current = api;

  /* ---------------- Reset + load saved data when drawer opens ---------------- */

  useEffect(() => {
    if (!open) return;

    const { initialDiscount, initialVatEnabled, initialRows } =
      initialsRef.current;

    // 1) reset the form to its defaults
    setDiscountPercent(initialDiscount ? String(initialDiscount) : "0");
    setVatEnabled(Boolean(initialVatEnabled));
    setRows(buildRows(initialRows));
    setErrors({});
    setSubmitting(false);

    if (deferSave) return;

    // 2) no contract => nothing to fetch
    if (!contractId) return;

    // 3) fetch the organization's saved installment rows
    let cancelled = false; // ignore the response if the drawer closed meanwhile

    (async () => {
      setLoadingInitial(true);

      try {
        const saved = await apiRef.current.fetchSchedule(contractId);

        if (cancelled || !saved) return;

        const savedRows = Array.isArray(saved.installment)
          ? saved.installment
          : [];

        setRows(buildRows(savedRows));
        if (savedRows.length) {
          setDiscountPercent(String(savedRows[0].discountPercent ?? 0));
          setVatEnabled(
            savedRows[0].vatEnabled !== undefined
              ? Boolean(savedRows[0].vatEnabled)
              : Number(savedRows[0].vatRate ?? 13) > 0
          );
        }
      } catch (err) {
        if (!cancelled) {
          ErrorNotify(
            err?.response?.data?.message ||
              err?.message ||
              "Unable to load installment schedule."
          );
        }
      } finally {
        if (!cancelled) setLoadingInitial(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, contractId, deferSave]);

  /* --------------------------- Calculations --------------------------- */

  const parsedDiscount = useMemo(() => {
    const num = parseFloat(discountPercent);

    return Number.isFinite(num) ? num : 0;
  }, [discountPercent]);

  // Each row plus its computed amounts
  const computedRows = useMemo(
    () =>
      rows.map((row, index) => ({
        ...row,
        sn: index + 1,
        ...calculateRowBreakdown(row.amount, parsedDiscount, vatEnabled),
      })),
    [rows, parsedDiscount, vatEnabled]
  );

  const onDataChangeRef = useRef(onDataChange);
  onDataChangeRef.current = onDataChange;

  useEffect(() => {
    onDataChangeRef.current?.({ rows, computedRows, discountPercent, vatEnabled });
  }, [rows, computedRows, discountPercent, vatEnabled]);

  // Column totals
  const totals = useMemo(
    () =>
      computedRows.reduce(
        (acc, row) => ({
          amt: acc.amt + row.rawAmount,
          inclVat: acc.inclVat + row.inclVat,
          exclVat: acc.exclVat + row.exclVat,
          vat: acc.vat + row.vatAmount,
        }),
        { amt: 0, inclVat: 0, exclVat: 0, vat: 0 }
      ),
    [computedRows]
  );

  /* ---------------------------- Row actions ---------------------------- */

  // Append a blank row
  const addRow = () => {
    setRows((prev) => [...prev, createRow(prev.length + 1)]);

    setErrors((prev) => ({ ...prev, rows: undefined }));
  };

  // Removed rows are persisted with the complete array when the form is saved.
  const removeRow = async (row) => {
    if (rows.length <= 1 || busy) return;

    // Local helper: drop the row + its errors from state
    const dropLocally = () => {
      setRows((prev) => prev.filter((item) => item.uid !== row.uid));

      setErrors((prev) => {
        const next = { ...prev };
        delete next[row.uid];
        return next;
      });
    };

    dropLocally();
  };

  // Swap a row with its neighbour (direction: -1 up, +1 down)
  const moveRow = (index, direction) => {
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= rows.length) return;

    setRows((prev) => {
      const copy = [...prev];

      const [moved] = copy.splice(index, 1);

      copy.splice(targetIndex, 0, moved);

      return copy;
    });
  };

  // Update one field of one row and clear its error
  const updateRow = (uid, field, value) => {
    setRows((prev) =>
      prev.map((item) => (item.uid === uid ? { ...item, [field]: value } : item))
    );

    setErrors((prev) => {
      if (!prev[uid]?.[field] && !prev.form) return prev;

      const next = { ...prev, form: undefined };

      if (prev[uid]?.[field]) {
        const rowErr = { ...prev[uid] };

        delete rowErr[field];

        next[uid] = rowErr;
      }

      return next;
    });
  };

  /* ---------------------------- Validation ---------------------------- */

  const validateAll = () => {
    const nextErrors = {};
    let hasError = false;

    // Discount must be 0 - 100
    if (
      discountPercent !== "" &&
      (!Number.isFinite(parsedDiscount) ||
        parsedDiscount < 0 ||
        parsedDiscount > 100)
    ) {
      nextErrors.discount = "Discount must be between 0% and 100%.";
      hasError = true;
    }

    // Need at least one row
    if (!rows.length) {
      nextErrors.form = "At least one installment row is required.";
      hasError = true;
    }

    // Per-row checks
    rows.forEach((row, index) => {
      const rowErr = {};

      const dateStr =
        typeof row.monthDate === "string"
          ? row.monthDate.trim()
          : String(row.monthDate || "").trim();

      if (!dateStr) rowErr.monthDate = "Select Nepali date";

      const amount = parseFloat(row.amount);

      if (!row.amount || !Number.isFinite(amount) || amount <= 0) {
        rowErr.amount = "Enter valid amount";
      }

      if (!String(row.remarks || "").trim()) {
        rowErr.remarks = `Remarks required for S.N. ${index + 1}`;
      }

      if (Object.keys(rowErr).length) {
        nextErrors[row.uid] = rowErr;
        hasError = true;
      }
    });

    if (hasError && !nextErrors.form) {
      nextErrors.form =
        "Please fill in all required installment fields and fix highlighted errors before submitting.";
    }

    setErrors(nextErrors);

    return !hasError;
  };

  const validateAllRef = useRef(validateAll);
  validateAllRef.current = validateAll;

  useEffect(() => {
    if (validateOnMount) validateAllRef.current();
  }, [validateOnMount]);

  /* ------------------------------ Submit ------------------------------ */

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (deferSave) return;

    // Ignore double clicks while a request is running
    if (busy) return;

    if (!validateAll()) {
      ErrorNotify("Please complete all required installment details.");
      return;
    }

    // Body sent to the API
    const installment = computedRows.map((row, index) => {
      const existingFields = { ...rows[index] };
      delete existingFields.uid;
      return {
        ...existingFields,
        sn: row.sn,
        monthDate: row.monthDate,
        amount: row.rawAmount,
        inclVat: Number(row.inclVat.toFixed(2)),
        exclVat: Number(row.exclVat.toFixed(2)),
        vatAmount: Number(row.vatAmount.toFixed(2)),
        remarks: row.remarks,
        discountPercent: Math.min(100, Math.max(0, parsedDiscount)),
        vatRate: vatEnabled ? 13 : 0,
        vatEnabled,
      };
    });

    setSubmitting(true); // starts the overlay + progress bar animation

    waitingNotify("Updating installment schedule...");

    try {
      const result = await api.saveSchedule(contractId, installment);

      SuccessNotify(
        result?.message ||
          result?.data?.message ||
          "Installment schedule updated successfully."
      );

      onSaved?.(result);

      if (!embedded) onClose?.();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to save installment schedule.";

      // Show the server message inside the drawer too
      setErrors((prev) => ({ ...prev, form: msg }));

      ErrorNotify(msg);
    } finally {
      dismissWaitingNotify("Updating installment schedule...");
      setSubmitting(false); // stops the animation
    }
  };

  // True when any row (not the discount / form / rows keys) still has an error
  const hasRowErrors = Object.keys(errors).some(
    (key) => !["discount", "form", "rows"].includes(key) && errors[key]
  );

  /* -------------------------------- UI -------------------------------- */

  return (
    <MotionConfig reducedMotion="user">
      <SideDrawer
        open={open}
        onClose={onClose}
        title="Installment Schedule"
        subtitle={
          contract?.organizationName
            ? `${contract.organizationName}${
                contract.leadId ? ` · ${contract.leadId}` : ""
              }`
            : "Configure payment schedule and billing"
        }
        locked={busy}
        loading={busy}
        loadingLabel={loadingLabel}
        embedded={embedded}
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Footer totals */}

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] font-semibold text-slate-400">
                  Amount
                </p>

                <p className="mt-1 text-xs font-bold tabular-nums text-slate-700">
                  {fmtMoney(totals.amt)}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-slate-400">
                  Excl. VAT
                </p>

                <p className="mt-1 text-xs font-bold tabular-nums text-slate-700">
                  {fmtMoney(totals.exclVat)}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-slate-400">
                  Incl. VAT
                </p>

                <p className="mt-1 text-sm font-extrabold tabular-nums text-amber-700">
                  {fmtMoney(totals.inclVat)}
                </p>
              </div>
            </div>

            {/* Footer actions */}

            <div className="flex items-center justify-end gap-2">
              {!embedded && (
                <button
                  type="button"
                  onClick={onClose}
                  disabled={busy}
                  className={`h-10 cursor-pointer rounded-lg border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`}
                >
                  Cancel
                </button>
              )}

              {!deferSave && <motion.button
                type="submit"
                form="installment-schedule-form"
                disabled={busy}
                variants={btnVariants}
                {...press(busy)}
                transition={softSpring}
                className={`flex h-10 min-w-[140px] cursor-pointer items-center justify-center gap-2 rounded-lg px-5 text-xs font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-70 ${BRAND} ${FOCUS}`}
              >
                {submitting
                  ? <LoaderCircle className="h-3 w-3 animate-spin text-white" strokeWidth={2.5} />
                  : <CheckCircle2 size={15} />}
                Update Schedule
              </motion.button>}
            </div>
          </div>
        }
      >
        <form
          id="installment-schedule-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <motion.div
            className="space-y-4"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {/* ----------------------- Billing settings ----------------------- */}

            <motion.section
              variants={fadeUp}
              className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
            >
              <div className="mb-4">
                <h3 className="text-xs font-extrabold text-slate-900">
                  Billing Settings
                </h3>

                <p className="mt-1 text-[11px] text-slate-400">
                  Configure discount and applicable VAT.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Discount */}

                <div>
                  <label
                    htmlFor="installment-discount-pct"
                    className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-700"
                  >
                    <Percent size={14} className="text-amber-600" />
                    Discount Percentage
                  </label>

                  <div className="relative">
                    <input
                      id="installment-discount-pct"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={discountPercent}
                      disabled={busy}
                      onChange={(e) => {
                        setDiscountPercent(e.target.value);

                        setErrors((prev) => ({
                          ...prev,
                          discount: undefined,
                          form: undefined,
                        }));
                      }}
                      placeholder="0"
                      className={`${INPUT} pr-9 tabular-nums`}
                    />

                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                      %
                    </span>
                  </div>

                  {errors.discount && (
                    <p className="mt-1 text-[10px] font-semibold text-red-600">
                      {errors.discount}
                    </p>
                  )}
                </div>

                {/* VAT toggle */}

                <div>
                  <label className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Receipt size={14} className="text-amber-600" />
                    VAT Configuration
                  </label>

                  <label
                    htmlFor="installment-vat-13"
                    className={`flex h-9 items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 transition hover:border-amber-300 ${busy ? "cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <span className="text-xs font-semibold text-slate-700">
                      {vatEnabled ? "13% VAT Applied" : "VAT Disabled"}
                    </span>

                    <input
                      id="installment-vat-13"
                      type="checkbox"
                      checked={vatEnabled}
                      disabled={busy}
                      onChange={(e) => setVatEnabled(e.target.checked)}
                      className="h-4 w-4 cursor-pointer accent-amber-600 disabled:cursor-not-allowed"
                    />
                  </label>
                </div>
              </div>
            </motion.section>

            {/* ---------------------- Installment breakdown ---------------------- */}

            <motion.section
              variants={fadeUp}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              {/* Section header */}

              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900">
                    Installment Breakdown
                  </h3>

                  <p className="mt-1 text-[11px] text-slate-400">
                    {rows.length} payment{" "}
                    {rows.length === 1 ? "entry" : "entries"}
                  </p>
                </div>

                <motion.button
                  type="button"
                  onClick={addRow}
                  disabled={busy}
                  variants={btnVariants}
                  {...press(busy)}
                  transition={softSpring}
                  className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-[11px] font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50 ${BRAND} ${FOCUS}`}
                >
                  <motion.span
                    variants={iconVariants}
                    transition={softSpring}
                    className="inline-flex"
                  >
                    <Plus size={14} />
                  </motion.span>
                  Add Installment
                </motion.button>
              </div>

              {/* Table */}

              <div className="max-h-[360px] overflow-auto">
                <table className="w-full min-w-[760px] border-collapse text-left">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      <th className="w-12 px-3 py-3 text-center">S.N.</th>

                      <th className="w-44 px-3 py-3">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays size={13} />
                          Payment Date
                        </span>
                      </th>

                      <th className="w-32 px-3 py-3">Amount</th>

                      <th className="w-32 px-3 py-3">Incl. VAT</th>

                      <th className="w-32 px-3 py-3">Excl. VAT</th>

                      <th className="min-w-[150px] px-3 py-3">Remarks</th>

                      <th className="w-28 px-3 py-3 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {/* initial={false}: rows present on open ride the section's
                        fade-up; only rows added later animate on their own. */}

                    <AnimatePresence initial={false}>
                      {computedRows.map((row, index) => {
                        const rowErr = errors[row.uid] || {};

                        const isFirst = index === 0;
                        const isLast = index === computedRows.length - 1;
                        return (
                          <motion.tr
                            key={row.uid}
                            layout
                            initial={{ opacity: 0, y: 22 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -16 }}
                            transition={{ duration: 0.5, ease: EASE_OUT }}
                            className="align-top transition-colors hover:bg-amber-50/30"
                          >
                            {/* S.N. */}

                            <td className="px-3 py-3 text-center text-xs font-bold text-slate-500">
                              {row.sn}
                            </td>

                            {/* Payment date */}

                            <td className="px-3 py-3">
                              <NepaliDateInput
                                value={row.monthDate}
                                onChange={(val) =>
                                  updateRow(row.uid, "monthDate", val)
                                }
                                placeholder="Select date..."
                              />

                              {rowErr.monthDate && (
                                <p className="mt-1 text-[10px] font-semibold text-red-600">
                                  {rowErr.monthDate}
                                </p>
                              )}
                            </td>

                            {/* Amount */}

                            <td className="px-3 py-3">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={row.amount}
                                disabled={busy}
                                onChange={(e) =>
                                  updateRow(row.uid, "amount", e.target.value)
                                }
                                placeholder="0.00"
                                className={`${INPUT} tabular-nums ${
                                  rowErr.amount ? "border-red-400 bg-red-50" : ""
                                }`}
                              />

                              {rowErr.amount && (
                                <p className="mt-1 text-[10px] font-semibold text-red-600">
                                  {rowErr.amount}
                                </p>
                              )}
                            </td>

                            {/* Incl. VAT */}

                            <td className="px-3 py-4 text-xs font-bold tabular-nums text-slate-800">
                              {fmtMoney(row.inclVat)}
                            </td>

                            {/* Excl. VAT */}

                            <td className="px-3 py-4 text-xs font-semibold tabular-nums text-slate-500">
                              {fmtMoney(row.exclVat)}
                            </td>

                            {/* Remarks */}

                            <td className="px-3 py-3">
                              <input
                                type="text"
                                value={row.remarks}
                                disabled={busy}
                                onChange={(e) =>
                                  updateRow(row.uid, "remarks", e.target.value)
                                }
                                placeholder="Remarks..."
                                className={`${INPUT} ${
                                  rowErr.remarks
                                    ? "border-red-400 bg-red-50"
                                    : ""
                                }`}
                              />

                              {rowErr.remarks && (
                                <p className="mt-1 text-[10px] font-semibold text-red-600">
                                  {rowErr.remarks}
                                </p>
                              )}
                            </td>

                            {/* Row actions */}

                            <td className="px-3 py-3">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => moveRow(index, -1)}
                                  disabled={busy || isFirst}
                                  title="Move up"
                                  className={`cursor-pointer rounded-md border border-slate-200 p-1.5 text-slate-500 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-30 ${FOCUS}`}
                                >
                                  <ArrowUp size={13} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => moveRow(index, 1)}
                                  disabled={busy || isLast}
                                  title="Move down"
                                  className={`cursor-pointer rounded-md border border-slate-200 p-1.5 text-slate-500 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-30 ${FOCUS}`}
                                >
                                  <ArrowDown size={13} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => removeRow(row)}
                                  disabled={busy || rows.length <= 1}
                                  title="Delete installment"
                                  className={`cursor-pointer rounded-md border border-red-100 p-1.5 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30 ${FOCUS}`}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>

                  {/* Table totals */}

                  <tfoot>
                    <tr className="border-t border-slate-200 bg-slate-50 text-xs font-bold">
                      <td
                        colSpan={2}
                        className="px-3 py-3 text-right text-slate-600"
                      >
                        Total
                      </td>

                      <td className="px-3 py-3 tabular-nums text-slate-800">
                        {fmtMoney(totals.amt)}
                      </td>

                      <td className="px-3 py-3 tabular-nums text-amber-700">
                        {fmtMoney(totals.inclVat)}
                      </td>

                      <td className="px-3 py-3 tabular-nums text-slate-600">
                        {fmtMoney(totals.exclVat)}
                      </td>

                      <td
                        colSpan={2}
                        className="px-3 py-3 text-right text-[10px] text-slate-500"
                      >
                        Discount: {Math.min(100, Math.max(0, parsedDiscount))}%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </motion.section>

            {/* ------------------------ Validation banner ------------------------ */}

            <AnimatePresence>
              {(errors.form || hasRowErrors) && (
                <motion.div
                  role="alert"
                  initial={{ opacity: 0, height: 0, y: -6 }}
                  animate={{ opacity: 1, height: "auto", y: [0, -3, 0] }}
                  exit={{ opacity: 0, height: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[11px] font-semibold text-red-700"
                >
                  {errors.form ||
                    "Please check the highlighted installment fields."}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </form>
      </SideDrawer>
    </MotionConfig>
  );
}

/* ------------------------------------------------------------------------ */
/* STANDALONE WRAPPER                                                       */
/* ------------------------------------------------------------------------ */

export const Installement = ({
  open = true,
  onClose,
  onSaved,
  contract,
  embedded = false,
  onBusyChange,
}) => {
  return (
    <InstallmentDrawer
      open={open}
      onClose={onClose}
      onSaved={onSaved}
      contract={contract}
      embedded={embedded}
      onBusyChange={onBusyChange}
    />
  );
};

export default InstallmentDrawer;