import { StatName, STAT_NAMES, STAT_CARD_CLASSES, STAT_PROGRESS_CLASSES } from "../lib/types";

export function StatPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: StatName;
  onChange: (value: StatName) => void;
}) {
  return (
    <div className="space-y-2">
      <span className="text-sm font-semibold">{label}</span>
      <div
        aria-label={label}
        className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5"
        role="radiogroup"
      >
        {STAT_NAMES.map((stat) => {
          const selected = value === stat;

          return (
            <button
              aria-checked={selected}
              className={`interactive-card flex min-h-12 items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold ${
                selected
                  ? `${STAT_CARD_CLASSES[stat]} selected-card border-transparent`
                  : "border-[#e5e5e5] bg-[#fffaf0] text-[#0a0a0a]"
              }`}
              key={stat}
              onClick={() => onChange(stat)}
              role="radio"
              type="button"
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={`h-2.5 w-2.5 rounded-full ${STAT_PROGRESS_CLASSES[stat]}`}
                />
                {stat}
              </span>
              <span
                aria-hidden="true"
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                  selected
                    ? "border-current bg-white/25"
                    : "border-[#d7d0be] text-[#6a6a6a]"
                }`}
              >
                {selected ? "on" : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
