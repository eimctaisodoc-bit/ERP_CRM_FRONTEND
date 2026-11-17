import React, { useEffect, useRef, useState } from "react";
import { renderAsync } from "docx-preview";
import { BuildSlaDocx } from "./doxwithwords"; // Adjust this import path

export default function DocumentPreview() {
    const containerRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // NEW: State to hold the generated Blob for downloading
    const [docxBlob, setDocxBlob] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const generateAndPreview = async () => {
            try {
                setIsLoading(true);
                
                // 1. Generate the Blob using your existing function
                const generatedBlob = await BuildSlaDocx();

                // 2. Ensure the component is still mounted
                if (isMounted) {
                    // Save the blob to state so the download button can access it
                    setDocxBlob(generatedBlob); 
                    
                    // 3. Render the Blob into the DOM if the container exists
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
                console.error("Failed to generate or render document:", err);
                if (isMounted) setError("Failed to load document preview.");
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        generateAndPreview();

        return () => {
            isMounted = false; // Cleanup to prevent memory leaks
        };
    }, []);

    // NEW: Function to handle downloading the generated file
    const handleDownload = () => {
        if (!docxBlob) return;
        
        // Create a temporary URL object pointing to the Blob
        const url = window.URL.createObjectURL(docxBlob);
        
        // Create an invisible anchor tag to trigger the download
        const link = document.createElement("a");
        link.href = url;
        link.download = "SLA_Document.docx"; // Change to your preferred default file name
        
        // Append to body, click, and clean up
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div style={styles.pageContainer}>
            {/* NEW: Toolbar for the Download Button */}
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
                    Download Word File
                </button>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div style={styles.statusMessage}>
                    Generating and loading document preview...
                </div>
            )}
            
            {/* Error State */}
            {error && (
                <div style={{ ...styles.statusMessage, color: "red" }}>
                    {error}
                </div>
            )}

            {/* The Document Container */}
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

// Basic inline styles for the viewer layout
const styles = {
    pageContainer: {
        width: "100%",
        height: "100vh", // Or adjust to fit your specific UI layout
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f1f5f9", // Matches your slate/blue theme vibe
    },
    toolbar: {
        padding: "12px 20px",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        justifyContent: "flex-end", // Aligns the button to the right
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        zIndex: 10
    },
    button: {
        padding: "8px 16px",
        backgroundColor: "#0ea5e9", // Slate/blue theme primary color
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
        color: "#64748B", // THEME.textMuted
    }
};