import React, { useState, useRef, useEffect } from 'react';
import DOMPurify from 'dompurify';

import {
    Home, Building2, Calendar, PencilLine,
    Mail, Phone, ListChecks, FileText, Paperclip, Sparkles, Bot, MessageCircle,
    Users, Edit2, Trash2, CalendarPlus, CalendarCheck,
    List, X, ListOrdered, CheckCircle, AlertTriangle, Loader2, Activity,
    ArrowLeft
} from 'lucide-react';
import DateUsage from '../../nepalidate/dateUsage';

// --- TYPOGRAPHY CONSTANTS ---
const fontLight = { fontFamily: "'Roboto Slab', serif", fontWeight: 300 };
const fontBold = { fontFamily: "'Roboto Slab', serif", fontWeight: 700 };

// --- TIME UTILITIES ---
const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

const getSystemTimePlusHour = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

// --- MOCK API / INITIAL STATE ---
const initialActivities = [];

function RichEditor({ contentRef, placeholder, attachments, setAttachments }) {
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        if (!e.target.files) return;
        const newFiles = Array.from(e.target.files).map(f => ({ name: f.name }));
        setAttachments([...attachments, ...newFiles]);
        e.target.value = ''; // Reset input
    };

    const removeAttachment = (index) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    const format = (command, e) => {
        e.preventDefault();
        document.execCommand(command, false, null);
    };

    return (
        <div className="border border-blue-300 rounded-md flex flex-col focus-within:ring-1 focus-within:ring-blue-400 mt-2 bg-white overflow-hidden shadow-sm transition-all duration-200" style={fontLight}>
            <div
                ref={contentRef}
                contentEditable
                className="w-full p-3 h-32 overflow-y-auto focus:outline-none text-[14px] leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 cursor-text"
                data-placeholder={placeholder}
            ></div>

            {/* Attachments Preview */}
            {attachments.length > 0 && (
                <div className="px-3 flex flex-wrap gap-2 pb-3 border-t border-gray-100 pt-2 bg-gray-50/50">
                    {attachments.map((file, i) => (
                        <div key={i} className="flex items-center gap-1.5 bg-white border border-gray-200 shadow-sm rounded px-2 py-1 text-xs text-gray-700">
                            <FileText size={12} className="text-gray-500" />
                            <span className="truncate max-w-[150px]">{file.name}</span>
                            <button type="button" onClick={() => removeAttachment(i)} className="hover:text-red-500 ml-1 bg-red-50 hover:bg-red-100 rounded-full p-0.5 transition-colors cursor-pointer">
                                <X size={10} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Formatting Toolbar */}
            <div className="border-t border-gray-200 p-2 flex items-center gap-1 sm:gap-2 text-gray-600 flex-wrap bg-gray-50">
                <button type="button" onMouseDown={(e) => format('bold', e)} style={fontBold} className="p-1.5 hover:bg-gray-200 rounded w-8 h-8 flex items-center justify-center transition-colors cursor-pointer">B</button>
                <button type="button" onMouseDown={(e) => format('italic', e)} style={fontLight} className="p-1.5 hover:bg-gray-200 rounded italic w-8 h-8 flex items-center justify-center transition-colors cursor-pointer">I</button>
                <button type="button" onMouseDown={(e) => format('underline', e)} style={fontLight} className="p-1.5 hover:bg-gray-200 rounded underline w-8 h-8 flex items-center justify-center transition-colors cursor-pointer">U</button>

                <button type="button" onMouseDown={(e) => format('insertUnorderedList', e)} className="p-1.5 hover:bg-gray-200 rounded w-8 h-8 flex items-center justify-center transition-colors cursor-pointer">
                    <List size={16} />
                </button>
                <button type="button" onMouseDown={(e) => format('insertOrderedList', e)} className="p-1.5 hover:bg-gray-200 rounded w-8 h-8 flex items-center justify-center transition-colors cursor-pointer" title="Numbered List">
                    <ListOrdered size={16} />
                </button>

                <div className="w-px h-5 bg-gray-300 mx-1"></div>

                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
                <button type="button" onClick={() => fileInputRef.current.click()} style={fontBold} className="px-3 py-1 hover:bg-blue-100 bg-white border border-gray-200 rounded text-blue-600 text-sm flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer">
                    <Paperclip size={14} /> Attach
                </button>
            </div>
        </div>
    );
}

export default function P_Meeting({ id, setStage }) {
    // --- STATE ---
    const [activities, setActivities] = useState(initialActivities);
    const [activeTab, setActiveTab] = useState('notes');

    // UX / API States
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Form States & Refs
    const noteRef = useRef(null);
    const [noteAttachments, setNoteAttachments] = useState([]);

    const [msgType, setMsgType] = useState('email');
    const [msgTo, setMsgTo] = useState([]);
    const [emailInput, setEmailInput] = useState('');
    const [msgSubject, setMsgSubject] = useState('');
    const msgRef = useRef(null);
    const [msgAttachments, setMsgAttachments] = useState([]);

    const [callContact, setCallContact] = useState('Om Prakash Prasai');
    const [callOutcome, setCallOutcome] = useState('Connected');
    const callRef = useRef(null);
    const [callAttachments, setCallAttachments] = useState([]);

    // --- MEETING STATES ---
    const [meetTitle, setMeetTitle] = useState('ISO Documentation Sync');
    const [meetDates, setMeetDates] = useState({ from: '', to: '' });
    const [meetTimes, setMeetTimes] = useState({ from: getCurrentTime(), to: getSystemTimePlusHour() });
    const [meetBy, setMeetBy] = useState('Shailendra Kumar Kharel');
    const meetRef = useRef(null);
    const [meetAttachments, setMeetAttachments] = useState([]);

    useEffect(() => {
        console.log('Current Global Feed Status:', activities);
    }, [activities]);

    const showNotification = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
    };

    // =========================================================================
    // MUTATION APIs
    // =========================================================================

    const handleSaveNoteAPI = async (payload) => {
        setIsSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 600));
            const newNote = { id: `note-${Date.now()}`, type: 'note', author: 'Shailendra Kumar Kharel', timestamp: new Date().toISOString(), ...payload };
            setActivities(prev => [newNote, ...prev]);
            showNotification('Note logged successfully!', 'success');
            return true;
        } catch (error) {
            showNotification("Failed to save note.", "error");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveMessageAPI = async (payload, type) => {
        setIsSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 600));
            const newMessage = { id: `msg-${Date.now()}`, type: type, author: 'Shailendra Kumar Kharel', timestamp: new Date().toISOString(), ...payload };
            setActivities(prev => [newMessage, ...prev]);
            showNotification(`${type === 'email' ? 'Email sent' : 'Message saved'} successfully!`, 'success');
            return true;
        } catch (error) {
            showNotification("Failed to route message pipeline.", "error");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveCallAPI = async (payload) => {
        setIsSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 600));
            const newCall = { id: `call-${Date.now()}`, type: 'call', author: 'Shailendra Kumar Kharel', timestamp: new Date().toISOString(), ...payload };
            setActivities(prev => [newCall, ...prev]);
            showNotification('Call details logged successfully!', 'success');
            return true;
        } catch (error) {
            showNotification("Failed to store call ledger.", "error");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveMeetingAPI = async (payload) => {
        setIsSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 600));
            const newMeeting = { id: `meet-${Date.now()}`, type: 'meeting', author: 'Shailendra Kumar Kharel', timestamp: new Date().toISOString(), ...payload };
            setActivities(prev => [newMeeting, ...prev]);
            showNotification('Physical meeting scheduled!', 'success');
            return true;
        } catch (error) {
            showNotification("Failed to save calendar item.", "error");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateActivity = async (id, updatedPayload) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 400));
            setActivities(prev => prev.map(act => act.id === id ? { ...act, ...updatedPayload } : act));
            showNotification("Record updated successfully.");
        } catch (error) {
            showNotification("Failed to update record.", "error");
        }
    };

    const handleDeleteActivity = async (id) => {
        if (window.confirm("Are you sure you want to delete this record permanently?")) {
            try {
                await new Promise(resolve => setTimeout(resolve, 400));
                setActivities(prev => prev.filter(act => act.id !== id));
                showNotification("Record removed from timeline feed.");
            } catch (error) {
                showNotification("Failed to execute deletion hook.", "error");
            }
        }
    };

    // --- FRONTEND TRIGGER SUBMITS ---
    const submitNote = async () => {
        const htmlContent = noteRef.current.innerHTML.trim();
        if (!htmlContent && noteAttachments.length === 0) return showNotification("Cannot save an empty note.", "error");
        const success = await handleSaveNoteAPI({ content: htmlContent, attachments: noteAttachments });
        if (success) { noteRef.current.innerHTML = ''; setNoteAttachments([]); }
    };

    const submitMessage = async () => {
        const htmlContent = msgRef.current.innerHTML.trim();
        if (msgType === 'email') {
            if (msgTo.length === 0) return showNotification("Please add at least one recipient.", "error");
            if (!msgSubject.trim()) return showNotification("Please enter a subject.", "error");
        }
        if (!htmlContent && !msgSubject.trim() && msgAttachments.length === 0) return;
        const payload = msgType === 'email' ? { to: msgTo, subject: msgSubject, content: htmlContent, attachments: msgAttachments } : { content: htmlContent, attachments: msgAttachments };
        const success = await handleSaveMessageAPI(payload, msgType);
        if (success) { msgRef.current.innerHTML = ''; setMsgSubject(''); setMsgTo([]); setEmailInput(''); setMsgAttachments([]); }
    };

    const submitCall = async () => {
        const htmlContent = callRef.current.innerHTML.trim();
        if (!htmlContent && callAttachments.length === 0) return showNotification("Please add some notes for this call.", "error");
        const success = await handleSaveCallAPI({ contact: callContact, outcome: callOutcome, content: htmlContent, attachments: callAttachments });
        if (success) { callRef.current.innerHTML = ''; setCallAttachments([]); }
    };

    const submitMeeting = async () => {
        const htmlContent = meetRef.current ? meetRef.current.innerHTML.trim() : '';
        if (!meetTitle.trim() || !meetDates.from || !meetDates.to) return showNotification("Please fill Title and both Date ranges.", "error");

        // Combine date and time to create standard comparable strings
        const startDateTime = `${meetDates.from}T${meetTimes.from}`;
        const endDateTime = `${meetDates.to}T${meetTimes.to}`;

        if (new Date(startDateTime) > new Date(endDateTime)) return showNotification("End time cannot be before start time.", "error");

        const success = await handleSaveMeetingAPI({
            title: meetTitle, start: startDateTime, end: endDateTime, by: meetBy, content: htmlContent, attachments: meetAttachments
        });

        if (success) {
            setMeetTitle('');
            setMeetDates({ from: '', to: '' });
            setMeetTimes({ from: getCurrentTime(), to: getSystemTimePlusHour() });
            if (meetRef.current) meetRef.current.innerHTML = '';
            setMeetAttachments([]);
        }
    };

    const cancelForm = () => {
        if (noteRef.current) noteRef.current.innerHTML = '';
        if (msgRef.current) msgRef.current.innerHTML = '';
        if (callRef.current) callRef.current.innerHTML = '';
        if (meetRef.current) meetRef.current.innerHTML = '';
        setNoteAttachments([]); setMsgAttachments([]); setCallAttachments([]); setMeetAttachments([]);
        setMsgSubject(''); setMsgTo([]); setEmailInput(''); setMeetTitle('');
        setMeetDates({ from: '', to: '' });
        setMeetTimes({ from: getCurrentTime(), to: getSystemTimePlusHour() });
    };

    const handleAddEmail = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newEmail = emailInput.trim();
            if (!newEmail) return;
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) return showNotification("Please enter a valid email address.", "error");
            if (!msgTo.includes(newEmail) && msgTo.length < 5) { setMsgTo([...msgTo, newEmail]); setEmailInput(''); }
            else if (msgTo.includes(newEmail)) { showNotification("Email already added.", "error"); }
        }
    };

    const handleRemoveEmail = (indexToRemove) => {
        setMsgTo(msgTo.filter((_, index) => index !== indexToRemove));
    };

    // --- REFACTORED: Unified handler for DateUsage component ---
    const handleDateChange = (dateData) => {
        console.log("Received dateData from DateUsage:", dateData);
        if (!dateData) {
            setMeetDates({ from: "", to: "" });
            return;
        }

        let fromDate = "";
        let toDate = "";

        if (typeof dateData === "object") {
            if (String(dateData) === "[object Object]" && !dateData.from) {
                console.error("Warning: Datepicker passed an unformatted object. Clearing date.");
            } else {
                fromDate = dateData.from || "";
                toDate = dateData.to || dateData.from || ""; // Use 'to' if available, otherwise fallback to 'from'
            }
        } else if (typeof dateData === "string") {
            fromDate = dateData;
            toDate = dateData; // Assign single string to both for a 1-day range assumption
        }

        setMeetDates({
            from: fromDate,
            to: toDate
        });
    };

    return (
        <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col text-[13px] sm:text-sm bg-[#f5f8fa] text-[#33475b] relative" style={fontLight}>

            {toast.show && (
                <div style={fontBold} className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2.5 rounded-md shadow-lg flex items-center gap-2 text-sm transition-all duration-300 ${toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {toast.type === 'success' ? <CheckCircle size={18} className="text-green-600" /> : <AlertTriangle size={18} className="text-red-600" />}
                    {toast.message}
                </div>
            )}

            <header className="flex-shrink-0 bg-white border-b border-[#cbd6e2] px-4 py-2 flex items-center shadow-sm z-10 sticky top-0">
                <button style={fontBold} className="cursor-pointer flex items-center gap-2 bg-[#1a2d42] text-white px-4 py-1.5 rounded text-sm hover:bg-[#2c3f54] transition-colors"
                    onClick={() => setStage(false)}
                >
                    <ArrowLeft size={18} />
                </button>
            </header>

            <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 overflow-y-auto lg:overflow-hidden items-start lg:items-stretch">

                {/* Left Sidebar */}
                <aside className="lg:col-span-3 flex flex-col gap-4 lg:h-full lg:overflow-y-auto scrollbar-thin">
                    <div className="bg-white rounded-lg border border-[#cbd6e2] shadow-sm p-4 sm:p-5 flex-shrink-0">
                        <div className="flex justify-between items-center mb-4">
                            <h2 style={fontBold} className="text-base flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-orange-100 text-[#ff7a59] flex items-center justify-center">
                                    <Home size={14} />
                                </div>
                                Deals
                            </h2>
                        </div>
                        <div className="flex items-center gap-3 mb-4 mt-2">
                            <div className="w-10 h-10 rounded bg-orange-100 text-[#ff7a59] flex items-center justify-center text-xl flex-shrink-0">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <h1 style={fontBold} className="text-xl sm:text-lg lg:text-xl leading-tight">Everest Secondary School Certification</h1>
                            </div>
                        </div>
                        <div className="space-y-3 mb-2" style={fontLight}>
                            <div className="flex gap-2"><span className="text-[#516f90] w-20">Amount:</span><span style={fontBold} className="text-[#ff7a59]">$15,000</span></div>
                            <div className="flex items-center gap-2"><span className="text-[#516f90] w-20">Close Date:</span><span style={fontBold} className="flex items-center gap-1"><Calendar size={14} className="text-gray-500" /> 06/30/2026</span></div>
                            <div className="flex gap-2">
                                <span className="text-[#516f90] w-20">Pipeline:</span>
                                <span style={fontBold} className="bg-orange-50 text-orange-800 px-2 py-0.5 rounded text-[13px] border border-orange-100">Client Acquisition</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-[#516f90] w-20">Stage:</span>
                                <span style={fontBold} className="bg-blue-400 text-white px-2 py-0.5 rounded text-[13px] cursor-pointer hover:bg-blue-500 transition-colors">Documentation</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-[#cbd6e2] shadow-sm flex-shrink-0">
                        <div className="p-4 border-b border-[#cbd6e2] flex justify-between items-center bg-gray-50/50 rounded-t-lg">
                            <h2 style={fontBold} className="text-[15px] flex items-center gap-2"><FileText size={16} className="text-gray-500" /> Deal Specifics</h2>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <div style={fontBold} className="text-xs text-[#516f90] mb-1">Services / Standards</div>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                    <span style={fontBold} className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded text-[12px] border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors">ISO 21001:2018</span>
                                    <span style={fontBold} className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded text-[12px] border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors">ISO 9001</span>
                                </div>
                            </div>
                            <div>
                                <div style={fontBold} className="text-xs text-[#516f90] mb-1">Other Information</div>
                                <div style={fontLight} className="text-[13px] text-gray-700 leading-relaxed bg-gray-50 p-2.5 rounded border border-gray-100 break-words">
                                    <strong style={fontBold}>Location:</strong> Koshi Province (Itahari)<br />
                                    <strong style={fontBold}>Latitude:</strong> 26.6646° N<br />
                                    <strong style={fontBold}>Longitude:</strong> 87.2753° E<br />
                                    <strong style={fontBold}>Requirements:</strong> RALP for 2083 BS.
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Center Feed Area (Responsive Height) */}
                <div className="lg:col-span-6 bg-white rounded-lg border border-[#cbd6e2] shadow-sm flex flex-col h-[75vh] lg:h-full overflow-hidden">
                    <div className="p-4 border-b border-[#cbd6e2] flex-shrink-0">
                        <h2 style={fontBold} className="text-base text-center flex justify-center items-center gap-2">
                            <Activity size={18} className="text-gray-500" /> Activities
                        </h2>
                    </div>

                    <div className="flex overflow-x-auto border-b border-[#cbd6e2] px-2 flex-shrink-0 scrollbar-hide">
                        {[
                            { id: 'notes', icon: PencilLine, label: 'Notes' },
                            { id: 'messages', icon: MessageCircle, label: 'Messages' },
                            { id: 'calls', icon: Phone, label: 'Calls' },
                            { id: 'meetings', icon: Calendar, label: 'Physical Meeting' }
                        ].map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`cursor-pointer flex flex-col items-center gap-1.5 px-4 py-3 min-w-[80px] sm:min-w-[100px] border-b-2 transition-colors ${activeTab === tab.id ? 'border-[#ff7a59] text-[#33475b]' : 'border-transparent text-[#516f90] hover:text-[#33475b]'}`}
                                >
                                    <Icon size={20} className={activeTab === tab.id ? 'text-[#ff7a59]' : ''} />
                                    <span style={activeTab === tab.id ? fontBold : fontLight} className="text-[12px] sm:text-[13px] whitespace-nowrap">
                                        {tab.label}
                                    </span>
                                </button>
                            )
                        })}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 scrollbar-thin">

                        {/* Note Form */}
                        {activeTab === 'notes' && (
                            <div className="bg-white border border-[#cbd6e2] rounded-lg shadow-sm mb-6 transition-all">
                                <div className="p-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50 rounded-t-lg">
                                    <div className="w-7 h-7 rounded bg-yellow-100 text-yellow-600 flex items-center justify-center"><PencilLine size={16} /></div>
                                    <span style={fontBold}>Log Note</span>
                                </div>
                                <div className="p-4 bg-gray-50/30">
                                    <RichEditor contentRef={noteRef} placeholder="Start typing your note..." attachments={noteAttachments} setAttachments={setNoteAttachments} />
                                </div>
                                <div className="p-4 flex gap-3 border-t border-gray-100">
                                    <button onClick={submitNote} disabled={isSubmitting} style={fontBold} className="cursor-pointer bg-[#ff7a59] hover:bg-orange-600 disabled:opacity-70 text-white px-5 py-1.5 rounded flex items-center gap-2 transition-colors">
                                        {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                                        {isSubmitting ? 'Saving...' : 'Save Note'}
                                    </button>
                                    <button onClick={cancelForm} disabled={isSubmitting} style={fontBold} className="cursor-pointer text-blue-600 hover:underline disabled:opacity-50">Cancel</button>
                                </div>
                            </div>
                        )}

                        {/* Message Form */}
                        {activeTab === 'messages' && (
                            <div className="bg-white border border-[#cbd6e2] rounded-lg shadow-sm mb-6 transition-all">
                                <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded bg-blue-100 text-blue-600 flex items-center justify-center"><MessageCircle size={16} /></div>
                                        <span style={fontBold} className="hidden sm:inline">Compose Message</span>
                                    </div>
                                    <div className="flex gap-3 sm:gap-4">
                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                            <input type="radio" name="msgType" value="email" checked={msgType === 'email'} onChange={() => setMsgType('email')} className="accent-blue-600 cursor-pointer" />
                                            <span style={fontBold} className="text-[12px] sm:text-sm">Email</span>
                                        </label>
                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                            <input type="radio" name="msgType" value="direct" checked={msgType === 'direct'} onChange={() => setMsgType('direct')} className="accent-blue-600 cursor-pointer" />
                                            <span style={fontBold} className="text-[12px] sm:text-sm">Add Message</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="p-3 sm:p-4 space-y-3 bg-gray-50/30">
                                    {msgType === 'email' && (
                                        <>
                                            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2 border-b border-gray-200 pb-2 pt-1">
                                                <span style={fontBold} className="text-gray-500 w-14 text-sm pt-1">To:</span>
                                                <div className="flex flex-wrap items-center gap-2 flex-1">
                                                    {msgTo.map((email, index) => (
                                                        <span key={index} style={fontBold} className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs shadow-sm border border-blue-200">
                                                            {email}
                                                            <button onClick={() => handleRemoveEmail(index)} className="cursor-pointer hover:text-red-500 hover:bg-white rounded-full w-4 h-4 flex items-center justify-center ml-1 focus:outline-none transition-colors" title="Remove email">
                                                                <X size={10} />
                                                            </button>
                                                        </span>
                                                    ))}
                                                    {msgTo.length < 5 ? (
                                                        <input type="text" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} onKeyDown={handleAddEmail} style={fontBold} className="cursor-text flex-1 focus:outline-none text-sm text-blue-700 bg-transparent placeholder-gray-400 min-w-[200px] py-1" placeholder={msgTo.length === 0 ? "e.g. email@domain.com (Press Enter)" : "Add another email..."} />
                                                    ) : (
                                                        <span style={fontBold} className="text-xs text-orange-500 py-1 flex items-center gap-1"><AlertTriangle size={12} /> Max 5 recipients</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 border-b border-gray-200 pb-2">
                                                <span style={fontBold} className="text-gray-500 w-14 text-sm">Subject:</span>
                                                <input type="text" value={msgSubject} onChange={(e) => setMsgSubject(e.target.value)} style={fontBold} placeholder="Enter email subject..." className="cursor-text flex-1 focus:outline-none text-sm bg-transparent w-full" />
                                            </div>
                                        </>
                                    )}
                                    <RichEditor contentRef={msgRef} placeholder="Type your message..." attachments={msgAttachments} setAttachments={setMsgAttachments} />
                                </div>
                                <div className="p-4 flex gap-3 border-t border-gray-100 bg-gray-50/50 rounded-b-lg">
                                    <button onClick={submitMessage} disabled={isSubmitting} style={fontBold} className="cursor-pointer bg-[#ff7a59] hover:bg-orange-600 disabled:opacity-70 text-white px-5 py-1.5 rounded flex items-center gap-2 transition-colors">
                                        {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                                        {isSubmitting ? 'Sending...' : (msgType === 'email' ? 'Send Email' : 'Save Message')}
                                    </button>
                                    <button onClick={cancelForm} disabled={isSubmitting} style={fontBold} className="cursor-pointer text-blue-600 hover:underline disabled:opacity-50">Discard</button>
                                </div>
                            </div>
                        )}

                        {/* Call Form */}
                        {activeTab === 'calls' && (
                            <div className="bg-white border border-[#cbd6e2] rounded-lg shadow-sm mb-6 transition-all">
                                <div className="p-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50 rounded-t-lg">
                                    <div className="w-7 h-7 rounded bg-green-100 text-green-600 flex items-center justify-center"><Phone size={16} /></div>
                                    <span style={fontBold}>Log a Call</span>
                                </div>
                                <div className="p-4 space-y-4 bg-gray-50/30">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label style={fontLight} className="block text-xs text-gray-500 mb-1">Contacted</label>
                                            <select value={callContact} onChange={(e) => setCallContact(e.target.value)} style={fontLight} className="cursor-pointer w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-400 bg-white focus:outline-none shadow-sm">
                                                <option>Om Prakash Prasai</option>
                                                <option>Prajwal Giri</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={fontLight} className="block text-xs text-gray-500 mb-1">Outcome</label>
                                            <select value={callOutcome} onChange={(e) => setCallOutcome(e.target.value)} style={fontLight} className="cursor-pointer w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-400 bg-white focus:outline-none shadow-sm">
                                                <option>Connected</option>
                                                <option>Left voicemail</option>
                                                <option>No answer</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label style={fontLight} className="block text-xs text-gray-500 mb-1">Call Notes</label>
                                        <RichEditor contentRef={callRef} placeholder="Describe the call..." attachments={callAttachments} setAttachments={setCallAttachments} />
                                    </div>
                                </div>
                                <div className="p-4 flex gap-3 border-t border-gray-100 bg-gray-50/50 rounded-b-lg">
                                    <button onClick={submitCall} disabled={isSubmitting} style={fontBold} className="cursor-pointer bg-[#ff7a59] hover:bg-orange-600 disabled:opacity-70 text-white px-5 py-1.5 rounded flex items-center gap-2 transition-colors">
                                        {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                                        {isSubmitting ? 'Logging...' : 'Log Call'}
                                    </button>
                                    <button onClick={cancelForm} disabled={isSubmitting} style={fontBold} className="cursor-pointer text-blue-600 hover:underline disabled:opacity-50">Cancel</button>
                                </div>
                            </div>
                        )}

                        {/* Meeting Form */}
                        {activeTab === 'meetings' && (
                            <div className="bg-white border border-[#cbd6e2] rounded-lg shadow-sm mb-6 transition-all">
                                <div className="p-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50 rounded-t-lg">
                                    <div className="w-7 h-7 rounded bg-purple-100 text-purple-600 flex items-center justify-center"><Calendar size={16} /></div>
                                    <span style={fontBold}>Schedule Physical Meeting</span>
                                </div>
                                <div className="p-4 space-y-4">
                                    <input type="text" value={meetTitle} onChange={(e) => setMeetTitle(e.target.value)} style={fontBold} placeholder="Meeting title" className="cursor-text w-full border-b-2 border-gray-200 focus:border-blue-400 pb-2 text-lg focus:outline-none bg-transparent transition-colors" />

                                    <div>
                                        <label style={fontLight} className="block text-xs text-gray-500 mb-1">Scheduled By</label>
                                        <input type="text" value={meetBy} onChange={(e) => setMeetBy(e.target.value)} style={fontLight} placeholder="e.g. John Doe" className="cursor-text w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-400 focus:outline-none shadow-sm" />
                                    </div>

                                    {/* --- IMPLEMENTED DATEUSAGE COMPONENT --- */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="sm:col-span-2">
                                            <label style={fontLight} className="block text-xs text-gray-500 mb-1">Meeting Date Range</label>

                                            <DateUsage onChange={handleDateChange} />
                                        </div>
                                        <div>
                                            <label style={fontLight} className="block text-xs text-gray-500 mb-1">From Time</label>
                                            <input type="time" value={meetTimes.from} onChange={(e) => setMeetTimes({ ...meetTimes, from: e.target.value })} style={fontLight} className="cursor-pointer w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-400 focus:outline-none shadow-sm" />
                                        </div>
                                        <div>
                                            <label style={fontLight} className="block text-xs text-gray-500 mb-1">To Time</label>
                                            <input type="time" value={meetTimes.to} onChange={(e) => setMeetTimes({ ...meetTimes, to: e.target.value })} style={fontLight} className="cursor-pointer w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-400 focus:outline-none shadow-sm" />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={fontLight} className="block text-xs text-gray-500 mb-1">Meeting Agenda</label>
                                        <RichEditor contentRef={meetRef} placeholder="Describe agenda and attach relevant files..." attachments={meetAttachments} setAttachments={setMeetAttachments} />
                                    </div>
                                </div>
                                <div className="p-4 flex gap-3 border-t border-gray-100 bg-gray-50/50 rounded-b-lg">
                                    <button onClick={submitMeeting} disabled={isSubmitting} style={fontBold} className="cursor-pointer bg-[#ff7a59] hover:bg-orange-600 disabled:opacity-70 text-white px-5 py-1.5 rounded flex items-center gap-2 transition-colors">
                                        {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                                        {isSubmitting ? 'Scheduling...' : 'Schedule Meeting'}
                                    </button>
                                    <button onClick={cancelForm} disabled={isSubmitting} style={fontBold} className="cursor-pointer text-blue-600 hover:underline disabled:opacity-50">Cancel</button>
                                </div>
                            </div>
                        )}

                        <h3 style={fontBold} className="text-blue-800 mb-4 mt-2">Timeline Feed</h3>
                        <div className="space-y-4">
                            {activities.map(activity => (
                                <ActivityCard
                                    key={activity.id}
                                    data={activity}
                                    onUpdate={handleUpdateActivity}
                                    onDelete={handleDeleteActivity}
                                />
                            ))}
                            {activities.length === 0 && (
                                <div className="text-gray-400 text-center py-10 flex flex-col items-center gap-2 bg-white rounded-lg border border-dashed border-gray-300">
                                    <ListChecks size={32} className="text-gray-300" />
                                    <p style={fontLight}>No activities logged yet.</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* Right Sidebar */}
                <aside className="lg:col-span-3 flex flex-col gap-4 lg:h-full overflow-visible lg:overflow-y-auto scrollbar-thin">
                    <div className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-indigo-100 shadow-sm p-4 flex items-start gap-3 relative overflow-hidden group cursor-pointer hover:shadow-md transition-all">
                        <div className="absolute -right-4 -top-2 opacity-10 transition-transform group-hover:scale-110 duration-500">
                            <Bot size={100} />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 relative z-10 shadow-sm">
                            <Sparkles size={20} />
                        </div>
                        <div className="relative z-10 w-full">
                            <h3 style={fontBold} className="text-indigo-900 text-[14px]">EIMCTA AI Agent</h3>
                            <p style={fontLight} className="text-indigo-700 text-[12px] mt-0.5 mb-3 leading-tight">I can help draft ISO documentation, or structure RALP templates.</p>
                            <button style={fontBold} className="cursor-pointer w-full text-[13px] bg-white border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1.5">
                                <MessageCircle size={16} /> Ask AI Assistant
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-[#cbd6e2] shadow-sm flex flex-col flex-1 overflow-hidden">
                        <div className="p-4 border-b border-[#cbd6e2] flex-shrink-0">
                            <h2 style={fontBold} className="text-[15px] flex items-center gap-2"><Users size={18} className="text-blue-500" /> Related Contacts</h2>
                        </div>

                        <div className="flex-1 overflow-visible lg:overflow-y-auto p-4 space-y-4 scrollbar-thin">
                            <div className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                <div className="flex items-start gap-3 mb-3">
                                    <div style={fontBold} className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs flex-shrink-0">OP</div>
                                    <div>
                                        <a href="#" style={fontBold} className="text-blue-600 hover:underline text-[14px] cursor-pointer">Om Prakash Prasai</a>
                                        <p style={fontLight} className="text-[#516f90] text-[12px] mt-0.5">Operation Manager - Koshi</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-[12px]" style={fontLight}>
                                    <div className="flex items-center gap-2">
                                        <Mail size={14} className="text-gray-400" />
                                        <a href="mailto:om.prasai@eimcta.com" className="text-blue-600 hover:underline truncate cursor-pointer break-all">om.prasai@eimcta.com</a>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone size={14} className="text-gray-400" />
                                        <span style={fontBold} className="text-gray-700">+977 980-0000000</span>
                                    </div>
                                </div>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                <div className="flex items-start gap-3 mb-3">
                                    <div style={fontBold} className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center text-xs flex-shrink-0">PG</div>
                                    <div>
                                        <a href="#" style={fontBold} className="text-blue-600 hover:underline text-[14px] cursor-pointer">Prajwal Giri</a>
                                        <p style={fontLight} className="text-[#516f90] text-[12px] mt-0.5">Software Developer (ERP/DBMS)</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-[12px]" style={fontLight}>
                                    <div className="flex items-center gap-2">
                                        <Mail size={14} className="text-gray-400" />
                                        <a href="mailto:prajwal.giri@eimcta.com" className="text-blue-600 hover:underline truncate cursor-pointer break-all">prajwal.giri@eimcta.com</a>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone size={14} className="text-gray-400" />
                                        <span style={fontBold} className="text-gray-700">+977 980-0000001</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
}

function ActivityCard({ data, onUpdate, onDelete }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const [editContent, setEditContent] = useState(data.content || '');
    const [editTitle, setEditTitle] = useState(data.title || '');
    const [editBy, setEditBy] = useState(data.by || data.author || '');

    // --- REFACTORED EDIT STATES FOR MEETING TIMES ---
    const extractDate = (isoString) => isoString ? isoString.split('T')[0] : '';
    const extractTime = (isoString) => isoString && isoString.includes('T') ? isoString.split('T')[1].substring(0, 5) : getCurrentTime();

    const [editDates, setEditDates] = useState({
        from: extractDate(data.start),
        to: extractDate(data.end)
    });

    const [editTimes, setEditTimes] = useState({
        from: extractTime(data.start),
        to: extractTime(data.end)
    });

    const [editContact, setEditContact] = useState(data.contact || '');
    const [editOutcome, setEditOutcome] = useState(data.outcome || '');

    const configMap = {
        note: { icon: PencilLine, bg: 'bg-yellow-100', text: 'text-yellow-600', label: 'Note logged by' },
        email: { icon: Mail, bg: 'bg-blue-100', text: 'text-blue-600', label: 'Email sent by' },
        message: { icon: MessageCircle, bg: 'bg-blue-100', text: 'text-blue-600', label: 'Message sent by' },
        direct: { icon: MessageCircle, bg: 'bg-blue-100', text: 'text-blue-600', label: 'Add Message by' },
        call: { icon: Phone, bg: 'bg-green-100', text: 'text-green-600', label: 'Call logged by' },
        meeting: { icon: Calendar, bg: 'bg-purple-100', text: 'text-purple-600', label: 'Physical meeting scheduled by' }
    };

    const config = configMap[data.type] || { icon: ListChecks, bg: 'bg-gray-100', text: 'text-gray-600', label: 'Activity logged by' };
    const Icon = config.icon;

    // --- HANDLER FOR EDITING COMPONENT DATEUSAGE ---
    const handleEditDateChange = (dateData) => {
        if (!dateData) return;
        setEditDates({
            from: dateData.from || "",
            to: dateData.to || ""
        });
    };

    const handleSave = async () => {
        setIsUpdating(true);
        const updatedPayload = { content: editContent };

        if (data.type === 'meeting') {
            updatedPayload.title = editTitle;
            updatedPayload.start = `${editDates.from}T${editTimes.from}`;
            updatedPayload.end = `${editDates.to}T${editTimes.to}`;
            updatedPayload.by = editBy;
        } else if (data.type === 'call') {
            updatedPayload.contact = editContact;
            updatedPayload.outcome = editOutcome;
        }

        await onUpdate(data.id, updatedPayload);
        setIsUpdating(false);
        setIsEditing(false);
    };

    const formatDate = (isoString) => {
        if (!isoString) return '';
        try {
            return new Date(isoString).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return isoString;
        }
    };

    return (
        <div className="bg-white border border-[#cbd6e2] rounded-lg shadow-sm transition-all duration-300 relative overflow-hidden hover:shadow-md group" style={fontLight}>
            <div className="p-3 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-gray-50/30">
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded ${config.bg} ${config.text} flex items-center justify-center flex-shrink-0 shadow-sm border border-white`}>
                        <Icon size={16} />
                    </div>
                    <div className="text-[13px] leading-tight sm:leading-normal">
                        <span style={fontBold} className="capitalize">{data.type}</span> <span className="text-gray-500">{config.label}</span> <span style={fontBold} className="text-gray-800">{data.by || data.author}</span>
                    </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end w-full sm:w-auto justify-between sm:justify-end gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded px-1 py-0.5 shadow-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        {data.type !== 'email' && (
                            <>
                                <button onClick={() => setIsEditing(!isEditing)} className="cursor-pointer text-gray-400 hover:text-blue-500 p-1 rounded hover:bg-blue-50 transition-colors" title="Edit">
                                    <Edit2 size={14} />
                                </button>
                                <div className="w-px h-3 bg-gray-200 mx-0.5"></div>
                            </>
                        )}
                        <button onClick={() => onDelete(data.id)} className="cursor-pointer text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors" title="Delete">
                            <Trash2 size={14} />
                        </button>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(data.timestamp)}</span>
                </div>
            </div>

            <div className="p-4 text-[13px] sm:text-[14px] text-gray-800">
                {isEditing ? (
                    <div className="space-y-3">
                        {data.type === 'meeting' && (
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md space-y-3">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Meeting Title</label>
                                    <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="cursor-text w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-400 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Scheduled By</label>
                                    <input type="text" value={editBy} onChange={(e) => setEditBy(e.target.value)} className="cursor-text w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-400 focus:outline-none" />
                                </div>

                                {/* --- REFACTORED DATE & TIME EDIT SECTION --- */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs text-gray-500 mb-1">Meeting Date Range</label>
                                        <DateUsage onChange={handleEditDateChange} />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">From Time</label>
                                        <input type="time" value={editTimes.from} onChange={(e) => setEditTimes({ ...editTimes, from: e.target.value })} className="cursor-pointer w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-400 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">To Time</label>
                                        <input type="time" value={editTimes.to} onChange={(e) => setEditTimes({ ...editTimes, to: e.target.value })} className="cursor-pointer w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-400 focus:outline-none" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {data.type === 'call' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Contacted</label>
                                    <input type="text" value={editContact} onChange={(e) => setEditContact(e.target.value)} className="cursor-text w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-400 focus:outline-none" placeholder="Contact Name" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Outcome</label>
                                    <select value={editOutcome} onChange={(e) => setEditOutcome(e.target.value)} className="cursor-pointer w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-400 bg-white focus:outline-none">
                                        <option>Connected</option>
                                        <option>Left voicemail</option>
                                        <option>No answer</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        <label className="block text-xs text-gray-500 mb-1">
                            {data.type === 'meeting' ? 'Agenda / Notes' : 'Notes'}
                        </label>
                        <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="cursor-text w-full p-2 border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 min-h-[80px]" disabled={isUpdating} />

                        <div className="flex gap-2">
                            <button onClick={handleSave} disabled={isUpdating} style={fontBold} className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs flex items-center gap-1.5 disabled:opacity-70">
                                {isUpdating && <Loader2 size={12} className="animate-spin" />}
                                {isUpdating ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button onClick={() => { setIsEditing(false); setEditContent(data.content); }} disabled={isUpdating} style={fontBold} className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded text-xs">Cancel</button>
                        </div>
                    </div>
                ) : (
                    <div>
                        {data.type === 'email' && (
                            <div className="mb-3 bg-gray-50 border border-gray-200 p-2.5 rounded text-[13px]">
                                <div style={fontBold} className="text-gray-800 mb-1 border-b border-gray-200 pb-1 break-words">Subject: {data.subject}</div>
                                <div className="text-gray-500 break-words flex flex-wrap gap-1">
                                    <span style={fontBold}>To:</span> {Array.isArray(data.to) ? data.to.join(', ') : data.to}
                                </div>
                            </div>
                        )}
                        {(data.type === 'message' || data.type === 'direct') && (
                            <div className="mb-3 bg-gray-50 border border-gray-200 p-2.5 rounded text-[13px]">
                                <div style={fontBold} className="text-gray-500 break-words">
                                    To: {Array.isArray(data.to) ? data.to.join(', ') : data.to || 'Direct Contact'}
                                </div>
                            </div>
                        )}
                        {data.type === 'call' && (
                            <div className="mb-3"><span style={fontBold} className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2.5 py-1 rounded inline-flex items-center gap-1 flex-wrap"><Phone size={12} /> {data.outcome} with {data.contact}</span></div>
                        )}
                        {data.type === 'meeting' && (
                            <div className="mb-3 bg-purple-50 border border-purple-100 p-3 rounded">
                                <div style={fontBold} className="text-indigo-900 text-[14px] sm:text-[15px] mb-2">{data.title}</div>
                                <div className="text-[11px] sm:text-xs text-gray-700 flex flex-col sm:flex-row sm:items-center gap-1 mb-1 sm:mb-0"><div className="flex items-center gap-1"><CalendarPlus size={14} className="text-purple-600" /> <span style={fontBold} className="w-10">From:</span></div> {formatDate(data.start)}</div>
                                <div className="text-[11px] sm:text-xs text-gray-700 flex flex-col sm:flex-row sm:items-center gap-1"><div className="flex items-center gap-1"><CalendarCheck size={14} className="text-purple-600" /> <span style={fontBold} className="w-10">To:</span></div> {formatDate(data.end)}</div>
                            </div>
                        )}

                        {/* --- THIS IS WHERE DOMPURIFY IS APPLIED --- */}
                        <div className="whitespace-pre-wrap leading-relaxed prose prose-sm max-w-none break-words" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.content) }}></div>

                        {data.attachments && data.attachments.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                                <div style={fontBold} className="w-full text-xs text-gray-500 mb-1">Attachments:</div>
                                {data.attachments.map((file, i) => (
                                    <div key={i} style={fontBold} className="cursor-pointer flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded px-3 py-1.5 text-sm text-blue-600 hover:underline max-w-full">
                                        <Paperclip size={14} className="flex-shrink-0" /> <span className="truncate">{file.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}