import React, { useMemo, useState, useEffect, useCallback } from "react";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RegisterModal_Staff } from "./Registermodal"; // Adjust path as needed

// API Hooks
import { useGet } from "../../hooks/useGet";
import { UseDelete } from "../../hooks/useDelete";
import { useEdit } from "../../hooks/useEdit";

// Mock Notifications (Replace with your actual notification imports like react-hot-toast)
const SuccessNotify = (msg) => console.log("SUCCESS:", msg);
const ErrorNotify = (msg) => console.error("ERROR:", msg);

// ========== UTILS ==========
const getInitials = (name) => name?.replace(/[^a-zA-Z ]/g, "").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "??";

const colors = [
    "bg-amber-100 text-amber-800", "bg-slate-100 text-slate-800", 
    "bg-emerald-100 text-emerald-800", "bg-blue-100 text-blue-800", 
    "bg-purple-100 text-purple-800", "bg-rose-100 text-rose-800"
];

const getColorIndex = (name) => name?.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length || 0;

const statusConfig = {
  Active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Inactive: "bg-slate-100 text-slate-800 border-slate-200",
};

const getStatusBadge = (status) => statusConfig[status] || "bg-gray-100 text-gray-800";

// ========== COMPONENTS ==========

const Avatar = ({ name, size = 10, mobileSize = 8 }) => (
  <div className={`flex items-center justify-center rounded-full ${colors[getColorIndex(name)]} font-semibold w-${mobileSize} h-${mobileSize} sm:w-${size} sm:h-${size}`}>
    <span className="text-xs sm:text-sm">{getInitials(name)}</span>
  </div>
);

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusBadge(status)}`}>
    {status}
  </span>
);

const CustomCheckbox = ({ checked, indeterminate, onChange }) => (
  <div className="relative inline-block w-4 h-4 sm:w-5 sm:h-5 cursor-pointer">
    <input type="checkbox" checked={checked} onChange={onChange} ref={el => el && (el.indeterminate = indeterminate)} className="absolute w-full h-full opacity-0 cursor-pointer z-10" />
    <div className={`absolute inset-0 border-2 rounded transition-all cursor-pointer ${indeterminate ? "border-amber-500 bg-amber-500" : checked ? "border-amber-500 bg-amber-500" : "border-gray-300 hover:border-amber-400"}`}>
      {checked && !indeterminate && <Icons.Check className="absolute inset-0 w-full h-full text-white p-0.5" />}
      {indeterminate && <Icons.Minus className="absolute inset-0 w-full h-full text-white p-0.5" />}
    </div>
  </div>
);

const Tooltip = ({ children, text }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <div onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} className="inline-block cursor-pointer">{children}</div>
      {show && (
          <div className="hidden sm:block absolute z-20 px-3 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg shadow-sm bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap">
              {text}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1"><div className="w-2 h-2 bg-slate-900 rotate-45"></div></div>
          </div>
      )}
    </div>
  );
};

const ActionButtons = ({ row, onDelete, onToggleStatus }) => {
  return (
    <div className="flex items-center space-x-1 sm:space-x-2">
      <Tooltip text={row.isActive ? 'Mark Inactive' : 'Mark Active'}>
        <button 
          className={`cursor-pointer p-1.5 sm:p-2 rounded-lg border transition-transform hover:scale-105 ${row.isActive ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'}`} 
          onClick={(e) => onToggleStatus(e, row)}
        >
          <Icons.Power className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </Tooltip>
      <Tooltip text="Delete">
        <button 
          className="cursor-pointer p-1.5 sm:p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg border border-rose-200 transition-transform hover:scale-105" 
          onClick={(e) => { e.stopPropagation(); onDelete([row._id]); }}
        >
          <Icons.Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </Tooltip>
    </div>
  );
};

// ========== MAIN TABLE ==========
const Data_Table = () => {
  // --- API Hooks ---
  const { getStaffCredit_ } = useGet(); 
  const { DeleteStaff_ } = UseDelete(); // Specific delete hook for Staff
  const { EditStatus_admin_ } = useEdit();

  // --- State ---
  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selected, setSelected] = useState({ selectedRows: [], allSelected: false, indeterminate: false });
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  
  // --- Integrated Delete State ---
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, ids: [] });
  const [deleteInputValue, setDeleteInputValue] = useState("");
  const [deleteInputError, setDeleteInputError] = useState("");
  
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [fetch, setreFetch] = useState(false);
  const rowsPerPage = 10;

  // Prevent background scrolling when modals are open
  useEffect(() => { 
    (showRegisterModal || deleteModalState.isOpen) 
      ? document.body.style.overflow = 'hidden' 
      : document.body.style.overflow = 'unset'; 
    return () => document.body.style.overflow = 'unset'; 
  }, [showRegisterModal, deleteModalState.isOpen]);

  // --- Data Fetching ---
  const fetchGetUsers = useCallback(() => {
    setIsLoading(true);
    getStaffCredit_.mutate(null, {
        onSuccess: (response) => {
            const fetchedData = response?.data?.data || response?.data || response || [];
            
            const filteredData = fetchedData.filter(user => {
                const role = (user.role || "").toLowerCase();
                return role === "staff" || role === "client";
            });
            
            setRecords(filteredData);
            setFiltered(filteredData);
            setIsLoading(false);
        },
        onError: (error) => {
            console.error("Fetch Error:", error);
            setIsLoading(false);
        }
    });
  }, [fetch]);

  useEffect(() => {
    fetchGetUsers();
  }, [fetchGetUsers]);

  // --- Local Filtering & Search ---
  const applyLocalFilters = useCallback(() => {
    let result = records;
    
    if (typeFilter !== "all") {
      result = result.filter(r => (r.role || "").toLowerCase() === typeFilter);
    }
    
    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(r => 
        r.username?.toLowerCase().includes(term) || 
        r.officeEmail?.toLowerCase().includes(term) ||
        r.designation?.toLowerCase().includes(term) ||
        r.jobRole?.toLowerCase().includes(term) ||
        r.provinceName?.toLowerCase().includes(term)
      );
    }
    setFiltered(result);
    setCurrentPage(1); 
  }, [search, typeFilter, records]);

  useEffect(() => { applyLocalFilters(); }, [applyLocalFilters]);

  // --- Pagination ---
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, currentPage]);

  // --- Action Handlers ---
  const handleRowSelect = (state, row) => {
    let newSelected = [...selected.selectedRows];
    if (row) {
      newSelected = newSelected.includes(row._id) ? newSelected.filter(id => id !== row._id) : [...newSelected, row._id];
    } else {
      newSelected = selected.allSelected || selected.indeterminate ? [] : filtered.map(r => r._id);
    }
    const allSelected = newSelected.length === filtered.length && filtered.length > 0;
    const indeterminate = newSelected.length > 0 && newSelected.length < filtered.length;
    setSelected({ selectedRows: newSelected, allSelected, indeterminate });
  };

  const handleToggleStatus = (e, row) => {
    e.stopPropagation();
    const newStatus = !row.isActive;

    EditStatus_admin_.mutate(
        {
            params: { id: row._id },
            payload: { isActive: newStatus }
        },
        {
            onSuccess: (res) => {
                SuccessNotify(res?.data?.message || "User status updated successfully.");
                setreFetch(prev => !prev);
            },
            onError: (err) => {
                console.error(err);
                ErrorNotify(err?.response?.data?.message || "Failed to update user status.");
            }
        }
    );
  };

  // --- Integrated Delete Functions ---
  const closeDeleteModal = () => {
    setDeleteModalState({ isOpen: false, ids: [] });
    setDeleteInputValue("");
    setDeleteInputError("");
  };

  const triggerDelete = (ids) => {
    setDeleteModalState({ isOpen: true, ids: Array.isArray(ids) ? ids : [ids] });
    setDeleteInputValue("");
    setDeleteInputError("");
  };

  const executeDelete = () => {
    if (deleteInputValue !== "delete") {
        setDeleteInputError("Not matched. Please type 'delete'.");
        return;
    }

    DeleteStaff_.mutate({ params: { ids: deleteModalState.ids } }, {
        onSuccess: (res) => {
            // Remove deleted items from the selected array to clear bulk-action bar UI
            setSelected(prev => ({ 
              ...prev, 
              selectedRows: prev.selectedRows.filter(i => !deleteModalState.ids.includes(i)),
              allSelected: false,
              indeterminate: false
            }));
            SuccessNotify(res?.data?.message || "Successfully deleted.");
            setreFetch(prev => !prev);
            closeDeleteModal();
        },
        onError: (error) => {
            console.error("Delete Error:", error);
            ErrorNotify(error?.response?.data?.message || "Failed to delete.");
            closeDeleteModal();
        }
    });
  };

  const Pagination = ({ rowCount, onChangePage, currentPage }) => (
    <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-4 border-t border-slate-100">
      <div className="text-xs sm:text-sm text-slate-500 mb-2 sm:mb-0" style={{ fontFamily: "'Roboto Slab', serif", fontWeight: 300 }}>
        Showing {Math.min((currentPage-1)*rowsPerPage+1, rowCount) || 0}-{Math.min(currentPage*rowsPerPage, rowCount)} of {rowCount}
      </div>
      <div className="flex space-x-1">
        <button onClick={() => onChangePage(Math.max(1, currentPage-1))} disabled={currentPage===1} className="cursor-pointer px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-md disabled:opacity-50 hover:bg-slate-50 font-bold transition-colors">Prev</button>
        {Array.from({ length: Math.min(3, Math.ceil(rowCount/rowsPerPage)) }, (_, i) => i+1).map(p => (
          <button key={p} onClick={() => onChangePage(p)} className={`cursor-pointer px-3 py-1.5 text-xs sm:text-sm border rounded-md font-bold transition-colors ${currentPage===p ? 'bg-amber-600 text-white border-amber-600' : 'border-slate-200 hover:bg-slate-50'}`}>{p}</button>
        ))}
        <button onClick={() => onChangePage(Math.min(Math.ceil(rowCount/rowsPerPage), currentPage+1))} disabled={currentPage===Math.ceil(rowCount/rowsPerPage) || rowCount === 0} className="cursor-pointer px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-md disabled:opacity-50 hover:bg-slate-50 font-bold transition-colors">Next</button>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 bg-white rounded-2xl shadow-sm border border-slate-100 relative">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row justify-between mb-6 gap-4 border-b border-slate-100 pb-5">
        <div>
            <h2 className="text-xl sm:text-2xl text-slate-800" style={{ fontFamily: "'Roboto Slab', serif", fontWeight: 700 }}>
                Basic <span className="text-amber-600">Information</span> Directory
            </h2>
            <p className="text-xs text-slate-500 mt-1" style={{ fontFamily: "'Roboto Slab', serif", fontWeight: 300 }}>Manage access and statuses for registered Staff and Clients.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            {["all", "staff", "client"].map(t => (
              <button key={t} onClick={() => setTypeFilter(t)} className={`cursor-pointer px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${typeFilter===t ? (t==="staff" ? "bg-emerald-100 text-emerald-800 shadow-sm" : t==="client" ? "bg-blue-100 text-blue-800 shadow-sm" : "bg-white text-slate-800 shadow-sm") : "text-slate-500 hover:text-slate-700"}`} style={{ fontFamily: "'Roboto Slab', serif" }}>
                {t==="all" ? "All" : t==="staff" ? "Staff" : "Clients"}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="cursor-text pl-9 pr-4 py-2.5 border border-slate-200 bg-slate-50 focus:bg-white focus:border-amber-500 rounded-xl w-full text-sm outline-none transition-all" placeholder="Search profiles..." style={{ fontFamily: "'Roboto Slab', serif", fontWeight: 300 }} />
          </div>
          <button onClick={() => setShowRegisterModal(true)} className="cursor-pointer w-full sm:w-auto px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl flex items-center justify-center text-sm shadow-md transition-all whitespace-nowrap" style={{ fontFamily: "'Roboto Slab', serif", fontWeight: 700 }}>
            <Icons.Plus className="w-4 h-4 mr-1.5" /> Register Profile
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm w-full">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-4 w-12 text-left">
                <CustomCheckbox checked={selected.allSelected} indeterminate={selected.indeterminate} onChange={handleRowSelect} />
              </th>
              <th className="px-5 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">PROFILE NAME</th>
              <th className="px-5 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">ROLE</th>
              <th className="px-5 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">POSITION / JOB</th>
              <th className="px-5 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">CONTACT / LOCATION</th>
              <th className="px-5 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">STATUS</th>
              <th className="px-5 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan="7" className="py-12 text-center text-slate-400">Loading records...</td></tr>
            ) : paginatedData.length > 0 ? (
              paginatedData.map(r => {
                const isClient = r.role === 'client';
                return (
                  <tr key={r._id} className={`hover:bg-slate-50/50 transition-colors ${selected.selectedRows.includes(r._id) ? 'bg-amber-50/30' : ''}`}>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <CustomCheckbox checked={selected.selectedRows.includes(r._id)} onChange={() => handleRowSelect(null, r)} />
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <Avatar name={r.username} size={10} mobileSize={8} />
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm text-slate-800 truncate" style={{ fontFamily: "'Roboto Slab', serif", fontWeight: 700 }}>{r.username}</span>
                          <span className="text-[11px] text-slate-500 font-medium truncate">{r.officeEmail}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 uppercase tracking-widest rounded-md border ${isClient ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                            {r.role}
                        </span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs text-slate-800" style={{ fontFamily: "'Roboto Slab', serif", fontWeight: 700 }}>{r.designation || "N/A"}</span>
                          <span className="text-[11px] text-slate-500 truncate">{r.jobRole || "N/A"}</span>
                        </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs text-slate-800" style={{ fontFamily: "'Roboto Slab', serif", fontWeight: 700 }}>{r.officeMobile || "N/A"}</span>
                          <span className="text-[11px] text-slate-500 truncate">{r.provinceName || "N/A"}</span>
                        </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap cursor-pointer" onClick={(e) => handleToggleStatus(e, r)}>
                      <StatusBadge status={r.isActive ? "Active" : "Inactive"} />
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <ActionButtons row={r} onDelete={triggerDelete} onToggleStatus={handleToggleStatus} />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="py-12 text-center text-slate-400" style={{ fontFamily: "'Roboto Slab', serif", fontWeight: 300 }}>No Record found</td>
              </tr>
            )}
          </tbody>
        </table>
        {filtered.length > rowsPerPage && (
          <Pagination rowCount={filtered.length} onChangePage={setCurrentPage} currentPage={currentPage} />
        )}
      </div>

      {/* Floating Bulk Action Bar */}
      <AnimatePresence>
        {selected.selectedRows.length > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center space-x-4 z-40 border border-slate-700"
          >
            <span className="text-sm font-medium">
              <span className="text-amber-400 font-bold">{selected.selectedRows.length}</span> selected
            </span>
            <div className="w-px h-5 bg-slate-700"></div>
            <button
              onClick={() => triggerDelete(selected.selectedRows)}
              className="cursor-pointer flex items-center text-sm text-rose-400 hover:text-rose-300 transition-colors font-medium"
            >
              <Icons.Trash2 className="w-4 h-4 mr-2" /> Delete Selected
            </button>
            <button
              onClick={() => setSelected({ selectedRows: [], allSelected: false, indeterminate: false })}
              className="cursor-pointer ml-2 p-1 hover:bg-slate-800 rounded-full transition-colors"
            >
              <Icons.X className="w-4 h-4 text-slate-400" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalState.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-4">
                  <Icons.AlertTriangle className="w-6 h-6 text-rose-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Delete {deleteModalState.ids.length > 1 ? 'Records' : 'Record'}?</h3>
                <p className="text-sm text-slate-500 mb-6">
                  This action cannot be undone. To confirm, type <span className="font-bold text-slate-900">delete</span> below.
                </p>
                <input
                  type="text"
                  value={deleteInputValue}
                  onChange={(e) => {
                    setDeleteInputValue(e.target.value);
                    setDeleteInputError("");
                  }}
                  placeholder="Type 'delete' to confirm"
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition-all cursor-text ${deleteInputError ? 'border-rose-300 focus:border-rose-500 bg-rose-50' : 'border-slate-200 focus:border-slate-400 bg-slate-50 focus:bg-white'}`}
                />
                {deleteInputError && (
                  <p className="text-sm text-rose-500 mt-2 flex items-center">
                    <Icons.AlertCircle className="w-4 h-4 mr-1" /> {deleteInputError}
                  </p>
                )}
              </div>
              <div className="flex border-t border-slate-100">
                <button
                  onClick={closeDeleteModal}
                  className="cursor-pointer flex-1 px-4 py-4 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <div className="w-px bg-slate-100"></div>
                <button
                  onClick={executeDelete}
                  className="cursor-pointer flex-1 px-4 py-4 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Registration Modal */}
      {showRegisterModal && <RegisterModal_Staff onClose={() => setShowRegisterModal(false)} onSuccess={() => { setreFetch(prev => !prev) }} />}
    </div>
  );
};

export default Data_Table;