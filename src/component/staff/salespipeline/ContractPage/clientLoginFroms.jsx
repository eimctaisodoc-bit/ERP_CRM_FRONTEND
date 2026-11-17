import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
    X, User, Mail, Lock, KeyRound, Loader2, RefreshCw, ShieldCheck,
    Building2, Phone, Info, AlertCircle
} from "lucide-react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import CreatableSelect from "react-select/creatable";
import { createFilter } from "react-select";
import {
    waitingNotify,
    dismissWaitingNotify,
    ErrorNotify,
    SuccessNotify
} from "../../../hotToaster";
import { UseAdd } from "../../../hooks/useadd";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */
const FONT_FAMILY = "'Roboto Slab', serif";
const ROLE = "client";
const TOAST_MESSAGE = "Creating client credentials...";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9._-]{4,30}$/;

// Every organization field that is forwarded to the backend.
const ORG_PAYLOAD_FIELDS = [
    "organizationName",
    "organizationType",
    "registrationNumber",
    "vatPan",
    "orgEmail",
    "orgTelephone",
    "contactPersonName",
    "contactPersonEmail",
    "contactPersonNumber",
    "province",
    "provinceNumber",
    "totalEducator",
    "totalEmp_learners",
    "GradeFrom",
    "GradeTo"
];

const pickOrgFields = (org) =>
    ORG_PAYLOAD_FIELDS.reduce((acc, key) => {
        acc[key] = org?.[key] ?? null;
        return acc;
    }, {});

/* ------------------------------------------------------------------ */
/* Generators (crypto-based, not Math.random)                          */
/* ------------------------------------------------------------------ */
const randomInt = (max) => {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] % max;
};

const generatePassword = (length = 12) => {
    // Ambiguous characters (0/O, 1/l/I) are left out so the password is easy to read.
    const sets = [
        "abcdefghijkmnopqrstuvwxyz",
        "ABCDEFGHJKLMNPQRSTUVWXYZ",
        "23456789",
        "!@#$%"
    ];
    const all = sets.join("");
    const chars = sets.map((s) => s[randomInt(s.length)]); // one of each type
    while (chars.length < length) chars.push(all[randomInt(all.length)]);
    for (let i = chars.length - 1; i > 0; i--) {
        const j = randomInt(i + 1);
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join("");
};

// Username is built from the organization name (e.g. "Himalayan Treks Pvt" ->
// "himalayan_treks_pv482"). Falls back to the email prefix when no organization
// is linked. A random 3-digit suffix makes every regeneration produce a new value.
const generateUsername = (organizationName, email) => {
    const fromOrg = (organizationName || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
    const fromEmail = (email || "")
        .split("@")[0]
        .replace(/[^a-z0-9]/gi, "")
        .toLowerCase();
    const base = (fromOrg || fromEmail || "client").slice(0, 20).replace(/_+$/g, "");
    return `${base}${100 + randomInt(900)}`;
};

/* ------------------------------------------------------------------ */
/* Small presentational helpers                                        */
/* ------------------------------------------------------------------ */
const inputBase =
    "h-[42px] w-full rounded-lg border bg-white pl-10 text-sm font-semibold text-[#422026] " +
    "placeholder:text-slate-400 outline-none transition-colors duration-200";

const inputState = (hasError) =>
    hasError
        ? "border-red-500 hover:border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
        : "border-slate-200 hover:border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15";

const iconButton =
    "cursor-pointer rounded-md p-1.5 text-slate-500 transition-colors duration-200 " +
    "hover:bg-[#FFEDD5] hover:text-[#EA580C] focus-visible:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-amber-500/40";

const SectionHeading = ({ icon: Icon, title, right }) => (
    <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2.5 text-sm font-bold text-[#422026]">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#FFF7ED] text-[#E87A24]">
                <Icon size={16} />
            </span>
            {title}
        </h3>
        {right}
    </div>
);

const FieldError = ({ message }) =>
    message ? (
        <p role="alert" className="flex items-center gap-1 text-[11px] font-semibold text-red-500">
            <AlertCircle size={12} className="shrink-0" />
            {message}
        </p>
    ) : null;

const Field = ({ id, label, required, error, hint, children }) => (
    <div className="space-y-1.5">
        <label htmlFor={id} className="block text-xs font-semibold text-slate-600">
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
        {children}
        {error ? (
            <FieldError message={error} />
        ) : (
            hint && <p className="text-[11px] font-semibold text-slate-500">{hint}</p>
        )}
    </div>
);

const ReadOnlyField = ({ id, label, icon: Icon, value, className = "" }) => (
    <div className={`space-y-1.5 ${className}`}>
        <label htmlFor={id} className="block text-xs font-semibold text-slate-600">
            {label}
        </label>
        <div className="relative">
            <Icon size={16} className="pointer-events-none absolute left-3 top-1/2 -mt-2 text-slate-500" />
            <input
                id={id}
                type="text"
                readOnly
                value={value ?? ""}
                placeholder="—"
                className={`${inputBase} cursor-default border-slate-200 bg-slate-50 pr-3 text-slate-600 focus:border-slate-200 focus:ring-0`}
            />
        </div>
    </div>
);

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export const ClientCreateCredential = ({
    onClose,
    onSuccess,
    organizations = []
}) => {
    const { ClientCredit_ } = UseAdd();

    const [open, setOpen] = useState(true); // drives the exit animation
    const [email, setEmail] = useState(null); // CreatableSelect option
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState(() => generatePassword());
    const [regenerating, setRegenerating] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const regenTimer = useRef(null);

    /* ---------------- Email options & organization lookup ---------------- */
    const { emailOptions, emailMap } = useMemo(() => {
        const map = new Map();
        const add = (address, org, kind) => {
            const key = address?.trim().toLowerCase();
            if (key && !map.has(key)) map.set(key, { email: address.trim(), org, kind });
        };
        // Organization emails take priority over contact-person emails.
        organizations.forEach((org) => add(org.orgEmail, org, "Organization email"));
        organizations.forEach((org) => add(org.contactPersonEmail, org, "Contact person"));

        return {
            emailMap: map,
            emailOptions: Array.from(map.values()).map(({ email: address, org, kind }) => ({
                value: address,
                label: address,
                orgName: org.organizationName,
                kind
            }))
        };
    }, [organizations]);

    const matchedOrg = useMemo(
        () => (email?.value ? emailMap.get(email.value.toLowerCase())?.org ?? null : null),
        [email, emailMap]
    );

    /* ---------------- Close handling ---------------- */
    const requestClose = useCallback(() => {
        if (!loading) setOpen(false);
    }, [loading]);

    useEffect(() => {
        const onKeyDown = (e) => {
            // react-select calls preventDefault when it uses Escape to close its own menu.
            if (e.key === "Escape" && !e.defaultPrevented) requestClose();
        };
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [requestClose]);

    useEffect(() => () => clearTimeout(regenTimer.current), []);

    /* ---------------- Handlers ---------------- */
    const handleEmailChange = (option) => {
        const next = option?.__isNew__
            ? { value: option.value.trim(), label: option.value.trim() }
            : option;
        setEmail(next);

        // Username follows the organization name linked to the selected email.
        if (next) {
            const org = emailMap.get(next.value.toLowerCase())?.org ?? null;
            setUserName(generateUsername(org?.organizationName, next.value));
        } else {
            setUserName("");
        }
        setErrors((prev) => ({ ...prev, email: undefined, userName: undefined }));
    };

    const handleUserNameChange = (e) => {
        setUserName(e.target.value);
        setErrors((prev) => ({ ...prev, userName: undefined }));
    };

    // One button regenerates both the username and the password.
    const handleRegenerate = () => {
        setRegenerating(true);
        clearTimeout(regenTimer.current);
        regenTimer.current = setTimeout(() => {
            setPassword(generatePassword());
            setUserName(generateUsername(matchedOrg?.organizationName, email?.value));
            setErrors((prev) => ({ ...prev, userName: undefined }));
            setRegenerating(false);
        }, 400);
    };

    const validate = () => {
        const next = {};
        if (!email?.value) next.email = "Select or enter an email address.";
        else if (!EMAIL_RE.test(email.value)) next.email = "Enter a valid email address.";

        const trimmed = userName.trim();
        if (!trimmed) next.userName = "Username is required.";
        else if (!USERNAME_RE.test(trimmed))
            next.userName = "Use 4–30 letters, numbers, dots, dashes or underscores.";

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    /* ---------------- Submit ---------------- */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading || regenerating || !validate()) return;

        setLoading(true);
        waitingNotify(TOAST_MESSAGE);

        try {
            const payload = {
                email: email.value,
                userName: userName.trim(),
                password,
                confirmPassword: password, // generated value, always matches
                role: ROLE,
                ...pickOrgFields(matchedOrg), // null for every field when the email isn't linked
                _id: matchedOrg?._id ?? null // organization primary key
            };

            const response = await ClientCredit_.mutateAsync({ payload });

            if (response?.emailSent === false) {
                ErrorNotify(
                    response.message ||
                    "Client credentials were created, but the email could not be sent."
                );
            } else {
                SuccessNotify(response?.message || "Client credentials created successfully!");
            }

            onSuccess?.();
            setOpen(false);
        } catch (err) {
            console.error("Submission Error:", err);
            ErrorNotify(err.response?.data?.message || err.message || "Something went wrong.");
        } finally {
            dismissWaitingNotify(TOAST_MESSAGE);
            setLoading(false);
        }
    };

    /* ---------------- react-select theme ---------------- */
    const selectStyles = useMemo(() => {
        const hasError = Boolean(errors.email);
        const ring = hasError ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)";
        const focusBorder = hasError ? "#EF4444" : "#F59E0B";
        return {
            control: (base, state) => ({
                ...base,
                fontFamily: FONT_FAMILY,
                fontSize: 14,
                fontWeight: 600,
                minHeight: 42,
                borderRadius: 8,
                backgroundColor: "#FFFFFF",
                borderColor: state.isFocused || hasError ? focusBorder : "#E2E8F0",
                boxShadow: state.isFocused ? `0 0 0 2px ${ring}` : "none",
                transition: "border-color 200ms, box-shadow 200ms",
                "&:hover": {
                    borderColor: state.isFocused || hasError ? focusBorder : "#CBD5E1"
                }
            }),
            valueContainer: (base) => ({ ...base, padding: "2px 12px" }),
            placeholder: (base) => ({ ...base, color: "#94A3B8" }),
            singleValue: (base) => ({ ...base, color: "#422026" }),
            input: (base) => ({ ...base, color: "#422026" }),
            indicatorSeparator: () => ({ display: "none" }),
            dropdownIndicator: (base) => ({
                ...base,
                color: "#64748B",
                cursor: "pointer",
                "&:hover": { color: "#EA580C" }
            }),
            clearIndicator: (base) => ({
                ...base,
                color: "#64748B",
                cursor: "pointer",
                "&:hover": { color: "#EA580C" }
            }),
            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            menu: (base) => ({
                ...base,
                fontFamily: FONT_FAMILY,
                marginTop: 4,
                borderRadius: 10,
                border: "1px solid #E2E8F0",
                boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                overflow: "hidden"
            }),
            menuList: (base) => ({ ...base, padding: 4 }),
            option: (base, state) => ({
                ...base,
                borderRadius: 6,
                padding: "8px 10px",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                backgroundColor: state.isSelected
                    ? "#F59E0B"
                    : state.isFocused
                        ? "#FFF7ED"
                        : "transparent",
                color: state.isSelected ? "#FFFFFF" : "#422026",
                "&:active": { backgroundColor: state.isSelected ? "#F59E0B" : "#FFEDD5" }
            }),
            noOptionsMessage: (base) => ({ ...base, fontSize: 12, fontWeight: 600, color: "#64748B" })
        };
    }, [errors.email]);

    const formatOptionLabel = (option, { context }) => {
        if (context === "value" || option.__isNew__ || !option.orgName) return option.label;
        return (
            <div className="flex flex-col leading-tight">
                <span className="text-sm font-bold">{option.label}</span>
                <span className="mt-0.5 text-[11px] font-semibold opacity-70">
                    {option.orgName} · {option.kind}
                </span>
            </div>
        );
    };

    const orgPanelKey = matchedOrg?._id ?? (email ? "unlinked" : "empty");
    const submitDisabled = loading || regenerating;

    /* ---------------- Render ---------------- */
    return (
        <MotionConfig reducedMotion="user">
            <AnimatePresence onExitComplete={onClose}>
                {open && (
                    <motion.div
                        key="client-credential-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-3 backdrop-blur-sm"
                        onMouseDown={(e) => {
                            if (e.target === e.currentTarget) requestClose();
                        }}
                    >
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="client-credential-title"
                            style={{ fontFamily: FONT_FAMILY }}
                            initial={{ opacity: 0, scale: 0.97, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.97, y: 8 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-xl"
                        >
                            {/* ---------------- Header ---------------- */}
                            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 p-4 sm:p-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF7ED] text-[#E87A24]">
                                        <Building2 size={22} />
                                    </div>
                                    <div>
                                        <h2
                                            id="client-credential-title"
                                            className="text-xl font-extrabold leading-tight text-[#422026]"
                                        >
                                            Create client login
                                        </h2>
                                        <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-slate-500">
                                            <KeyRound size={12} />
                                            Provision secure access for an organization
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={requestClose}
                                    disabled={loading}
                                    aria-label="Close"
                                    className={`${iconButton} p-2 disabled:cursor-not-allowed disabled:opacity-50`}
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* ---------------- Form body ---------------- */}
                            <form
                                id="client-credential-form"
                                onSubmit={handleSubmit}
                                noValidate
                                className="custom-scrollbar flex-1 space-y-6 overflow-y-auto p-4 sm:p-6"
                            >
                                {/* Client email */}
                                <section className="space-y-3">
                                    <SectionHeading icon={Mail} title="Client email" />
                                    <Field
                                        id="client-email"
                                        label="Email address"
                                        required
                                        error={errors.email}
                                        hint="Choose an organization or contact email, or type a new address."
                                    >
                                        <CreatableSelect
                                            inputId="client-email"
                                            isClearable
                                            options={emailOptions}
                                            value={email}
                                            onChange={handleEmailChange}
                                            placeholder="Search by email or organization..."
                                            aria-invalid={Boolean(errors.email)}
                                            formatOptionLabel={formatOptionLabel}
                                            formatCreateLabel={(input) => `Use "${input}" as a new email`}
                                            isValidNewOption={(input) => EMAIL_RE.test(input.trim())}
                                            noOptionsMessage={({ inputValue }) =>
                                                inputValue
                                                    ? "Enter a complete email address to use it"
                                                    : "No organizations available"
                                            }
                                            filterOption={createFilter({
                                                stringify: (o) => `${o.label} ${o.data.orgName ?? ""}`
                                            })}
                                            styles={selectStyles}
                                            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                            menuPosition="fixed"
                                        />
                                    </Field>
                                </section>

                                {/* Organization details (read-only) */}
                                <section className="space-y-3">
                                    <SectionHeading
                                        icon={Building2}
                                        title="Organization details"
                                        right={
                                            <span
                                                className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${matchedOrg
                                                    ? "border-orange-200 bg-[#FFF7ED] text-[#E87A24]"
                                                    : "border-slate-200 bg-slate-50 text-slate-500"
                                                    }`}
                                            >
                                                {matchedOrg ? "Linked" : "Not linked"}
                                            </span>
                                        }
                                    />
                                    <motion.div
                                        key={orgPanelKey}
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2, ease: "easeInOut" }}
                                        className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2"
                                    >
                                        <ReadOnlyField
                                            id="org-name"
                                            label="Organization name"
                                            icon={Building2}
                                            value={matchedOrg?.organizationName}
                                            className="sm:col-span-2"
                                        />
                                        <ReadOnlyField
                                            id="org-email"
                                            label="Organization email"
                                            icon={Mail}
                                            value={matchedOrg?.orgEmail}
                                        />
                                        <ReadOnlyField
                                            id="org-telephone"
                                            label="Organization telephone"
                                            icon={Phone}
                                            value={matchedOrg?.orgTelephone}
                                        />
                                    </motion.div>
                                    {email && !matchedOrg && (
                                        <p className="flex items-start gap-1.5 text-[11px] font-semibold text-slate-500">
                                            <Info size={14} className="mt-px shrink-0" />
                                            This email isn&apos;t linked to an organization. The login will be
                                            created without organization details.
                                        </p>
                                    )}
                                </section>

                                {/* Login credentials */}
                                <section className="space-y-3">
                                    <SectionHeading
                                        icon={ShieldCheck}
                                        title="Login credentials"
                                        right={
                                            <button
                                                type="button"
                                                onClick={handleRegenerate}
                                                disabled={regenerating || loading}
                                                className="flex cursor-pointer items-center gap-1.5 rounded-md border border-orange-100 bg-[#FFF7ED] px-2.5 py-1 text-xs font-bold text-[#E87A24] transition-colors duration-200 hover:bg-[#FFEDD5] hover:text-[#EA580C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                <RefreshCw size={12} className={regenerating ? "animate-spin" : ""} />
                                                Regenerate
                                            </button>
                                        }
                                    />
                                    <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:grid-cols-2">
                                        <Field
                                            id="client-username"
                                            label="Username"
                                            required
                                            error={errors.userName}
                                            hint="Based on the organization name."
                                        >
                                            <div className="group relative">
                                                <User
                                                    size={16}
                                                    className="pointer-events-none absolute left-3 top-1/2 -mt-2 text-slate-500 transition-colors group-focus-within:text-[#E87A24]"
                                                />
                                                <input
                                                    id="client-username"
                                                    type="text"
                                                    name="userName"
                                                    autoComplete="off"
                                                    disabled={regenerating}
                                                    value={userName}
                                                    onChange={handleUserNameChange}
                                                    placeholder="client_username"
                                                    aria-invalid={Boolean(errors.userName)}
                                                    className={`${inputBase} pr-3 ${inputState(Boolean(errors.userName))} ${regenerating ? "opacity-50" : ""}`}
                                                />
                                            </div>
                                        </Field>

                                        <Field
                                            id="client-password"
                                            label="Password"
                                            hint="Generated automatically. Use Regenerate for a new one."
                                        >
                                            <div className="group relative">
                                                <Lock
                                                    size={16}
                                                    className="pointer-events-none absolute left-3 top-1/2 -mt-2 text-slate-500"
                                                />
                                                <input
                                                    id="client-password"
                                                    type="password"
                                                    readOnly
                                                    value={password}
                                                    disabled={regenerating}
                                                    placeholder="••••••••••••"
                                                    autoComplete="new-password"
                                                    className={`${inputBase} cursor-default border-slate-200 pr-3 font-bold tracking-wider focus:border-slate-200 focus:ring-0 ${regenerating ? "opacity-50" : ""}`}
                                                />
                                            </div>
                                        </Field>
                                    </div>
                                </section>
                            </form>

                            {/* ---------------- Footer ---------------- */}
                            <div className="flex shrink-0 flex-col-reverse gap-3 rounded-b-2xl border-t border-slate-200 bg-slate-50/60 p-4 sm:flex-row sm:justify-end sm:p-5">
                                <button
                                    type="button"
                                    onClick={requestClose}
                                    disabled={loading}
                                    className="cursor-pointer rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors duration-200 hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <motion.button
                                    type="submit"
                                    form="client-credential-form"
                                    disabled={submitDisabled}
                                    whileTap={submitDisabled ? undefined : { scale: 0.98 }}
                                    className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:from-amber-600 hover:to-orange-600 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Creating account...
                                        </>
                                    ) : (
                                        "Create client login"
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </MotionConfig>
    );
};