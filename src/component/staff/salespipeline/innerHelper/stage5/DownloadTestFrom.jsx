import React, { useState } from "react";
// ... your existing imports (Lucide icons, images, etc.)

// Import the generator function you just created
import { BuildSlaDocx } from "../stage5/testFront.jsx";

// ... your existing CONSTANTS (INSTALLMENTS, BANKS, etc.) ...

export const DownloadTestFront = () => {
  // Add a loading state to disable the button while generating
  const [isGenerating, setIsGenerating] = useState(false);

  // The function to handle the download process
  const handleDownloadDocx = async () => {
    try {
      setIsGenerating(true);

      // 1. Generate the raw file data (Blob)
      const blob = await BuildSlaDocx();

      // 2. Create a temporary local URL for the Blob
      const url = window.URL.createObjectURL(blob);

      // 3. Create an invisible anchor <a> element
      const link = document.createElement("a");
      link.href = url;
      link.download = "EIMCTA_SLA_Contract.docx"; // Set the desired file name

      // 4. Simulate a click on the anchor to trigger the download
      document.body.appendChild(link);
      link.click();

      // 5. Clean up the temporary URL and anchor
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Failed to generate document:", error);
      alert("Failed to generate the Word document. Check console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        paddingLeft: "1rem",
        paddingRight: "1rem",
        paddingTop: "2rem",
        paddingBottom: "2rem",
        fontFamily: "Roboto, Helvetica, sans-serif",
      }}
    >
      <style>{/* ... your existing print styles ... */}</style>

      {/* --- ADD THIS DOWNLOAD BUTTON HEADER --- */}
      <div
        className="no-print"
        style={{
          maxWidth: "794px",
          margin: "0 auto 1rem auto",
          display: "flex",
          justifyContent: "flex-end"
        }}
      >
        <button
          onClick={handleDownloadDocx}
          disabled={isGenerating}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#2563eb",
            color: "white",
            padding: "10px 16px",
            borderRadius: "6px",
            border: "none",
            fontWeight: "bold",
            cursor: isGenerating ? "wait" : "pointer",
            opacity: isGenerating ? 0.7 : 1,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          {isGenerating ? "Generating DOCX..." : "Download Word Document"}
        </button>
      </div>
      {/* --------------------------------------- */}

      {/* Your existing A4 Document Shell */}
      <div className="doc-shell" style={{ /* ... */ }}>
        {/* ... rest of your document content ... */}
      </div>
    </div>
  );
};

export default DownloadTestFront;