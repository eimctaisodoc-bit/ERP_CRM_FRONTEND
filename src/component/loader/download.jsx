import { useCallback, useEffect, useId, useRef, useState } from "react";

/* ==========================================================================
   WavyProgress: Play Store style circular progress with a flowing wavy stroke.
   React 18 + Tailwind CSS (core utilities only, no plugin or config needed).

   Exports
     WavyProgressRing   generic ring: downloads, uploads, sync, install, export…
     FileProgressRow    list row (icon + name + status text) built on the ring
     useSimulatedProgress  demo hook (replace with your real progress)
     DownloadIcon, UploadIcon, SyncIcon, StopIcon, CheckIcon, CloseIcon
     default            <Demo /> preview
   ========================================================================== */

const TWO = Math.PI * 2;
const R = 31; // base radius inside the 80×80 viewBox
const C = 40; // centre

/* px = diameter, sw = stroke width (viewBox units), k = whole waves around the ring, amp = wave height */
const PRESETS = {
  xs: { px: 32, sw: 5.5, k: 8, amp: 3 },
  sm: { px: 44, sw: 4.5, k: 10, amp: 2.8 },
  md: { px: 60, sw: 3.8, k: 12, amp: 2.4 },
  lg: { px: 80, sw: 3.2, k: 14, amp: 2.4 },
};

function resolveSize(size) {
  if (typeof size === "number") {
    const base = size <= 38 ? PRESETS.xs : size <= 52 ? PRESETS.sm : size <= 70 ? PRESETS.md : PRESETS.lg;
    return { ...base, px: size };
  }
  return PRESETS[size] ?? PRESETS.sm;
}
const clamp01 = (n) => Math.min(1, Math.max(0, n));

/* ------------------------------ icons ------------------------------ */
const Svg = ({ children, className = "h-full w-full", fill = "none", sw = 2.4 }) => (
  <svg viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    {children}
  </svg>
);
export const DownloadIcon = () => (<Svg><path d="M12 4v11" /><path d="m7 11 5 5 5-5" /><path d="M5 20h14" /></Svg>);
export const UploadIcon = () => (<Svg><path d="M12 16V5" /><path d="m7 9 5-5 5 5" /><path d="M5 20h14" /></Svg>);
export const SyncIcon = () => (<Svg><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></Svg>);
export const StopIcon = () => (<Svg fill="currentColor" sw={0}><rect x="5" y="5" width="14" height="14" rx="3" /></Svg>);
export const CloseIcon = () => (<Svg sw={3.2}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></Svg>);
export const CheckIcon = ({ show = true }) => (
  <Svg sw={3.2}>
    <path
      d="M20 6 9 17l-5-5"
      pathLength="1"
      className={`[stroke-dasharray:1] transition-[stroke-dashoffset] duration-500 delay-300 ${show ? "[stroke-dashoffset:0]" : "[stroke-dashoffset:1]"}`}
    />
  </Svg>
);

const Layer = ({ on, children }) => (
  <span
    aria-hidden="true"
    className={`absolute inset-0 grid place-items-center transition-all duration-300 ease-out ${on ? "scale-100 opacity-100" : "pointer-events-none scale-50 opacity-0"}`}
  >
    {children}
  </span>
);

/* ========================= WavyProgressRing ========================= */
/**
 * Props
 *  value         0–100, drives the arc and the percent text (controlled)
 *  status        "idle" | "running" | "success" | "error"
 *  size          "xs" | "sm" | "md" | "lg" | number (px)          default "sm"
 *  wavy          wavy stroke while running (false = plain arc)      default true
 *  speed         wave flow speed multiplier                          default 1
 *  fromColor / toColor   gradient of the running stroke              amber → orange
 *  successColor / errorColor                                         emerald / red
 *  showPercent   percent inside the ring (default: only when size ≥ 56px)
 *  icons         { idle, running, success, error } ReactNode overrides
 *  children      replaces all centre content with your own node
 *  onClick       makes the ring a button; disabled, label, className also supported
 */
export function WavyProgressRing({
  value = 0,
  status = "idle",
  size = "sm",
  wavy = true,
  speed = 1,
  fromColor = "#f59e0b",
  toColor = "#f97316",
  successColor = "#059669",
  errorColor = "#dc2626",
  showPercent,
  icons = {},
  onClick,
  disabled = false,
  label = "Progress",
  className = "",
  children,
}) {
  const cfg = resolveSize(size);
  const uid = useId().replace(/:/g, "");
  const pathRef = useRef(null);
  const dotRef = useRef(null);
  const rippleRef = useRef(null);
  const st = useRef({ shown: 0, amp: 0, phase: 0, last: 0, raf: 0 });
  const live = useRef({});
  live.current = { value, status, wavy, speed, cfg };

  /* animation loop: draws straight into the SVG path (no re-render per frame) */
  useEffect(() => {
    const s = st.current;
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const draw = () => {
      const path = pathRef.current, dot = dotRef.current;
      if (!path || !dot) return;
      const { cfg: c } = live.current;
      const p = s.shown;
      if (p <= 0.001) { path.removeAttribute("d"); dot.style.opacity = "0"; return; }
      const span = clamp01(p) * TWO;
      const n = Math.max(2, Math.ceil(span / 0.012));
      const taper = (TWO / c.k) * 1.1; // ends fade into the base circle over ~1 wavelength
      let d = "", x = C, y = C;
      for (let i = 0; i <= n; i++) {
        const a = (span * i) / n;
        const th = -Math.PI / 2 + a;
        let e = Math.min(1, Math.min(a, span - a) / taper);
        e = e * e * (3 - 2 * e);
        const r = R + s.amp * e * Math.sin(c.k * th - s.phase);
        x = C + r * Math.cos(th);
        y = C + r * Math.sin(th);
        d += (i ? "L" : "M") + x.toFixed(2) + " " + y.toFixed(2);
      }
      path.setAttribute("d", d);
      dot.setAttribute("cx", x.toFixed(2));
      dot.setAttribute("cy", y.toFixed(2));
      dot.style.opacity = live.current.status === "running" && p < 0.999 ? "1" : "0";
    };

    const frame = (now) => {
      const L = live.current;
      const dt = Math.min(64, now - (s.last || now));
      s.last = now;
      const target = L.status === "success" ? 1 : L.status === "idle" ? 0 : clamp01(L.value / 100);
      if (L.status === "idle") s.shown = 0;
      else s.shown += (target - s.shown) * (1 - Math.exp(-dt / (L.status === "success" ? 90 : 140)));
      const ampT = L.wavy && !reduce && L.status === "running" ? L.cfg.amp : 0;
      s.amp += (ampT - s.amp) * (1 - Math.exp(-dt / 160)); // wave eases in and settles out
      s.phase += (dt / 300) * L.speed;
      draw();
      if (L.status === "running" || Math.abs(target - s.shown) > 0.0005 || s.amp > 0.01) {
        s.raf = requestAnimationFrame(frame);
      } else {
        s.raf = 0; s.last = 0; s.shown = target; s.amp = 0; draw();
      }
    };

    if (!s.raf) { s.last = 0; s.raf = requestAnimationFrame(frame); }
  }, [value, status, wavy, cfg.px, cfg.k]);

  useEffect(() => () => cancelAnimationFrame(st.current.raf), []);

  /* success ripple (Web Animations API, no Tailwind config needed) */
  const prev = useRef(status);
  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prev.current !== "success" && status === "success" && rippleRef.current && !reduce) {
      rippleRef.current.animate(
        [{ opacity: 0.7, transform: "scale(1)" }, { opacity: 0, transform: "scale(2)" }],
        { duration: 900, easing: "cubic-bezier(.22,1,.36,1)" }
      );
    }
    prev.current = status;
  }, [status]);

  const pct = Math.round(clamp01(value / 100) * 100);
  const percentInside = showPercent ?? cfg.px >= 56;
  const stroke = status === "success" ? successColor : status === "error" ? errorColor : `url(#${uid})`;
  const Tag = onClick ? "button" : "div";
  const iconPx = cfg.px * 0.42;
  const badgePx = cfg.px * 0.44;

  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      disabled={onClick ? disabled : undefined}
      aria-label={label}
      className={`relative inline-block shrink-0 rounded-full text-amber-600 outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 disabled:cursor-not-allowed disabled:opacity-60 ${onClick ? "cursor-pointer" : ""} ${className}`}
      style={{ width: cfg.px, height: cfg.px }}
    >
      <span role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={label} className="sr-only" />
      <svg viewBox="0 0 80 80" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        <defs>
          <linearGradient id={uid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={fromColor} />
            <stop offset="1" stopColor={toColor} />
          </linearGradient>
        </defs>
        <circle cx={C} cy={C} r={R} fill="none" strokeWidth={cfg.sw}
          className={`transition-opacity duration-300 stroke-slate-200 dark:stroke-slate-700 ${status === "success" ? "opacity-0" : "opacity-100"}`} />
        <path ref={pathRef} fill="none" stroke={stroke} strokeWidth={cfg.sw} strokeLinecap="round" strokeLinejoin="round"
          className="transition-[stroke] duration-300" />
        <circle ref={dotRef} r={cfg.sw * 0.62} fill={toColor} style={{ opacity: 0 }} />
      </svg>

      <span ref={rippleRef} aria-hidden="true" className="pointer-events-none absolute inset-[6%] rounded-full border-2 opacity-0" style={{ borderColor: successColor }} />

      {children ? (
        <span className="absolute inset-0 grid place-items-center">{children}</span>
      ) : (
        <>
          <Layer on={status === "idle"}>
            <span style={{ width: iconPx, height: iconPx }}>{icons.idle ?? <DownloadIcon />}</span>
          </Layer>
          <Layer on={status === "running" && !percentInside}>
            <span style={{ width: iconPx * 0.72, height: iconPx * 0.72 }}>{icons.running ?? <StopIcon />}</span>
          </Layer>
          <Layer on={status === "running" && percentInside}>
            <span className="font-bold tabular-nums text-slate-800 dark:text-slate-100" style={{ fontSize: cfg.px * 0.22 }}>{pct}%</span>
          </Layer>
          <Layer on={status === "success"}>
            <span className="grid place-items-center rounded-full text-white" style={{ width: badgePx, height: badgePx, background: successColor }}>
              <span style={{ width: "58%", height: "58%" }}>{icons.success ?? <CheckIcon show={status === "success"} />}</span>
            </span>
          </Layer>
          <Layer on={status === "error"}>
            <span className="grid place-items-center rounded-full text-white" style={{ width: badgePx, height: badgePx, background: errorColor }}>
              <span style={{ width: "50%", height: "50%" }}>{icons.error ?? <CloseIcon />}</span>
            </span>
          </Layer>
        </>
      )}
    </Tag>
  );
}

/* ========================== FileProgressRow ========================== */
/**
 * Props
 *  name          file / task name
 *  meta          idle subtitle, e.g. "2.4 MB · Excel workbook"
 *  value, status, size, wavy, icons   passed to the ring
 *  loadedText    running subtitle, e.g. "1.0 of 2.4 MB · 3.1 MB/s" (default: "42%")
 *  successText / errorText            finished and failed subtitles
 *  onStart / onCancel / onRetry / onOpen   fired by tapping the ring (or the row on success)
 *  ringProps     any extra WavyProgressRing props (colors, speed…)
 */
export function FileProgressRow({
  name,
  meta,
  value = 0,
  status = "idle",
  size = "sm",
  wavy = true,
  icons,
  loadedText,
  successText = "Downloaded",
  errorText = "Failed · tap to retry",
  onStart,
  onCancel,
  onRetry,
  onOpen,
  ringProps = {},
  className = "",
}) {
  const pct = Math.round(clamp01(value / 100) * 100);
  const sub = { idle: meta, running: loadedText ?? `${pct}%`, success: successText, error: errorText }[status];
  const act = { idle: onStart, running: onCancel, success: onOpen, error: onRetry }[status];
  const aria = { idle: `Start ${name}`, running: `Cancel ${name}`, success: `${name} complete`, error: `Retry ${name}` }[status];

  return (
    <div className={`flex items-center gap-3.5 px-3.5 py-3 transition-colors duration-300 ${status === "running" ? "bg-slate-50 dark:bg-slate-800/60" : ""} ${className}`}>
      <WavyProgressRing value={value} status={status} size={size} wavy={wavy} icons={icons} label={aria} onClick={act} {...ringProps} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-slate-800 dark:text-slate-100">{name}</p>
        <p className={`truncate text-[11.5px] font-medium tabular-nums ${status === "success" ? "text-emerald-600" : status === "error" ? "text-red-600" : "text-slate-500 dark:text-slate-400"}`}>{sub}</p>
      </div>
    </div>
  );
}

/* ====================== demo hook (replace in real use) ====================== */
export function useSimulatedProgress({ duration = 3000 } = {}) {
  const [s, setS] = useState({ value: 0, status: "idle" });
  const raf = useRef(0);
  const start = useCallback(() => {
    cancelAnimationFrame(raf.current);
    const t0 = performance.now();
    setS({ value: 0, status: "running" });
    const f = (now) => {
      const t = Math.min(1, (now - t0) / duration);
      if (t < 1) { setS({ value: t * 100, status: "running" }); raf.current = requestAnimationFrame(f); }
      else setS({ value: 100, status: "success" });
    };
    raf.current = requestAnimationFrame(f);
  }, [duration]);
  const reset = useCallback(() => { cancelAnimationFrame(raf.current); setS({ value: 0, status: "idle" }); }, []);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return { ...s, start, reset };
}

/* ================================ demo ================================ */
const FILES = [
  { name: "Q4-Sales-Report.xlsx", mb: 2.4, type: "Excel workbook", ms: 4200 },
  { name: "Invoices-Nov.pdf", mb: 1.1, type: "PDF document", ms: 3000 },
  { name: "Inventory-Snapshot.zip", mb: 8.7, type: "ZIP archive", ms: 5600 },
];

function DemoRow({ file, size }) {
  const p = useSimulatedProgress({ duration: file.ms });
  const loaded = ((file.mb * p.value) / 100).toFixed(1);
  return (
    <FileProgressRow
      name={file.name}
      size={size}
      value={p.value}
      status={p.status}
      meta={`${file.mb} MB · ${file.type}`}
      loadedText={`${loaded} of ${file.mb} MB · ${Math.round(p.value)}%`}
      successText={`Downloaded · ${file.mb} MB`}
      onStart={p.start}
      onCancel={p.reset}
      onOpen={p.reset}
    />
  );
}

function PurposeDemo({ label, icons, from, to, duration }) {
  const p = useSimulatedProgress({ duration });
  return (
    <div className="flex flex-col items-center gap-2">
      <WavyProgressRing size="md" value={p.value} status={p.status} icons={icons} fromColor={from} toColor={to}
        label={label} onClick={p.status === "running" || p.status === "success" ? p.reset : p.start} />
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  );
}

export default function Demo() {
  const [size, setSize] = useState("sm");
  return (
    <div className="mx-auto max-w-xl space-y-6 p-6 text-slate-800 dark:text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold">Wavy progress</h1>
        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
          {["xs", "sm", "md", "lg"].map((s) => (
            <button key={s} onClick={() => setSize(s)} aria-pressed={size === s}
              className={`min-h-[30px] rounded-lg px-3 text-xs font-semibold ${size === s ? "bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white" : "text-slate-500"}`}>
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
        {FILES.map((f) => <DemoRow key={f.name} file={f} size={size} />)}
      </div>

      <div className="flex justify-around rounded-xl border border-slate-200 p-5 dark:border-slate-700">
        <PurposeDemo label="Upload" icons={{ idle: <UploadIcon /> }} duration={3000} />
        <PurposeDemo label="Sync" icons={{ idle: <SyncIcon /> }} from="#38bdf8" to="#6366f1" duration={3500} />
        <PurposeDemo label="Export" icons={{ idle: <DownloadIcon /> }} from="#34d399" to="#14b8a6" duration={2600} />
      </div>
    </div>
  );
}