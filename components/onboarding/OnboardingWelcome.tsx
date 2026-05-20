import { OnboardingStep } from "../../lib/types";

export function OnboardingWelcome({
  onboardingStep,
  onNext,
}: {
  onboardingStep: OnboardingStep;
  onNext: () => void;
}) {
  if (onboardingStep !== "welcome") return null;

  return (
    <div className="mt-12 space-y-8">
      <div>
        <p className="mb-3 text-sm font-semibold text-[#6a6a6a]">
          Step 1 of 3
        </p>
        <h1 className="editorial-title text-5xl sm:text-6xl lg:text-7xl">
          Turn tiny daily wins into visible progress.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-[#3a3a3a]">
          Pick a few small actions, mark them done, and watch your
          character grow across health, knowledge, career, social,
          and creative life areas.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Choose", "Simple daily actions", "bg-[#ff4d8b] text-white"],
          ["Tap", "Done after the real thing", "bg-[#b8a4ed] text-[#0a0a0a]"],
          ["Grow", "Levels and milestones", "bg-[#e8b94a] text-[#0a0a0a]"],
        ].map(([title, body, classes]) => (
          <div className={`rounded-3xl p-5 ${classes}`} key={title}>
            <p className="text-base font-semibold">{title}</p>
            <p className="mt-8 text-sm leading-6 opacity-80">{body}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-center sm:justify-start">
        <button
          className="button-primary h-11 w-full max-w-xs rounded-xl px-5 text-sm font-semibold sm:w-auto sm:max-w-none"
          onClick={onNext}
        >
          Get started
        </button>
      </div>
    </div>
  );
}
