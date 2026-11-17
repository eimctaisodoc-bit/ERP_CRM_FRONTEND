import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    AlertCircle,
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    BadgeCheck,
    Briefcase,
    Building2,
    CalendarClock,
    CalendarPlus,
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Download,
    Eye,
    GitBranch,
    Hash,
    Loader2,
    Mail,
    MapPin,
    MapPinned,
    MoreHorizontal,
    Pencil,
    Phone,
    Plus,
    Power,
    RefreshCw,
    Search,
    Send,
    ShieldCheck,
    Trash2,
    User,
    UserCheck,
    UserRoundCog,
    UserX,
    Users,
    X
} from "lucide-react";
import { AnimatePresence, animate, motion, MotionConfig, useReducedMotion } from "framer-motion";
import Select from "react-select";

import { getAllBranch, getUserCredit } from "../../api/role.api";
import { UseDelete } from "../hooks/useDelete";
import { useEdit } from "../hooks/useEdit";
import { waitingNotify, ErrorNotify, SuccessNotify } from "../hotToaster";
import { RegisterModal_Admin } from "./setting/Registermodal_admin";

/* -------------------------------------------------------------------------- */
/* Constants & shared styles (theme: slate neutrals + amber -> orange accent) */
/* -------------------------------------------------------------------------- */

const NEPAL_PROVINCE_COUNT = 7;
const PAGE_SIZE = 10;

const FONT = { fontFamily: "'Roboto Slab', serif" };
const EASE_OUT = [0.22, 1, 0.36, 1];
const nf = new Intl.NumberFormat("en-IN");

const BRAND = "bg-gradient-to-r from-amber-500 to-orange-500";
const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40";
const INPUT = "h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10";
const CARD = "rounded-xl border border-slate-200 bg-white shadow-sm";

const btnBase = `inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS}`;
const btnPrimary = `${btnBase} ${BRAND} font-bold text-white shadow-sm`;
const btnSecondary = `${btnBase} border border-slate-200 bg-white text-slate-600 hover:bg-slate-50`;
const btnGhost = `${btnBase} text-amber-600 hover:bg-amber-50 disabled:text-slate-300 disabled:hover:bg-transparent disabled:opacity-100`;
const btnDanger = `${btnBase} bg-red-600 text-white hover:bg-red-700 disabled:opacity-70`;
const btnDangerOutline = `${btnBase} border border-red-200 bg-white text-red-600 hover:bg-red-50`;
const btnOutlineSm = `inline-flex min-h-9 cursor-pointer items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS}`;
const iconBtn = `inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-amber-50 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS}`;

const STATUS_OPTIONS = [
    { value: "all", label: "All statuses" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" }
];

// Branch tab first, then one tab per account role.
const ACCOUNT_TABS = {
    // admin: { label: "Admins", singular: "Admin", icon: ShieldCheck, hint: "Search admins by name, username, or email" },
    staff: { label: "Staff", singular: "Staff", icon: Briefcase, hint: "Search staff by name, username, or email" },
    client: { label: "Clients", singular: "Client", icon: Building2, hint: "Search clients by name, username, or email" }
};
const TAB_ORDER = ["branches", "staff", "client"];

// react-select theme: slate border, amber focus, orange selected option.
const selectStyles = {
    control: (base, state) => ({
        ...base,
        minHeight: 40,
        borderRadius: 8,
        backgroundColor: state.isFocused ? "#FFFFFF" : "#F8FAFC",
        borderColor: state.isFocused ? "#F59E0B" : "#E2E8F0",
        boxShadow: state.isFocused ? "0 0 0 2px #F59E0B1A" : "none",
        cursor: state.isDisabled ? "not-allowed" : "pointer",
        opacity: state.isDisabled ? 0.6 : 1,
        fontSize: 12,
        fontFamily: "'Roboto Slab', serif",
        "&:hover": { borderColor: "#F59E0B" }
    }),
    valueContainer: (base) => ({ ...base, padding: "0 12px" }),
    singleValue: (base) => ({ ...base, color: "#1E293B", fontWeight: 500 }),
    placeholder: (base) => ({ ...base, color: "#64748B", fontWeight: 500 }),
    input: (base) => ({ ...base, color: "#1E293B" }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (base, state) => ({ ...base, color: state.isFocused ? "#F59E0B" : "#94A3B8", "&:hover": { color: "#F59E0B" } }),
    menu: (base) => ({ ...base, backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 9, boxShadow: "0 10px 15px -3px rgba(15,23,42,0.12)", overflow: "hidden", fontSize: 12, fontFamily: "'Roboto Slab', serif" }),
    menuPortal: (base) => ({ ...base, zIndex: 300 }),
    option: (base, state) => ({
        ...base,
        fontSize: 12,
        fontWeight: 500,
        cursor: "pointer",
        backgroundColor: state.isSelected ? "#F97316" : state.isFocused ? "#FFF7ED" : "#FFFFFF",
        color: state.isSelected ? "#FFFFFF" : "#1E293B",
        "&:active": { backgroundColor: "#FDBA74" }
    })
};

// Single dropdown used everywhere on this page. `value` / `onChange` use plain strings.
const SelectField = ({ label, options, value, onChange, disabled = false, searchable = false, className = "w-full" }) => (
    <div className={className}>
        <Select
            aria-label={label}
            options={options}
            value={options.find((option) => option.value === value) ?? null}
            onChange={(option) => onChange(option ? option.value : "")}
            isDisabled={disabled}
            isSearchable={searchable}
            styles={selectStyles}
            menuPlacement="auto"
            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
        />
    </div>
);

/* -------------------------------------------------------------------------- */
/* Data helpers (field names follow the existing branch / employee APIs)      */
/* -------------------------------------------------------------------------- */

const responseRecords = (response) => {
    const body = response?.data ?? response;
    const records = body?.data ?? body;
    return Array.isArray(records) ? records : null;
};

const normalize = (value) => String(value ?? "").trim().toLocaleLowerCase();

const getBranchLocation = (branch) => ({
    province: String(branch.provinceName || branch.province || branch.Prvince || "").trim(),
    district: String(branch.district || branch.districtName || branch.districts || "").trim(),
    localLevel: String(branch.localLevelName || branch.localLevel || "").trim()
});

const getEmployeeLocation = (employee) => ({
    province: String(employee.provinceName || employee.province || "").trim(),
    district: String(employee.district || employee.districtName || "").trim(),
    localLevel: String(employee.localLevelName || employee.localLevel || "").trim()
});

// A staff member belongs to a branch through the recruitment reference first,
// then through an exact province / district / local-level match.
const employeeMatchesBranch = (employee, branch) => {
    if (employee.recruitmentId && branch.recruitment &&
        String(employee.recruitmentId) === String(branch.recruitment)) {
        return true;
    }
    const e = getEmployeeLocation(employee);
    const b = getBranchLocation(branch);
    if (!b.localLevel) return false; // never match "unknown" against "unknown"
    return normalize(e.province) === normalize(b.province) &&
        normalize(e.district) === normalize(b.district) &&
        normalize(e.localLevel) === normalize(b.localLevel);
};

const employeeDisplayName = (employee) =>
    employee.fullName || employee.fullname || employee.username || "Unnamed employee";

const dash = (value) => (value === undefined || value === null || value === "" ? "—" : value);

const getInitials = (name) =>
    String(name ?? "").replace(/[^a-zA-Z ]/g, "").split(" ").filter(Boolean).map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "??";

const AVATAR_COLORS = [
    "bg-amber-50 text-amber-700",
    "bg-orange-50 text-orange-600",
    "bg-slate-100 text-slate-600",
    "bg-emerald-50 text-emerald-700",
    "bg-sky-50 text-sky-700"
];
const getColorIndex = (name = "") =>
    String(name).split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length;

const formatDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const csvCell = (value) => {
    let text = String(value ?? "");
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`; // block spreadsheet formula injection
    return `"${text.replace(/"/g, '""')}"`;
};

const downloadCsv = (filename, rows) => {
    const csv = "\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
};

const getRoleBadge = (role) => {
    const r = normalize(role);
    if (r === "admin") return "border-violet-200 bg-violet-50 text-violet-700";
    if (r === "staff") return "border-sky-200 bg-sky-50 text-sky-700";
    if (r === "client") return "border-emerald-200 bg-emerald-50 text-emerald-700";
    return "border-slate-200 bg-slate-50 text-slate-600";
};

/* -------------------------------------------------------------------------- */
/* Small presentational pieces                                                */
/* -------------------------------------------------------------------------- */

const PrimaryButton = ({ children, disabled, className = "", ...props }) => (
    <motion.button
        type="button"
        whileHover={disabled ? undefined : { scale: 1.02 }}
        whileTap={disabled ? undefined : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        disabled={disabled}
        className={`${btnPrimary} ${className}`}
        {...props}
    >
        {children}
    </motion.button>
);

const Avatar = ({ name, large }) => (
    <div className={`flex shrink-0 items-center justify-center rounded-full font-bold ${large ? "h-12 w-12 text-base" : "h-8 w-8 text-[11px] sm:h-9 sm:w-9 sm:text-xs"} ${AVATAR_COLORS[getColorIndex(name)]}`}>
        {getInitials(name)}
    </div>
);

const StatusBadge = ({ active }) => (
    <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${active
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-slate-200 bg-slate-50 text-slate-600"
            }`}
    >
        <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-slate-400"}`} />
        {active ? "Active" : "Inactive"}
    </span>
);

const Bone = ({ className = "", style }) => <div className={`animate-pulse rounded bg-slate-200/80 ${className}`} style={style} />;

const CountUp = ({ value }) => {
    const reduce = useReducedMotion();
    const [display, setDisplay] = useState(reduce ? value : 0);
    useEffect(() => {
        if (reduce) {
            setDisplay(value);
            return undefined;
        }
        const controls = animate(0, value, { duration: 0.8, ease: "easeOut", onUpdate: (v) => setDisplay(Math.round(v)) });
        return () => controls.stop();
    }, [value, reduce]);
    return <>{nf.format(display)}</>;
};

const STAT_TONES = {
    orange: { box: "bg-orange-50 text-orange-600", bar: BRAND },
    amber: { box: "bg-amber-50 text-amber-600", bar: BRAND },
    green: { box: "bg-emerald-50 text-emerald-600", bar: "bg-emerald-500" },
    slate: { box: "bg-slate-100 text-slate-500", bar: "bg-slate-400" }
};

const StatCard = ({ icon: Icon, label, value, total, hint, loading, tone = "amber", index = 0 }) => {
    const t = STAT_TONES[tone];
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    if (loading) {
        return (
            <div className={`${CARD} p-3.5 sm:p-4`}>
                <div className="flex items-start justify-between gap-3">
                    <Bone className="h-3 w-20" />
                    <Bone className="h-9 w-9 rounded-lg sm:h-10 sm:w-10" />
                </div>
                <Bone className="mt-1.5 h-5 w-12" />
                <Bone className="mt-3 h-1.5 w-full rounded-full" />
            </div>
        );
    }
    return (
        <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.07, duration: 0.35, ease: "easeOut" }}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            className={`${CARD} p-3.5 sm:p-4`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate text-xs font-medium leading-4 text-slate-600">{label}</p>
                    <p className="mt-1.5 text-lg font-extrabold leading-none tabular-nums text-slate-900 sm:text-xl"><CountUp value={value} /></p>
                </div>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 ${t.box}`}>
                    <Icon size={18} aria-hidden="true" />
                </div>
            </div>
            {total > 0 ? (
                <div className="mt-3 h-1.5 overflow-hidden rounded-full border border-slate-200 bg-slate-50">
                    <motion.div
                        className={`h-full ${t.bar}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: index * 0.07 + 0.2, duration: 0.7, ease: "easeOut" }}
                    />
                </div>
            ) : hint ? (
                <p className="mt-3 truncate text-[10px] font-medium leading-3 text-slate-800">{hint}</p>
            ) : null}
        </motion.div>
    );
};

const EmptyState = ({ icon: Icon, title, text, action }) => (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-amber-50 text-amber-600">
            <Icon size={20} aria-hidden="true" />
        </span>
        <h3 className="mt-3 text-sm font-bold text-slate-900 sm:text-base">{title}</h3>
        {text && <p className="mt-1 max-w-md text-xs text-slate-500">{text}</p>}
        {action && <div className="mt-4">{action}</div>}
    </div>
);

const Field = ({ label, children }) => (
    <div className="min-w-0">
        <dt className="text-[11px] font-medium text-slate-400">{label}</dt>
        <dd className="mt-0.5 break-words text-xs font-bold text-slate-800 sm:text-sm">{children}</dd>
    </div>
);

const thCls = "px-4 py-2.5 text-left text-[11px] font-bold whitespace-nowrap text-slate-500";

const SortHeader = ({ label, sortKey, sort, onSort }) => {
    const active = sort.key === sortKey;
    const Icon = !active ? ArrowUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;
    return (
        <th scope="col" aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"} className={thCls}>
            <button
                type="button"
                onClick={() => onSort(sortKey)}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md font-bold hover:text-slate-800 ${FOCUS}`}
            >
                {label}
                <Icon size={13} className={active ? "text-amber-600" : "text-slate-400"} aria-hidden="true" />
            </button>
        </th>
    );
};

const Th = ({ children, right }) => <th scope="col" className={`${thCls} ${right ? "text-right" : ""}`}>{children}</th>;

const SkeletonRows = ({ columns, rows = 10 }) =>
    Array.from({ length: rows }).map((_, row) => (
        <tr key={row} className="border-b border-slate-100">
            {Array.from({ length: columns }).map((__, col) => (
                <td key={col} className="px-4 py-3">
                    <Bone className="h-4" style={{ width: `${55 + ((row + col) % 4) * 12}%` }} />
                </td>
            ))}
        </tr>
    ));

const Pagination = ({ page, pageCount, total, noun, onChange }) => {
    if (total === 0) return null;
    const start = (page - 1) * PAGE_SIZE + 1;
    const end = Math.min(page * PAGE_SIZE, total);
    return (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-white px-3 py-3 text-xs text-slate-500 sm:flex-row sm:px-4">
            <span>Showing {nf.format(start)} to {nf.format(end)} of {nf.format(total)} {noun}</span>
            <nav className="flex items-center gap-2" aria-label="Pagination">
                <button type="button" className={btnOutlineSm} disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
                    <ChevronLeft size={15} /> Previous
                </button>
                <span className="px-1 text-xs font-semibold tabular-nums text-slate-600">Page {page} of {pageCount}</span>
                <button type="button" className={btnOutlineSm} disabled={page >= pageCount} onClick={() => onChange(page + 1)} aria-label="Next page">
                    Next <ChevronRight size={15} />
                </button>
            </nav>
        </div>
    );
};

// Menu is positioned with `fixed` so the table's horizontal scroll container cannot clip it.
const RowMenu = ({ items, disabled, label }) => {
    const buttonRef = useRef(null);
    const [pos, setPos] = useState(null);

    useEffect(() => {
        if (!pos) return undefined;
        const close = () => setPos(null);
        window.addEventListener("scroll", close, true);
        window.addEventListener("resize", close);
        return () => {
            window.removeEventListener("scroll", close, true);
            window.removeEventListener("resize", close);
        };
    }, [pos]);

    const toggle = (event) => {
        event.stopPropagation();
        if (pos) return setPos(null);
        const rect = buttonRef.current.getBoundingClientRect();
        return setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    };

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                className={iconBtn}
                disabled={disabled}
                onClick={toggle}
                aria-haspopup="menu"
                aria-expanded={Boolean(pos)}
                aria-label={label}
                title={label}
            >
                <MoreHorizontal size={16} />
            </button>
            {pos && (
                <>
                    <div className="fixed inset-0 z-[80]" onClick={() => setPos(null)} />
                    <motion.div
                        role="menu"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15 }}
                        style={{ top: pos.top, right: pos.right, ...FONT }}
                        className="fixed z-[90] w-52 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 text-xs shadow-xl"
                    >
                        {items.map(({ icon: Icon, label: itemLabel, onSelect, danger }) => (
                            <button
                                key={itemLabel}
                                type="button"
                                role="menuitem"
                                onClick={() => { setPos(null); onSelect(); }}
                                className={`flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2 text-left font-medium transition ${danger ? "text-red-600 hover:bg-red-50" : "text-slate-800 hover:bg-slate-50"
                                    }`}
                            >
                                <Icon size={15} aria-hidden="true" /> {itemLabel}
                            </button>
                        ))}
                    </motion.div>
                </>
            )}
        </>
    );
};

const Scrim = ({ onClick }) => (
    <motion.div
        className="absolute inset-0 bg-black/60"
        style={{ backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClick}
    />
);

const ConfirmDialog = ({ config, busy, onConfirm, onCancel }) => {
    const [typed, setTyped] = useState("");
    const [error, setError] = useState("");
    const { title, body, confirmLabel, cancelLabel = "Cancel", danger, requireText } = config;

    const submit = () => {
        if (requireText && typed !== requireText) {
            setError(`Type "${requireText}" exactly to continue.`);
            return;
        }
        onConfirm();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6" style={FONT}>
            <Scrim onClick={onCancel} />
            <motion.div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-title"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                onClick={(event) => event.stopPropagation()}
                className="relative max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl sm:p-5"
            >
                <div className="flex items-start gap-3">
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${danger ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-600"}`}>
                        <AlertCircle size={20} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                        <h2 id="confirm-title" className="text-sm font-bold text-slate-900 sm:text-base">{title}</h2>
                        <p className="mt-1 text-xs text-slate-500">{body}</p>
                        {requireText && (
                            <div className="mt-4">
                                <label className="mb-1.5 block text-xs font-bold text-slate-900" htmlFor="confirm-input">
                                    Type <span className="font-extrabold text-red-600">{requireText}</span> to confirm
                                </label>
                                <input
                                    id="confirm-input"
                                    autoFocus
                                    value={typed}
                                    onChange={(event) => { setTyped(event.target.value); setError(""); }}
                                    onKeyDown={(event) => { if (event.key === "Enter") submit(); }}
                                    className={`${INPUT} ${error ? "!border-red-300 !bg-red-50" : ""}`}
                                />
                                {error && <p className="mt-1 text-xs font-medium text-red-700">{error}</p>}
                            </div>
                        )}
                    </div>
                </div>
                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button type="button" autoFocus={!requireText} className={`${btnSecondary} px-4`} onClick={onCancel} disabled={busy}>{cancelLabel}</button>
                    <button type="button" className={`${danger ? btnDanger : btnPrimary} px-4`} onClick={submit} disabled={busy}>
                        {busy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        {confirmLabel}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

/* -------------------------------------------------------------------------- */
/* Drawers (branch + admin / staff / client)                                  */
/* -------------------------------------------------------------------------- */

const DrawerShell = ({ labelId, onClose, children }) => (
    <div className="fixed inset-0 z-[100]" style={FONT}>
        <Scrim onClick={onClose} />
        <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelId}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute right-0 top-0 flex h-full w-full flex-col bg-white text-xs text-slate-800 shadow-2xl sm:max-w-md"
        >
            {children}
        </motion.aside>
    </div>
);

const DrawerHeader = ({ onClose, closeLabel, children }) => (
    <header className="relative border-b border-slate-200 bg-white px-4 py-3 sm:px-5 sm:py-4">
        <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className={`absolute right-3 top-3 cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-800 ${FOCUS}`}
        >
            <X size={18} />
        </button>
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="flex items-center gap-3 pr-10">
            {children}
        </motion.div>
    </header>
);

const DrawerTitle = ({ eyebrow, id, title, chip, children }) => (
    <div className="min-w-0">
        <p className="text-[11px] font-extrabold text-amber-600">{eyebrow}</p>
        <h2 id={id} className="mt-0.5 truncate text-sm font-bold leading-tight text-slate-900 sm:text-base">{title}</h2>
        {chip && (
            <span className="mt-1.5 inline-block max-w-full truncate rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">{chip}</span>
        )}
        {children && <div className="mt-2 flex flex-wrap items-center gap-2">{children}</div>}
    </div>
);

// A section card: slate-50 header strip with an amber icon, then icon fields or custom children.
const DrawerSection = ({ title, icon: HeaderIcon, count, order = 0, fields, flush, children }) => (
    <section className={`${CARD} overflow-hidden`}>
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
            {HeaderIcon && <HeaderIcon size={14} className="text-amber-600" aria-hidden="true" />}
            <h3 className="text-xs font-medium text-slate-500">
                {title}{count !== undefined && <span className="ml-1 tabular-nums">({count})</span>}
            </h3>
        </div>
        {fields ? (
            <div className="divide-y divide-slate-100">
                {fields.map(({ icon: Icon, label, value, mono, capitalize }, i) => (
                    <motion.div
                        key={label}
                        initial={{ x: 24, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.15 + order * 0.08 + i * 0.04, duration: 0.3, ease: "easeOut" }}
                        className="flex items-center gap-3 px-4 py-2.5"
                    >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                            <Icon size={16} aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] font-medium text-slate-400">{label}</p>
                            <p className={`break-words text-slate-800 ${mono ? "font-mono text-[11px] font-medium" : "text-xs font-bold sm:text-sm"} ${capitalize ? "capitalize" : ""}`}>
                                {dash(value)}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        ) : (
            <motion.div
                initial={{ x: 24, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.15 + order * 0.08, duration: 0.3, ease: "easeOut" }}
                className={flush ? "" : "p-3"}
            >
                {children}
            </motion.div>
        )}
    </section>
);

const DrawerFooter = ({ children }) => (
    <motion.footer
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{ boxShadow: "0 -4px 12px rgba(0,0,0,0.04)" }}
        className="grid grid-cols-2 gap-2 border-t border-slate-200 bg-white px-3 py-3 sm:px-4"
    >
        {children}
    </motion.footer>
);

const drawerBody = "flex-1 space-y-4 overflow-y-auto bg-slate-50 p-3 sm:p-5";

const BranchDrawer = ({ branch, busyKey, onClose, onEdit, onToggleStatus, onSendCredentials, onDelete, onOpenEmployee }) => (
    <DrawerShell labelId="branch-drawer-title" onClose={onClose}>
        <DrawerHeader onClose={onClose} closeLabel="Close branch details">
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white shadow-sm sm:h-11 sm:w-11 ${BRAND}`}>
                <Building2 size={20} aria-hidden="true" />
            </span>
            <DrawerTitle
                eyebrow="Branch"
                id="branch-drawer-title"
                title={branch.name}
                chip={[branch.location.localLevel, branch.location.district, branch.location.province].filter(Boolean).join(", ") || "Location not set"}
            >
                <StatusBadge active={branch.isActive} />
            </DrawerTitle>
        </DrawerHeader>

        <div className={drawerBody}>
            <DrawerSection title="Branch overview" icon={MapPin} order={0} fields={[
                { icon: MapPin, label: "Province", value: branch.location.province },
                { icon: MapPinned, label: "District", value: branch.location.district },
                { icon: Building2, label: "Local level", value: branch.location.localLevel },
                { icon: Hash, label: "Ward", value: branch.wardNo },
                { icon: Mail, label: "Branch email", value: branch.officeEmail },
                { icon: Phone, label: "Branch phone", value: branch.officeMobile }
            ]} />

            {branch.managerName ? (
                <DrawerSection title="Branch manager" icon={UserRoundCog} order={1} fields={[
                    { icon: UserRoundCog, label: "Name", value: branch.managerName },
                    { icon: User, label: "Username", value: branch.username },
                    { icon: Briefcase, label: "Job position", value: branch.jobRole },
                    { icon: BadgeCheck, label: "Department", value: branch.designation }
                ]} />
            ) : (
                <DrawerSection title="Branch manager" icon={UserRoundCog} order={1}>
                    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                        <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                        <div>
                            No branch manager is recorded for this branch.
                            <button type="button" onClick={() => onEdit(branch)} className={`ml-1 cursor-pointer rounded font-semibold text-amber-600 underline ${FOCUS}`}>
                                Edit branch
                            </button>
                        </div>
                    </div>
                </DrawerSection>
            )}

            <DrawerSection title="Branch team" icon={Users} count={branch.team.length} order={2} flush={branch.team.length > 0}>
                {branch.team.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-xs text-slate-500">
                        No staff are linked to this branch. Staff appear here when their recruitment record or location matches the branch.
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {branch.team.map((employee) => (
                            <li key={employee._id}>
                                <motion.button
                                    type="button"
                                    whileHover={{ x: 3 }}
                                    transition={{ type: "spring", stiffness: 180, damping: 22 }}
                                    onClick={() => onOpenEmployee(employee._id)}
                                    className={`flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-amber-50/40 ${FOCUS}`}
                                >
                                    <Avatar name={employeeDisplayName(employee)} />
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate text-xs font-bold text-slate-900">{employeeDisplayName(employee)}</div>
                                        <div className="truncate text-[11px] font-medium text-slate-400">
                                            {[employee.jobRole, employee.designation].filter(Boolean).join(" · ") || "Position not set"}
                                        </div>
                                    </div>
                                    <ChevronRight size={14} className="shrink-0 text-slate-400" aria-hidden="true" />
                                </motion.button>
                            </li>
                        ))}
                    </ul>
                )}
            </DrawerSection>

            <DrawerSection title="Handled clients" icon={Briefcase} order={3}>
                <div className="space-y-2">
                    {[
                        { id: 1, name: "Everest Secondary School", code: "EIMCTA-001", service: "ISO 21001:2018", status: "Active" },
                        { id: 2, name: "Himalayan Academy", code: "EIMCTA-002", service: "ISO Documentation", status: "Active" },
                        { id: 3, name: "Sunrise English School", code: "EIMCTA-003", service: "ISO Implementation", status: "Pending" }
                    ].map((client) => (
                        <div key={client.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-2.5">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                                    <Building2 size={16} aria-hidden="true" />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-xs font-bold text-slate-900">{client.name}</p>
                                    <p className="truncate text-[11px] font-medium text-slate-400">{client.code} · {client.service}</p>
                                </div>
                            </div>
                            <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${client.status === "Active"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                                }`}>
                                {client.status}
                            </span>
                        </div>
                    ))}
                </div>
            </DrawerSection>
        </div>

        <DrawerFooter>
            <PrimaryButton onClick={() => onEdit(branch)}>
                <Pencil size={15} /> Edit
            </PrimaryButton>
            <button type="button" className={btnSecondary} disabled={busyKey !== null} onClick={() => onToggleStatus(branch)}>
                {busyKey === `status-${branch._id}` ? <Loader2 size={15} className="animate-spin" /> : <Power size={15} />}
                {branch.isActive ? "Deactivate" : "Activate"}
            </button>
            <button type="button" className={btnSecondary} disabled={busyKey !== null} onClick={() => onSendCredentials(branch)}>
                {busyKey === `credit-${branch._id}` ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                Send credentials
            </button>
            <button type="button" className={btnDangerOutline} disabled={busyKey !== null} onClick={() => onDelete(branch)}>
                <Trash2 size={15} /> Delete
            </button>
        </DrawerFooter>
    </DrawerShell>
);

// One drawer for admin, staff and client accounts; the header and sections adapt to the role.
const UserDrawer = ({ user, branch, busyKey, onClose, onEdit, onToggleStatus, onSendCredentials, onDelete, onOpenBranch }) => {
    const role = normalize(user.role);
    const meta = ACCOUNT_TABS[role] || { singular: user.role || "Account", icon: User };
    const RoleIcon = meta.icon;
    const name = user.fullName || user.username || "Unnamed";
    const recordFields = [
        { icon: Hash, label: "ID", value: user._id, mono: true },
        { icon: CalendarPlus, label: "Created", value: formatDate(user.createdAt) },
        { icon: CalendarClock, label: "Last updated", value: formatDate(user.updatedAt) }
    ].filter((f) => f.value);

    return (
        <DrawerShell labelId="user-drawer-title" onClose={onClose}>
            <DrawerHeader onClose={onClose} closeLabel={`Close ${meta.singular.toLowerCase()} details`}>
                <Avatar name={name} large />
                <DrawerTitle eyebrow={meta.singular} id="user-drawer-title" title={name} chip={user.officeEmail || "No email"}>
                    <StatusBadge active={user.isActive} />
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${getRoleBadge(user.role)}`}>
                        <RoleIcon size={12} aria-hidden="true" /> {meta.singular}
                    </span>
                </DrawerTitle>
            </DrawerHeader>

            <div className={drawerBody}>
                <DrawerSection title="Account" icon={User} order={0} fields={[
                    { icon: User, label: "Username", value: user.username },
                    { icon: Mail, label: "Office email", value: user.officeEmail || user.personalEmail },
                    { icon: Phone, label: "Office mobile", value: user.officeMobile || user.personalMobile },
                    { icon: ShieldCheck, label: "Role", value: user.role, capitalize: true }
                ]} />

                <DrawerSection title="Position" icon={Briefcase} order={1} fields={[
                    { icon: BadgeCheck, label: "Designation", value: user.designation },
                    { icon: Briefcase, label: "Job role", value: user.jobRole }
                ]} />

                <DrawerSection title="Location" icon={MapPin} order={2} fields={[
                    { icon: MapPin, label: "Province", value: user.location.province },
                    { icon: MapPinned, label: "District", value: user.location.district },
                    { icon: Building2, label: "Local level", value: user.location.localLevel },
                    { icon: Hash, label: "Ward", value: user.wardNo }
                ]} />

                {role === "staff" && (
                    <DrawerSection title="Assigned branch" icon={GitBranch} order={3}>
                        {branch ? (
                            <motion.button
                                type="button"
                                whileHover={{ x: 3 }}
                                transition={{ type: "spring", stiffness: 180, damping: 22 }}
                                onClick={() => onOpenBranch(branch._id)}
                                className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white p-2.5 text-left transition-colors hover:bg-amber-50/40 ${FOCUS}`}
                            >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                                    <GitBranch size={16} aria-hidden="true" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-bold text-slate-900">{branch.name}</p>
                                    <p className="truncate text-[11px] font-medium text-slate-400">
                                        {[branch.location.district, branch.location.province].filter(Boolean).join(", ") || "Location not set"}
                                    </p>
                                </div>
                                <ChevronRight size={14} className="shrink-0 text-slate-400" aria-hidden="true" />
                            </motion.button>
                        ) : (
                            <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-xs text-slate-500">
                                Not linked to a branch. A branch is matched by recruitment record or by exact province, district and local level.
                            </div>
                        )}
                    </DrawerSection>
                )}

                {recordFields.length > 0 && <DrawerSection title="Record" icon={Hash} order={4} fields={recordFields} />}
            </div>

            <DrawerFooter>
                <PrimaryButton onClick={() => onEdit(user)}>
                    <Pencil size={15} /> Edit
                </PrimaryButton>
                <button type="button" className={btnSecondary} disabled={busyKey !== null} onClick={() => onToggleStatus(user)}>
                    {busyKey === `status-${user._id}` ? <Loader2 size={15} className="animate-spin" /> : <Power size={15} />}
                    {user.isActive ? "Deactivate" : "Activate"}
                </button>
                <button type="button" className={btnSecondary} disabled={busyKey !== null} onClick={() => onSendCredentials(user)}>
                    {busyKey === `credit-${user._id}` ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                    Send credentials
                </button>
                <button type="button" className={btnDangerOutline} disabled={busyKey !== null} onClick={() => onDelete(user)}>
                    <Trash2 size={15} /> Delete
                </button>
            </DrawerFooter>
        </DrawerShell>
    );
};

/* -------------------------------------------------------------------------- */
/* Employee profile modal                                                     */
/* -------------------------------------------------------------------------- */

const EmployeeModal = ({ employee, branch, position, total, onPrev, onNext, onClose }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6" style={FONT}>
        <Scrim onClick={onClose} />
        <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="employee-title"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            onClick={(event) => event.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-slate-50 text-xs text-slate-800 shadow-2xl"
        >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 sm:px-5 sm:py-4">
                <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={employeeDisplayName(employee)} large />
                    <div className="min-w-0">
                        <h2 id="employee-title" className="truncate text-sm font-extrabold text-slate-900 sm:text-base">{employeeDisplayName(employee)}</h2>
                        <p className="truncate text-xs font-medium text-slate-500">{employee.jobRole || employee.designation || "Staff member"}</p>
                    </div>
                </div>
                <button type="button" className={`cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 ${FOCUS}`} onClick={onClose} aria-label="Close employee profile">
                    <X size={18} />
                </button>
            </div>
            <div className="p-4 sm:p-5">
                <dl className={`${CARD} grid grid-cols-2 gap-x-6 gap-y-4 p-4`}>
                    <Field label="Department">{dash(employee.designation)}</Field>
                    <Field label="Branch">{branch ? branch.name : "Not linked to a branch"}</Field>
                    <Field label="Office email">
                        <span className="inline-flex items-center gap-1.5"><Mail size={14} className="text-amber-600" aria-hidden="true" />{dash(employee.officeEmail || employee.personalEmail)}</span>
                    </Field>
                    <Field label="Phone">
                        <span className="inline-flex items-center gap-1.5"><Phone size={14} className="text-amber-600" aria-hidden="true" />{dash(employee.officeMobile || employee.personalMobile)}</span>
                    </Field>
                </dl>
            </div>
            {position >= 0 && total > 1 && (
                <div className="flex items-center justify-between gap-2 border-t border-slate-200 bg-white px-4 py-3 sm:px-5">
                    <button type="button" className={btnOutlineSm} onClick={onPrev} disabled={position <= 0}>
                        <ChevronLeft size={15} /> Previous
                    </button>
                    <span className="text-xs font-semibold tabular-nums text-slate-600">{position + 1} of {total} in this branch</span>
                    <button type="button" className={btnOutlineSm} onClick={onNext} disabled={position >= total - 1}>
                        Next <ChevronRight size={15} />
                    </button>
                </div>
            )}
        </motion.section>
    </div>
);

/* -------------------------------------------------------------------------- */
/* Main page                                                                  */
/* -------------------------------------------------------------------------- */

const BranchManagement = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Data (one request pair, shared by every tab)
    const [branches, setBranches] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadError, setLoadError] = useState("");
    const inFlight = useRef(false);
    const hasLoaded = useRef(false);

    // UI state
    const [tab, setTab] = useState("branches");
    const [overviewOpen, setOverviewOpen] = useState(true);
    const [search, setSearch] = useState("");
    const [provinceFilter, setProvinceFilter] = useState("");
    const [districtFilter, setDistrictFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [managerFilter, setManagerFilter] = useState("all");
    const [sort, setSort] = useState({ key: "name", dir: "asc" });
    const [page, setPage] = useState(1);

    const [userSearch, setUserSearch] = useState("");
    const [userStatus, setUserStatus] = useState("all");
    const [userPage, setUserPage] = useState(1);

    // Mutations
    const { Deleteadmin_, DeleteBranch_ } = UseDelete();
    const { EditStatus_, SendCredit_, EditBranchStatus_, SendBranchCredit_ } = useEdit();
    const [actionLoading, setActionLoading] = useState(null);
    const [confirm, setConfirm] = useState(null); // { kind: "status" | "delete", row }
    const [registerState, setRegisterState] = useState(null); // null | { data: record | null }

    const isAccountTab = tab !== "branches";
    const accountMeta = ACCOUNT_TABS[tab];

    /* ----------------------------- data loading ----------------------------- */

    const loadData = useCallback(async () => {
        if (inFlight.current) return; // never fire a second identical request
        inFlight.current = true;
        if (hasLoaded.current) setRefreshing(true);
        else setLoading(true);
        setLoadError("");
        try {
            const [branchResponse, userResponse] = await Promise.all([getAllBranch(), getUserCredit()]);
            const branchRecords = responseRecords(branchResponse);
            const userRecords = responseRecords(userResponse);
            if (!branchRecords || !userRecords) {
                throw new Error("The branch or employee API returned an invalid response.");
            }
            setBranches(branchRecords);
            setUsers(userRecords.filter((user) => normalize(user.role) !== "super_admin"));
            hasLoaded.current = true;
        } catch (error) {
            console.error("Branch management data fetch failed:", error);
            setLoadError(error?.response?.data?.message || error.message || "Unable to load branches and employees.");
        } finally {
            inFlight.current = false;
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    /* ------------------------------ derived data ---------------------------- */

    const employees = useMemo(() => users.filter((user) => normalize(user.role) === "staff"), [users]);

    // Every account, normalised once, so tables and drawers read the same shape.
    const userRows = useMemo(() => users.map((user) => ({
        ...user,
        fullName: user.fullName || user.fullname,
        location: getEmployeeLocation(user),
        isActive: user.isActive !== false
    })), [users]);

    const roleCounts = useMemo(() => {
        const counts = { admin: 0, staff: 0, client: 0 };
        userRows.forEach((user) => {
            const role = normalize(user.role);
            if (role in counts) counts[role] += 1;
        });
        return counts;
    }, [userRows]);

    const branchRows = useMemo(() => branches.map((branch) => {
        const location = getBranchLocation(branch);
        return {
            ...branch,
            isBranch: true,
            role: branch.role || "branch",
            location,
            name: `${location.localLevel || "Unnamed"} Branch`,
            managerName: branch.fullName || branch.UserfullName || "",
            isActive: branch.isActive !== false,
            team: employees.filter((employee) => employeeMatchesBranch(employee, branch))
        };
    }), [branches, employees]);

    const stats = useMemo(() => {
        const teamIds = new Set();
        branchRows.forEach((branch) => branch.team.forEach((employee) => teamIds.add(String(employee._id))));
        const active = branchRows.filter((branch) => branch.isActive).length;
        return {
            total: branchRows.length,
            active,
            inactive: branchRows.length - active,
            managers: branchRows.filter((branch) => branch.managerName).length,
            employees: teamIds.size,
            provinces: new Set(branchRows.map((branch) => branch.location.province).filter(Boolean)).size
        };
    }, [branchRows]);

    const provinceSummary = useMemo(() => {
        const map = new Map();
        branchRows.forEach((branch) => {
            const name = branch.location.province;
            if (!name) return;
            if (!map.has(name)) map.set(name, { name, branches: 0, active: 0, districts: new Map() });
            const entry = map.get(name);
            entry.branches += 1;
            if (branch.isActive) entry.active += 1;
            const district = branch.location.district || "District not set";
            entry.districts.set(district, (entry.districts.get(district) || 0) + 1);
        });
        return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
    }, [branchRows]);

    const districtOptions = useMemo(() => (
        [...new Set(branchRows
            .filter((branch) => !provinceFilter || branch.location.province === provinceFilter)
            .map((branch) => branch.location.district)
            .filter(Boolean))].sort((a, b) => a.localeCompare(b))
    ), [branchRows, provinceFilter]);

    const provinceSelectOptions = useMemo(() => [
        { value: "", label: "All provinces" },
        ...provinceSummary.map((province) => ({ value: province.name, label: province.name }))
    ], [provinceSummary]);

    const districtSelectOptions = useMemo(() => [
        { value: "", label: "All districts" },
        ...districtOptions.map((district) => ({ value: district, label: district }))
    ], [districtOptions]);

    const filteredBranches = useMemo(() => {
        const query = normalize(search);
        const rows = branchRows.filter((branch) => {
            if (provinceFilter && branch.location.province !== provinceFilter) return false;
            if (districtFilter && branch.location.district !== districtFilter) return false;
            if (statusFilter !== "all" && (statusFilter === "active") !== branch.isActive) return false;
            if (managerFilter === "assigned" && !branch.managerName) return false;
            if (managerFilter === "unassigned" && branch.managerName) return false;
            if (!query) return true;
            return [branch.name, branch.location.province, branch.location.district, branch.location.localLevel, branch.managerName]
                .some((value) => normalize(value).includes(query));
        });
        const valueOf = (branch) => {
            switch (sort.key) {
                case "province": return branch.location.province;
                case "district": return branch.location.district;
                case "localLevel": return branch.location.localLevel;
                case "manager": return branch.managerName;
                case "team": return branch.team.length;
                case "status": return branch.isActive ? 1 : 0;
                default: return branch.name;
            }
        };
        const direction = sort.dir === "asc" ? 1 : -1;
        return [...rows].sort((a, b) => {
            const x = valueOf(a);
            const y = valueOf(b);
            const result = typeof x === "number" ? x - y : String(x).localeCompare(String(y), undefined, { numeric: true });
            return result * direction;
        });
    }, [branchRows, districtFilter, managerFilter, provinceFilter, search, sort, statusFilter]);

    const pageCount = Math.max(1, Math.ceil(filteredBranches.length / PAGE_SIZE));
    const safePage = Math.min(page, pageCount);
    const pagedBranches = filteredBranches.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
    const filtersActive = Boolean(search || provinceFilter || districtFilter || statusFilter !== "all" || managerFilter !== "all");
    const userFiltersActive = Boolean(userSearch || userStatus !== "all");
    const noManagerCount = branchRows.filter((branch) => !branch.managerName).length;

    useEffect(() => { setPage(1); }, [search, provinceFilter, districtFilter, statusFilter, managerFilter]);
    useEffect(() => { setUserPage(1); }, [userSearch, userStatus, tab]);

    // Accounts of the open role tab (admin / staff / client)
    const tabUsers = useMemo(() => userRows.filter((user) => normalize(user.role) === tab), [userRows, tab]);

    const accountStats = useMemo(() => {
        const active = tabUsers.filter((user) => user.isActive).length;
        return {
            total: tabUsers.length,
            active,
            inactive: tabUsers.length - active,
            districts: new Set(tabUsers.map((user) => user.location.district).filter(Boolean)).size
        };
    }, [tabUsers]);

    const filteredUsers = useMemo(() => {
        const query = normalize(userSearch);
        return tabUsers.filter((user) => {
            if (userStatus !== "all" && (userStatus === "active") !== user.isActive) return false;
            if (!query) return true;
            return [user.fullName, user.username, user.officeEmail, user.jobRole, user.designation, user.location.district, user.location.localLevel]
                .some((value) => normalize(value).includes(query));
        });
    }, [tabUsers, userSearch, userStatus]);

    const userPageCount = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
    const safeUserPage = Math.min(userPage, userPageCount);
    const pagedUsers = filteredUsers.slice((safeUserPage - 1) * PAGE_SIZE, safeUserPage * PAGE_SIZE);

    /* ------------------------- URL-backed detail views ----------------------- */

    // Several keys can change in one navigation (e.g. user drawer -> branch drawer).
    const setParams = useCallback((updates) => {
        const next = new URLSearchParams(searchParams);
        Object.entries(updates).forEach(([key, value]) => {
            if (value) next.set(key, String(value));
            else next.delete(key);
        });
        setSearchParams(next);
    }, [searchParams, setSearchParams]);
    const setParam = useCallback((key, value) => setParams({ [key]: value }), [setParams]);

    const branchId = searchParams.get("branch");
    const employeeId = searchParams.get("employee");
    const userId = searchParams.get("user");
    const selectedBranch = branchRows.find((branch) => String(branch._id) === branchId) || null;
    const selectedUser = userRows.find((user) => String(user._id) === userId) || null;
    const selectedUserBranch = selectedUser && normalize(selectedUser.role) === "staff"
        ? branchRows.find((branch) => employeeMatchesBranch(selectedUser, branch)) || null
        : null;
    const selectedEmployee = employees.find((employee) => String(employee._id) === employeeId) || null;
    const employeeBranch = selectedEmployee
        ? branchRows.find((branch) => employeeMatchesBranch(selectedEmployee, branch)) || null
        : null;
    const teamList = employeeBranch ? employeeBranch.team : [];
    const teamPosition = selectedEmployee ? teamList.findIndex((employee) => String(employee._id) === employeeId) : -1;

    useEffect(() => {
        const onKey = (event) => {
            if (event.key !== "Escape") return;
            if (confirm) setConfirm(null);
            else if (employeeId) setParam("employee", null);
            else if (userId) setParam("user", null);
            else if (branchId) setParam("branch", null);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [branchId, confirm, employeeId, userId, setParam]);

    /* -------------------------------- actions ------------------------------- */

    const busyKey = actionLoading;

    const switchTab = (key) => {
        if (key === tab) return;
        setTab(key);
        setUserSearch("");
        setUserStatus("all");
        setUserPage(1);
        if (userId) setParam("user", null);
    };

    const toggleSort = (key) => setSort((current) => (
        current.key === key ? { key, dir: current.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
    ));

    const clearFilters = () => {
        setSearch("");
        setProvinceFilter("");
        setDistrictFilter("");
        setStatusFilter("all");
        setManagerFilter("all");
    };

    const clearUserFilters = () => {
        setUserSearch("");
        setUserStatus("all");
    };

    const selectProvince = (name) => {
        setProvinceFilter((current) => (current === name ? "" : name));
        setDistrictFilter("");
    };

    const exportReport = () => {
        if (filteredBranches.length === 0) {
            ErrorNotify("There are no branches to export for the current filters.");
            return;
        }
        const header = ["Branch", "Province", "District", "Local level", "Ward", "Branch manager", "Branch email", "Branch phone", "Team size", "Status"];
        const body = filteredBranches.map((branch) => [
            branch.name, branch.location.province, branch.location.district, branch.location.localLevel,
            branch.wardNo, branch.managerName, branch.officeEmail, branch.officeMobile,
            branch.team.length, branch.isActive ? "Active" : "Inactive"
        ]);
        downloadCsv(`eimcta-branches-${new Date().toISOString().slice(0, 10)}.csv`, [header, ...body]);
        SuccessNotify(`Exported ${filteredBranches.length} branch${filteredBranches.length === 1 ? "" : "es"}.`);
    };

    const sendCredentials = (row) => {
        if (actionLoading) return;
        waitingNotify(`Sending credentials to ${row.username || "this account"}...`);
        const mutation = row.isBranch ? SendBranchCredit_ : SendCredit_;
        setActionLoading(`credit-${row._id}`);
        mutation.mutate({ params: { id: row._id }, role: row.role }, {
            onSuccess: (res) => SuccessNotify(res?.data?.message || `Credentials sent to ${row.officeEmail}`),
            onError: (err) => ErrorNotify(err?.response?.data?.message || "Failed to send credentials."),
            onSettled: () => setActionLoading(null)
        });
    };

    const runConfirmed = () => {
        if (!confirm || actionLoading) return;
        const { kind, row } = confirm;

        if (kind === "status") {
            const mutation = row.isBranch ? EditBranchStatus_ : EditStatus_;
            setActionLoading(`status-${row._id}`);
            mutation.mutate(
                { params: { id: row._id }, payload: { isActive: !row.isActive }, role: row.role },
                {
                    onSuccess: (res) => {
                        SuccessNotify(res?.data?.message || (row.isActive ? "Deactivated." : "Activated."));
                        setConfirm(null);
                        loadData();
                    },
                    onError: (err) => ErrorNotify(err?.response?.data?.message || "Failed to update status."),
                    onSettled: () => setActionLoading(null)
                }
            );
            return;
        }

        const mutation = row.isBranch ? DeleteBranch_ : Deleteadmin_;
        const payload = row.isBranch ? { id: row._id, role: row.role } : { ids: [row._id] };
        setActionLoading(`delete-${row._id}`);
        mutation.mutate(payload, {
            onSuccess: (res) => {
                SuccessNotify(res?.data?.message || "Deleted.");
                setConfirm(null);
                if (row.isBranch && String(row._id) === branchId) setParam("branch", null);
                if (!row.isBranch && String(row._id) === userId) setParam("user", null);
                loadData();
            },
            onError: (err) => ErrorNotify(err?.response?.data?.message || "Failed to delete."),
            onSettled: () => setActionLoading(null)
        });
    };

    const confirmConfig = useMemo(() => {
        if (!confirm) return null;
        const { kind, row } = confirm;
        const label = row.isBranch ? row.name : (row.fullName || row.username || "this account");
        if (kind === "status") {
            return row.isActive
                ? {
                    title: `Deactivate ${label}?`,
                    body: "Only the status changes. Nothing is deleted, and the manager and staff records stay as they are.",
                    confirmLabel: "Deactivate",
                    cancelLabel: "Keep active",
                    danger: true
                }
                : {
                    title: `Activate ${label}?`,
                    body: "The record will be marked active again.",
                    confirmLabel: "Activate",
                    danger: false
                };
        }
        return {
            title: `Delete ${label}?`,
            body: row.isBranch
                ? "This permanently removes the branch record and cannot be undone. If you only want to stop using this branch, deactivate it instead so its history is kept."
                : "This permanently removes the account and cannot be undone.",
            confirmLabel: "Delete",
            cancelLabel: row.isBranch ? "Keep branch" : "Keep account",
            danger: true,
            requireText: "delete"
        };
    }, [confirm]);

    const openRegister = (data = null) => setRegisterState({ data });
    const requestStatus = (row) => setConfirm({ kind: "status", row });
    const requestDelete = (row) => setConfirm({ kind: "delete", row });

    const branchMenu = (branch) => [
        { icon: Power, label: branch.isActive ? "Deactivate branch" : "Activate branch", onSelect: () => requestStatus(branch) },
        { icon: Send, label: "Send credentials", onSelect: () => sendCredentials(branch) },
        { icon: Trash2, label: "Delete branch", onSelect: () => requestDelete(branch), danger: true }
    ];

    const userMenu = (user) => [
        { icon: Power, label: user.isActive ? "Deactivate account" : "Activate account", onSelect: () => requestStatus(user) },
        { icon: Send, label: "Send credentials", onSelect: () => sendCredentials(user) },
        { icon: Trash2, label: "Delete account", onSelect: () => requestDelete(user), danger: true }
    ];

    /* --------------------------------- render ------------------------------- */

    const branchColumns = 9;
    const tabsMeta = {
        branches: { label: "Branches", icon: GitBranch, count: branchRows.length },
        // admin: { label: ACCOUNT_TABS.admin.label, icon: ACCOUNT_TABS.admin.icon, count: roleCounts.admin },
        staff: { label: ACCOUNT_TABS.staff.label, icon: ACCOUNT_TABS.staff.icon, count: roleCounts.staff },
        client: { label: ACCOUNT_TABS.client.label, icon: ACCOUNT_TABS.client.icon, count: roleCounts.client }
    };
    const overviewCount = isAccountTab
        ? `${nf.format(accountStats.total)} ${accountMeta.singular.toLowerCase()} account${accountStats.total === 1 ? "" : "s"}`
        : `${nf.format(stats.total)} branch${stats.total === 1 ? "" : "es"} in network`;

    return (
        <MotionConfig reducedMotion="user">
            <section className="relative mx-auto w-full max-w-[1600px] space-y-4 bg-white font-['Roboto_Slab'] text-xs text-slate-800 sm:space-y-5" style={FONT}>
                {/* Page header */}
                <header className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white shadow-sm sm:h-11 sm:w-11 ${BRAND}`}>
                            <GitBranch size={20} aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                            <h1 className="truncate text-lg font-extrabold text-slate-900 sm:text-xl">Branches</h1>
                            <nav aria-label="Breadcrumb" className="mt-0.5 flex items-center gap-1 text-[11px]">
                                <span className="font-medium text-slate-800">EIMCTA</span>
                                <ChevronRight size={12} className="text-slate-400" aria-hidden="true" />
                                <span className="font-extrabold text-amber-600">Branch Management</span>
                            </nav>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button type="button" className={btnSecondary} onClick={loadData} disabled={loading || refreshing}>
                            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} /> Refresh data
                        </button>
                        {!isAccountTab && (
                            <>
                                <button type="button" className={btnSecondary} onClick={exportReport} disabled={loading || Boolean(loadError)}>
                                    <Download size={15} /> Export branch report
                                </button>
                                <PrimaryButton onClick={() => openRegister(null)}>
                                    <Plus size={15} /> Add new branch
                                </PrimaryButton>
                            </>
                        )}
                    </div>
                </header>

                {/* Tabs */}
                <div className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Branch management sections">
                    {TAB_ORDER.map((key) => {
                        const { label, icon: Icon, count } = tabsMeta[key];
                        const isActive = tab === key;
                        return (
                            <button
                                key={key}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                onClick={() => switchTab(key)}
                                className={`inline-flex min-h-9 shrink-0 cursor-pointer items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition-colors ${FOCUS} ${isActive
                                    ? `${BRAND} border-transparent text-white shadow-sm`
                                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                    }`}
                            >
                                <Icon size={15} aria-hidden="true" /> {label}
                                <span className={`rounded-full px-1.5 py-px text-[10px] font-bold tabular-nums ${isActive ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"}`}>
                                    {loading ? "–" : nf.format(count)}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {loadError && (
                    <div role="alert" className="flex flex-col gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="font-bold">Branch data could not be loaded</p>
                            <p className="mt-0.5">{loadError}</p>
                        </div>
                        <button type="button" className={`cursor-pointer self-start rounded font-semibold underline sm:self-auto ${FOCUS}`} onClick={loadData} disabled={refreshing || loading}>
                            Retry
                        </button>
                    </div>
                )}

                {/* Overview heading + toggle */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-col sm:flex-row sm:items-baseline">
                        <h2 className="text-sm font-extrabold text-slate-900 sm:text-base">Overview</h2>
                        <p className="truncate text-xs font-medium text-slate-400 sm:ml-2">{loading ? "Loading…" : overviewCount}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setOverviewOpen((open) => !open)}
                        aria-expanded={overviewOpen}
                        className={`inline-flex min-h-8 cursor-pointer items-center gap-1 rounded-md px-2 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100 ${FOCUS}`}
                    >
                        {overviewOpen ? "Hide" : "Show"}
                        <ChevronDown size={14} className={`transition-transform ${overviewOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                    </button>
                </div>

                {!isAccountTab ? (
                    <>
                        {overviewOpen && (
                            <>
                                {/* Overview statistics */}
                                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                                    <StatCard index={0} loading={loading} icon={Building2} tone="orange" label="Total branches" value={stats.total} total={stats.total} />
                                    <StatCard index={1} loading={loading} icon={Check} tone="green" label="Active branches" value={stats.active} total={stats.total} />
                                    <StatCard index={2} loading={loading} icon={Power} tone="slate" label="Inactive branches" value={stats.inactive} total={stats.total} />
                                    <StatCard index={3} loading={loading} icon={UserRoundCog} tone="amber" label="Branch managers" value={stats.managers} total={stats.total} />
                                    <StatCard index={4} loading={loading} icon={Users} tone="orange" label="Branch employees" value={stats.employees} hint="Staff linked to a branch" />
                                    <StatCard index={5} loading={loading} icon={MapPin} tone="amber" label="Provinces covered" value={stats.provinces} total={NEPAL_PROVINCE_COUNT} />
                                </div>

                                {/* Geographical overview */}
                                <section className={`${CARD} p-3.5 sm:p-4`} aria-labelledby="coverage-title">
                                    <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
                                        <h2 id="coverage-title" className="text-sm font-extrabold text-slate-900 sm:text-base">Branch coverage by province</h2>
                                        <p className="text-xs font-medium text-slate-400">
                                            Select a province or district to filter the directory below.
                                        </p>
                                    </div>

                                    {loading ? (
                                        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                            {Array.from({ length: 4 }).map((_, i) => <Bone key={i} className="h-16 rounded-lg" />)}
                                        </div>
                                    ) : provinceSummary.length === 0 ? (
                                        <p className="mt-4 rounded-lg border border-dashed border-slate-200 p-4 text-xs text-slate-500">
                                            No branch has a province recorded yet.
                                        </p>
                                    ) : (
                                        <>
                                            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                                {provinceSummary.map((province, i) => {
                                                    const selected = provinceFilter === province.name;
                                                    return (
                                                        <motion.button
                                                            key={province.name}
                                                            type="button"
                                                            aria-pressed={selected}
                                                            onClick={() => selectProvince(province.name)}
                                                            initial={{ y: 12, opacity: 0 }}
                                                            animate={{ y: 0, opacity: 1 }}
                                                            transition={{ delay: i * 0.05, duration: 0.3 }}
                                                            className={`cursor-pointer rounded-lg border p-3 text-left transition-colors ${FOCUS} ${selected
                                                                ? "border-amber-500 bg-amber-50 ring-2 ring-amber-500/10"
                                                                : "border-slate-200 bg-white hover:bg-slate-50"
                                                                }`}
                                                        >
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className="truncate text-xs font-bold text-slate-900">{province.name}</span>
                                                                <span className="text-lg font-extrabold tabular-nums text-amber-600">{nf.format(province.branches)}</span>
                                                            </div>
                                                            <div className="mt-0.5 text-[11px] font-medium text-slate-500">
                                                                {province.districts.size} district{province.districts.size === 1 ? "" : "s"}, {province.active} active
                                                            </div>
                                                        </motion.button>
                                                    );
                                                })}
                                            </div>

                                            {provinceFilter && (
                                                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4">
                                                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                                        <MapPinned size={14} className="text-amber-600" aria-hidden="true" /> Districts in {provinceFilter}:
                                                    </span>
                                                    {[...(provinceSummary.find((p) => p.name === provinceFilter)?.districts || [])].map(([district, count]) => (
                                                        <button
                                                            key={district}
                                                            type="button"
                                                            aria-pressed={districtFilter === district}
                                                            onClick={() => setDistrictFilter((current) => (current === district ? "" : district))}
                                                            className={`cursor-pointer rounded-full border px-3 py-1 text-[11px] font-semibold transition ${FOCUS} ${districtFilter === district
                                                                ? `${BRAND} border-transparent text-white`
                                                                : "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                                                                }`}
                                                        >
                                                            {district} ({count})
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </section>
                            </>
                        )}

                        {/* Attention banner */}
                        {!loading && !loadError && noManagerCount > 0 && managerFilter !== "unassigned" && (
                            <div className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 sm:flex-row sm:items-center sm:justify-between">
                                <span className="flex items-center gap-2">
                                    <AlertCircle size={15} aria-hidden="true" />
                                    {noManagerCount} branch{noManagerCount === 1 ? " has" : "es have"} no branch manager recorded.
                                </span>
                                <button type="button" onClick={() => setManagerFilter("unassigned")} className={`cursor-pointer self-start rounded font-semibold text-amber-600 underline sm:self-auto ${FOCUS}`}>
                                    Show these branches
                                </button>
                            </div>
                        )}

                        {/* Branch directory */}
                        <section className={`${CARD} overflow-hidden`} aria-labelledby="directory-title">
                            <div className="space-y-3 border-b border-slate-200 p-3 sm:p-4">
                                <h2 id="directory-title" className="text-sm font-extrabold text-slate-900 sm:text-base">Branch directory</h2>
                                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_200px_200px_180px_auto]">
                                    <label className="relative min-w-0 sm:col-span-2 lg:col-span-1">
                                        <span className="sr-only">Search branches</span>
                                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                                        <input
                                            value={search}
                                            onChange={(event) => setSearch(event.target.value)}
                                            placeholder="Search by branch, district, province, local level, or manager"
                                            className={`${INPUT} pl-9`}
                                        />
                                    </label>
                                    <SelectField label="Filter by province" searchable options={provinceSelectOptions} value={provinceFilter}
                                        onChange={(next) => { setProvinceFilter(next); setDistrictFilter(""); }} />
                                    <SelectField label="Filter by district" searchable options={districtSelectOptions} value={districtFilter}
                                        onChange={setDistrictFilter} disabled={districtOptions.length === 0} />
                                    <SelectField label="Filter by status" options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
                                    <button type="button" className={btnGhost} onClick={clearFilters} disabled={!filtersActive}>
                                        Clear filters
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[960px] text-xs">
                                    <thead className="border-b border-slate-200 bg-slate-50">
                                        <tr>
                                            <Th>S.N.</Th>
                                            <SortHeader label="Branch name" sortKey="name" sort={sort} onSort={toggleSort} />
                                            <SortHeader label="Province" sortKey="province" sort={sort} onSort={toggleSort} />
                                            <SortHeader label="District" sortKey="district" sort={sort} onSort={toggleSort} />
                                            <SortHeader label="Local level" sortKey="localLevel" sort={sort} onSort={toggleSort} />
                                            <SortHeader label="Branch manager" sortKey="manager" sort={sort} onSort={toggleSort} />
                                            <SortHeader label="Team size" sortKey="team" sort={sort} onSort={toggleSort} />
                                            <SortHeader label="Status" sortKey="status" sort={sort} onSort={toggleSort} />
                                            <Th right>Actions</Th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <SkeletonRows columns={branchColumns} />
                                        ) : pagedBranches.map((branch, index) => (
                                            <motion.tr
                                                key={branch._id}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: Math.min(index, 10) * 0.03, duration: 0.25 }}
                                                className="border-b border-slate-100 bg-white transition-colors hover:bg-amber-50/40"
                                            >
                                                <td className="px-4 py-3 font-medium tabular-nums text-slate-400">{(safePage - 1) * PAGE_SIZE + index + 1}</td>
                                                <td className="px-4 py-3">
                                                    <button type="button" onClick={() => setParam("branch", branch._id)}
                                                        className={`cursor-pointer rounded text-left text-xs font-bold text-slate-900 underline-offset-4 transition-colors hover:text-amber-600 hover:underline ${FOCUS}`}>
                                                        {branch.name}
                                                    </button>
                                                    {branch.wardNo ? <div className="text-[11px] font-medium text-slate-400">Ward {branch.wardNo}</div> : null}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-800">{dash(branch.location.province)}</td>
                                                <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-800">{dash(branch.location.district)}</td>
                                                <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-800">{dash(branch.location.localLevel)}</td>
                                                <td className="whitespace-nowrap px-4 py-3">
                                                    {branch.managerName
                                                        ? <span className="font-medium text-slate-800">{branch.managerName}</span>
                                                        : <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">No manager</span>}
                                                </td>
                                                <td className="px-4 py-3 font-medium tabular-nums text-slate-800">{branch.team.length}</td>
                                                <td className="px-4 py-3"><StatusBadge active={branch.isActive} /></td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button type="button" className={iconBtn} onClick={() => setParam("branch", branch._id)} aria-label={`View ${branch.name}`} title="View details">
                                                            <Eye size={16} />
                                                        </button>
                                                        <button type="button" className={iconBtn} onClick={() => openRegister(branch)} aria-label={`Edit ${branch.name}`} title="Edit branch">
                                                            <Pencil size={16} />
                                                        </button>
                                                        <RowMenu items={branchMenu(branch)} disabled={actionLoading !== null} label={`More actions for ${branch.name}`} />
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>

                                {!loading && !loadError && filteredBranches.length === 0 && (
                                    filtersActive ? (
                                        <EmptyState icon={Search} title="No matching branches"
                                            text="No branch matches the current search and filters."
                                            action={<button type="button" className={btnGhost} onClick={clearFilters}>Clear filters</button>} />
                                    ) : (
                                        <EmptyState icon={Building2} title="No branches yet"
                                            text="Add the first EIMCTA branch to start building the network."
                                            action={<PrimaryButton onClick={() => openRegister(null)}><Plus size={15} /> Add new branch</PrimaryButton>} />
                                    )
                                )}
                                {!loading && loadError && filteredBranches.length === 0 && (
                                    <EmptyState icon={AlertCircle} title="Branches unavailable" text="Fix the error above, then try again." />
                                )}
                            </div>

                            {!loading && <Pagination page={safePage} pageCount={pageCount} total={filteredBranches.length} noun={filteredBranches.length === 1 ? "branch" : "branches"} onChange={setPage} />}
                        </section>
                    </>
                ) : (
                    /* Admin / Staff / Client accounts */
                    <>
                        {overviewOpen && (
                            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                                <StatCard key={`${tab}-0`} index={0} loading={loading} icon={accountMeta.icon} tone="orange" label={`Total ${accountMeta.label}`} value={accountStats.total} total={accountStats.total} />
                                <StatCard key={`${tab}-1`} index={1} loading={loading} icon={UserCheck} tone="green" label="Active" value={accountStats.active} total={accountStats.total} />
                                <StatCard key={`${tab}-2`} index={2} loading={loading} icon={UserX} tone="slate" label="Inactive" value={accountStats.inactive} total={accountStats.total} />
                                <StatCard key={`${tab}-3`} index={3} loading={loading} icon={MapPinned} tone="amber" label="Districts" value={accountStats.districts} hint="Districts with a record" />
                            </div>
                        )}

                        <section className={`${CARD} overflow-hidden`} aria-labelledby="accounts-title">
                            <div className="space-y-3 border-b border-slate-200 p-3 sm:p-4">
                                <div>
                                    <h2 id="accounts-title" className="text-sm font-extrabold text-slate-900 sm:text-base">{accountMeta.label} accounts</h2>
                                    <p className="mt-0.5 text-xs font-medium text-slate-400">
                                        {tab === "staff"
                                            ? "Staff are linked to branches by recruitment record or location. Select a name to see details."
                                            : "Select a name to see the full record."}
                                    </p>
                                </div>
                                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_220px_auto]">
                                    <label className="relative min-w-0 sm:col-span-2 lg:col-span-1">
                                        <span className="sr-only">Search {accountMeta.label.toLowerCase()}</span>
                                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                                        <input value={userSearch} onChange={(event) => setUserSearch(event.target.value)}
                                            placeholder={accountMeta.hint} className={`${INPUT} pl-9`} />
                                    </label>
                                    <SelectField label="Filter by status" options={STATUS_OPTIONS} value={userStatus} onChange={setUserStatus} />
                                    <button type="button" className={btnGhost} onClick={clearUserFilters} disabled={!userFiltersActive}>
                                        Clear filters
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[960px] text-xs">
                                    <thead className="border-b border-slate-200 bg-slate-50">
                                        <tr>
                                            <Th>{accountMeta.singular}</Th><Th>Role</Th><Th>Location</Th><Th>Position</Th><Th>Contact</Th><Th>Status</Th><Th right>Actions</Th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? <SkeletonRows columns={7} /> : pagedUsers.map((user, index) => (
                                            <motion.tr
                                                key={`${tab}-${user._id}`}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: Math.min(index, 10) * 0.03, duration: 0.25 }}
                                                className="border-b border-slate-100 bg-white transition-colors hover:bg-amber-50/40"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar name={user.fullName || user.username} />
                                                        <div className="min-w-0">
                                                            <button type="button" onClick={() => setParam("user", user._id)} title={`View ${user.fullName || user.username}`}
                                                                className={`block max-w-full cursor-pointer truncate rounded text-left text-xs font-bold text-slate-900 underline-offset-4 transition-colors hover:text-amber-600 hover:underline ${FOCUS}`}>
                                                                {user.fullName || user.username || "Unnamed"}
                                                            </button>
                                                            <div className="truncate text-[11px] font-medium text-slate-400">{dash(user.username)}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${getRoleBadge(user.role)}`}>{user.role || "n/a"}</span>
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3">
                                                    <div className="font-medium text-slate-800">{dash(user.location.district)}</div>
                                                    <div className="text-[11px] font-medium text-slate-400">{dash(user.location.localLevel)}</div>
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3">
                                                    <div className="font-medium text-slate-800">{dash(user.jobRole)}</div>
                                                    <div className="text-[11px] font-medium text-slate-400">{dash(user.designation)}</div>
                                                </td>
                                                <td className="px-4 py-3 text-[11px] font-medium text-slate-500">
                                                    <div className="flex items-center gap-1.5"><Mail size={12} className="text-slate-400" aria-hidden="true" />{dash(user.officeEmail)}</div>
                                                    <div className="mt-0.5 flex items-center gap-1.5"><Phone size={12} className="text-slate-400" aria-hidden="true" />{dash(user.officeMobile)}</div>
                                                </td>
                                                <td className="px-4 py-3"><StatusBadge active={user.isActive} /></td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button type="button" className={iconBtn} onClick={() => setParam("user", user._id)} aria-label={`View ${user.fullName || user.username}`} title="View details">
                                                            <Eye size={16} />
                                                        </button>
                                                        <button type="button" className={iconBtn} onClick={() => openRegister(user)} aria-label={`Edit ${user.fullName || user.username}`} title="Edit account">
                                                            <Pencil size={16} />
                                                        </button>
                                                        <RowMenu items={userMenu(user)} disabled={actionLoading !== null} label={`More actions for ${user.fullName || user.username}`} />
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                                {!loading && filteredUsers.length === 0 && (
                                    <EmptyState icon={accountMeta.icon} title={`No ${accountMeta.label.toLowerCase()} found`}
                                        text={userFiltersActive
                                            ? `No ${accountMeta.singular.toLowerCase()} matches the current search and status filter.`
                                            : `No ${accountMeta.label.toLowerCase()} have been registered yet.`}
                                        action={userFiltersActive ? <button type="button" className={btnGhost} onClick={clearUserFilters}>Clear filters</button> : null} />
                                )}
                            </div>
                            {!loading && <Pagination page={safeUserPage} pageCount={userPageCount} total={filteredUsers.length} noun={accountMeta.label.toLowerCase()} onChange={setUserPage} />}
                        </section>
                    </>
                )}

                {/* Overlays */}
                <AnimatePresence>
                    {selectedBranch && (
                        <BranchDrawer
                            key="branch-drawer"
                            branch={selectedBranch}
                            busyKey={busyKey}
                            onClose={() => setParam("branch", null)}
                            onEdit={(branch) => openRegister(branch)}
                            onToggleStatus={requestStatus}
                            onSendCredentials={sendCredentials}
                            onDelete={requestDelete}
                            onOpenEmployee={(id) => setParam("employee", id)}
                        />
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {selectedUser && (
                        <UserDrawer
                            key="user-drawer"
                            user={selectedUser}
                            branch={selectedUserBranch}
                            busyKey={busyKey}
                            onClose={() => setParam("user", null)}
                            onEdit={(user) => openRegister(user)}
                            onToggleStatus={requestStatus}
                            onSendCredentials={sendCredentials}
                            onDelete={requestDelete}
                            onOpenBranch={(id) => setParams({ user: null, branch: id })}
                        />
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {selectedEmployee && (
                        <EmployeeModal
                            key="employee-modal"
                            employee={selectedEmployee}
                            branch={employeeBranch}
                            position={teamPosition}
                            total={teamList.length}
                            onPrev={() => teamList[teamPosition - 1] && setParam("employee", teamList[teamPosition - 1]._id)}
                            onNext={() => teamList[teamPosition + 1] && setParam("employee", teamList[teamPosition + 1]._id)}
                            onClose={() => setParam("employee", null)}
                        />
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {confirm && confirmConfig && (
                        <ConfirmDialog
                            key={`${confirm.kind}-${confirm.row._id}`}
                            config={confirmConfig}
                            busy={actionLoading !== null}
                            onConfirm={runConfirmed}
                            onCancel={() => setConfirm(null)}
                        />
                    )}
                </AnimatePresence>

                {registerState && (
                    <RegisterModal_Admin
                        key={registerState.data?._id || "new-record"}
                        onClose={() => setRegisterState(null)}
                        onSuccess={() => {
                            setRegisterState(null);
                            loadData();
                        }}
                        initialData={registerState.data}
                        editData={Boolean(registerState.data)}
                    />
                )}
            </section>
        </MotionConfig>
    );
};

export default BranchManagement;