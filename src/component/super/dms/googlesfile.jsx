import React, { useEffect, useState } from "react";
import axios from "axios";
import { Cloud, ExternalLink, FileText, HardDrive, ShieldAlert } from "lucide-react";
import { Skeleton } from "../../skeleton";

const GoogleDriveFiles = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [googleAuthRequired, setGoogleAuthRequired] = useState(false);

  const startGoogleOAuth = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  const formatFileSize = (size) => {
    if (!size) return "Size unavailable";
    const units = ["B", "KB", "MB", "GB"];
    const unitIndex = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
    return `${(size / 1024 ** unitIndex).toFixed(unitIndex ? 1 : 0)} ${units[unitIndex]}`;
  };

  const fetchFiles = async () => {
    try {
      const token = sessionStorage.getItem("Token");

      if (!token) {
        setGoogleAuthRequired(true);
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/auth/list-files",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      setFiles(response.data.files || []);
    } catch (error) {
      console.error(error);

      const googleAuthMessage = error.response?.data?.message;
      if (googleAuthMessage === "AUTH_REQUIRED" || googleAuthMessage === "AUTH_EXPIRED") {
        setGoogleAuthRequired(true);
        return;
      }

      alert(error.response?.data?.message || "Failed to load Google Drive files.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-white p-4 font-['Roboto_Slab',serif] sm:p-6 lg:p-8" aria-busy="true" aria-label="Loading Google Drive files">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-60 rounded-lg" index={0} />
            <Skeleton className="h-4 w-80 max-w-full rounded-full opacity-60" index={1} />
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <div key={index} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-11 w-11 shrink-0 rounded-xl" index={index + 2} />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/5 rounded-full" index={index + 8} />
                    <Skeleton className="h-3 w-2/5 rounded-full opacity-60" index={index + 14} />
                  </div>
                </div>
                <Skeleton className="mt-6 h-3 w-4/5 rounded-full opacity-60" index={index + 20} />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (googleAuthRequired) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-slate-50/60 p-4 font-['Roboto_Slab',serif] sm:p-6">
        <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <ShieldAlert size={30} />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-slate-900">Connect Google Drive</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
            Your Google Drive connection is missing or has expired. Reconnect to view and manage your files.
          </p>
          <button
            type="button"
            onClick={startGoogleOAuth}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
          >
            <Cloud size={18} />
            Authorize Google Drive
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/60 p-4 font-['Roboto_Slab',serif] sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
              <HardDrive size={16} />
              Document Management
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Google Drive Files</h1>
            <p className="mt-2 text-sm text-slate-500">Browse your connected files in one place.</p>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 sm:self-auto">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Connected
          </div>
        </header>

      {files.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
          <FileText className="mx-auto text-slate-300" size={42} />
          <h2 className="mt-4 text-lg font-bold text-slate-800">No files found</h2>
          <p className="mt-2 text-sm text-slate-500">Your Google Drive does not contain any accessible files yet.</p>
        </section>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {files.map((file) => (
            <article key={file.id} className="group flex min-h-52 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/60">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FileText size={21} />
                  </div>
                  <h2 className="truncate text-sm font-bold text-slate-800" title={file.name}>{file.name}</h2>
                </div>
                <ExternalLink className="shrink-0 text-slate-300 transition group-hover:text-blue-500" size={17} />
              </div>
              <dl className="mt-7 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-xs">
                <div>
                  <dt className="text-slate-400">Type</dt>
                  <dd className="mt-1 truncate font-semibold text-slate-600" title={file.mimeType}>{file.mimeType || "Unknown"}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Size</dt>
                  <dd className="mt-1 font-semibold text-slate-600">{formatFileSize(Number(file.size))}</dd>
                </div>
              </dl>
              <a className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-blue-600 transition hover:text-blue-800" href={file.webViewLink} target="_blank" rel="noopener noreferrer">
                Open file <ExternalLink size={15} />
              </a>
            </article>
          ))}
        </div>
      )}
      </div>
    </main>
  );
};

export default GoogleDriveFiles;