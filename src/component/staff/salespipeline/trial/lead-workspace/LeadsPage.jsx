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
import NepaliDate from "nepali-date-converter";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  UserRound,
  UserPlus,
  Eye,
  Trash2,
  CalendarPlus,
  FileText,
  X,
  Pencil,
  BadgeCheck,
  AlertTriangle,
  Loader2,
  Building2,
  Tag,
  Factory,
  Hash,
  Receipt,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Map,
  Users,
  UsersRound,
  Briefcase,
  Smartphone,
  Flame,
  Share2,
  MessageCircle,
  UserCheck,
  Package,
  StickyNote,
  Clock,
  CalendarClock,
  Landmark,
  IdCard,
  Ban,
} from "lucide-react";

import { useGet } from "../../../../hooks/useGet";
import { useAuth } from "../../../../hooks/useAuth";
import { useEdit } from "../../../../hooks/useEdit";
import { UseDelete } from "../../../../hooks/useDelete";

import LeadFormStepper from "./newLeadForms";
import Meetings from "./Meetings";
import Proposal from "./Proposal";

import {
  SuccessNotify,
  waitingNotify,
  ErrorNotify,
  dismissWaitingNotify,
} from "../../../../hotToaster";
import NepaliDateInput from "../../../../nepalidate/testDate";

const animatedComponents = makeAnimated();

/* ------------------------------ Constants -------------------------------- */

const PER_PAGE = 10;
const STATUSES = ["New", "Contracted", "Terminated"];
const STATUS_META = {
  New: { pill: "bg-amber-50 text-amber-700" },
  Contracted: { pill: "bg-emerald-50 text-emerald-700" },
  Terminated: { pill: "bg-red-50 text-red-700" },
};
const LEAD_STATUS_OPTIONS = [
  { value: "new", label: "New", dot: "bg-amber-500" },
  { value: "contract", label: "Contract", dot: "bg-amber-500" },
  { value: "terminated", label: "Terminated", dot: "bg-slate-500" },
];
const LEAD_STATUS_COLORS = {
  new: { background: "#FFFBEB", foreground: "#B45309" },
  contract: { background: "#FFFBEB", foreground: "#B45309" },
  terminated: { background: "#F1F5F9", foreground: "#334155" },
};
const leadStatusSelectStyles = {
  container: (base) => ({ ...base, width: 140, maxWidth: "100%" }),
  control: (base, state) => {
    const status = state.getValue()[0]?.value || "new";
    const colors = LEAD_STATUS_COLORS[status] || LEAD_STATUS_COLORS.new;
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
      : (LEAD_STATUS_COLORS[state.data.value] || LEAD_STATUS_COLORS.new)
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
          LEAD_STATUS_COLORS[state.getValue()[0]?.value] ||
          LEAD_STATUS_COLORS.new
        ).foreground,
    "&:hover": { color: "#0F172A" },
  }),
  indicatorSeparator: () => ({ display: "none" }),
  menuPortal: (base) => ({ ...base, zIndex: 300 }),
  menu: (base) => ({ ...base, overflow: "hidden", borderRadius: 8 }),
  option: (base, state) => ({
    ...base,
    fontWeight: 500,
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
  { key: "all", label: "All" },
  ...STATUSES.map((status) => ({ key: status, label: status })),
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
const DRAWER_WIDTH = {
  md: "sm:max-w-md",
  lg: "sm:max-w-xl",
  xl: "sm:max-w-2xl",
};
const HIDDEN_KEYS = ["_id", "__v"];

/* --------------------------- Motion constants ---------------------------- */

const BRAND = "bg-gradient-to-r from-amber-500 to-orange-500";
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40";
const NO_SCROLLBAR = "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
const EASE_OUT = [0.22, 1, 0.36, 1];

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
  ["Lead ID", "leadId"],
  ["Organization Name", "organizationName"],
  ["Organization Type", "organizationType"],
  ["Industry", "industry"],
  ["Email", "email"],
  ["Address", "address"],
  ["Interested Services", "services"],
  ["LeadTaken", "leadTaken"],
  ["Proposal", "proposal"],
  ["Follow-up", "followUp"],
  ["Status", "status"],
];

const SEARCH_KEYS = [
  "leadId",
  "organizationName",
  "contactPerson",
  "contactNumber",
  "email",
  "address",
  "organizationType",
  "industry",
  "leadType",
  "source",
  "channel",
  "services",
  "branch",
];

const KEY_LABELS = {
  industyType: "Industry Type",
  ProductInterested: "Interested Products / Services",
  totalEmp_learners: "Total Employees / Learners",
  LeadPickDate: "Lead Pick Date",
  LeadPickTime: "Lead Pick Time",
  NextFollowup: "Next Follow-up Date",
  NextFollowTime: "Next Follow-up Time",
};

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

const first = (list) => list?.[0] || {};
const getLeadId = (lead) => lead?.id || lead?._id;
const getLeadRowId = (lead) => String(lead?.leadDetailsId || getLeadId(lead));
const errMsg = (e, fallback) =>
  e?.response?.data?.message || e?.message || fallback;

const humanizeKey = (key) =>
  KEY_LABELS[key] ||
  String(key)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const isDisplayable = (v) => {
  if (v === null || v === undefined || v === "") return false;
  if (Array.isArray(v)) return v.some(isDisplayable);
  if (typeof v === "object")
    return Object.entries(v).some(
      ([k, x]) => !HIDDEN_KEYS.includes(k) && isDisplayable(x),
    );
  return true;
};

const pick = (obj, keys) => {
  for (const k of keys) if (isDisplayable(obj?.[k])) return obj[k];
  return undefined;
};
const asText = (v) => (Array.isArray(v) ? v.join(", ") : v);

const PREVIEW_SECTIONS = [
  {
    title: "Organization information",
    icon: Building2,
    fields: [
      [
        "Organization Name",
        Building2,
        (p) => pick(p.organization, ["organizationName"]),
      ],
      [
        "Organization Type",
        Tag,
        (p) => pick(p.organization, ["organizationType"]),
      ],
      [
        "Industry Type",
        Factory,
        (p) => pick(p.organization, ["industyType", "industryType"]),
      ],
      [
        "Registration Number",
        Hash,
        (p) => pick(p.organization, ["registrationNumber", "registrationNo"]),
      ],
      [
        "VAT / PAN",
        Receipt,
        (p) => pick(p.organization, ["vatPan", "VatPan", "vatPanNumber"]),
      ],
      [
        "Standard",
        ShieldCheck,
        (p) => pick(p.organization, ["standard", "Standard"]),
      ],
      [
        "Org Telephone",
        Phone,
        (p) =>
          pick(p.organization, [
            "organizationTelephone",
            "orgTelephone",
            "telephone",
          ]),
      ],
      [
        "Org Email",
        Mail,
        (p) => pick(p.organization, ["organizationEmail", "orgEmail", "email"]),
      ],
      [
        "Province Number",
        Landmark,
        (p) => pick(p.organization, ["provinceNumber", "provinceNo"]),
      ],
      ["Province", Map, (p) => pick(p.organization, ["province"])],
      ["District", MapPin, (p) => pick(p.organization, ["district"])],
      ["Local Level", MapPin, (p) => pick(p.organization, ["localLevel"])],
      [
        "Total Employees / Learners",
        Users,
        (p) => pick(p.organization, ["totalEmp_learners"]),
      ],
      [
        "Employee Range",
        UsersRound,
        (p) => pick(p.organization, ["employeeRange", "empRange"]),
      ],
      [
        "Contact Person Name",
        UserRound,
        (p) => pick(p.organization, ["contactPersonName"]),
      ],
      [
        "Role",
        Briefcase,
        (p) =>
          pick(p.organization, ["contactPersonRole", "role", "designation"]),
      ],
      [
        "Contact Person Number",
        Smartphone,
        (p) => pick(p.organization, ["contactPersonNumber"]),
      ],
      [
        "Contact Person Email",
        Mail,
        (p) => pick(p.organization, ["contactPersonEmail"]),
      ],
      ["Address", MapPin, (p) => p.address],
    ],
  },
  {
    title: "Lead information",
    icon: IdCard,
    fields: [
      ["Lead ID", IdCard, (p) => pick(p.lead, ["leadID", "leadId"])],
      ["Lead Type", Flame, (p) => pick(p.lead, ["leadType"])],
      ["Lead Source", Share2, (p) => pick(p.lead, ["leadSource"])],
      ["Lead Channel", MessageCircle, (p) => pick(p.lead, ["leadChannel"])],
      [
        "Assigned Sales Rep",
        UserCheck,
        (p) => pick(p.lead, ["assignedSalesRep"]),
      ],
      [
        "Interested Products / Services",
        Package,
        (p) => asText(pick(p.lead, ["ProductInterested"])),
      ],
      [
        "Province Number",
        Landmark,
        (p) => pick(p.lead, ["provinceNumber", "provinceNo"]),
      ],
      ["Sales Manager", UserRound, (p) => pick(p.lead, ["salesManager"])],
      ["Notes", StickyNote, (p) => pick(p.lead, ["notes", "note", "remarks"])],
    ],
  },
  {
    title: "Ownership information",
    icon: UserCheck,
    fields: [
      [
        "Assigned Sales Rep",
        UserCheck,
        (p) =>
          pick(p.ownership, ["assignedSalesRep"]) ??
          pick(p.lead, ["assignedSalesRep"]),
      ],
      [
        "Sales Manager",
        UserRound,
        (p) =>
          pick(p.ownership, ["salesManager"]) ?? pick(p.lead, ["salesManager"]),
      ],
      [
        "Lead Pick Time",
        Clock,
        (p) =>
          pick(p.ownership, ["LeadPickTime"]) ??
          pick(p.details, ["LeadPickTime"]),
      ],
      [
        "Lead Pick Date",
        CalendarPlus,
        (p) =>
          pick(p.ownership, ["LeadPickDate"]) ??
          pick(p.ownership, ["LeadPickDate"]),
      ],
      [
        "Next Follow-up Time",
        CalendarClock,
        (p) =>
          pick(p.ownership, ["NextFollowTime"]) ??
          pick(p.details, ["NextFollowTime"]),
      ],
    ],
  },
];

const tableValue = (v) => {
  if (v === null || v === undefined || v === "") return "-";
  if (Array.isArray(v)) {
    const parts = v
      .map((item) =>
        item && typeof item === "object"
          ? Object.entries(item)
              .filter(
                ([k, x]) =>
                  !HIDDEN_KEYS.includes(k) &&
                  (x === null || typeof x !== "object"),
              )
              .map(([k, x]) => `${humanizeKey(k)}: ${x}`)
              .join(", ")
          : String(item ?? ""),
      )
      .filter(Boolean);
    return parts.length ? parts.join(", ") : "-";
  }
  return typeof v === "object" ? tableValue([v]) : String(v);
};

const buildAddress = (lead) =>
  [lead.localLevel, lead.district, lead.province].filter(Boolean).join(", ");

const toRow = (item, lead = first(item.leadDetails), leadIndex = 0) => {
  const details = first(item.details);
  const organization = first(item.organizationDetails);
  const ownership =
    item.ownershipDetails?.[leadIndex] || first(item.ownershipDetails);
  const leadOwnership = item.ownershipDetails?.[leadIndex];

  const followUpDate =
    pick(ownership, ["NextFollowup"]) ??
    pick(details, ["NextFollowup"]) ??
    pick(lead, ["NextFollowup"]);
  const followUpTime =
    pick(ownership, ["NextFollowTime"]) ??
    pick(details, ["NextFollowTime"]) ??
    pick(lead, ["NextFollowTime"]);

  const rawIsContracted = lead.isContracted;
  const isContracted = rawIsContracted === true;
  const isTerminated = lead.isTerminated === true;
  const isNew = (lead.isNew ?? true) && !isContracted && !isTerminated;

  return {
    ...item,
    id: item._id,
    _id: item._id,
    mainID: item._id,
    details,
    lead,
    organization,
    ownership,
    leadId: lead.leadID,
    organizationName: organization.organizationName,
    organizationType: organization.organizationType,
    industry: organization.industyType,
    contactPerson: organization.contactPersonName,
    contactNumber: organization.contactPersonNumber,
    email: organization.contactPersonEmail,
    address: buildAddress(lead),
    leadType: lead.leadType,
    source: lead.leadSource,
    channel: lead.leadChannel,
    services: lead.ProductInterested,
    assignedCRO: lead.assignedSalesRep,
    salesManager: lead.salesManager,
    branch: lead.leadTakenBranch,
    leadDetailsId: lead._id,
    leadTakenAt: parseBsDateTime(
      leadOwnership?.LeadPickDate,
      leadOwnership?.LeadPickTime,
    ),
    leadPickDate: leadOwnership?.LeadPickDate,
    leadPickTime: leadOwnership?.LeadPickTime,
    leadPickDateTime: [leadOwnership?.LeadPickDate, leadOwnership?.LeadPickTime]
      .filter(Boolean)
      .join(" "),
    followUpDate,
    followUpTime,
    proposal: countSentProposals({ details }),
    followUp:
      [followUpDate && String(followUpDate).split("T")[0], followUpTime]
        .filter(Boolean)
        .join(" ") || "-",
    isNew,
    isContracted,
    isTerminated,
    rawIsContracted,
    contractStatus: isTerminated
      ? "terminated"
      : isContracted
        ? "contract"
        : "new",
    status: isContracted ? "Contracted" : isTerminated ? "Terminated" : "New",
  };
};

const toLeadRows = (item) => {
  const leads = Array.isArray(item?.leadDetails) ? item.leadDetails : [];
  return leads.length
    ? leads.map((lead, index) => toRow(item, lead, index))
    : [toRow(item, {})];
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

  // Future dates
  if (diffDays < 0) {
    return "Just now";
  }

  // Months
  if (diffDays >= 30) {
    const months = Math.floor(diffDays / 30);

    return `${months} ${months === 1 ? "month" : "months"} ago`;
  }

  // Days
  if (diffDays >= 1) {
    return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
  }

  // Hours and minutes
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

      if (!Number.isFinite(first) || !Number.isFinite(second)) {
        return false;
      }

      start = Math.min(first, second);
      end = Math.max(first, second);

      break;
    }

    default:
      return true;
  }

  return takenAt >= start && takenAt <= end;
};
const getProposalHistory = (lead) => {
  const stage2 = lead?.details?.stages?.Stage2;
  const stages = Array.isArray(stage2) ? stage2 : stage2 ? [stage2] : [];
  return stages.flatMap((stage) =>
    Array.isArray(stage?.proposalInfo) ? stage.proposalInfo : [],
  );
};

const isSentProposal = (proposal) =>
  String(proposal?.status || "").toLowerCase() === "sent";

const countSentProposals = (lead) =>
  getProposalHistory(lead).filter(isSentProposal).length;

const extractSchedulesFromActivityResponse = (response) => {
  const details = Array.isArray(response?.data) ? response.data : [];
  return details
    .flatMap((detail) => {
      const stage1Value = detail?.stages?.Stage1;
      const stages = Array.isArray(stage1Value)
        ? stage1Value
        : stage1Value
          ? [stage1Value]
          : [];
      return stages.flatMap((stage) => [
        ...(Array.isArray(stage?.physicalMeetingSchema)
          ? stage.physicalMeetingSchema
          : []),
        ...(Array.isArray(stage?.virtualMeetingSchema)
          ? stage.virtualMeetingSchema
          : []),
      ]);
    })
    .map(extractScheduleDates)
    .filter(Boolean);
};

const extractScheduleDates = (schedule) => {
  const startDate =
    schedule?.Sdate || schedule?.fromDate || schedule?.date || "";
  const endDate = schedule?.Edate || schedule?.toDate || startDate;
  if (!startDate || !endDate) return null;
  const timeParts =
    typeof schedule?.C_time === "string" ? schedule.C_time.split("/") : [];

  const startDateTime = parseBsDateTime(
    startDate,
    schedule?.fromTime || timeParts[0],
    "00:00",
  );
  const endDateTime = parseBsDateTime(
    endDate,
    schedule?.toTime || timeParts[1],
    "23:59",
  );
  if (!Number.isFinite(startDateTime) || !Number.isFinite(endDateTime))
    return null;
  return { startDateTime, endDateTime };
};

const getScheduleStatus = (schedule, now = Date.now()) => {
  if (
    !schedule ||
    !Number.isFinite(schedule.startDateTime) ||
    !Number.isFinite(schedule.endDateTime)
  ) {
    return { status: "Invalid" };
  }
  if (now < schedule.startDateTime) {
    return { status: "Upcoming", time: schedule.startDateTime - now };
  }
  if (now < schedule.endDateTime) {
    return { status: "Running", time: now - schedule.startDateTime };
  }
  return { status: "Ended" };
};

const getLeadScheduleStatus = (schedules, now = Date.now()) => {
  const validSchedules = schedules || [];
  const running = validSchedules.find(
    (schedule) => getScheduleStatus(schedule, now).status === "Running",
  );
  if (running) return { schedule: running, ...getScheduleStatus(running, now) };

  const upcoming = validSchedules
    .filter(
      (schedule) => getScheduleStatus(schedule, now).status === "Upcoming",
    )
    .sort((a, b) => a.startDateTime - b.startDateTime)[0];
  if (upcoming)
    return { schedule: upcoming, ...getScheduleStatus(upcoming, now) };

  const ended = validSchedules
    .filter((schedule) => getScheduleStatus(schedule, now).status === "Ended")
    .sort((a, b) => b.endDateTime - a.endDateTime)[0];
  return ended
    ? { schedule: ended, ...getScheduleStatus(ended, now) }
    : { status: "Invalid" };
};

const formatDuration = (milliseconds) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
};

const getScheduleBadge = (schedules, now) => {
  const scheduleStatus = getLeadScheduleStatus(schedules, now);
  if (scheduleStatus.status === "Upcoming") {
    return {
      label: `Starts in ${formatDuration(scheduleStatus.time)}`,
      className: "bg-amber-50 text-amber-700 ring-amber-200",
      dotClassName: "bg-amber-500",
    };
  }
  if (scheduleStatus.status === "Running") {
    return {
      label: `Started ${formatDuration(scheduleStatus.time)} ago`,
      className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      dotClassName: "bg-emerald-500",
    };
  }
  if (scheduleStatus.status === "Ended") {
    return {
      label: "Ended",
      className: "bg-slate-100 text-slate-600 ring-slate-200",
      dotClassName: "bg-slate-400",
    };
  }
  return null;
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

export default function LeadsPage({ onAdd, onMeeting, onProposal }) {
  const reduceMotion = useReducedMotion();
  const { useMe } = useAuth();
  const { role, id } = useMe?.data?.user?.decoded || {};
  const { EditSalesLead_ } = useEdit();
  const { DeleteSalesLead_ } = UseDelete();

  const { GetAllOrganizationDetails_, getAllActivities_, GetMeDetails_ } =
    useGet({
      currentUser: { role, id },
      isAuthLoading: useMe.isLoading,
    });
  const { data, isLoading, error } = GetAllOrganizationDetails_;

  useEffect(() => {
    const fetchMeDetails = async () => {
      try {
        const res = await GetMeDetails_.mutateAsync({
          params: { id },
        });

        console.log("meDetails:", res);
      } catch (error) {
        console.error("Failed to fetch meDetails:", error);
      }
    };

    if (id) {
      fetchMeDetails();
    }
  }, [id]);

  const loading = isLoading || useMe.isLoading;
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    organization: null,
    status: null,
    leadTaken: LEAD_TAKEN_OPTIONS[0],
    leadTakenRange: { start: "", end: "" },
  });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [showStats, setShowStats] = useState(true);

  const [preview, setPreview] = useState(null);
  const [meetingLead, setMeetingLead] = useState(null);
  const [proposalLead, setProposalLead] = useState(null);
  const [form, setForm] = useState(null);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [proposalCounts, setProposalCounts] = useState({});
  const [activitySchedules, setActivitySchedules] = useState({});
  const [leadStatusOverrides, setLeadStatusOverrides] = useState({});
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusChangeConfirmation, setStatusChangeConfirmation] =
    useState(null);
  const [terminationReasonError, setTerminationReasonError] = useState("");
  const [scheduleNow, setScheduleNow] = useState(Date.now);
  const statusUpdateLock = useRef(false);
  const activityFetcherRef = useRef(getAllActivities_.mutateAsync);
  activityFetcherRef.current = getAllActivities_.mutateAsync;

  const records = useMemo(
    () =>
      (Array.isArray(data?.data) ? data.data : [])
        .flatMap(toLeadRows)
        .map((row) => ({
          ...row,
          ...(leadStatusOverrides[String(row.leadDetailsId)] || {}),
        })),
    [data, leadStatusOverrides],
  );

  // Directly filter out contracted records (where rawIsContracted is true)
  const uncontractedRecords = useMemo(
    () => records.filter((f) => f.rawIsContracted === false),
    [records],
  );

  useEffect(() => {
    const interval = window.setInterval(() => setScheduleNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    const total = uncontractedRecords.length;
    const counts = {};
    uncontractedRecords.forEach((r) => {
      counts[r.status] = (counts[r.status] || 0) + 1;
    });
    const pct = (n) => (total ? Math.round((n / total) * 100) : 0);

    return {
      total,
      counts,
      pct: Object.fromEntries(STATUSES.map((s) => [s, pct(counts[s] || 0)])),
      statusOptions: STATUSES.map((s) => ({ value: s, label: s })),
    };
  }, [uncontractedRecords]);

  const organizationOptions = useMemo(
    () =>
      [
        ...new Set(
          uncontractedRecords.map((r) => r.organizationName).filter(Boolean),
        ),
      ]
        .sort((a, b) => a.localeCompare(b))
        .map((value) => ({ value, label: value })),
    [uncontractedRecords],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return uncontractedRecords.filter((r) => {
      const matchesSearch =
        !q ||
        SEARCH_KEYS.some((k) => tableValue(r[k]).toLowerCase().includes(q));
      const matchesOrganization =
        !filters.organization ||
        r.organizationName === filters.organization.value;
      const matchesLeadTaken = getLeadTakenFilterMatches(
        r,
        scheduleNow,
        filters.leadTaken,
        filters.leadTakenRange,
      );
      const matchesStatus =
        !filters.status || r.status === filters.status.value;
      return (
        matchesSearch &&
        matchesOrganization &&
        matchesLeadTaken &&
        matchesStatus
      );
    });
  }, [uncontractedRecords, search, filters, scheduleNow]);

  const hasFilters = Boolean(
    search ||
    filters.organization ||
    filters.status ||
    (filters.leadTaken && filters.leadTaken.value !== "all") ||
    filters.leadTakenRange.start ||
    filters.leadTakenRange.end,
  );

  const resetView = () => {
    setPage(1);
    setSelected([]);
  };

  const updateFilter = (key, option) => {
    setFilters((p) => ({ ...p, [key]: option }));
    resetView();
  };

  const updateLeadTakenFilter = (option) => {
    setFilters((p) => ({
      ...p,
      leadTaken: option || LEAD_TAKEN_OPTIONS[0],
      leadTakenRange:
        option?.value === "custom" ? p.leadTakenRange : { start: "", end: "" },
    }));
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
    setFilters({
      organization: null,
      status: null,
      leadTaken: LEAD_TAKEN_OPTIONS[0],
      leadTakenRange: { start: "", end: "" },
    });
    resetView();
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, totalPages);
  const pageRows = useMemo(
    () => filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE),
    [filtered, current],
  );
  const pageIds = pageRows.map(getLeadRowId);
  const activityLeadIds = [
    ...new Set(
      pageRows.filter((lead) => lead._id).map((lead) => String(lead._id)),
    ),
  ].join(",");
  const allSelected =
    pageIds.length > 0 && pageIds.every((id) => selected.includes(id));

  useEffect(() => {
    let isActive = true;
    const fetchActivityHistory = async () => {
      const results = await Promise.all(
        activityLeadIds
          .split(",")
          .filter(Boolean)
          .map(async (leadId) => {
            try {
              const response = await activityFetcherRef.current({
                parms: { MainID: leadId },
              });
              return [leadId, extractSchedulesFromActivityResponse(response)];
            } catch (activityError) {
              console.error(
                `Unable to load activity history for lead ${leadId}:`,
                activityError,
              );
              return null;
            }
          }),
      );

      if (!isActive) return;
      setActivitySchedules((previous) => {
        const next = { ...previous };
        results.filter(Boolean).forEach(([leadId, schedules]) => {
          next[leadId] = schedules;
        });
        return next;
      });
    };
    void fetchActivityHistory();
    return () => {
      isActive = false;
    };
  }, [activityLeadIds]);

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

  const handleLeadStatusChange = async (lead, nextStatus) => {
    if (
      statusUpdateLock.current ||
      !lead?._id ||
      !["New", "Contract", "Terminated"].includes(nextStatus)
    )
      return false;

    statusUpdateLock.current = true;
    setStatusUpdating(true);
    const loadingMessage = "Updating lead status...";
    waitingNotify(loadingMessage);
    try {
      const isNew = nextStatus === "New";
      const isContracted = nextStatus === "Contract";
      const isTerminated = nextStatus === "Terminated";
      const normalizedTerminationReason = isTerminated
        ? statusChangeConfirmation?.terminationReason?.trim() || ""
        : "";
      const response = await EditSalesLead_.mutateAsync({
        params: { id: lead._id },
        payload: {
          isNew,
          isContracted,
          isTerminated,
          terminationReason: normalizedTerminationReason,
        },
      });
      if (response?.success !== true) {
        throw new Error(
          response?.message || "The status update was not confirmed.",
        );
      }

      const updatedLeads = response?.data?.leadDetails;
      const leadDetailIds = new Set(
        [
          ...(Array.isArray(updatedLeads)
            ? updatedLeads.map((item) => item?._id)
            : []),
          ...records
            .filter((row) => String(row._id) === String(lead._id))
            .map((row) => row.leadDetailsId),
          lead.leadDetailsId,
        ]
          .filter((id) => id != null)
          .map(String),
      );
      const statusOverride = {
        isNew,
        isContracted,
        isTerminated,
        contractStatus: isTerminated
          ? "terminated"
          : isContracted
            ? "contract"
            : "new",
        status: isContracted
          ? "Contracted"
          : isTerminated
            ? "Terminated"
            : "New",
      };
      setLeadStatusOverrides((previous) => ({
        ...previous,
        ...Object.fromEntries(
          [...leadDetailIds].map((id) => [id, statusOverride]),
        ),
      }));
      SuccessNotify(
        `Lead status changed to ${nextStatus === "Contract" ? "Contract" : nextStatus} successfully.`,
      );
      return true;
    } catch (statusError) {
      ErrorNotify(errMsg(statusError, "Unable to update lead status."));
      return false;
    } finally {
      dismissWaitingNotify(loadingMessage);
      statusUpdateLock.current = false;
      setStatusUpdating(false);
    }
  };

  const confirmLeadStatusChange = async () => {
    if (!statusChangeConfirmation) return;
    const { lead, nextStatus } = statusChangeConfirmation;
    if (
      nextStatus === "Terminated" &&
      !statusChangeConfirmation.terminationReason?.trim()
    ) {
      setTerminationReasonError("Please enter a termination reason.");
      return;
    }
    if (await handleLeadStatusChange(lead, nextStatus)) {
      setStatusChangeConfirmation(null);
      setTerminationReasonError("");
    }
  };

  const openMeetings = (lead) => {
    setPreview(null);
    setMeetingLead(lead);
    onMeeting?.(lead);
  };
  const openProposal = (lead) => {
    setPreview(null);
    setProposalLead(lead);
    onProposal?.(lead);
  };
  const openForm = (lead = null) => {
    setPreview(null);
    setForm({ lead });
  };

  const refresh = async (verb, showSuccess = true) => {
    if (showSuccess) SuccessNotify(`Lead ${verb} successfully.`);
    const loadingMessage = "Refreshing leads...";
    waitingNotify(loadingMessage);
    try {
      await GetAllOrganizationDetails_.refetch({ throwOnError: true });
    } catch {
      ErrorNotify(`Lead was ${verb}, but the table could not be refreshed.`);
    } finally {
      dismissWaitingNotify(loadingMessage);
    }
  };

  const refreshLeads = async (failMessage) => {
    const loadingMessage = "Refreshing leads...";
    waitingNotify(loadingMessage);
    try {
      await GetAllOrganizationDetails_.refetch({ throwOnError: true });
    } catch {
      ErrorNotify(failMessage);
    } finally {
      dismissWaitingNotify(loadingMessage);
    }
  };

  const handleReschedule = () =>
    refreshLeads("Follow-up was saved, but the table could not be refreshed.");

  const handleProposalChange = (leadId, count, action) => {
    const key = String(leadId);
    setProposalCounts((p) => (p[key] === count ? p : { ...p, [key]: count }));
    if (action !== "loaded")
      refreshLeads("Proposal was saved, but the table could not be refreshed.");
  };

  const handleFormSubmit = async (payload) => {
    const editing = form?.lead;
    const loadingMessage = editing ? "Updating lead..." : "Creating lead...";
    waitingNotify(loadingMessage);
    try {
      if (editing) {
        await EditSalesLead_.mutateAsync({
          params: { id: editing._id },
          payload,
        });
      } else {
        if (typeof onAdd !== "function")
          throw new Error("Lead submission handler is not configured.");
        await onAdd(payload);
      }
    } finally {
      dismissWaitingNotify(loadingMessage);
    }
    await refresh(editing ? "updated" : "created", false);
  };

  const confirmDelete = async () => {
    if (!leadToDelete?._id) return;
    setIsDeleting(true);
    const loadingMessage = "Deleting lead...";
    waitingNotify(loadingMessage);
    try {
      await DeleteSalesLead_.mutateAsync({ params: { id: leadToDelete._id } });
      const deletedOrganizationId = String(getLeadId(leadToDelete));
      const deletedRowIds = new Set(
        records
          .filter((row) => String(getLeadId(row)) === deletedOrganizationId)
          .map(getLeadRowId),
      );
      setSelected((p) => p.filter((id) => !deletedRowIds.has(id)));
      setLeadToDelete(null);
      refresh("deleted");
    } catch (e) {
      ErrorNotify(errMsg(e, "Unable to delete this lead."));
    } finally {
      dismissWaitingNotify(loadingMessage);
      setIsDeleting(false);
    }
  };

  const meetingMainId = meetingLead?.mainID ?? meetingLead?._id ?? null;
  const liveMeetingLead =
    records.find((r) => r._id === meetingLead?._id) || meetingLead;
  const remainingtimes = {
    date: liveMeetingLead?.followUpDate,
    time: liveMeetingLead?.followUpTime,
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="w-full bg-white font-['Roboto_Slab'] text-xs text-slate-800">
        <div className="mx-auto max-w-[1600px] space-y-5">
          <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                <UserRound size={21} />
              </span>
              <div>
                <h1 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                  Leads
                </h1>
                <nav
                  aria-label="Breadcrumb"
                  className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-400"
                >
                  <span>CRM</span>
                  <ChevronRight size={12} />
                  <span className="font-extrabold text-amber-600">
                    Lead Management
                  </span>
                </nav>
              </div>
            </div>

            <motion.button
              type="button"
              onClick={() => openForm()}
              {...press(false)}
              variants={btnVariants}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
            >
              <motion.span variants={iconVariants} className="flex">
                <Plus size={18} />
              </motion.span>{" "}
              Add lead
            </motion.button>
          </header>

          {error && (
            <div
              role="alert"
              className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              <span>{error.message || "Unable to load leads."}</span>
              <button
                type="button"
                onClick={() => GetAllOrganizationDetails_.refetch()}
                className="shrink-0 font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}

          <div
            role="tablist"
            aria-label="Lead status"
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
                  className={`inline-flex min-h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-xs font-semibold transition ${FOCUS} ${active ? `${BRAND} text-white shadow-sm` : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                >
                  {tab.label}
                  <span
                    className={`rounded-full px-1.5 py-px text-[10px] font-bold tabular-nums ${active ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"}`}
                  >
                    {loading ? "·" : count}
                  </span>
                </button>
              );
            })}
          </div>

          <section aria-label="Lead statistics" className="space-y-3">
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
                    ["New", "New leads", UserPlus, "% of all leads"],
                    ["Contracted", "Contracted", BadgeCheck, "% contracted"],
                    ["Terminated", "Terminated", Ban, "% terminated"],
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

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="space-y-3 border-b border-slate-200 p-4">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto] lg:items-center">
                <div className="relative sm:col-span-2 lg:col-span-1">
                  <Search
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -mt-2 text-slate-400"
                  />
                  <input
                    type="search"
                    aria-label="Search leads"
                    placeholder="Search by lead ID, organization, contact or email"
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
                  aria-label="Filter by organization"
                  components={animatedComponents}
                  options={organizationOptions}
                  value={filters.organization}
                  onChange={(option) => updateFilter("organization", option)}
                  placeholder="All organizations"
                  styles={selectStyles}
                  menuPortalTarget={
                    typeof document !== "undefined" ? document.body : null
                  }
                  menuPosition="fixed"
                />

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
                  className="min-h-10 rounded-lg px-3 text-xs font-semibold text-amber-600 transition hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
                >
                  Clear filters
                </button>
              </div>

              {filters.leadTaken?.value === "custom" && (
                <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center">
                  {/* Start Date */}
                  <div className="flex flex-1 flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-slate-600">
                      Start Date (BS)
                    </label>

                    <NepaliDateInput
                      value={filters.leadTakenRange.start}
                      placeholder="Select Start Date"
                      onDateChange={(date) => {
                        const formattedDate = date
                          ? typeof date === "string"
                            ? date
                            : `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.date).padStart(2, "0")}`
                          : "";

                        setFilters((previous) => ({
                          ...previous,
                          leadTakenRange: {
                            ...previous.leadTakenRange,
                            start: formattedDate,
                          },
                        }));

                        resetView();
                      }}
                    />

                    {filters.leadTakenRange.start && (
                      <span className="text-xs font-medium text-slate-600">
                        Selected: {filters.leadTakenRange.start}
                      </span>
                    )}
                  </div>

                  {/* End Date */}
                  <div className="flex flex-1 flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-slate-600">
                      End Date (BS)
                    </label>

                    <NepaliDateInput
                      value={filters.leadTakenRange.end}
                      placeholder="Select End Date"
                      onDateChange={(date) => {
                        const formattedDate = date
                          ? typeof date === "string"
                            ? date
                            : `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.date).padStart(2, "0")}`
                          : "";

                        setFilters((previous) => ({
                          ...previous,
                          leadTakenRange: {
                            ...previous.leadTakenRange,
                            end: formattedDate,
                          },
                        }));

                        resetView();
                      }}
                    />

                    {filters.leadTakenRange.end && (
                      <span className="text-xs font-medium text-slate-600">
                        Selected: {filters.leadTakenRange.end}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div
              className="w-full overflow-x-auto"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#d1d5db transparent",
              }}
            >
              <table
                className="w-full min-w-[1900px] text-left text-xs"
                aria-busy={loading}
              >
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="w-12 border-b border-slate-200 px-4 py-3">
                      <AnimatedCheckbox
                        checked={allSelected}
                        onChange={toggleAll}
                        label="Select all leads on this page"
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
                    pageRows.map((lead, i) => {
                      const id = getLeadId(lead);
                      const rowId = getLeadRowId(lead);
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
                          className={`transition ${isSelected ? "bg-amber-50 hover:bg-amber-100" : "bg-white hover:bg-slate-50"}`}
                        >
                          <td className="px-4 py-3">
                            <AnimatedCheckbox
                              checked={isSelected}
                              onChange={() => toggleOne(rowId)}
                              label={`Select ${lead.leadId || "lead"}`}
                            />
                          </td>

                          {COLUMNS.map(([name, key], i) => (
                            <td
                              key={name}
                              className={`px-4 py-3 ${i === 0 ? "whitespace-nowrap" : "max-w-56"}`}
                            >
                              {i === 0 ? (
                                <button
                                  type="button"
                                  onClick={() => setPreview(lead)}
                                  title="View lead details"
                                  className="rounded font-bold text-amber-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
                                >
                                  {tableValue(lead[key])}
                                </button>
                              ) : key === "status" ? (
                                lead.isContracted !== true ? (
                                  <div
                                    className="inline-flex w-full max-w-35 items-center"
                                    title={`Lead status: ${lead.status}`}
                                    onClick={(event) => event.stopPropagation()}
                                  >
                                    <Select
                                      aria-label={`Lead status: ${lead.status}`}
                                      aria-busy={statusUpdating || undefined}
                                      value={LEAD_STATUS_OPTIONS.find(
                                        (option) =>
                                          option.value ===
                                          (lead.isTerminated === true
                                            ? "terminated"
                                            : "new"),
                                      )}
                                      isDisabled={statusUpdating || !lead._id}
                                      isLoading={statusUpdating}
                                      isSearchable={false}
                                      options={LEAD_STATUS_OPTIONS}
                                      onChange={(option) => {
                                        if (!option) return;
                                        const nextStatus =
                                          option.value === "contract"
                                            ? "Contract"
                                            : option.value === "terminated"
                                              ? "Terminated"
                                              : "New";
                                        setTerminationReasonError("");
                                        setStatusChangeConfirmation({
                                          lead,
                                          nextStatus,
                                          terminationReason: "",
                                        });
                                      }}
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
                                      styles={leadStatusSelectStyles}
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
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                                    Contracted
                                  </span>
                                )
                              ) : key === "proposal" ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                                  {proposalCounts[String(id)] ?? lead.proposal}{" "}
                                  sent
                                </span>
                              ) : key === "followUp" ? (
                                (() => {
                                  const badge = getScheduleBadge(
                                    activitySchedules[String(id)],
                                    scheduleNow,
                                  );
                                  return badge ? (
                                    <span
                                      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${badge.className}`}
                                    >
                                      <span
                                        aria-hidden="true"
                                        className={`h-1.5 w-1.5 font-semibold rounded-full ${badge.dotClassName}`}
                                      />
                                      {badge.label}
                                    </span>
                                  ) : (
                                    <span
                                      className="line-clamp-2 wrap-break-word"
                                      title={tableValue(lead[key])}
                                    >
                                      {tableValue(lead[key])}
                                    </span>
                                  );
                                })()
                              ) : key === "leadTaken" ? (
                                <span
                                  className="whitespace-nowrap font-semibold text-xs text-slate-600"
                                  title={lead.leadPickDateTime || undefined}
                                >
                                  {Number.isFinite(lead.leadTakenAt)
                                    ? formatRelativeTime(
                                        lead.leadTakenAt,
                                        scheduleNow,
                                      )
                                    : "-"}
                                </span>
                              ) : (
                                <span
                                  className="line-clamp-2 font-semibold wrap-break-word"
                                  title={tableValue(lead[key])}
                                >
                                  {tableValue(lead[key])}
                                </span>
                              )}
                            </td>
                          ))}

                          <td className="sticky right-0 border-l border-slate-200 bg-inherit px-3 py-3">
                            <div className="flex items-center gap-0.5">
                              <IconAction
                                icon={Eye}
                                label="View details"
                                onClick={() => setPreview(lead)}
                                tone="text-blue-600 hover:bg-blue-50"
                              />
                              <IconAction
                                icon={CalendarPlus}
                                label="Meetings and activity"
                                onClick={() => openMeetings(lead)}
                                tone="text-amber-600 hover:bg-orange-50"
                              />
                              <IconAction
                                icon={FileText}
                                label="Proposal"
                                onClick={() => openProposal(lead)}
                                tone="text-emerald-600 hover:bg-emerald-50"
                              />
                              <IconAction
                                icon={Pencil}
                                label="Edit lead"
                                disabled={!lead._id}
                                onClick={() => openForm(lead)}
                                tone="text-slate-600 hover:bg-slate-100"
                              />
                              <IconAction
                                icon={Trash2}
                                label="Delete lead"
                                disabled={!lead._id}
                                onClick={() => setLeadToDelete(lead)}
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
                        <UserRound
                          size={25}
                          className="mx-auto mb-2 text-slate-400"
                        />
                        <p className="text-sm font-semibold">No leads found</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {hasFilters
                            ? "No lead matches your search or filters."
                            : "Add a lead to get started."}
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
                            onClick={() => openForm()}
                            className="mt-3 rounded-lg px-3 py-1.5 text-xs font-semibold text-amber-600 hover:bg-orange-50"
                          >
                            Add lead
                          </button>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col justify-between gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center">
              {loading ? (
                <Skeleton className="h-4 w-44" />
              ) : (
                <span className="text-[10px] font-medium text-slate-500">
                  Showing {filtered.length ? (current - 1) * PER_PAGE + 1 : 0}{" "}
                  to {Math.min(current * PER_PAGE, filtered.length)} of{" "}
                  {filtered.length} leads
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
          {form && (
            <Modal
              key="form-modal"
              size="max-w-6xl"
              title={form.lead ? "Update Lead Information" : "Create New Lead"}
              subtitle={
                form.lead
                  ? `${form.lead.organizationName || "Lead"} · ${form.lead.leadId || "-"}`
                  : "Complete all three steps to register a lead."
              }
              onClose={() => setForm(null)}
            >
              <LeadFormStepper
                key={form.lead?._id || "new"}
                data={form.lead}
                isEditMode={Boolean(form.lead)}
                onSubmit={handleFormSubmit}
                onUpdate={handleFormSubmit}
                onClose={() => setForm(null)}
              />
            </Modal>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {leadToDelete && (
            <Modal
              key="delete-modal"
              alert
              size="max-w-sm"
              locked={isDeleting}
              onClose={() => setLeadToDelete(null)}
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <AlertTriangle size={20} />
                </span>
                <div>
                  <h2 className="text-base font-bold">Delete this lead?</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    <span className="text-slate-800">
                      {leadToDelete.organizationName}
                    </span>{" "}
                    ({leadToDelete.leadId}) will be permanently deleted. This
                    can’t be undone.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  autoFocus
                  onClick={() => setLeadToDelete(null)}
                  disabled={isDeleting}
                  className="min-h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
                >
                  Keep lead
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-70"
                >
                  {isDeleting && <Loader2 size={14} className="animate-spin" />}
                  {isDeleting ? "Deleting..." : "Delete lead"}
                </button>
              </div>
            </Modal>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {statusChangeConfirmation && (
            <Modal
              key="status-change-modal"
              alert
              size="max-w-sm"
              locked={statusUpdating}
              onClose={() => setStatusChangeConfirmation(null)}
            >
              {(() => {
                const isTermination =
                  statusChangeConfirmation.nextStatus === "Terminated";
                const isNewStatus =
                  statusChangeConfirmation.nextStatus === "New";
                const nextLabel = isTermination
                  ? "Terminated"
                  : isNewStatus
                    ? "New"
                    : "Contracted";
                const StatusIcon = isTermination ? AlertTriangle : BadgeCheck;
                return (
                  <>
                    <div className="flex items-start gap-3">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isTermination ? "bg-red-50 text-red-500" : isNewStatus ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}
                      >
                        <StatusIcon size={20} />
                      </span>
                      <div>
                        <h2 className="text-base font-bold">
                          Change lead status?
                        </h2>
                        <p className="mt-1 font-semibold text-sm text-slate-500">
                          Update{" "}
                          <span className="text-slate-800">
                            {statusChangeConfirmation.lead.organizationName ||
                              statusChangeConfirmation.lead.leadId ||
                              "this lead"}
                          </span>{" "}
                          from {statusChangeConfirmation.lead.status} to{" "}
                          <span className="font-semibold text-slate-800">
                            {nextLabel}
                          </span>
                          .
                        </p>
                      </div>
                    </div>

                    {isTermination && (
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
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 font-semibold text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:bg-slate-50"
                        />
                        {terminationReasonError && (
                          <p
                            id="termination-reason-error"
                            className="mt-1 text-xs font-medium text-red-600"
                          >
                            {terminationReasonError}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2 font-semibold">
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
                              className="rounded-full border border-slate-200 px-2.5 py-1 text-left text-xs text-slate-600 hover:border-amber-300 hover:bg-amber-50 disabled:opacity-50"
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
                        onClick={() => setStatusChangeConfirmation(null)}
                        disabled={statusUpdating}
                        className="min-h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={confirmLeadStatusChange}
                        disabled={statusUpdating}
                        className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-white disabled:opacity-70 ${isTermination ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
                      >
                        {statusUpdating && (
                          <Loader2 size={14} className="animate-spin" />
                        )}
                        {statusUpdating
                          ? "Updating..."
                          : `Confirm ${nextLabel.toLowerCase()}`}
                      </button>
                    </div>
                  </>
                );
              })()}
            </Modal>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {preview && (
            <SideDrawer
              key="preview-drawer"
              size="xl"
              muted
              eyebrow="Lead details"
              title={preview.organizationName || "Lead details"}
              subtitle={preview.leadId || "-"}
              onClose={() => setPreview(null)}
              footer={
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => openMeetings(preview)}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3 text-sm font-semibold text-white hover:brightness-110"
                  >
                    <CalendarPlus size={16} /> Meetings
                  </button>
                  <button
                    type="button"
                    onClick={() => openProposal(preview)}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold hover:bg-slate-50"
                  >
                    <FileText size={16} /> Proposal
                  </button>
                  <button
                    type="button"
                    onClick={() => openForm(preview)}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold hover:bg-slate-50"
                  >
                    <Pencil size={16} /> Edit
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
                      .filter((r) => isDisplayable(r.value));
                    if (!rows.length) return null;

                    return (
                      <section
                        key={title}
                        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                      >
                        <h3 className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-500">
                          <SectionIcon size={14} className="text-amber-600" />{" "}
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

        <AnimatePresence>
          {meetingLead && (
            <SideDrawer
              key="meetings-drawer"
              size="xl"
              flush
              eyebrow="Meetings and activity"
              title={meetingLead.organizationName}
              subtitle={meetingLead.leadId}
              onClose={() => setMeetingLead(null)}
            >
              <Meetings
                key={meetingMainId ?? "no-lead"}
                id={{ mainID: meetingMainId }}
                sampleMode={false}
                remainingtimes={remainingtimes}
                onReschedule={handleReschedule}
              />
            </SideDrawer>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {proposalLead && (
            <SideDrawer
              key="proposal-drawer"
              size="lg"
              eyebrow="Proposal"
              title={proposalLead.organizationName}
              subtitle={proposalLead.leadId}
              onClose={() => setProposalLead(null)}
            >
              <Proposal
                id={{ mainID: getLeadId(proposalLead) }}
                lead={proposalLead}
                sampleMode={false}
                proposalTimes={{
                  count:
                    proposalCounts[String(getLeadId(proposalLead))] ??
                    proposalLead.proposal,
                  onChange: (count, action) =>
                    handleProposalChange(
                      String(getLeadId(proposalLead)),
                      count,
                      action,
                    ),
                }}
                onClose={() => setProposalLead(null)}
              />
            </SideDrawer>
          )}
        </AnimatePresence>

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
                  {selected.length} {selected.length === 1 ? "lead" : "leads"}{" "}
                  selected
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

const SKELETON_WIDTHS = [
  "w-20",
  "w-32",
  "w-24",
  "w-28",
  "w-24",
  "w-28",
  "w-36",
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
          {Array.from({ length: 7 }, (_, i) => (
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
      className={`flex items-center gap-3 rounded-xl border bg-white p-4 text-left shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 ${active ? "border-amber-500 ring-1 ring-amber-500/30" : "border-slate-200 hover:border-slate-300"}`}
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
          className={`h-3 w-3 text-white transition-all duration-200 ${checked ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
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
        <dd className="wrap-break-word text-sm font-semibold text-slate-800">
          {String(value)}
        </dd>
      </div>
    </motion.div>
  );
}

function Modal({
  title,
  subtitle,
  size = "max-w-6xl",
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
        initial={{ opacity: 0, y: alert ? 20 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: alert ? 20 : 12 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={`relative flex max-h-[95vh] w-full ${size} flex-col overflow-hidden rounded-2xl shadow-2xl ${title ? "bg-slate-50" : "bg-white p-5"}`}
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
              : `min-h-0 flex-1 overflow-y-auto p-4 sm:p-5 ${muted ? "bg-slate-50" : ""}`
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
