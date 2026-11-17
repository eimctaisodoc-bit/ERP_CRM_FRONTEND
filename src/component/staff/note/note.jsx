import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    File, FileArchive, FileAudio, FileCode, FileImage, FileSpreadsheet, FileText, FileVideo, Check,
    Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, FileText as NoteIcon, Loader2, Save
} from 'lucide-react';

import NepaliDate from 'nepali-date-converter';

/* ------------------------------------------------------------------ */
/* Motion presets                                                      */
/* ------------------------------------------------------------------ */
const EASE_OUT = [0.22, 1, 0.36, 1];

const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.14, delayChildren: 0.35 } },
};

const listStagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const fadeUp = {
    hidden: { opacity: 0, y: 22 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
};

const press = (disabled) =>
    disabled ? {} : { whileHover: 'hover', whileTap: 'tap' };

const btnVariants = {
    hover: { scale: 1.02 },
    tap: { scale: 0.97 },
};

const iconVariants = {
    hover: { rotate: -8, scale: 1.12 },
    tap: { scale: 0.92 },
};

const softSpring = { type: 'spring', stiffness: 180, damping: 22 };
const GRADIENT = 'bg-gradient-to-r from-amber-500 to-orange-500';

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */
const NOTES_KEY = 'nexus_dms_notes';
const MAX_UPLOAD_SIZE = 50 * 1024 * 1024;
const MAX_ATTACHMENTS = 10;
const ALLOWED_EXT = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'ppt', 'pptx', 'txt'];
const ACCEPT = ALLOWED_EXT.map(e => `.${e}`).join(',');
const NP_TZ = 'Asia/Kathmandu';
const NP_OFFSET = '+05:45';

const FONT_FAMILIES = [
    { label: 'Poppins', css: "'Poppins', sans-serif" },
    { label: 'Noto Sans Devanagari', css: "'Noto Sans Devanagari', sans-serif" },
    { label: 'Merriweather', css: "'Merriweather', serif" },
    { label: 'Playfair Display', css: "'Playfair Display', serif" },
    { label: 'Roboto Mono', css: "'Roboto Mono', monospace" },
    { label: 'Caveat', css: "'Caveat', cursive" },
    { label: 'Georgia', css: 'Georgia, serif' },
    { label: 'Arial', css: 'Arial, Helvetica, sans-serif' }
];
const SWATCHES = ['#0f172a', '#b45309', '#ea580c', '#dc2626', '#059669', '#2563eb', '#7c3aed', '#db2777'];
const HIGHLIGHTS = ['#fef3c7', '#fed7aa', '#fecaca', '#bbf7d0', '#bfdbfe', '#ddd6fe'];

const FONT_EFFECTS = [
    { id: 'uppercase', label: 'UPPERCASE', styles: { 'text-transform': 'uppercase' } },
    { id: 'lowercase', label: 'lowercase', styles: { 'text-transform': 'lowercase' } },
    { id: 'capitalize', label: 'Capitalize', styles: { 'text-transform': 'capitalize' } }
];

const FORMAT_TOOLS = [
    { command: 'bold', label: 'Bold', text: 'B', className: 'font-black' },
    { command: 'italic', label: 'Italic', text: 'I', className: 'italic' },
    { command: 'underline', label: 'Underline', text: 'U', className: 'underline' },
    { command: 'strikeThrough', label: 'Strikethrough', text: 'S', className: 'line-through' }
];
const BLOCK_TOOLS = [
    { command: 'justifyLeft', label: 'Align left', text: '⇤' },
    { command: 'justifyCenter', label: 'Align center', text: '↔' },
    { command: 'justifyRight', label: 'Align right', text: '⇥' },
    { command: 'insertUnorderedList', label: 'Bulleted list', text: '• List' },
    { command: 'insertOrderedList', label: 'Numbered list', text: '1. List' }
];
const QUERY_COMMANDS = [...FORMAT_TOOLS, ...BLOCK_TOOLS].map(t => t.command);

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const pad = (n) => String(n).padStart(2, '0');

const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
};

const getExt = (name) => name.split('.').pop()?.toLowerCase() || '';
const isImage = (name) => ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(getExt(name));

const getFileIcon = (filename) => {
    const extension = getExt(filename);
    if (['pdf', 'doc', 'docx', 'rtf', 'txt', 'ppt', 'pptx'].includes(extension)) return { Icon: FileText, color: 'text-amber-600' };
    if (['xls', 'xlsx', 'csv'].includes(extension)) return { Icon: FileSpreadsheet, color: 'text-orange-600' };
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(extension)) return { Icon: FileImage, color: 'text-orange-600' };
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return { Icon: FileArchive, color: 'text-amber-600' };
    if (['mp3', 'wav', 'ogg', 'm4a'].includes(extension)) return { Icon: FileAudio, color: 'text-orange-600' };
    if (['mp4', 'mov', 'avi', 'mkv'].includes(extension)) return { Icon: FileVideo, color: 'text-amber-600' };
    if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'xml'].includes(extension)) return { Icon: FileCode, color: 'text-orange-600' };
    return { Icon: File, color: 'text-slate-500' };
};

/* ---- Nepal date & time ------------------------------------------- */
const kathmanduParts = (date) => {
    const parts = Object.fromEntries(
        new Intl.DateTimeFormat('en-US', {
            timeZone: NP_TZ, year: 'numeric', month: '2-digit', day: '2-digit'
        }).formatToParts(date).map(p => [p.type, p.value])
    );
    return { y: Number(parts.year), m: Number(parts.month), d: Number(parts.day) };
};

const formatNepalTime = (date) =>
    new Intl.DateTimeFormat('en-US', { timeZone: NP_TZ, hour: 'numeric', minute: '2-digit', hour12: true }).format(date);

const toNepaliDate = (date) => {
    const { y, m, d } = kathmanduParts(date);
    return new NepaliDate(new Date(y, m - 1, d));
};

const formatBsDate = (date) => toNepaliDate(date).format('ddd, DD MMMM YYYY');
const formatBsStamp = (iso) => {
    const date = new Date(iso);
    return `${formatBsDate(date)} · ${formatNepalTime(date)}`;
};

const bsStringToLabel = (bs) => {
    try { return new NepaliDate(bs).format('ddd, DD MMMM YYYY'); } catch { return bs; }
};

const timeToLabel = (time) => {
    if (!time) return '';
    const [h, m, s] = time.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return s !== undefined ? `${displayH}:${pad(m)}:${pad(s)} ${period}` : `${displayH}:${pad(m)} ${period}`;
};

const computeDueAt = (bs, time) => {
    const js = new NepaliDate(bs).toJsDate();
    const parts = (time || '00:00:00').split(':');
    const h = pad(parts[0] || 0);
    const m = pad(parts[1] || 0);
    const s = pad(parts[2] || 0);
    return `${js.getFullYear()}-${pad(js.getMonth() + 1)}-${pad(js.getDate())}T${h}:${m}:${s}${NP_OFFSET}`;
};

const extractBsDate = (arg) => {
    if (!arg) return null;
    if (typeof arg === 'string') {
        const match = /(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/.exec(arg);
        if (match) {
            const [, y, m, d] = match.map(Number);
            if (y < 2050) {
                try { return new NepaliDate(new Date(y, m - 1, d)).format('YYYY-MM-DD'); } catch { return null; }
            }
            return `${y}-${pad(m)}-${pad(d)}`;
        }
        return arg;
    }
    if (typeof arg === 'object') {
        if (arg.bsDate) return arg.bsDate;
        const y = arg.year || arg.y;
        const m = arg.month || arg.m;
        const d = arg.date || arg.day || arg.d;
        if (y && m && d) {
            return `${y}-${pad(m)}-${pad(d)}`;
        }
    }
    return null;
};

const getRemainingTimeText = (dueAt, now) => {
    const diff = new Date(dueAt).getTime() - now.getTime();
    if (diff <= 0) return 'Due / Started';
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h remaining`;
    if (hours > 0) return `${hours}h ${minutes % 60}m remaining`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s remaining`;
    return `${seconds}s remaining`;
};

/* ---- HTML sanitising --------------------------------------------- */
const ALLOWED_TAGS = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'DEL', 'UL', 'OL', 'LI', 'BR', 'DIV', 'P', 'SPAN', 'FONT', 'SUB', 'SUP']);
const ALLOWED_STYLE = new Set([
    'font-family', 'font-size', 'font-weight', 'font-style', 'font-variant', 'color', 'background-color',
    'background-image', 'background-clip', '-webkit-background-clip', 'text-shadow', 'text-transform',
    'letter-spacing', 'text-align', 'text-decoration', 'text-decoration-line',
    '-webkit-text-stroke', '-webkit-text-stroke-width', '-webkit-text-stroke-color'
]);

const cleanStyle = (style) => style.split(';').map(s => s.trim()).filter(Boolean).map(decl => {
    const i = decl.indexOf(':');
    if (i < 0) return null;
    const prop = decl.slice(0, i).trim().toLowerCase();
    const value = decl.slice(i + 1).trim();
    if (!ALLOWED_STYLE.has(prop) || /url\(|expression|javascript|@import/i.test(value)) return null;
    return `${prop}: ${value}`;
}).filter(Boolean).join('; ');

const sanitizeHtml = (html) => {
    const doc = new DOMParser().parseFromString(`<body>${html || ''}</body>`, 'text/html');
    const walk = (node) => {
        Array.from(node.childNodes).forEach(child => {
            if (child.nodeType === 1) {
                if (!ALLOWED_TAGS.has(child.tagName)) {
                    child.replaceWith(document.createTextNode(child.textContent || ''));
                    return;
                }
                const style = child.getAttribute('style');
                Array.from(child.attributes).forEach(attr => child.removeAttribute(attr.name));
                if (style) {
                    const cleaned = cleanStyle(style);
                    if (cleaned) child.setAttribute('style', cleaned);
                }
                walk(child);
            } else if (child.nodeType !== 3) {
                child.remove();
            }
        });
    };
    walk(doc.body);
    return doc.body.innerHTML;
};

const htmlToText = (html) => {
    const doc = new DOMParser().parseFromString(html || '', 'text/html');
    return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
};

/* ---- IndexedDB ---------------------------------------------------- */
const openDb = () => new Promise((resolve, reject) => {
    const req = indexedDB.open('nexus_dms_notes', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('files');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
});
const withStore = async (mode, fn) => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('files', mode);
        const req = fn(tx.objectStore('files'));
        tx.oncomplete = () => { db.close(); resolve(req?.result); };
        tx.onerror = () => { db.close(); reject(tx.error); };
    });
};
const putFile = (id, blob) => withStore('readwrite', s => s.put(blob, id));
const getFile = (id) => withStore('readonly', s => s.get(id));
const deleteFile = (id) => withStore('readwrite', s => s.delete(id));

const downloadBlob = (blob, name) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const useBlobUrl = (fileId, enabled = true) => {
    const [url, setUrl] = useState(null);
    useEffect(() => {
        if (!enabled) return undefined;
        let revoked = false;
        let objectUrl = null;
        getFile(fileId).then(blob => {
            if (blob && !revoked) {
                objectUrl = URL.createObjectURL(blob);
                setUrl(objectUrl);
            }
        }).catch(() => { });
        return () => { revoked = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
    }, [fileId, enabled]);
    return url;
};

/* ------------------------------------------------------------------ */
/* Smart-Positioned Date & Time Pickers for Scheduling Notes          */
/* ------------------------------------------------------------------ */
const useSmartPosition = (isOpen, triggerRef, popoverRef) => {
    const [position, setPosition] = useState('bottom');

    useEffect(() => {
        if (!isOpen || !triggerRef.current || !popoverRef.current) return;
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const popoverRect = popoverRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        const spaceBelow = viewportHeight - triggerRect.bottom;
        const spaceAbove = triggerRect.top;

        if (spaceBelow < popoverRect.height && spaceAbove > spaceBelow) {
            setPosition('top');
        } else {
            setPosition('bottom');
        }
    }, [isOpen, triggerRef, popoverRef]);

    return position;
};

const NepaliDatePickerUI = ({ value, onChange, placeholder = "Select Future Date" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef(null);
    const popoverRef = useRef(null);
    const position = useSmartPosition(isOpen, triggerRef, popoverRef);

    const todayBs = useMemo(() => toNepaliDate(new Date()), []);
    const selectedBs = useMemo(() => {
        if (!value) return null;
        try {
            const extracted = extractBsDate(value);
            return extracted ? new NepaliDate(extracted) : null;
        } catch {
            return null;
        }
    }, [value]);

    const [viewYear, setViewYear] = useState(() => (selectedBs ? selectedBs.getYear() : todayBs.getYear()));
    const [viewMonth, setViewMonth] = useState(() => (selectedBs ? selectedBs.getMonth() : todayBs.getMonth()));

    useEffect(() => {
        if (selectedBs) {
            setViewYear(selectedBs.getYear());
            setViewMonth(selectedBs.getMonth());
        }
    }, [selectedBs]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (triggerRef.current && !triggerRef.current.contains(e.target) &&
                popoverRef.current && !popoverRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const monthNames = [
        'Baishakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
        'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
    ];
    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const handlePrevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(v => v - 1);
        } else {
            setViewMonth(v => v - 1);
        }
    };

    const handleNextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(v => v + 1);
        } else {
            setViewMonth(v => v + 1);
        }
    };

    const daysInMonth = useMemo(() => {
        try {
            let count = 28;
            while (count <= 32) {
                try {
                    new NepaliDate(viewYear, viewMonth, count);
                    count++;
                } catch {
                    break;
                }
            }
            return count - 1;
        } catch {
            return 30;
        }
    }, [viewYear, viewMonth]);

    const startDayOfWeek = useMemo(() => {
        try {
            return new NepaliDate(viewYear, viewMonth, 1).toJsDate().getDay();
        } catch {
            return 0;
        }
    }, [viewYear, viewMonth]);

    const handleSelectDay = (day) => {
        const selected = new NepaliDate(viewYear, viewMonth, day);
        const todayJs = new Date();
        todayJs.setHours(0, 0, 0, 0);
        if (selected.toJsDate() < todayJs) return;

        const formatted = selected.format('YYYY-MM-DD');
        onChange(formatted);
        setIsOpen(false);
    };

    const isDayDisabled = (day) => {
        const date = new NepaliDate(viewYear, viewMonth, day).toJsDate();
        const todayJs = new Date();
        todayJs.setHours(0, 0, 0, 0);
        return date < todayJs;
    };

    const isDaySelected = (day) => {
        if (!selectedBs) return false;
        return selectedBs.getYear() === viewYear &&
            selectedBs.getMonth() === viewMonth &&
            selectedBs.getDate() === day;
    };

    const isToday = (day) => {
        return todayBs.getYear() === viewYear &&
            todayBs.getMonth() === viewMonth &&
            todayBs.getDate() === day;
    };

    return (
        <div className="relative w-full">
            <div
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                className="flex h-10 w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-800 transition-all duration-300 focus-within:ring-2 focus-within:ring-amber-500 hover:bg-white"
            >
                <span className={selectedBs ? 'font-bold text-slate-900' : 'font-extralight text-slate-400'}>
                    {selectedBs ? selectedBs.format('ddd, DD MMMM YYYY') : placeholder}
                </span>
                <CalendarIcon className="h-4 w-4 text-amber-600" />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={popoverRef}
                        initial={{ opacity: 0, scale: 0.95, y: position === 'top' ? 10 : -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute left-0 z-50 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}`}
                    >
                        <div className="mb-3 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={handlePrevMonth}
                                className="rounded-lg p-1 text-slate-600 hover:bg-slate-100 cursor-pointer"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="text-xs font-bold text-slate-800">
                                {monthNames[viewMonth]} {viewYear}
                            </span>
                            <button
                                type="button"
                                onClick={handleNextMonth}
                                className="rounded-lg p-1 text-slate-600 hover:bg-slate-100 cursor-pointer"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400">
                            {dayNames.map(d => <div key={d}>{d}</div>)}
                        </div>

                        <div className="mt-2 grid grid-cols-7 gap-1">
                            {Array.from({ length: startDayOfWeek }).map((_, i) => (
                                <div key={`empty-${i}`} />
                            ))}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const disabled = isDayDisabled(day);
                                const selected = isDaySelected(day);
                                const current = isToday(day);

                                return (
                                    <button
                                        key={day}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => handleSelectDay(day)}
                                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors ${selected
                                            ? `${GRADIENT} font-bold text-white`
                                            : current
                                                ? 'border border-amber-500 font-bold text-amber-600'
                                                : disabled
                                                    ? 'cursor-not-allowed opacity-30 text-slate-400'
                                                    : 'cursor-pointer text-slate-700 hover:bg-amber-50 hover:text-amber-600'
                                            }`}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const TimePickerUI = ({ value, onChange, placeholder = "Select Time" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef(null);
    const popoverRef = useRef(null);
    const position = useSmartPosition(isOpen, triggerRef, popoverRef);

    const parsedTime = useMemo(() => {
        if (!value) return { hours: 12, minutes: 0, seconds: 0, period: 'AM' };
        const parts = value.split(':');
        let h = parseInt(parts[0] || '0', 10);
        const m = parseInt(parts[1] || '0', 10);
        const s = parseInt(parts[2] || '0', 10);
        const period = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return { hours: h, minutes: m, seconds: s, period };
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (triggerRef.current && !triggerRef.current.contains(e.target) &&
                popoverRef.current && !popoverRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const updateTime = (h, m, s, p) => {
        let hour24 = h % 12;
        if (p === 'PM') hour24 += 12;
        const formatted = `${pad(hour24)}:${pad(m)}:${pad(s)}`;
        onChange(formatted);
    };

    return (
        <div className="relative w-full">
            <div
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                className="flex h-10 w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-800 transition-all duration-300 focus-within:ring-2 focus-within:ring-amber-500 hover:bg-white"
            >
                <span className={value ? 'font-bold text-slate-900' : 'font-extralight text-slate-400'}>
                    {value ? timeToLabel(value) : placeholder}
                </span>
                <Clock className="h-4 w-4 text-amber-600" />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={popoverRef}
                        initial={{ opacity: 0, scale: 0.95, y: position === 'top' ? 10 : -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute right-0 z-50 flex gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}`}
                    >
                        {/* Hours */}
                        <div className="flex flex-col items-center">
                            <span className="mb-1 text-[10px] font-bold text-slate-400">HH</span>
                            <div className="h-32 w-12 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50 p-1 text-center scrollbar-thin">
                                {Array.from({ length: 12 }).map((_, i) => {
                                    const h = i + 1;
                                    const active = parsedTime.hours === h;
                                    return (
                                        <button
                                            key={h}
                                            type="button"
                                            onClick={() => updateTime(h, parsedTime.minutes, parsedTime.seconds, parsedTime.period)}
                                            className={`w-full rounded py-1 text-xs font-medium transition-colors cursor-pointer ${active ? 'bg-amber-500 text-white font-bold' : 'hover:bg-amber-50 text-slate-700'}`}
                                        >
                                            {pad(h)}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Minutes */}
                        <div className="flex flex-col items-center">
                            <span className="mb-1 text-[10px] font-bold text-slate-400">MM</span>
                            <div className="h-32 w-12 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50 p-1 text-center scrollbar-thin">
                                {Array.from({ length: 60 }).map((_, m) => {
                                    const active = parsedTime.minutes === m;
                                    return (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => updateTime(parsedTime.hours, m, parsedTime.seconds, parsedTime.period)}
                                            className={`w-full rounded py-1 text-xs font-medium transition-colors cursor-pointer ${active ? 'bg-amber-500 text-white font-bold' : 'hover:bg-amber-50 text-slate-700'}`}
                                        >
                                            {pad(m)}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Seconds */}
                        <div className="flex flex-col items-center">
                            <span className="mb-1 text-[10px] font-bold text-slate-400">SS</span>
                            <div className="h-32 w-12 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50 p-1 text-center scrollbar-thin">
                                {Array.from({ length: 60 }).map((_, s) => {
                                    const active = parsedTime.seconds === s;
                                    return (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => updateTime(parsedTime.hours, parsedTime.minutes, s, parsedTime.period)}
                                            className={`w-full rounded py-1 text-xs font-medium transition-colors cursor-pointer ${active ? 'bg-amber-500 text-white font-bold' : 'hover:bg-amber-50 text-slate-700'}`}
                                        >
                                            {pad(s)}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* AM/PM */}
                        <div className="flex flex-col items-center">
                            <span className="mb-1 text-[10px] font-bold text-slate-400">AM/PM</span>
                            <div className="flex h-32 flex-col gap-1 rounded-lg border border-slate-100 bg-slate-50 p-1">
                                {['AM', 'PM'].map((p) => {
                                    const active = parsedTime.period === p;
                                    return (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => updateTime(parsedTime.hours, parsedTime.minutes, parsedTime.seconds, p)}
                                            className={`flex-1 rounded px-2 text-xs font-bold transition-colors cursor-pointer ${active ? 'bg-amber-500 text-white' : 'hover:bg-amber-50 text-slate-700'}`}
                                        >
                                            {p}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ------------------------------------------------------------------ */
/* Shared UI                                                          */
/* ------------------------------------------------------------------ */
const MotionButton = ({ className = '', disabled, children, ...props }) => (
    <motion.button
        type="button"
        variants={btnVariants}
        {...press(disabled)}
        transition={softSpring}
        disabled={disabled}
        className={`cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
    >
        {children}
    </motion.button>
);

const Skeleton = ({ className = '', style }) => (
    <motion.div
        aria-hidden="true"
        style={style}
        className={`rounded-md bg-slate-200 ${className}`}
        animate={{ opacity: [0.45, 0.9, 0.45] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
    />
);

const NoteListSkeleton = () => (
    <div className="space-y-2 p-3" aria-hidden="true">
        {[0, 1, 2, 3].map(i => (
            <div key={i} className="space-y-2 rounded-xl border border-slate-200 p-3">
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-2.5 w-full" />
                <Skeleton className="h-2.5 w-1/2" />
            </div>
        ))}
    </div>
);

const EditorSkeleton = () => (
    <div className="space-y-4 p-5" aria-hidden="true">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
    </div>
);

const ProgressBar = ({ value, complete, label }) => (
    <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
    >
        <motion.div
            className={`h-full rounded-full ${complete ? 'bg-emerald-500' : GRADIENT}`}
            initial={false}
            animate={{ width: `${value}%` }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
        />
    </div>
);

const InlineMessage = ({ children, tone = 'error' }) => (
    <AnimatePresence initial={false}>
        {children && (
            <motion.p
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                transition={{ duration: 0.3, ease: EASE_OUT }}
                className={`mt-2 overflow-hidden rounded-lg px-3 py-2 text-xs font-medium ${tone === 'error' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-800'}`}
                role="alert"
            >
                {children}
            </motion.p>
        )}
    </AnimatePresence>
);

const modalPanel = {
    initial: { opacity: 0, y: 22, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE_OUT } },
    exit: { opacity: 0, y: 12, scale: 0.98, transition: { duration: 0.25, ease: EASE_OUT } },
};

const Modal = ({ onClose, children }) => {
    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={onClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE_OUT }}
            />
            {children}
        </div>
    );
};

/* ------------------------------------------------------------------ */
/* Attachments                                                         */
/* ------------------------------------------------------------------ */
const AttachmentCard = ({ attachment, onOpen, onRemove }) => {
    const { Icon, color } = getFileIcon(attachment.name);
    const image = isImage(attachment.name);
    const thumb = useBlobUrl(attachment.id, image);
    return (
        <motion.li
            layout
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.25, ease: EASE_OUT } }}
            className="group flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5 transition-colors duration-300 hover:border-amber-400"
        >
            <button type="button" onClick={() => onOpen(attachment)} className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-left">
                {image && thumb ? (
                    <img src={thumb} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-slate-200" />
                ) : image ? (
                    <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
                ) : (
                    <div className={`shrink-0 rounded-lg bg-slate-100 p-2.5 transition-colors duration-300 group-hover:bg-amber-50 ${color}`}>
                        <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                )}
                <span className="min-w-0">
                    <span className="block truncate text-xs font-bold text-slate-800 transition-colors duration-300 group-hover:text-amber-600">{attachment.name}</span>
                    <span className="block text-[10px] font-extralight text-slate-500">{formatFileSize(attachment.size)} · {getExt(attachment.name).toUpperCase()}</span>
                </span>
            </button>
            <MotionButton
                onClick={() => onRemove(attachment)}
                aria-label={`Remove ${attachment.name}`}
                className="rounded-lg px-2 py-1 text-[10px] font-medium text-slate-600 transition-colors duration-300 hover:bg-slate-100 hover:text-red-600 cursor-pointer"
            >
                Remove
            </MotionButton>
        </motion.li>
    );
};

const PreviewModal = ({ attachment, onClose }) => {
    const image = isImage(attachment.name);
    const isText = getExt(attachment.name) === 'txt';
    const url = useBlobUrl(attachment.id, image);
    const [text, setText] = useState(null);
    const { Icon, color } = getFileIcon(attachment.name);

    useEffect(() => {
        if (!isText) return;
        getFile(attachment.id).then(blob => blob?.text()).then(t => setText((t || '').slice(0, 8000))).catch(() => setText('Could not read this file.'));
    }, [attachment.id, isText]);

    const handleDownload = async () => {
        const blob = await getFile(attachment.id);
        if (blob) downloadBlob(blob, attachment.name);
    };

    return (
        <Modal onClose={onClose}>
            <motion.div {...modalPanel} className="relative max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-2xl bg-white p-5 sm:p-6">
                <h3 className="pr-8 text-base font-bold text-slate-900">{attachment.name}</h3>
                <p className="-mt-3 text-xs font-extralight text-slate-500">{formatFileSize(attachment.size)}</p>
                {image ? (
                    url ? <img src={url} alt={attachment.name} className="max-h-[60vh] w-full rounded-xl border border-slate-200 object-contain" /> : <Skeleton className="h-64 w-full rounded-xl" />
                ) : isText ? (
                    text === null ? <Skeleton className="h-40 w-full rounded-xl" /> : (
                        <pre className="max-h-[50vh] overflow-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs font-medium text-slate-700">{text}</pre>
                    )
                ) : (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                        <Icon className={`h-10 w-10 ${color}`} aria-hidden="true" />
                        <p className="text-xs font-extralight text-slate-500">Preview isn’t available for this file type. Download it to open it.</p>
                    </div>
                )}
                <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
                    <MotionButton onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-medium transition-colors duration-300 hover:bg-slate-50 sm:py-2">Close</MotionButton>
                    <MotionButton onClick={handleDownload} className={`rounded-xl px-4 py-2.5 text-xs font-bold text-white sm:py-2 ${GRADIENT}`}>Download</MotionButton>
                </div>
            </motion.div>
        </Modal>
    );
};

/* ------------------------------------------------------------------ */
/* Schedule helpers                                                    */
/* ------------------------------------------------------------------ */
const scheduleStatus = (dueAt, done, now) => {
    if (done) return { key: 'done', label: 'Done', cls: 'bg-emerald-100 text-emerald-700' };
    const diff = new Date(dueAt).getTime() - now.getTime();
    if (diff < 0) return { key: 'overdue', label: 'Due / Ended', cls: 'bg-red-100 text-red-600' };
    if (diff < 3600000) return { key: 'soon', label: 'Due soon', cls: 'bg-amber-100 text-amber-700' };
    return { key: 'upcoming', label: 'Upcoming', cls: 'bg-slate-100 text-slate-600' };
};

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */
export default function NotesScheduler() {
    const [view, setView] = useState('notes');
    const [isLoading, setIsLoading] = useState(true);
    const [now, setNow] = useState(() => new Date());
    const [search, setSearch] = useState('');
    const [showEditorMobile, setShowEditorMobile] = useState(false);

    // Simulated API Action Loading States
    const [isCreatingNote, setIsCreatingNote] = useState(false);
    const [isUpdatingNote, setIsUpdatingNote] = useState(false);

    const [notes, setNotes] = useState(() => {
        try {
            const stored = localStorage.getItem(NOTES_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });
    const [activeId, setActiveId] = useState(null);
    const [savedAt, setSavedAt] = useState(null);
    const [formattingState, setFormattingState] = useState({});
    const [styleHint, setStyleHint] = useState(null);

    // Explicit Draft Editing State (Nothing saves/updates until you click the Save button)
    const [draftTitle, setDraftTitle] = useState('');
    const [draftContent, setDraftContent] = useState('');
    const [draftIsScheduled, setDraftIsScheduled] = useState(false);
    const [draftScheduleDate, setDraftScheduleDate] = useState(null);
    const [draftScheduleTime, setDraftScheduleTime] = useState(null);
    const [draftDueAt, setDraftDueAt] = useState(null);

    const [uploads, setUploads] = useState([]);
    const [uploadError, setUploadError] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [previewAttachment, setPreviewAttachment] = useState(null);

    const [schedError, setSchedError] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    // Multiple note & schedule selection state
    const [selectedNoteIds, setSelectedNoteIds] = useState([]);
    const [selectedScheduleIds, setSelectedScheduleIds] = useState([]);

    const [toasts, setToasts] = useState([]);

    const editorRef = useRef(null);
    const titleRef = useRef(null);
    const savedRange = useRef(null);
    const activeIdRef = useRef(null);
    const fileInputRef = useRef(null);
    activeIdRef.current = activeId;

    const activeNote = notes.find(n => n.id === activeId) || null;

    useEffect(() => {
        const t = setTimeout(() => setIsLoading(false), 700);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        const id = 'notes-scheduler-fonts';
        if (document.getElementById(id)) return;
        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@200;400;600;700&family=Noto+Sans+Devanagari:wght@300;400;700&family=Merriweather:wght@300;400;700&family=Playfair+Display:wght@400;700&family=Roboto+Mono:wght@300;400;700&family=Caveat:wght@400;700&display=swap';
        document.head.appendChild(link);
    }, []);

    // 1-second interval for real-time remaining countdowns and precise milestone alerts
    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        try { localStorage.setItem(NOTES_KEY, JSON.stringify(notes)); } catch { }
    }, [notes]);

    const pushToast = (message) => {
        const id = uid();
        setToasts(prev => [...prev, { id, message }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 7000);
    };

    // 30, 15, 5 minute notifications + due/after-start notification
    useEffect(() => {
        const currentTime = now.getTime();
        setNotes(prevNotes => {
            let updated = false;
            const newNotes = prevNotes.map(n => {
                if (!n.isScheduled || !n.dueAt || n.done) return n;
                const dueTime = new Date(n.dueAt).getTime();
                const diffMs = dueTime - currentTime;

                let n30 = n.notified30;
                let n15 = n.notified15;
                let n5 = n.notified5;
                let nDue = n.notifiedDue || n.notified;

                if (!n30 && diffMs <= 30 * 60 * 1000 && diffMs > 15 * 60 * 1000) {
                    n30 = true;
                    pushToast(`🔔 30m Reminder: ${n.title || 'Scheduled Note'} starts at ${timeToLabel(n.scheduleTime)}`);
                    updated = true;
                }
                if (!n15 && diffMs <= 15 * 60 * 1000 && diffMs > 5 * 60 * 1000) {
                    n15 = true;
                    n30 = true;
                    pushToast(`🔔 15m Reminder: ${n.title || 'Scheduled Note'} starts soon!`);
                    updated = true;
                }
                if (!n5 && diffMs <= 5 * 60 * 1000 && diffMs > 0) {
                    n5 = true;
                    n15 = true;
                    n30 = true;
                    pushToast(`🔔 5m Reminder: ${n.title || 'Scheduled Note'} is about to begin!`);
                    updated = true;
                }
                if (!nDue && diffMs <= 0) {
                    nDue = true;
                    n5 = true;
                    n15 = true;
                    n30 = true;
                    pushToast(`⏰ Event Started / Due: ${n.title || 'Scheduled Note'}`);
                    updated = true;
                }

                if (n30 !== n.notified30 || n15 !== n.notified15 || n5 !== n.notified5 || nDue !== (n.notifiedDue || n.notified)) {
                    return { ...n, notified30: n30, notified15: n15, notified5: n5, notifiedDue: nDue, notified: nDue };
                }
                return n;
            });
            return updated ? newNotes : prevNotes;
        });
    }, [now]);

    /* ---- Sync Draft State when Active Note changes -------------------- */
    useEffect(() => {
        if (activeNote) {
            setDraftTitle(activeNote.title || '');
            setDraftContent(activeNote.content || '');
            setDraftIsScheduled(Boolean(activeNote.isScheduled));
            setDraftScheduleDate(activeNote.scheduleDate || null);
            setDraftScheduleTime(activeNote.scheduleTime || null);
            setDraftDueAt(activeNote.dueAt || null);
            if (editorRef.current) {
                editorRef.current.innerHTML = sanitizeHtml(activeNote.content || '');
            }
            setSavedAt(new Date(activeNote.updatedAt));
        } else {
            setDraftTitle('');
            setDraftContent('');
            setDraftIsScheduled(false);
            setDraftScheduleDate(null);
            setDraftScheduleTime(null);
            setDraftDueAt(null);
            if (editorRef.current) editorRef.current.innerHTML = '';
            setSavedAt(null);
        }
        setUploadError(null);
        setSchedError(null);
    }, [activeId]);

    const readFormatting = () => {
        try {
            setFormattingState(Object.fromEntries(QUERY_COMMANDS.map(c => [c, document.queryCommandState(c)])));
        } catch { }
    };

    useEffect(() => {
        const onSelectionChange = () => {
            const editor = editorRef.current;
            const sel = document.getSelection();
            if (!editor || !sel?.rangeCount || !editor.contains(sel.anchorNode)) return;
            savedRange.current = sel.getRangeAt(0).cloneRange();
            readFormatting();
        };
        document.addEventListener('selectionchange', onSelectionChange);
        return () => document.removeEventListener('selectionchange', onSelectionChange);
    }, []);

    const restoreSelection = () => {
        const editor = editorRef.current;
        if (!editor) return false;
        editor.focus();
        if (savedRange.current) {
            const sel = document.getSelection();
            sel.removeAllRanges();
            sel.addRange(savedRange.current);
        }
        return true;
    };

    const exec = (command, value = null) => {
        if (!restoreSelection()) return;
        document.execCommand('styleWithCSS', false, true);
        document.execCommand(command, false, value);
        readFormatting();
        if (editorRef.current) {
            setDraftContent(sanitizeHtml(editorRef.current.innerHTML));
        }
    };

    const wrapSelection = (styles) => {
        if (!restoreSelection()) return;
        const sel = document.getSelection();
        if (!sel.rangeCount || sel.isCollapsed) {
            setStyleHint('Select some text first, then apply the style.');
            setTimeout(() => setStyleHint(null), 2500);
            return;
        }
        const range = sel.getRangeAt(0);
        const span = document.createElement('span');
        Object.entries(styles).forEach(([prop, value]) => span.style.setProperty(prop, value));
        span.appendChild(range.extractContents());
        range.insertNode(span);
        sel.removeAllRanges();
        const next = document.createRange();
        next.selectNodeContents(span);
        sel.addRange(next);
        savedRange.current = next.cloneRange();
        if (editorRef.current) {
            setDraftContent(sanitizeHtml(editorRef.current.innerHTML));
        }
    };

    const selectNote = (id) => {
        setActiveId(id);
        setShowEditorMobile(true);
    };

    /* ---- 1. EXPLICIT NOTE CREATION BUTTON ACTION (Only adds after API loading) --- */
    const createNote = async (isScheduledMode = false) => {
        setIsCreatingNote(true);

        // Simulated API network loading delay
        await new Promise(resolve => setTimeout(resolve, 650));

        const nowIso = new Date().toISOString();
        const note = {
            id: uid(),
            title: '',
            content: '',
            createdAt: nowIso,
            updatedAt: nowIso,
            attachments: [],
            isScheduled: isScheduledMode,
            scheduleDate: null,
            scheduleTime: null,
            dueAt: null,
            done: false,
            notified: false,
            notified30: false,
            notified15: false,
            notified5: false,
            notifiedDue: false,
            schedules: []
        };

        // Note is added to state ONLY after API loading resolves
        setNotes(prev => [note, ...prev]);
        setView('notes');
        setActiveId(note.id);
        setShowEditorMobile(true);
        setSearch('');
        setIsCreatingNote(false);

        setTimeout(() => titleRef.current?.focus(), 350);
    };

    /* ---- 2. EXPLICIT NOTE UPDATE BUTTON ACTION (Only updates when button is clicked) --- */
    const handleExplicitUpdate = async () => {
        if (!activeNote) return;
        setIsUpdatingNote(true);

        // Simulated API network loading delay
        await new Promise(resolve => setTimeout(resolve, 600));

        const updatedContent = editorRef.current ? sanitizeHtml(editorRef.current.innerHTML) : draftContent;

        setNotes(prev => prev.map(n => n.id === activeNote.id ? {
            ...n,
            title: draftTitle,
            content: updatedContent,
            isScheduled: draftIsScheduled,
            scheduleDate: draftScheduleDate,
            scheduleTime: draftScheduleTime,
            dueAt: draftDueAt,
            updatedAt: new Date().toISOString()
        } : n));

        setSavedAt(new Date());
        setIsUpdatingNote(false);
        pushToast(`💾 Successfully saved: "${draftTitle || 'Untitled Note'}"`);
    };

    const deleteNote = async (id) => {
        const note = notes.find(n => n.id === id);
        await Promise.all((note?.attachments || []).map(a => deleteFile(a.id).catch(() => { })));
        setNotes(prev => prev.filter(n => n.id !== id));
        if (activeIdRef.current === id) { setActiveId(null); setShowEditorMobile(false); }
        setConfirmDeleteId(null);
        setSelectedNoteIds(prev => prev.filter(i => i !== id));
    };

    const deleteSelectedNotes = async () => {
        if (selectedNoteIds.length === 0) return;
        const notesToDelete = notes.filter(n => selectedNoteIds.includes(n.id));
        for (const note of notesToDelete) {
            await Promise.all((note?.attachments || []).map(a => deleteFile(a.id).catch(() => { })));
        }

        setNotes(prev => prev.filter(n => !selectedNoteIds.includes(n.id)));
        if (selectedNoteIds.includes(activeIdRef.current)) {
            setActiveId(null);
            setShowEditorMobile(false);
        }
        setSelectedNoteIds([]);
    };

    const toggleSelectNote = (id) => {
        setSelectedNoteIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAllNotes = () => {
        if (selectedNoteIds.length === visibleNotes.length) {
            setSelectedNoteIds([]);
        } else {
            setSelectedNoteIds(visibleNotes.map(n => n.id));
        }
    };

    const startUpload = (files) => {
        const noteId = activeIdRef.current;
        if (!noteId) return;
        const currentCount = activeNote?.attachments?.length || 0;
        if (currentCount + files.length > MAX_ATTACHMENTS) {
            setUploadError(`Maximum limit of ${MAX_ATTACHMENTS} attachments reached.`);
            return;
        }

        const errors = [];
        const valid = [];
        files.forEach(file => {
            if (file.size > MAX_UPLOAD_SIZE) errors.push(`${file.name} exceeds the 50 MB limit.`);
            else if (!ALLOWED_EXT.includes(getExt(file.name))) errors.push(`${file.name} isn’t a supported type.`);
            else valid.push(file);
        });
        setUploadError(errors.length ? errors.join(' ') : null);

        valid.forEach(file => {
            const id = uid();
            setUploads(prev => [...prev, { id, name: file.name, size: file.size, progress: 0 }]);
            const reader = new FileReader();
            reader.onprogress = (e) => {
                if (!e.lengthComputable) return;
                const progress = Math.min(99, Math.round((e.loaded / e.total) * 100));
                setUploads(prev => prev.map(u => (u.id === id ? { ...u, progress } : u)));
            };
            reader.onerror = () => {
                setUploads(prev => prev.filter(u => u.id !== id));
                setUploadError(`Could not read ${file.name}.`);
            };
            reader.onload = async () => {
                try {
                    await putFile(id, new Blob([reader.result], { type: file.type || 'application/octet-stream' }));
                    setNotes(prev => prev.map(n => (n.id === noteId
                        ? { ...n, updatedAt: new Date().toISOString(), attachments: [...n.attachments, { id, name: file.name, size: file.size, mime: file.type }] }
                        : n)));
                    setUploads(prev => prev.map(u => (u.id === id ? { ...u, progress: 100 } : u)));
                    setTimeout(() => setUploads(prev => prev.filter(u => u.id !== id)), 700);
                } catch {
                    setUploads(prev => prev.filter(u => u.id !== id));
                    setUploadError(`Could not save ${file.name}. Storage may be full.`);
                }
            };
            reader.readAsArrayBuffer(file);
        });
    };

    const removeAttachment = async (attachment) => {
        await deleteFile(attachment.id).catch(() => { });
        if (!activeNote) return;
        setNotes(prev => prev.map(n => n.id === activeNote.id ? { ...n, attachments: n.attachments.filter(a => a.id !== attachment.id) } : n));
    };

    /* ---- Scheduling Handlers (Draft) ----------------------------------- */
    const handleScheduleDateChange = (date) => {
        const bsDate = extractBsDate(date);
        if (!bsDate) {
            setSchedError("Pick a valid future Nepali date.");
            return;
        }
        let dueAt = draftDueAt;
        if (draftScheduleTime) {
            try {
                dueAt = computeDueAt(bsDate, draftScheduleTime);
                if (new Date(dueAt) <= new Date()) {
                    setSchedError("Choose a future time (Nepal time).");
                    return;
                }
            } catch {
                setSchedError("Invalid date/time combination.");
                return;
            }
        }
        setSchedError(null);
        setDraftScheduleDate(bsDate);
        setDraftDueAt(dueAt);
    };

    const handleScheduleTimeChange = (time) => {
        if (!draftScheduleDate) {
            setSchedError("Please select a Nepali date first.");
            return;
        }
        let dueAt;
        try {
            dueAt = computeDueAt(draftScheduleDate, time);
            if (new Date(dueAt) <= new Date()) {
                setSchedError("Choose a time in the future (Nepal time).");
                return;
            }
        } catch {
            setSchedError("Invalid time format.");
            return;
        }
        setSchedError(null);
        setDraftScheduleTime(time);
        setDraftDueAt(dueAt);
    };

    const toggleDraftScheduledMode = (isScheduled) => {
        setDraftIsScheduled(isScheduled);
        if (!isScheduled) {
            setDraftScheduleDate(null);
            setDraftScheduleTime(null);
            setDraftDueAt(null);
        }
    };

    const toggleNoteDone = (noteId) => {
        const note = notes.find(n => n.id === noteId);
        if (!note) return;
        setNotes(prev => prev.map(n => n.id === noteId ? { ...n, done: !note.done, updatedAt: new Date().toISOString() } : n));
    };

    const removeNoteSchedule = (noteId) => {
        setNotes(prev => prev.map(n => n.id === noteId ? { ...n, isScheduled: false, scheduleDate: null, scheduleTime: null, dueAt: null, done: false, updatedAt: new Date().toISOString() } : n));
    };

    const toggleSelectSchedule = (scheduleId) => {
        setSelectedScheduleIds(prev =>
            prev.includes(scheduleId) ? prev.filter(id => id !== scheduleId) : [...prev, scheduleId]
        );
    };

    const deleteSelectedSchedules = () => {
        if (selectedScheduleIds.length === 0) return;
        setNotes(prev => prev.map(n => {
            if (selectedScheduleIds.includes(n.id)) {
                return { ...n, isScheduled: false, scheduleDate: null, scheduleTime: null, dueAt: null };
            }
            return {
                ...n,
                schedules: (n.schedules || []).filter(s => !selectedScheduleIds.includes(s.id))
            };
        }));
        setSelectedScheduleIds([]);
    };

    const visibleNotes = useMemo(() => {
        const q = search.trim().toLowerCase();
        return [...notes]
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .filter(n => !q || `${n.title} ${htmlToText(n.content)}`.toLowerCase().includes(q));
    }, [notes, search]);

    const allSchedules = useMemo(() => {
        const list = [];
        notes.forEach(n => {
            if (n.isScheduled && n.dueAt) {
                list.push({
                    id: n.id,
                    noteId: n.id,
                    label: n.title || 'Scheduling Note',
                    bsDate: n.scheduleDate,
                    time: n.scheduleTime || '00:00:00',
                    dueAt: n.dueAt,
                    done: n.done,
                    noteTitle: n.title || 'Untitled note',
                    isMainSchedule: true
                });
            }
            (n.schedules || []).forEach(s => {
                list.push({ ...s, noteId: n.id, noteTitle: n.title || 'Untitled note' });
            });
        });
        return list.sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));
    }, [notes]);

    const pendingCount = allSchedules.filter(s => !s.done).length;

    return (
        <div className="flex min-h-screen flex-col bg-white font-sans text-slate-800">
            <header className="sticky top-0 z-35 border-b border-slate-200 bg-white">
                <div className="mx-auto flex min-h-16 w-full flex-wrap items-center justify-between gap-3 py-2 px-4">
                    <div className="flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
                        {[{ id: 'notes', label: 'Notes' }, { id: 'schedule', label: `Schedule${pendingCount ? ` (${pendingCount})` : ''}` }].map(tab => {
                            const active = view === tab.id;
                            return (
                                <MotionButton
                                    key={tab.id}
                                    onClick={() => setView(tab.id)}
                                    aria-pressed={active}
                                    className={`relative whitespace-nowrap rounded-lg px-3 py-1.5 text-xs transition-colors duration-300 ${active ? 'font-bold text-white' : 'font-medium text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'}`}
                                >
                                    {active && <motion.span layoutId="notes-view-pill" className={`absolute inset-0 rounded-lg ${GRADIENT}`} transition={softSpring} />}
                                    <span className="relative">{tab.label}</span>
                                </MotionButton>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden text-right sm:block" title="Current Nepal date and time">
                            <p className="text-xs font-bold text-slate-800">{formatBsDate(now)}</p>
                            <p className="text-[10px] font-extralight text-slate-500">{formatNepalTime(now)} · Nepal Time</p>
                        </div>
                        <MotionButton
                            onClick={() => createNote(false)}
                            disabled={isCreatingNote}
                            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white ${GRADIENT}`}
                        >
                            {isCreatingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : <NoteIcon className="h-4 w-4" />}
                            <span>{isCreatingNote ? 'Creating...' : 'New Note'}</span>
                        </MotionButton>
                        <MotionButton
                            onClick={() => createNote(true)}
                            disabled={isCreatingNote}
                            className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors"
                        >
                            {isCreatingNote ? <Loader2 className="h-4 w-4 animate-spin text-amber-600" /> : <Clock className="h-4 w-4 text-amber-600" />}
                            <span>{isCreatingNote ? 'Creating...' : 'New Scheduled Note'}</span>
                        </MotionButton>
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full flex-1 mt-3">
                {view === 'notes' ? (
                    <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[320px_1fr]">
                        <div className={`${showEditorMobile ? 'hidden md:flex' : 'flex'} h-[80vh] min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white xl:h-[85vh]`}>
                            <div className="border-b border-slate-100 p-3 space-y-2">
                                <div className="relative">
                                    <svg className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    <input
                                        type="search"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder="Search notes..."
                                        aria-label="Search notes"
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs font-medium transition-all duration-300 placeholder:font-extralight focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                                {visibleNotes.length > 0 && (
                                    <div className="flex items-center justify-between px-1 text-[11px]">
                                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 font-medium">
                                            <input
                                                type="checkbox"
                                                checked={selectedNoteIds.length === visibleNotes.length && visibleNotes.length > 0}
                                                onChange={toggleSelectAllNotes}
                                                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                                            />
                                            <span>Select all</span>
                                        </label>
                                        {selectedNoteIds.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={deleteSelectedNotes}
                                                className="font-bold text-red-600 hover:underline cursor-pointer"
                                            >
                                                Delete ({selectedNoteIds.length})
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="min-h-0 flex-1 overflow-y-auto">
                                {isLoading ? <NoteListSkeleton /> : (
                                    <motion.ul variants={listStagger} initial="hidden" animate="show" className="space-y-2 p-3">
                                        {visibleNotes.length === 0 && (
                                            <li className="py-10 text-center text-xs font-extralight text-slate-500">
                                                {notes.length === 0 ? 'No notes yet. Create your first note.' : 'No notes match your search.'}
                                            </li>
                                        )}
                                        <AnimatePresence initial={false}>
                                            {visibleNotes.map(note => {
                                                const active = note.id === activeId;
                                                const isSelected = selectedNoteIds.includes(note.id);
                                                return (
                                                    <motion.li key={note.id} variants={fadeUp} exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.25 } }} className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => toggleSelectNote(note.id)}
                                                            aria-label={`Select ${note.title || 'Untitled note'}`}
                                                            className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 shrink-0 ml-1 cursor-pointer"
                                                        />
                                                        <motion.button
                                                            type="button"
                                                            onClick={() => selectNote(note.id)}
                                                            whileHover={{ y: -2 }}
                                                            transition={softSpring}
                                                            className={`w-full cursor-pointer rounded-xl border p-3 text-left transition-colors duration-300 ${active ? 'border-amber-400 bg-amber-50/40' : 'border-slate-200 bg-white hover:border-amber-400'}`}
                                                        >
                                                            <span className="flex items-center justify-between gap-2">
                                                                <span className={`truncate text-xs font-bold ${active ? 'text-amber-700' : 'text-slate-800'}`}>
                                                                    {note.title || 'Untitled note'}
                                                                </span>
                                                                {note.isScheduled && note.dueAt && (
                                                                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                                                        ⏳ {getRemainingTimeText(note.dueAt, now)}
                                                                    </span>
                                                                )}
                                                            </span>
                                                            <span className="mt-1 line-clamp-2 block text-[11px] font-medium text-slate-500">{htmlToText(note.content) || 'No content'}</span>
                                                            <span className="mt-1.5 flex items-center justify-between text-[10px] font-extralight text-slate-500">
                                                                <span>{formatBsStamp(note.updatedAt)}</span>
                                                                {note.attachments?.length > 0 && <span>📎 {note.attachments.length}</span>}
                                                            </span>
                                                        </motion.button>
                                                    </motion.li>
                                                );
                                            })}
                                        </AnimatePresence>
                                    </motion.ul>
                                )}
                            </div>
                        </div>

                        <div className={`${showEditorMobile ? 'flex' : 'hidden md:flex'} h-[80vh] min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white xl:h-[85vh]`}>
                            {isLoading ? <EditorSkeleton /> : !activeNote ? (
                                <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
                                    <div className="rounded-2xl bg-amber-50 p-4 text-amber-600">
                                        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900">Select or create a note</h3>
                                    <p className="max-w-xs text-xs font-extralight text-slate-500">Choose between Non-Scheduling and Scheduling modes, attach files, and format your thoughts.</p>
                                    <div className="flex gap-2">
                                        <MotionButton onClick={() => createNote(false)} disabled={isCreatingNote} className={`rounded-xl px-4 py-2 text-xs font-bold text-white ${GRADIENT}`}>
                                            {isCreatingNote ? 'Creating...' : 'New Note'}
                                        </MotionButton>
                                        <MotionButton onClick={() => createNote(true)} disabled={isCreatingNote} className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100">
                                            {isCreatingNote ? 'Creating...' : 'New Scheduled Note'}
                                        </MotionButton>
                                    </div>
                                </motion.div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <MotionButton onClick={() => setShowEditorMobile(false)} aria-label="Back to notes" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 md:hidden cursor-pointer">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                            </MotionButton>
                                            <div className="min-w-0 text-[10px] font-extralight text-slate-500">
                                                <p className="truncate">Created {formatBsStamp(activeNote.createdAt)}</p>
                                                <p className="truncate">
                                                    {savedAt ? `Last saved ${formatNepalTime(savedAt)}` : 'Unsaved draft'}
                                                    {' · '}Edited {formatBsStamp(activeNote.updatedAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* Explicit Save/Update Button */}
                                            <MotionButton
                                                onClick={handleExplicitUpdate}
                                                disabled={isUpdatingNote}
                                                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-white ${GRADIENT}`}
                                            >
                                                {isUpdatingNote ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                                                <span>{isUpdatingNote ? 'Saving...' : 'Save Note'}</span>
                                            </MotionButton>

                                            {/* Mode Selector Toggle */}
                                            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1">
                                                <button
                                                    type="button"
                                                    disabled={isUpdatingNote}
                                                    onClick={() => toggleDraftScheduledMode(false)}
                                                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer ${!draftIsScheduled ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                                                >
                                                    Non-Scheduling Note
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={isUpdatingNote}
                                                    onClick={() => toggleDraftScheduledMode(true)}
                                                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer ${draftIsScheduled ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                                                >
                                                    Scheduling Note
                                                </button>
                                            </div>

                                            <AnimatePresence mode="wait" initial={false}>
                                                {confirmDeleteId === activeNote.id ? (
                                                    <motion.div key="confirm" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="flex items-center gap-1">
                                                        <MotionButton onClick={() => deleteNote(activeNote.id)} className="rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white cursor-pointer">Delete</MotionButton>
                                                        <MotionButton onClick={() => setConfirmDeleteId(null)} className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 cursor-pointer">Cancel</MotionButton>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div key="delete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                        <MotionButton onClick={() => setConfirmDeleteId(activeNote.id)} aria-label="Delete note" title="Delete note" className="rounded-lg p-2 text-slate-400 transition-colors duration-300 hover:bg-slate-100 hover:text-red-600 cursor-pointer">
                                                            <motion.svg variants={iconVariants} transition={softSpring} className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></motion.svg>
                                                        </MotionButton>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    <div className="min-h-0 flex-1 overflow-y-auto">
                                        <motion.div key={activeNote.id} variants={stagger} initial="hidden" animate="show" className="space-y-5 p-4 sm:p-5">
                                            <motion.div variants={fadeUp}>
                                                <input
                                                    ref={titleRef}
                                                    value={draftTitle}
                                                    onChange={e => setDraftTitle(e.target.value)}
                                                    placeholder="Note title (required)"
                                                    aria-label="Note title"
                                                    className="w-full border-b border-transparent bg-transparent pb-1 text-xl font-bold text-slate-900 transition-colors duration-300 placeholder:font-extralight placeholder:text-slate-300 focus:border-amber-400 focus:outline-none"
                                                />
                                            </motion.div>

                                            {/* Scheduling Fields (ONLY shown in Scheduling Note mode) */}
                                            <AnimatePresence>
                                                {draftIsScheduled && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 space-y-3"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                                                                <Clock className="h-3.5 w-3.5 text-amber-600" />
                                                                <span>Schedule Details & Countdown</span>
                                                            </h4>
                                                            <span className="text-[10px] font-extralight text-slate-500">Nepal Time (UTC+5:45)</span>
                                                        </div>

                                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                            <div>
                                                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Nepali Future Date (BS)</label>
                                                                <NepaliDatePickerUI
                                                                    value={draftScheduleDate}
                                                                    onChange={handleScheduleDateChange}
                                                                    placeholder="Select future date"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Time (HH:MM:SS 12-Hour)</label>
                                                                <TimePickerUI
                                                                    value={draftScheduleTime}
                                                                    onChange={handleScheduleTimeChange}
                                                                    placeholder="Select 12-hour time"
                                                                />
                                                            </div>
                                                        </div>
                                                        {draftDueAt && (
                                                            <div className="rounded-lg bg-amber-100/60 px-3 py-2 text-xs font-bold text-amber-900 flex items-center justify-between">
                                                                <span>⏳ Time remaining to start:</span>
                                                                <span className="font-mono text-amber-700">{getRemainingTimeText(draftDueAt, now)}</span>
                                                            </div>
                                                        )}
                                                        <InlineMessage>{schedError}</InlineMessage>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            <motion.div variants={fadeUp}>
                                                <div
                                                    onDragEnter={e => { e.preventDefault(); setIsDragging(true); }}
                                                    onDragOver={e => e.preventDefault()}
                                                    onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false); }}
                                                    onDrop={e => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.length) startUpload(Array.from(e.dataTransfer.files)); }}
                                                    className={`relative overflow-hidden rounded-xl border bg-white transition-shadow duration-300 focus-within:ring-2 focus-within:ring-amber-500 ${isDragging ? 'border-amber-500 ring-2 ring-amber-400/60' : 'border-slate-200'}`}
                                                >
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        multiple
                                                        accept={ACCEPT}
                                                        onChange={e => { const files = Array.from(e.target.files || []); if (files.length) startUpload(files); e.target.value = ''; }}
                                                        className="sr-only"
                                                        tabIndex={-1}
                                                    />
                                                    <AnimatePresence>
                                                        {isDragging && (
                                                            <motion.div
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                exit={{ opacity: 0 }}
                                                                transition={{ duration: 0.2 }}
                                                                className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-amber-50/90"
                                                            >
                                                                <p className="text-xs font-bold text-amber-700">Drop files to attach to this note</p>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                    <div className="space-y-2 border-b border-slate-200 bg-slate-50 p-2" role="toolbar" aria-label="Text formatting">
                                                        <div className="flex flex-wrap items-center gap-1">
                                                            <select
                                                                defaultValue=""
                                                                aria-label="Font style"
                                                                onChange={e => { const f = FONT_FAMILIES[Number(e.target.value)]; if (f) wrapSelection({ 'font-family': f.css }); e.target.value = ''; }}
                                                                className="cursor-pointer rounded-md border border-slate-200 bg-white px-1.5 py-1 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                            >
                                                                <option value="" disabled>Font style</option>
                                                                {FONT_FAMILIES.map((f, i) => <option key={f.label} value={i} style={{ fontFamily: f.css }}>{f.label}</option>)}
                                                            </select>
                                                            <MotionButton
                                                                onClick={() => fileInputRef.current?.click()}
                                                                disabled={(activeNote.attachments?.length || 0) >= MAX_ATTACHMENTS}
                                                                aria-label="Attach files"
                                                                title={`Attach files (max ${MAX_ATTACHMENTS} files, 50 MB each)`}
                                                                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 transition-colors duration-300 hover:border-amber-400 hover:text-amber-700 cursor-pointer disabled:opacity-50"
                                                            >
                                                                <motion.svg variants={iconVariants} transition={softSpring} className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                                </motion.svg>
                                                                Attach ({activeNote.attachments?.length || 0}/{MAX_ATTACHMENTS})
                                                            </MotionButton>
                                                            <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden="true" />
                                                            {[...FORMAT_TOOLS, ...BLOCK_TOOLS].map(tool => (
                                                                <MotionButton
                                                                    key={tool.command}
                                                                    aria-label={tool.label}
                                                                    title={tool.label}
                                                                    aria-pressed={Boolean(formattingState[tool.command])}
                                                                    onMouseDown={e => { e.preventDefault(); exec(tool.command); }}
                                                                    className={`rounded-md px-2 py-1 text-xs transition-colors duration-300 cursor-pointer ${formattingState[tool.command] ? 'bg-amber-100 font-bold text-amber-800' : 'font-medium text-slate-700 hover:bg-white hover:text-amber-700'} ${tool.className || ''}`}
                                                                >
                                                                    {tool.text}
                                                                </MotionButton>
                                                            ))}
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                                                            <div className="flex items-center gap-1" role="group" aria-label="Text colour">
                                                                <span className="text-[10px] font-extralight text-slate-500">Text</span>
                                                                {SWATCHES.map(c => (
                                                                    <motion.button
                                                                        key={c}
                                                                        type="button"
                                                                        aria-label={`Text colour ${c}`}
                                                                        whileHover={{ scale: 1.15 }}
                                                                        whileTap={{ scale: 0.9 }}
                                                                        transition={softSpring}
                                                                        onMouseDown={e => { e.preventDefault(); exec('foreColor', c); }}
                                                                        className="h-5 w-5 cursor-pointer rounded-full ring-1 ring-slate-200"
                                                                        style={{ backgroundColor: c }}
                                                                    />
                                                                ))}
                                                                <input
                                                                    type="color"
                                                                    aria-label="Custom text colour"
                                                                    onChange={e => exec('foreColor', e.target.value)}
                                                                    className="h-5 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
                                                                />
                                                            </div>
                                                            <div className="flex items-center gap-1" role="group" aria-label="Highlight colour">
                                                                <span className="text-[10px] font-extralight text-slate-500">Highlight</span>
                                                                {HIGHLIGHTS.map(c => (
                                                                    <motion.button
                                                                        key={c}
                                                                        type="button"
                                                                        aria-label={`Highlight ${c}`}
                                                                        whileHover={{ scale: 1.15 }}
                                                                        whileTap={{ scale: 0.9 }}
                                                                        transition={softSpring}
                                                                        onMouseDown={e => { e.preventDefault(); exec('hiliteColor', c); }}
                                                                        className="h-5 w-5 cursor-pointer rounded-md ring-1 ring-slate-200"
                                                                        style={{ backgroundColor: c }}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Font effects">
                                                            <span className="mr-1 text-[10px] font-extralight text-slate-500">Effects</span>
                                                            {FONT_EFFECTS.map(fx => (
                                                                <MotionButton
                                                                    key={fx.id}
                                                                    onMouseDown={e => { e.preventDefault(); wrapSelection(fx.styles); }}
                                                                    className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700 transition-colors duration-300 hover:border-amber-400 hover:text-amber-700 cursor-pointer"
                                                                >
                                                                    {fx.label}
                                                                </MotionButton>
                                                            ))}
                                                            <MotionButton
                                                                onMouseDown={e => { e.preventDefault(); exec('removeFormat'); }}
                                                                className="rounded-md px-2 py-0.5 text-[11px] font-medium text-red-600 transition-colors duration-300 hover:bg-red-50 cursor-pointer"
                                                            >
                                                                Clear style
                                                            </MotionButton>
                                                        </div>
                                                        <InlineMessage tone="info">{styleHint}</InlineMessage>
                                                    </div>

                                                    <div
                                                        ref={editorRef}
                                                        contentEditable
                                                        suppressContentEditableWarning
                                                        role="textbox"
                                                        aria-label="Note content"
                                                        aria-multiline="true"
                                                        data-placeholder="Start writing your note / description (required)…"
                                                        onInput={() => {
                                                            if (editorRef.current) {
                                                                setDraftContent(sanitizeHtml(editorRef.current.innerHTML));
                                                            }
                                                        }}
                                                        onKeyUp={readFormatting}
                                                        onMouseUp={readFormatting}
                                                        style={{ fontFamily: "'Poppins', 'Noto Sans Devanagari', sans-serif" }}
                                                        className="min-h-[180px] max-h-[320px] cursor-text overflow-y-auto p-4 text-sm font-medium leading-relaxed text-slate-800 focus:outline-none empty:before:font-extralight empty:before:text-slate-300 empty:before:content-[attr(data-placeholder)] [&_li]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6"
                                                    />

                                                    {(uploadError || uploads.length > 0 || (activeNote.attachments?.length || 0) > 0) && (
                                                        <div className="border-t border-slate-200 bg-slate-50/60 p-3">
                                                            <InlineMessage>{uploadError}</InlineMessage>
                                                            {uploads.length > 0 && (
                                                                <ul className="mb-2 space-y-2" aria-label="Uploads in progress">
                                                                    {uploads.map(u => (
                                                                        <li key={u.id} className="rounded-xl border border-slate-200 bg-white p-3">
                                                                            <div className="flex items-center justify-between gap-2">
                                                                                <p className="truncate text-xs font-bold text-slate-700">{u.name}</p>
                                                                                <span className="shrink-0 text-[10px] font-medium text-slate-500">
                                                                                    {u.progress === 100 ? (
                                                                                        <span className="inline-flex items-center gap-1 text-emerald-600">Complete <Check className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden="true" /></span>
                                                                                    ) : `${u.progress}%`}
                                                                                </span>
                                                                            </div>
                                                                            <ProgressBar value={u.progress} complete={u.progress === 100} label={`Uploading ${u.name}`} />
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                            {(activeNote.attachments?.length || 0) > 0 && (
                                                                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2" aria-label="Note attachments">
                                                                    <AnimatePresence initial={false}>
                                                                        {activeNote.attachments.map(a => (
                                                                            <AttachmentCard key={a.id} attachment={a} onOpen={setPreviewAttachment} onRemove={removeAttachment} />
                                                                        ))}
                                                                    </AnimatePresence>
                                                                </ul>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <motion.div key="schedule" variants={fadeUp} initial="hidden" animate="show" className="rounded-2xl border border-slate-200 bg-white p-6">
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Schedule & Countdowns</h2>
                                <p className="text-xs font-extralight text-slate-500">All scheduled notes with live countdown timers and auto-notifications at 30m, 15m, 5m, and due time.</p>
                            </div>
                            {selectedScheduleIds.length > 0 && (
                                <MotionButton
                                    onClick={deleteSelectedSchedules}
                                    className="rounded-xl bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 cursor-pointer"
                                >
                                    Delete Selected ({selectedScheduleIds.length})
                                </MotionButton>
                            )}
                        </div>
                        {isLoading ? (
                            <div className="space-y-2">{[0, 1, 2].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}</div>
                        ) : allSchedules.length === 0 ? (
                            <p className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs font-extralight text-slate-500">No scheduled notes yet. Create a Scheduling Note to get started.</p>
                        ) : (
                            <motion.ul variants={listStagger} initial="hidden" animate="show" className="space-y-2">
                                <AnimatePresence initial={false}>
                                    {allSchedules.map(s => {
                                        const status = scheduleStatus(s.dueAt, s.done, now);
                                        const isChecked = selectedScheduleIds.includes(s.id || s.noteId);
                                        return (
                                            <motion.li
                                                key={s.id || s.noteId}
                                                variants={fadeUp}
                                                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.25 } }}
                                                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 transition-colors duration-300 hover:border-amber-400"
                                            >
                                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggleSelectSchedule(s.id || s.noteId)}
                                                        aria-label={`Select schedule ${s.label}`}
                                                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 shrink-0 cursor-pointer"
                                                    />
                                                    <button type="button" onClick={() => { setView('notes'); selectNote(s.noteId); }} className="min-w-0 flex-1 cursor-pointer text-left">
                                                        <p className={`truncate text-xs font-bold ${s.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{s.label}</p>
                                                        <p className="truncate text-[10px] font-extralight text-slate-500">
                                                            {bsStringToLabel(s.bsDate)} · {timeToLabel(s.time)} · <span className="font-semibold text-amber-600">⏳ {getRemainingTimeText(s.dueAt, now)}</span>
                                                        </p>
                                                    </button>
                                                </div>
                                                <div className="flex shrink-0 items-center gap-1">
                                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${status.cls}`}>{status.label}</span>
                                                    <MotionButton onClick={() => {
                                                        if (s.isMainSchedule) toggleNoteDone(s.noteId);
                                                    }} className="rounded-lg px-2 py-1 text-[10px] font-medium text-amber-700 transition-colors duration-300 hover:bg-amber-50 cursor-pointer">
                                                        {s.done ? 'Reopen' : 'Mark done'}
                                                    </MotionButton>
                                                    <MotionButton onClick={() => {
                                                        if (s.isMainSchedule) removeNoteSchedule(s.noteId);
                                                    }} aria-label={`Remove schedule ${s.label}`} className="rounded-lg px-2 py-1 text-[10px] font-medium text-slate-600 transition-colors duration-300 hover:bg-slate-100 hover:text-red-600 cursor-pointer">
                                                        Remove
                                                    </MotionButton>
                                                </div>
                                            </motion.li>
                                        );
                                    })}
                                </AnimatePresence>
                            </motion.ul>
                        )}
                    </motion.div>
                )}
            </main>

            <AnimatePresence>
                {previewAttachment && <PreviewModal key={previewAttachment.id} attachment={previewAttachment} onClose={() => setPreviewAttachment(null)} />}
            </AnimatePresence>

            <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
                <AnimatePresence>
                    {toasts.map(t => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: 22 }}
                            animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } }}
                            exit={{ opacity: 0, x: 40, transition: { duration: 0.25 } }}
                            className="pointer-events-auto flex items-start justify-between gap-3 rounded-xl border border-amber-300 bg-white p-3 shadow-lg"
                            role="status"
                        >
                            <p className="text-xs font-bold text-slate-800">{t.message}</p>
                            <button type="button" onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} aria-label="Dismiss reminder" className="cursor-pointer text-slate-400 transition-colors duration-300 hover:text-slate-700">✕</button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}