import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, LoaderCircle, LogOut } from "lucide-react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import logo from "../assest/eimcta.png";
import { getMenusForUser, getUserRole } from "../data/data.jsx";
import { useAuth } from "./hooks/useAuth.js";
import { Skeleton } from "./skeleton";

const MOBILE_QUERY = "(max-width: 767px)";
const DRAWER_WIDTH = 256; // 16rem

// Tracks whether the viewport is below the md breakpoint
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(MOBILE_QUERY).matches : false
  );

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = (e) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
};

// Builds text-avatar initials from an email (e.g. "john.doe@x.com" -> "JD", "alice@x.com" -> "AL")
const getInitials = (email) => {
  if (!email) return "U";
  const local = email.split("@")[0] || "";
  const parts = local.split(/[._\-+\d]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (local.slice(0, 2) || "U").toUpperCase();
};

// Soft color per email so every user gets a stable avatar tint
const AVATAR_TINTS = [
  "from-amber-100 to-amber-50 text-amber-700 border-amber-200/60",
  "from-sky-100 to-sky-50 text-sky-700 border-sky-200/60",
  "from-emerald-100 to-emerald-50 text-emerald-700 border-emerald-200/60",
  "from-violet-100 to-violet-50 text-violet-700 border-violet-200/60",
  "from-rose-100 to-rose-50 text-rose-700 border-rose-200/60",
];
const getTint = (email = "") => {
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = (hash * 31 + email.charCodeAt(i)) >>> 0;
  return AVATAR_TINTS[hash % AVATAR_TINTS.length];
};

/**
 * Tooltip rendered in a portal on document.body with fixed positioning.
 * This escapes the sidebar's overflow clipping (which was hiding the tooltip
 * and creating the horizontal x-overlay) and the backdrop-blur containing block.
 */
const SideTooltip = ({ anchorRef, show, label, tooltipVariants }) => {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (show && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({ top: rect.top + rect.height / 2, left: rect.right + 12 });
    }
  }, [show, anchorRef]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="pointer-events-none fixed z-[100] hidden -translate-y-1/2 md:block"
      style={{ top: pos.top, left: pos.left }}
    >
      <AnimatePresence>
        {show && (
          <motion.div
            variants={tooltipVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-xl font-['Roboto_Slab',serif]"
          >
            {label}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
};

const Asidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const controls = useAnimation();

  // On mobile the sidebar is always "expanded" (full labels) when visible as a drawer
  const expanded = isMobile ? true : isOpen;

  // 1. Safely parse the user role from session storage
  const currentUser = useMemo(() => {
    try {
      const stored = sessionStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  const userRole = currentUser?.role;
  const updatedMenus = getMenusForUser(userRole, getUserRole());

  // 2. Fetch all auth and user data seamlessly via useAuth
  const {
    logout,
    useMe: { data: { user: { decoded } = {} } = {}, isLoading: isMeLoading },
    MewithID,
  } = useAuth(currentUser?.id);

  // 3. Derive user details and combined loading state
  const userDetails = MewithID?.data || {};
  const isLoading = isMeLoading || MewithID?.isLoading;
  const email = userDetails.officeEmail || currentUser?.officeEmail || "";
  const jobRole = userDetails.jobRole || currentUser?.jobRole || "Member";

  const handleLogOut = async () => {
    try {
      await logout.mutateAsync();
      sessionStorage.clear();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // --- Responsive behaviour ---
  // Mobile: start closed. Desktop: start open.
  useEffect(() => {
    setIsOpen(!isMobile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  // Close the drawer after navigating (mobile only)
  useEffect(() => {
    if (isMobile) setIsOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Lock page scroll while the drawer is open
  useEffect(() => {
    if (!isMobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = isOpen ? "hidden" : prev || "";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobile, isOpen]);

  // Animate the sidebar: slide in/out on mobile, resize on desktop
  const targetState = isMobile
    ? { x: isOpen ? 0 : "-100vw", width: "100vw" }
    : { x: 0, width: isOpen ? "16rem" : "5rem" };

  useEffect(() => {
    controls.start({
      ...targetState,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, isOpen]);

  // Drag-to-close on the drawer
  const handleDragEnd = (_, info) => {
    if (info.offset.x < -80 || info.velocity.x < -400) {
      setIsOpen(false);
    } else {
      controls.start({ x: 0, transition: { type: "spring", stiffness: 400, damping: 35 } });
    }
  };

  // Swipe-from-left-edge to open
  const handleEdgePanEnd = (_, info) => {
    if (info.offset.x > 50 || info.velocity.x > 400) setIsOpen(true);
  };

  // --- Framer Motion Animation Variants ---
  const navListVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -16 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" } },
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
    <>
      {/* Mobile: invisible left-edge zone — swipe right to open */}
      {isMobile && !isOpen && (
        <motion.div
          onPanEnd={handleEdgePanEnd}
          style={{ touchAction: "pan-y" }}
          className="fixed left-0 top-0 z-30 h-dvh w-4 md:hidden"
        />
      )}

      {/* Mobile: backdrop behind the drawer */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={targetState}
        animate={controls}
        drag={isMobile ? "x" : false}
        dragConstraints={{ left: isMobile ? -window.innerWidth : -DRAWER_WIDTH, right: 0 }}
        dragElastic={{ left: 0.1, right: 0 }}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={isMobile ? { touchAction: "pan-y" } : undefined}
        className="fixed inset-0 z-50 flex h-full max-w-full flex-col bg-white/95 backdrop-blur-xl
         border-r border-slate-200/80 shadow-[4px_0_24px_rgba(0,0,0,0.03)] font-['Roboto_Slab',serif] font-bold md:right-auto md:bottom-auto md:max-w-[85vw]"
      >
        {/* 1. Header (Logo & Toggle Button) */}
        <div className="relative flex h-20 items-center justify-center border-b border-slate-100/80 px-4">
          <motion.div
            animate={{ scale: expanded ? 1 : 0.85 }}
            transition={{ duration: 0.3 }}
            className="flex h-full items-center justify-center"
          >
            {isLoading ? (
              <Skeleton className="h-10 w-32 rounded-full" />
            ) : (
              <img
                src={logo}
                alt="Logo"
                className={`object-contain transition-all duration-300 ${expanded ? "h-14 lg:h-16" : "h-9"}`}
              />
            )}
          </motion.div>

          {/* Floating toggle button.
              Desktop: always visible. Mobile: only visible while the drawer is open. */}
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle sidebar"
            className={`absolute right-3.5 cursor-pointer h-7 w-7 items-center justify-center
      md:-right-3.5 rounded-full bg-white border border-slate-200
      text-slate-400 shadow-md hover:border-amber-400 hover:text-amber-600
      transition-colors z-50 focus:outline-none overflow-hidden
      ${isMobile && !isOpen ? "hidden" : "flex"}`}
          >
            {/* Slowly spinning border */}
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-500 border-r-orange-400"
              animate={{ rotate: 360 }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            {/* Icon */}
            <span className="relative z-10 flex items-center justify-center">
              {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </span>
          </motion.button>
        </div>

        {/* 2. Navigation List (overflow-x-hidden prevents the horizontal x-overlay) */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden px-3 py-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, id) => (
                <div key={id} className="flex w-full items-center rounded-xl px-3 py-3">
                  <Skeleton className="h-5 w-5 shrink-0 rounded-md" />
                  {expanded && <Skeleton className="ml-4 h-4 w-32 rounded-full" />}
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
                    isOpen={expanded}
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
          <UserBlock
            isLoading={isLoading}
            expanded={expanded}
            email={email}
            jobRole={jobRole}
            tooltipVariants={tooltipVariants}
          />

          <LogoutButton
            isOpen={expanded}
            isPending={logout.isPending}
            handleLogOut={handleLogOut}
            labelVariants={labelVariants}
            tooltipVariants={tooltipVariants}
          />
        </div>
      </motion.aside>
    </>
  );
};

// Sub-component: text avatar (from email initials) with skeleton loading state
const UserBlock = ({ isLoading, expanded, email, jobRole, tooltipVariants }) => {
  const [isHovered, setIsHovered] = useState(false);
  const avatarRef = useRef(null);

  const avatar = isLoading ? (
    <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
  ) : (
    <div
      ref={avatarRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-xl border bg-gradient-to-br text-xs font-extrabold tracking-wide shadow-sm ${getTint(email)}`}
    >
      {getInitials(email)}
    </div>
  );

  return (
    <>
      <div
        className={`flex items-center overflow-hidden mb-2 ${expanded ? "px-2" : "justify-center"}`}
      >
        {avatar}

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="user-text"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="ml-3 flex min-w-0 flex-col overflow-hidden whitespace-nowrap"
            >
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-32 rounded-full" />
                  <Skeleton className="h-3 w-20 rounded-full" />
                </div>
              ) : (
                <>
                  <span className="truncate text-sm font-bold text-slate-800">
                    {email || "System User"}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 capitalize">{jobRole}</span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Collapsed: show email + role on hover over the avatar */}
      {!isLoading && (
        <SideTooltip
          anchorRef={avatarRef}
          show={!expanded && isHovered}
          label={email || "System User"}
          tooltipVariants={tooltipVariants}
        />
      )}
    </>
  );
};

// Sub-component for Menu Item
const NavItem = ({ item, isActive, isOpen, itemVariants, labelVariants, tooltipVariants }) => {
  const [isHovered, setIsHovered] = useState(false);
  const anchorRef = useRef(null);

  return (
    <motion.div variants={itemVariants} className="relative">
      <Link
        ref={anchorRef}
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
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-amber-500 rounded-r-full shadow-[0_0_8px_rgba(245,158,11,0.6)]"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}

        <item.icon
          size={20}
          className={`shrink-0 transition-transform duration-200 ${isActive ? "text-amber-600 scale-105" : "text-slate-400 group-hover:text-amber-500 group-hover:scale-110"
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

      {/* Tooltip for collapsed mode — portaled so it is never clipped */}
      <SideTooltip
        anchorRef={anchorRef}
        show={!isOpen && isHovered}
        label={item.name}
        tooltipVariants={tooltipVariants}
      />
    </motion.div>
  );
};

// Sub-component for Logout Button
const LogoutButton = ({ isOpen, isPending, handleLogOut, labelVariants, tooltipVariants }) => {
  const [isHovered, setIsHovered] = useState(false);
  const anchorRef = useRef(null);

  return (
    <div className="relative">
      <motion.button
        ref={anchorRef}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleLogOut}
        disabled={isPending}
        aria-busy={isPending}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group relative flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60
          ${isOpen
            ? "px-3 bg-white border border-slate-200/80 hover:border-red-200 hover:bg-red-50/80 text-slate-600 hover:text-red-600 shadow-sm"
            : "bg-transparent text-slate-400 hover:text-red-500 hover:bg-red-50/50"}`}
      >
        {isPending
          ? <LoaderCircle size={18} className="shrink-0 animate-spin text-red-500" strokeWidth={2.5} />
          : <LogOut size={18} className="shrink-0 transition-transform group-hover:-translate-x-0.5" />}

        <motion.span
          variants={labelVariants}
          animate={isOpen ? "open" : "closed"}
          className="ml-2.5 whitespace-nowrap text-sm font-bold"
        >
          Log Out
        </motion.span>
      </motion.button>

      <SideTooltip
        anchorRef={anchorRef}
        show={!isOpen && isHovered}
        label="Log Out"
        tooltipVariants={tooltipVariants}
      />
    </div>
  );
};

export { Asidebar };