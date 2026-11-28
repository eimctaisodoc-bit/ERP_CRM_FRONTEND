import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import NepaliDate from "nepali-date-converter";
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
  Clock,
  X,
  AlertTriangle,
  Building2,
  Tag,
  Hash,
  Factory,
  Receipt,
  ShieldCheck,
  MapPin,
  Users,
  UsersRound,
  UserRound,
  Phone,
  BriefcaseBusiness,
  IdCard,
  Flame,
  Share2,
  MessageCircle,
  Megaphone,
  Package,
  CalendarDays,
  CalendarClock,
  UserCheck,
  LoaderCircle,
  StickyNote,
  Settings,
} from "lucide-react";
import { ClientCreateCredential } from "./clientLoginFroms";
import NepaliDateInput from "../../../nepalidate/testDate";

import LeadFormStepper, {
  servicesInterested,
} from "../trial/lead-workspace/newLeadForms";
import ContractsTable from "./contractTable";
import { InstallmentDrawer } from "./installement";
import { TermsAndConditionsDrawer } from "./termsCondition";
import ContractEmailDrawer from "./ContractEmailDrawer";
import { Skeleton } from "../../../skeleton";

import { useGet } from "../../../hooks/useGet";
import { useAuth } from "../../../hooks/useAuth";
import { useEdit } from "../../../hooks/useEdit";
import { UseDelete } from "../../../hooks/useDelete";
import {
  dismissWaitingNotify,
  ErrorNotify,
  SuccessNotify,
  waitingNotify,
} from "../../../hotToaster";

const animatedComponents = makeAnimated();

/* ------------------------------ Constants -------------------------------- */

const PER_PAGE = 10;
// Full-bleed on phones, then steps up with the viewport so the backdrop stays
// visible and the content never feels stretched.
const DRAWER_WIDTH = {
  md: "sm:max-w-md",
  lg: "sm:max-w-md md:max-w-lg",
  xl: "sm:max-w-lg md:max-w-xl lg:max-w-2xl",
  "2xl": "sm:max-w-xl md:max-w-2xl lg:max-w-3xl",
  "3xl": "sm:w-[45vw] sm:max-w-[45vw]",
};

/* Shared theme tokens (Roboto Slab / amber-orange brand / slate neutrals) */
const FONT = "'Roboto Slab', serif";
const BRAND = "bg-gradient-to-r from-amber-500 to-orange-500";
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40";
const INPUT =
  "h-10 w-full cursor-text rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 disabled:cursor-not-allowed";
const NO_SCROLLBAR = "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
const CARD =
  "rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-4";

/* Buttons */
const BTN = `inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS}`;
const BTN_SECONDARY = `${BTN} border border-slate-200 bg-white text-slate-600 hover:bg-slate-50`;
const BTN_GHOST = `${BTN} text-amber-600 hover:bg-amber-50 disabled:text-slate-300 disabled:opacity-100 disabled:hover:bg-transparent`;
const BTN_DANGER = `${BTN} bg-red-600 text-white hover:bg-red-700`;
const BTN_DANGER_OUTLINE = `${BTN} border border-red-200 bg-white text-red-600 hover:bg-red-50`;
const ICON_BTN = `inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-amber-50 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-50 sm:h-8 sm:w-8 ${FOCUS}`;

// Applied once at the page root via the `cp-scroll` class. Modern browsers use
// the standard properties; the webkit block is only a fallback for older Safari.
const SCROLL_CSS = `
.cp-scroll, .cp-scroll * {
  scrollbar-width: thin;
  scrollbar-color: #CBD5E1 transparent;
}
@supports not (scrollbar-width: thin) {
  .cp-scroll::-webkit-scrollbar, .cp-scroll *::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  .cp-scroll::-webkit-scrollbar-track, .cp-scroll *::-webkit-scrollbar-track,
  .cp-scroll::-webkit-scrollbar-corner, .cp-scroll *::-webkit-scrollbar-corner {
    background: transparent;
  }
  .cp-scroll::-webkit-scrollbar-thumb, .cp-scroll *::-webkit-scrollbar-thumb {
    background: #CBD5E1;
    border: 2px solid transparent;
    border-radius: 999px;
    background-clip: padding-box;
  }
  .cp-scroll *::-webkit-scrollbar-thumb:hover {
    background: #94A3B8;
    background-clip: padding-box;
  }
}
`;

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

const LEAD_TAKEN_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last-7-days", label: "Last 7 Days" },
  { value: "last-30-days", label: "Last 30 Days" },
  { value: "this-month", label: "This Month" },
  { value: "last-month", label: "Last Month" },
  { value: "custom", label: "Custom Date Range" },
];

const DRAWER_TABS = [
  { key: "installment", label: "Installment" },
  { key: "terms", label: "Terms" },
  { key: "contract", label: "Contract" },
];

const SEARCH_KEYS = ["leadId", "organizationName", "service", "status"];

const selectStyles = {
  control: (base, s) => ({
    ...base,
    minHeight: 40,
    cursor: "pointer",
    fontFamily: FONT,
    fontWeight: 500,
    fontSize: 12,
    borderRadius: 8,
    backgroundColor: s.isFocused ? "#FFFFFF" : "#F8FAFC",
    borderColor: s.isFocused ? "#F59E0B" : "#E2E8F0",
    boxShadow: s.isFocused ? "0 0 0 2px #F59E0B1A" : "none",
    "&:hover": { borderColor: "#F59E0B" },
  }),
  singleValue: (base) => ({ ...base, color: "#1E293B", fontWeight: 500 }),
  placeholder: (base) => ({ ...base, color: "#64748B", fontWeight: 500 }),
  input: (base) => ({ ...base, cursor: "text", color: "#1E293B" }),
  dropdownIndicator: (base, s) => ({
    ...base,
    color: s.isFocused ? "#F59E0B" : "#94A3B8",
    "&:hover": { color: "#F59E0B" },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: "#94A3B8",
    "&:hover": { color: "#F59E0B" },
  }),
  indicatorSeparator: () => ({ display: "none" }),
  menuPortal: (base) => ({ ...base, zIndex: 300 }),
  menu: (base) => ({
    ...base,
    fontFamily: FONT,
    fontSize: 12,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    border: "1px solid #E2E8F0",
    boxShadow: "0 10px 15px -3px rgba(15,23,42,0.12)",
    overflow: "hidden",
  }),
  menuList: (base) => ({
    ...base,
    scrollbarWidth: "thin",
    scrollbarColor: "#CBD5E1 transparent",
  }),
  option: (base, s) => ({
    ...base,
    fontFamily: FONT,
    fontWeight: 500,
    fontSize: 12,
    cursor: "pointer",
    color: s.isSelected ? "#FFFFFF" : "#1E293B",
    backgroundColor: s.isSelected
      ? "#F97316"
      : s.isActive
        ? "#FDBA74"
        : s.isFocused
          ? "#FFF7ED"
          : "#FFFFFF",
  }),
};

/* ------------------------------- Helpers --------------------------------- */

const nf = new Intl.NumberFormat("en-IN");
const fmtInt = (n) => nf.format(Math.round(n || 0));
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const errMsg = (e, fallback) =>
  e?.response?.data?.message || e?.message || fallback;

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

const parseBsDateTime = (dateValue, timeValue, fallbackTime) => {
  try {
    const dateMatch = String(dateValue || "")
      .trim()
      .match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (!dateMatch) return NaN;

    const [, yearText, monthText, dayText] = dateMatch;
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    const nepaliDate = new NepaliDate(year, month - 1, day);

    if (
      nepaliDate.getYear() !== year ||
      nepaliDate.getMonth() !== month - 1 ||
      nepaliDate.getDate() !== day
    ) {
      return NaN;
    }

    const timeString = String(timeValue || fallbackTime || "00:00:00").trim();
    const timeMatch = timeString.match(
      /^(\d{1,2}):([0-5]\d)(?::([0-5]\d))?\s*(AM|PM)?$/i,
    );
    if (!timeMatch) return NaN;

    let hours = Number(timeMatch[1]);
    const minutes = Number(timeMatch[2]);
    const seconds = Number(timeMatch[3] || 0);
    const meridiem = timeMatch[4]?.toUpperCase();

    if (meridiem) {
      if (hours < 1 || hours > 12) return NaN;
      if (hours === 12) hours = 0;
      if (meridiem === "PM") hours += 12;
    } else if (hours > 23) {
      return NaN;
    }

    const jsDate = nepaliDate.toJsDate();
    jsDate.setHours(hours, minutes, seconds, 0);
    return jsDate.getTime();
  } catch {
    return NaN;
  }
};

const formatRelativeTime = (takenAt, now = Date.now()) => {
  if (!Number.isFinite(takenAt)) return "-";

  const takenDate = new Date(takenAt);
  const nowDate = new Date(now);
  const startOfTaken = new Date(
    takenDate.getFullYear(),
    takenDate.getMonth(),
    takenDate.getDate(),
  ).getTime();
  const startOfNow = new Date(
    nowDate.getFullYear(),
    nowDate.getMonth(),
    nowDate.getDate(),
  ).getTime();
  const diffDays = Math.round(
    (startOfNow - startOfTaken) / (24 * 60 * 60 * 1000),
  );

  if (diffDays < 0) return "Just now";
  if (diffDays >= 30) {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? "month" : "months"} ago`;
  }
  if (diffDays >= 1) {
    return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
  }

  const elapsedMs = Math.max(0, now - takenAt);
  if (elapsedMs < 60_000) return "Just now";

  const elapsedMinutes = Math.floor(elapsedMs / 60_000);
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  const remainingMinutes = elapsedMinutes % 60;

  if (elapsedHours === 0) {
    return `${elapsedMinutes} ${elapsedMinutes === 1 ? "minute" : "minutes"} ago`;
  }
  if (remainingMinutes === 0) {
    return `${elapsedHours} ${elapsedHours === 1 ? "hour" : "hours"} ago`;
  }
  return `${elapsedHours} hr ${remainingMinutes} min ago`;
};

const getLeadTakenFilterMatches = (row, scheduleNow, option, range) => {
  if (!option || option.value === "all") return true;

  const takenAt = Number(row?.leadTakenAt);
  if (!Number.isFinite(takenAt)) return false;

  const now = new Date(scheduleNow);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDay = (date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const endOfDay = (date) => startOfDay(date) + 86400000 - 1;

  let start;
  let end = endOfDay(today);

  switch (option.value) {
    case "today":
      start = startOfDay(today);
      break;
    case "yesterday": {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      start = startOfDay(yesterday);
      end = endOfDay(yesterday);
      break;
    }
    case "last-7-days":
      start = new Date(today).setDate(today.getDate() - 6);
      break;
    case "last-30-days":
      start = new Date(today).setDate(today.getDate() - 29);
      break;
    case "this-month":
      start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      break;
    case "last-month":
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
      end = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59,
        999,
      ).getTime();
      break;
    case "custom": {
      if (!range?.start || !range?.end) return false;

      const first = parseBsDateTime(range.start, "00:00:00");
      const second = parseBsDateTime(range.end, "23:59:59");
      if (!Number.isFinite(first) || !Number.isFinite(second)) return false;

      start = Math.min(first, second);
      end = Math.max(first, second);
      break;
    }
    default:
      return true;
  }

  return takenAt >= start && takenAt <= end;
};

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

const isPreviewValue = (value) =>
  value !== null &&
  value !== undefined &&
  value !== "" &&
  (!Array.isArray(value) || value.some(isPreviewValue));

const pick = (source, keys) => {
  for (const key of keys) {
    if (isPreviewValue(source?.[key])) return source[key];
  }
  return undefined;
};

const normalizeContractRow = (record) => {
  if (!record || typeof record !== "object") return null;
  const lead =
    (Array.isArray(record.leadDetails) && record.leadDetails[0]) ||
    record.lead ||
    {};
  const details = Array.isArray(record.details) ? record.details : [];
  const organization =
    (Array.isArray(record.organizationDetails) &&
      record.organizationDetails[0]) ||
    (record.organization && typeof record.organization === "object"
      ? record.organization
      : {});
  const ownership =
    (Array.isArray(record.ownershipDetails) && record.ownershipDetails[0]) ||
    record.ownership ||
    {};
  const providedLeadTakenAt = record.leadTakenAt;
  const leadTakenAt =
    providedLeadTakenAt !== undefined &&
      providedLeadTakenAt !== null &&
      providedLeadTakenAt !== ""
      ? Number(providedLeadTakenAt)
      : parseBsDateTime(
        ownership.LeadPickDate || lead.LeadPickDate,
        ownership.LeadPickTime || lead.LeadPickTime,
      );
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
    leadTakenAt,
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
    provinceName:
      record.provinceName ||
      lead.provinceName ||
      organization.provinceName ||
      "",
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
  const lead = row.leadDetails?.[0] || row.lead || {};
  const baseOrganization =
    row.organizationDetails?.[0] ||
    (row.organization && typeof row.organization === "object"
      ? row.organization
      : {});
  const ownership = row.ownershipDetails?.[0] || row.ownership || {};
  const organization = {
    ...baseOrganization,
    organizationName:
      baseOrganization.organizationName ||
      row.organizationName ||
      row.organization ||
      "",
    orgEmail: baseOrganization.orgEmail || row.orgEmail || "",
    contactPersonName: baseOrganization.contactPersonName || row.contact || "",
    contactPersonEmail:
      baseOrganization.contactPersonEmail || row.contactPersonEmail || "",
    contactPersonNumber: baseOrganization.contactPersonNumber || row.phone || "",
  };

  return {
    ...row,
    id: row?._id,
    lead,
    leadDetails:
      Array.isArray(row.leadDetails) && row.leadDetails.length
        ? row.leadDetails
        : [lead],
    organization,
    organizationDetails: [
      organization,
      ...(Array.isArray(row.organizationDetails)
        ? row.organizationDetails.slice(1)
        : []),
    ],
    ownership,
    ownershipDetails:
      Array.isArray(row.ownershipDetails) && row.ownershipDetails.length
        ? row.ownershipDetails
        : [ownership],
  };
};

// [label, icon, (row) => value]
const PREVIEW_SECTIONS = [
  {
    title: "Organization Information",
    icon: Building2,
    fields: [
      [
        "Organization Name",
        Building2,
        (r) => pick(r.organization, ["organizationName"]),
      ],
      [
        "Organization Type",
        Tag,
        (r) => pick(r.organization, ["organizationType"]),
      ],
      [
        "Industry Type",
        Factory,
        (r) => pick(r.organization, ["industyType", "industryType"]),
      ],
      [
        "Registration Number",
        Hash,
        (r) => pick(r.organization, ["registrationNumber"]),
      ],
      ["VAT / PAN", Receipt, (r) => pick(r.organization, ["vatPan"])],
      ["Standard", ShieldCheck, (r) => pick(r.organization, ["standard"])],
      ["Org Telephone", Phone, (r) => pick(r.organization, ["orgTelephone"])],
      ["Org Email", Mail, (r) => pick(r.organization, ["orgEmail"])],
      [
        "Province Number",
        MapPin,
        (r) => pick(r.organization, ["provinceNumber"]),
      ],
      ["Province", MapPin, (r) => pick(r.organization, ["provinceName"])],
      ["District", MapPin, (r) => pick(r.organization, ["districtName"])],
      ["Local Level", MapPin, (r) => pick(r.organization, ["localLevel"])],
      [
        "Total Employees / Learners",
        Users,
        (r) => pick(r.organization, ["totalEmp_learners"]),
      ],
      [
        "Employee Range",
        UsersRound,
        (r) => pick(r.organization, ["employeeRange"]),
      ],
      [
        "Contact Person Name",
        UserRound,
        (r) => pick(r.organization, ["contactPersonName"]),
      ],
      ["Role", BriefcaseBusiness, (r) => pick(r.organization, ["role"])],
      [
        "Contact Person Number",
        Phone,
        (r) => pick(r.organization, ["contactPersonNumber"]),
      ],
      [
        "Contact Person Email",
        Mail,
        (r) => pick(r.organization, ["contactPersonEmail"]),
      ],
    ],
  },
  {
    title: "Lead Information",
    icon: IdCard,
    fields: [
      ["Lead ID", IdCard, (r) => pick(r.lead, ["leadID"])],
      ["Lead Type", Flame, (r) => pick(r.lead, ["leadType"])],
      ["Lead Source", Share2, (r) => pick(r.lead, ["leadSource"])],
      ["Lead Channel", MessageCircle, (r) => pick(r.lead, ["leadChannel"])],
      ["Campaign Name", Megaphone, (r) => pick(r.lead, ["campaignName"])],
      [
        "Interested Services",
        Package,
        (r) => pick(r.lead, ["ProductInterested"]),
      ],
      ["Province Number", MapPin, (r) => pick(r.lead, ["provinceNumber"])],
      ["Province Name", MapPin, (r) => pick(r.lead, ["provinceName"])],
      ["District Name", MapPin, (r) => pick(r.lead, ["districtName"])],
      ["Local Level Name", MapPin, (r) => pick(r.lead, ["localLevel"])],
      ["Sales Manager", UserCheck, (r) => pick(r.lead, ["salesManager"])],
      ["Notes", StickyNote, (r) => pick(r.lead, ["notes"])],
    ],
  },
  {
    title: "Alternative Contacts",
    icon: Users,
    fields: (r) => {
      const contacts = r.organization?.alternativeContacts;

      if (!Array.isArray(contacts)) return [];

      return contacts.map((contact, index) => [
        `Alternative Contact ${index + 1}`,
        Users,
        () => contact,
      ]);
    },
  },
  {
    title: "Ownership Information",
    icon: UserCheck,
    fields: [
      [
        "Assigned Sales Rep",
        UserCheck,
        (r) =>
          pick(r.ownership, ["assignedSalesRep"]) ??
          pick(r.lead, ["assignedSalesRep"]) ??
          pick(r.details, ["assignedSalesRep"]),
      ],
      [
        "Sales Manager",
        UserCheck,
        (r) =>
          pick(r.ownership, ["salesManager"]) ??
          pick(r.lead, ["salesManager"]) ??
          pick(r.details, ["salesManager"]),
      ],
      [
        "Lead Pick Date",
        CalendarDays,
        (r) =>
          pick(r.ownership, ["LeadPickDate"]) ??
          pick(r.lead, ["LeadPickDate"]) ??
          pick(r.details, ["LeadPickDate"]),
      ],
      [
        "Lead Pick Time",
        Clock,
        (r) =>
          pick(r.ownership, ["LeadPickTime"]) ??
          pick(r.lead, ["LeadPickTime"]) ??
          pick(r.details, ["LeadPickTime"]),
      ],
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
  const { role, id } = useMe?.data?.user?.decoded || {};
  const { GetAllOrganizationDetails_, GetMeDetails_ } = useGet({
    currentUser: { role },
    isAuthLoading: useMe.isLoading,
  });
  const { EditSalesLead_ } = useEdit();
  const { DeleteSalesLead_ } = UseDelete();
  const {
    data: salesData,
    isPending: salesLoading,
    error: salesError,
  } = GetAllOrganizationDetails_;
  const [locationDetails, setLocationDetails] = useState({
    province: "",
    provinceName: "",
    districtName: "",
    localLevel: "",
  });
  const [locationDetailsError, setLocationDetailsError] = useState(null);

  useEffect(() => {
    if (!id) return;

    let active = true;

    const fetchData = async () => {
      setLocationDetailsError(null);

      try {
        const { data } = await GetMeDetails_.mutateAsync({
          params: { id },
        });
        if (!active) return;

        const location = {
          province: Number(data?.province) || "",
          provinceName: data?.provinceName || "",
          districtName: data?.districtName || "",
          localLevel: data?.localLevel || data?.localLevelName || "",
        };
        setLocationDetails(location);

        try {
          await GetAllOrganizationDetails_.mutateAsync(location);
        } catch (salesFetchError) {
          if (active) {
            console.error(
              "Failed to fetch contract sales data:",
              salesFetchError,
            );
          }
        }
      } catch (locationFetchError) {
        if (active) {
          setLocationDetailsError(locationFetchError);
          console.error(
            "Failed to fetch user location details:",
            locationFetchError,
          );
        }
      }
    };

    fetchData();

    return () => {
      active = false;
      GetAllOrganizationDetails_.reset();
    };
  }, [
    GetAllOrganizationDetails_.mutateAsync,
    GetAllOrganizationDetails_.reset,
    GetMeDetails_.mutateAsync,
    id,
  ]);

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
    useMe.isLoading ||
    GetMeDetails_.isPending ||
    (!Array.isArray(contracts) && salesLoading);
  const pageError = error || locationDetailsError || salesError;

  const [items, setItems] = useState(sourceRows);
  useEffect(() => {
    setItems(sourceRows);
  }, [sourceRows]);

  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    organization: null,
    service: null,
    leadTaken: LEAD_TAKEN_OPTIONS[0],
    leadTakenRange: { start: "", end: "" },
  });
  const [sort, setSort] = useState({ key: "leadId", dir: "asc" });
  const [scheduleNow, setScheduleNow] = useState(Date.now);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [showStats, setShowStats] = useState(true);

  const [preview, setPreview] = useState(null); // contract id
  const [drawerContract, setDrawerContract] = useState(null); // opens drawer first
  const [activeDrawerTab, setActiveDrawerTab] = useState("installment"); // "installment" | "terms" | "contract"
  const [tabBusy, setTabBusy] = useState(false);
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

  useEffect(() => {
    const interval = window.setInterval(
      () => setScheduleNow(Date.now()),
      60000,
    );
    return () => window.clearInterval(interval);
  }, []);

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

  const stats = useMemo(() => {
    return [
      {
        label: "Total Contracts",
        value: rows.length,
        hint: "All contracts",
        icon: FileSignature,
        tone: "bg-orange-50 text-orange-600",
      },
      {
        label: "New Contracts",
        value: tabCounts.contract,
        hint: "Active contracts",
        icon: BadgeCheck,
        tone: "bg-amber-50 text-amber-600",
      },
      {
        label: "Converted",
        value: tabCounts.converted,
        hint: "Converted to business",
        icon: UsersRound,
        tone: "bg-emerald-50 text-emerald-600",
      },
      {
        label: "Terminated",
        value: tabCounts.terminated,
        hint: "Terminated contracts",
        icon: AlertTriangle,
        tone: "bg-slate-100 text-slate-600",
      },
    ];
  }, [rows.length, tabCounts]);

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

  const filteredRows = useMemo(() => {
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
        (!filters.service || r.service === filters.service.value) &&
        getLeadTakenFilterMatches(
          r,
          scheduleNow,
          filters.leadTaken,
          filters.leadTakenRange,
        ),
    );
  }, [tabRows, search, filters, scheduleNow]);

  const sortedRows = useMemo(() => {
    const valueOf = (row) => {
      switch (sort.key) {
        case "organizationName":
          return row.organizationName || "";
        case "service":
          return row.service || "";
        case "leadTaken":
          return Number(row.leadTakenAt) || 0;
        case "status":
          return row.status || "";
        default:
          return row.leadId || "";
      }
    };
    const direction = sort.dir === "asc" ? 1 : -1;

    return [...filteredRows].sort((a, b) => {
      const x = valueOf(a);
      const y = valueOf(b);
      const result =
        typeof x === "number" && typeof y === "number"
          ? x - y
          : String(x).localeCompare(String(y), undefined, {
            numeric: true,
            sensitivity: "base",
          });
      return result * direction;
    });
  }, [filteredRows, sort]);

  const filtered = sortedRows;

  const hasFilters = Boolean(
    search ||
    filters.organization ||
    filters.service ||
    (filters.leadTaken && filters.leadTaken.value !== "all") ||
    filters.leadTakenRange.start ||
    filters.leadTakenRange.end,
  );
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
  const updateLeadTakenFilter = (option) => {
    setFilters((previous) => ({
      ...previous,
      leadTaken: option || LEAD_TAKEN_OPTIONS[0],
      leadTakenRange:
        option?.value === "custom"
          ? previous.leadTakenRange
          : { start: "", end: "" },
    }));
    resetView();
  };
  const clearFilters = () => {
    setSearch("");
    setFilters({
      organization: null,
      service: null,
      leadTaken: LEAD_TAKEN_OPTIONS[0],
      leadTakenRange: { start: "", end: "" },
    });
    resetView();
  };
  const toggleSort = (key) => {
    setSort((current) =>
      current.key === key
        ? { key, dir: current.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
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
    setDrawerContract(null);
    if (contract) setForm({ contract });
  };

  // 1. Open drawer first
  const openDrawer = (contract) => {
    const row = normalizeContractRow(contract) || contract;
    if (!row?.mainID) {
      notify(
        "error",
        "This contract is missing its backend ID and cannot be opened.",
      );
      return;
    }
    setPreview(null);
    setDrawerContract(row);
    setActiveDrawerTab("installment");
    setTabBusy(false);
  };

  // 2. Switch tab inside the open drawer
  const selectDrawerTab = (tabKey) => {
    if (tabBusy) return;
    if (!DRAWER_TABS.some((t) => t.key === tabKey)) return;
    setActiveDrawerTab(tabKey);
  };

  const closeDrawer = () => {
    setDrawerContract(null);
    setActiveDrawerTab("installment");
    setTabBusy(false);
  };

  const askDelete = (ids) => {
    const one = ids.length === 1 ? rows.find((r) => r.id === ids[0]) : null;
    setPreview(null);
    setDrawerContract(null);
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
      await GetAllOrganizationDetails_.mutateAsync(locationDetails);
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
    setDrawerContract(null);
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
      await GetAllOrganizationDetails_.mutateAsync(locationDetails);
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
        await GetAllOrganizationDetails_.mutateAsync(locationDetails);
      },
      `${plural(ids.length, "Contract", "Contracts")} deleted successfully.`,
      "Unable to delete.",
    );
    if (ok) {
      setConfirm(null);
      setSelected((p) => p.filter((id) => !ids.includes(id)));
    }
  };

  const previewSections = useMemo(() => {
    if (!previewRow) return [];

    const previewData = leadFormRecord(previewRow);

    previewData.details = Array.isArray(previewRow.details)
      ? previewRow.details[0] || {}
      : previewRow.details || {};

    return PREVIEW_SECTIONS.map((sec) => {
      const sectionFields =
        typeof sec.fields === "function" ? sec.fields(previewData) : sec.fields;
      const filteredFields =
        sec.title === "Organization Information"
          ? sectionFields.filter(([text]) => {
            if (text === "Employee Range") {
              const standard = String(
                pick(previewData.organization, ["standard"]) || "",
              )
                .toLowerCase()
                .replace(/[\s_-]/g, "");

              return standard !== "iso21001";
            }

            return true;
          })
          : sectionFields;
      return {
        ...sec,
        rows: (Array.isArray(filteredFields) ? filteredFields : []).map(
          ([text, icon, get]) => ({
            text,
            icon,
            value:
              typeof get === "function"
                ? get(previewData, scheduleNow)
                : undefined,
          }),
        ),
      };
    });
  }, [previewRow, scheduleNow]);

  /* -------------------------------- Render ------------------------------- */

  return (
    <MotionConfig reducedMotion="user">
      <div className="cp-scroll w-full bg-white font-['Roboto_Slab',serif] text-xs text-slate-800">
        <style>{SCROLL_CSS}</style>
        <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
          {/* Header */}
          <header className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm sm:h-11 sm:w-11 ${BRAND}`}
              >
                <FileSignature size={20} aria-hidden="true" />
              </span>

              <div className="min-w-0">
                <h1 className="truncate text-lg font-extrabold text-slate-900 sm:text-xl">
                  Contracts
                </h1>
                <nav
                  aria-label="Breadcrumb"
                  className="mt-0.5 flex items-center gap-1.5 text-[11px]"
                >
                  <span className="font-medium text-slate-800">CRM</span>
                  <ChevronRight
                    size={12}
                    aria-hidden="true"
                    className="text-slate-400"
                  />
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
              className="flex flex-col gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
            >
              <span className="flex min-w-0 items-center gap-2">
                <AlertTriangle
                  size={16}
                  aria-hidden="true"
                  className="shrink-0"
                />
                <span className="break-words">
                  {pageError.message || "Unable to load contracts."}
                </span>
              </span>
              {onRetry ? (
                <button
                  type="button"
                  onClick={onRetry}
                  disabled={loading}
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 self-start font-semibold underline disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
                >
                  {loading && (
                    <LoaderCircle
                      className="h-3 w-3 animate-spin text-red-600"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    />
                  )}
                  Retry
                </button>
              ) : salesError ? (
                <button
                  type="button"
                  onClick={() =>
                    GetAllOrganizationDetails_.mutate(locationDetails)
                  }
                  disabled={loading}
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 self-start font-semibold underline disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
                >
                  {loading && (
                    <LoaderCircle
                      className="h-3 w-3 animate-spin text-red-600"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    />
                  )}
                  Retry
                </button>
              ) : null}
            </div>
          )}

          {/* Status Tabs */}
          <div
            role="tablist"
            aria-label="Contract status"
            className={`-mx-1 flex snap-x snap-proximity gap-1.5 overflow-x-auto overscroll-x-contain scroll-px-1 px-1 pb-1 md:mx-0 md:flex-wrap md:snap-none md:overflow-visible md:px-0 md:pb-0 lg:gap-2 ${NO_SCROLLBAR}`}
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
                  className={`inline-flex min-h-10 flex-1 shrink-0 cursor-pointer snap-start items-center justify-center gap-2 whitespace-nowrap rounded-lg border px-3 text-xs font-semibold transition sm:flex-none sm:px-3.5 md:min-h-9 lg:px-4 lg:text-[13px] ${FOCUS} ${active
                      ? `${BRAND} border-transparent text-white shadow-sm`
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  {t.label}
                  <span
                    className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-px text-[10px] font-bold tabular-nums ${active
                        ? "bg-white/25 text-white"
                        : "bg-slate-100 text-slate-500"
                      }`}
                  >
                    {loading ? (
                      <LoaderCircle
                        className="h-3 w-3 animate-spin text-current"
                        strokeWidth={2.5}
                      />
                    ) : (
                      tabCounts[t.key]
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Overview */}
          <section aria-label="Contract overview" className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <h2 className="shrink-0 text-sm font-extrabold text-slate-900 sm:text-base">
                  Overview
                </h2>
                {loading ? (
                  <Skeleton className="h-3 w-24 rounded-full" />
                ) : (
                  <span className="truncate text-xs font-medium tabular-nums text-slate-400">
                    {`${plural(tabRows.length, "contract", "contracts")} in ${activeTab.label.toLowerCase()}`}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowStats((o) => !o)}
                aria-expanded={showStats}
                className={`inline-flex min-h-9 shrink-0 cursor-pointer items-center gap-1 rounded-lg px-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 sm:min-h-8 ${FOCUS}`}
              >
                {showStats ? "Hide" : "Show"}
                <ChevronDown
                  size={14}
                  aria-hidden="true"
                  className={`transition-transform ${showStats ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            {showStats && (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                {loading
                  ? Array.from({ length: Math.max(1, stats.length) }, (_, i) => (
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
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_200px_200px_200px_auto] lg:items-center">
                <div className="relative sm:col-span-2 lg:col-span-1">
                  <Search
                    size={16}
                    aria-hidden="true"
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
                    className={`${INPUT} pl-9`}
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
                <Select
                  isClearable={false}
                  isSearchable={false}
                  aria-label="Filter by lead taken time"
                  components={animatedComponents}
                  options={LEAD_TAKEN_OPTIONS}
                  value={filters.leadTaken}
                  onChange={updateLeadTakenFilter}
                  placeholder="All Time"
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
                  className={`${BTN_GHOST} sm:col-span-2 lg:col-span-1`}
                >
                  Clear filters
                </button>
              </div>
              {filters.leadTaken?.value === "custom" && (
                <div className="mt-3 flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center">
                  <div className="flex flex-1 flex-col gap-1.5">
                    <label className="text-[11px] font-medium text-slate-400">
                      Start Date (BS)
                    </label>
                    <NepaliDateInput
                      value={filters.leadTakenRange.start}
                      placeholder="Select Start Date"
                      onDateChange={(date) => {
                        const start = date
                          ? typeof date === "string"
                            ? date
                            : `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.date).padStart(2, "0")}`
                          : "";
                        setFilters((previous) => ({
                          ...previous,
                          leadTakenRange: {
                            ...previous.leadTakenRange,
                            start,
                          },
                        }));
                        resetView();
                      }}
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5">
                    <label className="text-[11px] font-medium text-slate-400">
                      End Date (BS)
                    </label>
                    <NepaliDateInput
                      value={filters.leadTakenRange.end}
                      placeholder="Select End Date"
                      onDateChange={(date) => {
                        const end = date
                          ? typeof date === "string"
                            ? date
                            : `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.date).padStart(2, "0")}`
                          : "";
                        setFilters((previous) => ({
                          ...previous,
                          leadTakenRange: {
                            ...previous.leadTakenRange,
                            end,
                          },
                        }));
                        resetView();
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <ContractsTable
                rows={pageRows}
                startIndex={(current - 1) * PER_PAGE}
                sort={sort}
                onSort={toggleSort}
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
                onSendContract={openDrawer}
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
            </div>

            {/* Pagination */}
            <div className="flex flex-col justify-between gap-3 border-t border-slate-200 px-3 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:px-4">
              {loading ? (
                <Skeleton className="h-4 w-44" />
              ) : (
                <span className="tabular-nums">
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
                  <ChevronLeft size={15} aria-hidden="true" /> Previous
                </PageButton>
                <span className="px-2 text-xs font-semibold tabular-nums text-slate-600">
                  Page {current} of {totalPages}
                </span>
                <PageButton
                  disabled={loading || current >= totalPages}
                  onClick={() => setPage(current + 1)}
                >
                  Next <ChevronRight size={15} aria-hidden="true" />
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
                <span className="text-xs font-semibold tabular-nums text-slate-600">
                  {selected.length} selected
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => askDelete(selected)}
                    aria-label="Delete selected"
                    className={`${BTN_DANGER_OUTLINE} min-h-9`}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelected([])}
                    aria-label="Clear selection"
                    className={ICON_BTN}
                  >
                    <X size={16} aria-hidden="true" />
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
              id="preview-drawer"
              icon={<Settings size={18} aria-hidden="true" />}
              size="xl"
              eyebrow="Contract details"
              title={previewRow.title || previewRow.service}
              subtitle={previewRow.id}
              onClose={() => setPreview(null)}
            >
              <div className="space-y-3 sm:space-y-4">
                {previewSections.map(
                  ({ title, icon: SectionIcon, rows: fields }, s) => (
                    <section key={title} className={`${CARD} overflow-hidden !p-0`}>
                      <h3 className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-medium text-slate-500">
                        <SectionIcon
                          size={14}
                          aria-hidden="true"
                          className="text-amber-600"
                        />
                        {title}
                      </h3>
                      <dl className="grid grid-cols-1 divide-y divide-slate-100 px-4 sm:grid-cols-2 sm:gap-x-6 sm:divide-y-0">
                        {fields.map((r, k) => {
                          // Alternative Contact object rendering
                          if (
                            r.text.startsWith("Alternative Contact") &&
                            r.value &&
                            typeof r.value === "object"
                          ) {
                            const contact = r.value;

                            const details = [
                              ["Name", UserRound, contact?.name],
                              ["Role", BriefcaseBusiness, contact?.role],
                              ["Phone Number", Phone, contact?.number],
                              ["Email", Mail, contact?.email],
                            ];

                            return (
                              <div key={r.text} className="col-span-full py-3">
                                <p className="mb-2 text-xs font-bold text-slate-600">
                                  {r.text}
                                </p>
                                <dl className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                                  {details.map(([label, Icon, value], j) => (
                                    <DetailRow
                                      key={label}
                                      icon={Icon}
                                      label={label}
                                      value={displayDetailValue(value)}
                                      delay={0.15 + s * 0.08 + j * 0.04}
                                    />
                                  ))}
                                </dl>
                              </div>
                            );
                          }

                          return (
                            <DetailRow
                              key={r.text}
                              icon={r.icon}
                              label={r.text}
                              value={displayDetailValue(r.value)}
                              delay={0.15 + s * 0.08 + k * 0.04}
                            />
                          );
                        })}
                      </dl>
                    </section>
                  ),
                )}
              </div>
            </SideDrawer>
          )}
        </AnimatePresence>

        {/* Drawer with Tabs: [installment, terms, contract] */}
        <AnimatePresence>
          {drawerContract && (
            <SideDrawer
              key="contract-tabs-drawer"
              id="contract-tabs-drawer"
              size="3xl"
              title={drawerContract.organizationName || "Contract"}
              subtitle={drawerContract.mainID}
              onClose={closeDrawer}
              locked={tabBusy}
              scrollResetKey={activeDrawerTab}
              tabs={
                <DrawerTabs
                  idPrefix="contract"
                  label="Contract drawer tabs"
                  tabs={DRAWER_TABS}
                  active={activeDrawerTab}
                  onChange={selectDrawerTab}
                  disabled={tabBusy}
                />
              }
            >
              {/* Re-key on contract change so each tab starts with fresh state */}
              <div key={drawerContract.mainID}>
                <DrawerPanel
                  idPrefix="contract"
                  tabKey="installment"
                  active={activeDrawerTab === "installment"}
                >
                  <InstallmentDrawer
                    embedded
                    contract={drawerContract}
                    onBusyChange={setTabBusy}
                  />
                </DrawerPanel>
                <DrawerPanel
                  idPrefix="contract"
                  tabKey="terms"
                  active={activeDrawerTab === "terms"}
                >
                  <TermsAndConditionsDrawer
                    embedded
                    contract={drawerContract}
                    onBusyChange={setTabBusy}
                  />
                </DrawerPanel>
                <DrawerPanel
                  idPrefix="contract"
                  tabKey="contract"
                  active={activeDrawerTab === "contract"}
                >
                  <ContractEmailDrawer
                    embedded
                    open
                    contract={drawerContract}
                    normalizeContractRow={normalizeContractRow}
                    notify={notify}
                    setPreview={setPreview}
                    convertContractToBusiness={convertContractToBusiness}
                    onBusyChange={setTabBusy}
                  />
                </DrawerPanel>
              </div>
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
                onUpdate={saveContract}
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
              id={leadFormRecord(credentialRow).id}
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
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${statusChangeConfirmation.nextStatus === "terminated"
                        ? "bg-red-50 text-red-500"
                        : "bg-amber-50 text-amber-600"
                      }`}
                  >
                    {statusChangeConfirmation.nextStatus === "terminated" ? (
                      <AlertTriangle size={20} aria-hidden="true" />
                    ) : statusChangeConfirmation.nextStatus === "converted" ? (
                      <BadgeCheck size={20} aria-hidden="true" />
                    ) : (
                      <FileSignature size={20} aria-hidden="true" />
                    )}
                  </span>

                  <div className="min-w-0">
                    <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                      Change contract status?
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
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
                      className="mb-1.5 block text-xs font-bold text-slate-900"
                    >
                      Termination reason{" "}
                      <span className="font-extrabold text-red-600">*</span>
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
                      className="w-full cursor-text rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    {terminationReasonError && (
                      <p
                        id="termination-reason-error"
                        className="mt-1 text-xs font-medium text-red-700"
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
                          className={`cursor-pointer rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-left text-[11px] font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`}
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
                    className={`${BTN_SECONDARY} px-4`}
                  >
                    Cancel
                  </button>

                  {statusChangeConfirmation.nextStatus === "terminated" ? (
                    <button
                      type="button"
                      onClick={confirmContractStatusChange}
                      disabled={statusUpdating}
                      className={`${BTN_DANGER} px-4`}
                    >
                      {statusUpdating && (
                        <LoaderCircle
                          className="h-3 w-3 animate-spin text-white"
                          strokeWidth={2.5}
                          aria-hidden="true"
                        />
                      )}
                      Confirm terminate
                    </button>
                  ) : (
                    <PrimaryButton
                      onClick={confirmContractStatusChange}
                      disabled={statusUpdating}
                      className="px-4"
                    >
                      {statusUpdating && (
                        <LoaderCircle
                          className="h-3 w-3 animate-spin text-white"
                          strokeWidth={2.5}
                          aria-hidden="true"
                        />
                      )}
                      {statusChangeConfirmation.nextStatus === "contract"
                        ? "Confirm reschedule"
                        : "Confirm convert"}
                    </PrimaryButton>
                  )}
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
                  <AlertTriangle size={20} aria-hidden="true" />
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
                  className={`${BTN_SECONDARY} px-4`}
                >
                  Keep {confirm.ids.length === 1 ? "contract" : "contracts"}
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={busy}
                  className={`${BTN_DANGER} px-4`}
                >
                  {busy && (
                    <LoaderCircle
                      className="h-3 w-3 animate-spin text-white"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    />
                  )}
                  Delete
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
          <Icon size={18} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 truncate text-[10px] font-medium leading-3 text-slate-400">
        {hint}
      </p>
    </motion.div>
  );
}

function PageButton({ children, ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-9 cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Primary action: brand gradient, bold white text, spring hover/tap.
function PrimaryButton({ children, className = "", disabled, ...props }) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className={`${BTN} ${BRAND} font-bold text-white shadow-sm ${className}`}
      {...props}
    >
      {children}
    </motion.button>
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
        <Icon size={16} aria-hidden="true" />
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
        className={`absolute inset-0 bg-black/60 ${locked ? "cursor-not-allowed" : "cursor-pointer"}`}
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
        className={`relative flex max-h-[calc(100dvh-1.5rem)] w-full ${size} flex-col overflow-hidden rounded-2xl shadow-2xl sm:max-h-[90vh] ${title ? "bg-slate-50" : "bg-white p-4 sm:p-5"
          }`}
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
                <p className="mt-1 truncate text-xs font-medium text-slate-400">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={close}
              disabled={locked}
              aria-label="Close"
              className={ICON_BTN}
            >
              <X size={18} aria-hidden="true" />
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

function SideDrawer({
  id,
  onClose,
  icon,
  eyebrow,
  title,
  subtitle,
  size = "md",
  footer,
  tabs,
  scrollResetKey,
  locked = false,
  children,
}) {
  const titleId = useId();
  const bodyRef = useRef(null);
  const close = () => {
    if (!locked) onClose();
  };
  useEscape(close);
  useBodyLock();

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [scrollResetKey]);

  return (
    <div id={id} className="fixed inset-0 z-[100] flex justify-end">
      <motion.div
        aria-hidden="true"
        onClick={close}
        className={`absolute inset-0 bg-black/60 ${locked ? "cursor-not-allowed" : "cursor-pointer"}`}
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
        className={`relative flex h-full w-full max-w-full flex-col bg-white shadow-2xl ${DRAWER_WIDTH[size]}`}
      >
        <header
          className={`relative flex shrink-0 items-start gap-3 bg-white px-4 py-3 pr-12 sm:px-5 sm:py-4 sm:pr-14 ${tabs ? "" : "border-b border-slate-200"
            }`}
        >
          {icon && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              {icon}
            </div>
          )}

          <div className="min-w-0">
            {eyebrow && (
              <p className="truncate text-[11px] font-extrabold text-amber-600">
                {eyebrow}
              </p>
            )}
            <h2
              id={titleId}
              className="truncate text-sm font-bold text-slate-900 sm:text-base"
              title={title}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                className="mt-0.5 truncate font-mono text-[11px] font-medium text-slate-800"
                title={String(subtitle)}
              >
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={close}
            disabled={locked}
            aria-label="Close panel"
            className={`absolute right-3 top-3 cursor-pointer rounded-lg p-2 text-slate-500 transition hover:bg-amber-50 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        {tabs && (
          <div className="shrink-0 border-b border-slate-200 bg-white px-4 sm:px-5">
            {tabs}
          </div>
        )}

        <div
          ref={bodyRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-50 p-3 sm:p-5"
        >
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

// Underline tabs: equal-width on phones, compact and left-aligned from sm up.
// Arrow keys, Home and End move between tabs (roving tabindex).
function DrawerTabs({
  tabs,
  active,
  onChange,
  disabled = false,
  idPrefix,
  label,
}) {
  const uid = useId();
  const refs = useRef({});

  const onKeyDown = (e) => {
    const i = tabs.findIndex((t) => t.key === active);
    let next = null;
    if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    if (next === null) return;
    e.preventDefault();
    const key = tabs[next].key;
    onChange(key);
    refs.current[key]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={`-mb-px flex w-full overflow-x-auto sm:gap-6 ${NO_SCROLLBAR}`}
    >
      {tabs.map((t) => {
        const isActive = t.key === active;
        return (
          <button
            key={t.key}
            ref={(el) => {
              refs.current[t.key] = el;
            }}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${t.key}`}
            aria-controls={`${idPrefix}-panel-${t.key}`}
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(t.key)}
            disabled={disabled}
            className={`relative inline-flex h-11 flex-1 cursor-pointer items-center justify-center whitespace-nowrap px-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500/40 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:px-0.5 ${isActive
                ? "text-amber-600"
                : "text-slate-500 hover:text-slate-800"
              }`}
          >
            {t.label}
            {isActive && (
              <motion.span
                layoutId={`${uid}-tab-indicator`}
                aria-hidden="true"
                className={`absolute inset-x-0 bottom-0 h-0.5 rounded-full ${BRAND}`}
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// Panels stay mounted (so forms keep their state) and are only hidden.
function DrawerPanel({ idPrefix, tabKey, active, children }) {
  return (
    <motion.div
      role="tabpanel"
      id={`${idPrefix}-panel-${tabKey}`}
      aria-labelledby={`${idPrefix}-tab-${tabKey}`}
      hidden={!active}
      initial={false}
      animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}