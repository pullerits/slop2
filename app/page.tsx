"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type StatName = "Health" | "Knowledge" | "Career" | "Social" | "Creativity";

type Habit = {
  id: string;
  title: string;
  stat: StatName;
  xp: number;
  streak: number;
  lastCompletedDate?: string;
};

type Stat = {
  name: StatName;
  xp: number;
};

type Activity = {
  id: string;
  text: string;
  date: string;
  xp: number;
  stat: StatName;
};

type AppState = {
  profile: {
    name: string;
    age: number;
  };
  stats: Record<StatName, Stat>;
  habits: Habit[];
  activity: Activity[];
  achievements: string[];
};

type OnboardingStep = "welcome" | "profile" | "habits";

const STORAGE_KEY = "scup:mvp";
const STAT_NAMES: StatName[] = [
  "Health",
  "Knowledge",
  "Career",
  "Social",
  "Creativity",
];

const STARTER_HABITS: Array<Pick<Habit, "title" | "stat" | "xp">> = [
  { title: "Take a short walk", stat: "Health", xp: 25 },
  { title: "Read for 10 minutes", stat: "Knowledge", xp: 20 },
  { title: "Finish one important task", stat: "Career", xp: 25 },
  { title: "Call or message someone", stat: "Social", xp: 15 },
  { title: "Make or write something", stat: "Creativity", xp: 20 },
];

const ACHIEVEMENTS = {
  firstHabit: "First habit completed",
  threeDayStreak: "Three-day streak",
  levelFive: "Level 5 in any stat",
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function levelFromXp(xp: number) {
  return Math.floor(xp / 100) + 1;
}

function progressToNextLevel(xp: number) {
  return xp % 100;
}

function createStats(): Record<StatName, Stat> {
  return STAT_NAMES.reduce(
    (stats, name) => ({
      ...stats,
      [name]: { name, xp: 0 },
    }),
    {} as Record<StatName, Stat>,
  );
}

function createInitialState(name: string, age: number, habitTitles: string[]) {
  const chosenHabits = STARTER_HABITS.filter((habit) =>
    habitTitles.includes(habit.title),
  );

  return {
    profile: { name, age },
    stats: createStats(),
    habits: chosenHabits.map((habit) => ({
      ...habit,
      id: uid("habit"),
      streak: 0,
    })),
    activity: [],
    achievements: [],
  };
}

function unlock(achievements: string[], achievement: string) {
  return achievements.includes(achievement)
    ? achievements
    : [achievement, ...achievements];
}

export default function Home() {
  const [state, setState] = useState<AppState | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [onboardingStep, setOnboardingStep] =
    useState<OnboardingStep>("welcome");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [selectedHabits, setSelectedHabits] = useState<string[]>(
    STARTER_HABITS.slice(0, 3).map((habit) => habit.title),
  );
  const [habitTitle, setHabitTitle] = useState("");
  const [habitStat, setHabitStat] = useState<StatName>("Health");
  const [habitXp, setHabitXp] = useState("20");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    window.queueMicrotask(() => {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          setState(JSON.parse(saved));
        } catch {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (state) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const overallLevel = useMemo(() => {
    if (!state) {
      return 1;
    }

    const levels = STAT_NAMES.map((stat) => levelFromXp(state.stats[stat].xp));
    return Math.max(1, Math.round(levels.reduce((a, b) => a + b, 0) / levels.length));
  }, [state]);

  const xpToday = useMemo(() => {
    if (!state) {
      return 0;
    }

    return state.activity
      .filter((item) => item.date.slice(0, 10) === todayKey())
      .reduce((sum, item) => sum + item.xp, 0);
  }, [state]);

  function toggleStarterHabit(title: string) {
    setSelectedHabits((current) =>
      current.includes(title)
        ? current.filter((item) => item !== title)
        : [...current, title],
    );
  }

  function handleOnboarding(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim() || "Player";
    const parsedAge = Math.max(1, Number.parseInt(age, 10) || 30);
    setState(createInitialState(cleanName, parsedAge, selectedHabits));
  }

  function addHabit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = habitTitle.trim();
    const xp = Math.max(5, Math.min(100, Number.parseInt(habitXp, 10) || 20));

    if (!title) {
      return;
    }

    setState((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        habits: [
          ...current.habits,
          {
            id: uid("habit"),
            title,
            stat: habitStat,
            xp,
            streak: 0,
          },
        ],
      };
    });

    setHabitTitle("");
    setHabitXp("20");
  }

  function completeHabit(habitId: string) {
    setState((current) => {
      if (!current) {
        return current;
      }

      const habit = current.habits.find((item) => item.id === habitId);
      if (!habit || habit.lastCompletedDate === todayKey()) {
        return current;
      }

      const nextStreak =
        habit.lastCompletedDate === yesterdayKey() ? habit.streak + 1 : 1;
      const nextStatXp = current.stats[habit.stat].xp + habit.xp;
      const activity = {
        id: uid("activity"),
        text: `Completed ${habit.title}`,
        date: new Date().toISOString(),
        xp: habit.xp,
        stat: habit.stat,
      };
      let achievements = unlock(
        current.achievements,
        ACHIEVEMENTS.firstHabit,
      );

      if (nextStreak >= 3) {
        achievements = unlock(achievements, ACHIEVEMENTS.threeDayStreak);
      }

      if (levelFromXp(nextStatXp) >= 5) {
        achievements = unlock(achievements, ACHIEVEMENTS.levelFive);
      }

      setNotice(`+${habit.xp} XP to ${habit.stat}`);
      window.setTimeout(() => setNotice(""), 1800);

      return {
        ...current,
        stats: {
          ...current.stats,
          [habit.stat]: {
            ...current.stats[habit.stat],
            xp: nextStatXp,
          },
        },
        habits: current.habits.map((item) =>
          item.id === habitId
            ? {
                ...item,
                streak: nextStreak,
                lastCompletedDate: todayKey(),
              }
            : item,
        ),
        activity: [activity, ...current.activity].slice(0, 12),
        achievements,
      };
    });
  }

  function resetPrototype() {
    window.localStorage.removeItem(STORAGE_KEY);
    setState(null);
    setName("");
    setAge("");
    setOnboardingStep("welcome");
    setSelectedHabits(STARTER_HABITS.slice(0, 3).map((habit) => habit.title));
  }

  function goToHabitStep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOnboardingStep("habits");
  }

  if (!isLoaded) {
    return <main className="min-h-screen bg-[#10131c]" />;
  }

  if (!state) {
    return (
      <main className="min-h-screen bg-[#10131c] px-5 py-8 text-[#f4efe4]">
        <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-2xl flex-col justify-center">
          <div className="mb-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#d89c32]">
              SCUP
            </p>
            <div className="flex gap-2" aria-label="Setup progress">
              {(["welcome", "profile", "habits"] as OnboardingStep[]).map(
                (step, index) => (
                  <span
                    className={`h-2 flex-1 rounded-full ${
                      step === onboardingStep
                        ? "bg-[#d89c32]"
                        : "bg-white/10"
                    }`}
                    key={step}
                    title={`Step ${index + 1}`}
                  />
                ),
              )}
            </div>
          </div>

          {onboardingStep === "welcome" ? (
            <div className="space-y-7">
              <div>
                <p className="mb-3 text-sm font-semibold text-[#f5c36a]">
                  Step 1 of 3
                </p>
                <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                  Make everyday tasks feel a little more rewarding.
                </h1>
                <p className="mt-5 text-lg leading-8 text-[#c9c1b4]">
                  Pick a few small things you want to do regularly. When you
                  mark one done, SCUP gives your character progress.
                </p>
              </div>

              <div className="grid gap-3">
                <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                  <p className="font-semibold">1. Choose simple daily actions</p>
                  <p className="mt-1 text-sm leading-6 text-[#9c9487]">
                    Walking, reading, calling someone, or finishing one task.
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                  <p className="font-semibold">2. Tap Done when you do one</p>
                  <p className="mt-1 text-sm leading-6 text-[#9c9487]">
                    No complicated setup. Just one button after the action.
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                  <p className="font-semibold">3. Watch your progress grow</p>
                  <p className="mt-1 text-sm leading-6 text-[#9c9487]">
                    The app keeps score so good days feel visible.
                  </p>
                </div>
              </div>

              <button
                className="h-13 w-full rounded-lg bg-[#d89c32] px-5 text-base font-semibold text-[#16120a] transition hover:bg-[#efb044]"
                onClick={() => setOnboardingStep("profile")}
              >
                Get started
              </button>
            </div>
          ) : null}

          {onboardingStep === "profile" ? (
            <form className="space-y-7" onSubmit={goToHabitStep}>
              <div>
                <p className="mb-3 text-sm font-semibold text-[#f5c36a]">
                  Step 2 of 3
                </p>
                <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                  First, what should we call you?
                </h1>
                <p className="mt-5 text-lg leading-8 text-[#c9c1b4]">
                  Your age becomes your starting prestige number. You can think
                  of it as the life experience you already have.
                </p>
              </div>

              <div className="grid gap-4">
                <label className="space-y-2">
                  <span className="text-base font-medium">Your name</span>
                  <input
                    className="h-14 w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 text-lg outline-none transition focus:border-[#d89c32]"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Type your name"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-base font-medium">Your age</span>
                  <input
                    className="h-14 w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 text-lg outline-none transition focus:border-[#d89c32]"
                    value={age}
                    onChange={(event) => setAge(event.target.value)}
                    inputMode="numeric"
                    placeholder="For example, 42"
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
                <button
                  className="h-13 rounded-lg border border-white/10 px-5 font-semibold text-[#c9c1b4] transition hover:border-[#d89c32] hover:text-[#f4efe4]"
                  onClick={() => setOnboardingStep("welcome")}
                  type="button"
                >
                  Back
                </button>
                <button className="h-13 rounded-lg bg-[#d89c32] px-5 font-semibold text-[#16120a] transition hover:bg-[#efb044]">
                  Continue
                </button>
              </div>
            </form>
          ) : null}

          {onboardingStep === "habits" ? (
            <form className="space-y-7" onSubmit={handleOnboarding}>
              <div>
                <p className="mb-3 text-sm font-semibold text-[#f5c36a]">
                  Step 3 of 3
                </p>
                <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                  Pick a few things you want to do more often.
                </h1>
                <p className="mt-5 text-lg leading-8 text-[#c9c1b4]">
                  Start small. You can add your own later from the dashboard.
                </p>
              </div>

              <div className="grid gap-3">
                {STARTER_HABITS.map((habit) => {
                  const isSelected = selectedHabits.includes(habit.title);

                  return (
                    <button
                      className={`flex min-h-20 items-center justify-between gap-4 rounded-lg border p-4 text-left transition ${
                        isSelected
                          ? "border-[#d89c32] bg-[#d89c32]/10"
                          : "border-white/10 bg-white/[0.045] hover:border-white/25"
                      }`}
                      key={habit.title}
                      onClick={() => toggleStarterHabit(habit.title)}
                      type="button"
                    >
                      <span>
                        <span className="block text-lg font-semibold">
                          {habit.title}
                        </span>
                        <span className="mt-1 block text-sm text-[#9c9487]">
                          Helps your {habit.stat.toLowerCase()} progress
                        </span>
                      </span>
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
                          isSelected
                            ? "border-[#d89c32] bg-[#d89c32] text-[#16120a]"
                            : "border-white/20 text-[#9c9487]"
                        }`}
                        aria-hidden="true"
                      >
                        {isSelected ? "On" : ""}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4 text-sm leading-6 text-[#c9c1b4]">
                Selected: {selectedHabits.length}. Two or three is a good start.
              </div>

              <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
                <button
                  className="h-13 rounded-lg border border-white/10 px-5 font-semibold text-[#c9c1b4] transition hover:border-[#d89c32] hover:text-[#f4efe4]"
                  onClick={() => setOnboardingStep("profile")}
                  type="button"
                >
                  Back
                </button>
                <button className="h-13 rounded-lg bg-[#d89c32] px-5 font-semibold text-[#16120a] transition hover:bg-[#efb044]">
                  Start my dashboard
                </button>
              </div>
            </form>
          ) : null}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#10131c] px-4 py-5 text-[#f4efe4] sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex items-center justify-between gap-4 py-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#d89c32]">
              SCUP
            </p>
            <h1 className="mt-1 text-2xl font-semibold">
              {state.profile.name}
            </h1>
          </div>
          <button
            className="rounded-lg border border-white/10 px-3 py-2 text-sm text-[#b8b1a4] transition hover:border-[#d89c32] hover:text-[#f4efe4]"
            onClick={resetPrototype}
          >
            Reset
          </button>
        </header>

        {notice ? (
          <div className="fixed left-1/2 top-5 z-10 -translate-x-1/2 rounded-full border border-[#d89c32]/40 bg-[#201a10] px-4 py-2 text-sm font-semibold text-[#f5c36a] shadow-2xl">
            {notice}
          </div>
        ) : null}

        <section className="grid gap-3 py-4 sm:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
            <p className="text-sm text-[#9c9487]">Prestige</p>
            <p className="mt-1 text-3xl font-semibold">{state.profile.age}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
            <p className="text-sm text-[#9c9487]">Overall level</p>
            <p className="mt-1 text-3xl font-semibold">{overallLevel}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
            <p className="text-sm text-[#9c9487]">XP today</p>
            <p className="mt-1 text-3xl font-semibold">{xpToday}</p>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <section>
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">Today&apos;s Habits</h2>
                  <p className="text-sm text-[#9c9487]">
                    Complete each once per day.
                  </p>
                </div>
              </div>

              <div className="grid gap-3">
                {state.habits.map((habit) => {
                  const doneToday = habit.lastCompletedDate === todayKey();

                  return (
                    <article
                      className="rounded-lg border border-white/10 bg-[#171b27] p-4"
                      key={habit.id}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="font-semibold">{habit.title}</h3>
                          <p className="mt-1 text-sm text-[#9c9487]">
                            {habit.stat} · {habit.xp} XP · {habit.streak} day
                            streak
                          </p>
                        </div>
                        <button
                          className="h-10 rounded-lg bg-[#d89c32] px-4 text-sm font-semibold text-[#16120a] transition hover:bg-[#efb044] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-[#777064]"
                          disabled={doneToday}
                          onClick={() => completeHabit(habit.id)}
                        >
                          {doneToday ? "Done" : "Complete"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">Create Habit</h2>
              <form
                className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.045] p-4 sm:grid-cols-[1fr_150px_100px_auto]"
                onSubmit={addHabit}
              >
                <input
                  className="h-11 rounded-lg border border-white/10 bg-[#10131c] px-3 outline-none transition focus:border-[#d89c32]"
                  onChange={(event) => setHabitTitle(event.target.value)}
                  placeholder="Habit title"
                  value={habitTitle}
                />
                <select
                  className="h-11 rounded-lg border border-white/10 bg-[#10131c] px-3 outline-none transition focus:border-[#d89c32]"
                  onChange={(event) => setHabitStat(event.target.value as StatName)}
                  value={habitStat}
                >
                  {STAT_NAMES.map((stat) => (
                    <option key={stat}>{stat}</option>
                  ))}
                </select>
                <input
                  className="h-11 rounded-lg border border-white/10 bg-[#10131c] px-3 outline-none transition focus:border-[#d89c32]"
                  inputMode="numeric"
                  onChange={(event) => setHabitXp(event.target.value)}
                  value={habitXp}
                />
                <button className="h-11 rounded-lg bg-[#d89c32] px-4 font-semibold text-[#16120a] transition hover:bg-[#efb044]">
                  Add
                </button>
              </form>
            </section>
          </div>

          <aside className="space-y-5">
            <section>
              <h2 className="mb-3 text-xl font-semibold">Stats</h2>
              <div className="grid gap-3">
                {STAT_NAMES.map((statName) => {
                  const stat = state.stats[statName];
                  const level = levelFromXp(stat.xp);
                  const progress = progressToNextLevel(stat.xp);

                  return (
                    <article
                      className="rounded-lg border border-white/10 bg-white/[0.045] p-4"
                      key={stat.name}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{stat.name}</h3>
                        <span className="text-sm text-[#f5c36a]">
                          Level {level}
                        </span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-[#d89c32]"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="mt-2 text-sm text-[#9c9487]">
                        {stat.xp} XP · {100 - progress} XP to next level
                      </p>
                    </article>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">Achievements</h2>
              <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                {state.achievements.length ? (
                  <div className="flex flex-wrap gap-2">
                    {state.achievements.map((achievement) => (
                      <span
                        className="rounded-full border border-[#d89c32]/30 bg-[#d89c32]/10 px-3 py-1 text-sm text-[#f5c36a]"
                        key={achievement}
                      >
                        {achievement}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#9c9487]">
                    Complete a habit to unlock the first one.
                  </p>
                )}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">Recent Activity</h2>
              <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                {state.activity.length ? (
                  <div className="space-y-3">
                    {state.activity.map((item) => (
                      <div
                        className="border-b border-white/10 pb-3 last:border-0 last:pb-0"
                        key={item.id}
                      >
                        <p className="text-sm font-medium">{item.text}</p>
                        <p className="mt-1 text-xs text-[#9c9487]">
                          +{item.xp} {item.stat} XP
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#9c9487]">
                    Your completed habits will appear here.
                  </p>
                )}
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
