"use client";

import { useEncodeProgress } from "@/hooks/use-encode-progress";

/**
 * EncodeProgressCard
 *
 * Cách dùng:
 *   <EncodeProgressCard jobId={jobId} />
 *
 * Nhận jobId từ API POST /api/encode/720p hoặc /api/encode/1080p
 * Kết nối SSE tới /api/encode/progress/{jobId}/stream
 */



// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatETA(seconds: number): string {
  if (seconds <= 0) return "—";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PulsingDot({ color = "bg-sky-400" }: { color?: string }) {
  return (
    <span className="relative flex h-2 w-2">
      <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-60", color)} />
      <span className={cn("relative inline-flex rounded-full h-2 w-2", color)} />
    </span>
  );
}

function StatItem({
  label,
  value,
  mono = true,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-widest text-slate-500 font-medium">
        {label}
      </span>
      <span
        className={cn(
          "text-sm text-slate-200 font-semibold",
          mono && "font-mono"
        )}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface EncodeProgressCardProps {
  jobId: string | null;
  /** Base URL Spring Boot, mặc định same-origin */
  baseUrl?: string;
  onCompleted?: () => void;
}

export function EncodeProgressCard({
  jobId,
  baseUrl,
  onCompleted,
}: EncodeProgressCardProps) {
  const { progress, error } = useEncodeProgress(jobId, {
    baseUrl,
    onCompleted: () => onCompleted?.(),
  });

  // ── Chưa có jobId ──────────────────────────────────────────────────────────
  if (!jobId) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center">
        <p className="text-sm text-slate-600">Chưa có job encode nào.</p>
      </div>
    );
  }

  // ── Đang kết nối ──────────────────────────────────────────────────────────
  if (!progress) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 flex items-center gap-3">
        <PulsingDot color="bg-slate-400" />
        <span className="text-sm text-slate-400 font-mono">
          Đang kết nối · {jobId}
        </span>
      </div>
    );
  }

  const isDone    = progress.status === "COMPLETED";
  const isFailed  = progress.status === "FAILED";
  const isActive  = progress.status === "PROCESSING";

  // ── Color tokens theo trạng thái ──────────────────────────────────────────
  const accent = isDone ? "sky" : isFailed ? "rose" : "emerald";
  const barColor = isDone
    ? "bg-sky-500"
    : isFailed
    ? "bg-rose-500"
    : "bg-emerald-400";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-slate-900 p-5 transition-all duration-500",
        isDone   && "border-sky-500/30",
        isFailed && "border-rose-500/30",
        isActive && "border-slate-700",
        !isDone && !isFailed && !isActive && "border-slate-800"
      )}
    >
      {/* Ambient glow */}
      <div
        className={cn(
          "pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 h-32 w-64 rounded-full blur-3xl opacity-20 transition-all duration-700",
          isDone   && "bg-sky-400",
          isFailed && "bg-rose-400",
          isActive && "bg-emerald-400"
        )}
      />

      {/* Header row */}
      <div className="relative flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          {isActive && <PulsingDot color="bg-emerald-400" />}
          {isDone   && <span className="text-sky-400 text-base">✓</span>}
          {isFailed && <span className="text-rose-400 text-base">✕</span>}

          <div>
            <p className="text-sm font-semibold text-slate-100 leading-none">
              {isDone   ? "Encode hoàn tất" :
               isFailed ? "Encode thất bại" :
               progress.status === "CONNECTING" ? "Đang kết nối..." :
               "Đang encode..."}
            </p>
            <p className="text-[11px] text-slate-600 font-mono mt-0.5">{jobId}</p>
          </div>
        </div>

        {/* Resolution badge */}
        {progress.resolution && (
          <span className={cn(
            "px-2.5 py-1 rounded-lg text-xs font-bold font-mono border",
            progress.resolution === "1080p"
              ? "bg-violet-500/10 border-violet-500/30 text-violet-300"
              : "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
          )}>
            {progress.resolution}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="relative mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-slate-500 font-mono">
            {progress.currentTime}
            {progress.totalDuration > 0 && (
              <> / {new Date(progress.totalDuration * 1000).toISOString().slice(11, 19)}</>
            )}
          </span>
          <span className={cn(
            "text-sm font-bold font-mono",
            isDone   ? "text-sky-400"  :
            isFailed ? "text-rose-400" :
            "text-emerald-400"
          )}>
            {progress.percentage}%
          </span>
        </div>

        {/* Track */}
        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out relative",
              barColor
            )}
            style={{ width: `${progress.percentage}%` }}
          >
            {/* Shimmer khi đang chạy */}
            {isActive && (
              <span className="absolute inset-0 w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_1.4s_ease-in-out_infinite]" />
            )}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-3 bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
        <StatItem label="FPS"     value={progress.fps > 0 ? `${progress.fps}` : "—"} />
        <StatItem label="Tốc độ" value={progress.speed > 0 ? `${progress.speed}×` : "—"} />
        <StatItem label="Bitrate" value="—" />
        <StatItem
          label={isDone ? "Kết quả" : "Còn lại"}
          value={isDone ? "Done ✓" : formatETA(progress.estimatedSecondsLeft)}
          mono={!isDone}
        />
      </div>

      {/* Error message */}
      {isFailed && progress.errorMessage && (
        <p className="mt-3 text-xs text-rose-400 font-mono bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
          {progress.errorMessage}
        </p>
      )}

      {/* Error kết nối */}
      {error && !isFailed && (
        <p className="mt-3 text-[11px] text-amber-500 font-mono">{error}</p>
      )}
    </div>
  );
}