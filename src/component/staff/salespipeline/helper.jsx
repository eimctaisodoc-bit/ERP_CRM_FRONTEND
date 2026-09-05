import React, { useState, useMemo, memo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Building2, User } from "lucide-react";

import { STAGES } from "./sales";
// import Overview from "./innerHelper/Stage1/overview";
import { useSalesData } from "../../hooks/useSales";
// import { Task } from "./innerHelper/Stage1/task";
// import { Forms_1 } from "./innerHelper/Stage1/forms";
// import { Activities } from "./innerHelper/Stage1/activities";

// import { PMeeting } from "./innerHelper/Stage3/task";
// import { VMeeting } from "./innerHelper/Stage2/task";
// import { ProposalTask } from "./innerHelper/stage4/task";
// import { Contract } from "./innerHelper/stage5/task";
// import { ContractForms } from "./innerHelper/stage5/forms";
// import { ClientScheduleCalendar } from "./innerHelper/stage7/task";
// import { SchedulingForms } from "./innerHelper/stage7/forms";
// import { Form_2 } from "./innerHelper/Stage2/forms";
// import { Form_3 } from "./innerHelper/Stage3/forms";
// import { Form_4 } from "./innerHelper/stage4/forms";

import { Schedule } from "./schedule";
import P_Meeting from "./testD";
import Proposal from "./testP";
import TestContract from "./testPR";
import V_Meeting from "./testV";

import DownloadTestFront from "./innerHelper/stage5/DownloadTestFrom";
// import {BuildSlaDocx} from '../salespipeline/innerHelper/stage5/testFront.jsx'



// Inline Style Objects for Roboto Slab
const fontLight = { fontFamily: "'Roboto Slab', serif", fontWeight: 700 };
const fontBold = { fontFamily: "'Roboto Slab', serif", fontWeight: 700 };

/* ---------------- Background Style ---------------- */
// Lightened the grid to keep the white theme clean
const gridBgStyle = {
    backgroundImage: `
    linear-gradient(45deg, transparent 49%, #f1f5f9 49%, #f1f5f9 51%, transparent 51%),
    linear-gradient(-45deg, transparent 49%, #f1f5f9 49%, #f1f5f9 51%, transparent 51%)
  `,
    backgroundSize: "40px 40px",
    WebkitMaskImage: "radial-gradient(ellipse 100% 80% at 50% 100%, #000 30%, transparent 90%)",
    maskImage: "radial-gradient(ellipse 100% 80% at 50% 100%, #000 30%, transparent 90%)",
};

/* ---------------- Button Component ---------------- */
const StageButton = memo(({ icon: Icon, title, isActive, onClick, disabled }) => {
    return (
        <motion.button
            onClick={onClick}
            disabled={disabled}
            whileTap={!disabled ? { scale: 0.97, opacity: 0.75 } : undefined}
            className={`
                flex items-center gap-3 w-full p-3 rounded-xl border text-left transition-all duration-200
                ${isActive
                    ? "bg-amber-50 border-amber-400 shadow-sm"
                    : "bg-white border-slate-200"}
                ${disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer hover:border-amber-300 hover:shadow-sm"}
            `}
        >
            <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? "bg-amber-200/50 text-amber-700" : "bg-slate-50 border border-slate-100 text-slate-500"}`}>
                <Icon size={16} />
            </div>
            <span
                className={`truncate text-[13px] ${isActive ? "text-amber-800" : "text-slate-600"}`}
                style={fontBold}
            >
                {title}
            </span>
        </motion.button>
    );
});
StageButton.displayName = "StageButton";


const HelperSalesPipeline = ({ isStage, setStage, _id, ID_CurrentStage }) => {
    const { data: salesData } = useSalesData();

    const [activeTab, setActiveTab] = useState("Overview");
    const [showSchedule, setShowSchedule] = useState(true);
    const [leadState, setLeadState] = useState({
        isActive: false,
        step: null,
        name: "",
    });

    const step_id = useMemo(() => {
        const stageKey = `Stage${_id?.s}`;
        return ID_CurrentStage?.[stageKey] || [];
    }, [_id?.s, ID_CurrentStage]);

    const { leadInfo, organization } = useMemo(() => {
        const data = salesData?.data;
        const mainID = _id?.mainID;

        if (!data || !mainID) {
            return { leadInfo: null, organization: null };
        }

        const item = data.find((item) => item._id?.toString().trim() === mainID.toString().trim());

        return {
            leadInfo: item?.leadDetails || null,
            organization: item?.organizationDetails || null,
        };
    }, [salesData?.data, _id?.mainID]);

    const organizationName = organization?.[0]?.organizationName || "Organization Name";
    const contactPersonName = organization?.[0]?.contactPersonName || "Contact Person";

    const handleLeadUpdate = (newData) => {
        setLeadState((prev) => ({ ...prev, ...newData }));
    };

    if (!isStage) return null;

    const renderStageButtons = () => {
        const currentStep = step_id?.[0]?.currentStage;

        return STAGES.map((pill) => {
            const isActive = pill.step === currentStep;
            return (
                <StageButton
                    key={pill.step}
                    icon={pill.icon}
                    title={pill.title}
                    isActive={isActive}
                    disabled={!isActive}
                    onClick={() => console.log("Navigating to step:", pill.step)}
                />
            );
        });
    };
    console.log(_id, "ID in HelperSalesPipeline");

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                style={fontLight}
                className="fixed inset-0 z-50 flex items-center
                 justify-center bg-slate-900/40 p-3 backdrop-blur-sm"
            >
               
                {
                    _id?.activeStage === 1 && (<V_Meeting id={_id} setStage={setStage} />)

                }
                {

                    _id?.activeStage === 2 && (<Proposal id={_id} setStage={setStage} />)
                }
                {

                    _id?.activeStage === 3 && (<TestContract id={_id} setStage={setStage} />)
                }

                {/* <DownloadTestFront/> */}
                {/* mark to display */}

                {/* <P_Meeting id={_id} setStage={setStage} /> */}

                {/* mark to dispaly */}

                {/* mark to display */}

                {/* Schedule Modal Variant */}
                {_id?.activeStage === 4 && showSchedule && (
                    <div className="relative h-[95vh] w-full max-full overflow-y-auto   [scrollbar-width:none]
        [-ms-overflow-style:none]
        [&::-webkit-scrollbar]:hidden rounded-2xl bg-white 
                    shadow-2xl border border-slate-200">
                        <Schedule onClose={() => setStage(false)} />
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default HelperSalesPipeline;