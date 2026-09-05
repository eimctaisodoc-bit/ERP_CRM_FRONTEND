import React from "react";
import { Building2, MapPin, FileText, Users, Phone, CalendarDays, BarChart3, BadgeInfo } from "lucide-react";

// Inline Style Objects for Roboto Slab
const fontLight = { fontFamily: "'Roboto Slab', serif", fontWeight: 300 };
const fontBold = { fontFamily: "'Roboto Slab', serif", fontWeight: 700 };

export const SmallModal = ({ data, onClick, isdata = true, stageID, org, leadDetails }) => {
    if (!isdata || !org) return null;

    const {
        _id,
        salesId,
        organizationName,
        organizationType,
        industyType,
        registrationNumber,
        vatPan,
        address,
        totalEmp_learners,
        totalEducator,
        contactPersonName,
        role,
        contactPersonNumber,
        contactPersonEmail,
        ProductInterested,
        branch,
        province,
        campaignName,
        leadChannel,
        leadSource,
        leadType,
        salesManager,
        createdAt,
        updatedAt,
    } = org;

    const progress = 49;

    const statusColor =
        leadType === "hot_lead"
            ? "bg-rose-50 text-rose-600 border-rose-200"
            : leadType === "warm_lead"
                ? "bg-amber-50 text-amber-600 border-amber-200"
                : "bg-emerald-50 text-emerald-600 border-emerald-200";

    const statusText =
        leadType === "hot_lead"
            ? "High Priority"
            : leadType === "warm_lead"
                ? "Medium Priority"
                : "Active";

    const formatLabel = (value) => {
        if (!value) return "N/A";
        return value
            .toString()
            .replaceAll("_", " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const formatDate = (dateValue) => {
        if (!dateValue) return "Apr 17, 2026";
        const date = new Date(dateValue);
        if (Number.isNaN(date.getTime())) return "Apr 17, 2026";
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <div
            onClick={onClick}
            className="group relative flex flex-col p-4 bg-white w-full max-w-md transition-all duration-200"
        >
            {/* Header Section */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3 items-center">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 group-hover:scale-105 transition-transform">
                        <Building2 size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span 
                            className="text-[10px] text-amber-600 uppercase tracking-widest mb-0.5"
                            style={fontBold}
                        >
                            Project Entity
                        </span>
                        <h4 
                            className="text-[15px] text-slate-800 leading-tight"
                            style={fontBold}
                        >
                            {organizationName || "General Organization"}
                        </h4>
                    </div>
                </div>

                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border ${statusColor}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    <span className="text-[9px] uppercase tracking-wider" style={fontBold}>
                        {statusText}
                    </span>
                </div>
            </div>

            {/* Tags & Location */}
            <div className="flex flex-col gap-2 mb-4">
                <div className="flex flex-wrap gap-1.5">
                    <span 
                        className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200"
                        style={fontLight}
                    >
                        {formatLabel(organizationType)}
                    </span>
                    <span 
                        className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200"
                        style={fontLight}
                    >
                        {formatLabel(branch)}
                    </span>
                </div>
                
                <div className="flex items-start gap-2 mt-1">
                    <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                    <p className="text-[12px] text-slate-600 leading-snug" style={fontLight}>
                        {address || "Location not provided"}
                    </p>
                </div>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-slate-100 mb-4"></div>

            {/* Meta Information Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Contact Box */}
                <div className="flex flex-col gap-1 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider" style={fontBold}>
                        Primary Contact
                    </span>
                    <div className="flex items-center gap-1.5 text-slate-700">
                        <Users size={12} className="text-amber-500" />
                        <span className="text-[11px] truncate" style={fontBold}>
                            {contactPersonName || "N/A"}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                        <Phone size={12} className="text-amber-500" />
                        <span className="text-[11px]" style={fontLight}>
                            {contactPersonNumber || "N/A"}
                        </span>
                    </div>
                </div>

                {/* Lead Details Box */}
                <div className="flex flex-col gap-1 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider" style={fontBold}>
                        Lead Details
                    </span>
                    <div className="flex items-center gap-1.5 text-slate-700">
                        <BadgeInfo size={12} className="text-amber-500" />
                        <span className="text-[11px] truncate" style={fontBold}>
                            {formatLabel(leadSource)}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                        <span className="w-3 text-center text-amber-500" style={fontBold}>@</span>
                        <span className="text-[11px] truncate" style={fontLight}>
                            {formatLabel(leadChannel)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Products/Services */}
            <div className="mb-5">
                <div className="flex items-center gap-1.5 mb-2">
                    <FileText size={12} className="text-slate-400" />
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider" style={fontBold}>
                        Service Standard
                    </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {Array.isArray(ProductInterested) && ProductInterested.length > 0 ? (
                        ProductInterested.map((item, index) => (
                            <span
                                key={index}
                                className="flex items-center gap-1.5 rounded border border-slate-200 bg-white px-2 py-1 text-[10px] text-slate-700 shadow-sm"
                                style={fontBold}
                            >
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                {item}
                            </span>
                        ))
                    ) : (
                        <span className="text-[11px] text-slate-400 italic" style={fontLight}>
                            No products selected
                        </span>
                    )}
                </div>
            </div>

            {/* Footer / Progress */}
            <div className="mt-auto pt-3 border-t border-slate-100">
                <div className="flex justify-between items-end mb-2">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-slate-400">
                            <CalendarDays size={12} />
                            <span className="text-[9px] uppercase tracking-wider" style={fontBold}>Created</span>
                        </div>
                        <span className="text-[11px] text-slate-700" style={fontLight}>
                            {data || formatDate(createdAt)}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <BarChart3 size={14} className="text-amber-500" />
                        <span className="text-[11px] text-slate-800" style={fontBold}>
                            {progress}% Complete
                        </span>
                    </div>
                </div>

                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-amber-400 transition-all duration-700"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
};