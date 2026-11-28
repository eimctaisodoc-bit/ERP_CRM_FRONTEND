import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Select from 'react-select';
import {
  File,
  FileArchive,
  FileAudio,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  FolderInput,
  Copy,
  Trash2,
  Download,
  Check,
  LoaderCircle,
} from 'lucide-react';
import NotifyDrawer from './notifydrawer';
import { useAuth } from '../../hooks/useAuth';
import { useGet } from '../../hooks/useGet';
import { Skeleton } from '../../skeleton';


/* ------------------------------------------------------------------ */
/* Motion presets                                                      */
/* ------------------------------------------------------------------ */
const EASE_OUT = [0.22, 1, 0.36, 1]; // soft, gentle settle

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.35 } },
};

// lighter stagger for lists of cards inside a column
const listStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
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
const DROP_ZONE_ACTIVE = ['border-amber-500', 'bg-amber-50/50', 'ring-2', 'ring-orange-400/60'];

/* ------------------------------------------------------------------ */
/* React-Select Theme Styles (Amber / Orange Brand)                    */
/* ------------------------------------------------------------------ */
const reactSelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '42px',
    borderRadius: '0.75rem',
    borderColor: state.isFocused ? '#f59e0b' : '#e2e8f0',
    backgroundColor: state.isFocused ? '#ffffff' : '#f8fafc',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(254, 243, 199, 0.9)' : 'none',
    fontSize: '0.75rem',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    '&:hover': {
      borderColor: '#f59e0b',
    },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '0.75rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.12)',
    overflow: 'hidden',
    zIndex: 60,
  }),
  menuList: (base) => ({
    ...base,
    padding: '4px',
    maxHeight: '210px',
  }),
  option: (base, state) => ({
    ...base,
    borderRadius: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: state.isSelected ? 700 : 500,
    backgroundColor: state.isSelected
      ? '#f59e0b'
      : state.isFocused
        ? '#fffbeb'
        : 'transparent',
    color: state.isSelected ? '#ffffff' : '#1e293b',
    cursor: 'pointer',
    padding: '8px 10px',
    marginBottom: '2px',
    '&:active': {
      backgroundColor: '#fef3c7',
    },
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: '#fffbeb',
    border: '1px solid #fcd34d',
    borderRadius: '0.5rem',
    padding: '1px 2px',
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: '#b45309',
    fontSize: '0.7rem',
    fontWeight: 700,
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: '#d97706',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: '#f59e0b',
      color: '#ffffff',
    },
  }),
  placeholder: (base) => ({
    ...base,
    color: '#94a3b8',
    fontWeight: 400,
  }),
};

/* ------------------------------------------------------------------ */
/* Small shared building blocks                                        */
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

const IconButton = ({ onClick, title, danger, disabled, className = '', children }) => (
  <motion.button
    type="button"
    onClick={onClick}
    title={title}
    aria-label={title}
    disabled={disabled}
    variants={btnVariants}
    {...press(disabled)}
    transition={softSpring}
    className={`cursor-pointer rounded-lg p-2 text-slate-400 transition-colors duration-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 ${danger ? 'hover:text-red-600' : 'hover:text-amber-600'} ${className}`}
  >
    <motion.span variants={iconVariants} transition={softSpring} className="flex">
      {children}
    </motion.span>
  </motion.button>
);

const AnimatedCheckbox = ({ checked, onChange, disabled = false, label }) => (
  <motion.button
    type="button"
    role="checkbox"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    whileHover={disabled ? undefined : { scale: 1.08 }}
    whileTap={disabled ? undefined : { scale: 0.9 }}
    transition={softSpring}
    onClick={(e) => {
      e.stopPropagation();
      if (!disabled) onChange?.(!checked);
    }}
    className={`relative flex h-4.5 w-4.5 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${checked
      ? 'border-amber-500 text-white shadow-xs'
      : 'border-slate-300 bg-white hover:border-amber-400'
      }`}
  >
    <motion.span
      initial={false}
      animate={{
        scale: checked ? 1 : 0.4,
        opacity: checked ? 1 : 0,
      }}
      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
      className={`absolute inset-0 rounded-[5px] ${GRADIENT}`}
    />
    <motion.svg
      viewBox="0 0 16 16"
      fill="none"
      className="relative z-10 h-3 w-3 text-white"
      aria-hidden="true"
    >
      <motion.path
        d="M3.5 8.5L6.5 11.5L12.5 4.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
        transition={{ duration: 0.22, ease: EASE_OUT }}
      />
    </motion.svg>
  </motion.button>
);

// Shared overlay: click-outside + Escape to close, black/60 blur backdrop.
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

const modalPanel = {
  initial: { opacity: 0, y: 22, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE_OUT } },
  exit: { opacity: 0, y: 12, scale: 0.98, transition: { duration: 0.25, ease: EASE_OUT } },
};

const DocCardSkeleton = () => (
  <div className="rounded-xl border border-slate-200 bg-white p-3">
    <div className="flex items-start gap-2.5">
      <Skeleton className="mt-1 h-4.5 w-4.5 shrink-0 rounded-md" />
      <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-2.5 w-1/2" />
      </div>
    </div>
    <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2">
      <Skeleton className="h-2.5 w-16" />
      <div className="flex gap-1">
        <Skeleton className="h-6 w-6 rounded-lg" />
        <Skeleton className="h-6 w-6 rounded-lg" />
      </div>
    </div>
  </div>
);

const ColumnSkeleton = ({ withMembers }) => (
  <div className="flex h-[70vh] min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white sm:h-[80vh] xl:h-[85vh]">
    {withMembers && (
      <div className="space-y-2 border-b border-slate-100 p-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 p-2.5">
          <Skeleton className="h-8 w-8 rounded-xl" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-2.5 w-1/3" />
          </div>
        </div>
      </div>
    )}
    <div className="space-y-2.5 border-b border-slate-100 p-3">
      <Skeleton className="h-8 w-full rounded-lg" />
      <Skeleton className="h-7 w-full rounded-lg" />
    </div>
    <div className="p-3">
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
    <div className="flex-1 space-y-3 overflow-hidden p-3">
      {[0, 1, 2].map(i => <DocCardSkeleton key={i} />)}
    </div>
  </div>
);

const TableRowSkeleton = () => (
  <tr className="border-b border-slate-100">
    {[48, 20, 32, 16].map((w, i) => (
      <td key={i} className="p-3.5"><Skeleton className="h-3" style={{ width: `${w * 3}px` }} /></td>
    ))}
    <td className="p-3.5 text-right"><Skeleton className="ml-auto h-6 w-16 rounded-lg" /></td>
  </tr>
);

const OperationSkeleton = () => <Skeleton className="mb-2 h-5 w-5 rounded-full" />;

const ProgressBar = ({ value, danger, className = 'h-1.5', label }) => (
  <div
    className={`w-full overflow-hidden rounded-full bg-slate-100 ${className}`}
    role="progressbar"
    aria-label={label}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={value}
  >
    <motion.div
      className={`h-full rounded-full ${danger ? 'bg-red-600' : GRADIENT}`}
      initial={false}
      animate={{ width: `${value}%` }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    />
  </div>
);

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */
const getFileIcon = (filename) => {
  const extension = filename.split('.').pop()?.toLowerCase();
  if (['pdf', 'doc', 'docx', 'rtf', 'txt'].includes(extension)) return { Icon: FileText, color: 'text-amber-600' };
  if (['xls', 'xlsx', 'csv'].includes(extension)) return { Icon: FileSpreadsheet, color: 'text-orange-600' };
  if (['ppt', 'pptx'].includes(extension)) return { Icon: FileText, color: 'text-amber-600' };
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(extension)) return { Icon: FileImage, color: 'text-orange-600' };
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return { Icon: FileArchive, color: 'text-amber-600' };
  if (['mp3', 'wav', 'ogg', 'm4a'].includes(extension)) return { Icon: FileAudio, color: 'text-orange-600' };
  if (['mp4', 'mov', 'avi', 'mkv'].includes(extension)) return { Icon: FileVideo, color: 'text-amber-600' };
  if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'xml'].includes(extension)) return { Icon: FileCode, color: 'text-orange-600' };
  return { Icon: File, color: 'text-slate-500' };
};

const DEFAULT_DOCUMENTS = [
  {
    id: 'doc-101',
    title: 'Campus Accreditation Submission 2026.pdf',
    column: 'cro',
    size: 2450000,
    type: 'pdf',
    institution: 'chaturbhujeshwar',
    dataUrl: 'data:application/pdf;base64,JVBERi0xLjQKJ...',
    updatedAt: '2026-10-12T10:30:00Z'
  },
  {
    id: 'doc-102',
    title: 'Everest Academy Financial Proposal.xlsx',
    column: 'sales',
    size: 1120000,
    type: 'office',
    institution: 'everest',
    dataUrl: 'data:application/vnd.ms-excel;base64,UEsDBBQ...',
    updatedAt: '2026-10-13T14:15:00Z'
  },
  {
    id: 'doc-103',
    title: 'Sunrise School Infrastructure Audit.docx',
    column: 'writers',
    size: 850000,
    type: 'office',
    institution: 'sunrise',
    dataUrl: 'data:application/msword;base64,0M8R4KGxGUE...',
    updatedAt: '2026-10-14T09:00:00Z'
  }
];

const STAFF_AVATARS = [
  'https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_1.png',
  'https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_2.png',
  'https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_5.png',
  'https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_9.png',
  'https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_15.png',
  'https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_22.png',
  'https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_3.png',
  'https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_4.png',
  'https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_6.png'
];
const MAX_UPLOAD_SIZE = 50 * 1024 * 1024;
const OFFICE_STAFF = [
  { id: '1', name: 'Ram', role: 'staff', jobrole: 'Consultant', status: 'online' },
  { id: '2', name: 'Suman Yadav', role: 'staff', jobrole: 'CRO', status: 'offline' },
  { id: '3', name: 'Amit Sharma', role: 'staff', jobrole: 'Document Writer', status: 'online' },
  { id: '4', name: 'Priya Chaudhary', role: 'staff', jobrole: 'CRO', status: 'offline' },
  { id: '5', name: 'Nisha Thakur', role: 'staff', jobrole: 'Consultant', status: 'online' },
  { id: '6', name: 'Bikash Shah', role: 'staff', jobrole: 'Document Writer', status: 'offline' },
  { id: '7', name: 'Anisha Gupta', role: 'staff', jobrole: 'CRO', status: 'online' },
  { id: '8', name: 'Rohit Mandal', role: 'staff', jobrole: 'Consultant', status: 'offline' },
  { id: '9', name: 'Sneha Jha', role: 'staff', jobrole: 'Document Writer', status: 'online' }
].map((member, index) => ({ ...member, avatar: STAFF_AVATARS[index] }));

const JOBROLE_WORKSPACES = [
  { id: 'cro', title: 'CRO', jobrole: 'CRO', dot: 'bg-amber-500' },
  { id: 'consultant', title: 'Consultant', jobrole: 'Consultant', dot: 'bg-orange-600' },
  { id: 'document-writer', title: 'Document Writer', jobrole: 'Document Writer', dot: 'bg-amber-400' }
];

const LEGACY_WORKSPACE_COLUMN = {
  cro: 'cro',
  sales: 'consultant',
  writers: 'document-writer'
};

const VIEW_MODES = ['me', 'internal', 'headquarter', 'client', 'sample'];
const VIEW_LABELS = { me: 'Me', internal: 'Internal Office', headquarter: 'Headquarter', client: 'Client', sample: 'Sample' };

const CLIENT_FILTERS = [
  { id: 'all', label: 'All Client Campuses' },
  { id: 'chaturbhujeshwar', label: 'Chaturbhujeshwar Janata Multiple Campus' },
  { id: 'everest', label: 'Everest Academy & Colleges' },
  { id: 'sunrise', label: 'Sunrise Secondary School' }
];

const SearchIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export default function FolderView() {

  const { useMe } = useAuth();
  const { role, id } = useMe?.data?.user?.decoded || {};
  const { GetMeDetails_ ,GETEACHRECRUITMENTDETAILS_} = useGet({
    currentUser: { role, id },
    isAuthLoading: useMe.isLoading,
    staffRecruitmentDetailsId: id
  })

  const [currentViewMode, setCurrentViewMode] = useState('internal');
  const [activeClientFilter, setActiveClientFilter] = useState('all');
  const [clientSearch, setClientSearch] = useState('');
  const [staffSearch, setStaffSearch] = useState('');
  const [expandedUploadColumn, setExpandedUploadColumn] = useState(null);
  const [isNotifyDrawerOpen, setIsNotifyDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Selected document IDs via checkboxes
  const [selectedDocIds, setSelectedDocIds] = useState([]);

  // Destination Workspace modal state: { mode: 'move' | 'copy', docIds: string[] }
  const [transferModal, setTransferModal] = useState(null);
  const [selectedDestinations, setSelectedDestinations] = useState([]);

  // TODO: Integrate backend API call to fetch initial documents list
  const [documents, setDocuments] = useState(() => {
    try {
      const stored = localStorage.getItem('nexus_dms_documents');
      return stored ? JSON.parse(stored) : DEFAULT_DOCUMENTS;
    } catch {
      return DEFAULT_DOCUMENTS;
    }
  });

  const [meSearch, setMeSearch] = useState('');
  const [columnSearches, setColumnSearches] = useState(() => ({
    ...Object.fromEntries(OFFICE_STAFF.map(member => [member.id, ''])),
    cro: '',
    sales: '',
    writers: ''
  }));
  const [columnTimeRanges, setColumnTimeRanges] = useState({});

  // Modal and operation states
  const [previewDoc, setPreviewDoc] = useState(null);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [uploadError, setUploadError] = useState(null);

  // Per-file operation progress: { [docId]: { type: 'download' | 'delete' | 'move' | 'copy', progress } }
  const [fileOperations, setFileOperations] = useState({});

  const draggedCardIds = useRef([]);
  const activeDropColumn = useRef(null);
  const uploadTimers = useRef({ interval: null, completion: null });
  const operationTimers = useRef({});
  const moveTimers = useRef({ interval: null, completion: null });
  const autoScrollInterval = useRef(null);

  // React-Select options for Destination Workspace (Staff Workspaces or Client Institutions)
  const workspaceDestinationOptions = OFFICE_STAFF.map(member => ({
    value: member.id,
    label: `${member.name} — ${member.jobrole}`,
    jobrole: member.jobrole
  }));

  const clientDestinationOptions = CLIENT_FILTERS
    .filter(c => c.id !== 'all')
    .map(inst => ({
      value: inst.id,
      label: inst.label
    }));

  // Initial skeleton phase. Replace with the real fetch's loading flag once the API is wired.
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // TODO: Sync documents state changes with backend persistence API
    try {
      localStorage.setItem('nexus_dms_documents', JSON.stringify(documents));
    } catch { /* storage unavailable */ }
  }, [documents]);

  // Keep selectedDocIds clean if documents are removed
  useEffect(() => {
    const validIds = new Set(documents.map(d => d.id));
    setSelectedDocIds(prev => prev.filter(id => validIds.has(id)));
  }, [documents]);

  useEffect(() => {
    return () => {
      clearInterval(uploadTimers.current.interval);
      clearTimeout(uploadTimers.current.completion);
      clearInterval(moveTimers.current.interval);
      clearTimeout(moveTimers.current.completion);
      if (autoScrollInterval.current) clearInterval(autoScrollInterval.current);
      Object.values(operationTimers.current).forEach(timerObj => {
        clearInterval(timerObj.interval);
        clearTimeout(timerObj.completion);
      });
    };
  }, []);

  // Global drag-and-drop auto-scroll & nearest drop-zone highlight
  useEffect(() => {
    const clearHighlights = () => {
      document.querySelectorAll('[data-drop-zone="true"]').forEach(zone => {
        zone.classList.remove(...DROP_ZONE_ACTIVE);
      });
    };

    const handleWindowDragOver = (e) => {
      e.preventDefault();
      const { clientX, clientY } = e;
      const windowHeight = window.innerHeight;

      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
        autoScrollInterval.current = null;
      }

      const scrollThreshold = 140;
      if (clientY < scrollThreshold) {
        const speed = Math.max(10, Math.floor((scrollThreshold - clientY) / 1.5));
        autoScrollInterval.current = setInterval(() => window.scrollBy({ top: -speed }), 15);
      } else if (windowHeight - clientY < scrollThreshold) {
        const speed = Math.max(10, Math.floor((scrollThreshold - (windowHeight - clientY)) / 1.5));
        autoScrollInterval.current = setInterval(() => window.scrollBy({ top: speed }), 15);
      }

      const dropZones = document.querySelectorAll('[data-drop-zone="true"]');
      let nearestZone = null;
      let minDistance = Infinity;

      dropZones.forEach(zone => {
        const rect = zone.getBoundingClientRect();
        const distance = Math.hypot(clientX - (rect.left + rect.width / 2), clientY - (rect.top + rect.height / 2));
        const inside = clientX >= rect.left - 50 && clientX <= rect.right + 50 && clientY >= rect.top - 50 && clientY <= rect.bottom + 50;
        if (inside && distance < minDistance) {
          minDistance = distance;
          nearestZone = zone;
        }
      });

      dropZones.forEach(zone => {
        if (zone === nearestZone) {
          zone.classList.add(...DROP_ZONE_ACTIVE);
          activeDropColumn.current = zone.getAttribute('data-column-id');
        } else {
          zone.classList.remove(...DROP_ZONE_ACTIVE);
        }
      });
    };

    const handleWindowDragEnd = () => {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
        autoScrollInterval.current = null;
      }
      clearHighlights();
    };

    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('dragend', handleWindowDragEnd);
    window.addEventListener('drop', handleWindowDragEnd);

    return () => {
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('dragend', handleWindowDragEnd);
      window.removeEventListener('drop', handleWindowDragEnd);
      if (autoScrollInterval.current) clearInterval(autoScrollInterval.current);
    };
  }, []);

  const toggleSelectDoc = (docId) => {
    setSelectedDocIds(prev => (
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    ));
  };

  const toggleSelectMany = (ids, forceSelect = null) => {
    setSelectedDocIds(prev => {
      const allAlreadySelected = ids.length > 0 && ids.every(id => prev.includes(id));
      const shouldSelect = forceSelect !== null ? forceSelect : !allAlreadySelected;
      if (shouldSelect) {
        return Array.from(new Set([...prev, ...ids]));
      }
      const removeSet = new Set(ids);
      return prev.filter(id => !removeSet.has(id));
    });
  };

  // Resolve which files a card-level action should apply to.
  // - Clicked file is part of the current selection -> the WHOLE selection  [id, id, id]
  // - Clicked file is not selected                  -> just that file       [id]
  // Stale ids (already removed) and files with an operation in progress are filtered out.
  const getActionTargetIds = (doc) => {
    const validIds = new Set(documents.map(d => d.id));
    const baseIds = selectedDocIds.includes(doc.id) ? selectedDocIds : [doc.id];
    return baseIds.filter(id => validIds.has(id) && !fileOperations[id]);
  };

  // Opens the Destination Workspace modal for copy / move using the resolved target ids.
  const openCardTransfer = (mode, doc, defaultOptionValue = null) => {
    const ids = getActionTargetIds(doc);
    // Only preselect the current workspace when a single file is targeted;
    // a multi-selection may span several workspaces.
    openDestinationWorkspace(mode, ids, ids.length === 1 ? defaultOptionValue : null);
  };

  const runBatchOperation = (docIds, type, options = {}) => {
    const targetIds = docIds.filter(id => !fileOperations[id]);
    if (targetIds.length === 0) return;

    const batchKey = `batch-${Date.now()}-${type}`;
    setFileOperations(prev => {
      const next = { ...prev };
      targetIds.forEach(id => {
        next[id] = { type, progress: 0 };
      });
      return next;
    });

    let progress = 0;
    const intervalId = setInterval(() => {
      progress = Math.min(progress + 20, 100);
      setFileOperations(prev => {
        const next = { ...prev };
        targetIds.forEach(id => {
          if (next[id]) next[id] = { type, progress };
        });
        return next;
      });

      if (progress === 100) {
        clearInterval(intervalId);
        const nowIso = new Date().toISOString();
        const destinations = options.destinations || [];

        if (type === 'delete') {
          // TODO: Integrate batch file deletion API endpoint
          const removeSet = new Set(targetIds);
          setDocuments(prev => prev.filter(item => !removeSet.has(item.id)));
          setPreviewDoc(current => (current && removeSet.has(current.id) ? null : current));
          setSelectedDocIds(prev => prev.filter(id => !removeSet.has(id)));
        } else if (type === 'move' && destinations.length > 0) {
          // TODO: Integrate batch document move API endpoint
          const moveSet = new Set(targetIds);
          const [primaryDest, ...extraDests] = destinations;

          setDocuments(prev => {
            const sourceDocs = prev.filter(doc => moveSet.has(doc.id));

            // Move original files to the primary selected destination
            const movedDocs = prev.map(doc => {
              if (!moveSet.has(doc.id)) return doc;
              return currentViewMode === 'client'
                ? { ...doc, institution: primaryDest, updatedAt: nowIso }
                : { ...doc, column: primaryDest, updatedAt: nowIso };
            });

            // If user selected multiple destinations during move, copy to the remaining destinations
            const extraCopies = extraDests.flatMap((dest, destIdx) =>
              sourceDocs.map((doc, docIdx) => ({
                ...doc,
                id: `doc-move-copy-${Date.now()}-${destIdx}-${docIdx}-${Math.random().toString(36).slice(2, 6)}`,
                ...(currentViewMode === 'client' ? { institution: dest } : { column: dest }),
                updatedAt: nowIso,
              }))
            );

            return [...extraCopies, ...movedDocs];
          });
          setSelectedDocIds(prev => prev.filter(id => !moveSet.has(id)));
        } else if (type === 'copy' && destinations.length > 0) {
          // TODO: Integrate batch document copy API endpoint
          const copySet = new Set(targetIds);
          setDocuments(prev => {
            const sourceDocs = prev.filter(doc => copySet.has(doc.id));
            const clonedDocs = destinations.flatMap((dest, destIdx) =>
              sourceDocs.map((doc, docIdx) => ({
                ...doc,
                id: `doc-copy-${Date.now()}-${destIdx}-${docIdx}-${Math.random().toString(36).slice(2, 6)}`,
                ...(currentViewMode === 'client' ? { institution: dest } : { column: dest }),
                updatedAt: nowIso
              }))
            );
            return [...clonedDocs, ...prev];
          });
          setSelectedDocIds([]);
        }

        const completionTimeout = setTimeout(() => {
          setFileOperations(prev => {
            const next = { ...prev };
            targetIds.forEach(id => {
              delete next[id];
            });
            return next;
          });
          delete operationTimers.current[batchKey];
        }, 350);

        operationTimers.current[batchKey] = { interval: null, completion: completionTimeout };
      }
    }, 65);

    operationTimers.current[batchKey] = { interval: intervalId, completion: null };
  };

  const handleDocumentOperation = (doc, type) => {
    if (fileOperations[doc.id]) return;

    if (type === 'delete') {
      runBatchOperation(getActionTargetIds(doc), 'delete');
      return;
    }

    if (operationTimers.current[doc.id]) {
      clearInterval(operationTimers.current[doc.id].interval);
      clearTimeout(operationTimers.current[doc.id].completion);
    }

    setFileOperations(prev => ({ ...prev, [doc.id]: { type, progress: 0 } }));
    let progress = 0;

    const intervalId = setInterval(() => {
      progress = Math.min(progress + 10, 100);
      setFileOperations(prev => ({ ...prev, [doc.id]: { type, progress } }));

      if (progress === 100) {
        clearInterval(intervalId);

        if (type === 'download') {
          // TODO: Integrate secure file download API endpoint
          const link = document.createElement('a');
          link.href = doc.dataUrl;
          link.download = doc.title;
          document.body.appendChild(link);
          link.click();
          link.remove();
        }

        const completionTimeout = setTimeout(() => {
          setFileOperations(prev => {
            const copy = { ...prev };
            delete copy[doc.id];
            return copy;
          });
          delete operationTimers.current[doc.id];
        }, 350);

        operationTimers.current[doc.id] = { interval: null, completion: completionTimeout };
      }
    }, 70);

    operationTimers.current[doc.id] = { interval: intervalId, completion: null };
  };

  // Opens Destination Workspace modal for either 'copy' or 'move'
  const openDestinationWorkspace = (mode, docIds, defaultOptionValue = null) => {
    if (!docIds || docIds.length === 0) return;
    const optionsList = currentViewMode === 'client' ? clientDestinationOptions : workspaceDestinationOptions;
    const preselected = defaultOptionValue
      ? optionsList.filter(opt => opt.value === defaultOptionValue)
      : [];
    setSelectedDestinations(preselected);
    setTransferModal({ mode, docIds });
  };

  const confirmDestinationWorkspace = (e) => {
    e.preventDefault();
    if (!transferModal || selectedDestinations.length === 0) return;
    const { mode, docIds } = transferModal;
    const destinations = selectedDestinations.map(opt => opt.value);
    setTransferModal(null);
    setSelectedDestinations([]);
    runBatchOperation(docIds, mode, { destinations });
  };

  const triggerUploadSimulation = (files, targetColumn) => {
    const oversizedFiles = files.filter(file => file.size > MAX_UPLOAD_SIZE);
    const acceptedFiles = files.filter(file => file.size <= MAX_UPLOAD_SIZE);

    setUploadError(oversizedFiles.length > 0
      ? { column: targetColumn, message: `${oversizedFiles.map(file => file.name).join(', ')} exceeds the 50 MB limit.` }
      : null);
    if (acceptedFiles.length === 0) return;

    clearInterval(uploadTimers.current.interval);
    clearTimeout(uploadTimers.current.completion);

    // TODO: Prepare batch upload payload for backend API integration
    const batch = acceptedFiles.map((file, index) => ({
      id: `${Date.now()}-${index}-${file.name}`,
      filename: file.name,
      size: file.size,
      targetColumn,
      progress: 0
    }));
    setUploadQueue(batch);

    const progressById = Object.fromEntries(batch.map(file => [file.id, 0]));
    uploadTimers.current.interval = setInterval(() => {
      const completed = [];
      const updatedBatch = batch.map(file => {
        const previousProgress = progressById[file.id];
        const progress = Math.min(previousProgress + 10, 100);
        progressById[file.id] = progress;
        if (progress === 100 && previousProgress < 100) completed.push(file);
        return { ...file, progress };
      });
      setUploadQueue(updatedBatch);

      if (completed.length > 0) {
        // TODO: Handle successful upload response from backend API
        setDocuments(prev => [
          ...completed.map(file => ({
            id: `doc-${file.id}`,
            title: file.filename,
            column: file.targetColumn,
            size: file.size,
            type: file.filename.split('.').pop()?.toLowerCase() || 'file',
            institution: activeClientFilter !== 'all' ? activeClientFilter : 'chaturbhujeshwar',
            dataUrl: 'data:application/octet-stream;base64,UklGRq...',
            updatedAt: new Date().toISOString()
          })),
          ...prev
        ]);
      }

      if (updatedBatch.every(file => file.progress === 100)) {
        clearInterval(uploadTimers.current.interval);
        uploadTimers.current.interval = null;
        uploadTimers.current.completion = setTimeout(() => {
          setUploadQueue([]);
          uploadTimers.current.completion = null;
        }, 600);
      }
    }, 80);
  };

  const handleDrop = (e, targetColumn) => {
    e.preventDefault();
    e.stopPropagation();
    const effectiveColumn = activeDropColumn.current || targetColumn;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      draggedCardIds.current = [];
      activeDropColumn.current = null;
      triggerUploadSimulation(Array.from(e.dataTransfer.files), effectiveColumn);
    } else if (draggedCardIds.current.length > 0) {
      const idsToMove = [...draggedCardIds.current];
      draggedCardIds.current = [];
      activeDropColumn.current = null;

      const movableIds = idsToMove.filter(id => {
        const current = documents.find(d => d.id === id);
        return current && current.column !== effectiveColumn && !fileOperations[id];
      });
      if (movableIds.length === 0) return;

      clearInterval(moveTimers.current.interval);
      clearTimeout(moveTimers.current.completion);

      setFileOperations(prev => {
        const next = { ...prev };
        movableIds.forEach(id => {
          next[id] = { type: 'move', progress: 0 };
        });
        return next;
      });

      let moveProgress = 0;
      moveTimers.current.interval = setInterval(() => {
        moveProgress = Math.min(moveProgress + 20, 100);
        setFileOperations(prev => {
          const next = { ...prev };
          movableIds.forEach(id => {
            if (next[id]) next[id] = { type: 'move', progress: moveProgress };
          });
          return next;
        });

        if (moveProgress === 100) {
          clearInterval(moveTimers.current.interval);
          // TODO: Integrate document move / reassign column API endpoint
          const moveSet = new Set(movableIds);
          setDocuments(prev => prev.map(d => (
            moveSet.has(d.id) ? { ...d, column: effectiveColumn, updatedAt: new Date().toISOString() } : d
          )));
          setSelectedDocIds(prev => prev.filter(id => !moveSet.has(id)));
          moveTimers.current.completion = setTimeout(() => {
            setFileOperations(prev => {
              const copy = { ...prev };
              movableIds.forEach(id => delete copy[id]);
              return copy;
            });
          }, 350);
        }
      }, 60);
    }
  };

  const visibleStaff = OFFICE_STAFF.filter(member => (
    `${member.name} ${member.jobrole} ${member.role}`.toLowerCase().includes(staffSearch.trim().toLowerCase())
  ));
  const isFileListView = currentViewMode === 'client' || currentViewMode === 'sample';
  const visibleWorkspaces = isFileListView
    ? [{ id: 'all', title: 'Files', dot: 'bg-orange-600' }]
    : visibleStaff.map(member => ({
      id: member.id,
      title: member.jobrole,
      dot: JOBROLE_WORKSPACES.find(workspace => workspace.jobrole === member.jobrole)?.dot || 'bg-slate-500',
      member,
      members: [member]
    }));

  const meDocs = documents.filter(d => d.title.toLowerCase().includes(meSearch.toLowerCase()));
  const isStaffView = currentViewMode === 'internal' || currentViewMode === 'headquarter';
  const selectedCount = selectedDocIds.length;

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-slate-800">
      {/* Header Navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 w-full flex-wrap items-center justify-between gap-3 py-2">
          <div className="flex max-w-full shrink-0 items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-slate-100 p-1">
            {VIEW_MODES.map((mode) => {
              const active = currentViewMode === mode;
              return (
                <MotionButton
                  key={mode}
                  onClick={() => setCurrentViewMode(mode)}
                  aria-pressed={active}
                  className={`relative whitespace-nowrap rounded-lg px-3 py-1.5 text-xs transition-colors duration-300 ${active ? 'font-bold text-white' : 'font-medium text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'}`}
                >
                  {active && (
                    <motion.span
                      layoutId="view-mode-pill"
                      className={`absolute inset-0 rounded-lg ${GRADIENT}`}
                      transition={softSpring}
                    />
                  )}
                  <span className="relative">{VIEW_LABELS[mode]}</span>
                </MotionButton>
              );
            })}
          </div>

          {isStaffView && (
            <div className="relative min-w-45 flex-1">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={staffSearch}
                onChange={event => setStaffSearch(event.target.value)}
                placeholder="Search staff name or job role..."
                aria-label="Search staff by full name or job role"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs font-medium outline-none transition-all duration-300 placeholder:font-extralight focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-100"
              />
            </div>
          )}

          <div className="flex shrink-0 items-center gap-2">
            <MotionButton
              onClick={() => setIsNotifyDrawerOpen(true)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold text-white ${GRADIENT}`}
            >
              <motion.svg variants={iconVariants} transition={softSpring} className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </motion.svg>
              <span className="hidden sm:inline">Notify To All</span>
            </MotionButton>
          </div>
        </div>
      </header>

      {/* Bulk Selection Action Bar */}
      <AnimatePresence>
        {selectedCount > 0 && currentViewMode !== 'me' && (
          <motion.div
            key="bulk-action-bar"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="sticky top-16 z-20 border-b border-amber-200 bg-amber-50/95 backdrop-blur-sm"
          >
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-8">
              <div className="flex items-center gap-3">
                <AnimatedCheckbox
                  checked={true}
                  onChange={() => setSelectedDocIds([])}
                  label="Clear selected files"
                />
                <span className="text-xs font-bold text-slate-900">
                  {selectedCount} {selectedCount === 1 ? 'file' : 'files'} selected
                </span>
                <button
                  type="button"
                  onClick={() => toggleSelectMany(documents.map(d => d.id), true)}
                  className="cursor-pointer text-[11px] font-semibold text-amber-700 underline-offset-2 hover:underline"
                >
                  Select all ({documents.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDocIds([])}
                  className="cursor-pointer text-[11px] font-medium text-slate-500 hover:text-slate-800"
                >
                  Clear
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Copy opens Destination Workspace modal */}
                <MotionButton
                  onClick={() => openDestinationWorkspace('copy', selectedDocIds)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-white ${GRADIENT}`}
                >
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Copy ({selectedCount})</span>
                </MotionButton>

                {/* Move opens Destination Workspace modal */}
                <MotionButton
                  onClick={() => openDestinationWorkspace('move', selectedDocIds)}
                  className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-700 transition-colors hover:bg-amber-100/60"
                >
                  <FolderInput className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Move ({selectedCount})</span>
                </MotionButton>

                <MotionButton
                  onClick={() => runBatchOperation(selectedDocIds, 'delete')}
                  className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Delete ({selectedCount})</span>
                </MotionButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Client Filter Bar */}
      <AnimatePresence initial={false}>
        {currentViewMode === 'client' && (
          <motion.div
            key="client-filter"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className="overflow-hidden border-b border-slate-200 bg-slate-100"
          >
            <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-x-auto px-4 py-2.5 sm:px-8">
              <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-slate-500">Filter Institution:</span>
              {CLIENT_FILTERS.map(inst => {
                const active = activeClientFilter === inst.id;
                return (
                  <MotionButton
                    key={inst.id}
                    onClick={() => setActiveClientFilter(inst.id)}
                    aria-pressed={active}
                    className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs transition-colors duration-300 ${active ? `${GRADIENT} font-bold text-white` : 'bg-white font-medium text-slate-600 hover:bg-slate-200'}`}
                  >
                    {inst.label}
                  </MotionButton>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <main className="mx-auto w-full flex-1 py-6">
        {currentViewMode === 'me' ? (
          <motion.div
            key="me"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                  <svg className="h-6 w-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  My Evidence Log
                </h2>
                <p className="text-xs font-extralight text-slate-500">Read-only compliance audit record and verified personal submissions.</p>
              </div>
              <div className="relative w-full sm:w-72">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={meSearch}
                  onChange={(e) => setMeSearch(e.target.value)}
                  placeholder="Search evidence logs..."
                  aria-label="Search evidence logs"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs font-medium transition-all duration-300 placeholder:font-extralight focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="w-10 p-3.5">
                      <AnimatedCheckbox
                        checked={meDocs.length > 0 && meDocs.every(d => selectedDocIds.includes(d.id))}
                        onChange={(val) => toggleSelectMany(meDocs.map(d => d.id), val)}
                        label="Select all evidence logs"
                      />
                    </th>
                    <th className="p-3.5">Document Title</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Date Modified</th>
                    <th className="p-3.5">File Size</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {isLoading ? (
                    [0, 1, 2, 3].map(i => <TableRowSkeleton key={i} />)
                  ) : meDocs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-xs font-extralight text-slate-500">No evidence logs found.</td>
                    </tr>
                  ) : (
                    <AnimatePresence initial>
                      {meDocs.map((doc, index) => {
                        const op = fileOperations[doc.id];
                        const isChecked = selectedDocIds.includes(doc.id);
                        return (
                          <motion.tr
                            key={doc.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT, delay: index * 0.06 } }}
                            exit={{ opacity: 0, transition: { duration: 0.2 } }}
                            className={`border-b border-slate-100 transition-colors duration-300 ${isChecked ? 'bg-amber-50/40' : 'hover:bg-slate-50'}`}
                          >
                            <td className="p-3.5">
                              <AnimatedCheckbox
                                checked={isChecked}
                                onChange={() => toggleSelectDoc(doc.id)}
                                label={`Select ${doc.title}`}
                              />
                            </td>
                            <td className="p-3.5 font-bold text-slate-800">{doc.title}</td>
                            <td className="p-3.5 text-[10px] font-medium uppercase text-amber-600">{doc.column}</td>
                            <td className="p-3.5 font-extralight text-slate-500">{new Date(doc.updatedAt).toLocaleString()}</td>
                            <td className="p-3.5 font-extralight text-slate-500">{formatFileSize(doc.size)}</td>
                            <td className="p-3.5 text-right">
                              <MotionButton
                                disabled={!!op}
                                onClick={() => handleDocumentOperation(doc, 'download')}
                                className="inline-flex min-w-20 items-center justify-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 transition-colors duration-300 hover:bg-amber-100"
                              >
                                {op?.type === 'download' ? `${op.progress}%` : 'Download'}
                              </MotionButton>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={`${currentViewMode}-${isLoading ? 'loading' : 'ready'}`}
            variants={stagger}
            initial="hidden"
            animate="show"
            className={`grid grid-cols-1 items-start gap-6 ${isFileListView ? '' : 'md:grid-cols-2 xl:grid-cols-3'}`}
          >
            {isLoading ? (
              (isFileListView ? [0] : [0, 1, 2]).map(i => (
                <motion.div key={i} variants={fadeUp}>
                  <ColumnSkeleton withMembers={!isFileListView} />
                </motion.div>
              ))
            ) : (
              <>
                {!isFileListView && visibleStaff.length === 0 && (
                  <motion.p variants={fadeUp} className="col-span-full rounded-xl border border-slate-200 bg-white p-8 text-center text-sm font-extralight text-slate-500">
                    No staff match “{staffSearch}”.
                  </motion.p>
                )}
                {visibleWorkspaces.map((col) => {
                  const legacyColumn = Object.keys(LEGACY_WORKSPACE_COLUMN).find(key => LEGACY_WORKSPACE_COLUMN[key] === col.id);
                  let colDocs = documents.filter(d => (
                    col.id === 'all' || d.column === col.id || (legacyColumn && d.column === legacyColumn)
                  ));
                  if (currentViewMode === 'client' && activeClientFilter !== 'all') {
                    colDocs = colDocs.filter(d => d.institution === activeClientFilter);
                  }
                  const searchTerm = String((col.id === 'all' ? clientSearch : columnSearches[col.id]) ?? '');
                  const filteredDocs = colDocs.filter(d => String(d?.title ?? '').toLowerCase().includes(searchTerm.toLowerCase()));
                  const allColumnSelected = filteredDocs.length > 0 && filteredDocs.every(d => selectedDocIds.includes(d.id));

                  return (
                    <motion.div
                      key={col.id}
                      variants={fadeUp}
                      className={`flex flex-col rounded-2xl border border-slate-200 bg-white ${isFileListView ? 'min-h-0' : 'h-[70vh] min-h-0 overflow-hidden sm:h-[80vh] xl:h-[85vh]'}`}
                    >
                      {col.members?.length > 0 && (
                        <div className="border-b border-slate-100 p-3">
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Team members</span>
                            <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600">
                              {colDocs.length} {colDocs.length === 1 ? 'file' : 'files'}
                            </span>
                          </div>
                          <div className="max-h-36 overflow-y-auto pr-1 scrollbar-thin [scrollbar-color:#cbd5e1_transparent]">
                            {col.members.map(member => (
                              <article key={member.id} className="mb-1 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-2.5 transition-colors duration-300 hover:bg-slate-50/80">
                                <div className="flex min-w-0 items-center gap-2.5">
                                  <div className="relative h-8 w-8 shrink-0">
                                    <img
                                      src={member.avatar}
                                      alt={`${member.name} avatar`}
                                      loading="lazy"
                                      className="h-8 w-8 rounded-xl bg-slate-100 object-cover ring-1 ring-slate-200"
                                    />
                                    <span
                                      title={member.status === 'online' ? 'Online' : 'Offline'}
                                      aria-label={member.status === 'online' ? 'Online' : 'Offline'}
                                      className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${member.status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'}`}
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="truncate text-xs font-bold leading-tight text-slate-900">{member.name}</h4>
                                    <p className="mt-0.5 truncate text-[10px] font-extralight text-slate-500">
                                      {member.jobrole} · {member.status === 'online' ? 'Online' : 'Offline'}
                                    </p>
                                  </div>
                                </div>
                                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">{member.role}</span>
                              </article>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2.5 border-b border-slate-100 bg-white p-3">
                        <div className="flex items-center gap-2">
                          {filteredDocs.length > 0 && (
                            <AnimatedCheckbox
                              checked={allColumnSelected}
                              onChange={(val) => toggleSelectMany(filteredDocs.map(d => d.id), val)}
                              label={`Select all files in ${col.title}`}
                            />
                          )}
                          <div className="relative flex-1">
                            <SearchIcon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                            <input
                              type="search"
                              value={searchTerm}
                              onChange={(e) => {
                                if (col.id === 'all') setClientSearch(e.target.value);
                                else setColumnSearches(prev => ({ ...prev, [col.id]: e.target.value }));
                              }}
                              placeholder="Search docs..."
                              aria-label="Search documents"
                              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs font-medium transition-all duration-300 placeholder:font-extralight focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-1 rounded-lg bg-slate-100 p-0.5 text-xs">
                          {['1d', '7d', '15d', '1m'].map((range) => {
                            const isActive = (columnTimeRanges?.[col.id] || '7d') === range;
                            return (
                              <MotionButton
                                key={range}
                                onClick={() => setColumnTimeRanges(prev => ({ ...prev, [col.id]: range }))}
                                aria-pressed={isActive}
                                className={`relative flex-1 rounded-md px-2 py-1 transition-colors duration-300 ${isActive ? 'font-bold text-white' : 'font-medium text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'}`}
                              >
                                {isActive && (
                                  <motion.span
                                    layoutId={`range-pill-${col.id}`}
                                    className={`absolute inset-0 rounded-md ${GRADIENT}`}
                                    transition={softSpring}
                                  />
                                )}
                                <span className="relative">{range}</span>
                              </MotionButton>
                            );
                          })}
                        </div>
                      </div>

                      {!isFileListView && (
                        <div className="shrink-0 p-3">
                          <div
                            data-drop-zone="true"
                            data-column-id={col.id}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDrop(e, col.id)}
                            className="group"
                          >
                            <motion.div
                              animate={{ minHeight: expandedUploadColumn === col.id ? 96 : 48 }}
                              transition={{ duration: 0.4, ease: EASE_OUT }}
                              className="flex items-center justify-between gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-3 text-center transition-colors duration-300 hover:border-amber-500 hover:bg-amber-50/30"
                            >
                              <input
                                type="file"
                                multiple
                                onChange={(e) => {
                                  if (e.target.files?.length) triggerUploadSimulation(Array.from(e.target.files), col.id);
                                  e.target.value = '';
                                }}
                                className="hidden"
                                id={`fileInput-${col.id}`}
                              />
                              <label htmlFor={`fileInput-${col.id}`} className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 py-2 text-left">
                                <svg className="h-5 w-5 shrink-0 text-slate-400 transition-colors duration-300 group-hover:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <span className="min-w-0">
                                  <span className="block truncate text-xs font-medium text-slate-600">
                                    Drop or move files here, or <span className="font-bold text-amber-600">browse</span>
                                  </span>
                                  <AnimatePresence initial={false}>
                                    {expandedUploadColumn === col.id && (
                                      <motion.span
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        transition={{ duration: 0.3, ease: EASE_OUT }}
                                        className="mt-1 block text-[10px] font-extralight text-slate-500"
                                      >
                                        Select multiple files · maximum 50 MB each
                                      </motion.span>
                                    )}
                                  </AnimatePresence>
                                </span>
                              </label>
                              <IconButton
                                onClick={() => setExpandedUploadColumn(current => (current === col.id ? null : col.id))}
                                title={`${expandedUploadColumn === col.id ? 'Collapse' : 'Expand'} upload area`}
                                className="shrink-0 p-1.5"
                              >
                                <motion.svg
                                  animate={{ rotate: expandedUploadColumn === col.id ? 180 : 0 }}
                                  transition={softSpring}
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  aria-hidden="true"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7" />
                                </motion.svg>
                              </IconButton>
                            </motion.div>
                          </div>
                          <AnimatePresence>
                            {uploadError?.column === col.id && (
                              <motion.p
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
                                role="alert"
                              >
                                {uploadError.message}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      <div
                        data-drop-zone="true"
                        data-column-id={col.id}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={isFileListView ? undefined : (e) => handleDrop(e, col.id)}
                        className={`flex-1 rounded-b-2xl transition-colors duration-300 ${isFileListView ? 'p-3' : 'min-h-0 overflow-y-auto p-3 scrollbar-thin [scrollbar-color:#cbd5e1_transparent]'}`}
                      >
                        <motion.div variants={listStagger} initial="hidden" animate="show" className="space-y-3">
                          {filteredDocs.length === 0 && (
                            <p className="py-8 text-center text-xs font-extralight text-slate-500">No files found.</p>
                          )}
                          <AnimatePresence initial={false}>
                            {filteredDocs.map(doc => {
                              const op = fileOperations[doc.id];
                              const isSelected = selectedDocIds.includes(doc.id);
                              const isBulkTarget = isSelected && selectedCount > 1;
                              const { Icon, color } = getFileIcon(doc.title);

                              return (
                                // Native-draggable wrapper: framer's own onDragStart would clash with HTML5 drag.
                                <div
                                  key={doc.id}
                                  draggable={!isFileListView && !op}
                                  onDragStart={() => {
                                    draggedCardIds.current = selectedDocIds.includes(doc.id)
                                      ? selectedDocIds
                                      : [doc.id];
                                  }}
                                  onDragEnd={() => {
                                    draggedCardIds.current = [];
                                  }}
                                >
                                  <motion.div
                                    variants={fadeUp}
                                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.25, ease: EASE_OUT } }}
                                    whileHover={op ? undefined : { y: -2 }}
                                    transition={softSpring}
                                    onClick={() => setPreviewDoc(doc)}
                                    className={`group relative cursor-pointer rounded-xl border p-3 transition-colors duration-300 ${isSelected
                                      ? 'border-amber-400 bg-amber-50/35 ring-1 ring-amber-400/40'
                                      : 'border-slate-200 bg-white hover:border-amber-400'
                                      } ${isFileListView ? '' : 'active:cursor-grabbing'}`}
                                  >
                                    <AnimatePresence>
                                      {op && (
                                        <motion.div
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          exit={{ opacity: 0 }}
                                          transition={{ duration: 0.2 }}
                                          className="absolute inset-0 z-10 flex cursor-wait flex-col items-center justify-center rounded-xl bg-white/95 p-3 text-center backdrop-blur-sm"
                                          role="status"
                                          aria-live="polite"
                                          aria-label={`${op.type} ${doc.title}, ${op.progress}%`}
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <OperationSkeleton />
                                          <span className="mb-1.5 inline-flex items-center gap-2 text-[11px] font-bold text-slate-800">
                                            <Skeleton className="h-3 w-20 rounded-full" />
                                            <span>{op.progress}%</span>
                                          </span>
                                          <ProgressBar value={op.progress} danger={op.type === 'delete'} label={`${op.type} ${doc.title}`} />
                                        </motion.div>
                                      )}
                                    </AnimatePresence>

                                    <div className="flex items-start gap-2.5">
                                      <div className="pt-1.5">
                                        <AnimatedCheckbox
                                          checked={isSelected}
                                          onChange={() => toggleSelectDoc(doc.id)}
                                          disabled={!!op}
                                          label={`Select ${doc.title}`}
                                        />
                                      </div>
                                      <div className={`shrink-0 rounded-lg bg-slate-100 p-2 transition-colors duration-300 group-hover:bg-amber-50 group-hover:text-amber-600 ${color}`}>
                                        <Icon className="h-5 w-5" aria-hidden="true" />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <h4 className="truncate text-xs font-bold text-slate-800 transition-colors duration-300 group-hover:text-amber-600">{doc.title}</h4>
                                        <div className="mt-1 flex items-center gap-2 text-[10px] font-extralight text-slate-500">
                                          <span>{formatFileSize(doc.size)}</span>
                                          <span>•</span>
                                          <span className="font-medium capitalize">{doc.institution || 'general'}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] font-extralight text-slate-500">
                                      <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                                      <div className="-mr-1 flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                                        {/* Copy opens Destination Workspace modal */}
                                        <IconButton
                                          onClick={() => openCardTransfer('copy', doc, col.id === 'all' ? doc.institution : col.id)}
                                          title={isBulkTarget ? `Copy ${selectedCount} selected files` : `Copy ${doc.title}`}
                                          disabled={!!op}
                                          className="p-1.5"
                                        >
                                          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                                        </IconButton>

                                        {/* Move opens Destination Workspace modal */}
                                        <IconButton
                                          onClick={() => openCardTransfer('move', doc, col.id === 'all' ? doc.institution : col.id)}
                                          title={isBulkTarget ? `Move ${selectedCount} selected files` : `Move ${doc.title}`}
                                          disabled={!!op}
                                          className="p-1.5"
                                        >
                                          <FolderInput className="h-3.5 w-3.5" aria-hidden="true" />
                                        </IconButton>

                                        <IconButton
                                          onClick={() => handleDocumentOperation(doc, 'download')}
                                          title={`Download ${doc.title}`}
                                          disabled={!!op}
                                          className="p-1.5"
                                        >
                                          <Download className="h-3.5 w-3.5" aria-hidden="true" />
                                        </IconButton>

                                        <IconButton
                                          onClick={() => handleDocumentOperation(doc, 'delete')}
                                          title={isBulkTarget ? `Delete ${selectedCount} selected files` : `Delete ${doc.title}`}
                                          danger
                                          disabled={!!op}
                                          className="p-1.5"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                        </IconButton>
                                      </div>
                                    </div>
                                  </motion.div>
                                </div>
                              );
                            })}
                          </AnimatePresence>
                        </motion.div>
                      </div>
                    </motion.div>
                  );
                })}
              </>
            )}
          </motion.div>
        )}
      </main>

      {/* Destination Workspace Modal (React-Select Multi-Select for Copy & Move) */}
      <AnimatePresence>
        {transferModal && (
          <Modal
            onClose={() => {
              setTransferModal(null);
              setSelectedDestinations([]);
            }}
          >
            <motion.form
              {...modalPanel}
              onSubmit={confirmDestinationWorkspace}
              className="relative w-full max-w-md space-y-4 rounded-2xl bg-white p-5 sm:p-6"
            >
              <IconButton
                onClick={() => {
                  setTransferModal(null);
                  setSelectedDestinations([]);
                }}
                title="Close destination workspace"
                className="absolute right-3 top-3"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </IconButton>

              <div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-white ${GRADIENT}`}>
                    {transferModal.mode === 'copy' ? <Copy className="h-3.5 w-3.5" /> : <FolderInput className="h-3.5 w-3.5" />}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    Destination Workspace
                  </h3>
                </div>
                <p className="mt-1.5 text-xs font-extralight text-slate-500">
                  {transferModal.mode === 'copy' ? (
                    <>
                      Select one or more workspaces to <span className="font-semibold text-amber-700">copy</span>{' '}
                      <span className="font-bold text-slate-800">{transferModal.docIds.length}</span>{' '}
                      {transferModal.docIds.length === 1 ? 'selected file' : 'selected files'} into.
                    </>
                  ) : (
                    <>
                      Select destination workspace(s) to <span className="font-semibold text-amber-700">move</span>{' '}
                      <span className="font-bold text-slate-800">{transferModal.docIds.length}</span>{' '}
                      {transferModal.docIds.length === 1 ? 'selected file' : 'selected files'} into.
                    </>
                  )}
                </p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="destination-workspace-select" className="block text-xs font-bold text-slate-700">
                  {currentViewMode === 'client' ? 'Select Target Institutions (Multi-select)' : 'Select Destination Workspaces (Multi-select)'}
                </label>
                <Select
                  inputId="destination-workspace-select"
                  isMulti
                  closeMenuOnSelect={false}
                  options={currentViewMode === 'client' ? clientDestinationOptions : workspaceDestinationOptions}
                  value={selectedDestinations}
                  onChange={(selected) => setSelectedDestinations(selected || [])}
                  placeholder={
                    currentViewMode === 'client'
                      ? 'Choose one or more institutions...'
                      : 'Choose one or more staff workspaces...'
                  }
                  styles={reactSelectStyles}
                  noOptionsMessage={() => 'No matching workspaces'}
                />
                {selectedDestinations.length > 1 && transferModal.mode === 'move' && (
                  <p className="text-[11px] font-extralight text-slate-500">
                    Files will move to <span className="font-semibold text-slate-700">{selectedDestinations[0].label}</span> and copy to the remaining {selectedDestinations.length - 1} destination{selectedDestinations.length - 1 === 1 ? '' : 's'}.
                  </p>
                )}
              </div>

              <div className="flex flex-col-reverse justify-end gap-2 pt-2 sm:flex-row">
                <MotionButton
                  type="button"
                  onClick={() => {
                    setTransferModal(null);
                    setSelectedDestinations([]);
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-medium transition-colors duration-300 hover:bg-slate-50 sm:py-2"
                >
                  Cancel
                </MotionButton>
                <MotionButton
                  type="submit"
                  disabled={selectedDestinations.length === 0}
                  className={`flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-white sm:py-2 ${GRADIENT}`}
                >
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    {transferModal.mode === 'copy'
                      ? `Copy to ${selectedDestinations.length || ''} Destination${selectedDestinations.length === 1 ? '' : 's'}`
                      : `Move to ${selectedDestinations.length || ''} Destination${selectedDestinations.length === 1 ? '' : 's'}`}
                  </span>
                </MotionButton>
              </div>
            </motion.form>
          </Modal>
        )}
      </AnimatePresence>

      {/* Upload Progress Modal */}
      <AnimatePresence>
        {uploadQueue.length > 0 && (
          <Modal onClose={() => { }}>
            <motion.section
              {...modalPanel}
              className="relative max-h-[90vh] w-full max-w-xl overflow-hidden rounded-2xl bg-white"
              aria-label="Upload progress"
            >
              <header className="border-b border-slate-100 px-5 py-4">
                <h3
                  role="status"
                  aria-label={`Upload in progress for ${uploadQueue.length} file${uploadQueue.length === 1 ? '' : 's'}`}
                  className="flex items-center gap-2 text-base font-bold text-slate-900"
                >
                  <Skeleton className="h-4 w-24 rounded-full" />
                  <span>{uploadQueue.length} file{uploadQueue.length === 1 ? '' : 's'}</span>
                </h3>
                <p className="mt-1 text-xs font-extralight text-slate-500">Each file uploads separately · maximum 50 MB per file</p>
              </header>
              <div className="max-h-[60vh] space-y-4 overflow-y-auto p-5 scrollbar-thin [scrollbar-color:#cbd5e1_transparent]">
                {uploadQueue.map(file => (
                  <div key={file.id} className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-slate-800">{file.filename}</p>
                        <p className="text-[10px] font-extralight text-slate-500">{formatFileSize(file.size)}</p>
                      </div>
                      <span className="shrink-0 text-xs font-medium text-slate-600">{file.progress}%</span>
                    </div>
                    <ProgressBar value={file.progress} className="h-2" label={`Uploading ${file.filename}`} />
                    <p className="text-right text-[10px] font-medium text-slate-500">
                      {file.progress === 100 ? 'Complete' : <Skeleton className="ml-auto h-2.5 w-14 rounded-full" />}
                    </p>
                  </div>
                ))}
              </div>
            </motion.section>
          </Modal>
        )}
      </AnimatePresence>

      {/* Document Detail Preview Modal */}
      <AnimatePresence>
        {previewDoc && (
          <Modal onClose={() => setPreviewDoc(null)}>
            <motion.div
              {...modalPanel}
              className="relative max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl bg-white p-5 sm:p-6"
            >
              <IconButton onClick={() => setPreviewDoc(null)} title="Close preview" className="absolute right-3 top-3 sm:right-4 sm:top-4">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </IconButton>
              <h3 className="pr-8 text-base font-bold text-slate-900">{previewDoc.title}</h3>
              <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs font-medium text-slate-700">
                <p>ID: {previewDoc.id}</p>
                <p>Department: {String(previewDoc.column).toUpperCase()}</p>
                <p>Institution: {String(previewDoc.institution || 'general').toUpperCase()}</p>
              </div>
              <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
                <MotionButton
                  onClick={() => setPreviewDoc(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-medium transition-colors duration-300 hover:bg-slate-50 sm:py-2"
                >
                  Close
                </MotionButton>
                <MotionButton
                  disabled={!!fileOperations[previewDoc.id]}
                  onClick={() => handleDocumentOperation(previewDoc, 'download')}
                  className={`rounded-xl px-4 py-2.5 text-xs font-bold text-white sm:py-2 ${GRADIENT}`}
                >
                  {fileOperations[previewDoc.id]?.type === 'download' && (
                    <LoaderCircle className="h-3 w-3 animate-spin text-white" strokeWidth={2.5} />
                  )}
                  Download
                  {fileOperations[previewDoc.id]?.type === 'download' && (
                    <span>{fileOperations[previewDoc.id].progress}%</span>
                  )}
                </MotionButton>
              </div>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      {isNotifyDrawerOpen && (
        <NotifyDrawer isOpen={isNotifyDrawerOpen} onClose={() => setIsNotifyDrawerOpen(false)} />
      )}
    </div>
  );
}