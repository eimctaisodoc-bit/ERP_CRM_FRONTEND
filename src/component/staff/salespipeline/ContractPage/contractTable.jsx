import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Select from "react-select";
import { Pencil, Eye, FileText, KeyRound, Trash2, Mail } from "lucide-react";
import NepaliDate from "nepali-date-converter";

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40";

const STATUS_STYLES = {
  contract: {
    label: "New",
    actionLabel: "Re-Schedule",
    badge: "bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  converted: {
    label: "Converted",
    actionLabel: "Convert",
    badge: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  terminated: {
    label: "Terminated",
    actionLabel: "Terminate",
    badge: "bg-slate-100 text-slate-700",
    dot: "bg-slate-500",
  },
};

const STATUS_OPTIONS = Object.entries(STATUS_STYLES).map(([value, option]) => ({
  value,
  label: option.actionLabel,
  statusLabel: option.label,
  dot: option.dot,
}));

const parseLeadPickTimestamp = (dateValue, timeValue) => {
  const dateText = String(dateValue || "")
    .trim()
    .replace(/[०-९]/g, (digit) => "०१२३४५६७८९".indexOf(digit));
  const timeText = String(timeValue || "").trim();
  if (!dateText) return null;

  const datePart = dateText.split(/[T ]/)[0];
  const dateMatch = datePart.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  let pickedAt;

  if (!dateMatch) {
    if (timeText) return null;
    const parsedDate = new Date(dateText);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate.getTime();
  }

  const [, yearText, monthText, dayText] = dateMatch;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (year >= 1900 && year < 2040) {
    pickedAt = new Date(year, month - 1, day);
    if (
      pickedAt.getFullYear() !== year ||
      pickedAt.getMonth() !== month - 1 ||
      pickedAt.getDate() !== day
    ) {
      return null;
    }
  } else {
    try {
      const nepaliDate = new NepaliDate(year, month - 1, day);
      if (
        nepaliDate.getYear() !== year ||
        nepaliDate.getMonth() !== month - 1 ||
        nepaliDate.getDate() !== day
      ) {
        return null;
      }
      pickedAt = nepaliDate.toJsDate();
    } catch {
      return null;
    }
  }

  if (!timeText) return null;
  const timeMatch = timeText.match(
    /^(\d{1,2}):([0-5]\d)(?::([0-5]\d))?\s*(AM|PM)?$/i,
  );
  if (!timeMatch) return null;

  let hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  const seconds = Number(timeMatch[3] || 0);
  const meridiem = timeMatch[4]?.toUpperCase();
  if (meridiem) {
    if (hours < 1 || hours > 12) return null;
    if (hours === 12) hours = 0;
    if (meridiem === "PM") hours += 12;
  } else if (hours > 23) {
    return null;
  }

  pickedAt.setHours(hours, minutes, seconds, 0);
  return Number.isNaN(pickedAt.getTime()) ? null : pickedAt.getTime();
};

const formatLeadTakenDuration = (pickedAt, now) => {
  const elapsedSeconds = Math.max(0, Math.floor((now - pickedAt) / 1000));
  const secondsPerDay = 24 * 60 * 60;
  if (elapsedSeconds >= secondsPerDay) {
    const days = Math.floor(elapsedSeconds / secondsPerDay);
    return days === 1 ? "1 day" : `${days} days`;
  }

  const hours = String(Math.floor(elapsedSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(
    2,
    "0",
  );
  const seconds = String(elapsedSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

function LeadTakenValue({ dateValue, timeValue, muted = false }) {
  const pickedAt = parseLeadPickTimestamp(dateValue, timeValue);
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    if (pickedAt === null) return undefined;
    setNow(Date.now());
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, [pickedAt]);

  const value =
    pickedAt === null ? "—" : formatLeadTakenDuration(pickedAt, now);
  return (
    <span
      className={`whitespace-nowrap font-semibold ${
        muted ? "text-slate-400" : "text-slate-600"
      }`}
      title={value}
    >
      {value}
    </span>
  );
}

const STATUS_COLORS = {
  new: { background: "#FFFBEB", foreground: "#B45309" },
  contract: { background: "#FFFBEB", foreground: "#B45309" },
  converted: { background: "#ECFDF5", foreground: "#047857" },
  terminated: { background: "#F1F5F9", foreground: "#334155" },
};

const statusSelectStyles = {
  container: (base) => ({ ...base, width: 140, maxWidth: "100%" }),
  control: (base, state) => {
    const status = state.getValue()[0]?.value || "contract";
    const colors = STATUS_COLORS[status] || STATUS_COLORS.contract;
    return {
      ...base,
      minHeight: 32,
      borderRadius: 9999,
      borderColor: state.isFocused ? "#FCD34D" : "transparent",
      backgroundColor: colors.background,
      boxShadow: state.isFocused ? "0 0 0 2px #F59E0B4D" : "none",
      cursor: state.isDisabled ? "wait" : "pointer",
      "&:hover": { borderColor: state.isFocused ? "#FCD34D" : "transparent" },
    };
  },
  valueContainer: (base) => ({ ...base, minWidth: 0, padding: "0 0 0 10px" }),
  singleValue: (base, state) => ({
    ...base,
    color: state.isDisabled
      ? "#94A3B8"
      : (STATUS_COLORS[state.data.value] || STATUS_COLORS.contract).foreground,
    fontSize: 12,
    fontWeight: 600,
  }),
  indicatorsContainer: (base) => ({ ...base, paddingRight: 4 }),
  dropdownIndicator: (base, state) => ({
    ...base,
    padding: 4,
    color: state.isDisabled
      ? "#94A3B8"
      : (STATUS_COLORS[state.getValue()[0]?.value] || STATUS_COLORS.contract)
          .foreground,
    "&:hover": { color: "#0F172A" },
  }),
  indicatorSeparator: () => ({ display: "none" }),
  menuPortal: (base) => ({ ...base, zIndex: 300 }),
  menu: (base) => ({ ...base, overflow: "hidden", borderRadius: 8 }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#F97316"
      : state.isFocused
        ? "#FFF7ED"
        : "#FFFFFF",
    color: state.isSelected ? "#FFFFFF" : "#1E293B",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 500,
  }),
};

export const CONTRACT_COLUMNS = [
  { key: "leadId", label: "Lead ID", nowrap: true },
  { key: "organizationName", label: "Organization Name" },
  { key: "service", label: "Service" },
  { key: "leadTaken", label: "LeadTaken", nowrap: true },
  { key: "status", label: "Status", nowrap: true },
];

export default function ContractsTable({
  columns = CONTRACT_COLUMNS,
  rows = [],
  loading = false,
  skeletonRows = 10,
  groupKey = "",
  selected = [],
  allSelected = false,
  onToggleOne,
  onToggleAll,
  onView,
  onEdit,
  onViewContract,
  onSendContract,
  onStatusChange,
  statusBusyId,
  onClientCredential,
  onDelete,
  hasFilters = false,
  onClearFilters,
}) {
  const rowMotion = (index) => ({
    initial: { y: 8, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { delay: Math.min(index, 10) * 0.03, duration: 0.25 },
  });

  return (
    <>
      <div className="hidden w-full overflow-x-auto md:block">
        <table
          className="w-full min-w-[980px] text-left text-xs"
          aria-busy={loading}
        >
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="w-12 border-b border-slate-200 px-4 py-3">
                <AnimatedCheckbox
                  checked={allSelected}
                  onChange={onToggleAll}
                  label="Select all contracts on this page"
                  disabled={loading}
                />
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="whitespace-nowrap  border-b border-slate-200  px-4 py-3 text-[11px] font-bold uppercase tracking-wide"
                >
                  {column.label}
                </th>
              ))}
              <th
                scope="col"
                className="sticky right-0 z-10 whitespace-nowrap border-b border-l border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-bold uppercase tracking-wide"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <TableSkeleton rows={skeletonRows} cols={columns.length} />
            ) : rows.length ? (
              rows.map((row, index) => {
                const isSelected = selected.includes(row.id);
                const isTerminated = row.isTerminated === true;
                return (
                  <motion.tr
                    key={`${groupKey}-${row.id}`}
                    {...rowMotion(index)}
                    className={`transition-colors ${
                      isTerminated
                        ? "bg-slate-100 text-slate-400 line-through"
                        : isSelected
                          ? "bg-amber-50 hover:bg-amber-100"
                          : "bg-white hover:bg-slate-50"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <AnimatedCheckbox
                        checked={isSelected}
                        onChange={() => onToggleOne?.(row.id)}
                        label={`Select ${row.leadId}`}
                        disabled={loading}
                      />
                    </td>
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-4 font-light py-3 ${column.nowrap ? "whitespace-nowrap" : "max-w-[240px]"}`}
                      >
                        <Cell
                          column={column}
                          row={row}
                          onView={onView}
                          onStatusChange={onStatusChange}
                          statusBusy={statusBusyId === row.id}
                        />
                      </td>
                    ))}
                    <td className="sticky right-0 border-l font-light border-slate-200 bg-inherit px-3 py-3">
                      <RowActions
                        row={row}
                        onView={() => onView?.(row)}
                        onEdit={() => onEdit?.(row)}
                        onViewContract={() => onViewContract?.(row)}
                        onSendContract={() => onSendContract?.(row)}
                        onClientCredential={() => onClientCredential?.(row)}
                        onDelete={() => onDelete?.(row)}
                        disabled={isTerminated}
                      />
                    </td>
                  </motion.tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={columns.length + 2}
                  className="px-4 py-16 text-center"
                >
                  <EmptyState
                    hasFilters={hasFilters}
                    onClear={onClearFilters}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden">
        {loading ? (
          <ul className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <ContractCardSkeleton key={index} />
            ))}
          </ul>
        ) : rows.length ? (
          <>
            <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
              <AnimatedCheckbox
                checked={allSelected}
                onChange={onToggleAll}
                label="Select all contracts on this page"
              />
              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Select all on this page
              </span>
            </div>
            <ul className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2">
              {rows.map((row, index) => {
                const isSelected = selected.includes(row.id);
                return (
                  <motion.li
                    key={`${groupKey}-${row.id}`}
                    {...rowMotion(index)}
                    className={`rounded-xl border p-3 transition-colors ${
                      isSelected
                        ? "border-amber-300 bg-amber-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <AnimatedCheckbox
                        checked={isSelected}
                        onChange={() => onToggleOne?.(row.id)}
                        label={`Select ${row.leadId}`}
                      />
                      <dl className="min-w-0 flex-1 space-y-2 text-[11px]">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <dt className="text-[10px] text-slate-400">
                              Lead ID
                            </dt>
                            <dd>
                              <LeadIdButton row={row} onView={onView} />
                            </dd>
                          </div>
                          <ContractStatusSelect
                            status={row.status}
                            disabled={statusBusyId === row.id}
                            loading={statusBusyId === row.id}
                            onChange={(status) => onStatusChange?.(row, status)}
                          />
                        </div>
                        <CardField
                          label="Organization Name"
                          value={row.organizationName}
                        />
                        <CardField label="Service" value={row.service} />
                        <CardField
                          label="LeadTaken"
                          value={
                            <LeadTakenValue
                              dateValue={row.leadPickDate}
                              timeValue={row.leadPickTime}
                            />
                          }
                        />
                      </dl>
                    </div>
                    <div className="mt-3 border-t border-slate-100 pt-2">
                      <RowActions
                        row={row}
                        onView={() => onView?.(row)}
                        onEdit={() => onEdit?.(row)}
                        onViewContract={() => onViewContract?.(row)}
                        onSendContract={() => onSendContract?.(row)}
                        onClientCredential={() => onClientCredential?.(row)}
                        onDelete={() => onDelete?.(row)}
                      />
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          </>
        ) : (
          <div className="px-4 py-12 text-center">
            <EmptyState hasFilters={hasFilters} onClear={onClearFilters} />
          </div>
        )}
      </div>
    </>
  );
}

function Cell({ column, row, onView, onStatusChange, statusBusy }) {
  if (column.key === "leadId")
    return <LeadIdButton row={row} onView={onView} />;
  if (column.key === "leadTaken") {
    return (
      <LeadTakenValue
        dateValue={row.leadPickDate}
        timeValue={row.leadPickTime}
        muted={row.isTerminated === true}
      />
    );
  }
  if (column.key === "status") {
    return (
      <ContractStatusSelect
        status={row.status}
        disabled={statusBusy}
        loading={statusBusy}
        onChange={(status) => onStatusChange?.(row, status)}
      />
    );
  }
  const value = row[column.key];
  const text =
    value === null || value === undefined || value === "" ? "-" : String(value);
  return (
    <span className="line-clamp-2 font-semibold break-words" title={text}>
      {text}
    </span>
  );
}

function LeadIdButton({ row, onView, disabled = false }) {
  return (
    <button
      type="button"
      onClick={() => onView?.(row)}
      disabled={disabled}
      title="View contract details"
      aria-label={`View details for lead ${row.leadId}`}
      className={`rounded font-bold cursor-pointer text-amber-700 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 ${FOCUS}`}
    >
      {row.leadId}
    </button>
  );
}

function CardField({ label, value }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] text-slate-400">{label}</dt>
      <dd className="truncate font-semibold">{value || "-"}</dd>
    </div>
  );
}

export function ContractStatusSelect({
  status,
  disabled,
  loading = false,
  onChange,
  hideConverted = false,
  showNew = false,
}) {
  const options = [
    ...(showNew ? [{ value: "new", label: "New", dot: "bg-amber-500" }] : []),
    ...STATUS_OPTIONS.filter(
      (option) => !hideConverted || option.value !== "converted",
    ),
  ];
  const selectedStatus = options.find((option) => option.value === status);
  const meta = STATUS_STYLES[status] || STATUS_STYLES.contract;

  return (
    <div
      className="inline-flex w-full max-w-35 items-center"
      title={`Contract status: ${meta.label}`}
      onClick={(event) => event.stopPropagation()}
    >
      <Select
        aria-label={`Contract status: ${meta.label}`}
        value={selectedStatus}
        // isDisabled={disabled}
        isLoading={loading}
        isSearchable={false}
        options={options}
        onChange={(option) => {
          if (option) onChange?.(option.value);
        }}
        formatOptionLabel={(option, { context }) => (
          <span className="inline-flex min-w-0 items-center gap-2">
            <span
              aria-hidden="true"
              className={`h-2 w-2 shrink-0 rounded-full ${option.dot}`}
            />
            <span className="truncate">
              {context === "menu"
                ? option.label
                : option.statusLabel || option.label}
            </span>
          </span>
        )}
        styles={statusSelectStyles}
        menuPortalTarget={
          typeof document !== "undefined" ? document.body : null
        }
        menuPosition="fixed"
        className="w-full"
      />
    </div>
  );
}

function EmptyState({ hasFilters, onClear }) {
  return (
    <>
      <p className="text-sm font-semibold text-slate-800">No contracts found</p>
      <p className="mt-1 text-xs text-slate-400">
        {hasFilters
          ? "No contract matches your search or filters."
          : "There are no contracts to display."}
      </p>
      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className={`mt-3 rounded-lg px-3 py-1.5 text-xs font-semibold text-amber-600 hover:bg-amber-50 ${FOCUS}`}
        >
          Clear filters
        </button>
      )}
    </>
  );
}

function RowActions({
  row,
  onView,
  onEdit,
  onViewContract,
  onSendContract,
  onClientCredential,
  onDelete,
  disabled = false,
}) {
  return (
    <div className="flex items-center gap-0.5">
      <IconAction
        icon={Pencil}
        label="Edit contract"
        onClick={onEdit}
        tone="text-slate-600  hover:bg-slate-100"
        disabled={disabled}
      />
      <IconAction
        icon={Eye}
        label="View details"
        onClick={onView}
        tone="text-blue-600 hover:bg-blue-50"
        disabled={disabled}
      />
      {/* <IconAction icon={FileText} label="View contract" onClick={onViewContract} tone="text-amber-600 hover:bg-amber-50" /> */}
      <IconAction
        icon={Mail}
        label="Send contract"
        onClick={onSendContract}
        tone="text-orange-600 hover:bg-orange-50"
        disabled={disabled}
      />
      {row.status === "converted" ? (
        <IconAction
          icon={KeyRound}
          label="Client credentials"
          onClick={onClientCredential}
          tone="text-emerald-600 hover:bg-emerald-50"
          disabled={disabled}
        />
      ) : (
        <span aria-hidden="true" className="h-9 w-9 shrink-0" />
      )}
      <span aria-hidden="true" className="mx-1 h-5 w-px bg-slate-200" />
      <IconAction
        icon={Trash2}
        label="Delete contract"
        onClick={onDelete}
        tone="text-red-500 hover:bg-red-50"
        // disabled={disabled}
      />
    </div>
  );
}

function IconAction({ icon: Icon, label, onClick, tone, disabled = false }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS} ${tone}`}
    >
      <Icon size={16} />
    </button>
  );
}

function AnimatedCheckbox({ checked, onChange, label, disabled }) {
  return (
    <label
      className="inline-flex cursor-pointer items-center justify-center"
      title={label}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="peer sr-only"
        aria-label={label}
      />
      <span className="flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border border-slate-300 bg-white transition-all duration-200 peer-checked:scale-105 peer-checked:border-amber-500 peer-checked:bg-amber-500 peer-focus-visible:ring-2 peer-focus-visible:ring-amber-500/30 peer-disabled:opacity-50">
        <svg
          viewBox="0 0 16 16"
          fill="none"
          className={`h-3 w-3 text-white transition-all duration-200 ${checked ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
        >
          <path
            d="M3 8L6.5 11.5L13 4.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </label>
  );
}

const SKELETON_WIDTHS = [
  "w-20",
  "w-32",
  "w-24",
  "w-28",
  "w-24",
  "w-28",
  "w-36",
  "w-20",
];

function TableSkeleton({ rows, cols }) {
  return Array.from({ length: rows }, (_, row) => (
    <tr key={row}>
      <td className="px-4 py-3">
        <div className="flex h-9 items-center">
          <Skeleton className="h-[18px] w-[18px] rounded-[5px]" />
        </div>
      </td>
      {Array.from({ length: cols }, (_, column) => (
        <td key={column} className="px-4 py-3">
          <div className="flex h-9 items-center">
            <Skeleton
              className={`h-4 ${SKELETON_WIDTHS[(row + column) % SKELETON_WIDTHS.length]}`}
            />
          </div>
        </td>
      ))}
      <td className="sticky right-0 border-l border-slate-200 bg-white px-3 py-3">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-9 w-9 rounded-lg" />
          ))}
        </div>
      </td>
    </tr>
  ));
}

function ContractCardSkeleton() {
  return (
    <li className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-start gap-3">
        <Skeleton className="mt-0.5 h-[18px] w-[18px] rounded-[5px]" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-8 w-full" />
        ))}
      </div>
      <Skeleton className="mt-3 h-9 w-full" />
    </li>
  );
}

function Skeleton({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded bg-slate-200/80 ${className}`}
    />
  );
}
