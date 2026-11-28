import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { AlertTriangle, RefreshCw, Lock, XCircle } from "lucide-react";

const BRAND = "bg-gradient-to-r from-amber-500 to-orange-500";

const FOCUS =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 focus-visible:ring-offset-2";

const btnBase = `inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS}`;

const btnPrimary = `${btnBase} ${BRAND} text-white shadow-sm hover:shadow-md`;

const btnSecondary = `${btnBase} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`;

const DEFAULT_MESSAGE =
    "The connection to Google Drive is no longer valid. Authorization has expired or been revoked.";

const GoogleDriveAuthError = ({
    message = DEFAULT_MESSAGE,
    onReauthorize,
    onRetry,
    isReauthorizing = false,
}) => {
    const { useMe } = useAuth();
    const role = useMe?.data?.user?.decoded?.role;

    const isSuperAdmin = role === "super_admin";
    const canReauthorize = Boolean(onReauthorize) && !isReauthorizing;

    return (
        <div
            role="alert"
            aria-live="polite"
            className="flex min-h-[320px] w-full items-center justify-center bg-white p-5 sm:p-8"
        >
            <section className="w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {/* Accent bar */}
                <div className={`h-1 w-full ${BRAND}`} aria-hidden="true" />

                <div className="p-6 sm:p-7">
                    {/* Header */}
                    <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-amber-50">
                            <AlertTriangle
                                size={20}
                                className="text-amber-600"
                                aria-hidden="true"
                            />
                        </div>

                        <div className="min-w-0">
                            <h2 className="text-base font-bold text-slate-900">
                                Google Drive connection required
                            </h2>
                            <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                                {message}
                            </p>
                        </div>
                    </div>

                    {/* Impact note */}
                    <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-red-100 bg-red-50/60 p-3.5">
                        <XCircle
                            size={16}
                            className="mt-0.5 shrink-0 text-red-500"
                            aria-hidden="true"
                        />
                        <div>
                            <p className="text-xs font-semibold text-slate-800">
                                Work is currently on hold
                            </p>
                            <p className="mt-1 text-xs font-medium leading-5 text-slate-600">
                                All workers and clients are unable to continue
                                their work. Every branch is disconnected, so no
                                work can be pushed until access is restored.
                            </p>
                        </div>
                    </div>

                    {/* Reason note */}
                    <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-amber-100 bg-amber-50/60 p-3.5">
                        <AlertTriangle
                            size={16}
                            className="mt-0.5 shrink-0 text-amber-600"
                            aria-hidden="true"
                        />
                        <div>
                            <p className="text-xs font-semibold text-slate-800">
                                Why is reauthorization required?
                            </p>
                            <p className="mt-1 text-xs font-medium leading-5 text-slate-600">
                                For security purposes, the access token expires
                                60 days after it is generated. To continue
                                working, click the button below to reauthorize
                                Google Drive.
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    {isSuperAdmin ? (
                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            {onRetry && (
                                <button
                                    type="button"
                                    onClick={onRetry}
                                    disabled={isReauthorizing}
                                    className={btnSecondary}
                                >
                                    Retry
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={onReauthorize}
                                disabled={!canReauthorize}
                                aria-busy={isReauthorizing}
                                className={btnPrimary}
                            >
                                <RefreshCw
                                    size={14}
                                    aria-hidden="true"
                                    className={
                                        isReauthorizing
                                            ? "animate-spin motion-reduce:animate-none"
                                            : ""
                                    }
                                />
                                {isReauthorizing
                                    ? "Connecting…"
                                    : "Reauthorize Google Drive"}
                            </button>
                        </div>
                    ) : (
                        <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-slate-200 bg-white p-3.5">
                            <Lock
                                size={15}
                                className="mt-0.5 shrink-0 text-slate-400"
                                aria-hidden="true"
                            />
                            <p className="text-xs font-medium leading-5 text-slate-600">
                                Reconnecting Google Drive requires Super Admin
                                permissions. Please contact your administrator
                                to restore access.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default GoogleDriveAuthError;