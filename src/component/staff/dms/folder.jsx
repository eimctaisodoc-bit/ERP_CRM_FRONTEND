import React, { useState, useMemo, useRef, useEffect } from "react";
import {
    FileText, Folder, Search, Download, HardDrive, FileVideo, Music, Table,
    Presentation, FileBox, Trash2Icon, Check, ChevronDown, FolderPlus,
    UploadCloud, ArrowLeft, ChevronRight, MessageSquare, X, FolderOpen,
    Loader2, RefreshCw, Share2, MoveRight
} from "lucide-react";

// Professional Typography Theme
const fontLight = { fontFamily: "'Roboto Slab', serif", fontWeight: 300 };
const fontBold = { fontFamily: "'Roboto Slab', serif", fontWeight: 700 };

const CURRENT_USER_ROLE = "standard user";

const DIRECTORY_USERS = [
    { id: "u1", name: "Sarah Jenkins (Legal Counsel)" },
    { id: "u2", name: "Marcus Rossi (Financial Auditor)" },
    { id: "u3", name: "David Chen (CTO)" },
    { id: "u4", name: "Emma Watson (HR Operations)" }
];

const INITIAL_ITEMS = [
    {
        id: "f-admin-1",
        name: "Q1 Financial Statements",
        type: "folder",
        parentId: "admin",
        nepaliDate: "२०८३ वैशाख १०",
        daysBefore: "2 months ago",
        description: "Contains all audited balance sheets and tax files for Q1."
    },
    {
        id: "f-admin-sample",
        name: "Sample",
        type: "folder",
        parentId: "admin",
        nepaliDate: "२०८३ जेठ ५",
        daysBefore: "1 month ago",
        description: "Sample template folder for administrative operations."
    },
    {
        id: "doc-1",
        name: "Corporate_Tax_Filing_Signed.pdf",
        type: "file",
        fileType: "pdf",
        size: "4.8 MB",
        parentId: "admin",
        nepaliDate: "२०८३ असार १",
        daysBefore: "3 days ago",
        description: "Verified submission copy signed off by senior financial counsel."
    },
    {
        id: "f-personal-1",
        name: "My Drafts",
        type: "folder",
        parentId: "you",
        nepaliDate: "२०८३ असार २",
        daysBefore: "2 days ago",
        description: "Personal drafts and work-in-progress files."
    }
];

const StyledIcon = ({ type, isFolder }) => {
    if (isFolder) {
        return (
            <div className="bg-amber-50 text-amber-500 p-2 rounded-md flex items-center justify-center shrink-0">
                <Folder size={18} />
            </div>
        );
    }

    switch (type) {
        case "pdf": 
            return <div className="bg-orange-50 text-orange-500 p-2 rounded-md flex items-center justify-center shrink-0"><FileText size={18} /></div>;
        case "word":
        case "docx": 
            return <div className="bg-blue-50 text-blue-500 p-2 rounded-md flex items-center justify-center shrink-0"><FileText size={18} /></div>;
        case "xlsx":
        case "excel": 
            return <div className="bg-amber-50 text-amber-500 p-2 rounded-md flex items-center justify-center shrink-0"><Table size={18} /></div>;
        case "ppt": 
            return <div className="bg-orange-50 text-orange-500 p-2 rounded-md flex items-center justify-center shrink-0"><Presentation size={18} /></div>;
        case "video":
        case "mp4": 
            return <div className="bg-blue-50 text-blue-500 p-2 rounded-md flex items-center justify-center shrink-0"><FileVideo size={18} /></div>;
        case "audio": 
            return <div className="bg-amber-50 text-amber-500 p-2 rounded-md flex items-center justify-center shrink-0"><Music size={18} /></div>;
        default: 
            return <div className="bg-blue-50 text-blue-500 p-2 rounded-md flex items-center justify-center shrink-0"><FileBox size={18} /></div>;
    }
};

export const S_Folder_ = () => {
    const ROOT_FOLDERS = [
        { id: "admin", name: "Admin Files", description: "Internal operations & management corporate records" },
        { id: "clients", name: "Client Vaults", description: "Customer documentation & project deliverables" },
        { id: "you", name: "Personal Repo", description: "Personal repository & cloud configurations" }
    ];

    const [fileSystem, setFileSystem] = useState(INITIAL_ITEMS);
    const [currentPath, setCurrentPath] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);
    
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [newFolderDesc, setNewFolderDesc] = useState("");
    
    const [uploadQueue, setUploadQueue] = useState(null);
    const [uploadDescription, setUploadDescription] = useState("");
    const fileInputRef = useRef(null);

    const [shareTarget, setShareTarget] = useState(null);
    const [selectedShareUsers, setSelectedShareUsers] = useState([]);

    // New State for Transfer/Move Functionality
    const [moveTarget, setMoveTarget] = useState(null);
    const [selectedDestinationFolder, setSelectedDestinationFolder] = useState("");

    const currentFolderContextId = useMemo(() => {
        if (currentPath.length === 0) return null;
        return currentPath[currentPath.length - 1].id;
    }, [currentPath]);

    const isInsidePersonalRepo = useMemo(() => {
        return currentPath.length > 0 && currentPath[0].id === "you";
    }, [currentPath]);

    const canEditNames = CURRENT_USER_ROLE === "admin client" || isInsidePersonalRepo;

    const activeItems = useMemo(() => {
        if (!currentFolderContextId) return [];
        let items = fileSystem.filter(item => item.parentId === currentFolderContextId &&
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        return items.sort((a, b) => {
            if (a.type === 'folder' && b.type !== 'folder') return -1;
            if (a.type !== 'folder' && b.type === 'folder') return 1;
            return a.name.localeCompare(b.name);
        });
    }, [fileSystem, currentFolderContextId, searchQuery]);

    // Available folders for transfer (excludes current folder and the item itself if it's a folder)
    const availableFoldersForMove = useMemo(() => {
        const customFolders = fileSystem.filter(f => f.type === 'folder' && f.id !== moveTarget?.id && f.id !== currentFolderContextId);
        return [...ROOT_FOLDERS.filter(rf => rf.id !== currentFolderContextId), ...customFolders];
    }, [fileSystem, moveTarget, currentFolderContextId]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setUploadQueue(null);
                setShareTarget(null);
                setMoveTarget(null);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        if (window.confirm(`Permanently delete ${selectedIds.length} selected asset(s)?`)) {
            setFileSystem(prev => prev.filter(item => !selectedIds.includes(item.id)));
            setSelectedIds([]);
        }
    };

    const handleCreateFolder = (e) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;

        const newFolderObj = {
            id: `f-${Date.now()}`,
            name: newFolderName.trim(),
            type: "folder",
            parentId: currentFolderContextId,
            nepaliDate: "२०८३ असार ४", 
            daysBefore: "Just now",
            description: newFolderDesc.trim() || "No additional description provided."
        };

        setFileSystem(prev => [newFolderObj, ...prev]);
        setNewFolderName("");
        setNewFolderDesc("");
        setIsCreatingFolder(false);
    };

    const handleFileSelect = (e) => {
        const selectedFiles = e.target.files;
        if (!selectedFiles || selectedFiles.length === 0) return;
        setUploadQueue(Array.from(selectedFiles));
        setUploadDescription("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const confirmUpload = () => {
        if (!uploadQueue) return;

        const updatedArray = [...fileSystem];
        uploadQueue.forEach(file => {
            const extension = file.name.split('.').pop();
            updatedArray.unshift({
                id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                name: file.name,
                type: "file",
                fileType: extension,
                size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                parentId: currentFolderContextId,
                nepaliDate: "२०८३ असार ४",
                daysBefore: "Just now",
                description: uploadDescription.trim() || "Uploaded document via secure interface."
            });
        });

        setFileSystem(updatedArray);
        setUploadQueue(null);
        setUploadDescription("");
    };

    const handleReplaceFile = (id, file) => {
        if (!file) return;
        const extension = file.name.split('.').pop();
        setFileSystem(prev => prev.map(item => item.id === id ? {
            ...item,
            name: file.name,
            fileType: extension,
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            daysBefore: "Replaced just now",
            nepaliDate: "२०८३ असार ४",
            description: `Replaced container copy with local file: ${file.name}`
        } : item));
    };

    const handleConfirmTransfer = () => {
        if (!selectedDestinationFolder || !moveTarget) return;
        setFileSystem(prev => prev.map(item => 
            item.id === moveTarget.id ? { ...item, parentId: selectedDestinationFolder } : item
        ));
        setMoveTarget(null);
        setSelectedDestinationFolder("");
    };

    const navigateIntoFolder = (id, name) => {
        setCurrentPath(prev => [...prev, { id, name }]);
        setSelectedIds([]);
        setSearchQuery("");
    };

    const navigateToBreadcrumb = (index) => {
        if (index === -1) setCurrentPath([]);
        else setCurrentPath(prev => prev.slice(0, index + 1));
        setSelectedIds([]);
        setSearchQuery("");
    };

    const toggleShareUser = (userId) => {
        setSelectedShareUsers(prev => 
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const confirmShare = () => {
        alert(`Successfully shared "${shareTarget.name}" with ${selectedShareUsers.length} user(s).`);
        setShareTarget(null);
    };

    return (
        <div className="min-h-screen bg-white text-neutral-800 antialiased pb-20" style={fontLight}>
            
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 px-6 py-4 shadow-sm">
                <div className="max-w-7xl mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateToBreadcrumb(-1)}>
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-lg shadow-inner" style={fontBold}>
                            <HardDrive size={20} />
                        </div>
                        <div>
                            <h1 className="text-base text-neutral-900 tracking-tight" style={fontBold}>
                                Central Storage
                            </h1>
                            <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Asset Management</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" size={15} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search repository..."
                                style={fontLight}
                                className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-neutral-400"
                            />
                        </div>

                        <button
                            onClick={handleBulkDelete}
                            disabled={selectedIds.length === 0}
                            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all border shadow-sm ${
                                selectedIds.length > 0 
                                ? "bg-white text-orange-600 border-orange-200 hover:bg-orange-50 cursor-pointer" 
                                : "bg-white text-neutral-300 border-neutral-100 cursor-not-allowed"
                            }`}
                            style={fontBold}
                        >
                            <Trash2Icon size={14} className={selectedIds.length > 0 ? "text-orange-500" : "text-neutral-300"} />
                            <span className="hidden sm:inline">Delete</span>
                            {selectedIds.length > 0 && (
                                <span className="ml-1 bg-orange-100 text-orange-700 rounded-md text-[10px] px-1.5 py-0.5 flex items-center justify-center font-bold">
                                    {selectedIds.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Area */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                
                {/* Breadcrumbs */}
                <div className="flex flex-wrap items-center gap-2 mb-8 bg-white border border-neutral-200 px-5 py-3.5 rounded-xl shadow-sm" style={fontBold}>
                    <button 
                        onClick={() => navigateToBreadcrumb(-1)}
                        className="flex items-center gap-1.5 text-neutral-500 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                        <HardDrive size={15} className="text-blue-500" />
                        <span className="text-xs tracking-wide">Root Directory</span>
                    </button>
                    
                    {currentPath.map((folder, index) => (
                        <React.Fragment key={folder.id}>
                            <ChevronRight size={14} className="text-neutral-300" />
                            <button
                                onClick={() => navigateToBreadcrumb(index)}
                                className={`hover:text-blue-600 transition-colors cursor-pointer text-xs tracking-wide max-w-[160px] truncate ${
                                    index === currentPath.length - 1 ? "text-neutral-900 font-semibold" : "text-neutral-500"
                                }`}
                            >
                                {folder.name}
                            </button>
                        </React.Fragment>
                    ))}
                </div>

                {currentPath.length === 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                        {ROOT_FOLDERS.map((folder) => {
                            const childCount = fileSystem.filter(i => i.parentId === folder.id).length;
                            return (
                                <div 
                                    key={folder.id}
                                    onClick={() => navigateIntoFolder(folder.id, folder.name)}
                                    className="group bg-white border border-neutral-200 p-6 rounded-2xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col items-start text-left"
                                >
                                    <div className="w-14 h-14 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center transition-all group-hover:bg-amber-100 group-hover:scale-105">
                                        <Folder size={24} />
                                    </div>
                                    <h3 className="text-base text-neutral-900 mt-5 transition-colors" style={fontBold}>
                                        {folder.name}
                                    </h3>
                                    <p className="text-sm text-neutral-500 mt-2 leading-relaxed min-h-[40px]" style={fontLight}>
                                        {folder.description}
                                    </p>
                                    <div className="mt-6 pt-4 border-t border-neutral-100 w-full flex justify-between items-center">
                                        <span className="text-[11px] text-neutral-400 uppercase tracking-wider" style={fontBold}>Data Partition</span>
                                        <span className="bg-neutral-50 border border-neutral-200 text-neutral-600 text-[11px] px-3 py-1 rounded-full font-medium tracking-wide">
                                            {childCount} item{childCount !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                        
                        {/* Control Panel */}
                        <div className="lg:col-span-1 space-y-5">
                            <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-5 shadow-sm">
                                <h3 className="text-[11px] tracking-widest text-neutral-400 uppercase" style={fontBold}>Operations</h3>
                                
                                <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple className="hidden" />

                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-neutral-200 hover:border-blue-400 hover:bg-blue-50/50 rounded-xl p-6 text-center cursor-pointer bg-neutral-50 transition-all group"
                                >
                                    <UploadCloud size={28} className="text-blue-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                                    <span className="block text-sm text-neutral-900" style={fontBold}>Upload Assets</span>
                                    <span className="block text-xs text-neutral-400 mt-1" style={fontLight}>Drag & drop or browse</span>
                                </div>

                                {!isCreatingFolder ? (
                                    <button
                                        onClick={() => setIsCreatingFolder(true)}
                                        className="w-full flex items-center justify-center gap-2 border border-neutral-200 bg-white hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 py-3 rounded-xl text-sm text-neutral-700 shadow-sm transition-all cursor-pointer"
                                        style={fontBold}
                                    >
                                        <FolderPlus size={16} className="text-amber-500" />
                                        Create Directory
                                    </button>
                                ) : (
                                    <form onSubmit={handleCreateFolder} className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl space-y-4 relative shadow-inner">
                                        <button type="button" onClick={() => setIsCreatingFolder(false)} className="absolute top-3 right-3 text-neutral-400 hover:text-neutral-600 cursor-pointer">
                                            <X size={16} />
                                        </button>
                                        <h4 className="text-sm text-neutral-900" style={fontBold}>New Directory</h4>
                                        <input 
                                            type="text" required placeholder="Directory name..." value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
                                            className="w-full border border-neutral-200 rounded-lg p-2.5 text-sm text-neutral-800 bg-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100" style={fontBold}
                                        />
                                        <textarea 
                                            placeholder="Provide description..." value={newFolderDesc} onChange={e => setNewFolderDesc(e.target.value)} rows={2}
                                            className="w-full border border-neutral-200 rounded-lg p-2.5 text-sm text-neutral-800 bg-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 resize-none" style={fontLight}
                                        />
                                        <button type="submit" className="w-full bg-amber-500 text-white hover:bg-amber-600 rounded-lg py-2.5 text-sm shadow-sm transition-colors cursor-pointer" style={fontBold}>
                                            Deploy Path
                                        </button>
                                    </form>
                                )}
                            </div>

                            <button
                                onClick={() => navigateToBreadcrumb(currentPath.length - 2)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 shadow-sm transition-all cursor-pointer"
                                style={fontBold}
                            >
                                <ArrowLeft size={16} className="text-neutral-400" /> Navigate Up
                            </button>
                        </div>

                        {/* File Logs */}
                        <div className="lg:col-span-3 space-y-3">
                            {activeItems.length === 0 ? (
                                <div className="text-center py-20 bg-white border border-neutral-200 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 shadow-sm">
                                    <div className="w-20 h-20 bg-blue-50 text-blue-400 rounded-2xl flex items-center justify-center mb-5">
                                        <FolderOpen size={40} />
                                    </div>
                                    <h3 className="text-base text-neutral-700" style={fontBold}>Empty Directory</h3>
                                    <p className="text-sm text-neutral-400 mt-2 max-w-sm" style={fontLight}>
                                        This path currently holds no localized assets. Upload files or create directories to populate.
                                    </p>
                                </div>
                            ) : (
                                activeItems.map((item) => (
                                    <FileAccordionRow 
                                        key={item.id} 
                                        item={item} 
                                        isSelected={selectedIds.includes(item.id)}
                                        canEdit={canEditNames}
                                        onSelect={() => toggleSelect(item.id)}
                                        onOpenFolder={() => navigateIntoFolder(item.id, item.name)}
                                        onEditTitle={(newName) => setFileSystem(prev => prev.map(i => i.id === item.id ? { ...i, name: newName } : i))}
                                        onReplaceFile={(file) => handleReplaceFile(item.id, file)}
                                        onShare={() => { setShareTarget(item); setSelectedShareUsers([]); }}
                                        onMove={() => { setMoveTarget(item); setSelectedDestinationFolder(""); }}
                                        onInlineDelete={() => {
                                            if (window.confirm(`Permanently remove "${item.name}"?`)) {
                                                setFileSystem(prev => prev.filter(i => i.id !== item.id));
                                                setSelectedIds(prev => prev.filter(x => x !== item.id));
                                            }
                                        }}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Transfer / Move Modal */}
            {moveTarget && (
                <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-neutral-100 flex justify-between items-center bg-white">
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-50 text-purple-600 p-2 rounded-lg">
                                    <MoveRight size={18} />
                                </div>
                                <h3 className="text-base text-neutral-900" style={fontBold}>Transfer Asset</h3>
                            </div>
                            <button onClick={() => setMoveTarget(null)} className="text-neutral-400 hover:text-neutral-700 bg-neutral-50 hover:bg-neutral-100 p-1.5 rounded-lg transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 space-y-5 bg-white">
                            <p className="text-sm text-neutral-600" style={fontLight}>
                                Select a destination directory for <span className="font-bold text-neutral-900">"{moveTarget.name}"</span>.
                            </p>
                            
                            {availableFoldersForMove.length === 0 ? (
                                <div className="text-center py-6 bg-neutral-50 rounded-lg border border-neutral-200 border-dashed">
                                    <p className="text-sm text-neutral-500" style={fontLight}>No alternative directories available.</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                    {availableFoldersForMove.map((folder) => (
                                        <label 
                                            key={folder.id} 
                                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                                selectedDestinationFolder === folder.id 
                                                ? "border-purple-500 bg-purple-50" 
                                                : "border-neutral-200 bg-white hover:border-purple-300 hover:bg-neutral-50"
                                            }`}
                                        >
                                            <input 
                                                type="radio"
                                                name="destinationFolder"
                                                value={folder.id}
                                                checked={selectedDestinationFolder === folder.id}
                                                onChange={(e) => setSelectedDestinationFolder(e.target.value)}
                                                className="hidden"
                                            />
                                            <Folder size={18} className={selectedDestinationFolder === folder.id ? "text-purple-600" : "text-amber-500"} />
                                            <span className={`text-sm ${selectedDestinationFolder === folder.id ? "text-purple-900 font-bold" : "text-neutral-700"}`} style={fontBold}>
                                                {folder.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex justify-end gap-3">
                            <button 
                                onClick={() => setMoveTarget(null)}
                                className="px-5 py-2.5 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-600 hover:bg-neutral-100 shadow-sm transition-colors" style={fontBold}>
                                Cancel
                            </button>
                            <button 
                                onClick={handleConfirmTransfer}
                                disabled={!selectedDestinationFolder}
                                className="px-5 py-2.5 rounded-lg text-sm bg-purple-600 text-white shadow-sm hover:bg-purple-700 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed transition-colors" style={fontBold}>
                                Confirm Transfer
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Upload Modal (Unchanged) */}
            {uploadQueue && (
                <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-neutral-100 flex justify-between items-center bg-white">
                            <h3 className="text-base text-neutral-900" style={fontBold}>
                                Finalize Upload ({uploadQueue.length} items)
                            </h3>
                            <button onClick={() => setUploadQueue(null)} className="text-neutral-400 hover:text-neutral-700 bg-neutral-50 hover:bg-neutral-100 p-1.5 rounded-lg transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4 bg-white">
                            <div className="max-h-28 overflow-y-auto space-y-1.5 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                                {uploadQueue.map((f, i) => (
                                    <div key={i} className="text-xs text-neutral-600 truncate" style={fontLight}>
                                        • {f.name} ({(f.size / 1024 / 1024).toFixed(2)} MB)
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] text-neutral-700 font-bold uppercase tracking-widest" style={fontBold}>
                                    Asset Description
                                </label>
                                <textarea
                                    value={uploadDescription}
                                    onChange={(e) => setUploadDescription(e.target.value)}
                                    placeholder="Enter documentation context..."
                                    className="w-full border border-neutral-200 rounded-xl p-3.5 text-sm text-neutral-800 bg-neutral-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none h-28 transition-all"
                                    style={fontLight}
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex justify-end gap-3">
                            <button 
                                onClick={() => setUploadQueue(null)}
                                className="px-5 py-2.5 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-600 hover:bg-neutral-100 shadow-sm transition-colors" style={fontBold}>
                                Cancel
                            </button>
                            <button 
                                onClick={confirmUpload}
                                className="px-5 py-2.5 rounded-lg text-sm bg-blue-600 text-white shadow-sm hover:bg-blue-700 transition-colors" style={fontBold}>
                                Confirm & Upload
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Share Modal (Unchanged) */}
            {shareTarget && (
                <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-neutral-100 flex justify-between items-center bg-white">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                                    <Share2 size={18} />
                                </div>
                                <h3 className="text-base text-neutral-900" style={fontBold}>Share Asset</h3>
                            </div>
                            <button onClick={() => setShareTarget(null)} className="text-neutral-400 hover:text-neutral-700 bg-neutral-50 hover:bg-neutral-100 p-1.5 rounded-lg transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4 bg-white">
                            <p className="text-sm text-neutral-600" style={fontLight}>
                                Grant access to <span className="font-bold text-neutral-900">"{shareTarget.name}"</span>.
                            </p>
                            <div className="border border-neutral-200 rounded-xl divide-y divide-neutral-100 max-h-56 overflow-y-auto">
                                {DIRECTORY_USERS.map((user) => (
                                    <label key={user.id} className="flex items-center gap-3 p-3.5 bg-white hover:bg-neutral-50 cursor-pointer transition-colors">
                                        <input 
                                            type="checkbox"
                                            checked={selectedShareUsers.includes(user.id)}
                                            onChange={() => toggleShareUser(user.id)}
                                            className="w-4 h-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500 cursor-pointer accent-blue-600"
                                        />
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs shadow-inner" style={fontBold}>
                                                {user.name.charAt(0)}
                                            </div>
                                            <span className="text-sm text-neutral-700" style={fontBold}>{user.name}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex justify-end gap-3">
                            <button 
                                onClick={() => setShareTarget(null)}
                                className="px-5 py-2.5 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-600 hover:bg-neutral-100 shadow-sm transition-colors" style={fontBold}>
                                Cancel
                            </button>
                            <button 
                                onClick={confirmShare}
                                disabled={selectedShareUsers.length === 0}
                                className="px-5 py-2.5 rounded-lg text-sm bg-blue-600 text-white shadow-sm hover:bg-blue-700 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed transition-colors" style={fontBold}>
                                Grant Access
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const FileAccordionRow = ({ item, isSelected, canEdit, onSelect, onOpenFolder, onEditTitle, onReplaceFile, onShare, onMove, onInlineDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState(item.name);
    const [isSavingTitle, setIsSavingTitle] = useState(false);

    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [feedbackText, setFeedbackText] = useState("");
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

    const inlineFileInputRef = useRef(null);
    const isFolder = item.type === "folder";

    const handleTitleSave = async () => {
        if (!editedTitle.trim()) { setEditedTitle(item.name); setIsEditingTitle(false); return; }
        if (editedTitle === item.name) { setIsEditingTitle(false); return; }
        
        setIsSavingTitle(true);
        await new Promise(r => setTimeout(r, 400));
        onEditTitle(editedTitle);
        setIsSavingTitle(false);
        setIsEditingTitle(false);
    };

    const triggerEditFlow = (e) => {
        e.stopPropagation();
        if (canEdit) {
            setIsEditingTitle(true);
        } else {
            alert("Editing restricted. You must be an Admin Client or inside the Personal Repo to modify nomenclature.");
        }
    };

    return (
        <div className={`bg-white border rounded-2xl shadow-sm transition-all ${
            isExpanded ? "border-blue-300 ring-4 ring-blue-50" : "border-neutral-200 hover:border-neutral-300 hover:shadow-md"
        }`}>
            <div className="flex items-center justify-between p-4 sm:p-5 gap-4 bg-white rounded-t-2xl">
                
                <div className="flex items-center justify-center relative shrink-0 z-10 cursor-pointer" onClick={onSelect}>
                    <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        className="peer appearance-none w-5 h-5 rounded-md border-2 border-neutral-300 checked:bg-blue-600 checked:border-blue-600 cursor-pointer focus:outline-none transition-all"
                    />
                    <Check size={14} className="absolute text-white pointer-events-none opacity-0 peer-checked:opacity-100" strokeWidth={3} />
                </div>

                <div className="flex-1 flex items-center gap-4 min-w-0">
                    <StyledIcon type={item.fileType} isFolder={isFolder} />

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            {isSavingTitle ? (
                                <span className="flex items-center gap-1.5 text-xs text-neutral-400" style={fontLight}>
                                    <Loader2 size={12} className="animate-spin text-blue-500" /> Updating...
                                </span>
                            ) : isEditingTitle ? (
                                <input
                                    autoFocus
                                    value={editedTitle}
                                    onChange={e => setEditedTitle(e.target.value)}
                                    onBlur={handleTitleSave}
                                    onKeyDown={e => e.key === 'Enter' && handleTitleSave()}
                                    className="border-b-2 border-blue-500 outline-none text-sm text-neutral-900 w-full bg-neutral-50 px-2 py-1 rounded-sm"
                                    style={fontBold}
                                />
                            ) : (
                                <span 
                                    onDoubleClick={triggerEditFlow}
                                    className="text-sm sm:text-base text-neutral-800 truncate cursor-text hover:text-blue-600 transition-colors"
                                    style={fontBold}
                                    title={canEdit ? "Double-click to modify" : "Read-only access"}
                                >
                                    {item.name}
                                </span>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-neutral-500" style={fontLight}>
                            <span className="uppercase text-[10px] tracking-widest font-bold text-neutral-400">
                                {isFolder ? "Directory" : item.fileType}
                            </span>
                            {!isFolder && <span className="text-neutral-300">•</span>}
                            {!isFolder && <span>{item.size}</span>}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isFolder ? (
                        <button 
                            onClick={onOpenFolder}
                            className="px-4 py-2 sm:px-5 sm:py-2.5 text-amber-700 bg-amber-50 border border-amber-100 hover:bg-amber-100 hover:border-amber-300 rounded-lg text-xs transition-all cursor-pointer shadow-sm"
                            style={fontBold}
                        >
                            Open
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className={`p-2 sm:p-2.5 text-neutral-500 border hover:text-neutral-800 bg-white hover:bg-neutral-50 rounded-lg cursor-pointer transition-all duration-200 ${
                                isExpanded ? "border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100" : "border-neutral-200"
                            }`}
                        >
                            <ChevronDown size={18} className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                        </button>
                    )}
                </div>
            </div>

            {/* Expanded Document Details & Actions */}
            {!isFolder && isExpanded && (
                <div className="bg-neutral-50 border-t border-neutral-100 p-5 sm:p-6 space-y-6 rounded-b-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-2">
                            <h4 className="text-[11px] uppercase tracking-widest text-neutral-400" style={fontBold}>Metadata</h4>
                            <p className="text-sm text-neutral-700 leading-relaxed p-4 rounded-xl bg-white border border-neutral-200 shadow-sm" style={fontLight}>
                                {item.description}
                            </p>
                        </div>
                        
                        <div className="space-y-4 bg-white p-5 rounded-xl border border-neutral-200 text-xs text-neutral-600 shadow-sm" style={fontLight}>
                            <div className="flex justify-between items-center">
                                <span>Ingestion Date:</span>
                                <span className="text-neutral-900" style={fontBold}>{item.nepaliDate}</span>
                            </div>
                            <div className="border-t border-neutral-100" />
                            <div className="flex justify-between items-center">
                                <span>Lifecycle:</span>
                                <span className="text-neutral-900" style={fontBold}>{item.daysBefore}</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-5 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center flex-wrap gap-3 w-full sm:w-auto">
                            <button
                                onClick={() => alert(`Initiating download: ${item.name}`)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 rounded-xl text-sm transition-all cursor-pointer shadow-sm"
                                style={fontBold}
                            >
                                <div className="bg-blue-50 text-blue-600 p-1.5 rounded-md"><Download size={14} /></div> Download
                            </button>
                            
                            <button
                                onClick={onShare}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 rounded-xl text-sm transition-all cursor-pointer shadow-sm"
                                style={fontBold}
                            >
                                <div className="bg-amber-50 text-amber-600 p-1.5 rounded-md"><Share2 size={14} /></div> Share
                            </button>
                            
                            {/* New Transfer Action Button */}
                            <button
                                onClick={onMove}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 rounded-xl text-sm transition-all cursor-pointer shadow-sm"
                                style={fontBold}
                            >
                                <div className="bg-purple-50 text-purple-600 p-1.5 rounded-md"><MoveRight size={14} /></div> Transfer
                            </button>

                            <button
                                onClick={() => setIsFeedbackOpen(!isFeedbackOpen)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 rounded-xl text-sm transition-all cursor-pointer shadow-sm"
                                style={fontBold}
                            >
                                <div className="bg-blue-50 text-blue-600 p-1.5 rounded-md"><MessageSquare size={14} /></div> Note
                            </button>

                            <input 
                                type="file" 
                                ref={inlineFileInputRef} 
                                className="hidden" 
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) onReplaceFile(file);
                                }}
                            />
                            <button
                                onClick={() => inlineFileInputRef.current?.click()}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 rounded-xl text-sm transition-all cursor-pointer shadow-sm"
                                style={fontBold}
                            >
                                <div className="bg-orange-50 text-orange-600 p-1.5 rounded-md"><RefreshCw size={14} /></div> Replace
                            </button>
                        </div>

                        <button
                            onClick={onInlineDelete}
                            className="px-5 py-2.5 text-orange-600 bg-white border border-transparent hover:border-orange-200 hover:bg-orange-50 rounded-xl text-sm transition-all cursor-pointer flex items-center gap-2 shadow-sm"
                            style={fontBold}
                        >
                            <Trash2Icon size={16} /> Revoke
                        </button>
                    </div>

                    {/* Feedback Box (Unchanged) */}
                    {isFeedbackOpen && (
                        <div className="p-5 bg-white border border-neutral-200 rounded-xl space-y-4 mt-2 shadow-sm">
                            <h4 className="text-xs text-neutral-800 uppercase tracking-widest" style={fontBold}>Add Notation</h4>
                            <textarea
                                value={feedbackText}
                                onChange={e => setFeedbackText(e.target.value)}
                                placeholder="Type remarks here..."
                                className="w-full border border-neutral-200 rounded-xl p-3.5 text-sm text-neutral-800 bg-neutral-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none transition-all"
                                rows={2}
                                style={fontLight}
                                disabled={isSubmittingFeedback}
                            />
                            <div className="flex justify-end">
                                <button
                                    onClick={async () => {
                                        if (!feedbackText.trim()) return;
                                        setIsSubmittingFeedback(true);
                                        await new Promise(r => setTimeout(r, 600));
                                        setIsSubmittingFeedback(false); setIsFeedbackOpen(false); setFeedbackText("");
                                    }}
                                    disabled={isSubmittingFeedback || !feedbackText.trim()}
                                    className="bg-blue-600 text-white shadow-sm hover:bg-blue-700 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:border-transparent px-6 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2 cursor-pointer"
                                    style={fontBold}
                                >
                                    {isSubmittingFeedback ? (
                                        <><Loader2 size={16} className="animate-spin" /> Saving...</>
                                    ) : "Save Note"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};