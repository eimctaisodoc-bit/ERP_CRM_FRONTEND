import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import DOMPurify from "dompurify";
import Select from "react-select";

import {
  Calendar,
  PencilLine,
  Mail,
  Phone,
  ListChecks,
  Paperclip,
  MessageCircle,
  Edit2,
  Trash2,
  CalendarPlus,
  CalendarCheck,
  List,
  X,
  ListOrdered,
  Home,
  AlertTriangle,
  Loader2,
  Activity,
  Video,
  Clock,
  Bold,
  Italic,
  Underline,
  Plus,
} from "lucide-react";

// ---- project dependencies ----
import NepaliDateInput from "../../../../nepalidate/testDate";
import {
  formatNepaliDate,
  getNepaliDateTimestamp,
  toNepaliDateInputValue,
} from "../../../../../utils/dateUtils";

import { UseAdd } from "../../../../hooks/useadd";
import { useGet } from "../../../../hooks/useGet";
import { useEdit } from "../../../../hooks/useEdit";
import { UseDelete } from "../../../../hooks/useDelete";

import FileAttachment from "../../../../fileAttachment";
import {
  dismissWaitingNotify,
  waitingNotify,
  SuccessNotify,
  ErrorNotify,
} from "../../../../hotToaster";

const fontMedium = { fontFamily: "'Roboto Slab', serif", fontWeight: 500 };
const fontBold = { fontFamily: "'Roboto Slab', serif", fontWeight: 600 };
const fontStrong = { fontFamily: "'Roboto Slab', serif", fontWeight: 700 };

const BRAND = "bg-[#ff7a59] hover:bg-[#e8694a]";
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A76C0]/60";
const INPUT =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-300";
const SELECT_STYLES = {
  control: (base, state) => ({
    ...base,
    minHeight: 40,
    borderColor: state.isFocused ? "#60a5fa" : "#d1d5db",
    boxShadow: state.isFocused ? "0 0 0 1px #93c5fd" : "none",
    "&:hover": { borderColor: "#60a5fa" },
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
  }),
  menuPortal: (base) => ({ ...base, zIndex: 10000 }),
  menu: (base) => ({ ...base, zIndex: 10000 }),
  option: (base, state) => ({
    ...base,
    cursor: "pointer",
    fontWeight: 500,
    backgroundColor: state.isSelected
      ? "#ff7a59"
      : state.isFocused
        ? "#fff1ed"
        : "#fff",
    color: state.isSelected ? "#fff" : "#33475b",
  }),
};

// --- TIME UTILITIES ---
const getCurrentTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
};

const getSystemTimePlusHour = () => {
  const now = new Date();
  now.setHours(now.getHours() + 1);
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
};

const SAMPLE_ACTIVITIES = [
  {
    id: "sample-activity-call",
    type: "call",
    connected: "Suman Thakur",
    outCome: "Connected",
    fromDate: "2083-07-16",
    toDate: "2083-07-16",
    fromTime: "10:00",
    toTime: "10:15",
    timestamp: "2026-11-03T04:15:00.000Z",
    note: "<p>Sample: Discussed the client’s audit timeline and agreed to share a checklist.</p>",
    isSample: true,
  },
];

const validateTimeRange = (fromTime, toTime, fromDate, toDate) => {
  if (!fromDate || !toDate || fromDate === toDate) {
    const parseTime = (value) => {
      const [hours, minutes, seconds = 0] = String(value)
        .split(":")
        .map(Number);
      return hours * 3600 + minutes * 60 + seconds;
    };
    const from = parseTime(fromTime);
    const to = parseTime(toTime);
    if (!Number.isNaN(from) && !Number.isNaN(to) && from >= to) return false;
  }
  return true;
};

const toEnglishDigits = (value) =>
  String(value ?? "").replace(/[०-९]/g, (digit) => "०१२३४५६७८९".indexOf(digit));

const normalizeBsDate = (value) => {
  if (!value) return "";
  const date = toEnglishDigits(String(value).trim()).split(/[T ]/)[0];
  const parts = date.split(/[-/]/);
  if (parts.length !== 3 || parts.some((part) => !/^\d+$/.test(part)))
    return date;
  return `${parts[0].padStart(4, "0")}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
};

const normalizeTime24 = (value, fallback = "") => {
  if (!value) return fallback;
  const match = toEnglishDigits(String(value).trim()).match(
    /^(\d{1,2}):([0-5]\d)\s*(AM|PM)?$/i,
  );
  if (!match) return value;

  let hours = Number(match[1]);
  const minutes = match[2];
  const meridiem = match[3]?.toUpperCase();

  if (meridiem) {
    if (hours === 12) hours = 0;
    if (meridiem === "PM") hours += 12;
  }
  return `${String(hours).padStart(2, "0")}:${minutes}`;
};

const formatCallTime = (value) => {
  const match = toEnglishDigits(String(value ?? "").trim()).match(
    /^([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?\s*(AM|PM)?$/i,
  );
  if (!match) return value || "";

  let hours = Number(match[1]);
  const minutes = match[2];
  const seconds = match[3];
  const meridiem = match[4]?.toUpperCase();

  if (meridiem) {
    if (hours === 12) hours = 0;
    if (meridiem === "PM") hours += 12;
  }

  const displayMeridiem = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes}${seconds && seconds !== "00" ? `:${seconds}` : ""} ${displayMeridiem}`;
};

const getTimeDifference = (fromTime, toTime) => {
  const parseTime = (value) => {
    const match = toEnglishDigits(String(value ?? "").trim()).match(
      /^(\d{1,2}):([0-5]\d)(?::([0-5]\d))?\s*(AM|PM)?$/i,
    );
    if (!match) return null;
    let hours = Number(match[1]);
    const minutes = Number(match[2]);
    const seconds = Number(match[3] || 0);
    const meridiem = match[4]?.toUpperCase();
    if (meridiem) {
      if (hours === 12) hours = 0;
      if (meridiem === "PM") hours += 12;
    }
    return hours * 3600 + minutes * 60 + seconds;
  };

  const fromSeconds = parseTime(fromTime);
  let toSeconds = parseTime(toTime);
  if (fromSeconds === null || toSeconds === null) return "";
  if (toSeconds < fromSeconds) toSeconds += 24 * 60 * 60;

  const difference = toSeconds - fromSeconds;
  const hours = Math.floor(difference / 3600);
  const minutes = Math.floor((difference % 3600) / 60);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
};

// "3d 4h", "2h 15m", "12m 05s"
const formatSpan = (ms) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${String(s).padStart(2, "0")}s`;
};

const formatCountdown = (ms) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const units = [
    [Math.floor(total / 86400), "d"],
    [Math.floor((total % 86400) / 3600), "h"],
    [Math.floor((total % 3600) / 60), "m"],
    [total % 60, "s"],
  ];
  const firstNonzero = units.findIndex(([value]) => value > 0);
  return units
    .slice(firstNonzero < 0 ? units.length - 1 : firstNonzero)
    .map(([value, unit]) => `${value}${unit}`)
    .join(" ");
};

const formatRelative = (ms) => {
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const getSelectedDates = (dateData) => {
  if (!dateData) return [];
  if (dateData.from || dateData.to) {
    return [dateData.from, dateData.to].map(normalizeBsDate).filter(Boolean);
  }
  const dates = Array.isArray(dateData)
    ? dateData
    : String(dateData).split(" - ");
  return dates
    .map((date) =>
      normalizeBsDate(
        typeof date === "string"
          ? date
          : date?.value || date?.formattedDate || date?.bsDate || "",
      ),
    )
    .filter(Boolean);
};

// contentEditable leaves "<br>" / "<p><br></p>" behind after clearing; treat those as empty.
const isEditorEmpty = (html) => {
  if (!html) return true;
  const text = String(html)
    .replace(/<br\s*\/?>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  return text.length === 0 && !/<(img|ul|ol|li)\b/i.test(html);
};

const parseMeetingLink = (raw) => {
  let link = String(raw || "").trim();
  if (!link) return { empty: true };
  if (!/^https?:\/\//i.test(link)) link = `https://${link}`;
  try {
    const hostname = new URL(link).hostname.toLowerCase();
    const ok =
      hostname === "meet.google.com" ||
      hostname === "zoom.us" ||
      hostname.endsWith(".zoom.us");
    return ok
      ? { link }
      : { error: "Only Google Meet or Zoom links are allowed." };
  } catch {
    return { error: "Please enter a valid URL." };
  }
};

const extractDate = (value) =>
  value ? String(value).split("T")[0].split(" ")[0] : "";

const extractTime = (value) => {
  if (!value) return "";
  const str = String(value);
  let time = "";
  if (str.includes("T")) time = str.split("T")[1];
  else if (str.includes(" ")) time = str.split(" ")[1];
  return (time || "").match(/^\d{1,2}:\d{2}(?:\s?(?:AM|PM))?/i)?.[0] || "";
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const getActivityDateLabel = (type) => {
  if (type === "message" || type === "direct" || type === "email")
    return "Message Date";
  if (type === "call") return "Call Date";
  if (type === "meeting" || type === "virtual_meeting") return "Meeting Date";
  return "Created Date";
};

// ---------------------------------------------------------------------------
// SMALL SHARED UI PIECES
// ---------------------------------------------------------------------------
function Field({ label, children, className = "", htmlFor }) {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={htmlFor}
          style={fontBold}
          className={`mb-1 block text-xs text-gray-500 ${htmlFor ? "cursor-pointer" : ""}`}
        >
          {label}
        </label>
      )}
      {children}
    </div>
  );
}

function ChipList({ items, onRemove, tone = "blue", label = "Remove" }) {
  if (!items.length) return null;
  const tones = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <li
          key={`${item}-${index}`}
          className={`flex max-w-full items-center gap-1 rounded-full border px-2.5 py-1 text-xs ${tones[tone]}`}
        >
          <span className="truncate sm:max-w-[260px]">{item}</span>
          <button
            type="button"
            onClick={() => onRemove(index)}
            aria-label={`${label} ${item}`}
            className={`flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-white hover:text-red-500 ${FOCUS}`}
          >
            <X size={11} />
          </button>
        </li>
      ))}
    </ul>
  );
}

function ComposerShell({
  icon: Icon,
  iconClass,
  title,
  headerRight,
  children,
  footer,
}) {
  return (
    <section className="mb-6 overflow-hidden rounded-lg border border-[#cbd6e2] bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-gray-50/60 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-md ${iconClass}`}
          >
            <Icon size={16} />
          </span>
          <h3 style={fontBold} className="text-sm">
            {title}
          </h3>
        </div>
        {headerRight}
      </header>
      <div className="space-y-4 bg-gray-50/30 p-3 sm:p-4">{children}</div>
      <footer className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-gray-100 bg-white/95 p-3 backdrop-blur sm:flex-row sm:items-center">
        {footer}
      </footer>
    </section>
  );
}

function SubmitBar({
  onSubmit,
  onCancel,
  isSubmitting,
  busyLabel,
  label,
  cancelLabel = "Cancel",
}) {
  return (
    <>
      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        style={fontBold}
        className={`min-h-10 cursor-pointer rounded-md px-4 text-sm text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`}
      >
        {cancelLabel}
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        style={fontBold}
        className={`flex min-h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md px-5 text-sm text-white transition-colors disabled:cursor-not-allowed disabled:opacity-70 sm:ml-auto sm:flex-none ${BRAND} ${FOCUS}`}
      >
        {isSubmitting && <Loader2 size={14} className="animate-spin" />}
        {isSubmitting ? busyLabel : label}
      </button>
    </>
  );
}

function RadioPills({
  name,
  value,
  onChange,
  options,
  accent = "accent-blue-600",
}) {
  return (
    <div role="radiogroup" className="flex gap-1 rounded-lg bg-slate-100 p-1">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`flex min-h-8 cursor-pointer items-center gap-1.5 rounded-md px-3 text-xs transition-colors ${value === opt.value ? "bg-white shadow-sm text-[#33475b]" : "text-slate-500 hover:text-slate-700"}`}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className={`sr-only`}
          />
          <span style={fontBold}>{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

// --- RICH TEXT EDITOR WITH TOOLBAR BUTTONS ---
function RichEditor({
  contentRef,
  placeholder,
  attachments,
  setAttachments,
  label = "Rich text editor",
}) {
  const fileInputRef = useRef(null);
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
  const MAX_IMAGES = 5;

  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    insertOrderedList: false,
    insertUnorderedList: false,
  });

  const updateToolbar = useCallback(() => {
    try {
      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        insertOrderedList: document.queryCommandState("insertOrderedList"),
        insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      });
    } catch {
      /* queryCommandState can throw outside an editable region */
    }
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", updateToolbar);
    return () => document.removeEventListener("selectionchange", updateToolbar);
  }, [updateToolbar]);

  const handleFileChange = (e) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    if (files.some((file) => !file.type.startsWith("image/"))) {
      ErrorNotify("Only image files are allowed.");
      e.target.value = "";
      return;
    }
    const oversizedFiles = files.filter((file) => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      ErrorNotify(
        `These images exceed 10 MB:\n${oversizedFiles.map((file) => file.name).join("\n")}`,
      );
      e.target.value = "";
      return;
    }
    if (attachments.length + files.length > MAX_IMAGES) {
      const remainingSlots = MAX_IMAGES - attachments.length;
      ErrorNotify(
        `You can only upload a maximum of 5 images. You can add ${remainingSlots} more.`,
      );
      e.target.value = "";
      return;
    }

    const newFiles = files.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      file,
      isExisting: false,
    }));
    setAttachments((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const removeAttachment = (index) =>
    setAttachments(attachments.filter((_, i) => i !== index));

  const format = (command, value = null) => {
    document.execCommand(command, false, value);
    if (contentRef.current) contentRef.current.focus();
    updateToolbar();
  };

  const tools = [
    { cmd: "bold", icon: Bold, label: "Bold" },
    { cmd: "italic", icon: Italic, label: "Italic" },
    { cmd: "underline", icon: Underline, label: "Underline" },
    { divider: true },
    { cmd: "insertUnorderedList", icon: List, label: "Bulleted list" },
    { cmd: "insertOrderedList", icon: ListOrdered, label: "Numbered list" },
  ];

  return (
    <div
      className="flex flex-col overflow-hidden rounded-md border border-blue-300 bg-white shadow-sm transition-all focus-within:ring-1 focus-within:ring-blue-400"
      style={fontMedium}
    >
      <div
        role="toolbar"
        aria-label="Text formatting"
        className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50/60 p-1.5"
      >
        {tools.map((tool, i) =>
          tool.divider ? (
            <div key={i} className="mx-1 h-5 w-px bg-gray-300" />
          ) : (
            <button
              key={tool.cmd}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => format(tool.cmd)}
              aria-label={tool.label}
              aria-pressed={activeFormats[tool.cmd]}
              title={tool.label}
              className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border transition-all ${FOCUS} ${
                activeFormats[tool.cmd]
                  ? "border-blue-300 bg-blue-100 text-blue-700"
                  : "border-transparent bg-transparent text-gray-600 hover:bg-gray-200"
              }`}
            >
              <tool.icon size={16} />
            </button>
          ),
        )}
      </div>

      <div
        ref={contentRef}
        contentEditable
        role="textbox"
        aria-multiline="true"
        aria-label={label}
        onInput={updateToolbar}
        suppressContentEditableWarning
        className="prose max-w-none min-h-[7rem] max-h-72 w-full cursor-text overflow-y-auto p-3 text-[14px] leading-relaxed focus:outline-none empty:before:text-gray-400 empty:before:content-[attr(data-placeholder)] [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
        data-placeholder={placeholder}
      />

      {attachments.length > 0 && (
        <ul className="flex flex-wrap gap-2 border-t border-gray-100 bg-gray-50/50 px-3 py-2">
          {attachments.map((file, i) => (
            <li
              key={i}
              className="flex max-w-full items-center gap-1.5 rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 shadow-sm"
            >
              <Paperclip size={12} className="shrink-0 text-gray-500" />
              <span className="max-w-[160px] truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => removeAttachment(i)}
                aria-label={`Remove ${file.name}`}
                className={`ml-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-red-50 hover:bg-red-100 hover:text-red-500 ${FOCUS}`}
              >
                <X size={10} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between gap-2 border-t border-gray-200 bg-gray-50 p-2">
        <span className="text-[11px] text-gray-400">
          Images only · 10 MB each
        </span>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
          accept="image/*"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          style={fontBold}
          className={`flex min-h-9 cursor-pointer items-center gap-1.5 rounded border border-gray-200 bg-white px-3 text-sm text-blue-600 shadow-sm transition-colors hover:bg-blue-50 ${FOCUS}`}
        >
          <Paperclip size={14} /> Attach ({attachments.length}/{MAX_IMAGES})
        </button>
      </div>
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="ml-1 animate-pulse border-l-2 border-gray-200 pl-5"
        >
          <div className="rounded-lg border border-slate-200 p-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-md bg-slate-200" />
              <div className="h-3 w-40 rounded bg-slate-200" />
            </div>
            <div className="mt-3 h-3 w-full rounded bg-slate-100" />
            <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

const COMPOSER_TABS = [
  { id: "notes", icon: PencilLine, label: "Note" },
  { id: "messages", icon: MessageCircle, label: "Message" },
  { id: "calls", icon: Phone, label: "Call" },
  { id: "meetings", icon: Calendar, label: "Schedule meeting" },
];

const FILTERS = [
  ["all", "All"],
  ["notes", "Notes"],
  ["calls", "Calls"],
  ["messages", "Messages"],
  ["meetings", "Meetings"],
];

const filterMatches = (key, activity) => {
  switch (key) {
    case "all":
      return true;
    case "notes":
      return activity.type === "note";
    case "calls":
      return activity.type === "call";
    case "messages":
      return ["email", "message", "direct"].includes(activity.type);
    case "meetings":
      return activity.type === "meeting" || activity.type === "virtual_meeting";
    default:
      return true;
  }
};

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------------
export default function Meetings({
  id,
  compact = false,
  sampleMode = false,
  onClose,
}) {
  const { nOtes_, Meetings, msg_, calls_ } = UseAdd();
  const { getAllActivities_ } = useGet();
  const { editNote_, Editmsg_, Editcalls_, EditMeeting } = useEdit();
  const { deleteNote_, deletecalls_, deletmsg_, DeleteMeeting } = UseDelete();

  // --- STATE ---
  const [activities, setActivities] = useState(() =>
    sampleMode || !id?.mainID ? SAMPLE_ACTIVITIES : [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("notes");
  const [composerOpen, setComposerOpen] = useState(false);
  const [activityFilter, setActivityFilter] = useState("all");
  const scrollContainerRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const requireMainId = () => {
    if (sampleMode) {
      ErrorNotify("Sample activity records are read-only.");
      return false;
    }
    if (id?.mainID) return true;
    ErrorNotify("Save the lead before adding or changing activity records.");
    return false;
  };

  // Form States & Refs
  const noteRef = useRef(null);
  const [noteAttachments, setNoteAttachments] = useState([]);

  const [msgType, setMsgType] = useState("email");
  const [msgTo, setMsgTo] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [msgSubject, setMsgSubject] = useState("");
  const [msgDates, setMsgDates] = useState({ from: "", to: "" });
  const [msgTime, setMsgTime] = useState(getCurrentTime());
  const [msgDateResetKey, setMsgDateResetKey] = useState(Date.now());
  const msgRef = useRef(null);
  const [msgAttachments, setMsgAttachments] = useState([]);

  const [callContact, setCallContact] = useState("Om Prakash Prasai");
  const [callOutcome, setCallOutcome] = useState("Connected");
  const [callDates, setCallDates] = useState({ from: "", to: "" });
  const [callTimes, setCallTimes] = useState({
    from: getCurrentTime(),
    to: getSystemTimePlusHour(),
  });
  const [callDateResetKey, setCallDateResetKey] = useState(Date.now() + 1);
  const callRef = useRef(null);
  const [callAttachments, setCallAttachments] = useState([]);

  const [meetingType, setMeetingType] = useState("physical");
  const [meetTitle, setMeetTitle] = useState("");
  const [meetLinks, setMeetLinks] = useState([]);
  const [linkInput, setLinkInput] = useState("");
  const [meetLocation, setMeetLocation] = useState("");
  const [meetDates, setMeetDates] = useState({ from: "", to: "" });
  const [dateResetKey, setDateResetKey] = useState(Date.now() + 2);
  const [meetTimes, setMeetTimes] = useState({
    from: getCurrentTime(),
    to: getSystemTimePlusHour(),
  });
  const meetRef = useRef(null);
  const [meetAttachments, setMeetAttachments] = useState([]);
  const fetchTimeline = useCallback(
    async ({ silent = false } = {}) => {
      if (sampleMode || !id?.mainID) return;

      setIsLoading(true);
      const loadingMessage = "Loading activity timeline...";
      waitingNotify(loadingMessage);
      try {
        const res = await getAllActivities_.mutateAsync({
          parms: { MainID: id.mainID },
        });

        const stageData = res?.data?.[0]?.stages?.Stage1 || [];
        const stage1 = Array.isArray(stageData)
          ? stageData[0]
          : stageData || {};

        const notes = stage1?.noteSchema || stage1?.notesSchema || [];
        const calls = stage1?.callsSchema || [];
        const emails = stage1?.emailSchema || [];
        const messages = stage1?.message || [];
        const virtual = stage1?.virtualMeetingSchema || [];
        const physical = stage1?.physicalMeetingSchema || [];

        const normalizedNotes = notes.map((n) => ({
          ...n,
          id: n._id,
          type: "note",
          content: n.note,
          timestamp: n.createdAt,
          createdDate: n.createdAt,
        }));

        const normalizedEmails = emails.map((e) => ({
          ...e,
          id: e._id,
          type: "email",
          content: e.message || e.content,
          to: e.to,
          subject: e.subject,
          timestamp: e.fromDate || e.date || e.createdAt,
          createdDate: e.createdAt,
        }));

        const normalizedMessages = messages.map((m) => ({
          ...m,
          id: m._id,
          type: "message",
          content: m.note || m.content,
          timestamp: m.fromDate || m.date || m.createdAt,
          createdDate: m.createdAt,
        }));

        const normalizedCalls = calls.map((c) => ({
          ...c,
          id: c._id,
          type: "call",
          content: c.note || c.content,
          contact: c.connected || c.contact,
          outcome: c.outCome || c.outcome,
          fromTime: c.fromTime || c.time?.split("/")[0] || "",
          toTime: c.toTime || c.time?.split("/")[1] || "",
          timestamp: c.fromDate || c.date || c.createdAt,
          createdDate: c.createdAt,
        }));

        const normalizedPhysical = physical.map((p) => ({
          ...p,
          id: p._id,
          type: "meeting",
          meetingType: p.meetingType || "physical",
          title: p.title,
          location: p.location,
          content: p.agenda || p.content,
          fromTime: p.fromTime || p.C_time?.split("/")[0] || "",
          toTime: p.toTime || p.C_time?.split("/")[1] || "",
          start: p.fromDate || p.date,
          end: p.toDate || p.date,
          timestamp: p.createdAt,
          createdDate: p.createdAt,
        }));

        const normalizedVirtual = virtual.map((v) => ({
          ...v,
          id: v._id,
          type: "virtual_meeting",
          meetingType: v.meetingType || "virtual",
          title: v.title,
          link: Array.isArray(v.link) ? v.link : [v.link].filter(Boolean),
          content: v.agenda || v.content,
          fromTime: v.fromTime || v.C_time?.split("/")[0] || "",
          toTime: v.toTime || v.C_time?.split("/")[1] || "",
          start: v.fromDate || v.date,
          end: v.toDate || v.date,
          timestamp: v.createdAt,
          createdDate: v.createdAt,
        }));

        const allActivities = [
          ...normalizedNotes,
          ...normalizedCalls,
          ...normalizedEmails,
          ...normalizedMessages,
          ...normalizedPhysical,
          ...normalizedVirtual,
        ];

        allActivities.sort((a, b) => {
          const dateA = getNepaliDateTimestamp(a.timestamp || a.createdDate);
          const dateB = getNepaliDateTimestamp(b.timestamp || b.createdDate);
          return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
        });

        setActivities(allActivities);
        if (!silent) SuccessNotify("Activity timeline loaded.");
      } catch (error) {
        console.error("Failed to fetch timeline activities:", error);
        const errorMsg =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch timeline activities.";
        ErrorNotify(errorMsg);
      } finally {
        dismissWaitingNotify(loadingMessage);
        setIsLoading(false);
      }
    },
    [id?.mainID, sampleMode],
  );

  useEffect(() => {
    if (sampleMode || !id?.mainID) return;
    setActivities([]);
    fetchTimeline();
  }, [id?.mainID]);

  // --- API CALLS ---
  const handleSaveNoteAPI = async (formData) => {
    if (!requireMainId()) return false;
    if (isSubmitting) return false;
    setIsSubmitting(true);
    const loadingMessage = "Saving note...";
    waitingNotify(loadingMessage);
    try {
      const response = await nOtes_.mutateAsync({
        payload: formData,
        parms: { MainID: id?.mainID },
      });
      if (response?.success !== true) {
        throw new Error(
          response?.message || "The note was not confirmed as saved.",
        );
      }
      await fetchTimeline({ silent: true });
      SuccessNotify(
        response?.data?.message ||
          response?.message ||
          "Note saved successfully!",
      );
      return true;
    } catch (error) {
      ErrorNotify(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save note.",
      );
      await fetchTimeline({ silent: true });
      return false;
    } finally {
      dismissWaitingNotify(loadingMessage);
      setIsSubmitting(false);
    }
  };

  const handleSaveMessageAPI = async (formData, type) => {
    if (!requireMainId()) return false;
    if (isSubmitting) return false;
    setIsSubmitting(true);
    const loadingMessage =
      type === "email" ? "Sending email..." : "Saving message...";
    waitingNotify(loadingMessage);
    try {
      const response = await msg_.mutateAsync({
        payload: formData,
        parms: { MainID: id?.mainID },
      });
      if (response?.success !== true) {
        throw new Error(
          response?.message || "The message was not confirmed as saved.",
        );
      }
      await fetchTimeline({ silent: true });
      SuccessNotify(
        response?.data?.message ||
          response?.message ||
          `${type === "email" ? "Email sent" : "Message saved"} successfully!`,
      );
      return true;
    } catch (error) {
      ErrorNotify(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to route message pipeline.",
      );
      return false;
    } finally {
      dismissWaitingNotify(loadingMessage);
      setIsSubmitting(false);
    }
  };

  const handleSaveCallAPI = async (formData) => {
    if (!requireMainId()) return false;
    if (isSubmitting) return false;
    setIsSubmitting(true);
    const loadingMessage = "Logging call...";
    waitingNotify(loadingMessage);
    try {
      const response = await calls_.mutateAsync({
        payload: formData,
        parms: { MainID: id?.mainID },
      });
      if (response?.success !== true) {
        throw new Error(
          response?.message || "The call was not confirmed as saved.",
        );
      }
      await fetchTimeline({ silent: true });
      SuccessNotify(
        response?.data?.message ||
          response?.message ||
          "Call details logged successfully!",
      );
      return true;
    } catch (error) {
      ErrorNotify(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to store call ledger.",
      );
      return false;
    } finally {
      dismissWaitingNotify(loadingMessage);
      setIsSubmitting(false);
    }
  };

  const handleSaveMeetingAPI = async (formData) => {
    if (!requireMainId()) return false;
    if (isSubmitting) return false;
    setIsSubmitting(true);
    const loadingMessage = "Scheduling meeting...";
    waitingNotify(loadingMessage);
    try {
      const response = await Meetings.mutateAsync({
        payload: formData,
        parms: { MainID: id?.mainID },
      });
      if (response?.success !== true) {
        throw new Error(
          response?.message || "The meeting was not confirmed as saved.",
        );
      }
      await fetchTimeline({ silent: true });
      SuccessNotify(
        response?.data?.message ||
          response?.message ||
          "Meeting scheduled successfully!",
      );
      return true;
    } catch (error) {
      ErrorNotify(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save meeting.",
      );
      return false;
    } finally {
      dismissWaitingNotify(loadingMessage);
      setIsSubmitting(false);
    }
  };

  const handleUpdateActivity = async (
    updatedId,
    updatedPayload,
    activityType,
    meetingTypeVal,
  ) => {
    if (!requireMainId()) return false;
    const loadingMessage = "Updating record...";
    waitingNotify(loadingMessage);
    try {
      let res;
      const apiType = activityType === "direct" ? "message" : activityType;

      if (activityType === "call" && Editcalls_) {
        res = await Editcalls_.mutateAsync({
          payload: updatedPayload,
          parms: { MainID: id?.mainID, id: updatedId },
        });
      } else if (
        (activityType === "message" ||
          activityType === "direct" ||
          activityType === "email") &&
        Editmsg_
      ) {
        if (!updatedPayload.has("type")) updatedPayload.append("type", apiType);
        res = await Editmsg_.mutateAsync({
          payload: updatedPayload,
          parms: { MainID: id?.mainID, id: updatedId, type: apiType },
        });
      } else if (activityType === "note" && editNote_) {
        res = await editNote_.mutateAsync({
          payload: updatedPayload,
          parms: { MainID: id?.mainID, id: updatedId },
        });
      } else if (
        (activityType === "meeting" || activityType === "virtual_meeting") &&
        EditMeeting
      ) {
        if (!updatedPayload.has("meetingType"))
          updatedPayload.append("meetingType", meetingTypeVal);
        res = await EditMeeting.mutateAsync({
          payload: updatedPayload,
          parms: { MainID: id?.mainID, id: updatedId },
        });
      }
      if (res?.success !== true) {
        throw new Error(res?.message || "The record update was not confirmed.");
      }
      await fetchTimeline({ silent: true });
      SuccessNotify(
        res?.data?.message || res?.message || "Record updated successfully.",
      );
      return true;
    } catch (error) {
      console.error("Edit Mutation Error:", error);
      ErrorNotify(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update record.",
      );
      return false;
    } finally {
      dismissWaitingNotify(loadingMessage);
    }
  };

  const handleDeleteActivity = async (deletedId, activityType) => {
    if (!requireMainId()) return false;
    const loadingMessage = "Deleting record...";
    waitingNotify(loadingMessage);
    try {
      let res;
      const apiType = activityType === "direct" ? "message" : activityType;

      if (activityType === "call" && deletecalls_) {
        res = await deletecalls_.mutateAsync({
          parms: { MainID: id?.mainID, id: deletedId },
        });
      } else if (
        (activityType === "message" ||
          activityType === "direct" ||
          activityType === "email") &&
        deletmsg_
      ) {
        res = await deletmsg_.mutateAsync({
          parms: { MainID: id?.mainID, id: deletedId, type: apiType },
        });
      } else if (activityType === "note" && deleteNote_) {
        res = await deleteNote_.mutateAsync({
          parms: { MainID: id?.mainID, id: deletedId },
        });
      } else if (
        (activityType === "meeting" || activityType === "virtual_meeting") &&
        DeleteMeeting
      ) {
        res = await DeleteMeeting.mutateAsync({
          parms: { MainID: id?.mainID, id: deletedId },
        });
      }

      if (res?.success !== true) {
        throw new Error(
          res?.message || "The record deletion was not confirmed.",
        );
      }
      await fetchTimeline({ silent: true });
      SuccessNotify(res?.data?.message || res?.message || "Record deleted.");
      return true;
    } catch (error) {
      console.error("Delete Mutation Error:", error);
      ErrorNotify(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete record.",
      );
      return false;
    } finally {
      dismissWaitingNotify(loadingMessage);
    }
  };

  // --- FORMDATA GENERATORS ---
  const submitNote = async () => {
    const htmlContent = noteRef.current.innerHTML.trim();
    // if (isEditorEmpty(htmlContent) && noteAttachments.length === 0) return ErrorNotify("Cannot save an empty note.");

    const formData = new FormData();
    formData.append("content", isEditorEmpty(htmlContent) ? "" : htmlContent);
    noteAttachments.forEach((a) => {
      if (a.file) formData.append("file", a.file);
    });

    const success = await handleSaveNoteAPI(formData);
    if (success) {
      noteRef.current.innerHTML = "";
      setNoteAttachments([]);
    }
  };

  const submitMessage = async () => {
    const emailRecipients =
      msgType === "email"
        ? [
            ...new Set(
              msgTo
                .map((recipient) => String(recipient || "").trim())
                .filter(isValidEmail),
            ),
          ]
        : [];
    if (msgType === "email") {
      setMsgTo(emailRecipients);
      if (emailRecipients.length === 0) {
        ErrorNotify("Please add at least one valid email recipient.");
        return;
      }
    }

    const rawHtml = msgRef.current.innerHTML.trim();
    const htmlContent = isEditorEmpty(rawHtml) ? "" : rawHtml;
    if (!htmlContent && !msgSubject.trim() && msgAttachments.length === 0) {
      // return ErrorNotify("Please write a message first.");
    }

    const apiType = msgType === "direct" ? "message" : msgType;
    const payloadData = [
      {
        type: apiType,
        ...(msgType === "email"
          ? { to: emailRecipients, subject: msgSubject }
          : {}),
        note: htmlContent,
        fromDate: msgDates.from,
        toDate: msgDates.to,
        time: msgTime,
      },
    ];

    const formData = new FormData();
    formData.append("items", JSON.stringify(payloadData));
    msgAttachments.forEach((a) => {
      if (a.file) formData.append("file", a.file);
    });

    const success = await handleSaveMessageAPI(formData, apiType);
    if (success) {
      msgRef.current.innerHTML = "";
      setMsgSubject("");
      setMsgTo([]);
      setEmailInput("");
      setMsgAttachments([]);
      setMsgDates({ from: "", to: "" });
      setMsgTime(getCurrentTime());
      setMsgDateResetKey(Date.now());
    }
  };

  const submitCall = async () => {
    const rawHtml = callRef.current.innerHTML.trim();
    const htmlContent = isEditorEmpty(rawHtml) ? "" : rawHtml;
    // if (!htmlContent && callAttachments.length === 0) return ErrorNotify("Please add some notes for this call.");

    if (
      !validateTimeRange(
        callTimes.from,
        callTimes.to,
        callDates.from,
        callDates.to,
      )
    ) {
      return ErrorNotify("'To Time' must be strictly after 'From Time'.");
    }

    const payloadData = [
      {
        contact: callContact,
        outcome: callOutcome,
        content: htmlContent,
        fromDate: callDates.from,
        toDate: callDates.to,
        time: `${callTimes.from}/${callTimes.to}`,
        fromTime: callTimes.from,
        toTime: callTimes.to,
      },
    ];

    const formData = new FormData();
    formData.append("items", JSON.stringify(payloadData));
    callAttachments.forEach((a) => {
      if (a.file) formData.append("file", a.file);
    });

    const success = await handleSaveCallAPI(formData);
    if (success) {
      callRef.current.innerHTML = "";
      setCallAttachments([]);
      setCallDates({ from: "", to: "" });
      setCallTimes({ from: getCurrentTime(), to: getSystemTimePlusHour() });
      setCallDateResetKey(Date.now());
    }
  };

  const submitMeeting = async () => {
    const rawHtml = meetRef.current ? meetRef.current.innerHTML.trim() : "";
    const htmlContent = isEditorEmpty(rawHtml) ? "" : rawHtml;

    if (!meetTitle.trim() || !meetDates.from || !meetDates.to) {
      return ErrorNotify("Please fill in the meeting title and dates.");
    }
    const todayBs = toNepaliDateInputValue(new Date());
    if (meetDates.from < todayBs || meetDates.to < todayBs) {
      return ErrorNotify("Meeting dates must be today or later.");
    }
    if (meetingType === "virtual" && meetLinks.length === 0) {
      return ErrorNotify("Please add at least one virtual meeting link.");
    }
    if (meetingType === "physical" && !meetLocation.trim()) {
      return ErrorNotify("Please provide a physical venue / location.");
    }
    if (!meetTimes.from || !meetTimes.to) {
      return ErrorNotify("Please set both From Time and To Time.");
    }
    if (
      !validateTimeRange(
        meetTimes.from,
        meetTimes.to,
        meetDates.from,
        meetDates.to,
      )
    ) {
      return ErrorNotify("'To Time' must be strictly after 'From Time'.");
    }

    const payloadData = [
      {
        type: meetingType,
        title: meetTitle,
        link: meetingType === "virtual" ? meetLinks : undefined,
        location: meetingType === "physical" ? meetLocation : undefined,
        fromDate: meetDates.from,
        toDate: meetDates.to,
        C_time: `${meetTimes.from}/${meetTimes.to}`,
        fromTime: meetTimes.from,
        toTime: meetTimes.to,
        content: htmlContent,
      },
    ];

    const formData = new FormData();
    formData.append("items", JSON.stringify(payloadData));
    meetAttachments.forEach((a) => {
      if (a.file) formData.append("file", a.file);
    });

    const success = await handleSaveMeetingAPI(formData);
    if (success) {
      setMeetTitle("");
      setMeetLinks([]);
      setLinkInput("");
      setMeetLocation("");
      setMeetDates({ from: "", to: "" });
      setDateResetKey(Date.now());
      setMeetTimes({ from: getCurrentTime(), to: getSystemTimePlusHour() });
      if (meetRef.current) meetRef.current.innerHTML = "";
      setMeetAttachments([]);
    }
  };

  const cancelForm = () => {
    [noteRef, msgRef, callRef, meetRef].forEach((ref) => {
      if (ref.current) ref.current.innerHTML = "";
    });

    setNoteAttachments([]);
    setMsgAttachments([]);
    setCallAttachments([]);
    setMeetAttachments([]);

    setMsgSubject("");
    setMsgTo([]);
    setEmailInput("");
    setMsgDates({ from: "", to: "" });
    setMsgTime(getCurrentTime());
    setMsgDateResetKey(Date.now());

    setCallDates({ from: "", to: "" });
    setCallTimes({ from: getCurrentTime(), to: getSystemTimePlusHour() });
    setCallDateResetKey(Date.now() + 1);

    setMeetTitle("");
    setMeetLinks([]);
    setLinkInput("");
    setMeetLocation("");
    setMeetDates({ from: "", to: "" });
    setDateResetKey(Date.now() + 2);
    setMeetTimes({ from: getCurrentTime(), to: getSystemTimePlusHour() });
    setComposerOpen(false);
  };

  const handleAddEmail = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newEmail = emailInput.trim();
      if (!newEmail) return;
      if (!isValidEmail(newEmail))
        return ErrorNotify("Please enter a valid email address.");
      if (msgTo.includes(newEmail)) return ErrorNotify("Email already added.");
      if (msgTo.length >= 5) return ErrorNotify("Max 5 recipients allowed.");
      setMsgTo([...msgTo, newEmail]);
      setEmailInput("");
    }
  };
  const handleRemoveEmail = (index) =>
    setMsgTo(msgTo.filter((_, i) => i !== index));

  const handleAddMeetLink = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const parsed = parseMeetingLink(linkInput);
      if (parsed.empty) return;
      if (parsed.error) return ErrorNotify(parsed.error);
      if (meetLinks.includes(parsed.link))
        return ErrorNotify("This link has already been added.");
      if (meetLinks.length >= 5) return ErrorNotify("Max 5 links allowed.");
      setMeetLinks([...meetLinks, parsed.link]);
      setLinkInput("");
    }
  };
  const handleRemoveMeetLink = (index) =>
    setMeetLinks(meetLinks.filter((_, i) => i !== index));

  const rangeHandler = (setter) => (dateData) => {
    const dates = getSelectedDates(dateData);
    const from = dates[0] || "";
    setter({ from, to: dates[1] || from });
  };
  const handleDateChange = rangeHandler(setMeetDates);
  const handleMsgDateChange = rangeHandler(setMsgDates);
  const handleCallDateChange = rangeHandler(setCallDates);

  const handleTabSwitch = (tabId) => {
    setActiveTab(tabId);
    setComposerOpen(true);
    if (scrollContainerRef.current)
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- DERIVED DATA ---
  const counts = useMemo(() => {
    const result = {};
    FILTERS.forEach(([key]) => {
      result[key] = activities.filter((a) => filterMatches(key, a)).length;
    });
    return result;
  }, [activities]);

  const filteredActivities = useMemo(
    () => activities.filter((a) => filterMatches(activityFilter, a)),
    [activities, activityFilter],
  );

  const activityGroups = useMemo(
    () =>
      filteredActivities.reduce((groups, activity) => {
        const timestamp = getNepaliDateTimestamp(
          activity.timestamp || activity.createdDate,
        );
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        const sameDay = (a, b) => a.toDateString() === b.toDateString();
        const label = sameDay(date, today)
          ? "Today"
          : sameDay(date, yesterday)
            ? "Yesterday"
            : date >= weekStart
              ? "This week"
              : "Earlier";
        (groups[label] ||= []).push(activity);
        return groups;
      }, {}),
    [filteredActivities],
  );

  const twoCol = compact
    ? "grid grid-cols-1 gap-4"
    : "grid grid-cols-1 gap-4 sm:grid-cols-2";
  const readOnly = !id?.mainID || sampleMode;

  return (
    <div
      className={`h-full min-h-0 min-w-0 text-[13px] text-[#33475b] sm:text-sm ${compact ? "w-full" : ""}`}
      style={fontMedium}
    >
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-[#cbd6e2] bg-white shadow-sm">
        {/* HEADER */}
        <div className="flex items-center justify-between gap-2 border-b border-[#cbd6e2] bg-gray-50/60 px-3 py-2">
          <div className="min-w-0">
            <h2 style={fontStrong} className="flex items-center gap-2 text-sm">
              <Activity size={17} className="shrink-0 text-gray-500" />
              <span className="truncate">Meetings & Activity</span>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] text-slate-600">
                {activities.length}
              </span>
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setComposerOpen((open) => !open)}
              aria-expanded={composerOpen}
              style={fontBold}
              className={`flex min-h-10 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs text-white ${BRAND} ${FOCUS}`}
            >
              {composerOpen ? <X size={15} /> : <Plus size={15} />}
              <span>{composerOpen ? "Close" : "Add activity"}</span>
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close meetings and activity"
                className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 ${FOCUS}`}
              >
                <X size={17} />
              </button>
            )}
          </div>
        </div>

        {/* COMPOSER TYPE SWITCHER */}
        <div
          role="tablist"
          aria-label="Activity type"
          className="grid grid-cols-4 gap-1 border-b border-[#cbd6e2] p-1.5 sm:flex sm:gap-1"
        >
          {COMPOSER_TABS.map((tab) => {
            const Icon = tab.icon;
            const selected = activeTab === tab.id && composerOpen;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => handleTabSwitch(tab.id)}
                style={fontBold}
                className={`flex min-h-11 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg px-2 text-[11px] transition-colors sm:min-h-10 sm:flex-row sm:gap-1.5 sm:px-3 sm:text-xs ${FOCUS} ${selected ? "bg-[#ff7a59]/10 text-[#33475b]" : "text-[#516f90] hover:bg-slate-100 hover:text-[#33475b]"}`}
              >
                <Icon size={16} className={selected ? "text-[#ff7a59]" : ""} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* BODY */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto bg-white p-3 sm:p-4"
        >
          {readOnly && (
            <div
              role="status"
              className="mb-4 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800"
            >
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              {sampleMode
                ? "Sample activity records are read-only."
                : "Save the lead first to add or edit real activity records."}
            </div>
          )}

          {/* NOTE */}
          {composerOpen && activeTab === "notes" && (
            <ComposerShell
              icon={PencilLine}
              iconClass="bg-yellow-100 text-yellow-600"
              title="Log a note"
              footer={
                <SubmitBar
                  onSubmit={submitNote}
                  onCancel={cancelForm}
                  isSubmitting={isSubmitting}
                  label="Save note"
                  busyLabel="Saving..."
                />
              }
            >
              <RichEditor
                label="Note"
                contentRef={noteRef}
                placeholder="Start typing your note..."
                attachments={noteAttachments}
                setAttachments={setNoteAttachments}
              />
            </ComposerShell>
          )}

          {/* MESSAGE */}
          {composerOpen && activeTab === "messages" && (
            <ComposerShell
              icon={MessageCircle}
              iconClass="bg-blue-100 text-blue-600"
              title="Compose message"
              headerRight={
                <RadioPills
                  name="msgType"
                  value={msgType}
                  onChange={setMsgType}
                  options={[
                    { value: "email", label: "Email" },
                    { value: "direct", label: "Log message" },
                  ]}
                />
              }
              footer={
                <SubmitBar
                  onSubmit={submitMessage}
                  onCancel={cancelForm}
                  isSubmitting={isSubmitting}
                  cancelLabel="Discard"
                  busyLabel="Sending..."
                  label={msgType === "email" ? "Send email" : "Save message"}
                />
              }
            >
              {msgType === "direct" && (
                <div className={twoCol}>
                  <Field
                    label={getActivityDateLabel("message")}
                    className="sm:col-span-2"
                  >
                    <NepaliDateInput
                      key={msgDateResetKey}
                      placeholder="Select message date (BS)..."
                      onDateChange={handleMsgDateChange}
                      isToday={true}
                    />
                  </Field>
                  <Field label="Time" htmlFor="msg-time">
                    <input
                      id="msg-time"
                      type="time"
                      value={msgTime}
                      onChange={(e) => setMsgTime(e.target.value)}
                      className={`${INPUT} cursor-pointer`}
                    />
                  </Field>
                </div>
              )}

              {msgType === "email" && (
                <>
                  <Field label={`To (${msgTo.length}/5)`} htmlFor="msg-to">
                    <div className="space-y-2">
                      <ChipList
                        items={msgTo}
                        onRemove={handleRemoveEmail}
                        label="Remove recipient"
                      />
                      {msgTo.length < 5 ? (
                        <input
                          id="msg-to"
                          type="email"
                          inputMode="email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          onKeyDown={handleAddEmail}
                          placeholder={
                            msgTo.length === 0
                              ? "name@domain.com — press Enter to add"
                              : "Add another email..."
                          }
                          className={INPUT}
                        />
                      ) : (
                        <p className="flex items-center gap-1 text-xs text-orange-600">
                          <AlertTriangle size={12} /> Maximum 5 recipients
                        </p>
                      )}
                    </div>
                  </Field>
                  <Field label="Subject" htmlFor="msg-subject">
                    <input
                      id="msg-subject"
                      type="text"
                      value={msgSubject}
                      onChange={(e) => setMsgSubject(e.target.value)}
                      placeholder="Enter email subject..."
                      className={INPUT}
                    />
                  </Field>
                </>
              )}
              <RichEditor
                label="Message body"
                contentRef={msgRef}
                placeholder="Type your message..."
                attachments={msgAttachments}
                setAttachments={setMsgAttachments}
              />
            </ComposerShell>
          )}

          {/* CALL */}
          {composerOpen && activeTab === "calls" && (
            <ComposerShell
              icon={Phone}
              iconClass="bg-green-100 text-green-600"
              title="Log a call"
              footer={
                <SubmitBar
                  onSubmit={submitCall}
                  onCancel={cancelForm}
                  isSubmitting={isSubmitting}
                  label="Log call"
                  busyLabel="Logging..."
                />
              }
            >
              <div className={twoCol}>
                <Field label="Contact Person Name" htmlFor="call-contact">
                  <input
                    id="call-contact"
                    type="text"
                    value={callContact}
                    onChange={(e) => setCallContact(e.target.value)}
                    className={INPUT}
                    placeholder="Contact name"
                  />
                </Field>
                <Field label="Outcome" htmlFor="call-outcome">
                  <Select
                    inputId="call-outcome"
                    options={[
                      { value: "Connected", label: "Connected" },
                      { value: "Left voicemail", label: "Left voicemail" },
                      { value: "No answer", label: "No answer" },
                    ]}
                    value={{ value: callOutcome, label: callOutcome }}
                    onChange={(option) => setCallOutcome(option?.value || "")}
                    isClearable={false}
                    menuPortalTarget={
                      typeof document !== "undefined" ? document.body : null
                    }
                    menuPosition="fixed"
                    styles={SELECT_STYLES}
                    classNamePrefix="meeting-select"
                  />
                </Field>
                <Field
                  label={getActivityDateLabel("call")}
                  className="sm:col-span-2"
                >
                  <NepaliDateInput
                    key={callDateResetKey}
                    placeholder="Select call date range (From – To)..."
                    onDateChange={handleCallDateChange}
                  />
                </Field>
                <Field label="From time" htmlFor="call-from">
                  <input
                    id="call-from"
                    type="time"
                    step="1"
                    value={callTimes.from}
                    onChange={(e) =>
                      setCallTimes({ ...callTimes, from: e.target.value })
                    }
                    className={`${INPUT} cursor-pointer`}
                  />
                </Field>
                <Field label="To time" htmlFor="call-to">
                  <input
                    id="call-to"
                    type="time"
                    step="1"
                    value={callTimes.to}
                    onChange={(e) =>
                      setCallTimes({ ...callTimes, to: e.target.value })
                    }
                    className={`${INPUT} cursor-pointer`}
                  />
                </Field>
              </div>
              <Field label="Call notes">
                <RichEditor
                  label="Call notes"
                  contentRef={callRef}
                  placeholder="Describe the call..."
                  attachments={callAttachments}
                  setAttachments={setCallAttachments}
                />
              </Field>
            </ComposerShell>
          )}

          {/* MEETING */}
          {composerOpen && activeTab === "meetings" && (
            <ComposerShell
              icon={meetingType === "virtual" ? Video : Calendar}
              iconClass={
                meetingType === "virtual"
                  ? "bg-indigo-100 text-indigo-600"
                  : "bg-purple-100 text-purple-600"
              }
              title="Schedule Meeting"
              headerRight={
                <RadioPills
                  name="meetType"
                  value={meetingType}
                  onChange={setMeetingType}
                  options={[
                    { value: "physical", label: "Physical Meeting" },
                    { value: "virtual", label: "Virtual Meeting" },
                  ]}
                />
              }
              footer={
                <SubmitBar
                  onSubmit={submitMeeting}
                  onCancel={cancelForm}
                  isSubmitting={isSubmitting}
                  busyLabel="Scheduling..."
                  label={`Schedule ${meetingType === "virtual" ? "Virtual" : "Physical"} Meeting`}
                />
              }
            >
              <Field label="Meeting Title" htmlFor="meet-title">
                <input
                  id="meet-title"
                  type="text"
                  value={meetTitle}
                  onChange={(e) => setMeetTitle(e.target.value)}
                  placeholder={
                    meetingType === "virtual"
                      ? "e.g., Quarterly Sprint Planning (Zoom)"
                      : "e.g., Client Audit Review (Head Office)"
                  }
                  className="w-full rounded-md border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium shadow-sm transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </Field>

              {meetingType === "virtual" ? (
                <Field
                  label={`Meeting Links (${meetLinks.length}/5) — Google Meet or Zoom`}
                  htmlFor="meet-link"
                >
                  <div className="space-y-2">
                    <ChipList
                      items={meetLinks}
                      onRemove={handleRemoveMeetLink}
                      tone="indigo"
                      label="Remove link"
                    />
                    {meetLinks.length < 5 && (
                      <input
                        id="meet-link"
                        type="text"
                        inputMode="url"
                        value={linkInput}
                        onChange={(e) => setLinkInput(e.target.value)}
                        onKeyDown={handleAddMeetLink}
                        placeholder={
                          meetLinks.length === 0
                            ? "Paste meeting URL (e.g., https://zoom.us/j/...) and press Enter"
                            : "Add another link..."
                        }
                        className={INPUT}
                      />
                    )}
                  </div>
                </Field>
              ) : (
                <Field
                  label="Physical Venue / Location"
                  htmlFor="meet-location"
                >
                  <input
                    id="meet-location"
                    type="text"
                    value={meetLocation}
                    onChange={(e) => setMeetLocation(e.target.value)}
                    placeholder="e.g., Executive Boardroom, 3rd Floor"
                    className={INPUT}
                  />
                </Field>
              )}

              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 space-y-3">
                <Field
                  label={`${getActivityDateLabel("meeting")} (Bikram Sambat)`}
                  className="sm:col-span-2"
                >
                  <NepaliDateInput
                    key={dateResetKey}
                    placeholder="Select start and end dates for this meeting..."
                    onDateChange={handleDateChange}
                  />
                </Field>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="From Time" htmlFor="meet-from">
                    <input
                      id="meet-from"
                      type="time"
                      value={meetTimes.from}
                      onChange={(e) =>
                        setMeetTimes({ ...meetTimes, from: e.target.value })
                      }
                      className={`${INPUT} cursor-pointer`}
                    />
                  </Field>
                  <Field label="To Time" htmlFor="meet-to">
                    <input
                      id="meet-to"
                      type="time"
                      value={meetTimes.to}
                      onChange={(e) =>
                        setMeetTimes({ ...meetTimes, to: e.target.value })
                      }
                      className={`${INPUT} cursor-pointer`}
                    />
                  </Field>
                </div>
              </div>

              <Field label="Meeting Agenda & Objectives">
                <RichEditor
                  label="Meeting agenda"
                  contentRef={meetRef}
                  placeholder="Outline discussion points, required preparation, or attach reference documents..."
                  attachments={meetAttachments}
                  setAttachments={setMeetAttachments}
                />
              </Field>
            </ComposerShell>
          )}

          {/* TIMELINE HEADER + FILTERS */}
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 style={fontBold} className="text-[15px] text-gray-700">
              Timeline
            </h3>
            <div
              className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 scrollbar-hide"
              role="group"
              aria-label="Filter activity timeline"
            >
              {FILTERS.map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={activityFilter === key}
                  onClick={() => setActivityFilter(key)}
                  className={`flex min-h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold transition-colors ${FOCUS} ${activityFilter === key ? "bg-[#4A76C0] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  {label}
                  <span
                    className={`rounded-full px-1.5 text-[10px] ${activityFilter === key ? "bg-white/25" : "bg-white text-slate-500"}`}
                  >
                    {counts[key]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* TIMELINE */}
          <div
            className="space-y-5 pb-6"
            aria-live="polite"
            aria-busy={isLoading}
          >
            {isLoading && activities.length === 0 && <TimelineSkeleton />}

            {["Today", "Yesterday", "This week", "Earlier"].map(
              (group) =>
                activityGroups[group]?.length > 0 && (
                  <section key={group} aria-label={`${group} activity`}>
                    <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                      {group}
                    </h4>
                    <div className="relative ml-2 space-y-4 border-l-2 border-gray-200">
                      {activityGroups[group].map((activity) => (
                        <div
                          key={activity.id}
                          className="relative pl-4 sm:pl-5"
                        >
                          <div className="absolute -left-[9px] top-5 z-10 h-4 w-4 rounded-full border-[3px] border-[#ff7a59] bg-white shadow-sm" />
                          <ActivityCard
                            data={activity}
                            onUpdate={handleUpdateActivity}
                            onDelete={handleDeleteActivity}
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                ),
            )}

            {!isLoading && filteredActivities.length === 0 && (
              <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-10 text-center text-gray-400">
                <ListChecks size={32} className="text-gray-300" />
                <p>
                  {activities.length
                    ? "No activities match this filter."
                    : "No activities logged yet."}
                </p>
                {activities.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setActivityFilter("all")}
                    style={fontBold}
                    className={`min-h-9 cursor-pointer rounded-md px-3 text-xs text-blue-600 hover:bg-blue-50 ${FOCUS}`}
                  >
                    Show all activity
                  </button>
                ) : (
                  !readOnly && (
                    <button
                      type="button"
                      onClick={() => handleTabSwitch("notes")}
                      style={fontBold}
                      className={`min-h-9 cursor-pointer rounded-md px-4 text-xs text-white ${BRAND} ${FOCUS}`}
                    >
                      Log the first activity
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ACTIVITY CARD
// ---------------------------------------------------------------------------
const CONFIG_MAP = {
  note: {
    icon: PencilLine,
    bg: "bg-yellow-100",
    text: "text-yellow-600",
    accent: "border-l-yellow-400",
    label: "Note",
  },
  email: {
    icon: Mail,
    bg: "bg-blue-100",
    text: "text-blue-600",
    accent: "border-l-blue-400",
    label: "Email",
  },
  message: {
    icon: MessageCircle,
    bg: "bg-blue-100",
    text: "text-blue-600",
    accent: "border-l-blue-400",
    label: "Message",
  },
  direct: {
    icon: MessageCircle,
    bg: "bg-blue-100",
    text: "text-blue-600",
    accent: "border-l-blue-400",
    label: "Message",
  },
  call: {
    icon: Phone,
    bg: "bg-green-100",
    text: "text-green-600",
    accent: "border-l-green-400",
    label: "Call",
  },
  meeting: {
    icon: Calendar,
    bg: "bg-purple-100",
    text: "text-purple-600",
    accent: "border-l-purple-400",
    label: "Physical meeting",
  },
  virtual_meeting: {
    icon: Video,
    bg: "bg-indigo-100",
    text: "text-indigo-600",
    accent: "border-l-indigo-400",
    label: "Virtual meeting",
  },
};

const STATUS_STYLES = {
  ended: {
    pill: "bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
    text: "Completed",
  },
  running: {
    pill: "bg-green-100 text-green-700",
    dot: "bg-green-500 animate-pulse",
    text: "Live",
  },
  warning: {
    pill: "bg-amber-100 text-amber-800",
    dot: "bg-amber-500 animate-pulse",
    text: "Soon",
  },
  upcoming: {
    pill: "bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
    text: "Upcoming",
  },
};

function ActivityCard({ data, onUpdate, onDelete }) {
  const isMeeting = data.type === "meeting" || data.type === "virtual_meeting";
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedback, setFeedback] = useState(data.feedback || "");
  const [dateResetKey, setDateResetKey] = useState(Date.now());
  const [currentTimeMs, setCurrentTimeMs] = useState(() => Date.now());

  useEffect(() => {
    if (!isMeeting) return undefined;
    const timer = window.setInterval(() => setCurrentTimeMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [isMeeting]);

  const canEdit =
    !data.isSample &&
    !["email", "meeting", "virtual_meeting"].includes(data.type);

  const formatAttachments = (atts) => {
    if (!atts) return [];
    return atts.map((att) => {
      if (typeof att === "string")
        return { name: att.split("/").pop(), path: att, isExisting: true };
      if (att && att.name) return att;
      return { name: "Unknown File", path: att, isExisting: true };
    });
  };

  const meetStart = data.Sdate || data.start || data.fromDate || "";
  const meetEnd = data.Edate || data.end || data.toDate || "";
  const bodyHtml = data.content || data.note || "";

  const [editContent, setEditContent] = useState(bodyHtml);
  const editContentRef = useRef(null);
  const [editAttachments, setEditAttachments] = useState(
    formatAttachments(data.attachments),
  );
  const [editTitle, setEditTitle] = useState(data.title || "");

  const splitTo = (to) =>
    Array.isArray(to)
      ? to
      : to
        ? String(to)
            .split(",")
            .map((s) => s.trim())
        : [];
  const [editTo, setEditTo] = useState(splitTo(data.to));
  const [editToInput, setEditToInput] = useState("");
  const [editSubject, setEditSubject] = useState(data.subject || "");

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const datePart = formatNepaliDate(dateString);
    if (!datePart) return "";
    const timePart = normalizeTime24(extractTime(dateString));
    return timePart ? `${datePart} | ${timePart}` : datePart;
  };

  const safeGetNepaliTime = (dateStr, timeStr = "") => {
    return getNepaliDateTimestamp(dateStr, {
      time: normalizeTime24(timeStr || extractTime(dateStr), "00:00"),
    });
  };

  const [editDates, setEditDates] = useState({
    from: normalizeBsDate(extractDate(meetStart)),
    to: normalizeBsDate(extractDate(meetEnd)),
  });
  const [editTimes, setEditTimes] = useState({
    from: normalizeTime24(
      data.fromTime || extractTime(meetStart) || extractTime(data.timestamp),
    ),
    to: normalizeTime24(data.toTime || extractTime(meetEnd)),
  });

  const [editContact, setEditContact] = useState(data.contact || "");
  const [editOutcome, setEditOutcome] = useState(data.outcome || "");
  const [editLinks, setEditLinks] = useState(
    Array.isArray(data.link) ? data.link : data.link ? [data.link] : [],
  );
  const [editLinkInput, setEditLinkInput] = useState("");
  const [editLocation, setEditLocation] = useState(data.location || "");
  const [editTimestampDates, setEditTimestampDates] = useState({
    from: extractDate(data.timestamp),
    to: extractDate(data.timestamp),
  });
  const [editTimestampTime, setEditTimestampTime] = useState(
    extractTime(data.timestamp),
  );

  useEffect(() => {
    setFeedback(data.feedback || "");
  }, [data.feedback]);

  let createdText = "";
  const createdDateStr = data.createdDate || data.timestamp;
  if (
    [
      "call",
      "email",
      "message",
      "direct",
      "meeting",
      "virtual_meeting",
    ].includes(data.type) &&
    createdDateStr
  ) {
    const createdMs = safeGetNepaliTime(createdDateStr);
    if (!isNaN(createdMs) && Date.now() >= createdMs)
      createdText = formatRelative(Date.now() - createdMs);
  }

  let meetingDiffText = "";
  let meetingDurationText = "";
  let meetingStatus = "";
  if (isMeeting) {
    const startStr = meetStart ? extractDate(meetStart) : "";
    const endStr = meetEnd ? extractDate(meetEnd) : "";
    const fromTimeStr = normalizeTime24(data.fromTime, "00:00");
    const toTimeStr = normalizeTime24(data.toTime, "23:59");

    if (startStr && endStr) {
      const startDateTime = safeGetNepaliTime(startStr, fromTimeStr);
      const endDateTime = safeGetNepaliTime(endStr, toTimeStr);
      const now = currentTimeMs;

      if (!isNaN(startDateTime) && !isNaN(endDateTime)) {
        meetingDurationText = formatSpan(
          Math.max(0, endDateTime - startDateTime),
        );
        if (now < startDateTime) {
          meetingDiffText = `Starts in ${formatCountdown(startDateTime - now)}`;
          meetingStatus =
            startDateTime - now <= 15 * 60 * 1000 ? "warning" : "upcoming";
        } else if (now <= endDateTime) {
          meetingDiffText = `Started ${formatCountdown(now - startDateTime)} ago`;
          meetingStatus =
            endDateTime - now <= 15 * 60 * 1000 ? "warning" : "running";
        } else {
          meetingDiffText = "Completed";
          meetingStatus = "ended";
        }
      }
    }
  }
  const isMeetingActive = meetingStatus === "running";

  useEffect(() => {
    if (!isEditing) return;
    setEditContent(bodyHtml);
    setEditAttachments(formatAttachments(data.attachments));
    setEditTitle(data.title || "");
    setEditDates({
      from: normalizeBsDate(extractDate(meetStart)),
      to: normalizeBsDate(extractDate(meetEnd)),
    });
    setEditTimes({
      from: normalizeTime24(
        data.fromTime || extractTime(meetStart) || extractTime(data.timestamp),
      ),
      to: normalizeTime24(data.toTime || extractTime(meetEnd)),
    });
    setEditContact(data.contact || "");
    setEditOutcome(data.outcome || "");
    setEditLinks(
      Array.isArray(data.link) ? data.link : data.link ? [data.link] : [],
    );
    setEditLinkInput("");
    setEditLocation(data.location || "");
    setEditTo(splitTo(data.to));
    setEditToInput("");
    setEditSubject(data.subject || "");

    const rawTimestamp = extractDate(data.timestamp);
    setEditTimestampDates({ from: rawTimestamp, to: rawTimestamp });
    setEditTimestampTime(extractTime(data.timestamp));

    setDateResetKey(Date.now());
    if (editContentRef.current)
      editContentRef.current.innerHTML = DOMPurify.sanitize(bodyHtml);
  }, [isEditing, data]);

  const config = CONFIG_MAP[data.type] || {
    icon: ListChecks,
    bg: "bg-gray-100",
    text: "text-gray-600",
    accent: "border-l-gray-400",
    label: "Activity",
  };
  const Icon = config.icon;

  const makeRangeHandler = (setter) => (dateData) => {
    const dates = getSelectedDates(dateData);
    const from = dates[0] || "";
    setter({ from, to: dates[1] || from });
  };
  const handleEditDateChange = makeRangeHandler(setEditDates);
  const handleEditTimestampDateChange = makeRangeHandler(setEditTimestampDates);

  const handleAddEditLink = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const parsed = parseMeetingLink(editLinkInput);
      if (parsed.empty) return;
      if (parsed.error) return ErrorNotify(parsed.error);
      if (editLinks.includes(parsed.link))
        return ErrorNotify("This link has already been added.");
      if (editLinks.length >= 5) return ErrorNotify("Max 5 links allowed.");
      setEditLinks([...editLinks, parsed.link]);
      setEditLinkInput("");
    }
  };
  const handleRemoveEditLink = (index) =>
    setEditLinks(editLinks.filter((_, i) => i !== index));

  const handleAddEditTo = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newEmail = editToInput.trim();
      if (!newEmail) return;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail))
        return ErrorNotify("Please enter a valid email address.");
      if (editTo.includes(newEmail)) return ErrorNotify("Email already added.");
      if (editTo.length >= 5) return ErrorNotify("Max 5 recipients allowed.");
      setEditTo([...editTo, newEmail]);
      setEditToInput("");
    }
  };
  const handleRemoveEditTo = (index) =>
    setEditTo(editTo.filter((_, i) => i !== index));

  const handleSave = async () => {
    setIsUpdating(true);
    const rawHtml = editContentRef.current
      ? editContentRef.current.innerHTML.trim()
      : editContent;
    const currentHTMLContent = isEditorEmpty(rawHtml) ? "" : rawHtml;

    const formData = new FormData();
    formData.append("content", currentHTMLContent);

    if (isMeeting) {
      if (
        !validateTimeRange(
          editTimes.from,
          editTimes.to,
          editDates.from,
          editDates.to,
        )
      ) {
        ErrorNotify("'To Time' must be strictly after 'From Time'.");
        setIsUpdating(false);
        return;
      }
      formData.append("title", editTitle);
      formData.append("fromDate", editDates.from);
      formData.append("toDate", editDates.to);
      formData.append("C_time", `${editTimes.from}/${editTimes.to}`);
      formData.append("fromTime", editTimes.from);
      formData.append("toTime", editTimes.to);
      if (data.type === "virtual_meeting")
        editLinks.forEach((link) => formData.append("link[]", link));
      if (data.type === "meeting") formData.append("location", editLocation);
    } else if (data.type === "call") {
      if (
        !validateTimeRange(
          editTimes.from,
          editTimes.to,
          editTimestampDates.from,
          editTimestampDates.to,
        )
      ) {
        ErrorNotify("'To Time' must be strictly after 'From Time'.");
        setIsUpdating(false);
        return;
      }
      formData.append("contact", editContact);
      formData.append("outcome", editOutcome);
      formData.append("Sdate", editTimestampDates.from);
      formData.append("Edate", editTimestampDates.to);
      formData.append("time", `${editTimes.from}/${editTimes.to}`);
      formData.append("fromTime", editTimes.from);
      formData.append("toTime", editTimes.to);
    } else if (data.type === "message" || data.type === "direct") {
      formData.append("fromDate", editTimestampDates.from);
      formData.append("toDate", editTimestampDates.to);
      formData.append("time", editTimestampTime);
      formData.append("type", "message");
    } else if (data.type === "email") {
      formData.append("type", "email");
      formData.append("subject", editSubject);
      editTo.forEach((email) => formData.append("to[]", email));
    }

    editAttachments.forEach((att) => {
      if (att.file) formData.append("file", att.file);
      else formData.append("retainedAttachments", att.path || att);
    });

    try {
      const ok = await onUpdate(data.id, formData, data.type, data.meetingType);
      if (ok) {
        setEditContent(currentHTMLContent);
        setIsEditing(false);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedback.trim() || isSubmittingFeedback) return;
    setIsSubmittingFeedback(true);
    try {
      const formData = new FormData();
      formData.append("feedback", feedback);
      const ok = await onUpdate(data.id, formData, data.type, data.meetingType);
      if (ok) setIsEditingFeedback(false);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    const ok = await onDelete(data.id, data.type);
    if (!ok) {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  const accentBar =
    data.type === "virtual_meeting" ? "bg-indigo-500" : "bg-purple-500";
  const iconAccent =
    data.type === "virtual_meeting" ? "text-indigo-500" : "text-purple-500";
  const callRangeFrom = formatDate(data.fromDate || data.timestamp);
  const callRangeTo = formatDate(data.toDate || data.timestamp);
  const callFromTime = data.fromTime || editTimes.from;
  const callToTime = data.toTime || editTimes.to;
  const callDuration = getTimeDifference(callFromTime, callToTime);
  const activityDateLabel =
    data.createdDate && data.timestamp === data.createdDate
      ? "Created Date"
      : getActivityDateLabel(data.type);

  const actionBtn = `flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-gray-400 transition-colors ${FOCUS}`;

  return (
    <article
      className={`group relative rounded-lg border border-l-4 border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md ${config.accent} ${isEditing ? "z-20 overflow-visible" : "z-0 overflow-hidden"} ${isMeetingActive ? "shadow-md shadow-orange-100/60" : ""} ${isDeleting ? "opacity-50" : ""}`}
      style={fontMedium}
    >
      {/* HEADER */}
      <header className="flex items-start gap-2 border-b border-slate-100 bg-white p-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${config.bg} ${config.text}`}
        >
          <Icon size={16} />
        </div>

        <div className="min-w-0 flex-1 text-[13px] leading-tight">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span style={fontBold}>{config.label}</span>
            {data.author && (
              <span className="text-gray-500">
                by{" "}
                <span style={fontBold} className="text-gray-800">
                  {data.author}
                </span>
              </span>
            )}
            {createdText && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500">
                {createdText}
              </span>
            )}
          </div>
          <div className="mt-0.5 text-xs text-gray-400">
            {activityDateLabel}: {formatDate(data.timestamp)}
          </div>
        </div>

        <div className="flex shrink-0 items-center">
          {canEdit && (
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              aria-label={isEditing ? "Stop editing" : "Edit record"}
              title="Edit"
              className={`${actionBtn} hover:bg-blue-50 hover:text-blue-500`}
            >
              {isEditing ? <X size={15} /> : <Edit2 size={15} />}
            </button>
          )}
          {!data.isSample && (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              aria-label="Delete record"
              title="Delete"
              className={`${actionBtn} hover:bg-red-50 hover:text-red-500`}
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </header>

      {/* INLINE DELETE CONFIRMATION */}
      {confirmDelete && (
        <div
          role="alertdialog"
          aria-label="Confirm delete"
          className="flex flex-col gap-2 border-b border-red-100 bg-red-50 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="flex items-center gap-2 text-xs text-red-700">
            <AlertTriangle size={14} className="shrink-0" /> Delete this record
            permanently? This can’t be undone.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              disabled={isDeleting}
              style={fontBold}
              className={`min-h-9 flex-1 cursor-pointer rounded-md bg-white px-3 text-xs text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 disabled:cursor-not-allowed sm:flex-none ${FOCUS}`}
            >
              Keep
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              style={fontBold}
              className={`flex min-h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md bg-red-600 px-3 text-xs text-white hover:bg-red-700 disabled:cursor-not-allowed sm:flex-none ${FOCUS}`}
            >
              {isDeleting && <Loader2 size={12} className="animate-spin" />}{" "}
              Delete
            </button>
          </div>
        </div>
      )}

      <div className="p-3 text-[13px] text-gray-800 sm:p-4 sm:text-[14px]">
        {isEditing ? (
          <div className="space-y-3">
            {isMeeting && (
              <div className="space-y-3 rounded-md border border-gray-200 bg-gray-50 p-3">
                <Field label="Meeting title" htmlFor={`et-${data.id}`}>
                  <input
                    id={`et-${data.id}`}
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className={INPUT}
                  />
                </Field>

                {data.type === "virtual_meeting" && (
                  <Field label={`Meeting links (${editLinks.length}/5)`}>
                    <div className="space-y-2">
                      <ChipList
                        items={editLinks}
                        onRemove={handleRemoveEditLink}
                        tone="indigo"
                        label="Remove link"
                      />
                      {editLinks.length < 5 && (
                        <input
                          type="text"
                          inputMode="url"
                          value={editLinkInput}
                          onChange={(e) => setEditLinkInput(e.target.value)}
                          onKeyDown={handleAddEditLink}
                          className={INPUT}
                          placeholder="Add a link and press Enter"
                        />
                      )}
                    </div>
                  </Field>
                )}

                {data.type === "meeting" && (
                  <Field label="Venue / location" htmlFor={`el-${data.id}`}>
                    <input
                      id={`el-${data.id}`}
                      type="text"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className={INPUT}
                      placeholder="e.g. Office Conference Room, Kathmandu"
                    />
                  </Field>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field
                    label={`${getActivityDateLabel(data.type)} (Bikram Sambat)`}
                    className="sm:col-span-2"
                  >
                    <NepaliDateInput
                      key={dateResetKey}
                      placeholder="Update meeting date range..."
                      onDateChange={handleEditDateChange}
                    />
                  </Field>
                  <Field label="From time">
                    <input
                      type="time"
                      value={editTimes.from}
                      onChange={(e) =>
                        setEditTimes({ ...editTimes, from: e.target.value })
                      }
                      className={`${INPUT} cursor-pointer`}
                    />
                  </Field>
                  <Field label="To time">
                    <input
                      type="time"
                      value={editTimes.to}
                      onChange={(e) =>
                        setEditTimes({ ...editTimes, to: e.target.value })
                      }
                      className={`${INPUT} cursor-pointer`}
                    />
                  </Field>
                </div>
              </div>
            )}

            {data.type === "call" && (
              <div className="grid grid-cols-1 gap-3 rounded-md border border-gray-200 bg-gray-50 p-3 sm:grid-cols-2">
                <Field label="Contacted">
                  <input
                    type="text"
                    value={editContact}
                    onChange={(e) => setEditContact(e.target.value)}
                    className={INPUT}
                    placeholder="Contact name"
                  />
                </Field>
                <Field label="Outcome">
                  <Select
                    inputId={`edit-outcome-${data.id}`}
                    options={[
                      { value: "Connected", label: "Connected" },
                      { value: "Left voicemail", label: "Left voicemail" },
                      { value: "No answer", label: "No answer" },
                    ]}
                    value={
                      editOutcome
                        ? { value: editOutcome, label: editOutcome }
                        : null
                    }
                    onChange={(option) => setEditOutcome(option?.value || "")}
                    isClearable={false}
                    menuPortalTarget={
                      typeof document !== "undefined" ? document.body : null
                    }
                    menuPosition="fixed"
                    styles={SELECT_STYLES}
                    classNamePrefix="meeting-select"
                  />
                </Field>
                <Field
                  label={getActivityDateLabel(data.type)}
                  className="sm:col-span-2"
                >
                  <NepaliDateInput
                    key={dateResetKey}
                    placeholder="Update call date range..."
                    onDateChange={handleEditTimestampDateChange}
                  />
                </Field>
                <Field label="From time">
                  <input
                    type="time"
                    value={editTimes.from}
                    onChange={(e) =>
                      setEditTimes({ ...editTimes, from: e.target.value })
                    }
                    className={`${INPUT} cursor-pointer`}
                  />
                </Field>
                <Field label="To time">
                  <input
                    type="time"
                    value={editTimes.to}
                    onChange={(e) =>
                      setEditTimes({ ...editTimes, to: e.target.value })
                    }
                    className={`${INPUT} cursor-pointer`}
                  />
                </Field>
              </div>
            )}

            {(data.type === "message" || data.type === "direct") && (
              <div className="grid grid-cols-1 gap-3 rounded-md border border-gray-200 bg-gray-50 p-3 sm:grid-cols-2">
                <Field label={getActivityDateLabel(data.type)}>
                  <NepaliDateInput
                    key={dateResetKey}
                    placeholder="Update date..."
                    onDateChange={handleEditTimestampDateChange}
                  />
                </Field>
                <Field label="Time">
                  <input
                    type="time"
                    value={editTimestampTime}
                    onChange={(e) => setEditTimestampTime(e.target.value)}
                    className={`${INPUT} cursor-pointer`}
                  />
                </Field>
              </div>
            )}

            {data.type === "email" && (
              <div className="space-y-3 rounded-md border border-gray-200 bg-gray-50 p-3">
                <Field label={`To (${editTo.length}/5)`}>
                  <div className="space-y-2">
                    <ChipList
                      items={editTo}
                      onRemove={handleRemoveEditTo}
                      label="Remove recipient"
                    />
                    {editTo.length < 5 && (
                      <input
                        type="email"
                        inputMode="email"
                        value={editToInput}
                        onChange={(e) => setEditToInput(e.target.value)}
                        onKeyDown={handleAddEditTo}
                        className={INPUT}
                        placeholder="Add email and press Enter"
                      />
                    )}
                  </div>
                </Field>
                <Field label="Subject">
                  <input
                    type="text"
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className={INPUT}
                    placeholder="Email subject..."
                  />
                </Field>
              </div>
            )}

            <Field
              label={isMeeting ? "Agenda & attachments" : "Notes & attachments"}
            >
              <div
                className={isUpdating ? "pointer-events-none opacity-50" : ""}
              >
                <RichEditor
                  label="Edit content"
                  contentRef={editContentRef}
                  placeholder="Update your notes..."
                  attachments={editAttachments}
                  setAttachments={setEditAttachments}
                />
              </div>
            </Field>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={isUpdating}
                style={fontBold}
                className={`min-h-10 cursor-pointer rounded-md bg-gray-100 px-4 text-xs text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed ${FOCUS}`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isUpdating}
                style={fontBold}
                className={`flex min-h-10 cursor-pointer items-center justify-center gap-1.5 rounded-md bg-blue-600 px-4 text-xs text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 ${FOCUS}`}
              >
                {isUpdating && <Loader2 size={12} className="animate-spin" />}
                {isUpdating ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {data.type === "email" && (
              <div className="rounded border border-gray-200 bg-gray-50 p-2.5 text-[13px]">
                <div
                  style={fontBold}
                  className="mb-1 break-words border-b border-gray-200 pb-1 text-gray-800"
                >
                  {data.subject || "(No subject)"}
                </div>
                <div className="flex flex-wrap gap-1 break-words text-gray-500">
                  <span style={fontBold}>To:</span>{" "}
                  {Array.isArray(data.to) ? data.to.join(", ") : data.to}
                </div>
              </div>
            )}

            {(data.type === "message" || data.type === "direct") && data.to && (
              <div
                style={fontBold}
                className="break-words rounded border border-gray-200 bg-gray-50 p-2.5 text-[13px] text-gray-500"
              >
                To: {Array.isArray(data.to) ? data.to.join(", ") : data.to}
              </div>
            )}

            {data.type === "call" && (
              <div className="space-y-3">
                <span
                  style={fontBold}
                  className="inline-flex flex-wrap items-center gap-1.5 rounded border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs text-blue-700 shadow-sm"
                >
                  <Phone size={12} />
                  {data.outCome || data.outcome || "Call"} with{" "}
                  {data.connected || data.contact || "Unknown contact"}
                </span>

                <dl className="grid grid-cols-1 gap-2 rounded-md border border-gray-100 bg-gray-50 p-3 text-[12px] text-gray-600 sm:grid-cols-2 sm:text-[13px]">
                  <div className="flex items-center gap-1.5">
                    <CalendarPlus
                      size={14}
                      className="shrink-0 text-blue-400"
                    />
                    <dt style={fontBold} className="text-gray-700">
                      From
                    </dt>
                    <dd>{callRangeFrom}</dd>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CalendarCheck
                      size={14}
                      className="shrink-0 text-blue-400"
                    />
                    <dt style={fontBold} className="text-gray-700">
                      To
                    </dt>
                    <dd>{callRangeTo}</dd>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 sm:col-span-2">
                    <Clock size={14} className="shrink-0 text-blue-400" />
                    <dt style={fontBold} className="text-gray-700">
                      Time
                    </dt>
                    <dd>
                      {formatCallTime(callFromTime)} –{" "}
                      {formatCallTime(callToTime)}
                    </dd>
                    {callDuration && (
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                        {callDuration}
                      </span>
                    )}
                  </div>
                </dl>
              </div>
            )}

            {isMeeting && (
              <div className="relative overflow-hidden rounded bg-white p-3 pl-4">
                <div
                  className={`absolute bottom-0 left-0 top-0 w-1 ${accentBar}`}
                />

                <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <h4
                    style={fontStrong}
                    className={`break-words text-[14px] sm:text-[15px] ${data.type === "virtual_meeting" ? "text-indigo-900" : "text-purple-900"}`}
                  >
                    {data.title}
                  </h4>
                  <div className="flex flex-wrap gap-1.5 sm:justify-end">
                    {meetingDurationText && (
                      <span className="whitespace-nowrap rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
                        <Clock
                          size={10}
                          className="mr-1 inline -translate-y-px"
                        />
                        {meetingDurationText}
                      </span>
                    )}
                    {meetingDiffText && (
                      <span
                        className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[meetingStatus].pill}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLES[meetingStatus].dot}`}
                        />
                        {meetingDiffText}
                      </span>
                    )}
                  </div>
                </div>

                {data.type === "virtual_meeting" && data.link?.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {data.link.map((l, idx) => (
                      <a
                        key={idx}
                        href={l}
                        target="_blank"
                        rel="noreferrer noopener"
                        className={`flex max-w-full cursor-pointer items-center gap-1.5 rounded bg-indigo-50 px-2 py-1.5 text-[12px] transition-colors hover:bg-indigo-100 ${FOCUS}`}
                      >
                        <Video size={14} className="shrink-0 text-indigo-600" />
                        <span className="truncate text-indigo-800 hover:underline">
                          {l}
                        </span>
                      </a>
                    ))}
                  </div>
                )}

                {data.type === "meeting" && data.location && (
                  <div className="mb-2 flex max-w-full items-center gap-1.5 rounded bg-purple-50 px-2 py-1.5 text-[12px]">
                    <Home size={14} className="shrink-0 text-purple-600" />
                    <span className="break-words text-purple-900">
                      {data.location}
                    </span>
                  </div>
                )}

                <div className="mt-1 flex flex-col gap-2 text-[12px] text-gray-600 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-5">
                    <div className="flex items-center gap-1.5">
                      <CalendarPlus size={14} className={iconAccent} />
                      <span style={fontBold} className="text-gray-700">
                        From
                      </span>
                      <span>
                        {formatDate(meetStart)}{" "}
                        {data.fromTime && `| ${normalizeTime24(data.fromTime)}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CalendarCheck size={14} className={iconAccent} />
                      <span style={fontBold} className="text-gray-700">
                        To
                      </span>
                      <span>
                        {formatDate(meetEnd)}{" "}
                        {data.toTime && `| ${normalizeTime24(data.toTime)}`}
                      </span>
                    </div>
                  </div>
                  {!data.isSample && (
                    <button
                      type="button"
                      onClick={() => {
                        setFeedback(data.feedback || "");
                        setIsEditingFeedback(true);
                      }}
                      style={fontBold}
                      className={`min-h-8 shrink-0 cursor-pointer self-end rounded-md px-2.5 text-xs text-purple-700 hover:bg-purple-50 sm:ml-auto ${FOCUS}`}
                    >
                      + Feedback
                    </button>
                  )}
                </div>
                {data.feedback && !isEditingFeedback && (
                  <div className="mt-2 rounded-md bg-slate-50 p-2.5 text-xs text-slate-700">
                    <span style={fontBold}>Feedback: </span>
                    <span className="whitespace-pre-wrap">{data.feedback}</span>
                  </div>
                )}
                {isEditingFeedback && (
                  <div className="mt-3 space-y-2 rounded-md border border-purple-100 bg-purple-50/40 p-3">
                    <textarea
                      maxLength={500}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Write meeting feedback..."
                      disabled={isSubmittingFeedback}
                      className={`${INPUT} min-h-20 resize-y disabled:cursor-not-allowed`}
                    />
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-gray-500">
                        {feedback.length}/500
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setFeedback(data.feedback || "");
                            setIsEditingFeedback(false);
                          }}
                          disabled={isSubmittingFeedback}
                          style={fontBold}
                          className={`min-h-8 cursor-pointer rounded-md px-3 text-xs text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSubmitFeedback}
                          disabled={
                            !feedback.trim() ||
                            isSubmittingFeedback ||
                            meetingStatus !== "ended"
                          }
                          style={fontBold}
                          className={`flex min-h-8 cursor-pointer items-center gap-1.5 rounded-md bg-purple-600 px-3 text-xs text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`}
                        >
                          {isSubmittingFeedback && (
                            <Loader2 size={12} className="animate-spin" />
                          )}
                          {isSubmittingFeedback ? "Submitting..." : "Submit"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {bodyHtml && !isEditorEmpty(bodyHtml) && (
              <div>
                {(data.type === "call" || isMeeting) && (
                  <span
                    style={fontBold}
                    className="mb-1 block text-xs text-gray-500"
                  >
                    {isMeeting ? "Agenda" : "Call notes"}
                  </span>
                )}
                <div
                  className={`prose prose-sm max-h-60 max-w-none overflow-y-auto break-words leading-relaxed text-gray-800 [&_li]:py-0.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 ${data.type === "call" ? "rounded border border-gray-100 bg-gray-50 p-3" : ""}`}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(bodyHtml),
                  }}
                />
              </div>
            )}

            {data.attachments?.length > 0 && (
              <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                <div
                  style={fontBold}
                  className="mb-1 w-full text-xs text-gray-500"
                >
                  Attachments
                </div>
                {data.attachments.map((file, i) => {
                  const attachmentPath =
                    typeof file === "string"
                      ? file
                      : file?.path || file?.name || `attachment-${i}`;
                  return (
                    <FileAttachment
                      key={`${attachmentPath}-${i}`}
                      file={file}
                      baseUrl={import.meta.env.VITE_API_BACKEND_URL}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
