import React, { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  UploadCloud,
  Check,
  ClipboardList,
  ArrowRight,
  ArrowLeft,
  X,
  AlertCircle,
  UserPlus,
  ChevronRight,
  Briefcase,
  Plus,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar as CalendarIcon,
  CreditCard,
  Award,
  Hash,
  Heart,
  FileText,
  Pencil,
  Trash2,
  LoaderCircle,
} from "lucide-react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import { ClientEmp_form } from "../../../data/data.jsx";
import Select, { components as selectComponents } from "react-select";
import makeAnimated from "react-select/animated";
import NepaliDateInput from "../../nepalidate/testDate.jsx";
import { SuccessNotify, ErrorNotify, waitingNotify, dismissWaitingNotify } from "../../hotToaster.jsx";
import { UseAdd } from "../../hooks/useadd.jsx";
import { provinceDistricts, getDistrictNames, getLocalLevelNames } from "../../province.js";
import { useAuth } from "../../hooks/useAuth.js";
import { validateDob, validateExperience } from "../../../utils/recruitmentDateValidation.js";
import { useEdit } from "../../hooks/useEdit.js";
import { useGet } from "../../hooks/useGet.js";

// ==============================
// CONSTANTS
// ==============================
const OPTIONAL_FIELDS = new Set(["officeEmail", "officeMobile", "middleName"]);
const SPOUSE_FIELDS = ["spouseName", "spouseOccupation", "spousePhone", "numberOfChildren"];
const HIDDEN_FIELDS = new Set(["totalExperience", "status", "office", "reportingManager"]);
const DOCUMENT_FILE_NAMES = ["resume", "offerLetter", "citizenDoc", "qualification", "training", "experience"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];
const ALLOWED_FILE_EXTENSIONS = ["pdf", "png", "jpg", "jpeg", "docx"];
const STAFF_RESTRICTED_DEPARTMENTS = ["Corporate HR", "Corporate CRO"];
const ERP_IT_JOB_POSITIONS = ["Digital Marketing", "ERP Support"];

const provinceNumbers = {
  "Koshi Province": 1,
  "Madhesh Province": 2,
  "Bagmati Province": 3,
  "Gandaki Province": 4,
  "Lumbini Province": 5,
  "Karnali Province": 6,
  "Sudurpashchim Province": 7,
};

const STEP_EASE = [0.22, 1, 0.36, 1];
// A click on the final Submit button is ignored if it lands within this window after the
// document step opened. This stops a double-click on "Continue" from "clicking through"
// onto the Submit button that appears in the same screen position.
const SUBMIT_ARM_DELAY_MS = 600;
const STEP_DESCRIPTIONS = ["Personal details", "How to reach you", "Role and placement", "Experience and files"];

const sectionKey = (index) => ClientEmp_form[index]?.title.toLowerCase() || "personal";
const PERSONAL_PREFIX = sectionKey(0);
const EXPERIENCE_STEP_INDEX = Math.max(
  ClientEmp_form.findIndex((section) => section.fields.some((f) => f.type === "repeatable")),
  0
);

const BTN_BASE =
  "flex cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-50";
const BTN_PRIMARY = `${BTN_BASE} bg-[#E87A24] px-5 py-2.5 text-white hover:bg-[#D96C19]`;
const BTN_SECONDARY = `${BTN_BASE} border border-slate-200 bg-white px-4 py-2.5 text-slate-600 hover:bg-slate-50`;

const servicesInterested = [
  { label: "ISO 9001:2015 QMS (Quality Management System)", value: "iso9001", color: "#E87A24" },
  { label: "ISO 14001:2015 EMS (Environmental Management System)", value: "iso14001", color: "#10b981" },
  { label: "ISO 45001:2018 OHSMS (Occupational Health & Safety Management System)", value: "iso45001", color: "#ef4444" },
  { label: "ISO 27001:2022 ISMS (Information Security Management System)", value: "iso27001", color: "#f59e0b" },
  { label: "ISO 22000:2018 FSMS (Food Safety Management System)", value: "iso22000", color: "#f97316" },
  { label: "HACCP Certification (Hazard Analysis & Critical Control Points)", value: "haccp", color: "#ea580c" },
  { label: "HALAL Certification", value: "halal", color: "#16a34a" },
  { label: "ISO 15189:2022 Medical Laboratory QMS", value: "iso15189", color: "#8b5cf6" },
  { label: "GMP (Good Manufacturing Practices)", value: "gmp", color: "#0ea5e9" },
  { label: "ISO 50001:2018 EnMS (Energy Management System)", value: "iso50001", color: "#06b6d4" },
  { label: "ISO 21001:2025 EOMS (Educational Organizations Management System)", value: "iso21001", color: "#6366f1" },
  { label: "ISO 55001:2024 Asset Management System", value: "iso55001", color: "#64748b" },
  { label: "ISO 41001:2018 Facility Management System", value: "iso41001", color: "#475569" },
  { label: "SMETA Sedex Audits", value: "smeta", color: "#ec4899" },
  { label: "RBA Compliance", value: "rba", color: "#1e3a8a" },
  { label: "CE Marking (Conformité Européenne)", value: "ce_marking", color: "#1d4ed8" },
  { label: "ISO 26000:2010 Social Responsibility Guidance", value: "iso26000", color: "#d946ef" },
  { label: "Training Programs", value: "training_programs", color: "#f43f5e" },
  { label: "Third Party Audits", value: "third_party_audits", color: "#422026" },
];

const DEPARTMENT_JOB_MAP = {
  "Corporate HR": ["HR"],
  "Corporate Finance": ["HR"],
  "Corporate CRO": ["CRO"],
  "Corporate Sales": ["sales"],
  "Corporate Operations": ["Operation Manager"],
  "Corporate Reception": ["Receptionist"],
  "Corporate Document Control": ["Document Controller", "Document Writer"],
  "Corporate IT Support": ["ERP Support"],
  "Corporate ERP & IT": ERP_IT_JOB_POSITIONS,
  Consultancy: ["Consultant"],
  "Consultancy ": ["Consultant "],
};

// ==============================
// HELPERS
// ==============================
const normalizeDepartment = (department) => String(department || "").trim().toLowerCase();

const isCorporateSalesDepartment = (department) =>
  normalizeDepartment(department) === "corporate sales";

const getDepartmentJobPositions = (department) => {
  const normalizedDepartment = normalizeDepartment(department);
  const entry = Object.entries(DEPARTMENT_JOB_MAP).find(
    ([name]) => normalizeDepartment(name) === normalizedDepartment
  );
  return entry?.[1];
};

const getJobPositionForDepartment = (department, jobPosition) => {
  if (isCorporateSalesDepartment(department)) return "sales";
  const normalizedPosition = String(jobPosition || "").trim();
  return normalizedPosition.toLowerCase() === "sales" ? "" : normalizedPosition;
};

const isOptionalField = (field) => {
  if (Object.prototype.hasOwnProperty.call(field, "required")) return !field.required;
  return field.type === "file" || field.type === "repeatable" || OPTIONAL_FIELDS.has(field.name);
};

const isDateLike = (field) => field.type === "date" || /date|dob/i.test(field.name);

const sanitizeInput = (value, sanitizer) => {
  if (sanitizer === "numeric") return value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  if (sanitizer === "phone") return value.replace(/[^\d+\-\s]/g, "");
  if (sanitizer === "alphanumeric") return value.replace(/[^a-z\d]/gi, "");
  return value;
};

const getSanitizer = (name = "", type = "", explicit) =>
  explicit || (type === "number" ? "numeric" : type === "tel" || /mobile|phone|contact/i.test(name) ? "phone" : undefined);

const getFieldIcon = (name = "", type = "") => {
  const lower = name.toLowerCase();
  if (lower.includes("email")) return <Mail size={16}  className="-mt-2" />;
  if (lower.includes("phone") || lower.includes("mobile") || lower.includes("contact") || type === "tel") return <Phone size={16}  className="-mt-2" />;
  if (lower.includes("address") || lower.includes("location") || lower.includes("city")) return <MapPin size={16} className="-mt-2"  />;
  if (lower.includes("office") || lower.includes("company") || lower.includes("organization") || lower.includes("department")) return <Building2 size={16} className="-mt-2" />;
  if (lower.includes("job") || lower.includes("position") || lower.includes("occupation") || lower.includes("designation")) return <Briefcase size={16} className="-mt-2" />;
  if (lower.includes("date") || lower.includes("dob") || type === "date") return <CalendarIcon size={16} className="-mt-2" />;
  if (lower.includes("iso") || lower.includes("service")) return <Award size={16} className="-mt-2" />;
  if (lower.includes("pan") || lower.includes("citizen") || lower.includes("nid") || lower.includes("account") || lower.includes("bank")) return <CreditCard size={16} className="-mt-2" />;
  if (lower.includes("children") || lower.includes("salary") || lower.includes("number") || type === "number") return <Hash size={16} className="-mt-2"  />;
  if (lower.includes("spouse") || lower.includes("marital")) return <Heart size={16}  />;
  if (lower.includes("name")) return <User size={16} className="-mt-2" />;
  return <FileText size={16} className="-mt-2" />;
};

const getNepaliDateLabel = (name = "", fallbackLabel = "") => {
  const lower = name.toLowerCase();
  if (lower.includes("birth") || lower === "dob") return "Date of Birth (B.S.)";
  if (lower.includes("start")) return "Start Date (B.S.)";
  if (lower.includes("end")) return "End Date (B.S.)";
  if (lower.includes("issue")) return "Issued Date (B.S.)";
  if (lower.includes("expiry") || lower.includes("expire")) return "Expiry Date (B.S.)";
  return fallbackLabel ? `${fallbackLabel} (B.S.)` : "Date (B.S.)";
};

const normalizeOptions = (options = []) =>
  options.map((item) => (typeof item === "string" ? { label: item.trim(), value: item.trim() } : item));

const calculateTenure = (start, end) => {
  if (!start || !end) return "";
  const parseParts = (str) => {
    const parts = String(str).split(/[-/]/).map(Number);
    return parts.length >= 2 && parts.every((n) => !Number.isNaN(n))
      ? { year: parts[0], month: parts[1], day: parts[2] || 1 }
      : null;
  };

  const s = parseParts(start);
  const e = parseParts(end);
  if (!s || !e) return "";

  const startKey = s.year * 10000 + s.month * 100 + s.day;
  const endKey = e.year * 10000 + e.month * 100 + e.day;
  if (endKey < startKey) return "Invalid Dates";

  let years = e.year - s.year;
  let months = e.month - s.month;
  if (e.day < s.day) months--;
  if (months < 0) {
    years--;
    months += 12;
  }
  if (years === 0 && months === 0) return "Less than 1 Mo";

  const res = [];
  if (years > 0) res.push(`${years} Yr${years > 1 ? "s" : ""}`);
  if (months > 0) res.push(`${months} Mo${months > 1 ? "s" : ""}`);
  return res.join(", ");
};

const hasRealValue = (value) => {
  if (Array.isArray(value)) {
    return value.some((item) =>
      item && typeof item === "object"
        ? Object.entries(item).some(([k, v]) => k !== "_id" && k !== "tenure" && Boolean(v))
        : Boolean(item)
    );
  }
  return Boolean(value);
};

let repeatableIdCounter = 0;
const newRowId = () => `experience-${++repeatableIdCounter}`;

// ==============================
// REACT-SELECT STYLING
// ==============================
const animatedComponents = makeAnimated();

export const customSelectStyles = (hasError) => ({
  control: (base, state) => ({
    ...base,
    minHeight: 42,
    border: `1px solid ${hasError ? "#EF4444" : state.isFocused ? "#E87A24" : "#E2E8F0"}`,
    borderRadius: "9px",
    backgroundColor: state.isDisabled ? "#F8FAFC" : "#ffffff",
    cursor: state.isDisabled ? "not-allowed" : "pointer",
    boxShadow: hasError
      ? "0 0 0 3px rgba(239,68,68,0.15)"
      : state.isFocused
        ? "0 0 0 3px rgba(232,122,36,0.10)"
        : "none",
    "&:hover": { borderColor: hasError ? "#EF4444" : "#E87A24" },
    transition: "all 0.2s ease",
  }),
  valueContainer: (base) => ({ ...base, minWidth: 0, padding: "0 8px" }),
  input: (base) => ({ ...base, color: "#422026", fontSize: 13, fontWeight: 500 }),
  singleValue: (base) => ({ ...base, color: "#422026", fontSize: 13, fontWeight: 500 }),
  placeholder: (base) => ({ ...base, color: "#94A3B8", fontSize: 13, fontWeight: 500 }),
  indicatorSeparator: () => ({ display: "none" }),
  menu: (base) => ({
    ...base,
    borderRadius: "9px",
    overflow: "hidden",
    boxShadow: "0 12px 24px rgba(15,23,42,0.12)",
    marginTop: "6px",
    zIndex: 100,
    border: "1px solid #E2E8F0",
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  menuList: (base) => ({
    ...base,
    padding: "4px",
    maxHeight: 240,
    scrollbarWidth: "thin",
    scrollbarColor: "#CBD5E1 transparent",
    "&::-webkit-scrollbar": { width: 6 },
    "&::-webkit-scrollbar-thumb": { background: "#CBD5E1", borderRadius: 9999 },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? state.data.color || "#E87A24" : state.isFocused ? "#FFF1E6" : "#ffffff",
    color: state.isSelected ? "#ffffff" : "#422026",
    borderRadius: "6px",
    cursor: state.isDisabled ? "not-allowed" : "pointer",
    padding: "9px 10px",
    fontSize: "13px",
    fontWeight: 500,
    "&:active": { backgroundColor: state.data.color || "#D96C19" },
  }),
  multiValue: (base) => ({ ...base, backgroundColor: "#FFF1E6", borderRadius: "6px" }),
  multiValueLabel: (base) => ({ ...base, color: "#A64D0B", fontWeight: 600, fontSize: "12px" }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#A64D0B",
    ":hover": { backgroundColor: "#E87A24", color: "white" },
  }),
});

const IconControl = ({ children, ...props }) => (
  <selectComponents.Control {...props}>
    <span
      aria-hidden="true"
      className={`flex w-10 shrink-0 items-center justify-center self-stretch ${props.selectProps.hasError ? "text-red-500" : props.isFocused ? "text-[#E87A24]" : "text-slate-400"
        }`}
    >
      {props.selectProps.fieldIcon}
    </span>
    {children}
  </selectComponents.Control>
);

const selectComponentsWithIcon = { ...animatedComponents, Control: IconControl };

// ==============================
// MAIN FORM
// ==============================
const RecruitmentForm = ({ onClose, onSuccess, isEdit=false, empData=[] }) => {
  const { useMe } = useAuth();
  const { role, id } = useMe?.data?.user?.decoded || {};
  const { CreateRecruitmentFORSUPER_, CreateRecruitmentstaff_ } = UseAdd();
  const { editRecruitmentForSuper_ } = useEdit();
  const { GetMeDetails_ } = useGet();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState({ isoService: "" });
  const [locationDetails, setLocationDetails] = useState({
    province: "",
    provinceName: "",
    districtName: "",
    localLevel: "",
  });
  const [touched, setTouched] = useState({});
  const [attemptedSteps, setAttemptedSteps] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [showMarriageForm, setShowMarriageForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const reduceMotion = useReducedMotion();

  const formRef = useRef(null);
  const submissionInProgressRef = useRef(false);
  const finalStepEnteredAtRef = useRef(0);
  const bodyRef = useRef(null);
  const pendingScrollRef = useRef(false);
  const spouseBackupRef = useRef(null);
  const escapeRef = useRef(() => { });
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const editingRecord = Array.isArray(empData) ? empData[0] : empData;
  const fetchStaffDetails = GetMeDetails_?.mutateAsync;

  useEffect(() => {
    if (role !== "staff" || !id || !fetchStaffDetails) return undefined;

    let active = true;
    const fetchStaffLocation = async () => {
      try {
        const { data } = await fetchStaffDetails({ params: { id } });

        if (!active) return;

        const location = {
          province: Number(data?.province) || "",
          provinceName: data?.provinceName || "",
          districtName: data?.districtName || "",
          localLevel: data?.localLevel || data?.localLevelName || "",
        };

        setLocationDetails(location);
        setFormData((previous) => ({
          ...previous,
          ...(location.provinceName ? { province: location.provinceName } : {}),
          ...(location.province ? { provinceIndex: location.province } : {}),
          ...(location.districtName ? { district: location.districtName } : {}),
          ...(location.localLevel ? { localLevel: location.localLevel } : {}),
        }));
      } catch (error) {
        console.error("Failed to fetch staff location:", error);
      }
    };

    fetchStaffLocation();
    return () => {
      active = false;
    };
  }, [role, id, fetchStaffDetails]);

  useEffect(() => {
    if (!isEdit || !editingRecord) return;

    const editingPersonal = editingRecord.personal || {};
    const editingContact = editingRecord.contact || {};
    const editingEmployment = editingRecord.employment || {};
    const editingDocuments = editingRecord.documents || {};
    const existingServices = Array.isArray(editingPersonal.services)
      ? editingPersonal.services
      : Array.isArray(editingRecord.isoService)
        ? editingRecord.isoService
        : [];
    const previousExperience = Array.isArray(editingDocuments.previousExperience)
      ? editingDocuments.previousExperience
      : Array.isArray(editingRecord.previousExperience)
        ? editingRecord.previousExperience
        : [];

    setFormData({
      firstName: editingPersonal.firstName || "",
      middleName: editingPersonal.middleName || "",
      lastName: editingPersonal.lastName || "",
      gender: editingPersonal.gender || "",
      dob: editingPersonal.dob || "",
      maritalStatus: editingPersonal.maritalStatus || "",
      nationality: editingPersonal.nationality || "Nepali",
      citizenshipId: editingPersonal.citizenshipId || "",
      profilePhoto: editingPersonal.profilePhoto || "",
      spouseName: editingPersonal.spouseName || "",
      spouseOccupation: editingPersonal.spouseOccupation || "",
      spousePhone: editingPersonal.spousePhone || "",
      numberOfChildren: editingPersonal.numberOfChildren ?? "",
      officeEmail: editingContact.officeEmail || "",
      personalEmail: editingContact.personalEmail || "",
      officeMobile: editingContact.officeMobile || "",
      personalMobile: editingContact.personalMobile || "",
      permanentAddress: editingContact.permanentAddress || "",
      currentAddress: editingContact.currentAddress || "",
      department: editingEmployment.department || "",
      jobPosition: getJobPositionForDepartment(
        editingEmployment.department,
        editingEmployment.jobPosition
      ),
      employmentType: editingEmployment.employmentType || "",
      province: editingEmployment.province || "",
      district: editingEmployment.district || "",
      localLevel: editingEmployment.localLevel || "",
      experienceType:
        editingDocuments.experienceType ||
        editingRecord.experienceType ||
        "fresher",
      totalExperience:
        editingDocuments.totalExperience ??
        editingRecord.totalExperience ??
        "",
      previousExperience: previousExperience.map((record) => ({
        ...record,
        _id: record?._id || newRowId(),
      })),
      isoService: editingEmployment.isoStandardCode || existingServices[0] || "",
      ...Object.fromEntries(
        DOCUMENT_FILE_NAMES.map((name) => [
          name,
          typeof editingDocuments[name] === "string"
            ? editingDocuments[name]
            : "",
        ]),
      ),
    });
    setStep(1);
    setTouched({});
    setAttemptedSteps({});
    setSubmitError("");
    setShowMarriageForm(false);
    setIsSuccess(false);
  }, [
    isEdit,
    editingRecord,
  ]);

  const isMarried = formData.maritalStatus === "Married";
  const isDirty = Object.entries(formData).some(([, value]) => hasRealValue(value));
  const allFields = ClientEmp_form.flatMap((s) => s.fields);

  const findField = (name) => {
    if (name === "isoService") {
      return { name: "isoService", label: "ISO Service", type: "select", required: true };
    }
    return allFields.find((f) => f.name === name);
  };

  const fieldErrorKey = (name, stepIndex = step - 1) => `${sectionKey(stepIndex)}.${name}`;

  const getVisibleFieldsForStep = (stepIdx, currentData) => {
    const currentFields = [...ClientEmp_form[stepIdx].fields];

    const isEmploymentStep = ClientEmp_form[stepIdx].title === "Employment" || stepIdx === 1;
    if (isEmploymentStep && !currentFields.find((f) => f.name === "isoService")) {
      currentFields.push({
        name: "isoService",
        label: "ISO Service",
        type: "select",
        options: servicesInterested,
        required: true,
      });
    }

    return currentFields.filter((f) => {
      if (HIDDEN_FIELDS.has(f.name) || SPOUSE_FIELDS.includes(f.name)) return false;
      if (f.name === "dateOfJoining") return false;
      if (["province", "district", "localLevel"].includes(f.name) && role !== "super_admin") return false;
      if (f.label && f.label.includes("Total Years of Experience")) return false;
      if (f.condition) return currentData[f.condition.field] === f.condition.value;
      return true;
    });
  };

  // ---------- validation ----------
  const validateField = (field, value) => {
    const optional = isOptionalField(field);

    if (field.isMulti || Array.isArray(value)) {
      if (!optional && (!value || value.length === 0)) return "Please select at least one option";
      return "";
    }

    if (field.type === "repeatable") {
      if (!optional && (value || []).length === 0) return "At least one entry is required";
      return "";
    }

    if (field.type === "file") {
      if (!value) return optional ? "" : "This field is required";
      if (value.size > MAX_FILE_SIZE) return "File must be 10MB or smaller";
      const extension = String(value.name || "").split(".").pop().toLowerCase();
      if (value.type && (!ALLOWED_FILE_TYPES.includes(value.type) || !ALLOWED_FILE_EXTENSIONS.includes(extension))) {
        return "Only PDF, PNG, JPG, JPEG and DOCX files are allowed!";
      }
      return "";
    }

    if (optional && (!value || value === "")) return "";
    if (!optional && (!value || value === "")) return "This field is required";
    if (field.name === "dob") {
      const result = validateDob(value);
      return result.valid ? "" : result.message;
    }
    if (isDateLike(field)) return "";

    const isPhone = field.type === "tel" || /mobile|phone|contact/i.test(field.name);
    const looksNumeric = field.type === "number" || isPhone;
    if (looksNumeric) {
      const digits = String(value).replace(/\D/g, "");
      if (!digits) return "Only numbers allowed";
      if (isPhone && (digits.length < 7 || digits.length > 15)) return "Phone number must have 7 to 15 digits";
      if (field.type === "number" && Number(value) < 0) return "Please enter a valid number";
    }

    const looksEmail = /email/i.test(field.name) || field.type === "email";
    if (looksEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim())) return "Invalid email address";

    if (
      typeof value === "string" &&
      field.type !== "select" &&
      field.type !== "radio" &&
      !looksEmail &&
      !looksNumeric &&
      value.trim().length < 3
    ) {
      return "Minimum 3 characters";
    }
    return "";
  };

  const validateMarriageFields = (data) => {
    const errors = {};
    SPOUSE_FIELDS.forEach((name) => {
      const value = data[name];
      let error = "";
      if (value === undefined || value === null || String(value).trim() === "") {
        error = "This field is required";
      } else if (name === "spousePhone") {
        const digits = String(value).replace(/\D/g, "");
        if (digits.length < 7 || digits.length > 15) error = "Phone number must have 7 to 15 digits";
      } else if (name === "numberOfChildren") {
        if (Number.isNaN(Number(value)) || Number(value) < 0) error = "Please enter a valid number";
      } else if (String(value).trim().length < 2) {
        error = "Minimum 2 characters";
      }
      if (error) errors[`${PERSONAL_PREFIX}.${name}`] = error;
    });
    return errors;
  };

  const computeErrors = (stepIndexes = ClientEmp_form.map((_, i) => i)) => {
    const nextErrors = {};
    stepIndexes.forEach((stepIndex) => {
      getVisibleFieldsForStep(stepIndex, formData).forEach((field) => {
        const key = `${sectionKey(stepIndex)}.${field.name}`;

        if (field.type === "repeatable") {
          const rows = formData[field.name] || [];
          if (!isOptionalField(field) && rows.length === 0) {
            nextErrors[key] = "At least one experience entry is required";
            return;
          }
          let hasRowError = false;
          rows.forEach((row, rowIndex) => {
            field.fields.forEach((nested) => {
              if (nested.readOnly) return;
              const v = row[nested.name];
              if (v === undefined || v === null || String(v).trim() === "") {
                nextErrors[`alt.${rowIndex}.${nested.name}`] = "This field is required";
                hasRowError = true;
              }
            });
            if (row.tenure === "Invalid Dates") {
              nextErrors[`alt.${rowIndex}.endDate`] = "End date must be after start date";
              hasRowError = true;
            }
            if (row.startDate && row.endDate) {
              const experienceResult = validateExperience(row.startDate, row.endDate);
              if (!experienceResult.valid) {
                const errorFields = experienceResult.message.startsWith("Start and end dates")
                  ? ["startDate", "endDate"]
                  : ["endDate"];
                errorFields.forEach((name) => {
                  nextErrors[`alt.${rowIndex}.${name}`] = experienceResult.message;
                });
                hasRowError = true;
              }
            }
          });
          if (hasRowError) nextErrors[key] = "Complete all highlighted experience fields";
          return;
        }

        const error = validateField(field, formData[field.name]);
        if (error) nextErrors[key] = error;
      });

      if (stepIndex === 0 && isMarried) Object.assign(nextErrors, validateMarriageFields(formData));
    });
    return nextErrors;
  };

  const computedErrors = computeErrors();
  const validationSummary = "Some fields need attention. Fix the highlighted fields and try again.";
  const visibleSubmitError =
    submitError === validationSummary && Object.keys(computedErrors).length === 0 ? "" : submitError;

  const getVisibleError = (key, stepIndex = step - 1) =>
    touched[key] || attemptedSteps[stepIndex] ? computedErrors[key] : "";

  const scrollToFirstError = () => {
    window.setTimeout(() => {
      const el = formRef.current?.querySelector('[data-invalid="true"]');
      if (!el) return;
      el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      el.querySelector("input, textarea, [tabindex]")?.focus({ preventScroll: true });
    }, 80);
  };

  // ---------- navigation ----------
  const handleNext = () => {
    const stepIndex = step - 1;
    const stepErrors = computeErrors([stepIndex]);
    setAttemptedSteps((current) => ({ ...current, [stepIndex]: true }));

    if (Object.keys(stepErrors).length === 0) {
      setSubmitError("");
      setDirection(1);
      setStep((prev) => prev + 1);
    } else {
      ErrorNotify("Please complete all required fields correctly before proceeding.");
      scrollToFirstError();
    }
  };

  const goToStep = (index) => {
    if (index === step - 1) return;
    setDirection(index > step - 1 ? 1 : -1);
    setStep(index + 1);
  };

  // Navigation only: never validates for submission and never touches the API.
  const handlePrevious = () => {
    if (step === 1) return requestClose();
    goToStep(step - 2);
  };

  const goToCompletedStep = (index) => {
    if (index < step - 1) goToStep(index);
  };

  // ---------- field handlers ----------
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    const field = findField(name);
    let val;

    if (name && (files || value === "") && field?.type === "file") {
      val = files ? files[0] || "" : "";
      setTouched((current) => ({ ...current, [fieldErrorKey(name)]: true }));
    } else {
      val = value;
      const type = e.target.type;
      const sanitizer = getSanitizer(name, type, field?.sanitizer);
      if (sanitizer && typeof val === "string") val = sanitizeInput(val, sanitizer);
    }

    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleDateChange = (name, nepaliDateStr) => {
    setFormData((prev) => ({ ...prev, [name]: nepaliDateStr }));
  };

  const openMarriageForm = (backup) => {
    spouseBackupRef.current = backup;
    setShowMarriageForm(true);
  };

  const emptySpouseBackup = {
    maritalStatus: "Single",
    spouseName: "",
    spouseOccupation: "",
    spousePhone: "",
    numberOfChildren: "",
  };

  const handleSelectChange = (opt, name, isMulti = false) => {
    const val = isMulti ? (opt ? opt.map((o) => o.value) : []) : opt ? opt.value : "";

    setFormData((prev) => {
      const updated = { ...prev, [name]: val };
      if (name === "department") {
        const jobPositionField = ClientEmp_form
          .flatMap((section) => section.fields)
          .find((field) => field.name === "jobPosition");
        const validPositions =
          normalizeDepartment(val) === "corporate erp & it"
            ? ERP_IT_JOB_POSITIONS
            : getDepartmentJobPositions(val) ||
              jobPositionField?.options ||
              [];

        if (isCorporateSalesDepartment(val)) {
          updated.jobPosition = "sales";
        } else if (
          String(prev.jobPosition || "").trim().toLowerCase() === "sales" ||
          !validPositions.includes(prev.jobPosition)
        ) {
          updated.jobPosition = "";
        }
      }
      if (name === "province") {
        updated.district = "";
        updated.localLevel = "";
      }
      if (name === "district") updated.localLevel = "";
      if (name === "employmentType" && val === "Intern") {
        updated.experienceType = "fresher";
        updated.previousExperience = [];
      }
      if (name === "maritalStatus" && val !== "Married") {
        SPOUSE_FIELDS.forEach((f) => {
          updated[f] = "";
        });
      }
      return updated;
    });

    if (name === "maritalStatus") {
      if (val === "Married" && formData.maritalStatus !== "Married") openMarriageForm(emptySpouseBackup);
      if (val !== "Married") setShowMarriageForm(false);
    }
  };

  const editSpouseDetails = () => {
    openMarriageForm({
      maritalStatus: "Married",
      ...Object.fromEntries(SPOUSE_FIELDS.map((f) => [f, formData[f] || ""])),
    });
  };

  const cancelMarriageForm = () => {
    const backup = spouseBackupRef.current || emptySpouseBackup;
    setFormData((prev) => ({ ...prev, ...backup }));
    setShowMarriageForm(false);
  };

  const confirmMarriageForm = () => {
    const errors = validateMarriageFields(formData);
    if (Object.keys(errors).length > 0) {
      setTouched((current) => ({
        ...current,
        ...Object.fromEntries(Object.keys(errors).map((key) => [key, true])),
      }));
      return;
    }
    setShowMarriageForm(false);
  };

  // ---------- submit ----------
  // This is the only form handler that calls the recruitment API; native form submission
  // is swallowed, and the final button invokes this handler for both create and edit.
  const handleSubmit = async (event) => {
    event?.preventDefault?.();
    if (step !== ClientEmp_form.length) return; // only reachable from the final step's button
    if (event?.detail > 1) return; // 2nd+ click of a double/triple click
    if (Date.now() - finalStepEnteredAtRef.current < SUBMIT_ARM_DELAY_MS) return; // click-through guard
    if (submissionInProgressRef.current || isSubmitting || isSuccess) return;
    submissionInProgressRef.current = true;

    const allErrors = computeErrors();
    setTouched((current) => ({
      ...current,
      ...Object.fromEntries(Object.keys(allErrors).map((key) => [key, true])),
    }));
    setAttemptedSteps(Object.fromEntries(ClientEmp_form.map((_, i) => [i, true])));

    if (Object.keys(allErrors).length > 0) {
      setSubmitError(validationSummary);
      ErrorNotify("Validation failed! Please fill all required fields.");

      const firstErrorKey = Object.keys(allErrors)[0];
      const firstErrorSection = firstErrorKey.startsWith("alt.")
        ? EXPERIENCE_STEP_INDEX
        : ClientEmp_form.findIndex((_, i) => firstErrorKey.startsWith(`${sectionKey(i)}.`));

      submissionInProgressRef.current = false;
      if (firstErrorSection >= 0 && firstErrorSection !== step - 1) {
        pendingScrollRef.current = true;
        goToStep(firstErrorSection);
      } else {
        scrollToFirstError();
      }
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");
      const loadingMessage = isEdit
        ? "Updating employee recruitment..."
        : "Submitting employee onboarding application...";
      waitingNotify(loadingMessage);

      if (!id) throw new Error("Authenticated employee ID is unavailable.");

      const isSuper = role === "super_admin";
      const isStaff = role === "staff";
      const provinceMatch = isSuper
        ? Object.keys(provinceDistricts).find((name) => name.toLowerCase() === String(formData.province || "").toLowerCase())
        : null;
      const districtMatch = provinceMatch
        ? getDistrictNames(provinceMatch).find((name) => name.toLowerCase() === String(formData.district || "").toLowerCase())
        : null;
      const localLevelMatch =
        provinceMatch && districtMatch
          ? getLocalLevelNames(provinceMatch, districtMatch).find(
            (name) => name.toLowerCase() === String(formData.localLevel || "").toLowerCase()
          )
          : null;

      const employment = {
        ...(isEdit ? editingRecord?.employment : {}),
        department: formData.department ? String(formData.department).trim() : "",
        isoStandardCode: formData.isoService ? String(formData.isoService).trim() : null,
        jobPosition: getJobPositionForDepartment(formData.department, formData.jobPosition),
        employmentType: formData.employmentType || "",
        province: isSuper
          ? provinceMatch || null
          : isStaff
            ? formData.province || locationDetails.provinceName || editingRecord?.employment?.province || null
          : editingRecord?.employment?.province || null,
        provinceIndex: isSuper && provinceMatch
          ? provinceNumbers[provinceMatch]
          : isStaff
            ? Number(formData.provinceIndex || locationDetails.province || editingRecord?.employment?.provinceIndex) || null
          : editingRecord?.employment?.provinceIndex || null,
        district: isSuper
          ? districtMatch || null
          : isStaff
            ? formData.district || locationDetails.districtName || editingRecord?.employment?.district || null
          : editingRecord?.employment?.district || null,
        localLevel: isSuper
          ? localLevelMatch || null
          : isStaff
            ? formData.localLevel || locationDetails.localLevel || editingRecord?.employment?.localLevel || null
          : editingRecord?.employment?.localLevel || null,
      };

      const cleanedExperience = Array.isArray(formData.previousExperience)
        ? formData.previousExperience
          .map(({ _id, ...rest }) => rest)
          .filter((row) => Object.values(row).some((v) => v !== undefined && v !== null && String(v).trim() !== ""))
        : [];

      const documents = {
        ...(isEdit ? editingRecord?.documents : {}),
        experienceType: formData.experienceType || "fresher",
        totalExperience: Number(formData.totalExperience) || 0,
        previousExperience: cleanedExperience,
      };

      const documentFileFields = [];
      DOCUMENT_FILE_NAMES.forEach((name) => {
        if (typeof formData[name] === "string") documents[name] = formData[name];
        if (formData[name] instanceof File) documentFileFields.push(name);
      });

      const { personal: existingPersonal, ...existingRootFields } = isEdit
        ? editingRecord || {}
        : {};
      const recruitmentPayload = {
        ...Object.fromEntries(
          Object.entries(existingRootFields).filter(
            ([key]) => !["_id", "id", "mainID"].includes(key),
          ),
        ),
        personal: {
          ...(isEdit ? existingPersonal : {}),
          firstName: (formData.firstName || "").trim(),
          middleName: (formData.middleName || "").trim(),
          lastName: (formData.lastName || "").trim(),
          gender: formData.gender || "",
          dob: formData.dob || "",
          maritalStatus: formData.maritalStatus || "",
          nationality: formData.nationality || "Nepali",
          services: formData.isoService ? [formData.isoService] : [],
          citizenshipId: (formData.citizenshipId || "").trim(),
          profilePhoto: typeof formData.profilePhoto === "string" ? formData.profilePhoto : "",
          ...(isEdit
            ? {
                spouseName: formData.spouseName || "",
                spouseOccupation: formData.spouseOccupation || "",
                spousePhone: formData.spousePhone || "",
                numberOfChildren: formData.numberOfChildren ?? "",
              }
            : {}),
        },
        contact: {
          ...(isEdit ? editingRecord?.contact : {}),
          officeEmail: (formData.officeEmail || "").trim().toLowerCase(),
          personalEmail: (formData.personalEmail || "").trim().toLowerCase(),
          officeMobile: (formData.officeMobile || "").trim(),
          personalMobile: (formData.personalMobile || "").trim(),
          permanentAddress: (formData.permanentAddress || "").trim(),
          currentAddress: (formData.currentAddress || "").trim(),
        },
        employment,
        documents,
        documentFileFields,
        recruitmentStatus:
          (isEdit && editingRecord?.recruitmentStatus) ||
          (/^cro$/i.test(String(formData.jobPosition || "").trim())
            ? "admin"
            : "staff"),
        createdBy: (isEdit && editingRecord?.createdBy) || id,
      };

      if (isEdit) {
        const editingId =
          editingRecord?._id ?? editingRecord?.id ?? editingRecord?.mainID;
        if (!editingId) {
          throw new Error("Recruitment record ID is unavailable.");
        }
        if (!editRecruitmentForSuper_?.mutateAsync) {
          throw new Error("Recruitment update mutation is not available.");
        }
        const response = await editRecruitmentForSuper_.mutateAsync({
          params: { id: editingId },
          payload: recruitmentPayload,
        });
        if (response?.success === false || response?.data?.success === false) {
          throw new Error(
            response?.data?.message ||
              response?.message ||
              "Unable to update recruitment record.",
          );
        }
      } else if (isSuper) {
        if (!CreateRecruitmentFORSUPER_?.mutateAsync) {
          throw new Error("Super admin recruitment mutation is not available.");
        }
        await CreateRecruitmentFORSUPER_.mutateAsync({
          payload: [recruitmentPayload],
        });
      } else if (role === "staff") {
        if (!CreateRecruitmentstaff_?.mutateAsync) {
          throw new Error("Staff recruitment mutation is not available.");
        }
        await CreateRecruitmentstaff_.mutateAsync({
          payload: [recruitmentPayload],
        });
      } else {
        throw new Error("Only super_admin and admin users can create recruitment records.");
      }

      SuccessNotify(
        isEdit
          ? "Recruitment Updated Successfully!"
          : "Application Submitted Successfully!",
      );
      setIsSuccess(true);
      onSuccess?.();
    } catch (err) {
      const message = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Failed to submit application. Please try again.";
      setSubmitError(message);
      ErrorNotify(message);
    } finally {
      submissionInProgressRef.current = false;
      setIsSubmitting(false);
      dismissWaitingNotify(
        isEdit
          ? "Updating employee recruitment..."
          : "Submitting employee onboarding application...",
      );
    }
  };

  const handleBlurCapture = (event) => {
    const field = event.target.closest("[data-field]");
    const dataField = field?.dataset.field;
    if (!dataField) return;
    const key = dataField.includes(".") ? dataField : fieldErrorKey(dataField);
    setTouched((current) => (current[key] ? current : { ...current, [key]: true }));
  };

  const onStepAnimationComplete = (definition) => {
    if (definition === "center" && pendingScrollRef.current) {
      pendingScrollRef.current = false;
      scrollToFirstError();
    }
  };

  const requestClose = () => {
    if (submissionInProgressRef.current || isSubmitting) return;
    if (isDirty && !isSuccess) setConfirmClose(true);
    else onCloseRef.current();
  };

  escapeRef.current = () => {
    if (isSuccess) return onCloseRef.current();
    if (confirmClose) return setConfirmClose(false);
    if (showMarriageForm) return cancelMarriageForm();
    requestClose();
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !e.defaultPrevented) escapeRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    if (!isSuccess) return undefined;
    const timer = window.setTimeout(() => onCloseRef.current(), 2300);
    return () => window.clearTimeout(timer);
  }, [isSuccess]);

  useEffect(() => {
    if (!pendingScrollRef.current) bodyRef.current?.scrollTo({ top: 0 });
    // Only records a timestamp used by the click-through guard. No API call here.
    if (step === ClientEmp_form.length) finalStepEnteredAtRef.current = Date.now();
  }, [step]);

  if (isSuccess) {
    return (
      <MotionConfig reducedMotion={reduceMotion ? "always" : "never"}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <SuccessAnimationView
            formData={formData}
            onClose={() => onCloseRef.current()}
            reduceMotion={reduceMotion}
            isEdit={isEdit}
          />
        </div>
      </MotionConfig>
    );
  }

  const visibleFields = getVisibleFieldsForStep(step - 1, formData);
  const activeSection = ClientEmp_form[step - 1];
  const stepVariants = {
    enter: (travelDirection) => ({ opacity: 0, x: reduceMotion ? 0 : travelDirection * 40 }),
    center: { opacity: 1, x: 0 },
    exit: (travelDirection) => ({
      opacity: 0,
      x: reduceMotion ? 0 : travelDirection * -40,
      transition: { duration: reduceMotion ? 0 : 0.16, ease: "easeIn" },
    }),
  };

  return (
    <MotionConfig reducedMotion={reduceMotion ? "always" : "never"}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-md sm:p-6">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="onboarding-title"
          className="relative flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-slate-50 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#E87A24]">
                <ClipboardList size={20} />
              </div>
              <div>
                <h1 id="onboarding-title" className="text-base font-extrabold text-[#422026]">
                  {isEdit ? "Edit Recruitment" : "Employee Onboarding"}
                </h1>
                <p className="text-xs font-medium text-slate-500">
                  {isEdit ? "Update recruitment record" : "Recruitment application"} · Step {step} of {ClientEmp_form.length}
                </p>
              </div>
            </div>
            <motion.button
              type="button"
              onClick={requestClose}
              disabled={isSubmitting}
              whileTap={{ scale: 0.97 }}
              aria-label="Close employee onboarding"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-400 outline-none transition hover:bg-slate-100 hover:text-[#422026] focus-visible:ring-2 focus-visible:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={18} />
            </motion.button>
          </div>

          <form
            ref={formRef}
            noValidate
            className="flex min-h-0 w-full flex-1 flex-col"
            onSubmit={(event) => {
              // Native form submission (Enter key, stray <button> inside a child widget, etc.)
              // is always swallowed. Only the Submit button's onClick can create the record.
              event.preventDefault();
            }}
            onBlurCapture={handleBlurCapture}
            onKeyDown={(event) => {
              if (event.key === "Enter" && event.target.tagName === "INPUT") event.preventDefault();
            }}
          >
            <div ref={bodyRef} className="slim-scroll min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
              <Stepper sections={ClientEmp_form} step={step} onStepClick={goToCompletedStep} reduceMotion={reduceMotion} />

              <div className="min-h-87.5 overflow-x-hidden rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
                <AnimatePresence mode="wait" initial={false} custom={direction}>
                  <motion.div
                    key={step}
                    custom={direction}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: reduceMotion ? 0 : 0.28, ease: STEP_EASE }}
                    onAnimationComplete={onStepAnimationComplete}
                  >
                    <SectionTitle
                      title={activeSection.fullTitle || activeSection.title}
                      description="Fields marked with * are required."
                      icon={activeSection.icon}
                    />
                    <Group
                      title={step === ClientEmp_form.length ? "Experience and documents" : `${activeSection.title} details`}
                      icon={activeSection.icon}
                    >
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {visibleFields.map((field) => {
                          let dynamicOptions = field.options || [];
                          if (field.name === "jobPosition") {
                            dynamicOptions =
                              normalizeDepartment(formData.department) === "corporate erp & it"
                                ? ERP_IT_JOB_POSITIONS
                                : getDepartmentJobPositions(formData.department) || field.options || [];
                          }
                          if (field.name === "department" && role === "staff") {
                            dynamicOptions = dynamicOptions.filter(
                              (department) => !STAFF_RESTRICTED_DEPARTMENTS.includes(
                                typeof department === "string" ? department : department?.value
                              )
                            );
                          }
                          if (field.name === "nationality") {
                            dynamicOptions = ["Nepali", "Indian"];
                          }
                          if (field.name === "employmentType") {
                            dynamicOptions = ["Permanent", "Intern", "Part-Time"];
                          }
                          if (field.name === "province") {
                            dynamicOptions = Object.keys(provinceDistricts);
                          }
                          if (field.name === "district" && formData.province) {
                            const provinceMatch = Object.keys(provinceDistricts).find(
                              (name) => name.toLowerCase() === String(formData.province).toLowerCase()
                            );
                            dynamicOptions = provinceMatch ? getDistrictNames(provinceMatch) : [];
                          }
                          if (field.name === "localLevel" && formData.province && formData.district) {
                            const provinceMatch = Object.keys(provinceDistricts).find(
                              (name) => name.toLowerCase() === String(formData.province).toLowerCase()
                            );
                            const districtMatch = provinceMatch
                              ? getDistrictNames(provinceMatch).find(
                                (name) => name.toLowerCase() === String(formData.district).toLowerCase()
                              )
                              : null;
                            dynamicOptions =
                              provinceMatch && districtMatch ? getLocalLevelNames(provinceMatch, districtMatch) : [];
                          }

                          const disableCondition = field.name === "experienceType" && formData.employmentType === "Intern";
                          const isFullWidth =
                            field.type === "file" || field.type === "repeatable" || field.type === "radio" || field.name === "isoService";
                          const errorKey = fieldErrorKey(field.name);
                          const error = getVisibleError(errorKey);
                          const fieldLabel = field.name === "department" ? "Department" : field.label;

                          return (
                            <div
                              key={field.name}
                              data-field={errorKey}
                              data-invalid={error ? "true" : "false"}
                              className={`${isFullWidth ? "md:col-span-2" : ""} ${error && !reduceMotion ? "lead-field-shake" : ""}`}
                            >
                              {isDateLike(field) ? (
                                <DateField
                                  label={getNepaliDateLabel(field.name, field.label)}
                                  name={field.name}
                                  fieldKey={errorKey}
                                  value={formData[field.name] || ""}
                                  onDateChange={(value) => handleDateChange(field.name, value)}
                                  error={error}
                                  required={!isOptionalField(field)}
                                  reduceMotion={reduceMotion}
                                />
                              ) : field.type === "select" ? (
                                <>
                                  <SelectField
                                    label={fieldLabel}
                                    name={field.name}
                                    fieldKey={errorKey}
                                    value={formData[field.name]}
                                    onChange={handleSelectChange}
                                    options={dynamicOptions}
                                    error={error}
                                    required={!isOptionalField(field)}
                                    isMulti={!!field.isMulti}
                                    reduceMotion={reduceMotion}
                                  />
                                  {field.name === "maritalStatus" && isMarried && (
                                    <button
                                      type="button"
                                      onClick={editSpouseDetails}
                                      className="mt-2 flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-left text-xs font-semibold text-[#A64D0B] outline-none transition hover:bg-orange-100 focus-visible:ring-2 focus-visible:ring-orange-200"
                                    >
                                      <span className="truncate">
                                        Spouse: {formData.spouseName || "Not provided"}
                                        {formData.numberOfChildren !== "" && formData.numberOfChildren !== undefined
                                          ? ` · ${formData.numberOfChildren} child${Number(formData.numberOfChildren) === 1 ? "" : "ren"}`
                                          : ""}
                                      </span>
                                      <span className="flex shrink-0 items-center gap-1">
                                        <Pencil size={12} /> Edit
                                      </span>
                                    </button>
                                  )}
                                  {field.name === "maritalStatus" && isMarried && (
                                    <FieldError
                                      name="spouse-summary"
                                      error={
                                        SPOUSE_FIELDS.some(
                                          (f) => touched[`${PERSONAL_PREFIX}.${f}`] && computedErrors[`${PERSONAL_PREFIX}.${f}`]
                                        ) ||
                                          (attemptedSteps[0] && SPOUSE_FIELDS.some((f) => computedErrors[`${PERSONAL_PREFIX}.${f}`]))
                                          ? "Spouse details are incomplete. Click Edit to complete them."
                                          : ""
                                      }
                                      reduceMotion={reduceMotion}
                                    />
                                  )}
                                </>
                              ) : field.type === "file" ? (
                                <FileUploadField
                                  label={field.label}
                                  name={field.name}
                                  fieldKey={errorKey}
                                  file={formData[field.name]}
                                  onChange={handleChange}
                                  error={error}
                                  required={!isOptionalField(field)}
                                  reduceMotion={reduceMotion}
                                />
                              ) : field.type === "radio" ? (
                                <RadioField
                                  label={field.label}
                                  name={field.name}
                                  fieldKey={errorKey}
                                  value={formData[field.name]}
                                  options={field.options}
                                  onChange={handleChange}
                                  error={error}
                                  disabled={disableCondition}
                                  required={!isOptionalField(field)}
                                  reduceMotion={reduceMotion}
                                />
                              ) : field.type === "repeatable" ? (
                                <RepeatableField
                                  label={field.label}
                                  name={field.name}
                                  fields={field.fields}
                                  value={formData[field.name]}
                                  onChange={handleChange}
                                  error={error}
                                  reduceMotion={reduceMotion}
                                  getRowError={(rowIndex, nestedField) => getVisibleError(`alt.${rowIndex}.${nestedField.name}`, step - 1)}
                                />
                              ) : (
                                <TextInput
                                  {...field}
                                  fieldKey={errorKey}
                                  value={formData[field.name]}
                                  onChange={handleChange}
                                  error={error}
                                  required={!isOptionalField(field)}
                                  reduceMotion={reduceMotion}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </Group>
                  </motion.div>
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {visibleSubmitError && (
                  <motion.div
                    role="alert"
                    initial={reduceMotion ? false : { opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                    transition={{ duration: reduceMotion ? 0 : 0.18 }}
                    className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
                  >
                    <AlertCircle size={17} className="mt-0.5 shrink-0" />
                    <span>{visibleSubmitError}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
              <motion.button
                type="button"
                onClick={handlePrevious}
                disabled={isSubmitting}
                whileTap={{ scale: 0.97 }}
                className={BTN_SECONDARY}
              >
                {step === 1 ? <X size={16} /> : <ArrowLeft size={16} />}
                {step === 1 ? "Cancel" : "Previous"}
              </motion.button>

              <span className="hidden text-xs font-medium text-slate-400 sm:block">
                Step {step} of {ClientEmp_form.length}
              </span>

              {step < ClientEmp_form.length ? (
                <motion.button
                  key="continue-button"
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  whileTap={{ scale: 0.97 }}
                  className={BTN_PRIMARY}
                >
                  Continue <ArrowRight size={16} />
                </motion.button>
              ) : (
                <motion.button
                  key="submit-button"
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  whileTap={{ scale: 0.97 }}
                  className={BTN_PRIMARY}
                >
                  {isSubmitting && <LoaderCircle className="h-3 w-3 animate-spin text-white" strokeWidth={2.5} />}
                  {isEdit ? "Update Recruitment" : "Submit Application"}{" "}
                  <CheckCircle2 size={17} />
                </motion.button>
              )}
            </div>
          </form>
        </div>

        {showMarriageForm && (
          <MarriageDetailsForm
            formData={formData}
            onChange={handleChange}
            errors={computedErrors}
            reduceMotion={reduceMotion}
            touched={touched}
            setTouched={setTouched}
            onCancel={cancelMarriageForm}
            onConfirm={confirmMarriageForm}
          />
        )}

        {confirmClose && (
          <ConfirmDialog
            onKeep={() => setConfirmClose(false)}
            onDiscard={() => {
              setConfirmClose(false);
              onCloseRef.current();
            }}
          />
        )}

        <style>{`
          @keyframes leadFieldShake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-5px); }
            40% { transform: translateX(5px); }
            60% { transform: translateX(-3px); }
            80% { transform: translateX(3px); }
          }
          .lead-field-shake { animation: leadFieldShake 0.36s ease-in-out; }
          .slim-scroll { scrollbar-width: thin; scrollbar-color: #CBD5E1 transparent; }
          .slim-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
          .slim-scroll::-webkit-scrollbar-track { background: transparent; }
          .slim-scroll::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 9999px; }
          .slim-scroll::-webkit-scrollbar-thumb:hover { background: #E87A24; }
          @media (prefers-reduced-motion: reduce) {
            .lead-field-shake { animation: none; }
          }
        `}</style>
      </div>
    </MotionConfig>
  );
};

// ==============================
// STEPPER, SUCCESS, DIALOG & FIELD COMPONENTS
// ==============================
const Stepper = ({ sections, step, onStepClick, reduceMotion }) => {
  const last = sections.length - 1;
  const ease = reduceMotion ? { duration: 0 } : { duration: 0.4, ease: [0.4, 0, 0.2, 1] };

  return (
    <nav aria-label="Application progress" className="rounded-xl border border-slate-200 bg-white px-4 py-4 sm:px-6 sm:py-5">
      <div className="sm:hidden">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-[#422026]">{sections[step - 1].title}</span>
          <span className="text-slate-400">
            Step {step} of {sections.length}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <motion.div
            initial={false}
            animate={{ width: `${(step / sections.length) * 100}%` }}
            transition={ease}
            className="h-full rounded-full bg-[#E87A24]"
          />
        </div>
      </div>

      <ol className="hidden items-start sm:flex">
        {sections.map((section, index) => {
          const isDone = index < step - 1;
          const isCurrent = index === step - 1;
          return (
            <React.Fragment key={section.title}>
              <li className="w-28 shrink-0">
                <button
                  type="button"
                  disabled={!isDone}
                  onClick={() => onStepClick(index)}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`${section.title}, step ${index + 1} of ${sections.length}${isDone ? ", completed" : ""}`}
                  className={`group flex w-full flex-col items-center gap-1.5 rounded-lg text-center outline-none focus-visible:ring-2 focus-visible:ring-orange-200 ${isDone ? "cursor-pointer" : "cursor-not-allowed"
                    }`}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-extrabold transition-colors ${isDone
                        ? "border-[#E87A24] bg-[#E87A24] text-white group-hover:bg-[#D96C19]"
                        : isCurrent
                          ? "border-[#E87A24] bg-orange-50 text-[#E87A24] ring-4 ring-orange-100"
                          : "border-slate-200 bg-white text-slate-400"
                      }`}
                  >
                    {isDone ? <Check size={18} strokeWidth={3} /> : index + 1}
                  </span>
                  <span className={`text-xs font-bold ${isCurrent ? "text-[#422026]" : isDone ? "text-[#A64D0B]" : "text-slate-400"}`}>
                    {section.title}
                  </span>
                  <span className="text-[11px] font-medium leading-tight text-slate-400">{STEP_DESCRIPTIONS[index]}</span>
                </button>
              </li>
              {index < last && (
                <li aria-hidden="true" className="mt-[19px] h-0.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                  <motion.div
                    initial={false}
                    animate={{ width: isDone ? "100%" : "0%" }}
                    transition={ease}
                    className="h-full rounded-full bg-[#E87A24]"
                  />
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

const PARTICLE_COLORS = ["#10B981", "#E87A24", "#3B82F6", "#F59E0B"];
const PARTICLES = Array.from({ length: 12 }, (_, index) => ({
  angle: (index / 12) * Math.PI * 2,
  distance: index % 2 === 0 ? 56 : 74,
  color: PARTICLE_COLORS[index % PARTICLE_COLORS.length],
}));

const SuccessAnimationView = ({ formData, onClose, reduceMotion, isEdit }) => (
  <motion.div
    role="status"
    aria-live="polite"
    initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: reduceMotion ? 0 : 0.3 }}
    className="flex min-h-105 w-full max-w-2xl flex-col items-center justify-center gap-6 rounded-xl border border-slate-200 bg-white p-8 text-center"
  >
    <div className="relative flex h-24 w-24 items-center justify-center">
      {!reduceMotion &&
        [0, 1].map((ring) => (
          <motion.span
            key={ring}
            aria-hidden="true"
            initial={{ scale: 0.8, opacity: 0.7 }}
            animate={{ scale: 1.9, opacity: 0 }}
            transition={{ duration: 1.3, delay: 0.35 + ring * 0.3, repeat: 1 }}
            className="absolute inset-0 rounded-full border-2 border-emerald-400"
          />
        ))}
      {!reduceMotion &&
        PARTICLES.map((particle, index) => (
          <motion.span
            key={index}
            aria-hidden="true"
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{
              x: Math.cos(particle.angle) * particle.distance,
              y: Math.sin(particle.angle) * particle.distance,
              scale: [0, 1.2, 0],
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 0.9, delay: 0.4 }}
            style={{ backgroundColor: particle.color }}
            className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full"
          />
        ))}
      <motion.div
        initial={reduceMotion ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 16 }}
        className="relative flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-200"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-12 w-12">
          <motion.path
            d="M5 12.5l4.5 4.5L19 7.5"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: reduceMotion ? 0 : 0.3, duration: reduceMotion ? 0 : 0.45, ease: "easeOut" }}
          />
        </svg>
      </motion.div>
    </div>

    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : 0.55, duration: reduceMotion ? 0 : 0.35 }}
      className="space-y-2"
    >
      <h3 className="text-lg font-extrabold text-[#422026]">
        {isEdit ? "Recruitment updated" : "Application submitted"}
      </h3>
      <p className="text-sm text-slate-500">
        {isEdit
          ? `The recruitment record for ${formData.firstName || "this employee"} was updated successfully.`
          : `Thank you${formData.firstName ? `, ${formData.firstName}` : ""}. Your onboarding application was submitted successfully.`}
      </p>
    </motion.div>

    <div className="h-1 w-40 overflow-hidden rounded-full bg-slate-100">
      <motion.div
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: reduceMotion ? 0 : 2.1, ease: "linear" }}
        className="h-full rounded-full bg-emerald-500"
      />
    </div>

    <motion.button type="button" onClick={onClose} whileTap={{ scale: 0.97 }} className={BTN_PRIMARY}>
      Done &amp; Close <Check size={16} />
    </motion.button>
  </motion.div>
);

const ConfirmDialog = ({ onKeep, onDiscard }) => (
  <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="discard-title"
      aria-describedby="discard-desc"
      className="w-full max-w-sm space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-2xl"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
          <AlertCircle size={20} />
        </div>
        <div>
          <h3 id="discard-title" className="text-sm font-extrabold text-[#422026]">
            Discard this application?
          </h3>
          <p id="discard-desc" className="mt-1 text-xs font-medium text-slate-500">
            You have unsaved information. If you close now, everything you entered will be lost.
          </p>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onKeep} autoFocus className={BTN_SECONDARY}>
          Keep editing
        </button>
        <button type="button" onClick={onDiscard} className={`${BTN_BASE} bg-red-500 px-4 py-2.5 text-white hover:bg-red-600`}>
          Discard
        </button>
      </div>
    </div>
  </div>
);

const FormField = ({ id, name, fieldKey = name, label, required, error, children, optionalText = true, reduceMotion }) => (
  <div data-field={fieldKey} data-invalid={error ? "true" : "false"} className="space-y-1.5">
    <label htmlFor={id} className="ml-0.5 flex items-center justify-between text-xs font-semibold text-[#422026]">
      <span>
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      {!required && optionalText && <span className="text-[11px] font-medium text-slate-400">Optional</span>}
    </label>
    {children}
    <FieldError name={fieldKey} error={error} reduceMotion={reduceMotion} />
  </div>
);

const FieldError = ({ name, error, reduceMotion = false }) => (
  <AnimatePresence initial={false}>
    {error && (
      <motion.p
        id={`field-error-${name}`}
        role="alert"
        initial={reduceMotion ? false : { opacity: 0, height: 0, y: -4 }}
        animate={{ opacity: 1, height: "auto", y: 0 }}
        exit={reduceMotion ? undefined : { opacity: 0, height: 0, y: -4 }}
        transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
        className="flex items-center gap-1.5 overflow-hidden text-[11px] font-medium leading-4 text-red-600"
      >
        <AlertCircle size={12} className="shrink-0" />
        <span>{error}</span>
      </motion.p>
    )}
  </AnimatePresence>
);

const SectionTitle = ({ title, description, icon }) => (
  <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#E87A24] [&>svg]:h-4.75 [&>svg]:w-4.75">
      {icon}
    </div>
    <div className="min-w-0">
      <h2 className="text-sm font-extrabold text-[#422026]">{title}</h2>
      <p className="mt-0.5 text-xs font-medium text-slate-500">{description}</p>
    </div>
  </div>
);

const Group = ({ title, icon, children }) => (
  <section className="space-y-4">
    {title && (
      <h3 className="flex items-center gap-2 text-sm font-extrabold text-[#422026]">
        <span className="text-[#E87A24] [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
        {title}
      </h3>
    )}
    {children}
  </section>
);

const DateField = ({ label, name, fieldKey = name, value, onDateChange, error, required, isToday = false, reduceMotion }) => {
  const id = `employee-${name}`;
  const dateFieldRef = useRef(null);

  useEffect(() => {
    const input = dateFieldRef.current?.querySelector("input");
    if (!input) return;
    input.id = id;
    input.setAttribute("aria-label", label);
    input.setAttribute("aria-invalid", String(Boolean(error)));
    if (error) input.setAttribute("aria-describedby", `field-error-${fieldKey}`);
    else input.removeAttribute("aria-describedby");
  });

  return (
    <FormField id={id} name={fieldKey} label={label} required={required} error={error} reduceMotion={reduceMotion}>
      <div ref={dateFieldRef} role="group" aria-label={label} className="group relative rounded-lg">
        <span
          className={`pointer-events-none absolute left-3 top-1/2 z-10 flex -translate-y-1/2 items-center transition-colors ${error ? "text-red-500" : "text-slate-400 group-focus-within:text-[#E87A24]"
            }`}
        >
          <CalendarIcon size={16} />
        </span>
        <div
          className={`[&_input]:h-10.5! [&_input]:w-full! [&_input]:rounded-lg! [&_input]:border! [&_input]:bg-white! [&_input]:pl-10! [&_input]:pr-3! [&_input]:text-sm! [&_input]:font-medium! [&_input]:text-[#422026]! [&_input]:shadow-none! [&_input]:outline-none! [&_input]:focus:border-[#E87A24]! [&_input]:focus:ring-2! ${error ? "[&_input]:border-red-500! [&_input]:focus:ring-red-100!" : "[&_input]:border-slate-200! [&_input]:focus:ring-orange-100!"
            }`}
        >
          <NepaliDateInput value={value} onDateChange={onDateChange} placeholder={label} isToday={isToday} />
        </div>
      </div>
    </FormField>
  );
};

const RepeatableField = ({ label, name, fields, value, onChange, error, reduceMotion, getRowError }) => {
  const placeholderRow = useRef({ _id: newRowId() });
  const rowsRef = useRef(null);
  const rows = Array.isArray(value) && value.length > 0 ? value : [placeholderRow.current];

  useEffect(() => {
    rowsRef.current?.querySelectorAll("[data-date-input]").forEach((container) => {
      const input = container.querySelector("input");
      if (!input) return;
      input.id = container.dataset.inputId;
      input.setAttribute("aria-label", container.dataset.inputLabel);
      input.setAttribute("aria-invalid", container.dataset.invalid);
      if (container.dataset.errorId) input.setAttribute("aria-describedby", container.dataset.errorId);
      else input.removeAttribute("aria-describedby");
    });
  });

  const emit = (nextRows) => onChange({ target: { name, value: nextRows } });

  const handleRowChange = (index, fieldName, val) => {
    const nextRows = rows.map((row, i) => {
      if (i !== index) return row;
      const updated = { ...row, [fieldName]: val };
      if (fieldName === "startDate" || fieldName === "endDate") {
        updated.tenure = calculateTenure(updated.startDate, updated.endDate);
      }
      return updated;
    });
    emit(nextRows);
  };

  const addRow = () => emit([...rows, { _id: newRowId() }]);
  const removeRow = (index) => emit(rows.filter((_, i) => i !== index));

  return (
    <div className="space-y-3 md:col-span-2">
      <label className="ml-0.5 block text-xs font-semibold text-[#422026]">
        {label}
        <span className="ml-0.5 text-red-500">*</span>
      </label>

      <div ref={rowsRef} className="space-y-4">
        <AnimatePresence initial={false}>
          {rows.map((row, idx) => (
            <motion.div
              key={row._id}
              layout={!reduceMotion}
              initial={reduceMotion ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.97 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
              className="relative rounded-xl border border-slate-200 bg-white p-5 sm:p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500">Experience {idx + 1}</p>
                {rows.length > 1 && (
                  <motion.button
                    type="button"
                    onClick={() => removeRow(idx)}
                    whileTap={{ scale: 0.97 }}
                    aria-label={`Remove experience ${idx + 1}`}
                    title="Remove experience"
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-red-500 outline-none transition hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-200"
                  >
                    <Trash2 size={16} />
                  </motion.button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {fields.map((field) => {
                  const isDate = isDateLike(field);
                  const fieldLabel = isDate ? getNepaliDateLabel(field.name, field.label) : field.label;
                  const fieldKey = `alt.${idx}.${field.name}`;
                  const nestedError = getRowError?.(idx, field);
                  const icon = getFieldIcon(field.name, field.type);
                  const id = `experience-${row._id}-${field.name}`;
                  const isRequired = !field.readOnly;

                  return (
                    <div key={field.name} data-field={fieldKey} data-invalid={nestedError ? "true" : "false"} className="space-y-1.5">
                      <label htmlFor={id} className="text-xs font-semibold text-[#422026]">
                        {fieldLabel}
                        {isRequired && <span className="ml-0.5 text-red-500">*</span>}
                      </label>
                      <div className="group relative">
                        <span
                          className={`pointer-events-none absolute left-3 -top-2 z-10 flex -mt-4 items-center ${nestedError ? "text-red-500" : "text-slate-400 group-focus-within:text-[#E87A24]"
                            }`}
                        >
                          {icon}
                        </span>
                        {isDate ? (
                          <div
                            data-date-input
                            data-input-id={id}
                            data-input-label={fieldLabel}
                            data-invalid={String(Boolean(nestedError))}
                            data-error-id={nestedError ? `field-error-${fieldKey}` : ""}
                            // className={` [&_input]:text-[#422026]!
                            //    ${nestedError ? "[&_input]:border-red-500!" : "[&_input]:border-slate-200!"
                            //   }`}
                          >
                            <NepaliDateInput
                              value={row[field.name] || ""}
                              onDateChange={(val) => handleRowChange(idx, field.name, val)}
                              placeholder={fieldLabel}
                              isToday={false}
                            />
                          </div>
                        ) : (
                          field.type === "select" ? (
                            <SelectField
                              label={field.label}
                              name={field.name}
                              fieldKey={fieldKey}
                              value={row[field.name] || ""}
                              onChange={(option) => handleRowChange(idx, field.name, option?.value || "")}
                              options={field.options || []}
                              error={nestedError}
                              required={!field.readOnly}
                              reduceMotion={reduceMotion}
                            />
                          ) : (
                            <input
                              id={id}
                              type={field.type === "number" ? "text" : field.type}
                              inputMode={field.type === "number" ? "numeric" : undefined}
                              value={row[field.name] || ""}
                              readOnly={field.readOnly}
                              placeholder={field.readOnly ? "Calculated automatically" : `Enter ${field.label.toLowerCase()}`}
                              onChange={(event) => handleRowChange(idx, field.name, event.target.value)}
                              aria-invalid={Boolean(nestedError)}
                              aria-describedby={nestedError ? `field-error-${fieldKey}` : undefined}
                              className={`block h-10.5 w-full rounded-lg border bg-white pl-10 pr-3 text-sm font-medium text-[#422026] outline-none transition placeholder:text-slate-400 focus:border-[#E87A24] focus:ring-2 focus:ring-orange-100 read-only:bg-slate-50 read-only:text-slate-500 ${nestedError ? "border-red-500 focus:ring-red-100" : "border-slate-200"
                                }`}
                            />
                          )
                        )}
                      </div>
                      <FieldError name={fieldKey} error={nestedError} reduceMotion={reduceMotion} />
                    </div>
                  );
                })}
              </div>

              {row.tenure && row.tenure !== "Invalid Dates" && (
                <div className="mt-3 flex justify-end">
                  <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold italic text-[#A64D0B]">
                    Tenure: {row.tenure}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <FieldError name={name} error={error} reduceMotion={reduceMotion} />

      <motion.button
        type="button"
        onClick={addRow}
        whileTap={{ scale: 0.97 }}
        className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-orange-50 px-3 py-2 text-xs font-semibold text-[#E87A24] outline-none transition hover:bg-orange-100 focus-visible:ring-2 focus-visible:ring-orange-200"
      >
        <Plus size={16} strokeWidth={3} /> Add Another Organization
      </motion.button>
    </div>
  );
};

const RadioField = ({ label, name, fieldKey = name, options, value, onChange, error, required, disabled, reduceMotion }) => {
  const id = `employee-${name}`;
  return (
    <FormField id={`${id}-${options[0]?.value || "option"}`} name={fieldKey} label={label} required={required} error={error} reduceMotion={reduceMotion}>
      <div
        role="radiogroup"
        aria-label={label}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `field-error-${fieldKey}` : undefined}
        className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1"
      >
        <span aria-hidden="true" className="flex items-center text-slate-400">
          {getFieldIcon(name, "radio")}
        </span>
        {options.map((option) => (
          <label
            key={option.value}
            htmlFor={`${id}-${option.value}`}
            className={`flex items-center gap-2 ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          >
            <input
              id={`${id}-${option.value}`}
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              disabled={disabled}
              className="h-4 w-4 border-slate-300 text-[#E87A24] focus:ring-orange-100"
            />
            <span className="text-sm font-medium text-[#422026]">{option.label}</span>
          </label>
        ))}
        {disabled && (
          <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-[#A64D0B]">
            Auto-Locked (Intern)
          </span>
        )}
      </div>
    </FormField>
  );
};

const TextInput = ({
  label,
  name,
  fieldKey = name,
  type = "text",
  value,
  onChange,
  error,
  required,
  disabled,
  rows,
  sanitizer,
  placeholder,
  reduceMotion,
  onBlur,
}) => {
  const icon = getFieldIcon(name, type);
  const id = `employee-${name}`;
  const inputSanitizer = getSanitizer(name, type, sanitizer);
  const isNumeric = type === "number";
  const htmlType = isNumeric ? "text" : type;
  const inputMode = isNumeric ? "numeric" : type === "tel" ? "tel" : undefined;

  const handleInputChange = (event) => {
    const raw = event.target.value;
    onChange({
      target: {
        name,
        type,
        value: inputSanitizer ? sanitizeInput(raw, inputSanitizer) : raw,
        files: null,
      },
    });
  };

  const controlClass = `block w-full rounded-lg border bg-white pl-10 pr-3 text-sm font-medium text-[#422026] outline-none transition placeholder:text-slate-400 focus:border-[#E87A24] focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 ${rows ? "min-h-24 py-2.5" : "h-10.5"
    } ${error ? "border-red-500 bg-red-50/40 focus:border-red-500 focus:ring-red-100" : "border-slate-200"}`;

  const common = {
    id,
    name,
    value: value || "",
    onChange: handleInputChange,
    onBlur,
    disabled,
    placeholder: placeholder || `Enter ${label.toLowerCase()}`,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? `field-error-${fieldKey}` : undefined,
    className: controlClass,
  };

  return (
    <FormField id={id} name={fieldKey} label={label} required={required} error={error} reduceMotion={reduceMotion}>
      <div className="group relative">
        <span
          className={`pointer-events-none absolute left-3 z-10 flex items-center transition-colors ${rows ? "top-3" : "top-1/2 -translate-y-1/2"} ${error ? "text-red-500" : "text-slate-400 group-focus-within:text-[#E87A24]"
            }`}
        >
          {icon}
        </span>
        {rows ? <textarea {...common} rows={rows} /> : <input {...common} type={htmlType} inputMode={inputMode} />}
      </div>
    </FormField>
  );
};

const SelectField = ({ label, name, fieldKey = name, value, onChange, options, error, required, isMulti = false, reduceMotion }) => {
  const normalizedOptions = normalizeOptions(options);
  const icon = getFieldIcon(name, "select");
  const id = `employee-${name}`;

  const selectedValue = isMulti
    ? normalizedOptions.filter((opt) => Array.isArray(value) && value.includes(opt.value))
    : normalizedOptions.find((opt) => opt.value === value) || null;

  return (
    <FormField id={id} name={fieldKey} label={label} required={required} error={error} reduceMotion={reduceMotion}>
      <Select
        inputId={id}
        name={name}
        isMulti={isMulti}
        isClearable
        closeMenuOnSelect={!isMulti}
        options={normalizedOptions}
        value={selectedValue}
        onChange={(opt) => onChange(opt, name, isMulti)}
        styles={customSelectStyles(!!error)}
        components={selectComponentsWithIcon}
        fieldIcon={icon}
        hasError={Boolean(error)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `field-error-${fieldKey}` : undefined}
        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
        menuPosition="fixed"
        noOptionsMessage={() => "No options available"}
        placeholder={`Select ${label.toLowerCase()}`}
      />
    </FormField>
  );
};

const FileUploadField = ({ label, name, fieldKey = name, file, onChange, error, required = false, reduceMotion }) => {
  const id = `employee-${name}`;
  const fileLabel =
    typeof file === "string"
      ? file.split(/[?#]/, 1)[0].split("/").pop()
      : file?.name;
  const isExistingFile = typeof file === "string";

  const handleFile = (event) => {
    onChange(event);
    event.target.value = "";
  };

  return (
    <FormField id={id} name={fieldKey} label={label} required={required} error={error} reduceMotion={reduceMotion}>
      <label
        htmlFor={id}
        className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-7 text-center transition focus-within:ring-2 focus-within:ring-orange-200 ${error
            ? "border-red-500 bg-red-50"
            : file
              ? "border-emerald-300 bg-emerald-50"
              : "border-slate-200 bg-white hover:border-[#E87A24] hover:bg-orange-50/40"
          }`}
      >
        <input
          id={id}
          type="file"
          name={name}
          accept=".pdf,.jpg,.jpeg,.png,.docx"
          onChange={handleFile}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `field-error-${fieldKey}` : undefined}
          className="sr-only"
        />
        <span
          className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl shadow-sm ${file ? "bg-emerald-100 text-emerald-600" : "border border-slate-100 bg-slate-50 text-slate-400"
            }`}
        >
          <UploadCloud size={20} />
        </span>
        <span className="text-sm font-bold text-[#422026]">
          {file
            ? isExistingFile
              ? "Existing document"
              : "Document selected"
            : "Choose a document to upload"}
        </span>
        <span className="mt-1.5 max-w-full truncate text-xs font-medium text-slate-400">
          {file ? fileLabel : "PDF, PNG, JPG, JPEG or DOCX (Max 10MB)"}
        </span>
        {file && <CheckCircle2 size={18} className="absolute right-4 top-4 text-emerald-500" />}
      </label>
      {file && (
        <button
          type="button"
          onClick={() => onChange({ target: { name, value: "", files: null, type: "file" } })}
          className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-red-500 outline-none transition hover:text-red-600 focus-visible:underline"
        >
          <Trash2 size={13} /> Remove file
        </button>
      )}
    </FormField>
  );
};

const MarriageDetailsForm = ({ formData, onChange, errors, reduceMotion, touched, setTouched, onCancel, onConfirm }) => {
  const containerRef = useRef(null);
  const spouseError = (name) => (touched[`${PERSONAL_PREFIX}.${name}`] ? errors[`${PERSONAL_PREFIX}.${name}`] : "");
  const markTouched = (name) => setTouched((current) => ({ ...current, [`${PERSONAL_PREFIX}.${name}`]: true }));

  useEffect(() => {
    containerRef.current?.querySelector("input")?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="spouse-title"
        className="slim-scroll relative max-h-[90vh] w-full max-w-2xl space-y-6 overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8"
      >
        <motion.button
          type="button"
          onClick={onCancel}
          whileTap={{ scale: 0.97 }}
          aria-label="Close spouse information"
          className="absolute right-5 top-5 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-slate-50 text-slate-400 outline-none transition hover:bg-red-50 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-orange-200"
        >
          <X size={18} />
        </motion.button>

        <div className="flex items-center gap-4 border-b border-slate-100 pb-4 pr-10">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#E87A24]">
            <UserPlus size={20} />
          </div>
          <div>
            <h3 id="spouse-title" className="text-lg font-extrabold text-[#422026]">
              Spouse Information
            </h3>
            <p className="mt-0.5 text-xs font-medium text-slate-500">Please provide details for your secondary contact.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextInput
            label="Spouse Name"
            name="spouseName"
            fieldKey={`${PERSONAL_PREFIX}.spouseName`}
            type="text"
            value={formData.spouseName}
            onChange={onChange}
            onBlur={() => markTouched("spouseName")}
            error={spouseError("spouseName")}
            required
            reduceMotion={reduceMotion}
          />
          <TextInput
            label="Spouse Occupation"
            name="spouseOccupation"
            fieldKey={`${PERSONAL_PREFIX}.spouseOccupation`}
            type="text"
            value={formData.spouseOccupation}
            onChange={onChange}
            onBlur={() => markTouched("spouseOccupation")}
            error={spouseError("spouseOccupation")}
            required
            reduceMotion={reduceMotion}
          />
          <TextInput
            label="Spouse Phone"
            name="spousePhone"
            fieldKey={`${PERSONAL_PREFIX}.spousePhone`}
            type="tel"
            value={formData.spousePhone}
            onChange={onChange}
            onBlur={() => markTouched("spousePhone")}
            error={spouseError("spousePhone")}
            required
            reduceMotion={reduceMotion}
          />
          <TextInput
            label="Number of Children"
            name="numberOfChildren"
            fieldKey={`${PERSONAL_PREFIX}.numberOfChildren`}
            type="number"
            value={formData.numberOfChildren}
            onChange={onChange}
            onBlur={() => markTouched("numberOfChildren")}
            error={spouseError("numberOfChildren")}
            required
            reduceMotion={reduceMotion}
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <motion.button type="button" onClick={onCancel} whileTap={{ scale: 0.97 }} className={BTN_SECONDARY}>
            Cancel
          </motion.button>
          <motion.button type="button" onClick={onConfirm} whileTap={{ scale: 0.97 }} className={BTN_PRIMARY}>
            Confirm Details
            <ChevronRight size={16} />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default RecruitmentForm;