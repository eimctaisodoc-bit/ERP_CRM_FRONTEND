import React, { useState } from "react";
import {
    Download,
    Eye,
    FileText,
    Loader2,
    X,
    HardDrive,
    FileType,
    FolderOpen,
} from "lucide-react";

const formatFileSize = (size) => {
    if (!size || Number.isNaN(Number(size))) return "";

    const units = ["B", "KB", "MB", "GB"];
    let value = Number(size);
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex += 1;
    }

    return `${value < 10 && unitIndex > 0 ? value.toFixed(1) : Math.round(value)} ${units[unitIndex]}`;
};

const getFileExtension = (fileName) => {
    const parts = fileName.split(".");
    return parts.length > 1 ? parts.pop().toUpperCase() : "FILE";
};

const getFileCategory = (fileName) => {
    const ext = getFileExtension(fileName).toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'ogg'].includes(ext)) return 'video';
    if (['pdf'].includes(ext)) return 'pdf';
    return 'other';
};

const getCategoryLabel = (category) => ({
    image: "Image",
    video: "Video",
    pdf: "PDF document",
    other: "Document",
}[category] || "File");

export default function FileAttachment({ file, baseUrl }) {
    const [isDownloading, setIsDownloading] = useState(false);
    // Added state for image hover zoom
    const [isImageHovered, setIsImageHovered] = useState(false); 
    const [showDialog, setShowDialog] = useState(false);

    const storedPath = typeof file === "string" ? file : file?.path || file?.name || "";
    const normalizedPath = storedPath.replace(/\\/g, "/").replace(/^\/+/, "");
    const publicPath = normalizedPath.startsWith("uploads/") ? normalizedPath : `uploads/${normalizedPath}`;
    
    const fileUrl = `${baseUrl}/backend/${publicPath}`;
    const fileName = normalizedPath.split("/").pop() || "Attachment";
    const fileType = typeof file === "string" ? "" : file?.type || "";
    const fileSize = typeof file === "string" ? "" : formatFileSize(file?.size);
    const extension = getFileExtension(fileName);
    const fileCategory = getFileCategory(fileName);
    const categoryLabel = getCategoryLabel(fileCategory);
    const folderPath = normalizedPath.includes("/")
        ? normalizedPath.slice(0, normalizedPath.lastIndexOf("/"))
        : "Root folder";
    const uploadedAt = typeof file === "string" ? "" : file?.createdAt || file?.uploadedAt || "";

    // Trigger Preview Modal
    const handlePreviewModal = (e) => {
        if (e) e.stopPropagation();
        setShowDialog(true);
    };

    const handleDownload = async (e) => {
        if (e) e.stopPropagation();
        setIsDownloading(true);

        try {
            const response = await fetch(fileUrl);
            if (!response.ok) throw new Error(`Download failed: ${response.status}`);
            
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            
            link.href = objectUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            URL.revokeObjectURL(objectUrl);
        } catch (error) {
            console.warn("Blob download failed, falling back to native anchor:", error);
            
            const link = document.createElement("a");
            link.href = fileUrl;
            link.setAttribute("download", fileName);
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            link.remove();
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <>
            {/* Attachment Card */}
            <div className="group flex min-w-0 max-w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm transition-all duration-200 hover:scale-[1.01] hover:border-blue-200 hover:shadow-md">
                <button
                    type="button"
                    onClick={handlePreviewModal}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-all hover:bg-slate-200"
                    title="Preview file"
                >
                    <FileText className="h-5 w-5" />
                </button>

                <button
                    type="button"
                    onClick={handlePreviewModal}
                    className="min-w-0 flex-1 text-left cursor-pointer"
                >
                    <p className="truncate text-sm font-semibold text-slate-700 group-hover:text-slate-900" title={fileName}>
                        {fileName}
                    </p>
                    {(fileType || fileSize || categoryLabel) && (
                        <p className="mt-0.5 truncate text-[11px] text-slate-400">
                            {[categoryLabel, fileType, fileSize].filter(Boolean).join(" • ")}
                        </p>
                    )}
                </button>

                <div className="flex shrink-0 items-center gap-1">
                    <button
                        type="button"
                        onClick={handlePreviewModal}
                        aria-label={`Preview ${fileName}`}
                        title="Preview file"
                        className="rounded-lg p-2 cursor-pointer text-blue-600 transition-all hover:bg-blue-50"
                    >
                        <Eye className="h-4 w-4" />
                    </button>

                    <button
                        type="button"
                        onClick={handleDownload}
                        disabled={isDownloading}
                        aria-label={`Download ${fileName}`}
                        title="Download file"
                        className="rounded-lg p-2 cursor-pointer text-emerald-600 transition-all hover:bg-emerald-50 disabled:cursor-wait disabled:opacity-50"
                    >
                        {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            {/* File Details & Preview Dialog */}
            {showDialog && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                    onClick={() => setShowDialog(false)}
                >
                    <div
                        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-slate-800">File Details</h3>
                                    <p className="max-w-70 truncate text-xs text-slate-400">{fileName}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowDialog(false)}
                                className="rounded-lg p-2 cursor-pointer text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* File Preview Area */}
                        <div className="flex-1 overflow-y-auto px-5 pt-5 pb-2">
                            <div className="group/preview flex min-h-50 w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2">
                                {fileCategory === 'image' ? (
                                    <img 
                                        src={fileUrl} 
                                        alt={fileName}
                                        onMouseEnter={() => setIsImageHovered(true)}
                                        onMouseLeave={() => setIsImageHovered(false)}
                                        className={`max-h-64 w-auto cursor-zoom-in rounded object-contain transition-transform duration-300 ease-out ${
                                            isImageHovered ? 'scale-125' : 'scale-100'
                                        }`} 
                                    />
                                ) : fileCategory === 'video' ? (
                                    <video src={fileUrl} controls className="max-h-64 w-full rounded" />
                                ) : fileCategory === 'pdf' ? (
                                    <iframe src={fileUrl} title={fileName} className="h-64 w-full rounded border-0" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100">
                                            <FileText className="h-8 w-8 text-slate-400" />
                                        </div>
                                        <p className="mt-3 max-w-full px-4 text-center truncate text-sm font-semibold text-slate-700" title={fileName}>
                                            {fileName}
                                        </p>
                                        <span className="mt-1 rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                                            {extension}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Metadata */}
                            <div className="mt-5 grid grid-cols-2 gap-2">
                                <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3">
                                    <div className="flex items-center gap-2 text-blue-600">
                                        <FileType className="h-4 w-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Format</span>
                                    </div>
                                    <p className="mt-1 truncate text-sm font-bold text-slate-800">{extension}</p>
                                    <p className="mt-0.5 truncate text-[11px] text-slate-500">{categoryLabel}</p>
                                </div>
                                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
                                    <div className="flex items-center gap-2 text-emerald-600">
                                        <HardDrive className="h-4 w-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Size</span>
                                    </div>
                                    <p className="mt-1 truncate text-sm font-bold text-slate-800">{fileSize || "Unknown"}</p>
                                    <p className="mt-0.5 text-[11px] text-slate-500">Stored locally</p>
                                </div>
                                <div className="col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <FolderOpen className="h-4 w-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Folder</span>
                                    </div>
                                    <p className="mt-1 truncate text-xs font-semibold text-slate-700" title={folderPath}>{folderPath}</p>
                                </div>
                                <div className="col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full path</p>
                                    <p className="mt-1 break-all text-xs font-medium text-slate-600" title={normalizedPath}>{normalizedPath}</p>
                                </div>
                                {(uploadedAt || fileType) && (
                                    <div className="col-span-2 grid grid-cols-2 gap-2">
                                        <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">MIME type</p>
                                            <p className="mt-1 truncate text-xs font-semibold text-slate-700">{fileType || "Unknown"}</p>
                                        </div>
                                        {uploadedAt && (
                                            <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Uploaded</p>
                                                <p className="mt-1 truncate text-xs font-semibold text-slate-700">{uploadedAt}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="shrink-0 flex gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">
                            <button
                                type="button"
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-wait disabled:opacity-60"
                            >
                                {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                {isDownloading ? "Downloading..." : "Download"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}