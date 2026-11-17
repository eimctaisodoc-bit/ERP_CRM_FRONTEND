import React, { useState, useMemo, useEffect, useId, useRef } from "react";
import Select from "react-select";
import {
    Users, FileText, Search, X, Check, Building2, Crown,
    LoaderCircle, UserRound, Clock, AlertTriangle,
    Plus, Trash2, CheckCircle2, MapPin, Car, Paperclip, ShieldAlert,
    ChevronDown, ChevronUp, Upload, Edit3, Download, Info,
    Save, MessageSquareText, Package
} from "lucide-react";
import { useGet } from "../hooks/useGet";

const selectStyles = {
    control: (baseStyles) => ({ ...baseStyles, cursor: "pointer" }),
    option: (baseStyles) => ({ ...baseStyles, cursor: "pointer" }),
};

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
            <label htmlFor={fieldId} className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-[#64748B]">
                <MessageSquareText className="h-3.5 w-3.5 text-[#4A76C0]" />
                {label}
            </label>
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
                        className="min-h-20 w-full resize-y rounded-lg border border-[#E2E8F0] bg-white p-3 text-sm text-[#1E293B] outline-none transition-colors placeholder:text-slate-400 focus:border-[#4A76C0] focus:ring-2 focus:ring-blue-100"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500">Enter to save · Shift + Enter for a new line</span>
                        <div className="flex items-center gap-2">
                            {value && (
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="inline-flex h-9 cursor-pointer items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={saveNote}
                                disabled={!draft.trim()}
                                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-[#4A76C0] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#3b5f9e] disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                                <Save className="h-3.5 w-3.5" />
                                {value ? "Save Note" : "Add Note"}
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div id={fieldId} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="whitespace-pre-wrap wrap-break-word text-sm text-slate-700">{value}</p>
                    <div className="mt-2 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setDraft(value || "");
                                setIsEditing(true);
                            }}
                            className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100"
                            aria-label={`Edit ${label.toLowerCase()}`}
                        >
                            <Edit3 className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                            type="button"
                            onClick={deleteNote}
                            className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-md border border-red-100 bg-white px-2.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                            aria-label={`Delete ${label.toLowerCase()}`}
                        >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
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

function ProgressBar({ value, label, tone = "blue" }) {
    const color = tone === "red" ? "bg-red-500" : tone === "green" ? "bg-emerald-500" : "bg-[#4A76C0]";
    return (
        <div
            role="progressbar"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(value)}
            className="h-1.5 w-full overflow-hidden rounded-full bg-[#E2E8F0]"
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
        <div className={`rounded-lg border px-3 py-2 text-[11px] ${isError ? "border-red-200 bg-red-50/60" : "border-[#E2E8F0] bg-[#F8FAFC]"}`}>
            <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                    {isUploading ? (
                        <LoaderCircle className="h-3.5 w-3.5 shrink-0 animate-spin text-[#4A76C0]" aria-hidden="true" />
                    ) : isError ? (
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-600" aria-hidden="true" />
                    ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
                    )}
                    <span className="max-w-45 truncate font-bold text-[#1E293B]" title={file.name}>{file.name}</span>
                    <span className="shrink-0 text-[9px] text-[#64748B]">({formatFileSize(file.size)})</span>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                    <span className={`whitespace-nowrap text-[10px] font-medium ${isError ? "text-red-600" : isUploading ? "text-[#4A76C0]" : "text-emerald-700"}`}>
                        {isUploading ? `Uploading ${file.progress}%` : isError ? "Upload failed" : "Uploaded"}
                    </span>
                    {isError && onRetry && (
                        <button type="button" onClick={onRetry} className="cursor-pointer text-[10px] font-bold text-[#4A76C0] hover:underline">
                            Retry
                        </button>
                    )}
                    {!isUploading && !isError && (
                        <button
                            type="button"
                            onClick={onDownload}
                            disabled={isDownloading}
                            className="flex cursor-pointer items-center gap-1 text-[10px] font-bold text-[#4A76C0] hover:underline disabled:cursor-wait disabled:no-underline disabled:opacity-80"
                            aria-label={isDownloading ? `Downloading ${file.name}, ${downloadProgress}%` : `Download ${file.name}`}
                        >
                            {isDownloading
                                ? <><LoaderCircle className="h-3 w-3 animate-spin" /> {downloadProgress}%</>
                                : <><Download className="h-3 w-3" /> Download</>}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onRemove}
                        className="cursor-pointer text-[#64748B] hover:text-red-600"
                        title={isUploading ? "Cancel upload" : "Remove attachment"}
                        aria-label={isUploading ? `Cancel upload of ${file.name}` : `Remove ${file.name}`}
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {isUploading && (
                <div className="mt-1.5"><ProgressBar value={file.progress || 0} label={`Upload progress for ${file.name}`} /></div>
            )}
            {isDownloading && (
                <div className="mt-1.5"><ProgressBar value={downloadProgress} tone="green" label={`Download progress for ${file.name}`} /></div>
            )}
            {downloadError && <p className="mt-1 text-[10px] text-red-600" role="alert">{downloadError}</p>}
        </div>
    );
}

const CustomCheckbox = ({ checked }) => (
    <div className={`relative flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition-all duration-200 shadow-2xs ${checked
        ? "border-[#4A76C0] bg-[#4A76C0] text-white shadow-blue-100"
        : "border-[#E2E8F0] bg-[#FFFFFF] group-hover:border-[#4A76C0] group-hover:bg-[#F8FAFC]"
        }`}>
        <Check className={`h-3.5 w-3.5 text-white transition-transform duration-200 ${checked ? "scale-100 opacity-100" : "scale-0 opacity-0"}`} strokeWidth={3} />
    </div>
);

export default function JobAssignModal({ isOpen, onClose, selectedCompany }) {
    const { ScheduleUsers_ } = useGet({
        currentUser: { role: "admin" },
    });

    const {
        data: scheduleUsersData,
        isLoading: isScheduleUsersLoading,
    } = ScheduleUsers_;

    const [activeTab, setActiveTab] = useState("team");
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

    // ISO 21001 State
    const [isoTask, setIsoTask] = useState({
        taskName: "",
        educationalScope: "",
        learnerRequirements: "",
    });

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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">

            <div className="flex h-[min(96vh,900px)] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-2xl ring-1 ring-slate-900/10">

                {/* ── Header ── */}
                <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-[#FFFFFF] px-6 py-4">
                    <div className="flex items-center gap-3.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#422026] text-[#FFFFFF] shadow-sm">
                            <Building2 className="h-5 w-5 text-[#E87A24]" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-[16px] font-extrabold tracking-tight text-[#1E293B]">
                                    {activeTab === "team" ? "EIMCTA ERP – Individual Task Allocation" : "ISO 21001 Quality Architecture"}
                                </h2>
                                <span className="rounded-md bg-[#4A76C0]/10 border border-[#4A76C0]/30 px-2 py-0.5 text-[10px] font-extrabold text-[#4A76C0] uppercase tracking-wider">
                                    ISO 21001 EOMS
                                </span>
                            </div>
                            <p className="text-[11px] font-medium text-[#64748B]">
                                Client Name: <strong className="text-[#E87A24]">
                                    {typeof selectedCompany === "string"
                                        ? selectedCompany
                                        : selectedCompany?.label || "EIMCTA Client"}
                                </strong>
                            </p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Close task allocation form" className="flex cursor-pointer items-center justify-center rounded-lg p-2 text-[#64748B] transition-colors hover:bg-[#F8FAFC] hover:text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                        <X className="h-5 w-5" strokeWidth={2} />
                    </button>
                </div>

                {/* ── Body Layout ── */}
                <div className="flex flex-1 overflow-hidden bg-[#F8FAFC]">

                    {/* Sidebar Navigation */}
                    <aside className="z-10 flex w-16 shrink-0 flex-col items-center gap-3 border-r border-[#E2E8F0] bg-white py-4">
                        <button
                            type="button"
                            onClick={() => setActiveTab("team")}
                            className={`cursor-pointer rounded-xl p-3 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${activeTab === "team" ? "bg-[#4A76C0] text-[#FFFFFF] shadow-md shadow-blue-100 font-bold" : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]"}`}
                            title="Task & Personnel Allocation"
                            aria-label="Task and personnel allocation"
                            aria-pressed={activeTab === "team"}
                        >
                            <Users className="h-5 w-5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("iso")}
                            className={`cursor-pointer rounded-xl p-3 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${activeTab === "iso" ? "bg-[#4A76C0] text-[#FFFFFF] shadow-md shadow-blue-100 font-bold" : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]"}`}
                            title="ISO 21001 Configuration"
                            aria-label="ISO 21001 configuration"
                            aria-pressed={activeTab === "iso"}
                        >
                            <FileText className="h-5 w-5" />
                        </button>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex flex-1 flex-col overflow-y-auto bg-[#F8FAFC]">
                        {activeTab === "team" && isScheduleUsersLoading && (
                            <div className="flex flex-1 items-center justify-center p-12 bg-[#FFFFFF]">
                                <LoaderCircle className="h-8 w-8 animate-spin text-[#4A76C0]" />
                            </div>
                        )}

                        {activeTab === "team" && !isScheduleUsersLoading && (
                            <div className="flex flex-1 flex-col space-y-6 bg-[#F8FAFC] p-3 sm:p-6">

                                {/* ── UI ORDER STEP 1: Project Leader Selection ── */}
                                <div className="bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] shadow-2xs p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E87A24] text-white font-extrabold text-[11px] shadow-2xs">
                                                1
                                            </div>
                                            <div>
                                                <h3 className="text-[13px] font-extrabold text-[#1E293B]">Project Leader / Executive Head Selection</h3>
                                                <p className="text-[11px] text-[#64748B]">Designate primary management oversight for EIMCTA operations.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {headUser && (
                                        <label className={`group flex cursor-pointer items-center gap-3.5 rounded-xl border p-3 transition-all ${selectedHead ? 'border-[#4A76C0] bg-[#4A76C0]/5 ring-1 ring-[#4A76C0]/30' : 'border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F8FAFC]'
                                            }`}>
                                            <input type="checkbox" className="hidden" checked={selectedHead} onChange={toggleEomsHead} />
                                            <CustomCheckbox checked={selectedHead} />
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#422026] text-[#E87A24] font-bold">
                                                <Crown className="h-4 w-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[12px] font-bold text-[#1E293B]">{headUser.fullname || "Project Leader"}</span>
                                                <span className="text-[10px] font-semibold text-[#4A76C0]">{headUser.jobRole || headUser.role || "Director / Lead"}</span>
                                            </div>
                                        </label>
                                    )}
                                </div>

                                {/* ── UI ORDER STEP 2: Team Member Selection ── */}
                                <div className="bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] shadow-2xs p-4">
                                    <div className="flex items-center gap-2.5 mb-3">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E87A24] text-white font-extrabold text-[11px] shadow-2xs">
                                            2
                                        </div>
                                        <div>
                                            <h3 className="text-[13px] font-extrabold text-[#1E293B]">Team Members & Team Allocation</h3>
                                            <p className="text-[11px] text-[#64748B]">Select participating staff members across organizational departments.</p>
                                        </div>
                                    </div>

                                    <div className="custom-scrollbar overflow-x-auto bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] p-2">
                                        <div className="flex h-full w-max min-w-full divide-x divide-[#E2E8F0]">
                                            {columns.map((col) => {
                                                const searchTerm = searchQueries[col.id] || "";
                                                const filteredMembers = col.members.filter(member =>
                                                    [member.name, member.role, member.officeEmail].join(" ").toLowerCase().includes(searchTerm.trim().toLowerCase())
                                                );
                                                const allChecked = filteredMembers.length > 0 && filteredMembers.every(m => m.checked);

                                                return (
                                                    <div key={col.id} className="mr-2 flex h-full w-68 min-w-60 flex-col overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-2xs">
                                                        <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-[#1E293B]">
                                                            {col.name} <span className="text-[#64748B]">({col.members.length})</span>
                                                        </div>

                                                        <div className="p-2 border-b border-[#E2E8F0] bg-[#FFFFFF]">
                                                            <div className="relative">
                                                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#64748B]" />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Search member..."
                                                                    value={searchQueries[col.id] || ""}
                                                                    onChange={(e) => handleSearch(col.id, e.target.value)}
                                                                    className="w-full rounded-md border border-[#E2E8F0] bg-[#FFFFFF] py-1 pl-8 pr-2 text-[11px] text-[#1E293B] outline-none focus:border-[#4A76C0]"
                                                                />
                                                            </div>
                                                        </div>

                                                        <label className="flex cursor-pointer items-center gap-2 px-3 py-1.5 border-b border-[#E2E8F0] hover:bg-[#F8FAFC]">
                                                            <input type="checkbox" className="hidden" checked={allChecked} onChange={(e) => toggleSelectAll(filteredMembers.map(m => m.id), e.target.checked)} />
                                                            <CustomCheckbox checked={allChecked} />
                                                            <span className="text-[11px] font-bold text-[#1E293B]">Select All</span>
                                                        </label>

                                                        <div className="custom-scrollbar max-h-48 overflow-y-auto p-1.5 space-y-1">
                                                            {filteredMembers.map((member) => (
                                                                <label
                                                                    key={member.id}
                                                                    className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md border transition-all ${member.checked ? 'border-[#4A76C0]/40 bg-[#4A76C0]/5' : 'border-transparent hover:bg-[#F8FAFC]'
                                                                        }`}
                                                                >
                                                                    <input type="checkbox" className="hidden" checked={member.checked} onChange={() => toggleMember(member.id)} />
                                                                    <CustomCheckbox checked={member.checked} />
                                                                    <div className="flex flex-col min-w-0 flex-1">
                                                                        <span className="text-[11px] font-bold truncate text-[#1E293B]">{member.name}</span>
                                                                        <span className="text-[9px] font-semibold truncate text-[#64748B]">{member.role}</span>
                                                                    </div>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* ── UI ORDER STEP 3: Individual Task Assignment for Each Selected User ── */}
                                {hasAnyPersonnelSelected ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2.5 bg-[#FFFFFF] border border-[#E2E8F0] p-3 rounded-xl shadow-2xs">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4A76C0] text-white font-extrabold text-[11px] shadow-2xs">
                                                3
                                            </div>
                                            <div>
                                                <h3 className="text-[14px] font-extrabold text-[#1E293B]">Individual Task Allocation Cards</h3>
                                                <p className="text-[11px] text-[#64748B]">Configure separate task details, services, jobs, dates, and resources for each selected team member.</p>
                                            </div>
                                        </div>

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

                                            return (
                                                <div key={person._id} className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] shadow-sm p-5 space-y-4 transition-all">

                                                    {/* User Header Badge & Minimize/Expand Toggle */}
                                                    <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`flex h-9 w-9 items-center justify-center rounded-full font-bold shadow-2xs ${person.isHead ? "bg-[#422026] text-[#E87A24]" : "bg-[#4A76C0]/10 text-[#4A76C0] border border-[#4A76C0]/30"
                                                                }`}>
                                                                {person.isHead ? <Crown className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}
                                                            </div>
                                                            <div>
                                                                <h4 className="text-[13px] font-extrabold text-[#1E293B]">{person.fullname}</h4>
                                                                <span className="text-[10px] font-semibold text-[#64748B]">{person.jobRole || person.role || "EIMCTA Staff"}</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[10px] font-extrabold uppercase bg-[#F8FAFC] text-[#64748B] px-2.5 py-1 rounded-full border border-[#E2E8F0]">
                                                                {person.isHead ? "Project Leader" : "Team Member"}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleMinimizeAllocation(person._id)}
                                                                className="flex cursor-pointer items-center gap-1 bg-[#F8FAFC] hover:bg-[#E2E8F0] text-[#1E293B] px-3 py-1.5 rounded-lg text-[11px] font-bold border border-[#E2E8F0] transition-colors"
                                                                aria-expanded={!taskData.isMinimized}
                                                                aria-label={`${taskData.isMinimized ? "Expand" : "Minimize"} allocation for ${person.fullname || "worker"}`}
                                                            >
                                                                {taskData.isMinimized ? (
                                                                    <><span>Expand</span> <ChevronDown className="h-3.5 w-3.5" /></>
                                                                ) : (
                                                                    <><span>Minimize</span> <ChevronUp className="h-3.5 w-3.5" /></>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {!taskData.isMinimized && (
                                                        <div className="space-y-4 pt-2 animate-fade-in">
                                                            {/* Service & Job Dropdowns */}
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="flex flex-col gap-1">
                                                                    <label className="text-[10px] font-extrabold uppercase text-[#64748B]">Service Category <span className="text-red-600">*</span></label>
                                                                    <Select
                                                                        styles={selectStyles}
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
                                                                        className={`text-[12px] ${personErrors.service ? "rounded-lg ring-1 ring-red-500" : ""}`}
                                                                    />
                                                                    {personErrors.service && <p className="text-xs text-red-600">{personErrors.service}</p>}
                                                                </div>

                                                                <div className="flex flex-col gap-1">
                                                                    <label className="text-[10px] font-extrabold uppercase text-[#64748B]">Job / Activity <span className="text-red-600">*</span></label>
                                                                    <Select
                                                                        styles={selectStyles}
                                                                        value={taskData.activity}
                                                                        options={activityOptions}
                                                                        onBlur={() => validateAllocationField(person._id, "activity")}
                                                                        onChange={(selectedOption) => updateMemberTaskField(person._id, "activity", selectedOption)}
                                                                        aria-invalid={Boolean(personErrors.activity)}
                                                                        className={`text-[12px] ${personErrors.activity ? "rounded-lg ring-1 ring-red-500" : ""}`}
                                                                    />
                                                                    {personErrors.activity && <p className="text-xs text-red-600">{personErrors.activity}</p>}
                                                                </div>
                                                            </div>

                                                            {/* Date & Time Row (Improved Time Scheduling UX & Duration) */}
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="flex flex-col gap-1">
                                                                    <label className="text-[10px] font-extrabold uppercase text-[#64748B]">Date [Nepali BS] <span className="text-red-600">*</span></label>
                                                                    <Select
                                                                        styles={selectStyles}
                                                                        value={taskData.nepaliDate}
                                                                        options={nepaliDateOptions}
                                                                        onBlur={() => validateAllocationField(person._id, "nepaliDate")}
                                                                        onChange={(selectedOption) => updateMemberTaskField(person._id, "nepaliDate", selectedOption)}
                                                                        aria-invalid={Boolean(personErrors.nepaliDate)}
                                                                        className={`text-[12px] ${personErrors.nepaliDate ? "rounded-lg ring-1 ring-red-500" : ""}`}
                                                                    />
                                                                    {personErrors.nepaliDate && <p className="text-xs text-red-600">{personErrors.nepaliDate}</p>}
                                                                </div>

                                                                <div className="flex flex-col gap-1">
                                                                    <div className="flex items-center justify-between">
                                                                        <label className="text-[10px] font-extrabold uppercase text-[#64748B]">Time Schedule (Start & End) <span className="text-red-600">*</span></label>
                                                                        {workingDuration && !isTimeInvalid && (
                                                                            <span className="text-[10px] font-extrabold text-[#4A76C0] bg-[#4A76C0]/10 px-2 py-0.5 rounded">
                                                                                Duration: {workingDuration}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className={`flex h-9.5 items-center gap-2 rounded-md border bg-white px-3 py-1.5 text-[11px] font-bold transition-all ${isTimeInvalid || personErrors.startTime || personErrors.endTime ? "border-red-400 bg-red-50/50" : "border-[#E2E8F0]"
                                                                        }`}>
                                                                        <Clock className="h-4 w-4 text-[#4A76C0]" />
                                                                        <input
                                                                            type="time"
                                                                            required
                                                                            value={taskData.startTime || ""}
                                                                            onChange={(e) => updateMemberTaskField(person._id, "startTime", e.target.value)}
                                                                            onBlur={() => validateAllocationField(person._id, "startTime")}
                                                                            aria-invalid={Boolean(personErrors.startTime)}
                                                                            className="bg-transparent outline-none w-28 text-[#1E293B]"
                                                                        />
                                                                        <span className="text-[#64748B]">to</span>
                                                                        <input
                                                                            type="time"
                                                                            required
                                                                            value={taskData.endTime || ""}
                                                                            onChange={(e) => updateMemberTaskField(person._id, "endTime", e.target.value)}
                                                                            onBlur={() => validateAllocationField(person._id, "endTime")}
                                                                            aria-invalid={Boolean(personErrors.endTime)}
                                                                            className="bg-transparent outline-none w-28 text-[#1E293B]"
                                                                        />
                                                                    </div>
                                                                    {isTimeInvalid && (
                                                                        <span className="text-[10px] font-bold text-red-600 flex items-center gap-1 mt-0.5">
                                                                            <AlertTriangle className="h-3 w-3 shrink-0" /> End time must be later than start time.
                                                                        </span>
                                                                    )}
                                                                    {!isTimeInvalid && personErrors.endTime && <p className="text-xs text-red-600">{personErrors.endTime}</p>}
                                                                    {personErrors.startTime && <p className="text-xs text-red-600">{personErrors.startTime}</p>}
                                                                </div>
                                                            </div>

                                                            {/* Work Location */}
                                                            <div className="flex flex-col gap-1">
                                                                <label className="text-[10px] font-extrabold uppercase text-[#64748B] flex items-center gap-1">
                                                                    <MapPin className="h-3 w-3 text-[#4A76C0]" /> Work Location
                                                                    <span className="text-red-600">*</span>
                                                                </label>
                                                                <Select
                                                                    styles={selectStyles}
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
                                                                    className={`text-[12px] ${personErrors.workLocation ? "rounded-lg ring-1 ring-red-500" : ""}`}
                                                                />
                                                                {personErrors.workLocation && <p className="text-xs text-red-600">{personErrors.workLocation}</p>}
                                                            </div>

                                                            {/* Work Location & Vehicle Assignment Conditional Logic */}
                                                            {!isInOffice && (
                                                                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-3 animate-fade-in">
                                                                    <div className="flex items-center justify-between">
                                                                        <label className="text-[11px] font-extrabold uppercase text-[#1E293B] flex items-center gap-1.5">
                                                                            <Car className="h-4 w-4 text-[#4A76C0]" /> Vehicle Assignment (Outside Office)
                                                                        </label>
                                                                        <span className="text-[10px] font-bold text-[#64748B]">
                                                                            {vehicleCapacity !== null ? `Capacity: ${vehicleCapacity} persons` : "Public Transit"}
                                                                        </span>
                                                                    </div>

                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                        <div className="flex flex-col gap-1">
                                                                            <label className="text-[10px] font-extrabold uppercase text-[#64748B]">Vehicle Selection <span className="text-red-600">*</span></label>
                                                                            <Select
                                                                                styles={selectStyles}
                                                                                value={taskData.vehicle}
                                                                                options={vehicleOptions}
                                                                                onBlur={() => validateAllocationField(person._id, "vehicle")}
                                                                                onChange={(selectedOption) => updateMemberTaskField(person._id, "vehicle", selectedOption)}
                                                                                aria-invalid={Boolean(personErrors.vehicle)}
                                                                                className={`text-[12px] ${personErrors.vehicle ? "rounded-lg ring-1 ring-red-500" : ""}`}
                                                                            />
                                                                            {personErrors.vehicle && <p className="text-xs text-red-600">{personErrors.vehicle}</p>}
                                                                        </div>
                                                                        <div className="flex flex-col gap-1">
                                                                            <label className="text-[10px] font-extrabold uppercase text-[#64748B]">Vehicle Registration / Details</label>
                                                                            <input
                                                                                type="text"
                                                                                placeholder="Enter vehicle registration number/details..."
                                                                                value={taskData.vehicleRegistrationNo || ""}
                                                                                onChange={(e) => updateMemberTaskField(person._id, "vehicleRegistrationNo", e.target.value)}
                                                                                className="h-9.5 w-full rounded-lg border border-[#E2E8F0] bg-white p-2 text-[12px] text-[#1E293B] outline-none focus:border-[#4A76C0]"
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    {/* Travelling Workers Selection & Seating Capacity Validation */}
                                                                    <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
                                                                        <div className="flex items-center justify-between text-[11px]">
                                                                            <span className="font-extrabold text-[#1E293B]">Travelling Team Members (Excluding Primary Worker)</span>
                                                                            <span className="font-bold text-[#4A76C0]">
                                                                                Selected: {totalTravellingCount} / {vehicleCapacity !== null ? vehicleCapacity : "∞"} seats
                                                                            </span>
                                                                        </div>

                                                                        <Select
                                                                            styles={selectStyles}
                                                                            isMulti
                                                                            value={users.filter(u => (taskData.travellingWorkers || []).includes(u._id)).map(u => ({ value: u._id, label: `${u.fullname} (${u.jobRole || u.role || "Staff"})` }))}
                                                                            options={users.filter(u => u._id !== person._id).map(u => ({ value: u._id, label: `${u.fullname} (${u.jobRole || u.role || "Staff"})` }))}
                                                                            onChange={(selectedOpts) => updateMemberTaskField(person._id, "travellingWorkers", (selectedOpts || []).map(o => o.value))}
                                                                            placeholder="Select additional travelling workers..."
                                                                            className="text-[12px]"
                                                                        />

                                                                        <div className="flex items-center justify-between text-[10px] font-bold text-[#64748B] bg-[#FFFFFF] px-3 py-1.5 rounded-lg border border-[#E2E8F0]">
                                                                            <span>Primary Worker: <strong>{person.fullname}</strong> (occupies 1 seat)</span>
                                                                            <span>Available Seats: <strong className="text-[#4A76C0]">{availableSeats}</strong></span>
                                                                        </div>

                                                                        {isVehicleOverloaded && (
                                                                            <p className="text-[10px] text-[#422026] bg-amber-50 p-2 rounded-lg border border-amber-200 font-bold flex items-center gap-1.5">
                                                                                <AlertTriangle className="h-4 w-4 text-[#E87A24] shrink-0" />
                                                                                Selected workers ({totalTravellingCount}) exceed vehicle capacity ({vehicleCapacity}). Please adjust seating.
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Assistance Worker Assignment (Individual Note & Attachment Sections) */}
                                                            <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-3">
                                                                <div className="flex items-center justify-between">
                                                                    <label className="text-[11px] font-extrabold uppercase text-[#1E293B] flex items-center gap-1.5">
                                                                        <Users className="h-4 w-4 text-[#4A76C0]" /> Assistance Workers Assignment
                                                                    </label>
                                                                    <div className="flex items-center gap-4">
                                                                        <label className="flex items-center gap-1.5 cursor-pointer text-[12px] font-bold text-[#1E293B]">
                                                                            <input
                                                                                type="radio"
                                                                                name={`assistance-${person._id}`}
                                                                                checked={Boolean(taskData.requiresAssistance)}
                                                                                onChange={() => updateMemberTaskField(person._id, "requiresAssistance", true)}
                                                                                className="accent-[#4A76C0]"
                                                                            /> Yes
                                                                        </label>
                                                                        <label className="flex items-center gap-1.5 cursor-pointer text-[12px] font-bold text-[#1E293B]">
                                                                            <input
                                                                                type="radio"
                                                                                name={`assistance-${person._id}`}
                                                                                checked={!taskData.requiresAssistance}
                                                                                onChange={() => {
                                                                                    updateMemberTaskField(person._id, "requiresAssistance", false);
                                                                                    updateMemberTaskField(person._id, "assistanceWorkers", []);
                                                                                }}
                                                                                className="accent-[#4A76C0]"
                                                                            /> No
                                                                        </label>
                                                                    </div>
                                                                </div>

                                                                {taskData.requiresAssistance && (
                                                                    <div className="space-y-3 pt-2 border-t border-[#E2E8F0] animate-fade-in">
                                                                        <div className="flex flex-col gap-1">
                                                                            <label className="text-[10px] font-extrabold uppercase text-[#64748B]">
                                                                                Select Assistance Team Members {taskData.requiresAssistance && <span className="text-red-600">*</span>}
                                                                            </label>
                                                                            <Select
                                                                                styles={selectStyles}
                                                                                isMulti
                                                                                value={(taskData.assistanceWorkers || []).map(aw => ({ value: aw.workerId, label: `${aw.workerName} (${aw.workerRole})` }))}
                                                                                options={assistanceWorkerOptions}
                                                                                onBlur={() => {
                                                                                    if (taskData.requiresAssistance) validateAllocationField(person._id, "assistanceWorkers");
                                                                                }}
                                                                                onChange={(selectedOptions) => handleAssistanceWorkersChange(person._id, selectedOptions)}
                                                                                placeholder="Select assistance workers..."
                                                                                aria-invalid={Boolean(personErrors.assistanceWorkers)}
                                                                                className={`text-[12px] ${personErrors.assistanceWorkers ? "rounded-lg ring-1 ring-red-500" : ""}`}
                                                                            />
                                                                            {personErrors.assistanceWorkers && <p className="text-xs text-red-600">{personErrors.assistanceWorkers}</p>}
                                                                        </div>

                                                                        {/* Individual Assistance Worker Detail Sections */}
                                                                        {taskData.assistanceWorkers?.length > 0 && (
                                                                            <div className="space-y-3 pt-2">
                                                                                <span className="text-[11px] font-extrabold text-[#1E293B]">Individual Assistance Worker Details ({taskData.assistanceWorkers.length})</span>

                                                                                {taskData.assistanceWorkers.map((awItem, awIdx) => (
                                                                                    <div key={awItem.workerId} className="bg-[#FFFFFF] p-3.5 rounded-xl border border-[#E2E8F0] space-y-2.5 shadow-2xs">
                                                                                        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                                                                                            <div className="flex items-center gap-2">
                                                                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4A76C0]/10 text-[#4A76C0] font-extrabold text-[10px]">
                                                                                                    {awIdx + 1}
                                                                                                </span>
                                                                                                <div>
                                                                                                    <h5 className="text-[12px] font-extrabold text-[#1E293B]">{awItem.workerName}</h5>
                                                                                                    <span className="text-[9px] font-semibold text-[#64748B]">{awItem.workerRole}</span>
                                                                                                </div>
                                                                                            </div>
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => removeAssistanceWorker(person._id, awItem.workerId)}
                                                                                                className="cursor-pointer text-[#64748B] hover:text-red-600 text-[11px] font-bold flex items-center gap-1"
                                                                                            >
                                                                                                <Trash2 className="h-3.5 w-3.5" /> Remove
                                                                                            </button>
                                                                                        </div>

                                                                                        <NoteField
                                                                                            label={`Note for ${awItem.workerName}`}
                                                                                            value={awItem.note}
                                                                                            onSave={(note) => updateAssistanceWorkerField(person._id, awItem.workerId, "note", note)}
                                                                                            placeholder="Enter instructions or notes for this assistance worker..."
                                                                                            rows={2}
                                                                                        />

                                                                                        <div className="space-y-1.5 pt-1">
                                                                                            <div className="flex items-center justify-between">
                                                                                                <span className="text-[10px] font-extrabold uppercase text-[#64748B] flex items-center gap-1">
                                                                                                    <Paperclip className="h-3.5 w-3.5 text-[#4A76C0]" /> Individual Attachments
                                                                                                </span>
                                                                                                <label className="cursor-pointer inline-flex items-center gap-1 bg-[#F8FAFC] hover:bg-[#E2E8F0] text-[#1E293B] px-2.5 py-1 rounded-md text-[11px] font-bold border border-[#E2E8F0] transition-all focus-within:ring-2 focus-within:ring-blue-500">
                                                                                                    <Plus className="h-3 w-3 text-[#4A76C0]" />
                                                                                                    <span>Upload File</span>
                                                                                                    <input
                                                                                                        type="file"
                                                                                                        multiple
                                                                                                        className="sr-only"
                                                                                                        onChange={(e) => handleAssistanceWorkerFileUpload(person._id, awItem.workerId, e)}
                                                                                                    />
                                                                                                </label>
                                                                                            </div>

                                                                                            {assistanceFileErrors[`${person._id}:${awItem.workerId}`] && (
                                                                                                <p className="text-xs text-red-600" role="alert">{assistanceFileErrors[`${person._id}:${awItem.workerId}`]}</p>
                                                                                            )}

                                                                                            {awItem.attachments?.length > 0 && (
                                                                                                <div className="space-y-1.5">
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
                                                            <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-2xs">
                                                                <NoteField
                                                                    label={`Task note for ${person.fullname || "this worker"}`}
                                                                    value={taskData.note}
                                                                    onSave={(note) => updateMemberTaskField(person._id, "note", note)}
                                                                    placeholder="Enter task notes, instructions, or specific remarks..."
                                                                />
                                                            </div>

                                                            {/* ── 4. RESOURCES MANAGEMENT ── */}
                                                            <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-3">
                                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                                    <label className="text-[11px] font-extrabold uppercase text-[#1E293B] flex items-center gap-1.5">
                                                                        <Package className="h-4 w-4 text-[#4A76C0]" /> Resources & Independent File Attachments
                                                                    </label>
                                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-[#64748B]">
                                                                        {resourcesUploading > 0 && (
                                                                            <span className="inline-flex items-center gap-1 rounded-full bg-[#4A76C0]/10 px-2 py-0.5 text-[#4A76C0]" role="status">
                                                                                <LoaderCircle className="h-3 w-3 animate-spin" /> Uploading {resourcesUploading} file{resourcesUploading === 1 ? "" : "s"}…
                                                                            </span>
                                                                        )}
                                                                        <span>{resourceList.length} resource{resourceList.length === 1 ? "" : "s"} · {totalResourceFiles} file{totalResourceFiles === 1 ? "" : "s"}</span>
                                                                    </div>
                                                                </div>

                                                                {/* Add New Resource: name | description (1 × 2 grid) */}
                                                                <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-3 shadow-2xs space-y-3">
                                                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                                                        <div className="flex flex-col gap-1">
                                                                            <label htmlFor={`new-res-name-${person._id}`} className="text-[10px] font-extrabold uppercase text-[#64748B]">
                                                                                Resource name <span className="text-red-600">*</span>
                                                                            </label>
                                                                            <input
                                                                                id={`new-res-name-${person._id}`}
                                                                                ref={(el) => { newResourceNameRefs.current[person._id] = el; }}
                                                                                type="text"
                                                                                placeholder="e.g., Projector"
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
                                                                                className={`h-9.5 w-full rounded-lg border bg-white p-2 text-[12px] text-[#1E293B] outline-none focus:border-[#4A76C0] focus:ring-2 focus:ring-blue-100 ${resourceErrors[person._id] ? "border-red-500" : "border-[#E2E8F0]"}`}
                                                                            />
                                                                        </div>
                                                                        <div className="flex flex-col gap-1">
                                                                            <label htmlFor={`new-res-note-${person._id}`} className="text-[10px] font-extrabold uppercase text-[#64748B]">
                                                                                Description <span className="font-medium normal-case text-slate-400">(optional)</span>
                                                                            </label>
                                                                            <textarea
                                                                                id={`new-res-note-${person._id}`}
                                                                                rows={1}
                                                                                placeholder="What is it for? Any details to remember"
                                                                                value={taskData.newResourceNote || ""}
                                                                                onChange={(e) => updateMemberTaskField(person._id, "newResourceNote", e.target.value)}
                                                                                className="min-h-9.5 w-full resize-y rounded-lg border border-[#E2E8F0] bg-white p-2 text-[12px] text-[#1E293B] outline-none placeholder:text-slate-400 focus:border-[#4A76C0] focus:ring-2 focus:ring-blue-100"
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    {/* Quick picks */}
                                                                    {QUICK_RESOURCES.some(name => !resourceList.some(r => r.name.trim().toLowerCase() === name.toLowerCase())) && (
                                                                        <div className="flex flex-wrap items-center gap-1.5">
                                                                            <span className="text-[10px] font-bold text-[#64748B]">Quick add:</span>
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
                                                                                        className="cursor-pointer rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-0.5 text-[10px] font-bold text-[#1E293B] transition-colors hover:border-[#4A76C0] hover:bg-[#4A76C0]/10"
                                                                                    >
                                                                                        + {name}
                                                                                    </button>
                                                                                ))}
                                                                        </div>
                                                                    )}

                                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                                        <span className="text-[11px] text-slate-500">Press Enter in the name field to add quickly.</span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleAddResource(person._id)}
                                                                            className="flex h-9.5 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#4A76C0] hover:bg-[#3b5f9e] text-white text-[12px] font-extrabold px-4 transition-all shadow-2xs"
                                                                        >
                                                                            <Plus className="h-4 w-4" /> Add Resource
                                                                        </button>
                                                                    </div>
                                                                    {resourceErrors[person._id] && (
                                                                        <p className="text-xs text-red-600" role="alert">{resourceErrors[person._id]}</p>
                                                                    )}
                                                                </div>

                                                                {personErrors.resources && (
                                                                    <p className="flex items-start gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700" role="alert">
                                                                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {personErrors.resources}
                                                                    </p>
                                                                )}

                                                                {/* Search (only useful once there is something to search) */}
                                                                {resourceList.length > 1 && (
                                                                    <div className="relative">
                                                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#64748B]" />
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Search resources by name, description, or filename..."
                                                                            aria-label="Search resources"
                                                                            value={resourceSearchQueries[person._id] || ""}
                                                                            onChange={(e) => setResourceSearchQueries(prev => ({ ...prev, [person._id]: e.target.value }))}
                                                                            className="w-full rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] py-2 pl-9 pr-9 text-[12px] text-[#1E293B] outline-none focus:border-[#4A76C0] shadow-2xs"
                                                                        />
                                                                        {resourceSearchQueries[person._id] && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setResourceSearchQueries(prev => ({ ...prev, [person._id]: "" }))}
                                                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer rounded p-0.5 text-[#64748B] hover:text-[#1E293B]"
                                                                                aria-label="Clear resource search"
                                                                            >
                                                                                <X className="h-3.5 w-3.5" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                {resSearchQuery && resourceList.length > 1 && (
                                                                    <p className="text-[11px] text-[#64748B]" role="status">Showing {filteredResources.length} of {resourceList.length}</p>
                                                                )}

                                                                {/* Resource list (limited height, scrolls internally) */}
                                                                <div className="custom-scrollbar max-h-[34rem] overflow-y-auto space-y-3 pr-1 pt-1">
                                                                    {filteredResources.length === 0 ? (
                                                                        <div className="p-6 text-center text-[#64748B] text-[12px] bg-[#FFFFFF] rounded-xl border border-dashed border-[#CBD5E1]">
                                                                            {resourceList.length === 0
                                                                                ? "No resources yet. Add one above or pick a quick-add suggestion."
                                                                                : "No resources match your search."}
                                                                        </div>
                                                                    ) : (
                                                                        filteredResources.map(({ res: resItem, index }) => {
                                                                            const fileKey = `${person._id}:${resItem.id}`;
                                                                            const fileCount = resItem.files?.length || 0;
                                                                            const nameMissing = !resItem.name.trim();
                                                                            const uploadingHere = (resItem.files || []).filter(f => f.status === "Uploading").length;
                                                                            const isFull = fileCount >= MAX_FILES_PER_RESOURCE;
                                                                            const isDragging = dragTarget === fileKey;

                                                                            return (
                                                                                <div key={resItem.id} className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-2xs">

                                                                                    {/* Header */}
                                                                                    <div className="flex items-center justify-between gap-2 border-b border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2">
                                                                                        <div className="flex min-w-0 items-center gap-2">
                                                                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#422026] text-[#E87A24] font-extrabold text-[11px]">
                                                                                                {index + 1}
                                                                                            </span>
                                                                                            <span className={`truncate text-[12px] font-extrabold ${nameMissing ? "text-red-600" : "text-[#1E293B]"}`}>
                                                                                                {resItem.name.trim() || "Untitled resource"}
                                                                                            </span>
                                                                                        </div>
                                                                                        <div className="flex shrink-0 items-center gap-2">
                                                                                            {uploadingHere > 0 && (
                                                                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#4A76C0]">
                                                                                                    <LoaderCircle className="h-3 w-3 animate-spin" /> Uploading…
                                                                                                </span>
                                                                                            )}
                                                                                            <span className="text-[10px] font-bold bg-[#4A76C0]/10 text-[#4A76C0] px-2 py-0.5 rounded">
                                                                                                {fileCount} / {MAX_FILES_PER_RESOURCE} Files
                                                                                            </span>
                                                                                            {pendingDelete === fileKey ? (
                                                                                                <div className="flex items-center gap-1.5 text-[10px] font-bold">
                                                                                                    <span className="text-red-600">
                                                                                                        Delete{fileCount > 0 ? ` with ${fileCount} file${fileCount === 1 ? "" : "s"}` : ""}?
                                                                                                    </span>
                                                                                                    <button
                                                                                                        type="button"
                                                                                                        onClick={() => removeResourceItem(person._id, resItem.id)}
                                                                                                        className="cursor-pointer rounded bg-red-600 px-2 py-0.5 text-white hover:bg-red-700"
                                                                                                    >
                                                                                                        Yes
                                                                                                    </button>
                                                                                                    <button
                                                                                                        type="button"
                                                                                                        onClick={() => setPendingDelete("")}
                                                                                                        className="cursor-pointer rounded border border-[#E2E8F0] bg-white px-2 py-0.5 text-[#1E293B] hover:bg-[#F8FAFC]"
                                                                                                    >
                                                                                                        No
                                                                                                    </button>
                                                                                                </div>
                                                                                            ) : (
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={() => requestDeleteResource(person._id, resItem)}
                                                                                                    className="cursor-pointer rounded p-1 text-[#64748B] hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                                                                                                    title="Delete resource"
                                                                                                    aria-label={`Delete ${resItem.name || `resource ${index + 1}`}`}
                                                                                                >
                                                                                                    <Trash2 className="h-4 w-4" />
                                                                                                </button>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="space-y-3 p-3.5">
                                                                                        {/* Name | Description (1 × 2 grid) */}
                                                                                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:items-start">
                                                                                            <div className="flex flex-col gap-1">
                                                                                                <label htmlFor={`res-name-${person._id}-${resItem.id}`} className="text-[10px] font-extrabold uppercase text-[#64748B]">
                                                                                                    Resource name <span className="text-red-600">*</span>
                                                                                                </label>
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
                                                                                                    className={`h-9.5 w-full rounded-lg border bg-white p-2 text-[12px] font-semibold text-[#1E293B] outline-none focus:border-[#4A76C0] focus:ring-2 focus:ring-blue-100 ${nameMissing ? "border-red-400" : "border-[#E2E8F0]"}`}
                                                                                                />
                                                                                                {nameMissing && <p className="text-[11px] text-red-600">A name is required.</p>}
                                                                                            </div>
                                                                                            <NoteField
                                                                                                label="Description"
                                                                                                value={resItem.note}
                                                                                                onSave={(note) => updateResourceField(person._id, resItem.id, "note", note)}
                                                                                                placeholder="Enter a description for this resource..."
                                                                                                rows={2}
                                                                                            />
                                                                                        </div>

                                                                                        {/* Attachments */}
                                                                                        <div className="flex flex-col gap-2">
                                                                                            <span className="text-[10px] font-extrabold uppercase text-[#64748B] flex items-center gap-1">
                                                                                                <Paperclip className="h-3.5 w-3.5 text-[#4A76C0]" /> Attachments
                                                                                            </span>

                                                                                            {!isFull ? (
                                                                                                <label
                                                                                                    onDragOver={(e) => { e.preventDefault(); setDragTarget(fileKey); }}
                                                                                                    onDragLeave={() => setDragTarget(prev => (prev === fileKey ? "" : prev))}
                                                                                                    onDrop={(e) => handleResourceFileDrop(person._id, resItem.id, e)}
                                                                                                    className={`flex cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg border-2 border-dashed px-3 py-4 text-center transition-colors focus-within:ring-2 focus-within:ring-blue-500 ${isDragging
                                                                                                        ? "border-[#4A76C0] bg-[#4A76C0]/10"
                                                                                                        : "border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#4A76C0] hover:bg-[#4A76C0]/5"}`}
                                                                                                >
                                                                                                    <Upload className="h-4 w-4 text-[#4A76C0]" />
                                                                                                    <span className="text-[11px] font-bold text-[#1E293B]">
                                                                                                        {isDragging ? "Drop to upload" : <>Drag files here or <span className="text-[#4A76C0] underline">browse</span></>}
                                                                                                    </span>
                                                                                                    <span className="text-[10px] text-[#64748B]">
                                                                                                        {MAX_FILES_PER_RESOURCE - fileCount} of {MAX_FILES_PER_RESOURCE} slots free · up to 50 MB each
                                                                                                    </span>
                                                                                                    <input
                                                                                                        type="file"
                                                                                                        multiple
                                                                                                        className="sr-only"
                                                                                                        onChange={(e) => handleResourceFileUpload(person._id, resItem.id, e)}
                                                                                                    />
                                                                                                </label>
                                                                                            ) : (
                                                                                                <p className="rounded-lg bg-slate-100 px-3 py-2 text-center text-[11px] font-medium text-slate-600">
                                                                                                    Attachment limit reached ({MAX_FILES_PER_RESOURCE} of {MAX_FILES_PER_RESOURCE}). Remove a file to add another.
                                                                                                </p>
                                                                                            )}

                                                                                            {resourceFileErrors[fileKey] && (
                                                                                                <p className="flex items-start gap-1 text-xs text-red-600" role="alert">
                                                                                                    <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" /> {resourceFileErrors[fileKey]}
                                                                                                </p>
                                                                                            )}

                                                                                            {fileCount > 0 && (
                                                                                                <div className="space-y-1.5">
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

                                                            {/* Conflict Check Status */}
                                                            <div>
                                                                {conflictBooking ? (
                                                                    <div className="flex items-center gap-1.5 text-[#422026] bg-amber-50 border border-amber-300 px-3 py-1.5 rounded-lg text-[11px] font-bold">
                                                                        <ShieldAlert className="h-4 w-4 text-[#E87A24] shrink-0" />
                                                                        <span>Conflict Detected: {person.fullname} is already booked on {conflictBooking.nepaliDate} from {conflictBooking.startTime} to {conflictBooking.endTime} ({conflictBooking.taskName})!</span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-[11px] font-bold">
                                                                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                                                        <span>No Scheduling Conflicts on {taskData.nepaliDate?.label}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white p-6 text-center text-sm text-slate-600">
                                        <Info className="h-4 w-4 shrink-0 text-blue-600" />
                                        <span>Please select the <strong>Project Leader</strong> or at least one <strong>Team Member</strong> above to unlock individual task allocations.</span>
                                    </div>
                                )}

                            </div>
                        )}

                        {activeTab === "iso" && (
                            <div className="h-full max-w-3xl overflow-y-auto bg-[#F8FAFC] p-4 sm:p-8">
                                <div className="space-y-6 bg-[#FFFFFF] p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
                                    <div className="border-b border-[#E2E8F0] pb-3">
                                        <h3 className="text-base font-extrabold text-[#1E293B] tracking-tight">ISO 21001 Quality Architecture Parameters</h3>
                                        <p className="text-[12px] text-[#64748B] mt-1">Configure EOMS requirements for educational organization management systems.</p>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider">Educational Task Identity</label>
                                        <input
                                            type="text"
                                            value={isoTask.taskName}
                                            onChange={(e) => setIsoTask({ ...isoTask, taskName: e.target.value })}
                                            placeholder="e.g. Executive Curriculum Audit"
                                            className="w-full rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-4 py-2.5 text-[12px] text-[#1E293B] outline-none focus:border-[#4A76C0]"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider">Educational Scope</label>
                                        <input
                                            type="text"
                                            value={isoTask.educationalScope}
                                            onChange={(e) => setIsoTask({ ...isoTask, educationalScope: e.target.value })}
                                            placeholder="Specify departments or target learner groups..."
                                            className="w-full rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-4 py-2.5 text-[12px] text-[#1E293B] outline-none focus:border-[#4A76C0]"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider">Learner Requirements & Adjustments</label>
                                        <textarea
                                            rows={4}
                                            value={isoTask.learnerRequirements}
                                            onChange={(e) => setIsoTask({ ...isoTask, learnerRequirements: e.target.value })}
                                            placeholder="Detail accessibility needs and compliance parameters..."
                                            className="w-full resize-none rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-4 py-3 text-[12px] text-[#1E293B] outline-none focus:border-[#4A76C0] leading-relaxed"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>

                {/* ── Footer ── */}
                <div className="flex flex-col gap-3 border-t border-[#E2E8F0] bg-[#FFFFFF] px-4 py-4 text-[#1E293B] sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4A76C0] text-[12px] font-extrabold text-white shadow-sm">
                            {selectedPersonnel.length}
                        </div>
                        <span className="text-[12px] font-bold text-[#64748B]">
                            Personnel with individual task allocations configured.
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-3">
                        {formError && <p className="self-center text-xs font-medium text-red-600" role="alert">{formError}</p>}
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-10 cursor-pointer rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-5 text-[12px] font-bold text-[#64748B] transition-colors hover:bg-[#E2E8F0] hover:text-[#1E293B]"
                        >
                            <span className="inline-flex items-center gap-1.5"><X className="h-4 w-4" /> Cancel</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleTaskSubmit}
                            className="h-10 cursor-pointer rounded-lg bg-[#4A76C0] px-6 text-[12px] font-extrabold text-white shadow-md shadow-blue-100 transition-all hover:bg-[#3b5f9e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        >
                            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> Confirm & Submit Task Allocations</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}