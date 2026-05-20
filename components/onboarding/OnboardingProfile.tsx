import { FormEvent } from "react";
import { OnboardingStep } from "../../lib/types";

export function OnboardingProfile({
  onboardingStep,
  name,
  age,
  onNameChange,
  onAgeChange,
  onBack,
  onSubmit,
}: {
  onboardingStep: OnboardingStep;
  name: string;
  age: string;
  onNameChange: (value: string) => void;
  onAgeChange: (value: string) => void;
  onBack: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  if (onboardingStep !== "profile") return null;

  return (
    <form className="mt-12 space-y-8" onSubmit={onSubmit}>
      <div>
        <p className="mb-3 text-sm font-semibold text-[#6a6a6a]">
          Step 2 of 3
        </p>
        <h1 className="editorial-title text-5xl sm:text-6xl lg:text-7xl">
          First, what should we call you?
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-[#3a3a3a]">
          Your age becomes your life experience number, while your
          habits create new progress from today onward.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="space-y-2.5">
          <span className="text-sm font-semibold text-[#1a1a1a]">
            Your name
          </span>
          <input
            className="h-12 w-full rounded-xl border border-[#e5e5e5] bg-[#fffaf0] px-4 text-base outline-none transition placeholder:text-[#9a9a9a] focus:border-[#0a0a0a]"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="Type your name"
          />
        </label>
        <label className="space-y-2.5">
          <span className="text-sm font-semibold text-[#1a1a1a]">
            Your age
          </span>
          <input
            className="h-12 w-full rounded-xl border border-[#e5e5e5] bg-[#fffaf0] px-4 text-base outline-none transition placeholder:text-[#9a9a9a] focus:border-[#0a0a0a]"
            value={age}
            onChange={(event) => onAgeChange(event.target.value)}
            inputMode="numeric"
            placeholder="For example, 42"
          />
        </label>
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
          Continue
        </button>
      </div>
    </form>
  );
}
