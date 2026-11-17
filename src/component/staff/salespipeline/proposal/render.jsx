import React, { useEffect, useRef, useState } from "react";
import { renderAsync } from "docx-preview";
import { BuildProposalDocx } from "./proposalPage";
// import { BuildProposalDocx } from "./proposalpage"; // Adjust this import path as needed


export default function ProposalPreview() {
    const containerRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // State to hold the generated proposal Blob for downloading
    const [docxBlob, setDocxBlob] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const generateAndPreview = async () => {
            try {
                setIsLoading(true);

                // 1. Generate the proposal Blob using your BuildProposalDocx function
                const generatedBlob = await BuildProposalDocx();

                // 2. Ensure component is still mounted
                if (isMounted) {
                    setDocxBlob(generatedBlob);

                    // 3. Render the Blob preview into the DOM
                    if (containerRef.current) {
                        await renderAsync(generatedBlob, containerRef.current, null, {
                            className: "docx-preview-container",
                            inWrapper: true,
                            ignoreWidth: false,
                            ignoreHeight: false,
                            ignoreFonts: false,
                            breakPages: true,
                        });
                    }
                }
            } catch (err) {
                console.error("Failed to generate or render proposal document:", err);
                if (isMounted) setError("Failed to load proposal document preview.");
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        generateAndPreview();

        return () => {
            isMounted = false; // Cleanup to prevent memory leaks
        };
    }, []);

    // Function to handle downloading the generated proposal file
    const handleDownload = () => {
        if (!docxBlob) return;

        const url = window.URL.createObjectURL(docxBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "EIMCTA_Business_Proposal.docx";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div style={styles.pageContainer}>
            {/* Toolbar with Download Button */}
            <div style={styles.toolbar}>
                <button
                    onClick={handleDownload}
                    disabled={!docxBlob || isLoading}
                    style={{
                        ...styles.button,
                        opacity: (!docxBlob || isLoading) ? 0.5 : 1,
                        cursor: (!docxBlob || isLoading) ? "not-allowed" : "pointer"
                    }}
                >
                    Download Proposal File (.docx)
                </button>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div style={styles.statusMessage}>
                    Generating and loading proposal document preview...
                </div>
            )}

            {/* Error State */}
            {error && (
                <div style={{ ...styles.statusMessage, color: "red" }}>
                    {error}
                </div>
            )}

            {/* The Document Preview Container */}
            <div
                ref={containerRef}
                style={{
                    flexGrow: 1,
                    overflowY: "auto",
                    display: isLoading || error ? "none" : "block"
                }}
            />
        </div>
    );
}

// Inline styles matching your EIMCTA slate/blue/amber design palette
const styles = {
    pageContainer: {
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f1f5f9",
    },
    toolbar: {
        padding: "12px 20px",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        justifyContent: "flex-end",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        zIndex: 10
    },
    button: {
        padding: "8px 16px",
        backgroundColor: "#2563EB", // Royal Blue theme accent
        color: "#ffffff",
        border: "none",
        borderRadius: "6px",
        fontSize: "14px",
        fontWeight: "600",
        fontFamily: "sans-serif",
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        transition: "all 0.2s ease-in-out",
    },
    statusMessage: {
        padding: "20px",
        textAlign: "center",
        fontFamily: "sans-serif",
        color: "#64748B",
    }
};