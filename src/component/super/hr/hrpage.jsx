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
  CircleCheck,
  CircleX,
   Map as DistrictIcon,
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
  FileUser,
  GraduationCap,
  BriefcaseBusiness,
  Award,
  FileCheck,
  ClipboardCheck,
  Paperclip,
  FileX,
  FolderOpen,
  Download,
  LoaderCircle,
  MapPinned,
  CogIcon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useGet } from "../../hooks/useGet";
import { useEdit } from "../../hooks/useEdit";
import { SuccessNotify, waitingNotify, ErrorNotify,dismissWaitingNotify } from "../../hotToaster";
import { UseDelete } from "../../hooks/useDelete";
import { Skeleton } from "../../skeleton";
import RecruitmentForm from "../../admin/admin_hr/emp-mgt_client";
import { useOnlineUsers } from "../../hooks/useOnlineuser";
// import FileAttachment from "../../fileAttachment";





const animatedComponents = makeAnimated();

/* ------------------------------ Constants -------------------------------- */

const PER_PAGE = 10;
const STATUSES = ["Present", "Absent", "Not Marked"];
const STATUS_META = {
  Present: { pill: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  Absent: { pill: "bg-red-50 text-red-700", dot: "bg-red-500" },
  "Not Marked": { pill: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
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
const TYPOGRAPHY = {
  pageTitle: "text-lg font-extrabold text-slate-900 sm:text-xl",
  sectionTitle: "text-sm font-extrabold text-slate-900 sm:text-base",
  modalTitle: "text-sm font-extrabold text-slate-900 sm:text-base",
  dialogTitle: "text-sm font-bold text-slate-900 sm:text-base",
  drawerTitle: "text-sm font-semibold leading-snug text-slate-900 sm:text-[15px]",
  body: "text-xs text-slate-800",
  bodyMuted: "text-xs text-slate-500",
  helper: "text-xs font-medium text-slate-400",
  emphasis: "font-semibold text-slate-800",
  label: "text-[11px] font-semibold text-slate-600",
  detailLabel: "text-[11px] font-medium text-slate-400",
  detailValue: "text-xs font-bold text-slate-800 sm:text-sm",
  eyebrow: "text-[11px] font-medium text-slate-500",
  subtitle: "text-[11px] tabular-nums text-slate-500",
  hint: "text-[10px] font-medium leading-3 text-slate-800",
  statValue: "text-lg font-extrabold leading-none tabular-nums text-slate-900 sm:text-xl",
  badge: "text-[10px] font-bold tabular-nums",
  button: "text-xs font-semibold",
  buttonLg: "text-sm font-semibold",
  input: "text-xs font-medium text-slate-800 placeholder:text-slate-500",
  tab: "text-[13px] font-medium",
  error: "text-xs font-medium text-red-600",
};

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
  ["Avatar", "avatar", null],
  ["Employee", "employee", "fullName"],
  ["Position", "position", "jobPosition"],
  ["Contact", "contact", "contact"],
  ["Status", "attendanceStatus", "attendanceStatus"],
  ["Account", "account", "isActive"],
  ["Branch", "branch", "branch"],
];

const SEARCH_KEYS = [
  "empId",
  "fullName",
  "department",
  "jobPosition",
  "officeEmail",
  "personalEmail",
  "officeMobile",
  "personalMobile",
];

const selectStyles = {
  control: (base, s) => ({
    ...base,
    minHeight: 40,
    borderRadius: 8,
    fontWeight: 500,
    fontSize: 12,
    cursor: s.isDisabled ? "not-allowed" : "pointer",
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
    cursor: s.isDisabled ? "not-allowed" : "pointer",
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

const getEmpId = (emp) => emp?._id ?? emp?.id ?? emp?.mainID;
const getEmployeeName = (emp) =>
  [emp?.personal?.firstName, emp?.personal?.middleName, emp?.personal?.lastName]
    .filter((part) => typeof part === "string" && part.trim())
    .join(" ");

const getEmployeeInitials = (emp) =>
  [emp?.personal?.firstName, emp?.personal?.lastName]
    .filter((part) => typeof part === "string" && part.trim())
    .map((part) => part.trim()[0])
    .join("")
    .toUpperCase() || "EM";
const getEmployeeId = (emp) => {
  const id = getEmpId(emp);
  return id ? String(id).slice(-8) : "";
};
const isEmployeeOnline = (emp, onlineUsers) =>
  onlineUsers.some((user) => {
    const ids = [user?.id, user?.socketId, user?.userId, user?.user?.id, user?.user?._id];
    return ids.some((value) => value && [String(getEmpId(emp)), String(emp?.createdBy || "")].includes(String(value)));
  });
const getAttendanceStatus = (emp) => {
  const status = emp?.attendanceStatus ?? emp?.attendance?.status;
  if (typeof status !== "string" || !status.trim()) return "Not Marked";
  const normalized = status.trim().toLowerCase();
  if (normalized === "present") return "Present";
  if (normalized === "absent") return "Absent";
  return "Not Marked";
};
const errMsg = (e, fallback) =>
  e?.response?.data?.message ||
  e?.response?.data?.error ||
  e?.message ||
  fallback;

const getNepaliDate = (value) =>
  typeof value === "string" || typeof value === "number" ? String(value) : "";

const getDetailText = (value) => {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) {
    return value
      .filter((item) => typeof item === "string" || typeof item === "number")
      .map((item) => String(item).trim())
      .filter(Boolean)
      .join(", ");
  }
  return "";
};

const DOCUMENT_TYPE_META = {
  citizenship: { title: "Citizenship", icon: IdCard, tone: "bg-sky-50 text-sky-700" },
  citizenshipId: { title: "Citizenship ID", icon: IdCard, tone: "bg-sky-50 text-sky-700" },
  cv: { title: "Curriculum Vitae", icon: FileUser, tone: "bg-blue-50 text-blue-700" },
  qualificationCertificate: {
    title: "Qualification Certificate",
    icon: GraduationCap,
    tone: "bg-violet-50 text-violet-700",
  },
  experienceLetter: {
    title: "Experience Letter",
    icon: BriefcaseBusiness,
    tone: "bg-emerald-50 text-emerald-700",
  },
  trainingCertificate: { title: "Training Certificate", icon: Award, tone: "bg-amber-50 text-amber-700" },
  offerLetter: { title: "Offer Letter", icon: FileCheck, tone: "bg-orange-50 text-orange-700" },
  appointmentLetter: {
    title: "Appointment Letter",
    icon: ClipboardCheck,
    tone: "bg-teal-50 text-teal-700",
  },
  recommendationLetter: {
    title: "Recommendation Letter",
    icon: FileText,
    tone: "bg-indigo-50 text-indigo-700",
  },
  other: { title: "Other", icon: Paperclip, tone: "bg-slate-100 text-slate-700" },
};

const getDocumentTypeMeta = (documentType) => {
  const key = typeof documentType === "string" ? documentType : "";
  if (DOCUMENT_TYPE_META[key]) return DOCUMENT_TYPE_META[key];
  const title = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();
  return {
    title: title ? title.replace(/\b\w/g, (letter) => letter.toUpperCase()) : "Document",
    icon: Paperclip,
    tone: "bg-slate-100 text-slate-700",
  };
};

const getDocumentUrl = (value) => {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const parsed = new URL(
      value.trim(),
      typeof window === "undefined" ? "http://localhost" : window.location.href,
    );
    return ["http:", "https:", "blob:"].includes(parsed.protocol)
      ? value.trim()
      : "";
  } catch {
    return "";
  }
};

const getDocumentExtension = (document) => {
  const sources = [document?.fileName, document?.fileUrl];
  for (const source of sources) {
    if (typeof source !== "string") continue;
    const path = source.split(/[?#]/, 1)[0];
    const match = path.match(/\.([a-z0-9]{1,10})$/i);
    if (match) return match[1].toUpperCase();
  }
  return "";
};

const formatFileSize = (size) => {
  if (size === null || size === undefined || size === "") return "";
  const bytes = typeof size === "number" ? size : Number(size);
  if (!Number.isFinite(bytes) || bytes < 0) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

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

export const SU_HrPage = ({ onDelete }) => {
  const reduceMotion = useReducedMotion();
  const { data: onlineUsers = [] } = useOnlineUsers();
  console.log('onlineUsers', onlineUsers)
  const { useMe } = useAuth();
  const { role, id } = useMe?.data?.user?.decoded || {};

  // Replace hook names below with your actual HR hooks from useGet / useEdit / UseDelete
  const { S_GetAllEmployees_ } = useGet({
    currentUser: { role, id },
    isAuthLoading: useMe.isLoading,
  });
  const { EditEmployee_ } = useEdit();
  const { deleteRecruitmentForSuper_ } = UseDelete();

  const { data, isLoading, error } = S_GetAllEmployees_ || {};
  const loading = Boolean(isLoading || useMe?.isLoading);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    department: null,
    status: null,
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null,
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
    const apiList = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
        ? data.data
        : [];
    return apiList.map((emp) => {
      const fullName = getEmployeeName(emp);
      const department = emp?.employment?.department || "";
      const jobPosition = emp?.employment?.jobPosition || "";
      const officeEmail = emp?.contact?.officeEmail || emp?.contact?.personalEmail || "";
      const officeMobile = emp?.contact?.officeMobile || emp?.contact?.personalMobile || "";
      return {
        ...emp,
        id: getEmpId(emp),
        empId: emp.empId || emp.employeeId || getEmployeeId(emp),
        fullName,
        department,
        jobPosition,
        officeEmail,
        officeMobile,
        attendanceStatus: getAttendanceStatus(emp),
      };
    });
  }, [data]);

  useEffect(() => {
    const availableIds = new Set(
      rawRecords
        .map((employee) => String(getEmpId(employee) ?? ""))
        .filter(Boolean),
    );
    setSelected((current) =>
      current.filter((employeeId) => availableIds.has(employeeId)),
    );
  }, [rawRecords]);

  const stats = useMemo(() => {
    const total = rawRecords.length;
    const counts = {};
    rawRecords.forEach((r) => {
      counts[r.attendanceStatus] = (counts[r.attendanceStatus] || 0) + 1;
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
      const matchesStatus =
        !filters.status || r.attendanceStatus === filters.status.value;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [rawRecords, search, filters]);

  const handleSort = (key) => {
    setSortConfig((previous) => {
      if (previous.key !== key) {
        return { key, direction: "asc" };
      }

      if (previous.direction === "asc") {
        return { key, direction: "desc" };
      }

      if (previous.direction === "desc") {
        return { key: null, direction: null };
      }

      return { key, direction: "asc" };
    });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return filtered;
    }

    const getSortValue = (employee) => {
      if (sortConfig.key === "contact") {
        return employee.officeMobile || employee.officeEmail;
      }

      if (sortConfig.key === "branch") {
        return [
          employee.employment?.province,
          employee.employment?.district,
          employee.employment?.localLevel,
        ]
          .filter(Boolean)
          .join(" ");
      }

      return employee[sortConfig.key];
    };

    return [...filtered].sort((a, b) => {
      const aValue = getSortValue(a);
      const bValue = getSortValue(b);

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      let comparison = 0;
      if (
        (typeof aValue === "number" && typeof bValue === "number") ||
        (typeof aValue === "boolean" && typeof bValue === "boolean")
      ) {
        comparison = Number(aValue) - Number(bValue);
      } else {
        comparison = String(aValue).localeCompare(String(bValue), undefined, {
          numeric: true,
          sensitivity: "base",
        });
      }

      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
  }, [filtered, sortConfig]);

  const hasFilters = Boolean(
    search || filters.department || filters.status,
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
    setFilters({ department: null, status: null });
    resetView();
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, totalPages);
  const pageRows = useMemo(
    () => sortedData.slice((current - 1) * PER_PAGE, current * PER_PAGE),
    [sortedData, current],
  );
  const pageIds = pageRows
    .map((e) => String(getEmpId(e) ?? ""))
    .filter(Boolean);
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
      await S_GetAllEmployees_?.refetch?.({ throwOnError: true });
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
      await S_GetAllEmployees_?.refetch?.();
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

  const confirmDelete = async () => {
    const empId = getEmpId(empToDelete);
    if (!empId || isDeleting) return;
    setIsDeleting(true);
    const loadingMessage = "Deleting employee record...";
    waitingNotify(loadingMessage);
    try {
      let response;
      if (deleteRecruitmentForSuper_?.mutateAsync) {
        response = await deleteRecruitmentForSuper_.mutateAsync({
          params: { id: String(empId) },
        });
      } else if (onDelete) {
        response = await onDelete(empId);
      } else {
        throw new Error("Recruitment delete mutation is not available.");
      }
      if (response?.success === false || response?.data?.success === false) {
        throw new Error(
          response?.data?.message ||
            response?.message ||
            "Unable to delete this employee.",
        );
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

  const confirmBulkDelete = async () => {
    const selectedIds = [...new Set(selected.map(String).filter(Boolean))];
    if (!selectedIds.length || isDeleting) return;

    setIsDeleting(true);
    const loadingMessage = `Deleting ${selectedIds.length} recruitment record${selectedIds.length === 1 ? "" : "s"}...`;
    waitingNotify(loadingMessage);
    try {
      if (!deleteRecruitmentForSuper_?.mutateAsync) {
        throw new Error("Recruitment delete mutation is not available.");
      }
      const response = await deleteRecruitmentForSuper_.mutateAsync({
        params: { id: selectedIds.join(",") },
      });
      if (response?.success === false || response?.data?.success === false) {
        throw new Error(
          response?.data?.message ||
            response?.message ||
            "Unable to delete the selected recruitment records.",
        );
      }
      setSelected([]);
      SuccessNotify(
        `${selectedIds.length} recruitment record${selectedIds.length === 1 ? "" : "s"} deleted successfully.`,
      );
      await refreshEmployees("deleted", false);
    } catch (e) {
      ErrorNotify(
        errMsg(e, "Unable to delete the selected recruitment records."),
      );
    } finally {
      dismissWaitingNotify(loadingMessage);
      setIsDeleting(false);
    }
  };

  const handleRecruitmentSuccess = () => {
    const verb = formModal?.mode === "edit" ? "updated" : "added";
    setFormModal(null);
    void refreshEmployees(verb, false);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className={`w-full bg-white font-['Roboto_Slab'] ${TYPOGRAPHY.body}`}>
        <div className="mx-auto max-w-[1600px] space-y-5">
          {/* Header */}
          <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                <Users size={21} />
              </span>
              <div>
                <h1 className={TYPOGRAPHY.pageTitle}>
                  Employees
                </h1>
                <nav
                  aria-label="Breadcrumb"
                  className={`mt-0.5 flex items-center gap-1.5 ${TYPOGRAPHY.eyebrow}`}
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
              className={`inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 ${TYPOGRAPHY.buttonLg} text-white shadow-sm transition ${FOCUS}`}
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
              className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2"
            >
              <span className={TYPOGRAPHY.error}>
                {error.message || "Unable to load employee records."}
              </span>
              <button
                type="button"
                onClick={retryEmployees}
                disabled={isRetrying}
                className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 ${TYPOGRAPHY.button} underline disabled:cursor-not-allowed disabled:opacity-60`}
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
                  className={`inline-flex min-h-9 shrink-0 cursor-pointer items-center gap-2 rounded-lg px-3 ${TYPOGRAPHY.tab} transition ${FOCUS} ${active
                      ? `${BRAND} text-white shadow-sm`
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  {tab.label}
                  <span
                    className={`rounded-full px-1.5 py-px ${TYPOGRAPHY.badge} ${active
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
              <h2 className={TYPOGRAPHY.sectionTitle}>
                Overview
              </h2>
              <button
                type="button"
                onClick={() => setShowStats((o) => !o)}
                aria-expanded={showStats}
                className={`inline-flex min-h-8 cursor-pointer items-center gap-1 rounded-md px-2 ${TYPOGRAPHY.button} text-slate-500 hover:bg-slate-100 ${FOCUS}`}
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
                    ["Present", "Present staff", UserCheck, "% present today"],
                    ["Absent", "Absent staff", UserX, "% absent today"],
                    ["Not Marked", "Attendance pending", Clock, "% not marked"],
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
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_220px_auto] lg:items-center">
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
                    className={`h-10 w-full cursor-text rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 ${TYPOGRAPHY.input} outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10`}
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

                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={!hasFilters}
                  className={`min-h-10 cursor-pointer rounded-lg px-3 ${TYPOGRAPHY.button} text-amber-600 transition hover:bg-orange-50 ${FOCUS} disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent`}
                >
                  Clear filters
                </button>
              </div>
              <AnimatePresence initial={false}>
                {selected.length > 0 && (
                  <motion.div
                    key="recruitment-bulk-actions"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"
                  >
                    <span className={TYPOGRAPHY.button}>
                      {selected.length} selected
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelected([])}
                        disabled={isDeleting}
                        className={`min-h-9 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 ${TYPOGRAPHY.button} text-slate-600 hover:bg-slate-100 ${FOCUS} disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        onClick={confirmBulkDelete}
                        disabled={isDeleting || loading}
                        className={`inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-lg bg-red-600 px-3 ${TYPOGRAPHY.button} text-white hover:bg-red-700 ${FOCUS} disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        {isDeleting ? (
                          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                        Delete selected
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div
              className="w-full overflow-x-auto"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#d1d5db transparent",
              }}
            >
              <table
                className="w-full min-w-295 text-left"
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
                    {COLUMNS.map(([name, , sortKey]) => (
                      <th
                        key={name}
                        scope="col"
                        className={`whitespace-nowrap border-b border-slate-200 px-4 py-3 ${TYPOGRAPHY.label} uppercase tracking-wide`}
                      >
                        {sortKey ? (
                          <button
                            type="button"
                            onClick={() => handleSort(sortKey)}
                            className="inline-flex cursor-pointer select-none items-center gap-2 whitespace-nowrap"
                          >
                            <span>{name}</span>
                            {sortConfig.key === sortKey ? (
                              sortConfig.direction === "asc" ? (
                                <ArrowUp size={15} className="text-amber-600" />
                              ) : (
                                <ArrowDown size={15} className="text-amber-600" />
                              )
                            ) : (
                              <ArrowUpDown
                                size={15}
                                className="text-slate-400"
                              />
                            )}
                          </button>
                        ) : (
                          name
                        )}
                      </th>
                    ))}
                    <th
                      scope="col"
                      className={`sticky right-0 z-10 whitespace-nowrap border-b border-l border-slate-200 bg-slate-50 px-4 py-3 ${TYPOGRAPHY.label} uppercase tracking-wide`}
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
                      const rowId = String(getEmpId(emp) ?? "");
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
                          tabIndex={0}
                          onKeyDown={(event) => {
                            if (
                              event.target === event.currentTarget &&
                              (event.key === "Enter" || event.key === " ")
                            ) {
                              event.preventDefault();
                              setPreview(emp);
                            }
                          }}
                          className={`cursor-pointer transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500 ${isSelected
                              ? "bg-amber-50 hover:bg-amber-100"
                              : "bg-white hover:bg-slate-50"
                            }`}
                          onClick={() => setPreview(emp)}
                        >
                          <td className="px-4 py-3">
                            <AnimatedCheckbox
                              checked={isSelected}
                              onChange={() => toggleOne(rowId)}
                              label={`Select ${emp.fullName || "employee"}`}
                              disabled={!rowId}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="relative h-10 w-10">
                              {emp.personal?.profilePhoto ? (
                                <img
                                  src={emp.personal.profilePhoto}
                                  alt={emp.fullName || "Employee"}
                                  className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
                                />
                              ) : (
                                <span className={`flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700 ring-2 ring-white ${TYPOGRAPHY.detailValue}`}>
                                  {getEmployeeInitials(emp)}
                                </span>
                              )}
                              <span
                                aria-label={isEmployeeOnline(emp, onlineUsers) ? "Online" : "Offline"}
                                title={isEmployeeOnline(emp, onlineUsers) ? "Online" : "Offline"}
                                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${isEmployeeOnline(emp, onlineUsers) ? "bg-emerald-500" : "bg-slate-400"
                                  }`}
                              />
                            </div>
                          </td>
                          <td className="max-w-48 px-4 py-3">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setPreview(emp);
                              }}
                              className={`block max-w-full cursor-pointer text-left ${FOCUS}`}
                            >
                              <span className={`block font-bold truncate ${TYPOGRAPHY.emphasis}`}>
                                {emp.fullName || "—"}
                              </span>
                              <span className={`mt-0.5 font-medium block truncate ${TYPOGRAPHY.bodyMuted}`}>
                                {emp.contact?.currentAddress || emp.contact?.permanentAddress || "—"}
                              </span>
                            </button>
                          </td>
                          <td className="max-w-56 px-4 py-3">
                            <span className={`block font-bold truncate ${TYPOGRAPHY.emphasis}`}>
                              {emp.jobPosition || "—"}
                            </span>
                            <span className={`mt-0.5 font-semibold block truncate ${TYPOGRAPHY.bodyMuted}`}>
                              {emp.department || "—"}
                            </span>
                          </td>
                          <td className="max-w-56 px-4 py-3">
                            <span className={`flex font-semibold items-center gap-1.5 ${TYPOGRAPHY.emphasis}`}>
                              <Phone size={13} className="shrink-0 text-red-400" />
                              <span className="truncate">
                                {emp.officeMobile || emp.contact?.personalMobile || "—"}
                              </span>
                            </span>
                            <span className={`mt-1 flex font-semibold items-center gap-1.5 truncate ${TYPOGRAPHY.bodyMuted}`}>
                              <Mail size={12} className="shrink-0 text-blue-400" />
                              <span className="truncate">
                                {emp.officeEmail || emp.contact?.personalEmail || "—"}
                              </span>
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {(() => {
                              const attendanceStatus = emp.attendanceStatus;
                              const meta = STATUS_META[attendanceStatus] || STATUS_META["Not Marked"];
                              return (
                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${TYPOGRAPHY.badge} ${meta.pill}`}>
                                  <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                                  {attendanceStatus}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {emp.isActive === true ? (
                              <span
                                role="img"
                                aria-label="Active"
                                title="Active"
                                className="inline-flex text-emerald-600"
                              >
                                <CircleCheck size={18} aria-hidden="true" />
                              </span>
                            ) : emp.isActive === false ? (
                              <span
                                role="img"
                                aria-label="Inactive"
                                title="Inactive"
                                className="inline-flex text-red-500"
                              >
                                <CircleX size={18} aria-hidden="true" />
                              </span>
                            ) : (
                              <span className={TYPOGRAPHY.bodyMuted}>—</span>
                            )}
                          </td>
                          <td className="max-w-52 px-4 py-3">
                            <div className={`space-y-1 ${TYPOGRAPHY.body}`}>
                              <span className="flex items-center gap-2 font-semibold truncate">
                                <MapPin className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                                {emp.employment?.province || "—"}
                              </span>

                              <span className="flex items-center gap-2 font-semibold truncate">
                                <DistrictIcon className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                                {emp.employment?.district || "—"}
                              </span>

                              <span className="flex items-center gap-2 font-semibold truncate">
                                <MapPinned className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                                {emp.employment?.localLevel || "—"}
                              </span>
                            </div>
                          </td>
                          <td className="sticky right-0 border-l border-slate-200 bg-inherit px-3 py-3">
                            <div className="flex items-center gap-1">
                              <IconAction
                                icon={Pencil}
                                label="Edit"
                                disabled={!rowId || isDeleting}
                                onClick={() => openEditModal(emp)}
                                tone="text-slate-600 hover:bg-slate-100"
                              />
                              <IconAction
                                icon={Trash2}
                                label="Delete"
                                disabled={!rowId || isDeleting}
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
                        <p className={TYPOGRAPHY.sectionTitle}>
                          No employees found
                        </p>
                        <p className={`mt-1 ${TYPOGRAPHY.bodyMuted}`}>
                          {hasFilters
                            ? "No employee matches your search or filters."
                            : "Add an employee to get started."}
                        </p>
                        {hasFilters ? (
                          <button
                            type="button"
                            onClick={clearFilters}
                            className={`mt-3 cursor-pointer rounded-lg px-3 py-1.5 ${TYPOGRAPHY.button} text-amber-600 hover:bg-orange-50 ${FOCUS}`}
                          >
                            Clear filters
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={openAddModal}
                            className={`mt-3 cursor-pointer rounded-lg px-3 py-1.5 ${TYPOGRAPHY.button} text-amber-600 hover:bg-orange-50 ${FOCUS}`}
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
                <span className={TYPOGRAPHY.hint}>
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
                <span className={`px-2 ${TYPOGRAPHY.emphasis}`}>
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
              onSuccess={handleRecruitmentSuccess}
              isEdit={formModal.mode === "edit"}
              empData={formModal.employee || []}
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
                  <h2 className={TYPOGRAPHY.dialogTitle}>Delete this employee?</h2>
                  <p className={`mt-1 ${TYPOGRAPHY.bodyMuted}`}>
                    <span className={TYPOGRAPHY.emphasis}>
                      {empToDelete.fullName || "—"}
                    </span>{" "}
                    ({empToDelete.empId || "—"}) will be permanently removed
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
                  className={`min-h-10 cursor-pointer rounded-lg border border-slate-200 px-4 ${TYPOGRAPHY.buttonLg} hover:bg-slate-50 ${FOCUS} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  Keep record
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className={`inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-600 px-4 ${TYPOGRAPHY.buttonLg} text-white hover:bg-red-700 ${FOCUS} disabled:cursor-not-allowed disabled:opacity-70`}
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
              title={getEmployeeName(preview) || "Employee Details"}
              subtitle={preview.empId || "—"}
              onClose={() => setPreview(null)}
              footer={
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(preview)}
                    className={`inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3 ${TYPOGRAPHY.buttonLg} text-white hover:brightness-110 ${FOCUS}`}
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
                    className={`inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/50 px-3 ${TYPOGRAPHY.buttonLg} text-red-600 hover:bg-red-50 ${FOCUS}`}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              }
            >
              <EmployeeDetailsContent employee={preview} />
            </SideDrawer>
          )}
        </AnimatePresence>

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
          {Array.from({ length: 2 }, (_, i) => (
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
      className={`flex cursor-pointer items-center gap-3 rounded-xl border bg-white p-4 text-left shadow-sm transition ${FOCUS} ${active
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
        <span className={`block ${TYPOGRAPHY.statValue}`}>
          <CountUp value={value} reduceMotion={reduceMotion} />
        </span>
        <span className={`mt-1 block ${TYPOGRAPHY.emphasis}`}>{text}</span>
        <span className={`block ${TYPOGRAPHY.hint}`}>{hint}</span>
      </span>
    </motion.button>
  );
}

function PageButton({ children, ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-9 cursor-pointer items-center gap-1 rounded-lg border border-slate-200 px-3 ${TYPOGRAPHY.button} text-slate-500 hover:bg-slate-50 ${FOCUS} disabled:cursor-not-allowed disabled:opacity-40`}
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
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(event);
      }}
      {...press(disabled)}
      variants={btnVariants}
      className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition ${FOCUS} disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent ${tone}`}
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

function EmployeeDetailsContent({ employee }) {
  const personal = employee?.personal || {};
  const contact = employee?.contact || {};
  const employment = employee?.employment || {};
  const documentRecords = employee?.documents || {};
  const isExperienced = String(employee?.experienceType || "")
    .toLowerCase()
    .includes("experienced");
  const documents = (
    isExperienced
      ? documentRecords.experienceDocuments
      : documentRecords.fresherDocuments
  );
  const attachments = Array.isArray(documents)
    ? documents.filter((document) => document && typeof document === "object")
    : [];
  const previousExperience = Array.isArray(employee?.previousExperience)
    ? employee.previousExperience.filter(
        (record) =>
          record &&
          typeof record === "object" &&
          [
            record.organization,
            record.position,
            record.startDate,
            record.endDate,
            record.tenure,
          ].some((value) => getDetailText(value).trim()),
      )
    : [];
  const name = getEmployeeName(employee) || "Employee";
  const experienceType = getDetailText(employee?.experienceType);
  const totalExperienceValue = getDetailText(employee?.totalExperience);
  const totalExperience =
    totalExperienceValue &&
    (typeof employee?.totalExperience === "number" ||
      /^\d+(?:\.\d+)?$/.test(totalExperienceValue))
      ? `${totalExperienceValue} years`
      : totalExperienceValue;
  const activeStatus =
    typeof employee?.isActive === "boolean"
      ? employee.isActive
        ? "Active"
        : "Inactive"
      : "Status unavailable";
  const profilePhoto = getDocumentUrl(personal?.profilePhoto);

  return (
    <div className="space-y-4 font-['Roboto_Slab']">
      <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <EmployeeAvatar
          name={name}
          photoUrl={profilePhoto}
          initials={getEmployeeInitials(employee)}
        />
        <div className="min-w-0 flex-1">
          <h2 className={`truncate text-base font-bold text-[#422026]`}>
            {name}
          </h2>
          <p className="mt-1 truncate text-xs font-semibold text-slate-600">
            {getDetailText(employment?.jobPosition) || "Position not provided"}
            {getDetailText(employment?.department)
              ? ` · ${getDetailText(employment.department)}`
              : ""}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge
              label={getDetailText(employment?.employmentType) || "Employment type unavailable"}
              className="bg-violet-50 text-violet-700"
            />
            <StatusBadge
              label={activeStatus}
              className={
                employee?.isActive === true
                  ? "bg-emerald-50 text-emerald-700"
                  : employee?.isActive === false
                    ? "bg-slate-100 text-slate-600"
                    : "bg-amber-50 text-amber-700"
              }
            />
            {getDetailText(employee?.recruitmentStatus) && (
              <StatusBadge
                label={getDetailText(employee.recruitmentStatus)}
                className="bg-orange-50 text-[#D96C19]"
              />
            )}
          </div>
        </div>
      </section>

      <InformationSection
        title="Personal Information"
        icon={Users}
        iconTone="text-blue-600"
        fields={[
          ["First name", Users, personal?.firstName],
          ["Middle name", Users, personal?.middleName],
          ["Last name", Users, personal?.lastName],
          ["Gender", Users, personal?.gender],
          ["Date of birth (BS)", Calendar, getNepaliDate(personal?.dob)],
          ["Marital status", ShieldCheck, personal?.maritalStatus],
          ["Nationality", Landmark, personal?.nationality],
          ["Citizenship ID", IdCard, personal?.citizenshipId],
          ["Services", Briefcase, personal?.services],
        ]}
      />
      <InformationSection
        title="Contact Information"
        icon={Phone}
        iconTone="text-emerald-600"
        fields={[
          ["Office email", Mail, contact?.officeEmail],
          ["Personal email", Mail, contact?.personalEmail],
          ["Office mobile", Phone, contact?.officeMobile],
          ["Personal mobile", Phone, contact?.personalMobile],
          ["Permanent address", MapPin, contact?.permanentAddress],
          ["Current address", MapPinned, contact?.currentAddress],
        ]}
      />
      <InformationSection
        title="Employment Information"
        icon={Briefcase}
        iconTone="text-orange-600"
        fields={[
          ["Department", Building2, employment?.department],
          ["Job position", Briefcase, employment?.jobPosition],
          ["Employment type", Clock, employment?.employmentType],
          ["ISO standard code", ShieldCheck, employment?.isoStandardCode],
          ["Province", Landmark, employment?.province],
          ["District", MapPin, employment?.district],
          ["Local level", MapPinned, employment?.localLevel],
        ]}
      />
      <InformationSection
        title="Experience Information"
        icon={BriefcaseBusiness}
        iconTone="text-amber-600"
        fields={[
          ["Experience type", BriefcaseBusiness, experienceType],
          ["Total experience", Clock, totalExperience],
        ]}
      />

      {isExperienced && (
        <PreviousExperienceSection records={previousExperience} />
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <SectionHeading
          title={isExperienced ? "Experience Documents" : "Fresher Documents"}
          icon={FileText}
          iconTone="text-indigo-600"
        />
      
        {attachments.length ? (
          <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2">
            {attachments.map((document, index) => {
              const documentKey = [
                document?._id || document?.id || document?.documentType || "document",
                document?.fileName || "",
                document?.fileUrl || "",
                index,
              ].join("-");
              return (
                <EmployeeDocumentCard
                  key={documentKey}
                  document={document}
                />
              );
            })}
          </div>
        ) : (
          <DocumentEmptyState />
        )}
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <SectionHeading
          title="System Info"
          icon={CogIcon}
          iconTone="text-slate-600"
        />
        <dl className="grid grid-cols-1 divide-y divide-slate-100 px-4 sm:grid-cols-2 sm:gap-x-6 sm:divide-y-0">
          <DetailRow
            icon={ShieldCheck}
            label="Recruitment status"
            value={getDetailText(employee?.recruitmentStatus) || "—"}
            tone="text-orange-600"
          />
          <DetailRow
            icon={Users}
            label="Created by"
            value={
              getDetailText(employee?.createdBy?._id ?? employee?.createdBy) ||
              "—"
            }
            tone="text-slate-600"
            row={1}
          />
        </dl>
      </section>
    </div>
  );
}

function EmployeeAvatar({ name, photoUrl, initials }) {
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-100 text-lg font-bold text-[#E87A24] ring-2 ring-orange-50">
      {photoUrl && !imageFailed ? (
        <img
          src={photoUrl}
          alt={`${name} profile`}
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        initials
      )}
    </div>
  );
}

function StatusBadge({ label, className }) {
  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-[10px] font-bold ${className}`}
    >
      <span className="truncate">{label}</span>
    </span>
  );
}

function SectionHeading({ title, icon: Icon, iconTone }) {
  return (
    <h3 className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-[#422026]">
      <Icon size={15} className={iconTone} />
      {title}
    </h3>
  );
}

function InformationSection({ title, icon, iconTone, fields }) {
  const rows = fields
    .map(([label, FieldIcon, value]) => ({
      label,
      icon: FieldIcon,
      value: getDetailText(value),
    }))
    .filter((row) => row.value.trim());
  if (!rows.length) return null;

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <SectionHeading title={title} icon={icon} iconTone={iconTone} />
      <dl className="grid grid-cols-1 divide-y divide-slate-100 px-4 sm:grid-cols-2 sm:gap-x-6 sm:divide-y-0">
        {rows.map((row, index) => (
          <DetailRow
            key={row.label}
            icon={row.icon}
            label={row.label}
            value={row.value}
            section={0}
            row={index}
            tone={iconTone}
          />
        ))}
      </dl>
    </section>
  );
}

function PreviousExperienceSection({ records }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <SectionHeading
        title="Previous Employment History"
        icon={Building2}
        iconTone="text-teal-600"
      />
      {records.length ? (
        <div className="divide-y divide-slate-100">
          {records.map((record, index) => {
            const fields = [
              ["Organization", Building2, record?.organization],
              ["Position", Briefcase, record?.position],
              ["Start date (BS)", Calendar, getNepaliDate(record?.startDate)],
              ["End date (BS)", Calendar, getNepaliDate(record?.endDate)],
              ["Tenure", Clock, record?.tenure],
            ]
              .map(([label, icon, value]) => ({
                label,
                icon,
                value: getDetailText(value),
              }))
              .filter((field) => field.value.trim());
            return (
              <dl
                key={record?._id || record?.id || `experience-${index}`}
                className="grid grid-cols-1 gap-x-6 px-4 sm:grid-cols-2"
              >
                {fields.map((field, row) => (
                  <DetailRow
                    key={field.label}
                    icon={field.icon}
                    label={field.label}
                    value={field.value}
                    row={index * 5 + row}
                    tone="text-teal-600"
                  />
                ))}
              </dl>
            );
          })}
        </div>
      ) : (
        <div className="px-4 py-5 text-center">
          <FolderOpen className="mx-auto h-6 w-6 text-slate-400" />
          <p className="mt-2 text-xs font-semibold text-slate-600">
            No previous employment history.
          </p>
        </div>
      )}
    </section>
  );
}

function DocumentEmptyState() {
  return (
    <div className="px-4 py-7 text-center">
      <FileX className="mx-auto h-7 w-7 text-slate-400" />
      <p className="mt-2 text-xs font-semibold text-slate-700">
        No documents uploaded yet.
      </p>
      <p className="mt-1 text-[11px] text-slate-500">
        Uploaded employee documents will appear here.
      </p>
    </div>
  );
}

function EmployeeDocumentCard({ document }) {
  const meta = getDocumentTypeMeta(document?.documentType);
  const DocumentIcon = meta.icon;
  const fileName =
    getDetailText(document?.fileName) || `${meta.title} document`;
  const url = getDocumentUrl(document?.fileUrl);
  const extension = getDocumentExtension(document);
  const fileSize = formatFileSize(document?.fileSize);

  return (
    <article className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${meta.tone}`}
        >
          <DocumentIcon size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-xs font-bold text-[#422026]" title={fileName}>
            {fileName}
          </h4>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.tone}`}>
              {meta.title}
            </span>
            {extension && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                {extension}
              </span>
            )}
            {fileSize && (
              <span className="text-[10px] font-medium text-slate-500">
                {fileSize}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="mt-3 flex gap-2 border-t border-slate-100 pt-2.5">
        {url ? (
          <a
            href={url}
            download={getDetailText(document?.fileName) || `${meta.title} document`}
            className={`inline-flex min-h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-orange-50 px-2 text-[11px] font-semibold text-[#D96C19] hover:bg-orange-100 ${FOCUS}`}
          >
            <Download size={14} /> Download
          </a>
        ) : (
          <button
            type="button"
            disabled
            title="A valid document URL is not available"
            className="inline-flex min-h-8 w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-lg bg-slate-100 px-2 text-[11px] font-semibold text-slate-400"
          >
            <Download size={14} /> Download
          </button>
        )}
      </div>
    </article>
  );
}

function AnimatedCheckbox({ checked, onChange, label: text, disabled }) {
  return (
    <label
      onClick={(event) => event.stopPropagation()}
      className={`inline-flex items-center justify-center ${disabled ? "cursor-not-allowed" : "cursor-pointer"
        }`}
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
          className={`h-3 w-3 text-white transition-all duration-200 ${checked ? "scale-100 opacity-100" : "scale-50 opacity-0"
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

function DetailRow({
  icon: Icon,
  label: text,
  value,
  section = 0,
  row = 0,
  tone = "text-amber-600",
}) {
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
      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 ${tone}`}>
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <dt className={TYPOGRAPHY.detailLabel}>{text}</dt>
        <dd className={`break-words ${TYPOGRAPHY.detailValue}`}>
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
        className={`absolute inset-0 ${locked ? "cursor-not-allowed" : "cursor-pointer"
          } bg-black/60`}
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
        className={`relative flex max-h-[95vh] w-full ${size} flex-col overflow-hidden rounded-2xl shadow-2xl ${title ? "bg-slate-50" : "bg-white p-5"
          }`}
      >
        {title && (
          <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
            <div>
              <h2 id={titleId} className={TYPOGRAPHY.modalTitle}>
                {title}
              </h2>
              {subtitle && (
                <p className={`mt-1 ${TYPOGRAPHY.subtitle}`}>{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={close}
              disabled={locked}
              aria-label="Close"
              className={`cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 ${FOCUS} disabled:cursor-not-allowed disabled:opacity-50`}
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
        className="absolute inset-0 cursor-pointer bg-slate-900/40"
        style={{ backdropFilter: "blur(2px)" }}
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
        <header
          className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4"
        >
          <div className="min-w-0">
            {eyebrow && (
              <p className={`uppercase tracking-wide ${TYPOGRAPHY.eyebrow}`}>
                {eyebrow}
              </p>
            )}
            <h2
              id={titleId}
              className={`mt-0.5 truncate ${TYPOGRAPHY.drawerTitle}`}
              title={title}
            >
              {title}
            </h2>
            {subtitle && (
              <span className={`mt-1.5 inline-block rounded-md bg-slate-100 px-2 py-0.5 ${TYPOGRAPHY.subtitle}`}>
                {subtitle}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className={`shrink-0 cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-800 ${FOCUS}`}
          >
            <X size={20} />
          </button>
        </header>

        <div
          className={
            flush
              ? "flex min-h-0 flex-1 flex-col overflow-hidden p-3 sm:p-4"
              : `min-h-0 flex-1 overflow-y-auto p-4 sm:p-5 ${muted ? "bg-slate-50" : ""
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