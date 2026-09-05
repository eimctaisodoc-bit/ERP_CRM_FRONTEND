import React, { useState, useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  X,
  Download,
  CheckCircle2,
} from "lucide-react";

const ALLOWED = [".xlsx", ".xls"];

function fmtSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function FileUpload({
  onClose,
  isOpen = true,
}) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("idle");
  const [dragging, setDragging] = useState(false);

  const inputRef = useRef(null);

  if (!isOpen) return null;

  const processFile = (f) => {
    if (!f) return;

    const ext =
      "." + f.name.split(".").pop().toLowerCase();

    if (!ALLOWED.includes(ext)) {
      setError("Only .xlsx and .xls files are allowed");
      setFile(null);
      return;
    }

    setFile(f);
    setError("");
    setProgress(0);
    setStatus("idle");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);

    if (e.dataTransfer.files?.length) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const reset = () => {
    setFile(null);
    setError("");
    setProgress(0);
    setStatus("idle");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleUpload = () => {
    if (status === "done") {
      reset();
      return;
    }

    if (!file || status === "uploading") return;

    setStatus("uploading");
    setProgress(0);

    let pct = 0;

    const interval = setInterval(() => {
      pct += Math.random() * 14 + 4;

      if (pct >= 100) {
        pct = 100;

        clearInterval(interval);

        setProgress(100);

        setTimeout(() => {
          setStatus("done");
        }, 400);

        return;
      }

      setProgress(Math.round(pct));
    }, 160);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex justify-start items-center gap-2">
            <div className=" ">
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 p-2 text-xs font-medium text-amber-700">
                    <Upload size={19} className="text-amber-600" />
                </span>
            </div>
            <div>

            <h2 className="text-md font-semibold text-slate-900">
              Upload Holiday Schedule
            </h2>
            <p className="text-sm text-slate-500">
              Upload your spreadsheet file
            </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg cursor-pointer p-2 text-slate-500 transition hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">

          {/* Upload Area */}
          {status !== "done" && (
            <div
              onClick={() =>
                inputRef.current?.click()
              }
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() =>
                setDragging(false)
              }
              onDrop={handleDrop}
              className={`flex h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all
                ${
                  dragging
                    ? "border-amber-500 bg-amber-50"
                    : "border-slate-300 bg-slate-50 hover:bg-slate-100"
                }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) =>
                  processFile(
                    e.target.files?.[0]
                  )
                }
              />

              <div className="mb-4 rounded-full bg-amber-100 p-4">
                <Upload
                  size={28}
                  className="text-amber-600"
                />
              </div>

              <h3 className="font-semibold text-slate-800">
                Click or Drag & Drop
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Upload Excel Spreadsheet
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Supported: .xlsx, .xls
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* File Preview */}
          {file && status !== "done" && (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-50 p-3">
                  <FileSpreadsheet
                    size={22}
                    className="text-emerald-600"
                  />
                </div>

                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-medium text-slate-800">
                    {file.name}
                  </p>

                  <p className="text-sm text-slate-500">
                    {fmtSize(file.size)}
                  </p>
                </div>
              </div>

              {/* Progress */}
              {status === "uploading" && (
                <div className="mt-4 cursor-pointer">
                  <div className="mb-2 flex justify-between text-xs text-slate-500">
                    <span>Uploading...</span>
                    <span>{progress}%</span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all duration-300"
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Success */}
          {status === "done" && (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="mb-4 rounded-full bg-green-100 p-4">
                <CheckCircle2
                  size={36}
                  className="text-green-600"
                />
              </div>

              <h3 className="text-lg font-semibold text-slate-900">
                Import Completed
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                File imported successfully.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <button className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
            <Download size={16} />
            Download Template
          </button>

          <button
            onClick={handleUpload}
            disabled={
              !file &&
              status !== "done"
            }
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition
              ${
                !file &&
                status !== "done"
                  ? "cursor-not-allowed bg-slate-200 text-slate-400"
                  : "bg-amber-500 text-white cursor-pointer hover:bg-amber-600"
                 
              }`}
          >
            {status === "done"
              ? "Import Again"
              : status === "uploading"
              ? "Uploading..."
              : "Start Import"}
          </button>
        </div>
      </div>
    </div>
  );
}