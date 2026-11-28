import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  animate,
  useReducedMotion,
} from "framer-motion";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Eye,
  Trash2,
  X,
  Pencil,
  AlertTriangle,
  Building2,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  IdCard,
  Calendar,
  Clock,
  ShieldCheck,
  Landmark,
  FileText,
  LoaderCircle,
} from "lucide-react";



import { useAuth } from "../../hooks/useAuth";
import { useGet } from "../../hooks/useGet";
import { useEdit } from "../../hooks/useEdit";
import { UseDelete } from "../../hooks/useDelete";
import { SuccessNotify,waitingNotify ,dismissWaitingNotify} from "../../hotToaster";
import RecruitmentForm from "./emp-mgt_client";
import { Skeleton } from "../../skeleton";


const animatedComponents = makeAnimated();

/* ------------------------------ Constants -------------------------------- */

const PER_PAGE = 10;
const STATUSES = ["Active", "On Leave", "Terminated"];
const STATUS_META = {
  Active: { pill: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  "On Leave": { pill: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  Terminated: { pill: "bg-red-50 text-red-700", dot: "bg-red-500" },
};

const EMP_STATUS_OPTIONS = [
  { value: "Active", label: "Active", dot: "bg-emerald-500" },
  { value: "On Leave", label: "On Leave", dot: "bg-amber-500" },
  { value: "Terminated", label: "Terminated", dot: "bg-red-500" },
];

const EMP_STATUS_COLORS = {
  Active: { background: "#ECFDF5", foreground: "#047857" },
  "On Leave": { background: "#FFFBEB", foreground: "#B45309" },
  Terminated: { background: "#FEF2F2", foreground: "#B91C1C" },
};

const empStatusSelectStyles = {
  container: (base) => ({ ...base, width: 140, maxWidth: "100%" }),
  control: (base, state) => {
    const status = state.getValue()[0]?.value || "Active";
    const colors = EMP_STATUS_COLORS[status] || EMP_STATUS_COLORS.Active;
    return {
      ...base,
      minHeight: 32,
      borderRadius: 9999,
      fontWeight: 500,
      borderColor: state.isFocused ? "#FCD34D" : "transparent",
      backgroundColor: colors.background,
      boxShadow: state.isFocused ? "0 0 0 2px #F59E0B4D" : "none",
      cursor: state.isDisabled ? "wait" : "pointer",
      "&:hover": { borderColor: state.isFocused ? "#FCD34D" : "transparent" },
    };
  },
  valueContainer: (base) => ({ ...base, minWidth: 0, padding: "0 0 0 10px" }),
  singleValue: (base, state) => ({
    ...base,
    color: state.isDisabled
      ? "#94A3B8"
      : (EMP_STATUS_COLORS[state.data.value] || EMP_STATUS_COLORS.Active)
          .foreground,
    fontSize: 12,
    fontWeight: 600,
  }),
  indicatorsContainer: (base) => ({ ...base, paddingRight: 4 }),
  dropdownIndicator: (base, state) => ({
    ...base,
    padding: 4,
    color: state.isDisabled
      ? "#94A3B8"
      : (
          EMP_STATUS_COLORS[state.getValue()[0]?.value] ||
          EMP_STATUS_COLORS.Active
        ).foreground,
    "&:hover": { color: "#0F172A" },
  }),
  indicatorSeparator: () => ({ display: "none" }),
  menuPortal: (base) => ({ ...base, zIndex: 300 }),
  menu: (base) => ({ ...base, overflow: "hidden", borderRadius: 8 }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#F97316"
      : state.isFocused
        ? "#FFF7ED"
        : "#FFFFFF",
    color: state.isSelected ? "#FFFFFF" : "#1E293B",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 500,
  }),
};

const STATUS_TABS = [
  { key: "all", label: "All Employees" },
  ...STATUSES.map((status) => ({ key: status, label: status })),
];

const DRAWER_WIDTH = {
  md: "sm:max-w-md",
  lg: "sm:max-w-xl",
  xl: "sm:max-w-2xl",
};

/* --------------------------- Motion constants ---------------------------- */

const BRAND = "bg-gradient-to-r from-amber-500 to-orange-500";
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40";
const NO_SCROLLBAR = "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

const press = (disabled) =>
  disabled ? {} : { whileHover: "hover", whileTap: "tap" };
const btnVariants = { hover: { scale: 1.02 }, tap: { scale: 0.97 } };
const iconVariants = {
  hover: { rotate: -8, scale: 1.12 },
  tap: { scale: 0.92 },
};

function CountUp({ value, reduceMotion }) {
  const ref = useRef(null);
  const fmt = useMemo(() => new Intl.NumberFormat("en-IN"), []);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (reduceMotion) {
      node.textContent = fmt.format(value);
      return undefined;
    }
    const controls = animate(0, value, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate: (v) => {
        node.textContent = fmt.format(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [value, reduceMotion, fmt]);

  return (
    <span ref={ref} className="tabular-nums">
      0
    </span>
  );
}

const COLUMNS = [
  ["Emp ID", "empId"],
  ["Full Name", "fullName"],
  ["Department", "department"],
  ["Designation", "designation"],
  ["Branch", "branch"],
  ["Email", "email"],
  ["Phone", "phone"],
  ["Join Date (BS)", "joinDate"],
  ["Employment Type", "employmentType"],
  ["Status", "status"],
];

const SEARCH_KEYS = [
  "empId",
  "fullName",
  "department",
  "designation",
  "branch",
  "email",
  "phone",
  "employmentType",
];

const selectStyles = {
  control: (base, s) => ({
    ...base,
    minHeight: 40,
    borderRadius: 8,
    fontWeight: 500,
    fontSize: 12,
    borderColor: s.isFocused ? "#F59E0B" : "#E2E8F0",
    boxShadow: s.isFocused ? "0 0 0 2px #F59E0B1A" : "none",
    "&:hover": { borderColor: "#F59E0B" },
  }),
  menuPortal: (base) => ({ ...base, zIndex: 300 }),
  menu: (base) => ({
    ...base,
    fontSize: 12,
    borderRadius: 9,
    overflow: "hidden",
  }),
  option: (base, s) => ({
    ...base,
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    color: s.isSelected ? "#FFFFFF" : "#1E293B",
    backgroundColor: s.isSelected
      ? "#F97316"
      : s.isFocused
        ? "#FFF7ED"
        : "#FFFFFF",
  }),
  placeholder: (base) => ({ ...base, color: "#64748B", fontWeight: 500 }),
  indicatorSeparator: () => ({ display: "none" }),
};

/* ------------------------------- Helpers --------------------------------- */

const getEmpId = (emp) => emp?.id || emp?._id;
const errMsg = (e, fallback) =>
  e?.response?.data?.message || e?.message || fallback;

const PREVIEW_SECTIONS = [
  {
    title: "Personal & Contact Information",
    icon: Users,
    fields: [
      ["Employee ID", IdCard, (e) => e.empId],
      ["Full Name", Users, (e) => e.fullName],
      ["Email Address", Mail, (e) => e.email],
      ["Phone Number", Phone, (e) => e.phone],
      ["Address", MapPin, (e) => e.address],
      ["Citizenship / ID No.", ShieldCheck, (e) => e.citizenshipNo],
    ],
  },
  {
    title: "Job & Organizational Details",
    icon: Briefcase,
    fields: [
      ["Department", Building2, (e) => e.department],
      ["Designation", Briefcase, (e) => e.designation],
      ["Branch Office", Landmark, (e) => e.branch],
      ["Employment Type", Clock, (e) => e.employmentType],
      ["Joining Date (BS)", Calendar, (e) => e.joinDate],
      ["Status", ShieldCheck, (e) => e.status],
    ],
  },
];

function useEscape(onEscape, { enabled = true, ignoreFields = false } = {}) {
  const ref = useRef(onEscape);
  ref.current = onEscape;

  useEffect(() => {
    if (!enabled) return undefined;
    const handler = (e) => {
      if (e.key !== "Escape") return;
      const t = e.target;
      if (
        ignoreFields &&
        (t?.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(t?.tagName))
      )
        return;
      ref.current();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, ignoreFields]);
}

/* ---------------------------------- Page --------------------------------- */

export const HrPage = ({ onAdd, onUpdate, onDelete }) => {
  const reduceMotion = useReducedMotion();
  const { useMe } = useAuth();
  const { role, id } = useMe?.data?.user?.decoded || {};

  // Replace hook names below with your actual HR hooks from useGet / useEdit / UseDelete
  const { GetAllEmployees_ } = useGet({
    currentUser: { role, id },
    isAuthLoading: useMe.isLoading,
  });
  const { EditEmployee_ } = useEdit();
  const { DeleteEmployee_ } = UseDelete();

  const { data, isLoading, error } = GetAllEmployees_ || {};
  console.log('data',data)
  const loading = Boolean(isLoading || useMe?.isLoading);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    department: null,
    branch: null,
    status: null,
  });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [showStats, setShowStats] = useState(true);

  const [preview, setPreview] = useState(null);
  const [formModal, setFormModal] = useState(null); // { mode: "add" | "edit", employee: obj | null }
  const [empToDelete, setEmpToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusOverrides, setStatusOverrides] = useState({});
  const statusUpdateLock = useRef(false);

  // Sample fallback data when API returns empty/undefined during setup
  const rawRecords = useMemo(() => {
    const apiList = Array.isArray(data?.data) ? data.data : [];
    return apiList.map((emp) => {
      const key = String(getEmpId(emp));
      return {
        ...emp,
        id: emp._id || emp.id,
        status: statusOverrides[key] || emp.status || "Active",
      };
    });
  }, [data, statusOverrides]);

  const stats = useMemo(() => {
    const total = rawRecords.length;
    const counts = {};
    rawRecords.forEach((r) => {
      counts[r.status] = (counts[r.status] || 0) + 1;
    });
    const pct = (n) => (total ? Math.round((n / total) * 100) : 0);

    return {
      total,
      counts,
      pct: Object.fromEntries(STATUSES.map((s) => [s, pct(counts[s] || 0)])),
      statusOptions: STATUSES.map((s) => ({ value: s, label: s })),
    };
  }, [rawRecords]);

  const departmentOptions = useMemo(
    () =>
      [...new Set(rawRecords.map((r) => r.department).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b))
        .map((value) => ({ value, label: value })),
    [rawRecords],
  );

  const branchOptions = useMemo(
    () =>
      [...new Set(rawRecords.map((r) => r.branch).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b))
        .map((value) => ({ value, label: value })),
    [rawRecords],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rawRecords.filter((r) => {
      const matchesSearch =
        !q ||
        SEARCH_KEYS.some((k) =>
          String(r[k] ?? "")
            .toLowerCase()
            .includes(q),
        );
      const matchesDept =
        !filters.department || r.department === filters.department.value;
      const matchesBranch =
        !filters.branch || r.branch === filters.branch.value;
      const matchesStatus =
        !filters.status || r.status === filters.status.value;
      return matchesSearch && matchesDept && matchesBranch && matchesStatus;
    });
  }, [rawRecords, search, filters]);

  const hasFilters = Boolean(
    search || filters.department || filters.branch || filters.status,
  );

  const resetView = () => {
    setPage(1);
    setSelected([]);
  };

  const updateFilter = (key, option) => {
    setFilters((p) => ({ ...p, [key]: option }));
    resetView();
  };

  const toggleStatus = (key) =>
    updateFilter(
      "status",
      filters.status?.value === key
        ? null
        : stats.statusOptions.find((o) => o.value === key),
    );

  const selectStatusTab = (key) =>
    updateFilter(
      "status",
      key === "all"
        ? null
        : stats.statusOptions.find((option) => option.value === key),
    );

  const clearFilters = () => {
    setSearch("");
    setFilters({ department: null, branch: null, status: null });
    resetView();
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, totalPages);
  const pageRows = useMemo(
    () => filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE),
    [filtered, current],
  );
  const pageIds = pageRows.map((e) => String(getEmpId(e)));
  const allSelected =
    pageIds.length > 0 && pageIds.every((id) => selected.includes(id));

  const toggleAll = () =>
    setSelected((p) =>
      allSelected
        ? p.filter((id) => !pageIds.includes(id))
        : [...new Set([...p, ...pageIds])],
    );

  const toggleOne = (id) =>
    setSelected((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );

  const openAddModal = () => {
    setPreview(null);
    setFormModal({ mode: "add", employee: null });
  };

  const openEditModal = (employee) => {
    setPreview(null);
    setFormModal({ mode: "edit", employee });
  };

  const refreshEmployees = async (verb, showSuccess = true) => {
    if (showSuccess) SuccessNotify(`Employee ${verb} successfully.`);
    const loadingMessage = "Refreshing employee records...";
    waitingNotify(loadingMessage);
    try {
      await GetAllEmployees_?.refetch?.({ throwOnError: true });
    } catch {
      ErrorNotify(`Employee was ${verb}, but the table could not be refreshed.`);
    } finally {
      dismissWaitingNotify(loadingMessage);
    }
  };

  const retryEmployees = async () => {
    if (isRetrying) return;
    setIsRetrying(true);
    try {
      await GetAllEmployees_?.refetch?.();
    } finally {
      setIsRetrying(false);
    }
  };

  const handleStatusChange = async (emp, nextStatus) => {
    const empId = getEmpId(emp);
    if (statusUpdateLock.current || !empId || emp.status === nextStatus) return;

    statusUpdateLock.current = true;
    setStatusUpdating(true);
    const loadingMessage = "Updating employee status...";
    waitingNotify(loadingMessage);
    try {
      if (EditEmployee_?.mutateAsync) {
        await EditEmployee_.mutateAsync({
          params: { id: empId },
          payload: { status: nextStatus },
        });
      }
      setStatusOverrides((prev) => ({
        ...prev,
        [String(empId)]: nextStatus,
      }));
      SuccessNotify(`Status updated to ${nextStatus}.`);
    } catch (e) {
      ErrorNotify(errMsg(e, "Unable to update employee status."));
    } finally {
      dismissWaitingNotify(loadingMessage);
      statusUpdateLock.current = false;
      setStatusUpdating(false);
    }
  };

  // Sample handler passed to your Employee Form inside the modal
  const handleEmployeeFormSubmit = async (payload) => {
    const isEdit = formModal?.mode === "edit" && formModal?.employee;
    const loadingMessage = isEdit
      ? "Updating employee record..."
      : "Adding new employee...";
    waitingNotify(loadingMessage);
    try {
      if (isEdit) {
        const empId = getEmpId(formModal.employee);
        if (onUpdate) {
          await onUpdate(empId, payload);
        } else if (EditEmployee_?.mutateAsync) {
          await EditEmployee_.mutateAsync({ params: { id: empId }, payload });
        }
      } else {
        if (onAdd) {
          await onAdd(payload);
        }
      }
      setFormModal(null);
      await refreshEmployees(isEdit ? "updated" : "added", true);
    } catch (e) {
      ErrorNotify(
        errMsg(
          e,
          isEdit ? "Unable to update employee." : "Unable to add employee.",
        ),
      );
    } finally {
      dismissWaitingNotify(loadingMessage);
    }
  };

  const confirmDelete = async () => {
    const empId = getEmpId(empToDelete);
    if (!empId) return;
    setIsDeleting(true);
    const loadingMessage = "Deleting employee record...";
    waitingNotify(loadingMessage);
    try {
      if (onDelete) {
        await onDelete(empId);
      } else if (DeleteEmployee_?.mutateAsync) {
        await DeleteEmployee_.mutateAsync({ params: { id: empId } });
      }
      setSelected((p) => p.filter((id) => id !== String(empId)));
      setEmpToDelete(null);
      await refreshEmployees("deleted", true);
    } catch (e) {
      ErrorNotify(errMsg(e, "Unable to delete this employee."));
    } finally {
      dismissWaitingNotify(loadingMessage);
      setIsDeleting(false);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="w-full bg-white font-['Roboto_Slab'] text-xs text-slate-800">
        <div className="mx-auto max-w-[1600px] space-y-5">
          {/* Header */}
          <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                <Users size={21} />
              </span>
              <div>
                <h1 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                  Employees
                </h1>
                <nav
                  aria-label="Breadcrumb"
                  className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-400"
                >
                  <span>HRMS</span>
                  <ChevronRight size={12} />
                  <span className="font-extrabold text-amber-600">
                    Employee Management
                  </span>
                </nav>
              </div>
            </div>

            <motion.button
              type="button"
              onClick={openAddModal}
              {...press(false)}
              variants={btnVariants}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
            >
              <motion.span variants={iconVariants} className="flex">
                <Plus size={18} />
              </motion.span>
              Add employee
            </motion.button>
          </header>

          {error && (
            <div
              role="alert"
              className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              <span>{error.message || "Unable to load employee records."}</span>
              <button
                type="button"
                onClick={retryEmployees}
                disabled={isRetrying}
                className="inline-flex shrink-0 items-center gap-1.5 font-semibold underline disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isRetrying && <LoaderCircle className="h-3 w-3 animate-spin text-red-600" strokeWidth={2.5} />}
                Retry
              </button>
            </div>
          )}

          {/* Status Tabs */}
          <div
            role="tablist"
            aria-label="Employee status"
            className={`-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 ${NO_SCROLLBAR}`}
          >
            {STATUS_TABS.map((tab) => {
              const active = (filters.status?.value || "all") === tab.key;
              const count =
                tab.key === "all" ? stats.total : stats.counts[tab.key] || 0;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => selectStatusTab(tab.key)}
                  className={`inline-flex min-h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-xs font-semibold transition ${FOCUS} ${
                    active
                      ? `${BRAND} text-white shadow-sm`
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`rounded-full px-1.5 py-px text-[10px] font-bold tabular-nums ${
                      active
                        ? "bg-white/25 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {loading ? <Skeleton className="h-3 w-4 rounded-full" /> : count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Overview Stat Cards */}
          <section aria-label="Employee statistics" className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-900 sm:text-base">
                Overview
              </h2>
              <button
                type="button"
                onClick={() => setShowStats((o) => !o)}
                aria-expanded={showStats}
                className="inline-flex min-h-8 items-center gap-1 rounded-md px-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
              >
                {showStats ? "Hide" : "Show"}
                <ChevronDown
                  size={14}
                  className={`transition-transform ${showStats ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            {showStats && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {loading ? (
                  <>
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                  </>
                ) : (
                  [
                    ["Active", "Active staff", UserCheck, "% of total staff"],
                    ["On Leave", "On leave", Clock, "% currently on leave"],
                    ["Terminated", "Terminated", UserX, "% terminated"],
                  ].map(([status, text, Icon, hintSuffix], i) => (
                    <StatCard
                      key={status}
                      index={i}
                      reduceMotion={reduceMotion}
                      label={text}
                      value={stats.counts[status] || 0}
                      hint={`${stats.pct[status]}${hintSuffix}`}
                      icon={Icon}
                      tone={STATUS_META[status].pill}
                      active={filters.status?.value === status}
                      onClick={() => toggleStatus(status)}
                    />
                  ))
                )}
              </div>
            )}
          </section>

          {/* Table & Filter Container */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-4">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto] lg:items-center">
                <div className="relative sm:col-span-2 lg:col-span-1">
                  <Search
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -mt-2 text-slate-400"
                  />
                  <input
                    type="search"
                    aria-label="Search employees"
                    placeholder="Search by employee ID, name, department, designation or email"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      resetView();
                    }}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-medium text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10"
                  />
                </div>

                <Select
                  isClearable
                  isSearchable
                  isLoading={loading}
                  aria-label="Filter by department"
                  components={animatedComponents}
                  options={departmentOptions}
                  value={filters.department}
                  onChange={(option) => updateFilter("department", option)}
                  placeholder="All departments"
                  styles={selectStyles}
                  menuPortalTarget={
                    typeof document !== "undefined" ? document.body : null
                  }
                  menuPosition="fixed"
                />

                <Select
                  isClearable
                  isSearchable
                  isLoading={loading}
                  aria-label="Filter by branch"
                  components={animatedComponents}
                  options={branchOptions}
                  value={filters.branch}
                  onChange={(option) => updateFilter("branch", option)}
                  placeholder="All branches"
                  styles={selectStyles}
                  menuPortalTarget={
                    typeof document !== "undefined" ? document.body : null
                  }
                  menuPosition="fixed"
                />

                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={!hasFilters}
                  className="min-h-10 rounded-lg px-3 text-xs font-semibold text-amber-600 transition hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
                >
                  Clear filters
                </button>
              </div>
            </div>

            <div
              className="w-full overflow-x-auto"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#d1d5db transparent",
              }}
            >
              <table
                className="w-full min-w-[1400px] text-left text-xs"
                aria-busy={loading}
              >
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="w-12 border-b border-slate-200 px-4 py-3">
                      <AnimatedCheckbox
                        checked={allSelected}
                        onChange={toggleAll}
                        label="Select all employees on this page"
                        disabled={loading}
                      />
                    </th>
                    {COLUMNS.map(([name]) => (
                      <th
                        key={name}
                        scope="col"
                        className="whitespace-nowrap border-b border-slate-200 px-4 py-3 text-[11px] font-bold uppercase tracking-wide"
                      >
                        {name}
                      </th>
                    ))}
                    <th
                      scope="col"
                      className="sticky right-0 z-10 whitespace-nowrap border-b border-l border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-bold uppercase tracking-wide"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <TableSkeleton rows={PER_PAGE} cols={COLUMNS.length} />
                  ) : pageRows.length ? (
                    pageRows.map((emp, i) => {
                      const rowId = String(getEmpId(emp));
                      const isSelected = selected.includes(rowId);
                      const groupKey = filters.status?.value || "all";

                      return (
                        <motion.tr
                          key={`${groupKey}-${rowId}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.25,
                            delay: Math.min(i, 10) * 0.03,
                          }}
                          className={`transition ${
                            isSelected
                              ? "bg-amber-50 hover:bg-amber-100"
                              : "bg-white hover:bg-slate-50"
                          }`}
                        >
                          <td className="px-4 py-3">
                            <AnimatedCheckbox
                              checked={isSelected}
                              onChange={() => toggleOne(rowId)}
                              label={`Select ${emp.fullName || "employee"}`}
                            />
                          </td>

                          {COLUMNS.map(([name, key], colIdx) => (
                            <td
                              key={name}
                              className={`px-4 py-3 ${
                                colIdx === 0 ? "whitespace-nowrap" : "max-w-56"
                              }`}
                            >
                              {colIdx === 0 ? (
                                <button
                                  type="button"
                                  onClick={() => setPreview(emp)}
                                  title="View employee details"
                                  className="rounded font-bold text-amber-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
                                >
                                  {emp[key] || "-"}
                                </button>
                              ) : key === "status" ? (
                                <div
                                  className="inline-flex w-full max-w-35 items-center"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Select
                                    aria-label={`Employee status: ${emp.status}`}
                                    aria-busy={statusUpdating || undefined}
                                    value={
                                      EMP_STATUS_OPTIONS.find(
                                        (opt) => opt.value === emp.status,
                                      ) || EMP_STATUS_OPTIONS[0]
                                    }
                                    isDisabled={statusUpdating || !rowId}
                                    isLoading={statusUpdating}
                                    isSearchable={false}
                                    options={EMP_STATUS_OPTIONS}
                                    onChange={(opt) =>
                                      opt && handleStatusChange(emp, opt.value)
                                    }
                                    formatOptionLabel={(option) => (
                                      <span className="inline-flex min-w-0 items-center gap-2">
                                        <span
                                          aria-hidden="true"
                                          className={`h-2 w-2 shrink-0 rounded-full ${option.dot}`}
                                        />
                                        <span className="truncate">
                                          {option.label}
                                        </span>
                                      </span>
                                    )}
                                    styles={empStatusSelectStyles}
                                    menuPortalTarget={
                                      typeof document !== "undefined"
                                        ? document.body
                                        : null
                                    }
                                    menuPosition="fixed"
                                    className="w-full"
                                  />
                                </div>
                              ) : (
                                <span
                                  className="line-clamp-2 font-semibold break-words"
                                  title={String(emp[key] || "-")}
                                >
                                  {emp[key] || "-"}
                                </span>
                              )}
                            </td>
                          ))}

                          <td className="sticky right-0 border-l border-slate-200 bg-inherit px-3 py-3">
                            <div className="flex items-center gap-0.5">
                              <IconAction
                                icon={Eye}
                                label="View employee details"
                                onClick={() => setPreview(emp)}
                                tone="text-blue-600 hover:bg-blue-50"
                              />
                              <IconAction
                                icon={Pencil}
                                label="Edit employee"
                                disabled={!rowId}
                                onClick={() => openEditModal(emp)}
                                tone="text-slate-600 hover:bg-slate-100"
                              />
                              <IconAction
                                icon={Trash2}
                                label="Delete employee"
                                disabled={!rowId}
                                onClick={() => setEmpToDelete(emp)}
                                tone="text-red-500 hover:bg-red-50"
                              />
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={COLUMNS.length + 2}
                        className="px-4 py-16 text-center"
                      >
                        <Users
                          size={25}
                          className="mx-auto mb-2 text-slate-400"
                        />
                        <p className="text-sm font-semibold">
                          No employees found
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {hasFilters
                            ? "No employee matches your search or filters."
                            : "Add an employee to get started."}
                        </p>
                        {hasFilters ? (
                          <button
                            type="button"
                            onClick={clearFilters}
                            className="mt-3 rounded-lg px-3 py-1.5 text-xs font-semibold text-amber-600 hover:bg-orange-50"
                          >
                            Clear filters
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={openAddModal}
                            className="mt-3 rounded-lg px-3 py-1.5 text-xs font-semibold text-amber-600 hover:bg-orange-50"
                          >
                            Add employee
                          </button>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col justify-between gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center">
              {loading ? (
                <Skeleton className="h-4 w-44" />
              ) : (
                <span className="text-[10px] font-medium text-slate-500">
                  Showing {filtered.length ? (current - 1) * PER_PAGE + 1 : 0}{" "}
                  to {Math.min(current * PER_PAGE, filtered.length)} of{" "}
                  {filtered.length} employees
                </span>
              )}

              <div className="flex items-center gap-2">
                <PageButton
                  disabled={loading || current <= 1}
                  onClick={() => setPage(current - 1)}
                >
                  <ChevronLeft size={15} /> Previous
                </PageButton>
                <span className="px-2 text-xs font-semibold text-slate-600">
                  Page {current} of {totalPages}
                </span>
                <PageButton
                  disabled={loading || current >= totalPages}
                  onClick={() => setPage(current + 1)}
                >
                  Next <ChevronRight size={15} />
                </PageButton>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {formModal && (
            <RecruitmentForm
              key="employee-form"
              onClose={() => setFormModal(null)}
              onSuccess={() => {
                void refreshEmployees("created", false);
              }}
            />
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {empToDelete && (
            <Modal
              key="delete-emp-modal"
              alert
              size="max-w-sm"
              locked={isDeleting}
              onClose={() => setEmpToDelete(null)}
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <AlertTriangle size={20} />
                </span>
                <div>
                  <h2 className="text-base font-bold">Delete this employee?</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    <span className="text-slate-800">
                      {empToDelete.fullName}
                    </span>{" "}
                    ({empToDelete.empId || "-"}) will be permanently removed
                    from HR records. This can’t be undone.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  autoFocus
                  onClick={() => setEmpToDelete(null)}
                  disabled={isDeleting}
                  className="min-h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
                >
                  Keep record
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-70"
                >
                  {isDeleting && <LoaderCircle className="h-3 w-3 animate-spin text-white" strokeWidth={2.5} />}
                  Delete employee
                </button>
              </div>
            </Modal>
          )}
        </AnimatePresence>

        {/* Preview SideDrawer */}
        <AnimatePresence>
          {preview && (
            <SideDrawer
              key="emp-preview-drawer"
              size="lg"
              muted
              eyebrow="Employee Profile"
              title={preview.fullName || "Employee Details"}
              subtitle={preview.empId || "-"}
              onClose={() => setPreview(null)}
              footer={
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(preview)}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3 text-sm font-semibold text-white hover:brightness-110"
                  >
                    <Pencil size={16} /> Edit Record
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const target = preview;
                      setPreview(null);
                      setEmpToDelete(target);
                    }}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/50 px-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              }
            >
              <div className="space-y-4">
                {PREVIEW_SECTIONS.map(
                  ({ title, icon: SectionIcon, fields }, section) => {
                    const rows = fields
                      .map(([text, icon, get]) => ({
                        text,
                        icon,
                        value: get(preview),
                      }))
                      .filter(
                        (r) =>
                          r.value !== null &&
                          r.value !== undefined &&
                          r.value !== "",
                      );
                    if (!rows.length) return null;

                    return (
                      <section
                        key={title}
                        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                      >
                        <h3 className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-500">
                          <SectionIcon size={14} className="text-amber-600" />
                          {title}
                        </h3>
                        <dl className="grid grid-cols-1 divide-y divide-slate-100 px-4 sm:grid-cols-2 sm:gap-x-6 sm:divide-y-0">
                          {rows.map((r, row) => (
                            <DetailRow
                              key={r.text}
                              icon={r.icon}
                              label={r.text}
                              value={r.value}
                              section={section}
                              row={row}
                            />
                          ))}
                        </dl>
                      </section>
                    );
                  },
                )}
              </div>
            </SideDrawer>
          )}
        </AnimatePresence>

        {/* Bulk Selection Floating Bar */}
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[90] flex justify-center px-4">
          <AnimatePresence>
            {selected.length > 0 && (
              <motion.div
                key="bulk-bar"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className="pointer-events-auto flex w-full max-w-md items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl"
              >
                <span className="text-xs font-semibold text-amber-600">
                  {selected.length}{" "}
                  {selected.length === 1 ? "employee" : "employees"} selected
                </span>
                <motion.button
                  type="button"
                  onClick={() => setSelected([])}
                  {...press(false)}
                  variants={btnVariants}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-red-50 hover:text-red-500"
                >
                  Clear selection
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
};

/* ------------------------------- Skeletons -------------------------------- */

const SKELETON_WIDTHS = [
  "w-20",
  "w-32",
  "w-24",
  "w-28",
  "w-24",
  "w-28",
  "w-24",
  "w-20",
];

function TableSkeleton({ rows, cols }) {
  return Array.from({ length: rows }, (_, r) => (
    <tr key={r}>
      <td className="px-4 py-4">
        <Skeleton className="h-[18px] w-[18px] rounded-[5px]" />
      </td>
      {Array.from({ length: cols }, (_, c) => (
        <td key={c} className="px-4 py-4">
          <Skeleton
            className={`h-4 ${SKELETON_WIDTHS[(r + c) % SKELETON_WIDTHS.length]}`}
          />
        </td>
      ))}
      <td className="sticky right-0 border-l border-slate-200 bg-white px-3 py-3">
        <div className="flex gap-1">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-9 w-9 rounded-lg" />
          ))}
        </div>
      </td>
    </tr>
  ));
}

function StatCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <Skeleton className="h-11 w-11 rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-12" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

/* ------------------------------ Shared pieces ----------------------------- */

function StatCard({
  label: text,
  value,
  hint,
  icon: Icon,
  tone,
  active,
  onClick,
  index = 0,
  reduceMotion,
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={
        active
          ? "Click to remove this filter"
          : `Show only ${text.toLowerCase()}`
      }
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay: index * 0.07 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={`flex items-center gap-3 rounded-xl border bg-white p-4 text-left shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 ${
        active
          ? "border-amber-500 ring-1 ring-amber-500/30"
          : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${tone}`}
      >
        <Icon size={20} />
      </span>
      <span className="min-w-0">
        <span className="block text-2xl font-bold leading-none">
          <CountUp value={value} reduceMotion={reduceMotion} />
        </span>
        <span className="mt-1 block text-xs font-semibold">{text}</span>
        <span className="block text-[11px] text-slate-400">{hint}</span>
      </span>
    </motion.button>
  );
}

function PageButton({ children, ...props }) {
  return (
    <button
      type="button"
      className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      {...props}
    >
      {children}
    </button>
  );
}

function IconAction({
  icon: Icon,
  label: text,
  onClick,
  tone,
  disabled = false,
}) {
  return (
    <motion.button
      type="button"
      title={text}
      aria-label={text}
      disabled={disabled}
      onClick={onClick}
      {...press(disabled)}
      variants={btnVariants}
      className={`flex h-9 w-9 items-center justify-center rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent ${tone}`}
    >
      <motion.span
        variants={iconVariants}
        className="flex items-center justify-center"
      >
        <Icon size={16} />
      </motion.span>
    </motion.button>
  );
}

function AnimatedCheckbox({ checked, onChange, label: text, disabled }) {
  return (
    <label
      className="inline-flex cursor-pointer items-center justify-center"
      title={text}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="peer sr-only"
        aria-label={text}
      />
      <span className="flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border border-slate-300 bg-white transition-all duration-200 peer-checked:scale-105 peer-checked:border-amber-500 peer-checked:bg-amber-500 peer-focus-visible:ring-2 peer-focus-visible:ring-amber-500/30 peer-disabled:opacity-50">
        <svg
          viewBox="0 0 16 16"
          fill="none"
          className={`h-3 w-3 text-white transition-all duration-200 ${
            checked ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        >
          <path
            d="M3 8L6.5 11.5L13 4.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </label>
  );
}

function DetailRow({ icon: Icon, label: text, value, section = 0, row = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
        delay: 0.15 + section * 0.08 + row * 0.04,
      }}
      className="flex items-start gap-3 py-2.5"
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-amber-600">
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <dt className="text-[11px] font-medium text-slate-400">{text}</dt>
        <dd className="break-words text-sm font-semibold text-slate-800">
          {String(value)}
        </dd>
      </div>
    </motion.div>
  );
}

function Modal({
  title,
  subtitle,
  size = "max-w-4xl",
  alert = false,
  locked = false,
  onClose,
  children,
}) {
  const titleId = useId();
  const close = () => {
    if (!locked) onClose();
  };
  useEscape(close);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6">
      <motion.div
        className="absolute inset-0 bg-black/60"
        style={{ backdropFilter: "blur(10px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onMouseDown={(e) => e.target === e.currentTarget && close()}
      />
      <motion.div
        role={alert ? "alertdialog" : "dialog"}
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        initial={{ opacity: 0, scale: 0.96, y: alert ? 20 : 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: alert ? 20 : 12 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className={`relative flex max-h-[95vh] w-full ${size} flex-col overflow-hidden rounded-2xl shadow-2xl ${
          title ? "bg-slate-50" : "bg-white p-5"
        }`}
      >
        {title && (
          <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
            <div>
              <h2 id={titleId} className="text-lg font-bold">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
            >
              <X size={20} />
            </button>
          </div>
        )}
        {title ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>
        ) : (
          children
        )}
      </motion.div>
    </div>
  );
}

function SideDrawer({
  onClose,
  eyebrow,
  title,
  subtitle,
  size = "md",
  flush = false,
  muted = false,
  footer,
  children,
}) {
  const titleId = useId();
  useEscape(onClose, { ignoreFields: true });

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <motion.div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
        style={{ backdropFilter: "blur(10px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />

      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`relative flex h-full w-full flex-col bg-white shadow-2xl ${DRAWER_WIDTH[size]}`}
      >
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4"
        >
          <div className="min-w-0">
            {eyebrow && (
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-amber-600">
                {eyebrow}
              </p>
            )}
            <h2
              id={titleId}
              className="mt-0.5 truncate text-lg font-bold leading-tight"
              title={title}
            >
              {title}
            </h2>
            {subtitle && (
              <span className="mt-1.5 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                {subtitle}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
          >
            <X size={20} />
          </button>
        </motion.header>

        <div
          className={
            flush
              ? "flex min-h-0 flex-1 flex-col overflow-hidden p-3 sm:p-4"
              : `min-h-0 flex-1 overflow-y-auto p-4 sm:p-5 ${
                  muted ? "bg-slate-50" : ""
                }`
          }
        >
          {children}
        </div>

        {footer && (
          <motion.footer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="shrink-0 border-t border-slate-200 bg-white px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]"
          >
            {footer}
          </motion.footer>
        )}
      </motion.aside>
    </div>
  );
}