import React, { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import DOMPurify from 'dompurify';
import {
    ArrowLeft,
    Bell,
    CalendarClock,
    CalendarPlus,
    Check,
    Clock,
    Download,
    File as FileIcon,
    FileImage,
    FileText,
    LoaderCircle,
    Paperclip,
    Plus,
    Save,
    Search,
    StickyNote,
    Trash2,
    X,
} from 'lucide-react';
import NepaliDate from 'nepali-date-converter';


import NepaliDateInput from '../../nepalidate/testDate';
import { Skeleton } from '../../skeleton';
import { useGet } from '../../hooks/useGet';
import { useAuth } from '../../hooks/useAuth';
import { useEdit } from '../../hooks/useEdit';
import { UseDelete } from '../../hooks/useDelete';
import { UseAdd } from '../../hooks/useadd';
import { ErrorNotify, SuccessNotify, waitingNotify } from '../../hotToaster';

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */
const EASE_OUT = [0.22, 1, 0.36, 1];
const softSpring = { type: 'spring', stiffness: 180, damping: 22 };
const GRADIENT = 'bg-gradient-to-r from-amber-500 to-orange-500';

/* ---- Upload rules (keep in sync with the multer config) ------------ */
const UPLOAD_FIELD = 'files';                  // CustomNote_.array('files', 10)
const MAX_ATTACHMENTS = 10;                    // CustomNote_.array('files', 10)
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;      // limits.fileSize = 10 MB
const ALLOWED_MIME = [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/pdf',
];
const ALLOWED_EXT = ['png', 'jpg', 'jpeg', 'docx', 'pdf'];
const ACCEPT = [...ALLOWED_MIME, ...ALLOWED_EXT.map(extension => `.${extension}`)].join(',');
const TYPE_HINT = 'PNG, JPG, JPEG, DOCX or PDF';

// Prefix for files stored on the server, e.g. 'http://localhost:5000'.
// Leave empty when the API is served from the same origin as this app.
const FILE_BASE_URL = '';

const NP_TZ = 'Asia/Kathmandu';
const NP_OFFSET = '+05:45';
const STATE_KEY_PREFIX = 'nexus_notes_schedule_state';
const SOON_MS = 60 * 60 * 1000;
const STALE_DUE_MS = 60 * 1000;

// Ordered from the furthest reminder to the due moment.
const REMINDER_TIERS = [
    { key: 'm30', ms: 30 * 60 * 1000, text: 'Starts in 30 minutes' },
    { key: 'm15', ms: 15 * 60 * 1000, text: 'Starts in 15 minutes' },
    { key: 'm5', ms: 5 * 60 * 1000, text: 'Starts in 5 minutes' },
    { key: 'due', ms: 0, text: 'Started / due now' },
];

const SWATCHES = ['#0f172a', '#b45309', '#ea580c', '#dc2626', '#059669', '#2563eb', '#7c3aed', '#db2777'];
const HIGHLIGHTS = ['#fef3c7', '#fed7aa', '#fecaca', '#bbf7d0', '#bfdbfe', '#ddd6fe'];

const FONT_EFFECTS = [
    { id: 'uppercase', label: 'UPPERCASE', styles: { 'text-transform': 'uppercase' } },
    { id: 'lowercase', label: 'lowercase', styles: { 'text-transform': 'lowercase' } },
    { id: 'capitalize', label: 'Capitalize', styles: { 'text-transform': 'capitalize' } },
];

const FORMAT_TOOLS = [
    { command: 'bold', label: 'Bold', text: 'B', className: 'font-black' },
    { command: 'italic', label: 'Italic', text: 'I', className: 'italic' },
    { command: 'underline', label: 'Underline', text: 'U', className: 'underline' },
    { command: 'strikeThrough', label: 'Strikethrough', text: 'S', className: 'line-through' },
];
const BLOCK_TOOLS = [
    { command: 'justifyLeft', label: 'Align left', text: '⇤' },
    { command: 'justifyCenter', label: 'Align center', text: '↔' },
    { command: 'justifyRight', label: 'Align right', text: '⇥' },
    { command: 'insertUnorderedList', label: 'Bulleted list', text: '• List' },
    { command: 'insertOrderedList', label: 'Numbered list', text: '1. List' },
];
const QUERY_COMMANDS = [...FORMAT_TOOLS, ...BLOCK_TOOLS].map(tool => tool.command);

/* ------------------------------------------------------------------ */
/* Generic helpers                                                     */
/* ------------------------------------------------------------------ */
const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const pad = value => String(value).padStart(2, '0');
const getNoteId = note => note?._id || note?.id;
const getExt = name => (name || '').split('.').pop()?.toLowerCase() || '';
const isImage = name => ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(getExt(name));

const formatFileSize = bytes => {
    if (!Number.isFinite(bytes)) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(2)} MB`;
};

const getFileIcon = filename => {
    const extension = getExt(filename);
    if (['pdf', 'doc', 'docx'].includes(extension)) return { Icon: FileText, color: 'text-amber-600' };
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(extension)) return { Icon: FileImage, color: 'text-orange-600' };
    return { Icon: FileIcon, color: 'text-slate-500' };
};

/* ---- Attachment helpers --------------------------------------------
 * A draft attachment is either
 *   - an existing server file: { key, name, size, mime, url, file: null, raw }
 *   - a new local file:        { key, name, size, mime, url: '',  file: File, raw: null }
 * `raw` is the untouched object the API returned, so it can be sent back as-is.
 * ------------------------------------------------------------------ */
const attachmentKey = raw => raw?._id || raw?.id || raw?.url || raw?.path || raw?.filename || raw?.originalName || raw?.name || '';

const resolveFileUrl = raw => {
    const source = raw?.url || raw?.fileUrl || raw?.location || raw?.path || '';
    if (!source) return '';
    if (/^(https?:|blob:|data:)/i.test(source)) return source;
    return `${FILE_BASE_URL}/${String(source).replace(/\\/g, '/').replace(/^\/+/, '')}`;
};

const serverAttachmentToDraft = raw => ({
    key: attachmentKey(raw) || uid(),
    name: raw?.originalName || raw?.originalname || raw?.name || raw?.filename || 'attachment',
    size: Number(raw?.size) || 0,
    mime: raw?.mimetype || raw?.mime || raw?.type || '',
    url: resolveFileUrl(raw),
    file: null,
    raw,
});

const fileToDraft = file => ({
    key: uid(),
    name: file.name,
    size: file.size,
    mime: file.type,
    url: '',
    file,
    raw: null,
});

const buildNoteFormData = ({ userId, title, content, isScheduled, schedules, keep = [], removed = [], newFiles = [] }) => {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('title', title);
    formData.append('content', content);
    formData.append('isScheduled', String(Boolean(isScheduled)));
    (Array.isArray(schedules) ? schedules : []).forEach((schedule, index) => {
        formData.append(`schedules[${index}][label]`, schedule.label || '');
        formData.append(`schedules[${index}][bsDate]`, schedule.bsDate || '');
        formData.append(`schedules[${index}][time]`, schedule.time || '');
    });
    formData.append('retainedAttachments', JSON.stringify(keep));
    formData.append('removedAttachments', JSON.stringify(removed));
    newFiles.forEach(file => formData.append(UPLOAD_FIELD, file, file.name));
    return formData;
};

const downloadBlob = (blob, name) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name || 'attachment';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/* ---- Schedule value helpers --------------------------------------- */
const normalizeScheduleTime = time => {
    if (!time) return '00:00:00';
    const match = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/.exec(String(time).trim());
    if (!match) return '00:00:00';
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    const seconds = Number(match[3] || 0);
    if (hours > 23 || minutes > 59 || seconds > 59) return '00:00:00';
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

const extractBsDate = value => {
    if (!value) return '';
    if (typeof value === 'string') {
        const match = /(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/.exec(value);
        if (match) return `${match[1]}-${pad(match[2])}-${pad(match[3])}`;
        return value;
    }
    if (typeof value === 'object') {
        if (value.bsDate) return value.bsDate;
        const year = value.year || value.y;
        const month = value.month || value.m;
        const day = value.date || value.day || value.d;
        if (year && month && day) return `${year}-${pad(month)}-${pad(day)}`;
    }
    return '';
};

const scheduleSig = (bsDate, time) => `${bsDate || ''}|${time || ''}`;

const timeToLabel = value => {
    if (!value) return '—';
    const [hours, minutes, seconds] = normalizeScheduleTime(value).split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${pad(minutes)}${seconds ? `:${pad(seconds)}` : ''} ${period}`;
};

// Builds an absolute instant from a BS date + time, pinned to Nepal's UTC offset
// so countdowns are correct whatever timezone the browser is in.
const computeDueAt = (bsDate, time) => {
    if (!bsDate || !time) return null;
    try {
        const js = new NepaliDate(bsDate).toJsDate();
        const [h, m, s] = normalizeScheduleTime(time).split(':');
        const iso = `${js.getFullYear()}-${pad(js.getMonth() + 1)}-${pad(js.getDate())}T${h}:${m}:${s}${NP_OFFSET}`;
        return Number.isNaN(new Date(iso).getTime()) ? null : iso;
    } catch {
        return null;
    }
};

/* ---- Nepal date & time -------------------------------------------- */
const kathmanduParts = date => {
    const parts = Object.fromEntries(
        new Intl.DateTimeFormat('en-US', { timeZone: NP_TZ, year: 'numeric', month: '2-digit', day: '2-digit' })
            .formatToParts(date)
            .map(part => [part.type, part.value])
    );
    return { y: Number(parts.year), m: Number(parts.month), d: Number(parts.day) };
};

const formatNepalTime = date =>
    new Intl.DateTimeFormat('en-US', { timeZone: NP_TZ, hour: 'numeric', minute: '2-digit', hour12: true }).format(date);

const formatBsDate = date => {
    try {
        const { y, m, d } = kathmanduParts(date);
        return new NepaliDate(new Date(y, m - 1, d)).format('ddd, DD MMMM YYYY');
    } catch {
        return date.toLocaleDateString();
    }
};

const currentNepalBsDate = date => {
    const { y, m, d } = kathmanduParts(date);
    return new NepaliDate(new Date(y, m - 1, d)).format('YYYY-MM-DD');
};

const formatBsStamp = value => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return `${formatBsDate(date)} · ${formatNepalTime(date)}`;
};

const bsStringToLabel = value => {
    if (!value) return '—';
    try {
        return new NepaliDate(value).format('ddd, DD MMMM YYYY');
    } catch {
        return value;
    }
};

const getRemainingText = (dueMs, nowMs) => {
    const diff = dueMs - nowMs;
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

const scheduleStatus = (dueMs, done, nowMs) => {
    if (done) return { key: 'done', label: 'Done', cls: 'bg-emerald-100 text-emerald-700' };
    if (!dueMs) return { key: 'invalid', label: 'Invalid time', cls: 'bg-slate-100 text-slate-600' };
    const diff = dueMs - nowMs;
    if (diff < 0) return { key: 'overdue', label: 'Due / Ended', cls: 'bg-red-100 text-red-600' };
    if (diff < SOON_MS) return { key: 'soon', label: 'Due soon', cls: 'bg-amber-100 text-amber-700' };
    return { key: 'upcoming', label: 'Upcoming', cls: 'bg-slate-100 text-slate-600' };
};

/* ---- HTML sanitising (DOMPurify) ------------------------------------ */
const PURIFY_CONFIG = {
    ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'u', 's', 'strike', 'del', 'ul', 'ol', 'li', 'br', 'div', 'p', 'span', 'sub', 'sup', 'a'],
    // target / rel are added by linkHook below, never taken from the input.
    ALLOWED_ATTR: ['style', 'href'],
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:)/i,
    KEEP_CONTENT: true,
};

const ALLOWED_STYLE = new Set([
    'font-weight', 'font-style', 'color', 'background-color', 'text-align',
    'text-decoration', 'text-decoration-line', 'text-transform',
]);

const cleanStyle = style => style.split(';').map(part => part.trim()).filter(Boolean).map(declaration => {
    const index = declaration.indexOf(':');
    if (index < 0) return null;
    const prop = declaration.slice(0, index).trim().toLowerCase();
    const value = declaration.slice(index + 1).trim();
    if (!ALLOWED_STYLE.has(prop) || /url\(|expression|javascript|@import/i.test(value)) return null;
    return `${prop}: ${value}`;
}).filter(Boolean).join('; ');

// DOMPurify keeps `style` as-is, so only the formatting properties the toolbar produces are allowed through.
const styleHook = (_node, data) => {
    if (data.attrName !== 'style') return;
    const cleaned = cleanStyle(data.attrValue || '');
    if (cleaned) data.attrValue = cleaned;
    else data.keepAttr = false;
};

const linkHook = node => {
    if (node.tagName !== 'A') return;
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
};

// Hooks are added and removed around every call so they never leak into
// other DOMPurify.sanitize() calls elsewhere in the app.
const sanitizeHtml = html => {
    if (!html || typeof window === 'undefined') return '';
    DOMPurify.addHook('uponSanitizeAttribute', styleHook);
    DOMPurify.addHook('afterSanitizeAttributes', linkHook);
    try {
        return DOMPurify.sanitize(html, PURIFY_CONFIG);
    } finally {
        DOMPurify.removeHook('uponSanitizeAttribute', styleHook);
        DOMPurify.removeHook('afterSanitizeAttributes', linkHook);
    }
};

const htmlToText = html => {
    if (typeof document === 'undefined') return String(html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const doc = new DOMParser().parseFromString(html || '', 'text/html');
    return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
};

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */
// One shared 1-second ticker for every countdown on the page.
const tickStore = (() => {
    let now = Date.now();
    let timer = null;
    const listeners = new Set();
    return {
        subscribe(listener) {
            listeners.add(listener);
            if (!timer) {
                now = Date.now();
                timer = setInterval(() => {
                    now = Date.now();
                    listeners.forEach(callback => callback());
                }, 1000);
                queueMicrotask(() => listeners.forEach(callback => callback()));
            }
            return () => {
                listeners.delete(listener);
                if (!listeners.size && timer) {
                    clearInterval(timer);
                    timer = null;
                }
            };
        },
        getSnapshot: () => now,
    };
})();
const useNow = () => useSyncExternalStore(tickStore.subscribe, tickStore.getSnapshot, () => Date.now());

// URL to display an attachment: a temporary object URL for a local file
// (revoked on cleanup), or the server URL for a saved one.
const useAttachmentUrl = (attachment, enabled = true) => {
    const file = attachment?.file || null;
    const remoteUrl = attachment?.url || '';
    const [objectUrl, setObjectUrl] = useState(null);

    useEffect(() => {
        if (!enabled || !file) {
            setObjectUrl(null);
            return undefined;
        }
        const created = URL.createObjectURL(file);
        setObjectUrl(created);
        return () => URL.revokeObjectURL(created);
    }, [file, enabled]);

    if (!enabled) return null;
    return file ? objectUrl : remoteUrl || null;
};

// localStorage-backed object scoped to a key (per user). Reads/writes are
// ignored until the key's data has been loaded so one user's data never
// overwrites another's.
const useScopedStorage = key => {
    const [store, setStore] = useState({ key: null, data: {} });

    useEffect(() => {
        if (!key) return;
        let data = {};
        try { data = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch { data = {}; }
        setStore({ key, data });
    }, [key]);

    useEffect(() => {
        if (!key || store.key !== key) return;
        try { localStorage.setItem(key, JSON.stringify(store.data)); } catch { /* storage unavailable */ }
    }, [key, store]);

    const setData = useCallback(updater => {
        setStore(previous => ({
            ...previous,
            data: typeof updater === 'function' ? updater(previous.data) : updater,
        }));
    }, []);

    return [store.data, setData, Boolean(key) && store.key === key];
};

const useSmartPosition = (isOpen, triggerRef, popoverRef) => {
    const [position, setPosition] = useState('bottom');
    useEffect(() => {
        if (!isOpen || !triggerRef.current || !popoverRef.current) return;
        const trigger = triggerRef.current.getBoundingClientRect();
        const popover = popoverRef.current.getBoundingClientRect();
        const below = window.innerHeight - trigger.bottom;
        const above = trigger.top;
        setPosition(below < popover.height + 8 && above > below ? 'top' : 'bottom');
    }, [isOpen, triggerRef, popoverRef]);
    return position;
};

/* ------------------------------------------------------------------ */
/* Shared UI                                                           */
/* ------------------------------------------------------------------ */
const MotionButton = ({ className = '', disabled, children, ...props }) => (
    <motion.button
        type="button"
        whileHover={disabled ? undefined : { scale: 1.02 }}
        whileTap={disabled ? undefined : { scale: 0.97 }}
        transition={softSpring}
        disabled={disabled}
        className={`cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
    >
        {children}
    </motion.button>
);

const Checkbox = ({ checked, onChange, label }) => (
    <motion.button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-label={label}
        onClick={event => { event.stopPropagation(); onChange(); }}
        whileTap={{ scale: 0.86 }}
        className={`flex h-[18px] w-[18px] shrink-0 cursor-pointer items-center justify-center rounded-md border-2 transition-colors ${checked ? `border-amber-500 ${GRADIENT}` : 'border-slate-300 bg-white hover:border-amber-400'}`}
    >
        {checked && <Check className="h-3 w-3 text-white" strokeWidth={3.5} />}
    </motion.button>
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
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: EASE_OUT } },
    exit: { opacity: 0, y: 12, scale: 0.98, transition: { duration: 0.2, ease: EASE_OUT } },
};

const Modal = ({ onClose, children }) => {
    useEffect(() => {
        const onKey = event => event.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" role="dialog" aria-modal="true">
            <motion.div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: EASE_OUT }}
            />
            {children}
        </div>
    );
};

const ConfirmDialog = ({ confirm, onClose }) => {
    if (!confirm) return null;
    const danger = confirm.tone !== 'neutral';
    return (
        <Modal onClose={onClose}>
            <motion.div {...modalPanel} className="relative w-full max-w-md space-y-4 rounded-2xl bg-white p-5 sm:p-6">
                <div>
                    <h3 className="text-sm font-bold text-slate-900 sm:text-base">{confirm.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{confirm.message}</p>
                </div>
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <MotionButton onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 sm:py-2">
                        {confirm.cancelLabel || 'Cancel'}
                    </MotionButton>
                    <MotionButton
                        onClick={() => { const run = confirm.onConfirm; onClose(); run?.(); }}
                        className={`rounded-xl px-4 py-2.5 text-xs font-bold text-white sm:py-2 ${danger ? 'bg-red-600 hover:bg-red-700' : GRADIENT}`}
                    >
                        {confirm.confirmLabel || 'Confirm'}
                    </MotionButton>
                </div>
            </motion.div>
        </Modal>
    );
};

const Countdown = ({ dueAt, done = false, className = '' }) => {
    const now = useNow();
    if (done) return <span className={className}>Completed</span>;
    const dueMs = dueAt ? new Date(dueAt).getTime() : 0;
    if (!dueMs) return <span className={className}>—</span>;
    return <span className={`tabular-nums ${className}`}>{getRemainingText(dueMs, now)}</span>;
};

const NepalClock = ({ className = '' }) => {
    const now = new Date(useNow());
    return (
        <div className={`text-right ${className}`} title="Current Nepal date and time">
            <p className="text-[11px] font-bold text-slate-800">{formatBsDate(now)}</p>
            <p className="text-[11px] font-extralight text-slate-500">{formatNepalTime(now)} · Nepal Time</p>
        </div>
    );
};

const ToastStack = ({ toasts, onDismiss }) => (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
        <AnimatePresence>
            {toasts.map(toast => (
                <motion.div
                    key={toast.id}
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } }}
                    exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                    className="pointer-events-auto flex items-start gap-3 rounded-xl border border-amber-300 bg-white p-3 shadow-lg"
                    role="status"
                >
                    <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${toast.tone === 'due' ? 'bg-orange-100 text-orange-600' : 'bg-amber-100 text-amber-600'}`}>
                        {toast.tone === 'due' ? <Clock className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-slate-800">{toast.title}</p>
                        <p className="mt-0.5 text-[11px] text-slate-500">{toast.message}</p>
                    </div>
                    <button type="button" onClick={() => onDismiss(toast.id)} aria-label="Dismiss reminder" className="cursor-pointer text-slate-400 transition-colors hover:text-slate-700">
                        <X className="h-4 w-4" />
                    </button>
                </motion.div>
            ))}
        </AnimatePresence>
    </div>
);

/* ------------------------------------------------------------------ */
/* Time picker (12-hour, HH:MM:SS)                                     */
/* ------------------------------------------------------------------ */
const TimePickerUI = ({ value, onChange, placeholder = 'Select time' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef(null);
    const popoverRef = useRef(null);
    const position = useSmartPosition(isOpen, triggerRef, popoverRef);

    const parsed = useMemo(() => {
        if (!value) return { hours: 12, minutes: 0, seconds: 0, period: 'AM' };
        const parts = value.split(':');
        const rawHours = parseInt(parts[0] || '0', 10);
        return {
            hours: rawHours % 12 || 12,
            minutes: parseInt(parts[1] || '0', 10),
            seconds: parseInt(parts[2] || '0', 10),
            period: rawHours >= 12 ? 'PM' : 'AM',
        };
    }, [value]);

    useEffect(() => {
        if (!isOpen) return undefined;
        const onPointerDown = event => {
            if (triggerRef.current?.contains(event.target) || popoverRef.current?.contains(event.target)) return;
            setIsOpen(false);
        };
        document.addEventListener('mousedown', onPointerDown);
        return () => document.removeEventListener('mousedown', onPointerDown);
    }, [isOpen]);

    const update = (hours, minutes, seconds, period) => {
        let hour24 = hours % 12;
        if (period === 'PM') hour24 += 12;
        onChange(`${pad(hour24)}:${pad(minutes)}:${pad(seconds)}`);
    };

    const columns = [
        { label: 'HH', items: Array.from({ length: 12 }, (_, i) => i + 1), active: parsed.hours, set: item => update(item, parsed.minutes, parsed.seconds, parsed.period) },
        { label: 'MM', items: Array.from({ length: 60 }, (_, i) => i), active: parsed.minutes, set: item => update(parsed.hours, item, parsed.seconds, parsed.period) },
        { label: 'SS', items: Array.from({ length: 60 }, (_, i) => i), active: parsed.seconds, set: item => update(parsed.hours, parsed.minutes, item, parsed.period) },
    ];

    return (
        <div className="relative w-full">
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setIsOpen(open => !open)}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                className="flex h-10 w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 transition-colors hover:border-amber-300 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
            >
                <span className={value ? 'font-bold text-slate-900' : 'font-extralight text-slate-400'}>
                    {value ? timeToLabel(value) : placeholder}
                </span>
                <Clock className="h-4 w-4 text-amber-600" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={popoverRef}
                        initial={{ opacity: 0, scale: 0.97, y: position === 'top' ? 8 : -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.18 }}
                        className={`absolute left-0 z-50 w-max max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}`}
                    >
                        <div className="flex gap-2">
                            {columns.map(column => (
                                <div key={column.label} className="flex flex-col items-center">
                                    <span className="mb-1 text-[11px] font-bold text-slate-400">{column.label}</span>
                                    <div className="h-32 w-12 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50 p-1 text-center">
                                        {column.items.map(item => (
                                            <button
                                                key={item}
                                                type="button"
                                                onClick={() => column.set(item)}
                                                className={`w-full cursor-pointer rounded py-1 text-xs font-medium transition-colors ${column.active === item ? 'bg-amber-500 font-bold text-white' : 'text-slate-700 hover:bg-amber-50'}`}
                                            >
                                                {pad(item)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <div className="flex flex-col items-center">
                                <span className="mb-1 text-[11px] font-bold text-slate-400">AM/PM</span>
                                <div className="flex h-32 flex-col gap-1 rounded-lg border border-slate-100 bg-slate-50 p-1">
                                    {['AM', 'PM'].map(period => (
                                        <button
                                            key={period}
                                            type="button"
                                            onClick={() => update(parsed.hours, parsed.minutes, parsed.seconds, period)}
                                            className={`flex-1 cursor-pointer rounded px-2 text-xs font-bold transition-colors ${parsed.period === period ? 'bg-amber-500 text-white' : 'text-slate-700 hover:bg-amber-50'}`}
                                        >
                                            {period}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className={`mt-3 w-full cursor-pointer rounded-lg py-1.5 text-xs font-bold text-white ${GRADIENT}`}
                        >
                            Done
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ------------------------------------------------------------------ */
/* Attachments                                                         */
/* ------------------------------------------------------------------ */
const AttachmentCard = ({ attachment, onOpen, onRemove }) => {
    const { Icon, color } = getFileIcon(attachment.name);
    const image = isImage(attachment.name);
    const url = useAttachmentUrl(attachment, image);
    const [broken, setBroken] = useState(false);

    useEffect(() => { setBroken(false); }, [url]);

    return (
        <motion.li
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
            className="group flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5 transition-colors hover:border-amber-400"
        >
            <button type="button" onClick={() => onOpen(attachment)} className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-left">
                {image && url && !broken ? (
                    <img src={url} alt="" onError={() => setBroken(true)} className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-slate-200" />
                ) : image && attachment.file && !url ? (
                    <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
                ) : (
                    <div className={`shrink-0 rounded-lg bg-slate-100 p-2.5 transition-colors group-hover:bg-amber-50 ${color}`}>
                        <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                )}
                <span className="min-w-0">
                    <span className="block truncate text-xs font-bold text-slate-800 transition-colors group-hover:text-amber-600">{attachment.name}</span>
                    <span className="block text-[11px] font-extralight text-slate-500">
                        {formatFileSize(attachment.size)} · {getExt(attachment.name).toUpperCase()}
                        {attachment.file ? ' · Uploads on save' : ''}
                    </span>
                </span>
            </button>
            {onRemove && (
                <MotionButton
                    onClick={() => onRemove(attachment)}
                    aria-label={`Remove ${attachment.name}`}
                    className="shrink-0 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                    Remove
                </MotionButton>
            )}
        </motion.li>
    );
};

const PreviewModal = ({ attachment, onClose }) => {
    const image = isImage(attachment.name);
    const pdf = getExt(attachment.name) === 'pdf';
    const canDownload = Boolean(attachment.file || attachment.url);
    const previewable = (image || pdf) && canDownload;
    const url = useAttachmentUrl(attachment, previewable);
    const { Icon, color } = getFileIcon(attachment.name);

    const handleDownload = async () => {
        try {
            if (attachment.file) {
                downloadBlob(attachment.file, attachment.name);
                return;
            }
            if (!attachment.url) throw new Error('This file has no download link.');
            const response = await fetch(attachment.url, { credentials: 'include' });
            if (!response.ok) throw new Error('Could not download the attachment.');
            downloadBlob(await response.blob(), attachment.name);
        } catch (error) {
            // Cross-origin servers may block fetch(); fall back to opening the file directly.
            if (attachment.url) window.open(attachment.url, '_blank', 'noopener,noreferrer');
            else ErrorNotify(error?.message || 'Could not download the attachment.');
        }
    };

    return (
        <Modal onClose={onClose}>
            <motion.div {...modalPanel} className="relative max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-2xl bg-white p-4 sm:p-6">
                <div className="pr-8">
                    <h3 className="truncate text-sm font-bold text-slate-900 sm:text-base">{attachment.name}</h3>
                    <p className="text-[11px] font-extralight text-slate-500">
                        {formatFileSize(attachment.size)}
                        {attachment.file ? ' · Uploads when you save the note' : ''}
                    </p>
                </div>
                <button type="button" onClick={onClose} aria-label="Close preview" className="absolute right-3 top-3 cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                    <X className="h-4 w-4" />
                </button>
                {previewable ? (
                    url ? (
                        image ? (
                            <img src={url} alt={attachment.name} className="max-h-[60vh] w-full rounded-xl border border-slate-200 object-contain" />
                        ) : (
                            <iframe title={attachment.name} src={url} className="h-[60vh] w-full rounded-xl border border-slate-200" />
                        )
                    ) : (
                        <Skeleton className="h-64 w-full rounded-xl" />
                    )
                ) : (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                        <Icon className={`h-10 w-10 ${color}`} aria-hidden="true" />
                        <p className="text-xs font-extralight text-slate-500">
                            {canDownload ? 'Preview isn’t available for this file type. Download it to open it.' : 'This file isn’t available to preview or download.'}
                        </p>
                    </div>
                )}
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <MotionButton onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 sm:py-2">Close</MotionButton>
                    <MotionButton onClick={handleDownload} disabled={!canDownload} className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-white sm:py-2 ${GRADIENT}`}>
                        <Download className="h-3.5 w-3.5" /> Download
                    </MotionButton>
                </div>
            </motion.div>
        </Modal>
    );
};

/* ------------------------------------------------------------------ */
/* Skeletons                                                           */
/* ------------------------------------------------------------------ */
const NoteListSkeleton = () => (
    <div className="space-y-2 p-3" aria-hidden="true">
        {[0, 1, 2, 3].map(index => (
            <div key={index} className="space-y-2 rounded-xl border border-slate-200 p-3">
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
    </div>
);

/* ------------------------------------------------------------------ */
/* Note list badge                                                     */
/* ------------------------------------------------------------------ */
const NextScheduleBadge = ({ entries, doneMap }) => {
    const now = useNow();
    const pending = entries.filter(entry => entry.dueMs && !doneMap[entry.key]?.done);
    if (!pending.length) return null;
    const upcoming = pending.filter(entry => entry.dueMs > now).sort((a, b) => a.dueMs - b.dueMs)[0];
    if (!upcoming) {
        return <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">Due</span>;
    }
    return (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold tabular-nums text-amber-700">
            <Clock className="h-2.5 w-2.5" />
            {getRemainingText(upcoming.dueMs, now).replace(' remaining', '')}
        </span>
    );
};

/* ------------------------------------------------------------------ */
/* Schedule tab                                                        */
/* ------------------------------------------------------------------ */
const FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'done', label: 'Done' },
];

const SchedulePanel = ({ entries, doneMap, isLoading, isError, onRetry, onToggleDone, onOpenNote, onRemove, removing, requestConfirm }) => {
    const now = useNow();
    const [filter, setFilter] = useState('all');
    const [selected, setSelected] = useState([]);

    const rows = useMemo(() => entries.map(entry => {
        const done = Boolean(doneMap[entry.key]?.done);
        return { ...entry, done, status: scheduleStatus(entry.dueMs, done, now) };
    }), [entries, doneMap, now]);

    const counts = useMemo(() => ({
        all: rows.length,
        upcoming: rows.filter(row => ['upcoming', 'soon'].includes(row.status.key)).length,
        overdue: rows.filter(row => row.status.key === 'overdue').length,
        done: rows.filter(row => row.done).length,
    }), [rows]);

    const filtered = useMemo(() => rows.filter(row => {
        if (filter === 'upcoming') return ['upcoming', 'soon'].includes(row.status.key);
        if (filter === 'overdue') return row.status.key === 'overdue';
        if (filter === 'done') return row.done;
        return true;
    }), [rows, filter]);

    const selectedRows = filtered.filter(row => selected.includes(row.key));
    const allSelected = filtered.length > 0 && selectedRows.length === filtered.length;

    const toggle = key => setSelected(previous => (previous.includes(key) ? previous.filter(item => item !== key) : [...previous, key]));
    const toggleAll = () => setSelected(allSelected ? [] : filtered.map(row => row.key));

    const askRemove = targets => requestConfirm({
        title: targets.length > 1 ? `Remove ${targets.length} schedules?` : 'Remove this schedule?',
        message: 'The schedule entries are removed from their notes. The notes themselves are kept.',
        confirmLabel: 'Remove',
        onConfirm: async () => {
            await onRemove(targets);
            setSelected(previous => previous.filter(key => !targets.some(target => target.key === key)));
        },
    });

    return (
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE_OUT }} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <h1 className="text-sm font-bold text-slate-900 sm:text-base">Schedule &amp; Countdowns</h1>
                    <p className="mt-1 text-[11px] font-extralight text-slate-500">
                        Every schedule across your notes, with live countdowns and reminders at 30m, 15m, 5m and the due time.
                    </p>
                </div>
                {selectedRows.length > 0 && (
                    <MotionButton
                        onClick={() => askRemove(selectedRows)}
                        disabled={removing}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700"
                    >
                        {removing ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        Remove selected ({selectedRows.length})
                    </MotionButton>
                )}
            </div>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-slate-100 p-1">
                    {FILTERS.map(item => {
                        const active = filter === item.id;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setFilter(item.id)}
                                aria-pressed={active}
                                className={`cursor-pointer whitespace-nowrap rounded-lg px-3 py-1.5 text-xs transition-colors ${active ? 'bg-white font-bold text-amber-700 shadow-sm' : 'font-medium text-slate-600 hover:text-slate-900'}`}
                            >
                                {item.label} <span className="font-extralight text-slate-400">{counts[item.id]}</span>
                            </button>
                        );
                    })}
                </div>
                {filtered.length > 0 && (
                    <label className="flex cursor-pointer items-center gap-2 text-[11px] font-medium text-slate-600">
                        <Checkbox checked={allSelected} onChange={toggleAll} label="Select all schedules" />
                        Select all
                    </label>
                )}
            </div>

            {isLoading ? (
                <div className="space-y-2">{[0, 1, 2].map(index => <Skeleton key={index} className="h-20 w-full rounded-xl" />)}</div>
            ) : isError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                    <p className="text-xs font-bold text-red-700">Could not load schedules.</p>
                    <button type="button" onClick={onRetry} className="mt-3 cursor-pointer rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700">Try again</button>
                </div>
            ) : filtered.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center">
                    <CalendarClock className="mx-auto h-8 w-8 text-amber-500" />
                    <p className="mt-3 text-xs font-medium text-slate-500">
                        {entries.length === 0 ? 'No schedules yet. Create a scheduled note to get started.' : 'No schedules match this filter.'}
                    </p>
                </div>
            ) : (
                <ul className="space-y-2.5">
                    <AnimatePresence initial={false}>
                        {filtered.map(row => (
                            <motion.li
                                key={row.key}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.97 }}
                                transition={{ duration: 0.25, ease: EASE_OUT }}
                                className="rounded-xl border border-slate-200 bg-white p-3 transition-colors hover:border-amber-300 sm:p-4"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="pt-0.5">
                                        <Checkbox checked={selected.includes(row.key)} onChange={() => toggle(row.key)} label={`Select schedule ${row.label}`} />
                                    </div>
                                    <button type="button" onClick={() => onOpenNote(row.noteId)} className="min-w-0 flex-1 cursor-pointer text-left">
                                        <span className="flex flex-wrap items-center gap-2">
                                            <span className={`truncate text-sm font-bold ${row.done ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{row.label || 'Untitled schedule'}</span>
                                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${row.status.cls}`}>{row.status.label}</span>
                                        </span>
                                        <span className="mt-0.5 block truncate text-[11px] text-slate-500">{row.noteTitle}</span>
                                        <span className="mt-1 block text-xs text-slate-600">
                                            {bsStringToLabel(row.bsDate)} · {timeToLabel(row.time)}
                                        </span>
                                    </button>
                                </div>
                                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 sm:pl-[30px]">
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                                        <Clock className="h-3.5 w-3.5" />
                                        <Countdown dueAt={row.dueAt} done={row.done} />
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <MotionButton onClick={() => onToggleDone(row.key)} className="rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-amber-700 hover:bg-amber-50">
                                            {row.done ? 'Reopen' : 'Mark done'}
                                        </MotionButton>
                                        <MotionButton onClick={() => onOpenNote(row.noteId)} className="rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-100">
                                            Open note
                                        </MotionButton>
                                        <MotionButton onClick={() => askRemove([row])} disabled={removing} aria-label={`Remove schedule ${row.label}`} className="rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-red-50 hover:text-red-600">
                                            Remove
                                        </MotionButton>
                                    </div>
                                </div>
                            </motion.li>
                        ))}
                    </AnimatePresence>
                </ul>
            )}
        </motion.section>
    );
};

/* ------------------------------------------------------------------ */
/* Draft helpers                                                       */
/* ------------------------------------------------------------------ */
const blankSchedule = () => ({ _key: uid(), _orig: null, label: '', bsDate: '', time: '' });

const emptyDraft = (scheduled = false) => ({
    title: '',
    content: '',
    isScheduled: scheduled,
    schedules: scheduled ? [blankSchedule()] : [],
    attachments: [],
});

const noteToDraft = note => ({
    title: note.title || '',
    content: note.content || '',
    isScheduled: Boolean(note.isScheduled),
    schedules: (note.schedules || []).map(schedule => {
        const bsDate = extractBsDate(schedule.bsDate);
        const time = schedule.time ? normalizeScheduleTime(schedule.time) : '';
        return { _key: uid(), _orig: scheduleSig(bsDate, time), label: schedule.label || '', bsDate, time };
    }),
    attachments: (Array.isArray(note.attachments) ? note.attachments : []).map(serverAttachmentToDraft),
});

const draftSignature = draft => JSON.stringify({
    t: (draft.title || '').trim(),
    c: htmlToText(draft.content) ? draft.content : '',
    s: Boolean(draft.isScheduled),
    sc: draft.isScheduled ? (draft.schedules || []).map(item => [item.label || '', extractBsDate(item.bsDate), item.time || '']) : [],
    a: (draft.attachments || []).map(item => item.key),
});

const hasFiles = event => Array.from(event.dataTransfer?.types || []).includes('Files');

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */
export default function NotesScheduler() {
    const { useMe } = useAuth();
    const { role, id } = useMe?.data?.user?.decoded || {};

    const { ST_GetNote_ } = useGet({
        currentUser: { role },
        isAuthLoading: useMe.isLoading,
    });
    const { ST_CreateNote_ } = UseAdd();
    const { ST_UpdateNote_ } = useEdit();
    const { ST_DeleteNote_ } = UseDelete();

    const [view, setView] = useState('notes');
    const [showEditorMobile, setShowEditorMobile] = useState(false);
    const [search, setSearch] = useState('');
    const [notes, setNotes] = useState([]);

    // Draft (nothing is sent to the API until Create / Update is clicked)
    const [editingId, setEditingId] = useState(null);
    const [draftTitle, setDraftTitle] = useState('');
    const [draftContent, setDraftContent] = useState('');
    const [draftIsScheduled, setDraftIsScheduled] = useState(false);
    const [draftSchedules, setDraftSchedules] = useState([]);
    const [draftAttachments, setDraftAttachments] = useState([]);
    const [baseline, setBaseline] = useState(() => draftSignature(emptyDraft(false)));

    const [validationError, setValidationError] = useState(null);
    const [uploadError, setUploadError] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [previewAttachment, setPreviewAttachment] = useState(null);
    const [formattingState, setFormattingState] = useState({});
    const [styleHint, setStyleHint] = useState(null);

    const [actionPending, setActionPending] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [removingSchedules, setRemovingSchedules] = useState(false);
    const [selectedNoteIds, setSelectedNoteIds] = useState([]);
    const [confirm, setConfirm] = useState(null);
    const [toasts, setToasts] = useState([]);

    const editorRef = useRef(null);
    const titleRef = useRef(null);
    const fileInputRef = useRef(null);
    const savedRange = useRef(null);

    /* ---- Server data ---------------------------------------------- */
    // Resolves with the fresh notes array (or null on failure) so callers can
    // re-open the note they just saved without waiting for a re-render.
    const refreshNotes = useCallback(async () => {
        if (!id) return null;
        try {
            const { data } = await ST_GetNote_.mutateAsync({ params: { id } });
            setNotes(data);
            return data;
        } catch (error) {
            ErrorNotify(error?.message || 'Could not load notes.');
            return null;
        }
    }, [id, ST_GetNote_.mutateAsync]);

    useEffect(() => {
        if (!useMe.isLoading && id) void refreshNotes();
    }, [useMe.isLoading, id, refreshNotes]);

    const editingNote = useMemo(() => notes.find(note => getNoteId(note) === editingId) || null, [notes, editingId]);

    const noteIndex = useMemo(() => notes
        .map(note => ({
            note,
            id: getNoteId(note),
            text: htmlToText(note.content),
            time: new Date(note.updatedAt || note.createdAt || 0).getTime() || 0,
        }))
        .sort((a, b) => b.time - a.time), [notes]);

    const visibleNotes = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return noteIndex;
        return noteIndex.filter(item => `${item.note.title || ''} ${item.text}`.toLowerCase().includes(query));
    }, [noteIndex, search]);

    /* ---- Schedule entries, done flags & reminders ------------------ */
    const storageKey = id ? `${STATE_KEY_PREFIX}:${id}` : null;
    const [scheduleState, setScheduleState, scheduleStateReady] = useScopedStorage(storageKey);

    const scheduleEntries = useMemo(() => notes.flatMap(note => {
        if (!note.isScheduled) return [];
        const noteId = getNoteId(note);
        return (note.schedules || []).map((schedule, index) => {
            const bsDate = extractBsDate(schedule.bsDate);
            const time = schedule.time ? normalizeScheduleTime(schedule.time) : '';
            const dueAt = computeDueAt(bsDate, time);
            return {
                key: `${noteId}:${schedule._id || index}:${bsDate}:${time}`,
                noteId,
                noteTitle: note.title || 'Untitled note',
                index,
                label: schedule.label || '',
                bsDate,
                time,
                dueAt,
                dueMs: dueAt ? new Date(dueAt).getTime() : 0,
            };
        });
    }).sort((a, b) => (a.dueMs || Infinity) - (b.dueMs || Infinity)), [notes]);

    const entriesByNote = useMemo(() => {
        const map = new Map();
        scheduleEntries.forEach(entry => map.set(entry.noteId, [...(map.get(entry.noteId) || []), entry]));
        return map;
    }, [scheduleEntries]);

    const pendingCount = scheduleEntries.filter(entry => !scheduleState[entry.key]?.done).length;

    const entriesRef = useRef([]);
    const stateRef = useRef({});
    const readyRef = useRef(false);
    entriesRef.current = scheduleEntries;
    stateRef.current = scheduleState;
    readyRef.current = scheduleStateReady;

    const pushToast = useCallback(toast => {
        const toastId = uid();
        setToasts(previous => [...previous, { id: toastId, ...toast }]);
        setTimeout(() => setToasts(previous => previous.filter(item => item.id !== toastId)), 7000);
    }, []);

    const dismissToast = useCallback(toastId => setToasts(previous => previous.filter(item => item.id !== toastId)), []);

    // Reminder engine: runs outside React state updaters so toasts never double-fire.
    useEffect(() => {
        const check = () => {
            if (!readyRef.current) return;
            const nowMs = Date.now();
            const changes = {};
            entriesRef.current.forEach(entry => {
                if (!entry.dueMs) return;
                const current = { ...(stateRef.current[entry.key] || {}), ...(changes[entry.key] || {}) };
                if (current.done) return;
                const diff = entry.dueMs - nowMs;
                const tierIndex = diff <= 0 ? 3 : diff <= REMINDER_TIERS[2].ms ? 2 : diff <= REMINDER_TIERS[1].ms ? 1 : diff <= REMINDER_TIERS[0].ms ? 0 : -1;
                if (tierIndex < 0) return;
                const tier = REMINDER_TIERS[tierIndex];
                if (current[tier.key]) return;
                const marks = {};
                REMINDER_TIERS.slice(0, tierIndex + 1).forEach(item => { marks[item.key] = true; });
                changes[entry.key] = { ...(changes[entry.key] || {}), ...marks };
                // Don't announce events that ended long before the page opened.
                if (tier.key === 'due' && diff < -STALE_DUE_MS) return;
                pushToast({
                    tone: tier.key === 'due' ? 'due' : 'reminder',
                    title: entry.label || entry.noteTitle,
                    message: `${entry.noteTitle} · ${tier.text} (${timeToLabel(entry.time)})`,
                });
            });
            const changedKeys = Object.keys(changes);
            if (!changedKeys.length) return;
            const merged = { ...stateRef.current };
            changedKeys.forEach(key => { merged[key] = { ...(merged[key] || {}), ...changes[key] }; });
            stateRef.current = merged;
            setScheduleState(previous => {
                const next = { ...previous };
                changedKeys.forEach(key => { next[key] = { ...(next[key] || {}), ...changes[key] }; });
                return next;
            });
        };
        const timer = setInterval(check, 1000);
        return () => clearInterval(timer);
    }, [pushToast, setScheduleState]);

    // Drop saved flags for schedules that no longer exist.
    useEffect(() => {
        if (!scheduleStateReady || !ST_GetNote_?.isSuccess) return;
        const valid = new Set(scheduleEntries.map(entry => entry.key));
        setScheduleState(previous => {
            const stale = Object.keys(previous).filter(key => !valid.has(key));
            if (!stale.length) return previous;
            const next = { ...previous };
            stale.forEach(key => delete next[key]);
            return next;
        });
    }, [scheduleEntries, scheduleStateReady, ST_GetNote_?.isSuccess, setScheduleState]);

    const toggleScheduleDone = key => setScheduleState(previous => ({
        ...previous,
        [key]: { ...(previous[key] || {}), done: !previous[key]?.done },
    }));

    /* ---- Draft lifecycle ------------------------------------------- */
    const currentSignature = useMemo(() => draftSignature({
        title: draftTitle,
        content: draftContent,
        isScheduled: draftIsScheduled,
        schedules: draftSchedules,
        attachments: draftAttachments,
    }), [draftTitle, draftContent, draftIsScheduled, draftSchedules, draftAttachments]);
    const isDirty = currentSignature !== baseline;

    useEffect(() => {
        if (!isDirty) return undefined;
        const onBeforeUnload = event => { event.preventDefault(); event.returnValue = ''; };
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, [isDirty]);

    // The editor is uncontrolled; restore its HTML whenever the Notes tab remounts it.
    useEffect(() => {
        if (view === 'notes' && editorRef.current) editorRef.current.innerHTML = sanitizeHtml(draftContent);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [view]);

    const applyDraft = useCallback((draft, noteId = null) => {
        const html = sanitizeHtml(draft.content || '');
        setEditingId(noteId);
        setDraftTitle(draft.title || '');
        setDraftContent(html);
        setDraftIsScheduled(Boolean(draft.isScheduled));
        setDraftSchedules(draft.schedules || []);
        setDraftAttachments(draft.attachments || []);
        setBaseline(draftSignature({ ...draft, content: html }));
        setValidationError(null);
        setUploadError('');
        if (editorRef.current) editorRef.current.innerHTML = html;
    }, []);

    const requestConfirm = useCallback(config => setConfirm(config), []);

    // Runs `action` straight away, or after the user confirms discarding unsaved edits.
    const guardDirty = action => {
        if (!isDirty) { action(); return; }
        setConfirm({
            title: 'Discard unsaved changes?',
            message: 'You have edits that haven’t been saved. If you continue, they will be lost.',
            confirmLabel: 'Discard changes',
            cancelLabel: 'Keep editing',
            onConfirm: action,
        });
    };

    const startNewNote = scheduled => {
        setView('notes');
        guardDirty(() => {
            applyDraft(emptyDraft(scheduled), null);
            setShowEditorMobile(true);
            setTimeout(() => titleRef.current?.focus(), 150);
        });
    };

    const openNote = noteId => {
        if (noteId === editingId) { setView('notes'); setShowEditorMobile(true); return; }
        const note = notes.find(item => getNoteId(item) === noteId);
        if (!note || ST_GetNote_?.isPending) return;
        guardDirty(() => {
            const loadNote = async () => {
                try {
                    const { data } = await ST_GetNote_.mutateAsync({ params: { id: noteId } });
                    const details = Array.isArray(data) ? data.find(item => getNoteId(item) === noteId) : data;
                    const selectedNote = details && getNoteId(details) === noteId ? details : note;
                    if (selectedNote !== note) {
                        setNotes(previous => previous.map(item => getNoteId(item) === noteId ? selectedNote : item));
                    }
                    applyDraft(noteToDraft(selectedNote), noteId);
                } catch (error) {
                    ErrorNotify(error?.message || 'Could not load note details.');
                    applyDraft(noteToDraft(note), noteId);
                }
                setView('notes');
                setShowEditorMobile(true);
            };
            void loadNote();
        });
    };

    const cancelEdit = () => guardDirty(() => {
        applyDraft(emptyDraft(false), null);
        setShowEditorMobile(false);
    });

    /* ---- Rich text ------------------------------------------------- */
    const readFormatting = () => {
        try {
            setFormattingState(Object.fromEntries(QUERY_COMMANDS.map(command => [command, document.queryCommandState(command)])));
        } catch { /* unsupported */ }
    };

    useEffect(() => {
        const onSelectionChange = () => {
            const editor = editorRef.current;
            const selection = document.getSelection();
            if (!editor || !selection?.rangeCount || !editor.contains(selection.anchorNode)) return;
            savedRange.current = selection.getRangeAt(0).cloneRange();
            readFormatting();
        };
        document.addEventListener('selectionchange', onSelectionChange);
        return () => document.removeEventListener('selectionchange', onSelectionChange);
    }, []);

    const syncContent = () => {
        if (editorRef.current) setDraftContent(sanitizeHtml(editorRef.current.innerHTML));
    };

    const restoreSelection = () => {
        const editor = editorRef.current;
        if (!editor) return false;
        editor.focus();
        if (savedRange.current) {
            const selection = document.getSelection();
            selection.removeAllRanges();
            selection.addRange(savedRange.current);
        }
        return true;
    };

    const exec = (command, value = null) => {
        if (!restoreSelection()) return;
        document.execCommand('styleWithCSS', false, true);
        document.execCommand(command, false, value);
        readFormatting();
        syncContent();
    };

    const wrapSelection = styles => {
        if (!restoreSelection()) return;
        const selection = document.getSelection();
        if (!selection.rangeCount || selection.isCollapsed) {
            setStyleHint('Select some text first, then apply the style.');
            setTimeout(() => setStyleHint(null), 2500);
            return;
        }
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        Object.entries(styles).forEach(([prop, value]) => span.style.setProperty(prop, value));
        span.appendChild(range.extractContents());
        range.insertNode(span);
        selection.removeAllRanges();
        const next = document.createRange();
        next.selectNodeContents(span);
        selection.addRange(next);
        savedRange.current = next.cloneRange();
        syncContent();
    };

    const handleEditorInput = event => {
        const element = event.currentTarget;
        if (!element.textContent.trim() && !element.querySelector('li') && element.innerHTML === '<br>') element.innerHTML = '';
        setValidationError(null);
        syncContent();
    };

    const handlePaste = event => {
        event.preventDefault();
        const text = event.clipboardData?.getData('text/plain') || '';
        if (text) document.execCommand('insertText', false, text);
    };

    /* ---- Attachments ----------------------------------------------- */
    // Files are only validated and held in memory here; they are uploaded to the
    // server together with the note when Create / Update is clicked.
    const addFiles = files => {
        if (!files.length) return;
        const errors = [];
        let valid = [];
        files.forEach(file => {
            const ext = getExt(file.name);
            const mimeOk = !file.type || ALLOWED_MIME.includes(file.type);
            if (!ALLOWED_EXT.includes(ext) || !mimeOk) {
                errors.push(`${file.name} is not a supported type (${TYPE_HINT}).`);
            } else if (file.size > MAX_UPLOAD_SIZE) {
                errors.push(`${file.name} exceeds the ${formatFileSize(MAX_UPLOAD_SIZE).replace('.00', '')} limit.`);
            } else if (file.size === 0) {
                errors.push(`${file.name} is empty.`);
            } else {
                valid.push(file);
            }
        });
        const slots = Math.max(MAX_ATTACHMENTS - draftAttachments.length, 0);
        if (valid.length > slots) {
            errors.push(`Maximum limit of ${MAX_ATTACHMENTS} attachments reached.`);
            valid = valid.slice(0, slots);
        }
        setUploadError(errors.join(' '));
        if (valid.length) {
            setDraftAttachments(previous => [...previous, ...valid.map(fileToDraft)].slice(0, MAX_ATTACHMENTS));
        }
    };

    // Saved files are only removed from disk once the update succeeds (the server
    // receives them in `removedAttachments`); new files are simply dropped.
    const removeAttachment = attachment => setDraftAttachments(previous => previous.filter(item => item.key !== attachment.key));

    /* ---- Schedule entries in the draft ----------------------------- */
    const addSchedule = () => {
        setValidationError(null);
        setDraftSchedules(previous => [...previous, blankSchedule()]);
    };
    const updateSchedule = (key, field, value) => {
        setValidationError(null);
        setDraftSchedules(previous => previous.map(item => (item._key === key ? { ...item, [field]: value } : item)));
    };
    const removeDraftSchedule = key => {
        setValidationError(null);
        setDraftSchedules(previous => previous.filter(item => item._key !== key));
    };

    const setScheduledMode = enabled => {
        setDraftIsScheduled(enabled);
        setValidationError(null);
        if (enabled && draftSchedules.length === 0) setDraftSchedules([blankSchedule()]);
    };

    /* ---- Save (create / update) ------------------------------------ */
    const buildPayload = () => ({
        userId: id,
        title: draftTitle.trim(),
        content: sanitizeHtml(editorRef.current?.innerHTML || draftContent),
        isScheduled: draftIsScheduled,
        schedules: draftIsScheduled ? draftSchedules.map(item => ({
            label: String(item.label || '').trim(),
            bsDate: extractBsDate(item.bsDate),
            time: item.time ? normalizeScheduleTime(item.time) : '',
        })) : [],
    });

    const validatePayload = payload => {
        if (!payload.title) return { field: 'title', message: 'Note title is required.' };
        if (!htmlToText(payload.content)) return { field: 'content', message: 'Note content is required.' };
        if (!payload.userId) return { field: 'form', message: 'Authenticated user is unavailable.' };
        if (draftAttachments.length > MAX_ATTACHMENTS) {
            return { field: 'attachments', message: `You can attach up to ${MAX_ATTACHMENTS} files.` };
        }
        if (payload.isScheduled) {
            if (!payload.schedules.length) return { field: 'schedules', message: 'Add at least one schedule entry.' };
            for (let index = 0; index < payload.schedules.length; index += 1) {
                const schedule = payload.schedules[index];
                const draft = draftSchedules[index];
                if (!schedule.label) return { field: 'label', scheduleIndex: index, message: 'Add a description.' };
                if (!schedule.bsDate) return { field: 'date', scheduleIndex: index, message: 'Select a Bikram Sambat date.' };
                if (!schedule.time) return { field: 'time', scheduleIndex: index, message: 'Select a time.' };
                const dueAt = computeDueAt(schedule.bsDate, schedule.time);
                if (!dueAt) return { field: 'time', scheduleIndex: index, message: 'The date or time is invalid.' };
                const changed = scheduleSig(schedule.bsDate, schedule.time) !== draft?._orig;
                const now = Date.now();
                if (changed && new Date(dueAt).getTime() <= now) {
                    if (schedule.bsDate === currentNepalBsDate(new Date(now))) {
                        return { field: 'time', scheduleIndex: index, message: 'Select a time later than the current Nepal time.' };
                    }
                    return { field: 'time', scheduleIndex: index, message: 'Choose a future date and time (Nepal Time).' };
                }
            }
        }
        return null;
    };

    const handleSave = async () => {
        if (actionPending || deleting) return;
        const payload = buildPayload();
        const error = validatePayload(payload);
        if (error) {
            setValidationError(error);
            return;
        }
        setValidationError(null);
        const isUpdate = Boolean(editingId);

        // Split the attachments into: kept on the server, new uploads, and removed.
        const keptAttachments = draftAttachments.filter(item => !item.file);
        const keptKeys = new Set(keptAttachments.map(item => item.key));
        const newFiles = draftAttachments.filter(item => item.file).map(item => item.file);
        const formData = buildNoteFormData({
            ...payload,
            keep: keptAttachments.map(item => item.raw),
            removed: isUpdate ? (editingNote?.attachments || []).filter(raw => !keptKeys.has(attachmentKey(raw))) : [],
            newFiles,
        });

        console.log('Sending newFiles:', newFiles.map(f => ({ name: f.name, type: f.type, size: f.size })));
        setActionPending(isUpdate ? 'update' : 'create');
        waitingNotify(isUpdate ? 'Updating note...' : 'Creating note...');
        try {
            if (isUpdate) {
                await ST_UpdateNote_.mutateAsync({ id: editingId, data: formData });
            } else {
                await ST_CreateNote_.mutateAsync(formData);
            }
            SuccessNotify(isUpdate ? 'Note updated successfully.' : 'Note created successfully.');
            const fresh = await refreshNotes();
            const saved = isUpdate && Array.isArray(fresh) ? fresh.find(note => getNoteId(note) === editingId) : null;
            if (saved) {
                // Reload from the server so new uploads become saved files (and aren't re-sent on the next save).
                applyDraft(noteToDraft(saved), editingId);
            } else {
                applyDraft(emptyDraft(false), null);
                setShowEditorMobile(false);
            }
        } catch (mutationError) {
            ErrorNotify(mutationError?.response?.data?.message || mutationError?.message || (isUpdate ? 'Could not update the note.' : 'Could not create the note.'));
        } finally {
            setActionPending('');
        }
    };

    /* ---- Delete ----------------------------------------------------- */
    const handleDelete = async noteIds => {
        if (!noteIds.length || deleting || actionPending) return;
        setDeleting(true);
        waitingNotify(noteIds.length > 1 ? 'Deleting notes...' : 'Deleting note...');
        try {
            await ST_DeleteNote_.mutateAsync(noteIds);
            SuccessNotify(noteIds.length > 1 ? 'Notes deleted successfully.' : 'Note deleted successfully.');
            if (noteIds.includes(editingId)) {
                applyDraft(emptyDraft(false), null);
                setShowEditorMobile(false);
            }
            setSelectedNoteIds(previous => previous.filter(item => !noteIds.includes(item)));
            await refreshNotes();
        } catch (mutationError) {
            ErrorNotify(mutationError?.response?.data?.message || mutationError?.message || 'Could not delete the note.');
        } finally {
            setDeleting(false);
        }
    };

    const askDeleteNotes = noteIds => setConfirm({
        title: noteIds.length > 1 ? `Delete ${noteIds.length} notes?` : 'Delete this note?',
        message: 'This permanently deletes the note, its schedules and its attachments.',
        confirmLabel: 'Delete',
        onConfirm: () => handleDelete(noteIds),
    });

    const toggleSelectNote = noteId => setSelectedNoteIds(previous => (previous.includes(noteId) ? previous.filter(item => item !== noteId) : [...previous, noteId]));
    const allVisibleSelected = visibleNotes.length > 0 && visibleNotes.every(item => selectedNoteIds.includes(item.id));
    const toggleSelectAllNotes = () => setSelectedNoteIds(allVisibleSelected ? [] : visibleNotes.map(item => item.id));

    useEffect(() => {
        const valid = new Set(notes.map(getNoteId));
        setSelectedNoteIds(previous => (previous.every(item => valid.has(item)) ? previous : previous.filter(item => valid.has(item))));
    }, [notes]);

    /* ---- Remove schedules from the Schedule tab -------------------- */
    const removeScheduleEntries = async targets => {
        if (!targets.length || removingSchedules) return;
        const byNote = new Map();
        targets.forEach(target => byNote.set(target.noteId, [...(byNote.get(target.noteId) || []), target.index]));
        if (byNote.has(editingId) && isDirty) {
            ErrorNotify('Save or discard your changes to the open note before removing its schedules.');
            return;
        }
        setRemovingSchedules(true);
        waitingNotify('Removing schedule...');
        let failed = 0;
        let editingTouched = false;
        for (const [noteId, indexes] of byNote) {
            const note = notes.find(item => getNoteId(item) === noteId);
            if (!note) continue;
            const remaining = (note.schedules || []).filter((_, index) => !indexes.includes(index));
            try {
                // Only the schedules change: every saved attachment is kept, nothing is uploaded or deleted.
                const formData = buildNoteFormData({
                    userId: id,
                    title: note.title || '',
                    content: note.content || '',
                    isScheduled: remaining.length > 0,
                    schedules: remaining.map(item => ({
                        label: String(item.label || ''),
                        bsDate: extractBsDate(item.bsDate),
                        time: normalizeScheduleTime(item.time),
                    })),
                    keep: Array.isArray(note.attachments) ? note.attachments : [],
                });
                await ST_UpdateNote_.mutateAsync({ id: noteId, data: formData });
                if (noteId === editingId) editingTouched = true;
            } catch {
                failed += 1;
            }
        }
        if (failed) ErrorNotify(`Could not update ${failed} note${failed > 1 ? 's' : ''}.`);
        else SuccessNotify('Schedule removed successfully.');
        const fresh = await refreshNotes();
        if (editingTouched) {
            // The open draft still lists the removed schedules, so reload it from the server.
            const saved = Array.isArray(fresh) ? fresh.find(note => getNoteId(note) === editingId) : null;
            if (saved) applyDraft(noteToDraft(saved), editingId);
            else applyDraft(emptyDraft(false), null);
        }
        setRemovingSchedules(false);
    };

    /* ---- Render ------------------------------------------------------ */
    const isBusy = Boolean(actionPending) || deleting;
    const listLoading = useMe.isLoading || ST_GetNote_?.isPending;
    const tabs = [
        { id: 'notes', label: 'Notes' },
        { id: 'schedule', label: `Schedule${pendingCount ? ` (${pendingCount})` : ''}` },
    ];

    return (
        <div className="flex min-h-screen flex-col bg-white font-sans text-slate-800">
            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
                <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-3 py-2 sm:px-4">
                    <div className="flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
                        {tabs.map(tab => {
                            const active = view === tab.id;
                            return (
                                <MotionButton
                                    key={tab.id}
                                    onClick={() => setView(tab.id)}
                                    aria-pressed={active}
                                    className={`relative whitespace-nowrap rounded-lg px-3 py-1.5 text-xs transition-colors ${active ? 'font-bold text-white' : 'font-medium text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'}`}
                                >
                                    {active && <motion.span layoutId="notes-view-pill" className={`absolute inset-0 rounded-lg ${GRADIENT}`} transition={softSpring} />}
                                    <span className="relative">{tab.label}</span>
                                </MotionButton>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <NepalClock className="hidden md:block" />
                        <MotionButton
                            onClick={() => startNewNote(false)}
                            aria-label="New note"
                            title="New note"
                            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white ${GRADIENT}`}
                        >
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">New Note</span>
                        </MotionButton>
                        <MotionButton
                            onClick={() => startNewNote(true)}
                            aria-label="New scheduled note"
                            title="New scheduled note"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 transition-colors hover:bg-amber-100"
                        >
                            <CalendarClock className="h-4 w-4 text-amber-600" />
                            <span className="hidden sm:inline">New Scheduled Note</span>
                        </MotionButton>
                    </div>
                </div>
            </header>

            <main className="mx-auto mt-3 w-full max-w-7xl flex-1 px-0 pb-8 sm:px-4">
                {view === 'notes' ? (
                    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-6">
                        {/* ---------------- Note list ---------------- */}
                        <aside className={`${showEditorMobile ? 'hidden lg:flex' : 'flex'} h-[calc(100vh-8rem)] min-h-[420px] flex-col overflow-hidden rounded-xl
                         border border-slate-200 bg-white lg:sticky lg:top-[4.75rem] lg:h-[calc(100vh-6.5rem)]`}>
                            <div className="space-y-2 border-b border-slate-100 p-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -mt-2 text-slate-400" aria-hidden="true" />
                                    <input
                                        type="search"
                                        value={search}
                                        onChange={event => setSearch(event.target.value)}
                                        placeholder="Search notes..."
                                        aria-label="Search notes"
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-xs font-medium transition-all placeholder:font-extralight focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                                {visibleNotes.length > 0 && (
                                    <div className="flex items-center justify-between px-1 text-[11px]">
                                        <label className="flex cursor-pointer items-center gap-2 font-medium text-slate-600">
                                            <Checkbox checked={allVisibleSelected} onChange={toggleSelectAllNotes} label="Select all notes" />
                                            Select all
                                        </label>
                                        {selectedNoteIds.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => askDeleteNotes(selectedNoteIds)}
                                                disabled={isBusy}
                                                className="inline-flex cursor-pointer items-center gap-1 font-bold text-red-600 hover:underline disabled:opacity-50"
                                            >
                                                <Trash2 className="h-3 w-3" /> Delete ({selectedNoteIds.length})
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="min-h-0 flex-1 overflow-y-auto">
                                {listLoading ? <NoteListSkeleton /> : ST_GetNote_?.isError ? (
                                    <div className="m-3 rounded-xl border border-red-200 bg-red-50 p-5 text-center">
                                        <p className="text-xs font-bold text-red-700">Could not load notes.</p>
                                        <button type="button" onClick={refreshNotes} className="mt-3 cursor-pointer rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700">Try again</button>
                                    </div>
                                ) : (
                                    <ul className="space-y-2 p-3">
                                        {visibleNotes.length === 0 && (
                                            <li className="px-4 py-10 text-center">
                                                <StickyNote className="mx-auto h-8 w-8 text-amber-500" />
                                                <p className="mt-3 text-xs font-extralight text-slate-500">
                                                    {notes.length === 0 ? 'No notes yet. Create your first note.' : 'No notes match your search.'}
                                                </p>
                                            </li>
                                        )}
                                        <AnimatePresence initial={false}>
                                            {visibleNotes.map(item => {
                                                const active = item.id === editingId;
                                                const noteEntries = entriesByNote.get(item.id) || [];
                                                return (
                                                    <motion.li
                                                        key={item.id}
                                                        layout="position"
                                                        initial={{ opacity: 0, y: 8 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        transition={{ duration: 0.25, ease: EASE_OUT }}
                                                        className="flex items-start gap-2"
                                                    >
                                                        <div className="pl-1 pt-3.5">
                                                            <Checkbox checked={selectedNoteIds.includes(item.id)} onChange={() => toggleSelectNote(item.id)} label={`Select ${item.note.title || 'Untitled note'}`} />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => openNote(item.id)}
                                                            className={`w-full min-w-0 cursor-pointer rounded-xl border p-3 text-left transition-colors ${active ? 'border-amber-400 bg-amber-50/50' : 'border-slate-200 bg-white hover:border-amber-300'}`}
                                                        >
                                                            <span className="flex items-center justify-between gap-2">
                                                                <span className={`truncate text-xs font-bold ${active ? 'text-amber-700' : 'text-slate-800'}`}>{item.note.title || 'Untitled note'}</span>
                                                                {noteEntries.length > 0 && <NextScheduleBadge entries={noteEntries} doneMap={scheduleState} />}
                                                            </span>
                                                            <span className="mt-1 line-clamp-2 block text-[11px] font-medium text-slate-500">{item.text || 'No content'}</span>
                                                            <span className="mt-1.5 flex items-center justify-between gap-2 text-[11px] font-extralight text-slate-500">
                                                                <span className="truncate">{formatBsStamp(item.note.updatedAt || item.note.createdAt)}</span>
                                                                <span className="flex shrink-0 items-center gap-2">
                                                                    {noteEntries.length > 0 && <span className="inline-flex items-center gap-0.5"><CalendarClock className="h-3 w-3" />{noteEntries.length}</span>}
                                                                    {item.note.attachments?.length > 0 && <span className="inline-flex items-center gap-0.5"><Paperclip className="h-3 w-3" />{item.note.attachments.length}</span>}
                                                                </span>
                                                            </span>
                                                        </button>
                                                    </motion.li>
                                                );
                                            })}
                                        </AnimatePresence>
                                    </ul>
                                )}
                            </div>
                        </aside>

                        {/* ---------------- Editor ---------------- */}
                        <section className={`${showEditorMobile ? 'block' : 'hidden lg:block'} min-w-0 rounded-2xl border border-slate-200 bg-white`}>
                            {useMe.isLoading ? <EditorSkeleton /> : (
                                <>
                                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <MotionButton onClick={() => setShowEditorMobile(false)} aria-label="Back to notes" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden">
                                                <ArrowLeft className="h-4 w-4" />
                                            </MotionButton>
                                            <div className="min-w-0">
                                                <h1 className="truncate text-sm font-bold text-slate-900 sm:text-base">{editingId ? 'Edit Note' : 'Create Note'}</h1>
                                                <p className="truncate text-[11px] font-extralight text-slate-500">
                                                    {editingNote
                                                        ? `Created ${formatBsStamp(editingNote.createdAt)} · Edited ${formatBsStamp(editingNote.updatedAt)}`
                                                        : 'New note · not saved yet'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            {isDirty && (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Unsaved
                                                </span>
                                            )}
                                            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1" role="group" aria-label="Note type">
                                                <button
                                                    type="button"
                                                    disabled={isBusy}
                                                    onClick={() => setScheduledMode(false)}
                                                    aria-pressed={!draftIsScheduled}
                                                    className={`cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors sm:text-xs ${!draftIsScheduled ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                                                >
                                                    Non-Scheduling
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={isBusy}
                                                    onClick={() => setScheduledMode(true)}
                                                    aria-pressed={draftIsScheduled}
                                                    className={`cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors sm:text-xs ${draftIsScheduled ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                                                >
                                                    Scheduling
                                                </button>
                                            </div>
                                            {editingId && (
                                                <MotionButton
                                                    onClick={() => askDeleteNotes([editingId])}
                                                    disabled={isBusy}
                                                    aria-label="Delete note"
                                                    title="Delete note"
                                                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                                >
                                                    {deleting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                </MotionButton>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-5 p-4 sm:p-5">
                                        <div>
                                            <label htmlFor="note-title" className="mb-1.5 block text-xs font-bold text-slate-700">
                                                Note title <span className="text-red-600">*</span>
                                            </label>
                                            <input
                                                id="note-title"
                                                ref={titleRef}
                                                value={draftTitle}
                                                onChange={event => {
                                                    setValidationError(null);
                                                    setDraftTitle(event.target.value);
                                                }}
                                                placeholder="Enter a clear note title"
                                                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-900 outline-none transition-colors placeholder:font-extralight placeholder:text-slate-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                                            />
                                            <InlineMessage>{validationError?.field === 'title' ? validationError.message : ''}</InlineMessage>
                                        </div>

                                        {/* Scheduling fields (Scheduling mode only) */}
                                        <AnimatePresence initial={false}>
                                            {draftIsScheduled && (
                                                <motion.div
                                                    key="schedule-block"
                                                    initial={{ opacity: 0, y: -8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -8 }}
                                                    transition={{ duration: 0.25, ease: EASE_OUT }}
                                                    className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/40 p-3 sm:p-4"
                                                >
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <div>
                                                            <h2 className="flex items-center gap-1.5 text-sm font-bold text-amber-800">
                                                                <Clock className="h-3.5 w-3.5 text-amber-600" /> Schedule details &amp; countdown
                                                            </h2>
                                                            <p className="text-[11px] font-extralight text-slate-500">Nepal Time (UTC+5:45) · reminders at 30m, 15m, 5m and the due time</p>
                                                        </div>
                                                        <MotionButton onClick={addSchedule} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-50">
                                                            <CalendarPlus className="h-3.5 w-3.5" /> Add schedule
                                                        </MotionButton>
                                                    </div>
                                                    <InlineMessage>{validationError?.field === 'schedules' ? validationError.message : ''}</InlineMessage>

                                                    {draftSchedules.length === 0 && (
                                                        <p className="rounded-lg border border-dashed border-amber-300 bg-white p-4 text-center text-xs text-slate-500">No schedule entries yet. Add one to set a date and time.</p>
                                                    )}

                                                    <AnimatePresence initial={false}>
                                                        {draftSchedules.map((schedule, index) => {
                                                            const dueAt = computeDueAt(extractBsDate(schedule.bsDate), schedule.time);
                                                            const scheduleError = validationError?.scheduleIndex === index ? validationError : null;
                                                            return (
                                                                <motion.div
                                                                    key={schedule._key}
                                                                    initial={{ opacity: 0, y: 8 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0, scale: 0.98 }}
                                                                    transition={{ duration: 0.2 }}
                                                                    className="rounded-xl border border-amber-200 bg-white p-3 sm:p-4"
                                                                >
                                                                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                                                        <p className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                                                                            <CalendarClock className="h-3.5 w-3.5 text-amber-600" /> Schedule {index + 1}
                                                                        </p>
                                                                        <div className="flex items-center gap-2">
                                                                            {dueAt && (
                                                                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800">
                                                                                    <Clock className="h-3 w-3" />
                                                                                    <Countdown dueAt={dueAt} />
                                                                                </span>
                                                                            )}
                                                                            <MotionButton onClick={() => removeDraftSchedule(schedule._key)} aria-label={`Remove schedule ${index + 1}`} className="rounded-lg px-2 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50">
                                                                                Remove
                                                                            </MotionButton>
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                                        <div className="sm:col-span-2">
                                                                            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Description</label>
                                                                            <input
                                                                                value={schedule.label}
                                                                                onChange={event => updateSchedule(schedule._key, 'label', event.target.value)}
                                                                                placeholder="What is this schedule for?"
                                                                                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-medium outline-none transition-colors placeholder:font-extralight focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                                                                            />
                                                                            <InlineMessage>{scheduleError?.field === 'label' ? scheduleError.message : ''}</InlineMessage>
                                                                        </div>
                                                                        <div>
                                                                            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Nepali date (BS)</label>
                                                                            <NepaliDateInput
                                                                                value={schedule.bsDate}
                                                                                onChange={value => updateSchedule(schedule._key, 'bsDate', extractBsDate(value))}
                                                                                placeholder="Select BS date"
                                                                            />
                                                                            <InlineMessage>{scheduleError?.field === 'date' ? scheduleError.message : ''}</InlineMessage>
                                                                        </div>
                                                                        <div>
                                                                            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Time (12-hour)</label>
                                                                            <TimePickerUI
                                                                                value={schedule.time}
                                                                                onChange={value => updateSchedule(schedule._key, 'time', value)}
                                                                                placeholder="Select time"
                                                                            />
                                                                            <InlineMessage>{scheduleError?.field === 'time' ? scheduleError.message : ''}</InlineMessage>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            );
                                                        })}
                                                    </AnimatePresence>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Rich-text editor */}
                                        <div>
                                            <label className="mb-1.5 block text-xs font-bold text-slate-700">
                                                Note content <span className="text-red-600">*</span>
                                            </label>
                                            <div
                                                onDragEnter={event => { if (hasFiles(event)) { event.preventDefault(); setIsDragging(true); } }}
                                                onDragOver={event => { if (hasFiles(event)) event.preventDefault(); }}
                                                onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget)) setIsDragging(false); }}
                                                onDrop={event => {
                                                    if (!hasFiles(event)) return;
                                                    event.preventDefault();
                                                    setIsDragging(false);
                                                    addFiles(Array.from(event.dataTransfer.files || []));
                                                }}
                                                className={`relative overflow-hidden rounded-xl border bg-white transition-shadow focus-within:ring-2 focus-within:ring-amber-100 ${isDragging ? 'border-amber-500 ring-2 ring-amber-200' : 'border-slate-200 focus-within:border-amber-400'}`}
                                            >
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    multiple
                                                    accept={ACCEPT}
                                                    onChange={event => { addFiles(Array.from(event.target.files || [])); event.target.value = ''; }}
                                                    className="sr-only"
                                                    tabIndex={-1}
                                                />
                                                <AnimatePresence>
                                                    {isDragging && (
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-amber-50/90"
                                                        >
                                                            <p className="text-xs font-bold text-amber-700">Drop files to attach to this note</p>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                <div className="space-y-2 border-b border-slate-200 bg-slate-50 p-2" role="toolbar" aria-label="Text formatting">
                                                    <div className="flex flex-wrap items-center gap-1">
                                                        <MotionButton
                                                            onClick={() => fileInputRef.current?.click()}
                                                            disabled={draftAttachments.length >= MAX_ATTACHMENTS}
                                                            aria-label="Attach files"
                                                            title={`Attach files (max ${MAX_ATTACHMENTS} files, ${formatFileSize(MAX_UPLOAD_SIZE).replace('.00', '')} each · ${TYPE_HINT})`}
                                                            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 transition-colors hover:border-amber-400 hover:text-amber-700"
                                                        >
                                                            <Paperclip className="h-3.5 w-3.5" />
                                                            Attach ({draftAttachments.length}/{MAX_ATTACHMENTS})
                                                        </MotionButton>
                                                        <span className="mx-1 hidden h-5 w-px bg-slate-200 sm:block" aria-hidden="true" />
                                                        {[...FORMAT_TOOLS, ...BLOCK_TOOLS].map(tool => (
                                                            <MotionButton
                                                                key={tool.command}
                                                                aria-label={tool.label}
                                                                title={tool.label}
                                                                aria-pressed={Boolean(formattingState[tool.command])}
                                                                onMouseDown={event => { event.preventDefault(); exec(tool.command); }}
                                                                className={`h-8 min-w-8 rounded-md px-2 text-xs transition-colors ${formattingState[tool.command] ? 'bg-amber-100 font-bold text-amber-800' : 'font-medium text-slate-700 hover:bg-white hover:text-amber-700'} ${tool.className || ''}`}
                                                            >
                                                                {tool.text}
                                                            </MotionButton>
                                                        ))}
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                                        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Text colour">
                                                            <span className="text-[11px] font-extralight text-slate-500">Text</span>
                                                            {SWATCHES.map(color => (
                                                                <motion.button
                                                                    key={color}
                                                                    type="button"
                                                                    aria-label={`Text colour ${color}`}
                                                                    whileHover={{ scale: 1.15 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    transition={softSpring}
                                                                    onMouseDown={event => { event.preventDefault(); exec('foreColor', color); }}
                                                                    className="h-5 w-5 cursor-pointer rounded-full ring-1 ring-slate-200"
                                                                    style={{ backgroundColor: color }}
                                                                />
                                                            ))}
                                                            <input
                                                                type="color"
                                                                aria-label="Custom text colour"
                                                                onChange={event => exec('foreColor', event.target.value)}
                                                                className="h-5 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
                                                            />
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Highlight colour">
                                                            <span className="text-[11px] font-extralight text-slate-500">Highlight</span>
                                                            {HIGHLIGHTS.map(color => (
                                                                <motion.button
                                                                    key={color}
                                                                    type="button"
                                                                    aria-label={`Highlight ${color}`}
                                                                    whileHover={{ scale: 1.15 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    transition={softSpring}
                                                                    onMouseDown={event => { event.preventDefault(); exec('hiliteColor', color); }}
                                                                    className="h-5 w-5 cursor-pointer rounded-md ring-1 ring-slate-200"
                                                                    style={{ backgroundColor: color }}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Text effects">
                                                        <span className="mr-1 text-[11px] font-extralight text-slate-500">Effects</span>
                                                        {FONT_EFFECTS.map(effect => (
                                                            <MotionButton
                                                                key={effect.id}
                                                                onMouseDown={event => { event.preventDefault(); wrapSelection(effect.styles); }}
                                                                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 transition-colors hover:border-amber-400 hover:text-amber-700"
                                                            >
                                                                {effect.label}
                                                            </MotionButton>
                                                        ))}
                                                        <MotionButton
                                                            onMouseDown={event => { event.preventDefault(); exec('removeFormat'); }}
                                                            className="rounded-md px-2 py-1 text-[11px] font-medium text-red-600 transition-colors hover:bg-red-50"
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
                                                    data-placeholder="Start writing your note..."
                                                    onInput={handleEditorInput}
                                                    onPaste={handlePaste}
                                                    onKeyUp={readFormatting}
                                                    onMouseUp={readFormatting}
                                                    className="min-h-[200px] max-h-[420px] cursor-text overflow-y-auto p-4 text-sm leading-relaxed text-slate-800 outline-none empty:before:font-extralight empty:before:text-slate-300 empty:before:content-[attr(data-placeholder)] [&_li]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6"
                                                />

                                                <InlineMessage>{validationError?.field === 'content' ? validationError.message : ''}</InlineMessage>

                                                {(uploadError || validationError?.field === 'attachments' || draftAttachments.length > 0) && (
                                                    <div className="border-t border-slate-200 bg-slate-50/60 p-3">
                                                        <InlineMessage>{uploadError}</InlineMessage>
                                                        <InlineMessage>{validationError?.field === 'attachments' ? validationError.message : ''}</InlineMessage>
                                                        {draftAttachments.length > 0 && (
                                                            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2" aria-label="Note attachments">
                                                                <AnimatePresence initial={false}>
                                                                    {draftAttachments.map(attachment => (
                                                                        <AttachmentCard
                                                                            key={attachment.key}
                                                                            attachment={attachment}
                                                                            onOpen={setPreviewAttachment}
                                                                            onRemove={removeAttachment}
                                                                        />
                                                                    ))}
                                                                </AnimatePresence>
                                                            </ul>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sticky action bar */}
                                    <div className="sticky bottom-0 z-10 flex flex-col-reverse gap-2 rounded-b-2xl border-t border-slate-100 bg-white/95 px-4 py-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-5">
                                        <p className="text-[11px] font-extralight text-slate-500">Nothing is saved or uploaded until you click {editingId ? 'Update' : 'Create'} Note.</p>
                                        <InlineMessage>{validationError?.field === 'form' ? validationError.message : ''}</InlineMessage>
                                        <div className="flex flex-col-reverse gap-2 sm:flex-row">
                                            {(editingId || isDirty) && (
                                                <MotionButton onClick={cancelEdit} disabled={isBusy} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 sm:py-2">
                                                    {editingId ? 'Cancel edit' : 'Clear'}
                                                </MotionButton>
                                            )}
                                            <MotionButton
                                                onClick={handleSave}
                                                disabled={isBusy || useMe.isLoading}
                                                className={`inline-flex min-w-36 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white sm:py-2 ${GRADIENT}`}
                                            >
                                                {actionPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                                {actionPending === 'update' ? 'Updating...' : actionPending === 'create' ? 'Creating...' : editingId ? 'Update Note' : 'Create Note'}
                                            </MotionButton>
                                        </div>
                                    </div>
                                </>
                            )}
                        </section>
                    </div>
                ) : (
                    <SchedulePanel
                        entries={scheduleEntries}
                        doneMap={scheduleState}
                        isLoading={listLoading}
                        isError={Boolean(ST_GetNote_?.isError)}
                        onRetry={refreshNotes}
                        onToggleDone={toggleScheduleDone}
                        onOpenNote={openNote}
                        onRemove={removeScheduleEntries}
                        removing={removingSchedules}
                        requestConfirm={requestConfirm}
                    />
                )}
            </main>

            <AnimatePresence>
                {previewAttachment && <PreviewModal key={previewAttachment.key} attachment={previewAttachment} onClose={() => setPreviewAttachment(null)} />}
            </AnimatePresence>
            <AnimatePresence>
                {confirm && <ConfirmDialog key="confirm" confirm={confirm} onClose={() => setConfirm(null)} />}
            </AnimatePresence>
            <ToastStack toasts={toasts} onDismiss={dismissToast} />
        </div>
    );
}