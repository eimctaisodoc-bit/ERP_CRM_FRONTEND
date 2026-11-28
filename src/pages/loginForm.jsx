import React, { useEffect, useMemo, useRef, useState } from 'react';
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../component/hooks/useAuth.js";
import { socket } from "../socket_client/scoket.js";
import { ArrowLeft, Info, LoaderCircle, RefreshCw, ShieldBan } from "lucide-react";
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
// angle: travel direction in degrees (CSS rotation: 0 = →, 90 = ↓, 180 = ←, -90 = ↑)
//        e.g. 30 / 45 / 70 = down-right, -35 = up-right, 145 = down-left, 210 = up-left
// x, y:  a point (in % of the screen) that the comet's path passes through
// color = comet head and tail, ink = darker shade used for the readable letters
const COMETS = [
    { id: 1, code: "ISO 9001", text: "Quality Management", angle: 0, x: 50, y: 35, color: "#f59e0b", ink: "#b45309", length: 120, duration: 18, delay: 0, pause: 2 },   // left → right
    { id: 2, code: "ISO 21001", text: "Educational Organizations", angle: 180, x: 50, y: 70, color: "#0ea5e9", ink: "#0369a1", length: 120, duration: 20, delay: 4, pause: 1.5 }, // right → left
    { id: 3, code: "ISO 14001", text: "Environmental Management", angle: 90, x: 22, y: 50, color: "#10b981", ink: "#047857", length: 120, duration: 16, delay: 8, pause: 2.5 }, // top → bottom
    { id: 4, code: "ISO 45001", text: "Occupational Health & Safety", angle: -45, x: 60, y: 60, color: "#f43f5e", ink: "#be123c", length: 120, duration: 19, delay: 2, pause: 2 },   // up-right
    { id: 5, code: "ISO 22000", text: "Food Safety", angle: 12, x: 40, y: 20, color: "#84cc16", ink: "#4d7c0f", length: 120, duration: 20, delay: 11, pause: 3 },   // shallow slope
    { id: 6, code: "ISO 27001", text: "Information Security", random: true, color: "#8b5cf6", ink: "#6d28d9", length: 120, duration: 21, delay: 6, pause: 2.5 }, // new direction each pass
];

// Wave that travels through the letters (pure CSS, so ~200 letters stay cheap to animate)
const WAVE_CSS = `
@keyframes isoWaveY { 0%, 100% { transform: translateY(0); } 25% { transform: translateY(-3px); } 75% { transform: translateY(3px); } }
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

                <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200  p-8 text-center shadow-xl shadow-slate-200/50 sm:p-10">

                    {/* Status Icon */}
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500">
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
        // Main background: smooth slate gradient
        <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 overflow-hidden font-sans">

            {/* ================= PROFESSIONAL BACKGROUND ================= */}
            <LoginBackground />
            {/* ================= END BACKGROUND ================= */}

            {/* Login Card - solid (no opacity) background with a light blur, set via style tag */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{
                    backdropFilter: "blur(10px)",

                }}
                className="relative z-10 w-full bg-white/70 max-w-md rounded-[1.25rem] shadow-[0_8px_30px_rgb(0,0,0,0.10)] p-8 sm:p-10 border border-slate-200"
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
                                className="absolute inset-y-0 cursor-pointer right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none rounded-r-md"
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
                            className="w-full flex cursor-pointer justify-center items-center bg-gradient-to-r from-amber-600 to-amber-500 text-white font-semibold py-3 px-4 rounded-xl hover:from-amber-700 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all shadow-lg shadow-amber-600/25 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {login.isPending && (
                                <LoaderCircle className="mr-2 h-3 w-3 animate-spin text-white" strokeWidth={2.5} />
                            )}
                            Sign In
                        </motion.button>
                    </motion.div>
                </form>
            </motion.div>
        </div>
    );
};

// One comet flying across the screen at any angle. Its tail dissolves into wavy letters
// (an ISO certification), like a banner trailing behind it.
//
// How it works: a zero-size anchor is placed at (x%, y%) and rotated by `angle`.
// In that rotated space the comet simply slides along its local X axis, so any angle
// (30°, 45°, 70°, -35°, 145° ...) works with the same code.
const TRAVEL = "120vmax"; // far enough to enter and leave the screen fully

const pick = (min, max) => min + Math.random() * (max - min);

// Fixed pose from config, or a fresh random pose (any angle, any point on screen)
const makePose = ({ random, angle, x, y }) =>
    random ? { angle: pick(-180, 180), x: pick(10, 90), y: pick(10, 90) } : { angle, x, y };

const GridComet = ({ code, text, angle, x, y, random, color, ink, length, duration, delay, pause }) => {
    const [run, setRun] = useState(0);
    const timer = useRef(null);

    // New pose on every pass (only changes when `random` is true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const pose = useMemo(() => makePose({ random, angle, x, y }), [run]);

    useEffect(() => () => clearTimeout(timer.current), []);

    // Comets heading left would show upside-down text, so flip the label 180° for them
    const flip = Math.cos((pose.angle * Math.PI) / 180) < -0.001;

    const chars = [
        ...Array.from(code).map((ch) => ({ ch, bold: true })),
        ...Array.from(` – ${text}`).map((ch) => ({ ch, bold: false })),
    ];
    const last = chars.length - 1;
    const nearestIsLast = !flip;

    const labelStyle = {
        whiteSpace: "nowrap",
        fontSize: 12,
        lineHeight: 1,
        letterSpacing: "0.12em",
        color: ink,
        textShadow: "0 0 6px rgba(255, 255, 255, 0.95)",
        position: "relative",
        flexShrink: 0,
        top: flip ? 10 : -10,
        transform: flip ? "rotate(180deg)" : undefined,
    };

    const tailStyle = {
        width: length,
        height: 2,
        flexShrink: 0,
        background: `linear-gradient(to right, transparent, ${color})`,
    };

    const headStyle = {
        width: 6,
        height: 6,
        flexShrink: 0,
        marginLeft: -3,
        borderRadius: "9999px",
        background: color,
        boxShadow: `0 0 10px 3px ${color}`,
    };

    return (
        <div
            className="absolute"
            style={{
                left: `${pose.x}%`,
                top: `${pose.y}%`,
                width: 0,
                height: 0,
                transform: `rotate(${pose.angle}deg)`,
                transformOrigin: "0 0",
            }}
        >
            <motion.div
                key={run}
                className="absolute"
                style={{ top: 0, left: 0, width: 0, height: 0 }}
                initial={{ x: `-${TRAVEL}` }}
                animate={{ x: TRAVEL }}
                // first pass uses the start delay; later passes wait `pause` below
                transition={{ duration, delay: run === 0 ? delay : 0, ease: "linear" }}
                onAnimationComplete={() => {
                    timer.current = setTimeout(() => setRun((r) => r + 1), pause * 1000);
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        right: 0,
                        top: 0,
                        transform: "translateY(-50%)",
                        display: "flex",
                        alignItems: "center",
                    }}
                >
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
                                        animation: `isoWaveY 1.8s ease-in-out ${(i * 0.12).toFixed(2)}s infinite`,
                                    }}
                                >
                                    {c.ch}
                                </span>
                            );
                        })}
                    </div>
                    <div style={tailStyle} />
                    <div style={headStyle} />
                </div>
            </motion.div>
        </div>
    );
};
// Professional background: quiet ledger grid, amber cell highlights and comets flying at free angles
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
                        "radial-gradient(60rem 40rem at 0% 0%, rgba(251, 191, 36, 0.12), transparent 60%)",
                        "radial-gradient(52rem 38rem at 100% 100%, rgba(217, 119, 6, 0.08), transparent 60%)",
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
                            "linear-gradient(to right, rgba(100, 116, 139, 0.20) 1px, transparent 1px), linear-gradient(to bottom, rgba(100, 116, 139, 0.20) 1px, transparent 1px)",
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
            </div>

            {/* Comets fly at free angles, so they live outside the grid mask */}
            {!reduceMotion &&
                COMETS.map((c) => <GridComet key={c.id} {...c} />)}
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