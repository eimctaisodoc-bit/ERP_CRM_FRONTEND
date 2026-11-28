import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import * as Icons from "lucide-react";

import { motion, AnimatePresence, animate } from "framer-motion";
import { useGet } from "../../hooks/useGet";
import { UseDelete } from "../../hooks/useDelete";
import { useEdit } from "../../hooks/useEdit";
import { SuccessNotify, waitingNotify, ErrorNotify } from "../../hotToaster";
import { RegisterModal_Staff } from "./Registermodal";
import { Skeleton } from "../../skeleton";
import { useAuth } from "../../hooks/useAuth";


const FONT = { fontFamily: "'Roboto Slab', serif" };
const FONT_LIGHT = { ...FONT, fontWeight: 300 };
const FONT_BOLD = { ...FONT, fontWeight: 700 };

const ROWS_PER_PAGE = 10;
const SKELETON_ROWS = 6;


const COLLECTIONS = {
    staff: {
        key: "staff",
        role: "staff",
        label: "Staff",
        icon: Icons.Briefcase,
        searchHint: "Search staff by name, email, designation, province...",
        searchFields: ["username", "officeEmail", "designation", "jobRole", "provinceName"],
        columns: [
            { id: "profile", label: "Profile" },
            { id: "position", label: "Designation / Job role" },
            { id: "contact", label: "Contact / Province" },
            { id: "status", label: "Status" },
        ],
        position: (r) => ({ primary: r.designation, secondary: r.jobRole }),
        contact: (r) => ({ primary: r.officeMobile, secondary: r.provinceName }),
    },
    client: {
        key: "client",
        role: "client",
        label: "Clients",
        icon: Icons.Building2,
        searchHint: "Search clients by name, email, designation, province...",
        searchFields: ["username", "officeEmail", "designation", "jobRole", "provinceName"],
        columns: [
            { id: "profile", label: "Client" },
            { id: "position", label: "Designation / Job role" },
            { id: "contact", label: "Contact / Province" },
            { id: "status", label: "Status" },
        ],
        position: (r) => ({ primary: r.designation, secondary: r.jobRole }),
        contact: (r) => ({ primary: r.officeMobile, secondary: r.provinceName }),
    },
};

const TAB_ORDER = ["staff", "client"];

/* Fields shown in the right-side detail drawer, each with its own icon */
const formatDate = (v) => {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d) ? null : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const DETAIL_SECTIONS = [
    {
        title: "Account",
        fields: [
            { icon: Icons.User, label: "Username", get: (r) => r.username },
            { icon: Icons.Mail, label: "Office email", get: (r) => r.officeEmail },
            { icon: Icons.ShieldCheck, label: "Role", get: (r) => r.role, capitalize: true },
        ],
    },
    {
        title: "Position",
        fields: [
            { icon: Icons.BadgeCheck, label: "Designation", get: (r) => r.designation },
            { icon: Icons.Briefcase, label: "Job role", get: (r) => r.jobRole },
        ],
    },
    {
        title: "Contact & Location",
        fields: [
            { icon: Icons.Phone, label: "Office mobile", get: (r) => r.officeMobile },
            { icon: Icons.MapPin, label: "Province", get: (r) => r.provinceName },
        ],
    },
    {
        title: "Record",
        fields: [
            { icon: Icons.Hash, label: "ID", get: (r) => r._id, mono: true },
            { icon: Icons.CalendarPlus, label: "Created", get: (r) => formatDate(r.createdAt) },
            { icon: Icons.CalendarClock, label: "Last updated", get: (r) => formatDate(r.updatedAt) },
        ],
    },
];

/* ============================================================
   UTILS
   ============================================================ */
const getInitials = (name) =>
    name?.replace(/[^a-zA-Z ]/g, "").split(" ").filter(Boolean).map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "??";

const AVATAR_COLORS = [
    "bg-[#E87A24]/15 text-[#E87A24]",
    "bg-[#F59E0B]/20 text-[#B45309]",
    "bg-[#4A76C0]/15 text-[#4A76C0]",
    "bg-[#422026]/10 text-[#422026]",
    "bg-[#16A34A]/15 text-[#16A34A]",
];
const getColorIndex = (name = "") =>
    name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length;

const buildPageWindow = (current, total, size = 5) => {
    const half = Math.floor(size / 2);
    let start = Math.max(1, current - half);
    const end = Math.min(total, start + size - 1);
    start = Math.max(1, end - size + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

/* ============================================================
   SKELETONS
   ============================================================ */
const StatCardSkeleton = () => (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 flex items-center gap-4">
        <Skeleton className="w-11 h-11 rounded-xl" />
        <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-12" />
        </div>
    </div>
);

const TableRowSkeleton = () => (
    <tr>
        <td className="px-5 py-3"><Skeleton className="w-4 h-4 sm:w-5 sm:h-5 rounded" /></td>
        <td className="px-5 py-3">
            <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-full shrink-0" />
                <div className="space-y-2">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-2.5 w-36" />
                </div>
            </div>
        </td>
        <td className="px-5 py-3"><div className="space-y-2"><Skeleton className="h-3 w-24" /><Skeleton className="h-2.5 w-20" /></div></td>
        <td className="px-5 py-3"><div className="space-y-2"><Skeleton className="h-3 w-24" /><Skeleton className="h-2.5 w-16" /></div></td>
        <td className="px-5 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
        <td className="px-5 py-3">
            <div className="flex gap-2">
                {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg" />)}
            </div>
        </td>
    </tr>
);

/* ============================================================
   SMALL COMPONENTS
   ============================================================ */
const Avatar = ({ name, large, online = false }) => (
    <div
        className="relative shrink-0"
        title={online ? "Online" : "Offline"}
        aria-label={`${name || "User"} is ${online ? "online" : "offline"}`}
    >
        <div className={`flex items-center justify-center rounded-full font-semibold ring-2 ring-white ${large ? "w-16 h-16" : "w-8 h-8 sm:w-10 sm:h-10"} ${AVATAR_COLORS[getColorIndex(name)]}`}>
            <span className={large ? "text-xl" : "text-xs sm:text-sm"}>{getInitials(name)}</span>
        </div>
        <span
            className={`absolute bottom-0 right-0 block rounded-full border-2 border-white ${large ? "w-4 h-4" : "w-3 h-3"} ${online
                ? "bg-[#16A34A]"
                : "bg-[#94A3B8]"
                }`}
            aria-hidden="true"
        >
            {online && <span className="absolute inset-0 rounded-full bg-[#16A34A] animate-ping opacity-40" />}
        </span>
    </div>
);

const StatusBadge = ({ active }) => (
    <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${active
            ? "bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/25"
            : "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]"
            }`}
    >
        <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-[#16A34A]" : "bg-[#64748B]"}`} />
        {active ? "Active" : "Inactive"}
    </span>
);

const CustomCheckbox = ({ checked, indeterminate, onChange, label }) => (
    <div className="relative inline-block w-4 h-4 sm:w-5 sm:h-5 cursor-pointer">
        <input
            type="checkbox"
            aria-label={label}
            checked={checked}
            onChange={onChange}
            ref={(el) => el && (el.indeterminate = !!indeterminate)}
            className="absolute w-full h-full  cursor-pointer z-10"
        />
        <div
            className={`absolute inset-0 border-2 rounded transition-all ${checked || indeterminate ? "border-[#E87A24] bg-[#E87A24]" : "border-[#E2E8F0] hover:border-[#F59E0B]"
                }`}
        >
            {checked && !indeterminate && <Icons.Check className="absolute inset-0 w-full h-full text-white p-0.5" />}
            {indeterminate && <Icons.Minus className="absolute inset-0 w-full h-full text-white p-0.5" />}
        </div>
    </div>
);

const IconButton = ({ title, onClick, disabled, tone, children }) => {
    const tones = {
        orange: "text-[#E87A24] border-[#E87A24]/30 bg-[#E87A24]/5 hover:bg-[#E87A24]/15",
        green: "text-[#16A34A] border-[#16A34A]/30 bg-[#16A34A]/5 hover:bg-[#16A34A]/15",
        blue: "text-[#4A76C0] border-[#4A76C0]/30 bg-[#4A76C0]/5 hover:bg-[#4A76C0]/15",
        red: "text-[#DC2626] border-[#DC2626]/30 bg-[#DC2626]/5 hover:bg-[#DC2626]/15",
    };
    return (
        <button
            type="button"
            title={title}
            aria-label={title}
            disabled={disabled}
            onClick={onClick}
            className={`cursor-pointer p-1.5 sm:p-2 rounded-lg border transition-transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed ${tones[tone]}`}
        >
            {children}
        </button>
    );
};

const ActionButtons = ({ row, onDelete, onToggleStatus, onEdit, onResetPassword, isStatusLoading, isPasswordResetLoading }) => (
    <div className="flex items-center gap-1 sm:gap-2">
        <IconButton
            title={row.isActive ? "Mark inactive" : "Mark active"}
            tone={row.isActive ? "orange" : "green"}
            disabled={isStatusLoading}
            onClick={(e) => onToggleStatus(e, row)}
        >
            {isStatusLoading ? <Icons.LoaderCircle className="h-4 w-4 animate-spin text-slate-600" strokeWidth={2.5} /> : <Icons.Power className="w-4 h-4" />}
        </IconButton>
        <IconButton title={`Edit ${row.username}`} tone="blue" onClick={(e) => { e.stopPropagation(); onEdit(row); }}>
            <Icons.Pencil className="w-4 h-4" />
        </IconButton>
        <IconButton
            title="Send password reset link"
            tone="blue"
            disabled={isPasswordResetLoading}
            onClick={(e) => { e.stopPropagation(); onResetPassword(row); }}
        >
            {isPasswordResetLoading ? <Icons.LoaderCircle className="h-4 w-4 animate-spin text-blue-600" strokeWidth={2.5} /> : <Icons.KeyRound className="w-4 h-4" />}
        </IconButton>
        <IconButton title="Delete" tone="red" onClick={(e) => { e.stopPropagation(); onDelete([row._id]); }}>
            <Icons.Trash2 className="w-4 h-4" />
        </IconButton>
    </div>
);

const Pagination = ({ rowCount, currentPage, onChangePage }) => {
    const totalPages = Math.max(1, Math.ceil(rowCount / ROWS_PER_PAGE));
    const from = rowCount === 0 ? 0 : (currentPage - 1) * ROWS_PER_PAGE + 1;
    const to = Math.min(currentPage * ROWS_PER_PAGE, rowCount);
    const btn = "cursor-pointer px-3 py-1.5 text-xs sm:text-sm border rounded-md font-bold transition-colors";
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-5 py-4 border-t border-[#E2E8F0] bg-white">
            <div className="text-xs sm:text-sm text-[#64748B]" style={FONT_LIGHT}>
                Showing {from}-{to} of {rowCount}
            </div>
            <div className="flex gap-1">
                <button onClick={() => onChangePage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className={`${btn} border-[#E2E8F0] text-[#422026] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed`}>
                    Prev
                </button>
                {buildPageWindow(currentPage, totalPages).map((p) => (
                    <button
                        key={p}
                        onClick={() => onChangePage(p)}
                        className={`${btn} ${currentPage === p ? "bg-[#E87A24] text-white border-[#E87A24]" : "border-[#E2E8F0] text-[#422026] hover:bg-[#F8FAFC]"}`}
                    >
                        {p}
                    </button>
                ))}
                <button onClick={() => onChangePage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className={`${btn} border-[#E2E8F0] text-[#422026] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed`}>
                    Next
                </button>
            </div>
        </div>
    );
};

/* ---------- Statistics ---------- */
const CountUp = ({ value }) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        const controls = animate(0, value, {
            duration: 0.8,
            ease: "easeOut",
            onUpdate: (v) => setDisplay(Math.round(v)),
        });
        return () => controls.stop();
    }, [value]);
    return <>{display}</>;
};

const STAT_TONES = {
    orange: { box: "bg-[#E87A24]/10 text-[#E87A24]", bar: "bg-[#E87A24]" },
    green: { box: "bg-[#16A34A]/10 text-[#16A34A]", bar: "bg-[#16A34A]" },
    slate: { box: "bg-[#64748B]/10 text-[#64748B]", bar: "bg-[#64748B]" },
    blue: { box: "bg-[#4A76C0]/10 text-[#4A76C0]", bar: "bg-[#4A76C0]" },
};

const StatCard = ({ icon: Icon, label, value, total, tone, active, onClick, index, suffix }) => {
    const t = STAT_TONES[tone];
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    const Wrapper = onClick ? motion.button : motion.div;
    return (
        <Wrapper
            type={onClick ? "button" : undefined}
            onClick={onClick}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07, duration: 0.35, ease: "easeOut" }}
            whileHover={onClick ? { y: -2 } : undefined}
            className={`text-left rounded-xl border bg-white p-4 shadow-sm transition-colors ${onClick ? "cursor-pointer" : ""} ${active ? "border-[#E87A24] ring-2 ring-[#E87A24]/15" : "border-[#E2E8F0] hover:border-[#F59E0B]"}`}
        >
            <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${t.box}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest truncate" style={FONT}>{label}</p>
                    <p className="text-2xl text-[#422026]" style={FONT_BOLD}>
                        <CountUp value={value} />{suffix}
                    </p>
                </div>
            </div>
            {total > 0 && !suffix && (
                <div className="mt-3 h-1.5 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] overflow-hidden">
                    <motion.div
                        className={`h-full ${t.bar}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: index * 0.07 + 0.2, duration: 0.7, ease: "easeOut" }}
                    />
                </div>
            )}
        </Wrapper>
    );
};

/* ---------- Right drawer ---------- */
const DetailDrawer = ({ row, config, onClose, onEdit, onResetPassword, onToggleStatus, onDelete, isStatusLoading, isPasswordResetLoading }) => {
    const RoleIcon = config.icon;
    let counter = 0;
    return (
        <div className="fixed inset-0 z-50">
            <motion.div
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={onClose}
            />
            <motion.aside
                role="dialog"
                aria-label={`${row.username} details`}
                className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
                {/* Header */}
                <div className="relative px-6 pt-6 pb-5 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="cursor-pointer absolute top-4 right-4 p-2 rounded-lg text-[#64748B] hover:bg-white hover:text-[#422026] border border-transparent hover:border-[#E2E8F0] transition-colors"
                    >
                        <Icons.X className="w-4 h-4" />
                    </button>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center gap-4"
                    >
                        <Avatar name={row.username} large online={!!row.isActive} />
                        <div className="min-w-0">
                            <h3 className="text-lg text-[#422026] truncate" style={FONT_BOLD}>{row.username}</h3>
                            <p className="text-xs text-[#64748B] truncate mb-2" style={FONT_LIGHT}>{row.officeEmail || "No email"}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                                <StatusBadge active={!!row.isActive} />
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border border-[#E87A24]/25 bg-[#E87A24]/10 text-[#E87A24]">
                                    <RoleIcon className="w-3 h-3" /> {row.role || config.role}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                    {DETAIL_SECTIONS.map((section) => {
                        const items = section.fields.filter((f) => f.get(row) || section.title !== "Record");
                        if (items.length === 0) return null;
                        return (
                            <div key={section.title}>
                                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-3" style={FONT}>{section.title}</p>
                                <div className="space-y-2">
                                    {items.map((f) => {
                                        const FieldIcon = f.icon;
                                        const val = f.get(row);
                                        const delay = 0.15 + counter++ * 0.05;
                                        return (
                                            <motion.div
                                                key={f.label}
                                                initial={{ opacity: 0, x: 24 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay, duration: 0.3, ease: "easeOut" }}
                                                className="flex items-center gap-3 p-3 rounded-xl border border-[#E2E8F0] bg-white hover:border-[#F59E0B] transition-colors"
                                            >
                                                <div className="w-9 h-9 rounded-lg bg-[#E87A24]/10 text-[#E87A24] flex items-center justify-center shrink-0">
                                                    <FieldIcon className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">{f.label}</p>
                                                    <p
                                                        className={`text-sm text-[#422026] break-words ${f.capitalize ? "capitalize" : ""} ${f.mono ? "font-mono text-xs" : ""}`}
                                                        style={f.mono ? undefined : FONT_BOLD}
                                                    >
                                                        {val || "N/A"}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-2 gap-2 px-6 py-4 border-t border-[#E2E8F0] bg-white"
                >
                    <button
                        onClick={() => onEdit(row)}
                        className="cursor-pointer flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm bg-[#E87A24] hover:bg-[#d56d1c] text-white shadow-sm transition-colors"
                        style={FONT_BOLD}
                    >
                        <Icons.Pencil className="w-4 h-4" /> Edit
                    </button>
                    <button
                        onClick={(e) => onToggleStatus(e, row)}
                        disabled={isStatusLoading}
                        className="cursor-pointer flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm border border-[#E2E8F0] text-[#422026] hover:bg-[#F8FAFC] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        style={FONT_BOLD}
                    >
                        {isStatusLoading ? <Icons.LoaderCircle className="h-4 w-4 animate-spin text-slate-600" strokeWidth={2.5} /> : <Icons.Power className="w-4 h-4" />}
                        {row.isActive ? "Mark inactive" : "Mark active"}
                    </button>
                    <button
                        onClick={() => onResetPassword(row)}
                        disabled={isPasswordResetLoading}
                        className="cursor-pointer flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm border border-[#4A76C0]/30 text-[#4A76C0] bg-[#4A76C0]/5 hover:bg-[#4A76C0]/15 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        style={FONT_BOLD}
                    >
                        {isPasswordResetLoading ? <Icons.LoaderCircle className="h-4 w-4 animate-spin text-blue-600" strokeWidth={2.5} /> : <Icons.KeyRound className="w-4 h-4" />}
                        Reset password
                    </button>
                    <button
                        onClick={() => onDelete([row._id])}
                        className="cursor-pointer flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm border border-[#DC2626]/30 text-[#DC2626] bg-[#DC2626]/5 hover:bg-[#DC2626]/15 transition-colors"
                        style={FONT_BOLD}
                    >
                        <Icons.Trash2 className="w-4 h-4" /> Delete
                    </button>
                </motion.div>
            </motion.aside>
        </div>
    );
};

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export const Control_Management = () => <EmpMAgmt />; // kept so existing route/import names keep working

const EmpMAgmt = () => {
    // --- API hooks ---
    const { useMe } = useAuth();
    const { role, id } = useMe?.data?.user?.decoded || {};
    // console.log("Current user role:", role, "ID:", id);
    const { getStaffCredit_, GetMeDetails_Admin_ } = useGet();
    const {
        data: Staffs,
        isPending: sraffLoading,
        error: staffError,
    } = getStaffCredit_;
    console.log("Staffs data:", Staffs);
    const { DeleteStaff_ } = UseDelete();
    const { EditStatus_admin_, SendStaffPasswordReset_ } = useEdit();
// console.log("Staffs data:", Staffs, "Loading:", sraffLoading, "Error:", staffError);
    // --- Data: one fetch, split into two separate collections ---
    const [collections, setCollections] = useState({ staff: [], client: [] });
    const [isLoading, setIsLoading] = useState(true);
    const inFlight = useRef(false);
    const locationDetailsRef = useRef(null);
    const recordsLoading = isLoading || sraffLoading;

    const loadRecords = useCallback(async () => {
        const location = locationDetailsRef.current;
        console.log("Loading records for location:", location);
        if (!location || inFlight.current) return;

        inFlight.current = true;
        setIsLoading(true);
        try {
            await getStaffCredit_.mutateAsync(location);
        } catch (error) {
            console.error("Fetch Error:", error);
            ErrorNotify(
                error?.response?.data?.message ||
                    staffError?.response?.data?.message ||
                    "Failed to load records.",
            );
        } finally {
            setIsLoading(false);
            inFlight.current = false;
        }
    }, [getStaffCredit_.mutateAsync, staffError]);

    // --- UI state ---
    const [activeTab, setActiveTab] = useState("staff");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState([]);

    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);
    const [editingUserRole, setEditingUserRole] = useState(null);

    const [deleteModal, setDeleteModal] = useState({ isOpen: false, ids: [] });
    const [deleteInput, setDeleteInput] = useState("");
    const [deleteError, setDeleteError] = useState("");
    const [statusModal, setStatusModal] = useState(null);
    const [locationDetails, setLocationDetails] = useState({
        province: "",
        provinceName: "",
        districtName: "",
        localLevel: "",
    });

    const [locationDetailsError, setLocationDetailsError] = useState(null);

    useEffect(() => {
        if (!Staffs) return;

        const fetched = Staffs?.data?.data || Staffs?.data || Staffs || [];
        const list = Array.isArray(fetched) ? fetched : [];
        const byRole = (role) =>
            list.filter((user) => (user.role || "").toLowerCase() === role);
        setCollections({ staff: byRole("staff"), client: byRole("client") });
    }, [Staffs]);

    useEffect(() => {
        if (!id) {
            setIsLoading(false);
            return;
        }

        let active = true;
        setIsLoading(true);

        const fetchAdminAndStaff = async () => {
            setLocationDetailsError(null);

            try {
                const { data } = await GetMeDetails_Admin_.mutateAsync({
                    params: { id },
                });

                console.log('GetMeDetails_Admin_',data);
                if (!active) return;

                const location = {
                    province: Number(data?.province) || "",
                    provinceName: data?.provinceName || "",
                    districtName: data?.district || "",
                    localLevel: data?.localLevelName || "",
                };
                locationDetailsRef.current = location;
                setLocationDetails(location);

                inFlight.current = true;
                try {
                    await getStaffCredit_.mutateAsync(location);
                } catch (staffCreditFetchError) {
                    if (active) {
                        console.error(
                            "Failed to fetch staff credit data:",
                            staffCreditFetchError,
                        );
                        ErrorNotify(
                            staffCreditFetchError?.response?.data?.message ||
                                "Failed to load records.",
                        );
                    }
                } finally {
                    inFlight.current = false;
                    if (active) setIsLoading(false);
                }
            } catch (locationFetchError) {
                if (active) {
                    setLocationDetailsError(locationFetchError);
                    setIsLoading(false);
                    console.error(
                        "Failed to fetch user location details:",
                        locationFetchError,
                    );
                }
            }
        };

        fetchAdminAndStaff();

        return () => {
            active = false;
            getStaffCredit_.reset();
        };
    }, [
        id,
        getStaffCredit_.mutateAsync,
        getStaffCredit_.reset,
        GetMeDetails_Admin_.mutateAsync,
    ]);

    // Detail drawer: store only the id so the drawer always shows fresh data after a refetch
    const [drawerId, setDrawerId] = useState(null);

    const config = COLLECTIONS[activeTab];
    const records = collections[activeTab];


    const drawerRow = useMemo(
        () => (drawerId ? records.find((r) => r._id === drawerId) || null : null),
        [drawerId, records]
    );


    // Prevent background scrolling while modals / drawer are open
    useEffect(() => {
        const lock = showRegisterModal || deleteModal.isOpen || !!drawerRow;
        document.body.style.overflow = lock ? "hidden" : "unset";
        return () => { document.body.style.overflow = "unset"; };
    }, [showRegisterModal, deleteModal.isOpen, drawerRow]);

    // Close drawer with Escape
    useEffect(() => {
        if (!drawerId) return;
        const onKey = (e) => { if (e.key === "Escape" && !showRegisterModal && !deleteModal.isOpen) setDrawerId(null); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [drawerId, showRegisterModal, deleteModal.isOpen]);

    // --- Statistics (for the active collection, unaffected by search/filter) ---
    const stats = useMemo(() => {
        const total = records.length;
        const active = records.filter((r) => r.isActive).length;
        const provinces = new Set(records.map((r) => r.provinceName).filter(Boolean)).size;
        return { total, active, inactive: total - active, provinces };
    }, [records]);

    // --- Filtering (scoped to the active collection only) ---
    const filtered = useMemo(() => {
        let result = records;
        if (statusFilter !== "all") {
            result = result.filter((r) => (statusFilter === "active" ? r.isActive : !r.isActive));
        }
        const term = search.trim().toLowerCase();
        if (term) {
            result = result.filter((r) => config.searchFields.some((f) => r[f]?.toString().toLowerCase().includes(term)));
        }
        return result;
    }, [records, statusFilter, search, config]);

    useEffect(() => { setCurrentPage(1); }, [search, statusFilter, activeTab]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * ROWS_PER_PAGE;
        return filtered.slice(start, start + ROWS_PER_PAGE);
    }, [filtered, currentPage]);

    // --- Selection ---
    const allSelected = filtered.length > 0 && selectedIds.length === filtered.length;
    const indeterminate = selectedIds.length > 0 && !allSelected;

    const toggleRow = (id) =>
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    const toggleAll = () => setSelectedIds(allSelected || indeterminate ? [] : filtered.map((r) => r._id));

    const switchTab = (key) => {
        if (key === activeTab) return;
        setActiveTab(key);
        setSelectedIds([]);
        setSearch("");
        setStatusFilter("all");
        setDrawerId(null);
    };

    // --- Status toggle ---
    const handleToggleStatus = (e, row) => {
        e?.stopPropagation?.();
        if (EditStatus_admin_.isPending) return;
        setStatusModal(row);
    };

    const executeStatusChange = () => {
        if (!statusModal || EditStatus_admin_.isPending) return;
        const row = statusModal;
        waitingNotify("Updating user status...");
        EditStatus_admin_.mutate(
            { params: { id: row._id }, payload: { isActive: !row.isActive, role: row.role } },
            {
                onSuccess: (res) => {
                    SuccessNotify(res?.message || res?.msg || "User status updated successfully.");
                    loadRecords();
                    setStatusModal(null);
                },
                onError: (err) => {
                    console.error(err);
                    ErrorNotify(err?.response?.data?.message || "Failed to update user status.");
                },
            }
        );
    };

    // --- Register / edit modal ---
    const openCreateModal = () => {
        setIsEditMode(false);
        setEditingUserId(null);
        setEditingUserRole(null);
        setShowRegisterModal(true);
    };
    const openEditModal = (row) => {
        setIsEditMode(true);
        setEditingUserId(row._id);
        setEditingUserRole(row.role);
        setShowRegisterModal(true);
    };
    const closeRegisterModal = () => {
        setShowRegisterModal(false);
        setIsEditMode(false);
        setEditingUserId(null);
        setEditingUserRole(null);
    };

    // --- Password reset ---
    const handleResetPassword = (row) => {
        waitingNotify("Sending password reset link...");
        SendStaffPasswordReset_.mutate(
            { params: { id: row._id } },
            {
                onSuccess: (res) => SuccessNotify(res?.message || "Password reset link sent."),
                onError: (error) => {
                    console.error("Password reset error:", error);
                    ErrorNotify(error?.response?.data?.message || "Failed to send password reset link.");
                },
            }
        );
    };

    // --- Delete ---
    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, ids: [] });
        setDeleteInput("");
        setDeleteError("");
    };
    const triggerDelete = (ids) => {
        setDeleteModal({ isOpen: true, ids: Array.isArray(ids) ? ids : [ids] });
        setDeleteInput("");
        setDeleteError("");
    };
    const executeDelete = () => {
        if (deleteInput !== "delete") {
            setDeleteError("Not matched. Please type 'delete'.");
            return;
        }
        waitingNotify("Deleting user...");
        // Roles map is built from the active collection only, so staff and client ids never mix.
        const roles = Object.fromEntries(
            records.filter((r) => deleteModal.ids.includes(r._id)).map((r) => [r._id, r.role])
        );
        DeleteStaff_.mutate(
            { params: { ids: deleteModal.ids, roles } },
            {
                onSuccess: (res) => {
                    setSelectedIds((prev) => prev.filter((i) => !deleteModal.ids.includes(i)));
                    if (deleteModal.ids.includes(drawerId)) setDrawerId(null);
                    SuccessNotify(res?.data?.message || res?.msg || "Successfully deleted.");
                    loadRecords();
                    closeDeleteModal();
                },
                onError: (error) => {
                    console.error("Delete Error:", error);
                    ErrorNotify(error?.response?.data?.message || "Failed to delete.");
                },
            }
        );
    };

    const th = "px-5 py-4 text-left text-[10px] font-bold text-[#64748B] uppercase tracking-widest whitespace-nowrap";
    const colSpan = config.columns.length + 2; // checkbox + actions

    return (
        <div className="p-4 sm:p-6 bg-white rounded-2xl shadow-sm border border-[#E2E8F0] relative">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#E87A24] text-white flex items-center justify-center shadow-sm">
                        <Icons.Users className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl text-[#422026]" style={FONT_BOLD}>
                            Employee <span className="text-[#E87A24]">Management</span>
                            {/* {id && <span className="text-[#64748B]"> - {id}-{role}</span>} */}
                        </h2>
                        <p className="text-xs text-[#64748B] mt-0.5" style={FONT_LIGHT}>
                            Manage access, status and credentials for registered staff and clients.
                        </p>
                    </div>
                </div>
                <button
                    onClick={openCreateModal}
                    className="cursor-pointer w-full lg:w-auto px-4 py-2.5 bg-[#E87A24] hover:bg-[#d56d1c] text-white rounded-xl flex items-center justify-center text-sm shadow-md transition-all whitespace-nowrap"
                    style={FONT_BOLD}
                >
                    <Icons.Plus className="w-4 h-4 mr-1.5" /> Register Profile
                </button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                {recordsLoading ? (
                    [0, 1, 2, 3].map((i) => <StatCardSkeleton key={i} />)
                ) : (
                    <React.Fragment key={activeTab}>
                        <StatCard index={0} icon={Icons.Users} tone="orange" label={`Total ${config.label}`} value={stats.total} total={stats.total}
                            active={statusFilter === "all"} onClick={() => setStatusFilter("all")} />
                        <StatCard index={1} icon={Icons.UserCheck} tone="green" label="Active" value={stats.active} total={stats.total}
                            active={statusFilter === "active"} onClick={() => setStatusFilter("active")} />
                        <StatCard index={2} icon={Icons.UserX} tone="slate" label="Inactive" value={stats.inactive} total={stats.total}
                            active={statusFilter === "inactive"} onClick={() => setStatusFilter("inactive")} />
                        <StatCard index={3} icon={Icons.MapPin} tone="blue" label="Provinces" value={stats.provinces} total={0} suffix="" />
                    </React.Fragment>
                )}
            </div>

            {/* Collection tabs */}
            <div role="tablist" className="flex gap-1 border-b border-[#E2E8F0] mb-4 overflow-x-auto">
                {TAB_ORDER.map((key) => {
                    const c = COLLECTIONS[key];
                    const TabIcon = c.icon;
                    const isActive = key === activeTab;
                    return (
                        <button
                            key={key}
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => switchTab(key)}
                            className={`cursor-pointer flex items-center gap-2 px-4 py-3 text-sm border-b-2 -mb-px transition-colors whitespace-nowrap ${isActive ? "border-[#E87A24] text-[#E87A24]" : "border-transparent text-[#64748B] hover:text-[#422026]"
                                }`}
                            style={FONT_BOLD}
                        >
                            <TabIcon className="w-4 h-4" />
                            {c.label}
                            <span className={`text-[11px] px-2 py-0.5 rounded-full ${isActive ? "bg-[#E87A24]/15 text-[#E87A24]" : "bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]"}`}>
                                {recordsLoading ? <Skeleton className="h-3 w-5 rounded-full" /> : collections[key].length}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                    <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={config.searchHint}
                        className="pl-9 pr-4 py-2.5 border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#4A76C0] focus:ring-2 focus:ring-[#4A76C0]/20 rounded-xl w-full text-sm text-[#422026] placeholder:text-[#64748B] outline-none transition-all"
                        style={FONT_LIGHT}
                    />
                </div>
                <div className="flex bg-[#F8FAFC] border border-[#E2E8F0] p-1 rounded-xl w-full sm:w-auto">
                    {[
                        ["all", "All"],
                        ["active", "Active"],
                        ["inactive", "Inactive"],
                    ].map(([val, label]) => (
                        <button
                            key={val}
                            onClick={() => setStatusFilter(val)}
                            className={`cursor-pointer flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${statusFilter === val ? "bg-white text-[#E87A24] shadow-sm" : "text-[#64748B] hover:text-[#422026]"
                                }`}
                            style={FONT}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] shadow-sm w-full">
                <table className="min-w-full divide-y divide-[#E2E8F0]">
                    <thead className="bg-[#F8FAFC]">
                        <tr>
                            <th className="px-5 py-4 w-12 text-left">
                                <CustomCheckbox
                                    label="Select all"
                                    checked={allSelected}
                                    indeterminate={indeterminate}
                                    onChange={toggleAll}
                                />
                            </th>
                            {config.columns.map((col) => (
                                <th key={col.id} className={th}>{col.label}</th>
                            ))}
                            <th className={th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-[#E2E8F0]">
                        {recordsLoading ? (
                            Array.from({ length: SKELETON_ROWS }, (_, i) => <TableRowSkeleton key={i} />)
                        ) : paginatedData.length > 0 ? (
                            paginatedData.map((r, i) => {
                                const position = config.position(r);
                                const contact = config.contact(r);
                                const isSelected = selectedIds.includes(r._id);
                                return (
                                    <motion.tr
                                        key={r._id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: Math.min(i, 10) * 0.03, duration: 0.25 }}
                                        className={`hover:bg-[#F8FAFC] transition-colors ${isSelected ? "bg-[#E87A24]/5" : ""}`}
                                    >
                                        <td className="px-5 py-3 whitespace-nowrap">
                                            <CustomCheckbox label={`Select ${r.username}`} checked={isSelected} onChange={() => toggleRow(r._id)} />
                                        </td>
                                        <td className="px-5 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <Avatar name={r.username} online={!!r.isActive} />
                                                <div className="flex flex-col min-w-0 items-start">
                                                    <button
                                                        type="button"
                                                        onClick={() => setDrawerId(r._id)}
                                                        title={`View ${r.username}`}
                                                        className="cursor-pointer text-sm text-[#422026] truncate max-w-full text-left hover:text-[#E87A24] hover:underline underline-offset-4 transition-colors"
                                                        style={FONT_BOLD}
                                                    >
                                                        {r.username}
                                                    </button>
                                                    <span className="text-[11px] text-[#64748B] font-medium truncate">{r.officeEmail}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 whitespace-nowrap">
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-xs text-[#422026]" style={FONT_BOLD}>{position.primary || "N/A"}</span>
                                                <span className="text-[11px] text-[#64748B] truncate">{position.secondary || "N/A"}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 whitespace-nowrap">
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-xs text-[#422026]" style={FONT_BOLD}>{contact.primary || "N/A"}</span>
                                                <span className="text-[11px] text-[#64748B] truncate">{contact.secondary || "N/A"}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 whitespace-nowrap">
                                            <StatusBadge active={!!r.isActive} />
                                        </td>
                                        <td className="px-5 py-3 whitespace-nowrap">
                                            <ActionButtons
                                                row={r}
                                                onDelete={triggerDelete}
                                                onToggleStatus={handleToggleStatus}
                                                onEdit={openEditModal}
                                                onResetPassword={handleResetPassword}
                                                isStatusLoading={EditStatus_admin_.isPending && EditStatus_admin_.variables?.params?.id === r._id}
                                                isPasswordResetLoading={SendStaffPasswordReset_.isPending && SendStaffPasswordReset_.variables?.params?.id === r._id}
                                            />
                                        </td>
                                    </motion.tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={colSpan} className="py-12 text-center text-[#64748B]" style={FONT_LIGHT}>
                                    {records.length === 0 ? `No ${config.label.toLowerCase()} registered yet.` : "No records match your filters."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {!recordsLoading && filtered.length > ROWS_PER_PAGE && (
                    <Pagination rowCount={filtered.length} currentPage={currentPage} onChangePage={setCurrentPage} />
                )}
            </div>

            {/* Floating bulk action bar */}
            <AnimatePresence>
                {selectedIds.length > 0 && (
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#422026] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 z-40"
                    >
                        <span className="text-sm font-medium">
                            <span className="text-[#F59E0B] font-bold">{selectedIds.length}</span> {config.label.toLowerCase()} selected
                        </span>
                        <div className="w-px h-5 bg-white/20" />
                        <button
                            onClick={() => triggerDelete(selectedIds)}
                            className="cursor-pointer flex items-center text-sm text-[#fca5a5] hover:text-white transition-colors font-medium"
                        >
                            <Icons.Trash2 className="w-4 h-4 mr-2" /> Delete selected
                        </button>
                        <button
                            onClick={() => setSelectedIds([])}
                            aria-label="Clear selection"
                            className="cursor-pointer p-1 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <Icons.X className="w-4 h-4 text-white/70" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Right detail drawer */}
            <AnimatePresence>
                {drawerRow && (
                    <DetailDrawer
                        key="detail-drawer"
                        row={drawerRow}
                        config={config}
                        onClose={() => setDrawerId(null)}
                        onEdit={openEditModal}
                        onResetPassword={handleResetPassword}
                        onToggleStatus={handleToggleStatus}
                        onDelete={triggerDelete}
                        isStatusLoading={EditStatus_admin_.isPending && EditStatus_admin_.variables?.params?.id === drawerRow._id}
                        isPasswordResetLoading={SendStaffPasswordReset_.isPending && SendStaffPasswordReset_.variables?.params?.id === drawerRow._id}
                    />
                )}
            </AnimatePresence>

            {/* Status confirmation modal */}
            <AnimatePresence>
                {statusModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60" style={{ backdropFilter: "blur(10px)" }}>
                        <motion.div
                            role="alertdialog"
                            aria-modal="true"
                            aria-labelledby="status-confirm-title"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
                        >
                            <div className="flex items-start gap-3">
                                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-600">
                                    <Icons.AlertCircle className="h-5 w-5" />
                                </span>
                                <div>
                                    <h2 id="status-confirm-title" className="text-sm font-bold text-slate-900 sm:text-base">
                                        {statusModal.isActive ? "Deactivate" : "Activate"} {statusModal.username}?
                                    </h2>
                                    <p className="mt-1 text-xs font-medium text-slate-500">
                                        {statusModal.isActive
                                            ? "This account will be deactivated. Existing records will be preserved."
                                            : "This account will be activated and allowed to access the system again."}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed"
                                    onClick={() => setStatusModal(null)}
                                    disabled={EditStatus_admin_.isPending}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                                    onClick={executeStatusChange}
                                    disabled={EditStatus_admin_.isPending}
                                >
                                    {EditStatus_admin_.isPending
                                        ? <Icons.LoaderCircle className="h-3 w-3 animate-spin" />
                                        : <Icons.Check className="h-4 w-4" />}
                                    {statusModal.isActive ? "Deactivate" : "Activate"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete confirmation modal */}
            <AnimatePresence>
                {deleteModal.isOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60" style={{ backdropFilter: "blur(10px)" }}>
                        {/* <div className="absolute inset-0  backdrop-blur-md" /> */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            onClick={(event) => event.stopPropagation()}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="w-12 h-12 rounded-full bg-[#DC2626]/10 flex items-center justify-center mb-4">
                                    <Icons.AlertTriangle className="w-6 h-6 text-[#DC2626]" />
                                </div>
                                <h3 className="text-xl font-bold text-[#422026] mb-2">
                                    Delete {deleteModal.ids.length > 1 ? `${deleteModal.ids.length} records` : "record"}?
                                </h3>
                                <p className="text-sm text-[#64748B] mb-6">
                                    This action cannot be undone. To confirm, type <span className="font-bold text-[#422026]">delete</span> below.
                                </p>
                                <input
                                    type="text"
                                    value={deleteInput}
                                    onChange={(e) => { setDeleteInput(e.target.value); setDeleteError(""); }}
                                    placeholder="Type 'delete' to confirm"
                                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${deleteError
                                        ? "border-[#DC2626]/50 focus:border-[#DC2626] bg-[#DC2626]/5"
                                        : "border-[#E2E8F0] focus:border-[#4A76C0] focus:ring-2 focus:ring-[#4A76C0]/20 bg-[#F8FAFC] focus:bg-white"
                                        }`}
                                />
                                {deleteError && (
                                    <p className="text-sm text-[#DC2626] mt-2 flex items-center">
                                        <Icons.AlertCircle className="w-4 h-4 mr-1" /> {deleteError}
                                    </p>
                                )}
                            </div>
                            <div className="flex border-t border-[#E2E8F0]">
                                <button onClick={closeDeleteModal} className="cursor-pointer flex-1 px-4 py-4 text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC] transition-colors">
                                    Cancel
                                </button>
                                <div className="w-px bg-[#E2E8F0]" />
                                <button
                                    onClick={executeDelete}
                                    disabled={DeleteStaff_.isPending}
                                    className="cursor-pointer flex-1 px-4 py-4 text-sm font-bold text-[#DC2626] hover:bg-[#DC2626]/5 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {DeleteStaff_.isPending && (
                                        <Icons.LoaderCircle className="mr-2 inline h-3 w-3 animate-spin text-[#DC2626]" strokeWidth={2.5} />
                                    )}
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Registration / edit modal */}
            {showRegisterModal && (
                <RegisterModal_Staff
                    isEditMode={isEditMode}
                    userId={editingUserId}
                    userRole={editingUserRole}
                    onClose={closeRegisterModal}
                    onSuccess={loadRecords}
                />
            )}
        </div>
    );
};

export default EmpMAgmt;