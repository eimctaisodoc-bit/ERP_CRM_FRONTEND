import React, { useState, useRef, useEffect, useCallback } from 'react';
import DOMPurify from 'dompurify';
import NepaliDate from 'nepali-date-converter';

import {
    Home, Building2, Calendar, PencilLine,
    Mail, Phone, ListChecks, FileText, Paperclip, Sparkles, Bot, MessageCircle,
    Users, Edit2, Trash2, CalendarPlus, CalendarCheck,
    List, X, ListOrdered, CheckCircle, AlertTriangle, Loader2, Activity,
    ArrowLeft, Video, Clock,
    Bold, Italic, Underline, Percent, MapPin, GraduationCap,
    Download,
    Eye
} from 'lucide-react';

import DateUsage from '../../nepalidate/dateUsage';

import { UseAdd } from '../../hooks/useadd';
import { useGet } from '../../hooks/useGet';
import { useEdit } from '../../hooks/useEdit';
import { UseDelete } from '../../hooks/useDelete';
import { formatNepaliDate } from '../../../data/data';
import FileAttachment from '../../fileAttachment';
import { dismissWaitingNotify, waitingNotify } from '../../hotToaster';

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

const validateTimeRange = (fromTime, toTime, fromDate, toDate) => {
    if (!fromDate || !toDate || fromDate === toDate) {
        const parseTime = (value) => {
            const [hours, minutes, seconds = 0] = String(value).split(':').map(Number);
            return hours * 3600 + minutes * 60 + seconds;
        };

        if (parseTime(fromTime) >= parseTime(toTime)) {
            return false;
        }
    }
    return true;
};

const toEnglishDigits = (value) => String(value ?? '').replace(/[०-९]/g, (digit) => '०१२३४५६७८९'.indexOf(digit));

const normalizeBsDate = (value) => {
    if (!value) return '';
    const date = toEnglishDigits(String(value).trim()).split(/[T ]/)[0];
    const parts = date.split(/[-/]/);
    if (parts.length !== 3 || parts.some((part) => !/^\d+$/.test(part))) return date;
    return `${parts[0].padStart(4, '0')}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
};

const normalizeTime24 = (value, fallback = '') => {
    if (!value) return fallback;
    const match = toEnglishDigits(String(value).trim()).match(/^(\d{1,2}):([0-5]\d)\s*(AM|PM)?$/i);
    if (!match) return value;

    let hours = Number(match[1]);
    const minutes = match[2];
    const meridiem = match[3]?.toUpperCase();

    if (meridiem) {
        if (hours === 12) hours = 0;
        if (meridiem === 'PM') hours += 12;
    }

    return `${String(hours).padStart(2, '0')}:${minutes}`;
};

const formatCallTime = (value) => {
    const match = toEnglishDigits(String(value ?? '').trim()).match(/^([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?\s*(AM|PM)?$/i);
    if (!match) return value || '';

    let hours = Number(match[1]);
    const minutes = match[2];
    const seconds = match[3] || '00';
    const meridiem = match[4]?.toUpperCase();

    if (meridiem) {
        if (hours === 12) hours = 0;
        if (meridiem === 'PM') hours += 12;
    }

    const displayMeridiem = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes}:${seconds} ${displayMeridiem}`;
};

const getTimeDifference = (fromTime, toTime) => {
    const parseTime = (value) => {
        const match = toEnglishDigits(String(value ?? '').trim()).match(/^(\d{1,2}):([0-5]\d)(?::([0-5]\d))?\s*(AM|PM)?$/i);
        if (!match) return null;

        let hours = Number(match[1]);
        const minutes = Number(match[2]);
        const seconds = Number(match[3] || 0);
        const meridiem = match[4]?.toUpperCase();

        if (meridiem) {
            if (hours === 12) hours = 0;
            if (meridiem === 'PM') hours += 12;
        }

        return hours * 3600 + minutes * 60 + seconds;
    };

    const fromSeconds = parseTime(fromTime);
    let toSeconds = parseTime(toTime);
    if (fromSeconds === null || toSeconds === null) return '';

    if (toSeconds < fromSeconds) toSeconds += 24 * 60 * 60;

    const difference = toSeconds - fromSeconds;
    const hours = Math.floor(difference / 3600);
    const minutes = Math.floor((difference % 3600) / 60);
    const seconds = difference % 60;
    return `Duration: ${hours}h ${minutes}m ${seconds}s`;
};

const getSelectedDates = (dateData) => {
    if (!dateData) return [];

    if (dateData.from || dateData.to) {
        return [dateData.from, dateData.to].map(normalizeBsDate).filter(Boolean);
    }

    const dates = Array.isArray(dateData)
        ? dateData
        : String(dateData).split(" - ");

    return dates
        .map((date) => normalizeBsDate(typeof date === "string" ? date : date?.value || date?.formattedDate || date?.bsDate || ""))
        .filter(Boolean);
};

// --- RICH TEXT EDITOR WITH TOOLBAR BUTTONS ---
function RichEditor({ contentRef, placeholder, attachments, setAttachments, showNotification }) {
    const fileInputRef = useRef(null);
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    const MAX_IMAGES = 5; // Maximum 5 images allowed

    const [activeFormats, setActiveFormats] = useState({
        bold: false,
        italic: false,
        underline: false,
        insertOrderedList: false,
        insertUnorderedList: false,
    });

    const updateToolbar = useCallback(() => {
        setActiveFormats({
            bold: document.queryCommandState("bold"),
            italic: document.queryCommandState("italic"),
            underline: document.queryCommandState("underline"),
            insertOrderedList: document.queryCommandState("insertOrderedList"),
            insertUnorderedList: document.queryCommandState("insertUnorderedList"),
        });
    }, []);

    useEffect(() => {
        document.addEventListener("selectionchange", updateToolbar);
        return () => document.removeEventListener("selectionchange", updateToolbar);
    }, [updateToolbar]);

    const handleFileChange = (e) => {
        if (!e.target.files) return;

        const files = Array.from(e.target.files);

        // 1. Enforce Image Only
        const nonImageFiles = files.filter(file => !file.type.startsWith('image/'));
        if (nonImageFiles.length > 0) {
            showNotification("Only image files are allowed.", "error");
            e.target.value = '';
            return;
        }

        // 2. File Size Limit
        const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);
        if (oversizedFiles.length > 0) {
            showNotification(`These images exceed 10 MB:\n${oversizedFiles.map(file => file.name).join('\n')}`, 'error');
            e.target.value = '';
            return;
        }

        // 3. Max 5 Images Limit
        if (attachments.length + files.length > MAX_IMAGES) {
            const remainingSlots = MAX_IMAGES - attachments.length;
            showNotification(`You can only upload a maximum of 5 images. You can add ${remainingSlots} more.`, "error");
            e.target.value = '';
            return;
        }

        // 4. Map files (storing the raw File object for backend uploads)
        const newFiles = files.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type,
            file: file,
            isExisting: false
        }));

        setAttachments(prev => [...prev, ...newFiles]);
        e.target.value = '';
    };

    const removeAttachment = (index) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    const format = (command, value = null) => {
        document.execCommand(command, false, value);
        if (contentRef.current) contentRef.current.focus();
        updateToolbar();
    };

    const ToolbarButton = ({ onMouseDown, isActive, icon: Icon, label }) => (
        <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onMouseDown(); }}
            title={label}
            className={`p-1.5 rounded-md border transition-all cursor-pointer ${isActive
                ? "bg-blue-100 text-blue-700 border-blue-300"
                : "bg-transparent text-gray-600 border-transparent hover:bg-gray-200"
                }`}
        >
            <Icon size={16} />
        </button>
    );

    return (
        <div className="border border-blue-300 rounded-md flex flex-col focus-within:ring-1 focus-within:ring-blue-400 mt-2 bg-white overflow-hidden shadow-sm transition-all duration-200" style={fontLight}>
            <div className="flex flex-wrap gap-1 p-1.5 border-b border-gray-200 bg-gray-50/50">
                <ToolbarButton onMouseDown={() => format("bold")} isActive={activeFormats.bold} icon={Bold} label="Bold" />
                <ToolbarButton onMouseDown={() => format("italic")} isActive={activeFormats.italic} icon={Italic} label="Italic" />
                <ToolbarButton onMouseDown={() => format("underline")} isActive={activeFormats.underline} icon={Underline} label="Underline" />
                <div className="w-px bg-gray-300 mx-1 my-1" />
                <ToolbarButton onMouseDown={() => format("insertUnorderedList")} isActive={activeFormats.insertUnorderedList} icon={List} label="Unordered List" />
                <ToolbarButton onMouseDown={() => format("insertOrderedList")} isActive={activeFormats.insertOrderedList} icon={ListOrdered} label="Ordered List" />
            </div>

            <div
                ref={contentRef}
                contentEditable
                onInput={() => updateToolbar()}
                suppressContentEditableWarning
                className="w-full p-3 h-32 overflow-y-auto scrollbar-thin focus:outline-none text-[14px] leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 cursor-text prose max-w-none [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                data-placeholder={placeholder}
            ></div>

            {attachments.length > 0 && (
                <div className="px-3 flex flex-wrap gap-2 pb-3 border-t border-gray-100 pt-2 bg-gray-50/50">
                    {attachments.map((file, i) => (
                        <div key={i} className="flex items-center gap-1.5 bg-white border border-gray-200 shadow-sm rounded px-2 py-1 text-xs text-gray-700">
                            <Paperclip size={12} className="text-gray-500" />
                            <span className="truncate max-w-[150px]">{file.name}</span>
                            <button type="button" onClick={() => removeAttachment(i)} className="hover:text-red-500 ml-1 bg-red-50 hover:bg-red-100 rounded-full p-0.5 transition-colors cursor-pointer">
                                <X size={10} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="border-t border-gray-200 p-2 flex items-center justify-end bg-gray-50">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="image/*" />
                <button type="button" onClick={() => fileInputRef.current.click()} style={fontBold} className="px-3 py-1 hover:bg-blue-100 bg-white border border-gray-200 rounded text-blue-600 text-sm flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer">
                    <Paperclip size={14} /> Attach Images ({attachments.length}/5)
                </button>
            </div>
        </div>
    );
}

export default function P_Meeting({ id, setStage }) {
    const { nOtes_, Meetings, msg_, calls_ } = UseAdd();
    const { getAllActivities_, getOnlyOrgDetails_ } = useGet();
    const { editNote_, Editmsg_, Editcalls_, EditMeeting } = useEdit();
    const { deleteNote_, deletecalls_, deletmsg_, DeleteMeeting } = UseDelete();

    // --- STATE ---
    const [activities, setActivities] = useState([]);
    const [activeTab, setActiveTab] = useState('notes');
    const scrollContainerRef = useRef(null); // Ref for tab scroll to top

    // Organization State
    const [organizations, setOrganizations] = useState([{}]);
    const [isLoadingOrg, setIsLoadingOrg] = useState(false);

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

    const [msgDates, setMsgDates] = useState({ from: '', to: '' });
    const [msgTime, setMsgTime] = useState(getCurrentTime());
    const [msgDateResetKey, setMsgDateResetKey] = useState(Date.now());
    const msgRef = useRef(null);
    const [msgAttachments, setMsgAttachments] = useState([]);

    const [callContact, setCallContact] = useState('Om Prakash Prasai');
    const [callOutcome, setCallOutcome] = useState('Connected');

    const [callDates, setCallDates] = useState({ from: '', to: '' });
    const [callTimes, setCallTimes] = useState({ from: getCurrentTime(), to: getSystemTimePlusHour() });
    const [callDateResetKey, setCallDateResetKey] = useState(Date.now() + 1);
    const callRef = useRef(null);
    const [callAttachments, setCallAttachments] = useState([]);

    const [meetingType, setMeetingType] = useState('physical');
    const [meetTitle, setMeetTitle] = useState('');

    const [meetLinks, setMeetLinks] = useState([]);
    const [linkInput, setLinkInput] = useState('');

    const [meetLocation, setMeetLocation] = useState('');

    const [meetDates, setMeetDates] = useState({ from: '', to: '' });
    const [dateResetKey, setDateResetKey] = useState(Date.now() + 2);

    const [meetTimes, setMeetTimes] = useState({ from: '', to: '' });
    const meetRef = useRef(null);
    const [meetAttachments, setMeetAttachments] = useState([]);

    const showNotification = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
    };

    // --- FETCH ORGANIZATION DETAILS ---
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
                    if (fetchedOrgs && fetchedOrgs.length > 0) {
                        setOrganizations(fetchedOrgs);
                    } else {
                        setOrganizations([{}]);
                    }
                    setIsLoadingOrg(false);
                },
                onError: (err) => {
                    showNotification("Failed to fetch organization details.", "error");
                    setOrganizations([{}]);
                    setIsLoadingOrg(false);
                },
            }
        );
    }, [id?.mainID]);

    const currentOrg = organizations[0] || {};

    const fetchTimeline = useCallback(async () => {
        if (!id?.mainID) return;

        const loadingMessage = "Loading activity log...";
        waitingNotify(loadingMessage);
        try {
            const res = await getAllActivities_.mutateAsync({
                parms: { MainID: id.mainID },
            });

            const stageData = res?.data?.[0]?.stages?.Stage1 || [];
            const stage1 = Array.isArray(stageData) ? stageData[0] : stageData || {};

            const notes = stage1?.noteSchema || stage1?.notesSchema || [];
            const calls = stage1?.callsSchema || [];

            const emails = stage1?.emailSchema || [];
            const messages = stage1?.message || [];
            const virtual = stage1?.virtualMeetingSchema || [];
            const physical = stage1?.physicalMeetingSchema || [];
            // console.log('physical meeting ', physical)

            // Add createdDate explicitly for difference calculation
            const normalizedNotes = notes.map(n => ({
                ...n, id: n._id, type: 'note', content: n.note,
                timestamp: n.createdAt, createdDate: n.createdAt
            }));

            const normalizedEmails = emails.map(e => ({
                ...e, id: e._id, type: 'email', content: e.message || e.content, to: e.to, subject: e.subject,
                timestamp: e.fromDate || e.date || e.createdAt, createdDate: e.createdAt
            }));

            const normalizedMessages = messages.map(m => ({
                ...m, id: m._id, type: 'message', content: m.note || m.content,
                timestamp: m.fromDate || m.date || m.createdAt, createdDate: m.createdAt
            }));

            const normalizedCalls = calls.map(c => ({
                ...c, id: c._id, type: 'call', content: c.note || c.content,
                contact: c.connected || c.contact, outcome: c.outCome || c.outcome,
                fromTime: c.fromTime || c.time?.split('/')[0] || '',
                toTime: c.toTime || c.time?.split('/')[1] || '',
                timestamp: c.fromDate || c.date || c.createdAt, createdDate: c.createdAt
            }));
console.log('normalizedCallsnormalizedCalls',normalizedCalls)
            const normalizedPhysical = physical.map(p => ({
                ...p, id: p._id, type: 'meeting', meetingType: p.meetingType || 'physical', title: p.title, location: p.location, content: p.agenda || p.content,
                fromTime: p.fromTime || p.C_time?.split('/')[0] || '',
                toTime: p.toTime || p.C_time?.split('/')[1] || '',
                start: p.fromDate || p.date,
                end: p.toDate || p.date,
                timestamp: p.createdAt, createdDate: p.createdAt
            }));
            // console.log('normalizedPhysical',normalizedPhysical)

            const normalizedVirtual = virtual.map(v => ({
                ...v, id: v._id, type: 'virtual_meeting', meetingType: v.meetingType || 'virtual', title: v.title, link: Array.isArray(v.link) ? v.link : [v.link].filter(Boolean), content: v.agenda || v.content,
                fromTime: v.fromTime || v.C_time?.split('/')[0] || '',
                toTime: v.toTime || v.C_time?.split('/')[1] || '',
                start: v.fromDate || v.date,
                end: v.toDate || v.date,
                timestamp: v.createdAt, createdDate: v.createdAt
            }));

            const allActivities = [
                ...normalizedNotes,
                ...normalizedCalls,
                ...normalizedEmails,
                ...normalizedMessages,
                ...normalizedPhysical,
                ...normalizedVirtual
            ];

            allActivities.sort((a, b) => {
                const dateA = new Date(a.timestamp).getTime();
                const dateB = new Date(b.timestamp).getTime();
                return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
            });

            setActivities(allActivities);

        } catch (error) {
            console.error("Failed to fetch timeline activities:", error);
            const errorMsg = error?.response?.data?.message || error?.message || "Failed to fetch timeline activities.";
            showNotification(errorMsg, "error");
        } finally {
            dismissWaitingNotify(loadingMessage);
        }
    }, [id?.mainID]);

    useEffect(() => {
        fetchTimeline();
    }, [id?.mainID]);

    // --- MULTIPART FORMDATA API CALL ---
    const handleSaveNoteAPI = async (formData) => {
        if (isSubmitting) return false;
        setIsSubmitting(true);
        const loadingMessage = "Saving note...";
        waitingNotify(loadingMessage);
        try {
            const response = await nOtes_.mutateAsync({
                payload: formData,
                parms: { MainID: id?.mainID },
            });
            await fetchTimeline();
            const successMsg = response?.data?.message || response?.message || "Note saved successfully!";
            showNotification(successMsg, "success");
            return true;
        } catch (error) {
            const errorMsg = error?.response?.data?.message || error?.message || "Failed to save note.";
            showNotification(errorMsg, "error");
            await fetchTimeline();
            return false;
        } finally {
            dismissWaitingNotify(loadingMessage);
            setIsSubmitting(false);
        }
    };

    const handleSaveMessageAPI = async (formData, type) => {
        if (isSubmitting) return false;
        setIsSubmitting(true);
        const loadingMessage = type === 'email' ? "Sending email..." : "Saving message...";
        waitingNotify(loadingMessage);
        try {
            const response = await msg_.mutateAsync({
                payload: formData,
                parms: { MainID: id?.mainID },
            });
            await fetchTimeline();
            const successMsg = response?.data?.message || response?.message || `${type === 'email' ? 'Email sent' : 'Message saved'} successfully!`;
            showNotification(successMsg, 'success');
            return true;
        } catch (error) {
            const errorMsg = error?.response?.data?.message || error?.message || "Failed to route message pipeline.";
            showNotification(errorMsg, "error");
            return false;
        } finally {
            dismissWaitingNotify(loadingMessage);
            setIsSubmitting(false);
        }
    };

    const handleSaveCallAPI = async (formData) => {
        if (isSubmitting) return false;
        setIsSubmitting(true);
        const loadingMessage = "Logging call...";
        waitingNotify(loadingMessage);
        try {
            const response = await calls_.mutateAsync({
                payload: formData,
                parms: { MainID: id?.mainID },
            });
            await fetchTimeline();
            const successMsg = response?.data?.message || response?.message || 'Call details logged successfully!';
            showNotification(successMsg, 'success');
            return true;
        } catch (error) {
            const errorMsg = error?.response?.data?.message || error?.message || "Failed to store call ledger.";
            showNotification(errorMsg, "error");
            return false;
        } finally {
            dismissWaitingNotify(loadingMessage);
            setIsSubmitting(false);
        }
    };

    const handleSaveMeetingAPI = async (formData) => {
        if (isSubmitting) return false;
        setIsSubmitting(true);
        const loadingMessage = "Scheduling meeting...";
        waitingNotify(loadingMessage);
        try {
            const response = await Meetings.mutateAsync({
                payload: formData,
                parms: { MainID: id?.mainID },
            });
            await fetchTimeline();
            const successMsg = response?.data?.message || response?.message || "Meeting scheduled successfully!";
            showNotification(successMsg, "success");
            return true;
        } catch (error) {
            const errorMsg = error?.response?.data?.message || error?.message || "Failed to save meeting.";
            showNotification(errorMsg, "error");
            return false;
        } finally {
            dismissWaitingNotify(loadingMessage);
            setIsSubmitting(false);
        }
    };

    const handleUpdateActivity = async (updatedId, updatedPayload, activityType, meetingTypeVal) => {
        const loadingMessage = "Updating record...";
        waitingNotify(loadingMessage);
        try {
            let res;
            const apiType = activityType === 'direct' ? 'message' : activityType;

            if (activityType === 'call' && Editcalls_) {
                res = await Editcalls_.mutateAsync({ payload: updatedPayload, parms: { MainID: id?.mainID, id: updatedId } });
            }
            else if ((activityType === 'message' || activityType === 'direct' || activityType === 'email') && Editmsg_) {
                res = await Editmsg_.mutateAsync({
                    payload: { ...updatedPayload, type: apiType },
                    parms: { MainID: id?.mainID, id: updatedId, type: apiType }
                });
            }
            else if (activityType === 'note' && editNote_) {
                res = await editNote_.mutateAsync({ payload: updatedPayload, parms: { MainID: id?.mainID, id: updatedId } });
            }
            else if ((activityType === 'meeting' || activityType === 'virtual_meeting') && EditMeeting) {
                res = await EditMeeting.mutateAsync({
                    payload: { ...updatedPayload, meetingType: meetingTypeVal },
                    parms: { id: updatedId }
                });
            }
            await fetchTimeline();
            const successMsg = res?.data?.message || res?.message || "Record updated successfully.";
            showNotification(successMsg, "success");

        } catch (error) {
            console.error("Edit Mutation Error:", error);
            const errorMsg = error?.response?.data?.message || error?.message || "Failed to update record.";
            showNotification(errorMsg, "error");
        } finally {
            dismissWaitingNotify(loadingMessage);
        }
    };

    const handleDeleteActivity = async (deletedId, activityType) => {
        if (window.confirm("Are you sure you want to delete this record permanently?")) {
            const loadingMessage = "Deleting record...";
            waitingNotify(loadingMessage);
            try {
                let res;
                const apiType = activityType === 'direct' ? 'message' : activityType;

                if (activityType === 'call' && deletecalls_) {
                    res = await deletecalls_.mutateAsync({ parms: { MainID: id?.mainID, id: deletedId } });
                }
                else if ((activityType === 'message' || activityType === 'direct' || activityType === 'email') && deletmsg_) {
                    res = await deletmsg_.mutateAsync({
                        parms: { MainID: id?.mainID, id: deletedId, type: apiType }
                    });
                }
                else if (activityType === 'note' && deleteNote_) {
                    res = await deleteNote_.mutateAsync({ parms: { MainID: id?.mainID, id: deletedId } });
                }
                else if ((activityType === 'meeting' || activityType === 'virtual_meeting') && DeleteMeeting) {
                    res = await DeleteMeeting.mutateAsync({ parms: { MainID: id?.mainID, id: deletedId } });
                }

                await fetchTimeline();
                const successMsg = res?.data?.message || res?.message;
                showNotification(successMsg, "success");

            } catch (error) {
                console.error("Delete Mutation Error:", error);
                const errorMsg = error?.response?.data?.message || error?.message || "Failed to delete record.";
                showNotification(errorMsg, "error");
            } finally {
                dismissWaitingNotify(loadingMessage);
            }
        }
    };

    // --- FORMDATA GENERATORS ---

    const submitNote = async () => {
        const htmlContent = noteRef.current.innerHTML.trim();
        if (!htmlContent && noteAttachments.length === 0) return showNotification("Cannot save an empty note.", "error");

        const formData = new FormData();
        formData.append("content", htmlContent);

        noteAttachments.forEach((attachment) => {
            if (attachment.file) {
                formData.append("file", attachment.file);
            }
        });

        const success = await handleSaveNoteAPI(formData);
        if (success) {
            noteRef.current.innerHTML = '';
            setNoteAttachments([]);
        }
    };

    const submitMessage = async () => {
        const htmlContent = msgRef.current.innerHTML.trim();
        if (msgType === 'email') {
            if (msgTo.length === 0) return showNotification("Please add at least one recipient.", "error");
            if (!msgSubject.trim()) return showNotification("Please enter a subject.", "error");
        }
        if (!htmlContent && !msgSubject.trim() && msgAttachments.length === 0) return;

        const apiType = msgType === 'direct' ? 'message' : msgType;

        // Build Payload Array
        const payloadData = [{
            type: apiType,
            ...(msgType === 'email' ? { to: msgTo, subject: msgSubject } : {}),
            note: htmlContent,
            fromDate: msgDates.from,
            toDate: msgDates.to,
            time: msgTime
        }];

        // Construct FormData mirroring the "Note concept"
        const formData = new FormData();
        formData.append("items", JSON.stringify(payloadData));

        msgAttachments.forEach((attachment) => {
            if (attachment.file) {
                formData.append("file", attachment.file);
            }
        });

        const success = await handleSaveMessageAPI(formData, apiType);
        if (success) {
            msgRef.current.innerHTML = '';
            setMsgSubject('');
            setMsgTo([]);
            setEmailInput('');
            setMsgAttachments([]);
            setMsgDates({ from: '', to: '' });
            setMsgTime(getCurrentTime());
            setMsgDateResetKey(Date.now());
        }
    };

    const submitCall = async () => {
        const htmlContent = callRef.current.innerHTML.trim();
        if (!htmlContent && callAttachments.length === 0) return showNotification("Please add some notes for this call.", "error");

        if (!validateTimeRange(callTimes.from, callTimes.to, callDates.from, callDates.to)) {
            return showNotification("'To Time' must be strictly after 'From Time'.", "error");
        }

        // Build Payload Array
        const payloadData = [{
            contact: callContact,
            outcome: callOutcome,
            content: htmlContent,
            fromDate: callDates.from,
            toDate: callDates.to,
            time: `${callTimes.from}/${callTimes.to}`,
            fromTime: callTimes.from,
            toTime: callTimes.to
        }];

        // Construct FormData mirroring the "Note concept"
        const formData = new FormData();
        formData.append("items", JSON.stringify(payloadData));

        callAttachments.forEach((attachment) => {
            if (attachment.file) {
                formData.append("file", attachment.file);
            }
        });

        const success = await handleSaveCallAPI(formData);

        if (success) {
            callRef.current.innerHTML = '';
            setCallAttachments([]);
            setCallDates({ from: '', to: '' });
            setCallTimes({ from: getCurrentTime(), to: getSystemTimePlusHour() });
            setCallDateResetKey(Date.now());
        }
    };

    const submitMeeting = async () => {
        const htmlContent = meetRef.current ? meetRef.current.innerHTML.trim() : '';

        if (!meetTitle.trim() || !meetDates.from || !meetDates.to) {
            return showNotification("Please fill Title and both Date ranges.", "error");
        }
        if (meetingType === 'virtual' && meetLinks.length === 0) {
            return showNotification("Please add at least one virtual meeting link.", "error");
        }
        if (meetingType === 'physical' && !meetLocation.trim()) {
            return showNotification("Please provide a physical venue / location.", "error");
        }

        if (!validateTimeRange(meetTimes.from, meetTimes.to, meetDates.from, meetDates.to)) {
            return showNotification("'To Time' must be strictly after 'From Time'.", "error");
        }

        const Time_ = `${meetTimes.from}/${meetTimes.to}`;

        // Build Payload Array
        const payloadData = [{
            type: meetingType,
            title: meetTitle,
            link: meetingType === 'virtual' ? meetLinks : undefined,
            location: meetingType === 'physical' ? meetLocation : undefined,
            fromDate: meetDates.from,
            toDate: meetDates.to,
            C_time: Time_,
            fromTime: meetTimes.from,
            toTime: meetTimes.to,
            content: htmlContent,
        }];

        // Construct FormData mirroring the "Note concept"
        const formData = new FormData();
        formData.append("items", JSON.stringify(payloadData));

        meetAttachments.forEach((attachment) => {
            if (attachment.file) {
                formData.append("file", attachment.file);
            }
        });

        const success = await handleSaveMeetingAPI(formData);

        if (success) {
            setMeetTitle('');
            setMeetLinks([]);
            setLinkInput('');
            setMeetLocation('');
            setMeetDates({ from: '', to: '' });
            setDateResetKey(Date.now());
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

        setNoteAttachments([]);
        setMsgAttachments([]);
        setCallAttachments([]);
        setMeetAttachments([]);

        setMsgSubject('');
        setMsgTo([]);
        setEmailInput('');
        setMsgDates({ from: '', to: '' });
        setMsgTime(getCurrentTime());
        setMsgDateResetKey(Date.now());

        setCallDates({ from: '', to: '' });
        setCallTimes({ from: getCurrentTime(), to: getSystemTimePlusHour() });
        setCallDateResetKey(Date.now() + 1);

        setMeetTitle('');
        setMeetLinks([]);
        setLinkInput('');
        setMeetLocation('');
        setMeetDates({ from: '', to: '' });
        setDateResetKey(Date.now() + 2);
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
    const handleRemoveEmail = (indexToRemove) => setMsgTo(msgTo.filter((_, index) => index !== indexToRemove));

    const handleAddMeetLink = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            let newLink = linkInput.trim();

            if (!newLink) return;

            if (!/^https?:\/\//i.test(newLink)) {
                newLink = `https://${newLink}`;
            }

            try {
                const parsedUrl = new URL(newLink);
                const hostname = parsedUrl.hostname.toLowerCase();

                const isGoogleMeet = hostname === 'meet.google.com';
                const isZoom = hostname === 'zoom.us' || hostname.endsWith('.zoom.us');

                if (!isGoogleMeet && !isZoom) {
                    return showNotification("Only Google Meet or Zoom links are allowed.", "error");
                }
            } catch (error) {
                return showNotification("Please enter a valid URL.", "error");
            }

            if (!meetLinks.includes(newLink) && meetLinks.length < 5) {
                setMeetLinks([...meetLinks, newLink]);
                setLinkInput('');
            } else if (meetLinks.includes(newLink)) {
                showNotification("This link has already been added.", "error");
            } else if (meetLinks.length >= 5) {
                showNotification("Max 5 links allowed.", "error");
            }
        }
    };
    const handleRemoveMeetLink = (index) => setMeetLinks(meetLinks.filter((_, i) => i !== index));

    const handleDateChange = (dateData) => {
        const dates = getSelectedDates(dateData);
        const from = dates[0] || "";
        const to = dates[1] || from;
        setMeetDates({ from, to });
    };

    const handleMsgDateChange = (dateData) => {
        alert("handleMsgDateChange called with dateData: " + JSON.stringify(dateData)); // Debugging line
        const dates = getSelectedDates(dateData);
        const from = dates[0] || "";
        const to = dates[1] || from;
        setMsgDates({ from, to });
    };

    const handleCallDateChange = (dateData) => {
        const dates = getSelectedDates(dateData);
        const from = dates[0] || "";
        const to = dates[1] || from;
        setCallDates({ from, to });
    };

    const handleTabSwitch = (tabId) => {
        setActiveTab(tabId);
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="h-[96vh] lg:overflow-hidden flex flex-col text-[13px] sm:text-sm bg-[#f5f8fa] text-[#33475b] relative" style={fontLight}>
            {toast.show && (
                <div style={fontBold} className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-30 px-4 py-2.5 rounded-md shadow-lg flex items-center gap-2 text-sm transition-all duration-300 ${toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {toast.type === 'success' ? <CheckCircle size={18} className="text-green-600" /> : <AlertTriangle size={18} className="text-red-600" />}
                    {toast.message}
                </div>
            )}

            <header className="flex-shrink-0 bg-white border-b border-[#cbd6e2] px-4 
            py-2 flex items-center shadow-sm  sticky top-0">
                <button style={fontBold} className="cursor-pointer flex items-center gap-2
                 bg-[#1a2d42] text-white px-4 py-1.5 rounded text-sm 
                 hover:bg-[#2c3f54] transition-colors" onClick={() => setStage(false)}>
                    <ArrowLeft size={18} />
                </button>
            </header>

            <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 overflow-y-auto lg:overflow-hidden items-start lg:items-stretch">

                {/* Left Sidebar */}
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
                                <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-2" style={fontBold}>
                                    Industry Profiles
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {currentOrg?.industyType && currentOrg.industyType.length > 0 ? (
                                        currentOrg.industyType.map((industry, index) => (
                                            <span key={index} className="bg-blue-50/60 text-blue-700 px-2.5 py-0.5 rounded-md text-[11px] border border-blue-100 capitalize transition-colors hover:bg-blue-100/70" style={fontLight}>
                                                {industry}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-slate-400 italic" style={fontLight}>
                                            No industry tags defined
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="pt-2">
                                <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-2.5" style={fontBold}>
                                    Demographics & Infrastructure
                                </div>
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

                {/* Center Feed Area */}
                <div className="lg:col-span-6 bg-white rounded-lg border border-[#cbd6e2] shadow-sm flex flex-col h-[75vh] lg:h-full overflow-hidden">
                    <div className="p-4 border-b border-[#cbd6e2] flex-shrink-0 bg-gray-50/50">
                        <h2 style={fontBold} className="text-base text-center flex justify-center items-center gap-2">
                            <Activity size={18} className="text-gray-500" /> Activity Log
                        </h2>
                    </div>

                    <div className="flex overflow-x-auto border-b border-[#cbd6e2] px-2 flex-shrink-0 scrollbar-hide">
                        {[
                            { id: 'notes', icon: PencilLine, label: 'Notes' },
                            { id: 'messages', icon: MessageCircle, label: 'Messages' },
                            { id: 'calls', icon: Phone, label: 'Calls' },
                            { id: 'meetings', icon: Calendar, label: 'Meetings' }
                        ].map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabSwitch(tab.id)}
                                    className={`cursor-pointer flex flex-col items-center gap-1.5 px-4 py-3 min-w-[80px] sm:min-w-[100px] border-b-2 transition-colors ${activeTab === tab.id ? 'border-[#ff7a59] text-[#33475b]' : 'border-transparent text-[#516f90] hover:text-[#33475b]'}`}
                                >
                                    <Icon size={20} className={activeTab === tab.id ? 'text-[#ff7a59]' : ''} />
                                    <span style={activeTab === tab.id ? fontBold : fontLight} className="text-[12px] sm:text-[13px] whitespace-nowrap">{tab.label}</span>
                                </button>
                            )
                        })}
                    </div>

                    <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white scrollbar-thin">

                        {/* Note Form */}
                        {activeTab === 'notes' && (
                            <div className="bg-white border border-[#cbd6e2] rounded-lg shadow-sm mb-6 transition-all">
                                <div className="p-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50 rounded-t-lg">
                                    <div className="w-7 h-7 rounded bg-yellow-100 text-yellow-600 flex items-center justify-center"><PencilLine size={16} /></div>
                                    <span style={fontBold}>Log Note</span>
                                </div>
                                <div className="p-4 bg-gray-50/30">
                                    <RichEditor contentRef={noteRef} placeholder="Start typing your note..." attachments={noteAttachments} setAttachments={setNoteAttachments} showNotification={showNotification} />
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
                                    {msgType === 'direct' && (
                                        <div className="flex flex-col items-stretch gap-4 border-b border-gray-200 pb-3 mb-2 pt-1">
                                            <div className="flex flex-col items-stretch gap-2 w-full">
                                                <span style={fontBold} className="text-gray-500 text-sm">Date Range:</span>
                                                <div className="w-full">
                                                    <DateUsage key={msgDateResetKey} onChange={handleMsgDateChange} />
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-stretch gap-2 w-full">
                                                <span style={fontBold} className="text-gray-500 text-sm">Time:</span>
                                                <input type="time" value={msgTime} onChange={(e) => setMsgTime(e.target.value)} style={fontLight} className="cursor-pointer focus:outline-none text-sm bg-transparent border border-gray-300 rounded p-2 shadow-sm focus:border-blue-400 w-full" />
                                            </div>
                                        </div>
                                    )}

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
                                    <RichEditor contentRef={msgRef} placeholder="Type your message..." attachments={msgAttachments} setAttachments={setMsgAttachments} showNotification={showNotification} />
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
                                            <label style={fontLight} className="block text-xs text-gray-500 mb-1">Contact</label>
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
                                        <div className="sm:col-span-2">
                                            {/* <label style={fontLight} className="block text-xs text-gray-500 mb-1">Date Range</label> */}
                                            <DateUsage key={callDateResetKey} range={true} onChange={handleCallDateChange} />
                                        </div>
                                        <div>
                                            <label style={fontLight} className="block text-xs text-gray-500 mb-1">From Time</label>
                                            <input type="time" step="1" value={callTimes.from} onChange={(e) => setCallTimes({ ...callTimes, from: e.target.value })} style={fontLight} className="cursor-pointer w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-400 bg-white focus:outline-none shadow-sm" />
                                        </div>
                                        <div>
                                            <label style={fontLight} className="block text-xs text-gray-500 mb-1">To Time</label>
                                            <input type="time" step="1" value={callTimes.to} onChange={(e) => setCallTimes({ ...callTimes, to: e.target.value })} style={fontLight} className="cursor-pointer w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-400 bg-white focus:outline-none shadow-sm" />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={fontLight} className="block text-xs text-gray-500 mb-1">Call Notes</label>
                                        <RichEditor contentRef={callRef} placeholder="Describe the call..." attachments={callAttachments} setAttachments={setCallAttachments} showNotification={showNotification} />
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

                        {/* Unified Meeting Form */}
                        {activeTab === 'meetings' && (
                            <div className="bg-white border border-[#cbd6e2] rounded-lg shadow-sm mb-6 transition-all">
                                <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-lg">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-7 h-7 rounded ${meetingType === 'virtual' ? 'bg-indigo-100 text-indigo-600' : 'bg-purple-100 text-purple-600'} flex items-center justify-center`}>
                                            {meetingType === 'virtual' ? <Video size={16} /> : <Calendar size={16} />}
                                        </div>
                                        <span style={fontBold} className="hidden sm:inline">Schedule Meeting</span>
                                    </div>
                                    <div className="flex gap-3 sm:gap-4">
                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                            <input type="radio" name="meetType" value="physical" checked={meetingType === 'physical'} onChange={() => setMeetingType('physical')} className="accent-purple-600 cursor-pointer" />
                                            <span style={fontBold} className="text-[12px] sm:text-sm">Physical</span>
                                        </label>
                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                            <input type="radio" name="meetType" value="virtual" checked={meetingType === 'virtual'} onChange={() => setMeetingType('virtual')} className="accent-indigo-600 cursor-pointer" />
                                            <span style={fontBold} className="text-[12px] sm:text-sm">Virtual</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="p-4 space-y-4">
                                    <input type="text" value={meetTitle} onChange={(e) => setMeetTitle(e.target.value)} style={fontBold} placeholder={meetingType === 'virtual' ? "Virtual Meeting Title" : "Physical Meeting Title"} className="cursor-text w-full border-b-2 border-gray-200 focus:border-blue-400 pb-2 text-lg focus:outline-none bg-transparent transition-colors" />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Multi-link array builder for virtual meetings */}
                                        {meetingType === 'virtual' && (
                                            <div className="sm:col-span-2">
                                                <label style={fontLight} className="block text-xs text-gray-500 mb-1">
                                                    Meeting Links
                                                </label>

                                                {meetLinks.length < 5 && (
                                                    <input
                                                        type="url"
                                                        value={linkInput}
                                                        onChange={(e) => setLinkInput(e.target.value)}
                                                        onKeyDown={handleAddMeetLink}
                                                        style={fontLight}
                                                        placeholder={meetLinks.length === 0 ? "https://zoom.us/j/... (Press Enter)" : "Add another link..."}
                                                        className="cursor-text w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-400 focus:outline-none shadow-sm"
                                                    />
                                                )}

                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {meetLinks.map((link, idx) => (
                                                        <span key={idx} className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full text-xs shadow-sm border border-indigo-200">
                                                            <span className="truncate max-w-[150px]">{link}</span>
                                                            <button
                                                                onClick={() => handleRemoveMeetLink(idx)}
                                                                className="cursor-pointer hover:text-red-500 hover:bg-white rounded-full ml-1 p-0.5 transition-colors"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {meetingType === 'physical' && (
                                            <div className="sm:col-span-2">
                                                <label style={fontLight} className="block text-xs text-gray-500 mb-1">Venue / Location</label>
                                                <input type="text" value={meetLocation} onChange={(e) => setMeetLocation(e.target.value)} style={fontLight} placeholder="e.g. Office Conference Room, Kathmandu" className="cursor-text w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-400 focus:outline-none shadow-sm" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="sm:col-span-2">
                                            {/* <label style={fontLight} className="block text-xs text-gray-500 mb-1">Meeting Date Range</label> */}
                                            <DateUsage key={dateResetKey} onChange={handleDateChange} />
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
                                        <RichEditor contentRef={meetRef} placeholder="Describe agenda and attach relevant files..." attachments={meetAttachments} setAttachments={setMeetAttachments} showNotification={showNotification} />
                                    </div>
                                </div>
                                <div className="p-4 flex gap-3 border-t border-gray-100 bg-gray-50/50 rounded-b-lg">
                                    <button onClick={submitMeeting} disabled={isSubmitting} style={fontBold} className="cursor-pointer bg-[#ff7a59] hover:bg-orange-600 disabled:opacity-70 text-white px-5 py-1.5 rounded flex items-center gap-2 transition-colors">
                                        {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                                        {isSubmitting ? 'Scheduling...' : `Schedule ${meetingType === 'virtual' ? 'Virtual' : 'Physical'} Meeting`}
                                    </button>
                                    <button onClick={cancelForm} disabled={isSubmitting} style={fontBold} className="cursor-pointer text-blue-600 hover:underline disabled:opacity-50">Cancel</button>
                                </div>
                            </div>
                        )}

                        <h3 style={fontBold} className="text-gray-700 text-[15px] mb-4 mt-2">Timeline Feed</h3>

                        {/* Enhanced Timeline Design Container */}
                        <div className="relative border-l-2 border-gray-200 ml-4 space-y-6 pb-6">
                            {activities.map(activity => (
                                <div key={activity.id} className="relative pl-6">
                                    {/* Timeline Node */}
                                    <div className="absolute -left-[9px] top-4 w-4 h-4 bg-white rounded-full border-[3px] border-[#ff7a59] shadow-sm z-10"></div>
                                    <ActivityCard
                                        data={activity}
                                        onUpdate={handleUpdateActivity}
                                        onDelete={handleDeleteActivity}
                                        setAttachments={setNoteAttachments}
                                        showNotification={showNotification}
                                    />
                                </div>
                            ))}
                            {activities.length === 0 && (
                                <div className="pl-6 text-gray-400 text-center py-10 flex flex-col items-center gap-2 bg-white rounded-lg border border-dashed border-gray-300">
                                    <ListChecks size={32} className="text-gray-300" />
                                    <p style={fontLight}>No activities logged yet.</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* Right Sidebar */}
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








function ActivityCard({ data, onUpdate, onDelete, showNotification }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [dateResetKey, setDateResetKey] = useState(new NepaliDate().toJsDate().getTime());
    const [currentTimeMs, setCurrentTimeMs] = useState(() => Date.now());

    useEffect(() => {
        if (data.type !== 'meeting' && data.type !== 'virtual_meeting') return undefined;

        const timer = window.setInterval(() => {
            setCurrentTimeMs(Date.now());
        }, 1000);

        return () => window.clearInterval(timer);
    }, [data.type]);

    const canEdit = !['email', 'meeting', 'virtual_meeting'].includes(data.type);

    const formatAttachments = (atts) => {
        if (!atts) return [];
        return atts.map(att => {
            if (typeof att === 'string') {
                return { name: att.split('/').pop(), path: att, isExisting: true };
            }
            if (att && att.name) return att;
            return { name: 'Unknown File', path: att, isExisting: true };
        });
    };

    const [editContent, setEditContent] = useState(data.content || '');
    const editContentRef = useRef(null);
    const [editAttachments, setEditAttachments] = useState(formatAttachments(data.attachments));
    const [editTitle, setEditTitle] = useState(data.title || '');

    const initialTo = Array.isArray(data.to) ? data.to : (data.to ? data.to.split(',').map(s => s.trim()) : []);
    const [editTo, setEditTo] = useState(initialTo);
    const [editToInput, setEditToInput] = useState('');
    const [editSubject, setEditSubject] = useState(data.subject || '');

    const extractDate = (dateString) => {
        if (!dateString) return '';
        return dateString.split('T')[0].split(' ')[0];
    };

    const extractTime = (dateString) => {
        if (!dateString) return '';
        let time = '';
        if (dateString.includes('T')) time = dateString.split('T')[1];
        else if (dateString.includes(' ')) time = dateString.split(' ')[1];
        return time.match(/^\d{1,2}:\d{2}(?:\s?(?:AM|PM))?/i)?.[0] || '';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const datePart = normalizeBsDate(extractDate(dateString));
        const timePart = normalizeTime24(extractTime(dateString));
        return timePart ? `${datePart} | ${timePart}` : datePart;
    };

    const formatNepaliDate = (dateString) => formatDate(dateString);

    // Activity timestamps are ISO dates; scheduled dates are BS dates.
    const safeGetNepaliTime = (dateStr, timeStr = '') => {
        if (!dateStr) return NaN;
        try {
            if (typeof dateStr === 'string' && dateStr.includes('T')) {
                return new Date(dateStr).getTime();
            }

            const datePart = normalizeBsDate(extractDate(dateStr));
            const timePart = normalizeTime24(timeStr || extractTime(dateStr), '00:00');

            const [year, month, day] = datePart.split(/[-/]/).map(Number);
            const [hour, min] = timePart.split(':').map(Number);

            // Convert via .toJsDate() to access setHours and getTime natively
            const convertedDate = new NepaliDate(year, month - 1, day).toJsDate();
            convertedDate.setHours(hour || 0, min || 0, 0, 0);
            return convertedDate.getTime();
        } catch (error) {
            return NaN;
        }
    };

    const [editDates, setEditDates] = useState({ from: normalizeBsDate(extractDate(data.Sdate)), to: normalizeBsDate(extractDate(data.Edate)) });
    const [editTimes, setEditTimes] = useState({
        from: normalizeTime24(data.fromTime || extractTime(data.Sdate) || extractTime(data.timestamp)),
        to: normalizeTime24(data.toTime || extractTime(data.Edate))
    });

    const [editContact, setEditContact] = useState(data.contact || '');
    const [editOutcome, setEditOutcome] = useState(data.outcome || '');
    const initialLinks = Array.isArray(data.link) ? data.link : (data.link ? [data.link] : []);
    const [editLinks, setEditLinks] = useState(initialLinks);
    const [editLinkInput, setEditLinkInput] = useState('');
    const [editLocation, setEditLocation] = useState(data.location || '');
    const [editTimestampDates, setEditTimestampDates] = useState({ from: extractDate(data.timestamp), to: extractDate(data.timestamp) });
    const [editTimestampTime, setEditTimestampTime] = useState(extractTime(data.timestamp));

    const fontLight = { fontFamily: "'Roboto Slab', serif", fontWeight: 300 };
    const fontBold = { fontFamily: "'Roboto Slab', serif", fontWeight: 700 };

    const createdDateStr = data.createdDate || data.timestamp;
    let daysAgoText = '';

    if (['call', 'email', 'message', 'direct', 'meeting', 'virtual_meeting'].includes(data.type) && createdDateStr) {
        const createdMs = safeGetNepaliTime(createdDateStr);
        const nowMs = Date.now();

        if (!isNaN(createdMs) && !isNaN(nowMs)) {
            const diffMs = Math.abs(nowMs - createdMs);
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

            if (diffDays > 0 || diffHrs > 0 || diffMins > 0) {
                daysAgoText = `${diffDays} Day : ${diffHrs} Hrs : ${diffMins} Min ago`;
            } else {
                daysAgoText = 'Created just now';
            }
        }
    }

    let isMeetingActive = false;
    let meetingDiffText = '';
    let meetingDurationText = '';
    let meetingStatus = '';

    if (data.type === 'meeting' || data.type === 'virtual_meeting') {
        const startStr = data.Sdate ? extractDate(data.Sdate) : '';
        const endStr = data.Edate ? extractDate(data.Edate) : '';
        console.log('Start:', startStr, 'End:', endStr, 'From Time:', data.fromTime, 'To Time:', data.toTime);
        const fromTimeStr = normalizeTime24(data.fromTime, '00:00');
        const toTimeStr = normalizeTime24(data.toTime, '23:59');

        if (startStr && endStr) {
            const startDateTime = safeGetNepaliTime(startStr, fromTimeStr);
            // console.log('Start DateTime:', startDateTime, 'End DateTime:', safeGetNepaliTime(endStr, toTimeStr));
            const endDateTime = safeGetNepaliTime(endStr, toTimeStr);
            // FIXED: Appended .toJsDate()
            const now = currentTimeMs;

            if (!isNaN(startDateTime) && !isNaN(endDateTime)) {
                    const formatDiff = (diffMs, prefix) => {
                    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                    const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                        const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
                        return `${prefix} ${diffDays}d ${diffHrs}h ${diffMins}m ${diffSecs}s`;
                };

                    meetingDurationText = formatDiff(Math.max(0, endDateTime - startDateTime), 'Left:');

                if (now < startDateTime) {
                
                    isMeetingActive = false;
                    meetingDiffText = formatDiff(startDateTime - now, "Starts in");
                        meetingStatus = startDateTime - now <= 15 * 60 * 1000 ? 'warning' : 'upcoming';
                } else if (now <= endDateTime) {
                    isMeetingActive = true;
                    meetingDiffText = formatDiff(endDateTime - now, "Ends in");
                        meetingStatus = endDateTime - now <= 15 * 60 * 1000 ? 'warning' : 'running';
                } else {
                    isMeetingActive = false;
                    meetingDiffText = "Ended";
                        meetingStatus = 'ended';
                }
            }
        }
    }

    useEffect(() => {
        if (isEditing) {
            setEditContent(data.content || '');
            setEditAttachments(formatAttachments(data.attachments));
            setEditTitle(data.title || '');
            setEditDates({ from: normalizeBsDate(extractDate(data.Sdate)), to: normalizeBsDate(extractDate(data.Edate)) });
            setEditTimes({
                from: normalizeTime24(data.fromTime || extractTime(data.Sdate) || extractTime(data.timestamp)),
                to: normalizeTime24(data.toTime || extractTime(data.Edate))
            });
            setEditContact(data.contact || '');
            setEditOutcome(data.outcome || '');
            setEditLinks(Array.isArray(data.link) ? data.link : (data.link ? [data.link] : []));
            setEditLinkInput('');
            setEditLocation(data.location || '');

            const resetTo = Array.isArray(data.to) ? data.to : (data.to ? data.to.split(',').map(s => s.trim()) : []);
            setEditTo(resetTo);
            setEditToInput('');
            setEditSubject(data.subject || '');

            const rawTimestamp = extractDate(data.timestamp);
            setEditTimestampDates({ from: rawTimestamp, to: rawTimestamp });
            setEditTimestampTime(extractTime(data.timestamp));

            // FIXED: Appended .toJsDate()
            setDateResetKey(new NepaliDate().toJsDate().getTime());
            if (editContentRef.current) {
                editContentRef.current.innerHTML = DOMPurify.sanitize(data.content || '');
            }
        }
    }, [isEditing, data]);

    const configMap = {
        note: { icon: PencilLine, bg: 'bg-yellow-100', text: 'text-yellow-600', accent: 'border-l-yellow-400', label: 'Note logged' },
        email: { icon: Mail, bg: 'bg-blue-100', text: 'text-blue-600', accent: 'border-l-blue-400', label: 'Email sent' },
        message: { icon: MessageCircle, bg: 'bg-blue-100', text: 'text-blue-600', accent: 'border-l-blue-400', label: 'Message sent' },
        direct: { icon: MessageCircle, bg: 'bg-blue-100', text: 'text-blue-600', accent: 'border-l-blue-400', label: 'Message added' },
        call: { icon: Phone, bg: 'bg-green-100', text: 'text-green-600', accent: 'border-l-green-400', label: 'Call logged' },
        meeting: { icon: Calendar, bg: 'bg-purple-100', text: 'text-purple-600', accent: 'border-l-purple-400', label: 'Physical meeting scheduled' },
        virtual_meeting: { icon: Video, bg: 'bg-indigo-100', text: 'text-indigo-600', accent: 'border-l-indigo-400', label: 'Virtual meeting scheduled' }
    };

    const config = configMap[data.type] || { icon: ListChecks, bg: 'bg-gray-100', text: 'text-gray-600', accent: 'border-l-gray-400', label: 'Activity logged' };
    const Icon = config.icon;

    const handleEditDateChange = (dateData) => {
        const dates = getSelectedDates(dateData);
        const from = dates[0] || "";
        const to = dates[1] || from;
        setEditDates({ from, to });
    };

    const handleEditTimestampDateChange = (dateData) => {
        const dates = getSelectedDates(dateData);
        const from = dates[0] || "";
        const to = dates[1] || from;
        setEditTimestampDates({ from, to });
    };

    const handleAddEditLink = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newLink = editLinkInput.trim();
            if (!newLink) return;
            if (!editLinks.includes(newLink) && editLinks.length < 5) {
                setEditLinks([...editLinks, newLink]);
                setEditLinkInput('');
            }
        }
    };
    const handleRemoveEditLink = (index) => setEditLinks(editLinks.filter((_, i) => i !== index));

    const handleAddEditTo = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newEmail = editToInput.trim();
            if (!newEmail) return;
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) return showNotification("Please enter a valid email address.", "error");
            if (!editTo.includes(newEmail) && editTo.length < 5) {
                setEditTo([...editTo, newEmail]);
                setEditToInput('');
            } else if (editTo.includes(newEmail)) {
                showNotification("Email already added.", "error");
            }
        }
    };
    const handleRemoveEditTo = (index) => setEditTo(editTo.filter((_, i) => i !== index));

    const validateTimeRange = (fromTime, toTime) => {
        if (!fromTime || !toTime) return true;
        return fromTime <= toTime;
    };

    const handleSave = async () => {
        setIsUpdating(true);
        const currentHTMLContent = editContentRef.current ? editContentRef.current.innerHTML.trim() : editContent;

        const formData = new FormData();
        formData.append('content', currentHTMLContent);

        if (data.type === 'meeting' || data.type === 'virtual_meeting') {
            if (!validateTimeRange(editTimes.from, editTimes.to)) {
                showNotification("'To Time' must be strictly after 'From Time'.", "error");
                setIsUpdating(false);
                return;
            }
            formData.append('title', editTitle);
            formData.append('fromDate', editDates.from);
            formData.append('toDate', editDates.to);
            formData.append('C_time', `${editTimes.from}/${editTimes.to}`);
            formData.append('fromTime', editTimes.from);
            formData.append('toTime', editTimes.to);

            if (data.type === 'virtual_meeting') {
                editLinks.forEach(link => formData.append('link[]', link));
            }
            if (data.type === 'meeting') {
                formData.append('location', editLocation);
            }
        } else if (data.type === 'call') {
            if (!validateTimeRange(editTimes.from, editTimes.to)) {
                showNotification("'To Time' must be strictly after 'From Time'.", "error");
                setIsUpdating(false);
                return;
            }
            formData.append('contact', editContact);
            formData.append('outcome', editOutcome);
            formData.append('Sdate', editTimestampDates.from);
            formData.append('Edate', editTimestampDates.to);
            formData.append('time', `${editTimes.from}/${editTimes.to}`);
            formData.append('fromTime', editTimes.from);
            formData.append('toTime', editTimes.to);
        } else if (data.type === 'message' || data.type === 'direct') {
            formData.append('fromDate', editTimestampDates.from);
            formData.append('toDate', editTimestampDates.to);
            formData.append('time', editTimestampTime);
            formData.append('type', 'message');
        } else if (data.type === 'email') {
            formData.append('type', 'email');
            formData.append('subject', editSubject);
            editTo.forEach(email => formData.append('to[]', email));
        }

        editAttachments.forEach((att) => {
            if (att.file) {
                formData.append('file', att.file);
            } else {
                formData.append('retainedAttachments', att.path || att);
            }
        });

        try {
            await onUpdate(data.id, formData, data.type, data.meetingType);
            setEditContent(currentHTMLContent);
        } catch (error) {
            console.error("Failed to update activity:", error);
        } finally {
            setIsUpdating(false);
            setIsEditing(false);
        }
    };

    return (
        <div className={`bg-white border border-slate-200 border-l-4 rounded-lg shadow-sm
         transition-all duration-300 relative hover:shadow-md group ${config.accent} ${isEditing ? 'overflow-visible z-20' : 'overflow-hidden z-0'} ${isMeetingActive ? 'shadow-md shadow-orange-100/50' : ''}`} style={fontLight}>

            {/* HEADER */}
            <div className="p-3 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-white">
                <div className="flex items-center gap-2">
                    <div className={`w-9 h-9 rounded-md ${config.bg} ${config.text} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={16} />
                    </div>
                    <div className="text-[13px] leading-tight sm:leading-normal">
                        <span style={fontBold} className="capitalize">{data.type.replace('_', ' ')}</span> <span className="text-gray-500">{config.label}</span> {data.author && <span style={fontBold} className="text-gray-800">by {data.author}</span>}
                        {daysAgoText && <span className="ml-2 text-[11px] text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded-full shadow-sm">{daysAgoText}</span>}
                    </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end w-full sm:w-auto justify-between sm:justify-end gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1 bg-white rounded px-1 py-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        {canEdit && (
                            <button onClick={() => setIsEditing(!isEditing)} className="cursor-pointer text-gray-400 hover:text-blue-500 p-1 rounded hover:bg-blue-50 transition-colors" title="Edit">
                                <Edit2 size={14} />
                            </button>
                        )}
                        {canEdit && <div className="w-px h-3 bg-gray-200 mx-0.5"></div>}
                        <button
                            onClick={() => onDelete(data.id, data.type)}
                            className="cursor-pointer text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Delete"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(data.timestamp)}</span>
                </div>
            </div>

            <div className="p-4 text-[13px] sm:text-[14px] text-gray-800">
                {isEditing ? (
                    <div className="space-y-3">
                        {(data.type === 'meeting' || data.type === 'virtual_meeting') && (
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md space-y-3">
                                <div>
                                    <label style={fontLight} className="block text-xs text-gray-500 mb-1">Meeting Title</label>
                                    <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="cursor-text w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-400 focus:outline-none" />
                                </div>

                                {data.type === 'virtual_meeting' && (
                                    <div>
                                        <label style={fontLight} className="block text-xs text-gray-500 mb-1">Meeting Links (Press Enter/Comma, max 5)</label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {editLinks.map((l, i) => (
                                                <span key={i} className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs shadow-sm">
                                                    <span className="truncate max-w-[150px]">{l}</span>
                                                    <button onClick={() => handleRemoveEditLink(i)} className="hover:text-red-500 cursor-pointer"><X size={12} /></button>
                                                </span>
                                            ))}
                                        </div>
                                        {editLinks.length < 5 && (
                                            <input type="url" value={editLinkInput} onChange={e => setEditLinkInput(e.target.value)} onKeyDown={handleAddEditLink} className="cursor-text w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-400 focus:outline-none" placeholder="Add a link and press Enter" />
                                        )}
                                    </div>
                                )}

                                {data.type === 'meeting' && (
                                    <div>
                                        <label style={fontLight} className="block text-xs text-gray-500 mb-1">Venue / Location</label>
                                        <input type="text" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className="cursor-text w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-400 focus:outline-none" placeholder="e.g. Office Conference Room, Kathmandu" />
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2 ">
                                        <label style={fontLight} className="block text-xs text-gray-500 mb-1">Meeting Date Range</label>
                                        <DateUsage
                                            id={`meet-edit-${data.id}`}
                                            key={dateResetKey}
                                            onChange={handleEditDateChange}
                                            defaultValue={
                                                editDates?.from && editDates?.to
                                                    ? `${editDates.from} - ${editDates.to}`
                                                    : ""
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label style={fontLight} className="block text-xs text-gray-500 mb-1">From Time</label>
                                        <input type="time" value={editTimes.from} onChange={(e) => setEditTimes({ ...editTimes, from: e.target.value })} className="cursor-pointer w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-400 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label style={fontLight} className="block text-xs text-gray-500 mb-1">To Time</label>
                                        <input type="time" value={editTimes.to} onChange={(e) => setEditTimes({ ...editTimes, to: e.target.value })} className="cursor-pointer w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-400 focus:outline-none" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {data.type === 'call' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-gray-50 border border-gray-200 rounded-md mb-3">
                                <div>
                                    <label style={fontLight} className="block text-xs text-gray-500 mb-1">Contacted</label>
                                    <input type="text" value={editContact} onChange={(e) => setEditContact(e.target.value)} className="cursor-text w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-400 focus:outline-none" placeholder="Contact Name" />
                                </div>
                                <div>
                                    <label style={fontLight} className="block text-xs text-gray-500 mb-1">Outcome</label>
                                    <select value={editOutcome} onChange={(e) => setEditOutcome(e.target.value)} className="cursor-pointer w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-400 bg-white focus:outline-none">
                                        <option>Connected</option>
                                        <option>Left voicemail</option>
                                        <option>No answer</option>
                                    </select>
                                </div>
                                <div className="sm:col-span-2">
                                    <label style={fontLight} className="block text-xs text-gray-500 mb-1">Date</label>
                                    <DateUsage
                                        id={`call-edit-${data.id}`}
                                        key={dateResetKey}
                                        range={true}
                                        onChange={handleEditTimestampDateChange}
                                        defaultValue={[editTimestampDates.from, editTimestampDates.to]}
                                    />
                                </div>
                                <div>
                                    <label style={fontLight} className="block text-xs text-gray-500 mb-1">From Time</label>
                                    <input type="time" value={editTimes.from} onChange={(e) => setEditTimes({ ...editTimes, from: e.target.value })} className="cursor-pointer w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-400 bg-white focus:outline-none" />
                                </div>
                                <div>
                                    <label style={fontLight} className="block text-xs text-gray-500 mb-1">To Time</label>
                                    <input type="time" value={editTimes.to} onChange={(e) => setEditTimes({ ...editTimes, to: e.target.value })} className="cursor-pointer w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-400 bg-white focus:outline-none" />
                                </div>
                            </div>
                        )}

                        {(data.type === 'message' || data.type === 'direct') && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-gray-50 border border-gray-200 rounded-md mb-3">
                                <div>
                                    <label style={fontLight} className="block text-xs text-gray-500 mb-1">Date</label>
                                    <DateUsage
                                        id={`msg-edit-${data.id}`}
                                        key={dateResetKey}
                                        onChange={handleEditTimestampDateChange}
                                        defaultValue={editTimestampDates.from}
                                    />
                                </div>
                                <div>
                                    <label style={fontLight} className="block text-xs text-gray-500 mb-1">Time</label>
                                    <input type="time" value={editTimestampTime} onChange={(e) => setEditTimestampTime(e.target.value)} className="cursor-pointer w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-400 bg-white focus:outline-none" />
                                </div>
                            </div>
                        )}

                        {data.type === 'email' && (
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md mb-3 space-y-3">
                                <div>
                                    <label style={fontLight} className="block text-xs text-gray-500 mb-1">To (Press Enter/Comma, max 5)</label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {editTo.map((email, i) => (
                                            <span key={i} className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs shadow-sm">
                                                <span className="truncate max-w-[150px]">{email}</span>
                                                <button onClick={() => handleRemoveEditTo(i)} className="hover:text-red-500 cursor-pointer"><X size={12} /></button>
                                            </span>
                                        ))}
                                    </div>
                                    {editTo.length < 5 && (
                                        <input type="email" value={editToInput} onChange={e => setEditToInput(e.target.value)} onKeyDown={handleAddEditTo} className="cursor-text w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-400 focus:outline-none" placeholder="Add email and press Enter" />
                                    )}
                                </div>
                                <div>
                                    <label style={fontLight} className="block text-xs text-gray-500 mb-1">Subject</label>
                                    <input type="text" value={editSubject} onChange={(e) => setEditSubject(e.target.value)} className="cursor-text w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-400 focus:outline-none" placeholder="Email subject..." />
                                </div>
                            </div>
                        )}

                        <label style={fontLight} className="block text-xs text-gray-500 mb-1">{(data.type === 'meeting' || data.type === 'virtual_meeting') ? 'Agenda / Notes & Attachments' : 'Notes & Attachments'}</label>
                        <div className={isUpdating ? "opacity-50 pointer-events-none" : ""}>
                            <RichEditor contentRef={editContentRef} placeholder="Update your notes..." attachments={editAttachments} setAttachments={setEditAttachments} showNotification={showNotification} />
                        </div>

                        <div className="flex gap-2">
                            <button onClick={handleSave} disabled={isUpdating} style={fontBold}
                                className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs flex items-center gap-1.5 disabled:opacity-70">
                                {isUpdating && <Loader2 size={12} className="animate-spin" />}
                                {isUpdating ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button onClick={() => setIsEditing(false)} disabled={isUpdating} style={fontBold} className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded text-xs">Cancel</button>
                        </div>
                    </div>
                ) : (
                    <div>
                        {data.type === 'email' && (
                            <div className="mb-3 bg-gray-50 border border-gray-200 p-2.5 rounded text-[13px]">
                                <div style={fontBold} className="text-gray-800 mb-1 border-b border-gray-200 pb-1 break-words">Subject: {data.subject}</div>
                                <div className="text-gray-500 break-words flex flex-wrap gap-1"><span style={fontBold}>To:</span> {Array.isArray(data.to) ? data.to.join(', ') : data.to}</div>
                            </div>
                        )}
                        {(data.type === 'message' || data.type === 'direct') && data.to && (
                            <div className="mb-3 bg-gray-50 border border-gray-200 p-2.5 rounded text-[13px]">
                                <div style={fontBold} className="text-gray-500 break-words">To: {Array.isArray(data.to) ? data.to.join(', ') : data.to}</div>
                            </div>
                        )}
                        {data.type === 'call' && (
                            <div className="mb-4">
                                <div className="mb-3">
                                    <span style={fontBold} className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2.5 py-1 rounded inline-flex items-center gap-1.5 flex-wrap shadow-sm">
                                        <Phone size={12} />
                                        {data.outCome || data.outcome || 'Call'} with {data.connected || data.contact || 'Unknown Contact'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-md border border-gray-100 text-[12px] sm:text-[13px] text-gray-600">
                                    <div className="flex items-center gap-1.5">
                                        <CalendarPlus size={14} className="text-blue-400" />
                                        <span style={fontBold} className="text-gray-700 w-10">From:</span>
                                        {formatNepaliDate(data.fromDate || data.timestamp)}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <CalendarCheck size={14} className="text-blue-400" />
                                        <span style={fontBold} className="text-gray-700 w-10">To:</span>
                                        {formatNepaliDate(data.toDate || data.timestamp)}
                                    </div>
                                    <div className="flex items-center gap-1.5 sm:col-span-2">
                                        <Clock size={14} className="text-blue-400" />
                                        <span style={fontBold} className="text-gray-700 w-10">Time:</span>
                                        <span>{formatCallTime(data.fromTime || editTimes.from)} to {formatCallTime(data.toTime || editTimes.to)}</span>
                                        {getTimeDifference(data.fromTime || editTimes.from, data.toTime || editTimes.to) && (
                                            <span className="ml-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                                                {getTimeDifference(data.fromTime || editTimes.from, data.toTime || editTimes.to)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {data.note && (
                                    <div className="mb-3">
                                        <span style={fontBold} className="block text-xs text-gray-500 mb-1">Call Notes:</span>
                                        <div
                                            className="max-h-60 overflow-y-auto scrollbar-thin whitespace-pre-wrap leading-relaxed prose prose-sm max-w-none break-words text-[13px] sm:text-[14px] text-gray-800 bg-gray-50 p-3 border border-gray-100 rounded"
                                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.note) }}
                                        ></div>
                                    </div>
                                )}
                            </div>
                        )}

                        {(data.type === 'meeting' || data.type === 'virtual_meeting') && (
                            <div className="mb-3 relative bg-white rounded overflow-hidden p-3 pl-4">

                                {/* Very thin accent line to indicate type, taking zero extra layout space */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${data.type === 'virtual_meeting' ? 'bg-indigo-500' : 'bg-purple-500'}`} />

                                {/* Header */}
                                <div className="flex justify-between items-start mb-2">
                                    <div className={`font-semibold text-[14px] sm:text-[15px] ${data.type === 'virtual_meeting' ? 'text-indigo-900' : 'text-purple-900'}`}>
                                        {data.title}
                                    </div>
                                    <div className="flex flex-wrap justify-end gap-1.5">
                                        {meetingDurationText && (
                                            <span className="text-[10px] sm:text-[11px] px-2.5 py-1 rounded-full font-semibold whitespace-nowrap bg-indigo-50 text-indigo-700">
                                                {meetingDurationText}
                                            </span>
                                        )}
                                        {meetingDiffText && (
                                            <span className={`text-[10px] sm:text-[11px] px-2.5 py-1 rounded-full font-semibold whitespace-nowrap flex items-center gap-1.5
                    ${meetingStatus === 'ended'
                                                ? 'bg-red-100 text-red-700'
                                                : meetingStatus === 'running'
                                                    ? 'bg-green-100 text-green-700'
                                                    : meetingStatus === 'warning'
                                                        ? 'bg-amber-100 text-amber-800'
                                                        : 'bg-slate-100 text-slate-600'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${meetingStatus === 'ended'
                                                ? 'bg-red-500'
                                                : meetingStatus === 'running'
                                                    ? 'bg-green-500 animate-pulse'
                                                    : meetingStatus === 'warning'
                                                        ? 'bg-amber-500 animate-pulse'
                                                        : 'bg-slate-400'}`} />
                                            {meetingDiffText}
                                        </span>
                                        )}
                                    </div>
                                </div>

                                {/* Virtual Link */}
                                {data.type === 'virtual_meeting' && data.link && data.link.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {data.link.map((l, idx) => (
                                            <a key={idx} href={l} target="_blank" rel="noreferrer" className="text-[11px] sm:text-[12px] flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 rounded px-2 py-1 max-w-fit transition-colors">
                                                <Video size={14} className="text-indigo-600 flex-shrink-0" />
                                                <span className="text-indigo-800 hover:underline truncate max-w-[200px] sm:max-w-[300px]">{l}</span>
                                            </a>
                                        ))}
                                    </div>
                                )}

                                {/* Physical Location */}
                                {data.type === 'meeting' && data.location && (
                                    <div className="text-[11px] sm:text-[12px] mb-2 flex items-center gap-1.5 bg-purple-50 rounded px-2 py-1 max-w-fit">
                                        <Home size={14} className="text-purple-600 flex-shrink-0" />
                                        <span className="text-purple-900 truncate max-w-[200px] sm:max-w-[300px]">{data.location}</span>
                                    </div>
                                )}

                                {/* Compact Dates inline */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mt-1">
                                    <div className="text-[11px] sm:text-xs text-gray-600 flex items-center gap-1 mb-1 sm:mb-0">
                                        <CalendarPlus size={14} className={data.type === 'virtual_meeting' ? 'text-indigo-500' : 'text-purple-500'} />
                                        <span className="font-semibold text-gray-700 w-8">From:</span>
                                        <span>{formatDate(data.Sdate)} {data.fromTime && `| ${normalizeTime24(data.fromTime)}`}</span>
                                    </div>
                                    <div className="text-[11px] sm:text-xs text-gray-600 flex items-center gap-1">
                                        <CalendarCheck size={14} className={data.type === 'virtual_meeting' ? 'text-indigo-500' : 'text-purple-500'} />
                                        <span className="font-semibold text-gray-700 w-8">To:</span>
                                        <span>{formatDate(data.Edate)} {data.toTime && `| ${normalizeTime24(data.toTime)}`}</span>
                                    </div>
                                </div>

                            </div>
                        )}
                        <div className="max-h-60 overflow-y-auto scrollbar-thin whitespace-pre-wrap leading-relaxed prose prose-sm max-w-none break-words [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:py-0.5" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.content) }}></div>

                        {data.attachments?.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                                <div style={fontBold} className="w-full text-xs text-gray-500 mb-1">
                                    Attachments:
                                </div>

                                {data.attachments.map((file, i) => {
                                    const attachmentPath = typeof file === 'string'
                                        ? file
                                        : file?.path || file?.name || `attachment-${i}`;

                                    return (
                                        <FileAttachment
                                            key={`${attachmentPath}-${i}`}
                                            file={file}
                                            baseUrl={import.meta.env.VITE_API_BACKEND_URL}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}