import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import Select from "react-select";
import {
  Pencil,
  Eye,
  KeyRound,
  Trash2,
  Mail,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  MoreVertical,
} from "lucide-react";
import { Skeleton } from "../../../skeleton";

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

const formatRelativeTime = (takenAt, now = Date.now()) => {
  if (!Number.isFinite(takenAt)) return "-";

  const takenDate = new Date(takenAt);
  const nowDate = new Date(now);
  if (
    Number.isNaN(takenDate.getTime()) ||
    Number.isNaN(nowDate.getTime())
  ) {
    return "-";
  }

  const startOfTaken = new Date(
    takenDate.getFullYear(),
    takenDate.getMonth(),
    takenDate.getDate(),
  ).getTime();

  const startOfNow = new Date(
    nowDate.getFullYear(),
    nowDate.getMonth(),
    nowDate.getDate(),
  ).getTime();

  const diffDays = Math.round(
    (startOfNow - startOfTaken) / (24 * 60 * 60 * 1000),
  );

  if (diffDays < 0) return "Just now";

  if (diffDays >= 30) {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? "month" : "months"} ago`;
  }

  if (diffDays >= 1) {
    return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
  }

  const elapsedMs = Math.max(0, now - takenAt);

  if (elapsedMs < 60_000) return "Just now";

  const elapsedMinutes = Math.floor(elapsedMs / 60_000);
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  const remainingMinutes = elapsedMinutes % 60;

  if (elapsedHours === 0) {
    return `${elapsedMinutes} ${
      elapsedMinutes === 1 ? "minute" : "minutes"
    } ago`;
  }

  if (remainingMinutes === 0) {
    return `${elapsedHours} ${
      elapsedHours === 1 ? "hour" : "hours"
    } ago`;
  }

  return `${elapsedHours} hr ${remainingMinutes} min ago`;
};

function LeadTakenValue({ takenAt, muted = false }) {
  const value = formatRelativeTime(takenAt);
  return (
    <span
      className={`whitespace-nowrap font-medium ${
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
  { key: "leadId", label: "Lead ID", sortKey: "leadId", nowrap: true },
  {
    key: "organizationName",
    label: "Organization Name",
    sortKey: "organizationName",
  },
  { key: "service", label: "Service", sortKey: "service" },
  { key: "leadTaken", label: "LeadTaken", sortKey: "leadTaken", nowrap: true },
  { key: "status", label: "Status", sortKey: "status", nowrap: true },
];

function SortHeader({ label, sortKey, sort, onSort }) {
  const active = sort?.key === sortKey;
  const Icon = !active
    ? ArrowUpDown
    : sort.dir === "asc"
      ? ArrowUp
      : ArrowDown;

  return (
    <th
      scope="col"
      aria-sort={
        active
          ? sort.dir === "asc"
            ? "ascending"
            : "descending"
          : "none"
      }
      className="whitespace-nowrap border-b border-slate-200 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide"
    >
      <button
        type="button"
        onClick={() => onSort?.(sortKey)}
        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md font-bold transition hover:text-slate-800 ${FOCUS}`}
      >
        {label}
        <Icon
          size={13}
          className={active ? "text-amber-600" : "text-slate-400"}
          aria-hidden="true"
        />
      </button>
    </th>
  );
}

export default function ContractsTable({
  columns = CONTRACT_COLUMNS,
  rows = [],
  startIndex = 0,
  sort,
  onSort,
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
      <div className="w-full max-w-full overflow-x-auto overscroll-x-contain">
        <table
          className="w-full min-w-[980px] text-left text-xs"
          aria-busy={loading}
        >
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="w-12 border-b border-slate-200 px-4 py-3 text-[11px] font-bold uppercase tracking-wide">
                #
              </th>
              <th className="w-12 border-b border-slate-200 px-4 py-3">
                <AnimatedCheckbox
                  checked={allSelected}
                  onChange={onToggleAll}
                  label="Select all contracts on this page"
                  disabled={loading}
                />
              </th>
              {columns.map((column) => (
                column.sortKey ? (
                  <SortHeader
                    key={column.key}
                    label={column.label}
                    sortKey={column.sortKey}
                    sort={sort}
                    onSort={onSort}
                  />
                ) : (
                  <th
                    key={column.key}
                    scope="col"
                    className="whitespace-nowrap border-b border-slate-200 px-4 py-3 text-[11px] font-bold uppercase tracking-wide"
                  >
                    {column.label}
                  </th>
                )
              ))}
              <th
                scope="col"
                className="sticky right-0 z-10 whitespace-nowrap border-b border-l border-slate-200 bg-slate-50  text-center text-[11px] font-bold uppercase tracking-wide"
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
                    <td className="px-4 py-3 text-xs font-medium tabular-nums text-slate-500">
                      {startIndex + index + 1}
                    </td>
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
                        className={`px-4 py-3 font-medium  capitalize${
                          column.nowrap ||
                          column.key === "organizationName" ||
                          column.key === "service"
                            ? "whitespace-nowrap max-w-[220px] truncate "
                            : "max-w-[240px] truncate"
                        }`}
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
                    <td className="sticky right-0 border-l font-medium border-slate-200 bg-inherit py-3">
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
                  colSpan={columns.length + 3}
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
    </>
  );
}

function Cell({ column, row, onView, onStatusChange, statusBusy }) {
  if (column.key === "leadId")
    return <LeadIdButton row={row} onView={onView} />;
  if (column.key === "leadTaken") {
    return (
      <LeadTakenValue
        takenAt={row.leadTakenAt}
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
    <span className="" title={text}>
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
      className={`rounded font-medium cursor-pointer text-amber-700 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 ${FOCUS}`}
    >
      {row.leadId}
    </button>
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
  const menuItems = [
    { icon: Pencil, label: "Edit contract", onClick: onEdit, tone: "text-slate-700", disabled },
    { icon: Eye, label: "View details", onClick: onView, tone: "text-blue-600", disabled },
    { icon: Mail, label: "Send contract", onClick: onSendContract, tone: "text-orange-600", disabled },
    ...(row.status === "converted"
      ? [{ icon: KeyRound, label: "Client credentials", onClick: onClientCredential, tone: "text-emerald-600", disabled }]
      : []),
    { icon: Trash2, label: "Delete contract", onClick: onDelete, tone: "text-red-500", divider: true },
  ];

  return (
    <>
      {/* Mobile + tablet: 3-dots dropdown */}
      <div className="lg:hidden">
        <ActionsMenu items={menuItems} />
      </div>

      {/* Desktop: inline icons */}
      <div className="hidden items-center gap-0.5 lg:flex">
        <IconAction icon={Pencil} label="Edit contract" onClick={onEdit}
          tone="text-slate-600 hover:bg-slate-100" disabled={disabled} />
        <IconAction icon={Eye} label="View details" onClick={onView}
          tone="text-blue-600 hover:bg-blue-50" disabled={disabled} />
        <IconAction icon={Mail} label="Send contract" onClick={onSendContract}
          tone="text-orange-600 hover:bg-orange-50" disabled={disabled} />
        {row.status === "converted" ? (
          <IconAction icon={KeyRound} label="Client credentials" onClick={onClientCredential}
            tone="text-emerald-600 hover:bg-emerald-50" disabled={disabled} />
        ) : (<></>
          // <span aria-hidden="true" className="h-9 w-9 shrink-0" />
        )}
        <span aria-hidden="true" className="mx-1 h-5 w-px bg-slate-200" />
        <IconAction icon={Trash2} label="Delete contract" onClick={onDelete}
          tone="text-red-500 hover:bg-red-50" />
      </div>
    </>
  );
}

function ActionsMenu({ items }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const MENU_WIDTH = 192;

  const place = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight ?? items.length * 40 + 8;
    const openUp =
      rect.bottom + menuHeight + 8 > window.innerHeight &&
      rect.top > menuHeight + 8;
    setPos({
      top: openUp ? rect.top - menuHeight - 4 : rect.bottom + 4,
      left: Math.max(
        8,
        Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8),
      ),
    });
  }, [items.length]);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return undefined;
    const close = () => setOpen(false);
    const onPointerDown = (event) => {
      if (
        menuRef.current?.contains(event.target) ||
        buttonRef.current?.contains(event.target)
      )
        return;
      close();
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        close();
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        title="Actions"
        aria-label="Row actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 ${FOCUS}`}
      >
        <MoreVertical size={18} />
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ position: "fixed", top: pos.top, left: pos.left, width: MENU_WIDTH, zIndex: 300 }}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-xs shadow-lg"
          >
            {items.map(({ icon: Icon, label, onClick, tone, disabled, divider }) => (
              <React.Fragment key={label}>
                {divider && <div className="my-1 h-px bg-slate-200" />}
                <button
                  type="button"
                  role="menuitem"
                  disabled={disabled}
                  onClick={() => {
                    setOpen(false);
                    onClick?.();
                  }}
                  className={`flex w-full cursor-pointer items-center gap-2.5 px-3 py-2.5 text-left font-semibold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 ${tone} ${FOCUS}`}
                >
                  <Icon size={15} aria-hidden="true" />
                  {label}
                </button>
              </React.Fragment>
            ))}
          </div>,
          document.body,
        )}
    </>
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
      className={`flex h-9 w-9 shrink-0 cursor-pointer items-center
         justify-center rounded-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS} ${tone}`}
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
        <Skeleton className="h-4 w-6" />
      </td>
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


