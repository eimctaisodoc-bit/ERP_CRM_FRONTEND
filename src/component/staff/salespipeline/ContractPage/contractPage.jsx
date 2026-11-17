import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileSignature,
  BadgeCheck,
  Mail,
  Trash2,
  CalendarPlus,
  Clock,
  X,
  Loader2,
  AlertTriangle,
  Building2,
  Tag,
  Hash,
  Map as MapIcon,
  Receipt,
  CalendarDays,
  UserRound,
  Phone,
  Briefcase,
  UserCheck,
  StickyNote,
  Bold,
  Italic,
  Underline,
  ListOrdered,
  List,
  AlignLeft,
} from "lucide-react";
import DOMPurify from "dompurify";
import { ClientCreateCredential } from "./clientLoginFroms";

import LeadFormStepper, {
  servicesInterested,
} from "../trial/lead-workspace/newLeadForms";
import ContractsTable from "./contractTable";

import { BuildSlaDocx } from "../innerHelper/stage5/testFront";
import { BuildBackSideDocx } from "../innerHelper/stage5/backSide";

import { useGet } from "../../../hooks/useGet";
import { useAuth } from "../../../hooks/useAuth";
import { useEdit } from "../../../hooks/useEdit";
import { UseDelete } from "../../../hooks/useDelete";
import { UseAdd } from "../../../hooks/useadd";
import {
  dismissWaitingNotify,
  ErrorNotify,
  SuccessNotify,
  waitingNotify,
} from "../../../hotToaster";

const animatedComponents = makeAnimated();

/* ------------------------------ Constants -------------------------------- */

const PER_PAGE = 10;
const DRAWER_WIDTH = {
  md: "sm:max-w-md",
  lg: "sm:max-w-xl",
  xl: "sm:max-w-2xl",
};

const BRAND = "bg-gradient-to-r from-amber-500 to-orange-500";
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40";
const INPUT =
  "h-10 w-full rounded-lg font-medium text-slate-800 border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10";
const NO_SCROLLBAR = "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
const CARD =
  "rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-4";

const TABS = [
  { key: "all", label: "All", match: () => true },
  {
    key: "contract",
    label: "New",
    match: (status) => status === "contract",
  },
  {
    key: "converted",
    label: "Converted",
    match: (status) => status === "converted",
  },
  {
    key: "terminated",
    label: "Terminated",
    match: (status) => status === "terminated",
  },
];

const SEARCH_KEYS = ["leadId", "organizationName", "service", "status"];

const selectStyles = {
  control: (base, s) => ({
    ...base,
    minHeight: 40,
    fontweight: 500,
    borderRadius: 8,
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
    fontWeight: 500,
    fontSize: 12,
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

const nf = new Intl.NumberFormat("en-IN");
const fmtInt = (n) => nf.format(Math.round(n || 0));
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const errMsg = (e, fallback) =>
  e?.response?.data?.message || e?.message || fallback;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const isValidEmail = (email) => EMAIL_PATTERN.test(String(email || "").trim());

const displayDetailValue = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) {
    const values = value.map(displayDetailValue).filter((item) => item !== "—");
    return values.length ? values.join(", ") : "—";
  }
  if (typeof value === "object") {
    const values = Object.values(value)
      .map(displayDetailValue)
      .filter((item) => item !== "—");
    return values.length ? values.join(", ") : "—";
  }
  const text = String(value);
  if (!text.includes("_")) return text;
  return text
    .split("_")
    .map((part) =>
      part ? `${part[0].toUpperCase()}${part.slice(1).toLowerCase()}` : part,
    )
    .join(" ");
};

const escapeHtml = (value) =>
  String(value || "").replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );

const normalizeStatus = (...values) => {
  const status = values.find(
    (value) => typeof value === "string" && value.trim(),
  );
  const normalized = String(status || "")
    .trim()
    .toLowerCase();
  return ["contract", "converted", "terminated"].includes(normalized)
    ? normalized
    : "contract";
};

const normalizeContractRow = (record) => {
  if (!record || typeof record !== "object") return null;
  const lead = record.lead || record.leadDetails?.[0] || {};
  const details = Array.isArray(record.details) ? record.details : [];
  const organization =
    record.organization && typeof record.organization === "object"
      ? record.organization
      : record.organizationDetails?.[0] || {};
  const ownership = record.ownershipDetails?.[0] || record.ownership || {};
  const mainID = record.mainID || record._id || record.id;
  if (!mainID) return null;

  const isConverted = Boolean(
    record.isConverted ?? lead.isConverted ?? details[0]?.isConverted ?? false,
  );
  const isContracted = Boolean(
    record.isContracted ??
    lead.isContracted ??
    details[0]?.isContracted ??
    false,
  );
  const isTerminated = Boolean(
    record.isTerminated ??
    lead.isTerminated ??
    details[0]?.isTerminated ??
    false,
  );
  const rawStatus = [
    record.contractStatus,
    details[0]?.contractStatus,
    record.status,
    lead.contractStatus,
    lead.status,
  ].find((value) => typeof value === "string" && value.trim());

  const status = isTerminated
    ? "terminated"
    : isConverted
      ? "converted"
      : isContracted
        ? "contract"
        : normalizeStatus(rawStatus);

  const hasContractStatus = ["contract", "converted", "terminated"].includes(
    String(status || "").toLowerCase(),
  );
  const hasContractStage = details.some(
    (detail) =>
      Array.isArray(detail?.stages?.Stage3) && detail.stages.Stage3.length > 0,
  );
  if (!hasContractStatus && !hasContractStage) return null;

  const products = Array.isArray(lead.ProductInterested)
    ? lead.ProductInterested
    : [];
  const service =
    record.service ||
    products
      .map((item) => {
        const value = typeof item === "string" ? item : item?.value;
        return (
          servicesInterested.find((option) => option.value === value)?.label ||
          value
        );
      })
      .filter(Boolean)
      .join(", ");

  return {
    ...record,
    details,
    id: String(record.id || mainID),
    _id: String(record._id || mainID),
    mainID: String(mainID),
    lead,
    organization,
    ownership,
    organizationDetails: record.organizationDetails || [organization],
    leadId: record.leadId || lead.leadID || lead.leadId || String(mainID),
    organizationName:
      record.organizationName || organization.organizationName || "",
    service: service || "",
    title:
      record.title || service || organization.organizationName || "Contract",
    status,
    isConverted,
    isContracted,
    isTerminated,
    leadPickDate: ownership.LeadPickDate || "",
    leadPickTime: ownership.LeadPickTime || "",
    terminationReason_contract:
      record.terminationReason_contract ??
      lead.terminationReason_contract ??
      record.terminationReason ??
      lead.terminationReason ??
      null,
    createdAt: record.createdAt || organization.createdAt || "",
    contact: record.contact || organization.contactPersonName || "",
    contactPersonEmail:
      record.contactPersonEmail || organization.contactPersonEmail || "",
    phone: record.phone || organization.contactPersonNumber || "",
    province: record.province || lead.province || organization.province || "",
    employee: record.employee || {
      name: ownership.assignedSalesRep || lead.assignedSalesRep || "",
      role: ownership.role || "",
    },
    leadDetails: record.leadDetails || [lead],
    ownershipDetails: record.ownershipDetails || [ownership],
  };
};

const isInCurrentMonth = (value, year, month) => {
  if (!value) return false;
  const datePart = String(value).slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return (
      datePart.slice(0, 7) === `${year}-${String(month + 1).padStart(2, "0")}`
    );
  }
  const date = new Date(value);
  return (
    !Number.isNaN(date.getTime()) &&
    date.getFullYear() === year &&
    date.getMonth() === month
  );
};

const leadFormRecord = (row) => {
  const organization =
    row.organization && typeof row.organization === "object"
      ? row.organization
      : row.organizationDetails?.[0] || {};

  return {
    ...row,
    lead: row.lead || row.leadDetails?.[0] || {},
    organization: {
      ...organization,
      organizationName:
        organization.organizationName ||
        row.organizationName ||
        row.organization ||
        "",
      orgEmail: organization.orgEmail || row.orgEmail || "",
      contactPersonName: organization.contactPersonName || row.contact || "",
      contactPersonEmail:
        organization.contactPersonEmail || row.contactPersonEmail || "",
      contactPersonNumber: organization.contactPersonNumber || row.phone || "",
    },
  };
};

// [label, icon, (row) => value]
const PREVIEW_SECTIONS = [
  {
    title: "Organization Information",
    icon: Building2,
    fields: [
      ["Organization Name", Building2, (r) => r.organization.organizationName],
      ["Organization Type", Tag, (r) => r.organization.organizationType],
      [
        "Industry Type",
        Briefcase,
        (r) => r.organization.industyType || r.organization.industryType,
      ],
      ["Registration Number", Hash, (r) => r.organization.registrationNumber],
      ["VAT / PAN", Receipt, (r) => r.organization.vatPan],
      ["Standard", BadgeCheck, (r) => r.organization.standard],
      [
        "Org Telephone",
        Phone,
        (r) =>
          r.organization.orgTelephone || r.organization.organizationTelephone,
      ],
      [
        "Org Email",
        Mail,
        (r) => r.organization.orgEmail || r.organization.organizationEmail,
      ],
      [
        "Province Number",
        MapIcon,
        (r) => r.organization.provinceNumber ?? r.lead.provinceNumber,
      ],
      ["Province", MapIcon, (r) => r.organization.province || r.lead.province],
      ["District", MapIcon, (r) => r.organization.district || r.lead.district],
      [
        "Local Level",
        MapIcon,
        (r) => r.organization.localLevel || r.lead.localLevel,
      ],
      [
        "Total Employees / Learners",
        UserCheck,
        (r) => r.organization.totalEmp_learners ?? r.organization.totalEducator,
      ],
      ["Total Educators ", UserCheck, (r) => r.organization.totalEducator ?? 0],
      ["Grade From ", UserCheck, (r) => r.organization.GradeFrom ?? 0],
      ["Grade To ", UserCheck, (r) => r.organization.GradeTo ?? 0],

      [
        "Contact Person Name",
        UserRound,
        (r) => r.organization.contactPersonName,
      ],
      [
        "Role",
        Briefcase,
        (r) => r.organization.role || r.organization.contactPersonRole,
      ],
      [
        "Contact Person Number",
        Phone,
        (r) => r.organization.contactPersonNumber,
      ],
      ["Contact Person Email", Mail, (r) => r.organization.contactPersonEmail],
      [
        "Address",
        MapIcon,
        (r) =>
          [
            r.organization.localLevel,
            r.organization.district,
            r.organization.province,
          ]
            .filter(Boolean)
            .join(", "),
      ],
    ],
  },
  {
    title: "Lead Information",
    icon: FileSignature,
    fields: [
      ["Lead ID", Hash, (r) => r.lead.leadID || r.lead.leadId || r.leadId],
      ["Lead Type", Tag, (r) => r.lead.leadType],
      ["Lead Source", Tag, (r) => r.lead.leadSource],
      ["Lead Channel", Tag, (r) => r.lead.leadChannel],
      ["Assigned Sales Rep", UserRound, (r) => r.lead.assignedSalesRep],

      [
        "Interested Products / Services",
        FileSignature,
        (r) => r.lead.ProductInterested,
      ],
      ["Province Number", MapIcon, (r) => r.lead.provinceNumber],
      [
        "Address",
        MapIcon,
        (r) =>
          [r.lead.localLevel, r.lead.district, r.lead.province]
            .filter(Boolean)
            .join(", "),
      ],
      ["Sales Manager", UserCheck, (r) => r.lead.salesManager],
      [
        "Notes",
        StickyNote,
        (r) => r.lead.notes || r.lead.note || r.lead.remarks,
      ],
    ],
  },
  {
    title: "Ownership Information",
    icon: UserCheck,
    fields: [
      [
        "Assigned Sales Rep",
        UserRound,
        (r) => r.ownership.assignedSalesRep || r.lead.assignedSalesRep,
      ],

      [
        "Sales Manager",
        UserCheck,
        (r) => r.ownership.salesManager || r.lead.salesManager,
      ],
      ["Lead Pick Date", CalendarPlus, (r) => r.ownership.LeadPickDate],
      ["Lead Pick Time", Clock, (r) => r.ownership.LeadPickTime],
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

function useBodyLock() {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);
}

/* ---------------------------------- Page --------------------------------- */

export default function ContragePage({
  contracts,
  isLoading = false,
  error = null,
  onRetry,
  onSave,
  onDelete,
  onViewContract,
  onClientCredential,
}) {
  const { useMe } = useAuth();
  const { role } = useMe?.data?.user?.decoded || {};
  const { GetAllOrganizationDetails_ } = useGet({
    currentUser: { role },
    isAuthLoading: useMe.isLoading,
  });
  const { EditSalesLead_ } = useEdit();
  const { DeleteSalesLead_ } = UseDelete();
  const { SendTO_Contract } = UseAdd();
  const {
    data: salesData,
    isLoading: salesLoading,
    error: salesError,
  } = GetAllOrganizationDetails_;

  const sourceRows = useMemo(() => {
    const source = Array.isArray(contracts) ? contracts : salesData?.data;
    if (!Array.isArray(source)) return [];

    return source
      .map(normalizeContractRow)
      .filter(Boolean)
      .filter((row) => row.isContracted === true);
  }, [contracts, salesData]);
  const loading =
    isLoading ||
    (!Array.isArray(contracts) && (useMe.isLoading || salesLoading));
  const pageError = error || salesError;

  const [items, setItems] = useState(sourceRows);
  useEffect(() => {
    setItems(sourceRows);
  }, [sourceRows]);

  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ organization: null, service: null });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [showStats, setShowStats] = useState(true);

  const [preview, setPreview] = useState(null); // contract id
  const [form, setForm] = useState(null); // { contract: row }
  const [credentialRow, setCredentialRow] = useState(null);
  const [credentialPurpose, setCredentialPurpose] = useState("credentials");
  const [confirm, setConfirm] = useState(null); // { ids, name }
  const [busy, setBusy] = useState(false);
  const [statusBusyId, setStatusBusyId] = useState(null);
  const [statusChangeConfirmation, setStatusChangeConfirmation] =
    useState(null);
  const [terminationReasonError, setTerminationReasonError] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailStep, setEmailStep] = useState("");
  const [emailContract, setEmailContract] = useState(null);
  const [emailRecipients, setEmailRecipients] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailError, setEmailError] = useState("");
  const emailEditorRef = useRef(null);

  useEffect(() => {
    if (!emailContract || !emailEditorRef.current) return;
    emailEditorRef.current.innerHTML = DOMPurify.sanitize(emailBody);
  }, [emailContract?.id]);

  const notify = (type, message) => {
    if (type === "success") SuccessNotify(message);
    else ErrorNotify(message);
  };

  /* ------------------------------- Data ---------------------------------- */

  const rows = useMemo(
    () =>
      items
        .filter((contract) => contract.isContracted === true)
        .map((contract) => ({ ...contract })),
    [items],
  );

  const activeTab = TABS.find((t) => t.key === tab) || TABS[0];
  const tabRows = useMemo(
    () => rows.filter((r) => activeTab.match(r.status)),
    [rows, activeTab],
  );
  const tabCounts = useMemo(
    () =>
      Object.fromEntries(
        TABS.map((t) => [t.key, rows.filter((r) => t.match(r.status)).length]),
      ),
    [rows],
  );

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const monthLabel = now.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const stats = useMemo(() => {
    const total = rows.length;

    const createdThisMonth = rows.filter((row) =>
      isInCurrentMonth(
        row.createdAt || row.startDate,
        currentYear,
        currentMonth,
      ),
    ).length;
    return [
      // {
      //   label: "New Contracts",
      //   value: createdThisMonth,
      //   hint: monthLabel,
      //   icon: CalendarDays,
      //   tone: "bg-amber-50 text-amber-600",
      // },
      {
        label: "Total Contracts",
        value: total,
        hint: "All contracts",
        icon: FileSignature,
        tone: "bg-orange-50 text-orange-600",
      },
    ];
  }, [rows, currentYear, currentMonth, monthLabel]);

  const organizationOptions = useMemo(
    () =>
      [...new Set(rows.map((r) => r.organizationName).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b))
        .map((value) => ({ value, label: value })),
    [rows],
  );
  const serviceOptions = useMemo(
    () =>
      [...new Set(rows.map((r) => r.service).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b))
        .map((value) => ({ value, label: value })),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tabRows.filter(
      (r) =>
        (!q ||
          SEARCH_KEYS.some((k) =>
            String(r[k] ?? "")
              .toLowerCase()
              .includes(q),
          )) &&
        (!filters.organization ||
          r.organizationName === filters.organization.value) &&
        (!filters.service || r.service === filters.service.value),
    );
  }, [tabRows, search, filters]);

  const hasFilters = Boolean(search || filters.organization || filters.service);
  const resetView = () => {
    setPage(1);
    setSelected([]);
  };

  const changeTab = (key) => {
    setTab(key);
    resetView();
  };
  const updateFilter = (key, value) => {
    setFilters((p) => ({ ...p, [key]: value }));
    resetView();
  };
  const clearFilters = () => {
    setSearch("");
    setFilters({ organization: null, service: null });
    resetView();
  };

  /* ------------------------- Pagination and selection -------------------- */

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, totalPages);
  const pageRows = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);
  const pageIds = pageRows.map((row) => row.id);
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

  /* -------------------------------- Actions ------------------------------ */

  const previewRow = rows.find((r) => r.id === preview);

  const openForm = (contract) => {
    setPreview(null);
    if (contract) setForm({ contract });
  };
  const openEmailComposer = (contract) => {
    const row = normalizeContractRow(contract);
    if (!row?.mainID) {
      notify(
        "error",
        "This contract is missing its backend ID and cannot be sent.",
      );
      return;
    }
    const organization = leadFormRecord(row).organization;
    const defaults = [organization.contactPersonEmail, organization.orgEmail]
      .filter((email) => isValidEmail(email))
      .map((email) => email.trim().toLowerCase())
      .filter((email, index, list) => list.indexOf(email) === index)
      .slice(0, 5);
    const name =
      organization.organizationName || row.organizationName || "Organization";
    const contactName = organization.contactPersonName;
    setPreview(null);
    setEmailContract(row);
    setEmailRecipients(defaults);
    setEmailInput("");
    setEmailSubject(`Contract Agreement – ${name}`);
    setEmailBody(
      `<p>Dear ${escapeHtml(contactName || "Team")},</p><p>Please find attached the contract agreement${row.service ? ` for ${escapeHtml(row.service)}` : ""} for your review.</p><p>Regards,<br />EIMCTA</p>`,
    );
    setEmailError("");
  };

  const closeEmailComposer = () => {
    if (emailBusy) return;
    setEmailContract(null);
    setEmailInput("");
    setEmailError("");
  };

  const addEmailRecipients = (rawValue) => {
    const candidates = rawValue
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean);
    if (!candidates.length) return;

    const invalid = candidates.find((email) => !isValidEmail(email));
    if (invalid) {
      setEmailError(`“${invalid}” is not a valid email address.`);
      return;
    }

    const normalized = candidates.map((email) => email.toLowerCase());
    const duplicate = normalized.find(
      (email, index) =>
        emailRecipients.includes(email) || normalized.indexOf(email) !== index,
    );
    if (duplicate) {
      setEmailError(`${duplicate} has already been added.`);
      return;
    }
    if (emailRecipients.length + normalized.length > 5) {
      setEmailError("You can add up to 5 recipients.");
      return;
    }

    setEmailRecipients((currentRecipients) => [
      ...currentRecipients,
      ...normalized,
    ]);
    setEmailInput("");
    setEmailError("");
  };

  const handleRecipientKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addEmailRecipients(emailInput);
    }
  };

  const removeEmailRecipient = (indexToRemove) => {
    setEmailRecipients((currentRecipients) =>
      currentRecipients.filter((_, index) => index !== indexToRemove),
    );
    setEmailError("");
  };

  const runEditorCommand = (command) => {
    if (!emailEditorRef.current || emailBusy) return;
    emailEditorRef.current.focus();
    document.execCommand(command, false, null);
    setEmailBody(emailEditorRef.current.innerHTML);
  };

  const sendContractEmail = async () => {
    if (emailBusy) return;
    if (!emailContract?.mainID) {
      setEmailError(
        "This contract is missing its backend ID and cannot be sent.",
      );
      return;
    }
    if (!emailRecipients.length) {
      setEmailError("Add at least one recipient.");
      return;
    }
    if (
      emailRecipients.length > 5 ||
      emailRecipients.some((email) => !isValidEmail(email))
    ) {
      setEmailError("Check the recipient email addresses and try again.");
      return;
    }
    if (!emailSubject.trim()) {
      setEmailError("Enter an email subject.");
      return;
    }

    const cleanBody = DOMPurify.sanitize(emailBody);
    const bodyText = cleanBody
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
    if (!bodyText) {
      setEmailError("Write a message before sending.");
      return;
    }

    const waitingMessage = "Preparing and sending contract email...";
    setEmailBusy(true);
    setEmailError("");
    waitingNotify(waitingMessage);
    try {
      setEmailStep("Generating contract documents…");
      await new Promise((resolve) => setTimeout(resolve, 40));

      const [contractBlob, termsBlob] = await Promise.all([
        BuildSlaDocx(),
        BuildBackSideDocx(),
      ]);
      if (!(contractBlob instanceof Blob) || !(termsBlob instanceof Blob)) {
        throw new Error(
          "The contract document generator did not return valid files.",
        );
      }

      const safeOrganization =
        (emailContract.organizationName || "organization")
          .replace(/[^a-z0-9-_]+/gi, "-")
          .replace(/^-+|-+$/g, "")
          .toLowerCase() || "organization";
      const attachments = [
        new File([contractBlob], `${safeOrganization}-contract.docx`, {
          type: DOCX_MIME,
        }),
        new File([termsBlob], `${safeOrganization}-terms-and-conditions.docx`, {
          type: DOCX_MIME,
        }),
      ];
      const payload = new FormData();
      payload.append("to", JSON.stringify(emailRecipients));
      emailRecipients.forEach((email) => payload.append("emailTo[]", email));
      payload.append("subject", emailSubject.trim());
      payload.append("content", cleanBody);
      payload.append("message", cleanBody);
      attachments.forEach((file) => payload.append("file", file, file.name));

      setEmailStep("Sending contract email…");
      const response = await SendTO_Contract.mutateAsync({
        payload,
        params: { MainID: emailContract.mainID },
      });
      if (response?.success === false) {
        throw new Error(
          response.message || "The contract email could not be sent.",
        );
      }

      SuccessNotify(response?.message || "Contract email sent successfully.");
      setEmailContract(null);
      setEmailRecipients([]);
      setEmailInput("");
      setEmailSubject("");
      setEmailBody("");
      setEmailStep("");
    } catch (sendError) {
      const message = errMsg(sendError, "Unable to send the contract email.");
      setEmailError(message);
      ErrorNotify(message);
    } finally {
      dismissWaitingNotify(waitingMessage);
      setEmailBusy(false);
      setEmailStep("");
    }
  };

  const askDelete = (ids) => {
    const one = ids.length === 1 ? rows.find((r) => r.id === ids[0]) : null;
    setPreview(null);
    setConfirm({ ids, name: one ? `${one.organizationName} (${one.id})` : "" });
  };

  const run = async (task, okMsg, failMsg) => {
    setBusy(true);
    const waitingMessage = "Updating contracts...";
    waitingNotify(waitingMessage);
    try {
      await task();
      SuccessNotify(okMsg);
      return true;
    } catch (e) {
      ErrorNotify(errMsg(e, failMsg));
      return false;
    } finally {
      dismissWaitingNotify(waitingMessage);
      setBusy(false);
    }
  };

  const updateContractStatus = async (
    contract,
    nextStatus,
    terminationReasonOverride,
  ) => {
    const normalizedStatus = normalizeStatus(nextStatus);

    if (
      !contract?.mainID ||
      !["contract", "converted", "terminated"].includes(normalizedStatus)
    ) {
      ErrorNotify("This contract status cannot be updated.");
      return false;
    }
    const reason = String(terminationReasonOverride || "").trim();
    if (normalizedStatus === "terminated" && !reason) {
      ErrorNotify("A termination reason is required.");
      return false;
    }

    const reopeningTerminatedContract =
      contract.isTerminated === true && normalizedStatus !== "terminated";
    const statusPayload =
      normalizedStatus === "contract"
        ? {
            ...(reopeningTerminatedContract
              ? {
                  isTerminated: false,
                  isConverted: false,
                  terminationReason_contract: "",
                }
              : {}),
            isContracted: false,
          }
        : normalizedStatus === "converted"
          ? {
              ...(reopeningTerminatedContract
                ? { isTerminated: false, terminationReason_contract: "" }
                : {}),
              isConverted: true,
            }
          : { isTerminated: true, terminationReason_contract: reason };

    const waitingMessage = "Updating contract status...";
    setStatusBusyId(contract.id);
    waitingNotify(waitingMessage);
    try {
      const response = await EditSalesLead_.mutateAsync({
        params: { id: contract.mainID },
        payload: statusPayload,
      });
      if (response?.success === false) {
        throw new Error(
          response.message || "Unable to update contract status.",
        );
      }

      const nextContractStatus =
        normalizedStatus === "converted"
          ? "converted"
          : normalizedStatus === "terminated"
            ? "terminated"
            : "contract";

      setItems((currentItems) =>
        currentItems.map((item) => {
          if (item.id !== contract.id) return item;
          const updatedItem = { ...item, ...statusPayload };
          const status =
            updatedItem.isTerminated === true
              ? "terminated"
              : updatedItem.isConverted === true
                ? "converted"
                : updatedItem.isContracted === true
                  ? "contract"
                  : nextContractStatus;
          const updateLead = (lead) => ({ ...lead, ...statusPayload });

          return {
            ...updatedItem,
            lead: updateLead(item.lead || {}),
            leadDetails: Array.isArray(item.leadDetails)
              ? item.leadDetails.map(updateLead)
              : [updateLead(item.lead || {})],
            status,
            contractStatus: status,
          };
        }),
      );
      if (normalizedStatus !== "converted") {
        setSelected((currentSelected) =>
          currentSelected.filter((id) => id !== contract.id),
        );
      }
      await GetAllOrganizationDetails_.refetch({ throwOnError: true });
      SuccessNotify(
        response?.message || "Contract status updated successfully.",
      );
      return true;
    } catch (statusError) {
      ErrorNotify(errMsg(statusError, "Unable to update contract status."));
      return false;
    } finally {
      dismissWaitingNotify(waitingMessage);
      setStatusBusyId(null);
    }
  };

  const handleContractStatusChange = (contract, nextStatus) => {
    const normalizedStatus = normalizeStatus(nextStatus);
    if (!contract?.mainID) {
      ErrorNotify("This contract is missing its backend ID.");
      return;
    }

    if (
      contract.isTerminated !== true &&
      normalizedStatus === "converted" &&
      contract.isConverted === true
    ) {
      ErrorNotify("This contract has already been converted.");
      return;
    }

    setStatusChangeConfirmation({
      contract,
      nextStatus: normalizedStatus,
      terminationReason: contract.terminationReason_contract || "",
    });
    setTerminationReasonError("");
  };

  const confirmContractStatusChange = async () => {
    const selection = statusChangeConfirmation;
    if (!selection?.contract) return;

    const nextStatus = normalizeStatus(selection.nextStatus);
    const terminationReason = String(selection.terminationReason || "").trim();

    if (nextStatus === "terminated" && !terminationReason) {
      setTerminationReasonError("A termination reason is required.");
      return;
    }

    setStatusUpdating(true);
    waitingNotify("Updating contract status...");
    try {
      const ok = await updateContractStatus(
        selection.contract,
        nextStatus,
        terminationReason,
      );
      if (!ok) return;
      setStatusChangeConfirmation(null);
      setTerminationReasonError("");
    } catch (confirmError) {
      ErrorNotify(errMsg(confirmError, "Unable to update contract status."));
    } finally {
      dismissWaitingNotify("Updating contract status...");
      setStatusUpdating(false);
    }
  };

  const convertContractToBusiness = (contract) => {
    if (!contract?.mainID) {
      ErrorNotify("This contract is missing its backend ID.");
      return;
    }
    if (contract.status === "converted") {
      ErrorNotify("This contract has already been converted.");
      return;
    }
    if (contract.status !== "contract") {
      ErrorNotify("Only active contracts can be converted to a business.");
      return;
    }
    onClientCredential?.(contract);
    setCredentialPurpose("conversion");
    setCredentialRow(contract);
    setPreview(null);
  };

  const handleCredentialSuccess = () => {
    if (credentialPurpose !== "conversion" || !credentialRow) return;
    void updateContractStatus(credentialRow, "converted");
  };

  const saveContract = async (leadPayload) => {
    const editing = form?.contract;
    if (!editing?.mainID)
      throw new Error("This contract is missing its backend ID.");
    const organization = leadPayload.organization || {};
    const service = (leadPayload.lead?.ProductInterested || [])
      .map((item) => {
        const value = typeof item === "string" ? item : item?.value;
        return (
          servicesInterested.find((option) => option.value === value)?.label ||
          value
        );
      })
      .filter(Boolean)
      .join(", ");
    const updatedContract = {
      ...editing,
      organizationName:
        organization.organizationName || editing.organizationName,
      service: service || editing.service,
      lead: leadPayload.lead,
      organization,
      organizationDetails: [organization],
    };
    setBusy(true);
    const waitingMessage = "Updating contract...";
    waitingNotify(waitingMessage);
    try {
      let response;
      if (onSave) {
        response = await onSave(leadPayload, editing.mainID);
      } else {
        response = await EditSalesLead_.mutateAsync({
          params: { id: editing.mainID },
          payload: leadPayload,
        });
      }
      if (response?.success === false) {
        throw new Error(response.message || "Unable to update contract.");
      }
      setItems((p) =>
        p.map((contract) =>
          contract.id === editing.id ? updatedContract : contract,
        ),
      );
      await GetAllOrganizationDetails_.refetch({ throwOnError: true });
      SuccessNotify(response?.message || "Contract updated successfully.");
    } catch (saveError) {
      ErrorNotify(errMsg(saveError, "Unable to update contract."));
      throw saveError;
    } finally {
      dismissWaitingNotify(waitingMessage);
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    const { ids } = confirm;
    const ok = await run(
      async () => {
        if (onDelete) {
          const response = await onDelete(ids);
          if (response?.success === false) {
            throw new Error(response.message || "Unable to delete contracts.");
          }
        } else {
          for (const id of ids) {
            const response = await DeleteSalesLead_.mutateAsync({
              params: { id },
            });
            if (response?.success === false) {
              throw new Error(
                response.message || `Unable to delete contract ${id}.`,
              );
            }
          }
        }
        setItems((p) => p.filter((c) => !ids.includes(c.id)));
        await GetAllOrganizationDetails_.refetch({ throwOnError: true });
      },
      `${plural(ids.length, "Contract", "Contracts")} deleted successfully.`,
      "Unable to delete.",
    );
    if (ok) {
      setConfirm(null);
      setSelected((p) => p.filter((id) => !ids.includes(id)));
    }
  };

  const previewSections = useMemo(
    () =>
      previewRow
        ? PREVIEW_SECTIONS.map((sec) => ({
            ...sec,
            rows: sec.fields.map(([text, icon, get]) => ({
              text,
              icon,
              value: displayDetailValue(get(leadFormRecord(previewRow))),
            })),
          }))
        : [],
    [previewRow],
  );

  /* -------------------------------- Render ------------------------------- */

  return (
    <MotionConfig reducedMotion="user">
      <div className="w-full bg-white font-['Roboto_Slab'] text-xs text-slate-800">
        <div className="mx-auto max-w-[1600px] space-y-4 sm:space-y-5">
          {/* Header */}
          <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm sm:h-11 sm:w-11 ${BRAND}`}
              >
                <FileSignature size={20} />
              </span>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-extrabold text-slate-900 sm:text-xl">
                  Contracts
                </h1>
                <nav
                  aria-label="Breadcrumb"
                  className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-400"
                >
                  <span className="font-medium text-slate-800">CRM</span>
                  <ChevronRight size={12} />
                  <span className="font-extrabold text-amber-600">
                    Contract Management
                  </span>
                </nav>
              </div>
            </div>
          </header>

          {pageError && (
            <div
              role="alert"
              className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
            >
              <span>{pageError.message || "Unable to load contracts."}</span>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="shrink-0 font-semibold underline"
                >
                  Retry
                </button>
              )}
              {!onRetry && (
                <button
                  type="button"
                  onClick={() => GetAllOrganizationDetails_.refetch()}
                  className="shrink-0 font-semibold underline"
                >
                  Retry
                </button>
              )}
            </div>
          )}

          {/* Tabs */}
          <div
            role="tablist"
            aria-label="Contract status"
            className={`-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 ${NO_SCROLLBAR}`}
          >
            {TABS.map((t) => {
              const active = t.key === tab;
              return (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => changeTab(t.key)}
                  className={`inline-flex min-h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-xs font-semibold transition ${FOCUS} ${active ? `${BRAND} text-white shadow-sm` : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                >
                  {t.label}
                  <span
                    className={`rounded-full px-1.5 py-px  text-[10px] font-bold tabular-nums ${active ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"}`}
                  >
                    {loading ? "·" : tabCounts[t.key]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Overview */}
          <section aria-label="Contract overview" className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="min-w-0 text-sm font-extrabold text-slate-900 sm:text-base">
                Overview
                <span className="block truncate text-xs font-medium text-slate-400 sm:ml-2 sm:inline">
                  {loading
                    ? "Loading..."
                    : `${plural(tabRows.length, "contract", "contracts")} in ${activeTab.label.toLowerCase()}`}
                </span>
              </h2>
              <button
                type="button"
                onClick={() => setShowStats((o) => !o)}
                aria-expanded={showStats}
                className={`inline-flex min-h-8 shrink-0 items-center gap-1 rounded-md px-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 ${FOCUS}`}
              >
                {showStats ? "Hide" : "Show"}
                <ChevronDown
                  size={14}
                  className={`transition-transform ${showStats ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            {showStats && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {loading
                  ? Array.from({ length: 2 }, (_, i) => (
                      <StatCardSkeleton key={i} />
                    ))
                  : stats.map((s, i) => (
                      <StatCard key={s.label} index={i} {...s} />
                    ))}
              </div>
            )}
          </section>

          {/* Table card */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-3 sm:p-4">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto] lg:items-center">
                <div className="relative sm:col-span-2 lg:col-span-1">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -mt-2 text-slate-400"
                  />
                  <input
                    type="search"
                    aria-label="Search contracts"
                    placeholder="Search by lead ID, organization, service or status"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      resetView();
                    }}
                    className={`${INPUT} pl-9 font-medium`}
                  />
                </div>
                {[
                  [
                    "organization",
                    "All organizations",
                    organizationOptions,
                    true,
                  ],
                  ["service", "All Services", serviceOptions, false],
                ].map(([key, placeholder, options, searchable]) => (
                  <Select
                    key={key}
                    isClearable
                    isSearchable={searchable}
                    isLoading={loading}
                    aria-label={`Filter by ${key}`}
                    components={animatedComponents}
                    options={options}
                    value={filters[key]}
                    onChange={(o) => updateFilter(key, o)}
                    placeholder={placeholder}
                    styles={selectStyles}
                    menuPortalTarget={
                      typeof document !== "undefined" ? document.body : null
                    }
                    menuPosition="fixed"
                  />
                ))}
                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={!hasFilters}
                  className={`min-h-10 rounded-lg px-3 text-xs font-semibold text-amber-600 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent sm:col-span-2 lg:col-span-1 ${FOCUS}`}
                >
                  Clear filters
                </button>
              </div>
            </div>

            <ContractsTable
              rows={pageRows}
              loading={loading}
              groupKey={tab}
              selected={selected}
              allSelected={allSelected}
              onToggleOne={toggleOne}
              onToggleAll={toggleAll}
              onView={(row) => setPreview(row.id)}
              onEdit={openForm}
              onViewContract={(row) => {
                setPreview(row.id);
                onViewContract?.(row);
              }}
              onSendContract={openEmailComposer}
              onStatusChange={handleContractStatusChange}
              statusBusyId={statusBusyId}
              onClientCredential={(row) => {
                if (row.status !== "converted") return;
                onClientCredential?.(row);
                setCredentialPurpose("credentials");
                setCredentialRow(row);
              }}
              onDelete={(row) => askDelete([row.id])}
              hasFilters={hasFilters}
              onClearFilters={clearFilters}
            />

            {/* Pagination */}
            <div className="flex flex-col justify-between gap-3 border-t border-slate-200 px-3 py-3 sm:flex-row sm:items-center sm:px-4">
              {loading ? (
                <Skeleton className="h-4 w-44" />
              ) : (
                <span className="text-xs text-slate-500">
                  Showing {filtered.length ? (current - 1) * PER_PAGE + 1 : 0}{" "}
                  to {Math.min(current * PER_PAGE, filtered.length)} of{" "}
                  {filtered.length} contracts
                </span>
              )}
              <div className="flex items-center justify-between gap-2 sm:justify-end">
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

        {/* Bulk bar */}
        <AnimatePresence>
          {selected.length > 0 && (
            <div
              key="bulk-bar"
              className="pointer-events-none fixed inset-x-0 bottom-3 z-[90] flex justify-center px-3 sm:bottom-5"
            >
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="pointer-events-auto flex w-full max-w-lg items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-2 pl-4 shadow-xl sm:w-auto sm:max-w-none sm:gap-4"
              >
                <span className="text-xs font-semibold text-slate-700">
                  {selected.length} selected
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => askDelete(selected)}
                    aria-label="Delete selected"
                    className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-600 hover:bg-red-50 ${FOCUS}`}
                  >
                    <Trash2 size={15} />{" "}
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelected([])}
                    aria-label="Clear selection"
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 ${FOCUS}`}
                  >
                    <X size={16} />
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Preview drawer */}
        <AnimatePresence>
          {previewRow && (
            <SideDrawer
              key="preview-drawer"
              size="xl"
              eyebrow="Contract details"
              title={previewRow.title || previewRow.service}
              subtitle={previewRow.id}
              onClose={() => setPreview(null)}
            >
              <div className="space-y-3 sm:space-y-4">
                {previewSections.map(
                  ({ title, icon: SectionIcon, rows: fields }, s) => (
                    <section
                      key={title}
                      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                    >
                      <h3 className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-medium text-slate-500">
                        <SectionIcon size={14} className="text-amber-600" />{" "}
                        {title}
                      </h3>
                      <dl className="grid grid-cols-1 divide-y divide-slate-100 px-4 sm:grid-cols-2 sm:gap-x-6 sm:divide-y-0">
                        {fields.map((r, k) => (
                          <DetailRow
                            key={r.text}
                            icon={r.icon}
                            label={r.text}
                            value={r.value}
                            delay={0.15 + s * 0.08 + k * 0.04}
                          />
                        ))}
                      </dl>
                    </section>
                  ),
                )}
              </div>
            </SideDrawer>
          )}
        </AnimatePresence>

        {/* Contract email drawer */}
        <AnimatePresence>
          {emailContract && (
            <SideDrawer
              key="contract-email-drawer"
              size="xl"
              eyebrow="Contract email"
              title="Send Contract"
              subtitle={emailContract.organizationName || emailContract.mainID}
              onClose={closeEmailComposer}
              locked={emailBusy}
              footer={
                <div className="space-y-3">
                  {/* Loading status */}
                  <div
                    className="min-w-0 text-[11px] text-slate-500"
                    aria-live="polite"
                  >
                    <AnimatePresence mode="wait">
                      {emailBusy && (
                        <motion.span
                          key={emailStep}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{
                            delay: 0.5,
                            duration: 0.6,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="inline-flex items-center gap-2"
                        >
                          <Loader2
                            size={14}
                            className="animate-spin text-amber-600"
                          />
                          {emailStep}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex items-center gap-2">
                    <motion.button
                      type="button"
                      onClick={() => convertContractToBusiness(emailContract)}
                      disabled={
                        emailBusy ||
                        (emailContract.status &&
                          emailContract.status !== "contract")
                      }
                      variants={btnVariants}
                      {...press(
                        emailBusy ||
                          (emailContract.status &&
                            emailContract.status !== "contract"),
                      )}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 22,
                      }}
                      className={`inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-3 text-xs font-bold text-white shadow-md shadow-orange-500/20 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`}
                    >
                      <motion.span
                        variants={iconVariants}
                        className="inline-flex"
                      >
                        <Building2 size={15} />
                      </motion.span>
                      {emailContract.status === "converted"
                        ? "Already Converted"
                        : "Convert to Business"}
                    </motion.button>

                    <motion.button
                      type="button"
                      onClick={sendContractEmail}
                      disabled={emailBusy}
                      variants={btnVariants}
                      {...press(emailBusy)}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 22,
                      }}
                      className={`inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-xs font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60 ${BRAND} ${FOCUS}`}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                          key={emailBusy ? "busy" : "idle"}
                          variants={iconVariants}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          transition={{ duration: 0.15 }}
                          className="inline-flex"
                        >
                          {emailBusy ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Mail size={15} />
                          )}
                        </motion.span>
                      </AnimatePresence>
                      {emailBusy ? "Processing…" : "Send Contract"}
                    </motion.button>
                  </div>
                </div>
              }
            >
              <motion.div
                className="space-y-4"
                variants={stagger}
                initial="hidden"
                animate="show"
              >
                {/* Recipients */}
                <motion.div variants={fadeUp}>
                  <label
                    htmlFor="contract-recipient"
                    className="mb-1.5 block text-xs font-bold text-slate-900"
                  >
                    Send To{" "}
                    <span className="font-medium text-slate-700">
                      (up to 5 recipients)
                    </span>
                  </label>

                  <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    className="flex min-h-11 flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 transition-colors focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/10"
                  >
                    <AnimatePresence initial={false} mode="popLayout">
                      {emailRecipients.map((email, index) => (
                        <motion.span
                          key={email}
                          layout
                          initial={{ opacity: 0, scale: 0.8, y: 6 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.45, ease: EASE_OUT }}
                          className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800"
                        >
                          {email}
                          <motion.button
                            type="button"
                            aria-label={`Remove ${email}`}
                            disabled={emailBusy}
                            onClick={() => removeEmailRecipient(index)}
                            whileHover={
                              emailBusy
                                ? undefined
                                : { scale: 1.25, rotate: 90 }
                            }
                            whileTap={emailBusy ? undefined : { scale: 0.85 }}
                            transition={{ duration: 0.4, ease: EASE_OUT }}
                            className="rounded-full text-amber-600 hover:text-red-600 disabled:opacity-50"
                          >
                            <X size={12} />
                          </motion.button>
                        </motion.span>
                      ))}
                    </AnimatePresence>

                    {emailRecipients.length < 5 && (
                      <motion.input
                        layout
                        id="contract-recipient"
                        type="text"
                        inputMode="email"
                        transition={{ duration: 0.4, ease: EASE_OUT }}
                        value={emailInput}
                        disabled={emailBusy}
                        onChange={(event) => {
                          setEmailInput(event.target.value);
                          if (emailError) setEmailError("");
                        }}
                        onKeyDown={handleRecipientKeyDown}
                        onBlur={() => {
                          if (emailInput.trim()) addEmailRecipients(emailInput);
                        }}
                        placeholder={
                          emailRecipients.length
                            ? "Add another email…"
                            : "Enter an email and press Enter"
                        }
                        className="min-w-[180px] flex-1 border-0 bg-transparent px-1 py-1 text-xs font-medium text-slate-800 outline-none placeholder:text-slate-400"
                        aria-describedby={
                          emailError ? "contract-email-error" : undefined
                        }
                      />
                    )}
                  </motion.div>
                </motion.div>

                {/* Subject */}
                <motion.div variants={fadeUp}>
                  <label
                    htmlFor="contract-email-subject"
                    className="mb-1.5 block text-xs font-bold text-slate-900"
                  >
                    Subject
                  </label>
                  <motion.input
                    id="contract-email-subject"
                    type="text"
                    value={emailSubject}
                    disabled={emailBusy}
                    onChange={(event) => setEmailSubject(event.target.value)}
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className={INPUT}
                  />
                </motion.div>

                {/* Email body */}
                <motion.div variants={fadeUp}>
                  <span
                    id="contract-email-body-label"
                    className="mb-1.5 block text-xs font-bold text-slate-900"
                  >
                    Email Body
                  </span>

                  <div className="overflow-hidden rounded-lg border border-slate-200 bg-white transition-colors focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/10">
                    <motion.div
                      role="toolbar"
                      aria-label="Email formatting"
                      variants={{
                        hidden: { opacity: 0, scale: 0.7, y: 6 },
                        show: {
                          opacity: 1,
                          scale: 1,
                          y: 0,
                          transition: { duration: 0.5, ease: EASE_OUT },
                        },

                        tap: { scale: 0.92 },
                      }}
                      {...press(emailBusy)}
                      transition={softSpring}
                      className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-1.5"
                    >
                      {[
                        ["bold", "Bold", Bold],
                        ["italic", "Italic", Italic],
                        ["underline", "Underline", Underline],
                        ["insertOrderedList", "Numbered list", ListOrdered],
                        ["insertUnorderedList", "Bulleted list", List],
                        ["justifyLeft", "Align left", AlignLeft],
                      ].map(([command, label, Icon]) => (
                        <motion.button
                          key={command}
                          type="button"
                          aria-label={label}
                          title={label}
                          disabled={emailBusy}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => runEditorCommand(command)}
                          variants={{
                            hidden: { opacity: 0, scale: 0.5 },
                            show: { opacity: 1, scale: 1 },
                            hover: { scale: 1.15, y: -1 },
                            tap: { scale: 0.88 },
                          }}
                          {...press(emailBusy)}
                          transition={{
                            type: "spring",
                            stiffness: 450,
                            damping: 24,
                          }}
                          className={`rounded-md p-2 font-bold text-slate-900 hover:bg-amber-100 hover:text-amber-700 disabled:opacity-50 ${FOCUS}`}
                        >
                          <Icon size={15} />
                        </motion.button>
                      ))}
                    </motion.div>

                    <div
                      ref={emailEditorRef}
                      role="textbox"
                      aria-labelledby="contract-email-body-label"
                      aria-multiline="true"
                      contentEditable={!emailBusy}
                      suppressContentEditableWarning
                      onInput={(event) =>
                        setEmailBody(event.currentTarget.innerHTML)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") event.stopPropagation();
                      }}
                      className="min-h-44 max-h-[45vh] overflow-y-auto p-3 text-xs font-medium leading-6 text-slate-800 outline-none empty:before:text-slate-400 empty:before:content-['Write_your_message…'] [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-1"
                    />
                  </div>
                </motion.div>

                {/* Attachments */}
                <motion.section
                  variants={fadeUp}
                  aria-label="Attachments"
                  className="rounded-lg border border-slate-200 bg-white p-3"
                >
                  <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900">
                    <FileSignature size={15} className="text-amber-600" />
                    Attachments
                  </div>

                  <ul className="mt-2 space-y-1.5 text-[11px] font-medium text-slate-800">
                    {["contract.docx", "terms-and-conditions.docx"].map(
                      (file) => (
                        <motion.li
                          key={file}
                          whileHover={{ x: 3 }}
                          transition={softSpring}
                        >
                          {emailContract.organizationName || "Organization"}{" "}
                          {file}
                        </motion.li>
                      ),
                    )}
                  </ul>

                  <p className="mt-2 text-[10px] font-medium text-slate-800">
                    Documents are generated when you send.
                  </p>
                </motion.section>

                {/* Error */}
                <AnimatePresence>
                  {emailError && (
                    <motion.p
                      id="contract-email-error"
                      role="alert"
                      initial={{ opacity: 0, height: 0, y: -8 }}
                      animate={{
                        opacity: 1,
                        height: "auto",
                        y: 0,
                        x: [0, -6, 6, -4, 4, 0], // small shake
                      }}
                      exit={{ opacity: 0, height: 0, y: -8 }}
                      transition={{ duration: 0.35 }}
                      className="overflow-hidden rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
                    >
                      {emailError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            </SideDrawer>
          )}
        </AnimatePresence>

        {/* Edit contract */}
        <AnimatePresence>
          {form && (
            <Modal
              key="form-modal"
              size="max-w-4xl"
              title="Update Contract"
              subtitle={`${form.contract.organizationName} · ${form.contract.leadId}`}
              locked={busy}
              onClose={() => setForm(null)}
            >
              <LeadFormStepper
                key={form.contract.id}
                data={leadFormRecord(form.contract)}
                isEdit={true}
                isContractedit={true}
                onSubmit={saveContract}
                onClose={() => setForm(null)}
              />
            </Modal>
          )}
        </AnimatePresence>

        {/* Client credentials */}
        <AnimatePresence>
          {credentialRow && (
            <ClientCreateCredential
              onClose={() => setCredentialRow(null)}
              onSuccess={handleCredentialSuccess}
              organizations={[leadFormRecord(credentialRow).organization]}
            />
          )}
        </AnimatePresence>

        {/* Contract status confirmation */}
        <AnimatePresence>
          {statusChangeConfirmation && (
            <Modal
              key="contract-status-modal"
              size="max-w-lg"
              rise={16}
              locked={statusUpdating}
              onClose={() => {
                if (statusUpdating) return;
                setStatusChangeConfirmation(null);
                setTerminationReasonError("");
              }}
            >
              <>
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      statusChangeConfirmation.nextStatus === "terminated"
                        ? "bg-red-50 text-red-500"
                        : statusChangeConfirmation.nextStatus === "converted"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {statusChangeConfirmation.nextStatus === "terminated" ? (
                      <AlertTriangle size={20} />
                    ) : statusChangeConfirmation.nextStatus === "converted" ? (
                      <BadgeCheck size={20} />
                    ) : (
                      <FileSignature size={20} />
                    )}
                  </span>

                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Change contract status?
                    </h2>

                    <p className="mt-1 text-sm font-medium text-slate-500">
                      Update{" "}
                      <span className="font-semibold text-slate-800">
                        {statusChangeConfirmation.contract.organizationName ||
                          statusChangeConfirmation.contract.leadId ||
                          "this contract"}
                      </span>{" "}
                      from{" "}
                      <span className="font-semibold text-slate-800">
                        {statusChangeConfirmation.contract.isTerminated
                          ? "Terminated"
                          : statusChangeConfirmation.contract.isConverted
                            ? "Converted"
                            : statusChangeConfirmation.contract.isContracted
                              ? "New"
                              : statusChangeConfirmation.contract.status}
                      </span>{" "}
                      to{" "}
                      <span className="font-semibold text-slate-800">
                        {statusChangeConfirmation.nextStatus === "contract"
                          ? "Re-Schedule"
                          : statusChangeConfirmation.nextStatus === "converted"
                            ? "Convert"
                            : statusChangeConfirmation.nextStatus ===
                                "terminated"
                              ? "Terminate"
                              : statusChangeConfirmation.nextStatus}
                      </span>
                      .
                    </p>
                  </div>
                </div>

                {statusChangeConfirmation.nextStatus === "terminated" && (
                  <div className="mt-4">
                    <label
                      htmlFor="termination-reason"
                      className="mb-1.5 block text-sm font-semibold text-slate-700"
                    >
                      Termination reason
                    </label>

                    <textarea
                      id="termination-reason"
                      rows={3}
                      value={statusChangeConfirmation.terminationReason}
                      onChange={(event) => {
                        setStatusChangeConfirmation((current) => ({
                          ...current,
                          terminationReason: event.target.value,
                        }));
                        if (event.target.value.trim()) {
                          setTerminationReasonError("");
                        }
                      }}
                      disabled={statusUpdating}
                      aria-invalid={Boolean(terminationReasonError)}
                      aria-describedby={
                        terminationReasonError
                          ? "termination-reason-error"
                          : undefined
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:bg-slate-50"
                    />

                    {terminationReasonError && (
                      <p
                        id="termination-reason-error"
                        className="mt-1 text-xs font-medium text-red-600"
                      >
                        {terminationReasonError}
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap gap-2">
                      {[
                        "Client cancelled the service.",
                        "Budget or financial constraints.",
                        "Client selected another consultancy.",
                        "No longer interested in certification.",
                      ].map((reason) => (
                        <button
                          key={reason}
                          type="button"
                          disabled={statusUpdating}
                          onClick={() => {
                            setStatusChangeConfirmation((current) => ({
                              ...current,
                              terminationReason: reason,
                            }));
                            setTerminationReasonError("");
                          }}
                          className="rounded-full border border-slate-200 px-2.5 py-1 text-left text-[11px] font-semibold text-slate-600 hover:border-amber-300 hover:bg-amber-50 disabled:opacity-50"
                        >
                          {reason}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    autoFocus
                    onClick={() => {
                      setStatusChangeConfirmation(null);
                      setTerminationReasonError("");
                    }}
                    disabled={statusUpdating}
                    className="min-h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={confirmContractStatusChange}
                    disabled={statusUpdating}
                    className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-white disabled:opacity-70 ${
                      statusChangeConfirmation.nextStatus === "terminated"
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                  >
                    {statusUpdating && (
                      <Loader2 size={14} className="animate-spin" />
                    )}
                    {statusUpdating
                      ? "Updating..."
                      : `Confirm ${
                          statusChangeConfirmation.nextStatus === "contract"
                            ? "reschedule"
                            : statusChangeConfirmation.nextStatus ===
                                "converted"
                              ? "convert"
                              : "terminate"
                        }`}
                  </button>
                </div>
              </>
            </Modal>
          )}
        </AnimatePresence>

        {/* Delete confirmation */}
        <AnimatePresence>
          {confirm && (
            <Modal
              key="delete-modal"
              alert
              size="max-w-sm"
              rise={20}
              locked={busy}
              onClose={() => setConfirm(null)}
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <AlertTriangle size={20} />
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                    Delete{" "}
                    {confirm.ids.length === 1
                      ? "this contract"
                      : `${confirm.ids.length} contracts`}
                    ?
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {confirm.ids.length === 1 ? (
                      <>
                        <span className="font-semibold text-slate-800">
                          {confirm.name}
                        </span>{" "}
                        will be permanently deleted.
                      </>
                    ) : (
                      "The selected contracts will be permanently deleted."
                    )}{" "}
                    This can’t be undone.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  autoFocus
                  onClick={() => setConfirm(null)}
                  disabled={busy}
                  className={`min-h-10 rounded-lg border border-slate-200 px-4 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 ${FOCUS}`}
                >
                  Keep {confirm.ids.length === 1 ? "contract" : "contracts"}
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={busy}
                  className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-70 ${FOCUS}`}
                >
                  {busy && <Loader2 size={14} className="animate-spin" />}
                  {busy ? "Deleting..." : "Delete"}
                </button>
              </div>
            </Modal>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}

/* ------------------------------- Skeletons -------------------------------- */

function Skeleton({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded bg-slate-200/80 ${className}`}
    />
  );
}

// same box model as StatCard so nothing jumps when data arrives
function StatCardSkeleton() {
  return (
    <div className={CARD}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-1.5 h-[18px] w-16 sm:h-5" />
        </div>
        <Skeleton className="h-9 w-9 rounded-lg sm:h-10 sm:w-10" />
      </div>
      <Skeleton className="mt-3 h-3 w-28" />
    </div>
  );
}

/* ------------------------------ Shared pieces ----------------------------- */

function CountUp({ value, format = fmtInt }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (reduce) {
      node.textContent = format(value);
      return undefined;
    }
    const controls = animate(0, value, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate: (v) => {
        node.textContent = format(v);
      },
    });
    return () => controls.stop();
  }, [value, reduce, format]);

  return <span ref={ref}>{format(reduce ? value : 0)}</span>;
}

function StatCard({ index, label, value, hint, icon: Icon, tone, format }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.07, duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={CARD}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium leading-4 text-slate-600">
            {label}
          </p>
          <p className="mt-1.5 truncate text-lg font-extrabold leading-none tabular-nums text-slate-900 sm:text-xl">
            <CountUp value={value} format={format} />
          </p>
        </div>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 ${tone}`}
        >
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-3 truncate text-[10px] font-medium leading-3 text-slate-800">
        {hint}
      </p>
    </motion.div>
  );
}

function PageButton({ children, ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS}`}
      {...props}
    >
      {children}
    </button>
  );
}

function DetailRow({ icon: Icon, label, value, delay }) {
  return (
    <motion.div
      initial={{ x: 24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay, duration: 0.3, ease: "easeOut" }}
      className="flex items-start gap-3 py-2.5"
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <dt className="text-[11px] font-medium text-slate-400">{label}</dt>
        <dd className="break-words text-xs font-bold text-slate-800 sm:text-sm">
          {String(value)}
        </dd>
      </div>
    </motion.div>
  );
}

/* ---------------------------- Overlay containers --------------------------- */

// Centered dialog. `rise` is the vertical offset it animates in from.
function Modal({
  title,
  subtitle,
  size = "max-w-2xl",
  alert = false,
  locked = false,
  rise = 12,
  onClose,
  children,
}) {
  const titleId = useId();
  const close = () => {
    if (!locked) onClose();
  };
  useEscape(close);
  useBodyLock();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6">
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-black/60 "
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{ backdropFilter: "blur(10px)" }}
        onMouseDown={close}
      />
      <motion.div
        role={alert ? "alertdialog" : "dialog"}
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        initial={{ opacity: 0, y: rise }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: rise }}
        className={`relative flex max-h-[calc(100dvh-1.5rem)] w-full ${size} flex-col overflow-hidden rounded-2xl shadow-2xl sm:max-h-[90vh] ${title ? "bg-slate-50" : "bg-white p-4 sm:p-5"}`}
      >
        {title && (
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-5 sm:py-4">
            <div className="min-w-0">
              <h2
                id={titleId}
                className="truncate text-sm font-extrabold text-slate-900 sm:text-base"
              >
                {title}
              </h2>
              {subtitle && (
                <p className="mt-1 truncate text-xs font-medium text-slate-500">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className={`shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 ${FOCUS}`}
            >
              <X size={18} />
            </button>
          </div>
        )}
        {title ? (
          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
            {children}
          </div>
        ) : (
          children
        )}
      </motion.div>
    </div>
  );
}

const EASE_OUT = [0.22, 1, 0.36, 1]; // soft, gentle settle

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.35 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT },
  },
};

const press = (disabled) =>
  disabled ? {} : { whileHover: "hover", whileTap: "tap" };

const btnVariants = {
  hover: { scale: 1.02 },
  tap: { scale: 0.97 },
};

const iconVariants = {
  hover: { rotate: -8, scale: 1.12 },
  tap: { scale: 0.92 },
};

// slower, softer spring for hover/tap feedback
const softSpring = { type: "spring", stiffness: 180, damping: 22 };

function SideDrawer({
  onClose,
  eyebrow,
  title,
  subtitle,
  size = "md",
  footer,
  locked = false,
  children,
}) {
  const titleId = useId();
  const close = () => {
    if (!locked) onClose();
  };
  useEscape(close);
  useBodyLock();

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <motion.div
        aria-hidden="true"
        onClick={close}
        className="absolute inset-0 bg-black/60 "
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
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className={`relative flex h-full w-full flex-col bg-white shadow-2xl ${DRAWER_WIDTH[size]}`}
      >
        <motion.header
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-5 sm:py-4"
        >
          <div className="min-w-0">
            {eyebrow && (
              <p className="text-[11px] font-extrabold text-amber-600">
                {eyebrow}
              </p>
            )}
            <h2
              id={titleId}
              className="mt-0.5 truncate text-sm font-bold leading-tight text-slate-900 sm:text-base"
              title={title}
            >
              {title}
            </h2>
            {subtitle && (
              <span className="mt-1.5 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                {subtitle}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={close}
            disabled={locked}
            aria-label="Close panel"
            className={`shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50 ${FOCUS}`}
          >
            <X size={18} />
          </button>
        </motion.header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-3 sm:p-5">
          {children}
        </div>

        {footer && (
          <motion.footer
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="shrink-0 border-t border-slate-200 bg-white px-3 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] sm:px-4"
          >
            {footer}
          </motion.footer>
        )}
      </motion.aside>
    </div>
  );
}
