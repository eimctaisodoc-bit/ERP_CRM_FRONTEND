import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home, Building2, Calendar, FileText,
    Users, Trash2, Plus,
    X, CheckCircle, AlertTriangle, Loader2, Activity,
    Mail, ListChecks, CircleDollarSign,
    ArrowBigLeft, Percent, MapPin, GraduationCap,
    Pencil, Phone
} from 'lucide-react';

// --- CUSTOM MUTATION HOOKS INTEGRATION ---
import { UseAdd } from '../../hooks/useadd';
import { useGet } from '../../hooks/useGet';
import { UseDelete } from '../../hooks/useDelete';

const fontLight = { fontFamily: "'Roboto Slab', serif", fontWeight: 300 };
const fontBold = { fontFamily: "'Roboto Slab', serif", fontWeight: 700 };

export default function Proposal({ id, setStage }) {
    // --- STATE ---
    const [activities, setActivities] = useState([]);
    const [organizations, setOrganizations] = useState([{}]);
    const [isLoadingOrg, setIsLoadingOrg] = useState(false);

    // UX / API States
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Email & Proposal States
    const [msgTo, setMsgTo] = useState([]);
    const [emailInput, setEmailInput] = useState('');
    const [activeTab, setActiveTab] = useState('terms');

    // Default Terms and Conditions
    const [termsAndConditions, setTermsAndConditions] = useState([
        { id: 'default-1', text: 'This proposal is valid for 30 days from the date of submission.' },
        { id: 'default-2', text: '50% advance payment is required to initiate the project.' },
        { id: 'default-3', text: 'Any additional requirements outside the scope will be billed separately.' }
    ]);
    const [listDraft, setListDraft] = useState('');

    // Installments State
    const [installments, setInstallments] = useState([]);
    const [installmentDraft, setInstallmentDraft] = useState({ month: '', percent: '', rs: '' });

    const [editingListItem, setEditingListItem] = useState(null);

    // --- INITIALIZE HOOKS ---
    const { Getproposal_, getOnlyOrgDetails_ } = useGet();
    const { proposal_ } = UseAdd();
    const { Deleteproposal_ } = UseDelete();
    const currentOrg = organizations[0] || {};

    useEffect(() => {
        if (!id?.mainID) {
            setIsLoadingOrg(false);
            return;
        }

        setIsLoadingOrg(true);
        getOnlyOrgDetails_.mutate(
            { parms: { _id: id.mainID } },
            {
                onSuccess: (data) => {
                    const fetchedOrgs = data?.data?.organizationDetails;
                    setOrganizations(fetchedOrgs?.length ? fetchedOrgs : [{}]);
                    setIsLoadingOrg(false);
                },
                onError: () => {
                    setOrganizations([{}]);
                    setIsLoadingOrg(false);
                },
            }
        );
    }, [id?.mainID]);

    // --- FETCH INITIAL TIMELINE DATA ---
    const fetchActivities = async () => {
        try {
            const res = await Getproposal_.mutateAsync({
                parms: { MainID: id?.mainID }
            });

            if (res?.data) {
                setActivities(res.data);
            } else if (Array.isArray(res)) {
                setActivities(res);
            }
        } catch (error) {
            console.error("Error fetching timeline activities:", error);
        }
    };

    useEffect(() => {
        if (id?.mainID) fetchActivities();
    }, [id?.mainID]);

    // --- UX HELPERS ---
    const showNotification = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
    };

    // =========================================================================
    // API HANDLERS (ADD, EDIT, DELETE)
    // =========================================================================

    const handleSaveMessageAPI = async (payload) => {
        setIsSubmitting(true);
        try {
            const newRecord = {
                sendto: payload.sendto,
                // Map the objects back to strings if your backend expects an array of strings
                termsAndConditions: payload.termsAndConditions.map(t => t.text),
                installments: payload.installments, 
            };

            const apiPayload = [newRecord];

            const res = await proposal_.mutateAsync({
                parms: { MainID: id?.mainID },
                payload: apiPayload
            });

            fetchActivities();
            showNotification(res.message, 'success');
            return true;
        } catch (error) {
            console.error("Add Mutation Error:", error);
            showNotification("Failed to send proposal.", "error");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteActivity = async (activityId) => {
        if (window.confirm("Are you sure you want to delete this record permanently?")) {
            try {
                await Deleteproposal_.mutateAsync({
                    parms: { MainID: id?.mainID, id: activityId }
                });
                fetchActivities();
                showNotification("Record removed from timeline feed.");
            } catch (error) {
                console.error("Delete Mutation Error:", error);
                showNotification("Failed to delete record.", "error");
            }
        }
    };

    // --- FRONTEND TRIGGER SUBMITS ---
    const submitProposalEmail = async () => {
        if (msgTo.length === 0) return showNotification("Please add at least one recipient.", "error");

        const payload = {
            sendto: msgTo,
            termsAndConditions,
            installments,
        };

        const success = await handleSaveMessageAPI(payload);

        if (success) {
            cancelForm();
        }
    };

    const cancelForm = () => {
        setMsgTo([]);
        setListDraft('');
        setInstallmentDraft({ month: '', percent: '', rs: '' });
        setEditingListItem(null);
        setActiveTab('terms');
    };

    // --- TERMS & CONDITIONS LOGIC ---
    const addTermItem = (event) => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        const value = listDraft.trim();
        if (!value) return;

        if (editingListItem !== null) {
            setTermsAndConditions(prev => prev.map(t => t.id === editingListItem ? { ...t, text: value } : t));
        } else {
            // Unshift (Add to top)
            setTermsAndConditions(prev => [{ id: Date.now().toString(), text: value }, ...prev]);
        }
        setListDraft('');
        setEditingListItem(null);
    };

    // --- INSTALLMENT LOGIC ---
    const saveInstallment = () => {
        if (!installmentDraft.month || !installmentDraft.percent || !installmentDraft.rs) return;

        if (editingListItem !== null) {
            setInstallments(prev => prev.map(inst => inst.id === editingListItem ? { ...installmentDraft, id: editingListItem } : inst));
        } else {
            // Push (Add to bottom)
            setInstallments(prev => [...prev, { ...installmentDraft, id: Date.now().toString() }]);
        }
        setInstallmentDraft({ month: '', percent: '', rs: '' });
        setEditingListItem(null);
    };

    const editListItem = (idToEdit, type) => {
        if (type === 'terms') {
            const item = termsAndConditions.find(t => t.id === idToEdit);
            setListDraft(item.text);
        } else {
            const item = installments.find(i => i.id === idToEdit);
            setInstallmentDraft({ month: item.month, percent: item.percent, rs: item.rs });
        }
        setEditingListItem(idToEdit);
    };

    const deleteListItem = (idToDelete, type) => {
        if (type === 'terms') {
            setTermsAndConditions(prev => prev.filter(t => t.id !== idToDelete));
        } else {
            setInstallments(prev => prev.filter(i => i.id !== idToDelete));
        }
        if (editingListItem === idToDelete) {
            setListDraft('');
            setInstallmentDraft({ month: '', percent: '', rs: '' });
            setEditingListItem(null);
        }
    };

    const switchTab = (tab) => {
        setActiveTab(tab);
        setListDraft('');
        setInstallmentDraft({ month: '', percent: '', rs: '' });
        setEditingListItem(null);
    };

    const handleAddEmail = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newEmail = emailInput.trim();
            if (!newEmail) return;
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) return showNotification("Please enter a valid email address.", "error");

            if (!msgTo.includes(newEmail) && msgTo.length < 5) {
                setMsgTo([...msgTo, newEmail]);
                setEmailInput('');
            } else if (msgTo.includes(newEmail)) {
                showNotification("Email already added.", "error");
            }
        }
    };

    const handleRemoveEmail = (indexToRemove) => setMsgTo(msgTo.filter((_, index) => index !== indexToRemove));

    return (
        <div className="h-screen overflow-hidden flex flex-col text-[13px] sm:text-sm bg-[#f5f8fa] text-[#33475b] relative" style={fontLight}>

            {toast.show && (
                <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2.5 rounded-md shadow-lg flex items-center gap-2 text-sm font-medium transition-all duration-300 ${toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {toast.type === 'success' ? <CheckCircle size={18} className="text-green-600" /> : <AlertTriangle size={18} className="text-red-600" />}
                    {toast.message}
                </div>
            )}

            <header className="flex-shrink-0 bg-white border-b border-[#cbd6e2] px-4 py-2 flex items-center shadow-sm z-10">
                <button className="flex items-center gap-2 bg-[#1a2d42] text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-[#2c3f54] transition-colors cursor-pointer" onClick={() => setStage(false)}>
                    <ArrowBigLeft size={18} />
                </button>
            </header>

            <main className="flex-1 overflow-hidden p-4 sm:p-6 max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

                {/* LEFT SIDEBAR - DEAL INFO */}
                <aside className="lg:col-span-3 flex flex-col gap-4 lg:h-full lg:overflow-y-auto scrollbar-thin">
                    <div className="bg-white rounded-lg border border-[#cbd6e2] shadow-sm p-4 sm:p-5 flex-shrink-0">
                        <div className="flex justify-between items-center mb-4">
                            <h2 style={fontBold} className="text-base flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-orange-100 text-[#ff7a59] flex items-center justify-center"><Home size={14} /></div>
                                Deal Context
                            </h2>
                        </div>
                        {isLoadingOrg ? (
                            <div className="flex justify-center p-4"><Loader2 className="animate-spin text-gray-400" /></div>
                        ) : (
                            <>
                                <div className="flex items-center gap-3 pb-5 mb-5 border-b border-slate-100">
                                    <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center shadow-inner flex-shrink-0">
                                        <Building2 size={22} />
                                    </div>
                                    <div>
                                        <span className="text-[11px] text-slate-400 uppercase tracking-tight block" style={fontBold}>Organization</span>
                                        <h1 className="text-base text-slate-900 leading-snug" style={fontBold}>
                                            {currentOrg?.organizationName || "Loading profile..."}
                                        </h1>
                                    </div>
                                </div>
                                <div className="space-y-3 mb-2" style={fontLight}>
                                    <div className="space-y-3 text-xs" style={fontLight}>
                                        <div className="flex items-center justify-between py-0.5">
                                            <span className="text-slate-500 font-medium">Org Type</span>
                                            <span className="capitalize text-slate-800 bg-slate-50 px-2 py-0.5 rounded border border-slate-100" style={fontBold}>
                                                {currentOrg?.organizationType ? currentOrg.organizationType.replace('_', ' ') : '—'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between py-0.5">
                                            <span className="text-slate-500 font-medium">Reg Number</span>
                                            <span className="text-slate-800 select-all" style={fontBold}>
                                                {currentOrg?.registrationNumber || '—'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between py-0.5">
                                            <span className="text-slate-500 font-medium">VAT / PAN</span>
                                            <span className="text-slate-800 select-all" style={fontBold}>
                                                {currentOrg?.vatPan || '—'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between py-0.5">
                                            <span className="text-slate-500 font-medium">Project Start</span>
                                            <span className="flex items-center gap-1.5 text-slate-700" style={fontBold}>
                                                <Calendar size={13} className="text-slate-400" />
                                                {currentOrg?.date || '—'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between pt-2 mt-2 border-t border-dashed border-slate-100">
                                            <span className="text-slate-500 font-medium">Applied Discount</span>
                                            <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full text-[11px]" style={fontBold}>
                                                <Percent size={11} strokeWidth={2.5} />
                                                {currentOrg?.discounted ?? 0} Off
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-shrink-0 overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
                            <h2 className="text-sm flex items-center gap-2 text-slate-800" style={fontBold}>
                                <FileText size={15} className="text-blue-500" />
                                Organization Specs
                            </h2>
                        </div>
                        {isLoadingOrg ? (
                            <div className="flex items-center justify-center p-8">
                                <Loader2 size={28} className="animate-spin text-blue-500" aria-label="Loading organization specifications" />
                            </div>
                        ) : (
                            <div className="p-5 space-y-5">
                                <div>
                                    <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-2" style={fontBold}>Industry Profiles</div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {currentOrg?.industyType && currentOrg.industyType.length > 0 ? (
                                            currentOrg.industyType.map((industry, index) => (
                                                <span key={index} className="bg-blue-50/60 text-blue-700 px-2.5 py-0.5 rounded-md text-[11px] border border-blue-100 capitalize transition-colors hover:bg-blue-100/70" style={fontLight}>{industry}</span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-slate-400 italic" style={fontLight}>No industry tags defined</span>
                                        )}
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-2.5" style={fontBold}>Demographics & Infrastructure</div>
                                    <div className="text-xs text-slate-700 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100 space-y-3">
                                        <div className="flex items-start gap-2.5">
                                            <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                                            <div className="leading-normal">
                                                <strong className="text-slate-500 block text-[11px]" style={fontBold}>Address</strong>
                                                <span className="text-slate-800" style={fontLight}>{currentOrg?.address || '—'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2.5">
                                            <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                                            <div className="leading-normal">
                                                <strong className="text-slate-500 block text-[11px]" style={fontBold}>Location</strong>
                                                <span className="text-slate-800" style={fontLight}>
                                                    {currentOrg?.localLevel ? currentOrg.localLevel + ', ' : ''}
                                                    {currentOrg?.district ? currentOrg.district + ', ' : ''}
                                                    {currentOrg?.province ? currentOrg.province : '—'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                                            <div className="bg-white p-2 rounded-lg border border-slate-100">
                                                <div className="flex items-center gap-1 text-slate-400 mb-0.5">
                                                    <GraduationCap size={13} />
                                                    <span className="text-[10px] uppercase tracking-tight" style={fontLight}>Educators</span>
                                                </div>
                                                <span className="text-slate-800 text-sm" style={fontBold}>{currentOrg?.totalEducator ?? 0}</span>
                                            </div>
                                            <div className="bg-white p-2 rounded-lg border border-slate-100">
                                                <div className="flex items-center gap-1 text-slate-400 mb-0.5">
                                                    <Users size={13} />
                                                    <span className="text-[10px] uppercase tracking-tight" style={fontLight}>Learners</span>
                                                </div>
                                                <span className="text-slate-800 text-sm" style={fontBold}>{currentOrg?.totalEmp_learners ?? 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                {/* MIDDLE SECTION - ACTIVITY / COMPOSER */}
                <div className="lg:col-span-6 bg-white rounded-lg border border-[#cbd6e2] shadow-sm flex flex-col h-full overflow-hidden">
                    <div className="p-4 border-b border-[#cbd6e2] flex-shrink-0 flex items-center gap-2">
                        <Activity size={18} className="text-gray-500" />
                        <h2 className="text-base text-center cursor-default" style={fontBold}>Send Proposal</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 scrollbar-thin">

                        {/* PROPOSAL COMPOSER */}
                        <div className="bg-white border border-[#cbd6e2] rounded-lg shadow-sm mb-6 transition-all">
                            <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-lg">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded bg-blue-100 text-blue-600 flex items-center justify-center">
                                        <FileText size={16} />
                                    </div>
                                    <span style={fontBold}>Proposal Recipients</span>
                                </div>
                            </div>

                            <div className="p-4 space-y-5 bg-gray-50/30">

                                {/* Email Recipients */}
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1.5 cursor-pointer">
                                        <div className="p-1.5 rounded-md bg-blue-50 text-blue-500">
                                            <Mail size={14} />
                                        </div>
                                        Send To
                                    </label>
                                    <div className="w-full border border-slate-300 rounded p-2 text-sm focus-within:border-amber-500 shadow-sm bg-white flex flex-wrap items-center gap-2 transition-colors cursor-text">
                                        <AnimatePresence>
                                            {msgTo.map((email, index) => (
                                                <motion.span 
                                                    initial={{ opacity: 0, scale: 0.8 }} 
                                                    animate={{ opacity: 1, scale: 1 }} 
                                                    exit={{ opacity: 0, scale: 0.8 }} 
                                                    key={index} 
                                                    className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-blue-200 cursor-default"
                                                >
                                                    {email}
                                                    <button onClick={() => handleRemoveEmail(index)} className="hover:text-red-500 hover:bg-white rounded-full w-4 h-4 flex items-center justify-center ml-1 focus:outline-none transition-colors cursor-pointer"><X size={10} /></button>
                                                </motion.span>
                                            ))}
                                        </AnimatePresence>
                                        {msgTo.length < 5 ? (
                                            <input type="text" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} onKeyDown={handleAddEmail} className="flex-1 focus:outline-none bg-transparent placeholder-gray-400 min-w-[200px]" placeholder={msgTo.length === 0 ? "e.g. client@domain.com (Press Enter)" : "Add another email..."} />
                                        ) : (
                                            <span className="text-xs text-orange-500 font-medium py-1 flex items-center gap-1"><AlertTriangle size={12} /> Max 5 recipients</span>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t border-slate-200 pt-4">
                                    <div className="flex gap-1 border-b border-slate-200 mb-4">
                                        <button type="button" onClick={() => switchTab('terms')} className={`px-3 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${activeTab === 'terms' ? 'border-amber-500 text-amber-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                                            <span className="inline-flex items-center gap-1.5"><ListChecks size={15} /> Terms & Conditions ({termsAndConditions.length})</span>
                                        </button>
                                        <button type="button" onClick={() => switchTab('installments')} className={`px-3 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${activeTab === 'installments' ? 'border-amber-500 text-amber-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                                            <span className="inline-flex items-center gap-1.5"><CircleDollarSign size={15} /> Installments ({installments.length})</span>
                                        </button>
                                    </div>

                                    {/* TERMS AND CONDITIONS TAB */}
                                    {activeTab === 'terms' && (
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                                                <ListChecks size={15} className="text-amber-600" />
                                                Add a term or condition (adds to top)
                                            </label>
                                            <textarea
                                                value={listDraft}
                                                onChange={(event) => setListDraft(event.target.value)}
                                                onKeyDown={addTermItem}
                                                rows={2}
                                                className="w-full border border-slate-300 rounded p-2 text-sm focus:border-amber-500 focus:outline-none shadow-sm resize-y"
                                                placeholder={editingListItem === null ? 'Type and press Enter to add...' : 'Edit item and press Enter to save...'}
                                            />
                                            {termsAndConditions.length > 0 && (
                                                <div style={{ maxHeight: '330px', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }} className="[&::-webkit-scrollbar]:hidden pr-1">
                                                    <ol className="space-y-2 text-sm list-decimal pl-5 marker:font-bold marker:text-slate-500">
                                                        <AnimatePresence>
                                                            {termsAndConditions.map((item) => (
                                                                <motion.li 
                                                                    key={item.id}
                                                                    layout
                                                                    initial={{ opacity: 0, y: -15 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                                    className="pl-2 bg-white border border-slate-200 rounded p-2 shadow-sm"
                                                                >
                                                                    <div className="flex items-start justify-between gap-2">
                                                                        <span className="flex-1 whitespace-pre-wrap break-words">{item.text}</span>
                                                                        <div className="flex gap-1 shrink-0">
                                                                            <button type="button" onClick={() => editListItem(item.id, 'terms')} className="text-blue-600 cursor-pointer hover:bg-blue-50 rounded p-1" title="Edit"><Pencil size={14} /></button>
                                                                            <button type="button" onClick={() => deleteListItem(item.id, 'terms')} className="text-red-500 cursor-pointer hover:bg-red-50 rounded p-1" title="Delete"><Trash2 size={14} /></button>
                                                                        </div>
                                                                    </div>
                                                                </motion.li>
                                                            ))}
                                                        </AnimatePresence>
                                                    </ol>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* INSTALLMENTS TAB */}
                                    {activeTab === 'installments' && (
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                                                <CircleDollarSign size={15} className="text-blue-600" />
                                                Add an installment scheme
                                            </label>
                                            
                                            <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center mb-3 bg-white p-2 border border-slate-300 rounded shadow-sm focus-within:border-amber-500 transition-colors">
                                                <input type="text" placeholder="Month (e.g. 1st Month)" value={installmentDraft.month} onChange={e => setInstallmentDraft({...installmentDraft, month: e.target.value})} className="flex-1 border-none focus:ring-0 text-sm p-1 outline-none min-w-[100px]" />
                                                <div className="hidden sm:block w-px h-6 bg-slate-200"></div>
                                                <input type="number" placeholder="%" value={installmentDraft.percent} onChange={e => setInstallmentDraft({...installmentDraft, percent: e.target.value})} className="w-full sm:w-20 border-none focus:ring-0 text-sm p-1 outline-none" />
                                                <div className="hidden sm:block w-px h-6 bg-slate-200"></div>
                                                <input type="number" placeholder="Rs. Amount" value={installmentDraft.rs} onChange={e => setInstallmentDraft({...installmentDraft, rs: e.target.value})} className="w-full sm:w-28 border-none focus:ring-0 text-sm p-1 outline-none" />
                                                <button type="button" onClick={saveInstallment} className="bg-amber-500 hover:bg-amber-600 text-white p-1.5 px-3 rounded transition-colors flex items-center justify-center cursor-pointer w-full sm:w-auto">
                                                    {editingListItem !== null ? <><CheckCircle size={16} className="mr-1"/> Save</> : <><Plus size={16} className="mr-1"/> Add</>}
                                                </button>
                                            </div>

                                            {installments.length > 0 && (
                                                <div className="overflow-hidden border border-slate-200 rounded-lg shadow-sm">
                                                    <table className="w-full text-left text-sm bg-white">
                                                        <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                                                            <tr>
                                                                <th className="px-3 py-2 w-12 text-center">S.N.</th>
                                                                <th className="px-3 py-2">Month</th>
                                                                <th className="px-3 py-2">%</th>
                                                                <th className="px-3 py-2">Amount (Rs)</th>
                                                                <th className="px-3 py-2 text-right">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <AnimatePresence>
                                                                {installments.map((inst, idx) => (
                                                                    <motion.tr 
                                                                        layout
                                                                        initial={{ opacity: 0, x: -10 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        exit={{ opacity: 0, x: -10 }}
                                                                        key={inst.id} 
                                                                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                                                                    >
                                                                        <td className="px-3 py-2 text-center font-medium text-slate-500">{idx + 1}</td>
                                                                        <td className="px-3 py-2">{inst.month}</td>
                                                                        <td className="px-3 py-2">{inst.percent}%</td>
                                                                        <td className="px-3 py-2 text-emerald-600 font-medium">Rs. {inst.rs}</td>
                                                                        <td className="px-3 py-2 text-right">
                                                                            <button type="button" onClick={() => editListItem(inst.id, 'installments')} className="text-blue-600 hover:bg-blue-100 p-1.5 rounded mr-1 cursor-pointer"><Pencil size={14} /></button>
                                                                            <button type="button" onClick={() => deleteListItem(inst.id, 'installments')} className="text-red-500 hover:bg-red-100 p-1.5 rounded cursor-pointer"><Trash2 size={14} /></button>
                                                                        </td>
                                                                    </motion.tr>
                                                                ))}
                                                            </AnimatePresence>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                            </div>

                            <div className="p-4 flex gap-3 border-t border-gray-100 bg-gray-50/50 rounded-b-lg">
                                <button onClick={submitProposalEmail} disabled={isSubmitting} className="bg-[#ff7a59] hover:bg-orange-600 disabled:opacity-70 text-white px-5 py-1.5 rounded font-medium flex items-center gap-2 transition-colors cursor-pointer">
                                    {isSubmitting && <Loader2 size={14} className="animate-spin" />} {isSubmitting ? 'Sending...' : 'Send Proposal Email'}
                                </button>
                                <button onClick={cancelForm} disabled={isSubmitting} className="text-blue-600 hover:underline font-medium disabled:opacity-50 cursor-pointer">Cancel</button>
                            </div>
                        </div>

                        <h3 className="text-blue-800 mb-4 mt-2" style={fontBold}>Timeline Feed</h3>
                        <div className="space-y-4">
                            {activities.map(activity => (
                                <ActivityCard key={activity.id || activity._id} data={activity} onDelete={handleDeleteActivity} />
                            ))}
                            {activities.length === 0 && (
                                <div className="text-gray-400 text-center py-10 flex flex-col items-center gap-2 bg-white rounded-lg border border-dashed border-slate-300">
                                    <FileText size={32} className="text-gray-300" />
                                    <p>No proposals sent yet.</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* RIGHT SIDEBAR - AGENT & CONTACTS */}
                <aside className="lg:col-span-3 h-full overflow-y-auto flex flex-col gap-4 scrollbar-thin pr-1">
                    <div className="bg-white rounded-lg border border-[#cbd6e2] shadow-sm flex flex-col flex-1 overflow-hidden">
                        <div className="p-4 border-b border-[#cbd6e2] flex-shrink-0">
                            <h2 className="text-[15px] flex items-center gap-2" style={fontBold}><Users size={18} className="text-blue-500" /> Primary & Related Contacts</h2>
                        </div>
                        {isLoadingOrg ? (
                            <div className="flex flex-1 items-center justify-center p-6">
                                <Loader2 size={28} className="animate-spin text-blue-500" aria-label="Loading contacts" />
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                                {currentOrg.contactPersonName ? (
                                    <div className="border border-amber-200 bg-amber-50/20 rounded-lg p-4 shadow-sm">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs uppercase" style={fontBold}>
                                                {currentOrg.contactPersonName.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="text-slate-900 text-[14px]" style={fontBold}>{currentOrg.contactPersonName}</h4>
                                                <p className="text-[#516f90] text-[12px] mt-0.5 capitalize" style={fontLight}>{currentOrg.role || 'Primary Contact'}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-[12px]" style={fontLight}>
                                            <div className="flex items-center gap-2 text-slate-700"><Phone size={13} className="text-slate-400" /><span>{currentOrg.contactPersonNumber || 'N/A'}</span></div>
                                            <div className="flex items-center gap-2"><Mail size={13} className="text-slate-400" /><a href={`mailto:${currentOrg.contactPersonEmail}`} className="text-blue-600 hover:underline truncate">{currentOrg.contactPersonEmail}</a></div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-xs text-slate-400 italic text-center py-2" style={fontLight}>No contact person declared</div>
                                )}

                                <div className="border border-slate-200 rounded-lg p-4 shadow-sm bg-white">
                                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-2.5" style={fontBold}>Corporate Channels</span>
                                    <div className="space-y-2 text-[12px]" style={fontLight}>
                                        <div className="flex items-center gap-2 text-slate-700"><Phone size={13} className="text-slate-400" /><span>{currentOrg.orgTelephone || 'No Telephone'}</span></div>
                                        <div className="flex items-center gap-2"><Mail size={13} className="text-slate-400" /><a href={`mailto:${currentOrg.orgEmail}`} className="text-blue-600 hover:underline truncate">{currentOrg.orgEmail || 'No Email Registered'}</a></div>
                                    </div>
                                </div>

                                {currentOrg?.alternativeContacts?.length > 0 && currentOrg.alternativeContacts.some(c => c.name) && (
                                    <div className="pt-4 mt-4 space-y-3 border-t border-slate-200">
                                        <h4 className="text-xs tracking-wider text-slate-500 uppercase px-1" style={fontBold}>Alternative Contacts</h4>
                                        <div className="space-y-2">
                                            {currentOrg.alternativeContacts.map((alt, idx) => alt.name && (
                                                <div key={idx} className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-slate-300 transition-colors duration-200">
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <span className="text-sm text-slate-800" style={fontBold}>{alt.name}</span>
                                                        {alt.role && <span className="inline-flex items-center px-2 py-0.5 text-[10px] text-slate-600 bg-slate-100 rounded-full border border-slate-200/60" style={fontLight}>{alt.role}</span>}
                                                    </div>
                                                    <div className="space-y-1.5" style={fontLight}>
                                                        {alt.contact && <div className="flex items-center text-xs text-slate-600"><Phone size={12} className="mr-2 text-slate-400" />{alt.contact}</div>}
                                                        {alt.email && <div className="flex items-center text-xs text-slate-600"><Mail size={12} className="mr-2 text-slate-400" /><a href={`mailto:${alt.email}`} className="text-blue-600 hover:text-blue-800 hover:underline truncate transition-colors">{alt.email}</a></div>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </aside>
            </main>
        </div>
    );
}

// Timeline Feed Card Display
function ActivityCard({ data, onDelete }) {
    const formatDate = (isoString) => {
        if (!isoString) return '';
        return new Date(isoString).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="bg-white border border-[#cbd6e2] rounded-lg shadow-sm transition-all duration-300 relative overflow-hidden hover:shadow-md group" style={fontLight}>
            <div className="p-3 border-b border-gray-100 flex justify-between items-start gap-2 bg-gray-50/30">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm border border-white">
                        <Mail size={16} />
                    </div>
                    <div className="text-[13px]">
                        <span className="font-bold">Proposal Email Sent</span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded px-1 py-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onDelete(data._id)} className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer" title="Delete"><Trash2 size={14} /> Delete</button>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(data.timestamp || new Date())}</span>
                </div>
            </div>

            <div className="p-4 text-[14px] text-gray-800">
                <div className="mb-4 bg-gray-50 border border-slate-200 p-3 rounded text-[13px]">
                    <div className="text-gray-600 break-words flex gap-1">
                        <span className="font-medium text-gray-800">To:</span>
                        {Array.isArray(data.sendto) ? data.sendto.join(', ') : data.sendto}
                    </div>
                </div>

                {(data.termsAndConditions?.length > 0 || data.installments?.length > 0) && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {data.termsAndConditions?.length > 0 && (
                            <div className="border border-amber-200 bg-amber-50/40 rounded p-3">
                                <div className="text-xs font-bold text-amber-700 mb-2 uppercase tracking-wide">Terms & Conditions</div>
                                <ol className="list-decimal pl-5 space-y-1 text-sm text-slate-700 marker:font-bold">
                                    {data.termsAndConditions.map((item, index) => <li key={index} className="pl-1">{typeof item === 'string' ? item : item.text}</li>)}
                                </ol>
                            </div>
                        )}
                        
                        {data.installments?.length > 0 && (
                            <div className="border border-blue-200 bg-blue-50/40 rounded overflow-hidden">
                                <div className="text-xs font-bold text-blue-700 mb-2 mt-3 ml-3 uppercase tracking-wide">Installments</div>
                                <table className="w-full text-left text-sm bg-white border-t border-blue-100">
                                    <thead className="bg-blue-50/50 text-xs text-slate-600">
                                        <tr>
                                            <th className="px-2 py-1.5 w-10 text-center">S.N</th>
                                            <th className="px-2 py-1.5">Month</th>
                                            <th className="px-2 py-1.5">%</th>
                                            <th className="px-2 py-1.5">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.installments.map((inst, idx) => (
                                            <tr key={idx} className="border-b border-blue-50 last:border-0 text-slate-700">
                                                <td className="px-2 py-1.5 text-center font-medium">{idx + 1}</td>
                                                {typeof inst === 'object' ? (
                                                    <>
                                                        <td className="px-2 py-1.5">{inst.month}</td>
                                                        <td className="px-2 py-1.5">{inst.percent}%</td>
                                                        <td className="px-2 py-1.5 text-emerald-600 font-medium">Rs. {inst.rs}</td>
                                                    </>
                                                ) : (
                                                    <td colSpan="3" className="px-2 py-1.5">{inst}</td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}