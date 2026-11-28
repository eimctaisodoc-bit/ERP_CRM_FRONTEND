import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  LoaderCircle,
  Plus,
  Scale,
  Trash2,
  X,
} from "lucide-react";
import { Skeleton } from "../../../skeleton";

import {
  dismissWaitingNotify,
  ErrorNotify,
  SuccessNotify,
  waitingNotify,
} from "../../../hotToaster";

// API hooks (project-level)
import { useGet } from "../../../hooks/useGet";
import { useEdit } from "../../../hooks/useEdit";

/* ------------------------------------------------------------------------ */
/* THEME TOKENS                                                             */
/* ------------------------------------------------------------------------ */

// Drawer width: full width on phones, then a flexible limit that grows
// with the screen. Change these two classes to make it narrower / wider.
const DRAWER_WIDTH = "w-full sm:max-w-xl lg:max-w-2xl";

// Brand gradient used on primary buttons
const BRAND = "bg-gradient-to-r from-amber-500 to-orange-500";

// Keyboard focus ring shared by all buttons
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40";

// Shared single-line input style
const INPUT =
  "h-9 w-full cursor-text rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 disabled:cursor-not-allowed disabled:opacity-60";

// Shared multi-line input style
const TEXTAREA =
  "w-full cursor-text rounded-lg border border-slate-200 bg-white p-3 text-xs font-medium leading-relaxed text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 disabled:cursor-not-allowed disabled:opacity-60";

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
/* HELPERS                                                                  */
/* ------------------------------------------------------------------------ */

// Create a blank clause (uid is a local-only key for React keys / reordering)
const createClause = () => ({
  uid:
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  title: "",
  description: "",
});

// Default clauses pre-filled in a new drawer: consultancy services for
// ISO 21001:2018 (Educational Organizations Management Systems, EOMS).
// Users can edit, reorder or delete any of them before saving.
const DEFAULT_CLAUSES = [
  {
    title: "Scope of Consultancy Services (ISO 21001:2018)",
    description:
      "The consultant shall provide consultancy services for the design, implementation and maintenance of an Educational Organizations Management System (EOMS) in accordance with ISO 21001:2018. Services cover gap analysis, EOMS documentation support, process and policy development, internal auditor training, management review support and pre-certification readiness, within the agreed organizational boundary and project timeline.",
  },
  {
    title: "Client Responsibilities & Access",
    description:
      "The client shall appoint a management representative, give the consultant timely access to relevant personnel, records and facilities, and provide accurate information on learners, educational processes and stakeholder requirements. The client remains responsible for implementing agreed actions and for the day-to-day operation of its EOMS.",
  },
  {
    title: "Fees, Payment & Installment Schedule",
    description:
      "All fees shall be paid in accordance with the agreed installment schedule, with VAT applied as per prevailing law. Payments delayed beyond 7 working days may incur a late fee or a temporary suspension of consultancy deliverables until the outstanding amount is cleared.",
  },
  {
    title: "Confidentiality & Data Protection",
    description:
      "Both parties shall keep all organizational records, learner and staff data, audit findings and proprietary methodologies strictly confidential during and after the contract period, and shall use such information only for the purpose of delivering the services under this agreement.",
  },
  {
    title: "Certification Disclaimer & Termination",
    description:
      "The consultancy supports the client's readiness for ISO 21001:2018 certification; the certification decision rests solely with the accredited certification body, and no certification outcome is guaranteed. Either party may terminate this agreement with 30 days prior written notice, and fees for completed milestones and delivered documentation remain payable.",
  },
];

// Build form clauses from an array (server data or props).
// When the list is empty, fall back to the five default ISO 21001 clauses.
const buildClauses = (list) =>
  Array.isArray(list) && list.length
    ? list.map((clause, index) => {
        const formClause = createClause();
        const stringClause = typeof clause === "string";
        return {
          ...formClause,
          ...(clause && typeof clause === "object" ? clause : {}),
          uid: formClause.uid,
          sourceWasString: stringClause,
          sourceTitle: stringClause ? `Clause ${index + 1}` : undefined,
          title: clause?.title ?? (stringClause ? `Clause ${index + 1}` : ""),
          description:
            clause?.description ?? (stringClause ? clause : ""),
        };
      })
    : DEFAULT_CLAUSES.map((clause) => ({ ...createClause(), ...clause }));

/* ------------------------------------------------------------------------ */
/* API LAYER                                                                */
/* ------------------------------------------------------------------------ */

function useTermsApi() {
  const { getInstallmentsTerms_ } = useGet();
  const { UpdateTermsAndConditions_ } = useEdit();

  const fetchTerms = async (MainID) => {
    const response = await getInstallmentsTerms_.mutateAsync({
      params: { MainID },
    });
    const data = response?.data ?? response;
    if (!Array.isArray(data?.termsCondition)) {
      throw new Error("Invalid Terms & Conditions response.");
    }
    return data;
  };

  const saveTerms = async (MainID, termsCondition) => {
    return UpdateTermsAndConditions_.mutateAsync({
      params: { MainID },
      payload: { termsCondition },
    });
  };

  return { fetchTerms, saveTerms };
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
            className={`relative flex h-full flex-col bg-slate-50 shadow-2xl ${DRAWER_WIDTH}`}
          >
            {/* Header */}

            <header className="relative flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                    <Scale size={17} />
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                    Contract Terms
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
              <main className="h-full overflow-y-auto p-4 sm:p-5">
                {children}
              </main>

              <LoadingOverlay show={loading} label={loadingLabel} />
            </div>

            {/* Footer */}

            {footer && (
              <footer className="shrink-0 border-t border-slate-200 bg-white px-4 py-3.5 sm:px-6">
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
/* TERMS & CONDITIONS DRAWER                                                */
/* ------------------------------------------------------------------------ */

export function TermsAndConditionsDrawer({
  open = true,
  onClose,
  onSaved, // optional: called with the saved result after a successful save
  contract = null,
  embedded = false,
  deferSave = false,
  onDataChange,
  validateOnMount = false,
  onBusyChange,
  initialClauses = null,
}) {
  const formId = useId();
  const api = useTermsApi();

  const contractId =
    contract?.MainID || contract?.mainID || contract?.id || contract?._id || null;

  /* ------------------------------ State ------------------------------ */

  const [clauses, setClauses] = useState(() => buildClauses(initialClauses));
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
    ? "Loading Terms & Conditions..."
    : submitting
    ? "Updating Terms & Conditions..."
    : "Please wait...";

  /* Keep latest initial values without making them effect dependencies,
     so an inline `initialClauses={[...]}` can't wipe edits mid-session. */

  const initialsRef = useRef({});

  initialsRef.current = { initialClauses };

  const onDataChangeRef = useRef(onDataChange);
  onDataChangeRef.current = onDataChange;

  useEffect(() => {
    onDataChangeRef.current?.(clauses);
  }, [clauses]);

  // Keep the latest api object in a ref (its identity changes every render)
  const apiRef = useRef(api);

  apiRef.current = api;

  /* ---------------- Reset + load saved data when drawer opens ---------------- */

  useEffect(() => {
    if (!open) return;

    // 1) reset the form to its defaults
    setClauses(buildClauses(initialsRef.current.initialClauses));
    setErrors({});
    setSubmitting(false);

    if (deferSave) return;

    // 2) no contract => nothing to fetch
    if (!contractId) return;

    // 3) fetch the organization's saved Terms & Conditions
    let cancelled = false; // ignore the response if the drawer closed meanwhile

    (async () => {
      setLoadingInitial(true);

      try {
        const saved = await apiRef.current.fetchTerms(contractId);

        if (cancelled || !saved) return;

        const savedClauses = Array.isArray(saved.termsCondition)
          ? saved.termsCondition
          : [];
        setClauses(buildClauses(savedClauses));
      } catch (err) {
        if (!cancelled) {
          ErrorNotify(
            err?.response?.data?.message ||
              err?.message ||
              "Unable to load Terms & Conditions."
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

  /* ---------------------------- Clause actions ---------------------------- */

  // Append a blank clause
  const addClause = () => {
    setClauses((previous) => [...previous, createClause()]);

    setErrors((previous) => ({ ...previous, form: undefined }));
  };

  // Removed clauses are persisted with the complete array when the form is saved.
  const removeClause = async (clause) => {
    if (clauses.length <= 1 || busy) return;

    // Local helper: drop the clause + its errors from state
    const dropLocally = () => {
      setClauses((previous) =>
        previous.filter((item) => item.uid !== clause.uid)
      );

      setErrors((previous) => {
        const next = { ...previous };
        delete next[clause.uid];
        return next;
      });
    };

    dropLocally();
  };

  // Swap a clause with its neighbour (direction: -1 up, +1 down)
  const moveClause = (index, direction) => {
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= clauses.length) return;

    setClauses((previous) => {
      const next = [...previous];
      const [moved] = next.splice(index, 1);

      next.splice(targetIndex, 0, moved);

      return next;
    });
  };

  // Update one field of one clause and clear its error
  const updateClause = (uid, field, value) => {
    setClauses((previous) =>
      previous.map((clause) =>
        clause.uid === uid ? { ...clause, [field]: value } : clause
      )
    );

    setErrors((previous) => {
      const clauseErrors = previous[uid];

      if (!clauseErrors?.[field] && !previous.form) return previous;

      const next = { ...previous, form: undefined };

      if (clauseErrors?.[field]) {
        const updatedErrors = { ...clauseErrors };

        delete updatedErrors[field];

        next[uid] = updatedErrors;
      }

      return next;
    });
  };

  /* ---------------------------- Validation ---------------------------- */

  const validateAll = () => {
    const nextErrors = {};
    let hasError = false;

    // Need at least one clause
    if (!clauses.length) {
      nextErrors.form = "At least one Terms & Conditions clause is required.";
      hasError = true;
    }

    // Per-clause checks: title + terms text are both required
    clauses.forEach((clause, index) => {
      const clauseErrors = {};

      if (!String(clause.title || "").trim()) {
        clauseErrors.title = `Clause #${index + 1} title is required.`;
      }

      if (!String(clause.description || "").trim()) {
        clauseErrors.description = `Clause #${index + 1} terms cannot be empty.`;
      }

      if (Object.keys(clauseErrors).length > 0) {
        nextErrors[clause.uid] = clauseErrors;
        hasError = true;
      }
    });

    if (hasError && !nextErrors.form) {
      nextErrors.form =
        "Please complete the highlighted clause fields before submitting.";
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (deferSave) return;

    // Ignore double clicks while a request is running
    if (busy) return;

    if (!validateAll()) {
      ErrorNotify("Please complete all required clause fields.");
      return;
    }

    // Body sent to the API
    const termsCondition = clauses.map((clause, index) => {
      const existingFields = { ...clause };
      delete existingFields.uid;
      delete existingFields.sourceWasString;
      delete existingFields.sourceTitle;
      if (clause.sourceWasString && clause.title === clause.sourceTitle) {
        return clause.description.trim();
      }
      return {
        ...existingFields,
        sn: index + 1,
        title: clause.title.trim(),
        description: clause.description.trim(),
      };
    });

    setSubmitting(true); // starts the overlay + progress bar animation

    waitingNotify("Updating Terms & Conditions...");

    try {
      const result = await api.saveTerms(contractId, termsCondition);

      SuccessNotify(
        result?.message ||
          result?.data?.message ||
          "Terms & Conditions updated successfully."
      );

      onSaved?.(result);

      if (!embedded) onClose?.();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to save Terms & Conditions.";

      // Show the server message inside the drawer too
      setErrors((previous) => ({ ...previous, form: message }));

      ErrorNotify(message);
    } finally {
      dismissWaitingNotify("Updating Terms & Conditions...");
      setSubmitting(false); // stops the animation
    }
  };

  // True when any clause (not the form key) still has an error
  const hasClauseErrors = Object.keys(errors).some(
    (key) => key !== "form" && errors[key]
  );

  /* -------------------------------- UI -------------------------------- */

  return (
    <MotionConfig reducedMotion="user">
      <SideDrawer
        open={open}
        onClose={onClose}
        title="Terms & Conditions"
        subtitle={
          contract?.organizationName
            ? `${contract.organizationName}${
                contract.leadId ? ` · ${contract.leadId}` : ""
              }`
            : "Add the clauses of this contract"
        }
        locked={busy}
        loading={busy}
        loadingLabel={loadingLabel}
        embedded={embedded}
        footer={
          <div className="flex items-center justify-between gap-3">
            {/* Clause count */}

            <div className="text-[11px]">
              <span className="text-slate-500">Total Clauses: </span>

              <span className="font-extrabold tabular-nums text-amber-700">
                {clauses.length}
              </span>
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
                form={formId}
                disabled={busy}
                variants={btnVariants}
                {...press(busy)}
                transition={softSpring}
                className={`flex h-10 min-w-[150px] cursor-pointer items-center justify-center gap-2 rounded-lg px-5 text-xs font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-70 ${BRAND} ${FOCUS}`}
              >
                {submitting
                  ? <LoaderCircle className="h-3 w-3 animate-spin text-white" strokeWidth={2.5} />
                  : <CheckCircle2 size={15} />}
                Update Terms
              </motion.button>}
            </div>
          </div>
        }
      >
        <form id={formId} onSubmit={handleSubmit} noValidate>
          <motion.div
            className="space-y-4"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {/* ------------------------ Clauses builder ------------------------ */}

            <motion.section
              variants={fadeUp}
              aria-label="Terms and conditions clauses"
              className="overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              {/* Section header */}

              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3.5">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900">
                    Contract Clauses
                  </h3>

                  <p className="mt-1 text-[11px] text-slate-400">
                    {clauses.length} {clauses.length === 1 ? "clause" : "clauses"}{" "}
                    · Use arrows to reorder
                  </p>
                </div>

                <motion.button
                  type="button"
                  onClick={addClause}
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
                  Add Clause
                </motion.button>
              </div>

              {/* Clause list */}

              <div className="space-y-3 p-3.5 sm:p-4">
                {/* initial={false}: clauses present on open ride the section's
                    fade-up; only clauses added later animate on their own. */}

                <AnimatePresence initial={false}>
                  {clauses.map((clause, index) => {
                    const clauseErrors = errors[clause.uid] || {};

                    const isFirst = index === 0;
                    const isLast = index === clauses.length - 1;
                    return (
                      <motion.div
                        key={clause.uid}
                        layout
                        initial={{ opacity: 0, y: 22 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={{ duration: 0.5, ease: EASE_OUT }}
                        className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 transition-colors hover:border-amber-200"
                      >
                        {/* Clause header: number + reorder / delete */}

                        <div className="mb-3 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-100 text-[11px] font-extrabold tabular-nums text-amber-800">
                              {index + 1}
                            </span>

                            <span className="text-xs font-extrabold text-slate-800">
                              Clause #{index + 1}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveClause(index, -1)}
                              disabled={busy || isFirst}
                              aria-label={`Move clause ${index + 1} up`}
                              title="Move up"
                              className={`cursor-pointer rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-30 ${FOCUS}`}
                            >
                              <ArrowUp size={13} />
                            </button>

                            <button
                              type="button"
                              onClick={() => moveClause(index, 1)}
                              disabled={busy || isLast}
                              aria-label={`Move clause ${index + 1} down`}
                              title="Move down"
                              className={`cursor-pointer rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-30 ${FOCUS}`}
                            >
                              <ArrowDown size={13} />
                            </button>

                            <button
                              type="button"
                              onClick={() => removeClause(clause)}
                              disabled={busy || clauses.length <= 1}
                              aria-label={`Delete clause ${index + 1}`}
                              title="Delete clause"
                              className={`cursor-pointer rounded-md border border-red-100 bg-white p-1.5 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30 ${FOCUS}`}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Clause Title */}

                        <div>
                          <label className="mb-1 block text-[11px] font-bold text-slate-700">
                            Clause Title
                          </label>

                          <input
                            type="text"
                            value={clause.title}
                            disabled={busy}
                            onChange={(event) =>
                              updateClause(
                                clause.uid,
                                "title",
                                event.target.value
                              )
                            }
                            placeholder="e.g. Confidentiality & Data Protection"
                            className={`${INPUT} ${
                              clauseErrors.title
                                ? "border-red-400 bg-red-50/50 focus:border-red-500"
                                : ""
                            }`}
                          />

                          {clauseErrors.title && (
                            <p className="mt-1 text-[10px] font-semibold text-red-600">
                              {clauseErrors.title}
                            </p>
                          )}
                        </div>

                        {/* Clause Terms & Conditions */}

                        <div className="mt-3">
                          <label className="mb-1 block text-[11px] font-bold text-slate-700">
                            Clause Terms & Conditions
                          </label>

                          <textarea
                            rows={4}
                            value={clause.description}
                            disabled={busy}
                            onChange={(event) =>
                              updateClause(
                                clause.uid,
                                "description",
                                event.target.value
                              )
                            }
                            placeholder="Write the terms for this clause..."
                            className={`${TEXTAREA} ${
                              clauseErrors.description
                                ? "border-red-400 bg-red-50/50 focus:border-red-500"
                                : ""
                            }`}
                          />

                          {clauseErrors.description && (
                            <p className="mt-1 text-[10px] font-semibold text-red-600">
                              {clauseErrors.description}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.section>

            {/* ------------------------ Validation banner ------------------------ */}

            <AnimatePresence>
              {(errors.form || hasClauseErrors) && (
                <motion.div
                  role="alert"
                  initial={{ opacity: 0, height: 0, y: -6 }}
                  animate={{ opacity: 1, height: "auto", y: [0, -3, 0] }}
                  exit={{ opacity: 0, height: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[11px] font-semibold text-red-700"
                >
                  {errors.form ||
                    "Please check the highlighted clauses before submitting."}
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

export const TermsAndConditions = ({
  open = true,
  onClose,
  onSaved,
  contract,
  embedded = false,
  onBusyChange,
}) => {
  return (
    <TermsAndConditionsDrawer
      open={open}
      onClose={onClose}
      onSaved={onSaved}
      contract={contract}
      embedded={embedded}
      onBusyChange={onBusyChange}
    />
  );
};

export default TermsAndConditionsDrawer;