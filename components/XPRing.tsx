"use client";

interface XPRingProps {
  current: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
}

export function XPRing({
  current,
  goal,
  size = 160,
  strokeWidth = 14,
}: XPRingProps) {
  const safeGoal = goal > 0 ? goal : 1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(1, Math.max(0, current / safeGoal));
  const dashOffset = circumference * (1 - progress);
  const isComplete = progress >= 1;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(235, 230, 214, 0.8)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isComplete ? "#a4d4c5" : "#ff4d8b"}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 600ms cubic-bezier(0.2, 0.9, 0.2, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="editorial-number text-3xl font-medium leading-none">
          {current}
        </span>
        <span className="mt-1 text-xs font-semibold text-[#6a6a6a]">
          / {goal} XP
        </span>
      </div>
    </div>
  );
}
