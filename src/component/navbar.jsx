import React, { useState, useEffect, useRef, useMemo } from "react";
import {
    Menu, Bell, Search, User, Settings, LogOut,
    ChevronDown, ShieldCheck, ChevronRight, ChevronLeft, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "./hooks/useAuth";
import { Skeleton } from "./skeleton";



const DropdownItem = ({ icon, label, variant = "default", onClick, disabled = false }) => {
    const styles = {
        danger: "text-rose-500 hover:bg-rose-50 hover:text-rose-600",
        default: "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
    };

    return (
        <motion.button
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClick}
            disabled={disabled}
            className={`w-full flex cursor-pointer items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]}`}
        >
            <span className="opacity-80">{icon}</span>
            {label}
        </motion.button>
    );
};

const Navbar = ({ isOpen = false, toggleSidebar }) => {
    const [profileOpen, setProfileOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);

    const profileRef = useRef(null);
    const notifRef = useRef(null);

    // Safely parse session storage to prevent React crashes
    const getSessionUser = useMemo(() => {
        try {
            const stored = sessionStorage.getItem('user');
            return stored ? JSON.parse(stored) : { userName: "Guest", role: "Visitor" };
        } catch {
            return { userName: "Guest", role: "Visitor" };
        }
    }, []);
    const currentUser = getSessionUser;
    const { logout, useMe, MewithID } = useAuth(currentUser?.id);
    const { data: { user: { decoded } = {} } = {} } = useMe;
    const userDetails = MewithID.data || {};
    const displayName = userDetails.username || userDetails.userName || decoded?.username || currentUser.userName;
    const displayRole = userDetails.role || currentUser.role;

    const handleLogout = async () => {
        try {
            await logout.mutateAsync();
        } finally {
            sessionStorage.removeItem("Token");
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            sessionStorage.removeItem("isToken");
            window.location.replace("/");
        }
    };

    const notifications = [
        { id: 1, message: "New message from Alice", time: "2 min ago", color: "bg-indigo-400" },
        { id: 2, message: "System updated to v2.4", time: "10 min ago", color: "bg-emerald-400" },
        { id: 3, message: "New login detected in SF", time: "1 hr ago", color: "bg-rose-400" },
    ];

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
        };
        window.addEventListener("mousedown", handleClickOutside);
        return () => window.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const sidebarMarginClass = isOpen ? "md:ml-64" : "md:ml-20";
    const handleToggleSidebar = toggleSidebar || (() => { });

    // Animation Variants
    const dropdownVariants = {
        hidden: { opacity: 0, y: -12, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] }
        },
        exit: {
            opacity: 0,
            y: -10,
            scale: 0.95,
            transition: { duration: 0.15, ease: "easeIn" }
        }
    };

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed top-0 w-full z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white/80 backdrop-blur-lg border-b border-slate-100/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] transition-all duration-300 font-['Roboto_Slab',serif]"
        >
            {/* LEFT SECTION - TOGGLES */}
            <div className={`flex items-center gap-4 transition-all duration-300 ease-in-out ${sidebarMarginClass}`}>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={handleToggleSidebar}
                    className="p-2 lg:hidden block text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 rounded-xl transition-all focus:outline-none"
                    aria-label="Toggle Menu"
                >
                    <Menu size={20} />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={handleToggleSidebar}
                    className="hidden lg:flex items-center justify-center p-2 rounded-xl bg-slate-50/50 border border-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-all shadow-sm focus:outline-none"
                >
                    {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                </motion.button>
            </div>

            {/* RIGHT SECTION */}
            <div className="flex items-center gap-2 sm:gap-4 relative">

                {/* NOTIFICATIONS */}
                <div className="relative" ref={notifRef}>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setNotifOpen(!notifOpen)}
                        className={`p-2.5 rounded-xl transition-colors duration-200 relative group focus:outline-none ${notifOpen ? "bg-amber-50 text-amber-600" : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-800"
                            }`}
                    >
                        <Bell
                            size={20}
                            className={`transition-transform duration-300 ${notifOpen ? 'rotate-[15deg] fill-amber-500/20' : 'group-hover:rotate-[15deg]'
                                }`}
                        />
                        {/* Active Amber Indicator with Pulse Effect */}
                        <span className="absolute top-2 right-2.5 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 border-2 border-white"></span>
                        </span>
                    </motion.button>

                    {/* Animated Notification Dropdown */}
                    <AnimatePresence>
                        {notifOpen && (
                            <motion.div
                                variants={dropdownVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="absolute right-[-4rem] sm:right-0 mt-3 w-[calc(100vw-2rem)] sm:w-[320px] bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-slate-100/80 z-50 overflow-hidden origin-top-right"
                            >
                                <div className="p-4 flex justify-between items-center border-b border-slate-50">
                                    <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                                    <span className="text-[10px] bg-amber-50 text-amber-600 px-2.5 py-1 rounded-md font-bold uppercase tracking-widest">
                                        3 New
                                    </span>
                                </div>

                                <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2">
                                    {notifications.map((n) => (
                                        <motion.div
                                            key={n.id}
                                            whileHover={{ x: 2 }}
                                            className="p-3 flex gap-4 hover:bg-slate-50/80 rounded-xl transition-colors cursor-pointer group"
                                        >
                                            <div className={`w-1.5 shrink-0 rounded-full ${n.color} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
                                            <div className="flex-grow">
                                                <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                                                    {n.message}
                                                </p>
                                                <p className="text-[11px] text-slate-400 mt-1 font-medium">{n.time}</p>
                                            </div>
                                            <ChevronRight size={16} className="text-slate-300 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all self-center" />
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="p-2 border-t border-slate-50">
                                    <button className="w-full py-2.5 text-center text-sm font-bold text-amber-600 hover:bg-amber-50 transition-colors rounded-xl">
                                        View all updates
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* SUBTLE DIVIDER */}
                <div className="h-8 w-px bg-slate-200/60 mx-1 hidden sm:block"></div>

                {/* PROFILE */}
                <div className="relative" ref={profileRef}>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setProfileOpen(!profileOpen)}
                        disabled={useMe.isLoading}
                        aria-busy={useMe.isLoading}
                        className={`flex items-center gap-3 p-1.5 pr-3 rounded-2xl transition-colors duration-200 group focus:outline-none ${profileOpen ? "bg-slate-100" : "hover:bg-slate-100/80"
                            }`}
                    >
                        {useMe.isLoading ? (
                            <>
                                <Skeleton className="w-9 h-9 rounded-xl" index={0} />
                                <div className="hidden md:flex flex-col gap-1.5 text-left">
                                    <Skeleton className="w-20 h-3 rounded-full" index={1} />
                                    <Skeleton className="w-14 h-2 rounded-full opacity-60" index={2} />
                                </div>
                                <Skeleton className="hidden md:block w-3.5 h-3.5 rounded-full" index={3} />
                            </>
                        ) : (
                            <>
                                <div className="relative">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${displayName}&background=6366f1&color=fff&bold=true`}
                                        alt="profile"
                                        className="w-9 h-9 rounded-xl object-cover border border-slate-200/50 shadow-sm transition-transform group-hover:scale-105"
                                    />
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                                </div>

                                <div className="hidden md:flex flex-col text-left">
                                    <p className="text-sm font-bold text-slate-800 leading-tight">
                                        {displayName}
                                    </p>
                                    <p className="text-[11px] capitalize font-medium text-slate-500 tracking-wide mt-0.5">
                                        {displayRole}/{userDetails?.jobRole}
                                    </p>
                                </div>

                                <ChevronDown
                                    size={14}
                                    className={`text-slate-400 transition-transform duration-300 hidden md:block ${profileOpen ? 'rotate-180' : ''}`}
                                />
                            </>
                        )}
                    </motion.button>

                    {/* Animated Profile Dropdown */}
                    <AnimatePresence>
                        {profileOpen && (
                            <motion.div
                                variants={dropdownVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-slate-100/80 p-2 z-50 origin-top-right"
                            >
                                <div className="px-3 py-2 mb-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account</p>
                                </div>
                                <DropdownItem icon={<User size={16} />} label="My Profile" />
                                <DropdownItem icon={<ShieldCheck size={16} />} label="Security" />
                                <DropdownItem icon={<Settings size={16} />} label="Settings" />

                                <div className="my-1.5 border-t border-slate-100/80"></div>

                                <DropdownItem
                                    icon={logout.isPending ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                                    label="Sign Out"
                                    variant="danger"
                                    onClick={handleLogout}
                                    disabled={logout.isPending}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.header>
    );
};

export default Navbar;