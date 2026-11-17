import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { File, FileArchive, FileAudio, FileCode, FileImage, FileSpreadsheet, FileText, FileVideo, Check } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Motion presets                                                      */
/* ------------------------------------------------------------------ */
const EASE_OUT = [0.22, 1, 0.36, 1]; // soft, gentle settle

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.35 } },
};

// lighter stagger for lists inside the drawer
const listStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT },
  },
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

// slower, softer spring for hover/tap feedback
const softSpring = { type: 'spring', stiffness: 180, damping: 22 };

const GRADIENT = 'bg-gradient-to-r from-amber-500 to-orange-500';
const MAX_ATTACHMENT_SIZE = 50 * 1024 * 1024;

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */
const RECIPIENT_GROUPS = [
  {
    cat: 'Educational Institutions (Clients)',
    color: 'text-amber-600',
    type: 'clients',
    items: ['Chaturbhujeshwar Janata Multiple Campus', 'Everest Academy & Colleges', 'Sunrise Secondary School']
  },
  {
    cat: 'Internal Office Teams',
    color: 'text-orange-600',
    type: 'internal',
    items: ['Sales & Business Team', 'Consultants & Legal Advisory', 'Document Writers & Drafting', 'Document Controllers']
  },
  {
    cat: 'Headquarter Executives',
    color: 'text-amber-600',
    type: 'headquarter',
    items: ['CRO Executive Board', 'Compliance Board Directorate']
  }
];

const FORMAT_TOOLS = [
  { command: 'bold', label: 'Bold', text: 'B', className: 'font-black' },
  { command: 'italic', label: 'Italic', text: 'I', className: 'italic' },
  { command: 'underline', label: 'Underline', text: 'U', className: 'underline' },
  { command: 'insertUnorderedList', label: 'Bulleted list', text: '• List', className: '' },
  { command: 'insertOrderedList', label: 'Numbered list', text: '1. List', className: '' }
];

const PRIORITIES = [
  { value: 'Normal', activeClass: 'border-slate-400 text-slate-700', pill: 'bg-slate-100' },
  { value: 'High', activeClass: 'border-amber-400 text-amber-700', pill: 'bg-amber-50' },
  { value: 'Urgent', activeClass: 'border-red-400 text-red-700', pill: 'bg-red-50' }
];

const getFileIcon = (filename) => {
  const extension = filename.split('.').pop()?.toLowerCase();
  if (['pdf', 'doc', 'docx', 'rtf', 'txt', 'ppt', 'pptx'].includes(extension)) return { Icon: FileText, color: 'text-amber-600' };
  if (['xls', 'xlsx', 'csv'].includes(extension)) return { Icon: FileSpreadsheet, color: 'text-orange-600' };
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(extension)) return { Icon: FileImage, color: 'text-orange-600' };
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return { Icon: FileArchive, color: 'text-amber-600' };
  if (['mp3', 'wav', 'ogg', 'm4a'].includes(extension)) return { Icon: FileAudio, color: 'text-orange-600' };
  if (['mp4', 'mov', 'avi', 'mkv'].includes(extension)) return { Icon: FileVideo, color: 'text-amber-600' };
  if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'xml'].includes(extension)) return { Icon: FileCode, color: 'text-orange-600' };
  return { Icon: File, color: 'text-slate-500' };
};

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(2) + ' MB';
};

// Keep only the formatting tags the editor can produce before rendering stored HTML.
const ALLOWED_TAGS = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'UL', 'OL', 'LI', 'BR', 'DIV', 'P', 'SPAN']);
const sanitizeHtml = (html) => {
  const doc = new DOMParser().parseFromString(`<body>${html || ''}</body>`, 'text/html');
  const walk = (node) => {
    Array.from(node.childNodes).forEach(child => {
      if (child.nodeType === 1) {
        if (!ALLOWED_TAGS.has(child.tagName)) {
          child.replaceWith(document.createTextNode(child.textContent || ''));
          return;
        }
        Array.from(child.attributes).forEach(attr => child.removeAttribute(attr.name));
        walk(child);
      } else if (child.nodeType !== 3) {
        child.remove();
      }
    });
  };
  walk(doc.body);
  return doc.body.innerHTML;
};

/* ------------------------------------------------------------------ */
/* Shared building blocks                                              */
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

const Skeleton = ({ className = '' }) => (
  <motion.div
    aria-hidden="true"
    className={`rounded-md bg-slate-200 ${className}`}
    animate={{ opacity: [0.45, 0.9, 0.45] }}
    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
  />
);

const ComposeSkeleton = () => (
  <div className="space-y-5 p-5" aria-hidden="true">
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-40" />
      </div>
      <Skeleton className="h-36 w-full rounded-xl" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-9 w-full rounded-xl" />
    </div>
    <div className="grid grid-cols-3 gap-2">
      <Skeleton className="h-9 rounded-xl" />
      <Skeleton className="h-9 rounded-xl" />
      <Skeleton className="h-9 rounded-xl" />
    </div>
    <Skeleton className="h-32 w-full rounded-xl" />
    <Skeleton className="h-10 w-full rounded-xl" />
  </div>
);

const LogSkeleton = () => (
  <div className="space-y-3 p-5" aria-hidden="true">
    {[0, 1].map(i => (
      <div key={i} className="space-y-2.5 rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>
        <Skeleton className="h-12 w-full rounded-lg" />
        <div className="flex gap-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    ))}
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

const Spinner = ({ className = 'h-4 w-4' }) => (
  <motion.span
    aria-hidden="true"
    className={`inline-block rounded-full border-2 border-white/40 border-t-white ${className}`}
    animate={{ rotate: 360 }}
    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
  />
);

const FormError = ({ children }) => (
  <AnimatePresence initial={false}>
    {children && (
      <motion.p
        initial={{ opacity: 0, y: -6, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -6, height: 0 }}
        transition={{ duration: 0.3, ease: EASE_OUT }}
        className="mt-2 overflow-hidden rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
        role="alert"
      >
        {children}
      </motion.p>
    )}
  </AnimatePresence>
);

const readQueryStates = () =>
  Object.fromEntries(FORMAT_TOOLS.map(({ command }) => [command, document.queryCommandState(command)]));

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export default function NotifyDrawer({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('compose');
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState('Normal');
  const [recipients, setRecipients] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [attachmentError, setAttachmentError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [isDraggingAttachment, setIsDraggingAttachment] = useState(false);
  const [formattingState, setFormattingState] = useState({});
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messageEditorRef = useRef(null);
  const attachmentInputRef = useRef(null);
  const replacementInputRef = useRef(null);
  const attachmentProgressTimer = useRef(null);
  const replacementAttachmentId = useRef(null);
  const nextAttachmentId = useRef(0);
  const sendTimer = useRef(null);
  const [broadcastLogs, setBroadcastLogs] = useState(() => {
    try {
      const stored = localStorage.getItem('nexus_dms_broadcast_logs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    // TODO: Sync broadcast logs with backend persistence API
    try {
      localStorage.setItem('nexus_dms_broadcast_logs', JSON.stringify(broadcastLogs));
    } catch { /* storage unavailable */ }
  }, [broadcastLogs]);

  // Skeleton shows briefly each time the drawer opens or the tab changes.
  // TODO: replace with the real loading flag from the broadcast/logs API.
  useEffect(() => {
    if (!isOpen) return undefined;
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 650);
    return () => clearTimeout(t);
  }, [isOpen, activeTab]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const bodyOverflow = document.body.style.overflow;
    const documentOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = documentOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => () => {
    clearInterval(attachmentProgressTimer.current);
    clearTimeout(sendTimer.current);
  }, []);

  useEffect(() => {
    if (attachments.some(attachment => attachment.progress < 100)) {
      if (!attachmentProgressTimer.current) {
        attachmentProgressTimer.current = setInterval(() => {
          setAttachments(prev => prev.map(attachment => ({
            ...attachment,
            progress: Math.min(attachment.progress + 10, 100)
          })));
        }, 80);
      }
    } else if (attachmentProgressTimer.current) {
      clearInterval(attachmentProgressTimer.current);
      attachmentProgressTimer.current = null;
    }
  }, [attachments]);

  useEffect(() => {
    const updateFormattingState = () => {
      const editor = messageEditorRef.current;
      const selection = document.getSelection();
      if (!editor || !selection?.anchorNode || !editor.contains(selection.anchorNode)) return;
      setFormattingState(readQueryStates());
    };

    document.addEventListener('selectionchange', updateFormattingState);
    return () => document.removeEventListener('selectionchange', updateFormattingState);
  }, []);

  const startAttachmentUpload = (files, replaceId = null) => {
    const oversizedFiles = files.filter(file => file.size > MAX_ATTACHMENT_SIZE);
    const acceptedFiles = files.filter(file => file.size <= MAX_ATTACHMENT_SIZE);
    setAttachmentError(oversizedFiles.length > 0
      ? `${oversizedFiles.map(file => file.name).join(', ')} exceeds the 50 MB limit.`
      : null);
    if (acceptedFiles.length === 0) return;

    if (replaceId) {
      const [replacement] = acceptedFiles;
      setAttachments(prev => prev.map(attachment => (
        attachment.id === replaceId
          ? { ...attachment, file: replacement, progress: 0 }
          : attachment
      )));
      return;
    }

    setAttachments(prev => [
      ...prev,
      ...acceptedFiles.map(file => ({
        id: `broadcast-attachment-${nextAttachmentId.current++}`,
        file,
        progress: 0
      }))
    ]);
  };

  const handleReplaceAttachment = (attachmentId) => {
    replacementAttachmentId.current = attachmentId;
    if (replacementInputRef.current) replacementInputRef.current.value = '';
    replacementInputRef.current?.click();
  };

  const handleAttachmentInputChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) startAttachmentUpload(files);
    event.target.value = '';
  };

  const handleReplacementInputChange = (event) => {
    const file = event.target.files?.[0];
    const replaceId = replacementAttachmentId.current;
    replacementAttachmentId.current = null;
    if (file && replaceId) startAttachmentUpload([file], replaceId);
    event.target.value = '';
  };

  const handleRemoveAttachment = (attachmentId) => {
    setAttachments(prev => prev.filter(attachment => attachment.id !== attachmentId));
  };

  const handleRecipientToggle = (val) => {
    setFormError(null);
    setRecipients(prev => (prev.includes(val) ? prev.filter(r => r !== val) : [...prev, val]));
  };

  const handleGroupSelect = (type) => {
    setFormError(null);
    const allItems = RECIPIENT_GROUPS.flatMap(group => group.items);
    if (type === 'all') setRecipients(allItems);
    else if (type === 'clear') setRecipients([]);
    else setRecipients(RECIPIENT_GROUPS.find(group => group.type === type)?.items || []);
  };

  const handleSend = () => {
    if (isSending) return;
    if (!subject.trim()) {
      setFormError('Please enter a broadcast subject.');
      return;
    }
    if (recipients.length === 0) {
      setFormError('Please select at least one recipient.');
      return;
    }
    if (attachments.some(attachment => attachment.progress !== 100)) {
      setFormError('Please wait for all attachments to finish uploading.');
      return;
    }
    setFormError(null);

    const editorEl = messageEditorRef.current;
    const messageHtml = sanitizeHtml(editorEl ? editorEl.innerHTML : '');

    const newLog = {
      id: 'broadcast-' + Date.now(),
      subject: subject.trim(),
      priority,
      messageHtml,
      recipients,
      attachmentNames: attachments.map(attachment => attachment.file.name),
      sentAt: new Date().toISOString()
    };

    setIsSending(true);
    // TODO: Integrate broadcast sending API endpoint (replace this timer with the awaited request)
    sendTimer.current = setTimeout(() => {
      setBroadcastLogs(prev => [newLog, ...prev]);
      setSubject('');
      setRecipients([]);
      setAttachments([]);
      setAttachmentError(null);
      clearInterval(attachmentProgressTimer.current);
      attachmentProgressTimer.current = null;
      replacementAttachmentId.current = null;
      setFormattingState({});
      if (attachmentInputRef.current) attachmentInputRef.current.value = '';
      if (replacementInputRef.current) replacementInputRef.current.value = '';
      if (editorEl) editorEl.innerHTML = '';
      setIsSending(false);
      setActiveTab('logs');
    }, 900);
  };

  const tabs = [
    { id: 'compose', label: 'Compose Broadcast' },
    { id: 'logs', label: 'Sent Broadcast Logs' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            key="panel"
            className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-slate-200 bg-white font-sans sm:w-[480px]"
            initial={{ x: '100%' }}
            animate={{ x: 0, transition: { duration: 0.5, ease: EASE_OUT } }}
            exit={{ x: '100%', transition: { duration: 0.35, ease: EASE_OUT } }}
            role="dialog"
            aria-modal="true"
            aria-label="Notify to all"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Notify To All</h2>
                  <p className="text-xs font-extralight text-slate-500">Broadcast documents & alerts to network recipients</p>
                </div>
              </div>
              <MotionButton
                onClick={onClose}
                aria-label="Close drawer"
                title="Close"
                className="rounded-lg p-1.5 text-slate-400 transition-colors duration-300 hover:bg-slate-200 hover:text-slate-600"
              >
                <motion.svg variants={iconVariants} transition={softSpring} className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </motion.svg>
              </MotionButton>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-white" role="tablist">
              {tabs.map(tab => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex-1 cursor-pointer py-2.5 text-center text-xs transition-colors duration-300 ${active ? 'bg-amber-50/20 font-bold text-amber-600' : 'font-medium text-slate-500 hover:text-slate-900'}`}
                  >
                    {tab.label}
                    {active && (
                      <motion.span layoutId="drawer-tab-underline" className="absolute inset-x-0 bottom-0 h-0.5 bg-amber-500" transition={softSpring} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab contents */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                activeTab === 'compose' ? <ComposeSkeleton key="s-compose" /> : <LogSkeleton key="s-logs" />
              ) : activeTab === 'compose' ? (
                <motion.div key="compose" variants={stagger} initial="hidden" animate="show" className="space-y-5 p-5">
                  {/* Recipients */}
                  <motion.div variants={fadeUp}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Recipients</span>
                      <div className="flex items-center gap-1">
                        {[
                          { type: 'all', label: 'All' },
                          { type: 'clients', label: 'Clients' },
                          { type: 'internal', label: 'Internal' },
                          { type: 'clear', label: 'Clear', danger: true }
                        ].map(btn => (
                          <MotionButton
                            key={btn.type}
                            onClick={() => handleGroupSelect(btn.type)}
                            className={`rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium transition-colors duration-300 hover:bg-slate-200 ${btn.danger ? 'text-red-600' : 'text-slate-700'}`}
                          >
                            {btn.label}
                          </MotionButton>
                        ))}
                      </div>
                    </div>

                    <div className="max-h-52 space-y-3 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                      {RECIPIENT_GROUPS.map((group) => (
                        <div key={group.type}>
                          <p className={`mb-1.5 text-[10px] font-bold uppercase ${group.color}`}>{group.cat}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {group.items.map(item => {
                              const selected = recipients.includes(item);
                              return (
                                <MotionButton
                                  key={item}
                                  onClick={() => handleRecipientToggle(item)}
                                  aria-pressed={selected}
                                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] transition-colors duration-300 ${selected ? 'border-amber-400 bg-amber-50 font-bold text-amber-800' : 'border-slate-200 bg-white font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900'}`}
                                >
                                  <AnimatePresence initial={false}>
                                    {selected && (
                                      <motion.span
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: 'auto', opacity: 1 }}
                                        exit={{ width: 0, opacity: 0 }}
                                        transition={{ duration: 0.25, ease: EASE_OUT }}
                                        className="flex overflow-hidden"
                                      >
                                        <Check className="h-3 w-3 stroke-[3]" aria-hidden="true" />
                                      </motion.span>
                                    )}
                                  </AnimatePresence>
                                  {item}
                                </MotionButton>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="mt-1.5 text-[10px] font-extralight text-slate-500">
                      {recipients.length === 0 ? 'No recipients selected' : `${recipients.length} selected`}
                    </p>
                  </motion.div>

                  {/* Subject */}
                  <motion.div variants={fadeUp}>
                    <label htmlFor="broadcast-subject" className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">Broadcast Subject</label>
                    <input
                      id="broadcast-subject"
                      type="text"
                      value={subject}
                      onChange={(e) => { setSubject(e.target.value); setFormError(null); }}
                      placeholder="e.g., Compliance Guidelines Update 2026"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium transition-all duration-300 placeholder:font-extralight focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </motion.div>

                  {/* Priority */}
                  <motion.div variants={fadeUp}>
                    <span id="priority-label" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">Priority</span>
                    <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-labelledby="priority-label">
                      {PRIORITIES.map(option => {
                        const active = priority === option.value;
                        return (
                          <MotionButton
                            key={option.value}
                            role="radio"
                            aria-checked={active}
                            onClick={() => setPriority(option.value)}
                            className={`relative rounded-xl border px-2 py-2 text-xs transition-colors duration-300 ${active ? `${option.activeClass} font-bold` : 'border-slate-200 bg-white font-medium text-slate-600 hover:border-slate-300'}`}
                          >
                            {active && (
                              <motion.span
                                layoutId="priority-pill"
                                className={`absolute inset-0 rounded-xl ${option.pill}`}
                                transition={softSpring}
                              />
                            )}
                            <span className="relative">{option.value}</span>
                          </MotionButton>
                        );
                      })}
                    </div>
                  </motion.div>

                  {/* Message */}
                  <motion.div variants={fadeUp}>
                    <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">Message Content</span>
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow duration-300 focus-within:ring-2 focus-within:ring-amber-500">
                      <div className="flex items-center gap-1 border-b border-slate-200 bg-slate-50 p-2" role="toolbar" aria-label="Message formatting">
                        {FORMAT_TOOLS.map(tool => (
                          <MotionButton
                            key={tool.command}
                            aria-label={tool.label}
                            title={tool.label}
                            aria-pressed={Boolean(formattingState[tool.command])}
                            onMouseDown={(event) => {
                              event.preventDefault();
                              const editor = messageEditorRef.current;
                              editor?.focus();
                              document.execCommand(tool.command, false);
                              if (editor) setFormattingState(readQueryStates());
                            }}
                            className={`rounded-md px-2 py-1 text-xs transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${formattingState[tool.command] ? 'bg-amber-100 font-bold text-amber-800' : 'font-medium text-slate-700 hover:bg-white hover:text-amber-700'} ${tool.className}`}
                          >
                            {tool.text}
                          </MotionButton>
                        ))}
                      </div>
                      <div
                        ref={messageEditorRef}
                        contentEditable
                        suppressContentEditableWarning
                        role="textbox"
                        aria-label="Message content"
                        aria-multiline="true"
                        onKeyUp={() => setFormattingState(readQueryStates())}
                        onMouseUp={() => setFormattingState(readQueryStates())}
                        className="max-h-[160px] min-h-[90px] cursor-text overflow-y-auto p-3 text-xs font-medium focus:outline-none [&_li]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                      />
                    </div>
                  </motion.div>

                  {/* Attachments */}
                  <motion.div variants={fadeUp}>
                    <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">Broadcast Attachment</span>
                    <input ref={attachmentInputRef} type="file" multiple onChange={handleAttachmentInputChange} className="sr-only" tabIndex={-1} />
                    <input ref={replacementInputRef} type="file" onChange={handleReplacementInputChange} className="sr-only" tabIndex={-1} />
                    <motion.div
                      animate={{ scale: isDraggingAttachment ? 1.01 : 1 }}
                      transition={softSpring}
                      onDragEnter={(event) => { event.preventDefault(); setIsDraggingAttachment(true); }}
                      onDragOver={(event) => event.preventDefault()}
                      onDragLeave={(event) => {
                        if (!event.currentTarget.contains(event.relatedTarget)) setIsDraggingAttachment(false);
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        setIsDraggingAttachment(false);
                        if (event.dataTransfer.files?.length) startAttachmentUpload(Array.from(event.dataTransfer.files));
                      }}
                      className={`rounded-xl border-2 border-dashed p-4 text-center transition-colors duration-300 ${isDraggingAttachment ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-slate-50 hover:border-amber-300 hover:bg-amber-50/50'}`}
                    >
                      <p className="text-xs font-medium text-slate-700">Drag and drop files here or select them from your device</p>
                      <p className="mt-1 text-[10px] font-extralight text-slate-500">Select multiple files · maximum 50 MB per file</p>
                      <div className="mt-3 flex items-center justify-center">
                        <MotionButton
                          onClick={() => attachmentInputRef.current?.click()}
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold text-white ${GRADIENT}`}
                        >
                          Browse files
                        </MotionButton>
                      </div>
                    </motion.div>
                    <FormError>{attachmentError}</FormError>

                    {attachments.length > 0 && (
                      <ul className="mt-3 space-y-2" aria-label="Broadcast attachments">
                        <AnimatePresence initial={false}>
                          {attachments.map(attachment => {
                            const { Icon, color } = getFileIcon(attachment.file.name);
                            const isComplete = attachment.progress === 100;
                            return (
                              <motion.li
                                key={attachment.id}
                                layout
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } }}
                                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.25, ease: EASE_OUT } }}
                                className="rounded-xl border border-slate-200 bg-white p-3"
                              >
                                <div className="flex items-start gap-2">
                                  <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${color}`} aria-hidden="true" />
                                  <div className="min-w-0 flex-1 text-left">
                                    <p className="truncate text-xs font-bold text-slate-700">{attachment.file.name}</p>
                                    <div className="mt-1 flex items-center gap-1.5 text-[10px] font-extralight text-slate-500">
                                      <span>{formatFileSize(attachment.file.size)}</span>
                                      <span>·</span>
                                      {isComplete ? (
                                        <span className="inline-flex items-center gap-1 font-medium text-emerald-600">
                                          <span>Complete</span>
                                          <Check className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden="true" />
                                        </span>
                                      ) : (
                                        <span className="font-medium">Uploading {attachment.progress}%</span>
                                      )}
                                    </div>
                                    <ProgressBar value={attachment.progress} complete={isComplete} label={`Uploading ${attachment.file.name}`} />
                                  </div>
                                  <div className="flex shrink-0 items-center gap-1">
                                    <MotionButton
                                      onClick={() => handleReplaceAttachment(attachment.id)}
                                      disabled={!isComplete}
                                      aria-label={`Replace ${attachment.file.name}`}
                                      className="rounded-lg px-2 py-1 text-[10px] font-medium text-amber-700 transition-colors duration-300 hover:bg-amber-50"
                                    >
                                      Replace
                                    </MotionButton>
                                    <MotionButton
                                      onClick={() => handleRemoveAttachment(attachment.id)}
                                      aria-label={`Remove ${attachment.file.name}`}
                                      className="rounded-lg px-2 py-1 text-[10px] font-medium text-slate-600 transition-colors duration-300 hover:bg-slate-100 hover:text-red-600"
                                    >
                                      Remove
                                    </MotionButton>
                                  </div>
                                </div>
                              </motion.li>
                            );
                          })}
                        </AnimatePresence>
                      </ul>
                    )}
                  </motion.div>

                  {/* Send */}
                  <motion.div variants={fadeUp}>
                    <FormError>{formError}</FormError>
                    <MotionButton
                      onClick={handleSend}
                      disabled={isSending}
                      className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white ${GRADIENT}`}
                    >
                      {isSending ? (<><Spinner /> Sending…</>) : 'Send Broadcast Notification'}
                    </MotionButton>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div key="logs" variants={listStagger} initial="hidden" animate="show" className="space-y-3 p-5">
                  {broadcastLogs.length === 0 ? (
                    <motion.div variants={fadeUp} className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs font-extralight text-slate-500">
                      No sent broadcast logs found
                    </motion.div>
                  ) : (
                    broadcastLogs.map(log => (
                      <motion.div
                        key={log.id}
                        variants={fadeUp}
                        whileHover={{ y: -2 }}
                        transition={softSpring}
                        className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 transition-colors duration-300 hover:border-amber-300"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{log.subject}</h4>
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${log.priority === 'Urgent' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>{log.priority}</span>
                        </div>
                        <div
                          className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs font-medium text-slate-600 [&_li]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(log.messageHtml) }}
                        />
                        <div className="flex flex-wrap gap-1 pt-1">
                          {log.recipients.map(r => (
                            <span key={r} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">{r}</span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2 text-[10px] font-extralight text-slate-500">
                          <span>Sent: {new Date(log.sentAt).toLocaleString()}</span>
                          <span className="truncate">
                            {(log.attachmentNames?.length || log.attachmentName)
                              ? `📎 ${(log.attachmentNames || [log.attachmentName]).join(', ')}`
                              : 'No attachment'}
                          </span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}