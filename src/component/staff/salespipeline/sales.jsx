import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
    FileText,
    FileSignature,
    UserCheck,
    Sparkles,
    CalendarCheck,
    PlusCircle
} from "lucide-react";
import Select from "react-select";
import LeadForm from "./leadForm";
import HelperSalesPipeline from "./helper";
import { useSalesData } from "../../hooks/useSales";
import { ComponentLoader, MainLoader } from "../../loader";
import { Dropstyle } from "../../../data/data";
import { ErrorPage } from "../../../error";
import { SmallModal } from "./modal";
import { Consultant_sales } from "./otherUsers/consultant/consultant";
import { useAuth } from "../../hooks/useAuth"; // Added useAuth import

// Clean, modern typography
const fontLight = { fontFamily: "'Roboto Slab', serif", fontWeight: 700 };
const fontBold = { fontFamily: "'Roboto Slab', serif", fontWeight: 700 };

export const STAGES = [
    { title: "Meeting", name: "Meeting", icon: CalendarCheck, step: 1 },
    { title: "Send Proposal (Email/WhatsApp/Call)", name: "Proposal", icon: FileText, step: 2 },
    { title: "Send Contract & Follow-up", name: "Contract", icon: FileSignature, step: 3 },
    { title: "Scheduling", name: "Scheduling", icon: UserCheck, step: 4 },
];

export const SalesPipeline = () => {
    const [showLeadForm, setShowLeadForm] = useState(false);
    const [isStage, setStage] = useState(false);

    const [selectedId, setSelectedId] = useState({
        activeStage: "",
        stageId: "",
        stageNumber: "",
        mainID: ""
    });
    const [filterValue, setFilterValue] = useState(null);

    const { data: salesData, isLoading: isSalesLoading, error } = useSalesData();
    const { data = [] } = salesData || {};

    // --- Auth hook integration ---
    const getSessionUser = useMemo(() => {
        try {
            const stored = sessionStorage.getItem('user');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    }, []);
    
    const currentUser = getSessionUser;
    const { MewithID } = useAuth(currentUser?.id);
    
    const userDetails = MewithID?.data || {};
    const jobRole = userDetails?.jobRole?.trim().toLowerCase();

    // Derived loading state (true if either sales data or user data is loading)
    const isPageLoading = isSalesLoading || MewithID?.isLoading;
    // -----------------------------

    console.log('Current Job Role:', jobRole);

    const organizations = useMemo(() => {
        return data.map(item => ({
            ...(item.organizationDetails?.[0] || {}),
            ...(item.leadDetails?.[0] || {}),
            _id: item._id,
            salesId: item._id,
        }));
    }, [data]);

    const stagesData = useMemo(() => {
        const grouped = {};
        data.forEach(item => {
            item?.details?.forEach(detail => {
                Object.entries(detail?.stages || {}).forEach(([stageKey, stageItems]) => {
                    if (!grouped[stageKey]) grouped[stageKey] = [];
                    grouped[stageKey].push(...stageItems);
                });
            });
        });
        return grouped;
    }, [data]);

    const companyOptions = useMemo(() => [
        { label: "All Companies", value: "All" },
        ...organizations.map(org => ({
            label: org.organizationName || "Unnamed Company",
            value: org.organizationName,
        }))
    ], [organizations]);

    const filteredOrganizations = useMemo(() => {
        if (!filterValue || filterValue.value === "All") {
            return organizations;
        }
        return organizations.filter(org => org.organizationName === filterValue.value);
    }, [organizations, filterValue]);

    const handleFilterChange = useCallback((selectedOption) => {
        setFilterValue(selectedOption);
    }, []);

    const handleCardClick = useCallback((activeStage, stageId, stageNumber, mainID) => {
        setSelectedId({ activeStage, stageId, stageNumber, mainID });
        setStage(true);
    }, []);

    const handleCloseLeadForm = useCallback(() => setShowLeadForm(false), []);
    const handleOpenLeadForm = useCallback(() => setShowLeadForm(true), []);

    if (error?.code === "ERR_NETWORK") {
        return <ErrorPage />;
    }

    return (
        <>
            {isPageLoading && (
                <div className="fixed inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-50">
                    <MainLoader />
                </div>
            )}

            {jobRole === "consultant" && (
                <div className="flex items-center justify-center min-h-[80vh] bg-white w-full">
                    <Consultant_sales />
                </div>
            )}

            {jobRole === "sales" && (
                <div className="min-h-screen bg-white text-slate-800 antialiased" style={fontLight}>
                    <div className="max-w-[1800px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col">

                        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm shrink-0">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="p-1.5 bg-blue-50 rounded-lg">
                                        <Sparkles className="text-blue-600" size={16} />
                                    </div>
                                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                                        ISO Management Portal
                                    </span>
                                </div>
                                <h1 className="text-2xl md:text-3xl text-slate-800 tracking-tight" style={fontBold}>
                                    Sales <span className="text-orange-500">Pipeline</span>
                                </h1>
                            </div>

                            <div className="w-full md:w-80">
                                <Select
                                    options={companyOptions}
                                    styles={Dropstyle('44px', '14px')}
                                    onChange={handleFilterChange}
                                    value={filterValue}
                                    placeholder="Search or filter companies..."
                                    className="w-full text-sm shadow-sm"
                                    isClearable
                                />
                            </div>
                        </header>

                        <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar items-start">
                            {STAGES.map((stage) => (
                                <StageColumn
                                    key={`stage-${stage.step}`}
                                    stage={stage}
                                    organizations={filteredOrganizations}
                                    isLoading={isSalesLoading}
                                    onCardClick={handleCardClick}
                                    onOpenLeadForm={handleOpenLeadForm}
                                />
                            ))}
                        </div>
                    </div>

                    {showLeadForm && <LeadForm onClose={handleCloseLeadForm} />}

                    <HelperSalesPipeline
                        isStage={isStage}
                        setStage={setStage}
                        _id={selectedId}
                        ID_CurrentStage={stagesData}
                    />

                    <style jsx>{`
                        .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
                        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 9999px; }
                        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                    `}</style>
                </div>
            )}
        </>
    );
};

const StageColumn = React.memo(({ stage, organizations, isLoading, onCardClick, onOpenLeadForm }) => {
    const isEven = stage.step % 2 === 0;
    
    return (
        <div className="flex flex-col min-w-[340px] w-[340px] h-fit bg-white rounded-2xl border border-slate-200 shadow-sm shrink-0">
            <div className="p-4 border-b border-slate-100 bg-white rounded-t-2xl flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3 overflow-hidden pr-2">
                    <div className={`p-2 rounded-lg shadow-sm border border-slate-100 shrink-0 ${isEven ? 'bg-blue-50' : 'bg-amber-50'}`}>
                        <stage.icon className={isEven ? 'text-blue-500' : 'text-amber-500'} size={18} />
                    </div>
                    <h2 className="text-[14px] text-slate-800 tracking-wide truncate" title={stage.title} style={fontBold}>
                        {stage.name}
                    </h2>
                </div>
                <span className="shrink-0 text-[11px] text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full font-bold">
                    {stage.step}
                </span>
            </div>

            <div className="p-3.5 flex flex-col gap-3.5">
                {stage.step === 1 && (
                    <motion.button
                        onClick={onOpenLeadForm}
                        whileTap={{ scale: 0.97, opacity: 0.75 }}
                        className="w-full py-3.5 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-400 bg-white hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-all duration-200 group shadow-sm"
                        aria-label="Add new lead entry"
                    >
                        <PlusCircle size={18} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[13px]" style={fontBold}>Add New Lead</span>
                    </motion.button>
                )}

                {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                        <ComponentLoader />
                    </div>
                ) : (
                    <div className="flex flex-col gap-3.5">
                        {organizations.map((org, idx) => (
                            <OrganizationCard
                                key={`${stage.step}-${org._id || idx}`}
                                org={org}
                                idx={idx}
                                stage={stage}
                                onCardClick={onCardClick}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});
StageColumn.displayName = 'StageColumn';

const OrganizationCard = React.memo(({ org, idx, stage, onCardClick }) => {
    const handleClick = useCallback(() => {
        if (stage.step === 1) {
            onCardClick(1, org._id, 1, org._id);
        } else {
            onCardClick(stage.step, 2, stage.step, org._id);
        }
    }, [stage, org._id, onCardClick]);

    return (
        <motion.div
            className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-blue-400 hover:ring-1 hover:ring-blue-400 transition-all duration-200 cursor-pointer overflow-hidden group relative"
            onClick={handleClick}
            whileTap={{ scale: 0.97, opacity: 0.75 }}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleClick();
            }}
        >
            <div className="p-1 group-hover:bg-blue-50/10 transition-colors">
                <SmallModal data={idx} org={org} />
            </div>
        </motion.div>
    );
});
OrganizationCard.displayName = 'OrganizationCard';