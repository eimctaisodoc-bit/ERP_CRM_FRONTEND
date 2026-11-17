import React, { useState, useEffect, useRef } from "react";
import {
    Menu, Bell, User, Settings, LogOut,
    ChevronDown, ShieldCheck, ChevronRight, ChevronLeft, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSessionAuth } from "./utils";
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
            className={`w-full flex cursor-pointer items-center gap-3 px-3 py-3 md:py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]}`}
        >
            <span className="opacity-80">{icon}</span>
            {label}
        </motion.button>
    );
};

const notifications = [
    { id: 1, message: "New message from Alice", time: "2 min ago", color: "bg-indigo-400" },
    { id: 2, message: "System updated to v2.4", time: "10 min ago", color: "bg-emerald-400" },
    { id: 3, message: "New login detected in SF", time: "1 hr ago", color: "bg-rose-400" },
];

const dropdownVariants = {
    hidden: { opacity: 0, y: -12, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
    },
    exit: {
        opacity: 0,
        y: -10,
        scale: 0.95,
        transition: { duration: 0.15, ease: "easeIn" },
    },
};

const Navbar = ({ isOpen = false, toggleSidebar, isOnline = false }) => {
    const [profileOpen, setProfileOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);

    const profileRef = useRef(null);
    const notifRef = useRef(null);

    const { currentUser, decoded, logout, MewithID, role, isAuthLoading } = useSessionAuth();
    const userDetails = MewithID?.data || {};
    const displayName =
        userDetails.username || userDetails.userName || decoded?.username || currentUser?.userName || "User";
    const displayRole = [role, userDetails?.jobRole].filter(Boolean).join(" / ");

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

    // Close dropdowns on outside tap/click (pointer events cover touch + mouse) or Escape
    useEffect(() => {
        const handlePointerDown = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
        };
        const handleKey = (e) => {
            if (e.key === "Escape") {
                setProfileOpen(false);
                setNotifOpen(false);
            }
        };
        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKey);
        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKey);
        };
    }, []);

    const toggleNotif = () => {
        setNotifOpen((v) => !v);
        setProfileOpen(false);
    };
    const toggleProfile = () => {
        setProfileOpen((v) => !v);
        setNotifOpen(false);
    };

    const handleToggleSidebar = toggleSidebar || (() => { });

    // Header sits beside the sidebar on desktop (md+), full width on mobile
    const headerOffsetClass = isOpen ? "md:left-64" : "md:left-20";

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
                background: "rgba(255, 255, 255, 0.72)",
                backdropFilter: "blur(20px) saturate(180%)",
                WebkitBackdropFilter: "blur(20px) saturate(180%)",
                border: "1px solid rgba(255, 255, 255, 0.85)",
                borderBottom: "2px solid rgba(255, 255, 255, 0.95)",
                boxShadow: "0 10px 30px -10px rgba(30, 41, 59, 0.08), 0 1px 0 0 rgba(255, 255, 255, 0.9) inset",

            }}
            className={`fixed top-0 right-0 left-0 ${headerOffsetClass} z-30 flex items-center justify-between h-16 px-3 sm:px-4 md:px-6 shadow-amber-700  transition-[left] duration-300 font-['Roboto_Slab',serif]`}
        >
            {/* LEFT SECTION */}
            <div className="flex items-center gap-3">
                {/* Mobile only: opens the sidebar drawer */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={handleToggleSidebar}
                    className="md:hidden flex items-center justify-center h-10 w-10 text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 rounded-xl transition-all focus:outline-none"
                    aria-label="Open menu"
                    aria-expanded={isOpen}
                >
                    <Menu size={22} />
                </motion.button>


            </div>

            {/* RIGHT SECTION */}
            <div className="flex items-center gap-1 sm:gap-3">

                {/* NOTIFICATIONS
                    Mobile: wrapper is static so the dropdown spans the header width.
                    sm+: wrapper is relative so the dropdown anchors under the bell. */}
                <div className="sm:relative" ref={notifRef}>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleNotif}
                        aria-label="Notifications"
                        aria-expanded={notifOpen}
                        className={`h-10 w-10 flex items-center justify-center rounded-xl transition-colors duration-200 relative group focus:outline-none ${notifOpen ? "bg-amber-50 text-amber-600" : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-800"
                            }`}
                    >
                        <Bell
                            size={20}
                            className={`transition-transform duration-300 ${notifOpen ? "rotate-[15deg] fill-amber-500/20" : "group-hover:rotate-[15deg]"
                                }`}
                        />
                        {notifications.length > 0 && (
                            <span className="absolute top-2 right-2.5 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 border-2 border-white"></span>
                            </span>
                        )}
                    </motion.button>

                    <AnimatePresence>
                        {notifOpen && (
                            <motion.div
                                variants={dropdownVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="absolute left-3 right-3 top-full mt-2 sm:left-auto sm:right-0 sm:mt-3 sm:w-[340px] bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.12)] border border-slate-100/80 z-50 overflow-hidden origin-top-right"
                            >
                                <div className="p-4 flex justify-between items-center border-b border-slate-50">
                                    <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                                    <span className="text-[10px] bg-amber-50 text-amber-600 px-2.5 py-1 rounded-md font-bold uppercase tracking-widest">
                                        {notifications.length} New
                                    </span>
                                </div>

                                <div className="max-h-[min(300px,60vh)] overflow-y-auto custom-scrollbar p-2">
                                    {notifications.map((n) => (
                                        <motion.div
                                            key={n.id}
                                            whileHover={{ x: 2 }}
                                            className="p-3 flex gap-4 hover:bg-slate-50/80  rounded-xl transition-colors cursor-pointer group"
                                        >
                                            <div className={`w-1.5 shrink-0 rounded-full ${n.color} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
                                            <div className="flex-grow min-w-0">
                                                <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                                                    {n.message}
                                                </p>
                                                <p className="text-[11px] text-slate-400 mt-1 font-medium">{n.time}</p>
                                            </div>
                                            <ChevronRight size={16} className="text-slate-300 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all self-center shrink-0" />
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="p-2 border-t border-slate-50">
                                    <button className="w-full py-3 sm:py-2.5 text-center text-sm font-bold text-amber-600 hover:bg-amber-50 transition-colors rounded-xl">
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
                        onClick={toggleProfile}
                        disabled={isAuthLoading}
                        aria-busy={isAuthLoading}
                        aria-expanded={profileOpen}
                        aria-label="Account menu"
                        className={`flex items-center gap-3 p-1 md:p-1.5 md:pr-3 rounded-2xl transition-colors duration-200 group focus:outline-none ${profileOpen ? "bg-slate-100" : "hover:bg-slate-100/80"
                            }`}
                    >
                        {isAuthLoading ? (
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
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff&bold=true`}
                                        alt="profile"
                                        className="w-9 h-9 rounded-xl object-cover border border-slate-200/50 shadow-sm transition-transform group-hover:scale-105"
                                    />
                                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white rounded-full ${isOnline ? "bg-emerald-500" : "bg-slate-400"}`}></div>
                                </div>

                                <div className="hidden md:flex flex-col text-left max-w-[10rem]">
                                    <p className="text-sm font-bold text-slate-800 leading-tight truncate">
                                        {displayName}
                                    </p>
                                    <p className="text-[11px] capitalize font-medium text-slate-500 tracking-wide mt-0.5 truncate">
                                        {displayRole}
                                    </p>
                                </div>

                                <ChevronDown
                                    size={14}
                                    className={`text-slate-400 transition-transform duration-300 hidden md:block ${profileOpen ? "rotate-180" : ""}`}
                                />
                            </>
                        )}
                    </motion.button>

                    <AnimatePresence>
                        {profileOpen && (
                            <motion.div
                                variants={dropdownVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="absolute right-0 mt-3 w-60 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.12)] border border-slate-100/80 p-2 z-50 origin-top-right"
                            >
                                {/* Mobile only: name + role (hidden in the header on small screens) */}
                                <div className="md:hidden px-3 py-2.5 mb-1 border-b border-slate-100/80">
                                    <p className="text-sm font-bold text-slate-800 truncate">{displayName}</p>
                                    {displayRole && (
                                        <p className="text-[11px] capitalize font-medium text-slate-500 mt-0.5 truncate">
                                            {displayRole}
                                        </p>
                                    )}
                                </div>

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