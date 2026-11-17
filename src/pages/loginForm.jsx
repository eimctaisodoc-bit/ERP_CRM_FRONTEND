import React, { useEffect, useState } from 'react';
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../component/hooks/useAuth.js";
import { socket } from "../socket_client/scoket.js";
import { ArrowLeft, Info, RefreshCw, ShieldBan } from "lucide-react";
import InputField from "../component/inputField";
import { ErrorNotify } from "../component/hotToaster.jsx";
import { motion, useReducedMotion } from "framer-motion";

// Professional background config: ledger grid + softly highlighted cells
const GRID_CELL = 56; // px. Grid size; highlighted cells sit on this same grid
// n = columns from centre line (negative = left), row = rows from top
const GRID_CELLS = [
    { n: -9, row: 3, duration: 5, delay: 0.5, pause: 4 },
    { n: 8, row: 2, duration: 6, delay: 2.5, pause: 5 },
    { n: -6, row: 9, duration: 5.5, delay: 4, pause: 4.5 },
    { n: 10, row: 7, duration: 6.5, delay: 1.5, pause: 3.5 },
    { n: -11, row: 6, duration: 5, delay: 6, pause: 5 },
    { n: 6, row: 11, duration: 6, delay: 3.2, pause: 4 },
    { n: -3, row: 0, duration: 5, delay: 7.5, pause: 6 },
    { n: 4, row: 1, duration: 5.5, delay: 5, pause: 5.5 },
];
const GRID_EDGE_FADE = "radial-gradient(ellipse 85% 75% at 50% 45%, #000 30%, transparent 100%)";

// ISO certifications advertised on the comet tails (each comet has its own colour)
// axis: "x" = horizontal grid line, "y" = vertical grid line
// dir:  1 = left→right / top→bottom, -1 = right→left / bottom→top
// line: horizontal = row index from the top, vertical = column index from the centre line
// color = comet head and tail, ink = darker shade used for the readable letters
const COMETS = [
    { id: 1, code: "ISO 9001", text: "Quality Management", axis: "x", dir: 1, line: 2, color: "#f59e0b", ink: "#b45309", length: 100, duration: 16, delay: 0, pause: 2 },
    { id: 2, code: "ISO 21001", text: "Educational Organizations", axis: "x", dir: -1, line: 5, color: "#0ea5e9", ink: "#0369a1", length: 100, duration: 19, delay: 4, pause: 1.5 },
    { id: 3, code: "ISO 14001", text: "Environmental Management", axis: "x", dir: 1, line: 9, color: "#10b981", ink: "#047857", length: 100, duration: 17, delay: 8, pause: 2.5 },
    { id: 4, code: "ISO 45001", text: "Occupational Health & Safety", axis: "y", dir: 1, line: -6, color: "#f43f5e", ink: "#be123c", length: 100, duration: 14, delay: 2, pause: 2 },
    { id: 5, code: "ISO 22000", text: "Food Safety", axis: "x", dir: -1, line: 12, color: "#84cc16", ink: "#4d7c0f", length: 100, duration: 15, delay: 11, pause: 3 },
    { id: 6, code: "ISO 27001", text: "Information Security", axis: "y", dir: -1, line: 6, color: "#8b5cf6", ink: "#6d28d9", length: 100, duration: 14, delay: 6, pause: 2.5 },
];

// Wave that travels through the letters (pure CSS, so ~200 letters stay cheap to animate)
const WAVE_CSS = `
@keyframes isoWaveY { 0%, 100% { transform: translateY(0); } 25% { transform: translateY(-3px); } 75% { transform: translateY(3px); } }
@keyframes isoWaveX { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }
`;

const LoginForm = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [accountDisabled, setAccountDisabled] = useState(false);
    const { login } = useAuth();

    useEffect(() => {
        const message = sessionStorage.getItem("IsAutoLogOut");
        /* console.log("Auto Logout Message:", message); */
        if (!message) return;
        sessionStorage.removeItem("IsAutoLogOut");
        ErrorNotify(message, 8000);
    }, []);

    const [formData, setFormData] = useState({
        username: "",
        password: "",
        role: "admin",
    });

    const roleOptions = [
        { value: "super_admin", label: "Super Admin" },
        { value: "admin", label: "Admin" },
        { value: "staff", label: "Staff" },
        { value: "client", label: "Client" }
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setAccountDisabled(false);
        login.mutate(formData, {
            onSuccess: (user) => {
                const token = user?.user?.token;
                if (token) {
                    sessionStorage.setItem('isToken', 'true');
                    sessionStorage.setItem('Token', token);
                }

                const userData = {
                    id: user.user.id,
                    userName: user.user.username,
                    role: user.user.role,
                    jobRole: user.user.jobRole,
                };
                sessionStorage.setItem("user", JSON.stringify(userData));

                socket.auth = { token };
                if (!socket.connected) socket.connect();

                const routes = {
                    admin: "/admin",
                    super_admin: "/super_admin",
                    client: "/client",
                    staff: "/staff"
                };

                const targetRoute = routes[user.user.role];
                targetRoute ? navigate(targetRoute) : ErrorNotify("Access denied");
            },
            onError: (error) => {
                if (["ADMIN_DISABLED", "STAFF_DISABLED", "CLIENT_DISABLED"].includes(error?.response?.data?.code)) {
                    setAccountDisabled(true);
                    return;
                }

                const message = error?.response?.data?.message || "Login failed";
                ErrorNotify(message);
            }
        });
    };

    // --- Framer Motion Variants for Professional Smoothness ---
    const containerVariants = {
        hidden: { opacity: 0, y: 40, scale: 0.98 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1], // Cinematic ease-out
                staggerChildren: 0.1,
                delayChildren: 0.1,
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    // React-Select Premium Styles
    const customSelectStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: "44px",
            borderColor: state.isFocused ? "#d97706" : "#e2e8f0",
            borderRadius: "0.5rem",
            boxShadow: state.isFocused ? "0 0 0 3px rgba(217, 119, 6, 0.15)" : "none",
            "&:hover": { borderColor: "#d97706" },
            fontSize: "0.875rem",
            backgroundColor: "#ffffff",
            transition: "all 0.2s ease",
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? "#d97706" : state.isFocused ? "#fef3c7" : "white",
            color: state.isSelected ? "white" : "#1e293b",
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "background-color 0.15s ease",
        }),
        menu: (base) => ({
            ...base,
            borderRadius: "0.5rem",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
            border: "1px solid #f1f5f9",
        })
    };

    const labelStyle = "block text-sm font-semibold text-slate-700 mb-1.5";
    const inputClass = "w-full text-sm border-slate-200 bg-white rounded-lg focus:ring-4 focus:ring-amber-500/15 focus:border-amber-600 transition-all py-2.5 shadow-sm";

    if (accountDisabled) {
        return (
            <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 font-sans">

                {/* Background Decoration */}
                <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-red-100/50 blur-3xl" />
                <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-amber-100/40 blur-3xl" />

                <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50 sm:p-10">

                    {/* Status Icon */}
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-100 bg-red-50">
                        <ShieldBan
                            size={30}
                            strokeWidth={1.8}
                            className="text-red-500"
                        />
                    </div>

                    {/* Heading */}
                    <div className="space-y-2">
                        <span className="inline-flex items-center rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-600">
                            Access Restricted
                        </span>

                        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                            Account Disabled
                        </h2>

                        <p className="mx-auto max-w-sm text-sm leading-6 text-slate-500">
                            Your account has been temporarily disabled by the
                            administrator. You currently cannot access the
                            EIMCTA ERP workspace.
                        </p>
                    </div>

                    {/* Information */}
                    <div className="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
                        <div className="flex items-start gap-3">
                            <Info
                                size={18}
                                className="mt-0.5 shrink-0 text-amber-600"
                            />
                            <div>
                                <p className="text-sm font-semibold text-slate-700">
                                    Need assistance?
                                </p>
                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    Please contact your administrator to verify
                                    your account status and request access.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-7 flex flex-col gap-3">

                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-amber-600 active:scale-[0.98]"
                        >
                            <RefreshCw size={17} />
                            Refresh Status
                        </button>

                    </div>

                    {/* Footer */}
                    <div className="mt-8 border-t border-slate-100 pt-5">
                        <p className="text-xs font-medium tracking-wide text-slate-400">
                            EIMCTA ERP & CRM SYSTEM
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">
                            Secure Workspace · Account Access Management
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-slate-50 overflow-hidden font-sans">

            {/* ================= PROFESSIONAL BACKGROUND ================= */}
            <LoginBackground />
            {/* ================= END BACKGROUND ================= */}

            {/* Login Card - Professional / Premium UI */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 w-full max-w-md bg-white/85 backdrop-blur-2xl rounded-[1.25rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8 sm:p-10 border border-white"
            >
                {/* Header Section */}
                <motion.div variants={itemVariants} className="mb-8 text-center">
                    <div className="mx-auto h-14 w-14 bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200/50 rounded-2xl flex items-center justify-center mb-5 shadow-sm text-amber-600">
                        {/* Elegant Professional Lock Icon */}
                        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                        Secure Access
                    </h2>
                    <p className="text-sm text-slate-500 mt-2 font-medium">
                        Enter your credentials to authenticate.
                    </p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Username */}
                    <motion.div variants={itemVariants}>
                        <label className={labelStyle}>Username</label>
                        <InputField
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Enter your username"
                            className={inputClass}
                            required
                        />
                    </motion.div>

                    {/* Password */}
                    <motion.div variants={itemVariants}>
                        <label className={labelStyle}>Password</label>
                        <div className="relative">
                            <InputField
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                className={`${inputClass} pr-10`}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none rounded-r-md"
                            >
                                {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                            </button>
                        </div>
                    </motion.div>

                    {/* Role */}
                    <motion.div variants={itemVariants}>
                        <label className={labelStyle}>Access Level</label>
                        <Select
                            options={roleOptions}
                            value={roleOptions.find(opt => opt.value === formData.role)}
                            styles={customSelectStyles}
                            onChange={(opt) => setFormData(p => ({ ...p, role: opt.value }))}
                            isSearchable={false}
                        />
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div variants={itemVariants} className="pt-4">
                        <motion.button
                            whileHover={{ scale: 1.015 }}
                            whileTap={{ scale: 0.985 }}
                            type="submit"
                            disabled={login.isPending}
                            className="w-full flex justify-center items-center bg-gradient-to-r from-amber-600 to-amber-500 text-white font-semibold py-3 px-4 rounded-xl hover:from-amber-700 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all shadow-lg shadow-amber-600/25 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {login.isPending ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Authenticating...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </motion.button>
                    </motion.div>
                </form>
            </motion.div>
        </div>
    );
};

// One comet travelling along a single grid line. Its tail dissolves into wavy letters
// (an ISO certification), like a banner trailing behind it.
const GridComet = ({ code, text, axis, dir, line, color, ink, length, duration, delay, pause }) => {
    const horizontal = axis === "x";
    const reverse = dir === -1;

    // ISO code in bold, then the scope in medium weight
    const chars = [
        ...Array.from(code).map((ch) => ({ ch, bold: true })),
        ...Array.from(` – ${text}`).map((ch) => ({ ch, bold: false })),
    ];
    const last = chars.length - 1;
    // Letters nearest the comet are strongest and fade out along the tail
    const nearestIsLast = !(horizontal && reverse);

    // Track sits exactly on the grid line (line is 1px wide, track is 2px)
    const trackStyle = horizontal
        ? { top: line * GRID_CELL - 0.5, left: 0, right: 0, height: 2 }
        : { left: `calc(50% - ${GRID_CELL / 2 + 0.5}px + ${line * GRID_CELL}px)`, top: 0, bottom: 0, width: 2 };

    // Same duration + linear easing on both movers: the outer one covers the track,
    // the inner one covers the comet's own length, so it enters and leaves fully off-screen
    const slide = reverse ? ["0%", "-100%"] : ["0%", "100%"];
    const motionProps = horizontal ? { x: slide } : { y: slide };
    const transition = { duration, delay, repeat: Infinity, repeatDelay: pause, ease: "linear" };

    const cometStyle = horizontal
        ? {
            top: 0,
            height: "100%",
            ...(reverse ? { left: "100%" } : { right: "100%" }),
            display: "flex",
            flexDirection: reverse ? "row-reverse" : "row",
            alignItems: "center",
        }
        : {
            left: 0,
            width: "100%",
            ...(reverse ? { top: "100%" } : { bottom: "100%" }),
            display: "flex",
            flexDirection: reverse ? "column-reverse" : "column",
            alignItems: "center",
        };

    const labelStyle = {
        whiteSpace: "nowrap",
        fontSize: 12,
        lineHeight: 1,
        letterSpacing: "0.12em",
        color: ink,
        textShadow: "0 0 6px rgba(255, 255, 255, 0.95)",
        position: "relative",
        flexShrink: 0,
        ...(horizontal
            ? { top: -10 }
            : { writingMode: "vertical-rl", left: 10, transform: reverse ? "rotate(180deg)" : undefined }),
    };

    const tailStyle = horizontal
        ? { width: length, height: 2, flexShrink: 0, background: `linear-gradient(${reverse ? "to left" : "to right"}, transparent, ${color})` }
        : { width: 2, height: length, flexShrink: 0, background: `linear-gradient(${reverse ? "to top" : "to bottom"}, transparent, ${color})` };

    const headStyle = {
        width: 6,
        height: 6,
        flexShrink: 0,
        borderRadius: "9999px",
        background: color,
        boxShadow: `0 0 10px 3px ${color}`,
        ...(horizontal
            ? (reverse ? { marginRight: -3 } : { marginLeft: -3 })
            : (reverse ? { marginBottom: -3 } : { marginTop: -3 })),
    };

    return (
        <div className="absolute" style={trackStyle}>
            <motion.div
                className="absolute top-0 left-0"
                style={{ width: "100%", height: "100%" }}
                animate={motionProps}
                transition={transition}
            >
                <motion.div className="absolute" style={cometStyle} animate={motionProps} transition={transition}>
                    {/* DOM order is tail-end → head; flex direction mirrors it for reversed comets */}
                    <div style={labelStyle}>
                        {chars.map((c, i) => {
                            const d = nearestIsLast ? last - i : i;
                            return (
                                <span
                                    key={i}
                                    style={{
                                        display: "inline-block",
                                        whiteSpace: "pre",
                                        fontWeight: c.bold ? 700 : 500,
                                        opacity: 1 - 0.55 * (d / last),
                                        animation: `${horizontal ? "isoWaveY" : "isoWaveX"} 1.8s ease-in-out ${(i * 0.12).toFixed(2)}s infinite`,
                                    }}
                                >
                                    {c.ch}
                                </span>
                            );
                        })}
                    </div>
                    <div style={tailStyle} />
                    <div style={headStyle} />
                </motion.div>
            </motion.div>
        </div>
    );
};

// Professional background: quiet ledger grid, amber cell highlights and comets running along the grid lines
const LoginBackground = () => {
    const reduceMotion = useReducedMotion();

    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 select-none overflow-hidden"
        >
            <style>{WAVE_CSS}</style>
            {/* Soft corner glows (static gradients, no blur filters) */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: [
                        "radial-gradient(60rem 40rem at 0% 0%, rgba(251, 191, 36, 0.14), transparent 60%)",
                        "radial-gradient(52rem 38rem at 100% 100%, rgba(217, 119, 6, 0.10), transparent 60%)",
                    ].join(", "),
                }}
            />

            {/* Grid + cells share one mask so both fade out toward the edges */}
            <div
                className="absolute inset-0"
                style={{ maskImage: GRID_EDGE_FADE, WebkitMaskImage: GRID_EDGE_FADE }}
            >
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage:
                            "linear-gradient(to right, rgba(148, 163, 184, 0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.22) 1px, transparent 1px)",
                        backgroundSize: `${GRID_CELL}px ${GRID_CELL}px`,
                        backgroundPosition: "50% 0",
                    }}
                />

                {!reduceMotion &&
                    GRID_CELLS.map((c, i) => (
                        <motion.div
                            key={i}
                            className="absolute"
                            style={{
                                width: GRID_CELL,
                                height: GRID_CELL,
                                top: c.row * GRID_CELL,
                                left: `calc(50% - ${GRID_CELL / 2}px + ${c.n * GRID_CELL}px)`,
                                background: "rgba(245, 158, 11, 0.10)",
                                border: "1px solid rgba(217, 119, 6, 0.28)",
                                boxSizing: "border-box",
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{
                                duration: c.duration,
                                delay: c.delay,
                                repeat: Infinity,
                                repeatDelay: c.pause,
                                ease: "easeInOut",
                            }}
                        />
                    ))}

                {/* Comets travelling along the grid lines */}
                {!reduceMotion &&
                    COMETS.map((c) => <GridComet key={c.id} {...c} />)}
            </div>
        </div>
    );
};

// Sub-components for Professional Icons
const EyeOpenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const EyeClosedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.269-2.943-9.543-7a9.958 9.958 0 012.422-3.512M6.636 6.636A9.958 9.958 0 0112 5c4.478 0 8.269 2.943 9.543 7a9.958 9.958 0 01-1.268 2.634M3 3l18 18" />
    </svg>
);

export default LoginForm;