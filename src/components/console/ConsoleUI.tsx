import React from "react";
import Link from "next/link";
import { LucideIcon, icons } from "lucide-react";

const ArrowUpRight = icons.ArrowUpRight;

// ─── Design Tokens & Theme Classes ─────────────────────────
export const CONSOLE_THEME = {
  bg: "bg-[#05070A]",
  surface: "bg-[#090D14]",
  card: "bg-[#0D121B]",
  cardElevated: "bg-[#111723]",
  cardHover: "hover:bg-[#141C2B] hover:border-cyan-500/30",
  border: "border-white/[0.08]",
  borderHover: "border-white/20",
  borderCyan: "border-cyan-500/30",
  cyanText: "text-cyan-400",
  cyanGlow: "shadow-[0_0_35px_rgba(0,229,255,0.18)]",
};

// ─── Page Header Component ─────────────────────────────────
interface PageHeaderProps {
  badge?: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
}

export function PageHeader({ badge, title, description, icon: Icon, actions }: PageHeaderProps) {
  return (
    <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-white/[0.08]">
      <div className="space-y-2.5">
        {badge && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 text-xs font-mono font-medium tracking-wide shadow-sm shadow-cyan-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
              {badge}
            </span>
          </div>
        )}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white flex items-center gap-4 font-display">
          {Icon && <Icon className="w-8 h-8 text-cyan-400 flex-shrink-0" />}
          <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            {title}
          </span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-3xl leading-relaxed">
          {description}
        </p>
      </div>
      {actions && (
        <div className="flex items-center gap-3.5 flex-wrap flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}

// ─── Ultra-Premium Metric Card Component ───────────────────
interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  trendData?: number[];
  accentColor?: "cyan" | "emerald" | "amber" | "violet";
}

export function MetricCard({
  title,
  value,
  subtitle,
  change,
  isPositive = true,
  icon: Icon,
  trendData = [25, 35, 30, 50, 65, 60, 85, 80, 95],
  accentColor = "cyan",
}: MetricCardProps) {
  const accentBorder = {
    cyan: "group-hover:border-cyan-400/50 hover:shadow-cyan-500/10",
    emerald: "group-hover:border-emerald-400/50 hover:shadow-emerald-500/10",
    amber: "group-hover:border-amber-400/50 hover:shadow-amber-500/10",
    violet: "group-hover:border-purple-400/50 hover:shadow-purple-500/10",
  }[accentColor];

  const accentBg = {
    cyan: "bg-cyan-500/10 text-cyan-300 border-cyan-500/25",
    emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25",
    amber: "bg-amber-500/10 text-amber-300 border-amber-500/25",
    violet: "bg-purple-500/10 text-purple-300 border-purple-500/25",
  }[accentColor];

  const strokeColor = {
    cyan: "#00e5ff",
    emerald: "#10b981",
    amber: "#f59e0b",
    violet: "#a855f7",
  }[accentColor];

  const gradId = `grad-${accentColor}-${title.replace(/\s+/g, "")}`;

  // Generate SVG path for area fill and stroke
  const points = trendData.map((d, i) => `${(i / (trendData.length - 1)) * 100},${30 - (d / 100) * 26}`).join(" ");
  const areaPath = `M 0 30 L ${points} L 100 30 Z`;

  return (
    <div className={`relative group bg-[#0D121B] hover:bg-[#111723] border border-white/[0.08] ${accentBorder} rounded-2xl p-6 sm:p-7 transition-all duration-300 shadow-xl hover:shadow-2xl flex flex-col justify-between overflow-hidden`}>
      {/* Ambient background glow on hover */}
      <div className="absolute -top-20 -right-20 w-44 h-44 bg-cyan-500/[0.04] group-hover:bg-cyan-500/[0.08] rounded-full blur-3xl transition-all duration-500 pointer-events-none" />

      <div className="space-y-4 relative z-10">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
            {title}
          </span>
          <div className={`w-11 h-11 rounded-xl ${accentBg} border flex items-center justify-center transition-all group-hover:scale-110 duration-300 shadow-sm`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold tracking-tight text-white font-display">
              {value}
            </span>
            {change && (
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  isPositive
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}
              >
                {change}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 leading-normal font-sans">{subtitle}</p>
        </div>
      </div>

      {/* Mini SVG Area Fill Sparkline */}
      <div className="mt-6 pt-4 border-t border-white/[0.05] flex items-center justify-between relative z-10">
        <svg className="w-32 h-8 overflow-visible" viewBox="0 0 100 30">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.35" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#${gradId})`} />
          <polyline
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
        </svg>
        <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live Pulse
        </span>
      </div>
    </div>
  );
}

// ─── Status Badge ──────────────────────────────────────────
export function StatusBadge({ status, label }: { status: "success" | "pending" | "error" | "neutral"; label: string }) {
  const styles = {
    success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]",
    pending: "bg-amber-500/10 text-amber-300 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]",
    error: "bg-rose-500/10 text-rose-300 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.15)]",
    neutral: "bg-white/[0.05] text-slate-300 border-white/[0.1]",
  }[status];

  const dot = {
    success: "bg-emerald-400 shadow-[0_0_6px_#10b981]",
    pending: "bg-amber-400 animate-pulse shadow-[0_0_6px_#f59e0b]",
    error: "bg-rose-400 shadow-[0_0_6px_#f43f5e]",
    neutral: "bg-slate-400",
  }[status];

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border font-mono ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

// ─── Empty State Component ─────────────────────────────────
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionText, actionHref, onAction }: EmptyStateProps) {
  return (
    <div className="py-20 px-8 text-center border border-dashed border-white/[0.14] rounded-2xl bg-[#090D14]/70 backdrop-blur-md">
      <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/10">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2 font-display">{title}</h3>
      <p className="text-slate-400 text-sm max-w-md mx-auto mb-8 leading-relaxed font-sans">
        {description}
      </p>
      {actionText && (
        actionHref ? (
          <Link
            href={actionHref}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs transition shadow-lg shadow-cyan-500/25"
          >
            {actionText}
          </Link>
        ) : (
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs transition shadow-lg shadow-cyan-500/25"
          >
            {actionText}
          </button>
        )
      )}
    </div>
  );
}
