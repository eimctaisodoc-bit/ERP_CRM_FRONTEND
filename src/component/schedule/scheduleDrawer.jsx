import React, { useEffect, useRef, useState } from "react";
import { Building2, CalendarDays, ClipboardList, Clock3, MapPin, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Skeleton } from "../skeleton";

export default function ScheduleDrawer({ isOpen, onClose, fromDate, toDate, activities = [] }) {
    const [isRendered, setIsRendered] = useState(isOpen);
    const [isEntered, setIsEntered] = useState(false);
    const [isContentReady, setIsContentReady] = useState(false);
    const closeTimeoutRef = useRef(null);
    const shouldReduceMotion = useReducedMotion();

    useEffect(() => {
        window.clearTimeout(closeTimeoutRef.current);

        if (isOpen) {
            setIsRendered(true);
            setIsContentReady(false);
            const frame = window.requestAnimationFrame(() => setIsEntered(true));
            return () => window.cancelAnimationFrame(frame);
        }

        setIsEntered(false);
        closeTimeoutRef.current = window.setTimeout(() => setIsRendered(false), 500);
        return () => window.clearTimeout(closeTimeoutRef.current);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return undefined;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isRendered) return null;

    const rangeStart = fromDate || toDate;
    const rangeEnd = toDate || fromDate;
    const relatedActivities = activities.filter((activity) => {
        const activityStart = activity.Fromdate || activity.date;
        const activityEnd = activity.toDate || activityStart;
        return activityStart && rangeStart && rangeEnd &&
            activityStart <= rangeEnd && activityEnd >= rangeStart;
    });

    return (
        <div className={`fixed inset-0 z-60 overflow-hidden ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`} role="presentation">
            <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: isEntered ? 1 : 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.35 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={onClose}
                aria-label="Close schedule details"
                tabIndex={isOpen ? 0 : -1}
            />
            <motion.aside
                role="dialog"
                aria-modal="true"
                aria-labelledby="schedule-drawer-title"
                aria-hidden={!isOpen}
                initial={{ y: shouldReduceMotion ? 0 : "100%", opacity: shouldReduceMotion ? 1 : 0 }}
                animate={{
                    y: isEntered || shouldReduceMotion ? 0 : "100%",
                    opacity: isEntered || shouldReduceMotion ? 1 : 0,
                }}
                transition={{
                    duration: shouldReduceMotion ? 0 : 0.45,
                    ease: [0.22, 1, 0.36, 1],
                }}
                onAnimationComplete={() => {
                    if (isOpen && isEntered) setIsContentReady(true);
                }}
                className="absolute inset-0 flex h-full w-full flex-col bg-white shadow-2xl"
            >
                <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Schedule</p>
                        <h2 id="schedule-drawer-title" className="mt-1 text-xl font-bold text-slate-900">Schedule details</h2>
                        <p className="mt-1 text-sm text-slate-500">Selected dates and existing activity in this period.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                        aria-label="Close drawer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-6">
                    <AnimatePresence mode="wait" initial={false}>
                        {!isContentReady ? (
                            <motion.div
                                key="schedule-skeleton"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                                className="space-y-6"
                                role="status"
                                aria-label="Loading schedule details"
                            >
                                <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
                                    <Skeleton className="mb-3 h-4 w-32 rounded-md" />
                                    <Skeleton className="h-4 w-48 max-w-full rounded-md" />
                                </div>
                                <section className="space-y-3">
                                    <Skeleton className="mb-4 h-5 w-56 max-w-full rounded-md" />
                                    {[3, 4].map((index) => (
                                        <div key={index} className="space-y-3 rounded-xl border border-slate-200 p-4">
                                            <Skeleton className="h-4 w-2/3 rounded-md" />
                                            <Skeleton className="h-3 w-1/2 rounded-md" />
                                            <Skeleton className="h-3 w-3/4 rounded-md" />
                                        </div>
                                    ))}
                                </section>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="schedule-content"
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: "easeOut" }}
                                className="space-y-6"
                            >
                                <section className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
                                    <div className="flex items-start gap-3">
                                        <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-900">Selected period</h3>
                                            <p className="mt-1 text-sm text-slate-700">
                                                {rangeStart
                                                    ? rangeStart === rangeEnd
                                                        ? rangeStart
                                                        : `${rangeStart} – ${rangeEnd}`
                                                    : "No dates selected"}
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <div className="mb-3 flex items-center gap-2">
                                        <ClipboardList className="h-5 w-5 text-slate-500" />
                                        <h3 className="text-sm font-semibold text-slate-900">Related schedule information</h3>
                                        <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                            {relatedActivities.length}
                                        </span>
                                    </div>

                                    {relatedActivities.length > 0 ? (
                                        <div className="space-y-3">
                                            {relatedActivities.map((activity, index) => {
                                                const start = activity.Fromdate || activity.date;
                                                const end = activity.toDate || start;
                                                const organization = activity.client || activity.organization?.organizationName;

                                                return (
                                                    <article key={activity.id ?? `${activity.title}-${index}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <h4 className="font-semibold text-slate-900">{activity.title || "Untitled schedule"}</h4>
                                                            {activity.type && (
                                                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                                                    {activity.type}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {activity.desc && <p className="mt-2 text-sm text-slate-600">{activity.desc}</p>}
                                                        <div className="mt-4 space-y-2 text-sm text-slate-600">
                                                            <p className="flex items-start gap-2">
                                                                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                                                                <span>{start}{end && end !== start ? ` – ${end}` : ""}</span>
                                                            </p>
                                                            {(activity.Fromtime || activity.toTime) && (
                                                                <p className="flex items-start gap-2">
                                                                    <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                                                                    <span>{activity.Fromtime || "Time not set"}{activity.toTime ? ` – ${activity.toTime}` : ""}</span>
                                                                </p>
                                                            )}
                                                            {organization && (
                                                                <p className="flex items-start gap-2">
                                                                    <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                                                                    <span>{organization}</span>
                                                                </p>
                                                            )}
                                                            {activity.location && (
                                                                <p className="flex items-start gap-2">
                                                                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                                                                    <span>{activity.location}</span>
                                                                </p>
                                                            )}
                                                        </div>
                                                    </article>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
                                            <p className="text-sm font-medium text-slate-700">No existing activities overlap this period.</p>
                                            <p className="mt-1 text-xs text-slate-500">The selected date range is ready for scheduling.</p>
                                        </div>
                                    )}
                                </section>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.aside>
        </div>
    );
}
