import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

// ─── Design Tokens & Theme Classes ─────────────────────────
export const CONSOLE_THEME = {
  bg: "bg-[#07090C]",
  surface: "bg-[#0B0F14]",
  card: "bg-[#0F141A]",
  cardElevated: "bg-[#121820]",
  cardHover: "hover:bg-[#151C26] hover:border-white/15",
  border: "border-white/[0.08]",
  borderHover: "border-white/20",
  borderCyan: "border-cyan-500/30",
  cyanText: "text-cyan-400",
  cyanGlow: "shadow-[0_0_20px_rgba(6,182,212,0.15)]",
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
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
      <div>
        {badge && (
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[11px] font-mono font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              {badge}
            </span>
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          {Icon && <Icon className="w-6 h-6 text-cyan-400 flex-shrink-0" />}
          <span>{title}</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1 max-w-2xl leading-relaxed">
          {description}
        </p>
      </div>
      {actions && (
        <div className="flex items-center gap-3 flex-wrap flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}

// ─── Metric Card Component (Linear / Stripe Style) ─────────
interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  trendData?: number[];
}

export function MetricCard({
  title,
  value,
  subtitle,
  change,
  isPositive = true,
  icon: Icon,
  trendData = [20, 35, 30, 45, 60, 55, 75, 70, 90],
}: MetricCardProps) {
  return (
    <div className="relative group bg-[#0F141A] hover:bg-[#121820] border border-white/[0.08] hover:border-cyan-500/30 rounded-2xl p-5 sm:p-6 transition-all duration-200 shadow-sm hover:shadow-xl hover:shadow-cyan-500/5 flex flex-col justify-between overflow-hidden">
      {/* Ambient background glow on hover */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all duration-300 pointer-events-none" />

      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400 font-mono">
            {title}
          </span>
          <div className="w-8 h-8 rounded-xl bg-white/[0.04] group-hover:bg-cyan-500/10 border border-white/[0.06] group-hover:border-cyan-500/20 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 transition-colors">
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
            {value}
          </span>
          {change && (
            <span
              className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                isPositive
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              }`}
            >
              {change}
            </span>
          )}
        </div>

        <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
      </div>

      {/* Mini SVG Sparkline */}
      <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between">
        <svg className="w-24 h-6 overflow-visible opacity-70 group-hover:opacity-100 transition-opacity" viewBox="0 0 100 25">
          <polyline
            fill="none"
            stroke="#00e5ff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={trendData.map((d, i) => `${(i / (trendData.length - 1)) * 100},${25 - (d / 100) * 20}`).join(" ")}
          />
        </svg>
        <span className="text-[11px] font-mono text-slate-500">Live telemetry</span>
      </div>
    </div>
  );
}

// ─── Status Badge ──────────────────────────────────────────
export function StatusBadge({ status, label }: { status: "success" | "pending" | "error" | "neutral"; label: string }) {
  const styles = {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    error: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    neutral: "bg-white/[0.04] text-slate-400 border-white/[0.08]",
  }[status];

  const dot = {
    success: "bg-emerald-400",
    pending: "bg-amber-400 animate-pulse",
    error: "bg-rose-400",
    neutral: "bg-slate-400",
  }[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border font-mono ${styles}`}>
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
  onAction?: () => void;
  actionHref?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-6 rounded-2xl bg-[#0F141A] border border-dashed border-white/[0.12] flex flex-col items-center justify-center">
      <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 shadow-lg shadow-cyan-500/5">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
      <p className="text-slate-400 text-xs mt-1.5 max-w-sm leading-relaxed">
        {description}
      </p>
      {actionText && (
        <div className="mt-5">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all duration-150"
            >
              {actionText}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all duration-150"
            >
              {actionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
