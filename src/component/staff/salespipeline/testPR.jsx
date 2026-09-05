import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
    Home, Building2, Calendar, FileText, Paperclip,
    Sparkles, Bot, MessageCircle, Users, Trash2,
    X, CheckCircle, AlertTriangle, Loader2, Activity,
    Mail, UploadCloud, AlignLeft, Printer,
    BadgeCheck, BriefcaseBusiness, Hash, MapPin, Phone, Save, User,
    ArrowLeftCircle, Plus,
    Bold, Italic, Underline, ListOrdered, List, GraduationCap,
    Percent, UserCircle, ArrowRight, Circle, XCircle, Check, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
} from 'lucide-react';
import DOMPurify from 'dompurify';
import { renderAsync } from 'docx-preview';
import Select from "react-select";

import { useReactToPrint } from "react-to-print";

import { UseAdd } from "../../hooks/useadd";
import { useGet } from "../../hooks/useGet";

import { ValidateStyle } from "../../../data/data";
import { ErrorNotify, SuccessNotify, waitingNotify } from "../../hotToaster";
import DateUsage from '../../nepalidate/dateUsage';

import { BuildBackSideDocx } from "./innerHelper/stage5/backSide";
import { ClientCreateCredential } from './innerHelper/stage5/clientLoginFroms';
import { useContractCalculator } from './innerHelper/stage5/contract/contractCalculation';
import { BuildSlaDocx } from './innerHelper/stage5/contract/contractpage';

// --- FONTS ---
const fontLight = { fontFamily: "'Roboto Slab', serif", fontWeight: 300 };
const fontBold = { fontFamily: "'Roboto Slab', serif", fontWeight: 700 };

// --- MOCK API / INITIAL STATE ---
const initialActivities = [];

// =========================================================================
// ORGANIZATION FORM UTILITIES & CONSTANTS
// =========================================================================

const formatToYYYYMMDD = (date) => {
    if (!date) return '';
    if (typeof date === 'string') return date;
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const editableFields = [
    { name: "organizationName", label: "Organization Name", type: "text", icon: Building2, placeholder: "Enter organization name" },
    {
        name: "organizationType", label: "Organization Type", type: "select", icon: BriefcaseBusiness, multiple: false,
        options: [
            { label: "Private Limited", value: "private_limited" },
            { label: "Public Limited", value: "public_limited" },
            { label: "School", value: "school" },
            { label: "College", value: "college" },
            { label: "NGO", value: "ngo" },
            { label: "Government", value: "government" },
        ],
    },
    {
        name: "industyType", label: "Industry Type", type: "select", multiple: true, icon: BriefcaseBusiness,
        options: [
            { label: "IT", value: "it", color: "#3b82f6" },
            { label: "Education", value: "education", color: "#8b5cf6" },
            { label: "Travel & Tourism", value: "travel_tourism", color: "#06b6d4" },
            { label: "Manufacturing", value: "manufacturing", color: "#f59e0b" },
            { label: "Healthcare", value: "healthcare", color: "#ef4444" },
            { label: "Construction", value: "construction", color: "#f97316" },
            { label: "Trading", value: "trading", color: "#84cc16" },
            { label: "Consultancy", value: "consultancy", color: "#6366f1" },
            { label: "Food & Beverage", value: "food_beverage", color: "#ea580c" },
            { label: "Hospitality (Hotels/Resorts)", value: "hospitality", color: "#ec4899" },
            { label: "Logistics & Transportation", value: "logistics", color: "#0ea5e9" },
            { label: "Energy & Utilities", value: "energy", color: "#22c55e" },
            { label: "Financial Services", value: "finance", color: "#14b8a6" },
        ],
        placeholder: "IT/Software, Education",
    },
    { name: "registrationNumber", label: "Registration Number", type: "text", icon: Hash, placeholder: "REG-123456" },
    { name: "vatPan", label: "VAT / PAN", type: "text", icon: BadgeCheck, placeholder: "PAN-987654" },
    { name: "date", label: "Project Start Date", type: "date", icon: Calendar, placeholder: "Choose Date." },

    // Updated Location Fields
    { name: "address", label: "Address", type: "text", icon: MapPin, placeholder: "Kathmandu, Nepal" },
    { name: "province", label: "Province", type: "text", icon: MapPin, placeholder: "Bagmati" },
    { name: "provinceNumber", label: "Province Number", type: "number", icon: Hash, placeholder: "3" },
    { name: "district", label: "District", type: "text", icon: MapPin, placeholder: "Kathmandu" },
    { name: "localLevel", label: "Local Level", type: "text", icon: MapPin, placeholder: "Kathmandu Metropolitan" },

    // Contact Info
    { name: "orgTelephone", label: "Organization Telephone", type: "text", icon: Phone, placeholder: "01-4123456" },
    { name: "orgEmail", label: "Organization Email", type: "email", icon: Mail, placeholder: "info@organization.com" },
    { name: "contactPersonName", label: "Contact Person Name", type: "text", icon: User, placeholder: "Ram Bahadur" },
    {
        name: "role", label: "Role", type: "select", icon: BriefcaseBusiness, multiple: false,
        options: [
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
        ],
        placeholder: "Director",
    },
    { name: "contactPersonEmail", label: "Contact Person Email", type: "email", icon: Mail, placeholder: "client@example.com" },
    { name: "contactPersonNumber", label: "Contact Person Number", type: "text", icon: Phone, placeholder: "9841234567" },

    // Capacity & Grade Levels
    { name: "totalEducator", label: "Total Educator", type: "number", icon: Users, placeholder: "10" },
    { name: "totalEmp_learners", label: "Total Employees / Learners", type: "number", icon: Users, placeholder: "50" },
    { name: "fromGrade", label: "From Grade", type: "text", icon: GraduationCap, placeholder: "Nursery" },
    { name: "toGrade", label: "To Grade", type: "text", icon: GraduationCap, placeholder: "Class 12" },

    { name: "discounted", label: "Discount", type: "number", icon: Hash, placeholder: "0" },
];

const isEmptyValue = (value, field) => {
    if (value === null || value === undefined) return true;
    if (typeof value === "string" && value.trim() === "") return true;
    if (Array.isArray(value) && value.length === 0) return true;
    if (typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0) return true;
    if (field === "discounted" && value === 0) return false;
    return false;
};

const getDisplayValue = (field, value) => {
    if (field === "industyType") return Array.isArray(value) ? value.join(", ") : value || "";
    if (field === "discounted") return value ?? "0";
    return value ?? "";
};

const normalizeValue = (field, value) => {
    if (field === "totalEducator" || field === "totalEmp_learners" || field === "discounted" || field === "provinceNumber") {
        return value === "" ? 0 : Number(value);
    }
    if (field === "industyType") {
        return value ? value.map((item) => item.trim()).filter(Boolean) : [];
    }
    return value;
};

const isEducationOrganization = (organization) => {
    if (Array.isArray(organization?.standard)) return organization.standard.includes("iso21001");
    return typeof organization?.standard === "string" && organization.standard.includes("iso21001");
};

const getOrganizationEmptyFields = (organization) => {
    const isEducationService = isEducationOrganization(organization);
    const fields = editableFields.filter((field) => {
        const capacityField = ["totalEducator", "totalEmp_learners", "fromGrade", "toGrade"].includes(field.name);
        if (!capacityField) return true;
        return isEducationService && ["totalEducator", "totalEmp_learners"].includes(field.name);
    });

    const emptyFields = fields
        .filter((field) => isEmptyValue(organization?.[field.name], field.name))
        .map((field) => field.label);

    if (isEducationService) {
        if (isEmptyValue(organization?.GradeFrom)) emptyFields.push("From Grade");
        if (isEmptyValue(organization?.GradeTo)) emptyFields.push("To Grade");
    } else if (!organization?.employeeRange) {
        emptyFields.push("Employee Range");
    }

    return emptyFields;
};

// =========================================================================
// MAIN COMPONENT
// =========================================================================

export default function TestContract({ id, setStage }) {
    const { final, printData, isLoading, status } = useContractCalculator(id?.mainID);
    // console.log(final,)
    // --- STATE ---
    const [activities, setActivities] = useState(initialActivities);
    const [activeTab, setActiveTab] = useState('Mail');
    const [organizations, setOrganizations] = useState([]);
    const [isLoadingOrg, setIsLoadingOrg] = useState(true);

    // UX / API States
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Email & Contract States
    const [msgTo, setMsgTo] = useState([]);
    const [emailInput, setEmailInput] = useState('');
    const [msgSubject, setMsgSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');
    const [printing, setPrinting] = useState(false);
    const [printingType, setPrintingType] = useState("");
    const [openCredential, setopenCredential] = useState(false);

    const [previewBlob, setPreviewBlob] = useState(null);
    const previewContainerRef = useRef(null);
    const { getOnlyOrgDetails_ } = useGet();
    const { SendTO_Contract } = UseAdd();

    // --- FETCH ORG DATA AT PARENT SCOPE FOR REAL-TIME SIDEBAR SYNC ---
    useEffect(() => {
        if (!id?.mainID) {
            setIsLoadingOrg(false);
            return;
        }
        setIsLoadingOrg(true);
        getOnlyOrgDetails_.mutate(
            { parms: { _id: id.mainID } },
            {
                onSuccess: (data) => {
                    const fetchedOrgs = data?.data?.organizationDetails;
                    if (fetchedOrgs && fetchedOrgs.length > 0) {
                        setOrganizations(fetchedOrgs);
                    } else {
                        setOrganizations([{}]);
                    }
                    setIsLoadingOrg(false);
                },
                onError: (err) => {
                    ErrorNotify("Failed to fetch organization details.");
                    setOrganizations([{}]);
                    setIsLoadingOrg(false);
                },
            }
        );
    }, [id?.mainID]);

    // Derived active profile metrics
    const currentOrg = organizations[0] || {};
    const orgEmptyFields = getOrganizationEmptyFields(currentOrg);
    const isOrgComplete = organizations.length > 0 && orgEmptyFields.length === 0;
    console.log(isOrgComplete, 'isOrgCompleteisOrgCompleteisOrgCompleteisOrgComplete')

    // --- AUTO FILL DEFAULT EMAIL ---
    useEffect(() => {
        if (currentOrg?.contactPersonEmail && msgTo.length === 0) {
            setMsgTo([currentOrg.contactPersonEmail]);
        }
    }, [currentOrg?.contactPersonEmail]);

    // --- RICH TEXT EDITOR STATES & REFS ---
    const editorRef = useRef(null);
    const [activeFormats, setActiveFormats] = useState({
        bold: false, italic: false, underline: false, orderedList: false, unorderedList: false,
    });


    const updateToolbar = () => {
        if (!editorRef.current) return;
        setActiveFormats({
            bold: document.queryCommandState("bold"),
            italic: document.queryCommandState("italic"),
            underline: document.queryCommandState("underline"),
            orderedList: document.queryCommandState("insertOrderedList"),
            unorderedList: document.queryCommandState("insertUnorderedList"),
        });
    };

    const exec = (command, value = null) => {
        document.execCommand(command, false, value);
        if (editorRef.current) editorRef.current.focus();
        updateToolbar();
    };

    useEffect(() => {
        document.addEventListener("selectionchange", updateToolbar);
        return () => document.removeEventListener("selectionchange", updateToolbar);
    }, []);

    const ToolbarButton = ({ onClick, isActive, icon: Icon, label }) => (
        <button
            type="button"
            onClick={(e) => { e.preventDefault(); onClick(); }}
            title={label}
            className={`p-1.5 rounded-md border transition-all ${isActive ? "bg-amber-100 text-amber-700 border-amber-300" : "bg-white text-gray-700 border-transparent hover:bg-gray-200"}`}
        >
            <Icon size={16} />
        </button>
    );

    const handleDeleteActivity = async (activityId) => {
        if (window.confirm("Are you sure you want to delete this record permanently?")) {
            waitingNotify("Removing record...");
            try {
                await new Promise(resolve => setTimeout(resolve, 400));
                setActivities(prev => prev.filter(act => act.id !== activityId));
                SuccessNotify("Record removed from timeline feed.");
            } catch (error) {
                ErrorNotify("Failed to delete record.");
            }
        }
    };

    // =========================================================================
    // API & SUBMIT LOGIC
    // =========================================================================

    const cancelForm = () => {
        setEmailBody('');
        if (editorRef.current) editorRef.current.innerHTML = '';
        setMsgSubject('');
        // Don't reset msgTo completely so default persists, or reset to default
        if (currentOrg?.contactPersonEmail) {
            setMsgTo([currentOrg.contactPersonEmail]);
        } else {
            setMsgTo([]);
        }
        setEmailInput('');
    };

    const handleSaveMessageAPI = async (payload) => {
        try {
            const data = await SendTO_Contract.mutateAsync({
                payload: payload,
                params: { MainID: id?.mainID }
            });
            SuccessNotify("Contract email sent successfully!");
            return data;
        } catch (error) {
            console.error('API Error occurred:', error);
            const errorMsg = error?.response?.data?.message || "Failed to send contract.";
            ErrorNotify(errorMsg);
            return false;
        }
    };

    const submitContractEmail = async () => {
        try {
            if (msgTo.length === 0) return ErrorNotify("Please add at least one recipient.");
            if (!emailBody || emailBody === "<br>" || emailBody.trim() === "") return ErrorNotify("Please fill in the Email Body.");

            // Start Loading immediately
            setIsSubmitting(true);
            waitingNotify("Preparing contract documents...");

            // YIELD to browser: Allows the UI to render the <Loader2> spinner smoothly BEFORE building the heavy document
            await new Promise(resolve => setTimeout(resolve, 50));

            // Create an array to hold all generated files
            const attachments = [];

            if (final !== null) {
                // 1. Generate the Main Contract Document
                const contractBlob = await BuildSlaDocx(final, printData);
                const contractFile = new File(
                    [contractBlob],
                    `SLA_Contract_${Date.now()}.docx`,
                    { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }
                );
                attachments.push(contractFile);

                // 2. Generate the Back Side Terms Document
                const backSideBlob = await BuildBackSideDocx();
                const backSideFile = new File(
                    [backSideBlob],
                    `SLA_Terms_And_Conditions_${Date.now()}.docx`,
                    { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }
                );
                attachments.push(backSideFile);
            }

            const cleanEmailBody = DOMPurify.sanitize(emailBody);
            const formData = new FormData();

            formData.append("to", JSON.stringify(msgTo));
            formData.append("subject", msgSubject || "New Contract");
            formData.append("content", cleanEmailBody);

            // Append all generated files to FormData
            attachments.forEach(file => {
                formData.append("file", file, file.name);
            });

            const responseData = await handleSaveMessageAPI(formData);

            if (responseData) {
                const newActivity = {
                    id: Date.now(),
                    subject: msgSubject || "New Contract",
                    to: [...msgTo],
                    content: cleanEmailBody,
                    // Dynamically map all generated files to the activity log
                    attachments: attachments.map(file => ({ name: file.name })),
                    timestamp: new Date().toISOString(),
                    author: "Current User" // Replace with logged-in user if available
                };

                setActivities(prevActivities => [newActivity, ...prevActivities]);
                cancelForm();
            }
        } catch (err) {
            // console.error("Contract Preparation/Print Error:", err);
            ErrorNotify("Failed to construct or send contract documents.");
        } finally {
            setIsSubmitting(false); // Stop loader here
        }
    };

    const handleAddEmail = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newEmail = emailInput.trim();

            if (!newEmail) return;
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) return ErrorNotify("Please enter a valid email address.");

            if (!msgTo.includes(newEmail) && msgTo.length < 5) {
                setMsgTo([...msgTo, newEmail]);
                setEmailInput('');
            } else if (msgTo.includes(newEmail)) {
                ErrorNotify("Email already added.");
            }
        }
    };

    const handlePreviewDocx = async () => {
        if (!final) {
            return ErrorNotify("Contract data is not ready yet.");
        }

        waitingNotify("Generating document preview...");
        try {
            const docBlob = await BuildSlaDocx(final, printData);
            // Save the blob to state to open the modal
            setPreviewBlob(docBlob);
            SuccessNotify("Preview generated successfully!");
        } catch (err) {
            console.error("Preview Generation Error:", err);
            ErrorNotify("Failed to generate document preview.");
        }
    };
    useEffect(() => {
        if (previewBlob && previewContainerRef.current) {
            renderAsync(previewBlob, previewContainerRef.current, null, {
                className: "docx-viewer", // Optional custom styling
                inWrapper: true,
                ignoreWidth: false,
                ignoreHeight: false,
            });
        }
    }, [previewBlob]);

    const handleOpenClientCredential = () => setopenCredential(true);
    const handleRemoveEmail = (indexToRemove) => setMsgTo(msgTo.filter((_, index) => index !== indexToRemove));

    return (
        <div className="h-screen overflow-hidden flex flex-col bg-[#f5f8fa] text-[#33475b] relative" style={fontLight}>

            <header className="flex-shrink-0 bg-white border-b border-[#cbd6e2] px-4 py-2 flex items-center justify-between shadow-sm z-10">
                <button className="flex items-center gap-2 bg-[#1a2d42] text-white px-4 py-1.5 rounded text-sm hover:bg-[#2c3f54] transition-colors cursor-pointer" style={fontBold} onClick={() => setStage(false)}>
                    <ArrowLeftCircle size={18} />
                </button>
                <div className="flex items-center gap-3">

                    <button
                        type="button"
                        onClick={handlePreviewDocx}
                        disabled={isSubmitting || !final}
                        style={fontBold}
                        className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-[12px] uppercase transition-colors ${!final || isSubmitting ? "cursor-not-allowed bg-slate-100 text-slate-400" : "bg-blue-50 cursor-pointer text-blue-600 hover:bg-blue-100"}`}
                    >
                        <FileText size={13} /> Preview Docx
                    </button>

                    <button
                        type="button"
                        onClick={handleOpenClientCredential}
                        className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-[12px] transition-colors bg-violet-50 cursor-pointer text-violet-600 hover:bg-violet-100"
                    >
                        <UserCircle size={13} />
                    </button>
                </div>


            </header>

            {/* DOCX PREVIEW MODAL */}
            {previewBlob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
                            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800">
                                <FileText size={20} className="text-blue-500" /> Document Preview
                            </h3>
                            <button
                                onClick={() => setPreviewBlob(null)}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 transition-colors hover:bg-red-200"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body (Where the Docx renders) */}
                        <div className="flex-1 overflow-auto bg-gray-100 p-6">
                            <div
                                ref={previewContainerRef}
                                className="mx-auto min-h-full max-w-[800px] bg-white shadow-sm"
                            ></div>
                        </div>
                    </div>
                </div>
            )}
            <main className="flex-1 overflow-hidden p-4 sm:p-6 max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

                {/* LEFT SIDEBAR - DYNAMIC DEAL & PROFILE INFO */}
                <aside className="lg:col-span-3 h-full overflow-y-auto flex flex-col gap-4 pr-1 scrollbar-thin">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex-shrink-0 transition-all">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2" style={fontBold}>
                                <div className="w-5 h-5 rounded-md bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                                    <Home size={12} />
                                </div>
                                Deal Context
                            </h2>
                        </div>

                        <div className="flex items-center gap-3 pb-5 mb-5 border-b border-slate-100">
                            <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center shadow-inner flex-shrink-0">
                                <Building2 size={22} />
                            </div>
                            <div>
                                <span className="text-[11px] text-slate-400 uppercase tracking-tight block" style={fontBold}>Organization</span>
                                <h1 className="text-base text-slate-900 leading-snug" style={fontBold}>
                                    {currentOrg?.organizationName || "Loading profile..."}
                                </h1>
                            </div>
                        </div>

                        <div className="space-y-3 text-xs" style={fontLight}>
                            <div className="flex items-center justify-between py-0.5">
                                <span className="text-slate-500 font-medium">Org Type</span>
                                <span className="capitalize text-slate-800 bg-slate-50 px-2 py-0.5 rounded border border-slate-100" style={fontBold}>
                                    {currentOrg?.organizationType ? currentOrg.organizationType.replace('_', ' ') : '—'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between py-0.5">
                                <span className="text-slate-500 font-medium">Reg Number</span>
                                <span className="text-slate-800 select-all" style={fontBold}>
                                    {currentOrg?.registrationNumber || '—'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between py-0.5">
                                <span className="text-slate-500 font-medium">VAT / PAN</span>
                                <span className="text-slate-800 select-all" style={fontBold}>
                                    {currentOrg?.vatPan || '—'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between py-0.5">
                                <span className="text-slate-500 font-medium">Project Start</span>
                                <span className="flex items-center gap-1.5 text-slate-700" style={fontBold}>
                                    <Calendar size={13} className="text-slate-400" />
                                    {currentOrg?.date || '—'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between pt-2 mt-2 border-t border-dashed border-slate-100">
                                <span className="text-slate-500 font-medium">Applied Discount</span>
                                <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full text-[11px]" style={fontBold}>
                                    <Percent size={11} strokeWidth={2.5} />
                                    {currentOrg?.discounted ?? 0} Off
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-shrink-0 overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
                            <h2 className="text-sm flex items-center gap-2 text-slate-800" style={fontBold}>
                                <FileText size={15} className="text-blue-500" />
                                Organization Specs
                            </h2>
                        </div>

                        <div className="p-5 space-y-5">
                            <div>
                                <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-2" style={fontBold}>
                                    Industry Profiles
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {currentOrg?.industyType && currentOrg.industyType.length > 0 ? (
                                        currentOrg.industyType.map((industry, index) => (
                                            <span key={index} className="bg-blue-50/60 text-blue-700 px-2.5 py-0.5 rounded-md text-[11px] border border-blue-100 capitalize transition-colors hover:bg-blue-100/70" style={fontLight}>
                                                {industry}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-slate-400 italic" style={fontLight}>
                                            No industry tags defined
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="pt-2">
                                <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-2.5" style={fontBold}>
                                    Demographics & Infrastructure
                                </div>
                                <div className="text-xs text-slate-700 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100 space-y-3">
                                    <div className="flex items-start gap-2.5">
                                        <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                                        <div className="leading-normal">
                                            <strong className="text-slate-500 block text-[11px]" style={fontBold}>Address</strong>
                                            <span className="text-slate-800" style={fontLight}>{currentOrg?.address || '—'}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2.5">
                                        <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                                        <div className="leading-normal">
                                            <strong className="text-slate-500 block text-[11px]" style={fontBold}>Location</strong>
                                            <span className="text-slate-800" style={fontLight}>
                                                {currentOrg?.localLevel ? currentOrg.localLevel + ', ' : ''}
                                                {currentOrg?.district ? currentOrg.district + ', ' : ''}
                                                {currentOrg?.province ? currentOrg.province : '—'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                                        <div className="bg-white p-2 rounded-lg border border-slate-100">
                                            <div className="flex items-center gap-1 text-slate-400 mb-0.5">
                                                <GraduationCap size={13} />
                                                <span className="text-[10px] uppercase tracking-tight" style={fontLight}>Educators</span>
                                            </div>
                                            <span className="text-slate-800 text-sm" style={fontBold}>{currentOrg?.totalEducator ?? 0}</span>
                                        </div>

                                        <div className="bg-white p-2 rounded-lg border border-slate-100">
                                            <div className="flex items-center gap-1 text-slate-400 mb-0.5">
                                                <Users size={13} />
                                                <span className="text-[10px] uppercase tracking-tight" style={fontLight}>Learners</span>
                                            </div>
                                            <span className="text-slate-800 text-sm" style={fontBold}>{currentOrg?.totalEmp_learners ?? 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* MIDDLE SECTION - ACTIVITY / COMPOSER */}
                <div className="lg:col-span-6 bg-white rounded-lg border border-[#cbd6e2] shadow-sm flex flex-col h-full overflow-hidden">
                    <div className="p-4 border-b border-[#cbd6e2] flex-shrink-0 flex items-center gap-6 bg-gray-50/30">
                        <button onClick={() => setActiveTab('Mail')} style={fontBold} className={`flex cursor-pointer items-center gap-2 pb-1 transition-all ${activeTab === 'Mail' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-800'}`}><Mail size={18} /> Mail</button>
                        <button onClick={() => setActiveTab('Forms')} style={fontBold} className={`flex cursor-pointer items-center gap-2 pb-1 transition-all ${activeTab === 'Forms' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-800'}`}><FileText size={18} /> Forms</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 scrollbar-thin">
                        {activeTab === 'Mail' && (
                            <div className="bg-white border border-[#cbd6e2] rounded-lg shadow-sm mb-6 transition-all">
                                <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded bg-blue-100 text-blue-600 flex items-center justify-center"><FileText size={16} /></div>
                                        <span style={fontBold}>Compose Contract Email</span>
                                    </div>
                                </div>
                                <div className="p-4 space-y-5 bg-gray-50/30">

                                    {/* MANDATORY FIELDS WARNING */}
                                    {!isOrgComplete && (
                                        <div className="mb-2 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 shadow-sm">
                                            <AlertTriangle className="mt-0.5 shrink-0 text-red-500" size={18} />
                                            <div className="flex-1">
                                                <h5 className="text-[13px] text-red-800" style={fontBold}>First fill all fields then submit.</h5>
                                                <p className="mt-0.5 text-[11px] text-red-700" style={fontLight}>Your organization profile is missing {orgEmptyFields.length} field(s). Please complete them in the Forms tab.</p>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="flex items-center gap-2 text-xs text-gray-600 mb-1.5" style={fontBold}><div className="p-1.5 rounded-md bg-blue-50 text-blue-500"><Mail size={14} /></div>Send To</label>
                                        <div className="w-full border border-slate-300 rounded p-2 text-sm focus-within:border-amber-500 shadow-sm bg-white flex flex-wrap items-center gap-2">
                                            {msgTo.map((email, index) => (
                                                <span key={index} style={fontBold} className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs border border-blue-200">
                                                    {email}
                                                    <button type="button" onClick={() => handleRemoveEmail(index)} disabled={isSubmitting} className="hover:text-red-500 hover:bg-white rounded-full w-4 h-4 flex items-center justify-center ml-1 cursor-pointer"><X size={10} /></button>
                                                </span>
                                            ))}
                                            {msgTo.length < 5 ? (
                                                <input type="text" disabled={isSubmitting} value={emailInput} onChange={(e) => setEmailInput(e.target.value)} onKeyDown={handleAddEmail} className="flex-1 focus:outline-none bg-transparent placeholder-gray-400 min-w-[200px]" style={fontLight} placeholder={msgTo.length === 0 ? "e.g. client@domain.com (Press Enter)" : "Add another email..."} />
                                            ) : (
                                                <span className="text-xs text-orange-500 py-1 flex items-center gap-1" style={fontBold}><AlertTriangle size={12} /> Max 5 recipients</span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-2 text-xs text-gray-600 mb-1.5" style={fontBold}><div className="p-1.5 rounded-md bg-orange-50 text-orange-500"><MessageCircle size={14} /></div>Subject</label>
                                        <input type="text" disabled={isSubmitting} value={msgSubject} onChange={(e) => setMsgSubject(e.target.value)} placeholder="Enter email subject..." style={fontLight} className="w-full border border-slate-300 rounded p-2 text-sm focus:border-amber-500 focus:outline-none shadow-sm" />
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-2 text-xs text-gray-600 mb-1.5" style={fontBold}><div className="p-1.5 rounded-md bg-orange-50 text-orange-500"><AlignLeft size={14} /></div>Email Body</label>
                                        <div className={`w-full border rounded shadow-sm bg-white overflow-hidden transition-colors ${isSubmitting ? "border-gray-200 bg-gray-50" : "border-slate-300 focus-within:border-amber-500"}`}>
                                            <div className="flex flex-wrap gap-1 p-1.5 border-b border-gray-200 bg-gray-50/50">
                                                <ToolbarButton onClick={() => exec("bold")} isActive={activeFormats.bold} icon={Bold} label="Bold" />
                                                <ToolbarButton onClick={() => exec("italic")} isActive={activeFormats.italic} icon={Italic} label="Italic" />
                                                <ToolbarButton onClick={() => exec("underline")} isActive={activeFormats.underline} icon={Underline} label="Underline" />
                                                <div className="w-px bg-gray-300 mx-1 my-1" />
                                                <ToolbarButton onClick={() => exec("insertOrderedList")} isActive={activeFormats.orderedList} icon={ListOrdered} label="Ordered List" />
                                                <ToolbarButton onClick={() => exec("insertUnorderedList")} isActive={activeFormats.unorderedList} icon={List} label="Unordered List" />
                                            </div>
                                            <div ref={editorRef} contentEditable={!isSubmitting} suppressContentEditableWarning onInput={(e) => setEmailBody(e.currentTarget.innerHTML)} style={fontLight} className="min-h-[150px] max-h-[350px] overflow-y-auto scrollbar-thin p-3 text-sm outline-none prose max-w-none [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1 [&_li]:py-0.5 empty:before:content-['Draft_your_contract_email_message_here...'] empty:before:text-gray-400 cursor-text" />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 flex gap-3 border-t border-gray-100 bg-gray-50/50 rounded-b-lg">
                                    <button type="button" onClick={submitContractEmail} disabled={isSubmitting || !isOrgComplete} style={fontBold} className="bg-[#ff7a59] hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-1.5 rounded flex items-center gap-2 cursor-pointer transition-colors">
                                        {isSubmitting && <Loader2 size={14} className="animate-spin text-white" />}
                                        {isSubmitting ? 'Sending...' : 'Send Contract Email'}
                                    </button>
                                    <button type="button" onClick={cancelForm} disabled={isSubmitting} style={fontBold} className="text-blue-600 hover:underline disabled:opacity-50 cursor-pointer">Cancel</button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Forms' && (
                            <ContractForms
                                mainID={id?.mainID}
                                organizations={organizations}
                                setOrganizations={setOrganizations}
                                isLoading={isLoadingOrg}
                            />
                        )}

                        {openCredential && (
                            <ClientCreateCredential
                                onClose={() => setopenCredential(false)}
                                mainID={id?.mainID}
                                organizations={organizations}
                            />
                        )}

                        {/* TIMELINE */}
                        <h3 className="text-blue-800 mb-4 mt-2" style={fontBold}>Timeline Feed</h3>
                        <div className="space-y-4">
                            {activities.map(activity => <ActivityCard key={activity.id} data={activity} onDelete={handleDeleteActivity} />)}
                            {activities.length === 0 && (
                                <div className="text-gray-400 text-center py-10 flex flex-col items-center gap-2 bg-white rounded-lg border border-dashed border-slate-300">
                                    <FileText size={32} className="text-gray-300" />
                                    <p style={fontLight}>No contracts sent yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDEBAR - DYNAMIC CHANNELS & CONTACTS */}
                <aside className="lg:col-span-3 h-full overflow-y-auto flex flex-col gap-4 scrollbar-thin pr-1">

                    <div className="bg-white rounded-lg border border-[#cbd6e2] shadow-sm flex flex-col flex-1 overflow-hidden">
                        <div className="p-4 border-b border-[#cbd6e2] flex-shrink-0">
                            <h2 className="text-[15px] flex items-center gap-2" style={fontBold}><Users size={18} className="text-blue-500" /> Primary & Related Contacts</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                            {currentOrg.contactPersonName ? (
                                <div className="border border-amber-200 bg-amber-50/20 rounded-lg p-4 shadow-sm">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs uppercase" style={fontBold}>
                                            {currentOrg.contactPersonName.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="text-slate-900 text-[14px]" style={fontBold}>{currentOrg.contactPersonName}</h4>
                                            <p className="text-[#516f90] text-[12px] mt-0.5 capitalize" style={fontLight}>{currentOrg.role || 'Primary Contact'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-[12px]" style={fontLight}>
                                        <div className="flex items-center gap-2 text-slate-700"><Phone size={13} className="text-slate-400" /><span>{currentOrg.contactPersonNumber || 'N/A'}</span></div>
                                        <div className="flex items-center gap-2"><Mail size={13} className="text-slate-400" /><a href={`mailto:${currentOrg.contactPersonEmail}`} className="text-blue-600 hover:underline truncate">{currentOrg.contactPersonEmail}</a></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-xs text-slate-400 italic text-center py-2" style={fontLight}>No contact person declared</div>
                            )}

                            <div className="border border-slate-200 rounded-lg p-4 shadow-sm bg-white">
                                <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-2.5" style={fontBold}>Corporate Channels</span>
                                <div className="space-y-2 text-[12px]" style={fontLight}>
                                    <div className="flex items-center gap-2 text-slate-700"><Phone size={13} className="text-slate-400" /><span>{currentOrg.orgTelephone || 'No Telephone'}</span></div>
                                    <div className="flex items-center gap-2"><Mail size={13} className="text-slate-400" /><a href={`mailto:${currentOrg.orgEmail}`} className="text-blue-600 hover:underline truncate">{currentOrg.orgEmail || 'No Email Registered'}</a></div>
                                </div>
                            </div>

                            {currentOrg?.alternativeContacts?.length > 0 && currentOrg.alternativeContacts.some(c => c.name) && (
                                <div className="pt-4 mt-4 space-y-3 border-t border-slate-200">
                                    <h4 className="text-xs tracking-wider text-slate-500 uppercase px-1" style={fontBold}>Alternative Contacts</h4>
                                    <div className="space-y-2">
                                        {currentOrg.alternativeContacts.map((alt, idx) => alt.name && (
                                            <div key={idx} className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-slate-300 transition-colors duration-200">
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <span className="text-sm text-slate-800" style={fontBold}>{alt.name}</span>
                                                    {alt.role && <span className="inline-flex items-center px-2 py-0.5 text-[10px] text-slate-600 bg-slate-100 rounded-full border border-slate-200/60" style={fontLight}>{alt.role}</span>}
                                                </div>
                                                <div className="space-y-1.5" style={fontLight}>
                                                    {alt.contact && <div className="flex items-center text-xs text-slate-600"><Phone size={12} className="mr-2 text-slate-400" />{alt.contact}</div>}
                                                    {alt.email && <div className="flex items-center text-xs text-slate-600"><Mail size={12} className="mr-2 text-slate-400" /><a href={`mailto:${alt.email}`} className="text-blue-600 hover:text-blue-800 hover:underline truncate transition-colors">{alt.email}</a></div>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
}

// =========================================================================
// SUB-COMPONENTS
// =========================================================================

function ContractForms({ mainID, organizations, setOrganizations, isLoading }) {
    console.log('===organizations====', organizations)
    const [touched, setTouched] = useState({});
    const [saveStatus, setSaveStatus] = useState({});

    const autoSaveTimers = useRef({});
    const { update_Only_OrgDetails } = UseAdd();

    const MainID = useMemo(() => mainID, [mainID]);

    useEffect(() => {
        return () => Object.values(autoSaveTimers.current).forEach(clearTimeout);
    }, []);

    const isEducationOrganization = (org) => {
        if (Array.isArray(org?.standard)) return org.standard.includes("iso21001");
        return false;
    };
    // console.log(isEducationOrganization,'isEducationOrganizationisEducationOrganization')

    const getEmptyFields = (org) => {
        console.log(typeof org?.standard,'typeof org?.standard')
        const isEducationService = isEducationOrganization(org);
        console.log(isEducationService,'isEducationServiceisEducationService')
        const fields = editableFields.filter((field) => {
            const capacityField = ["totalEducator", "totalEmp_learners", "fromGrade", "toGrade"].includes(field.name);
            if (!capacityField) return true;
            return isEducationService && ["totalEducator", "totalEmp_learners"].includes(field.name);
        });

        const emptyFields = fields
            .filter((field) => isEmptyValue(org?.[field.name], field.name))
            .map((field) => field.label);

        if (isEducationService) {
            if (isEmptyValue(org?.GradeFrom)) emptyFields.push("From Grade");
            if (isEmptyValue(org?.GradeTo)) emptyFields.push("To Grade");
        } else {
            if (!org?.employeeRange) emptyFields.push("Employee Range");
            if (org?.employeeRange === "custom" && isEmptyValue(org?.totalEmp_learners)) {
                emptyFields.push("Employee Count");
            }
        }
        return emptyFields;
    };

    const getOrganizationFields = (org) => {
        const isEducationService = isEducationOrganization(org);

        return {
            isEducationService,
            fields: editableFields.filter((field) => {
                const capacityField = ["totalEducator", "totalEmp_learners", "fromGrade", "toGrade"].includes(field.name);
                if (!capacityField) return true;
                return isEducationService && ["totalEducator", "totalEmp_learners"].includes(field.name);
            }),
        };
    };

    const saveOrganization = (index, organizationData) => {
        setSaveStatus((prev) => ({ ...prev, [index]: "saving" }));
        waitingNotify("Saving organization details...");

        const safePayload = {
            organizationDetails: { ...organizationData },
        };

        if (!MainID) {
            setSaveStatus((prev) => ({ ...prev, [index]: "error" }));
            ErrorNotify("Invalid Main ID. Action aborted.");
            return;
        }

        if (update_Only_OrgDetails && typeof update_Only_OrgDetails.mutate === 'function') {
            update_Only_OrgDetails.mutate(
                {
                    parms: { _id: MainID, organizationId: organizationData?._id },
                    payload: safePayload,
                },
                {
                    onSuccess: () => {
                        setSaveStatus((prev) => ({ ...prev, [index]: "saved" }));
                        SuccessNotify("Organization details saved successfully!");
                    },
                    onError: () => {
                        ErrorNotify("Failed to save organization details.");
                        setSaveStatus((prev) => ({ ...prev, [index]: "error" }));
                    },
                }
            );
            return;
        }

        setSaveStatus((prev) => ({ ...prev, [index]: "error" }));
        ErrorNotify("Update configuration hook missing.");
    };

    const scheduleAutoSave = (index, organizationData) => {
        if (autoSaveTimers.current[index]) clearTimeout(autoSaveTimers.current[index]);
        setSaveStatus((prev) => ({ ...prev, [index]: "waiting" }));
        autoSaveTimers.current[index] = setTimeout(() => saveOrganization(index, organizationData), 700);
    };

    const handleChange = (index, field, rawValue) => {
        const value = normalizeValue(field, rawValue);
        const nextOrganization = { ...organizations[index], [field]: value };
        const nextOrganizations = organizations.map((org, itemIndex) => itemIndex === index ? nextOrganization : org);

        setOrganizations(nextOrganizations);
        setTouched((prev) => ({ ...prev, [`${index}.${field}`]: true }));

        if (field === "date") {
            saveOrganization(index, nextOrganization);
        } else {
            scheduleAutoSave(index, nextOrganization);
        }
    };

    const handleAddAlternativeContact = (orgIndex) => {
        const nextOrganizations = [...organizations];
        const org = { ...nextOrganizations[orgIndex] };
        const altContacts = [...(org.alternativeContacts || [])];

        if (altContacts.length < 5) {
            altContacts.push({ name: '', role: '', contact: '', email: '' });
            org.alternativeContacts = altContacts;
            nextOrganizations[orgIndex] = org;
            setOrganizations(nextOrganizations);
            scheduleAutoSave(orgIndex, org);
        } else {
            ErrorNotify("Maximum 5 alternative contacts allowed.");
        }
    };

    const handleRemoveAlternativeContact = (orgIndex, altIndex) => {
        const nextOrganizations = [...organizations];
        const org = { ...nextOrganizations[orgIndex] };
        const altContacts = [...(org.alternativeContacts || [])];

        altContacts.splice(altIndex, 1);
        org.alternativeContacts = altContacts;
        nextOrganizations[orgIndex] = org;
        setOrganizations(nextOrganizations);
        scheduleAutoSave(orgIndex, org);
    };

    const handleAlternativeContactChange = (orgIndex, altIndex, field, value) => {
        const nextOrganizations = [...organizations];
        const org = { ...nextOrganizations[orgIndex] };
        const altContacts = [...(org.alternativeContacts || [])];

        altContacts[altIndex] = { ...altContacts[altIndex], [field]: value };
        org.alternativeContacts = altContacts;
        nextOrganizations[orgIndex] = org;

        setOrganizations(nextOrganizations);
        scheduleAutoSave(orgIndex, org);
    };

    const renderSaveStatus = (index) => {
        const status = saveStatus[index];
        if (status === "waiting") return <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-[11px] uppercase text-amber-600" style={fontBold}><Save size={12} /> Waiting</span>;
        if (status === "saving") return <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-[11px] uppercase text-blue-600" style={fontBold}><Loader2 size={12} className="animate-spin" /> Saving</span>;
        if (status === "saved") return <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] uppercase text-emerald-600" style={fontBold}><BadgeCheck size={12} /> Saved</span>;
        if (status === "error") return <span className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-[11px] uppercase text-red-600" style={fontBold}><AlertTriangle size={12} /> Failed</span>;
        return null;
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500 w-full" style={fontLight}>
                <Loader2 size={36} className="animate-spin text-amber-500" />
                <p className="text-sm" style={fontBold}>Loading organization forms...</p>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full bg-transparent px-3 py-4" style={fontLight}>
            <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-200/80 bg-amber-50 px-4 py-3">
                <AlertTriangle className="mt-0.5 shrink-0 text-amber-500" size={18} strokeWidth={2.5} />
                <div className="flex-1">
                    <h5 className="text-sm text-amber-800" style={fontBold}>Organization details are auto-saved after each change.</h5>
                    <p className="mt-0.5 text-[11px] text-amber-700">Complete all required fields before continuing contract actions.</p>
                </div>
            </div>

            <div className="mb-4 flex items-center gap-2">
                <div className="rounded-xl bg-amber-50 p-1.5"><Building2 size={14} className="text-amber-500" /></div>
                <h2 className="text-sm uppercase text-slate-900 sm:text-[12px]" style={fontBold}>Organization Forms</h2>
            </div>

            <div className="space-y-5">
                {organizations.map((org, index) => {
                    const emptyFields = getEmptyFields(org);
                    const isComplete = emptyFields.length === 0;
                    const { isEducationService, fields } = getOrganizationFields(org);

                    return (
                        <div key={org?._id || index} className="rounded-xl border border-slate-200 shadow-sm bg-white p-4">
                            <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="rounded-xl bg-emerald-50 p-1.5"><Building2 size={14} className="text-emerald-500" /></div>
                                    <div>
                                        <h3 className="text-[13px] uppercase tracking-wide text-slate-900" style={fontBold}>{org?.organizationName || `Organization ${index + 1}`}</h3>
                                        <p className="text-[11px] text-slate-500">{isComplete ? "All organization fields are completed" : `${emptyFields.length} field(s) missing`}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {renderSaveStatus(index)}
                                    <span style={fontBold} className={`rounded-lg px-2 py-1 text-[11px] uppercase ${isComplete ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                                        {isComplete ? "Complete" : "Incomplete"}
                                    </span>
                                </div>
                            </div>

                            {!isComplete && (
                                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                    <p className="text-[11px] text-amber-800" style={fontBold}>Empty Fields:</p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {emptyFields.map((field) => (
                                            <span key={field} style={fontBold} className="rounded-lg bg-white px-2 py-1 text-[11px] text-amber-700 border border-amber-200">{field}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {fields.map((field) => {
                                    const Icon = field.icon;
                                    const key = `${index}.${field.name}`;
                                    const hasError = touched[key] && isEmptyValue(org?.[field.name], field.name);

                                    return (
                                        <label key={field.name} className="flex flex-col gap-2">
                                            <span className="flex items-center gap-2 text-[11px] text-slate-700" style={fontBold}>
                                                <Icon size={13} className="text-amber-500" /> {isEducationService && field.name === "totalEmp_learners" ? "Total Learners" : field.label}
                                            </span>

                                            {field.type === "date" ? (
                                                <div className={`w-full transition-colors ${hasError ? "rounded-lg border border-red-400 p-[1px]" : ""}`}>
                                                    <DateUsage
                                                        key={`${index}-${field.name}-date`}
                                                        defaultValue={getDisplayValue(field.name, org?.[field.name])}
                                                        onChange={(dateData) => {
                                                            if (!dateData) return handleChange(index, field.name, "");
                                                            let dateVal = Array.isArray(dateData) ? (dateData[0]?.value || dateData[0]) : (dateData?.value || dateData);
                                                            handleChange(index, field.name, formatToYYYYMMDD(dateVal));
                                                        }}
                                                        range={false}
                                                    />
                                                </div>
                                            ) : field.type === "select" ? (
                                                <Select
                                                    name={field.name}
                                                    isMulti={field.multiple}
                                                    options={field.options}
                                                    placeholder={`Select ${field.label}`}
                                                    styles={ValidateStyle({ hasError: false, hasDisable: false, height: "auto" })}
                                                    value={field.multiple ? field.options?.filter(option => (org?.[field.name] || []).includes(option.value)) : field.options?.find(option => option.value === org?.[field.name]) || null}
                                                    onChange={(option) => {
                                                        if (field.multiple) {
                                                            handleChange(index, field.name, option ? option.map((item) => item.value) : []);
                                                        } else {
                                                            handleChange(index, field.name, option?.value || "");
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <input
                                                    type={field.type}
                                                    name={field.name}
                                                    min={field.name === "discounted" ? 0 : null}
                                                    value={getDisplayValue(field.name, org?.[field.name])}
                                                    placeholder={field.placeholder}
                                                    onChange={(e) => handleChange(index, field.name, e.target.value)}
                                                    className={`w-full rounded-lg border h-[48px] bg-white px-3 py-2.5 text-sm outline-none transition-colors ${hasError ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-amber-500"}`}
                                                />
                                            )}
                                            {hasError && <span className="text-[11px] text-red-500">*{field.label} is required</span>}
                                        </label>
                                    );
                                })}
                                {isEducationService ? (
                                    <div className="col-span-1 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-3 sm:col-span-2">
                                        {[
                                            { name: "GradeFrom", label: "From Grade", placeholder: "Nursery" },
                                            { name: "GradeTo", label: "To Grade", placeholder: "Class 12" },
                                        ].map((field, fieldIndex) => (
                                            <React.Fragment key={field.name}>
                                                {fieldIndex === 1 && <ArrowRight size={20} className="mb-3 text-amber-500" aria-hidden="true" />}
                                                <label className="flex min-w-0 flex-col gap-2">
                                                    <span className="flex items-center gap-2 text-[11px] text-slate-700" style={fontBold}>
                                                        <GraduationCap size={13} className="text-amber-500" /> {field.label}
                                                    </span>
                                                    <input
                                                        type="text"
                                                        value={org?.[field.name] || ""}
                                                        placeholder={field.placeholder}
                                                        onChange={(e) => handleChange(index, field.name, e.target.value)}
                                                        className={`h-[48px] w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none transition-colors ${touched[`${index}.${field.name}`] && isEmptyValue(org?.[field.name], field.name) ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-amber-500"}`}
                                                    />
                                                    {touched[`${index}.${field.name}`] && isEmptyValue(org?.[field.name], field.name) && <span className="text-[11px] text-red-500">*{field.label} is required</span>}
                                                </label>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                ) : (
                                    <label className="flex flex-col gap-2">
                                        <span className="flex items-center gap-2 text-[11px] text-slate-700" style={fontBold}>
                                            <Users size={13} className="text-amber-500" /> Employee Range
                                        </span>
                                        <select
                                            value={org?.employeeRange || ""}
                                            onChange={(e) => {
                                                const range = e.target.value;
                                                const rangeMaximums = { "0-50": 50, "50-200": 200, "200-500": 500, "500-700": 700, "700-1000": 1000, "1000-1500": 1500 };
                                                handleChange(index, "employeeRange", range);
                                                if (range !== "custom") handleChange(index, "totalEmp_learners", rangeMaximums[range]);
                                            }}
                                            className="h-[48px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-amber-500"
                                        >
                                            <option value="">Select employee range</option>
                                            <option value="0-50">0-50</option>
                                            <option value="50-200">50-200</option>
                                            <option value="200-500">200-500</option>
                                            <option value="500-700">500-700</option>
                                            <option value="700-1000">700-1000</option>
                                            <option value="1000-1500">1000-1500</option>
                                            <option value="custom">Custom entry</option>
                                        </select>
                                        {org?.employeeRange === "custom" && (
                                            <input
                                                type="number"
                                                min="0"
                                                value={org?.totalEmp_learners ?? ""}
                                                placeholder="Enter employee count"
                                                onChange={(e) => handleChange(index, "totalEmp_learners", e.target.value)}
                                                className="h-[48px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-amber-500"
                                            />
                                        )}
                                    </label>
                                )}
                            </div>

                            <div className="mt-6 border-t border-slate-200 pt-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-[13px] text-slate-800 flex items-center gap-2" style={fontBold}>
                                        <Users size={14} className="text-blue-500" /> Alternative Contacts
                                        <span className="text-[11px] text-slate-500" style={fontLight}>({(org.alternativeContacts || []).length}/5)</span>
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={() => handleAddAlternativeContact(index)}
                                        disabled={(org.alternativeContacts || []).length >= 5}
                                        style={fontBold}
                                        className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1.5 rounded-md text-[11px] hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        <Plus size={12} /> Add Contact
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {(org.alternativeContacts || []).map((alt, altIndex) => (
                                        <div key={altIndex} className="relative grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveAlternativeContact(index, altIndex)}
                                                className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1 rounded-full hover:bg-red-200 hover:text-red-700 transition-colors cursor-pointer shadow-sm"
                                                title="Remove Contact"
                                            >
                                                <Trash2 size={12} />
                                            </button>

                                            <label className="flex flex-col gap-1.5">
                                                <span className="text-[11px] text-slate-700" style={fontBold}>Name</span>
                                                <input type="text" value={alt.name || ""} placeholder="Full Name" onChange={(e) => handleAlternativeContactChange(index, altIndex, "name", e.target.value)} className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-amber-500 transition-colors" />
                                            </label>
                                            <label className="flex flex-col gap-1.5">
                                                <span className="text-[11px] text-slate-700" style={fontBold}>Role</span>
                                                <input type="text" value={alt.role || ""} placeholder="Designation" onChange={(e) => handleAlternativeContactChange(index, altIndex, "role", e.target.value)} className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-amber-500 transition-colors" />
                                            </label>
                                            <label className="flex flex-col gap-1.5">
                                                <span className="text-[11px] text-slate-700" style={fontBold}>Contact Number</span>
                                                <input type="text" value={alt.contact || ""} placeholder="Phone Number" onChange={(e) => handleAlternativeContactChange(index, altIndex, "contact", e.target.value)} className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-amber-500 transition-colors" />
                                            </label>
                                            <label className="flex flex-col gap-1.5">
                                                <span className="text-[11px] text-slate-700" style={fontBold}>Email Address</span>
                                                <input type="email" value={alt.email || ""} placeholder="Email" onChange={(e) => handleAlternativeContactChange(index, altIndex, "email", e.target.value)} className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-amber-500 transition-colors" />
                                            </label>
                                        </div>
                                    ))}
                                    {(org.alternativeContacts || []).length === 0 && (
                                        <div className="text-center py-4 text-[12px] text-slate-400 border border-dashed border-slate-300 rounded-lg" style={fontLight}>
                                            No alternative contacts provided yet.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                                <div className="grid grid-cols-1 gap-3 text-[11px] text-slate-500 sm:grid-cols-2">
                                    <p><span className="text-slate-700" style={fontBold}>Created:</span> {org?.createdAt ? new Date(org.createdAt).toLocaleString() : "Not available"}</p>
                                    <p><span className="text-slate-700" style={fontBold}>Updated:</span> {org?.updatedAt ? new Date(org.updatedAt).toLocaleString() : "Not available"}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Timeline Feed Card Display
function ActivityCard({ data, onDelete }) {
    const formatDate = (isoString) => {
        if (!isoString) return '';
        return new Date(isoString).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="bg-white border border-[#cbd6e2] rounded-lg shadow-sm transition-all duration-300 relative overflow-hidden hover:shadow-md group">
            <div className="p-3 border-b border-gray-100 flex justify-between items-start gap-2 bg-gray-50/30">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm border border-white">
                        <Mail size={16} />
                    </div>
                    <div className="text-[13px]" style={fontLight}>
                        <span style={fontBold}>Contract Sent</span> <span className="text-gray-500">by</span> <span className="text-gray-800" style={fontBold}>{data.author}</span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded px-1 py-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onDelete(data.id)} className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer" title="Delete"><Trash2 size={14} /></button>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap" style={fontLight}>{formatDate(data.timestamp)}</span>
                </div>
            </div>

            <div className="p-4 text-[14px] text-gray-800">
                <div className="mb-3 bg-gray-50 border border-slate-200 p-2.5 rounded text-[13px]">
                    <div className="text-gray-800 mb-1 border-b border-slate-200 pb-1" style={fontBold}>Subject: <span style={fontLight}>{data.subject}</span></div>
                    <div className="text-gray-500 break-words flex gap-1" style={fontLight}>
                        <span style={fontBold}>To:</span>
                        {Array.isArray(data.to) ? data.to.join(', ') : data.to}
                    </div>
                </div>

                <div className="whitespace-pre-wrap leading-relaxed prose prose-sm max-w-none" style={fontLight} dangerouslySetInnerHTML={{ __html: data.content }}></div>

                {data.attachments && data.attachments.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                        <div className="w-full text-xs text-gray-500 mb-1" style={fontBold}>Attached PDF Contracts:</div>
                        {data.attachments.map((file, i) => (
                            <div key={i} className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded px-3 py-1.5 text-sm text-red-700 hover:underline cursor-pointer" style={fontBold}>
                                <FileText size={14} /> <span className="truncate max-w-[200px]" style={fontLight}>{file.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}