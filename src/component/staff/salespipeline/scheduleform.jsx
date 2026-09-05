import React, { useState } from "react";
import { Users, FileText, Search, X, ShieldCheck, Check, Sparkles, Crown } from "lucide-react";

export default function JobAssignModal({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState("team");

    // Head / Manager State (1x1 Section with 3D Avatar)
    const [eomsHead, setEomsHead] = useState({
        name: "Dr. Robert Vance",
        role: "EOMS Officer & Lead Authority",
        avatar: "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_1.png",
        checked: false,
    });

    // 6-Column Grid State with 3D Avatars for all 14 roles
    const initialColumns = [
        {
            id: "col1", name: "Audit & Compliance",
            members: [
                { id: "1a", name: "Sarah Jensen", role: "Internal Auditor", avatar: "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_2.png", checked: false },
                { id: "1b", name: "Alex Kim", role: "Compliance Officer", avatar: "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_3.png", checked: false },
            ]
        },
        {
            id: "col2", name: "Advisory & Risk",
            members: [
                { id: "2a", name: "Emily Rodriguez", role: "CRO", avatar: "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_4.png", checked: false },
                { id: "2b", name: "Michael Brown", role: "Consultant", avatar: "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_5.png", checked: false },
            ]
        },
        {
            id: "col3", name: "Admin & Control",
            members: [
                { id: "3a", name: "David Chen", role: "Document Controller", avatar: "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_6.png", checked: false },
                { id: "3b", name: "Rachel Adams", role: "Administrative Officer", avatar: "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_7.png", checked: false },
                { id: "3c", name: "Jessica Lee", role: "EOMS Assistant", avatar: "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_8.png", checked: false },
            ]
        },
        {
            id: "col4", name: "Coordination",
            members: [
                { id: "4a", name: "Tom Hardy", role: "Training Coordinator", avatar: "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_9.png", checked: false },
                { id: "4b", name: "Nina Patel", role: "Process Coordinator", avatar: "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_10.png", checked: false },
                { id: "4c", name: "Sam Smith", role: "Project Coordinator", avatar: "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_11.png", checked: false },
            ]
        },
        {
            id: "col5", name: "Management & Quality",
            members: [
                { id: "5a", name: "Liam Smith", role: "Management Representative", avatar: "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_12.png", checked: false },
                { id: "5b", name: "Emma Watson", role: "Quality Coordinator", avatar: "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_13.png", checked: false },
            ]
        },
        {
            id: "col6", name: "Support & Evaluation",
            members: [
                { id: "6a", name: "Chris Walker", role: "Client Support Officer", avatar: "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_14.png", checked: false },
                { id: "6b", name: "Olivia Jones", role: "Monitoring & Evaluation Officer", avatar: "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_15.png", checked: false },
            ]
        },
    ];

    const [columns, setColumns] = useState(initialColumns);
    const [searchQueries, setSearchQueries] = useState({});

    // ISO 21001 State
    const [isoTask, setIsoTask] = useState({
        taskName: "",
        educationalScope: "",
        learnerRequirements: "",
    });

    if (!isOpen) return null;

    const toggleEomsHead = () => {
        setEomsHead(prev => ({ ...prev, checked: !prev.checked }));
    };

    const toggleMember = (colId, memberId) => {
        setColumns(cols => cols.map(col => {
            if (col.id === colId) {
                return {
                    ...col,
                    members: col.members.map(m => m.id === memberId ? { ...m, checked: !m.checked } : m)
                };
            }
            return col;
        }));
    };

    const toggleSelectAll = (colId, isChecked) => {
        setColumns(cols => cols.map(col => {
            if (col.id === colId) {
                return {
                    ...col,
                    members: col.members.map(m => ({ ...m, checked: isChecked }))
                };
            }
            return col;
        }));
    };

    const handleSearch = (colId, value) => {
        setSearchQueries(prev => ({ ...prev, [colId]: value.toLowerCase() }));
    };

    const totalSelected = columns.reduce((acc, col) => 
        acc + col.members.filter(m => m.checked).length, 
        eomsHead.checked ? 1 : 0
    );

    // ── Luxury Amber Custom Checkbox (Zero Shadows, White Theme) ──
    const CustomCheckbox = ({ checked }) => (
        <div className={`relative flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition-all duration-200 ${
            checked 
                ? "border-amber-500 bg-amber-500 text-amber-950" 
                : "border-stone-300 bg-white group-hover:border-amber-400 group-hover:bg-amber-50/50"
        }`}>
            <Check 
                className={`h-3.5 w-3.5 text-amber-950 transition-transform duration-200 ${checked ? "scale-100 opacity-100" : "scale-0 opacity-0"}`} 
                strokeWidth={3.5} 
            />
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/30 p-4 backdrop-blur-sm">
            {/* Modal Container: 95% Width, Pure Light Theme */}
            <div className="flex h-[95vh] w-[95vw] max-w-none flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-amber-200/80 border border-stone-200">
                
                {/* ── Light Header ── */}
                <div className="flex items-center justify-between border-b border-amber-200/80 bg-gradient-to-r from-amber-50 via-amber-50/40 to-white px-6 py-3.5 text-stone-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 border border-amber-300/80">
                            <Sparkles className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-bold tracking-tight text-amber-950">
                                {activeTab === "team" ? "Executive Team Allocation" : "ISO 21001 Management Architecture"}
                            </h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-amber-100/50 hover:text-amber-800"
                    >
                        <X className="h-5 w-5" strokeWidth={2} />
                    </button>
                </div>

                {/* ── Body Layout ── */}
                <div className="flex flex-1 overflow-hidden">
                    
                    {/* ── Vertical Tabs (Light Background) ── */}
                    <aside className="flex w-16 flex-shrink-0 flex-col items-center border-r border-amber-200/60 bg-amber-50/30 py-4 gap-3 z-10">
                        <div className="group relative flex cursor-pointer justify-center">
                            <button
                                onClick={() => setActiveTab("team")}
                                className={`rounded-xl p-3 transition-all duration-200 ${
                                    activeTab === "team"
                                        ? "bg-amber-500 text-amber-950 border border-amber-400 font-bold"
                                        : "text-stone-500 hover:bg-amber-100/60 hover:text-amber-900"
                                }`}
                            >
                                <Users className="h-5 w-5" />
                            </button>
                            <span className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 rounded-md bg-stone-800 px-3 py-1.5 text-[11px] font-bold tracking-wide text-amber-300 opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap border border-amber-500/30">
                                Team Allocation
                            </span>
                        </div>

                        <div className="group relative flex cursor-pointer justify-center">
                            <button
                                onClick={() => setActiveTab("iso")}
                                className={`rounded-xl p-3 transition-all duration-200 ${
                                    activeTab === "iso"
                                        ? "bg-amber-500 text-amber-950 border border-amber-400 font-bold"
                                        : "text-stone-500 hover:bg-amber-100/60 hover:text-amber-900"
                                }`}
                            >
                                <FileText className="h-5 w-5" />
                            </button>
                            <span className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 rounded-md bg-stone-800 px-3 py-1.5 text-[11px] font-bold tracking-wide text-amber-300 opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap border border-amber-500/30">
                                ISO 21001 Configuration
                            </span>
                        </div>
                    </aside>

                    {/* ── Main Content Area ── */}
                    <main className="flex flex-1 flex-col overflow-hidden bg-white">
                        
                        {activeTab === "team" && (
                            <div className="flex flex-col flex-1 h-full">
                                
                                {/* ── 1x1 Section: EOMS Officer ── */}
                                <div className="border-b border-amber-200/80 bg-gradient-to-r from-amber-50/80 via-amber-50/20 to-white px-6 py-3.5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700 border border-amber-300/80">
                                            <Crown className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-[13px] font-extrabold uppercase tracking-wider text-amber-950">Lead Management Representative</h3>
                                                <span className="rounded bg-amber-200/70 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-amber-900 border border-amber-300">Head / 1x1</span>
                                            </div>
                                            <p className="text-[11px] font-medium text-stone-500">Assign primary managerial oversight for standard compliance.</p>
                                        </div>
                                    </div>

                                    {/* Selectable EOMS Card */}
                                    <label className={`group flex cursor-pointer items-center gap-3.5 rounded-xl border p-2 pr-5 transition-all duration-200 min-w-[340px] ${
                                        eomsHead.checked 
                                            ? 'border-amber-400 bg-amber-50 ring-1 ring-amber-400/60' 
                                            : 'border-stone-200 bg-white hover:border-amber-300 hover:bg-amber-50/30'
                                    }`}>
                                        <input type="checkbox" className="hidden" checked={eomsHead.checked} onChange={toggleEomsHead} />
                                        
                                        <div className="pl-1.5">
                                            <CustomCheckbox checked={eomsHead.checked} />
                                        </div>

                                        {/* 3D Avatar Display */}
                                        <div className="relative h-10 w-10 shrink-0 rounded-full border border-amber-300 bg-amber-100/80 overflow-hidden">
                                            <img src={eomsHead.avatar} alt={eomsHead.name} className="h-full w-full object-cover" />
                                        </div>

                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-bold text-stone-900 leading-tight">{eomsHead.name}</span>
                                            <span className="text-[11px] font-semibold text-amber-700">{eomsHead.role}</span>
                                        </div>
                                    </label>
                                </div>

                                {/* ── 6-Column Grid Area ── */}
                                <div className="grid grid-cols-6 flex-1 divide-x divide-stone-200/80 overflow-hidden bg-stone-50/20">
                                    {columns.map((col) => {
                                        const searchTerm = searchQueries[col.id] || "";
                                        const filteredMembers = col.members.filter(m => 
                                            m.name.toLowerCase().includes(searchTerm) || m.role.toLowerCase().includes(searchTerm)
                                        );
                                        const allChecked = filteredMembers.length > 0 && filteredMembers.every(m => m.checked);

                                        return (
                                            <div key={col.id} className="flex flex-col h-full bg-white">
                                                {/* Column Header */}
                                                <div className="px-3.5 py-2.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-950 bg-amber-50/40 border-b border-amber-100">
                                                    {col.name}
                                                </div>
                                                
                                                {/* Search Bar */}
                                                <div className="p-2 border-b border-stone-100 bg-stone-50/30">
                                                    <div className="relative group/search">
                                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400 group-focus-within/search:text-amber-600 transition-colors" />
                                                        <input
                                                            type="text"
                                                            placeholder={`Filter roles...`}
                                                            value={searchQueries[col.id] || ""}
                                                            onChange={(e) => handleSearch(col.id, e.target.value)}
                                                            className="w-full rounded-md border border-stone-200 bg-white py-1.5 pl-8 pr-2 text-[11px] text-stone-800 outline-none placeholder:text-stone-400 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Select All Row */}
                                                <label className="group flex cursor-pointer items-center gap-2.5 px-3 py-2 border-b border-stone-100 hover:bg-amber-50/30 transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={allChecked}
                                                        onChange={(e) => toggleSelectAll(col.id, e.target.checked)}
                                                    />
                                                    <CustomCheckbox checked={allChecked} />
                                                    <span className="text-[11px] font-bold text-stone-700">Select All</span>
                                                </label>

                                                {/* Members List with 3D Avatars */}
                                                <div className="flex-1 overflow-y-auto p-1.5 scrollbar-thin scrollbar-thumb-stone-200">
                                                    {filteredMembers.map((member) => (
                                                        <label 
                                                            key={member.id} 
                                                            className={`group flex items-center gap-2.5 px-2 py-2 cursor-pointer rounded-lg mb-1 transition-all duration-150 border ${
                                                                member.checked 
                                                                    ? 'border-amber-300 bg-amber-50/60' 
                                                                    : 'border-transparent hover:border-stone-200 hover:bg-stone-50'
                                                            }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                className="hidden"
                                                                checked={member.checked}
                                                                onChange={() => toggleMember(col.id, member.id)}
                                                            />
                                                            <CustomCheckbox checked={member.checked} />
                                                            
                                                            {/* 3D Avatar Image */}
                                                            <div className={`relative h-7 w-7 shrink-0 rounded-full border bg-amber-50 overflow-hidden transition-colors ${
                                                                member.checked ? 'border-amber-400' : 'border-stone-200 group-hover:border-amber-300'
                                                            }`}>
                                                                <img src={member.avatar} alt={member.name} className="h-full w-full object-cover" />
                                                            </div>

                                                            <div className="flex flex-col min-w-0 flex-1">
                                                                <span className={`text-[12px] font-bold truncate leading-tight ${member.checked ? 'text-amber-950' : 'text-stone-800'}`}>
                                                                    {member.name}
                                                                </span>
                                                                <span className={`text-[10px] font-semibold truncate mt-0.5 ${member.checked ? 'text-amber-700' : 'text-stone-500'}`}>
                                                                    {member.role}
                                                                </span>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {activeTab === "iso" && (
                            <div className="p-8 max-w-3xl h-full overflow-y-auto bg-stone-50/10">
                                <div className="space-y-6">
                                    <div className="border-b border-amber-200/80 pb-3">
                                        <h3 className="text-base font-extrabold text-stone-900 tracking-tight">ISO 21001 Quality Architecture</h3>
                                        <p className="text-[12px] text-stone-500 mt-1">Configure operational parameters and educational organization requirements.</p>
                                    </div>
                                    
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-extrabold text-amber-950 uppercase tracking-wider">Educational Task Identity</label>
                                        <input
                                            type="text"
                                            value={isoTask.taskName}
                                            onChange={(e) => setIsoTask({ ...isoTask, taskName: e.target.value })}
                                            placeholder="e.g. Executive Curriculum Audit"
                                            className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-[12px] outline-none transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                        />
                                    </div>
                                    
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-extrabold text-amber-950 uppercase tracking-wider">Scope of Educational Product/Service</label>
                                        <input
                                            type="text"
                                            value={isoTask.educationalScope}
                                            onChange={(e) => setIsoTask({ ...isoTask, educationalScope: e.target.value })}
                                            placeholder="Specify departments or target learner groups..."
                                            className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-[12px] outline-none transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                        />
                                    </div>
                                    
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-extrabold text-amber-950 uppercase tracking-wider">Learner Requirements & Adjustments</label>
                                        <textarea
                                            rows={5}
                                            value={isoTask.learnerRequirements}
                                            onChange={(e) => setIsoTask({ ...isoTask, learnerRequirements: e.target.value })}
                                            placeholder="Detail accessibility needs, resource allocations, and compliance parameters..."
                                            className="w-full resize-none rounded-lg border border-stone-300 bg-white px-4 py-3 text-[12px] outline-none transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-500 leading-relaxed"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>

                {/* ── Light Footer ── */}
                <div className="flex items-center justify-between border-t border-amber-200/80 bg-amber-50/40 px-6 py-3 text-stone-800">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500 text-[11px] font-extrabold text-amber-950 border border-amber-400">
                            {totalSelected}
                        </div>
                        <span className="text-[12px] font-bold text-stone-700">
                            Personnel assigned to active workspace.
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="rounded-lg border border-stone-300 bg-white px-5 py-2 text-[12px] font-bold text-stone-700 transition-colors hover:bg-stone-100"
                        >
                            Cancel
                        </button>
                        <button
                            className="rounded-lg bg-amber-500 border border-amber-400 px-6 py-2 text-[12px] font-extrabold text-amber-950 transition-all hover:bg-amber-400"
                        >
                            Confirm Allocation
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}