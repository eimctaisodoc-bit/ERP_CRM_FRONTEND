import React, { useMemo, useState } from "react";
import { User } from "lucide-react";
import HeroOverlay from "../../overlay";
import { useOnlineUsers } from "../../hooks/useOnlineuser";

/* =========================================================
   CONSTANTS & HELPERS
========================================================= */

const ROLE_COLORS = {
    admin: "bg-indigo-500",
    staff: "bg-pink-500",
    client: "bg-amber-500",
    default: "bg-slate-600",
};

const pickColorByRole = (role) => ROLE_COLORS[role] || ROLE_COLORS.default;

const normalizeOnlineUsers = (rawUsers) => {
    if (!Array.isArray(rawUsers)) return [];

    return rawUsers
        .map((item) => {
            if (Array.isArray(item) && item.length === 2) {
                const [keyUsername, userObj] = item;
                if (userObj && typeof userObj === "object") {
                    return { username: userObj.username || keyUsername, ...userObj };
                }
                return { username: String(keyUsername || ""), status: "online" };
            }

            if (item && typeof item === "object") {
                return { username: item.username || item.name || "", ...item };
            }

            if (typeof item === "string") return { username: item };

            return null;
        })
        .filter(Boolean);
};

const getCurrentSessionUser = () => {
    try {
        const raw = sessionStorage.getItem("user");
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
        return null;
    }
};

/* =========================================================
   STATUS INDICATOR COMPONENT
========================================================= */
const StatusIndicator = ({ status }) => {
    const baseClasses =
        "absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-white dark:ring-slate-900 shadow-sm z-20";

    switch (status) {
        case "online":
            return (
                <span className={`${baseClasses} bg-green-500`} role="status" aria-label="Online">
                    <span className="absolute inset-0 rounded-full bg-green-400 opacity-70 animate-ping" />
                </span>
            );

        case "away":
            return <span className={`${baseClasses} bg-amber-400`} role="status" aria-label="Away" />;

        case "busy":
            return (
                <span
                    className={`${baseClasses} bg-red-500 flex items-center justify-center`}
                    role="status"
                    aria-label="Busy"
                >
                    <span className="h-[2px] w-2.5 bg-white rounded-full" />
                </span>
            );

        default:
            return <span className={`${baseClasses} bg-slate-400`} role="status" aria-label="Offline" />;
    }
};

/* =========================================================
   USER AVATAR WITH STATUS & TOOLTIP
========================================================= */
const UserAvatarStatus = ({ user }) => {
    const [imgError, setImgError] = useState(false);

    const renderAvatarContent = () => {
        if (user.avatarUrl && !imgError) {
            return (
                <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover rounded-full"
                    onError={() => setImgError(true)}
                />
            );
        }

        if (user.name) {
            const initial = String(user.name).charAt(0).toUpperCase();
            return (
                <span className="text-white font-bold text-base select-none">
                    {initial}
                </span>
            );
        }

        return <User className="text-white/80 w-5 h-5" />;
    };

    return (
        <div className="relative flex flex-col items-center group cursor-pointer">
            {/* Avatar Circle Container */}
            <div
                className={`relative w-12 h-12 rounded-full overflow-hidden 
                flex items-center justify-center transition-transform duration-200 
                group-hover:scale-105 ring-2 ring-white dark:ring-slate-800 shadow-md ${user.color || "bg-slate-600"
                    }`}
            >
                {renderAvatarContent()}

                {/* Subtle gloss overlay */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/10 via-transparent to-white/10 pointer-events-none" />
            </div>

            {/* Status Indicator */}
            <StatusIndicator status={user.status} />

            {/* Tooltip */}
            <div
                className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 
                rounded-md bg-slate-800 text-white text-xs font-medium 
                opacity-0 group-hover:opacity-100 
                transition-opacity duration-200 
                pointer-events-none whitespace-nowrap z-50 shadow-lg"
            >
                {user.name} ({user.status})

                {/* Tooltip Arrow */}
                <div
                    className="absolute top-full left-1/2 -translate-x-1/2 
                    w-0 h-0 
                    border-l-4 border-l-transparent 
                    border-r-4 border-r-transparent 
                    border-t-4 border-t-slate-800"
                />
            </div>
        </div>
    );
};

/* =========================================================
   MAIN COMPONENT: ADMIN REPORT
========================================================= */
const Admin_Report = () => {
    const { data: users = [], isLoading } = useOnlineUsers();
    const me = useMemo(() => getCurrentSessionUser(), []);

    const visibleUsers = useMemo(() => {
        const normalized = normalizeOnlineUsers(users);
        if (!me) return normalized;

        const myUsername = me.username || me.user?.username || "";
        const myId = me.id || me.user?.id || "";

        return normalized.filter((u) => {
            const uUsername = u.username || "";
            const uId = u.socketId || "";
            if (myUsername && uUsername && myUsername === uUsername) return false;
            if (myId && uId && myId === uId) return false;
            return true;
        });
    }, [users, me]);

    return (
        <div className="w-full font-['Roboto',sans-serif]">
            <HeroOverlay />

            <div className="px-6 py-8">
                {isLoading ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 text-center">
                        <p className="text-slate-500 dark:text-slate-400 animate-pulse">
                            Loading online users...
                        </p>
                    </div>
                ) : visibleUsers.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm">
                        <p className="text-slate-600 dark:text-slate-300">
                            No other users online.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-wrap items-center gap-4">
                        {visibleUsers.map((u) => {
                            const displayName = u.username || "Unknown";
                            const role = u.role || "user";

                            return (
                                <div
                                    key={u.socketId || u.id || displayName}
                                    className="flex flex-col items-center text-center"
                                >
                                    <UserAvatarStatus
                                        user={{
                                            name: displayName,
                                            status: u.status || "online",
                                            avatarUrl: u.avatarUrl || "",
                                            color: pickColorByRole(role),
                                        }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin_Report;