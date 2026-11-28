
import React from "react";
import { useGet } from "../../hooks/useGet";
import {
    Folder,
    File,
    FileText,
    FileImage,
    FileVideo,
    FileSpreadsheet,
    ExternalLink,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Skeleton } from "../../skeleton";
import GoogleDriveAuthError from "./googleDriveError";
import { GoogleDriveFolder } from "./folder_";

 const S_Documents = () => {
    const callbackAPi= import.meta.env.VITE_API_BACKEND_URL_Dev || import.meta.env.VITE_API_BACKEND_URL_PROD;
    const { useMe } = useAuth();

    const { role, id } = useMe?.data?.user?.decoded || {};

    const { getDMSFiles_ } = useGet({
        currentUser: { role, id },
        isAuthLoading: useMe?.isLoading,
        tag: "super_dms",
    });

    const files = getDMSFiles_?.data?.data || [];
    const dmsError = getDMSFiles_?.error;
    const isLoading = getDMSFiles_?.isLoading;
    const isError = getDMSFiles_?.isError;

    const errorData = dmsError?.response?.data;

    const isGoogleAuthError =
        errorData?.code === "GOOGLE_AUTH_EXPIRED" ||
        errorData?.error === "GOOGLE_AUTH_EXPIRED";
const handleGoogleReauthorization = () => {
    window.location.href = `${callbackAPi}/super_admin/dms/auth`;
};
    const getFileIcon = (mimeType) => {
        if (mimeType === "application/vnd.google-apps.folder")
            return <Folder className="text-amber-500" size={24} />;

        if (mimeType?.includes("image"))
            return <FileImage className="text-purple-500" size={24} />;

        if (mimeType?.includes("video"))
            return <FileVideo className="text-red-500" size={24} />;

        if (mimeType?.includes("spreadsheet"))
            return <FileSpreadsheet className="text-green-600" size={24} />;

        if (
            mimeType?.includes("pdf") ||
            mimeType?.includes("document")
        )
            return <FileText className="text-blue-500" size={24} />;

        return <File className="text-slate-500" size={24} />;
    };

    // Google Drive authorization error
    if (isError && isGoogleAuthError) {
        return (
            <GoogleDriveAuthError
                message={errorData?.message}
                onReauthorize={handleGoogleReauthorization}
                // http://localhost:5000/super_admin/dms/auth
            />
        );
    }

    // Other errors
    if (isError) {
        return (
            <div
                className="flex min-h-[320px] items-center justify-center bg-white p-6 text-center"
                role="alert"
            >
                <p className="text-sm text-slate-600">
                    {errorData?.message ||
                        "Something went wrong while processing DMS."}
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen space-y-5 bg-white p-4 sm:p-6">

            {/* Loading */}
            {isLoading ? (
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                    {Array.from({ length: 5 }, (_, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-3 border-b border-slate-100 py-4"
                        >
                            <Skeleton className="h-9 w-9 rounded-lg" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-2/5 rounded-full" />
                                <Skeleton className="h-3 w-1/4 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : files.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
                    <Folder className="mx-auto mb-3 text-slate-400" size={28} />
                    <p className="text-sm text-slate-500">
                        No files or folders found.
                    </p>
                </div>
            ) : (<GoogleDriveFolder files={files} />)}
        </div>
    );
};
export default S_Documents;