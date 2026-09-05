import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assest/eimcta.png";
import { menus } from "../data/data.jsx";
import { useAuth } from "./hooks/useAuth.js";

const Asidebar = ({ isOpen, setIsOpen }) => {
  const { 
    isAuthLoading, 
    logout, 
    useMe: { data: { user: { decoded } = {} } = {}, isLoading } 
  } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  // Safely parse the user role from session storage
  const roleString = sessionStorage.getItem('user');
  const user = roleString ? JSON.parse(roleString) : null;
  const userRole = user?.role;
  const updatedMenus = menus[userRole] || [];

  const handleLogOut = async () => {
    try {
      await logout.mutateAsync();
      sessionStorage.clear();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // --- Framer Motion Animation Variants ---
  const sidebarVariants = {
    open: {
      width: "16rem",
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
    closed: {
      width: "5rem",
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const navListVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -16 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.35, ease: "easeOut" },
    },
  };

  const labelVariants = {
    open: {
      opacity: 1,
      x: 0,
      display: "block",
      transition: { duration: 0.25, delay: 0.1 },
    },
    closed: {
      opacity: 0,
      x: -10,
      transitionEnd: { display: "none" },
      transition: { duration: 0.15 },
    },
  };

  const tooltipVariants = {
    hidden: { opacity: 0, x: -8, scale: 0.95 },
    visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
    exit: { opacity: 0, x: -8, scale: 0.95, transition: { duration: 0.15 } },
  };

  return (
    <motion.aside
      initial={false}
      animate={isOpen ? "open" : "closed"}
      variants={sidebarVariants}
      className="fixed left-0 top-0 z-50 flex h-dvh flex-col bg-white/90 backdrop-blur-xl border-r border-slate-200/80 shadow-[4px_0_24px_rgba(0,0,0,0.03)] font-['Roboto_Slab',serif] font-bold "
    >
      {/* 1. Header (Logo & Toggle Button) */}
      <div className="relative flex h-20 items-center justify-center border-b border-slate-100/80 px-4">
        <motion.div
          animate={{ scale: isOpen ? 1 : 0.85 }}
          transition={{ duration: 0.3 }}
          className="flex h-full items-center justify-center"
        >
          {isLoading ? (
            <div className="h-10 w-32 animate-pulse rounded-full bg-slate-100" />
          ) : (
            <img
              src={logo}
              alt="Logo"
              className={`object-contain transition-all duration-300 ${isOpen ? "h-14 lg:h-16" : "h-9"}`}
            />
          )}
        </motion.div>

        {/* Floating Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -right-3.5 top-1/2 hidden md:flex -translate-y-1/2 h-7 w-7 items-center justify-center 
            rounded-full bg-white border border-slate-200 text-slate-400 shadow-md
            hover:border-amber-400 hover:text-amber-600 transition-colors z-50 focus:outline-none"
        >
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </motion.button>
      </div>

      {/* 2. Navigation List */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, id) => (
              <div key={id} className="flex w-full items-center rounded-xl px-3 py-3 animate-pulse">
                <div className="h-5 w-5 rounded-md bg-slate-200 shrink-0" />
                {isOpen && <div className="ml-4 h-4 bg-slate-200 rounded-full w-32" />}
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={navListVariants}
            initial="hidden"
            animate="visible"
            className="space-y-1"
          >
            {updatedMenus.map((item, id) => {
              const isActive = location.pathname === item.path;
              return (
                <NavItem
                  key={item.path || id}
                  item={item}
                  isActive={isActive}
                  isOpen={isOpen}
                  itemVariants={itemVariants}
                  labelVariants={labelVariants}
                  tooltipVariants={tooltipVariants}
                />
              );
            })}
          </motion.div>
        )}
      </nav>

      {/* 3. Footer / User Profile Section */}
      <div className="border-t border-slate-100 bg-slate-50/60 p-3">
        {/* User Mini Profile */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 8 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex items-center px-2 overflow-hidden"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600 shadow-sm border border-amber-200/50">
                <User size={18} />
              </div>
              <div className="ml-3 flex flex-col whitespace-nowrap overflow-hidden">
                <span className="text-sm font-bold text-slate-800 capitalize truncate">
                  {decoded?.name || user?.name || "System User"}
                </span>
                <span className="text-xs font-semibold text-slate-400 capitalize">
                  {userRole || "Member"}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logout Button */}
        <LogoutButton 
          isOpen={isOpen} 
          handleLogOut={handleLogOut} 
          labelVariants={labelVariants}
          tooltipVariants={tooltipVariants}
        />
      </div>
    </motion.aside>
  );
};

// Sub-component for Menu Item
const NavItem = ({ item, isActive, isOpen, itemVariants, labelVariants, tooltipVariants }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.div variants={itemVariants} className="relative">
      <Link
        to={item.path}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group relative flex font-extrabold w-full items-center justify-start rounded-xl px-3 py-2.5 my-0.5
          transition-colors duration-200 ease-in-out
          ${isActive
            ? "text-amber-700 font-bold bg-amber-50/90 shadow-[inset_0px_1px_3px_rgba(245,158,11,0.08)]"
            : "text-slate-700 hover:bg-slate-100/70 hover:text-amber-600 font-semibold"
          }`}
      >
        {/* Active Animated Background Glow Indicator */}
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-amber-500 rounded-r-full shadow-[0_0_8px_rgba(245,158,11,0.6)]"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}

        <item.icon
          size={20}
          className={`shrink-0 transition-transform duration-200 ${
            isActive ? "text-amber-600 scale-105" : "text-slate-400 group-hover:text-amber-500 group-hover:scale-110"
          }`}
        />

        <motion.span
          variants={labelVariants}
          animate={isOpen ? "open" : "closed"}
          className="ml-3 whitespace-nowrap text-sm tracking-wide font-bold"
        >
          {item.name}
        </motion.span>
      </Link>

      {/* Floating Tooltip for Collapsed Mode */}
      <AnimatePresence>
        {!isOpen && isHovered && (
          <motion.div
            variants={tooltipVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-[100] hidden md:flex items-center
              rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-xl whitespace-nowrap pointer-events-none font-['Roboto_Slab',serif]"
          >
            {item.name}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Sub-component for Logout Button
const LogoutButton = ({ isOpen, handleLogOut, labelVariants, tooltipVariants }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleLogOut}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group relative flex w-full items-center justify-center rounded-xl py-2.5 transition-all duration-200
          ${isOpen 
            ? "px-3 bg-white border border-slate-200/80 hover:border-red-200 hover:bg-red-50/80 text-slate-600 hover:text-red-600 shadow-sm" 
            : "bg-transparent text-slate-400 hover:text-red-500 hover:bg-red-50/50"}`}
      >
        <LogOut size={18} className="shrink-0 transition-transform group-hover:-translate-x-0.5" />
        
        <motion.span
          variants={labelVariants}
          animate={isOpen ? "open" : "closed"}
          className="ml-2.5 whitespace-nowrap text-sm font-bold"
        >
          Log Out
        </motion.span>
      </motion.button>

      {/* Tooltip for Collapsed Logout */}
      <AnimatePresence>
        {!isOpen && isHovered && (
          <motion.div
            variants={tooltipVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-[100] hidden md:flex items-center
              rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-xl whitespace-nowrap pointer-events-none font-['Roboto_Slab',serif]"
          >
            Log Out
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { Asidebar };