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
  firstHabit: "First thing done",
  threeDayStreak: "Three-day streak",
  levelFive: "Level 5 in a life area",
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
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
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

  const completedToday = useMemo(() => {
    if (!state) {
      return 0;
    }

    return state.habits.filter((habit) => habit.lastCompletedDate === todayKey())
      .length;
  }, [state]);

  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }).format(new Date()),
    [],
  );

  const dailyProgress = state?.habits.length
    ? Math.round((completedToday / state.habits.length) * 100)
    : 0;

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

  function startEditingHabit(habit: Habit) {
    setEditingHabitId(habit.id);
    setHabitTitle(habit.title);
    setHabitStat(habit.stat);
    setHabitXp(String(habit.xp));
  }

  function cancelEditingHabit() {
    setEditingHabitId(null);
    setHabitTitle("");
    setHabitStat("Health");
    setHabitXp("20");
  }

  function saveHabit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = habitTitle.trim();
    const xp = Math.max(5, Math.min(100, Number.parseInt(habitXp, 10) || 20));

    if (!title) {
      return;
    }

    if (!editingHabitId) {
      addHabit(event);
      return;
    }

    setState((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        habits: current.habits.map((habit) =>
          habit.id === editingHabitId
            ? {
                ...habit,
                title,
                stat: habitStat,
                xp,
              }
            : habit,
        ),
      };
    });

    cancelEditingHabit();
  }

  function deleteHabit(habitId: string) {
    setState((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        habits: current.habits.filter((habit) => habit.id !== habitId),
      };
    });

    if (editingHabitId === habitId) {
      cancelEditingHabit();
    }
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
        text: `Finished ${habit.title}`,
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

      setNotice(`+${habit.xp} progress in ${habit.stat}`);
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
    cancelEditingHabit();
    setSelectedHabits(STARTER_HABITS.slice(0, 3).map((habit) => habit.title));
  }

  function goToHabitStep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOnboardingStep("habits");
  }

  if (!isLoaded) {
    return <main className="min-h-screen bg-black" />;
  }

  if (!state) {
    return (
      <main className="min-h-screen bg-black px-6 py-8 text-neutral-100">
        <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-xl flex-col justify-center">
          <div className="mb-10">
            <p className="quiet-label mb-4 text-amber-500">
              SCUP
            </p>
            <div className="flex gap-2" aria-label="Setup progress">
              {(["welcome", "profile", "habits"] as OnboardingStep[]).map(
                (step, index) => (
                  <span
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      step === onboardingStep
                        ? "bg-amber-500"
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
            <div className="space-y-8">
              <div>
                <p className="mb-3 text-sm font-medium text-amber-500">
                  Step 1 of 3
                </p>
                <h1 className="editorial-title text-5xl sm:text-6xl">
                  Make everyday tasks feel a little more rewarding.
                </h1>
                <p className="mt-5 text-lg leading-8 text-neutral-400">
                  Pick a few small things you want to do regularly. When you
                  mark one done, SCUP gives your character progress.
                </p>
              </div>

              <div className="grid gap-4">
                <div className="rounded-2xl bg-neutral-900/60 p-5 ring-1 ring-white/[0.06]">
                  <p className="text-base font-semibold text-neutral-100">1. Choose simple daily actions</p>
                  <p className="mt-1.5 text-sm leading-6 text-neutral-400">
                    Walking, reading, calling someone, or finishing one task.
                  </p>
                </div>
                <div className="rounded-2xl bg-neutral-900/60 p-5 ring-1 ring-white/[0.06]">
                  <p className="text-base font-semibold text-neutral-100">2. Tap Done when you do one</p>
                  <p className="mt-1.5 text-sm leading-6 text-neutral-400">
                    No complicated setup. Just one button after the action.
                  </p>
                </div>
                <div className="rounded-2xl bg-neutral-900/60 p-5 ring-1 ring-white/[0.06]">
                  <p className="text-base font-semibold text-neutral-100">3. Watch your progress grow</p>
                  <p className="mt-1.5 text-sm leading-6 text-neutral-400">
                    The app keeps score so good days feel visible.
                  </p>
                </div>
              </div>

              <button
                className="h-14 w-full rounded-full bg-amber-500 px-6 text-base font-semibold text-black transition hover:bg-amber-400 active:scale-[0.98]"
                onClick={() => setOnboardingStep("profile")}
              >
                Get started
              </button>
            </div>
          ) : null}

          {onboardingStep === "profile" ? (
            <form className="space-y-8" onSubmit={goToHabitStep}>
              <div>
                <p className="mb-3 text-sm font-medium text-amber-500">
                  Step 2 of 3
                </p>
                <h1 className="editorial-title text-5xl sm:text-6xl">
                  First, what should we call you?
                </h1>
                <p className="mt-5 text-lg leading-8 text-neutral-400">
                  Your age becomes your life experience number. You can think
                  of it as the life experience you already have.
                </p>
              </div>

              <div className="grid gap-5">
                <label className="space-y-2.5">
                  <span className="text-sm font-medium text-neutral-300">Your name</span>
                  <input
                    className="h-14 w-full rounded-2xl bg-neutral-900/60 px-5 text-lg outline-none ring-1 ring-white/[0.08] transition placeholder:text-neutral-600 focus:ring-amber-500/50"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Type your name"
                  />
                </label>
                <label className="space-y-2.5">
                  <span className="text-sm font-medium text-neutral-300">Your age</span>
                  <input
                    className="h-14 w-full rounded-2xl bg-neutral-900/60 px-5 text-lg outline-none ring-1 ring-white/[0.08] transition placeholder:text-neutral-600 focus:ring-amber-500/50"
                    value={age}
                    onChange={(event) => setAge(event.target.value)}
                    inputMode="numeric"
                    placeholder="For example, 42"
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
                <button
                  className="h-14 rounded-full ring-1 ring-white/[0.08] px-5 font-semibold text-neutral-300 transition hover:bg-white/[0.04] hover:text-neutral-100"
                  onClick={() => setOnboardingStep("welcome")}
                  type="button"
                >
                  Back
                </button>
                <button className="h-14 rounded-full bg-amber-500 px-5 font-semibold text-black transition hover:bg-amber-400 active:scale-[0.98]">
                  Continue
                </button>
              </div>
            </form>
          ) : null}

          {onboardingStep === "habits" ? (
            <form className="space-y-8" onSubmit={handleOnboarding}>
              <div>
                <p className="mb-3 text-sm font-medium text-amber-500">
                  Step 3 of 3
                </p>
                <h1 className="editorial-title text-5xl sm:text-6xl">
                  Pick a few things you want to do more often.
                </h1>
                <p className="mt-5 text-lg leading-8 text-neutral-400">
                  Start small. You can add your own later from the dashboard.
                </p>
              </div>

              <div className="grid gap-3">
                {STARTER_HABITS.map((habit) => {
                  const isSelected = selectedHabits.includes(habit.title);

                  return (
                    <button
                      className={`flex min-h-[4.5rem] items-center justify-between gap-4 rounded-2xl p-5 text-left transition ${
                        isSelected
                          ? "bg-amber-500/10 ring-1 ring-amber-500/30"
                          : "bg-neutral-900/60 ring-1 ring-white/[0.06] hover:bg-neutral-800/60"
                      }`}
                      key={habit.title}
                      onClick={() => toggleStarterHabit(habit.title)}
                      type="button"
                    >
                      <span>
                        <span className="block text-base font-semibold">
                          {habit.title}
                        </span>
                        <span className="mt-0.5 block text-sm text-neutral-400">
                          Helps your {habit.stat.toLowerCase()} progress
                        </span>
                      </span>
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition ${
                          isSelected
                            ? "border-amber-500 bg-amber-500 text-black"
                            : "border-white/20 text-neutral-500"
                        }`}
                        aria-hidden="true"
                      >
                        {isSelected ? (
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-2xl bg-neutral-900/60 p-5 text-sm text-neutral-400 ring-1 ring-white/[0.06]">
                Selected: {selectedHabits.length}. Two or three is a good start.
              </div>

              <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
                <button
                  className="h-14 rounded-full ring-1 ring-white/[0.08] px-5 font-semibold text-neutral-300 transition hover:bg-white/[0.04] hover:text-neutral-100"
                  onClick={() => setOnboardingStep("profile")}
                  type="button"
                >
                  Back
                </button>
                <button className="h-14 rounded-full bg-amber-500 px-5 font-semibold text-black transition hover:bg-amber-400 active:scale-[0.98]">
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
    <main className="min-h-screen bg-black px-5 py-5 text-neutral-100 sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex items-center justify-between gap-4 py-4">
          <div>
            <p className="quiet-label text-amber-500">
              SCUP
            </p>
            <h1 className="editorial-heading mt-1 text-3xl">
              {state.profile.name}
            </h1>
          </div>
          <button
            className="rounded-full bg-neutral-900/60 px-4 py-2.5 text-sm font-medium text-neutral-400 ring-1 ring-white/[0.06] transition hover:bg-neutral-800/60 hover:text-neutral-200"
            onClick={resetPrototype}
          >
            Reset
          </button>
        </header>

        {notice ? (
          <div className="fixed left-1/2 top-5 z-10 -translate-x-1/2 rounded-full bg-neutral-800/90 px-5 py-2.5 text-sm font-semibold text-amber-400 shadow-2xl backdrop-blur-xl ring-1 ring-white/[0.08]">
            {notice}
          </div>
        ) : null}

        <section className="py-5">
          <div className="rounded-[2rem] bg-neutral-950 p-5 ring-1 ring-white/[0.08] sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <div className="space-y-7">
                <div>
                  <p className="quiet-label text-amber-500">{todayLabel}</p>
                  <h2 className="editorial-title mt-3 text-6xl sm:text-7xl">
                    Today
                  </h2>
                  <p className="mt-4 max-w-sm text-base leading-7 text-neutral-400">
                    Do these small things today. The list resets tonight.
                  </p>
                </div>

                <div className="rounded-3xl bg-black/50 p-5 ring-1 ring-white/[0.06]">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm text-neutral-400">Done today</p>
                      <p className="editorial-number mt-2 text-5xl">
                        {completedToday}/{state.habits.length}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-neutral-400">Progress earned</p>
                      <p className="editorial-number mt-2 text-4xl">{xpToday}</p>
                    </div>
                  </div>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all"
                      style={{ width: `${dailyProgress}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm text-neutral-500">
                    {completedToday === state.habits.length && state.habits.length > 0
                      ? "Everything for today is done."
                      : "One tap is enough after you finish something."}
                  </p>
                </div>
              </div>

              <div>
                <div className="mb-4">
                  <h3 className="editorial-heading text-3xl">
                    Your things for today
                  </h3>
                  <p className="mt-1 text-sm text-neutral-400">
                    Keep it simple. Tap Done when it is finished.
                  </p>
                </div>

                <div className="grid gap-3">
                  {state.habits.length === 0 ? (
                    <div className="rounded-3xl bg-black/50 p-6 ring-1 ring-white/[0.06]">
                      <h3 className="font-semibold text-neutral-100">
                        Add one small thing to start.
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-neutral-400">
                        A short walk, a glass of water, or ten minutes of
                        reading is enough. Keep it easy.
                      </p>
                    </div>
                  ) : null}

                  {state.habits.map((habit) => {
                    const doneToday = habit.lastCompletedDate === todayKey();

                    return (
                      <article
                        className={`rounded-3xl p-5 ring-1 transition ${
                          doneToday
                            ? "bg-amber-500/10 ring-amber-500/20"
                            : "bg-black/50 ring-white/[0.06]"
                        }`}
                        key={habit.id}
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h3 className="font-semibold text-neutral-100">
                              {habit.title}
                            </h3>
                            <p className="mt-1 text-sm text-neutral-400">
                              {habit.stat} progress · {habit.streak} day streak
                            </p>
                          </div>
                          <div className="grid grid-cols-3 gap-2 sm:flex sm:shrink-0 sm:items-center">
                            <button
                              className="h-10 rounded-full bg-amber-500 px-5 text-sm font-semibold text-black transition hover:bg-amber-400 active:scale-95 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
                              disabled={doneToday}
                              onClick={() => completeHabit(habit.id)}
                            >
                              Done
                            </button>
                            <button
                              className="h-10 rounded-full bg-neutral-800 px-4 text-sm font-medium text-neutral-300 transition hover:bg-neutral-700"
                              onClick={() => startEditingHabit(habit)}
                            >
                              Edit
                            </button>
                            <button
                              className="h-10 rounded-full bg-neutral-800 px-4 text-sm font-medium text-neutral-500 transition hover:bg-neutral-700 hover:text-neutral-200"
                              onClick={() => deleteHabit(habit.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 py-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <section>
              <h2 className="editorial-heading mb-4 text-2xl">
                {editingHabitId ? "Change a daily thing" : "Add a daily thing"}
              </h2>
              <form
                className="grid gap-3 rounded-2xl bg-neutral-900/60 p-5 ring-1 ring-white/[0.06] sm:grid-cols-[1fr_150px_100px_auto]"
                onSubmit={saveHabit}
              >
                <input
                  className="h-12 rounded-xl bg-black/40 px-4 text-sm outline-none ring-1 ring-white/[0.08] transition placeholder:text-neutral-600 focus:ring-amber-500/50"
                  onChange={(event) => setHabitTitle(event.target.value)}
                  placeholder="Example: Take a short walk"
                  value={habitTitle}
                />
                <select
                  className="h-12 rounded-xl bg-black/40 px-4 text-sm outline-none ring-1 ring-white/[0.08] transition focus:ring-amber-500/50 appearance-none"
                  onChange={(event) => setHabitStat(event.target.value as StatName)}
                  value={habitStat}
                >
                  {STAT_NAMES.map((stat) => (
                    <option key={stat}>{stat}</option>
                  ))}
                </select>
                <input
                  className="h-12 rounded-xl bg-black/40 px-4 text-sm outline-none ring-1 ring-white/[0.08] transition placeholder:text-neutral-600 focus:ring-amber-500/50"
                  inputMode="numeric"
                  placeholder="20"
                  onChange={(event) => setHabitXp(event.target.value)}
                  value={habitXp}
                />
                <button className="h-12 rounded-full bg-amber-500 px-5 text-sm font-semibold text-black transition hover:bg-amber-400 active:scale-95">
                  {editingHabitId ? "Save" : "Add"}
                </button>
                {editingHabitId ? (
                  <button
                    className="h-12 rounded-full bg-neutral-800 px-5 text-sm font-semibold text-neutral-300 transition hover:bg-neutral-700 sm:col-start-4"
                    onClick={cancelEditingHabit}
                    type="button"
                  >
                    Cancel
                  </button>
                ) : null}
              </form>
            </section>
          </div>

          <aside className="space-y-6">
            <section>
              <h2 className="editorial-heading mb-4 text-2xl">
                Character snapshot
              </h2>
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-2xl bg-neutral-900/60 p-5 ring-1 ring-white/[0.06]">
                  <p className="text-sm text-neutral-400">Life experience</p>
                  <p className="editorial-number mt-2 text-4xl">
                    {state.profile.age}
                  </p>
                </div>
                <div className="rounded-2xl bg-neutral-900/60 p-5 ring-1 ring-white/[0.06]">
                  <p className="text-sm text-neutral-400">Growth level</p>
                  <p className="editorial-number mt-2 text-4xl">
                    {overallLevel}
                  </p>
                </div>
                <div className="rounded-2xl bg-neutral-900/60 p-5 ring-1 ring-white/[0.06]">
                  <p className="text-sm text-neutral-400">Progress today</p>
                  <p className="editorial-number mt-2 text-4xl">{xpToday}</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="editorial-heading mb-4 text-2xl">Life areas</h2>
              <div className="grid gap-3">
                {STAT_NAMES.map((statName) => {
                  const stat = state.stats[statName];
                  const level = levelFromXp(stat.xp);
                  const progress = progressToNextLevel(stat.xp);

                  return (
                    <article
                      className="rounded-2xl bg-neutral-900/60 p-5 ring-1 ring-white/[0.06]"
                      key={stat.name}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-neutral-200">{stat.name}</h3>
                        <span className="text-sm font-medium text-amber-400">
                          Level {level}
                        </span>
                      </div>
                      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-amber-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="mt-3 text-sm text-neutral-400">
                        {stat.xp} progress · {100 - progress} to next level
                      </p>
                    </article>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="editorial-heading mb-4 text-2xl">Milestones</h2>
              <div className="rounded-2xl bg-neutral-900/60 p-5 ring-1 ring-white/[0.06]">
                {state.achievements.length ? (
                  <div className="flex flex-wrap gap-2">
                    {state.achievements.map((achievement) => (
                      <span
                        className="rounded-full bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-400 ring-1 ring-amber-500/20"
                        key={achievement}
                      >
                        {achievement}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-400">
                    Finish one thing today to unlock your first milestone.
                  </p>
                )}
              </div>
            </section>

            <section>
              <h2 className="editorial-heading mb-4 text-2xl">Recent wins</h2>
              <div className="rounded-2xl bg-neutral-900/60 p-5 ring-1 ring-white/[0.06]">
                {state.activity.length ? (
                  <div className="space-y-4">
                    {state.activity.map((item) => (
                      <div
                        className="border-b border-white/[0.04] pb-3 last:border-0 last:pb-0"
                        key={item.id}
                      >
                        <p className="text-sm font-medium text-neutral-200">{item.text}</p>
                        <p className="mt-1 text-xs text-neutral-500">
                          +{item.xp} {item.stat} progress
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-400">
                    Things you finish will appear here.
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
