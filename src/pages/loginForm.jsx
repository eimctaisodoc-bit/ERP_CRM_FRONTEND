import React, { useEffect, useState } from 'react';
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../component/hooks/useAuth.js";
import { socket } from "../socket_client/scoket.js";
import InputField from "../component/inputField";
import { ErrorNotify } from "../component/hotToaster.jsx";
import { motion } from "framer-motion";

// Configuration for multi-sized ambient background particles (Dust & Glow Specks)
const AMBER_PARTICLES = [
    { id: 1, size: "w-2 h-2", top: "12%", left: "18%", duration: 6, delay: 0, opacity: 0.5, blur: "blur-none" },
    { id: 2, size: "w-3.5 h-3.5", top: "28%", left: "82%", duration: 8, delay: 1, opacity: 0.7, blur: "blur-xs" },
    { id: 3, size: "w-1.5 h-1.5", top: "68%", left: "12%", duration: 7, delay: 0.5, opacity: 0.4, blur: "blur-none" },
    { id: 4, size: "w-5 h-5", top: "78%", left: "75%", duration: 9, delay: 2, opacity: 0.3, blur: "blur-sm" },
    { id: 5, size: "w-2.5 h-2.5", top: "42%", left: "88%", duration: 5.5, delay: 1.5, opacity: 0.6, blur: "blur-none" },
    { id: 6, size: "w-3 h-3", top: "15%", left: "48%", duration: 10, delay: 0.8, opacity: 0.5, blur: "blur-none" },
    { id: 7, size: "w-4 h-4", top: "88%", left: "32%", duration: 7.5, delay: 1.2, opacity: 0.4, blur: "blur-xs" },
    { id: 8, size: "w-1.5 h-1.5", top: "38%", left: "8%", duration: 6.5, delay: 0.3, opacity: 0.8, blur: "blur-none" },
    { id: 9, size: "w-6 h-6", top: "52%", left: "22%", duration: 11, delay: 1.8, opacity: 0.25, blur: "blur-md" },
    { id: 10, size: "w-2 h-2", top: "82%", left: "55%", duration: 8.5, delay: 0.4, opacity: 0.6, blur: "blur-none" },
];

const LoginForm = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();

    useEffect(() => {
        const message = sessionStorage.getItem("IsAutoLogOut");
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
                    role: user.user.role
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
                ErrorNotify("Token Expired. LogIn Again" || "Login failed");
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

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-slate-50 overflow-hidden font-sans [perspective:1200px]">
            
            {/* ================= BACKGROUND 3D MULTI-SIZE PARTICLE FIELD ================= */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
                
                {/* 1. Deep Atmospheric Premium Gradients */}
                <div className="absolute -top-32 -left-32 w-[32rem] h-[32rem] bg-amber-400/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-amber-600/5 rounded-full blur-[120px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-orange-300/10 rounded-full blur-[80px]" />

                {/* 2. Micro & Medium Ambient Dust Particles */}
                {AMBER_PARTICLES.map((p) => (
                    <motion.div
                        key={p.id}
                        className={`absolute rounded-full bg-gradient-to-tr from-amber-500 to-amber-200 ${p.size} ${p.blur}`}
                        style={{ top: p.top, left: p.left }}
                        animate={{
                            y: [0, -40, 0],
                            x: [0, 20, -15, 0],
                            opacity: [p.opacity, p.opacity * 1.5, p.opacity],
                            scale: [1, 1.3, 0.9, 1],
                        }}
                        transition={{
                            duration: p.duration,
                            repeat: Infinity,
                            delay: p.delay,
                            ease: "easeInOut",
                        }}
                    />
                ))}

                {/* 3. NEW: Premium 3D Security Shield (Top-Right Area) */}
                <motion.div 
                    className="absolute top-[12%] right-[18%] w-24 h-24 md:w-32 md:h-32 opacity-80"
                    animate={{
                        y: [0, -15, 0],
                        rotateY: [-15, 15, -15],
                        rotateX: [5, -5, 5],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <svg viewBox="0 0 100 120" fill="none" className="w-full h-full drop-shadow-2xl">
                        <defs>
                            <linearGradient id="shieldLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.9" />
                                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.6" />
                            </linearGradient>
                            <linearGradient id="shieldRight" x1="100%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#d97706" stopOpacity="0.7" />
                                <stop offset="100%" stopColor="#b45309" stopOpacity="0.3" />
                            </linearGradient>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                <feMerge>
                                    <feMergeNode in="coloredBlur"/>
                                    <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                            </filter>
                        </defs>
                        {/* Left Half */}
                        <path d="M50 5 L10 25 V60 C10 85 30 110 50 118 Z" fill="url(#shieldLeft)" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.5"/>
                        {/* Right Half */}
                        <path d="M50 5 L90 25 V60 C90 85 70 110 50 118 Z" fill="url(#shieldRight)" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.3"/>
                        {/* Security Checkmark */}
                        <path d="M35 60 L45 70 L65 45" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)"/>
                    </svg>
                </motion.div>

                {/* 4. Hero 3D Isometric Glass Cube (Bottom-Right) */}
                <motion.div 
                    className="absolute bottom-[18%] right-[10%] w-32 h-32 md:w-40 md:h-40 opacity-70"
                    animate={{
                        y: [0, -25, 0],
                        rotateX: [0, 15, 0],
                        rotateY: [0, -30, 0],
                        rotateZ: [0, 5, 0],
                    }}
                    transition={{
                        duration: 9,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <svg viewBox="0 0 200 200" fill="none" className="w-full h-full drop-shadow-xl">
                        <defs>
                            <linearGradient id="cubeTop" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.85" />
                                <stop offset="100%" stopColor="#fde68a" stopOpacity="0.4" />
                            </linearGradient>
                            <linearGradient id="cubeLeft" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="#d97706" stopOpacity="0.2" />
                            </linearGradient>
                            <linearGradient id="cubeRight" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.65" />
                                <stop offset="100%" stopColor="#ea580c" stopOpacity="0.25" />
                            </linearGradient>
                        </defs>
                        <polygon points="100,30 160,65 100,100 40,65" fill="url(#cubeTop)" stroke="#f59e0b" strokeOpacity="0.3" strokeWidth="1" />
                        <polygon points="40,65 100,100 100,170 40,135" fill="url(#cubeLeft)" stroke="#f59e0b" strokeOpacity="0.3" strokeWidth="1" />
                        <polygon points="100,100 160,65 160,135 100,170" fill="url(#cubeRight)" stroke="#f59e0b" strokeOpacity="0.3" strokeWidth="1" />
                    </svg>
                </motion.div>

                {/* 5. Medium 3D Floating Prism (Bottom-Left) */}
                <motion.div 
                    className="absolute bottom-[22%] left-[8%] w-24 h-24 md:w-32 md:h-32 opacity-75"
                    animate={{
                        y: [0, -20, 0],
                        rotateX: [15, 45, 15],
                        rotateY: [-10, -40, -10],
                        scale: [0.95, 1.05, 0.95],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-lg">
                        <defs>
                            <linearGradient id="prismGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#fde68a" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.4" />
                            </linearGradient>
                            <linearGradient id="prismGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#ea580c" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="#9a3412" stopOpacity="0.15" />
                            </linearGradient>
                        </defs>
                        <polygon points="50,5 90,50 50,95 10,50" fill="url(#prismGrad1)" stroke="#f59e0b" strokeOpacity="0.4" strokeWidth="1" />
                        <line x1="50" y1="5" x2="50" y2="95" stroke="#fbbf24" strokeOpacity="0.6" strokeWidth="1" />
                        <line x1="10" y1="50" x2="90" y2="50" stroke="#f59e0b" strokeOpacity="0.4" strokeWidth="1" />
                    </svg>
                </motion.div>

                {/* 6. Hero 3D Glossy Sphere (Top-Left) */}
                <motion.div 
                    className="absolute top-[18%] left-[12%] w-28 h-28 md:w-36 md:h-36 opacity-85"
                    animate={{
                        y: [0, 20, 0],
                        x: [0, 15, 0],
                        scale: [1, 1.05, 1],
                    }}
                    transition={{
                        duration: 11,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full filter drop-shadow-xl">
                        <defs>
                            <radialGradient id="sphereGrad3D" cx="35%" cy="35%" r="65%">
                                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                                <stop offset="25%" stopColor="#fde68a" stopOpacity="0.8" />
                                <stop offset="65%" stopColor="#f59e0b" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="#9a3412" stopOpacity="0.2" />
                            </radialGradient>
                        </defs>
                        <circle cx="50" cy="50" r="45" fill="url(#sphereGrad3D)" />
                    </svg>
                </motion.div>

                {/* 7. 3D Rotating Torus Ring (Mid-Right Edge) */}
                <motion.div 
                    className="absolute top-[50%] right-[3%] w-20 h-20 md:w-28 md:h-28 opacity-60"
                    animate={{
                        y: [0, -16, 0],
                        rotateX: [20, 70, 20],
                        rotateZ: [0, 180, 360],
                    }}
                    transition={{
                        duration: 14,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                >
                    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                        <defs>
                            <linearGradient id="ringGrad3D" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.9" />
                                <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="#c2410c" stopOpacity="0.2" />
                            </linearGradient>
                        </defs>
                        <ellipse cx="50" cy="50" rx="42" ry="22" stroke="url(#ringGrad3D)" strokeWidth="6" transform="rotate(-20 50 50)" />
                    </svg>
                </motion.div>

                {/* 8. Small Floating 3D Crystal Gem (Top-Center) */}
                <motion.div 
                    className="absolute top-[8%] left-[45%] w-12 h-12 md:w-16 md:h-16 opacity-70"
                    animate={{
                        y: [0, -18, 0],
                        rotateZ: [0, -30, 0],
                        rotateY: [0, 60, 0],
                    }}
                    transition={{
                        duration: 7,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-md">
                        <polygon points="50,10 85,35 85,70 50,90 15,70 15,35" fill="rgba(253, 230, 138, 0.6)" stroke="#f59e0b" strokeOpacity="0.6" strokeWidth="1.5" />
                        <line x1="50" y1="10" x2="50" y2="90" stroke="#f59e0b" strokeOpacity="0.5" strokeWidth="1" />
                        <line x1="15" y1="35" x2="85" y2="35" stroke="#f59e0b" strokeOpacity="0.4" strokeWidth="1" />
                    </svg>
                </motion.div>

                {/* 9. Large 3D Pyramid (Mid-Left Edge) */}
                <motion.div 
                    className="absolute top-[45%] left-[2%] w-24 h-24 md:w-32 md:h-32 opacity-50"
                    animate={{
                        y: [0, 30, 0],
                        rotateX: [15, -10, 15],
                        rotateY: [0, 25, 0],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <svg viewBox="0 0 120 120" fill="none" className="w-full h-full drop-shadow-xl">
                        <defs>
                            <linearGradient id="pyrSide1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.4" />
                            </linearGradient>
                            <linearGradient id="pyrSide2" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#ea580c" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="#9a3412" stopOpacity="0.1" />
                            </linearGradient>
                        </defs>
                        <polygon points="60,15 105,95 15,95" fill="url(#pyrSide1)" stroke="#f59e0b" strokeOpacity="0.3" strokeWidth="1" />
                        <polygon points="60,15 105,95 60,105" fill="url(#pyrSide2)" stroke="#f59e0b" strokeOpacity="0.2" strokeWidth="1" />
                    </svg>
                </motion.div>

            </div>
            {/* ================= END BACKGROUND FIELD ================= */}

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