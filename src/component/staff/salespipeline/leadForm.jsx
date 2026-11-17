import React, { useState } from "react";
import { X, UserPlus, Briefcase, Building2, Info, ChevronDown, ChevronUp, Trash2, Plus, MapPin, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Select from "react-select";
import { getInputClass, ValidateStyle } from "../../../data/data";
import { UseAdd } from "../../hooks/useadd";
import { ErrorNotify, SuccessNotify } from "../../hotToaster";
import { getDistrictNames, getLocalLevelNames, provinceDistricts } from "../../province";

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
    { label: "Messanger", value: "messanger" },
    { label: "Referral", value: "referral" },
    { label: "BoostingFB", value: "boostingfb" },
    { label: "Email", value: "email" },
    { label: "Google Form", value: "googleForm" },
    { label: "LinkedIn", value: "linkedin" },
    { label: "TikTok", value: "tiktok" },
    { label: "Instrgram", value: "instagram" },
    { label: "Youtube", value: "youtube" },
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
    { label: "ISO 9001:2015 QMS (Quality Management System)", value: "iso9001", color: "#3b82f6" },
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
    { label: "Third Party Audits", value: "third_party_audits", color: "#000000" },
];

const provinceNumbers = {
    "Koshi Province": 1,
    "Madhesh Province": 2,
    "Bagmati Province": 3,
    "Gandaki Province": 4,
    "Lumbini Province": 5,
    "Karnali Province": 6,
    "Sudurpashchim Province": 7
};

const provinceOptions = Object.keys(provinceDistricts).map(name => ({ label: name, value: name }));
const provinceNumberOption = (province) => {
    const number = province ? provinceNumbers[province.value] : null;
    return number ? { label: `Province ${number}`, value: String(number) } : null;
};



const industries = [
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
];

const freeEmailDomains = [
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com",
    "icloud.com", "aol.com", "protonmail.com", "mail.com", "zoho.com"
];

const initialLeadData = {
    leadType: null,
    leadSource: null,
    leadChannel: null,
    campaignName: "",
    assignedSalesRep: "",
    ProductInterested: [],
    notes: "",
    localLevel: null,
    provinceNumber: null,
    province: null,
    district: null,
    salesManager: "",
    note_comments: "",
};

const initialOrgData = {
    organizationName: "",
    organizationType: null,
    industyType: [],
    registrationNumber: "",
    vatPan: "",
    provinceNumber: null,
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
    alternativeContacts: []
};

const commonInputStyles = "w-full p-2.5 sm:p-3 text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all placeholder-slate-400";
const errorInputStyles = "w-full p-2.5 sm:p-3 text-sm bg-red-50/50 border border-red-300 rounded-lg focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all placeholder-red-300";

const LeadForm = ({ onClose }) => {
    const { addOrgLeadDetails } = UseAdd();
    const [activeTab, setActiveTab] = useState("lead");
    const [submitError, setSubmitError] = useState("");

    const [leadData, setLeadData] = useState(initialLeadData);
    const [orgData, setOrgData] = useState(initialOrgData);

    const [leadErrors, setLeadErrors] = useState({});
    const [orgErrors, setOrgErrors] = useState({});

    const isEducationService = leadData.ProductInterested?.some(item => item.value === "iso21001");

    const isEmpty = (value) => {
        if (value === null || value === undefined) return true;
        if (typeof value === "string") return value.trim() === "";
        if (Array.isArray(value)) return value.length === 0;
        return false;
    };

    const requiredLeadFields = [
        "leadType",
        "leadSource",
        "leadChannel",
        "campaignName",
        "assignedSalesRep",
        "ProductInterested",
        "notes",
        "provinceNumber",
        "province",
        "district",
        "localLevel",
        "salesManager",
    ];

    const requiredOrgFields = [
        "organizationName",
        "organizationType",
        "industyType",
    ];

    const setTabErrors = (tab, name, error) => {
        if (tab === "lead") {
            setLeadErrors((prev) => ({ ...prev, [name]: error }));
        } else {
            setOrgErrors((prev) => ({ ...prev, [name]: error }));
        }
    };

    const handleInputChange = (eOrOption, tabName, fieldName) => {
        if (eOrOption?.target) {
            const { name, value } = eOrOption.target;

            if (tabName === "lead") {
                setLeadData((prev) => ({ ...prev, [name]: value }));
                setLeadErrors((prev) => ({ ...prev, [name]: "" }));
            } else {
                setOrgData((prev) => ({ ...prev, [name]: value }));
                setOrgErrors((prev) => ({ ...prev, [name]: "" }));
            }
            return;
        }

        if (tabName === "lead") {
            setLeadData((prev) => ({ ...prev, [fieldName]: eOrOption }));
            setLeadErrors((prev) => ({ ...prev, [fieldName]: "" }));
        } else {
            setOrgData((prev) => ({ ...prev, [fieldName]: eOrOption }));
            setOrgErrors((prev) => ({ ...prev, [fieldName]: "" }));
        }
    };

    const validateField = (name, value, tab) => {
        let error = "";
        const isRequired =
            tab === "lead"
                ? requiredLeadFields.includes(name)
                : requiredOrgFields.includes(name);

        if (isRequired && isEmpty(value)) {
            error = "This field is required";
        }

        if (!error && name === "contactPersonEmail" && !isEmpty(value)) {
            const email = String(value).trim();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                error = "Enter a valid email";
            }
        }

        if (!error && name === "orgEmail" && !isEmpty(value)) {
            const email = String(value).trim();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                error = "Enter a valid email";
            } else {
                const domain = email.split('@')[1];
                if (freeEmailDomains.includes(domain.toLowerCase())) {
                    error = "Please enter a private company domain";
                }
            }
        }

        if (!error && (name === "contactPersonNumber" || name === "orgTelephone") && !isEmpty(value)) {
            if (!/^\+?\d{7,15}$/.test(String(value).trim())) {
                error = "Enter a valid contact number";
            }
        }

        if (!error && name === "totalEmp_learners" && !isEmpty(value)) {
            if (!/^\d+$/.test(String(value).trim())) {
                error = "Enter a valid number";
            }
        }

        if (!error && name === "totalEmp_learners" && isEmpty(value)) {
            error = isEducationService
                ? "Enter the total learners"
                : "Enter the total employees";
        }

        if (!error && name === "totalEducator" && !isEducationService) {
            setTabErrors(tab, name, "");
            return "";
        }

        if (!error && name === "totalEducator" && !isEmpty(value)) {
            if (!/^\d+$/.test(String(value).trim())) {
                error = "Enter a valid number";
            }
        }

        setTabErrors(tab, name, error);
        return error;
    };

    const validateLead = () => {
        const errors = requiredLeadFields.map((field) =>
            validateField(field, leadData[field], "lead")
        );
        return validateLocation(leadData, "lead", true) && !errors.some(Boolean);
    };

    const validateOrg = () => {
        const fields = [
            "organizationName", "organizationType", "industyType",
            "registrationNumber", "vatPan", "address", "orgTelephone", "orgEmail",
            "totalEmp_learners", "contactPersonName", "role", "contactPersonNumber", "contactPersonEmail"
        ];

        if (isEducationService) {
            fields.push("totalEducator", "fromGrade", "toGrade");
        }

        const errors = fields.map((field) =>
            validateField(field, orgData[field], "org")
        );
        return validateLocation(orgData, "org", false) && !errors.some(Boolean);
    };

    const validateLocation = (location, tab, required) => {
        const province = location.province?.value;
        const district = location.district?.value;
        const localLevel = location.localLevel?.value;
        const hasAnyLocation = Boolean(province || district || localLevel);

        if (!required && !hasAnyLocation) return true;

        const validProvince = Boolean(province && Object.hasOwn(provinceDistricts, province));
        const validDistrict = validProvince && getDistrictNames(province).includes(district);
        const validLocalLevel = validDistrict && getLocalLevelNames(province, district).includes(localLevel);

        if (!validProvince) setTabErrors(tab, "province", "Select a valid Province.");
        if (!validDistrict) setTabErrors(tab, "district", "Select a District from the selected Province.");
        if (!validLocalLevel) setTabErrors(tab, "localLevel", "Select a Local Level from the selected District.");

        return validProvince && validDistrict && validLocalLevel;
    };

    const normalizePayload = () => {
        return {
            lead: {
                leadType: leadData.leadType?.value || "",
                leadSource: leadData.leadSource?.value || "",
                leadChannel: leadData.leadChannel?.value || "",
                campaignName: leadData.campaignName.trim(),
                assignedSalesRep: leadData.assignedSalesRep.trim(),
                ProductInterested: Array.isArray(leadData.ProductInterested)
                    ? leadData.ProductInterested.map((item) => item.value)
                    : [],
                notes: leadData.notes.trim(),
                provinceNumber: leadData.provinceNumber?.value || "",
                province: leadData.province?.value || "",
                district: leadData.district?.value || "",
                localLevel: typeof leadData.localLevel === 'object' ? leadData.localLevel?.value || "" : leadData.localLevel || "",
                salesManager: leadData.salesManager.trim(),
                note_comments: leadData.note_comments?.trim() || "",
            },
            organization: {
                organizationName: orgData.organizationName.trim(),
                organizationType: orgData.organizationType?.value || "",
                industyType: Array.isArray(orgData.industyType)
                    ? orgData.industyType.map((item) => item.value)
                    : [],
                standard: Array.isArray(leadData.ProductInterested)
                    ? leadData.ProductInterested.map((item) => item.value)
                    : [],
                registrationNumber: orgData.registrationNumber.trim(),
                vatPan: orgData.vatPan.trim(),
                provinceNumber: orgData.provinceNumber?.value || "",
                province: orgData.province?.value || "",
                district: orgData.district?.value || "",
                localLevel: typeof orgData.localLevel === 'object' ? orgData.localLevel?.value || "" : orgData.localLevel || "",

                orgTelephone: orgData.orgTelephone.trim(),
                orgEmail: orgData.orgEmail.trim(),
                totalEmp_learners: orgData.totalEmp_learners === ""
                    ? null
                    : Number(orgData.totalEmp_learners),
                totalEducator: orgData.totalEducator === "" || !isEducationService
                    ? null
                    : Number(orgData.totalEducator),
                GradeFrom: isEducationService ? orgData.fromGrade.trim() : "",
                GradeTo: isEducationService ? orgData.toGrade.trim() : "",
                contactPersonName: orgData.contactPersonName.trim(),
                role: orgData.role?.value || "",
                contactPersonNumber: orgData.contactPersonNumber.trim(),
                contactPersonEmail: orgData.contactPersonEmail.trim(),
                alternativeContacts: orgData.alternativeContacts.map(c => ({
                    name: c.name.trim(),
                    role: c.role?.value || "",
                    number: c.number.trim(),
                    email: c.email.trim()
                }))
            },
        };
    };

    const resetForm = () => {
        setLeadData(initialLeadData);
        setOrgData(initialOrgData);
        setLeadErrors({});
        setOrgErrors({});
        setSubmitError("");
        setActiveTab("lead");
    };

    const toggleAltContactExpand = (index) => {
        setOrgData(prev => ({
            ...prev,
            alternativeContacts: prev.alternativeContacts.map((c, i) =>
                i === index ? { ...c, isExpanded: !c.isExpanded } : c
            )
        }));
    };

    const addAlternativeContact = () => {
        if (orgData.alternativeContacts.length >= 3) return;
        setOrgData(prev => ({
            ...prev,
            alternativeContacts: [
                ...prev.alternativeContacts,
                { name: "", role: null, number: "", email: "", isExpanded: true }
            ]
        }));
    };

    const removeAlternativeContact = (index, e) => {
        e.stopPropagation();
        setOrgData(prev => ({
            ...prev,
            alternativeContacts: prev.alternativeContacts.filter((_, i) => i !== index)
        }));
    };

    const handleAltContactChange = (index, field, value) => {
        setOrgData(prev => ({
            ...prev,
            alternativeContacts: prev.alternativeContacts.map((c, i) =>
                i === index ? { ...c, [field]: value } : c
            )
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError("");

        const leadValid = validateLead();
        const orgValid = validateOrg();

        if (!leadValid) {
            setActiveTab("lead");
            return;
        }

        if (!orgValid) {
            setActiveTab("org");
            return;
        }

        const payload = normalizePayload();
        console.log("Submitting Payload:", payload);

        try {
            await addOrgLeadDetails.mutateAsync(payload);
            resetForm();
            SuccessNotify('Lead Created Successfully');

            if (onClose) onClose();
            window.location.reload();

        } catch (error) {
            ErrorNotify(error?.response?.data?.message || error?.message)
            setSubmitError(
                error?.response?.data?.message ||
                error?.message ||
                "Failed to submit form"
            );
        }
    };

    const isSubmitting = addOrgLeadDetails?.isPending;

    const districtOptions = getDistrictNames(leadData.province?.value)
        .map(district => ({ label: district, value: district }));
    const localLevelOptions = getLocalLevelNames(leadData.province?.value, leadData.district?.value)
        .map(localLevel => ({ label: localLevel, value: localLevel }));

    const orgDistrictOptions = getDistrictNames(orgData.province?.value)
        .map(district => ({ label: district, value: district }));
    const orgLocalLevelOptions = getLocalLevelNames(orgData.province?.value, orgData.district?.value)
        .map(localLevel => ({ label: localLevel, value: localLevel }));

    return (
        <AnimatePresence>
            <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4"
            >
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-md"
                />
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-3 sm:top-6 right-3 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 text-white flex justify-center items-center hover:bg-white/20 transition-all hover:rotate-90 z-[60] cursor-pointer backdrop-blur-md"
                >
                    <X size={24} />
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 30, scale: 0.95 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="w-full max-w-5xl relative"
                >
                    <div
                        className="max-h-[85vh] sm:max-h-[90vh] overflow-y-auto custom-scrollbar rounded-xl sm:rounded-2xl"
                        style={{ fontFamily: "'Roboto Slab', serif" }}
                    >
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                            <div className="sticky top-0 z-30 bg-gradient-to-r from-amber-500 to-orange-600 p-5 sm:p-8 shadow-sm">
                                <h2 className="text-xl sm:text-3xl font-bold text-white flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"><UserPlus size={24} /></div>
                                    Create New Lead
                                </h2>
                                <p className="text-orange-100 text-xs sm:text-sm mt-2 ml-[52px]">
                                    Capture prospect details, geographical data, and organizational profile.
                                </p>
                            </div>

                            <div className="sticky top-[88px] sm:top-[120px] z-20 flex border-b border-slate-200 bg-slate-50/95 backdrop-blur-md">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("lead")}
                                    className={`flex-1 py-3.5 sm:py-4 px-4 sm:px-6 text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === "lead"
                                        ? "bg-white text-orange-600 border-b-[3px] border-orange-600"
                                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 border-b-[3px] border-transparent"
                                        }`}
                                >
                                    <Briefcase size={18} /> Lead Info
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveTab("org")}
                                    className={`flex-1 py-3.5 sm:py-4 px-4 sm:px-6 text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === "org"
                                        ? "bg-white text-orange-600 border-b-[3px] border-orange-600"
                                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 border-b-[3px] border-transparent"
                                        }`}
                                >
                                    <Building2 size={18} /> Organization
                                </button>
                            </div>

                            <form className="p-5 sm:p-8" onSubmit={handleSubmit} noValidate>
                                {submitError && (
                                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-3">
                                        <Info className="shrink-0 mt-0.5 text-red-500" size={18} />
                                        <span>{submitError}</span>
                                    </div>
                                )}

                                {activeTab === "lead" && (
                                    <motion.div
                                        key="lead-tab"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.25 }}
                                        className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6"
                                    >
                                        <div className="flex flex-col gap-1.5 sm:gap-2">
                                            <label className="text-xs sm:text-sm font-semibold text-slate-700">
                                                Lead Type <span className="text-red-500">*</span>
                                            </label>
                                            <Select
                                                name="leadType"
                                                value={leadData.leadType}
                                                options={leadType}
                                                className="cursor-pointer"
                                                styles={ValidateStyle(!!leadErrors.leadType)}
                                                onChange={(option) => {
                                                    handleInputChange(option, "lead", "leadType");
                                                    validateField("leadType", option, "lead");
                                                }}
                                            />
                                            {leadErrors.leadType && <p className="mt-1 text-xs font-medium text-red-500">{leadErrors.leadType}</p>}
                                        </div>

                                        <div className="flex flex-col gap-1.5 sm:gap-2">
                                            <label className="text-xs sm:text-sm font-semibold text-slate-700">
                                                Lead Source <span className="text-red-500">*</span>
                                            </label>
                                            <Select
                                                name="leadSource"
                                                value={leadData.leadSource}
                                                options={LeadSource}
                                                className="cursor-pointer"
                                                styles={ValidateStyle(!!leadErrors.leadSource)}
                                                onChange={(option) => {
                                                    handleInputChange(option, "lead", "leadSource");
                                                    validateField("leadSource", option, "lead");
                                                }}
                                            />
                                            {leadErrors.leadSource && <p className="mt-1 text-xs font-medium text-red-500">{leadErrors.leadSource}</p>}
                                        </div>

                                        <div className="flex flex-col gap-1.5 sm:gap-2">
                                            <label className="text-xs sm:text-sm font-semibold text-slate-700">
                                                Lead Channel <span className="text-red-500">*</span>
                                            </label>
                                            <Select
                                                name="leadChannel"
                                                value={leadData.leadChannel}
                                                options={LeadChannel}
                                                className="cursor-pointer"
                                                styles={ValidateStyle(!!leadErrors.leadChannel)}
                                                onChange={(option) => {
                                                    handleInputChange(option, "lead", "leadChannel");
                                                    validateField("leadChannel", option, "lead");
                                                }}
                                            />
                                            {leadErrors.leadChannel && <p className="mt-1 text-xs font-medium text-red-500">{leadErrors.leadChannel}</p>}
                                        </div>

                                        <div className="flex flex-col gap-1.5 sm:gap-2">
                                            <label className="text-xs sm:text-sm font-semibold text-slate-700">
                                                Campaign Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="campaignName"
                                                value={leadData.campaignName}
                                                placeholder="e.g. FB_Jan_2026"
                                                className={leadErrors.campaignName ? errorInputStyles : commonInputStyles}
                                                onChange={(e) => handleInputChange(e, "lead")}
                                                onBlur={(e) => validateField(e.target.name, e.target.value, "lead")}
                                            />
                                            {leadErrors.campaignName && <p className="mt-1 text-xs font-medium text-red-500">{leadErrors.campaignName}</p>}
                                        </div>

                                        <div className="flex flex-col gap-1.5 sm:gap-2">
                                            <label className="text-xs sm:text-sm font-semibold text-slate-700">
                                                Assigned Sales Rep <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="assignedSalesRep"
                                                value={leadData.assignedSalesRep}
                                                placeholder="Staff Name / ID"
                                                className={leadErrors.assignedSalesRep ? errorInputStyles : commonInputStyles}
                                                onChange={(e) => handleInputChange(e, "lead")}
                                                onBlur={(e) => validateField(e.target.name, e.target.value, "lead")}
                                            />
                                            {leadErrors.assignedSalesRep && <p className="mt-1 text-xs font-medium text-red-500">{leadErrors.assignedSalesRep}</p>}
                                        </div>

                                        <div className="flex flex-col gap-1.5 sm:gap-2">
                                            <label className="text-xs sm:text-sm font-semibold text-slate-700">
                                                Product/Service Interested <span className="text-red-500">*</span>
                                            </label>
                                            <Select
                                                name="ProductInterested"
                                                value={leadData.ProductInterested}
                                                options={servicesInterested}
                                                isMulti
                                                className="cursor-pointer"
                                                styles={ValidateStyle(!!leadErrors.ProductInterested, false)}
                                                onChange={(option) => {
                                                    handleInputChange(option || [], "lead", "ProductInterested");
                                                    validateField("ProductInterested", option || [], "lead");
                                                }}
                                            />
                                            {leadErrors.ProductInterested && <p className="mt-1 text-xs font-medium text-red-500">{leadErrors.ProductInterested}</p>}
                                        </div>

                                        <div className="sm:col-span-2 border-t border-slate-100 pt-5 mt-2">
                                            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                                <MapPin size={16} className="text-amber-500" /> Location Details
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                                <div className="flex flex-col gap-1.5 sm:gap-2">
                                                    <label className="text-xs sm:text-sm font-semibold text-slate-700">
                                                        Province No. <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        value={leadData.provinceNumber?.value || ""}
                                                        disabled
                                                        placeholder="Auto-mapped"
                                                        className={`${commonInputStyles} cursor-not-allowed bg-slate-100 text-slate-500`}
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-1.5 sm:gap-2">
                                                    <label className="text-xs sm:text-sm font-semibold text-slate-700">
                                                        Province <span className="text-red-500">*</span>
                                                    </label>
                                                    <Select
                                                        name="province"
                                                        value={leadData.province}
                                                        options={provinceOptions}
                                                        placeholder="Select Province"
                                                        className="cursor-pointer"
                                                        styles={ValidateStyle(!!leadErrors.province, false)}
                                                        onChange={(option) => {
                                                            setLeadData((prev) => ({
                                                                ...prev,
                                                                province: option,
                                                                provinceNumber: provinceNumberOption(option),
                                                                district: null,
                                                                localLevel: null
                                                            }));
                                                            setLeadErrors((prev) => ({ ...prev, provinceNumber: "", province: "", district: "", localLevel: "" }));
                                                        }}
                                                    />
                                                    {leadErrors.province && <p className="mt-1 text-xs font-medium text-red-500">{leadErrors.province}</p>}
                                                </div>

                                                <div className="flex flex-col gap-1.5 sm:gap-2">
                                                    <label className="text-xs sm:text-sm font-semibold text-slate-700">
                                                        District <span className="text-red-500">*</span>
                                                    </label>
                                                    <Select
                                                        name="district"
                                                        value={leadData.district}
                                                        options={districtOptions}
                                                        isDisabled={!leadData.province}
                                                        placeholder={leadData.province ? "Select District" : "Select Province first"}
                                                        className={!leadData.province ? "cursor-not-allowed" : "cursor-pointer"}
                                                        styles={ValidateStyle(!!leadErrors.district, false)}
                                                        onChange={(option) => {
                                                            setLeadData((prev) => ({ ...prev, district: option, localLevel: null }));
                                                            setLeadErrors((prev) => ({ ...prev, district: "", localLevel: "" }));
                                                        }}
                                                    />
                                                    {leadErrors.district && <p className="mt-1 text-xs font-medium text-red-500">{leadErrors.district}</p>}
                                                </div>

                                                <div className="flex flex-col gap-1.5 sm:gap-2">
                                                    <label className="text-xs sm:text-sm font-semibold text-slate-700">
                                                        Local Level <span className="text-red-500">*</span>
                                                    </label>
                                                    <Select
                                                        name="localLevel"
                                                        value={leadData.localLevel}
                                                        options={localLevelOptions}
                                                        isDisabled={!leadData.district}
                                                        placeholder={leadData.district ? "Select Local Level" : "Select District first"}
                                                        className={!leadData.district ? "cursor-not-allowed" : "cursor-pointer"}
                                                        styles={ValidateStyle(!!leadErrors.localLevel, false)}
                                                        onChange={(option) => {
                                                            handleInputChange(option, "lead", "localLevel");
                                                            validateField("localLevel", option, "lead");
                                                        }}
                                                    />
                                                    {leadErrors.localLevel && <p className="mt-1 text-xs font-medium text-red-500">{leadErrors.localLevel}</p>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1.5 sm:gap-2 sm:col-span-2 pt-5 border-t border-slate-100">
                                            <label className="text-xs sm:text-sm font-semibold text-slate-700">
                                                Sales Manager
                                            </label>
                                            <input
                                                type="text"
                                                name="salesManager"
                                                value={leadData.salesManager}
                                                placeholder="Sales Manager Full Name"
                                                className={leadErrors.salesManager ? errorInputStyles : commonInputStyles}
                                                onChange={(e) => handleInputChange(e, "lead")}
                                                onBlur={(e) => validateField(e.target.name, e.target.value, "lead")}
                                            />
                                            {leadErrors.salesManager && <p className="mt-1 text-xs font-medium text-red-500">{leadErrors.salesManager}</p>}
                                        </div>

                                        <div className="flex flex-col gap-1.5 sm:gap-2 sm:col-span-2">
                                            <label className="text-xs sm:text-sm font-semibold text-slate-700">
                                                Notes / Comments <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                rows="4"
                                                name="notes"
                                                value={leadData.notes}
                                                placeholder="Enter any additional remarks or details here..."
                                                className={leadErrors.notes ? errorInputStyles : commonInputStyles}
                                                onChange={(e) => handleInputChange(e, "lead")}
                                                onBlur={(e) => validateField(e.target.name, e.target.value, "lead")}
                                            />
                                            {leadErrors.notes && <p className="mt-1 text-xs font-medium text-red-500">{leadErrors.notes}</p>}
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === "org" && (
                                    <motion.div
                                        key="org-tab"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        transition={{ duration: 0.25 }}
                                        className="space-y-6 sm:space-y-8"
                                    >
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                                            <div className="sm:col-span-2 border-l-4 border-amber-500 pl-4 py-1.5 bg-amber-50/50 rounded-r-lg">
                                                <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wider">
                                                    Company Profile
                                                </h3>
                                            </div>

                                            <div className="flex flex-col gap-1.5 sm:gap-2 sm:col-span-2">
                                                <label className="text-xs sm:text-sm font-semibold text-slate-700">
                                                    Organization Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="organizationName"
                                                    value={orgData.organizationName}
                                                    placeholder="Legal Entity Name"
                                                    className={orgErrors.organizationName ? errorInputStyles : commonInputStyles}
                                                    onChange={(e) => handleInputChange(e, "org")}
                                                    onBlur={(e) => validateField(e.target.name, e.target.value, "org")}
                                                />
                                                {orgErrors.organizationName && <p className="mt-1 text-xs font-medium text-red-500">{orgErrors.organizationName}</p>}
                                            </div>

                                            <div className="flex flex-col gap-1.5 sm:gap-2">
                                                <label className="text-xs sm:text-sm font-semibold text-slate-700">
                                                    Organization Type <span className="text-red-500">*</span>
                                                </label>
                                                <Select
                                                    name="organizationType"
                                                    value={orgData.organizationType}
                                                    options={organizationType}
                                                    className="cursor-pointer"
                                                    styles={ValidateStyle(!!orgErrors.organizationType, false)}
                                                    placeholder="Select Organization Type"
                                                    onChange={(option) => {
                                                        handleInputChange(option, "org", "organizationType");
                                                        validateField("organizationType", option, "org");
                                                    }}
                                                />
                                                {orgErrors.organizationType && <p className="mt-1 text-xs font-medium text-red-500">{orgErrors.organizationType}</p>}
                                            </div>

                                            <div className="flex flex-col gap-1.5 sm:gap-2">
                                                <label className="text-xs sm:text-sm font-semibold text-slate-700">
                                                    Industry / Sector <span className="text-red-500">*</span>
                                                </label>
                                                <Select
                                                    name="industyType"
                                                    value={orgData.industyType}
                                                    options={industries}
                                                    className="cursor-pointer"
                                                    styles={ValidateStyle(!!orgErrors.industyType, false)}
                                                    isMulti
                                                    placeholder="Select Industry Type"
                                                    onChange={(option) => {
                                                        const nextIndustries = option || [];
                                                        setOrgData((prev) => ({
                                                            ...prev,
                                                            industyType: nextIndustries,
                                                            totalEmp_learners: "",
                                                            totalEducator: "",
                                                            fromGrade: "",
                                                            toGrade: "",
                                                        }));
                                                        validateField("industyType", option || [], "org");
                                                    }}
                                                />
                                                {orgErrors.industyType && <p className="mt-1 text-xs font-medium text-red-500">{orgErrors.industyType}</p>}
                                            </div>

                                            {/* ORGANIZATION LOCATION BLOCK */}
                                            <div className="sm:col-span-2 border-t border-slate-100 pt-5 mt-2">
                                                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                                    <MapPin size={16} className="text-amber-500" /> Organization Location
                                                </h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                                    <div className="flex flex-col gap-1.5 sm:gap-2">
                                                        <label className="text-xs sm:text-sm font-semibold text-slate-700">
                                                            Province No. <span className="text-slate-400 font-normal">(Optional)</span>
                                                        </label>
                                                        <input
                                                            value={orgData.provinceNumber?.value || ""}
                                                            disabled
                                                            placeholder="Auto-mapped"
                                                            className={`${commonInputStyles} cursor-not-allowed bg-slate-100 text-slate-500`}
                                                        />
                                                    </div>

                                                    <div className="flex flex-col gap-1.5 sm:gap-2">
                                                        <label className="text-xs sm:text-sm font-semibold text-slate-700">
                                                            Province <span className="text-slate-400 font-normal">(Optional)</span>
                                                        </label>
                                                        <Select
                                                            name="province"
                                                            value={orgData.province}
                                                            options={provinceOptions}
                                                            className="cursor-pointer"
                                                            placeholder="Select Province"
                                                            styles={ValidateStyle(!!orgErrors.province, false)}
                                                            onChange={(option) => {
                                                                setOrgData((prev) => ({
                                                                    ...prev,
                                                                    province: option,
                                                                    provinceNumber: provinceNumberOption(option),
                                                                    district: null,
                                                                    localLevel: null
                                                                }));
                                                                setOrgErrors((prev) => ({ ...prev, province: "", district: "", localLevel: "" }));
                                                            }}
                                                        />
                                                        {orgErrors.province && <p className="mt-1 text-xs font-medium text-red-500">{orgErrors.province}</p>}
                                                    </div>

                                                    <div className="flex flex-col gap-1.5 sm:gap-2">
                                                        <label className="text-xs sm:text-sm font-semibold text-slate-700">
                                                            District <span className="text-slate-400 font-normal">(Optional)</span>
                                                        </label>
                                                        <Select
                                                            name="district"
                                                            value={orgData.district}
                                                            options={orgDistrictOptions}
                                                            isDisabled={!orgData.province}
                                                            placeholder={orgData.province ? "Select District" : "Select Province First"}
                                                            className={!orgData.province ? "cursor-not-allowed" : "cursor-pointer"}
                                                            styles={ValidateStyle(!!orgErrors.district, false)}
                                                            onChange={(option) => {
                                                                setOrgData((prev) => ({ ...prev, district: option, localLevel: null }));
                                                                setOrgErrors((prev) => ({ ...prev, district: "", localLevel: "" }));
                                                            }}
                                                        />
                                                        {orgErrors.district && <p className="mt-1 text-xs font-medium text-red-500">{orgErrors.district}</p>}
                                                    </div>

                                                    <div className="flex flex-col gap-1.5 sm:gap-2">
                                                        <label className="text-xs sm:text-sm font-semibold text-slate-700">
                                                            Local Level <span className="text-slate-400 font-normal">(Optional)</span>
                                                        </label>
                                                        <Select
                                                            name="localLevel"
                                                            value={orgData.localLevel}
                                                            options={orgLocalLevelOptions}
                                                            isDisabled={!orgData.district}
                                                            placeholder={orgData.district ? "Select Local Level" : "Select District first"}
                                                            className={!orgData.district ? "cursor-not-allowed" : "cursor-pointer"}
                                                            styles={ValidateStyle(!!orgErrors.localLevel, false)}
                                                            onChange={(option) => {
                                                                handleInputChange(option, "org", "localLevel");
                                                                setOrgErrors((prev) => ({ ...prev, localLevel: "" }));
                                                            }}
                                                        />
                                                        {orgErrors.localLevel && <p className="mt-1 text-xs font-medium text-red-500">{orgErrors.localLevel}</p>}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1.5 sm:gap-2">
                                                <label className="text-xs sm:text-sm font-semibold text-slate-700">
                                                    Registration Number <span className="text-slate-400 font-normal">(Optional)</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="registrationNumber"
                                                    value={orgData.registrationNumber}
                                                    placeholder="e.g. REG123456"
                                                    className={orgErrors.registrationNumber ? errorInputStyles : commonInputStyles}
                                                    onChange={(e) => handleInputChange(e, "org")}
                                                    onBlur={(e) => validateField(e.target.name, e.target.value, "org")}
                                                />
                                                {orgErrors.registrationNumber && <p className="mt-1 text-xs font-medium text-red-500">{orgErrors.registrationNumber}</p>}
                                            </div>

                                            <div className="flex flex-col gap-1.5 sm:gap-2">
                                                <label className="text-xs sm:text-sm font-semibold text-slate-700">
                                                    VAT / PAN Number <span className="text-slate-400 font-normal">(Optional)</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="vatPan"
                                                    value={orgData.vatPan}
                                                    placeholder="e.g. VAT1234567890"
                                                    className={orgErrors.vatPan ? errorInputStyles : commonInputStyles}
                                                    onChange={(e) => handleInputChange(e, "org")}
                                                    onBlur={(e) => validateField(e.target.name, e.target.value, "org")}
                                                />
                                                {orgErrors.vatPan && <p className="mt-1 text-xs font-medium text-red-500">{orgErrors.vatPan}</p>}
                                            </div>



                                            <div className="flex flex-col gap-1.5 sm:gap-2">
                                                <label className="text-xs sm:text-sm font-semibold text-slate-700">
                                                    Organization Telephone <span className="text-slate-400 font-normal">(Optional)</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="orgTelephone"
                                                    value={orgData.orgTelephone}
                                                    placeholder="+977 1XXXXXXX"
                                                    className={orgErrors.orgTelephone ? errorInputStyles : commonInputStyles}
                                                    onChange={(e) => handleInputChange(e, "org")}
                                                    onBlur={(e) => validateField(e.target.name, e.target.value, "org")}
                                                />
                                                {orgErrors.orgTelephone && <p className="mt-1 text-xs font-medium text-red-500">{orgErrors.orgTelephone}</p>}
                                            </div>

                                            <div className="flex flex-col gap-1.5 sm:gap-2">
                                                <label className="text-xs sm:text-sm font-semibold text-slate-700">
                                                    Organization Email <span className="text-slate-400 font-normal">(Optional)</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    name="orgEmail"
                                                    value={orgData.orgEmail}
                                                    placeholder="info@company.com"
                                                    className={orgErrors.orgEmail ? errorInputStyles : commonInputStyles}
                                                    onChange={(e) => handleInputChange(e, "org")}
                                                    onBlur={(e) => validateField(e.target.name, e.target.value, "org")}
                                                />
                                                {orgErrors.orgEmail && <p className="mt-1 text-xs font-medium text-red-500">{orgErrors.orgEmail}</p>}
                                            </div>

                                            {isEducationService ? (
                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 sm:col-span-2">
                                                    <div className="flex flex-col gap-1.5 sm:gap-2">
                                                        <label className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase">
                                                            Total Learners <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            name="totalEmp_learners"
                                                            min="0"
                                                            value={orgData.totalEmp_learners}
                                                            className={orgErrors.totalEmp_learners ? errorInputStyles : commonInputStyles}
                                                            placeholder="e.g. 150"
                                                            onChange={(e) => handleInputChange(e, "org")}
                                                            onBlur={(e) => validateField(e.target.name, e.target.value, "org")}
                                                        />
                                                        {orgErrors.totalEmp_learners && <p className="mt-1 text-xs font-medium text-red-500">{orgErrors.totalEmp_learners}</p>}
                                                    </div>

                                                    <div className="flex flex-col gap-1.5 sm:gap-2">
                                                        <label className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase">
                                                            Total Educators <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            name="totalEducator"
                                                            min="0"
                                                            value={orgData.totalEducator}
                                                            className={orgErrors.totalEducator ? errorInputStyles : commonInputStyles}
                                                            placeholder="e.g. 45"
                                                            onChange={(e) => handleInputChange(e, "org")}
                                                            onBlur={(e) => validateField(e.target.name, e.target.value, "org")}
                                                        />
                                                        {orgErrors.totalEducator && <p className="mt-1 text-xs font-medium text-red-500">{orgErrors.totalEducator}</p>}
                                                    </div>

                                                    <div className="col-span-1 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-2 sm:col-span-2 sm:gap-4">
                                                        <div className="flex min-w-0 flex-col gap-1.5 sm:gap-2">
                                                            <label className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase">From Grade <span className="text-red-500">*</span></label>
                                                            <input
                                                                type="text"
                                                                name="fromGrade"
                                                                value={orgData.fromGrade}
                                                                className={orgErrors.fromGrade ? errorInputStyles : commonInputStyles}
                                                                onChange={(e) => handleInputChange(e, "org")}
                                                                onBlur={(e) => validateField(e.target.name, e.target.value, "org")}
                                                                placeholder="e.g. Nursery"
                                                            />
                                                            {orgErrors.fromGrade && <p className="text-[11px] text-red-500">{orgErrors.fromGrade}</p>}
                                                        </div>

                                                        <ArrowRight size={20} className="mb-3 text-amber-500" aria-hidden="true" />

                                                        <div className="flex min-w-0 flex-col gap-1.5 sm:gap-2">
                                                            <label className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase">To Grade <span className="text-red-500">*</span></label>
                                                            <input
                                                                type="text"
                                                                name="toGrade"
                                                                value={orgData.toGrade}
                                                                className={orgErrors.toGrade ? errorInputStyles : commonInputStyles}
                                                                onChange={(e) => handleInputChange(e, "org")}
                                                                onBlur={(e) => validateField(e.target.name, e.target.value, "org")}
                                                                placeholder="e.g. Class 12"
                                                            />
                                                            {orgErrors.toGrade && <p className="text-[11px] text-red-500">{orgErrors.toGrade}</p>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 gap-4 sm:col-span-2 sm:grid-cols-2 sm:gap-5">
                                                    <div className="flex flex-col gap-1.5 sm:col-span-2 sm:gap-2">
                                                        <label className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase">Total Employees <span className="text-red-500">*</span></label>
                                                        <input
                                                            type="number"
                                                            name="totalEmp_learners"
                                                            min="0"
                                                            step="1"
                                                            value={orgData.totalEmp_learners}
                                                            className={orgErrors.totalEmp_learners ? errorInputStyles : commonInputStyles}
                                                            placeholder="Enter total employees"
                                                            onChange={(e) => handleInputChange(e, "org")}
                                                            onBlur={(e) => validateField(e.target.name, e.target.value, "org")}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 pt-6 sm:pt-8 border-t border-slate-100 mt-2">
                                            <div className="sm:col-span-2 border-l-4 border-orange-500 pl-4 py-1.5 bg-orange-50/50 rounded-r-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                                <h3 className="text-sm font-bold text-orange-900 uppercase tracking-wider">
                                                    Primary Contact Person <span className="text-slate-500 font-normal normal-case tracking-normal">(Optional)</span>
                                                </h3>
                                                {orgData.alternativeContacts.length < 3 && (
                                                    <button
                                                        type="button"
                                                        onClick={addAlternativeContact}
                                                        className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-white border border-orange-200 rounded-md px-3 py-1.5 hover:bg-orange-50 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                                                    >
                                                        <Plus size={14} /> Add Alternative Contact
                                                    </button>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-1.5 sm:gap-2">
                                                <label className="text-xs sm:text-sm font-semibold text-slate-700">
                                                    Full Name <span className="text-slate-400 font-normal">(Optional)</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="contactPersonName"
                                                    value={orgData.contactPersonName}
                                                    placeholder="John Doe"
                                                    className={orgErrors.contactPersonName ? errorInputStyles : commonInputStyles}
                                                    onChange={(e) => handleInputChange(e, "org")}
                                                    onBlur={(e) => validateField(e.target.name, e.target.value, "org")}
                                                />
                                                {orgErrors.contactPersonName && <p className="mt-1 text-xs font-medium text-red-500">{orgErrors.contactPersonName}</p>}
                                            </div>

                                            <div className="flex flex-col gap-1.5 sm:gap-2">
                                                <label className="text-xs sm:text-sm font-semibold text-slate-700">
                                                    Role / Position <span className="text-slate-400 font-normal">(Optional)</span>
                                                </label>
                                                <Select
                                                    name="role"
                                                    value={orgData.role}
                                                    options={BusinessRole}
                                                    className="cursor-pointer"
                                                    styles={ValidateStyle(!!orgErrors.role, false)}
                                                    placeholder="Select role"
                                                    onChange={(option) => {
                                                        handleInputChange(option, "org", "role");
                                                        validateField("role", option, "org");
                                                    }}
                                                />
                                                {orgErrors.role && <p className="mt-1 text-xs font-medium text-red-500">{orgErrors.role}</p>}
                                            </div>

                                            <div className="flex flex-col gap-1.5 sm:gap-2">
                                                <label className="text-xs sm:text-sm font-semibold text-slate-700">
                                                    Contact Number <span className="text-slate-400 font-normal">(Optional)</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="contactPersonNumber"
                                                    value={orgData.contactPersonNumber}
                                                    placeholder="+977 98XXXXXXXX"
                                                    className={orgErrors.contactPersonNumber ? errorInputStyles : commonInputStyles}
                                                    onChange={(e) => handleInputChange(e, "org")}
                                                    onBlur={(e) => validateField(e.target.name, e.target.value, "org")}
                                                />
                                                {orgErrors.contactPersonNumber && <p className="mt-1 text-xs font-medium text-red-500">{orgErrors.contactPersonNumber}</p>}
                                            </div>

                                            <div className="flex flex-col gap-1.5 sm:gap-2">
                                                <label className="text-xs sm:text-sm font-semibold text-slate-700">
                                                    Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    name="contactPersonEmail"
                                                    value={orgData.contactPersonEmail}
                                                    placeholder="contact@organization.com"
                                                    className={orgErrors.contactPersonEmail ? errorInputStyles : commonInputStyles}
                                                    onChange={(e) => handleInputChange(e, "org")}
                                                    onBlur={(e) => validateField(e.target.name, e.target.value, "org")}
                                                />
                                                {orgErrors.contactPersonEmail && <p className="mt-1 text-xs font-medium text-red-500">{orgErrors.contactPersonEmail}</p>}
                                            </div>

                                            {/* Alternative Contact Persons Block */}
                                            {orgData.alternativeContacts.map((contact, index) => (
                                                <div key={index} className="col-span-1 sm:col-span-2 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm mt-3">
                                                    <div
                                                        className="bg-slate-50 px-4 py-3.5 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors border-b border-slate-100"
                                                        onClick={() => toggleAltContactExpand(index)}
                                                    >
                                                        <span className="text-sm font-bold text-slate-700 flex items-center gap-2 select-none">
                                                            {contact.isExpanded ? <ChevronUp size={18} className="text-orange-500" /> : <ChevronDown size={18} className="text-slate-400" />}
                                                            Alternative Contact #{index + 1} {contact.name ? <span className="text-slate-500 font-medium">— {contact.name}</span> : ""}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => removeAlternativeContact(index, e)}
                                                            className="text-slate-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>

                                                    <AnimatePresence initial={false}>
                                                        {contact.isExpanded && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: "auto", opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                                                className="overflow-visible bg-white"
                                                            >
                                                                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5 bg-slate-50/30">
                                                                    <div className="flex flex-col gap-1.5 sm:gap-2">
                                                                        <label className="text-xs sm:text-sm font-semibold text-slate-700">Full Name</label>
                                                                        <input
                                                                            type="text"
                                                                            value={contact.name}
                                                                            placeholder="Full Name"
                                                                            className={commonInputStyles}
                                                                            onChange={(e) => handleAltContactChange(index, "name", e.target.value)}
                                                                        />
                                                                    </div>
                                                                    <div className="flex flex-col gap-1.5 sm:gap-2">
                                                                        <label className="text-xs sm:text-sm font-semibold text-slate-700">Role / Position</label>
                                                                        <Select
                                                                            value={contact.role}
                                                                            options={BusinessRole}
                                                                            placeholder="Select role"
                                                                            className="cursor-pointer"
                                                                            menuPosition="fixed"
                                                                            styles={{
                                                                                ...ValidateStyle(false, false),
                                                                                menu: (provided) => ({ ...provided, zIndex: 9999 })
                                                                            }}
                                                                            onChange={(option) => handleAltContactChange(index, "role", option)}
                                                                        />
                                                                    </div>
                                                                    <div className="flex flex-col gap-1.5 sm:gap-2">
                                                                        <label className="text-xs sm:text-sm font-semibold text-slate-700">Contact Number</label>
                                                                        <input
                                                                            type="tel"
                                                                            value={contact.number}
                                                                            placeholder="Contact Number"
                                                                            className={commonInputStyles}
                                                                            onChange={(e) => handleAltContactChange(index, "number", e.target.value)}
                                                                        />
                                                                    </div>
                                                                    <div className="flex flex-col gap-1.5 sm:gap-2">
                                                                        <label className="text-xs sm:text-sm font-semibold text-slate-700">Email Address</label>
                                                                        <input
                                                                            type="email"
                                                                            value={contact.email}
                                                                            placeholder="Email Address"
                                                                            className={commonInputStyles}
                                                                            onChange={(e) => handleAltContactChange(index, "email", e.target.value)}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                <div className="flex flex-col sm:flex-row justify-end items-center gap-3 sm:gap-4 mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-slate-200">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={isSubmitting}
                                        className="w-full sm:w-auto px-6 py-2.5 sm:py-3 text-sm border-2 border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 transition-colors font-bold disabled:opacity-60 cursor-pointer"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`w-full sm:w-auto px-8 py-2.5 sm:py-3 text-sm font-bold rounded-lg transition-all transform cursor-pointer ${isSubmitting
                                            ? "bg-gradient-to-r from-amber-300 to-orange-300 text-white/70 cursor-not-allowed shadow-none opacity-70"
                                            : "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/30 active:scale-[0.98]"
                                            }`}
                                    >
                                        {isSubmitting ? "Saving Lead Data..." : "Save Lead & Organization"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
export default LeadForm;