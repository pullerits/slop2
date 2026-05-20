import { FormEvent } from "react";
import { OnboardingStep, STARTER_HABITS, STAT_CARD_CLASSES } from "../../lib/types";

export function OnboardingHabits({
  onboardingStep,
  selectedHabits,
  onToggle,
  onBack,
  onSubmit,
}: {
  onboardingStep: OnboardingStep;
  selectedHabits: string[];
  onToggle: (title: string) => void;
  onBack: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  if (onboardingStep !== "habits") return null;

  return (
    <form className="mt-12 space-y-8" onSubmit={onSubmit}>
      <div>
        <p className="mb-3 text-sm font-semibold text-[#6a6a6a]">
          Step 3 of 3
        </p>
        <h1 className="editorial-title text-5xl sm:text-6xl lg:text-7xl">
          Pick a few things you want to do more often.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-[#3a3a3a]">
          Start small. You can add your own from the dashboard later.
        </p>
      </div>

      <div className="grid gap-3">
        {STARTER_HABITS.map((habit) => {
          const isSelected = selectedHabits.includes(habit.title);

          return (
            <button
              aria-pressed={isSelected}
              className={`interactive-card flex min-h-[4.5rem] items-center justify-between gap-4 rounded-2xl border p-5 text-left ${
                isSelected
                  ? `${STAT_CARD_CLASSES[habit.stat]} selected-card border-transparent`
                  : "border-[#e5e5e5] bg-[#f5f0e0] text-[#0a0a0a]"
              }`}
              key={habit.title}
              onClick={() => onToggle(habit.title)}
              type="button"
            >
              <span>
                <span className="block text-base font-semibold">
                  {habit.title}
                </span>
                <span className="mt-0.5 block text-sm opacity-75">
                  Helps your {habit.stat.toLowerCase()} progress
                </span>
              </span>
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                  isSelected
                    ? "border-current bg-white/30"
                    : "border-[#d7d0be] text-[#6a6a6a]"
                }`}
                aria-hidden="true"
              >
                {isSelected ? "on" : null}
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl bg-[#f5f0e0] p-5 text-sm text-[#3a3a3a]">
        Selected: {selectedHabits.length}. Two or three is a good start.
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          className="button-secondary h-11 rounded-xl border border-[#e5e5e5] bg-[#fffaf0] px-5 text-sm font-semibold"
          onClick={onBack}
          type="button"
        >
          Back
        </button>
        <button className="button-primary h-11 rounded-xl px-5 text-sm font-semibold">
          Start my dashboard
        </button>
      </div>
    </form>
  );
}
