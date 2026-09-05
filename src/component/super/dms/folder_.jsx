import React, { useState, useMemo, useEffect } from "react";
import {
    Search, Trash2, Folder, FileText, FileBox, Image as ImageIcon,
    ChevronRight, ChevronDown, Upload, FolderOpen, Share2, FileSpreadsheet, HardDrive,
    Check, ArrowLeft, Plus, X, MessageSquare, RefreshCw, Users, Download, UploadCloud, Filter
} from "lucide-react";

// Professional Typography Theme
const fontLight = { fontFamily: "'Roboto Slab', serif", fontWeight: 300 };
const fontBold = { fontFamily: "'Roboto Slab', serif", fontWeight: 700 };

// Current System Date Reference
const CURRENT_DATE = new Date("2026-06-20T17:15:22+05:45");

// Mock Users for Share Dialog
const MOCK_USERS = [
    { id: "u1", name: "Om Prakash Prasai", role: "Operation Manager" },
    { id: "u2", name: "Prajwal Giri", role: "Software Developer" },
    { id: "u3", name: "Sarthak Kharel", role: "Client / Student" },
    { id: "u4", name: "Shailendra Kumar Kharel", role: "Lead Auditor" }
];

const getDiffDays = (dateString) => {
    const createdDate = new Date(dateString);
    const diffTime = Math.abs(CURRENT_DATE - createdDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const calculateDaysAgo = (dateString) => {
    const diffDays = getDiffDays(dateString);
    return diffDays === 0 ? "Today" : `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
};

// --- Main Application Component ---

export const Su_Folder_ = () => {
    // 1. Initial State - Strictly Admin, Clients, Staff, You
    const INITIAL_SYSTEM = [
        { id: "dir-admin", name: "Admin", type: "folder", parentId: null, description: "Administrative documents", createdBy: "System", createdAt: "2026-01-15", color: { border: "border-orange-200", bgProgress: "bg-orange-500", text: "text-orange-500", bg: "bg-orange-50" }, progress: 45, mockSize: "12 GB" },
        { id: "dir-clients", name: "Clients", type: "folder", parentId: null, description: "Client deliverables", createdBy: "System", createdAt: "2026-03-05", color: { border: "border-blue-200", bgProgress: "bg-blue-500", text: "text-blue-500", bg: "bg-blue-50" }, progress: 25, mockSize: "8 GB" },
        { id: "dir-staff", name: "Staff", type: "folder", parentId: null, description: "Internal staff files", createdBy: "System", createdAt: "2026-02-10", color: { border: "border-amber-200", bgProgress: "bg-amber-500", text: "text-amber-500", bg: "bg-amber-50" }, progress: 80, mockSize: "45 GB" },
        { id: "dir-you", name: "You (Admin)", type: "folder", parentId: null, description: "Your private directory", createdBy: "System", createdAt: "2026-06-01", color: { border: "border-slate-200", bgProgress: "bg-slate-700", text: "text-slate-700", bg: "bg-slate-50" }, progress: 15, mockSize: "2 GB" },
        
        { id: "f1", name: "Q1_Financial_Report.pdf", type: "file", fileType: "pdf", size: "4.2 MB", parentId: "dir-admin", description: "First quarter financial summary", createdBy: "Om Prakash Prasai", createdAt: "2026-06-19" },
        { id: "f2", name: "Employee_Roster_2026.xlsx", type: "file", fileType: "excel", size: "800 KB", parentId: "dir-staff", description: "Updated internal staff assignments", createdBy: "Prajwal Giri", createdAt: "2026-06-18" },
        { id: "f5", name: "Client_Pitch_Deck.pdf", type: "file", fileType: "pdf", size: "15 MB", parentId: "dir-clients", description: "Standard ISO certification pitch deck", createdBy: "Shailendra Kumar Kharel", createdAt: "2026-06-15" },
        { id: "f7", name: "Application_Form_CVL433.pdf", type: "file", fileType: "pdf", size: "2.3 MB", parentId: "dir-clients", description: "On-demand examination form", createdBy: "Sarthak Kharel", createdAt: "2026-05-10" },
        
        { id: "dir-nested-1", name: "Q2 Reports", type: "folder", parentId: "dir-admin", description: "Q2 Data", createdBy: "System", createdAt: "2026-06-19", color: { border: "border-orange-200", bgProgress: "bg-orange-500", text: "text-orange-500", bg: "bg-orange-50" }, progress: 10, mockSize: "1 GB" }
    ];

    const [fileSystem, setFileSystem] = useState(INITIAL_SYSTEM);
    const [currentPath, setCurrentPath] = useState([]); 
    const [searchQuery, setSearchQuery] = useState("");
    const [dateFilter, setDateFilter] = useState("all"); // 'all', 0, 7, 15, 45
    const [selectedIds, setSelectedIds] = useState([]);
    const [expandedItemId, setExpandedItemId] = useState(null); 
    
    // Modals & Forms State
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    
    // DnD and Upload State
    const [isDragging, setIsDragging] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadDescription, setUploadDescription] = useState("");
    const [folderData, setFolderData] = useState({ name: "", description: "" });
    
    // Action States
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [feedbackText, setFeedbackText] = useState("");
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [shareSelection, setShareSelection] = useState([]);

    const currentFolderId = currentPath.length > 0 ? currentPath[currentPath.length - 1].id : null;
    const isRoot = currentPath.length === 0;

    // Body Overflow Effect to prevent scrolling when modal is open
    useEffect(() => {
        if (isCreateFolderOpen || isUploadOpen || isShareModalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => { document.body.style.overflow = "unset"; };
    }, [isCreateFolderOpen, isUploadOpen, isShareModalOpen]);
    
    const activeItems = useMemo(() => {
        let items = fileSystem.filter(item => item.parentId === currentFolderId);
        
        // Search Filter
        if (searchQuery.trim()) {
            items = items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        // Date Filter
        if (dateFilter !== "all") {
            const maxDays = parseInt(dateFilter, 10);
            items = items.filter(item => getDiffDays(item.createdAt) <= maxDays);
        }

        return items.sort((a, b) => a.name.localeCompare(b.name));
    }, [fileSystem, currentFolderId, searchQuery, dateFilter]);

    const activeFolders = activeItems.filter(item => item.type === "folder");
    const activeFiles = activeItems.filter(item => item.type === "file");
    const rootDirectories = fileSystem.filter(item => item.parentId === null);

    // --- Actions & Handlers ---

    const handleNavigate = (id, name) => {
        setCurrentPath(prev => [...prev, { id, name }]);
        setSelectedIds([]);
        setSearchQuery("");
        setExpandedItemId(null);
        setDateFilter("all"); // Reset filter on navigation
    };

    const handleNavigateUp = () => {
        setCurrentPath(prev => prev.slice(0, -1));
        setSelectedIds([]);
        setExpandedItemId(null);
        setDateFilter("all");
    };

    const handleBreadcrumbClick = (index) => {
        setCurrentPath(prev => prev.slice(0, index + 1));
        setSelectedIds([]);
        setExpandedItemId(null);
        setDateFilter("all");
    };

    const toggleSelect = (id, e) => {
        e.stopPropagation();
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const toggleAccordion = (id) => {
        setExpandedItemId(prev => (prev === id ? null : id));
        setIsFeedbackOpen(false); 
    };

    const handleCreateFolder = () => {
        if (!folderData.name || isRoot) return;
        const newFolder = {
            id: `folder-${Date.now()}`,
            name: folderData.name,
            description: folderData.description,
            type: "folder",
            parentId: currentFolderId,
            createdBy: "Current User",
            createdAt: CURRENT_DATE.toISOString(),
            color: { border: "border-amber-200", bgProgress: "bg-amber-500", text: "text-amber-500", bg: "bg-amber-50" },
            progress: 0,
            mockSize: "0 KB"
        };
        setFileSystem([...fileSystem, newFolder]);
        setIsCreateFolderOpen(false);
        setFolderData({ name: "", description: "" });
    };

    const handleUploadSubmit = () => {
        if (!uploadFile || isRoot) return;
        
        const fileName = uploadFile.name.toLowerCase();
        let fileType = "doc";
        if (fileName.endsWith('.pdf')) fileType = "pdf";
        if (fileName.endsWith('.xlsx') || fileName.endsWith('.csv')) fileType = "excel";
        if (fileName.match(/\.(jpeg|jpg|gif|png)$/)) fileType = "image";

        const sizeInMB = (uploadFile.size / (1024 * 1024)).toFixed(2);
        const sizeStr = sizeInMB > 1 ? `${sizeInMB} MB` : `${(uploadFile.size / 1024).toFixed(0)} KB`;

        const newFile = {
            id: `file-${Date.now()}`,
            name: uploadFile.name,
            description: uploadDescription,
            type: "file",
            fileType: fileType,
            size: sizeStr,
            parentId: currentFolderId,
            createdBy: "Current User",
            createdAt: CURRENT_DATE.toISOString()
        };
        
        setFileSystem([...fileSystem, newFile]);
        setIsUploadOpen(false);
        setUploadFile(null);
        setUploadDescription("");
    };

    // Drag and Drop Handlers
    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setUploadFile(e.dataTransfer.files[0]);
        }
    };

    const handleDeleteSelected = () => {
        if (selectedIds.length === 0) return;
        if (window.confirm(`Delete ${selectedIds.length} item(s)?`)) {
            setFileSystem(prev => prev.filter(item => !selectedIds.includes(item.id) && !selectedIds.includes(item.parentId)));
            setSelectedIds([]);
            setExpandedItemId(null);
        }
    };

    const handleDeleteSpecific = (id) => {
        setFileSystem(prev => prev.filter(item => item.id !== id && item.parentId !== id));
        if (expandedItemId === id) setExpandedItemId(null);
        setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    };

    const handleReplace = (id, newFile) => {
        if (!newFile) return;
        const sizeInMB = (newFile.size / (1024 * 1024)).toFixed(2);
        const sizeStr = sizeInMB > 1 ? `${sizeInMB} MB` : `${(newFile.size / 1024).toFixed(0)} KB`;

        setFileSystem(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, createdAt: CURRENT_DATE.toISOString(), name: newFile.name, size: sizeStr };
            }
            return item;
        }));
    };

    const handleDownload = (file) => {
        // Mock download action
        alert(`Downloading file: ${file.name}\nSize: ${file.size}`);
    };

    const handleSendFeedback = () => {
        if (!feedbackText) return;
        alert(`Feedback submitted successfully!`);
        setFeedbackText("");
        setIsFeedbackOpen(false);
    };

    const handleShareSubmit = () => {
        if (shareSelection.length === 0) return;
        alert(`Successfully shared with ${shareSelection.length} user(s).`);
        setIsShareModalOpen(false);
        setShareSelection([]);
    };

    // --- Display Components ---

    const DirectoryStatCard = ({ folder }) => {
        const childCount = fileSystem.filter(item => item.parentId === folder.id).length;
        return (
            <div 
                onClick={() => handleNavigate(folder.id, folder.name)}
                className="p-6 rounded-xl border border-slate-200 flex flex-col gap-4 w-full transition-all duration-300 bg-white hover:shadow-xl hover:-translate-y-1 hover:border-blue-300 cursor-pointer group"
            >
                <div className="flex justify-between items-start">
                    <div className={`w-14 h-14 rounded-xl bg-white p-2 border flex items-center justify-center ${folder.color.border} ${folder.color.text} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                        <Folder size={28} fill="currentColor" className="opacity-10 absolute" />
                        <Folder size={28} className="relative z-10" />
                    </div>
                    <span className="text-xs px-3 py-1 bg-slate-50 text-slate-500 rounded-full border border-slate-200 font-medium tracking-wide">
                        {folder.progress}% Utilization
                    </span>
                </div>
                <div className="mt-2">
                    <h3 style={fontBold} className="text-slate-900 text-lg uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                        {folder.name}
                    </h3>
                    <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden shadow-inner">
                        <div className={`h-full ${folder.color.bgProgress} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${folder.progress}%` }} />
                    </div>
                </div>
                <div className="flex justify-between items-center text-[11px] uppercase tracking-widest text-slate-400 mt-2" style={fontBold}>
                    <span>{childCount} Attached Items</span>
                    <span className="text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-100">{folder.mockSize}</span>
                </div>
            </div>
        );
    };

    const FolderGridCard = ({ folder }) => {
        const isSelected = selectedIds.includes(folder.id);
        const childCount = fileSystem.filter(item => item.parentId === folder.id).length;

        return (
            <div 
                onClick={() => handleNavigate(folder.id, folder.name)}
                className={`bg-white border p-6 rounded-xl relative flex flex-col items-center justify-center gap-4 transition-all duration-300 group cursor-pointer h-44 shadow-sm
                ${isSelected ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20" : "border-slate-200 hover:border-amber-400 hover:shadow-lg hover:-translate-y-1"}`}
            >
                <div 
                    onClick={(e) => toggleSelect(folder.id, e)}
                    className={`absolute top-4 left-4 w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-all z-10 shadow-sm
                    ${isSelected ? "bg-blue-500 border-blue-500" : "bg-white border-slate-300 opacity-0 group-hover:opacity-100"}`}
                >
                    {isSelected && <Check size={14} className="text-white" />}
                </div>

                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-white to-amber-50 border border-amber-200 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Folder size={32} className="fill-amber-100 text-amber-500" />
                </div>
                <div className="text-center w-full px-1">
                    <p style={fontBold} className="text-slate-800 text-[15px] truncate group-hover:text-amber-600 transition-colors" title={folder.name}>{folder.name}</p>
                    <p className="text-slate-400 text-[11px] uppercase tracking-widest mt-1.5" style={fontBold}>
                        {childCount} Items
                    </p>
                </div>
            </div>
        );
    };

    const FileAccordionItem = ({ file }) => {
        const isSelected = selectedIds.includes(file.id);
        const isExpanded = expandedItemId === file.id;

        const getStyles = () => {
            switch (file.fileType) {
                case "pdf": return { icon: <FileBox size={22} className="text-orange-500" />, bg: "from-white to-orange-50/50", border: "border-orange-100" };
                case "excel": return { icon: <FileSpreadsheet size={22} className="text-blue-500" />, bg: "from-white to-blue-50/50", border: "border-blue-100" };
                case "image": return { icon: <ImageIcon size={22} className="text-amber-500" />, bg: "from-white to-amber-50/50", border: "border-amber-100" };
                default: return { icon: <FileText size={22} className="text-slate-500" />, bg: "from-white to-slate-50", border: "border-slate-100" };
            }
        };
        const styles = getStyles();

        return (
            <div className={`bg-white border rounded-xl mb-3 shadow-sm transition-all duration-300 overflow-hidden
                ${isSelected ? "border-blue-500 ring-1 ring-blue-500/30" : "border-slate-200 hover:border-blue-300 hover:shadow-md"}`}
            >
                {/* Main Row */}
                <div onClick={() => toggleAccordion(file.id)} className="p-4 sm:p-5 flex items-center justify-between cursor-pointer group hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4 flex-1 overflow-hidden">
                        <div 
                            onClick={(e) => toggleSelect(file.id, e)}
                            className={`w-5 h-5 rounded border shadow-sm flex items-center justify-center shrink-0 transition-all z-10 cursor-pointer
                            ${isSelected ? "bg-blue-500 border-blue-500" : "bg-white border-slate-300 group-hover:border-blue-400"}`}
                        >
                            {isSelected && <Check size={14} className="text-white" />}
                        </div>

                        <div className="flex items-center gap-4 overflow-hidden">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${styles.bg} border ${styles.border} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                                {styles.icon}
                            </div>
                            <p style={fontBold} className="text-slate-800 text-[15px] truncate group-hover:text-blue-600 transition-colors" title={file.name}>
                                {file.name}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0 pl-4">
                        <span className="hidden sm:inline text-[11px] uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100" style={fontBold}>
                            {file.size}
                        </span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isExpanded ? 'bg-blue-50' : 'group-hover:bg-slate-100'}`}>
                            <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-blue-600' : 'group-hover:text-slate-700'}`} />
                        </div>
                    </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                    <div className="border-t border-slate-100 bg-gradient-to-b from-slate-50/80 to-white p-6 space-y-6 animate-in slide-in-from-top-4 fade-in duration-300 ease-out">
                        <div className="flex flex-col lg:flex-row gap-8">
                            <div className="flex-1 space-y-5">
                                <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                                    <h3 className="text-[11px] uppercase tracking-widest text-slate-400 mb-2" style={fontBold}>Description & Notes</h3>
                                    <p className="text-slate-700 text-[15px] leading-relaxed" style={fontLight}>
                                        {file.description || "No description provided."}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                                    <div>
                                        <h3 className="text-[11px] uppercase tracking-widest text-slate-400 mb-1" style={fontBold}>Uploaded By</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">{file.createdBy.charAt(0)}</div>
                                            <p className="text-slate-800 text-sm font-medium">{file.createdBy}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-[11px] uppercase tracking-widest text-slate-400 mb-1" style={fontBold}>Last Modified</h3>
                                        <p className="text-slate-800 text-sm font-medium mt-1">
                                            {new Date(file.createdAt).toLocaleDateString()} <span className="text-amber-600 text-[11px] uppercase tracking-wider ml-2 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">{calculateDaysAgo(file.createdAt)}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:w-56 flex flex-col gap-2">
                                <button onClick={() => handleDownload(file)} className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm px-4 py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-all hover:shadow" style={fontBold}>
                                    <Download size={16} /> Download
                                </button>
                                
                                <button onClick={() => setIsShareModalOpen(true)} className="w-full bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 hover:border-blue-300 px-4 py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-all shadow-sm" style={fontBold}>
                                    <Share2 size={16} /> Share File
                                </button>
                                
                                <label className="w-full bg-white hover:bg-amber-50 text-amber-700 border border-slate-200 hover:border-amber-300 px-4 py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer" style={fontBold}>
                                    <RefreshCw size={16} /> Replace File
                                    <input type="file" className="hidden" onChange={(e) => handleReplace(file.id, e.target.files[0])} />
                                </label>

                                <div className="h-px bg-slate-100 my-1"></div>

                                <button onClick={() => setIsFeedbackOpen(!isFeedbackOpen)} className="w-full bg-white hover:bg-orange-50 text-orange-700 border border-slate-200 hover:border-orange-300 px-4 py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-all shadow-sm" style={fontBold}>
                                    <MessageSquare size={16} /> Add Note
                                </button>
                                
                                <button onClick={() => handleDeleteSpecific(file.id)} className="w-full bg-white hover:bg-red-50 text-red-600 border border-slate-200 hover:border-red-300 px-4 py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-all shadow-sm" style={fontBold}>
                                    <Trash2 size={16} /> Delete
                                </button>
                            </div>
                        </div>

                        {isFeedbackOpen && (
                            <div className="pt-6 mt-6 border-t border-slate-200 animate-in fade-in slide-in-from-top-2">
                                <h3 className="text-sm text-slate-800 mb-3" style={fontBold}>Append Feedback / Note</h3>
                                <div className="bg-white p-2 rounded-lg border border-orange-200 shadow-sm focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-400 transition-all">
                                    <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)} className="w-full p-2 bg-transparent text-[15px] outline-none resize-none h-20 placeholder:text-slate-400" placeholder="Type your context or feedback here..."></textarea>
                                    <div className="flex justify-end pt-2 border-t border-slate-100">
                                        <button onClick={handleSendFeedback} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md text-sm transition-colors shadow-sm" style={fontBold}>Submit Note</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-900 pb-20 font-sans selection:bg-amber-100 selection:text-amber-900">
            <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-6 lg:space-y-8">
                
                {/* Global Header */}
                <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4 px-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                            <HardDrive size={24} />
                        </div>
                        <div>
                            <h1 style={fontBold} className="text-2xl tracking-tight text-slate-900">Enterprise Workspace</h1>
                            <p className="text-xs text-slate-500 uppercase tracking-widest mt-0.5" style={fontBold}>Secure File Management</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                        
                        {/* Filters & Search Row */}
                        <div className="flex items-center gap-3 w-full sm:w-auto bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search workspace..." style={fontLight}
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400 shadow-sm"
                                />
                            </div>
                            <div className="relative border-l border-slate-200 pl-3 flex items-center">
                                <Filter size={16} className="text-slate-400 absolute left-5" />
                                <select 
                                    value={dateFilter} 
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-lg pl-9 pr-8 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 cursor-pointer shadow-sm"
                                    style={fontBold}
                                >
                                    <option value="all">All Dates</option>
                                    <option value="0">Today</option>
                                    <option value="7">Last 7 Days</option>
                                    <option value="15">Last 15 Days</option>
                                    <option value="45">Last 45 Days</option>
                                </select>
                                <ChevronDown size={14} className="text-slate-400 absolute right-3 pointer-events-none" />
                            </div>
                        </div>

                        <button
                            onClick={handleDeleteSelected}
                            disabled={selectedIds.length === 0}
                            className={`flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm transition-all border shadow-sm ${
                                selectedIds.length > 0 
                                ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 cursor-pointer" 
                                : "bg-white text-slate-300 border-slate-100 cursor-not-allowed"
                            }`}
                            style={fontBold}
                        >
                            <Trash2 size={18} />
                            <span className="hidden sm:inline">Delete</span>
                            {selectedIds.length > 0 && <span className="ml-1 bg-red-600 text-white rounded-md px-2 py-0.5 text-xs">{selectedIds.length}</span>}
                        </button>
                    </div>
                </header>

                {/* Root View vs Nested View Layout */}
                {isRoot ? (
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {rootDirectories.map((dir) => (
                            <DirectoryStatCard key={dir.id} folder={dir} />
                        ))}
                    </section>
                ) : (
                    <section className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                        
                        {/* Sidebar strictly for Nested Directory Actions */}
                        <aside className="xl:col-span-3 space-y-4">
                            <button
                                onClick={() => setIsCreateFolderOpen(true)}
                                className="w-full flex items-center justify-center gap-3 rounded-xl px-4 py-4 text-[15px] transition-all border bg-white text-slate-800 border-slate-200 hover:border-amber-400 hover:text-amber-600 shadow-sm hover:shadow"
                                style={fontBold}
                            >
                                <Plus size={20} />
                                <span>Create Sub-Directory</span>
                            </button>

                            <div 
                                onClick={() => setIsUploadOpen(true)}
                                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm cursor-pointer hover:border-blue-400 hover:shadow-lg group transition-all duration-300 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                                <div className="border-2 border-dashed border-slate-200 group-hover:border-blue-300 rounded-xl p-8 flex flex-col items-center text-center gap-4 bg-white/50 backdrop-blur-sm transition-colors">
                                    <div className="w-14 h-14 bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-xl flex items-center justify-center shadow-sm text-blue-600 group-hover:scale-110 transition-transform duration-300">
                                        <UploadCloud size={28} />
                                    </div>
                                    <div>
                                        <p style={fontBold} className="text-slate-800 text-base group-hover:text-blue-600 transition-colors">Upload Asset</p>
                                        <p className="text-slate-500 text-xs mt-1.5" style={fontLight}>Drag & drop or click to browse</p>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        <main className="xl:col-span-9 bg-white border border-slate-200 rounded-2xl shadow-sm min-h-[600px] flex flex-col overflow-hidden">
                            {/* Breadcrumbs */}
                            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-2 bg-white">
                                <button onClick={handleNavigateUp} className="p-2 mr-2 bg-slate-50 border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 rounded-lg transition-all shadow-sm">
                                    <ArrowLeft size={16} />
                                </button>
                                
                                <button onClick={() => {setCurrentPath([]); setSelectedIds([]); setSearchQuery(""); setExpandedItemId(null); setDateFilter("all");}} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                    <HardDrive size={16} className="text-blue-500" />
                                    <span className="text-xs uppercase tracking-widest" style={fontBold}>Root</span>
                                </button>
                                
                                {currentPath.map((folder, index) => (
                                    <React.Fragment key={folder.id}>
                                        <ChevronRight size={16} className="text-slate-300" />
                                        <button onClick={() => handleBreadcrumbClick(index)} className={`hover:text-blue-600 transition-colors cursor-pointer text-sm truncate max-w-[150px] px-2 py-1 rounded-md ${index === currentPath.length - 1 ? "text-slate-900 bg-slate-50 font-bold" : "text-slate-500 hover:bg-slate-50"}`} style={index === currentPath.length - 1 ? fontBold : fontLight}>
                                            {folder.name}
                                        </button>
                                    </React.Fragment>
                                ))}
                            </div>

                            <div className="p-6 sm:p-8 flex-1 bg-slate-50/30">
                                {activeItems.length > 0 ? (
                                    <div className="flex flex-col">
                                        {activeFolders.length > 0 && (
                                            <div className="mb-10">
                                                <div className="flex items-center gap-3 mb-5">
                                                    <div className="w-1 h-5 bg-amber-400 rounded-full"></div>
                                                    <h3 className="text-[13px] uppercase tracking-widest text-slate-500" style={fontBold}>Sub-Directories</h3>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                                                    {activeFolders.map((folder) => <FolderGridCard key={folder.id} folder={folder} />)}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {activeFiles.length > 0 && (
                                            <div>
                                                <div className="flex items-center gap-3 mb-5">
                                                    <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                                                    <h3 className="text-[13px] uppercase tracking-widest text-slate-500" style={fontBold}>Document Assets</h3>
                                                </div>
                                                <div className="flex flex-col">
                                                    {activeFiles.map((file) => <FileAccordionItem key={file.id} file={file} />)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center py-24 text-center space-y-5 animate-in fade-in">
                                        <div className="w-20 h-20 bg-white border border-slate-200 text-slate-300 rounded-2xl shadow-sm flex items-center justify-center mb-2 rotate-3">
                                            {searchQuery || dateFilter !== "all" ? <Search size={32} /> : <FolderOpen size={32} />}
                                        </div>
                                        <h3 className="text-slate-700 text-xl" style={fontBold}>
                                            {searchQuery || dateFilter !== "all" ? "No matching files found" : "This directory is empty"}
                                        </h3>
                                        <p className="text-slate-500 text-[15px] max-w-sm leading-relaxed" style={fontLight}>
                                            {searchQuery || dateFilter !== "all" ? "Try adjusting your search criteria or date filters to find what you're looking for." : "Use the sidebar actions to create sub-directories or upload new document assets."}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </main>
                    </section>
                )}
            </div>

            {/* --- Beautiful Modals --- */}
            
            {/* Create Folder Modal */}
            {isCreateFolderOpen && !isRoot && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsCreateFolderOpen(false)}></div>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 relative z-10 overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                        <div className="bg-gradient-to-r from-slate-50 to-white flex justify-between items-center p-5 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Folder size={20} /></div>
                                <h2 style={fontBold} className="text-lg text-slate-800">Create Directory</h2>
                            </div>
                            <button onClick={() => setIsCreateFolderOpen(false)} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-full transition-colors"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-[11px] uppercase tracking-widest text-slate-500 mb-2" style={fontBold}>Directory Name</label>
                                <input type="text" value={folderData.name} onChange={e => setFolderData({...folderData, name: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none bg-white text-slate-800 text-[15px] transition-all shadow-sm" placeholder="e.g. Current Month Reports" autoFocus />
                            </div>
                            <div>
                                <label className="block text-[11px] uppercase tracking-widest text-slate-500 mb-2" style={fontBold}>Description / Note</label>
                                <textarea value={folderData.description} onChange={e => setFolderData({...folderData, description: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none bg-white text-slate-800 h-28 resize-none text-[15px] transition-all shadow-sm" placeholder="Purpose of this directory..."></textarea>
                            </div>
                            <div className="pt-2">
                                <button onClick={handleCreateFolder} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2" style={fontBold}>
                                    <Plus size={18} /> Create Directory
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload File Modal with Drag & Drop */}
            {isUploadOpen && !isRoot && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => {setIsUploadOpen(false); setUploadFile(null); setUploadDescription("");}}></div>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 relative z-10 overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                        <div className="bg-gradient-to-r from-slate-50 to-white flex justify-between items-center p-5 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><UploadCloud size={20} /></div>
                                <h2 style={fontBold} className="text-lg text-slate-800">Upload to {currentPath[currentPath.length - 1]?.name}</h2>
                            </div>
                            <button onClick={() => {setIsUploadOpen(false); setUploadFile(null); setUploadDescription("");}} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-full transition-colors"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            
                            {/* Drag and Drop Zone */}
                            <div className="flex flex-col items-center justify-center w-full">
                                <label 
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300
                                    ${isDragging ? "bg-blue-50 border-blue-500 ring-4 ring-blue-500/20 scale-[1.02]" : "bg-slate-50 border-slate-300 hover:bg-amber-50 hover:border-amber-400"}`}
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                                        <div className={`p-3 rounded-full mb-3 ${isDragging ? "bg-blue-100 text-blue-600" : "bg-white text-slate-400 shadow-sm"}`}>
                                            <UploadCloud size={28} />
                                        </div>
                                        <p className="mb-1 text-[15px] text-slate-700" style={fontBold}>
                                            {uploadFile ? "File Ready to Upload" : "Drag & drop file here"}
                                        </p>
                                        {!uploadFile && <p className="text-xs text-slate-500 mt-1">or click to browse from your computer</p>}
                                        {uploadFile && <p className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full mt-2 font-medium truncate max-w-[250px] border border-blue-100">{uploadFile.name}</p>}
                                    </div>
                                    <input type="file" className="hidden" onChange={(e) => setUploadFile(e.target.files[0])} />
                                </label>
                            </div>

                            <div>
                                <label className="block text-[11px] uppercase tracking-widest text-slate-500 mb-2" style={fontBold}>Required Description</label>
                                <textarea value={uploadDescription} onChange={e => setUploadDescription(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none bg-white text-slate-800 h-28 resize-none text-[15px] transition-all shadow-sm" placeholder="Provide context or notes for this file..." />
                            </div>
                            
                            <div className="pt-2">
                                <button onClick={handleUploadSubmit} disabled={!uploadFile || !uploadDescription} className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none text-white p-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2" style={fontBold}>
                                    <Upload size={18} /> Upload Document
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Share Modal */}
            {isShareModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => {setIsShareModalOpen(false); setShareSelection([]);}}></div>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 relative z-10 overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                        <div className="bg-gradient-to-r from-slate-50 to-white flex justify-between items-center p-5 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Users size={20} /></div>
                                <h2 style={fontBold} className="text-lg text-slate-800">Share with Team</h2>
                            </div>
                            <button onClick={() => {setIsShareModalOpen(false); setShareSelection([]);}} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-full transition-colors"><X size={20} /></button>
                        </div>
                        <div className="p-3 max-h-72 overflow-y-auto">
                            {MOCK_USERS.map(user => (
                                <div key={user.id} onClick={() => toggleShareSelection(user.id)} className="flex items-center gap-4 p-3 hover:bg-slate-50 cursor-pointer rounded-xl transition-all border border-transparent hover:border-slate-100 mb-1">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors shadow-sm ${shareSelection.includes(user.id) ? 'bg-blue-500 border-blue-500' : 'bg-white border-slate-300'}`}>
                                        {shareSelection.includes(user.id) && <Check size={14} className="text-white" />}
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center text-slate-600 text-sm shrink-0 shadow-sm" style={fontBold}>
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[15px] text-slate-800" style={fontBold}>{user.name}</p>
                                        <p className="text-[11px] text-slate-500 uppercase tracking-widest mt-0.5">{user.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-5 border-t border-slate-100 bg-slate-50">
                            <button onClick={handleShareSubmit} disabled={shareSelection.length === 0} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none text-white p-3.5 rounded-xl transition-all shadow-md flex justify-center items-center gap-2" style={fontBold}>
                                <Share2 size={18} /> Send Invitation ({shareSelection.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};