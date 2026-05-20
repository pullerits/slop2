import { AppState } from "../../lib/types";

interface ProfileViewProps {
  state: AppState;
  overallLevel: number;
  dailyProgress: number;
  xpToday: number;
}

export function ProfileView({
  state,
  overallLevel,
  dailyProgress,
  xpToday,
}: ProfileViewProps) {
  return (
    <section className="py-8">
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-3xl bg-[#ffb084] p-6 sm:p-8">
          <p className="quiet-label text-[#3a3a3a]">Player profile</p>
          <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[#0a0a0a] text-4xl font-semibold text-white">
              {state.profile.name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h2 className="editorial-title text-5xl">
                {state.profile.name}
              </h2>
              <p className="mt-2 text-sm font-semibold text-[#3a3a3a]">
                Level {overallLevel} / {state.profile.age} life experience
              </p>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-[#fffaf0] p-4">
              <p className="text-xs font-semibold text-[#6a6a6a]">Habits</p>
              <p className="editorial-number mt-2 text-3xl">
                {state.habits.length}
              </p>
            </div>
            <div className="rounded-2xl bg-[#fffaf0] p-4">
              <p className="text-xs font-semibold text-[#6a6a6a]">Quests</p>
              <p className="editorial-number mt-2 text-3xl">
                {state.quests.length}
              </p>
            </div>
            <div className="rounded-2xl bg-[#fffaf0] p-4">
              <p className="text-xs font-semibold text-[#6a6a6a]">Badges</p>
              <p className="editorial-number mt-2 text-3xl">
                {state.achievements.length}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <section className="rounded-3xl bg-[#f5f0e0] p-6 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="quiet-label text-[#6a6a6a]">Account</p>
                <h3 className="editorial-heading mt-3 text-3xl">
                  Local-first profile
                </h3>
              </div>
              <span className="rounded-full bg-[#a4d4c5] px-3 py-1 text-xs font-semibold text-[#0a0a0a]">
                Browser saved
              </span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#e5e5e5] bg-[#fffaf0] p-5">
                <p className="text-sm text-[#6a6a6a]">Display name</p>
                <p className="mt-2 font-semibold">{state.profile.name}</p>
              </div>
              <div className="rounded-2xl border border-[#e5e5e5] bg-[#fffaf0] p-5">
                <p className="text-sm text-[#6a6a6a]">Plan</p>
                <p className="mt-2 font-semibold">Starter</p>
              </div>
              <div className="rounded-2xl border border-[#e5e5e5] bg-[#fffaf0] p-5">
                <p className="text-sm text-[#6a6a6a]">Daily progress</p>
                <p className="mt-2 font-semibold">{dailyProgress}% complete</p>
              </div>
              <div className="rounded-2xl border border-[#e5e5e5] bg-[#fffaf0] p-5">
                <p className="text-sm text-[#6a6a6a]">Today earned</p>
                <p className="mt-2 font-semibold">{xpToday} progress</p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-[#1a3a3a] p-6 text-white sm:p-8">
            <p className="quiet-label text-white/65">Active routine</p>
            <div className="mt-5 grid gap-3">
              {state.habits.length ? (
                state.habits.map((habit) => (
                  <div
                    className="flex items-center justify-between gap-4 rounded-2xl bg-white/10 p-4"
                    key={habit.id}
                  >
                    <div>
                      <p className="font-semibold">{habit.title}</p>
                      <p className="mt-1 text-sm text-white/65">
                        {habit.stat} / {habit.xp} progress
                      </p>
                    </div>
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                      {habit.streak} day
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-white/70">
                  Add a daily thing from Today to build a routine.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
