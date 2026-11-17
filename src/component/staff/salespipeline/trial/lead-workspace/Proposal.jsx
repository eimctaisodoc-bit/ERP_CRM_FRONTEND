import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import {
    AlertTriangle, ArrowDown, ArrowLeft, ArrowUp, Check, ChevronRight, FileText, Loader2, Plus, RotateCcw, Trash2, X,
} from 'lucide-react';

//

import { UseAdd } from '../../../../hooks/useadd';

import { useGet } from '../../../../hooks/useGet';

import { UseDelete } from '../../../../hooks/useDelete';


import { dismissWaitingNotify, waitingNotify, SuccessNotify } from '../../../../hotToaster';
import { BuildProposalDocx } from '../../proposal/proposalPage';



// Body text was weight 300, which is thin at 13px. 400 reads better; headings stay 700.
const fontBody = { fontFamily: "'Roboto Slab', serif", fontWeight: 400 };
const fontBold = { fontFamily: "'Roboto Slab', serif", fontWeight: 700 };

// ---- shared class strings (one focus ring, one set of buttons, one input look) ----
const ring = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A76C0]/60';
const fieldCls = 'w-full rounded-lg border border-slate-300 bg-white px-2.5 text-sm text-[#33475b] placeholder:text-slate-400 focus:border-[#4A76C0] focus:outline-none focus:ring-2 focus:ring-[#4A76C0]/25';
const cellCls = 'h-9 w-full rounded-md border bg-white px-2 text-sm text-[#33475b] placeholder:text-slate-400 focus:border-[#4A76C0] focus:outline-none focus:ring-2 focus:ring-[#4A76C0]/25';
// Primary orange is slightly deeper than #E87A24 so white button text passes contrast (4.5:1).
const btnPrimary = `inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-[#C2570C] px-4 text-sm font-bold text-white transition-colors hover:bg-[#A84A09] disabled:cursor-not-allowed disabled:opacity-60 ${ring}`;
const btnQuiet = `inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50 ${ring}`;
const btnAdd = `inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-[#4A76C0] px-3 text-sm font-bold text-[#3A62A3] transition-colors hover:bg-blue-50 ${ring}`;
const iconBtn = `inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent ${ring}`;
const dangerIconBtn = `inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 ${ring}`;

// ---- constants ----
const MAX_RECIPIENTS = 5;
const DEFAULT_VAT_RATE = '13'; // Nepal standard VAT rate; editable in the form
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STEPS = ['Recipients', 'Terms', 'Installments', 'Review'];
const DEFAULT_TERMS = [
    'This proposal is valid for 30 days from the date of submission.',
    '50% advance payment is required to initiate the project.',
    'Any additional requirements outside the scope will be billed separately.',
];

const SAMPLE_PROPOSALS = [
    {
        _id: 'sample-proposal-1',
        isSample: true,
        sendto: ['suman@himalayanfoods.com.np'],
        termsAndConditions: [
            'This proposal is valid for 30 days from the date of submission.',
            '50% advance payment is required to initiate the project.',
        ],
        installments: [
            { month: '2026-11-15', inclVat: 113000, exclVat: 100000, vatRate: 13, remarks: 'Advance on approval' },
            { month: '2026-12-15', inclVat: 113000, exclVat: 100000, vatRate: 13, remarks: 'After implementation' },
            { month: '2027-01-15', inclVat: 113000, exclVat: 100000, vatRate: 13, remarks: 'On completion' },
        ],
        timestamp: '2026-11-02T09:30:00.000Z',
    },
    {
        _id: 'sample-proposal-2',
        isSample: true,
        sendto: ['kavita@janakpurlab.com.np'],
        termsAndConditions: [
            'The scope covers ISO 15189 gap assessment and implementation guidance.',
            'The client will provide access to relevant laboratory records.',
        ],
        installments: [
            { month: '2026-11-20', inclVat: 113000, exclVat: 100000, vatRate: 13, remarks: 'On approval' },
            { month: '2026-12-20', inclVat: 98875, exclVat: 87500, vatRate: 13, remarks: 'After assessment' },
            { month: '2027-01-20', inclVat: 70625, exclVat: 62500, vatRate: 13, remarks: 'At completion' },
        ],
        timestamp: '2026-11-03T06:15:00.000Z',
    },
    {
        _id: 'sample-proposal-3',
        isSample: true,
        sendto: ['rajiv@madheshsteel.com'],
        termsAndConditions: [
            'The integrated QMS, EMS, and OHSMS scope will be confirmed during review.',
            'Travel expenses outside the assigned branch area are billed separately.',
        ],
        installments: [
            { month: '2026-11-25', inclVat: 203400, exclVat: 180000, vatRate: 13, remarks: 'Project start' },
            { month: '2026-12-25', inclVat: 271200, exclVat: 240000, vatRate: 13, remarks: 'Implementation review' },
            { month: '2027-01-25', inclVat: 203400, exclVat: 180000, vatRate: 13, remarks: 'Before final audit' },
        ],
        timestamp: '2026-11-04T04:45:00.000Z',
    },
];

// =============================================================================
// HELPERS
// =============================================================================
const makeDefaultTerms = () => DEFAULT_TERMS.map((text, i) => ({ id: `default-${i + 1}`, text }));
const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
const toNum = (value) => {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : 0;
};
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

const money = (value) => {
    if (value === '' || value === null || value === undefined || Number.isNaN(Number(value))) return '—';
    return `Rs. ${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Given one VAT figure, work out the other. `from` is the field the person typed in.
const calcOther = (value, rate, from) => {
    if (value === '' || value === null || value === undefined) return '';
    const n = Number(value);
    if (!Number.isFinite(n)) return '';
    const factor = 1 + toNum(rate) / 100;
    return (from === 'incl' ? n / factor : n * factor).toFixed(2);
};

// Format legacy ISO dates; free-text periods are shown as entered.
const formatMonth = (value) => {
    if (!value) return '—';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (!match) return value;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatSent = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const sumInstallments = (rows) => rows.reduce(
    (acc, row) => ({
        amount: acc.amount + toNum(row.amount),
        incl: acc.incl + toNum(row.inclVat),
        excl: acc.excl + toNum(row.exclVat),
    }),
    { amount: 0, incl: 0, excl: 0 },
);

// History can contain old records (month / percent / rs) or plain strings. Show them without guessing VAT.
const normalizeInstallment = (inst) => {
    if (typeof inst === 'string') return { month: inst, amount: '', inclVat: '', exclVat: '', remarks: '' };
    if (inst.inclVat !== undefined || inst.exclVat !== undefined) return { ...inst, amount: inst.amount ?? '' };
    const legacy = [inst.rs ? `Rs. ${inst.rs}` : '', inst.percent ? `(${inst.percent}%)` : ''].filter(Boolean).join(' ');
    return { month: inst.month, amount: inst.amount ?? '', inclVat: '', exclVat: '', remarks: legacy };
};

const installmentIssues = (row) => ({
    month: !String(row.month || '').trim(),
    amount: !(toNum(row.amount) > 0 || toNum(row.inclVat) > 0 || toNum(row.exclVat) > 0),
});

const isSentRecord = (record) => String(record?.status || '').toLowerCase() === 'sent';

// proposalTimes (from LeadsPage): { count, onChange(count, action) }.
// `count` is the last known number of proposals for this lead and is shown until the history loads.
// `onChange` is told the real count after the history loads ('loaded'), a send ('sent') or a delete ('deleted').
export default function Proposal({ id, lead, compact = false, sampleMode = false, onClose, proposalTimes }) {
    console.log("Proposal component props:", { id, lead, compact, sampleMode, onClose, proposalTimes });
    const mainID = lead?._id;
    const preloadedCount = Number(typeof proposalTimes === 'number' ? proposalTimes : proposalTimes?.count) || 0;
    const timesChangeRef = useRef(null);
    timesChangeRef.current = typeof proposalTimes === 'object' ? proposalTimes?.onChange : null;

    // --- STATE ---
    const [activities, setActivities] = useState(() => sampleMode || !mainID ? SAMPLE_PROPOSALS : []);
    const [historyReady, setHistoryReady] = useState(Boolean(sampleMode || !mainID));

    // UX / API States
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    // const { showNotification, toastNode } = useSimpleToast();

    // Wizard
    const [step, setStep] = useState(0);
    const [furthestStep, setFurthestStep] = useState(0);

    // Recipients
    const [msgTo, setMsgTo] = useState([]);
    const [emailInput, setEmailInput] = useState('');
    const [emailError, setEmailError] = useState('');

    // Terms & conditions
    const [termsAndConditions, setTermsAndConditions] = useState(makeDefaultTerms);

    // Installments (start empty: no placeholder amounts that could be emailed by accident)
    const [vatRate, setVatRate] = useState(DEFAULT_VAT_RATE);
    const [installments, setInstallments] = useState([]);
    const [showInstallmentErrors, setShowInstallmentErrors] = useState(false);

    // Focus + scroll helpers
    const fieldRefs = useRef({});
    const pendingFocus = useRef(null);
    const stepperRef = useRef(null);
    const headingRef = useRef(null);
    const stepMounted = useRef(false);
    const emailInputId = useId();
    const vatInputId = useId();

    const registerRef = (key) => (el) => {
        if (el) fieldRefs.current[key] = el;
        else delete fieldRefs.current[key];
    };

    // --- INITIALIZE HOOKS ---
    const { Getproposal_ } = useGet();
    const { proposal_ } = UseAdd();
    const { Deleteproposal_ } = UseDelete();
    const requireMainId = () => {
        if (sampleMode) {
            // showNotification("Sample proposal records are read-only.", "error");
            return false;
        }
        if (mainID) return true;
        // showNotification("Save this lead before sending or deleting proposal records.", "error");
        return false;
    };

    // --- FETCH INITIAL TIMELINE DATA ---
    const fetchActivities = async ({ silent = false, action = 'loaded' } = {}) => {
        if (sampleMode || !mainID) return;
        setActivities([]);
        setHistoryLoading(true);
        const loadingMessage = 'Loading proposal history...';
        waitingNotify(loadingMessage);
        try {
            const res = await Getproposal_.mutateAsync({
                parms: { MainID: lead?._id }
            });

            const list = Array.isArray(res?.data)
                ? res.data
                : Array.isArray(res?.data?.data)
                    ? res.data.data
                    : Array.isArray(res)
                        ? res
                        : null;
            if (Array.isArray(list)) {
                setActivities(list);
                setHistoryReady(true);
                const proposalHistory = list.filter(isSentRecord);
                const proposalCount = proposalHistory.length;
                timesChangeRef.current?.(proposalCount, action);
            }
            if (!silent) SuccessNotify('Proposal history loaded.');
        } catch (error) {
            console.error("Error fetching timeline activities:", error);
            // showNotification(error?.message || "Couldn't load proposal history.", "error");
        } finally {
            dismissWaitingNotify(loadingMessage);
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        if (mainID && !sampleMode) fetchActivities();
    }, [mainID]);

    // Move focus to a field we just added (new term row, new installment row).
    useEffect(() => {
        const key = pendingFocus.current;
        const el = key && fieldRefs.current[key];
        if (el) {
            el.focus();
            pendingFocus.current = null;
        }
    }, [termsAndConditions, installments]);

    // When the step changes, bring the composer top into view and move focus to the step title.
    useEffect(() => {
        if (!stepMounted.current) {
            stepMounted.current = true;
            return;
        }
        stepperRef.current?.scrollIntoView({ block: 'nearest' });
        headingRef.current?.focus({ preventScroll: true });
    }, [step]);

    // =========================================================================
    // API HANDLERS (ADD, DELETE)
    // =========================================================================

    const handleSaveMessageAPI = async (payload) => {
        if (!requireMainId()) return false;
        setIsSubmitting(true);
        const loadingMessage = 'Sending proposal...';
        waitingNotify(loadingMessage);
        try {
            const newRecord = {
                sendto: payload.sendto,
                subject: 'Business Proposal',
                message: 'Please find our business proposal attached for your review.',
                // Map the objects back to strings if your backend expects an array of strings
                termsAndConditions: payload.termsAndConditions.map(t => t.text),
                installments: payload.installments,
            };

            const proposalBlob = await BuildProposalDocx();
            const proposalFile = new File(
                [proposalBlob],
                `EIMCTA_Business_Proposal_${Date.now()}.docx`,
                { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
            );
            const formData = new FormData();
            formData.append('file', proposalFile);
            formData.append('status', 'sent');
            formData.append('proposalData', JSON.stringify(newRecord));

            const res = await proposal_.mutateAsync({
                parms: { MainID: lead?._id },
                payload: formData
            });

            await fetchActivities({ silent: true, action: 'sent' });
            SuccessNotify(res?.data?.message || res?.message || 'Proposal sent successfully!');
            return true;
        } catch (error) {
            console.error("Add Mutation Error:", error);
            // showNotification(error?.response?.data?.message || error?.message || "Failed to send proposal.", "error");
            return false;
        } finally {
            dismissWaitingNotify(loadingMessage);
            setIsSubmitting(false);
        }
    };

    const handleDeleteActivity = async (activityId) => {
        if (!requireMainId()) return;
        if (window.confirm("Are you sure you want to delete this record permanently?")) {
            setDeletingId(activityId);
            const loadingMessage = 'Deleting proposal...';
            waitingNotify(loadingMessage);
            try {
                await Deleteproposal_.mutateAsync({
                    parms: { MainID: mainID, id: activityId }
                });
                await fetchActivities({ silent: true, action: 'deleted' });
                SuccessNotify("Record removed from timeline feed.");
            } catch (error) {
                console.error("Delete Mutation Error:", error);
                // showNotification(error?.response?.data?.message || error?.message || "Failed to delete record.", "error");
            } finally {
                dismissWaitingNotify(loadingMessage);
                setDeletingId(null);
            }
        }
    };

    // =========================================================================
    // RECIPIENTS
    // =========================================================================
    // Accepts one or many addresses (typed, or pasted separated by commas / spaces / new lines).
    const addEmails = (raw) => {
        const parts = raw.split(/[\s,;]+/).filter(Boolean);
        if (parts.length === 0) return { list: msgTo, ok: true };

        const list = [...msgTo];
        let badEntry = '';
        let dupEntry = '';
        let hitLimit = false;
        for (const email of parts) {
            if (!EMAIL_RE.test(email)) { badEntry = email; continue; }
            if (list.some((existing) => existing.toLowerCase() === email.toLowerCase())) { dupEntry = email; continue; }
            if (list.length >= MAX_RECIPIENTS) { hitLimit = true; break; }
            list.push(email);
        }

        setMsgTo(list);
        setEmailInput(badEntry);
        if (badEntry) setEmailError(`“${badEntry}” isn’t a valid email address.`);
        else if (hitLimit) setEmailError(`You can send to ${MAX_RECIPIENTS} recipients at most.`);
        else if (dupEntry) setEmailError(`${dupEntry} is already added.`);
        else setEmailError('');
        return { list, ok: !badEntry && !hitLimit };
    };

    const handleEmailKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',' || e.key === ';') {
            e.preventDefault();
            addEmails(emailInput);
        } else if (e.key === 'Backspace' && !emailInput && msgTo.length > 0) {
            setMsgTo(msgTo.slice(0, -1));
        }
    };

    const handleEmailPaste = (e) => {
        const text = e.clipboardData?.getData('text') || '';
        if (/[\s,;]/.test(text.trim())) {
            e.preventDefault();
            addEmails(`${emailInput} ${text}`);
        }
    };

    const handleRemoveEmail = (indexToRemove) => {
        setMsgTo(msgTo.filter((_, index) => index !== indexToRemove));
        setEmailError('');
    };

    // =========================================================================
    // TERMS & CONDITIONS (edited in place)
    // =========================================================================
    const addTerm = (afterId) => {
        const termId = newId();
        setTermsAndConditions((list) => {
            const next = [...list];
            const at = afterId ? list.findIndex((t) => t.id === afterId) : list.length - 1;
            next.splice(at + 1, 0, { id: termId, text: '' });
            return next;
        });
        pendingFocus.current = `term-${termId}`;
    };
    const updateTerm = (termId, text) => setTermsAndConditions((list) => list.map((t) => (t.id === termId ? { ...t, text } : t)));
    const removeTerm = (termId) => setTermsAndConditions((list) => list.filter((t) => t.id !== termId));
    const moveTerm = (index, direction) => {
        const nextIndex = index + direction;
        if (nextIndex < 0 || nextIndex >= termsAndConditions.length) return;
        setTermsAndConditions((current) => {
            const next = [...current];
            [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
            return next;
        });
    };
    const handleTermKeyDown = (e, term) => {
        // Enter adds the next term; Shift+Enter keeps a line break inside this one.
        if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            if (term.text.trim()) addTerm(term.id);
        }
    };
    const resetTerms = () => {
        const untouched = termsAndConditions.length === DEFAULT_TERMS.length
            && termsAndConditions.every((t, i) => t.text === DEFAULT_TERMS[i]);
        if (!untouched && !window.confirm("Replace your terms with the default terms?")) return;
        setTermsAndConditions(makeDefaultTerms());
    };

    // =========================================================================
    // INSTALLMENTS
    // =========================================================================
    const addInstallment = () => {
        const rowId = newId();
        setInstallments((rows) => {
            return [...rows, {
                id: rowId,
                month: '',
                amount: '',
                inclVat: '',
                exclVat: '',
                basis: 'excl', // which amount the person typed last; the other is derived from it
                remarks: '',
            }];
        });
        pendingFocus.current = `inst-month-${rowId}`;
    };
    const removeInstallment = (rowId) => setInstallments((rows) => rows.filter((r) => r.id !== rowId));
    const updateInstallment = (rowId, patch) => setInstallments((rows) => rows.map((r) => (r.id === rowId ? { ...r, ...patch } : r)));
    const changeAmount = (rowId, field, value) => {
        setInstallments((rows) => rows.map((r) => {
            if (r.id !== rowId) return r;
            return field === 'inclVat'
                ? { ...r, inclVat: value, exclVat: calcOther(value, vatRate, 'incl'), basis: 'incl' }
                : { ...r, exclVat: value, inclVat: calcOther(value, vatRate, 'excl'), basis: 'excl' };
        }));
    };
    const changeVatRate = (value) => {
        setVatRate(value);
        // Keep each row's typed amount and recompute the other one.
        setInstallments((rows) => rows.map((r) => (r.basis === 'incl'
            ? { ...r, exclVat: calcOther(r.inclVat, value, 'incl') }
            : { ...r, inclVat: calcOther(r.exclVat, value, 'excl') })));
    };

    const totals = useMemo(() => sumInstallments(installments), [installments]);
    const invalidRows = installments.filter((r) => {
        const issues = installmentIssues(r);
        return issues.month || issues.amount;
    });

    // =========================================================================
    // WIZARD NAVIGATION + VALIDATION
    // =========================================================================
    const validateRecipients = () => {
        // Commit an address that was typed but not confirmed with Enter.
        const { list, ok } = emailInput.trim() ? addEmails(emailInput) : { list: msgTo, ok: true };
        if (!ok) return null;
        if (list.length === 0) {
            setEmailError('Add at least one recipient to continue.');
            fieldRefs.current.email?.focus();
            return null;
        }
        return list;
    };

    const validateInstallments = () => {
        if (invalidRows.length === 0) return true;
        setShowInstallmentErrors(true);
        return false;
    };

    const goTo = (target) => {
        if (target === step) return;
        if (target > step) {
            if (step === 0 && !validateRecipients()) return;
            if (step === 2 && !validateInstallments()) return;
        }
        // Drop empty term rows when leaving the Terms step.
        if (step === 1) setTermsAndConditions((list) => list.filter((t) => t.text.trim()));
        setStep(target);
        setFurthestStep((f) => Math.max(f, target));
    };

    const resetForm = () => {
        // Terms are reusable boilerplate, so they stay. Recipients and installments are per-deal.
        setMsgTo([]);
        setEmailInput('');
        setEmailError('');
        setInstallments([]);
        setShowInstallmentErrors(false);
        setStep(0);
        setFurthestStep(0);
    };

    // --- FRONTEND TRIGGER SUBMITS ---
    const submitProposalEmail = async () => {
        const recipients = validateRecipients();
        if (!recipients) { setStep(0); return; }
        if (!validateInstallments()) { setStep(2); return; }

        const payload = {
            sendto: recipients,
            termsAndConditions: termsAndConditions
                .map((t) => ({ ...t, text: t.text.trim() }))
                .filter((t) => t.text),
            installments: installments.map(({ month, amount, inclVat, exclVat, remarks }) => ({
                month: month.trim(),
                amount: round2(toNum(amount)),
                inclVat: round2(toNum(inclVat)),
                exclVat: round2(toNum(exclVat)),
                vatRate: toNum(vatRate),
                remarks: remarks.trim(),
            })),
        };

        const success = await handleSaveMessageAPI(payload);
        if (success) resetForm();
    };

    const cancelForm = () => {
        resetForm();
        onClose?.();
    };

    const reviewTerms = termsAndConditions.map((t) => t.text.trim()).filter(Boolean);

    // Proposal number = position in the history by sent time (oldest = #1), so a number
    // never changes when the list order does. Records without a timestamp keep list order.
    const history = Array.isArray(activities) ? activities : [];
    const proposalCount = historyReady && !historyLoading ? history.length : Math.max(history.length, preloadedCount);
    const proposalIndex = useMemo(() => {
        const stamp = (a) => { const t = new Date(a.timestamp).getTime(); return Number.isFinite(t) ? t : 0; };
        const order = history.map((a, i) => ({ key: a._id || a.id || i, t: stamp(a), i }))
            .sort((a, b) => (a.t - b.t) || (a.i - b.i));
        return new Map(order.map((o, n) => [o.key, n + 1]));
    }, [history]);
    const sentCount = history.filter(isSentRecord).length;

    // =========================================================================
    // RENDER
    // =========================================================================
    return (
        <MotionConfig reducedMotion="user">
            <div className={`h-full min-h-0 min-w-0 text-[13px] text-[#33475b] sm:text-sm ${compact ? 'w-full' : ''}`} style={fontBody}>

                <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-[#cbd6e2] bg-white shadow-sm">
                    <header className="flex shrink-0 items-center justify-between gap-2 border-b border-[#cbd6e2] px-3 py-2">
                        <div className="flex items-center gap-2">
                            <FileText size={18} className="text-slate-500" aria-hidden="true" />
                            <h2 className="text-sm" style={fontBold}>Proposal  </h2>
                        </div>
                        {onClose && (
                            <button type="button" onClick={onClose} aria-label="Close proposal" className={`flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 ${ring}`}>
                                <X size={17} aria-hidden="true" />
                            </button>
                        )}
                    </header>

                    <div className="min-w-0 flex-1 overflow-y-auto bg-gray-50 p-3 scrollbar-thin sm:p-4">
                        {(!mainID || sampleMode) && (
                            <div role="status" className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900">
                                {sampleMode ? "Sample proposal records are read-only." : "Save a lead to send or delete real proposals."}
                            </div>
                        )}

                        {/* ---------------------------- COMPOSER ---------------------------- */}
                        <section aria-label="New proposal" className="mb-6 min-w-0 rounded-lg border border-[#cbd6e2] bg-white shadow-sm">
                            <div className="border-b border-slate-100 px-3 py-2.5 sm:px-4">
                                <h3 className="flex items-baseline gap-2 text-sm" style={fontBold}>
                                    New proposal
                                    <span className="text-xs font-normal tabular-nums text-slate-500">#{proposalCount + 1}</span>
                                </h3>
                            </div>

                            <Stepper innerRef={stepperRef} current={step} furthest={furthestStep} onSelect={goTo} />

                            <div className="p-3 sm:p-4">
                                {/* STEP 1: RECIPIENTS */}
                                {step === 0 && (
                                    <div>
                                        <StepHeading innerRef={headingRef} title="Who should receive this proposal?" hint="Press Enter or comma after each address. You can also paste a list." />
                                        <label htmlFor={emailInputId} className="mb-1.5 block text-xs font-bold">Send to</label>
                                        <div
                                            onClick={() => fieldRefs.current.email?.focus()}
                                            className={`flex w-full cursor-text flex-wrap items-center gap-1.5 rounded-lg border bg-white p-2 text-sm focus-within:border-[#4A76C0] focus-within:ring-2 focus-within:ring-[#4A76C0]/25 ${emailError ? 'border-red-400' : 'border-slate-300'}`}
                                        >
                                            <AnimatePresence initial={false}>
                                                {msgTo.map((email, index) => (
                                                    <motion.span
                                                        key={email}
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.9 }}
                                                        className="flex max-w-full items-center gap-1 rounded-full border border-blue-200 bg-blue-50 py-0.5 pl-2.5 pr-1 text-xs font-bold text-blue-900"
                                                    >
                                                        <span className="truncate">{email}</span>
                                                        <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveEmail(index); }} aria-label={`Remove ${email}`} className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full hover:bg-white hover:text-red-600 ${ring}`}>
                                                            <X size={12} aria-hidden="true" />
                                                        </button>
                                                    </motion.span>
                                                ))}
                                            </AnimatePresence>
                                            {msgTo.length < MAX_RECIPIENTS ? (
                                                <input
                                                    id={emailInputId}
                                                    ref={registerRef('email')}
                                                    type="email"
                                                    inputMode="email"
                                                    autoComplete="off"
                                                    value={emailInput}
                                                    onChange={(e) => { setEmailInput(e.target.value); if (emailError) setEmailError(''); }}
                                                    onKeyDown={handleEmailKeyDown}
                                                    onPaste={handleEmailPaste}
                                                    onBlur={() => { if (emailInput.trim()) addEmails(emailInput); }}
                                                    aria-invalid={Boolean(emailError)}
                                                    aria-describedby={`${emailInputId}-msg`}
                                                    className="min-h-8 min-w-[10rem] flex-1 bg-transparent focus:outline-none"
                                                    placeholder={msgTo.length === 0 ? 'client@company.com' : 'Add another address'}
                                                />
                                            ) : (
                                                <span id={emailInputId} className="py-1 text-xs font-bold text-amber-800">Maximum of {MAX_RECIPIENTS} recipients reached</span>
                                            )}
                                        </div>
                                        <div id={`${emailInputId}-msg`} className="mt-1.5 flex items-start justify-between gap-3 text-xs">
                                            <p role={emailError ? 'alert' : undefined} className={`flex items-center gap-1 ${emailError ? 'font-bold text-red-700' : 'text-slate-500'}`}>
                                                {emailError && <AlertTriangle size={12} aria-hidden="true" />}
                                                {emailError || 'The proposal is emailed to everyone listed here.'}
                                            </p>
                                            <span className="shrink-0 text-slate-500">{msgTo.length} of {MAX_RECIPIENTS}</span>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 2: TERMS & CONDITIONS */}
                                {step === 1 && (
                                    <div>
                                        <StepHeading
                                            innerRef={headingRef}
                                            title="Terms & conditions"
                                            hint="Shown to the client in this order. Press Enter to start the next term."
                                            action={(
                                                <button type="button" onClick={resetTerms} className={`inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-xs font-bold text-[#3A62A3] hover:bg-blue-50 ${ring}`}>
                                                    <RotateCcw size={13} aria-hidden="true" /> Use default terms
                                                </button>
                                            )}
                                        />

                                        {termsAndConditions.length === 0 ? (
                                            <p className="rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center text-xs text-slate-500">
                                                No terms yet. Add the conditions the client agrees to.
                                            </p>
                                        ) : (
                                            <ol className="space-y-2">
                                                <AnimatePresence initial={false}>
                                                    {termsAndConditions.map((term, index) => (
                                                        <motion.li
                                                            key={term.id}
                                                            initial={{ opacity: 0, y: -6 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0 }}
                                                            className="flex flex-wrap items-start gap-x-2 gap-y-1"
                                                        >
                                                            <span aria-hidden="true" className="w-6 shrink-0 pt-2 text-right text-sm font-bold text-slate-500">{index + 1}.</span>
                                                            <AutoTextarea
                                                                inputRef={registerRef(`term-${term.id}`)}
                                                                aria-label={`Term ${index + 1}`}
                                                                value={term.text}
                                                                onChange={(e) => updateTerm(term.id, e.target.value)}
                                                                onKeyDown={(e) => handleTermKeyDown(e, term)}
                                                                placeholder="Write a term the client agrees to"
                                                                className={`${fieldCls} min-w-[11rem] flex-1 resize-none py-2 leading-snug`}
                                                            />
                                                            <div className="ml-auto flex shrink-0 items-center">
                                                                <button type="button" onClick={() => moveTerm(index, -1)} disabled={index === 0} aria-label={`Move term ${index + 1} up`} className={iconBtn}><ArrowUp size={15} aria-hidden="true" /></button>
                                                                <button type="button" onClick={() => moveTerm(index, 1)} disabled={index === termsAndConditions.length - 1} aria-label={`Move term ${index + 1} down`} className={iconBtn}><ArrowDown size={15} aria-hidden="true" /></button>
                                                                <button type="button" onClick={() => removeTerm(term.id)} aria-label={`Delete term ${index + 1}`} className={dangerIconBtn}><Trash2 size={15} aria-hidden="true" /></button>
                                                            </div>
                                                        </motion.li>
                                                    ))}
                                                </AnimatePresence>
                                            </ol>
                                        )}

                                        <button type="button" onClick={() => addTerm()} className={`${btnAdd} mt-3`}>
                                            <Plus size={16} aria-hidden="true" /> Add term
                                        </button>
                                    </div>
                                )}

                                {/* STEP 3: INSTALLMENTS */}
                                {step === 2 && (
                                    <div>
                                        <StepHeading
                                            innerRef={headingRef}
                                            title="Installments"
                                            hint="Type either amount and the other is worked out from the VAT rate. Skip this step if the client pays in one go."
                                            action={(
                                                <button type="button" onClick={addInstallment} aria-label="Add installment" className={btnAdd}>
                                                    <Plus size={16} aria-hidden="true" /> Installment
                                                </button>
                                            )}
                                        />

                                        <div className="mb-3 flex items-center gap-2">
                                            <label htmlFor={vatInputId} className="text-xs font-bold">VAT rate</label>
                                            <div className="relative w-24">
                                                <input
                                                    id={vatInputId}
                                                    type="number"
                                                    inputMode="decimal"
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                    value={vatRate}
                                                    onChange={(e) => changeVatRate(e.target.value)}
                                                    className={`${fieldCls} h-9 pr-7 text-right tabular-nums`}
                                                />
                                                <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-sm text-slate-500">%</span>
                                            </div>
                                        </div>

                                        {showInstallmentErrors && invalidRows.length > 0 && (
                                            <p role="alert" className="mb-3 flex items-start gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-800">
                                                <AlertTriangle size={14} className="mt-px shrink-0" aria-hidden="true" />
                                                Every installment needs a month/period and an amount. Fix the highlighted rows, or remove them.
                                            </p>
                                        )}

                                        {installments.length === 0 ? (
                                            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center">
                                                <p className="font-bold" style={fontBold}>No installments yet</p>
                                                <p className="max-w-xs text-xs text-slate-500">Split the fee into payments by month or period, each with its own amount and remarks.</p>
                                                <button type="button" onClick={addInstallment} aria-label="Add installment" className={`${btnAdd} mt-1`}>
                                                    <Plus size={16} aria-hidden="true" /> Installment
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="overflow-x-auto rounded-lg border border-slate-200">
                                                    <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                                                        <caption className="sr-only">Installment schedule</caption>
                                                        <thead className="bg-slate-50 text-xs text-slate-600">
                                                            <tr>
                                                                <th scope="col" className="w-14 px-3 py-2 text-center font-bold">S.N.</th>
                                                                <th scope="col" className="w-44 px-2 py-2 font-bold">Months</th>
                                                                <th scope="col" className="w-32 px-2 py-2 text-right font-bold">Amt</th>
                                                                <th scope="col" className="w-36 px-2 py-2 text-right font-bold">Incl. VAT ({vatRate || 0}%)</th>
                                                                <th scope="col" className="w-36 px-2 py-2 text-right font-bold">Excl. VAT</th>
                                                                <th scope="col" className="px-2 py-2 font-bold">Remarks</th>
                                                                <th scope="col" className="w-12 px-2 py-2"><span className="sr-only">Remove</span></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <AnimatePresence initial={false}>
                                                                {installments.map((row, index) => {
                                                                    const issues = installmentIssues(row);
                                                                    const flagMonth = showInstallmentErrors && issues.month;
                                                                    const flagAmount = showInstallmentErrors && issues.amount;
                                                                    return (
                                                                        <motion.tr
                                                                            key={row.id}
                                                                            initial={{ opacity: 0 }}
                                                                            animate={{ opacity: 1 }}
                                                                            exit={{ opacity: 0 }}
                                                                            className="border-t border-slate-100 align-top"
                                                                        >
                                                                            <td className="px-3 py-2 text-center text-sm font-bold leading-9 text-slate-500">{index + 1}</td>
                                                                            <td className="px-2 py-2">
                                                                                <input
                                                                                    ref={registerRef(`inst-month-${row.id}`)}
                                                                                    type="text"
                                                                                    maxLength={60}
                                                                                    aria-label={`Installment ${index + 1} month or period`}
                                                                                    aria-invalid={flagMonth}
                                                                                    value={row.month}
                                                                                    onChange={(e) => updateInstallment(row.id, { month: e.target.value })}
                                                                                    placeholder="e.g. Month 1"
                                                                                    className={`${cellCls} ${flagMonth ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
                                                                                />
                                                                            </td>
                                                                            <td className="px-2 py-2">
                                                                                <input
                                                                                    type="number"
                                                                                    inputMode="decimal"
                                                                                    min="0"
                                                                                    step="0.01"
                                                                                    aria-label={`Installment ${index + 1} amount`}
                                                                                    aria-invalid={flagAmount}
                                                                                    value={row.amount}
                                                                                    onChange={(e) => updateInstallment(row.id, { amount: e.target.value })}
                                                                                    placeholder="0.00"
                                                                                    className={`${cellCls} text-right tabular-nums ${flagAmount ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
                                                                                />
                                                                            </td>
                                                                            <td className="px-2 py-2">
                                                                                <input
                                                                                    type="number"
                                                                                    inputMode="decimal"
                                                                                    min="0"
                                                                                    step="0.01"
                                                                                    aria-label={`Installment ${index + 1} amount including VAT`}
                                                                                    aria-invalid={flagAmount}
                                                                                    value={row.inclVat}
                                                                                    onChange={(e) => changeAmount(row.id, 'inclVat', e.target.value)}
                                                                                    placeholder="0.00"
                                                                                    className={`${cellCls} text-right tabular-nums ${flagAmount ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
                                                                                />
                                                                            </td>
                                                                            <td className="px-2 py-2">
                                                                                <input
                                                                                    type="number"
                                                                                    inputMode="decimal"
                                                                                    min="0"
                                                                                    step="0.01"
                                                                                    aria-label={`Installment ${index + 1} amount excluding VAT`}
                                                                                    aria-invalid={flagAmount}
                                                                                    value={row.exclVat}
                                                                                    onChange={(e) => changeAmount(row.id, 'exclVat', e.target.value)}
                                                                                    placeholder="0.00"
                                                                                    className={`${cellCls} text-right tabular-nums ${flagAmount ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
                                                                                />
                                                                            </td>
                                                                            <td className="px-2 py-2">
                                                                                <input
                                                                                    type="text"
                                                                                    maxLength={200}
                                                                                    aria-label={`Installment ${index + 1} remarks`}
                                                                                    value={row.remarks}
                                                                                    onChange={(e) => updateInstallment(row.id, { remarks: e.target.value })}
                                                                                    placeholder="e.g. Advance on approval"
                                                                                    className={`${cellCls} border-slate-300`}
                                                                                />
                                                                            </td>
                                                                            <td className="px-2 py-2 text-right">
                                                                                <button type="button" onClick={() => removeInstallment(row.id)} aria-label={`Remove installment ${index + 1}`} className={dangerIconBtn}>
                                                                                    <Trash2 size={15} aria-hidden="true" />
                                                                                </button>
                                                                            </td>
                                                                        </motion.tr>
                                                                    );
                                                                })}
                                                            </AnimatePresence>
                                                        </tbody>
                                                        <tfoot className="border-t border-slate-200 bg-slate-50 text-sm font-bold">
                                                            <tr>
                                                                <td colSpan={2} className="px-3 py-2 text-right">Total</td>
                                                                <td className="px-2 py-2 text-right tabular-nums">{money(totals.incl)}</td>
                                                                <td className="px-2 py-2 text-right tabular-nums">{money(totals.excl)}</td>
                                                                <td colSpan={2} className="px-2 py-2 text-xs font-normal text-slate-600">VAT {money(totals.incl - totals.excl)}</td>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>
                                                <button type="button" onClick={addInstallment} aria-label="Add installment" className={`${btnAdd} mt-3`}>
                                                    <Plus size={16} aria-hidden="true" /> Installment
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* STEP 4: REVIEW */}
                                {step === 3 && (
                                    <div>
                                        <StepHeading innerRef={headingRef} title="Review and send" hint="This is what the client will receive." />

                                        <ReviewSection title="Recipients" onEdit={() => goTo(0)}>
                                            <ul className="flex flex-wrap gap-1.5">
                                                {msgTo.map((email) => (
                                                    <li key={email} className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-900">{email}</li>
                                                ))}
                                            </ul>
                                        </ReviewSection>

                                        <ReviewSection title="Terms & conditions" onEdit={() => goTo(1)}>
                                            {reviewTerms.length > 0 ? (
                                                <ol className="list-decimal space-y-1 pl-5 marker:font-bold marker:text-slate-500">
                                                    {reviewTerms.map((text, i) => <li key={i} className="whitespace-pre-wrap break-words pl-1">{text}</li>)}
                                                </ol>
                                            ) : <p className="text-xs text-slate-500">No terms added.</p>}
                                        </ReviewSection>

                                        <ReviewSection title="Installments" onEdit={() => goTo(2)}>
                                            {installments.length > 0
                                                ? <InstallmentsTable rows={installments} vatRate={vatRate} />
                                                : <p className="text-xs text-slate-500">No installments added.</p>}
                                        </ReviewSection>
                                    </div>
                                )}
                            </div>

                            <div className="sticky bottom-0 z-10 flex items-center justify-between gap-2 rounded-b-lg border-t border-slate-200 bg-white/95 px-3 py-2.5 backdrop-blur sm:px-4">
                                <button type="button" onClick={() => (step === 0 ? cancelForm() : goTo(step - 1))} disabled={isSubmitting} className={btnQuiet}>
                                    <ArrowLeft size={15} aria-hidden="true" />{step === 0 ? 'Cancel' : 'Back'}
                                </button>
                                {step < 3 ? (
                                    <button type="button" onClick={() => goTo(step + 1)} className={btnPrimary}>
                                        {step === 2 ? 'Review' : 'Next'} <ChevronRight size={15} aria-hidden="true" />
                                    </button>
                                ) : (
                                    <button type="button" onClick={submitProposalEmail} disabled={isSubmitting} aria-busy={isSubmitting} className={btnPrimary}>
                                        {isSubmitting && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
                                        {isSubmitting ? 'Sending…' : 'Send proposal'}
                                    </button>
                                )}
                            </div>
                        </section>

                        {/* ---------------------------- HISTORY ---------------------------- */}
                        <h3 className="mb-3 flex items-baseline gap-2 text-sm text-blue-900" style={fontBold}>
                            Proposal history
                            <span className="text-xs font-normal tabular-nums text-slate-500">
                                {proposalCount} {proposalCount === 1 ? 'proposal' : 'proposals'}{sentCount > 0 && ` · ${sentCount} sent ✓`}
                            </span>
                        </h3>
                        <div className="space-y-3">
                            {historyLoading && <p role="status" className="rounded-lg bg-white p-3 text-xs text-slate-500">Loading proposal history…</p>}
                            {history.map((activity, position) => (
                                <ActivityCard
                                    key={activity.id || activity._id}
                                    data={activity}
                                    index={proposalIndex.get(activity._id || activity.id || position) ?? position + 1}
                                    sent={isSentRecord(activity)}
                                    onDelete={handleDeleteActivity}
                                    deleting={deletingId === (activity._id || activity.id)}
                                />
                            ))}
                            {history.length === 0 && !historyLoading && (
                                <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white py-10 text-center text-slate-500">
                                    <FileText size={32} className="text-slate-300" aria-hidden="true" />
                                    <p className="font-bold" style={fontBold}>No proposals sent yet</p>
                                    <p className="text-xs">Proposals you send will be listed here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </MotionConfig>
    );
}

// =============================================================================
// SMALL PIECES
// =============================================================================

// Textarea that grows with its content so long terms are fully visible.
function AutoTextarea({ value, inputRef, ...rest }) {
    const localRef = useRef(null);
    useLayoutEffect(() => {
        const el = localRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
    }, [value]);
    return (
        <textarea
            {...rest}
            rows={1}
            value={value}
            ref={(el) => { localRef.current = el; inputRef?.(el); }}
        />
    );
}

function StepHeading({ title, hint, action, innerRef }) {
    return (
        <div className="mb-3 flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
            <div className="min-w-0">
                <h4 ref={innerRef} tabIndex={-1} className="text-base focus:outline-none" style={fontBold}>{title}</h4>
                {hint && <p className="mt-0.5 max-w-prose text-xs text-slate-500">{hint}</p>}
            </div>
            {action}
        </div>
    );
}

function Stepper({ current, furthest, onSelect, innerRef }) {
    return (
        <nav ref={innerRef} aria-label="Proposal steps" className="border-b border-slate-200 px-3 py-1.5 sm:px-4">
            <ol className="flex items-center">
                {STEPS.map((label, i) => {
                    const isCurrent = i === current;
                    const isDone = i < current;
                    const reachable = i <= furthest;
                    const circle = isCurrent
                        ? 'bg-[#C2570C] text-white'
                        : isDone
                            ? 'bg-[#4A76C0] text-white'
                            : reachable
                                ? 'border border-[#4A76C0] text-[#3A62A3]'
                                : 'border border-slate-300 text-slate-400';
                    return (
                        <li key={label} className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
                            <button
                                type="button"
                                onClick={() => onSelect(i)}
                                disabled={!reachable}
                                aria-current={isCurrent ? 'step' : undefined}
                                className={`flex min-h-10 items-center gap-2 rounded-lg px-1.5 text-xs font-bold disabled:cursor-not-allowed ${ring} ${isCurrent ? 'text-[#A84A09]' : reachable ? 'text-slate-700 hover:bg-slate-50' : 'text-slate-400'}`}
                            >
                                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] ${circle}`}>
                                    {isDone ? <Check size={13} aria-hidden="true" /> : i + 1}
                                </span>
                                <span className={isCurrent ? '' : 'sr-only sm:not-sr-only'}>{label}</span>
                            </button>
                            {i < STEPS.length - 1 && (
                                <span aria-hidden="true" className={`mx-1 h-px min-w-2 flex-1 ${i < current ? 'bg-[#4A76C0]' : 'bg-slate-200'}`} />
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

function ReviewSection({ title, onEdit, children }) {
    return (
        <section className="border-t border-slate-100 py-3 first:border-t-0 first:pt-0 last:pb-0">
            <div className="mb-2 flex items-center justify-between gap-2">
                <h5 className="text-sm" style={fontBold}>{title}</h5>
                <button type="button" onClick={onEdit} className={`min-h-9 rounded-lg px-2.5 text-xs font-bold text-[#3A62A3] hover:bg-blue-50 ${ring}`}>Edit</button>
            </div>
            {children}
        </section>
    );
}

// Read-only installment table, shared by the review step and the history cards.
function InstallmentsTable({ rows, vatRate }) {
    const totals = sumInstallments(rows);
    const hasRate = vatRate !== undefined && vatRate !== null && vatRate !== '';
    const hasAmounts = rows.some((r) => r.amount !== '' || r.inclVat !== '' || r.exclVat !== '');
    return (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-160 border-collapse text-left text-sm">
                <caption className="sr-only">Installment schedule</caption>
                <thead className="bg-slate-50 text-xs text-slate-600">
                    <tr>
                        <th scope="col" className="w-14 px-3 py-2 text-center font-bold">S.N.</th>
                        <th scope="col" className="px-2 py-2 font-bold">Months</th>
                        <th scope="col" className="px-2 py-2 text-right font-bold">Amt</th>
                        <th scope="col" className="px-2 py-2 text-right font-bold">Incl. VAT{hasRate ? ` (${toNum(vatRate)}%)` : ''}</th>
                        <th scope="col" className="px-2 py-2 text-right font-bold">Excl. VAT</th>
                        <th scope="col" className="px-2 py-2 font-bold">Remarks</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => (
                        <tr key={row.id || index} className="border-t border-slate-100 align-top">
                            <td className="px-3 py-2 text-center font-bold text-slate-500">{index + 1}</td>
                            <td className="whitespace-nowrap px-2 py-2">{formatMonth(row.month)}</td>
                            <td className="whitespace-nowrap px-2 py-2 text-right tabular-nums">{money(row.amount)}</td>
                            <td className="whitespace-nowrap px-2 py-2 text-right tabular-nums">{money(row.inclVat)}</td>
                            <td className="whitespace-nowrap px-2 py-2 text-right tabular-nums">{money(row.exclVat)}</td>
                            <td className="break-words px-2 py-2 text-slate-600">{row.remarks || '—'}</td>
                        </tr>
                    ))}
                </tbody>
                {hasAmounts && (
                    <tfoot className="border-t border-slate-200 bg-slate-50 font-bold">
                        <tr>
                            <td colSpan={2} className="px-3 py-2 text-right">Total</td>
                            <td className="whitespace-nowrap px-2 py-2 text-right tabular-nums">
                                {rows.some((r) => r.amount !== '' && r.amount !== undefined) ? money(totals.amount) : '—'}
                            </td>
                            <td className="whitespace-nowrap px-2 py-2 text-right tabular-nums">{money(totals.incl)}</td>
                            <td className="whitespace-nowrap px-2 py-2 text-right tabular-nums">{money(totals.excl)}</td>
                            <td className="px-2 py-2 text-xs font-normal text-slate-600">VAT {money(totals.incl - totals.excl)}</td>
                        </tr>
                    </tfoot>
                )}
            </table>
        </div>
    );
}

// Timeline feed card: collapsed summary by default, full terms and installments on demand.
function ActivityCard({ data, index, sent, onDelete, deleting }) {
    const [open, setOpen] = useState(false);
    const regionId = useId();

    const recipients = (Array.isArray(data.sendto) ? data.sendto : [data.sendto]).filter(Boolean);
    const terms = (data.termsAndConditions || []).map((t) => (typeof t === 'string' ? t : t.text));
    const rows = (data.installments || []).map(normalizeInstallment);
    const vatRate = rows.find((r) => r.vatRate !== undefined)?.vatRate;
    const totals = sumInstallments(rows);
    const hasVatAmounts = rows.some((r) => [r.inclVat, r.exclVat].some((value) => value !== '' && value !== undefined));

    const summary = [
        `${terms.length} ${terms.length === 1 ? 'term' : 'terms'}`,
        `${rows.length} ${rows.length === 1 ? 'installment' : 'installments'}`,
        rows.some((r) => r.amount !== '' && r.amount !== undefined) ? `${money(totals.amount)} Amt` : '',
        hasVatAmounts ? `${money(totals.incl)} incl. VAT` : '',
    ].filter(Boolean).join(', ');

    return (
        <article className="rounded-lg border border-[#cbd6e2] bg-white shadow-sm" style={fontBody}>
            <div className="flex items-start gap-1 p-2 pr-2">
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    aria-controls={regionId}
                    className={`flex min-w-0 flex-1 items-start gap-3 rounded-lg p-1.5 text-left hover:bg-slate-50 ${ring}`}
                >
                    <span className="relative mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded bg-blue-100 text-xs font-bold tabular-nums text-blue-700" style={fontBold} title={`Proposal ${index}`}>
                        <span aria-hidden="true">{index}</span>
                        {sent && (
                            <span title="Sent" className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white ring-2 ring-white">
                                <Check size={10} strokeWidth={3} aria-hidden="true" />
                            </span>
                        )}
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] font-bold" style={fontBold}>
                            <span>Proposal #{index}</span>
                            {sent && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                    <Check size={10} strokeWidth={3} aria-hidden="true" /> Sent
                                </span>
                            )}
                        </span>
                        <span className="mt-0.5 block break-words text-xs text-slate-600">To {recipients.join(', ')}</span>
                        <span className="mt-0.5 block text-xs text-slate-500">{formatSent(data.timestamp || new Date())}</span>
                        {summary && <span className="mt-0.5 block text-xs text-slate-600">{summary}</span>}
                    </span>
                    <ChevronRight size={16} aria-hidden="true" className={`mt-2 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`} />
                </button>
                {!data.isSample && (
                    <button type="button" onClick={() => onDelete(data._id || data.id)} disabled={deleting} aria-label="Delete proposal record" title="Delete" className={`${dangerIconBtn} mt-1 h-10 w-10 shrink-0`}>
                        {deleting ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Trash2 size={15} aria-hidden="true" />}
                    </button>
                )}
            </div>

            {open && (
                <div id={regionId} className="space-y-4 border-t border-slate-100 p-3 sm:p-4">
                    {terms.length > 0 && (
                        <div>
                            <h4 className="mb-1.5 text-xs" style={fontBold}>Terms & conditions</h4>
                            <ol className="list-decimal space-y-1 pl-5 text-sm marker:font-bold marker:text-slate-500">
                                {terms.map((text, index) => <li key={index} className="whitespace-pre-wrap break-words pl-1">{text}</li>)}
                            </ol>
                        </div>
                    )}
                    {rows.length > 0 && (
                        <div>
                            <h4 className="mb-1.5 text-xs" style={fontBold}>Installments</h4>
                            <InstallmentsTable rows={rows} vatRate={vatRate} />
                        </div>
                    )}
                </div>
            )}
        </article>
    );
}