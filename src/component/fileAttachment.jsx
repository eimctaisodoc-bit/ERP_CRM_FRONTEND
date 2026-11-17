import React, { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

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

// Format file size
const formatFileSize = (size) => {
  if (!size || Number.isNaN(Number(size))) return "";

  const units = ["B", "KB", "MB", "GB"];
  let value = Number(size);
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${
    value < 10 && unitIndex > 0 ? value.toFixed(1) : Math.round(value)
  } ${units[unitIndex]}`;
};

// Get file extension
const getFileExtension = (fileName) => {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop().toUpperCase() : "FILE";
};

// Identify file category
const getFileCategory = (fileName) => {
  const ext = getFileExtension(fileName).toLowerCase();

  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext))
    return "image";

  if (["mp4", "webm", "ogg"].includes(ext)) return "video";

  if (ext === "pdf") return "pdf";

  return "other";
};

// Category label
const getCategoryLabel = (category) =>
  ({
    image: "Image",
    video: "Video",
    pdf: "PDF document",
    other: "Document",
  })[category] || "File";

// Normalize stored path and remove physical filesystem directories
const getRelativeFilePath = (storedPath) => {
  if (!storedPath) return "";

  let normalizedPath = String(storedPath).replace(/\\/g, "/").trim();

  // Already a complete HTTP URL
  if (/^https?:\/\//i.test(normalizedPath)) {
    return normalizedPath;
  }

  // Extract everything after the public directory.
  // Example:
  // /media/ranjan/New Volume/EIMCTA_ERP/backend/public/salesEvidence/note/image.png
  // becomes:
  // salesEvidence/note/image.png

  const publicIndex = normalizedPath.lastIndexOf("/public/");

  if (publicIndex !== -1) {
    normalizedPath = normalizedPath.substring(publicIndex + 8);
  } else {
    normalizedPath = normalizedPath.replace(/^\/+/, "");

    normalizedPath = normalizedPath
      .replace(/^backend\/public\//i, "")
      .replace(/^public\//i, "")
      .replace(/^backend\/uploads\//i, "")
      .replace(/^uploads\//i, "");
  }

  return normalizedPath.replace(/^\/+/, "");
};

// Build browser URL
const buildFileUrl = (baseUrl, relativePath) => {
  if (!relativePath) return "";

  // Preserve an existing complete URL
  if (/^https?:\/\//i.test(relativePath)) {
    return relativePath;
  }

  const apiBase = String(baseUrl || "").replace(/\/+$/, "");

  const encodedPath = relativePath
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${apiBase}/backend/public/${encodedPath}`;
};

export default function FileAttachment({ file, baseUrl }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const dialogTitleId = useId();

  // Get original stored path
  const storedPath =
    typeof file === "string" ? file : file?.path || file?.name || "";

  // Convert absolute Linux/Windows path into relative public path
  const normalizedPath = getRelativeFilePath(storedPath);

  // Construct correct browser URL
  const fileUrl = buildFileUrl(baseUrl, normalizedPath);

  // File details
  const fileName = normalizedPath.split("/").pop() || "Attachment";

  const fileType = typeof file === "string" ? "" : file?.type || "";

  const fileSize = typeof file === "string" ? "" : formatFileSize(file?.size);

  const extension = getFileExtension(fileName);
  const fileCategory = getFileCategory(fileName);
  const categoryLabel = getCategoryLabel(fileCategory);

  const folderPath = normalizedPath.includes("/")
    ? normalizedPath.slice(0, normalizedPath.lastIndexOf("/"))
    : "Root folder";

  const uploadedAt =
    typeof file === "string" ? "" : file?.createdAt || file?.uploadedAt || "";

  console.log("FileAttachment storedPath:", storedPath);
  console.log("FileAttachment normalizedPath:", normalizedPath);
  console.log("FileAttachment fileUrl:", fileUrl);

  // Open preview modal
  const handlePreviewModal = (e) => {
    if (e) e.stopPropagation();

    setImageFailed(false);
    setShowDialog(true);
  };

  // Close modal on Escape and prevent background scrolling
  useEffect(() => {
    if (!showDialog) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowDialog(false);
      }
    };

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showDialog]);

  // Download attachment
  const handleDownload = async (e) => {
    if (e) e.stopPropagation();

    if (isDownloading || !fileUrl) return;

    setIsDownloading(true);

    try {
      const response = await fetch(fileUrl);

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = objectUrl;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      link.remove();

      // Give the browser time to start downloading
      window.setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
      }, 1000);
    } catch (error) {
      console.warn(
        "Blob download failed, falling back to native anchor:",
        error,
      );

      const link = document.createElement("a");

      link.href = fileUrl;
      link.setAttribute("download", fileName);
      link.target = "_blank";
      link.rel = "noopener noreferrer";

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
          className="min-w-0 flex-1 cursor-pointer text-left"
        >
          <p
            className="truncate text-sm font-semibold text-slate-700 group-hover:text-slate-900"
            title={fileName}
          >
            {fileName}
          </p>

          {(fileType || fileSize || categoryLabel) && (
            <p className="mt-0.5 truncate text-[11px] text-slate-400">
              {[categoryLabel, fileType, fileSize].filter(Boolean).join(" • ")}
            </p>
          )}
        </button>

        <div className="flex shrink-0 items-center gap-1">
          {/* Preview button */}
          <button
            type="button"
            onClick={handlePreviewModal}
            aria-label={`Preview ${fileName}`}
            title="Preview file"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-blue-600 transition-all hover:bg-blue-50 active:scale-95"
          >
            <Eye className="h-4 w-4" />
          </button>

          {/* Download button */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            aria-busy={isDownloading}
            aria-label={
              isDownloading ? `Downloading ${fileName}` : `Download ${fileName}`
            }
            title={isDownloading ? "Downloading..." : "Download file"}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-emerald-600 transition-all ${
              isDownloading
                ? "cursor-wait bg-emerald-50 ring-1 ring-emerald-200"
                : "cursor-pointer hover:bg-emerald-50 active:scale-95"
            }`}
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* File Details & Preview Dialog */}
      {showDialog &&
        createPortal(
          <div
            className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6"
            role="presentation"
          >
            {/* Background overlay */}
            <button
              type="button"
              aria-label="Close preview"
              className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
              onClick={() => setShowDialog(false)}
            />

            {/* Dialog */}
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={dialogTitleId}
              tabIndex={-1}
              className="relative z-10 flex max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)]"
            >
              {/* Header */}
              <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <FileText className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <h3
                      id={dialogTitleId}
                      className="text-sm font-bold text-slate-800"
                    >
                      File Preview
                    </h3>

                    <p className="max-w-70 truncate text-xs text-slate-400">
                      {fileName}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDialog(false)}
                  aria-label="Close preview"
                  className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* File Preview Area */}
              <div className="flex-1 overflow-y-auto px-5 pb-2 pt-5">
                <div className="flex min-h-40 w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2 sm:min-h-56">
                  {/* Image preview */}
                  {fileCategory === "image" ? (
                    imageFailed ? (
                      <div
                        role="status"
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        <FileText className="mx-auto mb-2 h-8 w-8 text-slate-400" />
                        This image could not be loaded.
                      </div>
                    ) : (
                      <img
                        src={fileUrl}
                        alt={fileName}
                        onError={() => setImageFailed(true)}
                        className="max-h-[calc(100dvh-12rem)] max-w-full rounded object-contain"
                      />
                    )
                  ) : fileCategory === "video" ? (
                    /* Video preview */
                    <video
                      src={fileUrl}
                      controls
                      className="max-h-64 w-full rounded"
                    />
                  ) : fileCategory === "pdf" ? (
                    /* PDF preview */
                    <iframe
                      src={fileUrl}
                      title={fileName}
                      className="h-64 w-full rounded border-0"
                    />
                  ) : (
                    /* Other file types */
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-100 bg-white shadow-sm">
                        <FileText className="h-8 w-8 text-slate-400" />
                      </div>

                      <p
                        className="mt-3 max-w-full truncate px-4 text-center text-sm font-semibold text-slate-700"
                        title={fileName}
                      >
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
                  {/* Format */}
                  <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3">
                    <div className="flex items-center gap-2 text-blue-600">
                      <FileType className="h-4 w-4" />

                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Format
                      </span>
                    </div>

                    <p className="mt-1 truncate text-sm font-bold text-slate-800">
                      {extension}
                    </p>

                    <p className="mt-0.5 truncate text-[11px] text-slate-500">
                      {categoryLabel}
                    </p>
                  </div>

                  {/* Size */}
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <HardDrive className="h-4 w-4" />

                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Size
                      </span>
                    </div>

                    <p className="mt-1 truncate text-sm font-bold text-slate-800">
                      {fileSize || "Unknown"}
                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Stored locally
                    </p>
                  </div>

                  {/* Folder */}
                  <div className="col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center gap-2 text-slate-500">
                      <FolderOpen className="h-4 w-4" />

                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Folder
                      </span>
                    </div>

                    <p
                      className="mt-1 truncate text-xs font-semibold text-slate-700"
                      title={folderPath}
                    >
                      {folderPath}
                    </p>
                  </div>

                  {/* Full path */}
                  <div className="col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Full path
                    </p>

                    <p
                      className="mt-1 break-all text-xs font-medium text-slate-600"
                      title={normalizedPath}
                    >
                      {normalizedPath}
                    </p>
                  </div>

                  {/* Additional metadata */}
                  {(uploadedAt || fileType) && (
                    <div className="col-span-2 grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          MIME type
                        </p>

                        <p className="mt-1 truncate text-xs font-semibold text-slate-700">
                          {fileType || "Unknown"}
                        </p>
                      </div>

                      {uploadedAt && (
                        <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Uploaded
                          </p>

                          <p className="mt-1 truncate text-xs font-semibold text-slate-700">
                            {uploadedAt}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex shrink-0 gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  aria-busy={isDownloading}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${
                    isDownloading
                      ? "cursor-wait border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "cursor-pointer border-slate-200 bg-white text-slate-700 hover:bg-slate-100 active:scale-[0.99]"
                  }`}
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}

                  {isDownloading ? "Downloading..." : "Download"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
