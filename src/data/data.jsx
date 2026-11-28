import React, { useState } from "react";
import {
  User,
  Phone,
  Briefcase,
  FileText,
  Mail,
  MapPin,
  Calendar,
  Building,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  LayoutDashboard,
  CreditCard,
  BarChart3,
  MessageCircle,
  ClipboardList,
  Settings,
  LogOut,
  BusFront,
  Building2,
  TrendingUp

} from "lucide-react";
import * as XLSX from "xlsx-js-style";
import html2canvas from "html2canvas";

import jsPDF from "jspdf";


const getUserRole = () => {
  try {
    const userData = sessionStorage.getItem("user");
    return userData ? JSON.parse(userData)?.jobRole : undefined;
  } catch (error) {
    console.error("Failed to read the user's job role from sessionStorage:", error);
    return undefined;
  }
};

const menus = {
  admin: [
    { name: "Dashboard", path: "/admin/report", icon: LayoutDashboard },
    { name: "HR Management", path: "/admin/hr", icon: Users },
    { name: "Finance", path: "/admin/finance", icon: CreditCard },
    { name: "Sales", path: "/admin/sales", icon: BarChart3 },
    // { name: "Tasks", path: "/admin/tasks", icon: ClipboardList },
    // { name: "Inbox", path: "/admin/inbox", icon: MessageCircle },
    { name: "Notes", path: "/admin/notes", icon: MessageCircle },
    { name: "Documents", path: "/admin/dms", icon: FileText },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ],

  admin_cro: [
    { name: "Dashboard", path: "/admin/report", icon: LayoutDashboard },
    { name: "Employee Management", path: "/admin/employee", icon: Users },
    { name: "HR", path: "/admin/hr", icon: Users },
    { name: "Finance", path: "/admin/finance", icon: CreditCard },
    { name: "Meeting", path: "/admin/meeting", icon: Calendar },
    { name: "Scheduling", path: "/admin/sales", icon: Calendar },
    { name: "Travel & Vehicle", path: "/admin/travel", icon: BusFront },
    { name: "Notes", path: "/admin/notes", icon: MessageCircle },
    { name: "Documents", path: "/admin/dms", icon: FileText },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ],

  super_admin: [
    { name: "Dashboard", path: "/super_admin/report", icon: LayoutDashboard },
    { name: "HR", path: "/super_admin/hr", icon: Users },
    { name: "Lead Management", path: "/super_admin/lead", icon: BarChart3 },
    { name: "Contract Management", path: "/super_admin/contract", icon: BarChart3 },
    { name: "Branch Management", path: "/super_admin/branch", icon: Building2 },
    { name: "Notes", path: "/super_admin/notes", icon: MessageCircle },
    { name: "Documents", path: "/super_admin/dms", icon: FileText },
    { name: "Settings", path: "/super_admin/settings", icon: Settings },
  ],

  client: [
    { name: "Dashboard", path: "/client/report", icon: LayoutDashboard },
    { name: "Tasks", path: "/client/tasks", icon: ClipboardList },
    { name: "Contracts", path: "/client/contracts", icon: Briefcase },
    { name: "Notes", path: "/client/notes", icon: MessageCircle },
    { name: "Documents", path: "/client/documents", icon: FileText },
    { name: "Profile", path: "/client/profile", icon: User },
  ],

  staff: [
    { name: "Dashboard", path: "/staff/report", icon: LayoutDashboard },
    { name: "HR Management", path: "/staff/hr", icon: Users },
    { name: "Sales", path: "/staff/contract", icon: BarChart3 },
    { name: "Notes", path: "/staff/notes", icon: MessageCircle },
    { name: "Documents", path: "/staff/dms", icon: FileText },
    { name: "Settings", path: "/staff/settings", icon: Settings },
  ],

  staff_sales: [
    { name: "Dashboard", path: "/staff/report", icon: LayoutDashboard },
    { name: "HR", path: "/staff/hr", icon: Users },
    { name: "Lead ", path: "/staff/lead", icon: BarChart3 },
    { name: "Contract", path: "/staff/contract", icon: BarChart3 },
    { name: "Notes", path: "/staff/note", icon: MessageCircle },
    { name: "Documents", path: "/staff/dms", icon: FileText },
    { name: "Settings", path: "/staff/settings", icon: Settings },
  ],

  staff_consultant: [
    { name: "Dashboard", path: "/staff/report", icon: LayoutDashboard },
    { name: "Task Schedule", path: "/staff/tasks", icon: ClipboardList },
    { name: "HR", path: "/staff/hr", icon: Users },
    { name: "Notes", path: "/staff/notes", icon: MessageCircle },
    { name: "Documents", path: "/staff/dms", icon: FileText },
    { name: "Settings", path: "/staff/settings", icon: Settings },
  ],

  staff_hr: [
    { name: "Dashboard", path: "/hr/report", icon: LayoutDashboard },
    { name: "Recruitment & Hiring", path: "/staff/hr/recruitment", icon: Briefcase },
    { name: "Employee Management", path: "/hr/employees", icon: Users },
    { name: "Attendance & Leave", path: "/hr/attendance", icon: Calendar },
    { name: "Payroll & Benefits", path: "/hr/payroll", icon: CreditCard },
    { name: "Notes", path: "/hr/notes", icon: MessageCircle },
    { name: "HR Settings", path: "/hr/settings", icon: Settings },
  ],
  digitalmarketing: [
    { name: "Dashboard", path: "/digital-marketing/report", icon: LayoutDashboard },

    {name: "Tasks",
      path: "/digital-marketing/tasks",
      icon: ClipboardList
    },
    { name: "Notes", path: "/digital-marketing/notes", icon: MessageCircle },
    { name: "Settings", path: "/digital-marketing/settings", icon: Settings },
  ]
};


const getMenusForUser = (role, jobRole = getUserRole()) => {
  const normalizedRole = role?.trim().toLowerCase();
  const normalizedJobRole = jobRole
    ?.trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

  // console.log(normalizedRole, normalizedJobRole);

  if (normalizedRole === "admin" && normalizedJobRole === "cro") {
    return menus.admin_cro;
  }

  if (normalizedRole === "staff" && normalizedJobRole === "sales") {
    return menus.staff_sales;
  }

  if (normalizedRole === "staff" && normalizedJobRole === "consultant") {
    return menus.staff_consultant;
  }

  if (normalizedRole === "staff" && normalizedJobRole === "hr") {
    return menus.staff_hr;
  }

  if (
    normalizedRole === "staff" &&
    normalizedJobRole === "digital_marketing"
  ) {
    return menus.digitalmarketing;
  }

  return menus[normalizedRole] || [];
};




const ClientEmp_form = [
  {
    title: "Personal",
    fullTitle: "Personal Information",
    icon: <User size={24} />,
    fields: [
      {
        name: "firstName",
        label: "First Name",
        type: "text",
        required: true,
        icon: <User size={16} />
      },
      {
        name: "middleName",
        label: "Middle Name",
        type: "text",
        icon: <User size={16} />
      },
      {
        name: "lastName",
        label: "Last Name",
        type: "text",
        required: true,
        icon: <User size={16} />
      },
      {
        name: "gender",
        label: "Gender",
        type: "select",
        options: ["Male", "Female"]
      },
      {
        name: "dob",
        label: "Date of Birth",
        type: "date",
        icon: <Calendar size={16} />
      },
      {
        name: "maritalStatus",
        label: "Marital Status",
        type: "select",
        options: ["Single", "Married", "Divorced",]
      },
      {
        name: "nationality",
        label: "Nationality",
        type: "select",
        options: ["Nepali", "Indian",]
      },
      {
        name: "citizenshipId",
        label: "National ID No.",
        type: "text"
      },
      {
        name: "profilePhoto",
        label: "Profile Photo",
        type: "file"
      }
    ]
  },

  {
    title: "Contact",
    fullTitle: "Contact Information",
    icon: <Phone size={24} />,
    fields: [
      {
        name: "officeEmail",
        label: "Office Email",
        type: "email",
        icon: <Mail size={16} />
      },
      {
        name: "personalEmail",
        label: "Personal Email",
        type: "email",
        icon: <Mail size={16} />
      },
      {
        name: "officeMobile",
        label: "Office Mobile",
        type: "text",
        icon: <Phone size={16} />
      },
      {
        name: "personalMobile",
        label: "Personal Mobile",
        type: "text",
        icon: <Phone size={16} />
      },
      {
        name: "permanentAddress",
        label: "Permanent Address",
        type: "text",
        icon: <MapPin size={16} />
      },
      {
        name: "currentAddress",
        label: "Current Address",
        type: "text",
        icon: <MapPin size={16} />
      }
    ]
  },

  {
    title: "Employment",
    fullTitle: "Employment & Organization",
    icon: <Briefcase size={24} />,
    fields: [

      // Organization
      {
        name: "department",
        label: "Department ",
        type: "select",
        options: [
          "Corporate HR",
          "Corporate CRO",
          "Corporate Reception",
          "Corporate Document Control",
          "Corporate ERP & IT",
          "Consultancy ",
          "Corporate Sales"
        ]
      },

      // Actual job position
      {
        name: "jobPosition",
        label: "Job Position",
        type: "select",
        options: [
          "HR Officer",
          "Finance Officer",
          "CRO",
          "Receptionist",
          " Document Controller",
          " ERP Developer",
          " ERP Maintenance",
          "Consultant ",

        ]
      },

      // Employment type
      {
        name: "employmentType",
        label: "Employment Type",
        type: "select",
        options: [
          "Permanent",
          "Contract",
          "Intern",
          "Trainee",
          "Part-Time"
        ]
      },

      {
        name: "dateOfJoining",
        label: "Join Date",
        type: "date",
        icon: <Calendar size={16} />
      },



      // Province
      {
        name: "province",
        label: "Province",
        type: "select",
        provinces: [
          {
            label: "Koshi Province",
            value: "koshi"
          },
          {
            label: "Madhesh Province",
            value: "madhesh"
          },
          {
            label: "Bagmati Province",
            value: "bagmati"
          },
          {
            label: "Gandaki Province",
            value: "gandaki"
          },
          {
            label: "Lumbini Province",
            value: "lumbini"
          },
          {
            label: "Karnali Province",
            value: "karnali"
          },
          {
            label: "Sudurpashchim Province",
            value: "sudurpashchim"
          }
        ]
      },

      // District depends on province
      {
        name: "district",
        label: "District",
        type: "select",
        dependsOn: "province",
        optionsSource: "districtsByProvince"
      },
      {
        name: "localLevel",
        label: "Local Level",
        type: "select",
        dependsOn: "district",
        optionsSource: "localLevelsByDistrict"
      },

      // Specific office / branch
      {
        name: "office",
        label: "Office / Branch",
        type: "select",
        dependsOn: "province",
        optionsSource: "officesByProvince"
      },

      // Reporting hierarchy
      {
        name: "reportingManager",
        label: "Reporting Manager",
        type: "select",
        dependsOn: [
          "department",
          "jobPosition",
          "office"
        ],
        optionsSource: "employees"
      }

    ]
  },

  {
    title: "Docs",
    fullTitle: "Documents & Experience",
    icon: <FileText size={24} />,
    fields: [
      // ─────────────────────────────
      // EXPERIENCE TYPE
      // ─────────────────────────────
      {
        name: "experienceType",
        label: "Experience Type",
        type: "radio",
        options: [
          {
            label: "Fresher",
            value: "fresher"
          },
          {
            label: "Experienced",
            value: "experienced"
          }
        ]
      },

      // ─────────────────────────────
      // TOTAL EXPERIENCE
      // ─────────────────────────────
      {
        name: "totalExperience",
        label: "Total Years of Experience",
        type: "number",
        min: 0,
        step: 0.5,
        required: true,
        condition: {
          field: "experienceType",
          value: "experienced"
        }
      },

      // ─────────────────────────────
      // PREVIOUS EXPERIENCE
      // ─────────────────────────────
      {
        name: "previousExperience",
        label: "Previous Experience",
        type: "repeatable",
        required: true,
        condition: {
          field: "experienceType",
          value: "experienced"
        },
        fields: [
          {
            name: "organization",
            label: "Institute / Organization",
            type: "text"
          },
          {
            name: "position",
            label: "Position",
            type: "text"
          },
          {
            name: "startDate",
            label: "Start Date",
            type: "date"
          },
          {
            name: "endDate",
            label: "End Date",
            type: "date"
          },
          {
            name: 'level',
            label: 'Level',
            type: 'select',
            options: ["Entry Level", "Mid Level", "Senior Level"]
          },
          {
            name: "tenure",
            label: "Tenure",
            type: "text",
            readOnly: true
          }
        ]
      },

      // ─────────────────────────────
      // DOCUMENTS
      // ─────────────────────────────
      {
        name: "resume",
        label: "Resume / CV",
        type: "file"
      },
      {
        name: "offerLetter",
        label: "Offer Letter",
        type: "file"
      },
      {
        name: "citizenDoc",
        label: "Citizenship / ID",
        type: "file"
      },
      {
        name: "qualification",
        label: "Qualification Certificate",
        type: "file"
      },
      {
        name: "training",
        label: "Training Certificate",
        type: "file"
      },
      {
        name: "experience",
        label: "Experience Certificate",
        type: "file",
        required: true,
        condition: {
          field: "experienceType",
          value: "experienced"
        }
      }
    ]
  }
];




const leaveManagementFields = {
  title: "Leave",
  fullTitle: "Leave Management",
  icon: <CheckCircle2 size={18} />,
  fields: [
    { name: "leaveId", label: "Leave ID", type: "text", icon: <FileText size={16} /> },
    { name: "employeeId", label: "Employee ID", type: "text", icon: <User size={16} /> },
    {
      name: "leaveType",
      label: "Leave Type",
      type: "select",
      options: ["Annual", "Sick", "Casual", "Unpaid"],
    },
    { name: "leaveStartDate", label: "Start Date", type: "date", icon: <Calendar size={16} /> },
    { name: "leaveEndDate", label: "End Date", type: "date", icon: <Calendar size={16} /> },
    { name: "totalLeaveDays", label: "Total Leave Days", type: "number" },
    { name: "leaveReason", label: "Reason", type: "text" },
    { name: "attachment", label: "Attachment", type: "file" },
    {
      name: "approvalStatus",
      label: "Approval Status",
      type: "select",
      options: ["Pending", "Approved", "Rejected"],
    },
    { name: "approvedBy", label: "Approved By", type: "text" },
    { name: "approvalDate", label: "Approval Date", type: "date", icon: <Calendar size={16} /> },
  ],
};
const attendanceManagementFields = {
  title: "Attendance",
  fullTitle: "Attendance Management",
  icon: <Clock size={18} />,
  fields: [
    { name: "attendanceId", label: "Attendance ID", type: "text", icon: <FileText size={16} /> },
    { name: "employeeId", label: "Employee ID", type: "text", icon: <User size={16} /> },
    { name: "date", label: "Date", type: "date", icon: <Calendar size={16} /> },
    { name: "checkInTime", label: "Check-in Time", type: "time", icon: <Clock size={16} /> },
    { name: "checkOutTime", label: "Check-out Time", type: "time", icon: <Clock size={16} /> },
    { name: "breakTime", label: "Break Time (hrs)", type: "number" },
    { name: "totalWorkingHours", label: "Total Working Hours", type: "number" },
    { name: "overtimeHours", label: "Overtime Hours", type: "number" },
    {
      name: "attendanceMode",
      label: "Attendance Mode",
      type: "select",
      options: ["Manual", "Biometric", "App"],
    },
    {
      name: "attendanceStatus",
      label: "Attendance Status",
      type: "select",
      options: ["Present", "Absent", "Late", "Half Day"],
    },
    { name: "remarks", label: "Remarks", type: "text", icon: <AlertCircle size={16} /> },
  ],
};

const Dropstyle = (w, fs, isDisabled = false) => ({
  control: (base, state) => ({
    ...base,
    minHeight: w,
    borderRadius: "5px",
    borderColor: state.isFocused ? "#f59e0b" : "#e2e8f0",
    boxShadow: "none",
    fontSize: fs,
    cursor: isDisabled ? "not-allowed" : "pointer",
    opacity: isDisabled ? 0.6 : 1,
    "&:hover": {
      borderColor: isDisabled ? "#e2e8f0" : "#f59e0b",
    },
  }),

  valueContainer: (base) => ({
    ...base,
    padding: "0 12px",
  }),

  placeholder: (base) => ({
    ...base,
    color: "#94a3b8",
    fontWeight: 500,
  }),

  singleValue: (base) => ({
    ...base,
    color: "#0f172a",
    fontWeight: 600,
  }),

  menu: (base) => ({
    ...base,
    borderRadius: "5px",
    overflow: "hidden",
    zIndex: 30,
    boxShadow: "0 10px 12px rgba(15, 23, 42, 0.15)",
    marginTop: "4px",
  }),

  menuList: (base) => ({
    ...base,
    padding: 0,
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  }),

  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#0f172a"
      : state.isFocused
        ? "#e2e8f0"
        : "#ffffff",
    color: state.isSelected ? "#ffffff" : "#1e293b",
    fontSize: fs,
    fontWeight: 500,
    cursor: isDisabled ? "not-allowed" : "pointer",
    borderBottom: "1px solid #e2e8f0",
    ":active": {
      backgroundColor: "#0f172a",
      color: "#ffffff",
    },
  }),
});

const ValidateStyle = ({
  hasError = false,
  hasDisable = false,
  height = "48px",
  radius = "12px",
  fontSize = "14px",
  border = "1px solid #e2e8f0",
  focusBorder = "1px solid #f59e0b",
  errorBorder = "1px solid #ef4444",
  disabledBorder = "1px solid #cbd5e1",
  menuRadius = "12px",
  optionRadius = "8px",
} = {}) => ({
  control: (base, state) => ({
    ...base,
    minHeight: height === "auto" ? "48px" : height,
    height: height === "auto" ? "auto" : height,
    borderRadius: radius,
    fontSize,
    backgroundColor:
      hasDisable || state.isDisabled ? "#f1f5f9" : "#ffffff",
    border:
      hasDisable || state.isDisabled
        ? disabledBorder
        : hasError
          ? errorBorder
          : state.isFocused
            ? focusBorder
            : border,
    boxShadow:
      hasDisable || state.isDisabled
        ? "none"
        : state.isFocused
          ? hasError
            ? "0 0 0 3px rgba(239, 68, 68, 0.15)"
            : "0 0 0 3px rgba(245, 158, 11, 0.18)"
          : "none",
    opacity: hasDisable || state.isDisabled ? 0.65 : 1,
    cursor: hasDisable || state.isDisabled ? "not-allowed" : "pointer",
    overflow: "visible",
    transition: "all 0.2s ease",

    "&:hover": {
      border:
        hasDisable || state.isDisabled
          ? disabledBorder
          : hasError
            ? errorBorder
            : focusBorder,
    },
  }),

  valueContainer: (base) => ({
    ...base,
    minHeight: height === "auto" ? "48px" : height,
    height: height === "auto" ? "auto" : height,
    padding: "0 12px",
    fontSize,
    flexWrap: "wrap",
  }),

  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
    fontSize,
  }),

  placeholder: (base) => ({
    ...base,
    color: "#94a3b8",
    fontWeight: 500,
    fontSize,
  }),

  singleValue: (base, state) => ({
    ...base,
    color: hasDisable || state.isDisabled ? "#94a3b8" : "#0f172a",
    fontWeight: 600,
    fontSize,
  }),

  indicatorsContainer: (base) => ({
    ...base,
    minHeight: height === "auto" ? "48px" : height,
    height: height === "auto" ? "auto" : height,
    alignItems: "center",
  }),

  dropdownIndicator: (base, state) => ({
    ...base,
    padding: "4px",
    color:
      hasDisable || state.isDisabled
        ? "#cbd5e1"
        : state.isFocused
          ? "#f59e0b"
          : "#64748b",

    "&:hover": {
      color:
        hasDisable || state.isDisabled
          ? "#cbd5e1"
          : "#f59e0b",
    },
  }),

  clearIndicator: (base) => ({
    ...base,
    padding: "4px",
    display: hasDisable ? "none" : "flex",
    color: "#94a3b8",

    "&:hover": {
      color: "#ef4444",
    },
  }),

  indicatorSeparator: () => ({
    display: "none",
  }),

  menu: (base) => ({
    ...base,
    width: "100%",
    minWidth: "100%",
    maxWidth: "380px",
    borderRadius: menuRadius,
    zIndex: 9999,
    border: "1px solid #e5e7eb",
    backgroundColor: "#ffffff",
    boxShadow: "0 12px 20px rgba(0,0,0,0.08)",
    marginTop: "6px",
    padding: "6px",
    overflow: "hidden",
  }),

  menuList: (base) => ({
    ...base,
    maxHeight: "200px",
    overflowY: "auto",
    padding: 0,
    scrollbarWidth: "thin",
  }),

  option: (base, state) => ({
    ...base,
    backgroundColor: state.isDisabled
      ? "#f8fafc"
      : state.isSelected
        ? "#0f172a"
        : state.isFocused
          ? "#fef3c7"
          : "transparent",

    color: state.isDisabled
      ? "#94a3b8"
      : state.isSelected
        ? "#ffffff"
        : "#334155",

    borderRadius: optionRadius,
    marginBlock: "2px",
    padding: "10px 12px",
    fontSize,
    fontWeight: 500,
    cursor: state.isDisabled ? "not-allowed" : "pointer",
    whiteSpace: "normal",
    wordBreak: "break-word",
    transition: "all 0.2s ease",
  }),

  multiValue: (base, { data }) => ({
    ...base,
    backgroundColor: data.color || "#1e293b",
    borderRadius: "8px",
    paddingLeft: "4px",
  }),

  multiValueLabel: (base) => ({
    ...base,
    color: "#ffffff",
    fontWeight: 600,
    fontSize,
  }),

  multiValueRemove: (base, { data }) => ({
    ...base,
    color: "#ffffff",
    borderRadius: "6px",

    ":hover": {
      backgroundColor: data.color || "#1e293b",
      color: "#ffffff",
    },
  }),
});

const getInputClass = (hasError = false, hasDisable = false) => {
  const disabled = hasDisable;
  return `
            w-full min-h-[48px] rounded-xl px-3 py-2.5 text-sm font-medium outline-none transition-all duration-200
            ${disabled
      ? 'bg-slate-100 border border-slate-300 text-slate-400 cursor-not-allowed opacity-65 pointer-events-none'
      : 'bg-white text-slate-900'}
            ${!disabled && hasError
      ? 'border border-red-500 focus:border-red-500 focus:ring-[3px] focus:ring-red-200'
      : !disabled
        ? 'border border-slate-200 focus:border-amber-500 focus:ring-[3px] focus:ring-amber-200'
        : ''}
            placeholder:text-slate-400
        `;
};


const getCountdown = (target, warningMinutes = 15) => {
  const targetTime = new Date(target).getTime();
  const now = new Date().getTime();
  const diff = targetTime - now;

  const warningMs = warningMinutes * 60 * 1000;
  const isExpired = diff <= 0;
  const isWarning = !isExpired && diff <= warningMs;

  // Calculate remaining units
  const remaining = {
    days: Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24))),
    hours: Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24)),
    minutes: Math.max(0, Math.floor((diff / 1000 / 60) % 60)),
    seconds: Math.max(0, Math.floor((diff / 1000) % 60)),
    totalMs: Math.max(0, diff)
  };

  return { isExpired, isWarning, remaining };
};

// use this way for timer
// const deadline = "2026-04-28T17:46:00";

// You can call this inside a setInterval or a RequestAnimationFrame
// const status = getCountdown(deadline, 15);

// if (status.isExpired) {
//   console.log("Status: Finished");
// } else if (status.isWarning) {
//   console.log("Status: Final 15-minute stretch!");
// }

// console.log(`Time left: ${status.remaining.days}d ${status.remaining.hours}h`);

const organizations = [
  {
    address: "Kathmandu, Nepal",
    contactPersonEmail: "ram@example.com",
    contactPersonName: "Ram Bahadur",
    contactPersonNumber: "9841234567",
    createdAt: "2026-04-23T10:24:56.300Z",
    industyType: [],
    organizationName: "Elite English boarding school",
    organizationType: "",
    registrationNumber: "REG-123456",
    role: "Director",
    totalEducator: null,
    totalEmp_learners: 50,
    updatedAt: "2026-04-23T10:24:56.300Z",
    vatPan: "PAN-987654",
    _id: "69e9f378d350a606553a29fb",
  },
];

// const result = checkArrayObjectsEmpty(organizations);

// console.log(result);

// Download functions for stage 5 contract actions
const downloadAsPdf = async (element, fileName = "download.pdf") => {
  if (!element) {
    alert("PDF content not found");
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;

      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

      heightLeft -= pageHeight;
    }

    pdf.save(fileName);
  } catch (error) {
    console.error("PDF download error:", error);
    alert("PDF download failed");
  }
};

const downloadMultiplePdf = async (pdfItems = []) => {
  if (!pdfItems.length) {
    alert("No PDF items found");
    return;
  }

  for (const item of pdfItems) {
    await downloadAsPdf(item.element, item.fileName);

    // Small delay for multiple browser downloads
    await sleep(600);
  }
}

// filter all stages with _id
function extractStageData(data, stage) {
  // console.log('from fb define api data',data)
  const userData = data?.user || data;
  const stageKey = `Stage${stage}`;

  // console.log("stageKey:", stageKey);
  // console.log("userData:", userData);
  // console.log("details:", userData?.details);

  if (!Array.isArray(userData?.details)) {
    // console.log("details not found or not array");
    return [];
  }

  const result = userData.details.flatMap((detail) => {
    // console.log('details::::',detail)
    const stageArray = detail?.stages?.[stageKey];

    // console.log("Detail ID:", detail?._id);
    // console.log("Stage Array:", stageArray);

    if (!Array.isArray(stageArray)) {
      return [];
    }

    return stageArray.map((stageItem) => {
      // console.log("Stage Item:", stageItem);

      return {
        MainID: userData?._id,
        DetailsID: detail?._id,
        // [stageKey]: stageItem?._id,
      };
    });
  });

  // console.log("Final Result:", result);

  return result;
}




const downloadHolidayExcel = () => {
  const data = [
    {
      "S.N": 1,
      "Holiday Title": "Dashain Festival",
      "Date (BS)": "2083-07-04",
    },
    {
      "S.N": 2,
      "Holiday Title": "Tihar Festival",
      "Date (BS)": "2083-07-22",
    },
    {
      "S.N": 3,
      "Holiday Title": "Christmas",
      "Date (BS)": "2083-09-10",
    },
  ];

  const workbook = XLSX.utils.book_new();

  // EIMCTA professional palette
  const COLORS = {
    amber: "D97706",
    amberLight: "FEF3C7",
    amberPale: "FFFBEB",
    slate: "334155",
    slateDark: "1E293B",
    slateLight: "F1F5F9",
    white: "FFFFFF",
    text: "334155",
    muted: "64748B",
    border: "CBD5E1",
    greenLight: "F0FDF4",
  };

  const worksheet = XLSX.utils.aoa_to_sheet([
    [
      "EVEREST INTERNATIONAL MANAGEMENT CONSULTANCY & TRAINING AGENCY (EIMCTA)",
    ],
    [
      "Kagesworimanohara-05, Kathmandu, Nepal | everestconsultrain.com | +977-01-5903211 | info@everestconsultrain.com",
    ],
    ["HOLIDAY SCHEDULE — BULK UPLOAD TEMPLATE"],
    [
      "Instructions: Enter one holiday per row. Use the BS date format YYYY-MM-DD. Keep the column headings unchanged.",
    ],
    [""],
    ["S.N", "Holiday Title", "Date (BS)"],
  ]);

  // Add sample data starting from row 7 (A7)
  XLSX.utils.sheet_add_json(worksheet, data, {
    origin: "A7",
    skipHeader: true,
  });

  const range = XLSX.utils.decode_range(worksheet["!ref"]);
  const lastDataRow = range.e.r;

  // Merge company heading, contact line, title, and instructions
  worksheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 2 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 2 } },
  ];

  // Reusable cell styles
  const border = {
    top: { style: "thin", color: { rgb: COLORS.border } },
    bottom: { style: "thin", color: { rgb: COLORS.border } },
    left: { style: "thin", color: { rgb: COLORS.border } },
    right: { style: "thin", color: { rgb: COLORS.border } },
  };

  const applyStyle = (cell, style) => {
    if (worksheet[cell]) {
      worksheet[cell].s = style;
    }
  };

  // Company heading
  applyStyle("A1", {
    font: {
      name: "Calibri",
      bold: true,
      sz: 14,
      color: { rgb: COLORS.white },
    },
    fill: { fgColor: { rgb: COLORS.slateDark } },
    alignment: {
      horizontal: "center",
      vertical: "center",
      wrapText: true,
    },
  });

  // Contact details
  applyStyle("A2", {
    font: {
      name: "Calibri",
      sz: 9,
      color: { rgb: COLORS.slate },
    },
    fill: { fgColor: { rgb: COLORS.slateLight } },
    alignment: {
      horizontal: "center",
      vertical: "center",
      wrapText: true,
    },
  });

  // Document title
  applyStyle("A3", {
    font: {
      name: "Calibri",
      bold: true,
      sz: 15,
      color: { rgb: COLORS.white },
    },
    fill: { fgColor: { rgb: COLORS.amber } },
    alignment: {
      horizontal: "center",
      vertical: "center",
      wrapText: true,
    },
  });

  // Instructions
  applyStyle("A4", {
    font: {
      name: "Calibri",
      italic: true,
      sz: 10,
      color: { rgb: "78350F" },
    },
    fill: { fgColor: { rgb: COLORS.amberLight } },
    alignment: {
      horizontal: "left",
      vertical: "center",
      wrapText: true,
    },
  });

  // Table header
  const headerStyle = {
    font: {
      name: "Calibri",
      bold: true,
      sz: 11,
      color: { rgb: COLORS.white },
    },
    fill: { fgColor: { rgb: COLORS.slate } },
    alignment: {
      horizontal: "center",
      vertical: "center",
      wrapText: true,
    },
    border,
  };

  ["A6", "B6", "C6"].forEach((cell) =>
    applyStyle(cell, headerStyle)
  );

  // Table body with alternating row colors
  for (let R = 6; R <= lastDataRow; R++) {
    for (let C = 0; C <= 2; C++) {
      const address = XLSX.utils.encode_cell({
        r: R,
        c: C,
      });

      if (!worksheet[address]) continue;

      if (R === 6) continue;

      const isAlternate = R % 2 === 0;

      worksheet[address].s = {
        font: {
          name: "Calibri",
          sz: 10,
          color: { rgb: COLORS.text },
        },
        fill: {
          fgColor: {
            rgb: isAlternate
              ? COLORS.amberPale
              : COLORS.white,
          },
        },
        alignment: {
          horizontal: C === 1 ? "left" : "center",
          vertical: "center",
          wrapText: true,
        },
        border,
      };
    }
  }

  // Add blank upload rows for future entries
  const templateRows = 20;
  const firstBlankRow = lastDataRow + 1;
  const finalRow = Math.max(
    lastDataRow,
    firstBlankRow + templateRows - 1
  );

  for (let R = firstBlankRow; R <= finalRow; R++) {
    for (let C = 0; C <= 2; C++) {
      const address = XLSX.utils.encode_cell({
        r: R,
        c: C,
      });

      worksheet[address] = {
        t: "s",
        v: "",
        s: {
          font: {
            name: "Calibri",
            sz: 10,
            color: { rgb: COLORS.text },
          },
          fill: {
            fgColor: {
              rgb: R % 2 === 0
                ? COLORS.amberPale
                : COLORS.white,
            },
          },
          alignment: {
            horizontal: C === 1 ? "left" : "center",
            vertical: "center",
          },
          border,
        },
      };
    }
  }

  // Legal footer below the table
  const footerRow = finalRow + 2;

  worksheet[`A${footerRow + 1}`] = {
    t: "s",
    v: "© EIMCTA | Confidential internal template. Please verify holiday titles and B.S. dates before uploading.",
    s: {
      font: {
        name: "Calibri",
        italic: true,
        sz: 9,
        color: { rgb: COLORS.muted },
      },
      alignment: {
        horizontal: "left",
        vertical: "center",
        wrapText: true,
      },
    },
  };

  worksheet["!merges"].push({
    s: { r: footerRow, c: 0 },
    e: { r: footerRow, c: 2 },
  });

  // Column widths
  worksheet["!cols"] = [
    { wch: 10 },
    { wch: 38 },
    { wch: 20 },
  ];

  // Row heights
  worksheet["!rows"] = [
    { hpt: 30 },
    { hpt: 24 },
    { hpt: 34 },
    { hpt: 32 },
    { hpt: 8 },
    { hpt: 26 },
  ];

  // Date validation: accept ISO-style B.S. date entries.
  // Excel validation is a usability aid; validate again in the backend.
  if (!worksheet["!dataValidation"]) {
    worksheet["!dataValidation"] = [];
  }

  worksheet["!dataValidation"].push({
    type: "textLength",
    operator: "equal",
    formula1: "10",
    sqref: `C7:C${finalRow + 1}`,
    showErrorMessage: true,
    errorTitle: "Invalid date format",
    error: "Enter the B.S. date as YYYY-MM-DD.",
    showInputMessage: true,
    promptTitle: "B.S. Date",
    prompt: "Example: 2083-07-04",
  });

  // Freeze headings and enable filters on the actual data table
  worksheet["!freeze"] = {
    xSplit: 0,
    ySplit: 6,
    topLeftCell: "A7",
    activePane: "bottomLeft",
    state: "frozen",
  };

  worksheet["!autofilter"] = {
    ref: `A6:C${lastDataRow}`,
  };

  // Print settings
  worksheet["!pageSetup"] = {
    paperSize: 9,
    orientation: "portrait",
    fitToWidth: 1,
    fitToHeight: 0,
  };

  worksheet["!fitToPage"] = true;

  worksheet["!margins"] = {
    left: 0.35,
    right: 0.35,
    top: 0.5,
    bottom: 0.5,
    header: 0.2,
    footer: 0.2,
  };

  worksheet["!headerFooter"] = {
    oddHeader: "&LEIMCTA - Holiday Schedule&R&D",
    oddFooter:
      "&Linfo@everestconsulting.com&CPage &P of &N&R&F",
  };

  worksheet["!views"] = [
    { showGridLines: false },
  ];

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Holiday Upload"
  );

  XLSX.writeFile(
    workbook,
    "EIMCTA_Holiday_Bulk_Upload.xlsx"
  );
};


// this for upload excel file only


const useReadExcelFile = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const readExcelFile = (file) =>
    new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error("No file selected"));
        return;
      }

      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const workbook = XLSX.read(event.target.result, {
            type: "array",
          });

          const sheetName = workbook.SheetNames[0];

          if (!sheetName) {
            throw new Error("Excel sheet not found");
          }

          const worksheet = workbook.Sheets[sheetName];

          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            defval: "",
            range: 5,
            blankrows: false,
          });

          const holidays = jsonData
            .map((item) => ({
              title: String(item["Holiday Title"] || "").trim(),
              date: String(item["Date (BS)"] || "").trim(),
            }))
            .filter((holiday) => holiday.title && holiday.date);

          resolve(holidays);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () =>
        reject(new Error("Failed to read the Excel file"));

      reader.readAsArrayBuffer(file);
    });

  const handleExcelUpload = async (file) => {
    try {
      setLoading(true);
      setError("");

      const result = await readExcelFile(file);
      setHolidays(result);

      return result;
    } catch (error) {
      setHolidays([]);
      setError(error.message || "Failed to read Excel file");
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    holidays,
    loading,
    error,
    readExcelFile: handleExcelUpload,
  };
};

const formatNepaliDate = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('T')[0].split('-');
  const months = ['Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin', 'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'];
  return `${months[m - 1]} ${d}, ${y}`;
};
const formatNepaliNumeric = (iso) => iso ? iso.split('T')[0].replaceAll('-', '/') : '';


export {
  formatNepaliNumeric, formatNepaliDate,
  useReadExcelFile, extractStageData, downloadMultiplePdf, downloadHolidayExcel,
  downloadAsPdf, ClientEmp_form, leaveManagementFields,
  organizations, attendanceManagementFields, menus, getCountdown,
  Dropstyle, ValidateStyle, getInputClass, getUserRole, getMenusForUser
};