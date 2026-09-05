import React from "react";
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

} from "lucide-react";
import * as XLSX from "xlsx-js-style";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const menus = {
  admin: [
    { name: "Dashboard", path: "/admin/report", icon: LayoutDashboard },
    { name: "HR Management", path: "/admin/hr", icon: Users },
    { name: "Finance", path: "/admin/finance", icon: CreditCard },
    { name: "Sales", path: "/admin/sales", icon: BarChart3 },
    // { name: "Tasks", path: "/admin/tasks", icon: ClipboardList },
    { name: "DMS", path: "/admin/dms", icon: FileText },
    // { name: "Inbox", path: "/admin/inbox", icon: MessageCircle },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ],
  super_admin: [
    { name: "Dashboard", path: "/super_admin/report", icon: LayoutDashboard },
    { name: "HR Management", path: "/super_admin/hr", icon: Users },
    { name: "Finance", path: "/super_admin/finance", icon: CreditCard },
    { name: "Sales", path: "/super_admin/sales", icon: BarChart3 },
    // { name: "Tasks", path: "/super_admin/tasks", icon: ClipboardList },
    { name: "DMS", path: "/super_admin/dms", icon: FileText },
    // { name: "Inbox", path: "/super_admin/comm", icon: MessageCircle },
    { name: "Settings", path: "/super_admin/settings", icon: Settings },
  ],
  client: [
    { name: "Dashboard", path: "/client/report", icon: LayoutDashboard },
    { name: "My Orders", path: "/client/hr", icon: ClipboardList },
    { name: "Profile", path: "/client/profile", icon: User },
    { name: "Support", path: "/client/support", icon: MessageCircle },
  ],
  staff: [
    { name: "Dashboard", path: "/staff/report", icon: LayoutDashboard },
    { name: "HR Management", path: "/staff/hr", icon: Users },
    // { name: "Finance", path: "/staff/finance", icon: CreditCard },
    { name: "Sales", path: "/staff/sales", icon: BarChart3 },
    // { name: "Tasks", path: "/staff/tasks", icon: ClipboardList },
    { name: "DMS", path: "/staff/dms", icon: FileText },
    // { name: "Attendance", path: "/staff/attendance", icon: ClipboardList },
    { name: "Settings", path: "/staff/settings", icon: User },
  ],
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
        options: ["Male", "Female", "Other"]
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
        options: ["Single", "Married", "Divorced", "Widowed"]
      },
      {
        name: "nationality",
        label: "Nationality",
        type: "select",
        options: ["Nepali", "Indian", "Other"]
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
        label: "Department / Function",
        type: "select",
        options: [
          "Corporate HR",
          "Corporate Finance",
          "Corporate CRO",
          "Corporate Reception",
          "Corporate Document Control",
          "Corporate ERP & IT",
          "Consultancy ",
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

      // Application access level
    

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

     

      // Main or Branch
      {
        name: "officeType",
        label: "Office Type",
        type: "select",
        options: [
          "Main Office",
          "Branch Office"
        ]
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

const Dropstyle = (w, fs) => ({
  control: (base, state) => ({
    ...base,

    minHeight: w,
    borderRadius: "5px",
    borderColor: state.isFocused ? "#f59e0b" : "#e2e8f0",
    boxShadow: "none",
    fontSize: fs,//14
    "&:hover": {
      borderColor: "#f59e0b",
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
      ? "#0f172a" // slate-900 active/selected
      : state.isFocused
        ? "#e2e8f0" // slate-200 hover
        : "#ffffff",

    color: state.isSelected
      ? "#ffffff"
      : "#1e293b",

    fontSize: fs,
    fontWeight: 500,
    cursor: "pointer",
    borderBottom: "1px solid #e2e8f0",

    ":active": {
      backgroundColor: "#0f172a", // slate-900 on click
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
    console.log("details not found or not array");
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

  console.log("Final Result:", result);

  return result;
}




const downloadHolidayExcel = () => {
  // BULK HOLIDAY DATA (BS DATE)
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

  // CREATE SHEET
  const worksheet = XLSX.utils.json_to_sheet(data, {
    origin: "A3",
  });

  // TITLE
  worksheet["A1"] = {
    t: "s",
    v: "Holiday Schedule Sample",
    s: {
      font: {
        bold: true,
        sz: 18,
        color: { rgb: "FFFFFF" },
      },
      fill: {
        fgColor: { rgb: "F59E0B" },
      },
      alignment: {
        horizontal: "center",
        vertical: "center",
      },
      border: {
        top: { style: "thin", color: { rgb: "F59E0B" } },
        bottom: { style: "thin", color: { rgb: "F59E0B" } },
        left: { style: "thin", color: { rgb: "F59E0B" } },
        right: { style: "thin", color: { rgb: "F59E0B" } },
      },
    },
  };

  // MERGE TITLE (A1:C1)
  worksheet["!merges"] = [
    {
      s: { r: 0, c: 0 },
      e: { r: 0, c: 2 },
    },
  ];

  // COLUMN WIDTHS
  worksheet["!cols"] = [
    { wch: 10 }, // S.N
    { wch: 35 }, // Holiday Title
    { wch: 20 }, // Date (BS)
  ];

  // HEADER STYLE
  const headerStyle = {
    font: {
      bold: true,
      sz: 12,
      color: { rgb: "FFFFFF" },
    },
    fill: {
      fgColor: { rgb: "F59E0B" },
    },
    alignment: {
      horizontal: "center",
      vertical: "center",
    },
    border: {
      top: { style: "thin", color: { rgb: "F59E0B" } },
      bottom: { style: "thin", color: { rgb: "F59E0B" } },
      left: { style: "thin", color: { rgb: "F59E0B" } },
      right: { style: "thin", color: { rgb: "F59E0B" } },
    },
  };

  // BODY STYLE
  const bodyStyle = {
    font: {
      sz: 11,
      color: { rgb: "374151" },
    },
    fill: {
      fgColor: { rgb: "FFFFFF" },
    },
    alignment: {
      horizontal: "left",
      vertical: "center",
    },
    border: {
      top: { style: "thin", color: { rgb: "FCD34D" } },
      bottom: { style: "thin", color: { rgb: "FCD34D" } },
      left: { style: "thin", color: { rgb: "FCD34D" } },
      right: { style: "thin", color: { rgb: "FCD34D" } },
    },
  };

  // ALTERNATE ROW STYLE
  const alternateRowStyle = {
    ...bodyStyle,
    fill: {
      fgColor: { rgb: "FFFBEB" },
    },
  };

  // APPLY HEADER & BODY STYLES
  for (const cellAddress in worksheet) {
    if (cellAddress.startsWith("!")) continue;

    const cell = XLSX.utils.decode_cell(cellAddress);
    const row = cell.r;

    // HEADER ROW (Row 3)
    if (row === 2) {
      worksheet[cellAddress].s = headerStyle;
    }
    // BODY ROWS
    else if (row > 2) {
      worksheet[cellAddress].s =
        row % 2 === 0
          ? alternateRowStyle
          : bodyStyle;
    }
  }

  // CENTER ALIGN S.N & DATE COLUMNS
  const range = XLSX.utils.decode_range(worksheet["!ref"]);

  for (let R = 3; R <= range.e.r; ++R) {
    ["A", "C"].forEach((col) => {
      const cellAddress = `${col}${R + 1}`;

      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          ...worksheet[cellAddress].s,
          alignment: {
            horizontal: "center",
            vertical: "center",
          },
        };
      }
    });
  }

  // CREATE WORKBOOK
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Holiday Upload"
  );

  // DOWNLOAD FILE
  XLSX.writeFile(
    workbook,
    "holiday_bulk_upload_sample.xlsx"
  );
};



// this for upload excel file only
const readExcelFile = (file) =>
  new Promise((resolve, reject) => {
    if (!file) return reject("No file selected");

    const reader = new FileReader();

    reader.readAsArrayBuffer(file);

    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, {
          type: "buffer",
        });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Skip title row and blank row
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          defval: "",
          range: 2,
        });

        const formattedData = jsonData.map((item, idx) => ({
          sn: Number(item["S.N"]) || idx + 1,
          holidayTitle: item["Holiday Title"]?.toString().trim() || "",
          dateBs: item["Date (BS)"]?.toString().trim() || "",
        }));

        resolve(formattedData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = reject;
  });

const formatNepaliDate = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('T')[0].split('-');
  const months = ['Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin', 'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'];
  return `${months[m - 1]} ${d}, ${y}`;
};
 const formatNepaliNumeric = (iso) => iso ? iso.split('T')[0].replaceAll('-', '/') : '';


export {
  formatNepaliNumeric,formatNepaliDate,
  readExcelFile, extractStageData, downloadMultiplePdf, downloadHolidayExcel,
  downloadAsPdf, ClientEmp_form, leaveManagementFields,
  organizations, attendanceManagementFields, menus, getCountdown,
  Dropstyle, ValidateStyle, getInputClass
};