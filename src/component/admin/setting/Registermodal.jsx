import React, { useState, useEffect, useRef } from "react";
import {
    X, User, Mail, Phone, Lock, KeyRound, ChevronRight,
    Loader2, Map, MapPin, Briefcase, Shield, Navigation, Edit, Wand2, Eye, EyeOff
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Select from "react-select";
import { waitingNotify, ErrorNotify, SuccessNotify } from "../../hotToaster";

import { UseAdd } from '../../hooks/useadd';
import { useGet } from "../../hooks/useGet";
import { useEdit } from "../../hooks/useEdit";
import { getDistrictNames, getLocalLevelNames, provinceDistricts } from "../../province";

// Inline Style Objects
const fontLight = { fontFamily: "'Roboto Slab', serif", fontWeight: 300 };
const fontBold = { fontFamily: "'Roboto Slab', serif", fontWeight: 700 };

const roleOptions = [
    { value: "staff", label: "Staff" },
    { value: "client", label: "Client" }
];

const provinceOptions = Object.keys(provinceDistricts).map(name => ({ value: name, label: name }));

const provinceNumbers = {
    "Koshi Province": 1,
    "Madhesh Province": 2,
    "Bagmati Province": 3,
    "Gandaki Province": 4,
    "Lumbini Province": 5,
    "Karnali Province": 6,
    "Sudurpashchim Province": 7
};

const generateSecurePassword = (length = 12) => {
    const cryptoApi = globalThis.crypto;
    if (!cryptoApi?.getRandomValues) {
        throw new Error("Secure password generation is unavailable in this browser.");
    }

    const randomInt = (max) => {
        const range = 0x100000000;
        const limit = range - (range % max);
        const buffer = new Uint32Array(1);
        let value;
        do {
            cryptoApi.getRandomValues(buffer);
            value = buffer[0];
        } while (value >= limit);
        return value % max;
    };
    const lower = "abcdefghijkmnopqrstuvwxyz";
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const digits = "23456789";
    const symbols = "!@#";
    const all = lower + upper + digits + symbols;
    const pick = (chars) => chars.charAt(randomInt(chars.length));
    const chars = [pick(lower), pick(upper), pick(digits), pick(symbols)];
    while (chars.length < length) chars.push(pick(all));
    for (let index = chars.length - 1; index > 0; index -= 1) {
        const swapIndex = randomInt(index + 1);
        [chars[index], chars[swapIndex]] = [chars[swapIndex], chars[index]];
    }
    return chars.join("");
};

export const RegisterModal_Staff = ({ onClose, onSuccess, isEditMode = false, userId = null, userRole = null }) => {

    const [formData, setFormData] = useState({
        provinceName: null,
        provinceIndex: null,
        districts: [],
        localLevelName: null,
        wardNo: "",
        toleName: "",
        fullName: null,
        designation: "",
        jobRole: "",
        personalMobile: "",
        personalEmail: "",
        username: "",
        officeEmail: "",
        officeMobile: "",
        password: "",
        confirmPassword: "",
        status: "active",
        role: roleOptions[0],
        lat: "",
        lng: ""
    });
    // "wardNo": "10",
    //     "toleName": "Baneshwor",

    const { Createstaff_ } = UseAdd();
    const { getStaff_, getStaffById_ } = useGet();
    const { EditStaff_ } = useEdit();

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const submissionInFlight = useRef(false);
    const [staffOptions, setStaffOptions] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isAutoFilled, setIsAutoFilled] = useState(false);
    const [geoBlocked, setGeoBlocked] = useState(false);

    const apiDistricts = getDistrictNames(formData.provinceName?.value)
        .map(name => ({ value: name, label: name }));
    const apiLocalLevels = getLocalLevelNames(
        formData.provinceName?.value,
        formData.districts[0]?.value
    ).map(name => ({ value: name, label: name }));

    const generateUsername = (nameOption) => {
        const baseName = nameOption ? nameOption.label.replace(/\s+/g, '').toLowerCase() : "staff";
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const specialChars = "!@#$_*";
        const randomSpecial = specialChars.charAt(Math.floor(Math.random() * specialChars.length));
        return `${baseName}${randomNum}${randomSpecial}`;
    };

    const getNormalizedProvince = (provStr) => {
        if (!provStr) return null;
        const numericProvince = Number(provStr);
        if (Number.isInteger(numericProvince)) {
            const provinceName = Object.keys(provinceNumbers)
                .find(name => provinceNumbers[name] === numericProvince);
            return provinceName ? { name: provinceName, no: numericProvince } : null;
        }
        const normalized = provStr.trim().toLowerCase();
        for (const [key, val] of Object.entries(provinceNumbers)) {
            if (key.toLowerCase().includes(normalized) || normalized.includes(key.toLowerCase().replace(' province', ''))) {
                return { name: key, no: val };
            }
        }
        return null;
    };

    const fetchLocation = () => {
        if (!("geolocation" in navigator)) return;
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setGeoBlocked(false);
                setFormData((prev) => ({
                    ...prev,
                    lat: position.coords.latitude.toFixed(6),
                    lng: position.coords.longitude.toFixed(6)
                }));
            },
            (error) => {
                if (error.code === 1) setGeoBlocked(true);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    const GetAllRecruitStaff = async () => {
        getStaff_.mutate(null, {
            onSuccess: (response) => {
                const records = Array.isArray(response?.data)
                    ? response.data
                    : Array.isArray(response?.data?.data)
                        ? response.data.data
                        : [];

                const options = records
                    .filter(record => record.isCreated === false)
                    .map((record) => {
                        const personal = record.personal || {};
                        const contact = record.contact || {};
                        const employment = record.employment || {};

                        const fullName = [
                            personal.firstName,
                            personal.middleName,
                            personal.lastName
                        ].filter(Boolean).join(" ");

                        return {
                            value: record._id || record.id || fullName,
                            label: fullName,
                            details: {
                                designation: employment.department || "",
                                jobRole: employment.jobPosition || "",
                                province: employment.province || "",
                                district: employment.district || "",
                                personalMobile: contact.personalMobile || "",
                                personalEmail: contact.personalEmail || "",
                                officeMobile: contact.officeMobile || "",
                                officeEmail: contact.officeEmail || ""
                            }
                        };
                    })
                    .filter((option) => option.label);

                setStaffOptions(options);
            },
            onError: (error) => {
                ErrorNotify(error?.response?.data?.message || "Failed to load staff data.");
            }
        });
    };

    useEffect(() => {
        if (!isEditMode) {
            GetAllRecruitStaff();
            fetchLocation();
            handleAutoGenerate();
            return;
        }
        if (!userId) {
            ErrorNotify("Unable to edit staff: missing user ID.");
            return;
        }

        setLoading(true);
        getStaffById_.mutate(
            { params: { id: userId, role: userRole } },
            {
                onSuccess: (response) => {
                    const user = response?.data;
                    if (!user) {
                        ErrorNotify("Staff details were not returned.");
                        setLoading(false);
                        return;
                    }

                    const province = getNormalizedProvince(
                        user.provinceName ?? user.province ?? user.provinceIndex ?? user.Prvince
                    );
                    const provinceName = province
                        ? { value: province.name, label: province.name }
                        : null;
                    const districtValues = (user.districtName || user.district || "")
                        .split(",")
                        .map(value => value.trim())
                        .filter(Boolean);
                    const districtOptions = districtValues.map(value => ({ value, label: value }));
                    const savedLocalLevel = user.localLevelName || user.localLevel || "";
                    const validDistrict = districtValues.length === 1 &&
                        getDistrictNames(provinceName?.value).includes(districtValues[0]);
                    const validLocalLevel = validDistrict &&
                        getLocalLevelNames(provinceName?.value, districtValues[0]).includes(savedLocalLevel);
                    if (districtValues.length && !validDistrict) {
                        ErrorNotify(`Saved district "${districtValues.join(", ")}" does not match the selected province or single-district selection.`);
                    } else if (savedLocalLevel && !validLocalLevel) {
                        ErrorNotify(`Saved local level "${savedLocalLevel}" does not match the selected district.`);
                    }

                    setFormData(prev => ({
                        ...prev,
                        fullName: { value: user._id, label: user.fullName || user.fullname || user.username || "" },
                        designation: user.designation || "",
                        jobRole: user.jobRole || "",
                        personalMobile: user.personalMobile || "",
                        personalEmail: user.personalEmail || "",
                        username: user.username || "",
                        officeEmail: user.officeEmail || "",
                        officeMobile: user.officeMobile || "",
                        provinceName,
                        provinceIndex: province?.no ?? null,
                        districts: districtOptions,
                        localLevelName: savedLocalLevel
                            ? { value: savedLocalLevel, label: savedLocalLevel }
                            : null,
                        wardNo: user.wardNo == null ? "" : String(user.wardNo),
                        toleName: user.toleName || "",
                        status: user.isActive === false ? "inactive" : "active",
                        role: roleOptions.find(option => option.value === user.role) || roleOptions[0],
                        lat: user.latitude == null ? "" : String(user.latitude),
                        lng: user.longitude == null ? "" : String(user.longitude),
                        password: "",
                        confirmPassword: ""
                    }));
                    setLoading(false);
                },
                onError: (error) => {
                    ErrorNotify(error?.response?.data?.message || "Failed to load staff details.");
                    setLoading(false);
                }
            }
        );
    }, [isEditMode, userId, userRole]);

    const handleFullNameSelect = (selectedOption) => {
        if (!selectedOption) {
            setFormData(prev => ({
                ...prev, fullName: null, designation: "", jobRole: "", personalEmail: "", personalMobile: "",
                officeEmail: "", officeMobile: "", provinceName: null, provinceIndex: null, districts: [],
                localLevelName: null, wardNo: "", toleName: "", username: "", password: "", confirmPassword: ""
            }));
            setIsAutoFilled(false);
            return;
        }

        const details = selectedOption.details || {};
        const matchedProvince = getNormalizedProvince(details.province);

        setFormData(prev => ({
            ...prev,
            fullName: selectedOption,
            designation: details.designation || "",
            jobRole: details.jobRole || "",
            personalMobile: details.personalMobile || "",
            personalEmail: details.personalEmail || "",
            officeEmail: details.officeEmail || "",
            officeMobile: details.officeMobile || "",

            // Auto-map Province & District
            provinceName: matchedProvince ? { value: matchedProvince.name, label: matchedProvince.name } : null,
            provinceIndex: matchedProvince ? matchedProvince.no : null,
            districts: details.district ? [{ value: details.district, label: details.district }] : [],

            // Clear manual text inputs
            localLevelName: null,
            wardNo: "",
            toleName: "",

            username: generateUsername(selectedOption)
        }));

        setIsAutoFilled(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleSelectChange = (selectedOption, fieldName) => {
        if (fieldName === "provinceName") {
            const provinceNumber = selectedOption ? provinceNumbers[selectedOption.value] : null;
            setFormData((prev) => ({
                ...prev,
                provinceName: selectedOption,
                provinceIndex: provinceNumber,
                districts: [],
                localLevelName: null,
                wardNo: "",
                toleName: ""
            }));
        } else if (fieldName === "districts") {
            setFormData((prev) => ({
                ...prev,
                districts: selectedOption ? [selectedOption] : [],
                localLevelName: null,
                wardNo: "",
                toleName: ""
            }));
        } else if (fieldName === "localLevelName") {
            setFormData((prev) => ({ ...prev, localLevelName: selectedOption }));
        } else {
            setFormData((prev) => ({ ...prev, [fieldName]: selectedOption }));
        }
    };

    const handleAutoGenerate = () => {
        if (isGenerating) return;
        setIsGenerating(true);
        try {
            const randomPw = generateSecurePassword();
            setFormData(prev => ({
                ...prev,
                username: generateUsername(prev.fullName),
                password: randomPw,
                confirmPassword: randomPw
            }));
            setErrors((prev) => ({ ...prev, username: "", password: "", confirmPassword: "" }));
        } catch (error) {
            ErrorNotify(error.message || "Unable to generate a secure password.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (submissionInFlight.current || loading) return;
        const isClient = formData.role?.value === "client";
        const isClientEdit = isEditMode && isClient;

        if (!isEditMode && !formData.fullName) return ErrorNotify("Please select a Full Name.");
        if (!isEditMode && !formData.provinceName) return ErrorNotify("Province Name is required.");
        const selectedDistrict = formData.districts[0]?.value;
        if (!isEditMode && (
            formData.districts.length !== 1 ||
            !apiDistricts.some(option => option.value === selectedDistrict)
        )) return ErrorNotify("Select one District from the selected Province.");
        if (!isEditMode && (
            !formData.localLevelName?.value ||
            !apiLocalLevels.some(option => option.value === formData.localLevelName.value)
        )) return ErrorNotify("Select a Local Level from the selected District.");

        const validationErrors = {};
        if (!isClientEdit && !formData.wardNo.trim()) validationErrors.wardNo = "Ward No is required.";
        if (!formData.officeMobile.trim()) validationErrors.officeMobile = "Office Mobile is required.";
        if (!formData.username.trim()) validationErrors.username = "Username is required.";
        if (!isEditMode && !formData.officeEmail.trim()) validationErrors.officeEmail = "Office Email is required.";
        if (formData.officeEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.officeEmail.trim())) {
            validationErrors.officeEmail = "Enter a valid Office Email.";
        }
        if (formData.password || formData.confirmPassword || !isEditMode) {
            if (!formData.password) validationErrors.password = "Password is required.";
            if (!formData.confirmPassword) validationErrors.confirmPassword = "Confirm Password is required.";
            else if (formData.password !== formData.confirmPassword) {
                validationErrors.confirmPassword = "Passwords do not match.";
            }
            if (!formData.officeEmail.trim()) {
                validationErrors.officeEmail = "Office Email is required when changing the password.";
            }
        }
        if (!["active", "inactive"].includes(formData.status)) {
            validationErrors.status = "Select a valid account status.";
        }
        if (Object.keys(validationErrors).length) {
            setErrors(validationErrors);
            ErrorNotify("Please correct the highlighted fields.");
            return;
        }
        setErrors({});

        submissionInFlight.current = true;
        setLoading(true);
        waitingNotify(isEditMode ? "Updating record..." : "Registering record...");

        const { status, ...formValues } = formData;
        const payload = isEditMode
            ? {
                wardNo: formData.wardNo,
                toleName: formData.toleName,
                officeEmail: formData.officeEmail,
                officeMobile: formData.officeMobile,
                username: formData.username,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                isActive: formData.status === "active",
                role: formData.role.value
            }
            : {
                ...formValues,
                fullName: formData.fullName.label,
                provinceName: formData.provinceName?.value,
                districts: formData.districts.map(d => d.value).join(", "),
                district: formData.districts.map(d => d.value).join(", "),
                provinceIndex: Number(formData.provinceIndex),
                localLevelName: formData.localLevelName?.value || "",
                isActive: status === "active",
                role: formData.role.value,
                lat: Number(formData.lat) || null,
                lng: Number(formData.lng) || null
            };

        const mutationOptions = {
            onSuccess: (res) => {
                if (res?.success === false) {
                    ErrorNotify(res?.message || "Unable to update account.");
                    return;
                }
                SuccessNotify(res?.message || res?.data?.message || (isEditMode ? "Staff updated successfully" : "Registration Successful"));
                if (onSuccess) onSuccess(true);
                onClose();
            },
            onError: (err) => {
                ErrorNotify(err?.response?.data?.message || "Something went wrong.");
            },
            onSettled: () => {
                submissionInFlight.current = false;
                setLoading(false);
            }
        };
        if (isEditMode) {
            EditStaff_.mutate({ params: { id: userId }, payload }, mutationOptions);
        } else {
            Createstaff_.mutate({ payload }, mutationOptions);
        }
    };

    // Style adjustments for uniform height
    const customSelectStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: state.isDisabled ? "#f8fafc" : "white",
            borderColor: state.isFocused ? "#f59e0b" : "#cbd5e1",
            borderRadius: "0.75rem",
            padding: "0px 6px",
            height: "46px",
            minHeight: "46px",
            fontSize: "13px",
            boxShadow: state.isFocused ? "0 0 0 2px rgba(245, 158, 11, 0.15)" : "none",
            "&:hover": { borderColor: state.isDisabled ? "#cbd5e1" : "#f59e0b" },
            cursor: state.isDisabled ? "not-allowed" : "pointer"
        }),
        option: (base, state) => ({ ...base, backgroundColor: state.isSelected ? "#f59e0b" : state.isFocused ? "#fef3c7" : "white", color: state.isSelected ? "white" : "#1e293b", fontSize: "13px", cursor: "pointer" }),
        multiValue: (base) => ({ ...base, backgroundColor: "#fef3c7", borderRadius: "6px" }),
        multiValueLabel: (base) => ({ ...base, color: "#d97706", fontSize: "12px", fontWeight: "600" }),
    };

    const inputClass = "w-full h-[46px] pl-11 pr-4 rounded-xl border border-slate-300 outline-none text-sm bg-white hover:border-amber-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 transition-all";
    const disabledInputClass = "w-full h-[46px] pl-11 pr-4 rounded-xl border border-slate-200 outline-none text-sm bg-slate-100 text-slate-500 cursor-not-allowed opacity-90 font-medium";

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-slate-900/50 w-full z-50 flex items-center justify-center p-3 backdrop-blur-sm"
            >
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl border border-slate-200 flex flex-col max-h-[90vh]">

                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100 text-blue-600">
                                {isEditMode ? <Edit className="w-6 h-6" /> : <MapPin className="w-6 h-6" />}
                            </div>
                            <div>
                                <h2 className="text-xl text-slate-800" style={fontBold}>
                                    {isEditMode ? "Edit" : "Register"} <span className="text-blue-600">{isEditMode ? `${formData.role.label} Account` : "Staff Account"}</span>
                                </h2>
                                <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1" style={fontLight}>
                                    <KeyRound className="w-3 h-3" /> {isEditMode ? "Editing the selected profile" : "Auto-loads details for selected staff"}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-600 cursor-pointer">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    {errors.status && <p className="text-xs text-red-600" role="alert">{errors.status}</p>}

                    {/* Form Body */}
                    <form id="staff-registration-form" noValidate onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                        {/* Target Selection & Personal Details */}
                        <div className="space-y-4">
                            <h3 className="flex items-center gap-2 text-sm text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2" style={fontBold}>
                                <span className="p-1 rounded bg-amber-50 text-amber-500"><User size={14} /></span>
                                Target Selection & Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                <div className="space-y-1.5 lg:col-span-3">
                                    <label className="text-xs text-slate-600" style={fontBold}> Full Name: <span className="text-red-500">*</span></label>
                                    <Select
                                        options={staffOptions}
                                        value={formData.fullName}
                                        onChange={handleFullNameSelect}
                                        placeholder="Select Target Name to Auto-Fill..."
                                        styles={customSelectStyles}
                                        isDisabled={isEditMode}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600" style={fontBold}>Designation <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 bg-amber-50 p-1 rounded-md"><Briefcase size={14} /></div>
                                        <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} disabled={isAutoFilled || isEditMode} className={isAutoFilled || isEditMode ? disabledInputClass : inputClass} placeholder="Select name first..." style={fontLight} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600" style={fontBold}>Job Role <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 bg-amber-50 p-1 rounded-md"><Briefcase size={14} /></div>
                                        <input type="text" name="jobRole" value={formData.jobRole} onChange={handleInputChange} disabled={isAutoFilled || isEditMode} className={isAutoFilled || isEditMode ? disabledInputClass : inputClass} placeholder="Select name first..." style={fontLight} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600" style={fontBold}>Personal Mobile <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 bg-amber-50 p-1 rounded-md"><Phone size={14} /></div>
                                        <input type="tel" name="personalMobile" value={formData.personalMobile} onChange={handleInputChange} disabled={isAutoFilled || isEditMode || loading} className={isAutoFilled || isEditMode || loading ? disabledInputClass : inputClass} placeholder="Select name first..." style={fontLight} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600" style={fontBold}>Personal Email <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 bg-amber-50 p-1 rounded-md"><Mail size={14} /></div>
                                        <input type="email" name="personalEmail" value={formData.personalEmail} onChange={handleInputChange} disabled={isAutoFilled || isEditMode || loading} className={isAutoFilled || isEditMode || loading ? disabledInputClass : inputClass} placeholder="Select name first..." style={fontLight} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Regional Allocation */}
                        <div className="space-y-4">
                            <h3 className="flex items-center gap-2 text-sm text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2" style={fontBold}>
                                <span className="p-1 rounded bg-blue-50 text-blue-500"><Map size={14} /></span>
                                Regional Allocation
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600 flex justify-between" style={fontBold}>
                                        Province No. <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 bg-blue-50 p-1 rounded-md"><MapPin size={14} /></div>
                                        <input type="text" value={formData.provinceIndex || ""} disabled className={disabledInputClass} placeholder="Auto-mapped" style={fontLight} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600" style={fontBold}>Province <span className="text-red-500">*</span></label>
                                    <Select options={provinceOptions} value={formData.provinceName} onChange={(opt) => handleSelectChange(opt, "provinceName")} placeholder="Select Province" styles={customSelectStyles} isDisabled={isAutoFilled || isEditMode} className={isAutoFilled || isEditMode ? "cursor-not-allowed" : "cursor-pointer"} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600" style={fontBold}>District <span className="text-red-500">*</span></label>
                                    <Select options={apiDistricts} value={formData.districts[0] || null} onChange={(opt) => handleSelectChange(opt, "districts")} placeholder={formData.provinceName ? "Select District" : "Select Province first"} styles={customSelectStyles} isDisabled={isAutoFilled || isEditMode || !formData.provinceName} className={isAutoFilled || isEditMode || !formData.provinceName ? "cursor-not-allowed" : "cursor-pointer"} />
                                </div>

                                {/* Refactored standard text input fields */}
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600" style={fontBold}>Local Level <span className="text-red-500">*</span></label>
                                    <Select
                                        options={apiLocalLevels}
                                        value={formData.localLevelName}
                                        onChange={(option) => handleSelectChange(option, "localLevelName")}
                                        placeholder={formData.districts.length ? "Select Local Level" : "Select District first"}
                                        styles={customSelectStyles}
                                        isDisabled={!formData.districts.length || isEditMode}
                                        className={!formData.districts.length || isEditMode ? "cursor-not-allowed" : "cursor-pointer"}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600" style={fontBold}>Ward No <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 bg-blue-50 p-1 rounded-md"><MapPin size={14} /></div>
                                        <input type="text" name="wardNo" value={formData.wardNo} onChange={handleInputChange} disabled={loading} aria-invalid={Boolean(errors.wardNo)} className={errors.wardNo ? `${inputClass} border-red-500` : inputClass} placeholder="Enter Ward No..." style={fontLight} />
                                    </div>
                                    {errors.wardNo && <p className="text-xs text-red-600" role="alert">{errors.wardNo}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600" style={fontBold}>Tole Name</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 bg-blue-50 p-1 rounded-md"><MapPin size={14} /></div>
                                        <input type="text" name="toleName" value={formData.toleName} onChange={handleInputChange} disabled={loading} className={inputClass} placeholder="Enter Tole Name (Optional)..." style={fontLight} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Office Contact Information */}
                        <div className="space-y-4 p-5 bg-teal-50/30 border border-teal-100 rounded-xl">
                            <h3 className="flex items-center gap-2 text-sm text-teal-800 uppercase tracking-wide border-b border-teal-100 pb-2" style={fontBold}>
                                <span className="p-1 rounded bg-teal-100 text-teal-600"><Briefcase size={14} /></span>
                                Office Contact Information (Editable)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600" style={fontBold}>Office Email {!isEditMode && <span className="text-red-500">*</span>}</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-500 bg-teal-50 p-1 rounded-md"><Mail size={14} /></div>
                                        <input type="email" name="officeEmail" value={formData.officeEmail} onChange={handleInputChange} disabled={loading} aria-invalid={Boolean(errors.officeEmail)} className={errors.officeEmail ? `${inputClass} border-red-500` : inputClass} placeholder="office@company.com" style={fontLight} />
                                    </div>
                                    {errors.officeEmail && <p className="text-xs text-red-600" role="alert">{errors.officeEmail}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600" style={fontBold}>Office Mobile <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-500 bg-teal-50 p-1 rounded-md"><Phone size={14} /></div>
                                        <input type="tel" name="officeMobile" value={formData.officeMobile} onChange={handleInputChange} disabled={loading} aria-invalid={Boolean(errors.officeMobile)} className={errors.officeMobile ? `${inputClass} border-red-500` : inputClass} placeholder="+977 98XXXXXXXX" style={fontLight} />
                                    </div>
                                    {errors.officeMobile && <p className="text-xs text-red-600" role="alert">{errors.officeMobile}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Credentials */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                <h3 className="flex items-center gap-2 text-sm text-slate-800 uppercase tracking-wide" style={fontBold}>
                                    <span className="p-1 rounded bg-orange-50 text-orange-500"><Lock size={14} /></span>
                                    Authentication Credentials
                                </h3>
                                <button type="button" onClick={handleAutoGenerate} disabled={loading || isGenerating} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200 rounded-lg text-xs transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer" style={fontBold}>
                                    {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                                    {isGenerating ? "Generating..." : isEditMode ? "Generate new" : "Auto Generate"}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600" style={fontBold}>Username <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 bg-orange-50 p-1 rounded-md"><User size={14} /></div>
                                        <input type="text" name="username" value={formData.username} onChange={handleInputChange} disabled={loading} aria-invalid={Boolean(errors.username)} className={errors.username ? `${inputClass} border-red-500` : loading ? disabledInputClass : inputClass} placeholder="Enter Username" style={fontLight} />
                                    </div>
                                    {errors.username && <p className="text-xs text-red-600" role="alert">{errors.username}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600" style={fontBold}>Password {!isEditMode && <span className="text-red-500">*</span>}</label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 bg-orange-50 p-1 rounded-md"><Lock size={14} /></div>
                                        <input type={passwordVisible ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} disabled={loading} aria-invalid={Boolean(errors.password)} className={`${errors.password ? `${inputClass} border-red-500` : loading ? disabledInputClass : inputClass} pr-11`} placeholder={isEditMode ? "Leave blank to keep current" : "••••••••"} style={fontLight} />
                                        <button type="button" onClick={() => setPasswordVisible((visible) => !visible)} disabled={loading} aria-label={passwordVisible ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
                                            {passwordVisible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-xs text-red-600" role="alert">{errors.password}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600" style={fontBold}>Confirm Password {!isEditMode && <span className="text-red-500">*</span>}</label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 bg-orange-50 p-1 rounded-md"><Lock size={14} /></div>
                                        <input type={confirmPasswordVisible ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} disabled={loading} aria-invalid={Boolean(errors.confirmPassword)} className={`${errors.confirmPassword ? `${inputClass} border-red-500` : loading ? disabledInputClass : inputClass} pr-11`} placeholder={isEditMode ? "Leave blank to keep current" : "••••••••"} style={fontLight} />
                                        <button type="button" onClick={() => setConfirmPasswordVisible((visible) => !visible)} disabled={loading} aria-label={confirmPasswordVisible ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
                                            {confirmPasswordVisible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <p className="text-xs text-red-600" role="alert">{errors.confirmPassword}</p>}
                                </div>
                            </div>
                        </div>

                        {/* System Properties & Geolocation */}
                        <div className="space-y-4">
                            <h3 className="flex items-center gap-2 text-sm text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2" style={fontBold}>
                                <span className="p-1 rounded bg-indigo-50 text-indigo-500"><Shield size={14} /></span>
                                System Properties & Geolocation
                            </h3>
                            <div className={`grid grid-cols-1 md:grid-cols-2 ${isEditMode ? "lg:grid-cols-2" : "lg:grid-cols-4"} gap-5`}>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600" style={fontBold}>Role Assignment <span className="text-red-500">*</span></label>
                                    <Select options={roleOptions} value={formData.role} onChange={(opt) => handleSelectChange(opt, "role")} styles={customSelectStyles} isDisabled={true} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600" style={fontBold}>Account Status <span className="text-red-500">*</span></label>
                                    <div className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 transition-colors ${formData.status === "active" ? "border-emerald-200 bg-emerald-50/60" : "border-slate-200 bg-slate-50"}`}>
                                        <div className="flex items-center gap-3">
                                            <span className={`h-2.5 w-2.5 rounded-full ${formData.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                                            <div>
                                                <p className={`text-sm font-bold ${formData.status === "active" ? "text-emerald-700" : "text-slate-700"}`} style={fontBold}>
                                                    {formData.status === "active" ? "Active" : "Inactive"}
                                                </p>
                                                <p className="text-xs text-slate-500" style={fontLight}>Account access status</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-label="Account status"
                                            aria-checked={formData.status === "active"}
                                            disabled={!isEditMode || loading}
                                            onClick={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    status: prev.status === "active" ? "inactive" : "active"
                                                }));
                                                setErrors(prev => ({ ...prev, status: "" }));
                                            }}
                                            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${formData.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`}
                                        >
                                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${formData.status === "active" ? "translate-x-6" : "translate-x-1"}`} />
                                        </button>
                                    </div>
                                </div>


                                {!isEditMode && <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600 flex justify-between" style={fontBold}>
                                        Latitude <span className="text-[10px] text-green-500 font-normal">Auto-fetched</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 bg-indigo-50 p-1 rounded-md"><Navigation size={14} /></div>
                                        <input type="text" value={formData.lat} disabled className={disabledInputClass} placeholder="Fetching..." style={fontLight} />
                                    </div>
                                </div>}
                                {!isEditMode && <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600 flex justify-between" style={fontBold}>
                                        Longitude <span className="text-[10px] text-green-500 font-normal">Auto-fetched</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 bg-indigo-50 p-1 rounded-md"><Navigation size={14} /></div>
                                        <input type="text" value={formData.lng} disabled className={disabledInputClass} placeholder="Fetching..." style={fontLight} />
                                    </div>
                                </div>}
                            </div>
                        </div>

                    </form>

                    {/* Footer / Submit */}
                    <div className="p-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl shrink-0">
                        <button
                            type="submit"
                            form="staff-registration-form"
                            disabled={loading || isGenerating}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 px-4 text-sm rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-medium shadow-md hover:shadow-lg group"
                            style={fontBold}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {isEditMode ? "Updating Details..." : "Registering..."}
                                </span>
                            ) : (
                                <span className="flex items-center justify-center group-hover:scale-[1.02] transition-transform">
                                    {isEditMode ? "Save Changes" : "Create Account"}
                                    <ChevronRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </button>
                    </div>

                </div>
            </motion.div>
        </AnimatePresence>
    );
};