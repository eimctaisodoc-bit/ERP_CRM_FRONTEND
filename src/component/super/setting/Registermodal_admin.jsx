import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
    X, User, Mail, Phone, Lock, KeyRound, ChevronRight,
    Loader2, Map, MapPin, Briefcase, Shield, Navigation, Edit, Wand2
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Select from "react-select";
import { waitingNotify, ErrorNotify, SuccessNotify } from "../../hotToaster";
import {useGet } from "../../hooks/useGet";
import { UseAdd } from "../../hooks/useadd";
import { UseDelete } from "../../hooks/useDelete";

// Deleteadmin_
// Inline Style Objects for Roboto Slab
const fontLight = { fontFamily: "'Roboto Slab', serif", fontWeight: 300 };
const fontBold = { fontFamily: "'Roboto Slab', serif", fontWeight: 700 };

// Dependent Data Mapping - Provinces & Districts of Nepal
const provinceDistricts = {
    "Koshi Province": ["Bhojpur", "Dhankuta", "Ilam", "Jhapa", "Khotang", "Morang", "Okhaldhunga", "Panchthar", "Sankhuwasabha", "Solukhumbu", "Sunsari", "Taplejung", "Terhathum", "Udayapur"],
    "Madhesh Province": ["Bara", "Dhanusha", "Mahottari", "Parsa", "Rautahat", "Saptari", "Sarlahi", "Siraha"],
    "Bagmati Province": ["Bhaktapur", "Chitwan", "Dhading", "Dolakha", "Kathmandu", "Kavrepalanchok", "Lalitpur", "Makwanpur", "Nuwakot", "Ramechhap", "Rasuwa", "Sindhuli", "Sindhupalchok"],
    "Gandaki Province": ["Baglung", "Gorkha", "Kaski", "Lamjung", "Manang", "Mustang", "Myagdi", "Nawalpur", "Parbat", "Syangja", "Tanahun"],
    "Lumbini Province": ["Arghakhanchi", "Banke", "Bardiya", "Dang", "Eastern Rukum", "Gulmi", "Kapilvastu", "Palpa", "Pyuthan", "Rolpa", "Rupandehi", "Western Nawalparasi"],
    "Karnali Province": ["Dailekh", "Dolpa", "Humla", "Jajarkot", "Jumla", "Kalikot", "Mugu", "Salyan", "Surkhet", "Western Rukum"],
    "Sudurpashchim Province": ["Achham", "Baitadi", "Bajhang", "Bajura", "Dadeldhura", "Darchula", "Doti", "Kailali", "Kanchanpur"]
};

// Auto-fill Mapping for Province Number
const provinceNumbers = {
    "Koshi Province": 1,
    "Madhesh Province": 2,
    "Bagmati Province": 3,
    "Gandaki Province": 4,
    "Lumbini Province": 5,
    "Karnali Province": 6,
    "Sudurpashchim Province": 7
};

const provinceOptions = Object.keys(provinceDistricts).map(prov => ({ value: prov, label: prov }));
const statusOptions = [{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }];
const roleOptions = [{ value: "admin", label: "Admin" }];




// --- Validation Helpers ---
const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

const isValidPhone = (phone) => {
    // Removes spaces/hyphens, allows optional '+' at the start, requires 10 to 15 digits
    const cleaned = phone.replace(/[\s-]/g, '');
    const regex = /^\+?[0-9]{10,15}$/;
    return regex.test(cleaned);
};
// --------------------------

export const RegisterModal_Admin = ({ onClose, onSuccess, editData = false }) => {
    const isEditMode = !!editData;

    // --------------------- Initial State ---------------------
    const [formData, setFormData] = useState({
        provinceName: null,
        Prvince: null,
        localLevelName: "",
        wardNo: "",
        toleName: "",
        districts: [],
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
        status: statusOptions[0],
        role: roleOptions[0],
        lat: "",
        lng: ""
    });
    const { Createadmin_ } = UseAdd();
    const {getAllRecruitment_} = useGet();


    const { Deleteadmin_ } = UseDelete();
    const [staffOptions, setStaffOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isAutoFilled, setIsAutoFilled] = useState(false);
    const [geoBlocked, setGeoBlocked] = useState(false);


    const getAllRecruitmentData = () => {
        getAllRecruitment_.mutate(null, {
            onSuccess: (response) => {
                const fetchedData = response?.data?.data || response?.data || response || [];
                const recruitmentOptions = Array.isArray(fetchedData)
                    ? fetchedData
                        .filter((recruitment) => recruitment?.isCreated === false)
                        .map((recruitment) => {
                        const personal = recruitment.personal || {};
                        const contact = recruitment.contact || {};
                        const employment = recruitment.employment || {};
                        const fullName = [personal.firstName, personal.middleName, personal.lastName]
                            .filter(Boolean)
                            .join(" ");
                        const provinceName = employment.province
                            ? `${employment.province.charAt(0).toUpperCase()}${employment.province.slice(1)} Province`
                            : "";

                        return {
                            value: recruitment._id,
                            label: fullName,
                            personal,
                            details: {
                                designation: employment.department || "",
                                jobRole: employment.jobPosition || "",
                                personalEmail: contact.personalEmail || "",
                                officeEmail: contact.officeEmail || "",
                                personalMobile: contact.personalMobile || "",
                                officeMobile: contact.officeMobile || "",
                                provinceName: provinceName
                                    ? { value: provinceName, label: provinceName }
                                    : null,
                                districts: employment.district
                                    ? [{ value: employment.district, label: employment.district }]
                                    : [],
                                department: employment.department || "",
                                jobPosition: employment.jobPosition || "",
                                province: employment.province || "",
                                district: employment.district || ""
                            }
                        };
                        })
                    : [];

                setStaffOptions(recruitmentOptions);
            },
            onError: (error) => {
                console.error("Fetch Error:", error);
                ErrorNotify(error?.response?.data?.message || "Failed to load recruitment data.");
            }
        });
    };

    useEffect(() => {
        getAllRecruitmentData();
    }, []);

    // --------------------- Helper: Generate Username ---------------------
    const generateUsername = (nameOption) => {
        const baseName = nameOption ? nameOption.label.replace(/\s+/g, '').toLowerCase() : "admin";
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const specialChars = "!@#$_*";
        const randomSpecial = specialChars.charAt(Math.floor(Math.random() * specialChars.length));
        return `${baseName}${randomNum}${randomSpecial}`;
    };

    // --------------------- Edit Mode & Initialization ---------------------
    useEffect(() => {
        if (isEditMode && editData) {
            setFormData({
                provinceName: { value: editData.provinceName, label: editData.provinceName },
                Prvince: editData.Prvince || null,
                localLevelName: editData.localLevelName || "",
                wardNo: editData.wardNo || "",
                toleName: editData.toleName || "",
                districts: editData.districts ? editData.districts.split(',').map(d => ({ value: d.trim(), label: d.trim() })) : [],
                fullName: { value: editData.fullName, label: editData.fullName },
                designation: editData.designation || "",
                jobRole: editData.jobRole || "",
                personalMobile: editData.personalMobile || "",
                personalEmail: editData.personalEmail || "",
                username: editData.username || "",
                officeEmail: editData.officeEmail || "",
                officeMobile: editData.officeMobile || "",
                password: "",
                confirmPassword: "",
                status: statusOptions.find(s => s.value === editData.status) || statusOptions[0],
                role: roleOptions.find(r => r.value === editData.role) || roleOptions[0],
                lat: editData.lat || "",
                lng: editData.lng || ""
            });
            setIsAutoFilled(true);
        }
    }, [editData, isEditMode]);

    // --------------------- System Geolocation & Default Credentials ---------------------
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

    useEffect(() => {
        if (!isEditMode) {
            fetchLocation();

            const randomUser = generateUsername(null);
            const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#";
            let randomPw = "";
            for (let i = 0; i < 8; i++) {
                randomPw += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            setFormData(prev => ({
                ...prev,
                username: randomUser,
                password: randomPw,
                confirmPassword: randomPw
            }));
        }
    }, [editData, isEditMode]);

    // --------------------- Dynamic Options (Nepal Geo) ---------------------
    const currentDistrictOptions = useMemo(() => {
        if (!formData.provinceName) return [];
        return provinceDistricts[formData.provinceName.value].map(district => ({
            value: district,
            label: district
        }));
    }, [formData.provinceName]);

    // --------------------- Handlers ---------------------
    const handleFullNameSelect = (selectedOption) => {
        if (!selectedOption) {
            setFormData(prev => ({
                ...prev, fullName: null, designation: "", jobRole: "", personalEmail: "", personalMobile: "", provinceName: null, Prvince: null, districts: [], localLevelName: "", username: "", password: "", confirmPassword: ""
            }));
            setIsAutoFilled(false);
            return;
        }

        const details = selectedOption.details || {};
        const provNameValue = details.provinceName ? details.provinceName.value : null;

        setFormData(prev => ({
            ...prev,
            fullName: selectedOption,
            designation: details.designation || "",
            jobRole: details.jobRole || "",
            personalMobile: details.personalMobile || "",
            personalEmail: details.personalEmail || "",
            officeEmail: details.officeEmail || "",
            officeMobile: details.officeMobile || "",
            provinceName: details.provinceName || null,
            Prvince: provNameValue ? provinceNumbers[provNameValue] : null,
            districts: details.districts || [],
            localLevelName: details.localLevelName || "",
            username: generateUsername(selectedOption)
        }));

        setIsAutoFilled(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (selectedOption, fieldName) => {
        if (fieldName === "provinceName") {
            setFormData((prev) => ({
                ...prev,
                provinceName: selectedOption,
                Prvince: selectedOption ? provinceNumbers[selectedOption.value] : null,
                districts: []
            }));
        } else if (fieldName === "districts") {
            setFormData((prev) => ({ ...prev, districts: selectedOption }));
        } else {
            setFormData((prev) => ({ ...prev, [fieldName]: selectedOption }));
        }
    };

    // --------------------- 2-Second Auto-Generator ---------------------
    const handleAutoGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => {
            const randomUser = generateUsername(formData.fullName);
            const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#";
            let randomPw = "";
            for (let i = 0; i < 8; i++) {
                randomPw += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            setFormData(prev => ({
                ...prev,
                username: randomUser,
                password: randomPw,
                confirmPassword: randomPw,
            }));
            setIsGenerating(false);
        }, 2000);
    };

    // --------------------- API Submit & Strict Validation ---------------------
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Target Selection Validations
        if (!formData.fullName) return ErrorNotify("Please select a Full Name.");
        if (!formData.designation?.trim()) return ErrorNotify("Department is required.");
        if (!formData.jobRole?.trim()) return ErrorNotify("Job Role is required.");
        
        // Email & Phone Format Validations
        if (!formData.personalMobile?.trim() || !isValidPhone(formData.personalMobile)) return ErrorNotify("Please enter a valid Personal Mobile number.");
        if (!formData.personalEmail?.trim() || !isValidEmail(formData.personalEmail)) return ErrorNotify("Please enter a valid Personal Email address.");
        if (!formData.officeEmail?.trim() || !isValidEmail(formData.officeEmail)) return ErrorNotify("Please enter a valid Office Email address.");
        if (!formData.officeMobile?.trim() || !isValidPhone(formData.officeMobile)) return ErrorNotify("Please enter a valid Office Mobile number.");

        // Geography Validations
        if (!formData.Prvince) return ErrorNotify("Province Number is required.");
        if (!formData.provinceName) return ErrorNotify("Province Name is required.");
        if (!formData.districts || formData.districts.length === 0) return ErrorNotify("At least one District is required.");
        if (!formData.localLevelName?.trim()) return ErrorNotify("Local Level is required.");
        if (!formData.wardNo?.trim()) return ErrorNotify("Ward No is required.");
        if (!formData.toleName?.trim()) return ErrorNotify("Tole Name is required.");

        // Auth Validations
        if (!formData.username?.trim()) return ErrorNotify("Username is required.");
        if (!isEditMode) {
            if (!formData.password?.trim()) return ErrorNotify("Password is required.");
            if (!formData.confirmPassword?.trim()) return ErrorNotify("Confirm Password is required.");
        }
        if (!formData.role) return ErrorNotify("Role Assignment is required.");
        if (!formData.status) return ErrorNotify("Account Status is required.");
        if ((!isEditMode || formData.password) && formData.password !== formData.confirmPassword) {
            return ErrorNotify("Password and Confirm Password do not match!");
        }

        setLoading(true);
        waitingNotify(isEditMode ? "Updating record..." : "Registering record...");

        const payload = {
            ...formData,
            fullName: formData.fullName.label,
            provinceName: formData.provinceName.value,
            districts: formData.districts.map(d => d.value).join(", "),
            status: formData.status.value,
            role: formData.role.value,
            lat: Number(formData.lat) || null,
            lng: Number(formData.lng) || null,
            wardNo: formData.wardNo,
            toleName: formData.toleName,
            password: formData.password,
            confirmPassword: formData.confirmPassword
        };

        try {
            // FIXED API mutation error tracking and response message logic
            Createadmin_.mutate(
                { payload }, 
                {
                    onSuccess: (res) => {
                        console.log("Success:", res);
                        // Using 'res' instead of the undefined 'response'
                        SuccessNotify(res?.data?.message || res?.message || "Operation successful!");
                        if (onSuccess) onSuccess(true);
                        onClose();
                    },
                    onError: (err) => {
                        // Fixed duplicate 'onSuccess' to 'onError' to correctly handle failures
                        console.error("API Error:", err.response);
                        ErrorNotify(err.response?.data?.message || err?.message || "Failed to process the request.");
                    },
                    onSettled: () => {
                        setLoading(false);
                    }
                }
            );
        } catch (err) {
            console.error("Submission Catch Error:", err);
            ErrorNotify(err.response?.data?.message || "Something went wrong during submission.");
            setLoading(false);
        } 
    };

    // --------------------- Styles ---------------------
    const customSelectStyles = {
        control: (base, state) => ({
            ...base, backgroundColor: state.isDisabled ? "#f8fafc" : "white", borderColor: state.isFocused ? "#f59e0b" : "#cbd5e1", borderRadius: "0.75rem", padding: "2px 6px", minHeight: "46px", fontSize: "13px", boxShadow: state.isFocused ? "0 0 0 2px rgba(245, 158, 11, 0.15)" : "none", "&:hover": { borderColor: state.isDisabled ? "#cbd5e1" : "#f59e0b" }, cursor: state.isDisabled ? "not-allowed" : "default"
        }),
        option: (base, state) => ({ ...base, backgroundColor: state.isSelected ? "#f59e0b" : state.isFocused ? "#fef3c7" : "white", color: state.isSelected ? "white" : "#1e293b", fontSize: "13px" }),
        multiValue: (base) => ({ ...base, backgroundColor: "#fef3c7", borderRadius: "6px" }),
        multiValueLabel: (base) => ({ ...base, color: "#d97706", fontSize: "12px", fontWeight: "600" }),
    };

    const inputClass = "w-full py-2.5 pl-11 pr-4 rounded-xl border border-slate-300 outline-none text-sm bg-white hover:border-amber-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 transition-all";
    const disabledInputClass = "w-full py-2.5 pl-11 pr-4 rounded-xl border border-slate-200 outline-none text-sm bg-slate-100 text-slate-500 cursor-not-allowed opacity-90 font-medium";

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
                                    {isEditMode ? "Edit" : "Register"} <span className="text-blue-600">Admin Account</span>
                                </h2>
                                <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1" style={fontLight}>
                                    <KeyRound className="w-3 h-3" /> Credentials will generate automatically
                                </p>
                            </div>
                        </div>

                        {/* Quick Action Buttons Header */}
                        <div className="flex items-center gap-3">
                            <button onClick={onClose} className="p-2 cursor-pointer hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Form Body - Grid Organization */}
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

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
                                    <label className="text-xs text-slate-600" style={fontBold}>Department <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 bg-amber-50 p-1 rounded-md"><Briefcase size={14} /></div>
                                        <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} disabled={isAutoFilled} className={isAutoFilled ? disabledInputClass : inputClass} placeholder="Select name first..." style={fontLight} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600" style={fontBold}>Job Role <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 bg-amber-50 p-1 rounded-md"><Briefcase size={14} /></div>
                                        <input type="text" name="jobRole" value={formData.jobRole} onChange={handleInputChange} disabled={isAutoFilled} className={isAutoFilled ? disabledInputClass : inputClass} placeholder="Select name first..." style={fontLight} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600" style={fontBold}>Personal Mobile <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 bg-amber-50 p-1 rounded-md"><Phone size={14} /></div>
                                        <input type="tel" name="personalMobile" value={formData.personalMobile} onChange={handleInputChange} disabled={isAutoFilled} className={isAutoFilled ? disabledInputClass : inputClass} placeholder="Select name first..." style={fontLight} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600" style={fontBold}>Personal Email <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 bg-amber-50 p-1 rounded-md"><Mail size={14} /></div>
                                        <input type="email" name="personalEmail" value={formData.personalEmail} onChange={handleInputChange} disabled={isAutoFilled} className={isAutoFilled ? disabledInputClass : inputClass} placeholder="Select name first..." style={fontLight} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Regional Allocation (Nepal Geo) */}
                        <div className="space-y-4">
                            <h3 className="flex items-center gap-2 text-sm text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2" style={fontBold}>
                                <span className="p-1 rounded bg-blue-50 text-blue-500"><Map size={14} /></span>
                                Regional Allocation
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600 flex justify-between" style={fontBold}>
                                        Province No. <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 bg-blue-50 p-1 rounded-md"><MapPin size={14} /></div>
                                        <input type="text" value={formData.Prvince || ""} disabled className={disabledInputClass} placeholder="Auto-mapped" style={fontLight} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600" style={fontBold}>Province Name <span className="text-red-500">*</span></label>
                                    <Select options={provinceOptions} value={formData.provinceName} onChange={(opt) => handleSelectChange(opt, "provinceName")} placeholder="Select Province..." styles={customSelectStyles} isDisabled={isAutoFilled} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600" style={fontBold}>Districts (Multi Select) <span className="text-red-500">*</span></label>
                                    <Select isMulti options={currentDistrictOptions} value={formData.districts} onChange={(opt) => handleSelectChange(opt, "districts")} placeholder="Select Districts..." styles={customSelectStyles} isDisabled={!formData.provinceName || isAutoFilled} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600" style={fontBold}>Local Level <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 bg-blue-50 p-1 rounded-md"><MapPin size={14} /></div>
                                        <input type="text" name="localLevelName" value={formData.localLevelName} onChange={handleInputChange}  className={inputClass} placeholder="Enter Local Level" style={fontLight} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600" style={fontBold}>Ward No <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 bg-blue-50 p-1 rounded-md"><MapPin size={14} /></div>
                                        <input type="text" name="wardNo" value={formData.wardNo} onChange={handleInputChange} className={inputClass} placeholder="Enter Ward No" style={fontLight} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600" style={fontBold}>Tole Name <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 bg-blue-50 p-1 rounded-md"><MapPin size={14} /></div>
                                        <input type="text" name="toleName" value={formData.toleName} onChange={handleInputChange} className={inputClass} placeholder="Enter Tole Name" style={fontLight} />
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
                                    <label className="text-xs text-slate-600" style={fontBold}>Office Email <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-500 bg-teal-50 p-1 rounded-md"><Mail size={14} /></div>
                                        <input type="email" name="officeEmail" value={formData.officeEmail} onChange={handleInputChange} className={inputClass} placeholder="office@company.com" style={fontLight} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600" style={fontBold}>Office Mobile <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-500 bg-teal-50 p-1 rounded-md"><Phone size={14} /></div>
                                        <input type="tel" name="officeMobile" value={formData.officeMobile} onChange={handleInputChange} className={inputClass} placeholder="+977 98XXXXXXXX" style={fontLight} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Manual / Auto Credentials */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                <h3 className="flex items-center gap-2 text-sm text-slate-800 uppercase tracking-wide" style={fontBold}>
                                    <span className="p-1 rounded bg-orange-50 text-orange-500"><Lock size={14} /></span>
                                    Authentication Credentials
                                </h3>
                                {/* Auto-Generate Button Moved Here */}
                                <button
                                    type="button"
                                    onClick={handleAutoGenerate}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200 rounded-lg text-xs transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                    style={fontBold}
                                >
                                    {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                                    {isGenerating ? "Generating..." : "Regenerate"}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600" style={fontBold}>Username <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 bg-orange-50 p-1 rounded-md"><User size={14} /></div>
                                        <input type="text" name="username" value={formData.username} onChange={handleInputChange} disabled={isAutoFilled} className={isAutoFilled ? disabledInputClass : inputClass} placeholder="Enter Username" style={fontLight} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600" style={fontBold}>Password {!isEditMode && <span className="text-red-500">*</span>}</label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 bg-orange-50 p-1 rounded-md"><Lock size={14} /></div>
                                        <input type="password" name="password" value={formData.password} onChange={handleInputChange} disabled={isAutoFilled} className={isAutoFilled ? disabledInputClass : inputClass} placeholder={isEditMode ? "Leave blank to keep current" : "••••••••"} style={fontLight} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600" style={fontBold}>Confirm Password {!isEditMode && <span className="text-red-500">*</span>}</label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 bg-orange-50 p-1 rounded-md"><Lock size={14} /></div>
                                        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} disabled={isAutoFilled} className={isAutoFilled ? disabledInputClass : inputClass} placeholder={isEditMode ? "Leave blank to keep current" : "••••••••"} style={fontLight} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* System Properties & Geolocation */}
                        <div className="space-y-4">
                            <h3 className="flex items-center gap-2 text-sm text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2" style={fontBold}>
                                <span className="p-1 rounded bg-indigo-50 text-indigo-500"><Shield size={14} /></span>
                                System Properties & Geolocation
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600" style={fontBold}>Role Assignment <span className="text-red-500">*</span></label>
                                    <Select options={roleOptions} value={formData.role} onChange={(opt) => handleSelectChange(opt, "role")} styles={customSelectStyles} isDisabled={isAutoFilled} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600" style={fontBold}>Account Status <span className="text-red-500">*</span></label>
                                    <Select options={statusOptions} value={formData.status} onChange={(opt) => handleSelectChange(opt, "status")} styles={customSelectStyles} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600 flex justify-between" style={fontBold}>
                                        Latitude
                                        <span className="text-[10px] text-green-500 font-normal">Auto-fetched</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 bg-indigo-50 p-1 rounded-md"><Navigation size={14} /></div>
                                        <input type="text" value={formData.lat} disabled className={disabledInputClass} placeholder="Fetching..." style={fontLight} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600 flex justify-between" style={fontBold}>
                                        Longitude
                                        <span className="text-[10px] text-green-500 font-normal">Auto-fetched</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 bg-indigo-50 p-1 rounded-md"><Navigation size={14} /></div>
                                        <input type="text" value={formData.lng} disabled className={disabledInputClass} placeholder="Fetching..." style={fontLight} />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </form>

                    {/* Footer / Submit */}
                    <div className="p-5 border-t  border-slate-100 bg-slate-50 rounded-b-2xl shrink-0">
                        <button
                            type="button" // Changed to type="button" to prevent native form submission overlap with custom onClick logic
                            onClick={handleSubmit}
                            disabled={loading || isGenerating}
                            className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 px-4 text-sm rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg group"
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