import React, { useState, useMemo, useEffect, useId, useRef } from "react";
import Select, { components as selectComponents } from "react-select";
import {
    Users, FileText, Search, X, Check, Minus, Building2, Crown,
    UserRound, Clock, AlertTriangle, CalendarDays, MapPin,
    Plus, Trash2, CheckCircle2, Car, Paperclip,
    ChevronDown, Upload, Pencil, Download, Info,
    Save, Package, LoaderCircle
} from "lucide-react";
import { useGet } from "../hooks/useGet";
import { Skeleton } from "../skeleton";

// ── Theme tokens ──────────────────────────────────────────────────────────────
// Surface: pure white. Neutrals: slate. Accent: amber. Status colours: red / emerald.
// Contrast rules used everywhere in this file:
//   amber-500 fill  → slate-900 content   (primary buttons, checked boxes)
//   amber-600       → icons, borders      (≥ 3:1 on white)
//   amber-700 / 800 → accent text         (≥ 5:1 on white and on amber-50)
const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2";
const FOCUS_INSET = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500";
const FOCUS_WITHIN = "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-amber-500 has-[:focus-visible]:ring-offset-2";

// Inputs / textareas
const FIELD_BASE = "w-full rounded-lg border bg-white text-sm text-slate-900 shadow-xs outline-none transition placeholder:text-slate-500 focus:ring-4 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-500";
const FIELD_NORMAL = "border-slate-300 hover:border-slate-400 focus:border-amber-500 focus:ring-amber-500/15";
const FIELD_INVALID = "border-red-500 hover:border-red-500 focus:border-red-500 focus:ring-red-500/15";
const inputClass = (invalid = false, size = "h-10 px-3") =>
    `${FIELD_BASE} ${size} ${invalid ? FIELD_INVALID : FIELD_NORMAL}`;
const textareaClass = (invalid = false, size = "min-h-20 px-3 py-2.5") =>
    `${FIELD_BASE} ${size} resize-y leading-relaxed ${invalid ? FIELD_INVALID : FIELD_NORMAL}`;

// Surfaces & type
const CARD = "rounded-xl border border-slate-200 bg-white";
const PANEL = "rounded-xl border border-slate-200 bg-slate-50/70 p-4";
const LABEL = "text-sm font-medium text-slate-700";
const HEADING = "flex items-center gap-2 text-sm font-semibold text-slate-900";
const HINT = "text-xs text-slate-500";

// Buttons: one height (h-10) for regular, one (h-8) for compact; four semantic variants.
const BTN_BASE = `inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-lg font-semibold transition-colors disabled:cursor-not-allowed ${FOCUS}`;
const BTN_SIZES = {
    md: "h-10 gap-2 px-4 text-sm",
    sm: "h-8 gap-1.5 px-3 text-xs",
};
const BTN_VARIANTS = {
    primary: "bg-amber-500 text-slate-900 shadow-xs hover:bg-amber-400 active:bg-amber-600 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none",
    secondary: "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 active:bg-slate-100 disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400",
    outline: "border border-amber-500 bg-white text-amber-800 hover:bg-amber-50 active:bg-amber-100 disabled:border-slate-200 disabled:bg-white disabled:text-slate-400",
    ghost: "text-amber-800 hover:bg-amber-50 active:bg-amber-100 disabled:bg-transparent disabled:text-slate-400",
    danger: "bg-red-600 text-white shadow-xs hover:bg-red-700 active:bg-red-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none",
    dangerOutline: "border border-red-300 bg-white text-red-700 hover:bg-red-50 active:bg-red-100 disabled:border-slate-200 disabled:text-slate-400",
};
const makeBtn = (variant, size = "md") => `${BTN_BASE} ${BTN_SIZES[size]} ${BTN_VARIANTS[variant]}`;

const btnPrimary = makeBtn("primary");
const btnPrimarySm = makeBtn("primary", "sm");
const btnSecondary = makeBtn("secondary");
const btnSecondarySm = makeBtn("secondary", "sm");
const btnGhostSm = makeBtn("ghost", "sm");
const btnDangerSm = makeBtn("danger", "sm");
const btnDangerOutlineSm = makeBtn("dangerOutline", "sm");

const ICON_BTN_BASE = `inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS}`;
const iconBtn = `${ICON_BTN_BASE} hover:bg-slate-100 hover:text-slate-900`;
const iconBtnDanger = `${ICON_BTN_BASE} hover:bg-red-50 hover:text-red-600`;

// A whole-row selectable option (used for the Yes / No radios).
const optionCardClass = (selected) =>
    `group inline-flex h-10 cursor-pointer items-center gap-2.5 rounded-lg border px-3.5 text-sm font-medium transition-colors ${selected
        ? "border-amber-500 bg-amber-50 text-slate-900"
        : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"}`;

// ── react-select, themed to match the inputs ──
const makeSelectStyles = (hasError) => ({
    control: (base, state) => ({
        ...base,
        minHeight: 40,
        cursor: "pointer",
        fontSize: 14,
        flexWrap: "nowrap",
        borderRadius: 8,
        backgroundColor: state.isDisabled ? "#f8fafc" : "#ffffff",
        borderColor: hasError ? "#ef4444" : state.isFocused ? "#f59e0b" : "#cbd5e1",
        boxShadow: state.isFocused
            ? `0 0 0 4px ${hasError ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)"}`
            : "0 1px 2px rgba(15,23,42,0.05)",
        "&:hover": { borderColor: hasError ? "#ef4444" : state.isFocused ? "#f59e0b" : "#94a3b8" },
    }),
    valueContainer: (base) => ({ ...base, padding: "2px 10px", gap: 4 }),
    singleValue: (base) => ({ ...base, color: "#0f172a" }),
    input: (base) => ({ ...base, color: "#0f172a" }),
    placeholder: (base) => ({ ...base, color: "#64748b" }),
    dropdownIndicator: (base, state) => ({
        ...base,
        padding: "0 10px",
        color: state.isFocused ? "#b45309" : "#64748b",
        transition: "transform 150ms ease",
        transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : "none",
        "&:hover": { color: "#b45309" },
    }),
    clearIndicator: (base) => ({ ...base, padding: "0 6px", color: "#64748b", "&:hover": { color: "#b45309" } }),
    menu: (base) => ({
        ...base,
        marginTop: 4,
        overflow: "hidden",
        borderRadius: 8,
        border: "1px solid #e2e8f0",
        boxShadow: "0 12px 28px -10px rgba(15,23,42,0.22)",
    }),
    menuList: (base) => ({ ...base, padding: 4 }),
    option: (base, state) => ({
        ...base,
        cursor: "pointer",
        fontSize: 14,
        borderRadius: 6,
        fontWeight: state.isSelected ? 600 : 400,
        color: state.isSelected ? "#78350f" : "#0f172a",
        backgroundColor: state.isSelected ? "#fef3c7" : state.isFocused ? "#fffbeb" : "#ffffff",
        ":active": { backgroundColor: "#fde68a" },
    }),
    noOptionsMessage: (base) => ({ ...base, fontSize: 14, color: "#64748b" }),
    multiValue: (base) => ({ ...base, backgroundColor: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 6 }),
    multiValueLabel: (base) => ({ ...base, color: "#92400e", fontWeight: 500, fontSize: 13 }),
    multiValueRemove: (base) => ({
        ...base,
        color: "#92400e",
        cursor: "pointer",
        borderRadius: "0 5px 5px 0",
        ":hover": { backgroundColor: "#fde68a", color: "#78350f" },
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
});

// Lucide icons inside react-select so every control in the form uses the same icon set.
const DropdownIndicator = (props) => (
    <selectComponents.DropdownIndicator {...props}>
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
    </selectComponents.DropdownIndicator>
);

const MultiValueRemove = (props) => (
    <selectComponents.MultiValueRemove {...props}>
        <X className="h-3.5 w-3.5" aria-hidden="true" />
    </selectComponents.MultiValueRemove>
);

// Optional leading icon (calendar, map pin …) passed to AppSelect through the `icon` prop.
function SelectControl({ children, ...props }) {
    const Icon = props.selectProps.leadingIcon;
    return (
        <selectComponents.Control {...props}>
            {Icon && <Icon className="ml-3 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />}
            {children}
        </selectComponents.Control>
    );
}

const SELECT_COMPONENTS = {
    DropdownIndicator,
    MultiValueRemove,
    Control: SelectControl,
    IndicatorSeparator: null,
};

// Menu renders in a portal so it is never clipped by the scrolling modal body.
function AppSelect({ hasError = false, icon, ...props }) {
    return (
        <Select
            {...props}
            leadingIcon={icon}
            components={SELECT_COMPONENTS}
            styles={makeSelectStyles(hasError)}
            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
            menuPosition="fixed"
            className="text-sm"
        />
    );
}

function NoteField({ label, value, onSave, placeholder, rows = 3 }) {
    const fieldId = useId();
    const [draft, setDraft] = useState(value || "");
    const [isEditing, setIsEditing] = useState(!value);

    // Keep the draft in sync with the saved note. When the saved note is cleared
    // from outside (e.g. after "Add Resource"), reopen the editor instead of
    // showing an empty read-only box.
    useEffect(() => {
        if (!value) {
            setDraft("");
            setIsEditing(true);
        } else if (!isEditing) {
            setDraft(value);
        }
    }, [isEditing, value]);

    const saveNote = () => {
        const note = draft.trim();
        if (!note) return;
        onSave(note);
        setDraft(note);
        setIsEditing(false);
    };

    const deleteNote = () => {
        onSave("");
        setDraft("");
        setIsEditing(true);
    };

    const cancelEdit = () => {
        setDraft(value || "");
        setIsEditing(false);
    };

    return (
        <div className="space-y-2">
            <label htmlFor={fieldId} className={LABEL}>{label}</label>
            {isEditing ? (
                <>
                    <textarea
                        id={fieldId}
                        rows={rows}
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" && !event.shiftKey) {
                                event.preventDefault();
                                saveNote();
                            }
                        }}
                        placeholder={placeholder}
                        className={textareaClass()}
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className={HINT}>Press Enter to save, Shift + Enter for a new line.</span>
                        <div className="flex items-center gap-2">
                            {value && (
                                <button type="button" onClick={cancelEdit} className={btnSecondarySm}>
                                    Cancel
                                </button>
                            )}
                            <button type="button" onClick={saveNote} disabled={!draft.trim()} className={btnPrimarySm}>
                                <Save className="h-3.5 w-3.5" aria-hidden="true" />
                                {value ? "Save note" : "Add note"}
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div id={fieldId} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed text-slate-800">{value}</p>
                    <div className="mt-3 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setDraft(value || "");
                                setIsEditing(true);
                            }}
                            className={btnSecondarySm}
                            aria-label={`Edit ${label.toLowerCase()}`}
                        >
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit
                        </button>
                        <button
                            type="button"
                            onClick={deleteNote}
                            className={btnDangerOutlineSm}
                            aria-label={`Delete ${label.toLowerCase()}`}
                        >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Delete
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Master Dataset for 24 EIMCTA ISO 21001 EOMS Services & Activities ──
const EIMCTA_SERVICES_MASTER = [
    {
        id: "serv-1",
        sNo: 1,
        serviceName: "Initial kick off plan",
        activities: [
            { id: "act-1-1", name: "Orientation on ISO 21001 EOMS" },
            { id: "act-1-2", name: "Overview of EOMS Process" },
            { id: "act-1-3", name: "Question & Answer" }
        ]
    },
    {
        id: "serv-2",
        sNo: 2,
        serviceName: "GAP/SWOT Analysis",
        activities: [
            { id: "act-2-1", name: "GAP/SWOT Orientation / Workshop" },
            { id: "act-2-2", name: "Educator and management to perform individual SWOT analysis" }
        ]
    },
    {
        id: "serv-3",
        sNo: 3,
        serviceName: "Re-Organize Organization Chart",
        activities: [
            { id: "act-3-1", name: "Nominate EOMS Officer, Level In-Charge, DEO" },
            { id: "act-3-2", name: "Create Departments and appoint HoD." },
            { id: "act-3-3", name: "Orientation and oath for all HoD on their roles/responsibilities." }
        ]
    },
    {
        id: "serv-4",
        sNo: 4,
        serviceName: "Printable Items",
        activities: [
            { id: "act-4-1", name: "Printable (Press/Flex/Forex) Orientation" },
            { id: "act-4-2", name: "Meeting with Mgmt and Print shop Representative" },
            { id: "act-4-3", name: "Confirm Location, Size, Materials for Flex/Forex" },
            { id: "act-4-4", name: "Open ISO_Press/Flex/Forex_Client Name WhatsApp Group" },
            { id: "act-4-5", name: "Send designs to print shop with size and materials." },
            { id: "act-4-6", name: "Proof Reading by EIMCTA representative and Client Representative" },
            { id: "act-4-7", name: "Follow-up" }
        ]
    },
    {
        id: "serv-5",
        sNo: 5,
        serviceName: "Good Parenting",
        activities: [
            { id: "act-5-1", name: "ISO 21001 EOMS Orientation (KUAHA-Drama)" },
            { id: "act-5-2", name: "Parents Committee Formation & Oath Taking" },
            { id: "act-5-3", name: "ISO Logo Handover" }
        ]
    },
    {
        id: "serv-6",
        sNo: 6,
        serviceName: "Scheduling",
        activities: [
            { id: "act-6-1", name: "Program Scheduling for next month." },
            { id: "act-6-2", name: "Schedule Send (before 28th of the current month) with memo include date and agenda" },
            { id: "act-6-3", name: "Reminder Call" }
        ]
    },
    {
        id: "serv-7",
        sNo: 7,
        serviceName: "IOM Compliance",
        activities: [
            { id: "act-7-1", name: "Send IOM and then call for more effective information regarding submission of IOM from the management of school." },
            { id: "act-7-2", name: "Meeting to Mgmt about IOM" },
            { id: "act-7-3", name: "Set Target Date for Action." },
            { id: "act-7-4", name: "Follow-up Call" }
        ]
    },
    {
        id: "serv-8",
        sNo: 8,
        serviceName: "KUAHA",
        activities: [
            { id: "act-8-1", name: "KUAHA Orientation" },
            { id: "act-8-2", name: "AI segregation for cognitive-KUAHA above grade 6" },
            { id: "act-8-3", name: "AI segregation for cognitive-KUAHA, Affectiveness, Psycho Motor ECD - Grade 6" },
            { id: "act-8-4", name: "QA writing, Copy Checking, Marking, KUAHA Copy header filling, KUAHA-CAS Data Sheet filling Workshop." },
            { id: "act-8-5", name: "KUAHA Delivery Workshop" }
        ]
    },
    {
        id: "serv-9",
        sNo: 9,
        serviceName: "RALP",
        activities: [
            { id: "act-9-1", name: "RALP Orientation" },
            { id: "act-9-2", name: "RALP workshop (AI Lesson Plan Prompt) Subject Wise Educators" },
            { id: "act-9-3", name: "QA writing, Copy Checking, Marking, Copy header filling, KUAHA sheet filling, KUAHA data entry workshop" },
            { id: "act-9-4", name: "ERP-RALP Filling Workshop" },
            { id: "act-9-5", name: "RALP Observation / Feedback" }
        ]
    },
    {
        id: "serv-10",
        sNo: 10,
        serviceName: "ECD",
        activities: [
            { id: "act-10-1", name: "ECD Orientation (CAP-Holistic Development)" },
            { id: "act-10-2", name: "ECD RALP filling workshop (Using AI) on Hardcopy" },
            { id: "act-10-3", name: "ECD RALP filling workshop on ERP" },
            { id: "act-10-4", name: "ECD RALP Observation/Feedback" },
            { id: "act-10-5", name: "Continued RALP Fill" },
            { id: "act-10-6", name: "ECD Class Role play method from ECD Educator Guide" },
            { id: "act-10-7", name: "ECD UBE Roleplay/Observation/Feedback" },
            { id: "act-10-8", name: "ECD UBE Schedule" },
            { id: "act-10-9", name: "Continued ECD UBE Conduct" }
        ]
    },
    {
        id: "serv-11",
        sNo: 11,
        serviceName: "DLP Register & Board",
        activities: [
            { id: "act-11-1", name: "DLP Register & Board Orientation" },
            { id: "act-11-2", name: "DLP Register and DLP Board filling demonstration" },
            { id: "act-11-3", name: "DLP Register and Board Observation/Feedback" }
        ]
    },
    {
        id: "serv-12",
        sNo: 12,
        serviceName: "DBN",
        activities: [
            { id: "act-12-1", name: "DBN orientation and roleplay (To educator and learners)" },
            { id: "act-12-2", name: "Continued DBN Performance (Post Arrival and Pre- Departure)" }
        ]
    },
    {
        id: "serv-13",
        sNo: 13,
        serviceName: "CPD",
        activities: [
            { id: "act-13-1", name: "CPD Orientation- Using AI" },
            { id: "act-13-2", name: "Sample CPD" },
            { id: "act-13-3", name: "CPD Schedule" },
            { id: "act-13-4", name: "Continued CPD Performance" }
        ]
    },
    {
        id: "serv-14",
        sNo: 14,
        serviceName: "Learning Committee Leader (LCL)",
        activities: [
            { id: "act-14-1", name: "Nomination of LCLs." },
            { id: "act-14-2", name: "Parents' Undertaking" },
            { id: "act-14-3", name: "Listing and pasting LCLs name with their respective members in classroom." },
            { id: "act-14-4", name: "Badge Preparation" },
            { id: "act-14-5", name: "LCL Orientation, Badge distribution & Oath taking" },
            { id: "act-14-6", name: "LCL Workshop/Roleplay" }
        ]
    },
    {
        id: "serv-15",
        sNo: 15,
        serviceName: "Data Entry Learners (DEL)",
        activities: [
            { id: "act-15-1", name: "Nomination of DELs." },
            { id: "act-15-2", name: "Parents' Undertaking" },
            { id: "act-15-3", name: "Badge Preparation" },
            { id: "act-15-4", name: "DEL Orientation, Badge distribution & Oath taking" },
            { id: "act-15-5", name: "DEL Workshop/Roleplay" }
        ]
    },
    {
        id: "serv-16",
        sNo: 16,
        serviceName: "Surprise Class Observation",
        activities: [
            { id: "act-16-1", name: "Surprise Class Observation Forms Briefing/Orientation." },
            { id: "act-16-2", name: "Surprise Class Observation Track Sheet Preparation by lottery system for demonstration." },
            { id: "act-16-3", name: "Surprise Class Observation Demonstration (Minimum 3 Classes)." },
            { id: "act-16-4", name: "Prepare Surprise Class Observation Track Sheet by lottery system for the particular day observation by Mgmt." },
            { id: "act-16-5", name: "Continued Surprise Class Observation Conduct" }
        ]
    },
    {
        id: "serv-17",
        sNo: 17,
        serviceName: "UBE",
        activities: [
            { id: "act-17-1", name: "UBE Orientation" },
            { id: "act-17-2", name: "UBE Role Play/Workshop" },
            { id: "act-17-3", name: "UBE Schedule by educators" },
            { id: "act-17-4", name: "Continued UBE Performance" }
        ]
    },
    {
        id: "serv-18",
        sNo: 18,
        serviceName: "Suggestion & Feedback",
        activities: [
            { id: "act-18-1", name: "Install three suggestion boxes (Learners, Educators & Visitors) with respective leaflets, and provide Suggestion & Feedback QR Codes in vehicles and social media." },
            { id: "act-18-2", name: "Daily Check (Key assigned to DEO.)" },
            { id: "act-18-3", name: "Discussion about the agenda from feedback and recorded in Suggestion and Feedback Record Sheet." },
            { id: "act-18-4", name: "If any information needs to be communicated, communicate it through the DBN." }
        ]
    },
    {
        id: "serv-19",
        sNo: 19,
        serviceName: "EPRD",
        activities: [
            { id: "act-19-1", name: "EPRD Forms Briefing/Orientation" },
            { id: "act-19-2", name: "EPRD Demonstration (Fire Emergency Drill)" },
            { id: "act-19-3", name: "EPRD Scheduling by School Mgmt." },
            { id: "act-19-4", name: "Continued EPRD Performance" }
        ]
    },
    {
        id: "serv-20",
        sNo: 20,
        serviceName: "SAC",
        activities: [
            { id: "act-20-1", name: "SAC Forms Briefing/Orientation" },
            { id: "act-20-2", name: "SAC Demonstration (Traffic Awareness, Drug Abuse, etc.)" },
            { id: "act-20-3", name: "SAC Scheduling by School Mgmt." },
            { id: "act-20-4", name: "Continued SAC Performance" }
        ]
    },
    {
        id: "serv-21",
        sNo: 21,
        serviceName: "Olympiad",
        activities: [
            { id: "act-21-1", name: "Olympiad Forms Briefing/Orientation" },
            { id: "act-21-2", name: "Olympiad Demonstration" },
            { id: "act-21-3", name: "Olympiad Scheduling by School Mgmt." },
            { id: "act-21-4", name: "Continued Olympiad Performance" }
        ]
    },
    {
        id: "serv-22",
        sNo: 22,
        serviceName: "Learners' Investigation",
        activities: [
            { id: "act-22-1", name: "Learners' Investigation Forms Briefing/Orientation" },
            { id: "act-22-2", name: "Investigation Committee Formation" },
            { id: "act-22-3", name: "Identify Red Zone Learners more than 3 Units." },
            { id: "act-22-4", name: "Continued Investigation Conduct" }
        ]
    },
    {
        id: "serv-23",
        sNo: 23,
        serviceName: "Cross Check (CC)",
        activities: [
            { id: "act-23-1", name: "Briefing about Cross Check to Mgmt." },
            { id: "act-23-2", name: "Random Selection of learners." },
            { id: "act-23-3", name: "Cross Check of selected learners according to Cross Check Format." },
            { id: "act-23-4", name: "CAPA & Record Keeping." },
            { id: "act-23-5", name: "Continued Implement." }
        ]
    },
    {
        id: "serv-24",
        sNo: 24,
        serviceName: "ERP",
        activities: [
            { id: "act-24-1", name: "DEL Email Distribution" },
            { id: "act-24-2", name: "EOMS Officer, DEO, DEL ERP Registration" },
            { id: "act-24-3", name: "Learners and Educators Data Collection" },
            { id: "act-24-4", name: "Learners Data Upload" },
            { id: "act-24-5", name: "Educators EIMCTA suggested Email Creation" },
            { id: "act-24-6", name: "Educators and Staff Data Upload" },
            { id: "act-24-7", name: "Educators ERP Login" },
            { id: "act-24-8", name: "Curriculum: Grades and Sections Setup" },
            { id: "act-24-9", name: "Curriculum: Optional Subjects Addition" },
            { id: "act-24-10", name: "Curriculum: Grade and Subject Connection" },
            { id: "act-24-11", name: "Educators Subject Assignment" },
            { id: "act-24-12", name: "Calendar Preparation (including UBE, SAC, and EPRD configuration)" },
            { id: "act-24-13", name: "Routine Creation" },
            { id: "act-24-14", name: "Educators RALP Training: Orientation" },
            { id: "act-24-15", name: "Educators RALP Training: Workshop" },
            { id: "act-24-16", name: "Educators RALP Training: Roleplay" },
            { id: "act-24-17", name: "KUAHA Sheet Preparation" },
            { id: "act-24-18", name: "KUAHA Sheet entry" },
            { id: "act-24-19", name: "ERP Launch" }
        ]
    }
];

// ── Constants & helpers ──
const EMPTY_ARRAY = [];
const MAX_FILES_PER_RESOURCE = 4;
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

// NOTE: the Nepali (BS) calendar is hard-coded to one month for now. Replace with a
// real AD→BS converter (e.g. nepali-date-converter) before using this in production.
const NEPALI_YEAR_MONTH = "2082-07";
const NEPALI_MONTH_NAME = "Kartik";
const NEPALI_MONTH_DAYS = 30;

// Mock conflict database
const EXISTING_BOOKINGS = [
    { userId: "user-101", workerName: "Alex Smith", nepaliDate: "2082-07-15 BS (Kartik)", startTime: "10:00", endTime: "12:00", taskName: "Initial Kick-off" },
];

const makeId = (prefix) =>
    `${prefix}-${typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`}`;

const makeNepaliDateOption = (day) => {
    const dd = String(day).padStart(2, "0");
    return {
        value: `${NEPALI_YEAR_MONTH}-${dd} BS (${NEPALI_MONTH_NAME})`,
        label: `Day ${day} (${NEPALI_YEAR_MONTH}-${dd} BS)`,
    };
};

const formatFileSize = (bytes = 0) =>
    bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(2)} MB` : `${(bytes / 1024).toFixed(1)} KB`;

// Validates newly picked files against size / duplicate / count limits.
function prepareFiles(pickedFiles, existingFiles, maxFiles = Infinity) {
    const accepted = [];
    const problems = [];
    for (const file of pickedFiles) {
        if (file.size > MAX_FILE_SIZE_BYTES) {
            problems.push(`"${file.name}" is larger than 50 MB.`);
            continue;
        }
        if ([...existingFiles, ...accepted].some(f => f.name === file.name && f.size === file.size)) {
            problems.push(`"${file.name}" is already attached.`);
            continue;
        }
        if (existingFiles.length + accepted.length >= maxFiles) {
            problems.push(`"${file.name}" was skipped: the limit is ${maxFiles} files.`);
            continue;
        }
        accepted.push({
            id: makeId("file"),
            name: file.name,
            size: file.size,
            type: file.type || "application/octet-stream",
            progress: 0,
            status: "Uploading",
            fileObject: file,
        });
    }
    return { accepted, problems };
}

function createDefaultAllocation() {
    const defaultServ = EIMCTA_SERVICES_MASTER[0];
    const defaultAct = defaultServ.activities[0];
    // Clamp so the default always exists in the 30-day option list.
    const day = Math.min(Math.max(new Date().getDate(), 1), NEPALI_MONTH_DAYS);
    return {
        service: { value: defaultServ.id, label: `${defaultServ.sNo}. ${defaultServ.serviceName}` },
        activity: { value: defaultAct.id, label: defaultAct.name },
        nepaliDate: makeNepaliDateOption(day),
        startTime: "09:00",
        endTime: "17:00",
        workLocation: { value: "In-Office", label: "In-Office" },

        // Transportation (only used when work location is Out-of-Office)
        requiresTransportation: false,
        vehicle: { value: "Scooter", label: "Scooter (Max 2 persons)" },
        vehicleRegistrationNo: "",
        travellingWorkers: [], // additional travelling members (excluding primary worker)

        // Assistance workers: [{ workerId, workerName, workerRole, note, attachments: [] }]
        requiresAssistance: false,
        assistanceWorkers: [],

        note: "",
        newResourceName: "",
        newResourceNote: "",
        resources: [
            { id: makeId("res"), name: "Projector", note: "HD Projector for presentation sessions", files: [] },
            { id: makeId("res"), name: "Checklist Form", note: "Printed ISO audit checklist documentation", files: [] },
        ],
        isMinimized: false,
    };
}

const QUICK_RESOURCES = ["Projector", "Laptop", "Printed Handouts", "Checklist Form", "Banner / Flex"];

function saveBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Reads a local file and reports real progress (0-99). Used for "download" of local files.
function readFileWithProgress(file, onProgress) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        let last = -1;
        reader.onprogress = (event) => {
            if (!event.lengthComputable) return;
            const pct = Math.min(99, Math.floor((event.loaded / event.total) * 100));
            if (pct !== last) {
                last = pct;
                onProgress(pct);
            }
        };
        reader.onload = () => resolve();
        reader.onerror = () => reject(new Error("Could not read this file."));
        reader.readAsArrayBuffer(file);
    });
}

function ProgressBar({ value, label, tone = "amber" }) {
    const color = tone === "red" ? "bg-red-500" : tone === "green" ? "bg-emerald-500" : "bg-amber-500";
    return (
        <div
            role="progressbar"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(value)}
            className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200"
        >
            <div className={`h-full rounded-full transition-[width] duration-150 ${color}`} style={{ width: `${value}%` }} />
        </div>
    );
}

// One attachment row: shows upload progress, download progress, retry and errors.
function FileRow({ file, downloadProgress, downloadError, onDownload, onRemove, onRetry }) {
    const isUploading = file.status === "Uploading";
    const isError = file.status === "Error";
    const isDownloading = typeof downloadProgress === "number";

    return (
        <div className={`rounded-lg border px-3 py-2.5 ${isError ? "border-red-200 bg-red-50" : "border-slate-200 bg-slate-50"}`}>
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
                <div className="flex min-w-0 items-center gap-2">
                    {isUploading ? (
                        <LoaderCircle className="h-4 w-4 shrink-0 animate-spin text-amber-600" strokeWidth={2.5} aria-hidden="true" />
                    ) : isError ? (
                        <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
                    ) : (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                    )}
                    <span className="max-w-48 truncate text-sm font-medium text-slate-900 sm:max-w-72" title={file.name}>{file.name}</span>
                    <span className="shrink-0 text-xs text-slate-500">{formatFileSize(file.size)}</span>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                    <span className={`whitespace-nowrap text-xs font-medium ${isError ? "text-red-700" : isUploading ? "text-amber-700" : "text-emerald-700"}`}>
                        {isUploading ? `Uploading ${file.progress}%` : isError ? "Upload failed" : "Uploaded"}
                    </span>
                    {isError && onRetry && (
                        <button type="button" onClick={onRetry} className={btnGhostSm}>
                            Retry
                        </button>
                    )}
                    {!isUploading && !isError && (
                        <button
                            type="button"
                            onClick={onDownload}
                            disabled={isDownloading}
                            className={`${btnGhostSm} disabled:cursor-wait`}
                            aria-label={isDownloading ? `Downloading ${file.name}, ${downloadProgress}%` : `Download ${file.name}`}
                        >
                            {isDownloading
                                ? <><LoaderCircle className="h-3.5 w-3.5 animate-spin text-amber-600" strokeWidth={2.5} aria-hidden="true" /> {downloadProgress}%</>
                                : <><Download className="h-3.5 w-3.5" aria-hidden="true" /> Download</>}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onRemove}
                        className={iconBtnDanger}
                        title={isUploading ? "Cancel upload" : "Remove attachment"}
                        aria-label={isUploading ? `Cancel upload of ${file.name}` : `Remove ${file.name}`}
                    >
                        <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>
            </div>

            {isUploading && (
                <div className="mt-2"><ProgressBar value={file.progress || 0} label={`Upload progress for ${file.name}`} /></div>
            )}
            {isDownloading && (
                <div className="mt-2"><ProgressBar value={downloadProgress} tone="green" label={`Download progress for ${file.name}`} /></div>
            )}
            {downloadError && <p className="mt-1.5 text-xs font-medium text-red-700" role="alert">{downloadError}</p>}
        </div>
    );
}

// ── Checkbox & radio ──
// Both render a visually-hidden native input (keyboard + screen-reader friendly) followed by a
// custom indicator. Put them inside a <label className="group …"> so the whole row is clickable
// and hovering anywhere on the row highlights the control.
function Checkbox({ checked, onChange, indeterminate = false, disabled = false }) {
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) inputRef.current.indeterminate = indeterminate && !checked;
    }, [indeterminate, checked]);

    const isOn = checked || indeterminate;

    return (
        <>
            <input
                ref={inputRef}
                type="checkbox"
                className="peer sr-only"
                checked={checked}
                onChange={onChange}
                disabled={disabled}
            />
            <span
                aria-hidden="true"
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-[1.5px] transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-amber-500 peer-focus-visible:ring-offset-2 ${disabled
                    ? "cursor-not-allowed border-slate-300 bg-slate-100 text-slate-400"
                    : isOn
                        ? "border-amber-600 bg-amber-500 text-slate-900"
                        : "border-slate-400 bg-white group-hover:border-amber-600"}`}
            >
                {checked
                    ? <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    : indeterminate
                        ? <Minus className="h-3.5 w-3.5" strokeWidth={3} />
                        : null}
            </span>
        </>
    );
}

function Radio({ name, checked, onChange, disabled = false }) {
    return (
        <>
            <input
                type="radio"
                name={name}
                className="peer sr-only"
                checked={checked}
                onChange={onChange}
                disabled={disabled}
            />
            <span
                aria-hidden="true"
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-amber-500 peer-focus-visible:ring-offset-2 ${disabled
                    ? "cursor-not-allowed border-slate-300 bg-slate-100"
                    : checked
                        ? "border-amber-600 bg-amber-500"
                        : "border-slate-400 bg-white group-hover:border-amber-600"}`}
            >
                <span className={`h-2 w-2 rounded-full bg-slate-900 transition-transform ${checked ? "scale-100" : "scale-0"}`} />
            </span>
        </>
    );
}

// ── Layout & feedback building blocks ──
function SectionHeader({ step, title, description, action }) {
    return (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-amber-300 bg-amber-50 text-sm font-semibold text-amber-800">
                    {step}
                </span>
                <div>
                    <h3 className="text-base font-semibold text-slate-900">{title}</h3>
                    <p className="text-sm text-slate-600">{description}</p>
                </div>
            </div>
            {action}
        </div>
    );
}

function FieldLabel({ htmlFor, required = false, optional = false, children }) {
    return (
        <label htmlFor={htmlFor} className={LABEL}>
            {children}
            {required && (
                <>
                    <span className="ml-0.5 text-red-600" aria-hidden="true">*</span>
                    <span className="sr-only"> (required)</span>
                </>
            )}
            {optional && <span className="ml-1 font-normal text-slate-500">(optional)</span>}
        </label>
    );
}

function FieldError({ children }) {
    if (!children) return null;
    return (
        <p className="flex items-start gap-1.5 text-xs font-medium text-red-700" role="alert">
            <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{children}</span>
        </p>
    );
}

const BANNER_TONES = {
    error: "border-red-200 bg-red-50 text-red-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    info: "border-slate-200 bg-slate-50 text-slate-700",
};

function Banner({ tone = "info", icon: Icon, children, ...rest }) {
    return (
        <div className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm ${BANNER_TONES[tone]}`} {...rest}>
            <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <div className="min-w-0">{children}</div>
        </div>
    );
}

function EmptyState({ icon: Icon, title, children }) {
    return (
        <div className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-sm font-semibold text-slate-900">{title}</p>
            {children && <p className="max-w-md text-sm text-slate-600">{children}</p>}
        </div>
    );
}

export default function JobAssignModal({ isOpen, onClose, selectedCompany }) {
    const { ScheduleUsers_ } = useGet({
        currentUser: { role: "admin" },
    });

    const {
        data: scheduleUsersData,
        isLoading: isScheduleUsersLoading,
    } = ScheduleUsers_;

    const [activeTab, setActiveTab] = useState("team");
    const titleId = useId();
    const [validationErrors, setValidationErrors] = useState({});
    const [formError, setFormError] = useState("");
    const [resourceErrors, setResourceErrors] = useState({});
    const [resourceFileErrors, setResourceFileErrors] = useState({});
    const [assistanceFileErrors, setAssistanceFileErrors] = useState({});
    const [downloadProgress, setDownloadProgress] = useState({}); // { [fileId]: 0-100 }
    const [downloadErrors, setDownloadErrors] = useState({});
    const [dragTarget, setDragTarget] = useState("");
    const [pendingDelete, setPendingDelete] = useState("");
    const uploadControllers = useRef(new Map()); // fileId -> FileReader (so uploads can be cancelled)
    const newResourceNameRefs = useRef({});

    // Abort any in-flight reads if the modal unmounts.
    useEffect(() => {
        const controllers = uploadControllers.current;
        return () => controllers.forEach(reader => reader.abort());
    }, []);

    // Close on Escape and lock background scroll while the modal is open.
    useEffect(() => {
        if (!isOpen) return undefined;
        const onKeyDown = (event) => {
            // Let open dropdowns handle their own Escape.
            if (event.key === "Escape" && !event.defaultPrevented) onClose?.();
        };
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [isOpen, onClose]);

    // UI Order 1: Project Leader selection first
    const [selectedHeadId, setSelectedHeadId] = useState(null);

    // UI Order 2: Employee selection second
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [searchQueries, setSearchQueries] = useState({});

    // Resource Search Queries State (per user)
    const [resourceSearchQueries, setResourceSearchQueries] = useState({});

    // Stable reference: a fresh [] each render would re-trigger the effects below forever.
    const users = useMemo(
        () => (Array.isArray(scheduleUsersData) ? scheduleUsersData : EMPTY_ARRAY),
        [scheduleUsersData]
    );
    const headUser = users.find(user => /director|manager|executive|admin/i.test(`${user.jobRole || ""} ${user.role || ""}`)) || users[0];
    const selectedHead = Boolean(headUser && selectedHeadId === headUser._id);
    const remainingUsers = users.filter(user => user._id !== headUser?._id);
    const roleGroups = [...new Set(remainingUsers.map(user => user.jobRole?.trim() || user.role?.trim() || "Other"))];

    const columns = roleGroups.map(roleGroup => ({
        id: roleGroup,
        name: roleGroup,
        members: remainingUsers
            .filter(user => (user.jobRole?.trim() || user.role?.trim() || "Other") === roleGroup)
            .map(user => ({
                id: user._id,
                name: user.fullname || "",
                role: [user.jobRole, user.role].filter(Boolean).join(" · "),
                officeEmail: user.officeEmail || "",
                checked: selectedUserIds.includes(user._id),
            })),
    }));

    // Selected Personnel List (Leader + Members)
    const selectedPersonnel = useMemo(() => {
        const list = [];
        if (selectedHead && headUser) {
            list.push({ ...headUser, isHead: true });
        }
        users.forEach(u => {
            if (selectedUserIds.includes(u._id) && u._id !== headUser?._id) {
                list.push(u);
            }
        });
        return list;
    }, [selectedHead, headUser, selectedUserIds, users]);

    // ── INDIVIDUAL TASK ALLOCATIONS STATE ──
    const [individualTaskAllocations, setIndividualTaskAllocations] = useState({});

    useEffect(() => {
        setIndividualTaskAllocations(prev => {
            const selectedIds = selectedPersonnel.map(person => person._id);
            const unchanged = selectedIds.length === Object.keys(prev).length && selectedIds.every(id => prev[id]);
            if (unchanged) return prev; // avoid needless re-renders / loops

            const updated = {};
            selectedPersonnel.forEach(person => {
                updated[person._id] = prev[person._id] || createDefaultAllocation();
            });
            return updated;
        });
    }, [selectedPersonnel]);

    const hasAnyPersonnelSelected = selectedPersonnel.length > 0;

    if (!isOpen) return null;

    const toggleEomsHead = () => {
        setSelectedHeadId(selectedHead ? null : headUser._id);
    };

    const toggleMember = (memberId) => {
        setSelectedUserIds(ids => ids.includes(memberId) ? ids.filter(id => id !== memberId) : [...ids, memberId]);
    };

    const toggleSelectAll = (memberIds, isChecked) => {
        setSelectedUserIds(ids => isChecked
            ? [...new Set([...ids, ...memberIds])]
            : ids.filter(id => !memberIds.includes(id)));
    };

    const handleSearch = (colId, value) => {
        setSearchQueries(prev => ({ ...prev, [colId]: value }));
    };

    // ── Core allocation updaters (all functional → no stale-closure data loss) ──
    const updateMemberTask = (userId, updater) => {
        setIndividualTaskAllocations(prev => ({
            ...prev,
            [userId]: updater(prev[userId] ?? createDefaultAllocation())
        }));
    };

    const clearFieldError = (userId, field) => {
        setValidationErrors(prev => ({
            ...prev,
            [userId]: {
                ...prev[userId],
                [field]: "",
                ...(field === "service" ? { activity: "" } : {}),
                ...(field === "startTime" || field === "endTime"
                    ? { startTime: "", endTime: "" }
                    : {}),
                ...(field === "workLocation" || field === "requiresTransportation"
                    ? { vehicle: "" }
                    : {}),
                ...(field === "vehicle" || field === "travellingWorkers"
                    ? { travellingWorkers: "" }
                    : {}),
                ...(field === "requiresAssistance"
                    ? { assistanceWorkers: "" }
                    : {}),
                ...(field === "newResourceName"
                    ? { resources: "" }
                    : {})
            }
        }));
        setFormError("");
    };

    const updateMemberTaskField = (userId, field, value) => {
        updateMemberTask(userId, task => ({ ...task, [field]: value }));
        clearFieldError(userId, field);
    };

    // For array fields (resources, assistanceWorkers): updater receives the latest list.
    const updateMemberTaskList = (userId, field, updater) => {
        updateMemberTask(userId, task => ({ ...task, [field]: updater(task[field] || []) }));
        clearFieldError(userId, field);
    };

    const toggleMinimizeAllocation = (userId) => {
        updateMemberTask(userId, task => ({ ...task, isMinimized: !task.isMinimized }));
    };

    // ── Upload / download engine ──
    // Progress is real (FileReader). When an upload API exists, replace the body of
    // startUpload with an XMLHttpRequest (xhr.upload.onprogress) and keep the same patchFile calls.
    const patchMemberTask = (userId, updater) => {
        setIndividualTaskAllocations(prev => (prev[userId] ? { ...prev, [userId]: updater(prev[userId]) } : prev));
    };

    const patchResourceFile = (userId, resId, fileId, patch) => {
        patchMemberTask(userId, task => ({
            ...task,
            resources: (task.resources || []).map(r => (r.id === resId
                ? { ...r, files: (r.files || []).map(f => (f.id === fileId ? { ...f, ...patch } : f)) }
                : r))
        }));
    };

    const patchAssistanceFile = (userId, workerId, fileId, patch) => {
        patchMemberTask(userId, task => ({
            ...task,
            assistanceWorkers: (task.assistanceWorkers || []).map(aw => (aw.workerId === workerId
                ? { ...aw, attachments: (aw.attachments || []).map(f => (f.id === fileId ? { ...f, ...patch } : f)) }
                : aw))
        }));
    };

    const startUpload = (fileEntry, patchFile) => {
        const reader = new FileReader();
        let lastPct = -1;
        uploadControllers.current.set(fileEntry.id, reader);
        patchFile(fileEntry.id, { status: "Uploading", progress: 0 });

        reader.onprogress = (event) => {
            if (!event.lengthComputable) return;
            const pct = Math.min(99, Math.floor((event.loaded / event.total) * 100));
            if (pct === lastPct) return;
            lastPct = pct;
            patchFile(fileEntry.id, { progress: pct });
        };
        reader.onload = () => {
            uploadControllers.current.delete(fileEntry.id);
            patchFile(fileEntry.id, { status: "Uploaded", progress: 100 });
        };
        reader.onerror = () => {
            uploadControllers.current.delete(fileEntry.id);
            patchFile(fileEntry.id, { status: "Error", progress: 0 });
        };
        reader.onabort = () => uploadControllers.current.delete(fileEntry.id);
        reader.readAsArrayBuffer(fileEntry.fileObject);
    };

    const cancelUpload = (fileId) => {
        uploadControllers.current.get(fileId)?.abort();
        uploadControllers.current.delete(fileId);
    };

    const handleDownloadFile = async (fileItem) => {
        if (!fileItem || downloadProgress[fileItem.id] !== undefined) return;
        const setProgress = (pct) => setDownloadProgress(prev => ({ ...prev, [fileItem.id]: pct }));
        setDownloadErrors(prev => ({ ...prev, [fileItem.id]: "" }));
        setProgress(0);

        try {
            let blob;
            if (fileItem.url) {
                // Remote file: stream it so we can report real progress.
                const response = await fetch(fileItem.url);
                if (!response.ok) throw new Error(`Download failed (server responded ${response.status}).`);
                const total = Number(response.headers.get("Content-Length")) || fileItem.size || 0;
                if (response.body && total) {
                    const streamReader = response.body.getReader();
                    const chunks = [];
                    let received = 0;
                    for (; ;) {
                        const { done, value } = await streamReader.read();
                        if (done) break;
                        chunks.push(value);
                        received += value.length;
                        setProgress(Math.min(99, Math.floor((received / total) * 100)));
                    }
                    blob = new Blob(chunks, { type: fileItem.type || "application/octet-stream" });
                } else {
                    blob = await response.blob();
                }
            } else if (fileItem.fileObject) {
                await readFileWithProgress(fileItem.fileObject, setProgress);
                blob = fileItem.fileObject;
            } else {
                throw new Error("This file is not available for download.");
            }
            setProgress(100);
            saveBlob(blob, fileItem.name);
        } catch (error) {
            setDownloadErrors(prev => ({ ...prev, [fileItem.id]: error?.message || "Download failed. Try again." }));
        } finally {
            // Leave 100% visible for a moment so the finish is noticeable.
            window.setTimeout(() => {
                setDownloadProgress(prev => {
                    const { [fileItem.id]: _done, ...rest } = prev;
                    return rest;
                });
            }, 500);
        }
    };

    // ── Resource Management Handlers ──
    const handleAddResource = (userId) => {
        const taskData = individualTaskAllocations[userId];
        const name = taskData?.newResourceName?.trim() || "";

        if (!name) {
            setResourceErrors(prev => ({ ...prev, [userId]: "Enter a resource name." }));
            newResourceNameRefs.current[userId]?.focus();
            return;
        }
        const isDuplicate = (taskData.resources || []).some(
            r => r.name.trim().toLowerCase() === name.toLowerCase()
        );
        if (isDuplicate) {
            setResourceErrors(prev => ({ ...prev, [userId]: `"${name}" is already in the list.` }));
            newResourceNameRefs.current[userId]?.focus();
            return;
        }

        const newResource = {
            id: makeId("res"),
            name,
            note: taskData.newResourceNote?.trim() || "",
            files: []
        };

        updateMemberTask(userId, task => ({
            ...task,
            resources: [...(task.resources || []), newResource],
            newResourceName: "",
            newResourceNote: ""
        }));
        setResourceErrors(prev => ({ ...prev, [userId]: "" }));
        clearFieldError(userId, "newResourceName");
        newResourceNameRefs.current[userId]?.focus(); // ready for the next one
    };

    const updateResourceField = (userId, resId, field, value) => {
        updateMemberTaskList(userId, "resources", list =>
            list.map(r => (r.id === resId ? { ...r, [field]: value } : r))
        );
    };

    const removeResourceItem = (userId, resId) => {
        const resItem = (individualTaskAllocations[userId]?.resources || []).find(r => r.id === resId);
        (resItem?.files || []).forEach(f => cancelUpload(f.id));
        updateMemberTaskList(userId, "resources", list => list.filter(r => r.id !== resId));
        setResourceFileErrors(prev => ({ ...prev, [`${userId}:${resId}`]: "" }));
        setPendingDelete("");
    };

    // Asks for confirmation only when deleting would throw work away.
    const requestDeleteResource = (userId, resItem) => {
        if ((resItem.files || []).length > 0 || resItem.note?.trim()) {
            setPendingDelete(`${userId}:${resItem.id}`);
        } else {
            removeResourceItem(userId, resItem.id);
        }
    };

    // Max 4 files per resource, 50 MB each. Accepts input-picked and drag-dropped files.
    const processResourceFiles = (userId, resId, pickedFiles) => {
        if (pickedFiles.length === 0) return;
        const resItem = (individualTaskAllocations[userId]?.resources || []).find(r => r.id === resId);
        if (!resItem) return;

        const { accepted, problems } = prepareFiles(pickedFiles, resItem.files || [], MAX_FILES_PER_RESOURCE);
        setResourceFileErrors(prev => ({ ...prev, [`${userId}:${resId}`]: problems.join(" ") }));
        if (accepted.length === 0) return;

        updateMemberTaskList(userId, "resources", list =>
            list.map(r => (r.id === resId ? { ...r, files: [...(r.files || []), ...accepted] } : r))
        );
        accepted.forEach(file => startUpload(file, (fileId, patch) => patchResourceFile(userId, resId, fileId, patch)));
    };

    const handleResourceFileUpload = (userId, resId, e) => {
        const input = e.target;
        const pickedFiles = Array.from(input.files || []);
        input.value = ""; // lets the same file be picked again after removal
        processResourceFiles(userId, resId, pickedFiles);
    };

    const handleResourceFileDrop = (userId, resId, e) => {
        e.preventDefault();
        setDragTarget("");
        processResourceFiles(userId, resId, Array.from(e.dataTransfer?.files || []));
    };

    const removeResourceFile = (userId, resId, fileId) => {
        cancelUpload(fileId);
        updateMemberTaskList(userId, "resources", list =>
            list.map(r => (r.id === resId
                ? { ...r, files: (r.files || []).filter(f => f.id !== fileId) }
                : r))
        );
        setResourceFileErrors(prev => ({ ...prev, [`${userId}:${resId}`]: "" }));
    };

    const retryResourceUpload = (userId, resId, fileEntry) => {
        startUpload(fileEntry, (fileId, patch) => patchResourceFile(userId, resId, fileId, patch));
    };

    // ── Assistance Worker Handlers ──
    const handleAssistanceWorkersChange = (userId, selectedOptions) => {
        updateMemberTaskList(userId, "assistanceWorkers", current =>
            (selectedOptions || []).map(opt => {
                const existing = current.find(a => a.workerId === opt.value);
                if (existing) return existing;
                const userObj = users.find(u => u._id === opt.value);
                return {
                    workerId: opt.value,
                    workerName: userObj?.fullname || opt.label,
                    workerRole: userObj?.jobRole || userObj?.role || "Staff",
                    note: "",
                    attachments: []
                };
            })
        );
    };

    const removeAssistanceWorker = (userId, workerId) => {
        const worker = (individualTaskAllocations[userId]?.assistanceWorkers || []).find(aw => aw.workerId === workerId);
        (worker?.attachments || []).forEach(f => cancelUpload(f.id));
        updateMemberTaskList(userId, "assistanceWorkers", list => list.filter(aw => aw.workerId !== workerId));
    };

    const updateAssistanceWorkerField = (userId, workerId, field, value) => {
        updateMemberTaskList(userId, "assistanceWorkers", list =>
            list.map(aw => (aw.workerId === workerId ? { ...aw, [field]: value } : aw))
        );
    };

    const handleAssistanceWorkerFileUpload = (userId, workerId, e) => {
        const input = e.target;
        const pickedFiles = Array.from(input.files || []);
        input.value = "";
        if (pickedFiles.length === 0) return;

        const worker = (individualTaskAllocations[userId]?.assistanceWorkers || []).find(aw => aw.workerId === workerId);
        if (!worker) return;

        const { accepted, problems } = prepareFiles(pickedFiles, worker.attachments || []);
        setAssistanceFileErrors(prev => ({ ...prev, [`${userId}:${workerId}`]: problems.join(" ") }));
        if (accepted.length === 0) return;

        updateMemberTaskList(userId, "assistanceWorkers", list =>
            list.map(aw => (aw.workerId === workerId ? { ...aw, attachments: [...(aw.attachments || []), ...accepted] } : aw))
        );
        accepted.forEach(file => startUpload(file, (fileId, patch) => patchAssistanceFile(userId, workerId, fileId, patch)));
    };

    const removeAssistanceWorkerFile = (userId, workerId, fileId) => {
        cancelUpload(fileId);
        updateMemberTaskList(userId, "assistanceWorkers", list =>
            list.map(aw => (aw.workerId === workerId
                ? { ...aw, attachments: (aw.attachments || []).filter(f => f.id !== fileId) }
                : aw))
        );
    };

    const retryAssistanceUpload = (userId, workerId, fileEntry) => {
        startUpload(fileEntry, (fileId, patch) => patchAssistanceFile(userId, workerId, fileId, patch));
    };

    // ── Time Calculation & Validation Helpers ──
    const calculateWorkingDuration = (start, end) => {
        if (!start || !end) return null;
        const [sH, sM] = start.split(":").map(Number);
        const [eH, eM] = end.split(":").map(Number);
        const startMins = sH * 60 + sM;
        const endMins = eH * 60 + eM;
        const diff = endMins - startMins;
        if (diff <= 0) return null;
        const hours = Math.floor(diff / 60);
        const mins = diff % 60;
        return `${hours > 0 ? `${hours}h ` : ""}${mins > 0 ? `${mins}m` : hours === 0 && mins === 0 ? "0m" : ""}`.trim();
    };

    const checkConflicts = (nepaliDateStr, startTime, endTime, userId) => {
        if (!nepaliDateStr || !startTime || !endTime || endTime <= startTime) return undefined;
        return EXISTING_BOOKINGS.find(booking => {
            if (booking.userId !== userId || booking.nepaliDate !== nepaliDateStr) return false;
            return (startTime < booking.endTime && endTime > booking.startTime);
        });
    };

    const getAllocationErrors = (taskData, userId) => {
        const errors = {};
        if (!taskData?.service?.value) errors.service = "Select a service category.";
        if (!taskData?.activity?.value) errors.activity = "Select an activity.";
        if (!taskData?.nepaliDate?.value) errors.nepaliDate = "Select a scheduled date.";
        if (!taskData?.startTime) errors.startTime = "Enter a start time.";
        if (!taskData?.endTime) errors.endTime = "Enter an end time.";
        else if (taskData.startTime && taskData.endTime <= taskData.startTime) {
            errors.endTime = "End time must be later than start time.";
        }
        if (taskData?.startTime && taskData?.endTime && taskData.endTime > taskData.startTime &&
            checkConflicts(taskData.nepaliDate?.value, taskData.startTime, taskData.endTime, userId)) {
            errors.endTime = "This time overlaps an existing booking.";
        }
        if (!taskData?.workLocation?.value) errors.workLocation = "Select a work location.";
        const vehicleCapacity = taskData?.vehicle?.value === "Scooter"
            ? 2
            : taskData?.vehicle?.value === "Car"
                ? 4
                : null;
        const travellingPeople = 1 + (taskData?.travellingWorkers?.length || 0);
        if (taskData?.workLocation?.value !== "In-Office" && !taskData?.vehicle?.value) {
            errors.vehicle = "Select a vehicle or transportation option.";
        }
        if (taskData?.workLocation?.value !== "In-Office" &&
            vehicleCapacity !== null && travellingPeople > vehicleCapacity) {
            errors.travellingWorkers = `This vehicle holds ${vehicleCapacity} people; reduce the travelling team.`;
        }
        if (taskData?.requiresAssistance && !taskData?.assistanceWorkers?.length) {
            errors.assistanceWorkers = "Select at least one assistance worker.";
        }
        const resourceList = taskData?.resources || [];
        const allFiles = [
            ...resourceList.flatMap(r => r.files || []),
            ...(taskData?.assistanceWorkers || []).flatMap(aw => aw.attachments || [])
        ];
        if (resourceList.some(r => !r.name?.trim())) {
            errors.resources = "Every resource needs a name.";
        } else if (taskData?.newResourceName?.trim()) {
            errors.resources = `Click "Add Resource" to save "${taskData.newResourceName.trim()}", or clear the field.`;
        } else if (allFiles.some(f => f.status === "Uploading")) {
            errors.resources = "Wait for file uploads to finish before submitting.";
        } else if (allFiles.some(f => f.status === "Error")) {
            errors.resources = "Retry or remove the failed uploads before submitting.";
        }
        return errors;
    };

    const validateAllocationField = (userId, field) => {
        const errors = getAllocationErrors(individualTaskAllocations[userId], userId);
        setValidationErrors(prev => ({
            ...prev,
            [userId]: { ...prev[userId], [field]: errors[field] || "" }
        }));
    };

    const handleTaskSubmit = () => {
        if (selectedPersonnel.length === 0) {
            setFormError("Select a project leader or at least one team member before submitting.");
            return;
        }

        const errorsByUser = {};
        selectedPersonnel.forEach(person => {
            errorsByUser[person._id] = getAllocationErrors(individualTaskAllocations[person._id], person._id);
        });
        setValidationErrors(errorsByUser);
        if (Object.values(errorsByUser).some(errors => Object.keys(errors).length > 0)) {
            setFormError("Review the highlighted allocation fields before submitting.");
            return;
        }

        setFormError("Validation passed, but no schedule submission API is configured. This allocation has not been submitted.");
    };

    const serviceOptions = EIMCTA_SERVICES_MASTER.map(s => ({
        value: s.id,
        label: `${s.sNo}. ${s.serviceName}`
    }));

    const nepaliDateOptions = Array.from({ length: NEPALI_MONTH_DAYS }, (_, i) => makeNepaliDateOption(i + 1));

    const workLocationOptions = [
        { value: "In-Office", label: "In-Office" },
        { value: "Out-of-Office", label: "Out-of-Office" }
    ];

    const vehicleOptions = [
        { value: "Scooter", label: "Scooter (Max 2 persons)" },
        { value: "Car", label: "Car (Max 4 persons)" },
        { value: "Public Vehicle", label: "Public Vehicle" }
    ];

    const clientName = typeof selectedCompany === "string"
        ? selectedCompany
        : selectedCompany?.label || "EIMCTA Client";

    const tabClass = (tab) => `relative inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap px-4 text-sm transition-colors ${FOCUS_INSET} ${activeTab === tab
        ? "font-semibold text-slate-900 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-amber-500 [&>svg]:text-amber-600"
        : "font-medium text-slate-600 hover:text-slate-900 [&>svg]:text-slate-400"}`;

    return (
        <div
            className="animate-fade-in fixed inset-0 z-50 flex items-stretch justify-center bg-slate-900/40 sm:items-center sm:p-4"
            onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="flex h-full w-full max-w-7xl flex-col overflow-hidden bg-white shadow-xl sm:h-[min(96vh,900px)] sm:rounded-xl sm:border sm:border-slate-200"
            >

                {/* ── Header ── */}
                <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700">
                            <Building2 className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                                <h2 id={titleId} className="text-lg font-semibold tracking-tight text-slate-900">
                                    {activeTab === "team" ? "EIMCTA ERP – Individual task allocation" : "Record"}
                                </h2>
                                <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                                    ISO 21001 EOMS
                                </span>
                            </div>
                            <p className="truncate text-sm text-slate-600">
                                Client: <span className="font-semibold text-slate-900">{clientName}</span>
                            </p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Close task allocation form" className={iconBtn}>
                        <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                </header>

                {/* ── Tabs ── */}
                <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 px-2 sm:px-4" role="tablist" aria-label="Allocation sections">
                    <button
                        type="button"
                        role="tab"
                        id="allocation-tab-team"
                        aria-selected={activeTab === "team"}
                        aria-controls="allocation-panel"
                        onClick={() => setActiveTab("team")}
                        className={tabClass("team")}
                    >
                        <Users className="h-4 w-4" aria-hidden="true" /> Tasks &amp; personnel
                    </button>
                    <button
                        type="button"
                        role="tab"
                        id="allocation-tab-record"
                        aria-selected={activeTab === "record"}
                        aria-controls="allocation-panel"
                        onClick={() => setActiveTab("record")}
                        className={tabClass("record")}
                    >
                        <FileText className="h-4 w-4" aria-hidden="true" /> Record
                    </button>
                </div>

                {/* ── Main Content Area ── */}
                <main
                    id="allocation-panel"
                    role="tabpanel"
                    aria-labelledby={`allocation-tab-${activeTab}`}
                    className="flex flex-1 flex-col overflow-y-auto bg-white"
                >
                    {activeTab === "team" && isScheduleUsersLoading && (
                        <div className="flex-1 space-y-8 p-4 sm:p-6" aria-busy="true" aria-label="Loading team schedule">
                            {[0, 1, 2].map((item) => (
                                <div key={item} className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-7 w-7 rounded-full" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-48 rounded-full" />
                                            <Skeleton className="h-3 w-72 max-w-full rounded-full" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-24 w-full rounded-xl" />
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === "team" && !isScheduleUsersLoading && (
                        <div className="flex flex-1 flex-col gap-8 p-4 sm:p-6">

                            {/* ── STEP 1: Project Leader Selection ── */}
                            <section>
                                <SectionHeader
                                    step={1}
                                    title="Project leader / executive head"
                                    description="Designate primary management oversight for EIMCTA operations."
                                />

                                {headUser ? (
                                    <label className={`group flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-colors sm:max-w-md ${selectedHead ? "border-amber-500 bg-amber-50/60" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}>
                                        <Checkbox checked={selectedHead} onChange={toggleEomsHead} />
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                                            <Crown className="h-5 w-5" aria-hidden="true" />
                                        </span>
                                        <span className="flex min-w-0 flex-col">
                                            <span className="truncate text-sm font-semibold text-slate-900">{headUser.fullname || "Project Leader"}</span>
                                            <span className="truncate text-sm text-slate-600">{headUser.jobRole || headUser.role || "Director / Lead"}</span>
                                        </span>
                                    </label>
                                ) : (
                                    <EmptyState icon={Users} title="No staff found">
                                        There is nobody available to assign as project leader.
                                    </EmptyState>
                                )}
                            </section>

                            {/* ── STEP 2: Team Member Selection ── */}
                            <section>
                                <SectionHeader
                                    step={2}
                                    title="Team members"
                                    description="Select participating staff across departments."
                                    action={selectedUserIds.length > 0 && (
                                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700" role="status">
                                            {selectedUserIds.length} selected
                                        </span>
                                    )}
                                />

                                {columns.length === 0 ? (
                                    <EmptyState icon={Users} title="No team members available">
                                        Staff will appear here, grouped by role, once they are added.
                                    </EmptyState>
                                ) : (
                                    <div className="custom-scrollbar -mx-1 overflow-x-auto px-1 pb-2">
                                        <div className="flex w-max min-w-full items-stretch gap-3">
                                            {columns.map((col) => {
                                                const searchTerm = searchQueries[col.id] || "";
                                                const filteredMembers = col.members.filter(member =>
                                                    [member.name, member.role, member.officeEmail].join(" ").toLowerCase().includes(searchTerm.trim().toLowerCase())
                                                );
                                                const allChecked = filteredMembers.length > 0 && filteredMembers.every(m => m.checked);
                                                const someChecked = filteredMembers.some(m => m.checked);

                                                return (
                                                    <div key={col.id} className={`flex w-72 shrink-0 flex-col overflow-hidden ${CARD}`}>
                                                        <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-3.5 py-2.5">
                                                            <h4 className="truncate text-sm font-semibold text-slate-900">{col.name}</h4>
                                                            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-600">
                                                                {col.members.length}
                                                            </span>
                                                        </div>

                                                        <div className="border-b border-slate-200 p-2.5">
                                                            <div className="relative">
                                                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Search member…"
                                                                    aria-label={`Search ${col.name} members`}
                                                                    value={searchQueries[col.id] || ""}
                                                                    onChange={(e) => handleSearch(col.id, e.target.value)}
                                                                    className={inputClass(false, "h-9 pl-9 pr-3")}
                                                                />
                                                            </div>
                                                        </div>

                                                        <label className={`group flex items-center gap-3 border-b border-slate-200 px-3.5 py-2.5 transition-colors ${filteredMembers.length === 0 ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-slate-50"}`}>
                                                            <Checkbox
                                                                checked={allChecked}
                                                                indeterminate={someChecked}
                                                                disabled={filteredMembers.length === 0}
                                                                onChange={(e) => toggleSelectAll(filteredMembers.map(m => m.id), e.target.checked)}
                                                            />
                                                            <span className="text-sm font-medium text-slate-900">Select all</span>
                                                            {searchTerm.trim() && (
                                                                <span className="ml-auto text-xs text-slate-500">{filteredMembers.length} shown</span>
                                                            )}
                                                        </label>

                                                        <div className="custom-scrollbar max-h-56 flex-1 space-y-0.5 overflow-y-auto p-1.5">
                                                            {filteredMembers.length === 0 && (
                                                                <p className="px-2 py-4 text-center text-sm text-slate-500">No members found.</p>
                                                            )}
                                                            {filteredMembers.map((member) => (
                                                                <label
                                                                    key={member.id}
                                                                    className={`group flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 transition-colors ${member.checked ? "bg-amber-50" : "hover:bg-slate-50"}`}
                                                                >
                                                                    <Checkbox checked={member.checked} onChange={() => toggleMember(member.id)} />
                                                                    <span className="flex min-w-0 flex-1 flex-col">
                                                                        <span className="truncate text-sm font-medium text-slate-900">{member.name}</span>
                                                                        <span className="truncate text-xs text-slate-500">{member.role}</span>
                                                                    </span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </section>

                            {/* ── STEP 3: Individual Task Assignment ── */}
                            <section>
                                <SectionHeader
                                    step={3}
                                    title="Individual task allocation"
                                    description="Configure service, activity, schedule, location and resources for each selected person."
                                />

                                {hasAnyPersonnelSelected ? (
                                    <div className="space-y-4">
                                        {selectedPersonnel.map((person) => {
                                            const taskData = individualTaskAllocations[person._id] ?? createDefaultAllocation();
                                            const personErrors = validationErrors[person._id] || {};
                                            const selectedServ = EIMCTA_SERVICES_MASTER.find(s => s.id === taskData.service?.value) || EIMCTA_SERVICES_MASTER[0];
                                            const activityOptions = selectedServ.activities.map(a => ({ value: a.id, label: a.name }));

                                            // Assistance worker options (all users except current person)
                                            const assistanceWorkerOptions = users
                                                .filter(u => u._id !== person._id)
                                                .map(u => ({ value: u._id, label: `${u.fullname} (${u.jobRole || u.role || "Staff"})` }));

                                            // Time Validation & Duration
                                            const isTimeInvalid = taskData.startTime && taskData.endTime && taskData.startTime >= taskData.endTime;
                                            const workingDuration = calculateWorkingDuration(taskData.startTime, taskData.endTime);
                                            const conflictBooking = checkConflicts(taskData.nepaliDate?.value, taskData.startTime, taskData.endTime, person._id);

                                            // Work Location & Vehicle Seating Capacity Validation
                                            const isInOffice = taskData.workLocation?.value === "In-Office";
                                            const vehicleType = taskData.vehicle?.value;
                                            const travellingWorkersCount = taskData.travellingWorkers?.length || 0;
                                            const totalTravellingCount = 1 + travellingWorkersCount; // primary + travelling workers

                                            let vehicleCapacity = null;
                                            if (vehicleType === "Scooter") vehicleCapacity = 2;
                                            else if (vehicleType === "Car") vehicleCapacity = 4;
                                            else if (vehicleType === "Public Vehicle") vehicleCapacity = null; // Unlimited / Public

                                            const availableSeats = vehicleCapacity !== null ? Math.max(0, vehicleCapacity - totalTravellingCount) : "Unlimited";
                                            const isVehicleOverloaded = vehicleCapacity !== null && totalTravellingCount > vehicleCapacity;

                                            // Resource Search Filtering (keeps each resource's original number)
                                            const resourceList = taskData.resources || [];
                                            const totalResourceFiles = resourceList.reduce((sum, r) => sum + (r.files?.length || 0), 0);
                                            const resourcesUploading = resourceList.reduce((sum, r) => sum + (r.files || []).filter(f => f.status === "Uploading").length, 0);
                                            const resSearchQuery = (resourceSearchQueries[person._id] || "").trim().toLowerCase();
                                            const filteredResources = resourceList
                                                .map((res, index) => ({ res, index }))
                                                .filter(({ res }) => {
                                                    if (!resSearchQuery) return true;
                                                    return (
                                                        res.name.toLowerCase().includes(resSearchQuery) ||
                                                        (res.note || "").toLowerCase().includes(resSearchQuery) ||
                                                        (res.files || []).some(f => f.name.toLowerCase().includes(resSearchQuery))
                                                    );
                                                });

                                            // Display-only helpers for the collapsed card header
                                            const hasPersonErrors = Object.values(personErrors).some(Boolean);
                                            const allocationSummary = [
                                                taskData.service?.label,
                                                taskData.nepaliDate?.label,
                                                taskData.startTime && taskData.endTime ? `${taskData.startTime}–${taskData.endTime}` : "",
                                            ].filter(Boolean).join(" · ");

                                            return (
                                                <div key={person._id} className={`${CARD} overflow-hidden`}>

                                                    {/* User Header & Minimize/Expand Toggle */}
                                                    <div className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-5 ${taskData.isMinimized ? "" : "border-b border-slate-200"}`}>
                                                        <div className="flex min-w-0 items-center gap-3">
                                                            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${person.isHead ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`}>
                                                                {person.isHead ? <Crown className="h-5 w-5" aria-hidden="true" /> : <UserRound className="h-5 w-5" aria-hidden="true" />}
                                                            </span>
                                                            <div className="min-w-0">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <h4 className="text-base font-semibold text-slate-900">{person.fullname}</h4>
                                                                    <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${person.isHead ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"}`}>
                                                                        {person.isHead ? "Project leader" : "Team member"}
                                                                    </span>
                                                                    {taskData.isMinimized && hasPersonErrors && (
                                                                        <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700" role="status">
                                                                            <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" /> Needs attention
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="truncate text-sm text-slate-600">{person.jobRole || person.role || "EIMCTA Staff"}</p>
                                                                {taskData.isMinimized && allocationSummary && (
                                                                    <p className="mt-0.5 truncate text-sm text-slate-500">{allocationSummary}</p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => toggleMinimizeAllocation(person._id)}
                                                            className={btnSecondarySm}
                                                            aria-expanded={!taskData.isMinimized}
                                                            aria-label={`${taskData.isMinimized ? "Expand" : "Minimize"} allocation for ${person.fullname || "worker"}`}
                                                        >
                                                            {taskData.isMinimized ? "Expand" : "Minimize"}
                                                            <ChevronDown className={`h-4 w-4 transition-transform ${taskData.isMinimized ? "" : "rotate-180"}`} aria-hidden="true" />
                                                        </button>
                                                    </div>

                                                    {!taskData.isMinimized && (
                                                        <div className="animate-fade-in space-y-5 p-4 sm:p-5">

                                                            {/* Service & Job Dropdowns */}
                                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                                <div className="flex flex-col gap-1.5">
                                                                    <FieldLabel htmlFor={`svc-${person._id}`} required>Service category</FieldLabel>
                                                                    <AppSelect
                                                                        inputId={`svc-${person._id}`}
                                                                        hasError={Boolean(personErrors.service)}
                                                                        value={taskData.service}
                                                                        options={serviceOptions}
                                                                        onBlur={() => validateAllocationField(person._id, "service")}
                                                                        onChange={(selectedOption) => {
                                                                            updateMemberTaskField(person._id, "service", selectedOption);
                                                                            const sObj = EIMCTA_SERVICES_MASTER.find(s => s.id === selectedOption.value);
                                                                            if (sObj && sObj.activities.length > 0) {
                                                                                updateMemberTaskField(person._id, "activity", { value: sObj.activities[0].id, label: sObj.activities[0].name });
                                                                            }
                                                                        }}
                                                                        aria-invalid={Boolean(personErrors.service)}
                                                                    />
                                                                    <FieldError>{personErrors.service}</FieldError>
                                                                </div>

                                                                <div className="flex flex-col gap-1.5">
                                                                    <FieldLabel htmlFor={`act-${person._id}`} required>Job / activity</FieldLabel>
                                                                    <AppSelect
                                                                        inputId={`act-${person._id}`}
                                                                        hasError={Boolean(personErrors.activity)}
                                                                        value={taskData.activity}
                                                                        options={activityOptions}
                                                                        onBlur={() => validateAllocationField(person._id, "activity")}
                                                                        onChange={(selectedOption) => updateMemberTaskField(person._id, "activity", selectedOption)}
                                                                        aria-invalid={Boolean(personErrors.activity)}
                                                                    />
                                                                    <FieldError>{personErrors.activity}</FieldError>
                                                                </div>
                                                            </div>

                                                            {/* Date, Time & Work Location */}
                                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                                                <div className="flex flex-col gap-1.5">
                                                                    <FieldLabel htmlFor={`date-${person._id}`} required>Date (Nepali BS)</FieldLabel>
                                                                    <AppSelect
                                                                        inputId={`date-${person._id}`}
                                                                        icon={CalendarDays}
                                                                        hasError={Boolean(personErrors.nepaliDate)}
                                                                        value={taskData.nepaliDate}
                                                                        options={nepaliDateOptions}
                                                                        onBlur={() => validateAllocationField(person._id, "nepaliDate")}
                                                                        onChange={(selectedOption) => updateMemberTaskField(person._id, "nepaliDate", selectedOption)}
                                                                        aria-invalid={Boolean(personErrors.nepaliDate)}
                                                                    />
                                                                    <FieldError>{personErrors.nepaliDate}</FieldError>
                                                                </div>

                                                                <div className="flex flex-col gap-1.5">
                                                                    <div className="flex items-center justify-between gap-2">
                                                                        <FieldLabel htmlFor={`start-${person._id}`} required>Time (start – end)</FieldLabel>
                                                                        {workingDuration && !isTimeInvalid && (
                                                                            <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                                                                                {workingDuration}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className={`flex h-10 items-center gap-2 rounded-lg border bg-white px-3 text-sm shadow-xs transition focus-within:ring-4 ${isTimeInvalid || personErrors.startTime || personErrors.endTime
                                                                        ? "border-red-500 focus-within:ring-red-500/15"
                                                                        : "border-slate-300 hover:border-slate-400 focus-within:border-amber-500 focus-within:ring-amber-500/15"}`}>
                                                                        <Clock className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                                                                        <input
                                                                            id={`start-${person._id}`}
                                                                            type="time"
                                                                            required
                                                                            aria-label="Start time"
                                                                            value={taskData.startTime || ""}
                                                                            onChange={(e) => updateMemberTaskField(person._id, "startTime", e.target.value)}
                                                                            onBlur={() => validateAllocationField(person._id, "startTime")}
                                                                            aria-invalid={Boolean(personErrors.startTime)}
                                                                            className="w-28 min-w-0 bg-transparent tabular-nums text-slate-900 outline-none"
                                                                        />
                                                                        <span className="text-slate-500">to</span>
                                                                        <input
                                                                            type="time"
                                                                            required
                                                                            aria-label="End time"
                                                                            value={taskData.endTime || ""}
                                                                            onChange={(e) => updateMemberTaskField(person._id, "endTime", e.target.value)}
                                                                            onBlur={() => validateAllocationField(person._id, "endTime")}
                                                                            aria-invalid={Boolean(personErrors.endTime)}
                                                                            className="w-28 min-w-0 bg-transparent tabular-nums text-slate-900 outline-none"
                                                                        />
                                                                    </div>
                                                                    {isTimeInvalid
                                                                        ? <FieldError>End time must be later than start time.</FieldError>
                                                                        : <FieldError>{personErrors.endTime}</FieldError>}
                                                                    <FieldError>{personErrors.startTime}</FieldError>
                                                                </div>

                                                                <div className="flex flex-col gap-1.5">
                                                                    <FieldLabel htmlFor={`loc-${person._id}`} required>Work location</FieldLabel>
                                                                    <AppSelect
                                                                        inputId={`loc-${person._id}`}
                                                                        icon={MapPin}
                                                                        hasError={Boolean(personErrors.workLocation)}
                                                                        value={taskData.workLocation}
                                                                        options={workLocationOptions}
                                                                        onBlur={() => validateAllocationField(person._id, "workLocation")}
                                                                        onChange={(selectedOption) => {
                                                                            updateMemberTaskField(person._id, "workLocation", selectedOption);
                                                                            if (selectedOption.value === "In-Office") {
                                                                                updateMemberTaskField(person._id, "requiresTransportation", false);
                                                                            }
                                                                        }}
                                                                        aria-invalid={Boolean(personErrors.workLocation)}
                                                                    />
                                                                    <FieldError>{personErrors.workLocation}</FieldError>
                                                                </div>
                                                            </div>

                                                            {/* Conflict Check Status */}
                                                            {conflictBooking ? (
                                                                <Banner tone="error" icon={AlertTriangle} role="alert">
                                                                    <strong className="font-semibold">Conflict:</strong> {person.fullname} is already booked on {conflictBooking.nepaliDate} from {conflictBooking.startTime} to {conflictBooking.endTime} ({conflictBooking.taskName}).
                                                                </Banner>
                                                            ) : (
                                                                <Banner tone="success" icon={CheckCircle2}>
                                                                    No scheduling conflicts on {taskData.nepaliDate?.label}
                                                                </Banner>
                                                            )}

                                                            {/* Vehicle Assignment (Out-of-Office only) */}
                                                            {!isInOffice && (
                                                                <div className={`${PANEL} animate-fade-in space-y-4`}>
                                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                                        <h5 className={HEADING}>
                                                                            <Car className="h-4 w-4 text-amber-600" aria-hidden="true" /> Vehicle assignment (outside office)
                                                                        </h5>
                                                                        <span className="text-sm text-slate-600">
                                                                            {vehicleCapacity !== null ? `Capacity: ${vehicleCapacity} persons` : "Public transit"}
                                                                        </span>
                                                                    </div>

                                                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                                        <div className="flex flex-col gap-1.5">
                                                                            <FieldLabel htmlFor={`veh-${person._id}`} required>Vehicle</FieldLabel>
                                                                            <AppSelect
                                                                                inputId={`veh-${person._id}`}
                                                                                hasError={Boolean(personErrors.vehicle)}
                                                                                value={taskData.vehicle}
                                                                                options={vehicleOptions}
                                                                                onBlur={() => validateAllocationField(person._id, "vehicle")}
                                                                                onChange={(selectedOption) => updateMemberTaskField(person._id, "vehicle", selectedOption)}
                                                                                aria-invalid={Boolean(personErrors.vehicle)}
                                                                            />
                                                                            <FieldError>{personErrors.vehicle}</FieldError>
                                                                        </div>
                                                                        <div className="flex flex-col gap-1.5">
                                                                            <FieldLabel htmlFor={`veh-reg-${person._id}`} optional>Registration / details</FieldLabel>
                                                                            <input
                                                                                id={`veh-reg-${person._id}`}
                                                                                type="text"
                                                                                placeholder="Registration number or details…"
                                                                                value={taskData.vehicleRegistrationNo || ""}
                                                                                onChange={(e) => updateMemberTaskField(person._id, "vehicleRegistrationNo", e.target.value)}
                                                                                className={inputClass()}
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    {/* Travelling Workers & Seating Capacity */}
                                                                    <div className="space-y-2.5 border-t border-slate-200 pt-4">
                                                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                                                            <FieldLabel htmlFor={`travel-${person._id}`}>
                                                                                Travelling team members <span className="font-normal text-slate-500">(excluding primary worker)</span>
                                                                            </FieldLabel>
                                                                            <span className={`text-sm font-semibold ${isVehicleOverloaded ? "text-red-600" : "text-amber-700"}`}>
                                                                                Seats used: {totalTravellingCount} / {vehicleCapacity !== null ? vehicleCapacity : "∞"}
                                                                            </span>
                                                                        </div>

                                                                        <AppSelect
                                                                            inputId={`travel-${person._id}`}
                                                                            hasError={Boolean(personErrors.travellingWorkers)}
                                                                            isMulti
                                                                            value={users.filter(u => (taskData.travellingWorkers || []).includes(u._id)).map(u => ({ value: u._id, label: `${u.fullname} (${u.jobRole || u.role || "Staff"})` }))}
                                                                            options={users.filter(u => u._id !== person._id).map(u => ({ value: u._id, label: `${u.fullname} (${u.jobRole || u.role || "Staff"})` }))}
                                                                            onChange={(selectedOpts) => updateMemberTaskField(person._id, "travellingWorkers", (selectedOpts || []).map(o => o.value))}
                                                                            placeholder="Select additional travelling workers…"
                                                                        />

                                                                        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                                                                            <span>Primary worker: <strong className="font-semibold text-slate-900">{person.fullname}</strong> (1 seat)</span>
                                                                            <span>Available seats: <strong className="font-semibold text-amber-700">{availableSeats}</strong></span>
                                                                        </div>

                                                                        {isVehicleOverloaded && (
                                                                            <Banner tone="error" icon={AlertTriangle} role="alert">
                                                                                Selected workers ({totalTravellingCount}) exceed vehicle capacity ({vehicleCapacity}). Adjust seating.
                                                                            </Banner>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Assistance Workers */}
                                                            <div className={`${PANEL} space-y-4`}>
                                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                                    <div>
                                                                        <h5 className={HEADING}>
                                                                            <Users className="h-4 w-4 text-amber-600" aria-hidden="true" /> Assistance workers
                                                                        </h5>
                                                                        <p className={`${HINT} mt-0.5`}>Does this task need extra people to help?</p>
                                                                    </div>
                                                                    <div className="flex items-center gap-2" role="radiogroup" aria-label={`Assistance required for ${person.fullname}`}>
                                                                        <label className={optionCardClass(Boolean(taskData.requiresAssistance))}>
                                                                            <Radio
                                                                                name={`assistance-${person._id}`}
                                                                                checked={Boolean(taskData.requiresAssistance)}
                                                                                onChange={() => updateMemberTaskField(person._id, "requiresAssistance", true)}
                                                                            />
                                                                            Yes
                                                                        </label>
                                                                        <label className={optionCardClass(!taskData.requiresAssistance)}>
                                                                            <Radio
                                                                                name={`assistance-${person._id}`}
                                                                                checked={!taskData.requiresAssistance}
                                                                                onChange={() => {
                                                                                    updateMemberTaskField(person._id, "requiresAssistance", false);
                                                                                    updateMemberTaskField(person._id, "assistanceWorkers", []);
                                                                                }}
                                                                            />
                                                                            No
                                                                        </label>
                                                                    </div>
                                                                </div>

                                                                {taskData.requiresAssistance && (
                                                                    <div className="animate-fade-in space-y-4 border-t border-slate-200 pt-4">
                                                                        <div className="flex flex-col gap-1.5">
                                                                            <FieldLabel htmlFor={`assist-${person._id}`} required>Assistance team members</FieldLabel>
                                                                            <AppSelect
                                                                                inputId={`assist-${person._id}`}
                                                                                hasError={Boolean(personErrors.assistanceWorkers)}
                                                                                isMulti
                                                                                value={(taskData.assistanceWorkers || []).map(aw => ({ value: aw.workerId, label: `${aw.workerName} (${aw.workerRole})` }))}
                                                                                options={assistanceWorkerOptions}
                                                                                onBlur={() => validateAllocationField(person._id, "assistanceWorkers")}
                                                                                onChange={(selectedOptions) => handleAssistanceWorkersChange(person._id, selectedOptions)}
                                                                                placeholder="Select assistance workers…"
                                                                                aria-invalid={Boolean(personErrors.assistanceWorkers)}
                                                                            />
                                                                            <FieldError>{personErrors.assistanceWorkers}</FieldError>
                                                                        </div>

                                                                        {taskData.assistanceWorkers?.length > 0 && (
                                                                            <div className="space-y-3">
                                                                                <p className="text-sm font-semibold text-slate-900">Assistance worker details ({taskData.assistanceWorkers.length})</p>

                                                                                {taskData.assistanceWorkers.map((awItem, awIdx) => (
                                                                                    <div key={awItem.workerId} className={`${CARD} space-y-4 p-4`}>
                                                                                        <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
                                                                                            <div className="flex min-w-0 items-center gap-2.5">
                                                                                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700">
                                                                                                    {awIdx + 1}
                                                                                                </span>
                                                                                                <div className="min-w-0">
                                                                                                    <h5 className="truncate text-sm font-semibold text-slate-900">{awItem.workerName}</h5>
                                                                                                    <span className="text-xs text-slate-500">{awItem.workerRole}</span>
                                                                                                </div>
                                                                                            </div>
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => removeAssistanceWorker(person._id, awItem.workerId)}
                                                                                                className={btnDangerOutlineSm}
                                                                                            >
                                                                                                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Remove
                                                                                            </button>
                                                                                        </div>

                                                                                        <NoteField
                                                                                            label={`Note for ${awItem.workerName}`}
                                                                                            value={awItem.note}
                                                                                            onSave={(note) => updateAssistanceWorkerField(person._id, awItem.workerId, "note", note)}
                                                                                            placeholder="Enter instructions or notes for this assistance worker…"
                                                                                            rows={2}
                                                                                        />

                                                                                        <div className="space-y-2">
                                                                                            <div className="flex items-center justify-between gap-2">
                                                                                                <span className={HEADING}>
                                                                                                    <Paperclip className="h-4 w-4 text-amber-600" aria-hidden="true" /> Attachments
                                                                                                </span>
                                                                                                <label className={`${btnSecondarySm} ${FOCUS_WITHIN}`}>
                                                                                                    <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                                                                                                    <span>Upload file</span>
                                                                                                    <input
                                                                                                        type="file"
                                                                                                        multiple
                                                                                                        className="sr-only"
                                                                                                        onChange={(e) => handleAssistanceWorkerFileUpload(person._id, awItem.workerId, e)}
                                                                                                    />
                                                                                                </label>
                                                                                            </div>

                                                                                            <FieldError>{assistanceFileErrors[`${person._id}:${awItem.workerId}`]}</FieldError>

                                                                                            {awItem.attachments?.length > 0 && (
                                                                                                <div className="space-y-2">
                                                                                                    {awItem.attachments.map((fileObj) => (
                                                                                                        <FileRow
                                                                                                            key={fileObj.id}
                                                                                                            file={fileObj}
                                                                                                            downloadProgress={downloadProgress[fileObj.id]}
                                                                                                            downloadError={downloadErrors[fileObj.id]}
                                                                                                            onDownload={() => handleDownloadFile(fileObj)}
                                                                                                            onRemove={() => removeAssistanceWorkerFile(person._id, awItem.workerId, fileObj.id)}
                                                                                                            onRetry={() => retryAssistanceUpload(person._id, awItem.workerId, fileObj)}
                                                                                                        />
                                                                                                    ))}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Task Note */}
                                                            <NoteField
                                                                label={`Task note for ${person.fullname || "this worker"}`}
                                                                value={taskData.note}
                                                                onSave={(note) => updateMemberTaskField(person._id, "note", note)}
                                                                placeholder="Enter task notes, instructions, or specific remarks…"
                                                            />

                                                            {/* ── RESOURCES MANAGEMENT ── */}
                                                            <div className={`${PANEL} space-y-4`}>
                                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                                    <h5 className={HEADING}>
                                                                        <Package className="h-4 w-4 text-amber-600" aria-hidden="true" /> Resources &amp; file attachments
                                                                    </h5>
                                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                                        {resourcesUploading > 0 && (
                                                                            <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800" role="status">
                                                                                <LoaderCircle className="h-3.5 w-3.5 animate-spin text-white" strokeWidth={2.5} aria-hidden="true" /> Uploading {resourcesUploading}
                                                                            </span>
                                                                        )}
                                                                        <span>{resourceList.length} resource{resourceList.length === 1 ? "" : "s"}, {totalResourceFiles} file{totalResourceFiles === 1 ? "" : "s"}</span>
                                                                    </div>
                                                                </div>

                                                                {/* Add New Resource */}
                                                                <div className={`${CARD} space-y-3 p-4`}>
                                                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                                        <div className="flex flex-col gap-1.5">
                                                                            <FieldLabel htmlFor={`new-res-name-${person._id}`} required>Resource name</FieldLabel>
                                                                            <input
                                                                                id={`new-res-name-${person._id}`}
                                                                                ref={(el) => { newResourceNameRefs.current[person._id] = el; }}
                                                                                type="text"
                                                                                placeholder="e.g. Projector"
                                                                                value={taskData.newResourceName || ""}
                                                                                aria-invalid={Boolean(resourceErrors[person._id])}
                                                                                onChange={(e) => {
                                                                                    updateMemberTaskField(person._id, "newResourceName", e.target.value);
                                                                                    setResourceErrors(prev => ({ ...prev, [person._id]: "" }));
                                                                                }}
                                                                                onKeyDown={(e) => {
                                                                                    if (e.key === "Enter") {
                                                                                        e.preventDefault();
                                                                                        handleAddResource(person._id);
                                                                                    }
                                                                                }}
                                                                                className={inputClass(Boolean(resourceErrors[person._id]))}
                                                                            />
                                                                            <FieldError>{resourceErrors[person._id]}</FieldError>
                                                                        </div>
                                                                        <div className="flex flex-col gap-1.5">
                                                                            <FieldLabel htmlFor={`new-res-note-${person._id}`} optional>Description</FieldLabel>
                                                                            <textarea
                                                                                id={`new-res-note-${person._id}`}
                                                                                rows={1}
                                                                                placeholder="What is it for? Any details to remember"
                                                                                value={taskData.newResourceNote || ""}
                                                                                onChange={(e) => updateMemberTaskField(person._id, "newResourceNote", e.target.value)}
                                                                                className={textareaClass(false, "min-h-10 px-3 py-2")}
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    {/* Quick picks */}
                                                                    {QUICK_RESOURCES.some(name => !resourceList.some(r => r.name.trim().toLowerCase() === name.toLowerCase())) && (
                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                            <span className="text-sm text-slate-600">Quick add:</span>
                                                                            {QUICK_RESOURCES
                                                                                .filter(name => !resourceList.some(r => r.name.trim().toLowerCase() === name.toLowerCase()))
                                                                                .map(name => (
                                                                                    <button
                                                                                        key={name}
                                                                                        type="button"
                                                                                        onClick={() => {
                                                                                            updateMemberTaskField(person._id, "newResourceName", name);
                                                                                            setResourceErrors(prev => ({ ...prev, [person._id]: "" }));
                                                                                            newResourceNameRefs.current[person._id]?.focus();
                                                                                        }}
                                                                                        className={`inline-flex h-8 cursor-pointer items-center gap-1 rounded-full border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:border-amber-500 hover:bg-amber-50 hover:text-amber-800 ${FOCUS}`}
                                                                                    >
                                                                                        <Plus className="h-3.5 w-3.5" aria-hidden="true" /> {name}
                                                                                    </button>
                                                                                ))}
                                                                        </div>
                                                                    )}

                                                                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                                                                        <span className={HINT}>Press Enter in the name field to add quickly.</span>
                                                                        <button type="button" onClick={() => handleAddResource(person._id)} className={btnPrimary}>
                                                                            <Plus className="h-4 w-4" aria-hidden="true" /> Add resource
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                {personErrors.resources && (
                                                                    <Banner tone="error" icon={AlertTriangle} role="alert">{personErrors.resources}</Banner>
                                                                )}

                                                                {/* Search (only useful once there is something to search) */}
                                                                {resourceList.length > 1 && (
                                                                    <div className="relative">
                                                                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Search resources by name, description, or filename…"
                                                                            aria-label="Search resources"
                                                                            value={resourceSearchQueries[person._id] || ""}
                                                                            onChange={(e) => setResourceSearchQueries(prev => ({ ...prev, [person._id]: e.target.value }))}
                                                                            className={inputClass(false, "h-10 pl-9 pr-10")}
                                                                        />
                                                                        {resourceSearchQueries[person._id] && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setResourceSearchQueries(prev => ({ ...prev, [person._id]: "" }))}
                                                                                className={`${iconBtn} absolute right-1 top-1/2 -translate-y-1/2`}
                                                                                aria-label="Clear resource search"
                                                                            >
                                                                                <X className="h-4 w-4" aria-hidden="true" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                {resSearchQuery && resourceList.length > 1 && (
                                                                    <p className="text-sm text-slate-600" role="status">Showing {filteredResources.length} of {resourceList.length}</p>
                                                                )}

                                                                {/* Resource list (limited height, scrolls internally) */}
                                                                <div className="custom-scrollbar max-h-[34rem] space-y-3 overflow-y-auto pr-1 pt-1">
                                                                    {filteredResources.length === 0 ? (
                                                                        <EmptyState
                                                                            icon={Package}
                                                                            title={resourceList.length === 0 ? "No resources yet" : "No matching resources"}
                                                                        >
                                                                            {resourceList.length === 0
                                                                                ? "Add one above or pick a quick-add suggestion."
                                                                                : "Try a different name, description or filename."}
                                                                        </EmptyState>
                                                                    ) : (
                                                                        filteredResources.map(({ res: resItem, index }) => {
                                                                            const fileKey = `${person._id}:${resItem.id}`;
                                                                            const fileCount = resItem.files?.length || 0;
                                                                            const nameMissing = !resItem.name.trim();
                                                                            const uploadingHere = (resItem.files || []).filter(f => f.status === "Uploading").length;
                                                                            const isFull = fileCount >= MAX_FILES_PER_RESOURCE;
                                                                            const isDragging = dragTarget === fileKey;

                                                                            return (
                                                                                <div key={resItem.id} className={`overflow-hidden ${CARD}`}>

                                                                                    {/* Header */}
                                                                                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
                                                                                        <div className="flex min-w-0 items-center gap-2.5">
                                                                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-xs font-semibold text-slate-700">
                                                                                                {index + 1}
                                                                                            </span>
                                                                                            <span className={`truncate text-sm font-semibold ${nameMissing ? "text-red-600" : "text-slate-900"}`}>
                                                                                                {resItem.name.trim() || "Untitled resource"}
                                                                                            </span>
                                                                                        </div>
                                                                                        <div className="flex shrink-0 items-center gap-2">
                                                                                            {uploadingHere > 0 && (
                                                                                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
                                                                                                    <LoaderCircle className="h-3.5 w-3.5 animate-spin text-white" strokeWidth={2.5} aria-hidden="true" /> Uploading
                                                                                                </span>
                                                                                            )}
                                                                                            <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-700">
                                                                                                {fileCount} / {MAX_FILES_PER_RESOURCE} files
                                                                                            </span>
                                                                                            {pendingDelete === fileKey ? (
                                                                                                <div className="flex items-center gap-2" role="group" aria-label="Confirm resource deletion">
                                                                                                    <span className="text-xs font-medium text-red-700">
                                                                                                        Delete{fileCount > 0 ? ` with ${fileCount} file${fileCount === 1 ? "" : "s"}` : ""}?
                                                                                                    </span>
                                                                                                    <button type="button" onClick={() => removeResourceItem(person._id, resItem.id)} className={btnDangerSm}>
                                                                                                        Delete
                                                                                                    </button>
                                                                                                    <button type="button" onClick={() => setPendingDelete("")} className={btnSecondarySm}>
                                                                                                        Cancel
                                                                                                    </button>
                                                                                                </div>
                                                                                            ) : (
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={() => requestDeleteResource(person._id, resItem)}
                                                                                                    className={iconBtnDanger}
                                                                                                    title="Delete resource"
                                                                                                    aria-label={`Delete ${resItem.name || `resource ${index + 1}`}`}
                                                                                                >
                                                                                                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                                                                                                </button>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="space-y-4 p-4">
                                                                                        {/* Name | Description */}
                                                                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-start">
                                                                                            <div className="flex flex-col gap-1.5">
                                                                                                <FieldLabel htmlFor={`res-name-${person._id}-${resItem.id}`} required>Resource name</FieldLabel>
                                                                                                <input
                                                                                                    id={`res-name-${person._id}-${resItem.id}`}
                                                                                                    type="text"
                                                                                                    value={resItem.name}
                                                                                                    aria-invalid={nameMissing}
                                                                                                    placeholder="Resource name"
                                                                                                    onChange={(e) => updateResourceField(person._id, resItem.id, "name", e.target.value)}
                                                                                                    onBlur={(e) => {
                                                                                                        const trimmed = e.target.value.trim();
                                                                                                        if (trimmed !== resItem.name) updateResourceField(person._id, resItem.id, "name", trimmed);
                                                                                                    }}
                                                                                                    className={`${inputClass(nameMissing)} font-medium`}
                                                                                                />
                                                                                                <FieldError>{nameMissing ? "A name is required." : ""}</FieldError>
                                                                                            </div>
                                                                                            <NoteField
                                                                                                label="Description"
                                                                                                value={resItem.note}
                                                                                                onSave={(note) => updateResourceField(person._id, resItem.id, "note", note)}
                                                                                                placeholder="Enter a description for this resource…"
                                                                                                rows={2}
                                                                                            />
                                                                                        </div>

                                                                                        {/* Attachments */}
                                                                                        <div className="flex flex-col gap-2">
                                                                                            <span className={HEADING}>
                                                                                                <Paperclip className="h-4 w-4 text-amber-600" aria-hidden="true" /> Attachments
                                                                                            </span>

                                                                                            {!isFull ? (
                                                                                                <label
                                                                                                    onDragOver={(e) => { e.preventDefault(); setDragTarget(fileKey); }}
                                                                                                    onDragLeave={() => setDragTarget(prev => (prev === fileKey ? "" : prev))}
                                                                                                    onDrop={(e) => handleResourceFileDrop(person._id, resItem.id, e)}
                                                                                                    className={`group flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-3 py-5 text-center transition-colors ${FOCUS_WITHIN} ${isDragging
                                                                                                        ? "border-amber-500 bg-amber-50"
                                                                                                        : "border-slate-300 bg-white hover:border-amber-500 hover:bg-amber-50/50"}`}
                                                                                                >
                                                                                                    <Upload className={`h-5 w-5 transition-colors ${isDragging ? "text-amber-600" : "text-slate-400 group-hover:text-amber-600"}`} aria-hidden="true" />
                                                                                                    <span className="text-sm font-medium text-slate-900">
                                                                                                        {isDragging ? "Drop to upload" : <>Drag files here or <span className="text-amber-700 underline underline-offset-2">browse</span></>}
                                                                                                    </span>
                                                                                                    <span className="text-xs text-slate-500">
                                                                                                        {MAX_FILES_PER_RESOURCE - fileCount} of {MAX_FILES_PER_RESOURCE} slots free, up to 50 MB each
                                                                                                    </span>
                                                                                                    <input
                                                                                                        type="file"
                                                                                                        multiple
                                                                                                        className="sr-only"
                                                                                                        onChange={(e) => handleResourceFileUpload(person._id, resItem.id, e)}
                                                                                                    />
                                                                                                </label>
                                                                                            ) : (
                                                                                                <Banner tone="info" icon={Info}>
                                                                                                    Attachment limit reached ({MAX_FILES_PER_RESOURCE} of {MAX_FILES_PER_RESOURCE}). Remove a file to add another.
                                                                                                </Banner>
                                                                                            )}

                                                                                            <FieldError>{resourceFileErrors[fileKey]}</FieldError>

                                                                                            {fileCount > 0 && (
                                                                                                <div className="space-y-2">
                                                                                                    {resItem.files.map((fileObj) => (
                                                                                                        <FileRow
                                                                                                            key={fileObj.id}
                                                                                                            file={fileObj}
                                                                                                            downloadProgress={downloadProgress[fileObj.id]}
                                                                                                            downloadError={downloadErrors[fileObj.id]}
                                                                                                            onDownload={() => handleDownloadFile(fileObj)}
                                                                                                            onRemove={() => removeResourceFile(person._id, resItem.id, fileObj.id)}
                                                                                                            onRetry={() => retryResourceUpload(person._id, resItem.id, fileObj)}
                                                                                                        />
                                                                                                    ))}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })
                                                                    )}
                                                                </div>
                                                            </div>

                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <EmptyState icon={Info} title="No one selected yet">
                                        Select the <strong className="font-semibold text-slate-900">Project Leader</strong> or at least one <strong className="font-semibold text-slate-900">Team Member</strong> above to unlock individual task allocations.
                                    </EmptyState>
                                )}
                            </section>

                        </div>
                    )}

                    {activeTab === "record" && (
                        <div className="flex flex-1 flex-col gap-8 p-4 sm:p-6">
                            <section>
                                <SectionHeader
                                    step={1}
                                    title="ISO 21001 configuration"
                                    description="EOMS requirements for this client's educational organization."
                                />
                                <EmptyState icon={FileText} title="Nothing configured yet">
                                    ISO 21001 configuration for this record will appear here.
                                </EmptyState>
                            </section>
                        </div>
                    )}
                </main>

                {/* ── Footer ── */}
                <footer className="border-t border-slate-200 bg-white px-4 py-3.5 sm:px-6">
                    {formError && (
                        <div className="mb-3">
                            <Banner tone="error" icon={AlertTriangle} role="alert">{formError}</Banner>
                        </div>
                    )}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="flex h-6 min-w-6 items-center justify-center rounded-md border border-amber-200 bg-amber-50 px-1.5 text-xs font-semibold text-amber-800">
                                {selectedPersonnel.length}
                            </span>
                            {selectedPersonnel.length === 1 ? "person" : "people"} with task allocations configured.
                        </p>
                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
                            <button type="button" onClick={onClose} className={btnSecondary}>
                                Cancel
                            </button>
                            <button type="button" onClick={handleTaskSubmit} className={btnPrimary}>
                                <Save className="h-4 w-4" aria-hidden="true" /> Submit task allocations
                            </button>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}