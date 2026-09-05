import { useState, useEffect } from "react";
import React from "react";
import Breadcrumb from "../breadGrum.jsx";
import { RecruitmentTable } from "./admin_hr/admin_hR_/recruTable.jsx";
import Attend_HR_Data_Table from "./admin_hr/atten_hr_table_Data.jsx";

const Admin_Hr_Page = () => {
  const [activeTab, setActiveTab] = useState("recruitment");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const tabs = [
    { id: "recruitment", label: "Recruitment", content: <RecruitmentTable /> },
    // { id: "attendance", label: "Attendance", content: <Attend_HR_Data_Table /> },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb Section */}
      <div className="  bg-white">
        {/* <div className="max-w-7xl mx-auto">
          <Breadcrumb />
        </div> */}
      </div>

      {/* Header Section */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">HR Management System</h1>
          <p className="text-gray-500 mt-1">Efficiently manage your employee operations .</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto flex px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 cursor-pointer text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-amber-600 text-amber-700 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-700 bg-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto p-4 bg-white">
        <div className="bg-white  p-4">
          {tabs.find(tab => tab.id === activeTab)?.content}
        </div>
      </div>
    </div>
  );
};

export default Admin_Hr_Page;