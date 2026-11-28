import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FileSignature,
  Mail,
  X,
  Building2,
  Bold,
  Italic,
  Underline,
  ListOrdered,
  List,
  AlignLeft,
  LoaderCircle,
} from "lucide-react";
import DOMPurify from "dompurify";

import { BuildSlaDocx } from "../innerHelper/stage5/testFront";
import { BuildBackSideDocx } from "../innerHelper/stage5/backSide";
import { UseAdd } from "../../../hooks/useadd";
import { Skeleton } from "../../../skeleton";
import {
  dismissWaitingNotify,
  ErrorNotify,
  SuccessNotify,
  waitingNotify,
} from "../../../hotToaster";

/* ------------------------------ Constants -------------------------------- */

const DRAWER_WIDTH = {
  md: "sm:max-w-md",
  lg: "sm:max-w-xl",
  xl: "sm:max-w-2xl",
};

const BRAND = "bg-gradient-to-r from-amber-500 to-orange-500";
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40";
const INPUT =
  "h-10 w-full cursor-text rounded-lg font-medium text-slate-800 border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 disabled:cursor-not-allowed";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const FORMAT_COMMANDS = [
  ["bold", "Bold", Bold],
  ["italic", "Italic", Italic],
  ["underline", "Underline", Underline],
  ["insertOrderedList", "Numbered list", ListOrdered],
  ["insertUnorderedList", "Bulleted list", List],
  ["justifyLeft", "Align left", AlignLeft],
];

/* ---------------------------- Framer Motion ------------------------------ */

const EASE_OUT = [0.22, 1, 0.36, 1]; // soft, gentle settle

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: EASE_OUT },
  },
};

const press = (disabled) =>
  disabled ? {} : { whileHover: "hover", whileTap: "tap" };

const btnVariants = {
  hover: { scale: 1.02 },
  tap: { scale: 0.97 },
};

const iconVariants = {
  hover: { rotate: -8, scale: 1.12 },
  tap: { scale: 0.92 },
};

// slower, softer spring for hover/tap feedback
const softSpring = { type: "spring", stiffness: 180, damping: 22 };

/* ------------------------------- Helpers --------------------------------- */

const errMsg = (e, fallback) =>
  e?.response?.data?.message || e?.message || fallback;

const isValidEmail = (email) => EMAIL_PATTERN.test(String(email || "").trim());

const escapeHtml = (value) =>
  String(value || "").replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );

const leadFormRecord = (row) => {
  const organization =
    row.organization && typeof row.organization === "object"
      ? row.organization
      : row.organizationDetails?.[0] || {};

  return {
    ...row,
    lead: row.lead || row.leadDetails?.[0] || {},
    organization: {
      ...organization,
      organizationName:
        organization.organizationName ||
        row.organizationName ||
        row.organization ||
        "",
      orgEmail: organization.orgEmail || row.orgEmail || "",
      contactPersonName: organization.contactPersonName || row.contact || "",
      contactPersonEmail:
        organization.contactPersonEmail || row.contactPersonEmail || "",
      contactPersonNumber: organization.contactPersonNumber || row.phone || "",
    },
  };
};

function useEscape(onEscape, { enabled = true, ignoreFields = false } = {}) {
  const ref = useRef(onEscape);
  ref.current = onEscape;

  useEffect(() => {
    if (!enabled) return undefined;
    const handler = (e) => {
      if (e.key !== "Escape") return;
      const t = e.target;
      if (
        ignoreFields &&
        (t?.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(t?.tagName))
      )
        return;
      ref.current();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, ignoreFields]);
}

function useBodyLock(active = true) {
  useEffect(() => {
    if (!active) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);
}

/* ----------------------------- SideDrawer UI ----------------------------- */

function SideDrawer({
  onClose,
  eyebrow,
  title,
  subtitle,
  size = "md",
  footer,
  locked = false,
  embedded = false,
  children,
}) {
  const titleId = useId();
  const close = () => {
    if (!locked) onClose();
  };
  useEscape(close, { enabled: !embedded });
  useBodyLock(!embedded);

  if (embedded) {
    return (
      <>
        <div className="relative">
          <h2 className="mb-3 text-sm font-bold text-slate-900">
            Send Contract
          </h2>
          {children}
        </div>
        {footer && (
          <motion.footer
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="mt-4 border-t border-slate-200 bg-white px-4 py-3"
          >
            {footer}
          </motion.footer>
        )}
      </>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <motion.div
        aria-hidden="true"
        onClick={close}
        className={`absolute inset-0 bg-black/60 ${locked ? "cursor-not-allowed" : "cursor-pointer"}`}
        style={{ backdropFilter: "blur(10px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />

      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className={`relative flex h-full w-full flex-col bg-white shadow-2xl ${DRAWER_WIDTH[size]}`}
      >
        <motion.header
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-5 sm:py-4"
        >
          <div className="min-w-0">
            {eyebrow && (
              <p className="text-[11px] font-extrabold text-amber-600">
                {eyebrow}
              </p>
            )}
            <h2
              id={titleId}
              className="mt-0.5 truncate text-sm font-bold leading-tight text-slate-900 sm:text-base"
              title={title}
            >
              {title}
            </h2>
            {subtitle && (
              <span className="mt-1.5 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                {subtitle}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={close}
            disabled={locked}
            aria-label="Close panel"
            className={`shrink-0 cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`}
          >
            <X size={18} />
          </button>
        </motion.header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-3 sm:p-5">
          {children}
        </div>

        {footer && (
          <motion.footer
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="shrink-0 border-t border-slate-200 bg-white px-3 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] sm:px-4"
          >
            {footer}
          </motion.footer>
        )}
      </motion.aside>
    </div>
  );
}

/* ------------------------- ContractEmailDrawer ------------------------- */

export default function ContractEmailDrawer({
  open = false,
  onClose,
  contract = null,
  normalizeContractRow,
  notify,
  setPreview,
  convertContractToBusiness,
  triggerRef,
  embedded = false,
  onBusyChange,
  onSent,
}) {
  const { SendTO_Contract } = UseAdd();

  /* ------------------------------- State --------------------------------- */

  const [emailBusy, setEmailBusy] = useState(false);
  const [emailStep, setEmailStep] = useState("");
  const [emailContract, setEmailContract] = useState(null);
  const [emailRecipients, setEmailRecipients] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailError, setEmailError] = useState("");
  const [activeFormats, setActiveFormats] = useState({});
  const emailEditorRef = useRef(null);

  const activeEmailContract = embedded
    ? normalizeContractRow
      ? normalizeContractRow(contract)
      : contract
    : emailContract;

  const contractKey = activeEmailContract?.mainID ?? activeEmailContract?.id;

  useEffect(() => {
    onBusyChange?.(emailBusy);
  }, [emailBusy, onBusyChange]);

  /* ------------------------------ Handlers ------------------------------- */

  const syncActiveFormats = () => {
    if (!emailEditorRef.current) return;
    const selection = window.getSelection();
    const insideEditor =
      selection &&
      selection.rangeCount > 0 &&
      emailEditorRef.current.contains(selection.anchorNode);

    if (!insideEditor) return;

    const next = {};
    for (const [command] of FORMAT_COMMANDS) {
      try {
        next[command] = Boolean(document.queryCommandState(command));
      } catch {
        next[command] = false;
      }
    }
    setActiveFormats(next);
  };

  useEffect(() => {
    const handleSelectionChange = () => syncActiveFormats();
    document.addEventListener("selectionchange", handleSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  const openEmailComposer = (targetContract) => {
    const source = targetContract ?? contract;
    const row = normalizeContractRow ? normalizeContractRow(source) : source;
    if (!row?.mainID) {
      notify?.(
        "error",
        "This contract is missing its backend ID and cannot be sent.",
      );
      return;
    }

    const organization = leadFormRecord(row).organization;
    const defaults = [organization.contactPersonEmail, organization.orgEmail]
      .filter((email) => isValidEmail(email))
      .map((email) => email.trim().toLowerCase())
      .filter((email, index, list) => list.indexOf(email) === index)
      .slice(0, 5);
    const name =
      organization.organizationName || row.organizationName || "Organization";
    const contactName = organization.contactPersonName;
    const initialBody = `<p>Dear ${escapeHtml(contactName || "Team")},</p><p>Please find attached the contract agreement${row.service ? ` for ${escapeHtml(row.service)}` : ""} for your review.</p><p>Regards,<br />EIMCTA</p>`;

    if (!embedded) setPreview?.(null);
    setEmailContract(row);
    setEmailRecipients(defaults);
    setEmailInput("");
    setEmailSubject(`Contract Agreement – ${name}`);
    setEmailBody(initialBody);
    setEmailError("");
    setActiveFormats({});
  };

  if (triggerRef && !embedded) {
    triggerRef.current = openEmailComposer;
  }

  useEffect(() => {
    if (open && contract) {
      openEmailComposer(contract);
    } else if (!open && !emailBusy) {
      setEmailContract(null);
      setEmailInput("");
      setEmailError("");
      setActiveFormats({});
    }
  }, [open, contract]);

  useEffect(() => {
    if (!activeEmailContract || !emailEditorRef.current) return;
    emailEditorRef.current.innerHTML = DOMPurify.sanitize(emailBody);
  }, [contractKey]);

  const closeEmailComposer = () => {
    if (embedded) return;
    if (emailBusy) return;
    setEmailContract(null);
    setEmailInput("");
    setEmailError("");
    setActiveFormats({});
    onClose?.();
  };

  const addEmailRecipients = (rawValue) => {
    const candidates = rawValue
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean);
    if (!candidates.length) return;

    const invalid = candidates.find((email) => !isValidEmail(email));
    if (invalid) {
      setEmailError(`“${invalid}” is not a valid email address.`);
      return;
    }

    const normalized = candidates.map((email) => email.toLowerCase());
    const duplicate = normalized.find(
      (email, index) =>
        emailRecipients.includes(email) || normalized.indexOf(email) !== index,
    );
    if (duplicate) {
      setEmailError(`${duplicate} has already been added.`);
      return;
    }
    if (emailRecipients.length + normalized.length > 5) {
      setEmailError("You can add up to 5 recipients.");
      return;
    }

    setEmailRecipients((currentRecipients) => [
      ...currentRecipients,
      ...normalized,
    ]);
    setEmailInput("");
    setEmailError("");
  };

  const handleRecipientKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addEmailRecipients(emailInput);
    }
  };

  const removeEmailRecipient = (indexToRemove) => {
    setEmailRecipients((currentRecipients) =>
      currentRecipients.filter((_, index) => index !== indexToRemove),
    );
    setEmailError("");
  };

  const runEditorCommand = (command) => {
    if (!emailEditorRef.current || emailBusy) return;
    emailEditorRef.current.focus();
    document.execCommand(command, false, null);
    setEmailBody(emailEditorRef.current.innerHTML);
    requestAnimationFrame(syncActiveFormats);
  };

  /* ------------------------- DOCX & API Sending -------------------------- */

  const sendContractEmail = async () => {
    if (emailBusy) return;
    if (!activeEmailContract?.mainID) {
      setEmailError(
        "This contract is missing its backend ID and cannot be sent.",
      );
      return;
    }
    if (!emailRecipients.length) {
      setEmailError("Add at least one recipient.");
      return;
    }
    if (
      emailRecipients.length > 5 ||
      emailRecipients.some((email) => !isValidEmail(email))
    ) {
      setEmailError("Check the recipient email addresses and try again.");
      return;
    }
    if (!emailSubject.trim()) {
      setEmailError("Enter an email subject.");
      return;
    }

    const cleanBody = DOMPurify.sanitize(emailBody);
    const bodyText = cleanBody
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
    if (!bodyText) {
      setEmailError("Write a message before sending.");
      return;
    }

    const waitingMessage = "Preparing and sending contract email...";
    setEmailBusy(true);
    setEmailError("");
    waitingNotify(waitingMessage);
    try {
      setEmailStep("Generating contract documents…");
      await new Promise((resolve) => setTimeout(resolve, 40));

      const [contractBlob, termsBlob] = await Promise.all([
        BuildSlaDocx(),
        BuildBackSideDocx(),
      ]);
      if (!(contractBlob instanceof Blob) || !(termsBlob instanceof Blob)) {
        throw new Error(
          "The contract document generator did not return valid files.",
        );
      }

      const safeOrganization =
        (activeEmailContract.organizationName || "organization")
          .replace(/[^a-z0-9-_]+/gi, "-")
          .replace(/^-+|-+$/g, "")
          .toLowerCase() || "organization";
      const attachments = [
        new File([contractBlob], `${safeOrganization}-contract.docx`, {
          type: DOCX_MIME,
        }),
        new File([termsBlob], `${safeOrganization}-terms-and-conditions.docx`, {
          type: DOCX_MIME,
        }),
      ];
      const payload = new FormData();
      payload.append("to", JSON.stringify(emailRecipients));
      emailRecipients.forEach((email) => payload.append("emailTo[]", email));
      payload.append("subject", emailSubject.trim());
      payload.append("content", cleanBody);
      payload.append("message", cleanBody);
      attachments.forEach((file) => payload.append("file", file, file.name));

      setEmailStep("Sending contract email…");
      const response = await SendTO_Contract.mutateAsync({
        payload,
        params: { MainID: activeEmailContract.mainID },
      });
      if (response?.success === false) {
        throw new Error(
          response.message || "The contract email could not be sent.",
        );
      }

      SuccessNotify(response?.message || "Contract email sent successfully.");
      if (embedded) {
        setEmailInput("");
        setEmailStep("");
        onSent?.();
      } else {
        setEmailContract(null);
        setEmailRecipients([]);
        setEmailInput("");
        setEmailSubject("");
        setEmailBody("");
        setEmailStep("");
        onClose?.();
      }
    } catch (sendError) {
      const message = errMsg(sendError, "Unable to send the contract email.");
      setEmailError(message);
      ErrorNotify(message);
    } finally {
      dismissWaitingNotify(waitingMessage);
      setEmailBusy(false);
      setEmailStep("");
    }
  };

  /* ------------------------------- UI / UX ------------------------------- */

  const isOpen = embedded
    ? Boolean(contract)
    : Boolean(open || emailContract);

  return (
    <AnimatePresence>
      {(embedded ? Boolean(activeEmailContract) : isOpen && emailContract) && (
        <SideDrawer
          key="contract-email-drawer"
          size="xl"
          eyebrow="Contract email"
          title="Send Contract"
          subtitle={
            activeEmailContract.organizationName || activeEmailContract.mainID
          }
          onClose={closeEmailComposer}
          locked={emailBusy}
          embedded={embedded}
          footer={
            <div className="space-y-3">
              {/* Loading status */}
              <div
                className="min-w-0 text-[11px] text-slate-500"
                aria-live="polite"
              >
                <AnimatePresence mode="wait">
                  {emailBusy && (
                    <motion.div
                      key={emailStep}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{
                        delay: 0.5,
                        duration: 0.6,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="inline-flex items-center gap-2"
                    >
                      <Skeleton className="h-3 w-32 rounded-full" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  type="button"
                  onClick={() =>
                    convertContractToBusiness?.(activeEmailContract)
                  }
                  disabled={
                    emailBusy ||
                    (activeEmailContract.status &&
                      activeEmailContract.status !== "contract")
                  }
                  variants={btnVariants}
                  {...press(
                    emailBusy ||
                      (activeEmailContract.status &&
                        activeEmailContract.status !== "contract"),
                  )}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 22,
                  }}
                  className={`inline-flex min-h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-3 text-xs font-bold text-white shadow-md shadow-orange-500/20 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`}
                >
                  <motion.span
                    variants={iconVariants}
                    className="inline-flex"
                  >
                    <Building2 size={15} />
                  </motion.span>
                  {activeEmailContract.status === "converted"
                    ? "Already Converted"
                    : "Convert to Business"}
                </motion.button>

                <motion.button
                  type="button"
                  onClick={sendContractEmail}
                  disabled={emailBusy}
                  variants={btnVariants}
                  {...press(emailBusy)}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 22,
                  }}
                  className={`inline-flex min-h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 text-xs font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60 ${BRAND} ${FOCUS}`}
                >
                  {emailBusy
                    ? <LoaderCircle className="h-3 w-3 animate-spin text-white" strokeWidth={2.5} />
                    : <Mail size={15} />}
                  Send Contract
                </motion.button>
              </div>
            </div>
          }
        >
          <motion.div
            className="space-y-4"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {/* Recipients */}
            <motion.div variants={fadeUp}>
              <label
                htmlFor="contract-recipient"
                className="mb-1.5 block text-xs font-bold text-slate-900"
              >
                Send To{" "}
                <span className="font-medium text-slate-700">
                  (up to 5 recipients)
                </span>
              </label>

              <motion.div
                layout
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className="flex min-h-11 flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 transition-colors focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/10"
              >
                <AnimatePresence initial={false} mode="popLayout">
                  {emailRecipients.map((email, index) => (
                    <motion.span
                      key={email}
                      layout
                      initial={{ opacity: 0, scale: 0.8, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.45, ease: EASE_OUT }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800"
                    >
                      {email}
                      <motion.button
                        type="button"
                        aria-label={`Remove ${email}`}
                        disabled={emailBusy}
                        onClick={() => removeEmailRecipient(index)}
                        whileHover={
                          emailBusy
                            ? undefined
                            : { scale: 1.25, rotate: 90 }
                        }
                        whileTap={emailBusy ? undefined : { scale: 0.85 }}
                        transition={{ duration: 0.4, ease: EASE_OUT }}
                        className="cursor-pointer rounded-full text-amber-600 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <X size={12} />
                      </motion.button>
                    </motion.span>
                  ))}
                </AnimatePresence>

                {emailRecipients.length < 5 && (
                  <motion.input
                    layout
                    id="contract-recipient"
                    type="text"
                    inputMode="email"
                    transition={{ duration: 0.4, ease: EASE_OUT }}
                    value={emailInput}
                    disabled={emailBusy}
                    onChange={(event) => {
                      setEmailInput(event.target.value);
                      if (emailError) setEmailError("");
                    }}
                    onKeyDown={handleRecipientKeyDown}
                    onBlur={() => {
                      if (emailInput.trim()) addEmailRecipients(emailInput);
                    }}
                    placeholder={
                      emailRecipients.length
                        ? "Add another email…"
                        : "Enter an email and press Enter"
                    }
                    className="min-w-[180px] flex-1 cursor-text border-0 bg-transparent px-1 py-1 text-xs font-medium text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                    aria-describedby={
                      emailError ? "contract-email-error" : undefined
                    }
                  />
                )}
              </motion.div>
            </motion.div>

            {/* Subject */}
            <motion.div variants={fadeUp}>
              <label
                htmlFor="contract-email-subject"
                className="mb-1.5 block text-xs font-bold text-slate-900"
              >
                Subject
              </label>
              <motion.input
                id="contract-email-subject"
                type="text"
                value={emailSubject}
                disabled={emailBusy}
                onChange={(event) => setEmailSubject(event.target.value)}
                whileFocus={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={INPUT}
              />
            </motion.div>

            {/* Email body */}
            <motion.div variants={fadeUp}>
              <span
                id="contract-email-body-label"
                className="mb-1.5 block text-xs font-bold text-slate-900"
              >
                Email Body
              </span>

              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white transition-colors focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/10">
                <div
                  role="toolbar"
                  aria-label="Email formatting"
                  className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-1.5"
                >
                  {FORMAT_COMMANDS.map(([command, label, Icon]) => {
                    const isActive = Boolean(activeFormats[command]);
                    return (
                      <motion.button
                        key={command}
                        type="button"
                        aria-label={label}
                        aria-pressed={isActive}
                        title={label}
                        disabled={emailBusy}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => runEditorCommand(command)}
                        whileHover={
                          emailBusy ? undefined : { scale: 1.12, y: -1 }
                        }
                        whileTap={emailBusy ? undefined : { scale: 0.9 }}
                        transition={{
                          type: "spring",
                          stiffness: 450,
                          damping: 24,
                        }}
                        className={`cursor-pointer rounded-md p-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS} ${
                          isActive
                            ? "bg-amber-200/80 text-amber-900 ring-1 ring-amber-400/70"
                            : "text-slate-700 hover:bg-amber-100 hover:text-amber-700"
                        }`}
                      >
                        <Icon size={15} />
                      </motion.button>
                    );
                  })}
                </div>

                <div
                  ref={emailEditorRef}
                  role="textbox"
                  aria-labelledby="contract-email-body-label"
                  aria-multiline="true"
                  contentEditable={!emailBusy}
                  suppressContentEditableWarning
                  onInput={(event) => {
                    setEmailBody(event.currentTarget.innerHTML);
                    syncActiveFormats();
                  }}
                  onKeyUp={syncActiveFormats}
                  onMouseUp={syncActiveFormats}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") event.stopPropagation();
                  }}
                  className={`min-h-44 max-h-[45vh] overflow-y-auto p-3 text-xs leading-6 text-slate-800 outline-none empty:before:text-slate-400 empty:before:content-['Write_your_message…'] [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-1 ${emailBusy ? "cursor-not-allowed" : "cursor-text"}`}
                />
              </div>
            </motion.div>

            {/* Attachments */}
            <motion.section
              variants={fadeUp}
              aria-label="Attachments"
              className="rounded-lg border border-slate-200 bg-white p-3"
            >
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900">
                <FileSignature size={15} className="text-amber-600" />
                Attachments
              </div>

              <ul className="mt-2 space-y-1.5 text-[11px] font-medium text-slate-800">
                {["contract.docx", "terms-and-conditions.docx"].map(
                  (file) => (
                    <motion.li
                      key={file}
                      whileHover={{ x: 3 }}
                      transition={softSpring}
                    >
                      {activeEmailContract.organizationName || "Organization"}{" "}
                      {file}
                    </motion.li>
                  ),
                )}
              </ul>

              <p className="mt-2 text-[10px] font-medium text-slate-800">
                Documents are generated when you send.
              </p>
            </motion.section>

            {/* Error */}
            <AnimatePresence>
              {emailError && (
                <motion.p
                  id="contract-email-error"
                  role="alert"
                  initial={{ opacity: 0, height: 0, y: -8 }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                    y: 0,
                    x: [0, -6, 6, -4, 4, 0], // small shake
                  }}
                  exit={{ opacity: 0, height: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                  className="overflow-hidden rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
                >
                  {emailError}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </SideDrawer>
      )}
    </AnimatePresence>
  );
}