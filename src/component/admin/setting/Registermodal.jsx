import React, { useState, useEffect, useRef } from "react";
import {
    X, User, Mail, Phone, Lock, Map, MapPin, Briefcase, Shield, Navigation,
    Edit, UserPlus, Save, Wand2, Eye, EyeOff, LoaderCircle, AlertCircle, RefreshCw
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Select from "react-select";
import { waitingNotify, ErrorNotify, SuccessNotify } from "../../hotToaster";

import { UseAdd } from '../../hooks/useadd';
import { useGet } from "../../hooks/useGet";
import { useEdit } from "../../hooks/useEdit";
import { getDistrictNames, getLocalLevelNames, provinceDistricts } from "../../province";
import { useAuth } from "../../hooks/useAuth";

/* -------------------------------------------------------------------------- */
/*  Design tokens                                                             */
/* -------------------------------------------------------------------------- */
const BRAND = "bg-gradient-to-r from-amber-500 to-orange-500";
const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40";
const INPUT = "h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10";
const CARD = "rounded-xl border border-slate-200 bg-white shadow-sm";

const btnBase = `inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS}`;
const btnPrimary = `${btnBase} ${BRAND} font-bold text-white shadow-sm`;
const btnSecondary = `${btnBase} border border-slate-200 bg-white text-slate-600 hover:bg-slate-50`;
const btnGhost = `${btnBase} text-amber-600 hover:bg-amber-50 disabled:text-slate-300 disabled:hover:bg-transparent disabled:opacity-100`;
const btnOutlineSm = `inline-flex min-h-9 cursor-pointer items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS}`;
const iconBtn = `inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-amber-50 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS}`;

// Derived states (built from INPUT so conflicting colour utilities never fight each other)
const INPUT_ERROR = INPUT
    .replace("border-slate-200", "border-red-500")
    .replace("focus:border-amber-500", "focus:border-red-500")
    .replace("focus:ring-amber-500/10", "focus:ring-red-500/10");
const INPUT_DISABLED = "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

const LABEL = "text-xs font-semibold text-slate-700";
const HELP_TEXT = "text-[11px] font-medium text-slate-500";
const ERROR_TEXT = "text-[11px] font-medium text-red-600";

/* -------------------------------------------------------------------------- */
/*  Static data                                                               */
/* -------------------------------------------------------------------------- */
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

/* -------------------------------------------------------------------------- */
/*  react-select styling (mirrors the INPUT token)                            */
/* -------------------------------------------------------------------------- */
const selectStyles = {
    control: (base, state) => ({
        ...base,
        height: 40,
        minHeight: 40,
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 500,
        backgroundColor: state.isDisabled ? "#f1f5f9" : "#f8fafc",
        borderColor: state.selectProps.hasError
            ? "#ef4444"
            : state.isFocused ? "#f59e0b" : "#e2e8f0",
        boxShadow: state.isFocused
            ? `0 0 0 2px ${state.selectProps.hasError ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)"}`
            : "none",
        cursor: state.isDisabled ? "not-allowed" : "pointer",
        "&:hover": {
            borderColor: state.selectProps.hasError ? "#ef4444" : state.isDisabled ? "#e2e8f0" : "#f59e0b"
        }
    }),
    valueContainer: (base) => ({ ...base, padding: "0 12px" }),
    indicatorSeparator: () => ({ display: "none" }),
    placeholder: (base) => ({ ...base, color: "#64748b" }),
    singleValue: (base, state) => ({ ...base, color: state.isDisabled ? "#64748b" : "#1e293b" }),
    menu: (base) => ({ ...base, borderRadius: 8, overflow: "hidden", border: "1px solid #e2e8f0", boxShadow: "0 8px 24px rgba(15,23,42,0.12)" }),
    menuPortal: (base) => ({ ...base, zIndex: 60 }),
    option: (base, state) => ({
        ...base,
        fontSize: 12,
        fontWeight: 500,
        cursor: "pointer",
        color: state.isSelected ? "#ffffff" : "#1e293b",
        backgroundColor: state.isSelected ? "#f59e0b" : state.isFocused ? "#fef3c7" : "#ffffff"
    })
};

/* -------------------------------------------------------------------------- */
/*  Small presentational helpers (defined outside so inputs never remount)    */
/* -------------------------------------------------------------------------- */
const SelectField = (props) => (
    <Select
        styles={selectStyles}
        menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
        menuPosition="fixed"
        {...props}
    />
);

const Field = ({ label, required, hint, error, htmlFor, className = "", children }) => (
    <div className={`space-y-1.5 ${className}`}>
        <label htmlFor={htmlFor} className={`flex items-center justify-between gap-2 ${LABEL}`}>
            <span>
                {label}
                {required && <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>}
            </span>
            {hint && <span className={HELP_TEXT}>{hint}</span>}
        </label>
        {children}
        {error && <p className={ERROR_TEXT} role="alert">{error}</p>}
    </div>
);

const IconInput = ({ icon: Icon, error, trailing, className = "", ...props }) => (
    <div className="relative">
        <Icon size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -mt-2 text-slate-400" />
        <input
            {...props}
            aria-invalid={error ? true : undefined}
            className={`${error ? INPUT_ERROR : INPUT} ${INPUT_DISABLED} pl-9 ${trailing ? "pr-11" : ""} ${className}`}
        />
        {trailing}
    </div>
);

const SectionCard = ({ icon: Icon, title, description, action, children }) => (
    <section className={`${CARD} p-5`}>
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    <Icon size={16} aria-hidden="true" />
                </span>
                <div>
                    <h3 className="text-sm font-bold text-slate-800">{title}</h3>
                    {description && <p className={HELP_TEXT}>{description}</p>}
                </div>
            </div>
            {action}
        </header>
        {children}
    </section>
);

const PasswordToggle = ({ visible, onToggle, disabled }) => (
    <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-label={visible ? "Hide password" : "Show password"}
        className={`${iconBtn} absolute right-1.5 top-1/2 -translate-y-1/2`}
    >
        {visible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
    </button>
);

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */
export const RegisterModal_Staff = ({ onClose, onSuccess, isEditMode = false, userId = null, userRole = null }) => {

    const [formData, setFormData] = useState({
        provinceName: null,
        provinceIndex: null,
        districtName: null,
        localLevelName: null,
        isoStandardCode: "",
        wardNo: "",
        toleName: "",
        fullName: null,
        firstName: "",
        middleName: "",
        lastName: "",
        gender: "",
        dob: "",
        maritalStatus: "",
        nationality: "",
        citizenshipId: "",
        designation: "",
        jobRole: "",
        employmentType: "",
        personalMobile: "",
        personalEmail: "",
        permanentAddress: "",
        currentAddress: "",
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

    const { Createstaff_ } = UseAdd();
    const { getStaff_, getStaffById_, GetMeDetails_Admin_ } = useGet();
    const { EditStaff_ } = useEdit();
    const { useMe } = useAuth();
    const { role, id } = useMe?.data?.user?.decoded || {};
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const submissionInFlight = useRef(false);
    const formRef = useRef(null);
    const [staffOptions, setStaffOptions] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [geoError, setGeoError] = useState(false);
    const [locationDetails, setLocationDetails] = useState({
        province: "",
        provinceName: "",
        districtName: "",
        localLevel: "",
    });

    const districtOptions = getDistrictNames(formData.provinceName?.value)
        .map(name => ({ value: name, label: name }));
    const apiLocalLevels = getLocalLevelNames(
        formData.provinceName?.value,
        formData.districtName?.value
    ).map(name => ({ value: name, label: name }));

    // Keep dependent location fields disabled until their parent is selected.
    const isActive = formData.status === "active";
    const districtIsValid = districtOptions.some(option => option.value === formData.districtName?.value);
    const provinceLocked = isEditMode || Boolean(formData.fullName);
    const districtLocked = isEditMode || !formData.provinceName;
    const localLevelLocked = isEditMode || !formData.districtName;
    const isLoadingStaffList = Boolean(getStaff_.isPending ?? getStaff_.isLoading);

    const clearErrors = (...keys) => setErrors(prev => {
        const next = { ...prev };
        keys.forEach(key => delete next[key]);
        return next;
    });

    const generateUsername = (nameOption) => {
        const baseName = nameOption ? nameOption.label.replace(/\s+/g, '').toLowerCase() : "staff";
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const specialChars = "!@#$_*";
        const randomSpecial = specialChars.charAt(Math.floor(Math.random() * specialChars.length));
        return `${baseName}${randomNum}${randomSpecial}`;
    };

    const getNormalizedProvince = (provStr) => {
        const provinceValue = provStr && typeof provStr === "object"
            ? provStr.value ?? provStr.label ?? provStr.name ?? provStr.provinceName ?? ""
            : provStr;
        if (provinceValue == null || provinceValue === "") return null;
        const numericProvince = Number(provinceValue);
        if (Number.isInteger(numericProvince)) {
            const provinceName = Object.keys(provinceNumbers)
                .find(name => provinceNumbers[name] === numericProvince);
            return provinceName ? { name: provinceName, no: numericProvince } : null;
        }
        const normalized = String(provinceValue).trim().toLowerCase();
        for (const [key, val] of Object.entries(provinceNumbers)) {
            if (key.toLowerCase().includes(normalized) || normalized.includes(key.toLowerCase().replace(' province', ''))) {
                return { name: key, no: val };
            }
        }
        return null;
    };

    const fetchLocation = () => {
        if (!("geolocation" in navigator)) {
            setGeoError(true);
            return;
        }
        setGeoError(false);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setGeoError(false);
                setFormData((prev) => ({
                    ...prev,
                    lat: position.coords.latitude.toFixed(6),
                    lng: position.coords.longitude.toFixed(6)
                }));
            },
            () => setGeoError(true),
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    const GetAllRecruitStaff = async (adminLocation, isCurrent = () => true) => {
        try {
            const response = await getStaff_.mutateAsync(adminLocation);
            if (!isCurrent()) return;
            console.log('RecruitmentRecruitment', response);

            const records = Array.isArray(response?.data)
                ? response.data
                : Array.isArray(response?.data?.data)
                    ? response.data.data
                    : [];
            const options = records.map((record) => {
                const personal = record.personal || {};
                // const id = record._id;
                const fullName = [
                    personal.firstName,
                    personal.middleName,
                    personal.lastName
                ]
                    .filter(Boolean)
                    .join(" ");

                return {
                    value: record._id,
                    label: fullName,
                    staff: record
                };
            });

            setStaffOptions(options);
        } catch (error) {
            if (isCurrent()) {
                ErrorNotify(error?.response?.data?.message || "Failed to load staff data.");
            }
        }
    };

    useEffect(() => {
        let active = true;
        setStaffOptions([]);
        setLocationDetails({
            province: "",
            provinceName: "",
            districtName: "",
            localLevel: "",
        });

        if (!id) {
            return () => {
                active = false;
            };
        }

        const fetchAdminAndStaff = async () => {
            try {
                const { data } = await GetMeDetails_Admin_.mutateAsync({
                    params: { id },
                });
                console.log(data," DistrictName");

                if (!active) return;

                const location = {
                    province: Number(data?.province) || "",
                    provinceName: data?.provinceName || "",
                    districtName: data?.district || "",
                    localLevel: data?.localLevelName || "",
                };

                setLocationDetails(location);

                if (!isEditMode) {
                    await GetAllRecruitStaff(location, () => active);
                }

            } catch (locationFetchError) {
                if (active) {
                    console.error(
                        "Failed to fetch user location details:",
                        locationFetchError,
                    );
                }
            }
        };

        fetchAdminAndStaff();

        return () => {
            active = false;
        };
    }, [
        id,
        isEditMode,
        GetMeDetails_Admin_.mutateAsync,
    ]);

    useEffect(() => {
        if (!isEditMode) {
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
                    const savedDistrict = user.districtName || "";
                    const savedLocalLevel = user.localLevelName || user.localLevel || "";
                    const validDistrict = Boolean(savedDistrict) &&
                        getDistrictNames(provinceName?.value).includes(savedDistrict);
                    const validLocalLevel = validDistrict &&
                        getLocalLevelNames(provinceName?.value, savedDistrict).includes(savedLocalLevel);
                    if (savedDistrict && !validDistrict) {
                        ErrorNotify(`Saved district "${savedDistrict}" does not match the selected province.`);
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
                        districtName: savedDistrict
                            ? { value: savedDistrict, label: savedDistrict }
                            : null,
                        isoStandardCode: user.isoStandardCode || "",
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

    // Close on Escape (ignored while a dropdown is handling the key, or while saving)
    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key === "Escape" && !event.defaultPrevented && !submissionInFlight.current) {
                onClose?.();
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [onClose]);

    const handleFullNameSelect = (selectedOption) => {
        clearErrors("fullName", "provinceName", "districtName", "localLevelName");

        if (!selectedOption) {
            setFormData(prev => ({
                ...prev,
                fullName: null,
                firstName: "",
                middleName: "",
                lastName: "",
                gender: "",
                dob: "",
                maritalStatus: "",
                nationality: "",
                citizenshipId: "",
                designation: "",
                jobRole: "",
                employmentType: "",
                personalEmail: "",
                personalMobile: "",
                permanentAddress: "",
                currentAddress: "",
                officeEmail: "",
                officeMobile: "",
                provinceName: null,
                provinceIndex: null,
                districtName: null,
                isoStandardCode: "",
                localLevelName: null,
            }));
            return;
        }

        const selectedStaff = selectedOption.staff;
        if (!selectedStaff || String(selectedStaff._id) !== String(selectedOption.value)) {
            ErrorNotify("Selected staff details are unavailable.");
            return;
        }

        const personal = selectedStaff.personal || {};
        const contact = selectedStaff.contact || {};
        const employment = selectedStaff.employment || {};
        const toFormString = value => {
            if (value == null) return "";
            if (typeof value === "object") {
                return String(value.value ?? value.label ?? value.name ?? "");
            }
            return String(value);
        };
        const matchedProvince = [
            employment.province,
            employment.provinceName,
            employment.provinceIndex
        ].map(getNormalizedProvince).find(Boolean) || null;
        const suppliedProvinceIndex = employment.provinceIndex;
        const provinceIndex = suppliedProvinceIndex != null && suppliedProvinceIndex !== ""
            && Number.isFinite(Number(suppliedProvinceIndex))
            ? Number(suppliedProvinceIndex)
            : matchedProvince?.no ?? null;
        const districtName = toFormString(employment.district).trim();
        const localLevelName = toFormString(employment.localLevel).trim();

        setFormData(prev => ({
            ...prev,
            fullName: selectedOption,
            firstName: toFormString(personal.firstName),
            middleName: toFormString(personal.middleName),
            // recruitmentId,
            lastName: toFormString(personal.lastName),
            gender: toFormString(personal.gender),
            dob: toFormString(personal.dob),
            maritalStatus: toFormString(personal.maritalStatus),
            nationality: toFormString(personal.nationality),
            citizenshipId: toFormString(personal.citizenshipId),
            designation: toFormString(employment.department),
            jobRole: toFormString(employment.jobPosition),
            employmentType: toFormString(employment.employmentType),
            personalMobile: toFormString(contact.personalMobile),
            personalEmail: toFormString(contact.personalEmail),
            permanentAddress: toFormString(contact.permanentAddress),
            currentAddress: toFormString(contact.currentAddress),
            officeEmail: toFormString(contact.officeEmail),
            officeMobile: toFormString(contact.officeMobile),
            provinceName: matchedProvince ? { value: matchedProvince.name, label: matchedProvince.name } : null,
            provinceIndex,
            districtName: districtName
                ? { value: districtName, label: districtName }
                : null,
            isoStandardCode: toFormString(employment.isoStandardCode),
            localLevelName: localLevelName
                ? { value: localLevelName, label: localLevelName }
                : null,
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        clearErrors(name);
    };

    const handleSelectChange = (selectedOption, fieldName) => {
        if (fieldName === "provinceName") {
            const provinceNumber = selectedOption ? provinceNumbers[selectedOption.value] : null;
            setFormData((prev) => ({
                ...prev,
                provinceName: selectedOption,
                provinceIndex: provinceNumber,
                districtName: null,
                localLevelName: null,
                wardNo: "",
                toleName: ""
            }));
            clearErrors("provinceName", "districtName", "localLevelName");
        } else if (fieldName === "districtName") {
            setFormData((prev) => ({
                ...prev,
                districtName: selectedOption,
                localLevelName: null,
                wardNo: "",
                toleName: ""
            }));
            clearErrors("districtName", "localLevelName");
        } else if (fieldName === "localLevelName") {
            setFormData((prev) => ({ ...prev, localLevelName: selectedOption }));
            clearErrors("localLevelName");
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
            clearErrors("username", "password", "confirmPassword");
        } catch (error) {
            ErrorNotify(error.message || "Unable to generate a secure password.");
        } finally {
            setIsGenerating(false);
        }
    };

    const scrollToFirstError = () => {
        requestAnimationFrame(() => {
            formRef.current
                ?.querySelector('[role="alert"]')
                ?.scrollIntoView({ behavior: "smooth", block: "center" });
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (submissionInFlight.current || loading) return;
        const isClient = formData.role?.value === "client";
        const isClientEdit = isEditMode && isClient;

        const validationErrors = {};

        if (!isEditMode) {
            if (!formData.fullName) validationErrors.fullName = "Select a staff member to continue.";
            if (!formData.provinceName) {
                validationErrors.provinceName = "Select a province.";
            } else if (!formData.districtName?.value || !districtIsValid) {
                validationErrors.districtName = "Select a district from the selected province.";
            } else if (
                !formData.localLevelName?.value ||
                !apiLocalLevels.some(option => option.value === formData.localLevelName.value)
            ) {
                validationErrors.localLevelName = "Select a local level from the selected district.";
            }
        }

        if (!isClientEdit && !formData.wardNo.trim()) validationErrors.wardNo = "Enter a ward number.";
        if (!formData.officeMobile.trim()) validationErrors.officeMobile = "Enter an office mobile number.";
        if (!formData.username.trim()) validationErrors.username = "Enter a username.";
        if (!isEditMode && !formData.officeEmail.trim()) validationErrors.officeEmail = "Enter an office email.";
        if (formData.officeEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.officeEmail.trim())) {
            validationErrors.officeEmail = "Enter a valid email address, like name@company.com.";
        }
        if (formData.password || formData.confirmPassword || !isEditMode) {
            if (!formData.password) validationErrors.password = "Enter a password.";
            if (!formData.confirmPassword) validationErrors.confirmPassword = "Confirm the password.";
            else if (formData.password !== formData.confirmPassword) {
                validationErrors.confirmPassword = "Passwords don't match.";
            }
            if (!formData.officeEmail.trim()) {
                validationErrors.officeEmail = "Enter an office email to change the password.";
            }
        }
        if (!["active", "inactive"].includes(formData.status)) {
            validationErrors.status = "Select a valid account status.";
        }
        if (Object.keys(validationErrors).length) {
            setErrors(validationErrors);
            ErrorNotify("Please correct the highlighted fields.");
            scrollToFirstError();
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
                districtName: formData.districtName?.value || "",
                isoStandardCode: formData.isoStandardCode || "",
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                isActive: formData.status === "active",
                role: formData.role.value
            }
            : {
                ...formValues,
                fullName: formData.fullName.label,
                recruitmentId: formData.fullName.value,
                provinceName: formData.provinceName?.value,
                districtName: formData.districtName?.value || "",
                provinceIndex: Number(formData.provinceIndex),
                localLevelName: formData.localLevelName?.value || "",
                isoStandardCode: formData.isoStandardCode || "",
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



    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.18 }}
                className="fixed inset-0 z-50 flex w-full items-center justify-center bg-slate-900/50 p-3 backdrop-blur-sm"
            >
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="staff-modal-title"
                    className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl"
                >

                    {/* Header */}
                    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                        <div className="flex items-center gap-3">
                            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${BRAND}`}>
                                {isEditMode ? <Edit size={18} aria-hidden="true" /> : <UserPlus size={18} aria-hidden="true" />}
                            </span>
                            <div>
                                <h2 id="staff-modal-title" className="text-base font-bold text-slate-800">
                                    {isEditMode ? `Edit ${formData.role.label.toLowerCase()} account` : "Register staff account"}
                                </h2>
                                <p className={HELP_TEXT}>
                                    {isEditMode
                                        ? "Update contact, location and login details."
                                        : "Select a staff member and their details fill in automatically."}
                                </p>
                            </div>
                        </div>
                        <button type="button" onClick={onClose} disabled={loading} aria-label="Close" className={iconBtn}>
                            <X size={18} aria-hidden="true" />
                        </button>
                    </div>

                    {/* Form body */}
                    <form
                        id="staff-registration-form"
                        ref={formRef}
                        noValidate
                        onSubmit={handleSubmit}
                        className="flex-1 overflow-y-auto bg-slate-50/70 p-5"
                    >
                        <fieldset disabled={loading} className="m-0 min-w-0 space-y-4 border-0 p-0">

                            {isEditMode && loading && !formData.fullName && (
                                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600" role="status">
                                    <LoaderCircle className="h-3.5 w-3.5 animate-spin text-amber-600" strokeWidth={2.5} aria-hidden="true" />
                                    Loading staff details...
                                </div>
                            )}

                            {/* Staff details */}
                            <SectionCard
                                icon={User}
                                title="Staff details"
                                description={isEditMode ? "These details come from the staff record." : "Pick a person to fill these in from their staff record."}
                            >
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <Field label="Full name" required htmlFor="fullName" error={errors.fullName} className="md:col-span-2">
                                        <SelectField
                                            inputId="fullName"
                                            options={staffOptions}
                                            value={formData.fullName}
                                            onChange={handleFullNameSelect}
                                            placeholder="Search and select a staff member..."
                                            noOptionsMessage={() => "No unregistered staff found"}
                                            isClearable
                                            isDisabled={isEditMode || loading}
                                            isLoading={isLoadingStaffList}
                                            hasError={Boolean(errors.fullName)}
                                        />
                                    </Field>

                                    <Field label="Department" htmlFor="designation">
                                        <IconInput icon={Briefcase} id="designation" type="text" name="designation" value={formData.designation} disabled={Boolean(formData.fullName)} onChange={handleInputChange} placeholder="Department" />
                                    </Field>
                                    <Field label="Job position" htmlFor="jobRole">
                                        <IconInput icon={Briefcase} id="jobRole" type="text" name="jobRole" value={formData.jobRole} disabled={Boolean(formData.fullName)} onChange={handleInputChange} placeholder="Job position" />
                                    </Field>
                                    <Field label="Personal mobile" htmlFor="personalMobile">
                                        <IconInput icon={Phone} id="personalMobile" type="tel" name="personalMobile" value={formData.personalMobile} disabled={Boolean(formData.fullName)} onChange={handleInputChange} placeholder="Personal mobile" />
                                    </Field>
                                    <Field label="Personal email" htmlFor="personalEmail">
                                        <IconInput icon={Mail} id="personalEmail" type="email" name="personalEmail" value={formData.personalEmail} disabled={Boolean(formData.fullName)} onChange={handleInputChange} placeholder="Personal email" />
                                    </Field>
                                </div>
                            </SectionCard>

                            {/* Regional allocation */}
                            <SectionCard icon={Map} title="Regional allocation" description="Where this person is assigned.">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                                    <Field label="Province" required htmlFor="provinceName" error={errors.provinceName}>
                                        <SelectField
                                            inputId="provinceName"
                                            options={provinceOptions}

                                            value={formData.provinceName}
                                            onChange={(opt) => handleSelectChange(opt, "provinceName")}
                                            placeholder="Select province"
                                            isDisabled={loading || provinceLocked || Boolean(formData.fullName)}
                                            hasError={Boolean(errors.provinceName)}
                                        />
                                    </Field>
                                    <Field label="District" required htmlFor="districtName" error={errors.districtName}>
                                        <SelectField
                                            inputId="districtName"
                                            options={districtOptions}
                                            value={formData.districtName}
                                            onChange={(opt) => handleSelectChange(opt, "districtName")}
                                            placeholder={formData.provinceName ? "Select district" : "Select a province first"}
                                            isDisabled={loading || districtLocked || Boolean(formData.fullName)}
                                            hasError={Boolean(errors.districtName)}
                                        />
                                    </Field>
                                    <Field label="Local level" required htmlFor="localLevelName" error={errors.localLevelName}>
                                        <SelectField
                                            inputId="localLevelName"
                                            options={apiLocalLevels}
                                            value={formData.localLevelName}
                                            onChange={(opt) => handleSelectChange(opt, "localLevelName")}
                                            placeholder={formData.districtName ? "Select local level" : "Select a district first"}
                                            isDisabled={loading || localLevelLocked || Boolean(formData.fullName)}
                                            hasError={Boolean(errors.localLevelName)}
                                        />
                                    </Field>
                                    <Field label="Ward no." required htmlFor="wardNo" error={errors.wardNo}>
                                        <IconInput icon={MapPin} id="wardNo" type="text" name="wardNo" value={formData.wardNo} onChange={handleInputChange} error={errors.wardNo} placeholder="Enter ward number" />
                                    </Field>
                                    <Field label="Tole name" htmlFor="toleName" hint="Optional">
                                        <IconInput icon={MapPin} id="toleName" type="text" name="toleName" value={formData.toleName} onChange={handleInputChange} placeholder="Enter tole name" />
                                    </Field>
                                </div>
                            </SectionCard>

                            {/* Office contact */}
                            <SectionCard icon={Briefcase} title="Office contact" description="Used for sign-in notices and account recovery.">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <Field label="Office email" required={!isEditMode} htmlFor="officeEmail" error={errors.officeEmail}>
                                        <IconInput icon={Mail} id="officeEmail" type="email" name="officeEmail" autoComplete="off" value={formData.officeEmail} onChange={handleInputChange} error={errors.officeEmail} placeholder="name@company.com" />
                                    </Field>
                                    <Field label="Office mobile" required htmlFor="officeMobile" error={errors.officeMobile}>
                                        <IconInput icon={Phone} id="officeMobile" type="tel" name="officeMobile" autoComplete="off" value={formData.officeMobile} onChange={handleInputChange} error={errors.officeMobile} placeholder="+977 98XXXXXXXX" />
                                    </Field>
                                </div>
                            </SectionCard>

                            {/* Login credentials */}
                            <SectionCard
                                icon={Lock}
                                title="Login credentials"
                                description={isEditMode ? "Leave both password fields blank to keep the current password." : "Generate a secure password or enter your own."}
                                action={
                                    <button type="button" onClick={handleAutoGenerate} disabled={loading || isGenerating} className={btnGhost}>
                                        {isGenerating
                                            ? <LoaderCircle className="h-3.5 w-3.5 animate-spin text-amber-600" strokeWidth={2.5} aria-hidden="true" />
                                            : <Wand2 className="h-3.5 w-3.5" aria-hidden="true" />}
                                        {isEditMode ? "Generate new" : "Auto generate"}
                                    </button>
                                }
                            >
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <Field label="Username" required htmlFor="username" error={errors.username}>
                                        <IconInput icon={User} id="username" type="text" name="username" autoComplete="off" value={formData.username} onChange={handleInputChange} error={errors.username} placeholder="Enter username" disabled={Boolean(formData.fullName)} />
                                    </Field>
                                    <Field label="Password" required={!isEditMode} htmlFor="password" error={errors.password}>
                                        <IconInput
                                            icon={Lock}
                                            id="password"
                                            type={passwordVisible ? "text" : "password"}
                                            name="password"
                                            autoComplete="new-password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            error={errors.password}
                                            placeholder={isEditMode ? "Leave blank to keep current" : "Enter password"}
                                            trailing={<PasswordToggle visible={passwordVisible} onToggle={() => setPasswordVisible(v => !v)} disabled={loading} />}
                                        />
                                    </Field>
                                    <Field label="Confirm password" required={!isEditMode} htmlFor="confirmPassword" error={errors.confirmPassword}>
                                        <IconInput
                                            icon={Lock}
                                            id="confirmPassword"
                                            type={confirmPasswordVisible ? "text" : "password"}
                                            name="confirmPassword"
                                            autoComplete="new-password"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            error={errors.confirmPassword}
                                            placeholder={isEditMode ? "Leave blank to keep current" : "Re-enter password"}
                                            trailing={<PasswordToggle visible={confirmPasswordVisible} onToggle={() => setConfirmPasswordVisible(v => !v)} disabled={loading} />}
                                        />
                                    </Field>
                                </div>
                            </SectionCard>

                            {/* Account settings */}
                            <SectionCard icon={Shield} title="Account settings" description="Role and sign-in access.">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <Field label="Role" htmlFor="role">
                                        <SelectField
                                            inputId="role"
                                            options={roleOptions}
                                            value={formData.role}
                                            onChange={(opt) => handleSelectChange(opt, "role")}
                                            isDisabled
                                        />
                                    </Field>
                                    <Field
                                        label="Account status"
                                        error={errors.status}
                                        hint={!isEditMode ? "New accounts start as active" : undefined}
                                    >
                                        <div className={`flex h-10 items-center justify-between gap-3 rounded-lg border px-3 transition-colors ${isActive ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
                                            <div className="flex items-center gap-2">
                                                <span className={`h-2 w-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`} aria-hidden="true" />
                                                <span className={`text-xs font-semibold ${isActive ? "text-emerald-700" : "text-slate-600"}`}>
                                                    {isActive ? "Active" : "Inactive"}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-label="Account status"
                                                aria-checked={isActive}
                                                disabled={!isEditMode}
                                                onClick={() => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        status: prev.status === "active" ? "inactive" : "active"
                                                    }));
                                                    clearErrors("status");
                                                }}
                                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS} ${isActive ? "bg-emerald-500" : "bg-slate-300"}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform `}
                                                    style={{
                                                        transform: isActive ? "translateX(24px)" : "translateX(4px)",

                                                    }}

                                                />
                                            </button>
                                        </div>
                                    </Field>
                                </div>
                            </SectionCard>

                            {/* Device location (create only) */}
                            {!isEditMode && (
                                <SectionCard
                                    icon={Navigation}
                                    title="Device location"
                                    description="Captured automatically from this device."
                                    action={geoError && (
                                        <button type="button" onClick={fetchLocation} className={btnOutlineSm}>
                                            <RefreshCw size={12} aria-hidden="true" /> Retry
                                        </button>
                                    )}
                                >
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <Field label="Latitude" htmlFor="lat">
                                            <IconInput icon={Navigation} id="lat" type="text" value={formData.lat} disabled placeholder={geoError ? "Unavailable" : "Fetching..."} />
                                        </Field>
                                        <Field label="Longitude" htmlFor="lng">
                                            <IconInput icon={Navigation} id="lng" type="text" value={formData.lng} disabled placeholder={geoError ? "Unavailable" : "Fetching..."} />
                                        </Field>
                                    </div>
                                    {geoError && (
                                        <p className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700" role="status">
                                            <AlertCircle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                                            We couldn't get your location. Allow location access for this site in your browser settings, then select Retry.
                                        </p>
                                    )}
                                </SectionCard>
                            )}

                        </fieldset>
                    </form>

                    {/* Footer */}
                    <div className="flex shrink-0 flex-col-reverse gap-3 rounded-b-2xl border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className={`hidden sm:block ${HELP_TEXT}`}>
                            <span className="text-red-500">*</span> Required field
                        </p>
                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
                            <button type="button" onClick={onClose} disabled={loading} className={btnSecondary}>
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="staff-registration-form"
                                disabled={loading || isGenerating}
                                className={`${btnPrimary} min-w-40 hover:brightness-95`}
                            >
                                {loading ? (
                                    <>
                                        <LoaderCircle className="h-3 w-3 animate-spin text-white" strokeWidth={2.5} aria-hidden="true" />
                                        {isEditMode ? "Saving..." : "Creating..."}
                                    </>
                                ) : (
                                    <>
                                        {isEditMode ? <Save size={14} aria-hidden="true" /> : <UserPlus size={14} aria-hidden="true" />}
                                        {isEditMode ? "Save changes" : "Create account"}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                </div>
            </motion.div>
        </AnimatePresence>
    );
};