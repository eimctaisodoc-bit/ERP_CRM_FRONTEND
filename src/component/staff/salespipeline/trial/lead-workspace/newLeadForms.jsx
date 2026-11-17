import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Select, { components as selectBaseComponents } from "react-select";
import makeAnimated from "react-select/animated";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Briefcase,
  Building2,
  CalendarClock,
  CalendarDays,
  Check,
  ClipboardList,
  Factory,
  FileText,
  GraduationCap,
  Landmark,
  Mail,
  Map as MapIcon,
  MapPin,
  MapPinned,
  Megaphone,
  Phone,
  Plus,
  Radio,
  Receipt,
  School,
  Share2,
  ShieldCheck,
  Smartphone,
  StickyNote,
  Target,
  Trash2,
  UserCog,
  UserRound,
  Users,
} from "lucide-react";

import NepaliDateInput from "../../../../nepalidate/testDate";
import NepaliDate from "nepali-date-converter";
import { UseAdd } from "../../../../hooks/useadd";
import { SuccessNotify, ErrorNotify } from "../../../../hotToaster";
import {
  provinceDistricts,
  getDistrictNames,
  getLocalLevelNames,
} from "../../../../province";

const ORANGE = "#E87A24";
const MAX_ALT_CONTACTS = 5;

const provinceNumbers = {
  "Koshi Province": 1,
  "Madhesh Province": 2,
  "Bagmati Province": 3,
  "Gandaki Province": 4,
  "Lumbini Province": 5,
  "Karnali Province": 6,
  "Sudurpashchim Province": 7,
};

/* =========================================================
   DROPDOWN OPTIONS  ([label, value, color?] rows)
========================================================= */

const opts = (rows) =>
  rows.map(([label, value, color]) =>
    color ? { label, value, color } : { label, value },
  );

export const leadType = opts([
  ["Inbound (Client Contacted You)", "inbound"],
  ["Outbound (You Contacted Client)", "outbound"],
  ["Cold Lead", "cold_lead"],
  ["Warm Lead", "warm_lead"],
  ["Hot Lead", "hot_lead"],
  ["Existing Client", "existing_client"],
  ["Referred Lead", "referred_lead"],
]);

export const LeadSource = opts([
  ["Website", "website"],
  ["Facebook", "facebook"],
  ["TikTok", "tiktok"],
  ["Instagram", "instagram"],
  ["Email Campaign", "email_campaign"],
  ["Cold Calling", "cold_calling"],
  ["Partner / Consultant", "partner_consultant"],
  ["Referral", "referral"],
  ["Digital Marketing", "digital_marketing"],
]);

export const BusinessRole = opts([
  ["Owner / Founder", "owner_founder"],
  ["CEO / Managing Director", "ceo_md"],
  ["Director", "director"],
  ["General Manager", "general_manager"],
  ["Operations Manager", "operations_manager"],
  ["Quality Manager", "quality_manager"],
  ["HR Manager", "hr_manager"],
  ["Safety Officer / HSE Manager", "hse_manager"],
  ["IT Manager", "it_manager"],
  ["Finance / Accounts Manager", "finance_manager"],
  ["Procurement / Purchase Manager", "procurement_manager"],
  ["Project Manager", "project_manager"],
  ["Supervisor / Team Leader", "supervisor_team_lead"],
  ["Chairman / Chairperson", "chairman"],
  ["Other", "other"],
]);

export const LeadChannel = opts([
  ["Client Phone Call", "client_phone_call"],
  ["EIMCTA Phone Call", "eimcta_phone_call"],
  ["WhatsApp", "whatsapp"],
  ["Messenger", "messenger"],
  ["Referral", "referral"],
  ["Facebook Boosting", "boostingfb"],
  ["Email", "email"],
  ["Google Form", "googleForm"],
  ["LinkedIn", "linkedin"],
  ["TikTok", "tiktok"],
  ["Instagram", "instagram"],
  ["YouTube", "youtube"],
  ["In-Person Meeting", "in_person_meeting"],
]);

const industries = opts([
  ["IT", "it", "#3b82f6"],
  ["Education", "education", "#8b5cf6"],
  ["Travel & Tourism", "travel_tourism", "#06b6d4"],
  ["Manufacturing", "manufacturing", "#f59e0b"],
  ["Healthcare", "healthcare", "#ef4444"],
  ["Construction", "construction", "#f97316"],
  ["Trading", "trading", "#84cc16"],
  ["Consultancy", "consultancy", "#6366f1"],
  ["Food & Beverage", "food_beverage", "#ea580c"],
  ["Hospitality (Hotels/Resorts)", "hospitality", "#ec4899"],
  ["Logistics & Transportation", "logistics", "#0ea5e9"],
  ["Energy & Utilities", "energy", "#22c55e"],
  ["Financial Services", "finance", "#14b8a6"],
]);

export const organizationType = opts([
  ["Private Limited", "private_limited"],
  ["Government", "government"],
  ["NGO / Non-Profit", "ngo_non_profit"],
  ["Community-Based Organization", "community_based_organization"],
  ["Public-Private Partnership (PPP)", "ppp"],
  ["Semi-Government Organization", "semi_government"],
]);

export const servicesInterested = opts([
  ["ISO 9001:2015 QMS (Quality Management System)", "iso9001", "#3b82f6"],
  [
    "ISO 14001:2015 EMS (Environmental Management System)",
    "iso14001",
    "#10b981",
  ],
  [
    "ISO 45001:2018 OHSMS (Occupational Health & Safety Management System)",
    "iso45001",
    "#ef4444",
  ],
  [
    "ISO 27001:2022 ISMS (Information Security Management System)",
    "iso27001",
    "#f59e0b",
  ],
  [
    "ISO 22000:2018 FSMS (Food Safety Management System)",
    "iso22000",
    "#f97316",
  ],
  [
    "HACCP Certification (Hazard Analysis & Critical Control Points)",
    "haccp",
    "#ea580c",
  ],
  ["HALAL Certification", "halal", "#16a34a"],
  ["ISO 15189:2022 Medical Laboratory QMS", "iso15189", "#8b5cf6"],
  ["GMP (Good Manufacturing Practices)", "gmp", "#0ea5e9"],
  ["ISO 50001:2018 EnMS (Energy Management System)", "iso50001", "#06b6d4"],
  [
    "ISO 21001:2025 EOMS (Educational Organizations Management System)",
    "iso21001",
    "#6366f1",
  ],
  ["ISO 55001:2024 Asset Management System", "iso55001", "#64748b"],
  ["ISO 41001:2018 Facility Management System", "iso41001", "#475569"],
  ["SMETA Sedex Audits", "smeta", "#ec4899"],
  ["RBA Compliance", "rba", "#1e3a8a"],
  ["CE Marking (Conformité Européenne)", "ce_marking", "#1d4ed8"],
  ["ISO 26000:2010 Social Responsibility Guidance", "iso26000", "#d946ef"],
  ["Training Programs", "training_programs", "#f43f5e"],
  ["Third Party Audits", "third_party_audits", "#000000"],
]);

/* =========================================================
   STEPS + INITIAL DATA
========================================================= */

const STEPS = [
  {
    id: 1,
    title: "Lead Information",
    description: "Lead details and interested services",
    icon: ClipboardList,
  },
  {
    id: 2,
    title: "Organization & Contact",
    description: "Organization and contact details",
    icon: Building2,
  },
  {
    id: 3,
    title: "Lead Ownership",
    description: "Assignment, location and notes",
    icon: UserRound,
  },
];

const initialLeadData = {
  leadType: null,
  leadSource: null,
  leadChannel: null,
  campaignName: "",
  assignedSalesRep: "",
  ProductInterested: [],
  provinceNumber: null, // { label, value }
  province: null,
  district: null,
  localLevel: null,
  salesManager: "",
  notes: "",
};

const initialOrgData = {
  organizationName: "",
  organizationType: null,
  industryType: null,
  registrationNumber: "",
  vatPan: "",
  provinceNumber: null, // { label, value }
  province: null,
  district: null,
  localLevel: null,
  orgTelephone: "",
  orgEmail: "",
  totalEmp_learners: "",
  totalEducator: "",
  fromGrade: "",
  toGrade: "",
  contactPersonName: "",
  role: null,
  contactPersonNumber: "",
  contactPersonEmail: "",
  alternativeContacts: [],
};

const emptyValues = {
  lead: initialLeadData,
  organization: initialOrgData,
  leadPickTime: "",
};

/* =========================================================
   VALUE HELPERS
========================================================= */

const pad = (n) => String(n).padStart(2, "0");
const toEnglishDigits = (value) =>
  String(value ?? "").replace(/[०-९]/g, (d) => "०१२३४५६७८९".indexOf(d));
const toBsString = (d) =>
  `${d.getYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Any date-ish input -> "YYYY-MM-DD" in Bikram Sambat, or "".
const getDateString = (input) => {
  let date = input;
  if (date && typeof date === "object" && !(date instanceof Date)) {
    date =
      date.bsDate ||
      date.formattedDate ||
      date.value ||
      date.date ||
      date.adDate ||
      "";
  }
  if (!date) return "";

  try {
    if (date instanceof Date) {
      return Number.isNaN(date.getTime())
        ? ""
        : toBsString(new NepaliDate(date));
    }

    const match = toEnglishDigits(String(date).trim())
      .split(/[T ]/)[0]
      .match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (!match) return "";

    const [y, m, d] = match.slice(1).map(Number);

    // Years 1900-2039 are Gregorian; 2040+ can only be Bikram Sambat (the converter
    // supports Gregorian only up to ~2033), so BS values like "2082-08-04" aren't blanked.
    if (y >= 1900 && y < 2040) {
      // Gregorian date: validate round-trip, then convert to BS.
      const ad = new Date(y, m - 1, d);
      const valid =
        ad.getFullYear() === y && ad.getMonth() === m - 1 && ad.getDate() === d;
      return valid ? toBsString(new NepaliDate(ad)) : "";
    }

    const bs = new NepaliDate(y, m - 1, d);
    const valid =
      bs.getYear() === y && bs.getMonth() === m - 1 && bs.getDate() === d;
    return valid ? `${y}-${pad(m)}-${pad(d)}` : "";
  } catch {
    return "";
  }
};

const getLeadDateFromRecord = (record) => {
  const lead = record?.lead || record?.leadDetails?.[0] || {};
  const own = record?.ownership || record?.ownershipDetails?.[0] || {};
  return getDateString(own.LeadPickDate ?? lead.LeadPickDate);
};

const getOptionValue = (v) =>
  Array.isArray(v)
    ? getOptionValue(v[0])
    : v && typeof v === "object" && "value" in v
      ? v.value
      : v;

// Option object -> its value ("" for empty).
const val = (o) => (o && typeof o === "object" ? o.value || "" : o || "");

// Province number is no longer shown in the UI, but it is still sent to the backend.
// Uses the stored value, and falls back to deriving it from the selected province.
const getProvinceNumber = (place) =>
  val(place.provinceNumber) || provinceNumbers[val(place.province)] || "";

const toOption = (value, options = []) => {
  const v = getOptionValue(value);
  if (v === null || v === undefined || v === "") return null;
  return (
    options.find((o) => String(o.value) === String(v)) || {
      label: String(v),
      value: v,
    }
  );
};

const toFormString = (v) => String(getOptionValue(v) ?? "");
const toOptions = (names) => names.map((n) => ({ value: n, label: n }));
const numberOption = (n) => (n ? { label: String(n), value: n } : null);

const toTimeInputValue = (value) => {
  const m = toFormString(value)
    .trim()
    .match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!m) return "";

  let hours = Number(m[1]);
  if (m[4]) hours = (hours % 12) + (m[4].toUpperCase() === "PM" ? 12 : 0);
  return `${pad(hours)}:${m[2]}${m[3] ? `:${m[3]}` : ""}`;
};

// API record -> form state.
const formValuesFromLead = (record) => {
  const lead = record?.lead || record?.leadDetails?.[0] || {};
  const org = record?.organization || record?.organizationDetails?.[0] || {};
  const own = record?.ownership || record?.ownershipDetails?.[0] || {};
  const str = toFormString;

  const place = (a, b = {}) => ({
    provinceNumber: numberOption(
      Number(getOptionValue(a.provinceNumber ?? b.provinceNumber)) ||
        provinceNumbers[str(a.province ?? b.province)],
    ),
    province: toOption(a.province ?? b.province),
    district: toOption(a.district ?? b.district),
    localLevel: toOption(a.localLevel ?? b.localLevel),
  });

  const orgStrings = [
    "organizationName",
    "registrationNumber",
    "vatPan",
    "orgTelephone",
    "orgEmail",
    "totalEmp_learners",
    "totalEducator",
    "contactPersonName",
    "contactPersonNumber",
    "contactPersonEmail",
  ];

  return {
    lead: {
      ...initialLeadData,
      ...place(lead, org),
      leadType: toOption(lead.leadType, leadType),
      leadSource: toOption(lead.leadSource, LeadSource),
      leadChannel: toOption(lead.leadChannel, LeadChannel),
      campaignName: str(lead.campaignName),
      assignedSalesRep: str(lead.assignedSalesRep ?? own.assignedSalesRep),
      ProductInterested: []
        .concat(lead.ProductInterested || [])
        .map((item) => toOption(item, servicesInterested))
        .filter(Boolean),
      salesManager: str(lead.salesManager ?? own.salesManager),
      notes: str(lead.notes),
    },
    organization: {
      ...initialOrgData,
      ...place(org),
      ...Object.fromEntries(orgStrings.map((k) => [k, str(org[k])])),
      organizationType: toOption(org.organizationType, organizationType),
      industryType: toOption(org.industyType, industries), // (sic) API field name
      fromGrade: str(org.GradeFrom),
      toGrade: str(org.GradeTo),
      role: toOption(org.role, BusinessRole),
      alternativeContacts: Array.isArray(org.alternativeContacts)
        ? org.alternativeContacts.map((c) => ({
            name: str(c?.name ?? c?.contactPersonName),
            role: toOption(c?.role, BusinessRole),
            number: str(c?.number ?? c?.contactPersonNumber),
            email: str(c?.email ?? c?.contactPersonEmail),
          }))
        : [],
    },
    leadPickTime: toTimeInputValue(own.LeadPickTime ?? lead.LeadPickTime),
  };
};

/* =========================================================
   VALIDATION  (keys: "lead.<f>", "org.<f>", "alt.<i>.<f>")
========================================================= */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const isEmpty = (v) => v == null || (typeof v === "string" && v.trim() === "");

const phoneError = (v, label, required) => {
  if (isEmpty(v)) return required ? `Enter ${label.toLowerCase()}` : "";
  const digits = String(v).replace(/\D/g, "").length;
  return digits < 7 || digits > 15 ? `${label} must have 7 to 15 digits` : "";
};

const emailError = (v, label) =>
  isEmpty(v) || EMAIL_RE.test(String(v).trim())
    ? ""
    : `Enter a valid ${label.toLowerCase()}`;

// Grades are free text but must be alphanumeric (e.g. "5", "10", "KG1", "A2").
const ALPHANUMERIC_RE = /^[A-Za-z0-9]+$/;
const gradeError = (v, label) =>
  isEmpty(v) || ALPHANUMERIC_RE.test(String(v).trim())
    ? ""
    : `${label} can only contain letters and numbers`;

// Whole number greater than 0.
const positiveNumberError = (v, label, required) => {
  if (isEmpty(v)) return required ? `Enter ${label.toLowerCase()}` : "";
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? "" : `${label} must be greater than 0`;
};

const computeErrors = (lead, org, isEducation) => {
  const errs = {};
  const add = (key, message) => {
    if (message) errs[key] = message;
  };

  // Step 1 - lead information
  add("lead.leadType", !lead.leadType && "Select a lead type");
  add("lead.leadSource", !lead.leadSource && "Select a lead source");
  add("lead.leadChannel", !lead.leadChannel && "Select a lead channel");
  add(
    "lead.ProductInterested",
    !lead.ProductInterested?.length && "Select at least one service",
  );

  // Step 2 - organization
  add(
    "org.organizationName",
    isEmpty(org.organizationName)
      ? "Enter the organization name"
      : org.organizationName.trim().length < 2 &&
          "Organization name is too short",
  );
  add(
    "org.organizationType",
    !org.organizationType && "Select an organization type",
  );
  add("org.province", !org.province && "Select a province");
  add("org.district", org.province && !org.district && "Select a district");
  add("org.orgTelephone", phoneError(org.orgTelephone, "Telephone"));
  add("org.orgEmail", emailError(org.orgEmail, "Organization email"));

  if (isEducation) {
    add(
      "org.totalEmp_learners",
      positiveNumberError(org.totalEmp_learners, "Total learners", true),
    );
    add(
      "org.totalEducator",
      positiveNumberError(org.totalEducator, "Total educators"),
    );
    add("org.fromGrade", gradeError(org.fromGrade, "From grade"));
    add("org.toGrade", gradeError(org.toGrade, "To grade"));

    // Order can only be compared when both grades are plain numbers ("KG1" vs "10" has no order).
    const from = String(org.fromGrade ?? "").trim();
    const to = String(org.toGrade ?? "").trim();
    if (
      !errs["org.fromGrade"] &&
      !errs["org.toGrade"] &&
      /^\d+$/.test(from) &&
      /^\d+$/.test(to) &&
      Number(to) < Number(from)
    ) {
      errs["org.toGrade"] = "To grade must not be lower than from grade";
    }
  } else {
    add(
      "org.totalEmp_learners",
      positiveNumberError(org.totalEmp_learners, "Total employees"),
    );
  }

  add(
    "org.contactPersonName",
    isEmpty(org.contactPersonName) && "Enter the contact person name",
  );
  add(
    "org.contactPersonNumber",
    phoneError(org.contactPersonNumber, "Contact number", true),
  );
  add(
    "org.contactPersonEmail",
    emailError(org.contactPersonEmail, "Contact email"),
  );

  org.alternativeContacts.forEach((c, i) => {
    add(`alt.${i}.name`, isEmpty(c.name) && "Enter the contact name");
    add(`alt.${i}.number`, phoneError(c.number, "Phone number", true));
    add(`alt.${i}.email`, emailError(c.email, "Email"));
  });

  // Step 3 - ownership
  add(
    "lead.assignedSalesRep",
    isEmpty(lead.assignedSalesRep) && "Enter the assigned sales representative",
  );
  add("lead.province", !lead.province && "Select a province");
  add("lead.district", lead.province && !lead.district && "Select a district");

  return errs;
};

const STEP_ONE_FIELDS = new Set([
  "leadType",
  "leadSource",
  "leadChannel",
  "campaignName",
  "ProductInterested",
]);

const stepOfKey = (key) =>
  key.startsWith("org.") || key.startsWith("alt.")
    ? 2
    : STEP_ONE_FIELDS.has(key.slice("lead.".length))
      ? 1
      : 3;

const VALIDATION_MESSAGE =
  "Some fields need attention. Fix the highlighted fields and try again.";

/* =========================================================
   REACT SELECT SETUP
========================================================= */

const selectStyles = {
  control: (base, { selectProps, isFocused, isDisabled }) => {
    const err = selectProps.hasError;
    return {
      ...base,
      minHeight: "42px",
      borderRadius: "9px",
      fontSize: "13px",
      fontWeight: 500,
      flexWrap: "nowrap",
      borderColor: err ? "#EF4444" : isFocused ? ORANGE : "#E2E8F0",
      boxShadow: isFocused
        ? err
          ? "0 0 0 3px rgba(239,68,68,0.15)"
          : "0 0 0 3px rgba(232,122,36,0.10)"
        : "none",
      "&:hover": { borderColor: err ? "#EF4444" : ORANGE },
      backgroundColor: isDisabled ? "#F8FAFC" : "#fff",
      transition: "border-color 0.15s ease, box-shadow 0.15s ease",
    };
  },
  // The icon slot (40px) already provides the left gutter.
  valueContainer: (base, { selectProps }) => ({
    ...base,
    padding: selectProps.icon ? "2px 8px 2px 0" : "2px 8px",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#94A3B8",
    fontSize: "13px",
    marginLeft: 0,
  }),
  singleValue: (base, { data }) => ({
    ...base,
    color: data.color || "#422026",
    fontSize: "13px",
    marginLeft: 0,
  }),
  input: (base) => ({ ...base, marginLeft: 0 }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "#FFF1E6",
    borderRadius: "5px",
  }),
  multiValueLabel: (base) => ({ ...base, color: "#A64D0B", fontSize: "12px" }),
  option: (base, { isSelected, isFocused, data }) => ({
    ...base,
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    backgroundColor: isSelected
      ? data.color || ORANGE
      : isFocused
        ? "#FFF1E6"
        : "#fff",
    color: isSelected ? "#fff" : data.color || "#422026",
  }),
  menu: (base) => ({
    ...base,
    zIndex: 100,
    borderRadius: "9px",
    overflow: "hidden",
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

// Icon slot: fixed 40px gutter, icon centred on both axes of the whole control.
const IconControl = ({ children, ...props }) => {
  const { icon: Icon, hasError } = props.selectProps;

  return (
    <selectBaseComponents.Control {...props}>
      {Icon && (
        <span
          className={`flex w-10 shrink-0 items-center justify-center self-stretch transition-colors ${
            hasError
              ? "text-red-500"
              : props.isFocused
                ? "text-[#E87A24]"
                : "text-slate-400"
          }`}
        >
          <Icon size={16} />
        </span>
      )}
      {children}
    </selectBaseComponents.Control>
  );
};

const selectComponents = { ...makeAnimated(), Control: IconControl };

/* =========================================================
   REUSABLE FORM COMPONENTS
========================================================= */

function FieldError({ id, error }) {
  return (
    <AnimatePresence initial={false}>
      {error && (
        <motion.p
          id={id}
          role="alert"
          initial={{ opacity: 0, height: 0, y: -4 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={{ opacity: 0, height: 0, y: -4 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="flex items-start gap-1 overflow-hidden text-[11px] font-medium leading-4 text-red-600"
        >
          {/* leading-4 (16px) - icon 12px => 2px offset centres it on the first line */}
          <AlertCircle size={12} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </motion.p>
      )}
    </AnimatePresence>
  );
}

function FormField({ name, label, required, error, children, className = "" }) {
  return (
    <div
      data-field={name}
      data-invalid={error ? "true" : undefined}
      className={`min-w-0 space-y-1.5 ${className}`}
    >
      <label
        htmlFor={name}
        className="block text-xs font-semibold text-[#422026]"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className={error ? "lead-field-shake" : ""}>{children}</div>

      <FieldError id={name ? `${name}-error` : undefined} error={error} />
    </div>
  );
}

const fieldClass = (error) =>
  `block w-full rounded-lg border text-sm text-[#422026] font-medium outline-none transition focus:ring-2 ${
    error
      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
      : "border-slate-200 focus:border-[#E87A24] focus:ring-orange-100"
  }`;

// Text input, or textarea when `rows` is given.
function TextInput({
  name,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  type = "text",
  required = false,
  readOnly = false,
  className = "",
  error = "",
  icon: Icon,
  numeric = false, // digits only, never 0 or negative
  alphanumeric = false, // letters and digits only (text value)
  phone = false,
  maxLength,
  step,
  rows,
}) {
  const Tag = rows ? "textarea" : "input";

  const handleChange = (e) => {
    let next = e.target.value;
    if (numeric) next = next.replace(/\D/g, "").replace(/^0+/, "");
    if (alphanumeric) next = next.replace(/[^A-Za-z0-9]/g, "");
    if (phone) next = next.replace(/[^\d+\-\s]/g, "");
    onChange?.(next);
  };

  return (
    <FormField
      name={name}
      label={label}
      required={required}
      className={className}
      error={error}
    >
      <div className="group relative">
        {Icon && (
          // Same 40px gutter as the selects. Inputs: full height, so the icon is dead centre.
          // Textareas: first-row height (40px), so it lines up with the first line of text.
          <span
            className={`pointer-events-none absolute left-0 top-0 flex w-10 items-center justify-center transition-colors ${
              rows ? "h-10" : "h-full"
            } ${error ? "text-red-500" : "text-slate-400 group-focus-within:text-[#E87A24]"}`}
          >
            <Icon size={16} />
          </span>
        )}

        <Tag
          id={name}
          name={name}
          {...(rows
            ? { rows }
            : {
                type: numeric || phone ? "text" : type,
                inputMode: numeric ? "numeric" : phone ? "tel" : undefined,
                maxLength: numeric ? maxLength || 9 : maxLength,
                step,
              })}
          autoComplete="off"
          value={value ?? ""}
          onChange={handleChange}
          onBlur={onBlur}
          readOnly={readOnly}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          className={`${fieldClass(error)} ${rows ? "resize-y py-2.5" : "h-[42px]"} ${
            Icon ? "pl-10" : "pl-3"
          } pr-3 ${readOnly ? "cursor-not-allowed bg-slate-50 text-slate-500" : "bg-white"}`}
        />
      </div>
    </FormField>
  );
}

const TextArea = (props) => <TextInput rows={3} {...props} />;

function SelectField({
  name,
  label,
  required,
  error = "",
  className,
  placeholder,
  isMulti,
  ...rest
}) {
  return (
    <FormField
      name={name}
      label={label}
      required={required}
      error={error}
      className={className}
    >
      <Select
        inputId={name}
        hasError={!!error}
        components={selectComponents}
        styles={selectStyles}
        placeholder={placeholder || `Select ${label.toLowerCase()}`}
        isMulti={isMulti}
        isClearable
        closeMenuOnSelect={!isMulti}
        menuPortalTarget={
          typeof document !== "undefined" ? document.body : null
        }
        menuPosition="fixed"
        {...rest} // value, onChange, onBlur, options, isDisabled, icon
      />
    </FormField>
  );
}

function DateField({
  name,
  label,
  icon: Icon,
  dates,
  onDateChange,
  placeholder,
  resetKey,
  error = "",
}) {
  return (
    <FormField name={name} label={label} error={error}>
      <div className="rounded-lg border border-slate-200 bg-white p-2">
        <NepaliDateInput
          key={resetKey}
          value={dates.from}
          onDateChange={onDateChange}
          placeholder={placeholder}
        />
      </div>

      {dates.from && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
          <Icon size={13} className="shrink-0" />
          Selected: {dates.from}
          {dates.to && dates.to !== dates.from && ` – ${dates.to}`}
        </p>
      )}
    </FormField>
  );
}

function SectionTitle({ icon: Icon, title, description }) {
  return (
    <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#E87A24]">
        <Icon size={19} />
      </div>

      <div>
        <h3 className="text-sm font-extrabold text-[#422026]">{title}</h3>
        {description && (
          <p className="mt-0.5 text-xs font-bold text-slate-400">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

// A titled block of fields in a 2-column grid (`plain` skips the grid).
function Group({ title, icon: Icon, first, plain, children }) {
  return (
    <div className={first ? "" : "border-t border-slate-100 pt-5"}>
      {title && (
        <h4 className="mb-4 flex items-center gap-2 text-sm font-extrabold text-[#422026]">
          {Icon && <Icon size={16} className="shrink-0 text-[#E87A24]" />}
          {title}
        </h4>
      )}
      {plain ? (
        children
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
      )}
    </div>
  );
}

const BTN =
  "flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";
const BTN_PRIMARY = `${BTN} bg-[#E87A24] px-5 text-white hover:bg-[#D96C19]`;

/* =========================================================
   SUCCESS ANIMATION
========================================================= */

const PARTICLE_COLORS = ["#10B981", "#E87A24", "#3B82F6", "#F59E0B"];

const PARTICLES = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2;
  const distance = i % 2 ? 56 : 74;
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
  };
});

function SuccessAnimation({ isEdit, reduceMotion }) {
  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex min-h-[420px] w-full flex-col items-center justify-center gap-6 rounded-xl border border-slate-200 bg-white p-8 text-center"
    >
      <div className="relative flex h-32 w-32 items-center justify-center">
        {!reduceMotion &&
          [0, 1].map((i) => (
            <motion.span
              key={i}
              className="absolute h-24 w-24 rounded-full border-2 border-emerald-400"
              initial={{ scale: 0.8, opacity: 0.7 }}
              animate={{ scale: 1.9, opacity: 0 }}
              transition={{
                duration: 1.3,
                delay: 0.35 + i * 0.3,
                ease: "easeOut",
                repeat: 1,
              }}
            />
          ))}

        {!reduceMotion &&
          PARTICLES.map((p, i) => (
            <motion.span
              key={i}
              className="absolute h-2 w-2 rounded-full"
              style={{ backgroundColor: p.color }}
              initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
              animate={{
                x: p.x,
                y: p.y,
                scale: [0, 1.2, 0],
                opacity: [1, 1, 0],
              }}
              transition={{ duration: 0.9, delay: 0.4, ease: "easeOut" }}
            />
          ))}

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 16 }}
          className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-200"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-12 w-12"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <motion.path
              d="M5 12.5l4.5 4.5L19 7.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.3, duration: 0.45, ease: "easeOut" }}
            />
          </svg>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.35 }}
        className="space-y-1.5"
      >
        <h3 className="text-lg font-extrabold text-[#422026]">
          {isEdit ? "Lead updated" : "Lead created"}
        </h3>
        <p className="text-sm text-slate-500">
          {isEdit
            ? "Your changes have been saved."
            : "The lead and organization were saved successfully."}
        </p>
      </motion.div>

      <div className="h-1 w-40 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className="h-full rounded-full bg-emerald-500"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.1, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
}

/* =========================================================
   LOCATION HOOK  (province -> district -> local level)
========================================================= */

function useLocation(data, patchData) {
  const province = data.province?.value;
  const district = data.district?.value;

  const provinces = useMemo(
    () => toOptions(Object.keys(provinceDistricts)),
    [],
  );
  const districts = useMemo(
    () => (province ? toOptions(getDistrictNames(province)) : []),
    [province],
  );
  const localLevels = useMemo(
    () =>
      province && district
        ? toOptions(getLocalLevelNames(province, district))
        : [],
    [province, district],
  );

  return {
    provinces,
    districts,
    localLevels,
    onProvince: (value) =>
      patchData({
        province: value,
        provinceNumber: numberOption(value && provinceNumbers[value.value]),
        district: null,
        localLevel: null,
      }),
    onDistrict: (value) => patchData({ district: value, localLevel: null }),
  };
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function LeadFormStepper({
  onClose,
  onCancel,
  onSubmit,
  onUpdate,
  data = null,
  initialData = null,
  isEdit = false,
  isEditMode,
  salesRepOptions = [],
  salesManagerOptions = [],
}) {
  const { addOrgLeadDetails } = UseAdd();
  const reduceMotion = useReducedMotion();
  const selectedData = data ?? initialData;
  // Edit only when an edit flag is set AND there is a record to edit.
  // A stray isEdit/isEditMode flag with no record is an add, so it uses the add method.
  const hasRecord =
    !!selectedData &&
    typeof selectedData === "object" &&
    Object.keys(selectedData).length > 0;
  const editMode = Boolean(isEditMode ?? isEdit) && hasRecord;
  const closeForm = onClose || onCancel;
  const initialValues = useMemo(
    () => formValuesFromLead(selectedData),
    [selectedData],
  );
  const initialLeadDate = useMemo(
    () => getLeadDateFromRecord(selectedData),
    [selectedData],
  );

  const formRef = useRef(null);
  const pendingScrollRef = useRef(false);

  const [activeStep, setActiveStep] = useState(1);
  const [direction, setDirection] = useState(1);
  // { lead, organization, leadPickTime }
  const [values, setValues] = useState(() =>
    editMode ? initialValues : emptyValues,
  );
  const [leadDate, setLeadDate] = useState("");
  const [dateResetKey, setDateResetKey] = useState(0);
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const { lead: leadData, organization: orgData } = values;
  const contacts = orgData.alternativeContacts;
  const isEducationService =
    Array.isArray(leadData.ProductInterested) &&
    leadData.ProductInterested.some((item) => item.value === "iso21001");

  // Reset everything when the record being edited changes.
  useEffect(() => {
    setValues(editMode ? initialValues : emptyValues);
    setLeadDate(editMode ? initialLeadDate : "");
    setDateResetKey((k) => k + 1);
    setTouched({});
    setActiveStep(1);
    setDirection(1);
    pendingScrollRef.current = false;
    setIsSubmitting(false);
    setSubmitError("");
    setShowSuccess(false);
  }, [initialValues, initialLeadDate, editMode]);

  /* ------------------------ state helpers ------------------------ */

  const patch = (section, changes) =>
    setValues((v) => ({ ...v, [section]: { ...v[section], ...changes } }));
  const updateLead = (name, value) => patch("lead", { [name]: value });
  const updateOrganization = (name, value) =>
    patch("organization", { [name]: value });

  const leadLoc = useLocation(leadData, (changes) => patch("lead", changes));
  const orgLoc = useLocation(orgData, (changes) =>
    patch("organization", changes),
  );

  /* ------------------------ validation ------------------------ */

  const errors = useMemo(
    () => computeErrors(leadData, orgData, isEducationService),
    [leadData, orgData, isEducationService],
  );

  // Errors show only after a field is blurred or its step was attempted.
  const touch = (key) =>
    setTouched((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  const touchKeys = (keys) =>
    setTouched((prev) => ({
      ...prev,
      ...Object.fromEntries(keys.map((k) => [k, true])),
    }));

  const fp = (key) => ({
    name: key,
    error: touched[key] ? errors[key] || "" : "",
    onBlur: () => touch(key),
  });

  // Props shared by every bound field: name, error, blur, value, change.
  const leadField = (name, extra) => ({
    ...fp(`lead.${name}`),
    value: leadData[name],
    onChange: (v) => updateLead(name, v),
    ...extra,
  });
  const orgField = (name, extra) => ({
    ...fp(`org.${name}`),
    value: orgData[name],
    onChange: (v) => updateOrganization(name, v),
    ...extra,
  });

  // Clear the summary banner once every error is fixed.
  useEffect(() => {
    if (
      submitError === VALIDATION_MESSAGE &&
      Object.keys(errors).length === 0
    ) {
      setSubmitError("");
    }
  }, [errors, submitError]);

  const scrollToFirstError = () => {
    setTimeout(() => {
      const target = formRef.current?.querySelector('[data-invalid="true"]');
      if (!target) return;

      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "center",
      });
      target
        .querySelector("input:not([readonly]):not([disabled]), textarea")
        ?.focus({ preventScroll: true });
    }, 80);
  };

  /* ------------------------ dates + contacts ------------------------ */

  const setContacts = (list) => updateOrganization("alternativeContacts", list);
  const addContact = () => {
    if (contacts.length < MAX_ALT_CONTACTS) {
      setContacts([
        ...contacts,
        { name: "", role: null, number: "", email: "" },
      ]);
    }
  };
  const updateContact = (index, name, value) =>
    setContacts(
      contacts.map((c, i) => (i === index ? { ...c, [name]: value } : c)),
    );
  const removeContact = (index) => {
    setContacts(contacts.filter((_, i) => i !== index));
    // Indexes shift after a removal, so drop stale touched flags.
    setTouched((prev) =>
      Object.fromEntries(
        Object.entries(prev).filter(([key]) => !key.startsWith("alt.")),
      ),
    );
  };

  /* ------------------------ payload ------------------------ */

  const normalizePayload = () => {
    const existing =
      selectedData?.organization ||
      selectedData?.organizationDetails?.[0] ||
      {};
    const services = (
      Array.isArray(leadData.ProductInterested)
        ? leadData.ProductInterested
        : []
    ).map((item) => item.value);
    const rep = leadData.assignedSalesRep.trim();
    const manager = leadData.salesManager.trim();
    const number = (s) => (s === "" ? null : Number(s));
    const educationOrKeep = (educationValue, keptValue, fallback) =>
      isEducationService ? educationValue : editMode ? keptValue : fallback;

    return {
      lead: {
        leadType: val(leadData.leadType),
        leadSource: val(leadData.leadSource),
        leadChannel: val(leadData.leadChannel),
        campaignName: leadData.campaignName.trim(),
        assignedSalesRep: rep,
        ProductInterested: services,
        notes: leadData.notes.trim(),
        provinceNumber: getProvinceNumber(leadData),
        province: val(leadData.province),
        district: val(leadData.district),
        localLevel: val(leadData.localLevel),
        salesManager: manager,
        LeadPickDate: leadDate,
      },
      ownership: {
        assignedSalesRep: rep,
        salesManager: manager,
        LeadPickDate: leadDate,
        LeadPickTime: values.leadPickTime,
      },
      organization: {
        organizationName: orgData.organizationName.trim(),
        organizationType: val(orgData.organizationType),
        industyType: orgData.industryType?.value
          ? [orgData.industryType.value]
          : [], // (sic) API field name
        standard:
          editMode && Array.isArray(existing.standard)
            ? existing.standard.map(getOptionValue)
            : services,
        registrationNumber: orgData.registrationNumber.trim(),
        vatPan: orgData.vatPan.trim(),
        provinceNumber: getProvinceNumber(orgData),
        province: val(orgData.province),
        district: val(orgData.district),
        localLevel: val(orgData.localLevel),
        orgTelephone: orgData.orgTelephone.trim(),
        orgEmail: orgData.orgEmail.trim(),
        totalEmp_learners: number(orgData.totalEmp_learners),
        totalEducator: educationOrKeep(
          number(orgData.totalEducator),
          existing.totalEducator ?? null,
          null,
        ),
        GradeFrom: educationOrKeep(
          orgData.fromGrade.trim(),
          toFormString(existing.GradeFrom),
          "",
        ),
        GradeTo: educationOrKeep(
          orgData.toGrade.trim(),
          toFormString(existing.GradeTo),
          "",
        ),
        contactPersonName: orgData.contactPersonName.trim(),
        role: val(orgData.role),
        contactPersonNumber: orgData.contactPersonNumber.trim(),
        contactPersonEmail: orgData.contactPersonEmail.trim(),
        alternativeContacts: contacts.map((c) => ({
          name: c.name.trim(),
          role: val(c.role),
          number: c.number.trim(),
          email: c.email.trim(),
        })),
      },
    };
  };

  /* ------------------------ navigation + submit ------------------------ */

  const goToStep = (step, dir) => {
    setDirection(dir);
    setActiveStep(step);
    setSubmitError("");
  };

  const validateStep = (step) => {
    const keys = Object.keys(errors).filter((key) => stepOfKey(key) === step);
    if (keys.length === 0) return true;

    touchKeys(keys);
    scrollToFirstError();
    return false;
  };

  const nextStep = () => {
    if (activeStep < 3 && validateStep(activeStep)) goToStep(activeStep + 1, 1);
  };

  const previousStep = () => {
    if (activeStep > 1) goToStep(activeStep - 1, -1);
  };

  const submitLead = async (payload) => {
    // UPDATE
    if (editMode) {
      if (typeof onUpdate !== "function") {
        throw new Error("Update handler is missing.");
      }

      return onUpdate(payload, {
        isEdit: true,
        record: selectedData,
      });
    }

    // ADD - no props required
    if (typeof addOrgLeadDetails?.mutateAsync !== "function") {
      throw new Error("Add mutation is not configured.");
    }

    return addOrgLeadDetails.mutateAsync(payload);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (activeStep < 3) {
      nextStep();
      return;
    }

    const submitter = event.nativeEvent?.submitter;
    if (!submitter || submitter.type !== "submit") return;
    if (isSubmitting || showSuccess) return;

    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      touchKeys(errorKeys);
      setSubmitError(VALIDATION_MESSAGE);

      const firstStep = Math.min(...errorKeys.map(stepOfKey));
      if (firstStep !== activeStep) {
        pendingScrollRef.current = true;
        setDirection(firstStep > activeStep ? 1 : -1);
        setActiveStep(firstStep);
      } else {
        scrollToFirstError();
      }
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");

      const payload = normalizePayload();

      await submitLead(payload);

      SuccessNotify(
        editMode ? "Lead Updated Successfully" : "Lead Created Successfully",
      );
      setShowSuccess(true);

      setTimeout(() => closeForm?.(), 2300);
    } catch (error) {
      console.error("Lead submission failed:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to save the lead. Please try again.";

      setSubmitError(message);
      ErrorNotify(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepVariants = useMemo(() => {
    const offset = reduceMotion ? 0 : 40;
    return {
      initial: (dir) => ({ opacity: 0, x: dir > 0 ? offset : -offset }),
      animate: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
      },
      exit: (dir) => ({
        opacity: 0,
        x: dir > 0 ? -offset : offset,
        transition: { duration: 0.16, ease: "easeIn" },
      }),
    };
  }, [reduceMotion]);

  /* ======================= STEP RENDERERS ======================= */

  // Select when options are provided, free text otherwise.
  const ownerField = (name, label, icon, options, required) => {
    const current = leadData[name];

    return options.length > 0 ? (
      <SelectField
        {...leadField(name)}
        label={label}
        icon={icon}
        required={required}
        options={options}
        value={
          options.find((o) => o.value === current) ||
          (current ? { value: current, label: current } : null)
        }
        onChange={(option) => updateLead(name, option?.value || "")}
      />
    ) : (
      <TextInput
        {...leadField(name)}
        label={label}
        icon={icon}
        required={required}
      />
    );
  };

  const renderLocation = (title, data, loc, field) => (
    <Group title={title} icon={MapPin}>
      {/* Province number is intentionally not shown; it is set from the province and sent in the payload. */}
      <SelectField
        {...field("province")}
        label="Province"
        icon={MapIcon}
        required
        options={loc.provinces}
        onChange={loc.onProvince}
      />
      <SelectField
        {...field("district")}
        label="District"
        icon={MapPinned}
        required
        options={loc.districts}
        onChange={loc.onDistrict}
        isDisabled={!data.province}
      />
      <SelectField
        {...field("localLevel")}
        label="Local Level"
        icon={Landmark}
        options={loc.localLevels}
        isDisabled={!data.district}
      />
    </Group>
  );

  // Same four fields for the primary contact and every alternative contact.
  const renderContactFields = (field, labels) => (
    <>
      <TextInput
        {...field("name")}
        label={labels.name}
        icon={UserRound}
        required
      />
      <SelectField
        {...field("role")}
        label={labels.role}
        icon={Briefcase}
        options={BusinessRole}
      />
      <TextInput
        {...field("number")}
        label={labels.number}
        icon={Smartphone}
        phone
        required
      />
      <TextInput
        {...field("email")}
        label={labels.email}
        icon={Mail}
        type="email"
      />
    </>
  );

  const primaryKeys = {
    name: "contactPersonName",
    role: "role",
    number: "contactPersonNumber",
    email: "contactPersonEmail",
  };

  const renderLeadStep = () => (
    <div className="space-y-6">
      <SectionTitle
        icon={ClipboardList}
        title="Lead Information"
        description="Enter the lead source, type and the services the lead is interested in."
      />

      <Group first>
        <SelectField
          {...leadField("leadType")}
          label="Lead Type"
          icon={Target}
          required
          options={leadType}
        />
        <SelectField
          {...leadField("leadSource")}
          label="Lead Source"
          icon={Share2}
          required
          options={LeadSource}
        />
        <SelectField
          {...leadField("leadChannel")}
          label="Lead Channel"
          icon={Radio}
          required
          options={LeadChannel}
        />
        <TextInput
          {...leadField("campaignName")}
          label="Campaign Name"
          icon={Megaphone}
        />
      </Group>

      <Group>
        <SelectField
          {...leadField("ProductInterested", {
            onChange: (value) => updateLead("ProductInterested", value || []),
          })}
          label="Services Interested"
          icon={BadgeCheck}
          required
          isMulti
          options={servicesInterested}
          placeholder="Select interested services..."
          className="md:col-span-2"
        />
      </Group>
    </div>
  );

  const renderOrganizationStep = () => (
    <div className="space-y-6">
      <SectionTitle
        icon={Building2}
        title="Organization & Contact"
        description="Organization profile, address and contact information."
      />

      <Group first title="Organization Details">
        <TextInput
          {...orgField("organizationName")}
          label="Organization Name"
          icon={Building2}
          required
        />
        <SelectField
          {...orgField("organizationType")}
          label="Organization Type"
          icon={Landmark}
          required
          options={organizationType}
        />
        <TextInput
          {...orgField("registrationNumber")}
          label="Registration Number"
          icon={FileText}
        />
        <TextInput {...orgField("vatPan")} label="VAT / PAN" icon={Receipt} />
        <SelectField
          {...orgField("industryType", {
            onChange: (value) =>
              updateOrganization("industryType", value || null),
          })}
          label="Industry Type"
          icon={Factory}
          options={industries}
          placeholder="Select industry type..."
          className="md:col-span-2"
        />
      </Group>

      {renderLocation("Organization Location", orgData, orgLoc, orgField)}

      <Group title="Organization Contact">
        <TextInput
          {...orgField("orgTelephone")}
          label="Organization Telephone"
          icon={Phone}
          phone
        />
        <TextInput
          {...orgField("orgEmail")}
          label="Organization Email"
          icon={Mail}
          type="email"
        />
      </Group>

      <Group title="Organization Size">
        {isEducationService ? (
          <>
            <TextInput
              {...orgField("totalEmp_learners")}
              label="Total Learners"
              icon={GraduationCap}
              numeric
              required
            />
            <TextInput
              {...orgField("totalEducator")}
              label="Total Educators"
              icon={School}
              numeric
            />
            <TextInput
              {...orgField("fromGrade")}
              label="From Grade"
              icon={BookOpen}
              alphanumeric
              maxLength={20}
            />
            <TextInput
              {...orgField("toGrade")}
              label="To Grade"
              icon={BookOpen}
              alphanumeric
              maxLength={20}
            />
          </>
        ) : (
          <TextInput
            {...orgField("totalEmp_learners")}
            label="Total Employees"
            icon={Users}
          />
        )}
      </Group>

      <Group title="Primary Contact Person">
        {renderContactFields((f) => orgField(primaryKeys[f]), {
          name: "Contact Person Name",
          role: "Business Role",
          number: "Contact Person Number",
          email: "Contact Person Email",
        })}
      </Group>

      <Group plain>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-extrabold text-[#422026]">
              Alternative Contacts
            </h4>
            <p className="mt-1 text-xs text-slate-400">
              Add up to five additional organization contacts.
            </p>
          </div>

          <button
            type="button"
            onClick={addContact}
            disabled={contacts.length >= MAX_ALT_CONTACTS}
            className={`${BTN} bg-orange-50 px-3 py-2 text-xs text-[#E87A24] hover:bg-orange-100`}
          >
            <Plus size={15} />
            Add Contact
          </button>
        </div>

        {contacts.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">
            No alternative contacts added.
          </div>
        )}

        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {contacts.map((contact, index) => (
              <motion.div
                key={index}
                layout={!reduceMotion}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#422026]">
                    Alternative Contact {index + 1}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeContact(index)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50"
                    aria-label="Remove alternative contact"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {renderContactFields(
                    (f) => ({
                      ...fp(`alt.${index}.${f}`),
                      value: contact[f],
                      onChange: (v) => updateContact(index, f, v),
                    }),
                    {
                      name: "Name",
                      role: "Role",
                      number: "Phone Number",
                      email: "Email",
                    },
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Group>
    </div>
  );

  const renderOwnershipStep = () => (
    <div className="space-y-6">
      <SectionTitle
        icon={UserRound}
        title="Lead Ownership"
        description="Assign the lead and enter its location and notes."
      />

      <Group first title="Lead Assignment">
        {ownerField(
          "assignedSalesRep",
          "Assigned Sales Representative",
          UserCog,
          salesRepOptions,
          true,
        )}
        {ownerField(
          "salesManager",
          "Branch Manager",
          ShieldCheck,
          salesManagerOptions,
        )}
      </Group>

      {renderLocation("Lead Location", leadData, leadLoc, leadField)}

      <Group title="Lead Dates" icon={CalendarDays}>
        <DateField
          name="lead.LeadPickDate"
          label="Lead Pick Date"
          icon={CalendarDays}
          dates={{ from: leadDate, to: "" }}
          onDateChange={setLeadDate}
          placeholder="Select lead pick date"
          resetKey={dateResetKey}
        />
        <TextInput
          name="lead.LeadPickTime"
          label="Lead Pick Time"
          icon={CalendarClock}
          type="time"
          step="1"
          value={values.leadPickTime}
          onChange={(time) => setValues((v) => ({ ...v, leadPickTime: time }))}
        />
      </Group>

      <Group>
        <TextArea
          {...leadField("notes")}
          label="Lead Notes"
          icon={StickyNote}
          placeholder="Enter lead notes..."
          className="md:col-span-2"
        />
      </Group>
    </div>
  );

  /* ============================ RENDER ============================ */

  if (showSuccess) {
    return <SuccessAnimation isEdit={editMode} reduceMotion={reduceMotion} />;
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.target.tagName === "INPUT")
          e.preventDefault();
      }}
      noValidate
      className="w-full space-y-5"
    >
      <style>{`
                @keyframes lead-field-shake {
                    0%, 100% { transform: translateX(0); }
                    20% { transform: translateX(-5px); }
                    40% { transform: translateX(5px); }
                    60% { transform: translateX(-3px); }
                    80% { transform: translateX(3px); }
                }
                .lead-field-shake { animation: lead-field-shake 0.36s ease-in-out; }
                @media (prefers-reduced-motion: reduce) { .lead-field-shake { animation: none; } }
            `}</style>

      {/* STEPPER HEADER */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-start justify-between gap-2">
          {STEPS.map((step, index) => {
            const completed = activeStep > step.id;
            const active = activeStep === step.id;
            const Icon = step.icon;

            return (
              <React.Fragment key={step.id}>
                <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
                  <motion.div
                    animate={{ scale: active ? 1.08 : 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors duration-300 ${
                      completed
                        ? "border-[#E87A24] bg-[#E87A24] text-white shadow-sm"
                        : active
                          ? "border-[#E87A24] bg-orange-50 text-[#E87A24] shadow-md shadow-orange-100"
                          : "border-slate-200 bg-white text-slate-400"
                    }`}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={completed ? "done" : "icon"}
                        initial={{
                          scale: completed ? 0 : 0.6,
                          rotate: completed ? -90 : 0,
                        }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.18 }}
                        className="flex items-center justify-center"
                      >
                        {completed ? <Check size={18} /> : <Icon size={18} />}
                      </motion.span>
                    </AnimatePresence>
                  </motion.div>

                  <div className="text-center">
                    <p
                      className={`text-xs font-extrabold transition-colors sm:text-sm ${
                        active || completed
                          ? "text-[#422026]"
                          : "text-slate-400"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="mt-1 hidden text-[11px] font-bold text-slate-400 sm:block">
                      {step.description}
                    </p>
                  </div>
                </div>

                {index !== STEPS.length - 1 && (
                  /* mt-5 (20px) centers a 2px horizontal line vertically relative to the 40px (h-10) circle */
                  <div className="mt-5 h-[2px] flex-1 overflow-hidden rounded-full bg-slate-200">
                    <motion.div
                      className="h-full bg-[#E87A24] shadow-[0_0_8px_rgba(232,122,36,0.6)]"
                      initial={false}
                      animate={{ width: activeStep > step.id ? "100%" : "0%" }}
                      transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* FORM CONTENT */}
      <div className="min-h-[350px] overflow-x-hidden rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={activeStep}
            custom={direction}
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onAnimationComplete={(definition) => {
              if (definition === "animate" && pendingScrollRef.current) {
                pendingScrollRef.current = false;
                scrollToFirstError();
              }
            }}
          >
            {activeStep === 1 && renderLeadStep()}
            {activeStep === 2 && renderOrganizationStep()}
            {activeStep === 3 && renderOwnershipStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* SUBMIT ERROR */}
      <AnimatePresence initial={false}>
        {submitError && (
          <motion.div
            role="alert"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="flex items-start gap-2 font-semibold rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-600"
          >
            {/* leading-5 (20px) - icon 16px => 2px offset centres it on the first line */}
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{submitError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NAVIGATION */}
      <div className="flex items-center justify-between gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={activeStep === 1 ? closeForm : previousStep}
          disabled={isSubmitting}
          className={`${BTN} border border-slate-200 px-4 text-slate-600 hover:bg-slate-50`}
        >
          <ArrowLeft size={16} />
          {activeStep === 1 ? "Cancel" : "Previous"}
        </motion.button>

        {activeStep < 3 ? (
          <motion.button
            key="btn-continue"
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={nextStep}
            className={BTN_PRIMARY}
          >
            Continue
            <ArrowRight size={16} />
          </motion.button>
        ) : (
          <motion.button
            key="btn-submit"
            type="submit"
            whileTap={{ scale: 0.97 }}
            disabled={isSubmitting}
            className={BTN_PRIMARY}
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                {editMode ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                {editMode ? "Update Lead" : "Create Lead"}
                <Check size={16} />
              </>
            )}
          </motion.button>
        )}
      </div>
    </form>
  );
}
