import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import {
    AlertTriangle, Check, ChevronRight, FileText, LoaderCircle, Send, Trash2, X,
} from 'lucide-react';

import { UseAdd } from '../../../../hooks/useadd';
import { useGet } from '../../../../hooks/useGet';
import { useEdit } from '../../../../hooks/useEdit';
import { UseDelete } from '../../../../hooks/useDelete';

import { dismissWaitingNotify, waitingNotify, SuccessNotify, ErrorNotify } from '../../../../hotToaster';
import { BuildProposalDocx } from '../../proposal/proposalPage';
import { InstallmentDrawer } from '../../ContractPage/installement';
import { TermsAndConditionsDrawer } from '../../ContractPage/termsCondition';
import { Skeleton } from '../../../../skeleton';

const fontBody = { fontFamily: "'Roboto Slab', serif", fontWeight: 400 };
const fontBold = { fontFamily: "'Roboto Slab', serif", fontWeight: 700 };

// ---- shared class strings ----
// Rule for this file: no borders and no white boxes. Structure comes from spacing,
// type scale and tonal fills (slate-50 / slate-100). The body wrapper has no padding.
const ring = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A76C0]/60';
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40';
const BRAND = 'bg-gradient-to-r from-amber-500 to-orange-500';
const btnPrimary = `inline-flex min-h-10 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-5 text-sm font-bold text-white transition hover:from-amber-600 hover:to-orange-600 disabled:cursor-not-allowed disabled:opacity-60 ${BRAND} ${FOCUS}`;
const dangerIconBtn = `inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 ${ring}`;

// ---- constants ----
const MAX_RECIPIENTS = 5;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TABS = [
    { label: 'Recipients', value: 'Recipients' },
    { label: 'Installment', value: 'Installment' },
    { label: 'Terms & Conditions', value: 'Terms' },
];
const TAB_COMPONENTS = {
    Installment: InstallmentDrawer,
    Terms: TermsAndConditionsDrawer,
};

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
const toNum = (value) => {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : 0;
};
const money = (value) => {
    if (value === '' || value === null || value === undefined || Number.isNaN(Number(value))) return '—';
    return `Rs. ${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

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

const normalizeInstallment = (inst) => {
    if (typeof inst === 'string') return { month: inst, amount: '', inclVat: '', exclVat: '', remarks: '' };
    if (inst.inclVat !== undefined || inst.exclVat !== undefined) return { ...inst, amount: inst.amount ?? '' };
    const legacy = [inst.rs ? `Rs. ${inst.rs}` : '', inst.percent ? `(${inst.percent}%)` : ''].filter(Boolean).join(' ');
    return { month: inst.month, amount: inst.amount ?? '', inclVat: '', exclVat: '', remarks: legacy };
};

const isSentRecord = (record) => String(record?.status || '').toLowerCase() === 'sent';

// proposalTimes (from LeadsPage): { count, onChange(count, action) }.
export default function Proposal({ id, lead, compact = false, sampleMode = false, onClose, proposalTimes }) {
    const mainID =
        lead?._id ||
        (typeof id === 'string' ? id : null) ||
        id?.mainID ||
        id?.MainID ||
        id?._id;
    const preloadedCount = Number(typeof proposalTimes === 'number' ? proposalTimes : proposalTimes?.count) || 0;
    const timesChangeRef = useRef(null);
    timesChangeRef.current = typeof proposalTimes === 'object' ? proposalTimes?.onChange : null;

    // --- STATE ---
    const [activities, setActivities] = useState(() => sampleMode || !mainID ? SAMPLE_PROPOSALS : []);
    const [historyReady, setHistoryReady] = useState(Boolean(sampleMode || !mainID));

    const [isSubmitting, setIsSubmitting] = useState(false);
    const submitLockRef = useRef(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    // The full proposal stays in state while the wizard steps mount and unmount.
    const [proposalData, setProposalData] = useState({
        recipients: [],
        installment: { rows: [], computedRows: [], discountPercent: '0', vatEnabled: true },
        termsCondition: [],
    });
    const [emailInput, setEmailInput] = useState('');
    const [errors, setErrors] = useState({});
    const [activeTab, setActiveTab] = useState('Recipients');
    const msgTo = proposalData.recipients;
    const emailError = errors.recipients || '';

    const updateProposalData = (section, value) => {
        setProposalData((previous) => ({
            ...previous,
            [section]: typeof value === 'function' ? value(previous[section]) : value,
        }));
        const errorKey = section === 'termsCondition' ? 'terms' : section;
        setErrors((previous) => {
            if (!previous[errorKey]) return previous;
            const next = { ...previous };
            delete next[errorKey];
            return next;
        });
    };

    const fieldRefs = useRef({});
    const emailInputId = useId();

    const registerRef = (key) => (el) => {
        if (el) fieldRefs.current[key] = el;
        else delete fieldRefs.current[key];
    };

    // --- INITIALIZE HOOKS ---
    const { Getproposal_ } = useGet();
    const { UpdateInstallment_, UpdateTermsAndConditions_ } = useEdit();
    const { proposal_ } = UseAdd();
    const { Deleteproposal_ } = UseDelete();
    const requireMainId = () => {
        if (sampleMode) {
            ErrorNotify("Sample proposal records are read-only.");
            return false;
        }
        if (mainID) return true;
        ErrorNotify("Save this lead before sending or deleting proposal records.");
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
                parms: { MainID: mainID }
            });

            const list = Array.isArray(res?.data)
                ? res.data
                : Array.isArray(res?.data?.data)
                    ? res.data.data
                    : Array.isArray(res)
                        ? res
                        : null;
            if (!Array.isArray(list)) throw new Error('Invalid proposal history response.');
            setActivities(list);
            setHistoryReady(true);
            const proposalCount = list.filter(isSentRecord).length;
            timesChangeRef.current?.(proposalCount, action);
            if (!silent) SuccessNotify('Proposal history loaded.');
        } catch (error) {
            console.error("Error fetching timeline activities:", error);
            ErrorNotify(error?.response?.data?.message || error?.message || "Unable to load proposal history.");
        } finally {
            dismissWaitingNotify(loadingMessage);
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        if (mainID && !sampleMode) fetchActivities();
    }, [mainID]);

    // =========================================================================
    // API HANDLERS (ADD, DELETE)
    // =========================================================================
    const handleSaveMessageAPI = async (payload) => {
        if (isSubmitting || submitLockRef.current) return false;
        if (!requireMainId()) return false;
        submitLockRef.current = true;
        setIsSubmitting(true);
        const loadingMessage = 'Saving proposal...';
        waitingNotify(loadingMessage);
        try {
            const installmentResult = await UpdateInstallment_.mutateAsync({
                params: { MainID: mainID },
                payload: { installment: payload.installments },
            });
            if (installmentResult?.success !== true) {
                throw new Error(installmentResult?.message || 'Unable to save installment schedule.');
            }

            const termsResult = await UpdateTermsAndConditions_.mutateAsync({
                params: { MainID: mainID },
                payload: { termsCondition: payload.termsAndConditions },
            });
            if (termsResult?.success !== true) {
                throw new Error(termsResult?.message || 'Unable to save terms and conditions.');
            }

            const newRecord = {
                sendto: payload.sendto,
                subject: 'Business Proposal',
                message: 'Please find our business proposal attached for your review.',
                installments: payload.installments,
                termsAndConditions: payload.termsAndConditions,
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
                parms: { MainID: mainID },
                payload: formData
            });
            if (res?.success !== true) {
                throw new Error(res?.message || 'Unable to save proposal email metadata.');
            }

            await fetchActivities({ silent: true, action: 'sent' });
            if (res?.emailSent === false) {
                ErrorNotify(res?.message || 'Proposal was saved, but email delivery failed.');
            } else {
                SuccessNotify(res?.message || 'Proposal sent successfully!');
            }
            return true;
        } catch (error) {
            console.error("Proposal submission error:", error);
            ErrorNotify(error?.response?.data?.message || error?.message || "Failed to submit proposal.");
            return false;
        } finally {
            dismissWaitingNotify(loadingMessage);
            submitLockRef.current = false;
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
                ErrorNotify(error?.response?.data?.message || error?.message || "Failed to delete proposal.");
            } finally {
                dismissWaitingNotify(loadingMessage);
                setDeletingId(null);
            }
        }
    };

    // =========================================================================
    // RECIPIENTS
    // =========================================================================
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

        updateProposalData('recipients', list);
        setEmailInput(badEntry);
        const recipientError = badEntry
            ? `“${badEntry}” isn’t a valid email address.`
            : hitLimit
                ? `You can send to ${MAX_RECIPIENTS} recipients at most.`
                : dupEntry
                    ? `${dupEntry} is already added.`
                    : '';
        setErrors((previous) => ({ ...previous, recipients: recipientError }));
        return { list, ok: !badEntry && !hitLimit };
    };

    const handleEmailKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',' || e.key === ';') {
            e.preventDefault();
            addEmails(emailInput);
        } else if (e.key === 'Backspace' && !emailInput && msgTo.length > 0) {
            updateProposalData('recipients', msgTo.slice(0, -1));
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
        updateProposalData('recipients', msgTo.filter((_, index) => index !== indexToRemove));
        setErrors((previous) => ({ ...previous, recipients: '' }));
    };

    // =========================================================================
    // WIZARD VALIDATION AND SUBMISSION
    // =========================================================================
    const validateRecipients = () => {
        const { list, ok } = emailInput.trim() ? addEmails(emailInput) : { list: msgTo, ok: true };
        if (!ok) return null;
        if (list.length === 0) {
            setErrors((previous) => ({ ...previous, recipients: 'Add at least one recipient before continuing.' }));
            fieldRefs.current.email?.focus();
            return null;
        }
        updateProposalData('recipients', list);
        return list;
    };

    const validateStep = (step) => {
        if (step === 'Recipients') return Boolean(validateRecipients());
        return true;
    };

    const handleNext = () => {
        if (isSubmitting || !validateStep(activeTab)) return;
        const currentIndex = TABS.findIndex((tab) => tab.value === activeTab);
        if (currentIndex < TABS.length - 1) setActiveTab(TABS[currentIndex + 1].value);
    };

    const handlePrevious = () => {
        if (isSubmitting) return;
        const currentIndex = TABS.findIndex((tab) => tab.value === activeTab);
        if (currentIndex > 0) setActiveTab(TABS[currentIndex - 1].value);
    };

    const resetForm = () => {
        setProposalData({
            recipients: [],
            installment: { rows: [], computedRows: [], discountPercent: '0', vatEnabled: true },
            termsCondition: [],
        });
        setEmailInput('');
        setErrors({});
        setActiveTab('Recipients');
    };

    const handleFinalSubmit = async () => {
        if (activeTab !== 'Terms' || isSubmitting) return;

        const invalidSteps = TABS
            .filter((tab) => !validateStep(tab.value))
            .map((tab) => tab.value);
        if (invalidSteps.length) {
            setActiveTab(invalidSteps[0]);
            return;
        }

        const { rows, computedRows, discountPercent, vatEnabled } = proposalData.installment;
        const parsedDiscount = Math.min(100, Math.max(0, parseFloat(discountPercent) || 0));
        const installments = rows.map((row, index) => {
            const computedRow = computedRows[index];
            const existingFields = { ...row };
            delete existingFields.uid;
            return {
                ...existingFields,
                sn: index + 1,
                month: row.monthDate,
                monthDate: row.monthDate,
                amount: computedRow.rawAmount,
                inclVat: Number(computedRow.inclVat.toFixed(2)),
                exclVat: Number(computedRow.exclVat.toFixed(2)),
                vatAmount: Number(computedRow.vatAmount.toFixed(2)),
                remarks: row.remarks,
                discountPercent: parsedDiscount,
                vatRate: vatEnabled ? 13 : 0,
                vatEnabled,
            };
        });
        const termsAndConditions = proposalData.termsCondition.map((clause, index) => {
            const existingFields = { ...clause };
            delete existingFields.uid;
            delete existingFields.sourceWasString;
            delete existingFields.sourceTitle;
            return {
                ...existingFields,
                sn: index + 1,
                title: clause.title.trim(),
                text: clause.description.trim(),
                description: clause.description.trim(),
            };
        });

        const success = await handleSaveMessageAPI({
            sendto: proposalData.recipients,
            installments,
            termsAndConditions,
        });
        if (success) resetForm();
    };

    const history = Array.isArray(activities) ? activities : [];
    const proposalCount = historyReady && !historyLoading ? history.length : Math.max(history.length, preloadedCount);
    const proposalIndex = useMemo(() => {
        const stamp = (a) => { const t = new Date(a.timestamp).getTime(); return Number.isFinite(t) ? t : 0; };
        const order = history.map((a, i) => ({ key: a._id || a.id || i, t: stamp(a), i }))
            .sort((a, b) => (a.t - b.t) || (a.i - b.i));
        return new Map(order.map((o, n) => [o.key, n + 1]));
    }, [history]);
    const sentCount = history.filter(isSentRecord).length;
    const ActiveTabComponent = TAB_COMPONENTS[activeTab];
    const tabPanelId = `${emailInputId}-panel`;
    const readOnly = !mainID || sampleMode;
    const activeStepIndex = TABS.findIndex((tab) => tab.value === activeTab);
    const recipientLabel = msgTo.length === 0
        ? 'No recipients yet'
        : `${msgTo.length} ${msgTo.length === 1 ? 'recipient' : 'recipients'} selected`;

    // =========================================================================
    // RENDER
    // Flat, borderless layout. The wrapper carries no padding: the host page owns its gutters.
    // =========================================================================
    return (
        <MotionConfig reducedMotion="user">
            <div className={`h-full min-h-0 min-w-0 overflow-y-auto text-[13px] text-[#33475b] scrollbar-thin sm:text-sm ${compact ? 'w-full' : ''}`} style={fontBody}>
                <div className="space-y-10">

                    {readOnly && (
                        <p role="status" className="rounded-lg bg-blue-50 px-4 py-3 text-xs text-blue-900">
                            {sampleMode ? 'Sample proposal records are read-only.' : 'Save a lead to send proposals or manage its details.'}
                        </p>
                    )}

                    {/* ---------------------------- COMPOSER ---------------------------- */}
                    <section aria-label="New proposal" className="min-w-0">
                        <div className="flex items-baseline justify-between gap-3">
                            <h3 className="text-lg text-slate-900" style={fontBold}>New proposal</h3>
                            <span className="text-xs tabular-nums text-slate-500">Proposal #{proposalCount + 1}</span>
                        </div>

                        <ol aria-label="Proposal steps" className="mt-5 grid grid-cols-3 gap-2 sm:gap-4">
                            {TABS.map((tab, index) => {
                                const isActive = index === activeStepIndex;
                                const isComplete = index < activeStepIndex;
                                return (
                                    <li key={tab.value} aria-current={isActive ? 'step' : undefined} className="min-w-0">
                                        <div className={`flex items-center gap-2 border-b-2 pb-3 ${isActive ? 'border-amber-500 text-amber-700' : isComplete ? 'border-emerald-500 text-emerald-700' : 'border-slate-200 text-slate-400'}`}>
                                            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isActive ? 'bg-amber-100' : isComplete ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                                                {isComplete ? <Check size={14} aria-label="Completed" /> : index + 1}
                                            </span>
                                            <span className={`truncate text-[11px] font-bold sm:text-xs ${isActive ? 'text-amber-800' : ''}`} style={fontBold}>
                                                {tab.label}
                                            </span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>

                        <div
                            id={tabPanelId}
                            role="region"
                            aria-label={`${TABS[activeStepIndex]?.label} step`}
                            className="mt-6 min-w-0"
                        >
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.16 }}
                            >
                                {activeTab === 'Recipients' ? (
                                    <div>
                                        <label htmlFor={emailInputId} className="block text-sm text-slate-900" style={fontBold}>
                                            Send to
                                        </label>
                                        <p className="mb-3 mt-1 text-xs text-slate-500">
                                            Press Enter or comma after each address, or paste a list. Up to {MAX_RECIPIENTS} recipients.
                                        </p>

                                        <div
                                            onClick={() => fieldRefs.current.email?.focus()}
                                            className={`flex min-h-12 w-full cursor-text flex-wrap items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors focus-within:ring-2 ${emailError ? 'bg-red-50 focus-within:ring-red-400' : 'bg-slate-100 focus-within:ring-[#4A76C0]/60'}`}
                                        >
                                            <AnimatePresence initial={false}>
                                                {msgTo.map((email, index) => (
                                                    <motion.span
                                                        key={email}
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.9 }}
                                                        className="flex max-w-full items-center gap-1 rounded-md bg-blue-100 py-1 pl-3 pr-1 text-xs font-bold text-blue-900"
                                                    >
                                                        <span className="truncate">{email}</span>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); handleRemoveEmail(index); }}
                                                            aria-label={`Remove ${email}`}
                                                            className={`flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded hover:bg-blue-200 hover:text-red-600 ${FOCUS}`}
                                                        >
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
                                                    onChange={(e) => {
                                                        setEmailInput(e.target.value);
                                                        if (emailError) setErrors((previous) => ({ ...previous, recipients: '' }));
                                                    }}
                                                    onKeyDown={handleEmailKeyDown}
                                                    onPaste={handleEmailPaste}
                                                    onBlur={() => { if (emailInput.trim()) addEmails(emailInput); }}
                                                    aria-invalid={Boolean(emailError)}
                                                    aria-describedby={`${emailInputId}-msg`}
                                                    className="min-h-8 min-w-[10rem] flex-1 cursor-text bg-transparent placeholder:text-slate-400 focus:outline-none"
                                                    placeholder={msgTo.length === 0 ? 'client@company.com' : 'Add another address'}
                                                />
                                            ) : (
                                                <span id={emailInputId} className="py-1 text-xs font-bold text-amber-800">
                                                    Maximum of {MAX_RECIPIENTS} recipients reached
                                                </span>
                                            )}
                                        </div>

                                        <div id={`${emailInputId}-msg`} className="mt-2 flex items-start justify-between gap-3 text-xs">
                                            <p role={emailError ? 'alert' : undefined} className={`flex items-center gap-1 ${emailError ? 'font-bold text-red-700' : 'text-slate-500'}`}>
                                                {emailError && <AlertTriangle size={12} aria-hidden="true" />}
                                                {emailError || 'The proposal is emailed to everyone listed here.'}
                                            </p>
                                            <span className="shrink-0 tabular-nums text-slate-500">{msgTo.length} of {MAX_RECIPIENTS}</span>
                                        </div>
                                    </div>
                                ) : activeTab === 'Installment' && ActiveTabComponent ? (
                                    <ActiveTabComponent
                                        contract={{ ...(lead || {}), MainID: mainID, mainID }}
                                        embedded
                                        deferSave
                                        initialRows={proposalData.installment.rows}
                                        initialDiscount={proposalData.installment.discountPercent}
                                        initialVatEnabled={proposalData.installment.vatEnabled}
                                        onDataChange={(data) => updateProposalData('installment', data)}
                                        validateOnMount={Boolean(errors.installment)}
                                        onClose={handlePrevious}
                                    />
                                ) : activeTab === 'Terms' && ActiveTabComponent ? (
                                    <>
                                        <section aria-label="Proposal review" className="mb-5 rounded-xl bg-slate-50 p-4">
                                            <h4 className="mb-3 text-xs font-extrabold text-slate-800" style={fontBold}>Review proposal</h4>
                                            <div className="space-y-3 text-xs">
                                                <div>
                                                    <p className="font-bold text-slate-600">Recipients</p>
                                                    <p className="mt-1 wrap-break-word text-slate-700">{proposalData.recipients.join(', ')}</p>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-600">Installments</p>
                                                    <ul className="mt-1 space-y-1 text-slate-700">
                                                        {proposalData.installment.computedRows.map((row, index) => (
                                                            <li key={proposalData.installment.rows[index]?.uid || index} className="flex flex-wrap justify-between gap-x-3">
                                                                <span>{row.monthDate || 'Date not set'} · {row.remarks || 'No remarks'}</span>
                                                                <span className="tabular-nums">{money(row.inclVat)} incl. VAT</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </section>
                                        <ActiveTabComponent
                                            contract={{ ...(lead || {}), MainID: mainID, mainID }}
                                            embedded
                                            deferSave
                                            initialClauses={proposalData.termsCondition}
                                            onDataChange={(clauses) => updateProposalData('termsCondition', clauses)}
                                            validateOnMount={Boolean(errors.terms)}
                                            onClose={handlePrevious}
                                        />
                                    </>
                                ) : (
                                    null
                                )}
                            </motion.div>
                        </div>

                        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                {activeTab === 'Recipients' && (
                                    <p className="text-xs text-slate-500" aria-live="polite">{recipientLabel}</p>
                                )}
                                {errors.installment && activeTab === 'Installment' && (
                                    <p role="alert" className="text-xs font-bold text-red-600">Complete all required installment fields before continuing.</p>
                                )}
                                {errors.terms && activeTab === 'Terms' && (
                                    <p role="alert" className="text-xs font-bold text-red-600">Complete all required terms before submitting.</p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {activeStepIndex > 0 && (
                                    <button
                                        type="button"
                                        onClick={handlePrevious}
                                        disabled={isSubmitting}
                                        className={`inline-flex min-h-10 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS}`}
                                    >
                                        Previous
                                    </button>
                                )}
                                {activeStepIndex < TABS.length - 1 ? (
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        disabled={isSubmitting}
                                        className={btnPrimary}
                                    >
                                        Next: {TABS[activeStepIndex + 1].label}
                                        <ChevronRight size={15} aria-hidden="true" />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleFinalSubmit}
                                        disabled={isSubmitting || readOnly}
                                        aria-busy={isSubmitting}
                                        className={btnPrimary}
                                    >
                                        {isSubmitting
                                            ? <LoaderCircle className="h-3 w-3 animate-spin text-white" strokeWidth={2.5} />
                                            : <Send size={15} aria-hidden="true" />}
                                        Submit proposal
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* ---------------------------- HISTORY ---------------------------- */}
                    <section aria-label="Proposal history">
                        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                            <h3 className="text-lg text-slate-900" style={fontBold}>Proposal history</h3>
                            <span className="text-xs tabular-nums text-slate-500">
                                {proposalCount} {proposalCount === 1 ? 'proposal' : 'proposals'}
                                {sentCount > 0 && ` · ${sentCount} sent`}
                            </span>
                        </div>

                        <div className="space-y-2">
                            {historyLoading && (
                                <div role="status" aria-label="Loading proposal history" className="space-y-3 py-6">
                                    {[0, 1, 2].map((index) => (
                                        <div key={index} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
                                            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-3 w-2/5 rounded-full" />
                                                <Skeleton className="h-3 w-3/5 rounded-full" />
                                            </div>
                                            <Skeleton className="h-4 w-4 rounded" />
                                        </div>
                                    ))}
                                </div>
                            )}
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
                                <div className="flex flex-col items-center gap-2 rounded-lg bg-slate-50 py-14 text-center text-slate-500">
                                    <FileText size={28} className="text-slate-400" aria-hidden="true" />
                                    <p className="text-sm font-bold text-slate-700" style={fontBold}>No proposals sent yet</p>
                                    <p className="text-xs">Proposals you send will be listed here.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </MotionConfig>
    );
}

// =============================================================================
// SMALL PIECES
// =============================================================================

// Installment table: tinted header/footer and zebra rows, no lines.
function InstallmentsTable({ rows, vatRate }) {
    const totals = sumInstallments(rows);
    const hasRate = vatRate !== undefined && vatRate !== null && vatRate !== '';
    const hasAmounts = rows.some((r) => r.amount !== '' || r.inclVat !== '' || r.exclVat !== '');
    return (
        <div className="overflow-x-auto rounded-lg">
            <table className="w-full min-w-160 border-collapse text-left text-sm">
                <caption className="sr-only">Installment schedule</caption>
                <thead className="text-xs text-slate-600">
                    <tr className="bg-slate-200/70">
                        <th scope="col" className="w-14 px-3 py-2.5 text-center font-bold">S.N.</th>
                        <th scope="col" className="px-2 py-2.5 font-bold">Months</th>
                        <th scope="col" className="px-2 py-2.5 text-right font-bold">Amt</th>
                        <th scope="col" className="px-2 py-2.5 text-right font-bold">Incl. VAT{hasRate ? ` (${toNum(vatRate)}%)` : ''}</th>
                        <th scope="col" className="px-2 py-2.5 text-right font-bold">Excl. VAT</th>
                        <th scope="col" className="px-3 py-2.5 font-bold">Remarks</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => (
                        <tr key={row.id || index} className={`align-top ${index % 2 === 1 ? 'bg-slate-100/70' : ''}`}>
                            <td className="px-3 py-2.5 text-center font-bold text-slate-500">{index + 1}</td>
                            <td className="whitespace-nowrap px-2 py-2.5">{formatMonth(row.month)}</td>
                            <td className="whitespace-nowrap px-2 py-2.5 text-right tabular-nums">{money(row.amount)}</td>
                            <td className="whitespace-nowrap px-2 py-2.5 text-right tabular-nums">{money(row.inclVat)}</td>
                            <td className="whitespace-nowrap px-2 py-2.5 text-right tabular-nums">{money(row.exclVat)}</td>
                            <td className="break-words px-3 py-2.5 text-slate-600">{row.remarks || '—'}</td>
                        </tr>
                    ))}
                </tbody>
                {hasAmounts && (
                    <tfoot className="bg-slate-200/70 font-bold">
                        <tr>
                            <td colSpan={2} className="px-3 py-2.5 text-right">Total</td>
                            <td className="whitespace-nowrap px-2 py-2.5 text-right tabular-nums">
                                {rows.some((r) => r.amount !== '' && r.amount !== undefined) ? money(totals.amount) : '—'}
                            </td>
                            <td className="whitespace-nowrap px-2 py-2.5 text-right tabular-nums">{money(totals.incl)}</td>
                            <td className="whitespace-nowrap px-2 py-2.5 text-right tabular-nums">{money(totals.excl)}</td>
                            <td className="px-3 py-2.5 text-xs font-normal text-slate-600">VAT {money(totals.incl - totals.excl)}</td>
                        </tr>
                    </tfoot>
                )}
            </table>
        </div>
    );
}

// History row: one tonal block, no border. Expands in place on the same fill.
function ActivityCard({ data, index, sent, onDelete, deleting }) {
    const [open, setOpen] = useState(false);
    const regionId = useId();

    const recipients = (Array.isArray(data.sendto) ? data.sendto : [data.sendto]).filter(Boolean);
    const terms = (data.termsAndConditions || []).map((t) => (typeof t === 'string' ? t : t.text));
    const rows = (data.installments || []).map(normalizeInstallment);
    const vatRate = rows.find((r) => r.vatRate !== undefined)?.vatRate;
    const totals = sumInstallments(rows);
    const hasVatAmounts = rows.some((r) => [r.inclVat, r.exclVat].some((value) => value !== '' && value !== undefined));
    const hasAmt = rows.some((r) => r.amount !== '' && r.amount !== undefined);

    const summary = [
        `${terms.length} ${terms.length === 1 ? 'term' : 'terms'}`,
        `${rows.length} ${rows.length === 1 ? 'installment' : 'installments'}`,
        hasAmt ? `${money(totals.amount)} Amt` : '',
        hasVatAmounts ? `${money(totals.incl)} incl. VAT` : '',
    ].filter(Boolean).join('  ·  ');

    return (
        <article className="rounded-lg bg-slate-50" style={fontBody}>
            <div className="flex items-start gap-1">
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    aria-controls={regionId}
                    className={`flex min-w-0 flex-1 items-start gap-4 rounded-lg px-4 py-3.5 text-left transition-colors hover:bg-slate-100 ${ring}`}
                >
                    <span className="mt-0.5 w-7 shrink-0 text-lg tabular-nums text-[#C2570C]" style={fontBold} title={`Proposal ${index}`}>
                        {index}
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-900" style={fontBold}>
                            <span className="break-words">{recipients.join(', ') || 'No recipient'}</span>
                            {sent && (
                                <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[11px] font-bold text-emerald-800">
                                    <Check size={11} strokeWidth={3} aria-hidden="true" /> Sent
                                </span>
                            )}
                        </span>
                        <span className="mt-1 block text-xs text-slate-500">{formatSent(data.timestamp || new Date())}</span>
                        {summary && <span className="mt-1 block text-xs text-slate-600">{summary}</span>}
                    </span>
                    <ChevronRight size={16} aria-hidden="true" className={`mt-1.5 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`} />
                </button>
                {!data.isSample && (
                    <button
                        type="button"
                        onClick={() => onDelete(data._id || data.id)}
                        disabled={deleting}
                        aria-label="Delete proposal record"
                        title="Delete"
                        className={`${dangerIconBtn} mr-2 mt-3 h-10 w-10 shrink-0`}
                    >
                        {deleting ? <LoaderCircle className="h-4 w-4 animate-spin text-red-600" strokeWidth={2.5} /> : <Trash2 size={15} aria-hidden="true" />}
                    </button>
                )}
            </div>

            {open && (
                <div id={regionId} className="space-y-6 px-4 pb-5 pt-2 sm:pl-[3.75rem]">
                    {terms.length > 0 && (
                        <div>
                            <h4 className="mb-2 text-xs uppercase tracking-wide text-slate-500" style={fontBold}>Terms &amp; conditions</h4>
                            <ol className="list-decimal space-y-1.5 pl-5 text-sm marker:font-bold marker:text-slate-400">
                                {terms.map((text, i) => <li key={i} className="whitespace-pre-wrap break-words pl-1">{text}</li>)}
                            </ol>
                        </div>
                    )}
                    {rows.length > 0 && (
                        <div>
                            <h4 className="mb-2 text-xs uppercase tracking-wide text-slate-500" style={fontBold}>Installments</h4>
                            <InstallmentsTable rows={rows} vatRate={vatRate} />
                        </div>
                    )}
                </div>
            )}
        </article>
    );
}