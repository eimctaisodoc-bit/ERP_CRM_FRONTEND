import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Users,
  CheckCircle,
  XCircle,
  Printer,
  PlusCircle,
  User,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Check,
  ShieldOff,
  X,
  Building2,
  Globe,
  UserCheck,
  UserX,
  UserPlus,
  Trash2,
  IdCard,
  Calendar,
  UserMinus,
} from "lucide-react";
import RecruitmentForm from "./emp-mgt_client";

/* =======================
   ANIMATION VARIANTS
======================= */
const statsContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const statsCardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 150, damping: 15 },
  }
};

/* =======================
   OPTIONS & HELPERS
======================= */
const statusOptions = [
  { value: "All", label: "All Status" },
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

const employmentTypeOptions = [
  { value: "All", label: "All Types" },
  { value: "Permanent", label: "Permanent" },
  { value: "Contract", label: "Contract" },
  { value: "Intern", label: "Intern" },
];

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "-";

/* =======================
   REUSABLE COMPONENTS
   (Moved outside to prevent re-mounting on state changes)
======================= */
const StatCard = ({ label, value, icon: Icon, colorClass, bgColorClass }) => (
  <motion.div
    variants={statsCardVariants}
    whileHover={{ y: -3, transition: { duration: 0.15 } }}
    className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4 transition-all hover:shadow-md hover:border-slate-200"
  >
    <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${bgColorClass} ${colorClass}`}>
      <Icon size={24} strokeWidth={2} />
    </div>
    <div className="flex flex-col items-end text-right">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</span>
      <h3 className="text-3xl font-bold text-slate-900 leading-none">{value}</h3>
    </div>
  </motion.div>
);

const AvatarWithHover = ({ firstName, lastName, onClick }) => {
  const getInitials = (first, last) => `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  const getAvatarColor = (first, last) => {
    const colors = [
      "bg-blue-100 text-blue-700", "bg-emerald-100 text-emerald-700", "bg-violet-100 text-violet-700",
      "bg-amber-100 text-amber-700", "bg-rose-100 text-rose-700", "bg-indigo-100 text-indigo-700", "bg-cyan-100 text-cyan-700"
    ];
    return colors[(first.charCodeAt(0) + last.charCodeAt(0)) % colors.length];
  };

  return (
    <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} className="group relative cursor-pointer shrink-0" onClick={onClick}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${getAvatarColor(firstName, lastName)} ring-2 ring-white transition-all duration-300 group-hover:shadow-md`}>
        {getInitials(firstName, lastName)}
      </div>
    </motion.div>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    Active: ["bg-emerald-50 text-emerald-700 border-emerald-200", <CheckCircle size={14} className="text-emerald-500" key="active" />],
    Inactive: ["bg-rose-50 text-rose-700 border-rose-200", <XCircle size={14} className="text-rose-500" key="inactive" />],
  };
  const [style, icon] = map[status] || ["bg-slate-50 text-slate-700 border-slate-200", <CheckCircle size={14} className="text-slate-400" key="default" />];

  return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${style}`}>{icon} {status}</span>;
};

const EmploymentTypeBadge = ({ type }) => {
  const map = {
    Permanent: "bg-blue-50 text-blue-700 border-blue-200", Contract: "bg-violet-50 text-violet-700 border-violet-200", Intern: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${map[type] || "bg-slate-50 text-slate-700 border-slate-200"}`}>{type}</span>;
};

const ActionButtons = ({ employee, onToggleStatus, onMakeInactive, onDelete }) => (
  <div className="flex items-center gap-1">
    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onToggleStatus(employee.employeeId)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer" title="Toggle Status"><ShieldOff size={18} /></motion.button>
    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onMakeInactive(employee.employeeId)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer" title="Set Inactive"><UserMinus size={18} /></motion.button>
    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onDelete(employee.employeeId)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer" title="Delete Record"><Trash2 size={18} /></motion.button>
  </div>
);

const CustomCheckbox = ({ checked, onChange, id }) => (
  <div className="relative flex items-center justify-center">
    <input type="checkbox" checked={checked} onChange={onChange} id={`checkbox-${id}`} className="absolute opacity-0 w-0 h-0" />
    <label htmlFor={`checkbox-${id}`} className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer transition-all duration-200 ${checked ? "bg-amber-500 border-amber-500 text-white" : "bg-white border-slate-300 hover:border-amber-400"}`}>
      {checked && <Check size={14} strokeWidth={3} />}
    </label>
  </div>
);

/* =======================
   SAMPLE DATA 
======================= */
const initialRecruitmentData = [
  { employeeId: "EMP-101", firstName: "John", lastName: "Smith", officeEmail: "john.smith@company.com", officeMobile: "+1 (555) 123-4567", department: "Engineering", designation: "Senior Developer", employmentType: "Permanent", employeeStatus: "Active", dateOfJoining: "2023-03-15", contractEndDate: "2026-03-15" },
  { employeeId: "EMP-102", firstName: "Sarah", lastName: "Johnson", officeEmail: "sarah.j@company.com", officeMobile: "+1 (555) 987-6543", department: "Marketing", designation: "Marketing Manager", employmentType: "Permanent", employeeStatus: "Active", dateOfJoining: "2022-08-22", contractEndDate: "2025-08-22" },
  { employeeId: "EMP-103", firstName: "Michael", lastName: "Chen", officeEmail: "michael.chen@company.com", officeMobile: "+1 (555) 456-7890", department: "Finance", designation: "Financial Analyst", employmentType: "Contract", employeeStatus: "Active", dateOfJoining: "2024-01-10", contractEndDate: "2025-01-10" },
  { employeeId: "EMP-104", firstName: "Emma", lastName: "Wilson", officeEmail: "emma.w@company.com", officeMobile: "+1 (555) 234-5678", department: "HR", designation: "HR Specialist", employmentType: "Permanent", employeeStatus: "Inactive", dateOfJoining: "2021-11-05", contractEndDate: "2024-11-05" },
  { employeeId: "EMP-105", firstName: "David", lastName: "Brown", officeEmail: "david.b@company.com", officeMobile: "+1 (555) 876-5432", department: "Sales", designation: "Sales Executive", employmentType: "Permanent", employeeStatus: "Active", dateOfJoining: "2023-07-18", contractEndDate: "2026-07-18" },
  { employeeId: "EMP-106", firstName: "Lisa", lastName: "Anderson", officeEmail: "lisa.a@company.com", officeMobile: "+1 (555) 345-6789", department: "Engineering", designation: "Junior Developer", employmentType: "Intern", employeeStatus: "Active", dateOfJoining: "2024-06-01", contractEndDate: "2024-12-01" },
  { employeeId: "EMP-107", firstName: "James", lastName: "Taylor", officeEmail: "james.t@company.com", officeMobile: "+1 (555) 111-2222", department: "Support", designation: "IT Support", employmentType: "Permanent", employeeStatus: "Active", dateOfJoining: "2023-09-12", contractEndDate: "2026-09-12" },
  { employeeId: "EMP-108", firstName: "Olivia", lastName: "Martinez", officeEmail: "olivia.m@company.com", officeMobile: "+1 (555) 333-4444", department: "Design", designation: "UI/UX Designer", employmentType: "Contract", employeeStatus: "Active", dateOfJoining: "2024-02-15", contractEndDate: "2025-02-15" },
  { employeeId: "EMP-109", firstName: "Daniel", lastName: "Thomas", officeEmail: "daniel.t@company.com", officeMobile: "+1 (555) 555-6666", department: "Marketing", designation: "Content Writer", employmentType: "Permanent", employeeStatus: "Inactive", dateOfJoining: "2020-04-10", contractEndDate: "2023-04-10" },
  { employeeId: "EMP-110", firstName: "Sophia", lastName: "White", officeEmail: "sophia.w@company.com", officeMobile: "+1 (555) 777-8888", department: "Sales", designation: "Account Executive", employmentType: "Permanent", employeeStatus: "Active", dateOfJoining: "2023-11-20", contractEndDate: "2026-11-20" },
  { employeeId: "EMP-111", firstName: "Matthew", lastName: "Harris", officeEmail: "matthew.h@company.com", officeMobile: "+1 (555) 999-0000", department: "Engineering", designation: "DevOps Engineer", employmentType: "Permanent", employeeStatus: "Active", dateOfJoining: "2021-08-05", contractEndDate: "2024-08-05" },
  { employeeId: "EMP-112", firstName: "Chloe", lastName: "Martin", officeEmail: "chloe.m@company.com", officeMobile: "+1 (555) 121-3434", department: "HR", designation: "Recruiter", employmentType: "Contract", employeeStatus: "Active", dateOfJoining: "2024-03-01", contractEndDate: "2025-03-01" },
];

/* =======================
   MAIN COMPONENT
======================= */
export const RecruitmentTable = () => {
  const [recruitmentData, setRecruitmentData] = useState(initialRecruitmentData);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(statusOptions[0]);
  const [selectedType, setSelectedType] = useState(employmentTypeOptions[0]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [open, SetIsOpen] = useState(false);
  const [isOpen, setIs_Open] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  
  // Reference for the scrollable table body to track viewport intersection precisely
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    open || isOpen ? (document.body.style.overflow = "hidden") : (document.body.style.overflow = "unset");
    return () => { document.body.style.overflow = "unset"; };
  }, [open, isOpen]);

  const handleToggleStatus = (id) => setRecruitmentData((prev) => prev.map((emp) => emp.employeeId === id ? { ...emp, employeeStatus: emp.employeeStatus === "Active" ? "Inactive" : "Active" } : emp));
  const handleMakeInactive = (id) => setRecruitmentData((prev) => prev.map((emp) => (emp.employeeId === id ? { ...emp, employeeStatus: "Inactive" } : emp)));
  const handleDelete = (id) => {
    setRecruitmentData((prev) => prev.filter((emp) => emp.employeeId !== id));
    setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
  };

  const handleSelectRow = (employeeId) => setSelectedRows((prev) => prev.includes(employeeId) ? prev.filter((id) => id !== employeeId) : [...prev, employeeId]);

  const filteredData = useMemo(() => {
    return recruitmentData.filter((row) => {
      const matchesSearch = Object.values(row).join(" ").toLowerCase().includes(search.toLowerCase());
      const matchesStatus = selectedStatus.value === "All" || row.employeeStatus === selectedStatus.value;
      const matchesType = selectedType.value === "All" || row.employmentType === selectedType.value;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [recruitmentData, search, selectedStatus, selectedType]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;

  useEffect(() => { setCurrentPage(1); }, [search, selectedStatus, selectedType]);

  const handleSelectAll = () => selectedRows.length === paginatedData.length && paginatedData.length > 0 ? setSelectedRows([]) : setSelectedRows(paginatedData.map((row) => row.employeeId));

  return (
    <div style={{ fontFamily: "'Roboto Slab', serif" }} className="min-h-screen bg-white pt-4 ">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 3px; width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Recruitment Directory</h1>
            <p className="text-slate-500 text-sm mt-1">Manage, filter, and review employee recruitment information.</p>
          </div>
          <div className="flex flex-wrap md:flex-nowrap  items-center gap-3 ">
            <button className="px-5 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl flex items-center gap-2 hover:bg-slate-50 transition-colors font-medium text-sm shadow-sm"><Printer size={16} /> Export List</button>
            <button onClick={() => SetIsOpen(true)} className="px-5 py-2.5 bg-amber-500 text-white cursor-pointer rounded-xl flex items-center gap-2 hover:bg-amber-600 transition-colors font-medium text-sm shadow-sm"><PlusCircle size={18} /> Add Employee</button>
          </div>
        </div>

        {/* STATS */}
        <motion.div variants={statsContainerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard label="Total Employees" value={recruitmentData.length} icon={Users} colorClass="text-blue-600" bgColorClass="bg-blue-50" />
          <StatCard label="Active" value={recruitmentData.filter((e) => e.employeeStatus === "Active").length} icon={UserCheck} colorClass="text-emerald-600" bgColorClass="bg-emerald-50" />
          <StatCard label="Inactive" value={recruitmentData.filter((e) => e.employeeStatus !== "Active").length} icon={UserX} colorClass="text-rose-600" bgColorClass="bg-rose-50" />
          <StatCard label="New Joiners" value={12} icon={UserPlus} colorClass="text-amber-600" bgColorClass="bg-amber-50" />
        </motion.div>

        {/* FILTERS */}
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employees..." className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-amber-500" />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Scroll Ref attached here to track row visibility exclusively inside this container */}
          <div ref={scrollContainerRef} className="overflow-x-auto overflow-y-auto max-h-[500px] custom-scrollbar">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/90 backdrop-blur-sm sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-left"><CustomCheckbox checked={selectedRows.length === paginatedData.length && paginatedData.length > 0} onChange={handleSelectAll} id="select-all" /></th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase">Employee</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase">Contact</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase">Role</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase">Timeline</th>
                  <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-100 bg-white">
                <AnimatePresence mode="wait">
                  {paginatedData.length === 0 ? (
                    <motion.tr key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <td colSpan={7} className="p-12 text-center text-slate-500">No records found</td>
                    </motion.tr>
                  ) : (
                    paginatedData.map((row) => (
                      <motion.tr
                        key={row.employeeId}
                        variants={rowVariants}
                        initial="hidden"
                        whileInView="visible"
                        // Bound 'whileInView' exclusively to the scrolling div for perfect transitions on scroll
                        viewport={{ root: scrollContainerRef, once: false, margin: "-10px 0px" }} 
                        exit={{ opacity: 0 }}
                        whileHover={{ backgroundColor: "#f8fafc" }}
                        className="transition-colors group"
                      >
                        <td className="px-6 py-4"><CustomCheckbox checked={selectedRows.includes(row.employeeId)} onChange={() => handleSelectRow(row.employeeId)} id={row.employeeId} /></td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <AvatarWithHover firstName={row.firstName} lastName={row.lastName} onClick={() => { setSelectedEmployee(row); setIs_Open(true); }} />
                            <div>
                              <div className="font-semibold text-slate-900 text-sm">{row.firstName} {row.lastName}</div>
                              <div className="text-xs text-slate-500">{row.employeeId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">{row.officeEmail}<br/><span className="text-xs text-slate-500">{row.officeMobile}</span></td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{row.designation}<br/><span className="text-xs text-slate-500 font-normal">{row.department}</span></td>
                        <td className="px-6 py-4 space-y-1"><StatusBadge status={row.employeeStatus} /><br/><EmploymentTypeBadge type={row.employmentType} /></td>
                        <td className="px-6 py-4 text-sm text-slate-700">{formatDate(row.dateOfJoining)}</td>
                        <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity"><ActionButtons employee={row} onToggleStatus={handleToggleStatus} onMakeInactive={handleMakeInactive} onDelete={handleDelete} /></td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {filteredData.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <div className="text-sm text-slate-500">Showing {paginatedData.length} of {filteredData.length} records</div>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50">Prev</button>
                <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold">{currentPage} / {totalPages}</div>
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* MODALS */}
      <AnimatePresence>
        {open && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50"><RecruitmentForm onClose={() => SetIsOpen(false)} /></motion.div>}
      </AnimatePresence>

      <Emp_Each isOpen={isOpen} onClose={() => setIs_Open(false)} employee={selectedEmployee} />
    </div>
  );
};

/* =======================
   EMPLOYEE DETAIL MODAL
======================= */
const Emp_Each = ({ isOpen, onClose, employee }) => {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!employee) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ fontFamily: "'Roboto Slab', serif" }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} transition={{ duration: 0.25, ease: "easeOut" }} className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
            <button onClick={onClose} className="absolute top-5 right-5 p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-full transition-colors z-20"><X size={20} strokeWidth={2.5} /></button>
            <div className="p-8 sm:p-10">
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                <div className="w-24 h-24 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shrink-0 border border-amber-200/50"><User size={40} strokeWidth={2} /></div>
                <div className="text-center sm:text-left flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">{employee.firstName} {employee.lastName}</h2>
                  <p className="text-amber-600 font-medium mb-3">{employee.designation}</p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                    <span className="flex items-center gap-1.5 text-slate-500 text-sm font-medium bg-slate-50 px-2.5 py-1 rounded-md"><Building2 size={16} className="text-slate-400" /> {employee.department}</span>
                    <span className="flex items-center gap-1.5 text-slate-500 text-sm font-medium bg-slate-50 px-2.5 py-1 rounded-md"><IdCard size={16} className="text-slate-400" /> {employee.employeeId}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <DetailItem icon={<Globe className="text-blue-500" size={18} />} label="Employment Type" value={employee.employmentType} />
                <DetailItem icon={<MapPin className="text-rose-500" size={18} />} label="Status" value={employee.employeeStatus} />
                <DetailItem icon={<Mail className="text-emerald-500" size={18} />} label="Office Email" value={employee.officeEmail} />
                <DetailItem icon={<Phone className="text-violet-500" size={18} />} label="Office Mobile" value={employee.officeMobile} />
                <DetailItem icon={<Calendar className="text-amber-500" size={18} />} label="Date of Joining" value={formatDate(employee.dateOfJoining)} />
                <DetailItem icon={<Calendar className="text-amber-600" size={18} />} label="Contract End Date" value={formatDate(employee.contractEndDate)} />
              </div>
              <div className="mt-8 flex gap-3">
                <button onClick={onClose} className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors">Close</button>
                <button className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-sm transition-colors">Download Profile</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 p-2 bg-white rounded-lg shadow-sm border border-slate-100 shrink-0">{icon}</div>
    <div className="flex flex-col"><span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</span><span className="text-slate-800 text-sm font-semibold">{value}</span></div>
  </div>
);