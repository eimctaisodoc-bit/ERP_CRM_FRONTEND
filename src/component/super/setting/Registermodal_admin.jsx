import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    AlertCircle,
    Briefcase,
    ChevronRight,
    Eye,
    EyeOff,
    KeyRound,
    Loader2,
    Lock,
    Mail,
    Map as MapIcon,
    MapPin,
    Navigation,
    Pencil,
    Phone,
    Shield,
    User,
    Wand2,
    X
} from "lucide-react";
import { motion } from "framer-motion";
import Select from "react-select";
import { waitingNotify, ErrorNotify, SuccessNotify } from "../../hotToaster";
import { useGet } from "../../hooks/useGet";
import { UseAdd } from "../../hooks/useadd";
import { useEdit } from "../../hooks/useEdit";
import { getAdminUserById } from "../../../api/role.api";
import { getDistrictNames, getLocalLevelNames, provinceDistricts } from "../../province";

/* -------------------------------------------------------------------------- */
/* Theme                                                                      */
/*   Orange #E87A24  CTAs / highlights      Amber  #F59E0B  secondary         */
/*   Wine   #422026  text & headers         Blue   #4A76C0  UI accents        */
/*   Gray   #64748B  secondary text         Border #E2E8F0  dividers          */
/*   Canvas #F8FAFC  locked / footer        Green  #16A34A  positive          */
/* -------------------------------------------------------------------------- */

const fontLight = { fontFamily: "'Roboto Slab', serif", fontWeight: 300 };
const fontBold = { fontFamily: "'Roboto Slab', serif", fontWeight: 700 };

const FORM_ID = "register-admin-form";
const MIN_PASSWORD_LENGTH = 8;

const focusRing =
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A76C0]";

const inputBase =
    "w-full rounded-xl border py-2.5 pl-11 pr-4 text-sm text-[#422026] outline-none transition placeholder:text-[#64748B]/70";
const inputOk =
    "border-[#E2E8F0] bg-white hover:border-[#E87A24] focus:border-[#E87A24] focus:ring-2 focus:ring-[#E87A24]/20";
const inputErr =
    "border-[#DC2626] bg-white focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20";
const inputLocked =
    "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] cursor-not-allowed";

const btnBase = `inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`;
const btnPrimary = `${btnBase} bg-[#E87A24] text-white hover:bg-[#D06A1B]`;
const btnSecondary = `${btnBase} border border-[#E2E8F0] bg-white text-[#422026] hover:bg-[#F8FAFC]`;

// Icon chips — one tone per section so the form is easy to scan.
const tone = {
    amber: "bg-[#FEF3C7] text-[#F59E0B]",
    blue: "bg-[#4A76C0]/10 text-[#4A76C0]",
    orange: "bg-[#E87A24]/10 text-[#E87A24]"
};

/* -------------------------------------------------------------------------- */
/* Geography helpers                                                          */
/* -------------------------------------------------------------------------- */

const provinceNumbers = {
    "Koshi Province": 1,
    "Madhesh Province": 2,
    "Bagmati Province": 3,
    "Gandaki Province": 4,
    "Lumbini Province": 5,
    "Karnali Province": 6,
    "Sudurpashchim Province": 7
};

const provinceOptions = Object.keys(provinceDistricts).map((prov) => ({ value: prov, label: prov }));

const normalizeProvince = (value) =>
    String(value).trim().toLowerCase().replace(/(?:\s+province)+$/, "").replace(/\s+/g, "");

const getProvinceOption = (province) => {
    const provinceValue = typeof province === "object" && province !== null
        ? province.value || province.label
        : province;
    if (provinceValue == null || provinceValue === "") return null;

    const wanted = normalizeProvince(provinceValue);
    const byName = provinceOptions.find((option) => normalizeProvince(option.value) === wanted);
    if (byName) return byName;

    const provinceNumber = Number(provinceValue);
    return provinceOptions.find((option) => provinceNumbers[option.value] === provinceNumber) || null;
};

const getDistrictOption = (district, provinceOption) => {
    const districtValue = typeof district === "object" && district !== null
        ? district.value || district.label
        : district;
    if (districtValue == null || districtValue === "") return null;

    const wanted = String(districtValue).trim();
    const match = getDistrictNames(provinceOption?.value)
        .find((option) => option.toLowerCase() === wanted.toLowerCase());
    return { value: match || wanted, label: match || wanted };
};

const getLocalLevelOption = (localLevel, provinceOption, districtOption) => {
    if (localLevel == null || localLevel === "") return null;

    const wanted = String(localLevel).trim();
    const match = getLocalLevelNames(provinceOption?.value, districtOption?.value)
        .find((option) => option.toLowerCase() === wanted.toLowerCase());
    return { value: match || wanted, label: match || wanted };
};

const toCoordinate = (coordinate) => {
    if (coordinate === "" || coordinate == null) return null;
    const numeric = Number(coordinate);
    return Number.isFinite(numeric) ? numeric : null;
};

const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "staff", label: "Staff" },
    { value: "client", label: "Client" },
    { value: "branch", label: "Branch" }
];

// Never silently fall back to "admin": an unknown role keeps its own value.
const getRoleOption = (role) => {
    if (!role) return roleOptions[0];
    const known = roleOptions.find((option) => option.value === role);
    if (known) return known;
    const text = String(role);
    return { value: text, label: text.charAt(0).toUpperCase() + text.slice(1) };
};

/* -------------------------------------------------------------------------- */
/* Credential + validation helpers                                            */
/* -------------------------------------------------------------------------- */

const randomInt = (max) => {
    if (globalThis.crypto?.getRandomValues) {
        const buffer = new Uint32Array(1);
        globalThis.crypto.getRandomValues(buffer);
        return buffer[0] % max;
    }
    return Math.floor(Math.random() * max);
};

const pick = (chars) => chars.charAt(randomInt(chars.length));
const secureRandomInt = (max) => {
    const cryptoApi = globalThis.crypto;
    if (!cryptoApi?.getRandomValues) {
        throw new Error("Secure password generation is unavailable in this browser.");
    }

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

const generateUsername = (nameOption) => {
    const baseName = nameOption?.label ? nameOption.label.replace(/\s+/g, "").toLowerCase() : "admin";
    return `${baseName}${1000 + randomInt(9000)}${pick("!@#$_*")}`;
};

// 12 characters, always containing lower, upper, digit and symbol.
const generatePassword = (length = 12) => {
    const lower = "abcdefghijkmnopqrstuvwxyz";
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const digits = "23456789";
    const symbols = "!@#";
    const all = lower + upper + digits + symbols;
    const securePick = (chars) => chars.charAt(secureRandomInt(chars.length));
    const chars = [securePick(lower), securePick(upper), securePick(digits), securePick(symbols)];
    while (chars.length < length) chars.push(securePick(all));
    for (let i = chars.length - 1; i > 0; i -= 1) {
        const j = secureRandomInt(i + 1);
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join("");
};

const createEmptyFormData = () => ({
    provinceName: null,
    provinceIndex: null,
    localLevelName: null,
    wardNo: "",
    toleName: "",
    district: null,
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

const createNewAccountFormData = () => {
    const password = generatePassword();
    return { ...createEmptyFormData(), username: generateUsername(null), password, confirmPassword: password };
};

const clean = (value) => String(value ?? "").trim();
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(email));
const isValidPhone = (phone) => /^\+?[0-9]{10,15}$/.test(clean(phone).replace(/[\s-]/g, ""));

// Fields that can still be changed when an existing account is edited.
const EDITABLE_WHEN_EDITING = new Set(["officeEmail", "officeMobile", "username", "password", "confirmPassword", "status"]);
// Fields that are auto-filled from the recruitment record when creating.
const LOCKED_WHEN_CREATING = new Set(["designation", "jobRole", "personalMobile", "personalEmail", "provinceIndex", "provinceName", "district"]);

const MISSING_IN_RECORD = "Missing in the selected recruitment record. Update the record first.";

/* -------------------------------------------------------------------------- */
/* react-select theme                                                         */
/* -------------------------------------------------------------------------- */

const buildSelectStyles = (hasError) => ({
    control: (base, state) => ({
        ...base,
        minHeight: 46,
        padding: "0 4px",
        borderRadius: 12,
        fontSize: 13,
        backgroundColor: state.isDisabled ? "#F8FAFC" : "#FFFFFF",
        borderColor: hasError ? "#DC2626" : state.isFocused ? "#E87A24" : "#E2E8F0",
        boxShadow: state.isFocused ? `0 0 0 2px ${hasError ? "rgba(220,38,38,0.2)" : "rgba(232,122,36,0.2)"}` : "none",
        cursor: state.isDisabled ? "not-allowed" : "pointer",
        "&:hover": { borderColor: state.isDisabled ? "#E2E8F0" : hasError ? "#DC2626" : "#E87A24" }
    }),
    singleValue: (base, state) => ({ ...base, color: state.isDisabled ? "#64748B" : "#422026" }),
    placeholder: (base) => ({ ...base, color: "#64748B", opacity: 0.8 }),
    input: (base) => ({ ...base, color: "#422026" }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (base, state) => ({ ...base, color: state.isFocused ? "#E87A24" : "#64748B" }),
    clearIndicator: (base) => ({ ...base, color: "#64748B", "&:hover": { color: "#DC2626" } }),
    menu: (base) => ({ ...base, borderRadius: 12, border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 10px 15px -3px rgba(66,32,38,0.12)" }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    option: (base, state) => ({
        ...base,
        fontSize: 13,
        cursor: "pointer",
        backgroundColor: state.isSelected ? "#E87A24" : state.isFocused ? "#FEF3C7" : "#FFFFFF",
        color: state.isSelected ? "#FFFFFF" : "#422026",
        "&:active": { backgroundColor: "#F59E0B" }
    })
});

const ModalSelect = ({ id, error, ...props }) => (
    <Select
        inputId={id}
        aria-invalid={Boolean(error)}
        styles={buildSelectStyles(Boolean(error))}
        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
        {...props}
    />
);

/* -------------------------------------------------------------------------- */
/* Small form pieces (defined outside the modal so inputs never remount)      */
/* -------------------------------------------------------------------------- */

const FormField = ({ id, label, required, error, hint, className = "", children }) => (
    <div className={`space-y-1.5 ${className}`}>
        <label htmlFor={id} className="block text-xs text-[#64748B]" style={fontBold}>
            {label}
            {required && <span className="text-[#DC2626]"> *</span>}
        </label>
        {children}
        {error ? (
            <p id={`${id}-error`} role="alert" className="flex items-start gap-1 text-xs text-[#DC2626]">
                <AlertCircle size={12} className="mt-0.5 shrink-0" aria-hidden="true" /> {error}
            </p>
        ) : hint ? (
            <p className="text-xs text-[#64748B]">{hint}</p>
        ) : null}
    </div>
);

const stateClass = (disabled, error) => (disabled ? inputLocked : error ? inputErr : inputOk);

const IconInput = ({ id, icon: Icon, chip, error, disabled, ...props }) => (
    <div className="relative">
        <span className={`absolute left-3 top-1/2 -translate-y-1/2 rounded-md p-1 ${chip}`}>
            <Icon size={14} aria-hidden="true" />
        </span>
        <input
            id={id}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
            className={`${inputBase} ${stateClass(disabled, error)}`}
            style={fontLight}
            {...props}
        />
    </div>
);

const PasswordInput = ({ id, error, disabled, defaultVisible = false, ...props }) => {
    const [visible, setVisible] = useState(defaultVisible);
    return (
        <div className="relative">
            <span className={`absolute left-3 top-1/2 -translate-y-1/2 rounded-md p-1 ${tone.orange}`}>
                <Lock size={14} aria-hidden="true" />
            </span>
            <input
                id={id}
                type={visible ? "text" : "password"}
                autoComplete="new-password"
                disabled={disabled}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : undefined}
                className={`${inputBase} pr-11 ${stateClass(disabled, error)}`}
                style={fontLight}
                {...props}
            />
            <button
                type="button"
                onClick={() => setVisible((current) => !current)}
                disabled={disabled}
                aria-label={visible ? "Hide password" : "Show password"}
                className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-md p-1 text-[#64748B] transition hover:text-[#422026] disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
            >
                {visible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
        </div>
    );
};

const Section = ({ icon: Icon, chip, title, note, action, className = "", children }) => (
    <section className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] pb-2">
            <div className="min-w-0">
                <h3 className="flex items-center gap-2 text-sm text-[#422026]" style={fontBold}>
                    <span className={`rounded p-1 ${chip}`}><Icon size={14} aria-hidden="true" /></span>
                    {title}
                </h3>
                {note && <p className="mt-0.5 pl-8 text-xs text-[#64748B]" style={fontLight}>{note}</p>}
            </div>
            {action}
        </div>
        {children}
    </section>
);

/* -------------------------------------------------------------------------- */
/* Modal                                                                      */
/* -------------------------------------------------------------------------- */

export const RegisterModal_Admin = ({ onClose, onSuccess, initialData = null, editData = false }) => {

    const isEditMode = !!editData && !!initialData;
    // console.log("isEditMode:", isEditMode);
    const isBranchRecord = Boolean(initialData?.isBranch);
    const locationUnavailable = typeof navigator === "undefined" || !navigator.geolocation;

    const [formData, setFormData] = useState(() => (isEditMode ? createEmptyFormData() : createNewAccountFormData()));
    const [errors, setErrors] = useState({});
    const { Createadmin_ } = UseAdd();
    const { EditBranch_, EditAdmin_ } = useEdit();
    const { getAllRecruitment_ } = useGet();

    const [staffOptions, setStaffOptions] = useState([]);
    const [staffLoading, setStaffLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [editLoading, setEditLoading] = useState(isEditMode);
    const [editLoadError, setEditLoadError] = useState("");
    const [dataWarning, setDataWarning] = useState("");

    const submissionInFlight = useRef(false);
    const locationRequestInFlight = useRef(false);
    const dialogRef = useRef(null);

    const formBlocked = editLoading || Boolean(editLoadError);

    const isFieldDisabled = (fieldName) => {
        if (formBlocked) return true;
        if (isEditMode) return !EDITABLE_WHEN_EDITING.has(fieldName);
        return LOCKED_WHEN_CREATING.has(fieldName);
    };

    const clearErrors = useCallback((...names) => {
        setErrors((prev) => {
            if (!names.some((name) => prev[name])) return prev;
            const next = { ...prev };
            names.forEach((name) => delete next[name]);
            return next;
        });
    }, []);

    /* ------------------------- dialog behaviour ------------------------- */

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        dialogRef.current?.focus();
        return () => { document.body.style.overflow = previousOverflow; };
    }, []);

    useEffect(() => {
        const onKey = (event) => {
            // react-select calls preventDefault when Escape only closes its own menu.
            if (event.key === "Escape" && !event.defaultPrevented && !loading) onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [loading, onClose]);

    /* ----------------------- recruitment list (create) ------------------ */

    const getAllRecruitmentData = () => {
        setStaffLoading(true);
        getAllRecruitment_.mutate(null, {
            onSuccess: (response) => {
                const fetchedData = Array.isArray(response)
                    ? response
                    : Array.isArray(response?.data)
                        ? response.data
                        : Array.isArray(response?.data?.data)
                            ? response.data.data
                            : null;

                if (!fetchedData) {
                    setStaffOptions([]);
                    ErrorNotify("The recruitment API returned an invalid response.");
                    return;
                }

                setStaffOptions(fetchedData
                    .filter((recruitment) =>
                        recruitment?.isActive === false &&
                        typeof recruitment?.employment?.jobPosition === "string" &&
                        /^CRO$/i.test(recruitment.employment.jobPosition))
                    .map((recruitment) => {
                        const personal = recruitment.personal || {};
                        const contact = recruitment.contact || {};
                        const employment = recruitment.employment || {};
                        const fullName = [personal.firstName, personal.middleName, personal.lastName].filter(Boolean).join(" ");
                        const provinceName = getProvinceOption(employment.province);

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
                                provinceName,
                                district: getDistrictOption(employment.district, provinceName),
                                localLevelName: employment.localLevelName || employment.localLevel || ""
                            }
                        };
                    }));
            },
            onError: (error) => {
                console.error("Fetch Error:", error);
                ErrorNotify(error?.response?.data?.message || "Failed to load recruitment data.");
            },
            onSettled: () => setStaffLoading(false)
        });
    };

    useEffect(() => {
        if (!isEditMode) getAllRecruitmentData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditMode]);

    /* --------------------------- load record (edit) --------------------- */

    useEffect(() => {
        if (!isEditMode) return undefined;
        let isCurrent = true;

        const populateForm = (record) => {
            const provinceName = getProvinceOption(record.provinceName)
                || getProvinceOption(record.provinceIndex ?? record.province ?? record.Prvince);
            const district = record.district || record.districtName || record.districts || "";
            const districtOption = getDistrictOption(district, provinceName);
            const localLevelOption = getLocalLevelOption(record.localLevelName || record.localLevel, provinceName, districtOption);

            if (district && !getDistrictNames(provinceName?.value).includes(districtOption?.value)) {
                setDataWarning(`The saved district "${district}" does not belong to the saved province. Location fields are locked, so it will be kept as is.`);
            } else if (localLevelOption && !getLocalLevelNames(provinceName?.value, districtOption?.value).includes(localLevelOption.value)) {
                setDataWarning(`The saved local level "${localLevelOption.value}" does not belong to the saved district. Location fields are locked, so it will be kept as is.`);
            }

            const fullName = record.fullName || record.UserfullName || record.fullname || record.username || "";
            setFormData({
                provinceName,
                provinceIndex: provinceName
                    ? provinceNumbers[provinceName.value]
                    : Number(record.provinceIndex ?? record.province ?? record.Prvince) || null,
                localLevelName: localLevelOption,
                wardNo: record.wardNo || "",
                toleName: record.toleName || "",
                district: districtOption,
                fullName: { value: fullName, label: fullName },
                designation: record.designation || "",
                jobRole: record.jobRole || "",
                personalMobile: record.personalMobile || "",
                personalEmail: record.personalEmail || "",
                username: record.username || "",
                officeEmail: record.officeEmail || "",
                officeMobile: record.officeMobile || "",
                password: "",
                confirmPassword: "",
                status: record.isActive === false ? "inactive" : "active",
                role: getRoleOption(record.role),
                lat: record.lat ?? record.latitude ?? "",
                lng: record.lng ?? record.longitude ?? ""
            });
        };

        setFormData(createEmptyFormData());
        setEditLoadError("");
        setDataWarning("");
        setErrors({});

        if (!initialData?._id) {
            setEditLoadError("This record has no ID, so it cannot be edited.");
            setEditLoading(false);
            return undefined;
        }

        if (initialData.isBranch) {
            populateForm(initialData);
            setEditLoading(false);
            return () => { isCurrent = false; };
        }

        setEditLoading(true);
        getAdminUserById(initialData._id)
            .then((response) => {
                const record = response?.data;
                if (!record || String(record._id) !== String(initialData._id)) {
                    throw new Error("The requested user record could not be verified.");
                }
                if (isCurrent) {
                    populateForm(record);
                    setEditLoading(false);
                }
            })
            .catch((fetchError) => {
                if (isCurrent) {
                    setEditLoadError(fetchError?.response?.data?.message || fetchError.message || "Unable to load this user.");
                    setEditLoading(false);
                }
            });

        return () => { isCurrent = false; };
    }, [initialData, isEditMode]);

    /* ------------------------------ location ---------------------------- */

    const fetchLocation = async () => {
        if (locationRequestInFlight.current) return;
        if (!navigator.geolocation) {
            ErrorNotify("Location services are unavailable in this browser.");
            return;
        }

        locationRequestInFlight.current = true;
        setLocationLoading(true);
        const finish = () => {
            locationRequestInFlight.current = false;
            setLocationLoading(false);
        };
        const denied = "Location access denied. Allow location permission in your browser settings.";
        const failed = "Unable to determine your current location. Please try again.";

        try {
            if (navigator.permissions?.query) {
                try {
                    const permission = await navigator.permissions.query({ name: "geolocation" });
                    if (permission.state === "denied") {
                        ErrorNotify(denied);
                        finish();
                        return;
                    }
                } catch {
                    // Permissions API unavailable: fall back to getCurrentPosition.
                }
            }

            navigator.geolocation.getCurrentPosition(
                ({ coords: { latitude, longitude } }) => {
                    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) ||
                        latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
                        ErrorNotify(failed);
                        finish();
                        return;
                    }
                    setFormData((prev) => ({ ...prev, lat: latitude.toFixed(6), lng: longitude.toFixed(6) }));
                    SuccessNotify("Location updated.");
                    finish();
                },
                (error) => {
                    ErrorNotify(error.code === 1 ? denied : error.code === 3 ? "Location request timed out. Please try again." : failed);
                    finish();
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } catch {
            ErrorNotify(failed);
            finish();
        }
    };

    /* ------------------------ dependent geo options --------------------- */

    const currentDistrictOptions = useMemo(() => {
        if (!formData.provinceName) return [];
        return getDistrictNames(formData.provinceName.value).map((district) => ({ value: district, label: district }));
    }, [formData.provinceName?.value]);

    const currentLocalLevelOptions = useMemo(() => {
        if (!formData.provinceName || !formData.district) return [];
        return getLocalLevelNames(formData.provinceName.value, formData.district.value)
            .map((localLevel) => ({ value: localLevel, label: localLevel }));
    }, [formData.provinceName?.value, formData.district?.value]);

    /* ------------------------------ handlers ---------------------------- */

    const handleFullNameSelect = (selectedOption) => {
        clearErrors("fullName", "designation", "jobRole", "personalMobile", "personalEmail", "provinceName",
            "district", "localLevelName", "officeEmail", "officeMobile", "username");

        if (!selectedOption) {
            setFormData((prev) => ({
                ...prev,
                fullName: null, designation: "", jobRole: "", personalEmail: "", personalMobile: "",
                officeEmail: "", officeMobile: "", provinceName: null, provinceIndex: null,
                district: null, localLevelName: null, username: generateUsername(null)
            }));
            return;
        }

        const details = selectedOption.details || {};
        const provinceOption = details.provinceName || null;
        const districtOption = getDistrictOption(details.district, provinceOption);

        setFormData((prev) => ({
            ...prev,
            fullName: selectedOption,
            designation: details.designation || "",
            jobRole: details.jobRole || "",
            personalMobile: details.personalMobile || "",
            personalEmail: details.personalEmail || "",
            officeEmail: details.officeEmail || "",
            officeMobile: details.officeMobile || "",
            provinceName: provinceOption,
            provinceIndex: provinceOption ? provinceNumbers[provinceOption.value] : null,
            district: districtOption,
            localLevelName: getLocalLevelOption(details.localLevelName, provinceOption, districtOption),
            username: generateUsername(selectedOption)
        }));
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        clearErrors(name, ...(name === "password" ? ["confirmPassword"] : []));
    };

    const handleSelectChange = (selectedOption, fieldName) => {
        if (fieldName === "provinceName") {
            setFormData((prev) => ({
                ...prev,
                provinceName: selectedOption,
                provinceIndex: selectedOption ? provinceNumbers[selectedOption.value] : null,
                district: null,
                localLevelName: null,
                wardNo: "",
                toleName: ""
            }));
        } else if (fieldName === "district") {
            setFormData((prev) => ({ ...prev, district: selectedOption, localLevelName: null }));
        } else {
            setFormData((prev) => ({ ...prev, [fieldName]: selectedOption }));
        }
        clearErrors(fieldName);
    };

    const handleAutoGenerate = () => {
        if (isGenerating) return;
        setIsGenerating(true);
        try {
            const password = generatePassword();
            setFormData((prev) => ({
                ...prev,
                username: generateUsername(prev.fullName),
                password,
                confirmPassword: password
            }));
            clearErrors("username", "password", "confirmPassword");
        } catch (error) {
            ErrorNotify(error.message || "Unable to generate a secure password.");
        } finally {
            setIsGenerating(false);
        }
    };

    /* ------------------------------ validation -------------------------- */

    // Returns { fieldName: message } in the order the fields appear on screen.
    // Fields that are locked in the current mode cannot be fixed by the user,
    // so they are only checked where the data is still being collected.
    const validate = () => {
        const found = {};
        const fail = (key, message) => { if (!found[key]) found[key] = message; };
        const lockedMessage = (message) => (isEditMode ? message : MISSING_IN_RECORD);

        if (!isEditMode) {
            if (!formData.fullName) fail("fullName", "Select the person to register.");
            if (!clean(formData.designation)) fail("designation", lockedMessage("Department is required."));
            if (!clean(formData.jobRole)) fail("jobRole", lockedMessage("Job role is required."));
            if (!isValidPhone(formData.personalMobile)) fail("personalMobile", clean(formData.personalMobile) ? "Enter a valid mobile number (10–15 digits)." : MISSING_IN_RECORD);
            if (!isValidEmail(formData.personalEmail)) fail("personalEmail", clean(formData.personalEmail) ? "Enter a valid email address." : MISSING_IN_RECORD);
            if (!formData.provinceName || !formData.provinceIndex) fail("provinceName", MISSING_IN_RECORD);
            if (!formData.district || !currentDistrictOptions.some((option) => option.value === formData.district.value)) {
                fail("district", formData.district ? "This district does not belong to the selected province." : MISSING_IN_RECORD);
            }
            if (!formData.localLevelName?.value || !currentLocalLevelOptions.some((option) => option.value === formData.localLevelName.value)) {
                fail("localLevelName", "Select a local level from the selected district.");
            }
            if (!clean(formData.wardNo)) fail("wardNo", "Ward number is required.");
            if (!clean(formData.toleName)) fail("toleName", "Tole name is required.");
        }

        if (!isValidEmail(formData.officeEmail)) fail("officeEmail", "Enter a valid office email address.");
        if (!isValidPhone(formData.officeMobile)) fail("officeMobile", "Enter a valid office mobile number (10–15 digits).");

        if (!clean(formData.username)) fail("username", "Username is required.");

        // When editing, a blank password means "keep the current one".
        const changingPassword = !isEditMode || Boolean(formData.password) || Boolean(formData.confirmPassword);
        if (changingPassword) {
            if (!formData.password) fail("password", "Password is required.");
            else if (formData.password.length < MIN_PASSWORD_LENGTH) fail("password", `Use at least ${MIN_PASSWORD_LENGTH} characters.`);
            if (!formData.confirmPassword) fail("confirmPassword", "Confirm the password.");
            else if (formData.password !== formData.confirmPassword) fail("confirmPassword", "Passwords do not match.");
        }

        if (!formData.role) fail("role", "Role is required.");
        return found;
    };

    const focusField = (key) => {
        requestAnimationFrame(() => {
            const element = document.getElementById(`field-${key}`);
            if (!element) return;
            element.scrollIntoView({ block: "center", behavior: "smooth" });
            if (!element.disabled) element.focus({ preventScroll: true });
        });
    };

    /* ------------------------------- submit ----------------------------- */

    const handleSubmit = (event) => {
        event?.preventDefault();
        if (submissionInFlight.current) return;
        if (editLoading) return ErrorNotify("Please wait for the account details to finish loading.");
        if (editLoadError) return ErrorNotify("The account details could not be loaded. Close and reopen the edit form.");

        const found = validate();
        setErrors(found);
        const keys = Object.keys(found);
        if (keys.length > 0) {
            ErrorNotify(keys.length === 1 ? found[keys[0]] : `Please fix the ${keys.length} highlighted fields.`);
            focusField(keys[0]);
            return;
        }

        const changingPassword = !isEditMode || Boolean(formData.password);
        const payload = {
            fullName: formData.fullName?.label ?? "",
            designation: clean(formData.designation),
            jobRole: clean(formData.jobRole),
            personalMobile: clean(formData.personalMobile),
            personalEmail: clean(formData.personalEmail),
            username: clean(formData.username),
            officeEmail: clean(formData.officeEmail),
            officeMobile: clean(formData.officeMobile),
            provinceIndex: Number(formData.provinceIndex) || null,
            provinceName: formData.provinceName?.value ?? initialData?.provinceName ?? "",
            district: formData.district?.value ?? "",
            localLevelName: formData.localLevelName?.value ?? "",
            wardNo: clean(formData.wardNo),
            toleName: clean(formData.toleName),
            isActive: formData.status === "active",
            role: formData.role.value,
            ...(!isEditMode && { recruitment: formData.fullName.value }),
            lat: toCoordinate(formData.lat),
            lng: toCoordinate(formData.lng),
            // Editing with a blank password must not overwrite the existing one.
            ...(changingPassword && { password: formData.password, confirmPassword: formData.confirmPassword })
        };

        submissionInFlight.current = true;
        setLoading(true);
        waitingNotify(isEditMode ? "Saving changes..." : "Creating account...");

        try {
            const mutation = isEditMode ? (isBranchRecord ? EditBranch_ : EditAdmin_) : Createadmin_;
            mutation.mutate(
                isEditMode
                    ? { params: { id: initialData._id }, payload, targetRole: initialData.role }
                    : { payload },
                {
                    onSuccess: (res) => {
                        SuccessNotify(res?.data?.message || res?.message || (isEditMode ? "Changes saved." : "Account created."));
                        if (onSuccess) onSuccess(true);
                        onClose();
                    },
                    onError: (err) => {
                        console.error("API Error:", err?.response);
                        ErrorNotify(err?.response?.data?.message || err?.message || "Failed to process the request.");
                    },
                    onSettled: () => {
                        submissionInFlight.current = false;
                        setLoading(false);
                    }
                }
            );
        } catch (err) {
            console.error("Submission error:", err);
            ErrorNotify(err?.response?.data?.message || "Something went wrong during submission.");
            submissionInFlight.current = false;
            setLoading(false);
        }
    };

    /* -------------------------------- render ---------------------------- */

    const baseRoleOptions = !isEditMode
        ? [roleOptions[0]]
        : isBranchRecord
            ? roleOptions
            : roleOptions.filter((option) => option.value !== "branch");
    // Keep an unrecognised saved role visible instead of silently replacing it.
    const roleSelectOptions = formData.role && !baseRoleOptions.some((option) => option.value === formData.role.value)
        ? [...baseRoleOptions, formData.role]
        : baseRoleOptions;

    const lockedPlaceholder = isEditMode ? "Not set" : "Select name first...";
    const isActive = formData.status === "active";

    return (
        <div className="fixed inset-0 z-50 flex w-full items-center justify-center p-3"
        >
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="register-modal-title"
                tabIndex={-1}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.2 }}
                className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-2xl border border-[#E2E8F0] bg-white shadow-2xl outline-none"
            >
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#E2E8F0] p-5">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl border border-[#E87A24]/20 bg-[#E87A24]/10 p-2.5 text-[#E87A24]">
                            {isEditMode ? <Pencil className="h-6 w-6" aria-hidden="true" /> : <MapPin className="h-6 w-6" aria-hidden="true" />}
                        </div>
                        <div>
                            <h2 id="register-modal-title" className="text-xl text-[#422026]" style={fontBold}>
                                {isEditMode
                                    ? `Edit ${isBranchRecord ? "branch" : "account"}`
                                    : "Create admin account"}
                            </h2>
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-[#64748B]" style={fontLight}>
                                <KeyRound className="h-3 w-3" aria-hidden="true" />
                                {isEditMode
                                    ? "Update contact details, credentials and status"
                                    : "Credentials are generated automatically"}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        aria-label="Close dialog"
                        className={`cursor-pointer rounded-xl border border-transparent p-2 text-[#64748B] transition hover:border-[#E2E8F0] hover:bg-[#F8FAFC] hover:text-[#422026] disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form body */}
                <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="custom-scrollbar flex-1 space-y-8 overflow-y-auto p-6">
                    {editLoading && (
                        <p role="status" className="flex items-center gap-2 rounded-lg border border-[#4A76C0]/20 bg-[#4A76C0]/10 px-4 py-3 text-sm text-[#422026]">
                            <Loader2 size={16} className="animate-spin text-[#4A76C0]" aria-hidden="true" /> Loading the selected account...
                        </p>
                    )}
                    {editLoadError && (
                        <p role="alert" className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            <AlertCircle size={16} aria-hidden="true" /> {editLoadError}
                        </p>
                    )}
                    {dataWarning && (
                        <p role="status" className="flex items-start gap-2 rounded-xl border border-amber-200 bg-[#FFFBEB] px-4 py-3 text-sm text-[#92400E]">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" /> {dataWarning}
                        </p>
                    )}

                    {/* Target selection & personal details */}
                    <Section icon={User} chip={tone.amber} title="Person and position"
                        note={isEditMode ? undefined : "Choose an inactive CRO recruitment record. Position and location fill in automatically."}>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                            <FormField id="field-fullName" label="Full name" required error={errors.fullName} className="lg:col-span-3">
                                {isEditMode ? (
                                    <IconInput id="field-fullName" icon={User} chip={tone.amber} type="text" disabled
                                        value={formData.fullName?.label || ""} readOnly placeholder="Full name" />
                                ) : (
                                    <ModalSelect
                                        id="field-fullName"
                                        error={errors.fullName}
                                        options={staffOptions}
                                        value={formData.fullName}
                                        onChange={handleFullNameSelect}
                                        placeholder={staffLoading ? "Loading available staff..." : "Search and select a person"}
                                        noOptionsMessage={() => (staffLoading ? "Loading available staff..." : "No inactive CRO records found.")}
                                        isLoading={staffLoading}
                                        isDisabled={staffLoading}
                                        isClearable
                                    />
                                )}
                            </FormField>

                            <FormField id="field-designation" label="Department" required={!isEditMode} error={errors.designation}>
                                <IconInput id="field-designation" icon={Briefcase} chip={tone.amber} type="text" name="designation"
                                    value={formData.designation} onChange={handleInputChange}
                                    disabled={isFieldDisabled("designation")} error={errors.designation} placeholder={lockedPlaceholder} />
                            </FormField>
                            <FormField id="field-jobRole" label="Job role" required={!isEditMode} error={errors.jobRole}>
                                <IconInput id="field-jobRole" icon={Briefcase} chip={tone.amber} type="text" name="jobRole"
                                    value={formData.jobRole} onChange={handleInputChange}
                                    disabled={isFieldDisabled("jobRole")} error={errors.jobRole} placeholder={lockedPlaceholder} />
                            </FormField>
                            <FormField id="field-personalMobile" label="Personal mobile" required={!isEditMode} error={errors.personalMobile}>
                                <IconInput id="field-personalMobile" icon={Phone} chip={tone.amber} type="tel" name="personalMobile"
                                    value={formData.personalMobile} onChange={handleInputChange}
                                    disabled={isFieldDisabled("personalMobile")} error={errors.personalMobile} placeholder={lockedPlaceholder} />
                            </FormField>
                            <FormField id="field-personalEmail" label="Personal email" required={!isEditMode} error={errors.personalEmail}>
                                <IconInput id="field-personalEmail" icon={Mail} chip={tone.amber} type="email" name="personalEmail"
                                    value={formData.personalEmail} onChange={handleInputChange}
                                    disabled={isFieldDisabled("personalEmail")} error={errors.personalEmail} placeholder={lockedPlaceholder} />
                            </FormField>
                        </div>
                    </Section>

                    {/* Regional allocation */}
                    <Section icon={MapIcon} chip={tone.blue} title="Regional allocation"
                        note={isEditMode ? undefined : "Province and district come from the recruitment record. Choose the local level, ward and tole."}>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                            <FormField id="field-provinceIndex" label="Province no." required={!isEditMode}>
                                <IconInput id="field-provinceIndex" icon={MapPin} chip={tone.blue} type="text" disabled readOnly
                                    value={formData.provinceIndex || ""} placeholder="Auto-mapped" />
                            </FormField>
                            <FormField id="field-provinceName" label="Province" required={!isEditMode} error={errors.provinceName}>
                                <ModalSelect id="field-provinceName" error={errors.provinceName} options={provinceOptions}
                                    value={formData.provinceName} onChange={(option) => handleSelectChange(option, "provinceName")}
                                    placeholder="Select province" isDisabled={isFieldDisabled("provinceName")} />
                            </FormField>
                            <FormField id="field-district" label="District" required={!isEditMode} error={errors.district}>
                                <ModalSelect id="field-district" error={errors.district} options={currentDistrictOptions}
                                    value={formData.district} onChange={(option) => handleSelectChange(option, "district")}
                                    placeholder={formData.provinceName ? "Select district" : "Select province first"}
                                    isDisabled={isFieldDisabled("district") || !formData.provinceName} />
                            </FormField>
                            <FormField id="field-localLevelName" label="Local level" required={!isEditMode} error={errors.localLevelName}>
                                <ModalSelect id="field-localLevelName" error={errors.localLevelName} options={currentLocalLevelOptions}
                                    value={formData.localLevelName} onChange={(option) => handleSelectChange(option, "localLevelName")}
                                    placeholder={formData.district ? "Select local level" : "Select district first"}
                                    isDisabled={isFieldDisabled("localLevelName") || !formData.district} />
                            </FormField>
                            <FormField id="field-wardNo" label="Ward no." required={!isEditMode} error={errors.wardNo}>
                                <IconInput id="field-wardNo" icon={MapPin} chip={tone.blue} type="text" name="wardNo"
                                    value={formData.wardNo} onChange={handleInputChange}
                                    error={errors.wardNo} placeholder="Enter ward no." />
                            </FormField>
                            <FormField id="field-toleName" label="Tole name" required={!isEditMode} error={errors.toleName}>
                                <IconInput id="field-toleName" icon={MapPin} chip={tone.blue} type="text" name="toleName"
                                    value={formData.toleName} onChange={handleInputChange}
                                    error={errors.toleName} placeholder="Enter tole name" />
                            </FormField>
                        </div>
                    </Section>

                    {/* Office contact (editable in both modes) */}
                    <Section
                        icon={Briefcase}
                        chip={tone.blue}
                        title="Office contact"
                        className="rounded-xl border border-[#4A76C0]/30 bg-[#4A76C0]/5 p-5 shadow-xs"
                        note="Editable. Used for login notices and sending credentials."
                    >
                        <div className="grid grid-cols-1 gap-5 pt-1 md:grid-cols-2">
                            <FormField id="field-officeEmail" label="Office email" required error={errors.officeEmail}>
                                <IconInput
                                    id="field-officeEmail"
                                    icon={Mail}
                                    chip={tone.blue}
                                    type="email"
                                    name="officeEmail"
                                    value={formData.officeEmail}
                                    onChange={handleInputChange}
                                    autoComplete="email"
                                    disabled={isFieldDisabled("officeEmail")}
                                    error={errors.officeEmail}
                                    placeholder="office@company.com"
                                />
                            </FormField>
                            <FormField id="field-officeMobile" label="Office mobile" required error={errors.officeMobile}>
                                <IconInput
                                    id="field-officeMobile"
                                    icon={Phone}
                                    chip={tone.blue}
                                    type="tel"
                                    name="officeMobile"
                                    value={formData.officeMobile}
                                    onChange={handleInputChange}
                                    autoComplete="tel"
                                    disabled={isFieldDisabled("officeMobile")}
                                    error={errors.officeMobile}
                                    placeholder="+977 98XXXXXXXX"
                                />
                            </FormField>
                        </div>
                    </Section>

                    {/* Credentials */}
                    <Section icon={Lock} chip={tone.orange} title="Sign-in credentials"
                        note={isEditMode ? "Leave both password fields blank to keep the current password." : undefined}
                        action={(
                            <button
                                type="button"
                                onClick={handleAutoGenerate}
                                disabled={formBlocked || isGenerating}
                                title={isEditMode ? "Replace the username and password with new generated ones" : "Generate a new username and password"}
                                className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-[#E87A24]/30 bg-[#E87A24]/10 px-3 py-1.5 text-xs text-[#E87A24] transition hover:bg-[#E87A24]/20 disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
                                style={fontBold}
                            >
                                {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                                {isGenerating ? "Generating..." : isEditMode ? "Generate new" : "Auto Generate"}
                            </button>
                        )}>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                            <FormField id="field-username" label="Username" required error={errors.username}>
                                <IconInput id="field-username" icon={User} chip={tone.orange} type="text" name="username"
                                    value={formData.username} onChange={handleInputChange} autoComplete="username"
                                    disabled={isFieldDisabled("username")} error={errors.username} placeholder="Enter username" />
                            </FormField>
                            <FormField id="field-password" label="Password" required={!isEditMode} error={errors.password}
                                hint={!errors.password && !isEditMode ? `At least ${MIN_PASSWORD_LENGTH} characters.` : undefined}>
                                <PasswordInput id="field-password" name="password" defaultVisible={!isEditMode}
                                    value={formData.password} onChange={handleInputChange}
                                    disabled={isFieldDisabled("password")} error={errors.password}
                                    placeholder={isEditMode ? "Leave blank to keep current" : "Enter password"} />
                            </FormField>
                            <FormField id="field-confirmPassword" label="Confirm password" required={!isEditMode} error={errors.confirmPassword}>
                                <PasswordInput id="field-confirmPassword" name="confirmPassword"
                                    value={formData.confirmPassword} onChange={handleInputChange}
                                    disabled={isFieldDisabled("confirmPassword")} error={errors.confirmPassword}
                                    placeholder={isEditMode ? "Leave blank to keep current" : "Repeat password"} />
                            </FormField>
                        </div>
                    </Section>

                    {/* System properties & geolocation */}
                    <Section icon={Shield} chip={tone.blue} title="Role, status and location">
                        <div className={`grid grid-cols-1 gap-5 md:grid-cols-2 ${isEditMode ? "lg:grid-cols-2" : "lg:grid-cols-4"}`}>
                            <FormField id="field-role" label="Role" required error={errors.role}>
                                <ModalSelect id="field-role" error={errors.role} options={roleSelectOptions}
                                    value={formData.role} onChange={(option) => handleSelectChange(option, "role")}
                                    isSearchable={false} isDisabled={isFieldDisabled("role")} />
                            </FormField>

                            <div className="space-y-1.5">
                                <span className="block text-xs text-[#64748B]" style={fontBold}>Account status</span>
                                <div className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 transition-colors ${isActive ? "border-green-200 bg-green-50" : "border-[#E2E8F0] bg-[#F8FAFC]"}`}>
                                    <div className="flex items-center gap-3">
                                        <span className={`h-2.5 w-2.5 rounded-full ${isActive ? "bg-[#16A34A]" : "bg-[#64748B]"}`} />
                                        <div>
                                            <p className={`text-sm font-bold ${isActive ? "text-[#16A34A]" : "text-[#422026]"}`} style={fontBold}>
                                                {isActive ? "Active" : "Inactive"}
                                            </p>
                                            <p className="text-xs text-[#64748B]" style={fontLight}>
                                                {isEditMode ? "Can sign in" : "New accounts start active"}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-label="Account status"
                                        aria-checked={isActive}
                                        disabled={!isEditMode || loading || formBlocked}
                                        onClick={() => setFormData((prev) => ({ ...prev, status: prev.status === "active" ? "inactive" : "active" }))}
                                        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${focusRing} ${isActive ? "bg-[#16A34A]" : "bg-[#64748B]"}`}
                                    >
                                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${isActive ? "translate-x-6" : "translate-x-1"}`} />
                                    </button>
                                </div>
                            </div>



                            {!isEditMode && (
                                <>
                                    <FormField id="field-lat" label="Latitude">
                                        <IconInput id="field-lat" icon={Navigation} chip={tone.blue} type="text" value={formData.lat} disabled readOnly placeholder="Not set" />
                                    </FormField>
                                    <FormField id="field-lng" label="Longitude">
                                        <IconInput id="field-lng" icon={Navigation} chip={tone.blue} type="text" value={formData.lng} disabled readOnly placeholder="Not set" />
                                    </FormField>
                                </>
                            )}

                        </div>






                        {!isEditMode && (
                            <div className="flex flex-col items-start gap-2">
                                <button
                                    type="button"
                                    onClick={fetchLocation}
                                    disabled={locationLoading || locationUnavailable || formBlocked}
                                    className={`inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#4A76C0] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3F65A6] disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
                                    style={fontBold}
                                >
                                    {locationLoading ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
                                    {locationLoading ? "Getting location..." : "Use current location"}
                                </button>
                                {locationUnavailable && (
                                    <p className="text-xs text-[#92400E]" role="status">Location access is unavailable in this browser.</p>
                                )}
                            </div>
                        )}

                    </Section>
                </form>

                {/* Footer */}
                <div className="flex shrink-0 flex-col-reverse gap-3 rounded-b-2xl border-t border-[#E2E8F0] bg-[#F8FAFC] p-5 sm:flex-row sm:justify-end">
                    <button type="button" className={btnSecondary} onClick={onClose} disabled={loading} style={fontBold}>
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form={FORM_ID}
                        disabled={loading || isGenerating || formBlocked}
                        className={`${btnPrimary} sm:min-w-48`}
                        style={fontBold}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {isEditMode ? "Saving changes..." : "Creating account..."}
                            </>
                        ) : (
                            <>
                                {isEditMode ? "Save changes" : "Create account"}
                                <ChevronRight className="h-4 w-4" />
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};