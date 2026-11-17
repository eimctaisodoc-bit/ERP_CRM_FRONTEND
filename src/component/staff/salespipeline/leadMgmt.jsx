
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import {
    AlertCircle, AlertTriangle, ArrowDown, ArrowUp, ArrowUpDown, BellRing, Building2, CalendarCheck, CalendarClock, CalendarDays, CalendarPlus, Check, CheckCircle2, ChevronLeft, ChevronRight, ClipboardList, Clock, Download, ExternalLink, Eye, Filter, Globe, Headset, History, Info, Link2, Loader2, Mail, MapPin, Pencil, Phone, Plus, Save, Search, SearchX, Sparkles, Target, Trash2, TrendingDown, TrendingUp, UserCheck, UserPlus, UserRound, Users, Video, X, XCircle,
} from "lucide-react";



const leadType = [
    { label: "Inbound (Client Contacted You)", value: "inbound" },
    { label: "Outbound (You Contacted Client)", value: "outbound" },
    { label: "Cold Lead", value: "cold_lead" },
    { label: "Warm Lead", value: "warm_lead" },
    { label: "Hot Lead", value: "hot_lead" },
    { label: "Existing Client", value: "existing_client" },
    { label: "Referred Lead", value: "referred_lead" },
];

const LeadSource = [
    { label: "Website", value: "website" },
    { label: "Facebook", value: "facebook" },
    { label: "TikTok", value: "tiktok" },
    { label: "Instagram", value: "instagram" },
    { label: "Email Campaign", value: "email_campaign" },
    { label: "Cold Calling", value: "cold_calling" },
    { label: "Partner / Consultant", value: "partner_consultant" },
    { label: "Referral", value: "referral" },
    { label: "Digital Marketing", value: "digital_marketing" },
];

const BusinessRole = [
    { label: "Owner / Founder", value: "owner_founder" },
    { label: "CEO / Managing Director", value: "ceo_md" },
    { label: "Director", value: "director" },
    { label: "General Manager", value: "general_manager" },
    { label: "Operations Manager", value: "operations_manager" },
    { label: "Quality Manager", value: "quality_manager" },
    { label: "HR Manager", value: "hr_manager" },
    { label: "Safety Officer / HSE Manager", value: "hse_manager" },
    { label: "IT Manager", value: "it_manager" },
    { label: "Finance / Accounts Manager", value: "finance_manager" },
    { label: "Procurement / Purchase Manager", value: "procurement_manager" },
    { label: "Project Manager", value: "project_manager" },
    { label: "Supervisor / Team Leader", value: "supervisor_team_lead" },
    { label: "Chairman / Chairperson", value: "chairman" },
    { label: "Other", value: "other" },
];

const LeadChannel = [
    { label: "Client Phone Call", value: "client_phone_call" },
    { label: "EIMCTA Phone Call", value: "eimcta_phone_call" },
    { label: "WhatsApp", value: "whatsapp" },
    { label: "Messenger", value: "messanger" },
    { label: "Referral", value: "referral" },
    { label: "Facebook Boosting", value: "boostingfb" },
    { label: "Email", value: "email" },
    { label: "Google Form", value: "googleForm" },
    { label: "LinkedIn", value: "linkedin" },
    { label: "TikTok", value: "tiktok" },
    { label: "Instagram", value: "instagram" },
    { label: "YouTube", value: "youtube" },
    { label: "In-Person Meeting", value: "in_person_meeting" },
];

const organizationType = [
    { label: "Private Limited", value: "private_limited" },
    { label: "Government", value: "government" },
    { label: "NGO / Non-Profit", value: "ngo_non_profit" },
    { label: "Community-Based Organization", value: "community_based_organization" },
    { label: "Public-Private Partnership (PPP)", value: "ppp" },
    { label: "Semi-Government Organization", value: "semi_government" },
];

const servicesInterested = [
    { label: "ISO 9001:2015 QMS", value: "iso9001", color: "#3b82f6" },
    { label: "ISO 14001:2015 EMS", value: "iso14001", color: "#10b981" },
    { label: "ISO 45001:2018 OHSMS", value: "iso45001", color: "#ef4444" },
    { label: "ISO 27001:2022 ISMS", value: "iso27001", color: "#f59e0b" },
    { label: "ISO 22000:2018 FSMS", value: "iso22000", color: "#f97316" },
    { label: "HACCP Certification", value: "haccp", color: "#ea580c" },
    { label: "HALAL Certification", value: "halal", color: "#16a34a" },
    { label: "ISO 15189:2022 Medical Laboratory QMS", value: "iso15189", color: "#8b5cf6" },
    { label: "GMP", value: "gmp", color: "#0ea5e9" },
    { label: "ISO 50001:2018 EnMS", value: "iso50001", color: "#06b6d4" },
    { label: "ISO 21001:2025 EOMS", value: "iso21001", color: "#6366f1" },
    { label: "ISO 55001:2024 Asset Management", value: "iso55001", color: "#64748b" },
    { label: "ISO 41001:2018 Facility Management", value: "iso41001", color: "#475569" },
    { label: "SMETA Sedex Audits", value: "smeta", color: "#ec4899" },
    { label: "RBA Compliance", value: "rba", color: "#1e3a8a" },
    { label: "CE Marking", value: "ce_marking", color: "#1d4ed8" },
    { label: "ISO 26000:2010 Social Responsibility", value: "iso26000", color: "#d946ef" },
    { label: "Training Programs", value: "training_programs", color: "#f43f5e" },
    { label: "Third Party Audits", value: "third_party_audits", color: "#000000" },
];

const serviceMap = Object.fromEntries(servicesInterested.map((s) => [s.value, s]));

// ---------------------------------------------------------------
// NEW OPTIONS (module additions)
// ---------------------------------------------------------------

// Nepal's seven provinces (static, stable). Districts / local levels come from
// the `locationData` prop – see LeadForm.jsx.
const provinces = [
    "Koshi", "Madhesh", "Bagmati", "Gandaki", "Lumbini", "Karnali", "Sudurpashchim",
].map((p) => ({ label: p, value: p }));

const MEETING_PURPOSES = [
    { label: "Initial Discussion", value: "initial_discussion" },
    { label: "Requirement Gathering", value: "requirement_gathering" },
    { label: "Proposal / Quotation Presentation", value: "proposal_presentation" },
    { label: "Gap Analysis Discussion", value: "gap_analysis" },
    { label: "Negotiation & Contract", value: "negotiation_contract" },
    { label: "Follow-up Meeting", value: "follow_up_meeting" },
    { label: "Site Visit", value: "site_visit" },
];

// Lead lifecycle. Meeting-driven statuses are set automatically by the workflow.
const LEAD_STATUS = {
    new: { label: "New", cls: "bg-[#4A76C0]/10 text-[#4A76C0] border-[#4A76C0]/25" },
    follow_up: { label: "Follow-up", cls: "bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]/40" },
    meeting_scheduled: { label: "Meeting Scheduled", cls: "bg-[#E87A24]/10 text-[#C2410C] border-[#E87A24]/30" },
    meeting_completed: { label: "Meeting Completed", cls: "bg-violet-50 text-violet-700 border-violet-200" },
    converted: { label: "Converted", cls: "bg-[#16A34A]/10 text-[#15803D] border-[#16A34A]/25" },
    lost: { label: "Lost", cls: "bg-[#DC2626]/10 text-[#B91C1C] border-[#DC2626]/25" },
};

// Pseudo-status used by the stats card / filter.
const FOLLOW_UP_DUE = "follow_up_due";

const statusFilterOptions = [
    ...Object.entries(LEAD_STATUS).map(([value, m]) => ({ value, label: m.label })),
    { value: FOLLOW_UP_DUE, label: "Follow-up Pending (due)" },
];

// Statuses a user may set by hand. Meeting statuses are driven by meetings.
const MANUAL_STATUS_OPTIONS = ["new", "follow_up", "converted", "lost"].map((v) => ({
    value: v,
    label: LEAD_STATUS[v].label,
}));

const MEETING_STATUS = {
    scheduled: { label: "Scheduled", cls: "bg-[#4A76C0]/10 text-[#4A76C0] border-[#4A76C0]/25" },
    completed: { label: "Completed", cls: "bg-[#16A34A]/10 text-[#15803D] border-[#16A34A]/25" },
    rescheduled: { label: "Rescheduled", cls: "bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]/40" },
    cancelled: { label: "Cancelled", cls: "bg-[#DC2626]/10 text-[#B91C1C] border-[#DC2626]/25" },
};

const ACTIVE_MEETING = ["scheduled", "rescheduled"];
const CLOSED_LEAD = ["converted", "lost"];

const labelOf = (options = [], value) =>
    (value && options.find((o) => o.value === value)?.label) || value || "—";

// ===============================================================
// leadUtils.js
// ===============================================================
// ---------- dates (local time, so Nepal midnight doesn't shift the day) ----------
const pad = (n) => String(n).padStart(2, "0");
const toDateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayStr = () => toDateStr(new Date());
const addDays = (n) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return toDateStr(d);
};
const parseDate = (s) => {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
};
const fmtDate = (s) =>
    s
        ? parseDate(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : "—";
const fmtTime = (t) => {
    if (!t) return "";
    const [h, m] = t.split(":").map(Number);
    return `${h % 12 || 12}:${pad(m)} ${h >= 12 ? "PM" : "AM"}`;
};
const fmtDateTime = (iso) =>
    iso
        ? new Date(iso).toLocaleString("en-GB", {
            day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
        })
        : "—";

// ---------- labels ----------
const makeLabeler = (lookups) => {
    const maps = {
        leadType,
        leadSource: LeadSource,
        leadChannel: LeadChannel,
        organizationType,
        businessRole: BusinessRole,
        assignedBranch: lookups.branchOptions,
        assignedCRO: lookups.croOptions,
        leadTakenBy: lookups.leadTakenByOptions,
    };
    return (field, value) => labelOf(maps[field] || [], value);
};

// ---------- meeting / follow-up rules ----------
const getActiveMeeting = (leadId, meetings) =>
    meetings.find((m) => m.leadId === leadId && ACTIVE_MEETING.includes(m.status)) || null;

const isFollowUpPending = (l) =>
    ["new", "follow_up", "meeting_completed"].includes(l.status) &&
    !!l.nextFollowUpDate &&
    l.nextFollowUpDate <= todayStr();

const canConvert = (lead, meetings) =>
    !CLOSED_LEAD.includes(lead.status) && !getActiveMeeting(lead.id, meetings);

// ---------- stats (derived from real data) ----------
function computeStats(leads, meetings) {
    const now = new Date();
    const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const inMonth = (iso, m) => {
        const d = new Date(iso);
        return d.getFullYear() === m.getFullYear() && d.getMonth() === m.getMonth();
    };
    const thisMonth = leads.filter((l) => inMonth(l.createdAt, now)).length;
    const lastMonth = leads.filter((l) => inMonth(l.createdAt, last)).length;
    const weekAgo = Date.now() - 7 * 864e5;
    const t = todayStr();
    const in7 = addDays(7);
    const pending = leads.filter(isFollowUpPending);
    const converted = leads.filter((l) => l.status === "converted").length;

    return {
        total: leads.length,
        thisMonth,
        trend: lastMonth ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : null,
        newCount: leads.filter((l) => l.status === "new").length,
        newLast7: leads.filter((l) => l.status === "new" && new Date(l.createdAt).getTime() >= weekAgo).length,
        pending: pending.length,
        overdue: pending.filter((l) => l.nextFollowUpDate < t).length,
        scheduled: leads.filter((l) => l.status === "meeting_scheduled").length,
        upcoming7: meetings.filter((m) => ACTIVE_MEETING.includes(m.status) && m.date >= t && m.date <= in7).length,
        converted,
        conversionRate: leads.length ? Math.round((converted / leads.length) * 100) : 0,
    };
}

// ---------- filtering & sorting ----------
const EMPTY_FILTERS = { search: "", status: "", branch: "", cro: "", source: "", service: "" };

function applyFilters(leads, f) {
    const q = f.search.trim().toLowerCase();
    const qDigits = q.replace(/\D/g, "");
    return leads.filter((l) => {
        if (q) {
            const hit =
                l.leadId.toLowerCase().includes(q) ||
                l.organizationName.toLowerCase().includes(q) ||
                l.contactPerson.toLowerCase().includes(q) ||
                (qDigits.length >= 3 && (l.mobile || "").replace(/\D/g, "").includes(qDigits));
            if (!hit) return false;
        }
        if (f.status === FOLLOW_UP_DUE ? !isFollowUpPending(l) : f.status && l.status !== f.status) return false;
        if (f.branch && l.assignedBranch !== f.branch) return false;
        if (f.cro && l.assignedCRO !== f.cro) return false;
        if (f.source && l.leadSource !== f.source) return false;
        if (f.service && !l.servicesInterested.includes(f.service)) return false;
        return true;
    });
}

function sortLeads(leads, { key, dir }, labelFor) {
    const val = (l) => {
        if (["assignedCRO", "assignedBranch", "leadSource"].includes(key)) return labelFor(key, l[key]);
        return l[key] ?? "";
    };
    const mult = dir === "asc" ? 1 : -1;
    return [...leads].sort((a, b) => {
        const x = val(a);
        const y = val(b);
        if (!x && y) return 1; // empty values always last
        if (x && !y) return -1;
        return String(x).localeCompare(String(y), undefined, { numeric: true, sensitivity: "base" }) * mult;
    });
}


// ---------- mock lookups (props on <LeadManagement /> override these) ----------
const mockUser = { id: "emp_1", name: "Sita Karki" };

const mockLookups = {
    leadTakenByOptions: [
        { value: "emp_1", label: "Sita Karki" },
        { value: "emp_2", label: "Ramesh Yadav" },
        { value: "emp_3", label: "Anita Jha" },
        { value: "emp_4", label: "Bikash Mahato" },
    ],
    croOptions: [
        { value: "emp_2", label: "Ramesh Yadav" },
        { value: "emp_3", label: "Anita Jha" },
        { value: "emp_5", label: "Pooja Sah" },
    ],
    branchOptions: [
        { value: "janakpur", label: "Janakpur Branch" },
        { value: "kathmandu", label: "Kathmandu Head Office" },
        { value: "birgunj", label: "Birgunj Branch" },
        { value: "biratnagar", label: "Biratnagar Branch" },
    ],
};

// Province -> districts. Only Madhesh is mocked; other provinces fall back to free typing.
const MOCK_DISTRICTS = {
    Madhesh: ["Saptari", "Siraha", "Dhanusha", "Mahottari", "Sarlahi", "Rautahat", "Bara", "Parsa"],
};
const mockLocationData = {
    getDistricts: (province) => (MOCK_DISTRICTS[province] || []).map((d) => ({ label: d, value: d })),
    getLocalLevels: () => [],
};

// ---------- mock database ----------
const delay = (ms = 450) => new Promise((r) => setTimeout(r, ms));
const clone = (x) => JSON.parse(JSON.stringify(x));
const nowISO = () => new Date().toISOString();
const daysAgo = (n) => new Date(Date.now() - n * 864e5).toISOString();
let uid = 100;
const nid = () => `a${++uid}`;
const year = new Date().getFullYear();
const leadCode = (n) => `LD-${year}-${String(n).padStart(4, "0")}`;
const meetingCode = (n) => `MT-${year}-${String(n).padStart(4, "0")}`;
const sys = { id: "emp_1", name: "Sita Karki" };
const act = (type, text, ago = 0, by = sys) => ({ id: nid(), type, text, at: daysAgo(ago), by });

const seedLead = (n, o) => ({
    id: `lead_${n}`, leadId: leadCode(n),
    leadType: "inbound", leadSource: "website", leadChannel: "client_phone_call",
    inquiryDate: addDays(-5), nextFollowUpDate: "",
    organizationName: "", organizationType: "private_limited", website: "",
    province: "Madhesh", district: "Dhanusha", localLevel: "", ward: "", address: "",
    contactPerson: "", businessRole: "general_manager", mobile: "", alternateMobile: "", email: "",
    servicesInterested: [], leadTakenBy: "emp_1", assignedBranch: "janakpur", assignedCRO: "emp_2",
    description: "", remarks: "", status: "new",
    createdBy: sys, createdAt: daysAgo(5),
    activity: [act("created", "Lead registered", 5)],
    ...o,
});

const seed = () => ({
    leads: [
        seedLead(1, {
            organizationName: "Himalayan Foods Pvt. Ltd.", contactPerson: "Suman Thakur", mobile: "9812345678",
            email: "suman@himalayanfoods.com.np", servicesInterested: ["iso22000", "haccp", "halal"],
            nextFollowUpDate: todayStr(), createdAt: daysAgo(1), inquiryDate: addDays(-1),
            description: "Planning FSMS certification before export audit.",
            activity: [act("created", "Lead registered", 1)],
        }),
        seedLead(2, {
            organizationName: "Janakpur Medical Laboratory", organizationType: "private_limited",
            contactPerson: "Dr. Kavita Mishra", businessRole: "director", mobile: "9845612378",
            servicesInterested: ["iso15189"], leadSource: "referral", leadChannel: "referral",
            status: "follow_up", nextFollowUpDate: addDays(-2), assignedCRO: "emp_3", createdAt: daysAgo(12),
            activity: [act("created", "Lead registered", 12), act("status", "Status changed to Follow-up", 8)],
        }),
        seedLead(3, {
            organizationName: "Madhesh Steel Industries", contactPerson: "Rajiv Singh", businessRole: "operations_manager",
            mobile: "9801122334", email: "rajiv@madheshsteel.com", servicesInterested: ["iso9001", "iso14001", "iso45001"],
            leadSource: "partner_consultant", leadChannel: "whatsapp", assignedBranch: "birgunj", assignedCRO: "emp_5",
            status: "meeting_scheduled", nextFollowUpDate: addDays(2), createdAt: daysAgo(9),
            activity: [act("created", "Lead registered", 9), act("meeting", "Meeting MT-" + year + "-0001 scheduled", 3)],
        }),
        seedLead(4, {
            organizationName: "Sagarmatha Educational Foundation", organizationType: "ngo_non_profit",
            contactPerson: "Binita Sharma", businessRole: "chairman", mobile: "9851098765",
            servicesInterested: ["iso21001", "training_programs"], leadSource: "facebook", leadChannel: "messanger",
            status: "converted", assignedBranch: "kathmandu", createdAt: daysAgo(40), inquiryDate: addDays(-40),
            activity: [act("created", "Lead registered", 40), act("status", "Status changed to Converted", 4)],
        }),
        seedLead(5, {
            organizationName: "Terai Garments Co.", contactPerson: "Mohan Das", businessRole: "hr_manager",
            mobile: "9807654321", servicesInterested: ["smeta", "rba"], leadSource: "email_campaign", leadChannel: "email",
            nextFollowUpDate: addDays(4), assignedCRO: "emp_3", createdAt: daysAgo(2), inquiryDate: addDays(-2),
            activity: [act("created", "Lead registered", 2)],
        }),
        seedLead(6, {
            organizationName: "Green Valley Resort", contactPerson: "Laxmi Karna", businessRole: "general_manager",
            mobile: "9823456789", servicesInterested: ["iso41001"], leadType: "cold_lead", leadSource: "cold_calling",
            leadChannel: "eimcta_phone_call", status: "lost", createdAt: daysAgo(30), inquiryDate: addDays(-30),
            activity: [act("created", "Lead registered", 30), act("status", "Status changed to Lost", 10)],
        }),
    ],
    meetings: [
        {
            id: "meeting_1", meetingId: meetingCode(1), leadId: "lead_3", type: "physical",
            purpose: "requirement_gathering", date: addDays(2), time: "11:00",
            location: "Madhesh Steel Industries, Birgunj", meetingLink: "",
            participants: [{ value: "emp_5", label: "Pooja Sah" }, { value: "client:lead_3", label: "Rajiv Singh (Client)" }],
            assignedCRO: "emp_5", agenda: "Scope of QMS + EMS integration, timeline.", remarks: "",
            status: "scheduled", rescheduleHistory: [], createdBy: sys, createdAt: daysAgo(3),
        },
    ],
});

let db = null;
const ensure = () => (db ||= seed());
const findLead = (id) => {
    const l = ensure().leads.find((x) => x.id === id);
    if (!l) throw new Error("Lead not found. It may have been deleted.");
    return l;
};
const log = (lead, type, text, user) => lead.activity.unshift({ id: nid(), type, text, at: nowISO(), by: user });
const nextNo = (list, key) =>
    list.reduce((max, x) => Math.max(max, parseInt(String(x[key]).split("-").pop(), 10) || 0), 0) + 1;
const hasActive = (leadId, exceptId) =>
    ensure().meetings.some((m) => m.leadId === leadId && m.id !== exceptId && ACTIVE_MEETING.includes(m.status));

const leadService = {
    async list() {
        await delay(700);
        return clone(ensure());
    },

    async create(payload, user) {
        await delay();
        const { leads } = ensure();
        const lead = {
            ...payload,
            id: `lead_${nid()}`,
            leadId: leadCode(nextNo(leads, "leadId")),
            status: "new",
            createdBy: user,
            createdAt: nowISO(),
            activity: [],
        };
        log(lead, "created", "Lead registered", user);
        leads.unshift(lead);
        return clone(lead);
    },

    async update(id, payload, user) {
        await delay();
        const lead = findLead(id);
        const followUpChanged = payload.nextFollowUpDate !== lead.nextFollowUpDate;
        const assigneeChanged = payload.assignedCRO !== lead.assignedCRO;
        // identity / workflow fields are never overwritten by the form
        const { id: _i, leadId: _l, status: _s, createdBy: _c, createdAt: _a, activity: _ac, ...editable } = payload;
        Object.assign(lead, editable);
        log(lead, "updated", "Lead details updated", user);
        if (followUpChanged) log(lead, "follow_up", `Next follow-up set to ${lead.nextFollowUpDate || "none"}`, user);
        if (assigneeChanged) log(lead, "assignment", "Assigned CRO changed", user);
        return clone(lead);
    },

    async remove(id) {
        await delay();
        const d = ensure();
        findLead(id);
        d.leads = d.leads.filter((l) => l.id !== id);
        d.meetings = d.meetings.filter((m) => m.leadId !== id);
    },

    async changeStatus(id, status, user) {
        await delay(350);
        const lead = findLead(id);
        if (hasActive(id) && status !== lead.status) throw new Error("Complete or cancel the active meeting first.");
        lead.status = status;
        log(lead, "status", `Status changed to ${status.replace(/_/g, " ")}`, user);
        return clone(lead);
    },

    async createMeeting(leadId, payload, user) {
        await delay();
        const d = ensure();
        const lead = findLead(leadId);
        if (CLOSED_LEAD.includes(lead.status)) throw new Error("This lead is closed and cannot be scheduled.");
        if (hasActive(leadId)) throw new Error("An active meeting already exists for this lead.");
        const meeting = {
            ...payload,
            id: `meeting_${nid()}`,
            meetingId: meetingCode(nextNo(d.meetings, "meetingId")),
            leadId,
            status: "scheduled",
            rescheduleHistory: [],
            createdBy: user,
            createdAt: nowISO(),
        };
        d.meetings.unshift(meeting);
        lead.status = "meeting_scheduled";
        log(lead, "meeting", `Meeting ${meeting.meetingId} scheduled`, user);
        return clone({ meeting, lead });
    },

    async updateMeeting(meetingId, payload, user) {
        await delay();
        const d = ensure();
        const m = d.meetings.find((x) => x.id === meetingId);
        if (!m) throw new Error("Meeting not found.");
        const lead = findLead(m.leadId);
        const { rescheduleReason, ...rest } = payload;
        const moved = (rest.date && rest.date !== m.date) || (rest.time && rest.time !== m.time);
        const next = { ...m, ...rest };

        if (ACTIVE_MEETING.includes(next.status) && hasActive(m.leadId, m.id))
            throw new Error("Another active meeting exists for this lead.");

        if (moved && ACTIVE_MEETING.includes(m.status) && !["completed", "cancelled"].includes(rest.status)) {
            next.status = "rescheduled";
            next.rescheduleHistory = [
                ...m.rescheduleHistory,
                {
                    date: m.date, time: m.time, location: m.location, meetingLink: m.meetingLink,
                    reason: rescheduleReason || "", changedAt: nowISO(), changedBy: user,
                },
            ];
            log(lead, "meeting", `Meeting ${m.meetingId} rescheduled`, user);
        } else if (next.status !== m.status) {
            log(lead, "meeting", `Meeting ${m.meetingId} marked ${next.status}`, user);
        } else {
            log(lead, "meeting", `Meeting ${m.meetingId} details updated`, user);
        }
        Object.assign(m, next);

        if (!CLOSED_LEAD.includes(lead.status)) {
            if (ACTIVE_MEETING.includes(m.status)) lead.status = "meeting_scheduled";
            else if (m.status === "completed") lead.status = "meeting_completed";
            else if (m.status === "cancelled" && !hasActive(lead.id)) lead.status = "follow_up";
        }
        return clone({ meeting: m, lead });
    },
};

// ===============================================================
// useLeadManagement.js
// ===============================================================
/**
 * Owns lead + meeting state and every API call. Presentation components never
 * call the service directly. Each action throws on failure so the caller can
 * show feedback, and flags `busy[key]` while in flight.
 */
function useLeadManagement(service, user) {
    const [leads, setLeads] = useState([]);
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [busy, setBusy] = useState({});

    const load = useCallback(async () => {
        setLoading(true);
        setLoadError("");
        try {
            const data = await service.list();
            setLeads(data.leads);
            setMeetings(data.meetings);
        } catch (e) {
            setLoadError(e.message || "Could not load leads.");
        } finally {
            setLoading(false);
        }
    }, [service]);

    useEffect(() => {
        load();
    }, [load]);

    const track = useCallback(async (key, fn) => {
        setBusy((b) => ({ ...b, [key]: true }));
        try {
            return await fn();
        } finally {
            setBusy((b) => {
                const { [key]: _gone, ...rest } = b;
                return rest;
            });
        }
    }, []);

    const putLead = (lead) => setLeads((p) => p.map((l) => (l.id === lead.id ? lead : l)));
    const putMeeting = (m) => setMeetings((p) => p.map((x) => (x.id === m.id ? m : x)));

    const actions = useMemo(
        () => ({
            createLead: (payload) =>
                track("save-lead", async () => {
                    const lead = await service.create(payload, user);
                    setLeads((p) => [lead, ...p]);
                    return lead;
                }),
            updateLead: (id, payload) =>
                track("save-lead", async () => {
                    const lead = await service.update(id, payload, user);
                    putLead(lead);
                    return lead;
                }),
            removeLead: (id) =>
                track(`delete-${id}`, async () => {
                    await service.remove(id);
                    setLeads((p) => p.filter((l) => l.id !== id));
                    setMeetings((p) => p.filter((m) => m.leadId !== id));
                }),
            changeStatus: (id, status) =>
                track(`status-${id}`, async () => {
                    const lead = await service.changeStatus(id, status, user);
                    putLead(lead);
                    return lead;
                }),
            scheduleMeeting: (leadId, payload) =>
                track("save-meeting", async () => {
                    const { meeting, lead } = await service.createMeeting(leadId, payload, user);
                    setMeetings((p) => [meeting, ...p]);
                    putLead(lead);
                    return meeting;
                }),
            editMeeting: (meetingId, payload, key = "save-meeting") =>
                track(key, async () => {
                    const { meeting, lead } = await service.updateMeeting(meetingId, payload, user);
                    putMeeting(meeting);
                    putLead(lead);
                    return meeting;
                }),
        }),
        [service, user, track]
    );

    return { leads, meetings, loading, loadError, reload: load, busy, actions };
}

// ===============================================================
// ui.jsx
// ===============================================================
// ---------------------------------------------------------------
// react-select theme (EIMCTA palette)
// ---------------------------------------------------------------
const buildSelectStyles = ({ invalid = false, compact = false } = {}) => ({
    control: (base, s) => ({
        ...base,
        minHeight: compact ? 36 : 42,
        backgroundColor: s.isFocused ? "#FFFFFF" : "#F8FAFC",
        borderRadius: 12,
        borderColor: invalid ? "#DC2626" : s.isFocused ? "#4A76C0" : "#E2E8F0",
        boxShadow: s.isFocused ? `0 0 0 3px ${invalid ? "rgba(220,38,38,.12)" : "rgba(74,118,192,.15)"}` : "none",
        "&:hover": { borderColor: invalid ? "#DC2626" : "#E87A24" },
        fontSize: 13,
        cursor: "pointer",
    }),
    valueContainer: (b) => ({ ...b, padding: compact ? "0 8px" : "2px 10px" }),
    menuPortal: (b) => ({ ...b, zIndex: 9999 }),
    menu: (b) => ({ ...b, borderRadius: 12, overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,.12)" }),
    option: (b, s) => ({
        ...b,
        fontSize: 13,
        cursor: "pointer",
        backgroundColor: s.isSelected ? "#E87A24" : s.isFocused ? "#FEF3C7" : "#FFFFFF",
        color: s.isSelected ? "#FFFFFF" : "#422026",
    }),
    multiValue: (b, { data }) => ({
        ...b,
        borderRadius: 6,
        backgroundColor: data.color ? `${data.color}14` : "#FEF3C7",
        border: `1px solid ${data.color ? `${data.color}40` : "#F59E0B55"}`,
    }),
    multiValueLabel: (b, { data }) => ({ ...b, color: data.color || "#92400E", fontSize: 11, fontWeight: 700 }),
    multiValueRemove: (b, { data }) => ({
        ...b,
        color: data.color || "#92400E",
        ":hover": { backgroundColor: data.color ? `${data.color}30` : "#FDE68A", color: data.color || "#92400E" },
    }),
    placeholder: (b) => ({ ...b, color: "#94A3B8", fontSize: 12 }),
    singleValue: (b) => ({ ...b, color: "#422026" }),
});

const AppSelect = ({ creatable, invalid, compact, ...props }) => {
    const Comp = creatable ? CreatableSelect : Select;
    return (
        <Comp
            isClearable
            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
            menuPosition="fixed"
            classNamePrefix="lead-select"
            styles={buildSelectStyles({ invalid, compact })}
            noOptionsMessage={() => "No matches"}
            aria-invalid={invalid || undefined}
            {...props}
        />
    );
};

// ---------------------------------------------------------------
// Form primitives
// ---------------------------------------------------------------
const Field = ({ label, required, icon: Icon, error, hint, warning, htmlFor, children, className = "" }) => (
    <div className={`min-w-0 space-y-1.5 ${className}`}>
        <label
            htmlFor={htmlFor}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#64748B]"
        >
            {Icon && <Icon size={12} />}
            {label}
            {required && <span className="text-[#DC2626]" aria-hidden="true">*</span>}
        </label>
        {children}
        <AnimatePresence initial={false} mode="wait">
            {error ? (
                <motion.p
                    key="error" role="alert"
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-[11px] font-medium text-[#DC2626]"
                >
                    {error}
                </motion.p>
            ) : warning ? (
                <motion.p
                    key="warn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-start gap-1 text-[11px] font-medium text-[#B45309]"
                >
                    <AlertTriangle size={12} className="mt-px shrink-0" /> {warning}
                </motion.p>
            ) : hint ? (
                <p key="hint" className="text-[11px] text-slate-400">{hint}</p>
            ) : null}
        </AnimatePresence>
    </div>
);

const inputBase =
    "w-full rounded-xl border bg-[#F8FAFC] px-3 py-2.5 text-sm text-[#422026] outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60";
const inputTone = (invalid) =>
    invalid
        ? "border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20"
        : "border-[#E2E8F0] focus:border-[#4A76C0] focus:ring-[#4A76C0]/20";

const TextInput = ({ icon: Icon, invalid, className = "", ...props }) => (
    <div className="relative">
        {Icon && <Icon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />}
        <input
            {...props}
            aria-invalid={invalid || undefined}
            className={`${inputBase} ${inputTone(invalid)} ${Icon ? "pl-9" : ""} ${className}`}
        />
    </div>
);

const TextArea = ({ invalid, className = "", ...props }) => (
    <textarea
        {...props}
        aria-invalid={invalid || undefined}
        className={`${inputBase} ${inputTone(invalid)} resize-y ${className}`}
    />
);

const buttonVariants = {
    primary: "bg-[#E87A24] text-white shadow-sm hover:bg-[#d56d1c]",
    secondary: "border border-[#E2E8F0] bg-white text-[#422026] hover:bg-[#F8FAFC]",
    danger: "bg-[#DC2626] text-white hover:bg-red-700",
    ghost: "text-[#64748B] hover:bg-slate-100",
};

const Button = ({ variant = "primary", loading, icon: Icon, children, className = "", disabled, ...props }) => (
    <button
        type="button"
        {...props}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A76C0]/50 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-60 ${buttonVariants[variant]} ${className}`}
    >
        {loading ? <Loader2 size={14} className="animate-spin" /> : Icon && <Icon size={14} />}
        {children}
    </button>
);

const IconButton = ({ icon: Icon, label, tone = "default", loading, className = "", ...props }) => {
    const tones = {
        default: "text-[#64748B] hover:bg-slate-100 hover:text-[#422026]",
        primary: "text-[#E87A24] hover:bg-[#E87A24]/10",
        danger: "text-[#DC2626] hover:bg-[#DC2626]/10",
    };
    return (
        <button
            type="button" title={label} aria-label={label} {...props}
            disabled={props.disabled || loading}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A76C0]/50 disabled:cursor-not-allowed disabled:opacity-40 ${tones[tone]} ${className}`}
        >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Icon size={15} />}
        </button>
    );
};

// ---------------------------------------------------------------
// Badges & chips
// ---------------------------------------------------------------
const Badge = ({ meta, value, fallback }) => (
    <motion.span
        key={value}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.18 }}
        className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${meta?.cls || "bg-slate-100 text-slate-600 border-slate-200"}`}
    >
        {meta?.label || fallback}
    </motion.span>
);
const StatusBadge = ({ status }) => <Badge key={status} meta={LEAD_STATUS[status]} value={status} fallback={status} />;
const MeetingBadge = ({ status }) => <Badge key={status} meta={MEETING_STATUS[status]} value={status} fallback={status} />;

const ServiceChips = ({ values = [], max = Infinity, full = false }) => {
    if (!values.length) return <span className="text-slate-400">—</span>;
    const shown = values.slice(0, max);
    const rest = values.slice(max);
    const text = (v) => (full ? serviceMap[v]?.label || v : (serviceMap[v]?.label || v).split(":")[0]);
    return (
        <div className="flex flex-wrap gap-1">
            {shown.map((v) => {
                const c = serviceMap[v]?.color || "#64748B";
                return (
                    <span
                        key={v} title={serviceMap[v]?.label}
                        className="rounded-md border px-1.5 py-0.5 text-[10px] font-bold leading-4"
                        style={{ color: c, backgroundColor: `${c}14`, borderColor: `${c}40` }}
                    >
                        {text(v)}
                    </span>
                );
            })}
            {rest.length > 0 && (
                <span
                    title={rest.map((v) => serviceMap[v]?.label || v).join(", ")}
                    className="rounded-md border border-[#E2E8F0] bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold leading-4 text-slate-500"
                >
                    +{rest.length}
                </span>
            )}
        </div>
    );
};

const Skeleton = ({ className = "" }) => <div className={`animate-pulse rounded-md bg-slate-200/70 ${className}`} />;

// ---------------------------------------------------------------
// Overlays (modal, drawer, confirm) – portal + Escape stack + scroll lock
// ---------------------------------------------------------------
const overlayStack = [];

function useOverlay(onClose) {
    const ref = useRef(null);
    const closeRef = useRef(onClose);
    closeRef.current = onClose;

    useEffect(() => {
        const token = Symbol("overlay");
        overlayStack.push(token);
        const previous = document.activeElement;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e) => {
            if (e.key === "Escape" && overlayStack[overlayStack.length - 1] === token) closeRef.current();
        };
        document.addEventListener("keydown", onKey);
        ref.current?.focus();
        return () => {
            document.removeEventListener("keydown", onKey);
            overlayStack.splice(overlayStack.indexOf(token), 1);
            document.body.style.overflow = prevOverflow;
            previous?.focus?.();
        };
    }, []);
    return ref;
}

const Header = ({ icon: Icon, title, subtitle, onClose, disabled }) => (
    <div className="flex items-start gap-3 border-b border-[#E2E8F0] px-4 py-3.5 sm:px-5">
        {Icon && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E87A24]/10 text-[#E87A24]">
                <Icon size={18} />
            </div>
        )}
        <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-bold text-[#422026]">{title}</h2>
            {subtitle && <p className="truncate text-xs text-slate-500">{subtitle}</p>}
        </div>
        <IconButton icon={X} label="Close" onClick={onClose} disabled={disabled} />
    </div>
);

const Modal = ({ title, subtitle, icon, onClose, children, footer, size = "max-w-2xl", busy }) => {
    const close = () => !busy && onClose();
    const ref = useOverlay(close);
    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center font-['Roboto_Slab'] sm:items-center sm:p-4"
        >
            <motion.div
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                onClick={close} aria-hidden="true"
            />
            <motion.div
                ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
                initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16 }} transition={{ duration: 0.2 }}
                className={`relative flex max-h-[92vh] w-full ${size} flex-col rounded-t-2xl bg-white shadow-xl outline-none sm:rounded-2xl`}
            >
                <Header icon={icon} title={title} subtitle={subtitle} onClose={close} disabled={busy} />
                <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
                {footer && <div className="border-t border-[#E2E8F0] px-4 py-3 sm:px-5">{footer}</div>}
            </motion.div>
        </div>
    );
};

const Drawer = ({ onClose, children, label, width = "max-w-xl" }) => {
    const ref = useOverlay(onClose);
    return (
        <div
            className="fixed inset-0 z-40 font-['Roboto_Slab']"
        >
            <motion.div
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                onClick={onClose} aria-hidden="true"
            />
            <motion.aside
                ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={label}
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
                className={`absolute right-0 top-0 flex h-full w-full ${width} flex-col bg-[#F8FAFC] shadow-2xl outline-none`}
            >
                {children}
            </motion.aside>
        </div>
    );
};

const ConfirmDialog = ({ title, children, confirmLabel = "Confirm", tone = "danger", loading, onConfirm, onCancel }) => (
    <Modal
        title={title} icon={AlertTriangle} size="max-w-md" onClose={onCancel} busy={loading}
        footer={
            <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={onCancel} disabled={loading}>Cancel</Button>
                <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} loading={loading}>
                    {confirmLabel}
                </Button>
            </div>
        }
    >
        <div className="space-y-2 px-5 py-4 text-sm text-[#422026]">{children}</div>
    </Modal>
);

// ---------------------------------------------------------------
// Toasts
// ---------------------------------------------------------------
function useToasts() {
    const [toasts, setToasts] = useState([]);
    const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
    const push = useCallback(
        (type, title, message) => {
            const id = Math.random().toString(36).slice(2);
            setToasts((t) => [...t, { id, type, title, message }]);
            setTimeout(() => dismiss(id), type === "error" ? 6000 : 3800);
        },
        [dismiss]
    );
    return {
        toasts, dismiss,
        success: (t, m) => push("success", t, m),
        error: (t, m) => push("error", t, m),
        info: (t, m) => push("info", t, m),
    };
}

const toastIcon = {
    success: <CheckCircle2 size={18} className="text-[#16A34A]" />,
    error: <XCircle size={18} className="text-[#DC2626]" />,
    info: <Info size={18} className="text-[#4A76C0]" />,
};

const ToastHost = ({ toasts, dismiss }) =>
    (
        <div className="pointer-events-none fixed inset-x-3 bottom-3 z-[60] flex flex-col items-end gap-2 font-['Roboto_Slab'] sm:inset-x-auto sm:right-5 sm:bottom-5">
            <AnimatePresence>
                {toasts.map((t) => (
                    <motion.div
                        key={t.id} layout role={t.type === "error" ? "alert" : "status"}
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 24 }}
                        transition={{ duration: 0.18 }}
                        className="pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-xl border border-[#E2E8F0] bg-white p-3 shadow-lg"
                    >
                        {toastIcon[t.type]}
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-[#422026]">{t.title}</p>
                            {t.message && <p className="mt-0.5 text-[11px] text-slate-500">{t.message}</p>}
                        </div>
                        <IconButton icon={X} label="Dismiss" onClick={() => dismiss(t.id)} className="!h-6 !w-6" />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );

// ===============================================================
// LeadForm.jsx
// ===============================================================
const STEPS = [
    { title: "Lead & Organization", icon: Target },
    { title: "Contact & Services", icon: UserRound },
    { title: "Ownership & Review", icon: Users },
];

// ---------- helpers ----------
const opt = (list, v) => (v ? list.find((o) => o.value === v) || { label: v, value: v } : null);
const strOpt = (v) => (v ? { label: v, value: v } : null);
const digits = (s) => (s || "").replace(/\D/g, "");
const phoneOk = (s) => /^[+\d\s()-]+$/.test(s) && digits(s).length >= 7 && digits(s).length <= 15;

const emptyForm = (user, lookups) => ({
    leadType: null, leadSource: null, leadChannel: null,
    inquiryDate: todayStr(), nextFollowUpDate: addDays(3),
    organizationName: "", organizationType: null, website: "",
    province: null, district: null, localLevel: null, ward: "", address: "",
    contactPerson: "", businessRole: null, mobile: "", alternateMobile: "", email: "",
    servicesInterested: [],
    leadTakenBy: lookups.leadTakenByOptions.find((o) => o.value === user?.id) || null,
    assignedBranch: null,
    assignedCRO: lookups.croOptions.find((o) => o.value === user?.id) || null,
    description: "", remarks: "",
});

const formFromLead = (l, lk) => ({
    leadType: opt(leadType, l.leadType),
    leadSource: opt(LeadSource, l.leadSource),
    leadChannel: opt(LeadChannel, l.leadChannel),
    inquiryDate: l.inquiryDate || "",
    nextFollowUpDate: l.nextFollowUpDate || "",
    organizationName: l.organizationName || "",
    organizationType: opt(organizationType, l.organizationType),
    website: l.website || "",
    province: opt(provinces, l.province),
    district: strOpt(l.district),
    localLevel: strOpt(l.localLevel),
    ward: l.ward || "",
    address: l.address || "",
    contactPerson: l.contactPerson || "",
    businessRole: opt(BusinessRole, l.businessRole),
    mobile: l.mobile || "",
    alternateMobile: l.alternateMobile || "",
    email: l.email || "",
    servicesInterested: (l.servicesInterested || []).map((v) => serviceMap[v] || { label: v, value: v }),
    leadTakenBy: opt(lk.leadTakenByOptions, l.leadTakenBy),
    assignedBranch: opt(lk.branchOptions, l.assignedBranch),
    assignedCRO: opt(lk.croOptions, l.assignedCRO),
    description: l.description || "",
    remarks: l.remarks || "",
});

const toPayload = (f) => ({
    leadType: f.leadType?.value || "",
    leadSource: f.leadSource?.value || "",
    leadChannel: f.leadChannel?.value || "",
    inquiryDate: f.inquiryDate,
    nextFollowUpDate: f.nextFollowUpDate || "",
    organizationName: f.organizationName.trim(),
    organizationType: f.organizationType?.value || "",
    website: f.website.trim(),
    province: f.province?.value || "",
    district: f.district?.value || "",
    localLevel: f.localLevel?.value || "",
    ward: f.ward.trim(),
    address: f.address.trim(),
    contactPerson: f.contactPerson.trim(),
    businessRole: f.businessRole?.value || "",
    mobile: f.mobile.trim(),
    alternateMobile: f.alternateMobile.trim(),
    email: f.email.trim(),
    servicesInterested: f.servicesInterested.map((s) => s.value),
    leadTakenBy: f.leadTakenBy?.value || "",
    assignedBranch: f.assignedBranch?.value || "",
    assignedCRO: f.assignedCRO?.value || "",
    description: f.description.trim(),
    remarks: f.remarks.trim(),
});

function validate(step, f) {
    const e = {};
    if (step === 1) {
        if (!f.leadType) e.leadType = "Select a lead type";
        if (!f.leadSource) e.leadSource = "Select a lead source";
        if (!f.inquiryDate) e.inquiryDate = "Inquiry date is required";
        else if (f.inquiryDate > todayStr()) e.inquiryDate = "Inquiry date cannot be in the future";
        if (f.nextFollowUpDate && f.inquiryDate && f.nextFollowUpDate < f.inquiryDate)
            e.nextFollowUpDate = "Follow-up cannot be before the inquiry date";
        if (!f.organizationName.trim()) e.organizationName = "Organization name is required";
        if (f.website.trim() && !/^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/\S*)?$/i.test(f.website.trim()))
            e.website = "Enter a valid website, e.g. https://example.com";
        if (f.ward && !(/^\d+$/.test(f.ward) && +f.ward >= 1 && +f.ward <= 35)) e.ward = "Ward must be 1–35";
    }
    if (step === 2) {
        if (!f.contactPerson.trim()) e.contactPerson = "Contact person name is required";
        if (!f.mobile.trim()) e.mobile = "Mobile number is required";
        else if (!phoneOk(f.mobile)) e.mobile = "Enter a valid number (7–15 digits)";
        if (f.alternateMobile.trim() && !phoneOk(f.alternateMobile)) e.alternateMobile = "Enter a valid number (7–15 digits)";
        if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = "Enter a valid email address";
    }
    if (step === 3) {
        if (!f.leadTakenBy) e.leadTakenBy = "Select who collected this lead";
    }
    return e;
}

// ---------- small presentational pieces ----------
const GroupTitle = ({ icon: Icon, children }) => (
    <div className="mb-3 flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
        <Icon size={15} className="text-[#E87A24]" />
        <h3 className="text-base font-bold text-[#422026]">{children}</h3>
    </div>
);
const Grid = ({ children }) => <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;

const Stepper = ({ step, maxReached, onJump }) => (
    <>
        <ol className="hidden items-center sm:flex" aria-label="Form progress">
            {STEPS.map((s, i) => {
                const n = i + 1;
                const done = n < step;
                const active = n === step;
                return (
                    <li key={s.title} className="flex flex-1 items-center last:flex-none">
                        <button
                            type="button" disabled={n > maxReached} onClick={() => onJump(n)}
                            aria-current={active ? "step" : undefined}
                            className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A76C0]/50 disabled:cursor-default"
                        >
                            <span
                                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition ${done ? "border-[#16A34A] bg-[#16A34A] text-white"
                                    : active ? "border-[#E87A24] bg-[#E87A24] text-white"
                                        : "border-[#E2E8F0] bg-white text-slate-400"
                                    }`}
                            >
                                {done ? <Check size={15} /> : n}
                            </span>
                            <span className="text-left">
                                <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Step {n} of {STEPS.length}</span>
                                <span className={`block text-xs font-bold ${active ? "text-[#422026]" : "text-slate-500"}`}>{s.title}</span>
                            </span>
                        </button>
                        {i < STEPS.length - 1 && (
                            <div className="mx-3 h-0.5 flex-1 overflow-hidden rounded bg-[#E2E8F0]">
                                <motion.div
                                    className="h-full bg-[#16A34A]" initial={false}
                                    animate={{ width: done ? "100%" : "0%" }} transition={{ duration: 0.3 }}
                                />
                            </div>
                        )}
                    </li>
                );
            })}
        </ol>

        <div className="sm:hidden">
            <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-bold text-[#422026]">Step {step} of {STEPS.length}</span>
                <span className="text-slate-500">{STEPS[step - 1].title}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#E2E8F0]" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step}>
                <motion.div className="h-full rounded-full bg-[#E87A24]" initial={false} animate={{ width: `${(step / STEPS.length) * 100}%` }} transition={{ duration: 0.3 }} />
            </div>
        </div>
    </>
);

const ReviewItem = ({ label, children }) => (
    <div className="min-w-0">
        <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</dt>
        <dd className="mt-0.5 break-words text-sm text-[#422026]">{children || "—"}</dd>
    </div>
);

const ReviewBlock = ({ title, onEdit, children }) => (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-3.5">
        <div className="mb-2.5 flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#422026]">{title}</h4>
            <button type="button" onClick={onEdit} className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold text-[#4A76C0] hover:bg-[#4A76C0]/10">
                <Pencil size={11} /> Edit
            </button>
        </div>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2">{children}</dl>
    </div>
);

const slide = {
    enter: (d) => ({ opacity: 0, x: d * 24 }),
    center: { opacity: 1, x: 0 },
    exit: (d) => ({ opacity: 0, x: d * -24 }),
};

// ---------- main ----------
function LeadForm({
    initialLead = null,
    lookups,
    locationData,
    existingLeads = [],
    currentUser,
    onSubmit,
    onCancel,
    onDirtyChange,
}) {
    const isEdit = !!initialLead;
    const [form, setForm] = useState(() => (isEdit ? formFromLead(initialLead, lookups) : emptyForm(currentUser, lookups)));
    const initialJson = useRef(JSON.stringify(form));
    const [step, setStep] = useState(1);
    const [dir, setDir] = useState(1);
    const [maxReached, setMaxReached] = useState(isEdit ? 3 : 1);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const topRef = useRef(null);

    useEffect(() => {
        onDirtyChange?.(JSON.stringify(form) !== initialJson.current);
    }, [form, onDirtyChange]);

    const set = (name, value) => {
        setForm((p) => ({ ...p, [name]: value }));
        if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    };

    const districtOptions = useMemo(
        () => locationData?.getDistricts?.(form.province?.value) || [],
        [locationData, form.province]
    );
    const localLevelOptions = useMemo(
        () => locationData?.getLocalLevels?.(form.district?.value) || [],
        [locationData, form.district]
    );

    const duplicate = useMemo(() => {
        const d = digits(form.mobile);
        if (d.length < 7) return null;
        return existingLeads.find((l) => l.id !== initialLead?.id && digits(l.mobile) === d) || null;
    }, [form.mobile, existingLeads, initialLead]);

    const go = (n) => {
        setDir(n > step ? 1 : -1);
        setStep(n);
        setMaxReached((m) => Math.max(m, n));
        topRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    };

    const handleJump = (n) => {
        if (n <= step) return go(n);
        // moving forward via the stepper requires every earlier step to be valid
        for (let s = step; s < n; s++) {
            const e = validate(s, form);
            if (Object.keys(e).length) { setErrors(e); return go(s); }
        }
        go(n);
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        if (saving) return;
        setSubmitError("");

        if (step < 3) {
            const e = validate(step, form);
            setErrors(e);
            if (Object.keys(e).length) return;
            return go(step + 1);
        }
        for (let s = 1; s <= 3; s++) {
            const e = validate(s, form);
            if (Object.keys(e).length) { setErrors(e); if (s !== step) go(s); return; }
        }
        setSaving(true);
        try {
            await onSubmit(toPayload(form));
        } catch (err) {
            setSubmitError(err?.message || "Could not save the lead. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const errCount = Object.values(errors).filter(Boolean).length;
    const select = (name, options, placeholder, extra = {}) => (
        <AppSelect
            inputId={name} options={options} value={form[name]} placeholder={placeholder}
            onChange={(v) => set(name, v)} invalid={!!errors[name]} {...extra}
        />
    );

    // ---------- step bodies (plain functions – not components – so inputs keep focus) ----------
    const step1 = () => (
        <div className="space-y-6">
            <div>
                <GroupTitle icon={Target}>Lead details</GroupTitle>
                <Grid>
                    <Field label="Lead Type" required htmlFor="leadType" error={errors.leadType}>
                        {select("leadType", leadType, "Select lead type")}
                    </Field>
                    <Field label="Lead Source" required htmlFor="leadSource" error={errors.leadSource}>
                        {select("leadSource", LeadSource, "Select source")}
                    </Field>
                    <Field label="Lead Channel" htmlFor="leadChannel">
                        {select("leadChannel", LeadChannel, "Select channel")}
                    </Field>
                    <Field label="Inquiry Date" required icon={CalendarDays} htmlFor="inquiryDate" error={errors.inquiryDate}>
                        <TextInput id="inquiryDate" type="date" max={todayStr()} value={form.inquiryDate} invalid={!!errors.inquiryDate} onChange={(e) => set("inquiryDate", e.target.value)} />
                    </Field>
                    <Field label="Next Follow-up Date" icon={CalendarDays} htmlFor="nextFollowUpDate" error={errors.nextFollowUpDate} hint="Defaults to 3 days from today.">
                        <TextInput id="nextFollowUpDate" type="date" min={form.inquiryDate || undefined} value={form.nextFollowUpDate} invalid={!!errors.nextFollowUpDate} onChange={(e) => set("nextFollowUpDate", e.target.value)} />
                    </Field>
                </Grid>
            </div>

            <div>
                <GroupTitle icon={Building2}>Organization</GroupTitle>
                <Grid>
                    <Field label="Organization Name" required icon={Building2} htmlFor="organizationName" error={errors.organizationName}>
                        <TextInput id="organizationName" placeholder="Enter organization name" value={form.organizationName} invalid={!!errors.organizationName} onChange={(e) => set("organizationName", e.target.value)} />
                    </Field>
                    <Field label="Organization Type" htmlFor="organizationType">
                        {select("organizationType", organizationType, "Select organization type")}
                    </Field>
                    <Field label="Website" icon={Globe} htmlFor="website" error={errors.website}>
                        <TextInput id="website" placeholder="https://example.com" value={form.website} invalid={!!errors.website} onChange={(e) => set("website", e.target.value)} />
                    </Field>
                </Grid>
            </div>

            <div>
                <GroupTitle icon={MapPin}>Location</GroupTitle>
                <Grid>
                    <Field label="Province" htmlFor="province">
                        <AppSelect
                            inputId="province" options={provinces} value={form.province} placeholder="Select province"
                            onChange={(v) => setForm((p) => ({ ...p, province: v, district: null, localLevel: null }))}
                        />
                    </Field>
                    <Field label="District" htmlFor="district" hint={districtOptions.length ? undefined : "Type to enter a district."}>
                        <AppSelect
                            creatable inputId="district" options={districtOptions} value={form.district} placeholder="Select or type district"
                            formatCreateLabel={(v) => `Use "${v}"`}
                            onChange={(v) => setForm((p) => ({ ...p, district: v, localLevel: null }))}
                        />
                    </Field>
                    <Field label="Local Level" htmlFor="localLevel" hint={localLevelOptions.length ? undefined : "Type to enter a municipality / rural municipality."}>
                        <AppSelect
                            creatable inputId="localLevel" options={localLevelOptions} value={form.localLevel} placeholder="Select or type local level"
                            formatCreateLabel={(v) => `Use "${v}"`} onChange={(v) => set("localLevel", v)}
                        />
                    </Field>
                    <Field label="Ward Number" htmlFor="ward" error={errors.ward}>
                        <TextInput id="ward" inputMode="numeric" placeholder="1–35" value={form.ward} invalid={!!errors.ward} onChange={(e) => set("ward", e.target.value.replace(/\D/g, "").slice(0, 2))} />
                    </Field>
                    <Field label="Tole / Address" htmlFor="address" className="sm:col-span-1 lg:col-span-2">
                        <TextInput id="address" placeholder="Tole, street, landmark" value={form.address} onChange={(e) => set("address", e.target.value)} />
                    </Field>
                </Grid>
            </div>
        </div>
    );

    const step2 = () => (
        <div className="space-y-6">
            <div>
                <GroupTitle icon={UserRound}>Contact person</GroupTitle>
                <Grid>
                    <Field label="Contact Person Name" required icon={UserRound} htmlFor="contactPerson" error={errors.contactPerson}>
                        <TextInput id="contactPerson" placeholder="Full name" value={form.contactPerson} invalid={!!errors.contactPerson} onChange={(e) => set("contactPerson", e.target.value)} />
                    </Field>
                    <Field label="Business Role" htmlFor="businessRole">
                        {select("businessRole", BusinessRole, "Select role")}
                    </Field>
                    <Field
                        label="Mobile Number" required icon={Phone} htmlFor="mobile" error={errors.mobile}
                        warning={duplicate ? `Already used by ${duplicate.leadId} (${duplicate.organizationName}). You can still continue.` : undefined}
                    >
                        <TextInput id="mobile" type="tel" placeholder="98XXXXXXXX" value={form.mobile} invalid={!!errors.mobile} onChange={(e) => set("mobile", e.target.value)} />
                    </Field>
                    <Field label="Alternative Mobile" icon={Phone} htmlFor="alternateMobile" error={errors.alternateMobile}>
                        <TextInput id="alternateMobile" type="tel" placeholder="Optional" value={form.alternateMobile} invalid={!!errors.alternateMobile} onChange={(e) => set("alternateMobile", e.target.value)} />
                    </Field>
                    <Field label="Email Address" icon={Mail} htmlFor="email" error={errors.email}>
                        <TextInput id="email" type="email" placeholder="official@example.com" value={form.email} invalid={!!errors.email} onChange={(e) => set("email", e.target.value)} />
                    </Field>
                </Grid>
            </div>

            <div>
                <GroupTitle icon={ClipboardList}>Interested services</GroupTitle>
                <Field
                    label={`Services${form.servicesInterested.length ? ` (${form.servicesInterested.length} selected)` : ""}`}
                    htmlFor="servicesInterested" hint="Search and pick as many as needed. Click × on a chip to remove it."
                >
                    <AppSelect
                        isMulti inputId="servicesInterested" options={servicesInterested} value={form.servicesInterested}
                        placeholder="Search services…" closeMenuOnSelect={false} isClearable={false}
                        onChange={(v) => set("servicesInterested", v || [])}
                    />
                </Field>
            </div>
        </div>
    );

    const step3 = () => (
        <div className="space-y-6">
            <div>
                <GroupTitle icon={Users}>Ownership & assignment</GroupTitle>
                <Grid>
                    <Field label="Lead Taken By" required icon={UserPlus} htmlFor="leadTakenBy" error={errors.leadTakenBy} hint="Employee who originally collected this lead.">
                        {select("leadTakenBy", lookups.leadTakenByOptions, "Search employee")}
                    </Field>
                    <Field label="Assigned Branch" icon={Building2} htmlFor="assignedBranch" hint="Branch handling this lead.">
                        {select("assignedBranch", lookups.branchOptions, "Select branch")}
                    </Field>
                    <Field label="Assigned CRO" icon={Headset} htmlFor="assignedCRO" hint="Responsible for follow-up and client communication.">
                        {select("assignedCRO", lookups.croOptions, "Select CRO")}
                    </Field>
                    <Field label="Created By" hint="Recorded automatically from your login.">
                        <div className="flex min-h-[42px] items-center rounded-xl border border-dashed border-[#E2E8F0] bg-slate-50 px-3 text-sm text-slate-600">
                            {isEdit ? initialLead.createdBy?.name : currentUser?.name || "Current user"}
                        </div>
                    </Field>
                </Grid>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Field label="Inquiry Description" htmlFor="description">
                    <TextArea id="description" rows={3} placeholder="What does the client need? Expectations, timeline, initial discussion…" value={form.description} onChange={(e) => set("description", e.target.value)} />
                </Field>
                <Field label="Internal Remarks" htmlFor="remarks">
                    <TextArea id="remarks" rows={3} placeholder="Notes for the EIMCTA team only" value={form.remarks} onChange={(e) => set("remarks", e.target.value)} />
                </Field>
            </div>

            <div>
                <GroupTitle icon={Check}>Review before {isEdit ? "saving" : "submitting"}</GroupTitle>
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                    <ReviewBlock title="Lead & Organization" onEdit={() => go(1)}>
                        <ReviewItem label="Type / Source">{[form.leadType?.label, form.leadSource?.label].filter(Boolean).join(" · ")}</ReviewItem>
                        <ReviewItem label="Channel">{form.leadChannel?.label}</ReviewItem>
                        <ReviewItem label="Inquiry">{fmtDate(form.inquiryDate)}</ReviewItem>
                        <ReviewItem label="Follow-up">{form.nextFollowUpDate ? fmtDate(form.nextFollowUpDate) : ""}</ReviewItem>
                        <ReviewItem label="Organization">{form.organizationName}</ReviewItem>
                        <ReviewItem label="Location">{[form.address, form.ward && `Ward ${form.ward}`, form.localLevel?.label, form.district?.label, form.province?.label].filter(Boolean).join(", ")}</ReviewItem>
                    </ReviewBlock>
                    <ReviewBlock title="Contact & Services" onEdit={() => go(2)}>
                        <ReviewItem label="Contact">{[form.contactPerson, form.businessRole?.label].filter(Boolean).join(" · ")}</ReviewItem>
                        <ReviewItem label="Mobile">{form.mobile}</ReviewItem>
                        <ReviewItem label="Email">{form.email}</ReviewItem>
                        <div className="sm:col-span-2">
                            <dt className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Services</dt>
                            <dd><ServiceChips values={form.servicesInterested.map((s) => s.value)} /></dd>
                        </div>
                    </ReviewBlock>
                    <ReviewBlock title="Ownership" onEdit={() => go(3)}>
                        <ReviewItem label="Lead taken by">{form.leadTakenBy?.label}</ReviewItem>
                        <ReviewItem label="Assigned CRO">{form.assignedCRO?.label}</ReviewItem>
                        <ReviewItem label="Branch">{form.assignedBranch?.label}</ReviewItem>
                        <ReviewItem label="Created by">{isEdit ? initialLead.createdBy?.name : currentUser?.name}</ReviewItem>
                    </ReviewBlock>
                </div>
            </div>
        </div>
    );

    const bodies = [step1, step2, step3];

    return (
        <form onSubmit={handleSubmit} noValidate className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
            <div ref={topRef} className="space-y-4 border-b border-[#E2E8F0] px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <h2 className="truncate text-base font-bold text-[#422026]">
                            {isEdit ? `Edit lead ${initialLead.leadId}` : "Register new lead"}
                        </h2>
                        <p className="text-xs text-slate-500">
                            {isEdit ? "Update the details below. Status and history are kept." : "Three quick steps. Your entries are kept when you move between steps."}
                        </p>
                    </div>
                    <IconClose onClick={onCancel} disabled={saving} />
                </div>
                <Stepper step={step} maxReached={maxReached} onJump={handleJump} />
            </div>

            <div className="px-4 py-5 sm:px-6">
                <AnimatePresence mode="wait" custom={dir} initial={false}>
                    <motion.div
                        key={step} custom={dir} variants={slide} initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.18 }}
                    >
                        {bodies[step - 1]()}
                    </motion.div>
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {submitError && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div role="alert" className="mx-4 mb-3 flex items-start gap-2 rounded-xl border border-[#DC2626]/25 bg-[#DC2626]/5 p-3 text-xs text-[#B91C1C] sm:mx-6">
                            <AlertCircle size={15} className="mt-px shrink-0" /> {submitError}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col-reverse gap-3 border-t border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex items-center justify-between gap-3 sm:justify-start">
                    <Button variant="ghost" onClick={onCancel} disabled={saving}>Cancel</Button>
                    <span className="text-[11px] text-slate-500">
                        {errCount > 0 ? <span className="font-bold text-[#DC2626]">Fix {errCount} highlighted {errCount === 1 ? "field" : "fields"}</span> : <><span className="text-[#DC2626]">*</span> Required</>}
                    </span>
                </div>
                <div className="flex gap-2">
                    {step > 1 && (
                        <Button variant="secondary" icon={ChevronLeft} onClick={() => go(step - 1)} disabled={saving} className="flex-1 sm:flex-none">
                            Previous
                        </Button>
                    )}
                    {step < 3 ? (
                        <Button type="submit" className="flex-1 sm:flex-none">
                            Next <ChevronRight size={14} />
                        </Button>
                    ) : (
                        <Button type="submit" icon={Save} loading={saving} className="flex-1 sm:flex-none">
                            {saving ? "Saving…" : isEdit ? "Save Changes" : "Submit Lead"}
                        </Button>
                    )}
                </div>
            </div>
        </form>
    );
}

const IconClose = ({ onClick, disabled }) => (
    <button
        type="button" onClick={onClick} disabled={disabled} aria-label="Close form" title="Close form"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:opacity-40"
    >
        <X size={16} />
    </button>
);

// ===============================================================
// LeadTable.jsx
// ===============================================================
// ---------------------------------------------------------------
// Statistics (all values derived from real lead data)
// ---------------------------------------------------------------
function LeadStats({ stats, activeStatus, onSelect, loading }) {
    const trend =
        stats.trend === null ? (
            <span>{stats.thisMonth} added this month</span>
        ) : (
            <span className={`inline-flex items-center gap-1 font-bold ${stats.trend >= 0 ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
                {stats.trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {stats.trend > 0 ? "+" : ""}{stats.trend}% vs last month
            </span>
        );

    const cards = [
        { key: "", label: "Total Leads", value: stats.total, icon: Users, color: "#4A76C0", sub: trend },
        { key: "new", label: "New Leads", value: stats.newCount, icon: Sparkles, color: "#E87A24", sub: `${stats.newLast7} in the last 7 days` },
        { key: FOLLOW_UP_DUE, label: "Follow-up Pending", value: stats.pending, icon: BellRing, color: "#F59E0B", sub: stats.overdue ? `${stats.overdue} overdue` : "None overdue" },
        { key: "meeting_scheduled", label: "Meetings Scheduled", value: stats.scheduled, icon: CalendarCheck, color: "#8B5CF6", sub: `${stats.upcoming7} in the next 7 days` },
        { key: "converted", label: "Converted Clients", value: stats.converted, icon: UserCheck, color: "#16A34A", sub: `${stats.conversionRate}% conversion` },
    ];

    return (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {cards.map((c, i) => {
                const active = activeStatus === c.key;
                return (
                    <motion.button
                        key={c.label} type="button" onClick={() => onSelect(c.key)} aria-pressed={active}
                        whileHover={{ y: -2 }} transition={{ duration: 0.15 }}
                        className={`rounded-2xl border bg-white p-3.5 text-left shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A76C0]/50 ${i === 0 ? "col-span-2 lg:col-span-1" : ""
                            } ${active ? "border-[#E87A24] ring-1 ring-[#E87A24]/40" : "border-[#E2E8F0] hover:border-slate-300"}`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">{c.label}</span>
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: `${c.color}18`, color: c.color }}>
                                <c.icon size={15} />
                            </span>
                        </div>
                        {loading ? (
                            <Skeleton className="mt-2 h-7 w-12" />
                        ) : (
                            <motion.p key={c.value} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-2xl font-bold text-[#422026]">
                                {c.value}
                            </motion.p>
                        )}
                        <div className="mt-0.5 text-[11px] text-slate-500">{loading ? <Skeleton className="h-3 w-24" /> : c.sub}</div>
                    </motion.button>
                );
            })}
        </div>
    );
}

// ---------------------------------------------------------------
// Table
// ---------------------------------------------------------------
const COLS = [
    { key: "leadId", label: "Lead ID", sort: true },
    { key: "organizationName", label: "Organization", sort: true },
    { key: "contactPerson", label: "Contact Person", sort: true },
    { key: "contact", label: "Contact" },
    { key: "services", label: "Services" },
    { key: "leadSource", label: "Source", sort: true },
    { key: "assignedCRO", label: "Assigned CRO", sort: true },
    { key: "assignedBranch", label: "Branch", sort: true },
    { key: "nextFollowUpDate", label: "Follow-up", sort: true },
    { key: "status", label: "Status", sort: true },
    { key: "actions", label: "Actions" },
];

const FollowUp = ({ lead }) => {
    if (!lead.nextFollowUpDate) return <span className="text-slate-400">—</span>;
    const due = isFollowUpPending(lead);
    const overdue = due && lead.nextFollowUpDate < todayStr();
    return (
        <div>
            <p className={`whitespace-nowrap text-xs ${overdue ? "font-bold text-[#DC2626]" : due ? "font-bold text-[#B45309]" : "text-[#422026]"}`}>
                {fmtDate(lead.nextFollowUpDate)}
            </p>
            {due && <p className={`text-[10px] font-bold ${overdue ? "text-[#DC2626]" : "text-[#B45309]"}`}>{overdue ? "Overdue" : "Due today"}</p>}
        </div>
    );
};

function RowActions({ lead, meetings, can, busy, on }) {
    const active = getActiveMeeting(lead.id, meetings);
    const eligible = canConvert(lead, meetings);
    const reason = active ? `Meeting ${active.meetingId} already scheduled` : "Lead is closed";
    return (
        <div className="flex items-center gap-0.5">
            <IconButton icon={Eye} label="View details" onClick={() => on.view(lead)} />
            {can.edit && <IconButton icon={Pencil} label="Edit lead" onClick={() => on.edit(lead)} />}
            {can.schedule && (
                <IconButton
                    icon={eligible ? CalendarPlus : CalendarCheck} tone="primary" disabled={!eligible}
                    label={eligible ? "Lead to Meeting" : reason} onClick={() => on.convert(lead)}
                />
            )}
            {can.delete && <IconButton icon={Trash2} tone="danger" label="Delete lead" loading={busy[`delete-${lead.id}`]} onClick={() => on.remove(lead)} />}
        </div>
    );
}

function LeadTable({
    leads, meetings, loading, loadError, onRetry, filters, setFilters, lookups, labelFor,
    highlightId, can, busy, on, onNew,
}) {
    const [sort, setSort] = useState({ key: "createdAt", dir: "desc" });
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [showFilters, setShowFilters] = useState(false);

    const setF = (k, v) => setFilters((f) => ({ ...f, [k]: v }));
    const activeFilterCount = Object.entries(filters).filter(([k, v]) => k !== "search" && v).length;
    const hasAny = activeFilterCount > 0 || filters.search;

    const rows = useMemo(
        () => sortLeads(applyFilters(leads, filters), sort, labelFor),
        [leads, filters, sort, labelFor]
    );
    const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
    const current = Math.min(page, pageCount);
    const start = (current - 1) * pageSize;
    const pageRows = rows.slice(start, start + pageSize);

    useEffect(() => setPage(1), [filters, pageSize]);

    const toggleSort = (key) =>
        setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

    const asOpt = (list, v) => list.find((o) => o.value === v) || null;

    const filterBar = (
        <div className="space-y-3 border-b border-[#E2E8F0] p-3 sm:p-4">
            <div className="flex gap-2">
                <div className="relative min-w-0 flex-1">
                    <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={filters.search} onChange={(e) => setF("search", e.target.value)}
                        placeholder="Search organization, contact, mobile or Lead ID"
                        aria-label="Search leads"
                        className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] py-2.5 pl-9 pr-9 text-sm text-[#422026] outline-none transition placeholder:text-slate-400 focus:border-[#4A76C0] focus:bg-white focus:ring-2 focus:ring-[#4A76C0]/20"
                    />
                    {filters.search && (
                        <button type="button" aria-label="Clear search" onClick={() => setF("search", "")} className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600">
                            <X size={14} />
                        </button>
                    )}
                </div>
                <Button variant="secondary" icon={Filter} onClick={() => setShowFilters((s) => !s)} className="md:hidden" aria-expanded={showFilters}>
                    Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}
                </Button>
            </div>

            <div className={`${showFilters ? "grid" : "hidden"} grid-cols-1 gap-2 sm:grid-cols-2 md:grid md:grid-cols-5`}>
                <AppSelect compact placeholder="Status" aria-label="Filter by status" options={statusFilterOptions} value={asOpt(statusFilterOptions, filters.status)} onChange={(o) => setF("status", o?.value || "")} />
                <AppSelect compact placeholder="Branch" aria-label="Filter by branch" options={lookups.branchOptions} value={asOpt(lookups.branchOptions, filters.branch)} onChange={(o) => setF("branch", o?.value || "")} />
                <AppSelect compact placeholder="Assigned CRO" aria-label="Filter by CRO" options={lookups.croOptions} value={asOpt(lookups.croOptions, filters.cro)} onChange={(o) => setF("cro", o?.value || "")} />
                <AppSelect compact placeholder="Lead source" aria-label="Filter by source" options={LeadSource} value={asOpt(LeadSource, filters.source)} onChange={(o) => setF("source", o?.value || "")} />
                <AppSelect compact placeholder="Service" aria-label="Filter by service" options={servicesInterested} value={asOpt(servicesInterested, filters.service)} onChange={(o) => setF("service", o?.value || "")} />
            </div>

            {hasAny && (
                <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{rows.length} of {leads.length} leads match</span>
                    <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className="font-bold text-[#E87A24] hover:underline">Clear all</button>
                </div>
            )}
        </div>
    );

    // ---------- body states ----------
    let body;
    if (loadError) {
        body = (
            <div className="px-4 py-14 text-center">
                <p className="text-sm font-bold text-[#DC2626]">Couldn't load leads</p>
                <p className="mt-1 text-xs text-slate-500">{loadError}</p>
                <Button className="mt-4" onClick={onRetry}>Try again</Button>
            </div>
        );
    } else if (loading) {
        body = (
            <div className="space-y-3 p-4" aria-busy="true" aria-label="Loading leads">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
        );
    } else if (!rows.length) {
        body = (
            <div className="px-4 py-14 text-center">
                <SearchX size={28} className="mx-auto text-slate-300" />
                <p className="mt-3 text-sm font-bold text-[#422026]">{leads.length ? "No leads match these filters" : "No leads registered yet"}</p>
                <p className="mt-1 text-xs text-slate-500">{leads.length ? "Try a different search or clear the filters." : "Register your first lead to start tracking follow-ups."}</p>
                <Button className="mt-4" variant={leads.length ? "secondary" : "primary"} onClick={leads.length ? () => setFilters(EMPTY_FILTERS) : onNew}>
                    {leads.length ? "Clear filters" : "Register a lead"}
                </Button>
            </div>
        );
    } else {
        body = (
            <>
                {/* desktop / tablet */}
                <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[1100px] text-left">
                        <thead className="bg-[#F8FAFC]">
                            <tr>
                                {COLS.map((c) => (
                                    <th key={c.key} scope="col" aria-sort={sort.key === c.key ? (sort.dir === "asc" ? "ascending" : "descending") : undefined} className="whitespace-nowrap px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#64748B]">
                                        {c.sort ? (
                                            <button type="button" onClick={() => toggleSort(c.key)} className="inline-flex items-center gap-1 hover:text-[#422026]">
                                                {c.label}
                                                {sort.key === c.key ? (sort.dir === "asc" ? <ArrowUp size={11} /> : <ArrowDown size={11} />) : <ArrowUpDown size={11} className="opacity-40" />}
                                            </button>
                                        ) : c.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                            {pageRows.map((l) => (
                                <motion.tr
                                    key={l.id}
                                    initial={{ opacity: 0 }}
                                    animate={highlightId === l.id ? { opacity: 1, backgroundColor: ["#FEF3C7", "rgba(254,243,199,0)"] } : { opacity: 1 }}
                                    transition={{ duration: highlightId === l.id ? 2 : 0.15 }}
                                    className="transition-colors hover:bg-[#F8FAFC]"
                                >
                                    <td className="whitespace-nowrap px-3 py-3 text-xs font-bold text-[#4A76C0]">
                                        <button type="button" onClick={() => on.view(l)} className="hover:underline">{l.leadId}</button>
                                    </td>
                                    <td className="max-w-[200px] px-3 py-3">
                                        <p className="truncate text-sm font-bold text-[#422026]" title={l.organizationName}>{l.organizationName}</p>
                                    </td>
                                    <td className="px-3 py-3">
                                        <p className="text-xs font-bold text-[#422026]">{l.contactPerson}</p>
                                        <p className="text-[11px] text-slate-500">{l.businessRole ? labelFor("businessRole", l.businessRole) : ""}</p>
                                    </td>
                                    <td className="px-3 py-3">
                                        <p className="whitespace-nowrap text-xs text-[#422026]">{l.mobile}</p>
                                        <p className="max-w-[160px] truncate text-[11px] text-slate-500" title={l.email}>{l.email}</p>
                                    </td>
                                    <td className="max-w-[190px] px-3 py-3"><ServiceChips values={l.servicesInterested} max={2} /></td>
                                    <td className="px-3 py-3">
                                        <p className="text-xs text-[#422026]">{labelFor("leadSource", l.leadSource)}</p>
                                        <p className="text-[11px] text-slate-500">{l.leadChannel ? labelFor("leadChannel", l.leadChannel) : ""}</p>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3 text-xs text-[#422026]">{labelFor("assignedCRO", l.assignedCRO)}</td>
                                    <td className="whitespace-nowrap px-3 py-3 text-xs text-[#422026]">{labelFor("assignedBranch", l.assignedBranch)}</td>
                                    <td className="px-3 py-3"><FollowUp lead={l} /></td>
                                    <td className="px-3 py-3"><StatusBadge status={l.status} /></td>
                                    <td className="px-3 py-3"><RowActions lead={l} meetings={meetings} can={can} busy={busy} on={on} /></td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* mobile cards */}
                <ul className="divide-y divide-[#E2E8F0] md:hidden">
                    {pageRows.map((l) => (
                        <motion.li key={l.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2.5 p-3.5">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <button type="button" onClick={() => on.view(l)} className="text-[11px] font-bold text-[#4A76C0]">{l.leadId}</button>
                                    <p className="truncate text-sm font-bold text-[#422026]">{l.organizationName}</p>
                                    <p className="text-xs text-slate-500">{l.contactPerson} · {l.mobile}</p>
                                </div>
                                <StatusBadge status={l.status} />
                            </div>
                            <ServiceChips values={l.servicesInterested} max={3} />
                            <div className="flex items-end justify-between gap-2">
                                <div className="text-[11px] text-slate-500">
                                    <p>{labelFor("assignedCRO", l.assignedCRO)} · {labelFor("assignedBranch", l.assignedBranch)}</p>
                                    <div className="mt-0.5 flex items-center gap-1.5">Follow-up: <FollowUp lead={l} /></div>
                                </div>
                                <RowActions lead={l} meetings={meetings} can={can} busy={busy} on={on} />
                            </div>
                        </motion.li>
                    ))}
                </ul>

                {/* pagination */}
                <div className="flex flex-col gap-2 border-t border-[#E2E8F0] px-3 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                    <div className="flex items-center gap-2">
                        <span>Rows</span>
                        <select
                            value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} aria-label="Rows per page"
                            className="rounded-lg border border-[#E2E8F0] bg-white px-2 py-1 text-xs text-[#422026] outline-none focus:border-[#4A76C0]"
                        >
                            {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                        <span>{start + 1}–{Math.min(start + pageSize, rows.length)} of {rows.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <IconButton icon={ChevronLeft} label="Previous page" disabled={current === 1} onClick={() => setPage(current - 1)} />
                        <span className="px-2 font-bold text-[#422026]">{current} / {pageCount}</span>
                        <IconButton icon={ChevronRight} label="Next page" disabled={current === pageCount} onClick={() => setPage(current + 1)} />
                    </div>
                </div>
            </>
        );
    }

    return (
        <section aria-label="Registered leads" className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-3.5">
                <div>
                    <h2 className="text-base font-bold text-[#422026]">Registered Leads</h2>
                    <p className="text-xs text-slate-500">Open a lead to see full details, meetings and history.</p>
                </div>
            </div>
            {filterBar}
            <AnimatePresence mode="wait" initial={false}>
                <motion.div key={loading ? "l" : loadError ? "e" : "d"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
                    {body}
                </motion.div>
            </AnimatePresence>
        </section>
    );
}

// ===============================================================
// LeadDrawer.jsx
// ===============================================================
const Row = ({ label, children }) => (
    <div className="min-w-0">
        <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</dt>
        <dd className="mt-0.5 break-words text-sm text-[#422026]">{children || "—"}</dd>
    </div>
);

const Card = ({ title, children }) => (
    <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
        <h3 className="mb-3 text-base font-bold text-[#422026]">{title}</h3>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">{children}</dl>
    </section>
);

function MeetingCard({ m, lead, labelFor, can, busy, onEdit, onStatus }) {
    const active = ACTIVE_MEETING.includes(m.status);
    const isVirtual = m.type === "virtual";
    return (
        <motion.article layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-[11px] font-bold text-[#4A76C0]">{m.meetingId}</p>
                    <p className="text-sm font-bold text-[#422026]">{labelOf(MEETING_PURPOSES, m.purpose)}</p>
                </div>
                <MeetingBadge status={m.status} />
            </div>

            <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                <Row label="Date & time">
                    <span className="inline-flex items-center gap-1.5"><Clock size={13} className="text-slate-400" />{fmtDate(m.date)}, {fmtTime(m.time)}</span>
                </Row>
                <Row label={isVirtual ? "Online meeting" : "Location"}>
                    <span className="inline-flex items-start gap-1.5">
                        {isVirtual ? <Video size={13} className="mt-1 shrink-0 text-slate-400" /> : <MapPin size={13} className="mt-1 shrink-0 text-slate-400" />}
                        {isVirtual && m.meetingLink ? (
                            <a href={m.meetingLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 break-all font-bold text-[#4A76C0] hover:underline">
                                Join link <ExternalLink size={11} />
                            </a>
                        ) : (m.location)}
                    </span>
                </Row>
                <Row label="Assigned CRO">{labelFor("assignedCRO", m.assignedCRO)}</Row>
                <Row label="Scheduled by">{m.createdBy?.name} · {fmtDateTime(m.createdAt)}</Row>
            </dl>

            {m.participants?.length > 0 && (
                <div className="mt-3">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Participants</p>
                    <div className="flex flex-wrap gap-1.5">
                        {m.participants.map((p) => (
                            <span key={p.value} className="rounded-md border border-[#E2E8F0] bg-slate-50 px-2 py-0.5 text-[11px] font-bold text-slate-600">{p.label}</span>
                        ))}
                    </div>
                </div>
            )}
            {m.agenda && <p className="mt-3 whitespace-pre-line text-xs text-slate-600"><span className="font-bold text-[#422026]">Agenda: </span>{m.agenda}</p>}
            {m.remarks && <p className="mt-1.5 whitespace-pre-line text-xs text-slate-600"><span className="font-bold text-[#422026]">Remarks: </span>{m.remarks}</p>}

            {m.rescheduleHistory?.length > 0 && (
                <div className="mt-3 rounded-xl bg-[#FEF3C7]/50 p-2.5">
                    <p className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#92400E]"><History size={11} /> Previous schedule</p>
                    <ul className="space-y-1">
                        {m.rescheduleHistory.map((h, i) => (
                            <li key={i} className="text-[11px] text-[#92400E]">
                                <span className="line-through">{fmtDate(h.date)}, {fmtTime(h.time)}</span>
                                {h.reason ? ` — ${h.reason}` : ""}
                                <span className="text-[#92400E]/70"> · changed {fmtDateTime(h.changedAt)} by {h.changedBy?.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {can.editMeeting && (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-[#E2E8F0] pt-3">
                    <Button variant="secondary" icon={Pencil} onClick={() => onEdit(m)}>Edit</Button>
                    {active && (
                        <>
                            <Button variant="secondary" icon={CheckCircle2} loading={busy[`meeting-${m.id}-completed`]} onClick={() => onStatus(m, "completed")}>Mark completed</Button>
                            <Button variant="ghost" icon={XCircle} className="!text-[#DC2626] hover:!bg-[#DC2626]/10" onClick={() => onStatus(m, "cancelled")}>Cancel meeting</Button>
                        </>
                    )}
                </div>
            )}
        </motion.article>
    );
}

function LeadDrawer({
    lead, meetings, allMeetings, labelFor, can, busy, onClose, onEdit, onConvert, onEditMeeting, onMeetingStatus, onStatusChange,
}) {
    const [tab, setTab] = useState("details");
    const [cancelTarget, setCancelTarget] = useState(null);
    const eligible = canConvert(lead, allMeetings);
    const hasActive = !!getActiveMeeting(lead.id, allMeetings);
    const location = [lead.address, lead.ward && `Ward ${lead.ward}`, lead.localLevel, lead.district, lead.province].filter(Boolean).join(", ");

    const tabs = [
        { id: "details", label: "Details" },
        { id: "meetings", label: `Meetings (${meetings.length})` },
        { id: "activity", label: "Activity" },
    ];

    const manualValue = MANUAL_STATUS_OPTIONS.find((o) => o.value === lead.status) || null;

    const confirmCancel = async () => {
        await onMeetingStatus(cancelTarget, "cancelled");
        setCancelTarget(null);
    };

    return (
        <Drawer onClose={onClose} label={`Lead ${lead.leadId}`}>
            <div className="border-b border-[#E2E8F0] bg-white px-4 py-3.5 sm:px-5">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E87A24]/10 text-[#E87A24]"><Building2 size={19} /></div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-[#4A76C0]">{lead.leadId}</p>
                        <h2 className="truncate text-base font-bold text-[#422026]">{lead.organizationName}</h2>
                        <div className="mt-1.5"><StatusBadge status={lead.status} /></div>
                    </div>
                    <IconButton icon={X} label="Close details" onClick={onClose} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                    {can.edit && <Button variant="secondary" icon={Pencil} onClick={() => onEdit(lead)}>Edit lead</Button>}
                    {can.schedule && (
                        <Button icon={CalendarPlus} disabled={!eligible} onClick={() => onConvert(lead)} title={eligible ? "" : hasActive ? "A meeting is already scheduled" : "Lead is closed"}>
                            Lead to Meeting
                        </Button>
                    )}
                </div>
                <div role="tablist" className="mt-3 flex gap-1 border-b border-[#E2E8F0]">
                    {tabs.map((t) => (
                        <button
                            key={t.id} role="tab" type="button" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
                            className={`relative px-3 py-2 text-xs font-bold transition ${tab === t.id ? "text-[#E87A24]" : "text-slate-500 hover:text-[#422026]"}`}
                        >
                            {t.label}
                            {tab === t.id && <motion.span layoutId="drawer-tab" className="absolute inset-x-0 -bottom-px h-0.5 bg-[#E87A24]" />}
                        </button>
                    ))}
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-4">
                        {tab === "details" && (
                            <>
                                {can.edit && (
                                    <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
                                        <h3 className="mb-2 text-base font-bold text-[#422026]">Lead status</h3>
                                        <AppSelect
                                            compact isClearable={false} options={MANUAL_STATUS_OPTIONS}
                                            value={hasActive ? { value: lead.status, label: LEAD_STATUS[lead.status].label } : manualValue}
                                            isDisabled={hasActive || !!busy[`status-${lead.id}`]} isLoading={!!busy[`status-${lead.id}`]}
                                            onChange={(o) => o.value !== lead.status && onStatusChange(lead, o.value)}
                                            placeholder={LEAD_STATUS[lead.status]?.label}
                                        />
                                        <p className="mt-1.5 text-[11px] text-slate-400">
                                            {hasActive ? "Complete or cancel the active meeting to change the status manually." : "Meeting statuses update automatically from the Meetings tab."}
                                        </p>
                                    </section>
                                )}
                                <Card title="Lead">
                                    <Row label="Type">{labelFor("leadType", lead.leadType)}</Row>
                                    <Row label="Source">{labelFor("leadSource", lead.leadSource)}</Row>
                                    <Row label="Channel">{lead.leadChannel ? labelFor("leadChannel", lead.leadChannel) : ""}</Row>
                                    <Row label="Inquiry date">{fmtDate(lead.inquiryDate)}</Row>
                                    <Row label="Next follow-up">{lead.nextFollowUpDate ? fmtDate(lead.nextFollowUpDate) : ""}</Row>
                                </Card>
                                <Card title="Organization">
                                    <Row label="Name">{lead.organizationName}</Row>
                                    <Row label="Type">{lead.organizationType ? labelFor("organizationType", lead.organizationType) : ""}</Row>
                                    <Row label="Website">
                                        {lead.website && <a href={/^https?:/i.test(lead.website) ? lead.website : `https://${lead.website}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-[#4A76C0] hover:underline"><Link2 size={12} />{lead.website}</a>}
                                    </Row>
                                    <Row label="Address">{location}</Row>
                                </Card>
                                <Card title="Contact person">
                                    <Row label="Name">{lead.contactPerson}</Row>
                                    <Row label="Role">{lead.businessRole ? labelFor("businessRole", lead.businessRole) : ""}</Row>
                                    <Row label="Mobile">{lead.mobile}</Row>
                                    <Row label="Alternative">{lead.alternateMobile}</Row>
                                    <Row label="Email">{lead.email}</Row>
                                </Card>
                                <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
                                    <h3 className="mb-3 text-base font-bold text-[#422026]">Interested services</h3>
                                    <ServiceChips values={lead.servicesInterested} full />
                                </section>
                                <Card title="Ownership">
                                    <Row label="Lead taken by">{labelFor("leadTakenBy", lead.leadTakenBy)}</Row>
                                    <Row label="Assigned CRO">{labelFor("assignedCRO", lead.assignedCRO)}</Row>
                                    <Row label="Branch">{labelFor("assignedBranch", lead.assignedBranch)}</Row>
                                    <Row label="Created by">{lead.createdBy?.name}</Row>
                                    <Row label="Created on">{fmtDateTime(lead.createdAt)}</Row>
                                </Card>
                                {(lead.description || lead.remarks) && (
                                    <section className="space-y-3 rounded-2xl border border-[#E2E8F0] bg-white p-4">
                                        {lead.description && <Row label="Inquiry description"><span className="whitespace-pre-line">{lead.description}</span></Row>}
                                        {lead.remarks && <Row label="Internal remarks"><span className="whitespace-pre-line">{lead.remarks}</span></Row>}
                                    </section>
                                )}
                            </>
                        )}

                        {tab === "meetings" && (
                            meetings.length ? (
                                meetings.map((m) => (
                                    <MeetingCard
                                        key={m.id} m={m} lead={lead} labelFor={labelFor} can={can} busy={busy}
                                        onEdit={onEditMeeting}
                                        onStatus={(mt, s) => (s === "cancelled" ? setCancelTarget(mt) : onMeetingStatus(mt, s))}
                                    />
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-[#E2E8F0] bg-white px-4 py-10 text-center">
                                    <Users size={26} className="mx-auto text-slate-300" />
                                    <p className="mt-2 text-sm font-bold text-[#422026]">No meetings yet</p>
                                    <p className="mt-1 text-xs text-slate-500">Schedule one from this lead — its details are filled in for you.</p>
                                    {can.schedule && eligible && <Button className="mt-4" icon={CalendarPlus} onClick={() => onConvert(lead)}>Lead to Meeting</Button>}
                                </div>
                            )
                        )}

                        {tab === "activity" && (
                            <ol className="relative space-y-4 rounded-2xl border border-[#E2E8F0] bg-white p-4">
                                {lead.activity.map((a) => (
                                    <li key={a.id} className="relative pl-5">
                                        <span className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-[#E87A24]" />
                                        <p className="text-sm text-[#422026]">{a.text}</p>
                                        <p className="text-[11px] text-slate-400">{fmtDateTime(a.at)} · {a.by?.name}</p>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {cancelTarget && (
                    <ConfirmDialog
                        title="Cancel this meeting?" confirmLabel="Cancel meeting" loading={!!busy[`meeting-${cancelTarget.id}-cancelled`]}
                        onConfirm={confirmCancel} onCancel={() => setCancelTarget(null)}
                    >
                        <p>
                            <span className="font-bold">{cancelTarget.meetingId}</span> on {fmtDate(cancelTarget.date)}, {fmtTime(cancelTarget.time)} will be marked
                            Cancelled. The record is kept, and the lead returns to Follow-up so you can schedule again.
                        </p>
                    </ConfirmDialog>
                )}
            </AnimatePresence>
        </Drawer>
    );
}

// ===============================================================
// MeetingModal.jsx
// ===============================================================
const MeetInfo = ({ label, children }) => (
    <div className="min-w-0">
        <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</dt>
        <dd className="mt-0.5 truncate text-xs font-bold text-[#422026]">{children || "—"}</dd>
    </div>
);

const uniqueBy = (list) => [...new Map(list.map((o) => [o.value, o])).values()];

function MeetingModal({ mode = "create", lead, meeting, hasActiveMeeting, lookups, labelFor, onSubmit, onClose }) {
    const isEdit = mode === "edit";

    const clientParticipant = useMemo(
        () => ({ value: `client:${lead.id}`, label: `${lead.contactPerson} (Client)` }),
        [lead]
    );
    const participantOptions = useMemo(
        () => uniqueBy([...lookups.croOptions, ...lookups.leadTakenByOptions, clientParticipant]),
        [lookups, clientParticipant]
    );
    const croOf = (v) => lookups.croOptions.find((o) => o.value === v) || (v ? { value: v, label: labelFor("assignedCRO", v) } : null);

    const [f, setF] = useState(() => {
        if (isEdit) {
            return {
                type: meeting.type,
                purpose: MEETING_PURPOSES.find((p) => p.value === meeting.purpose) || (meeting.purpose ? { value: meeting.purpose, label: meeting.purpose } : null),
                date: meeting.date, time: meeting.time,
                location: meeting.location || "", meetingLink: meeting.meetingLink || "",
                participants: meeting.participants || [],
                assignedCRO: croOf(meeting.assignedCRO),
                agenda: meeting.agenda || "", remarks: meeting.remarks || "",
                status: meeting.status, rescheduleReason: "",
            };
        }
        const followUp = lead.nextFollowUpDate && lead.nextFollowUpDate >= todayStr() ? lead.nextFollowUpDate : addDays(1);
        const cro = croOf(lead.assignedCRO);
        return {
            type: "physical", purpose: null, date: followUp, time: "11:00",
            location: "", meetingLink: "",
            participants: [cro, clientParticipant].filter(Boolean),
            assignedCRO: cro, agenda: "", remarks: "",
        };
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const set = (k, v) => {
        setF((p) => ({ ...p, [k]: v }));
        if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
    };

    const moved = isEdit && ACTIVE_MEETING.includes(meeting.status) && (f.date !== meeting.date || f.time !== meeting.time);
    const blocked = !isEdit && hasActiveMeeting;
    const isVirtual = f.type === "virtual";

    const validate = () => {
        const e = {};
        if (!f.purpose) e.purpose = "Select or type a purpose";
        if (!f.date) e.date = "Meeting date is required";
        else if ((!isEdit || moved) && f.date < todayStr()) e.date = "Date cannot be in the past";
        if (!f.time) e.time = "Meeting time is required";
        else if (f.date === todayStr() && (!isEdit || moved)) {
            const now = new Date();
            const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
            if (f.time < hhmm) e.time = "Time has already passed today";
        }
        if (isVirtual) {
            if (!f.meetingLink.trim()) e.meetingLink = "Add the online meeting link";
            else if (!/^https?:\/\/\S+\.\S+/i.test(f.meetingLink.trim())) e.meetingLink = "Enter a full link starting with https://";
        } else if (!f.location.trim()) e.location = "Add the meeting location";
        if (!f.assignedCRO) e.assignedCRO = "Select the responsible CRO";
        if (!f.participants.length) e.participants = "Add at least one participant";
        return e;
    };

    const submit = async (ev) => {
        ev.preventDefault();
        if (saving || blocked) return;
        const e = validate();
        setErrors(e);
        if (Object.keys(e).length) return;
        setSaving(true);
        setSubmitError("");
        try {
            await onSubmit({
                type: f.type,
                purpose: f.purpose.value,
                date: f.date, time: f.time,
                location: isVirtual ? "" : f.location.trim(),
                meetingLink: isVirtual ? f.meetingLink.trim() : "",
                participants: f.participants.map(({ value, label }) => ({ value, label })),
                assignedCRO: f.assignedCRO.value,
                agenda: f.agenda.trim(), remarks: f.remarks.trim(),
                ...(isEdit ? { status: f.status, rescheduleReason: moved ? f.rescheduleReason.trim() : "" } : {}),
            });
        } catch (err) {
            setSubmitError(err?.message || "Could not save the meeting. Please try again.");
            setSaving(false);
        }
    };

    const typeBtn = (value, Icon, text) => (
        <button
            type="button" role="radio" aria-checked={f.type === value} onClick={() => set("type", value)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition ${f.type === value ? "border-[#E87A24] bg-[#E87A24]/10 text-[#C2410C]" : "border-[#E2E8F0] bg-[#F8FAFC] text-slate-500 hover:bg-white"
                }`}
        >
            <Icon size={15} /> {text}
        </button>
    );

    const statusOptions = ["scheduled", "completed", "cancelled"].map((v) => ({ value: v, label: MEETING_STATUS[v].label }));

    return (
        <form onSubmit={submit} noValidate>
            {/* rendered inside <Modal> by the parent */}
            <div className="space-y-5 px-4 py-4 sm:px-5">
                {blocked && (
                    <div role="alert" className="flex items-start gap-2 rounded-xl border border-[#F59E0B]/40 bg-[#FEF3C7] p-3 text-xs text-[#92400E]">
                        <AlertCircle size={15} className="mt-px shrink-0" />
                        This lead already has an active meeting. Edit or complete it from the lead's Meetings tab instead of creating a duplicate.
                    </div>
                )}

                <section className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
                    <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-[#64748B]">From the lead — already filled in</p>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-3">
                        <MeetInfo label="Lead ID">{lead.leadId}</MeetInfo>
                        <MeetInfo label="Organization">{lead.organizationName}</MeetInfo>
                        <MeetInfo label="Contact person">{lead.contactPerson}</MeetInfo>
                        <MeetInfo label="Mobile">{lead.mobile}</MeetInfo>
                        <MeetInfo label="Email">{lead.email}</MeetInfo>
                        <MeetInfo label="Branch">{labelFor("assignedBranch", lead.assignedBranch)}</MeetInfo>
                    </dl>
                    <div className="mt-2.5"><ServiceChips values={lead.servicesInterested} /></div>
                </section>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Meeting Type" required className="sm:col-span-2">
                        <div role="radiogroup" aria-label="Meeting type" className="flex gap-2">
                            {typeBtn("physical", MapPin, "Physical")}
                            {typeBtn("virtual", Video, "Virtual")}
                        </div>
                    </Field>

                    <Field label="Meeting Purpose" required htmlFor="mt-purpose" error={errors.purpose}>
                        <AppSelect
                            creatable inputId="mt-purpose" options={MEETING_PURPOSES} value={f.purpose} placeholder="Select or type a purpose"
                            invalid={!!errors.purpose} formatCreateLabel={(v) => `Use "${v}"`} onChange={(v) => set("purpose", v)}
                        />
                    </Field>

                    <Field label="Assigned CRO" required icon={Headset} htmlFor="mt-cro" error={errors.assignedCRO}>
                        <AppSelect inputId="mt-cro" options={lookups.croOptions} value={f.assignedCRO} placeholder="Select CRO" invalid={!!errors.assignedCRO} onChange={(v) => set("assignedCRO", v)} />
                    </Field>

                    <Field label="Meeting Date" required icon={CalendarClock} htmlFor="mt-date" error={errors.date}>
                        <TextInput id="mt-date" type="date" min={isEdit && !moved ? undefined : todayStr()} value={f.date} invalid={!!errors.date} onChange={(e) => set("date", e.target.value)} />
                    </Field>
                    <Field label="Meeting Time" required icon={Clock} htmlFor="mt-time" error={errors.time}>
                        <TextInput id="mt-time" type="time" value={f.time} invalid={!!errors.time} onChange={(e) => set("time", e.target.value)} />
                    </Field>

                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div key={f.type} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.14 }} className="sm:col-span-2">
                            {isVirtual ? (
                                <Field label="Online Meeting Link" required icon={Link2} htmlFor="mt-link" error={errors.meetingLink}>
                                    <TextInput id="mt-link" type="url" placeholder="https://meet.google.com/…" value={f.meetingLink} invalid={!!errors.meetingLink} onChange={(e) => set("meetingLink", e.target.value)} />
                                </Field>
                            ) : (
                                <Field label="Meeting Location" required icon={MapPin} htmlFor="mt-loc" error={errors.location}>
                                    <TextInput id="mt-loc" placeholder="Office, address or landmark" value={f.location} invalid={!!errors.location} onChange={(e) => set("location", e.target.value)} />
                                </Field>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    <Field label="Participants" required icon={Users} htmlFor="mt-people" error={errors.participants} className="sm:col-span-2" hint="Pick colleagues, or type a name to add anyone else.">
                        <AppSelect
                            creatable isMulti inputId="mt-people" options={participantOptions} value={f.participants} isClearable={false}
                            placeholder="Search or add participants" closeMenuOnSelect={false} invalid={!!errors.participants}
                            formatCreateLabel={(v) => `Add "${v}"`} getNewOptionData={(v) => ({ value: `ext:${v}`, label: v })}
                            onChange={(v) => set("participants", v || [])}
                        />
                    </Field>

                    <Field label="Meeting Agenda" htmlFor="mt-agenda" className="sm:col-span-2">
                        <TextArea id="mt-agenda" rows={3} placeholder="Topics to cover" value={f.agenda} onChange={(e) => set("agenda", e.target.value)} />
                    </Field>
                    <Field label="Additional Remarks" htmlFor="mt-remarks" className="sm:col-span-2">
                        <TextArea id="mt-remarks" rows={2} value={f.remarks} onChange={(e) => set("remarks", e.target.value)} />
                    </Field>

                    {isEdit && (
                        <Field label="Meeting Status" htmlFor="mt-status" hint={moved ? "Changing the date or time marks this meeting Rescheduled." : undefined}>
                            <AppSelect
                                compact isClearable={false} inputId="mt-status" options={statusOptions}
                                value={statusOptions.find((o) => o.value === f.status) || { value: f.status, label: MEETING_STATUS[f.status]?.label }}
                                onChange={(o) => set("status", o.value)} isDisabled={moved}
                            />
                        </Field>
                    )}
                    <AnimatePresence initial={false}>
                        {moved && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden sm:col-span-2">
                                <div className="rounded-xl border border-[#F59E0B]/40 bg-[#FEF3C7]/60 p-3">
                                    <p className="mb-2 text-xs text-[#92400E]">
                                        Rescheduling from <span className="font-bold">{fmtDate(meeting.date)}</span>. The previous schedule stays in the meeting history.
                                    </p>
                                    <Field label="Reason for rescheduling" htmlFor="mt-reason">
                                        <TextInput id="mt-reason" placeholder="e.g. Client requested a later date" value={f.rescheduleReason} onChange={(e) => set("rescheduleReason", e.target.value)} />
                                    </Field>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {submitError && (
                    <div role="alert" className="flex items-start gap-2 rounded-xl border border-[#DC2626]/25 bg-[#DC2626]/5 p-3 text-xs text-[#B91C1C]">
                        <AlertCircle size={15} className="mt-px shrink-0" /> {submitError}
                    </div>
                )}
            </div>

            <div className="sticky bottom-0 flex justify-end gap-2 border-t border-[#E2E8F0] bg-white px-4 py-3 sm:px-5">
                <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
                <Button type="submit" icon={isEdit ? Save : CalendarPlus} loading={saving} disabled={blocked}>
                    {saving ? "Saving…" : isEdit ? "Save Meeting" : "Schedule Meeting"}
                </Button>
            </div>
        </form>
    );
}

// ===============================================================
// LeadManagement.jsx
// ===============================================================
const ALL_PERMISSIONS = { create: true, edit: true, delete: true, schedule: true, editMeeting: true };


export default function LeadMgmt({
    service = leadService,
    currentUser = mockUser,
    leadTakenByOptions = mockLookups.leadTakenByOptions,
    croOptions = mockLookups.croOptions,
    branchOptions = mockLookups.branchOptions,
    locationData = mockLocationData,
    permissions,
}) {
    const can = { ...ALL_PERMISSIONS, ...permissions };
    const lookups = useMemo(() => ({ leadTakenByOptions, croOptions, branchOptions }), [leadTakenByOptions, croOptions, branchOptions]);
    const labelFor = useMemo(() => makeLabeler(lookups), [lookups]);
    const user = useMemo(() => ({ id: currentUser.id, name: currentUser.name }), [currentUser.id, currentUser.name]);

    const { leads, meetings, loading, loadError, reload, busy, actions } = useLeadManagement(service, user);
    const toast = useToasts();

    // ---- UI state ----
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [formOpen, setFormOpen] = useState(false);
    const [editingLead, setEditingLead] = useState(null);
    const [formNonce, setFormNonce] = useState(0);
    const [formDirty, setFormDirty] = useState(false);
    const [discard, setDiscard] = useState(null); // { run }
    const [drawerId, setDrawerId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [meetingModal, setMeetingModal] = useState(null); // { mode, leadId, meetingId }
    const [highlightId, setHighlightId] = useState(null);
    const formRef = useRef(null);
    const tableRef = useRef(null);

    const stats = useMemo(() => computeStats(leads, meetings), [leads, meetings]);
    const drawerLead = leads.find((l) => l.id === drawerId) || null;
    const modalLead = meetingModal ? leads.find((l) => l.id === meetingModal.leadId) : null;
    const modalMeeting = meetingModal?.meetingId ? meetings.find((m) => m.id === meetingModal.meetingId) : null;

    // close overlays if their record disappears (e.g. deleted)
    useEffect(() => { if (drawerId && !loading && !drawerLead) setDrawerId(null); }, [drawerId, drawerLead, loading]);
    useEffect(() => {
        if (!highlightId) return;
        const t = setTimeout(() => setHighlightId(null), 2500);
        return () => clearTimeout(t);
    }, [highlightId]);

    const scrollTo = (ref) => setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);

    // ---- form open / close with unsaved-changes guard ----
    const guard = (run) => (formOpen && formDirty ? setDiscard({ run }) : run());
    const resetForm = () => { setFormDirty(false); setEditingLead(null); setFormNonce((n) => n + 1); };
    const closeForm = () => { setFormOpen(false); resetForm(); };
    const openNew = () => guard(() => { resetForm(); setFormOpen(true); scrollTo(formRef); });
    const toggleForm = () => (formOpen ? guard(closeForm) : openNew());
    const startEdit = (lead) => guard(() => {
        setDrawerId(null); setEditingLead(lead); setFormDirty(false); setFormNonce((n) => n + 1); setFormOpen(true); scrollTo(formRef);
    });

    const setStatusFilter = (key) => { setFilters({ ...EMPTY_FILTERS, status: key }); scrollTo(tableRef); };

    // ---- actions (success/error feedback lives here) ----
    const fail = (title) => (e) => { toast.error(title, e?.message); throw e; };

    const submitLead = async (payload) => {
        if (editingLead) {
            const lead = await actions.updateLead(editingLead.id, payload).catch(fail("Couldn't update lead"));
            toast.success("Lead updated", `${lead.leadId} · ${lead.organizationName}`);
            closeForm();
            setHighlightId(lead.id);
        } else {
            const lead = await actions.createLead(payload).catch(fail("Couldn't register lead"));
            toast.success("Lead registered", `${lead.leadId} · ${lead.organizationName}`);
            closeForm();
            setFilters(EMPTY_FILTERS);
            setHighlightId(lead.id);
            scrollTo(tableRef);
        }
    };

    const confirmDelete = async () => {
        const lead = deleteTarget;
        try {
            await actions.removeLead(lead.id);
            toast.success("Lead deleted", `${lead.leadId} · ${lead.organizationName}`);
            setDeleteTarget(null);
        } catch (e) {
            toast.error("Couldn't delete lead", e.message);
        }
    };

    const changeStatus = async (lead, status) => {
        try {
            await actions.changeStatus(lead.id, status);
            toast.success("Status updated", `${lead.leadId} is now ${status.replace(/_/g, " ")}`);
        } catch (e) {
            toast.error("Couldn't update status", e.message);
        }
    };

    const openConvert = (lead) => {
        if (getActiveMeeting(lead.id, meetings)) {
            toast.info("Meeting already scheduled", "Edit it from the lead's Meetings tab.");
            return setDrawerId(lead.id);
        }
        setMeetingModal({ mode: "create", leadId: lead.id });
    };

    const submitMeeting = async (payload) => {
        if (meetingModal.mode === "edit") {
            const m = await actions.editMeeting(meetingModal.meetingId, payload).catch(fail("Couldn't update meeting"));
            toast.success("Meeting updated", `${m.meetingId} is ${m.status}`);
        } else {
            const m = await actions.scheduleMeeting(meetingModal.leadId, payload).catch(fail("Couldn't schedule meeting"));
            toast.success("Meeting scheduled", `${m.meetingId} linked to ${modalLead.leadId}`);
            setDrawerId(modalLead.id);
        }
        setMeetingModal(null);
    };

    const meetingStatus = async (m, status) => {
        try {
            await actions.editMeeting(m.id, { status }, `meeting-${m.id}-${status}`);
            toast.success(`Meeting ${status}`, m.meetingId);
        } catch (e) {
            toast.error("Couldn't update meeting", e.message);
        }
    };

    const rowHandlers = useMemo(
        () => ({ view: (l) => setDrawerId(l.id), edit: startEdit, convert: openConvert, remove: (l) => setDeleteTarget(l) }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [formOpen, formDirty, meetings]
    );

    const onDirty = useCallback((d) => setFormDirty(d), []);
    const deleteMeetingCount = deleteTarget ? meetings.filter((m) => m.leadId === deleteTarget.id).length : 0;

    return (
        <MotionConfig reducedMotion="user">
            <div className="min-h-screen bg-white p-3 font-['Roboto_Slab'] text-[#422026] sm:p-5 lg:p-6">
                <div className="mx-auto max-w-[1450px] space-y-5">
                    {/* PAGE HEADER */}
                    <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E87A24] text-white shadow-sm">
                                <UserPlus size={21} />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold sm:text-2xl">Lead Management</h1>
                                <nav aria-label="Breadcrumb" className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                                    <span>CRM</span><ChevronRight size={12} /><span className="font-bold text-[#E87A24]">Leads</span>
                                </nav>
                            </div>
                        </div>
                        {can.create && (
                            <Button icon={formOpen ? X : Plus} variant={formOpen ? "secondary" : "primary"} onClick={toggleForm} aria-expanded={formOpen}>
                                {formOpen ? "Close form" : "New Lead"}
                            </Button>
                        )}
                    </header>

                    <LeadStats stats={stats} loading={loading} activeStatus={filters.status} onSelect={setStatusFilter} />

                    {/* REGISTRATION / EDIT FORM */}
                    <div ref={formRef} className="scroll-mt-4">
                        <AnimatePresence initial={false}>
                            {formOpen && (
                                <motion.div
                                    key="form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.25 }} className="overflow-hidden"
                                >
                                    <LeadForm
                                        key={editingLead ? editingLead.id : `new-${formNonce}`}
                                        initialLead={editingLead}
                                        lookups={lookups}
                                        locationData={locationData}
                                        existingLeads={leads}
                                        currentUser={user}
                                        onSubmit={submitLead}
                                        onCancel={() => guard(closeForm)}
                                        onDirtyChange={onDirty}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* TABLE */}
                    <div ref={tableRef} className="scroll-mt-4">
                        <LeadTable
                            leads={leads} meetings={meetings} loading={loading} loadError={loadError} onRetry={reload}
                            filters={filters} setFilters={setFilters} lookups={lookups} labelFor={labelFor}
                            highlightId={highlightId} can={can} busy={busy} on={rowHandlers} onNew={openNew}
                        />
                    </div>
                </div>

                {/* DETAILS DRAWER */}
                <AnimatePresence>
                    {drawerLead && (
                        <LeadDrawer
                            key="drawer" lead={drawerLead} allMeetings={meetings}
                            meetings={meetings.filter((m) => m.leadId === drawerLead.id)}
                            labelFor={labelFor} can={can} busy={busy}
                            onClose={() => setDrawerId(null)} onEdit={startEdit} onConvert={openConvert}
                            onEditMeeting={(m) => setMeetingModal({ mode: "edit", leadId: drawerLead.id, meetingId: m.id })}
                            onMeetingStatus={meetingStatus} onStatusChange={changeStatus}
                        />
                    )}
                </AnimatePresence>

                {/* LEAD TO MEETING */}
                <AnimatePresence>
                    {meetingModal && modalLead && (
                        <Modal
                            key="meeting"
                            icon={CalendarPlus}
                            title={meetingModal.mode === "edit" ? "Edit Meeting" : "Convert Lead to Meeting"}
                            subtitle={meetingModal.mode === "edit" ? modalMeeting?.meetingId : `${modalLead.leadId} · ${modalLead.organizationName}`}
                            size="max-w-3xl" onClose={() => setMeetingModal(null)} busy={!!busy["save-meeting"]}
                        >
                            <MeetingModal
                                mode={meetingModal.mode} lead={modalLead} meeting={modalMeeting}
                                hasActiveMeeting={!!getActiveMeeting(modalLead.id, meetings)}
                                lookups={lookups} labelFor={labelFor}
                                onSubmit={submitMeeting} onClose={() => setMeetingModal(null)}
                            />
                        </Modal>
                    )}
                </AnimatePresence>

                {/* DELETE CONFIRM */}
                <AnimatePresence>
                    {deleteTarget && (
                        <ConfirmDialog
                            key="delete" title="Delete this lead?" confirmLabel="Delete lead"
                            loading={!!busy[`delete-${deleteTarget.id}`]} onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)}
                        >
                            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                                <p className="text-[11px] font-bold text-[#4A76C0]">{deleteTarget.leadId}</p>
                                <p className="font-bold">{deleteTarget.organizationName}</p>
                                <p className="text-xs text-slate-500">{deleteTarget.contactPerson} · {deleteTarget.mobile}</p>
                            </div>
                            <p className="text-xs text-slate-600">
                                This can't be undone.
                                {deleteMeetingCount > 0 && ` ${deleteMeetingCount} linked meeting${deleteMeetingCount > 1 ? "s" : ""} will be removed too.`}
                            </p>
                        </ConfirmDialog>
                    )}
                </AnimatePresence>

                {/* UNSAVED CHANGES */}
                <AnimatePresence>
                    {discard && (
                        <ConfirmDialog
                            key="discard" title="Discard unsaved changes?" confirmLabel="Discard" tone="primary"
                            onConfirm={() => { const run = discard.run; setDiscard(null); setFormDirty(false); run(); }}
                            onCancel={() => setDiscard(null)}
                        >
                            <p>The lead form has changes that haven't been saved. They'll be lost if you continue.</p>
                        </ConfirmDialog>
                    )}
                </AnimatePresence>

                <ToastHost toasts={toast.toasts} dismiss={toast.dismiss} />
            </div>
        </MotionConfig>
    );
}