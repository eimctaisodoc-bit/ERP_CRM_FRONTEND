import React, { useMemo, useState, useEffect } from "react";
import {
    X, User, Mail, Phone, Lock, KeyRound, ChevronRight,
    Loader2, Map, MapPin, Briefcase, Calendar,
    CheckCircle, Navigation, Check, Minus, Trash2,
    Edit3, Search, Plus, BlocksIcon, Power, Users, Shield, ChevronDown, ChevronUp,
    AlertCircle
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Select from "react-select";
import { waitingNotify, ErrorNotify, SuccessNotify } from "../../hotToaster";
import { RegisterModal_Admin } from "./Registermodal_admin";

import { useGet } from "../../hooks/useGet";
import { UseDelete } from "../../hooks/useDelete";
import { useEdit } from "../../hooks/useEdit";

const fontLight = { fontFamily: "'Roboto Slab', serif", fontWeight: 300 };
const fontBold = { fontFamily: "'Roboto Slab', serif", fontWeight: 700 };

// ========== CUSTOM CHECKBOX ==========
const CustomCheckboxRender = ({ checked, indeterminateStatus, onChange }) => (
    <div className="relative inline-block w-4 h-4 sm:w-5 sm:h-5" onClick={(e) => e.stopPropagation()}>
        <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            ref={el => el && (el.indeterminate = indeterminateStatus)}
            className="absolute w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className={`absolute inset-0 border-2 rounded transition-all flex items-center justify-center ${indeterminateStatus ? "border-blue-500 bg-blue-500" : checked ? "border-blue-500 bg-blue-500" : "border-slate-300 bg-white hover:border-blue-400"}`}>
            {checked && !indeterminateStatus && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
            {indeterminateStatus && <Minus className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
        </div>
    </div>
);

const getStatusBadge = (isActive) => {
    return isActive
        ? "bg-green-100 text-green-700 border-green-200"
        : "bg-red-100 text-red-700 border-red-200";
};

// Custom Role Badge Generator
const getRoleBadge = (role) => {
    const r = (role || "").toLowerCase();
    if (r === 'admin') return "bg-purple-100 text-purple-700 border-purple-200";
    if (r === 'staff') return "bg-blue-100 text-blue-700 border-blue-200";
    if (r === 'client') return "bg-emerald-100 text-emerald-700 border-emerald-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
};

const Data_Table = () => {
    // Mutations
    const { getUserCredit_, getAllBranch_ } = useGet();
    const { Deleteadmin_, DeleteBranch_ } = UseDelete();
    const { EditStatus_, SendCredit_, EditBranchStatus_, SendBranchCredit_ } = useEdit();

    const [showModal, setShowModal] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [reFetch, setreFetch] = useState(false);

    const [records, setRecords] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [expandedRowId, setExpandedRowId] = useState(null);

    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    // Selection states
    const [selectedRows, setSelectedRows] = useState([]);
    const [allSelected, setAllSelected] = useState(false);
    const [indeterminate, setIndeterminate] = useState(false);

    // Delete Confirmation Modal States
    const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, ids: [] });
    const [deleteInputValue, setDeleteInputValue] = useState("");
    const [deleteInputError, setDeleteInputError] = useState("");
    const [deleteBranchId, setDeleteBranchId] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    const setActionBusy = (action, rowId) => setActionLoading(`${action}-${rowId}`);
    const isActionBusy = (action, rowId) => actionLoading === `${action}-${rowId}`;

    const fetchAllRecords = async () => {
        try {
            const [usersResponse, branchesResponse] = await Promise.all([
                getUserCredit_.mutateAsync(null),
                getAllBranch_.mutateAsync(null)
            ]);
            const users = usersResponse?.data?.data || usersResponse?.data || usersResponse || [];
            const branches = branchesResponse?.data?.data || branchesResponse?.data || branchesResponse || [];
            const normalizedUsers = Array.isArray(users)
                ? users.filter(user => (user.role || "").toLowerCase() !== "super_admin")
                : [];
            const normalizedBranches = Array.isArray(branches)
                ? branches.map(branch => ({
                    ...branch,
                    fullName: branch.fullName || branch.UserfullName,
                    role: branch.role || "branch",
                    districtName: branch.districtName || branch.districts,
                    localLevel: branch.localLevel || branch.localLevelName,
                    isActive: branch.status
                        ? String(branch.status).toLowerCase() === "active"
                        : true,
                    isBranch: true
                }))
                : [];
            const combinedRecords = [...normalizedUsers, ...normalizedBranches];
            setRecords(combinedRecords);
            setFiltered(combinedRecords);
        } catch (error) {
            console.error("Fetch Error:", error);
            ErrorNotify(error?.response?.data?.message || "Failed to load users and branches.");
        }
    };

    useEffect(() => {
        fetchAllRecords();
    }, [reFetch]);

    useEffect(() => {
        const lower = search.toLowerCase();
        setFiltered(!lower ? records : records.filter(record =>
            (record.username || "").toLowerCase().includes(lower) ||
            (record.fullName || "").toLowerCase().includes(lower) ||
            (record.provinceName || "").toLowerCase().includes(lower) ||
            (record.officeEmail || "").toLowerCase().includes(lower) ||
            (record.role || "").toLowerCase().includes(lower)
        ));
    }, [records, search]);

useEffect(() => { setCurrentPage(1); }, [search, filtered.length]);

// Sync checkbox UI states accurately
useEffect(() => {
    const isAll = selectedRows.length === filtered.length && filtered.length > 0;
    const isIndeterminate = selectedRows.length > 0 && selectedRows.length < filtered.length;
    setAllSelected(isAll);
    setIndeterminate(isIndeterminate);
}, [selectedRows, filtered]);

const stats = useMemo(() => {
    let admin = 0, staff = 0, client = 0;
    records.forEach(user => {
        const role = (user.role || "").toLowerCase();
        if (role === "admin") admin++;
        if (role === "staff") staff++;
        if (role === "client") client++;
    });
    return { total: records.length, admin, staff, client };
}, [records]);

const handleSearch = (term) => {
    setSearch(term);
};

// ----- DELETE HANDLERS & MODAL LOGIC -----
const triggerDelete = (ids, branchId = null) => {
    setDeleteModalState({ isOpen: true, ids: Array.isArray(ids) ? ids : [ids] });
    setDeleteBranchId(branchId);
    setDeleteInputValue("");
    setDeleteInputError("");
};

const closeDeleteModal = () => {
    setDeleteModalState({ isOpen: false, ids: [] });
    setDeleteBranchId(null);
    setDeleteInputValue("");
    setDeleteInputError("");
};

const executeDelete = () => {
    if (deleteInputValue !== "delete") {
        setDeleteInputError("Not matched. Please type 'delete'.");
        return;
    }

    const deleteMutation = deleteBranchId
        ? DeleteBranch_
        : Deleteadmin_;
    const deletePayload = deleteBranchId
        ? { id: deleteBranchId }
        : { ids: deleteModalState.ids };
    setActionBusy("delete", deleteBranchId || deleteModalState.ids[0]);

    deleteMutation.mutate(deletePayload, {
        onSuccess: (res) => {
            setSelectedRows(prev => prev.filter(i => !deleteModalState.ids.includes(i)));
            SuccessNotify(res?.data?.message || "Successfully deleted.");
            setreFetch(prev => !prev);
            closeDeleteModal();
        },
        onError: (error) => {
            console.error("Delete Error:", error);
            ErrorNotify(error?.response?.data?.message || "Failed to delete.");
            closeDeleteModal();
        },
        onSettled: () => {
            setActionLoading(null);
        }
    });
};

const handleToggleStatus = (e, row) => {
    e.stopPropagation();
    if (isActionBusy("status", row._id)) return;
    const newStatus = !row.isActive;

    const statusMutation = row.isBranch ? EditBranchStatus_ : EditStatus_;
    setActionBusy("status", row._id);
    statusMutation.mutate(
        {
            params: { id: row._id },
            payload: { isActive: newStatus }
        },
        {
            onSuccess: (res) => {
                    SuccessNotify(res?.data?.message || "Account status updated successfully.");
                setreFetch(prev => !prev);
            },
            onError: (err) => {
                console.error(err);
                ErrorNotify(err?.response?.data?.message || "Failed to update user status.");
            },
            onSettled: () => {
                setActionLoading(null);
            }
        }
    );
};

const handleSendMail = (row) => {
    if (isActionBusy("credit", row._id)) return;
    waitingNotify(`Sending credentials to ${row.username}...`);

    const creditMutation = row.isBranch ? SendBranchCredit_ : SendCredit_;
    setActionBusy("credit", row._id);
    creditMutation.mutate({
        params: { id: row._id },
    }, {
        onSuccess: (res) => {
            SuccessNotify(res?.data?.message || `Credentials sent to ${row.officeEmail}`);
        },
        onError: (err) => {
            console.error(err);
            ErrorNotify(err?.response?.data?.message || "Failed to send credentials.");
        },
        onSettled: () => {
            setActionLoading(null);
        }
    });
};

const handleCreateNew = () => {
    setSelectedAdmin(null);
    setShowModal(true);
};

const handleRowSelect = (e, row) => {
    if (e) e.stopPropagation();

    if (row) {
        if (row.isBranch) return;
        setSelectedRows(prev => prev.includes(row._id) ? prev.filter(id => id !== row._id) : [...prev, row._id]);
    } else {
        if (allSelected || indeterminate) {
            setSelectedRows([]);
        } else {
                setSelectedRows(filtered.filter(r => !r.isBranch).map(r => r._id));
        }
    }
};

const handleRowExpand = (rowId) => {
    setExpandedRowId(currentId => currentId === rowId ? null : rowId);
};

const paginatedData = useMemo(() => filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage), [filtered, currentPage]);

const StatusBadgeRender = ({ isActive }) => (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${getStatusBadge(isActive)}`}>
        {isActive ? (
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
            </span>
        ) : (
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        )}
        {isActive ? "Active" : "InActive"}
    </span>
);

return (
    <div className="p-4 sm:p-6 bg-white rounded-2xl shadow-sm border border-slate-100 w-full relative">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between mb-6 gap-4 border-b border-slate-100 pb-5">
            <div>
                <h2 className="text-xl sm:text-2xl text-slate-800" style={fontBold}>
                    System <span className="text-blue-600">Users</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1" style={fontLight}>Manage your organizational roles and system access.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-center">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input type="text" value={search} onChange={e => handleSearch(e.target.value)} className="pl-9 pr-4 py-2.5 border border-slate-200 bg-slate-50 focus:bg-white hover:border-blue-400 focus:border-blue-500 rounded-xl w-full text-sm outline-none transition-all shadow-sm" placeholder="Search users..." style={fontLight} />
                </div>
                <button onClick={handleCreateNew} className="w-full  cursor-pointer sm:w-auto px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-800 text-white rounded-xl flex items-center justify-center text-sm shadow-md transition-all whitespace-nowrap" style={fontBold}>
                    <Plus className="w-4 h-4 mr-1.5" /> Register User
                </button>
            </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center space-x-4">
                <div className="p-3 bg-slate-200 text-slate-700 rounded-lg"><Users className="w-5 h-5" /></div>
                <div>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Total Users</p>
                    <h3 className="text-xl text-slate-800" style={fontBold}>{stats.total}</h3>
                </div>
            </div>
            <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl flex items-center space-x-4">
                <div className="p-3 bg-purple-200 text-purple-700 rounded-lg"><Shield className="w-5 h-5" /></div>
                <div>
                    <p className="text-[11px] text-purple-600 font-bold uppercase tracking-wider">Admins</p>
                    <h3 className="text-xl text-purple-900" style={fontBold}>{stats.admin}</h3>
                </div>
            </div>
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center space-x-4">
                <div className="p-3 bg-blue-200 text-blue-700 rounded-lg"><Briefcase className="w-5 h-5" /></div>
                <div>
                    <p className="text-[11px] text-blue-600 font-bold uppercase tracking-wider">Staff</p>
                    <h3 className="text-xl text-blue-900" style={fontBold}>{stats.staff}</h3>
                </div>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center space-x-4">
                <div className="p-3 bg-emerald-200 text-emerald-700 rounded-lg"><User className="w-5 h-5" /></div>
                <div>
                    <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider">Clients</p>
                    <h3 className="text-xl text-emerald-900" style={fontBold}>{stats.client}</h3>
                </div>
            </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm w-full">
            {getUserCredit_.isPending || getAllBranch_.isPending ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                    <span className="text-sm text-slate-500 font-medium">Loading user data...</span>
                </div>
            ) : (
                <table className="min-w-full divide-y divide-slate-200 cursor-default">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-5 py-4 w-12 text-left whitespace-nowrap">
                                <CustomCheckboxRender checked={allSelected} indeterminateStatus={indeterminate} onChange={(e) => handleRowSelect(e, null)} />
                            </th>
                            <th className="px-5 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">PROFILE</th>
                            <th className="px-5 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">ROLE</th>
                            <th className="px-5 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">LOCATION</th>
                            <th className="px-5 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">POSITION</th>
                            <th className="px-5 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">CONTACT INFO</th>
                            <th className="px-5 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">STATUS</th>
                            <th className="px-5 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {paginatedData.map(r => (
                            <React.Fragment key={r._id}>
                            <tr
                                onClick={() => handleRowExpand(r._id)}
                                className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${selectedRows.includes(r._id) ? 'bg-blue-50/20' : ''}`}
                            >
                                <td className="px-5 py-3 w-12 whitespace-nowrap">
                                    <CustomCheckboxRender checked={selectedRows.includes(r._id)} indeterminateStatus={false} onChange={(e) => handleRowSelect(e, r)} />
                                </td>
                                <td className="px-5 py-3 whitespace-nowrap">
                                    <div className="flex items-center space-x-3">
                                        {expandedRowId === r._id ? <ChevronUp className="w-4 h-4 text-blue-500" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm text-slate-800 truncate" style={fontBold}>{r.fullName || r.username || "Unknown"}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-3 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${getRoleBadge(r.role)}`}>
                                        {r.role || "N/A"}
                                    </span>
                                </td>
                                <td className="px-5 py-3 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-800" style={fontBold}>{r.provinceName || "N/A"}</span>
                                        <span className="text-[11px] text-slate-500" style={fontLight}>{r.districtName}, {r.localLevel}</span>
                                    </div>
                                </td>
                                <td className="px-5 py-3 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-800" style={fontBold}>{r.designation || "N/A"}</span>
                                        <span className="text-[11px] text-slate-500" style={fontLight}>{r.jobRole || "N/A"}</span>
                                    </div>
                                </td>
                                <td className="px-5 py-3 whitespace-nowrap">
                                    <div className="flex flex-col space-y-1">
                                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600" style={fontLight}>
                                            <Mail size={12} className="text-amber-500 shrink-0" /> <span className="truncate">{r.officeEmail || "N/A"}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600" style={fontLight}>
                                            <Phone size={12} className="text-orange-500 shrink-0" /> {r.officeMobile || "N/A"}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-3 whitespace-nowrap">
                                    <StatusBadgeRender isActive={r.isActive} />
                                </td>
                                <td className="px-5 py-3 whitespace-nowrap">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            title={`Mark as ${r.isActive ? 'InActive' : 'Active'}`}
                                            disabled={actionLoading !== null}
                                            className={`p-1.5 cursor-pointer rounded-lg border transition-all shadow-sm ${r.isActive ? 'bg-green-50 hover:bg-green-100 border-green-100' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'}`}
                                            onClick={(e) => handleToggleStatus(e, r)}
                                        >
                                            {isActionBusy("status", r._id) ? <Loader2 className="w-4 h-4 text-blue-500 animate-spin" /> : <Power className={`w-4 h-4 ${r.isActive ? 'text-green-600 animate-pulse' : 'text-slate-500'}`} />}
                                        </button>

                                        <button
                                            title="Send Credentials"
                                            disabled={actionLoading !== null}
                                            className="p-1.5 cursor-pointer bg-amber-50 text-amber-500 hover:bg-amber-100 rounded-lg border border-amber-100 transition-all shadow-sm"
                                            onClick={(e) => { e.stopPropagation(); handleSendMail(r); }}
                                        >
                                            {isActionBusy("credit", r._id) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                                        </button>

                                        <button
                                            title="Delete User"
                                            disabled={actionLoading !== null}
                                            className="p-1.5 cursor-pointer bg-orange-50 text-orange-500 hover:bg-orange-100 rounded-lg border border-orange-100 transition-all shadow-sm"
                                            onClick={(e) => { e.stopPropagation(); triggerDelete(r._id, r.isBranch ? r._id : null); }}
                                        >
                                            {isActionBusy("delete", r._id) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            {expandedRowId === r._id && (
                                <tr className="bg-blue-50/30">
                                    <td colSpan="8" className="px-8 py-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4 text-xs">
                                            <div><span className="text-slate-500">Full Name</span><p className="text-slate-800 font-semibold">{r.fullName || "N/A"}</p></div>
                                            <div><span className="text-slate-500">Username</span><p className="text-slate-800 font-semibold">{r.username || "N/A"}</p></div>
                                            <div><span className="text-slate-500">Department</span><p className="text-slate-800 font-semibold">{r.designation || "N/A"}</p></div>
                                            <div><span className="text-slate-500">Job Role</span><p className="text-slate-800 font-semibold">{r.jobRole || "N/A"}</p></div>
                                            <div><span className="text-slate-500">Personal Email</span><p className="text-slate-800 font-semibold">{r.personalEmail || "N/A"}</p></div>
                                            <div><span className="text-slate-500">Personal Mobile</span><p className="text-slate-800 font-semibold">{r.personalMobile || "N/A"}</p></div>
                                            <div><span className="text-slate-500">Office Email</span><p className="text-slate-800 font-semibold">{r.officeEmail || "N/A"}</p></div>
                                            <div><span className="text-slate-500">Office Mobile</span><p className="text-slate-800 font-semibold">{r.officeMobile || "N/A"}</p></div>
                                            <div><span className="text-slate-500">Province</span><p className="text-slate-800 font-semibold">{r.provinceName || "N/A"} ({r.province ?? r.Prvince ?? "N/A"})</p></div>
                                            <div><span className="text-slate-500">Districts</span><p className="text-slate-800 font-semibold">{r.districts || r.districtName || r.district || "N/A"}</p></div>
                                            <div><span className="text-slate-500">Local Level</span><p className="text-slate-800 font-semibold">{r.localLevelName || r.localLevel || "N/A"}</p></div>
                                            <div><span className="text-slate-500">Ward / Tole</span><p className="text-slate-800 font-semibold">{r.wardNo || "N/A"} / {r.toleName || "N/A"}</p></div>
                                            <div><span className="text-slate-500">Coordinates</span><p className="text-slate-800 font-semibold">{r.lat ?? "N/A"}, {r.lng ?? "N/A"}</p></div>
                                            <div><span className="text-slate-500">Record Type</span><p className="text-slate-800 font-semibold">{r.isBranch ? "Branch" : "User"}</p></div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            </React.Fragment>
                        ))}
                        {paginatedData.length === 0 && (
                            <tr>
                                <td colSpan="8" className="px-5 py-10 text-center text-slate-500" style={fontLight}>No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>

        {/* Floating Action Bar for Bulk Delete */}
        <AnimatePresence>
            {selectedRows.length > 0 && (
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-5 py-2.5 rounded-xl shadow-2xl flex items-center space-x-3 z-40 border border-slate-700" style={fontBold}
                >
                    <div className="bg-blue-500 p-1 rounded-full"><Check className="w-3 h-3 text-white" strokeWidth={3} /></div>
                    <span className="text-sm">{selectedRows.length} Users Selected</span>
                    <div className="w-px h-4 bg-slate-600 mx-1"></div>
                    <button onClick={() => triggerDelete(selectedRows)} className="flex cursor-pointer items-center gap-1.5 text-xs text-red-400 hover:text-red-300 uppercase tracking-wider transition-colors font-bold">
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                </motion.div>
            )}
        </AnimatePresence>

        {/* DELETE CONFIRMATION MODAL */}
        <AnimatePresence>
            {deleteModalState.isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-red-50/50">
                            <h3 className="text-lg cursor-pointer text-red-600 flex items-center gap-2" style={fontBold}>
                                <AlertCircle className="w-5 h-5 text-red-500" />
                                Confirm Deletion
                            </h3>
                            <button onClick={closeDeleteModal} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            <p className="text-sm text-slate-600 mb-4 leading-relaxed" style={fontLight}>
                                You are about to delete {deleteModalState.ids.length > 1 ? `${deleteModalState.ids.length} records` : 'this record'}. This action cannot be undone.
                                <br /><br />
                                Please type <strong className="text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">delete</strong> below to confirm.
                            </p>

                            <input
                                type="text"
                                value={deleteInputValue}
                                onChange={(e) => {
                                    setDeleteInputValue(e.target.value);
                                    if (deleteInputError) setDeleteInputError("");
                                }}
                                placeholder="Type delete here..."
                                className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all shadow-sm ${deleteInputError ? 'border-red-400 focus:border-red-500 bg-red-50 text-red-700' : 'border-slate-200 focus:border-red-400 bg-slate-50 focus:bg-white text-slate-700'}`}
                                autoFocus
                            />

                            {/* Error Message */}
                            <div className="min-h-[20px] mt-2">
                                {deleteInputError && (
                                    <p className="text-xs cursor-pointer text-red-500 flex items-center gap-1.5" style={fontBold}>
                                        <X className="w-3.5 h-3.5 bg-red-100 rounded-full p-0.5" />
                                        {deleteInputError}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100 bg-slate-50">
                            <button
                                onClick={closeDeleteModal}
                                className="px-4 py-2 cursor-pointer text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-200 bg-slate-100 rounded-xl transition-all"
                                style={fontBold}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeDelete}
                                disabled={actionLoading !== null}
                                className="px-5 py-2 text-sm cursor-pointer text-white bg-red-500 hover:bg-red-600 shadow-sm shadow-red-500/20 rounded-xl transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                style={fontBold}
                            >
                                {actionLoading !== null ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} {actionLoading !== null ? "Deleting..." : "OK"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        {showModal && <RegisterModal_Admin onClose={() => setShowModal(false)} onSuccess={() => { setreFetch(prev => !prev) }} initialData={selectedAdmin} editData={!!selectedAdmin} />}
    </div>
);
};

export default Data_Table;