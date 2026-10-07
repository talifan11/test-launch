// Полоса прогресса загрузки/распаковки. Значение 0..1.

interface ProgressBarProps {
  value: number;
  label?: string;
  blue?: boolean;
}

export function ProgressBar({ value, label, blue = false }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <div className="w-full space-y-1.5">
      {label !== undefined && label !== '' ? (
        <div className="flex justify-between text-xs text-white/50 vr-mono">
          <span className="truncate max-w-[75%]">{label}</span>
          <span>{Math.round(clamped * 100)}%</span>
        </div>
      ) : null}
      <div className="vr-progress-track">
        <div
          className={`vr-progress-fill ${blue ? 'vr-progress-fill-blue' : ''}`}
          style={{ width: `${clamped * 100}%` }}
        />
      </div>
    </div>
  );
}
