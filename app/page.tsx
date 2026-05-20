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

type QuestMilestone = {
  id: string;
  title: string;
  completed: boolean;
};

type Quest = {
  id: string;
  title: string;
  stat: StatName;
  xp: number;
  milestones: QuestMilestone[];
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
  quests: Quest[];
  activity: Activity[];
  achievements: string[];
};

type OnboardingStep = "welcome" | "profile" | "habits";
type DashboardView =
  | "today"
  | "quests"
  | "progress"
  | "activity"
  | "pricing"
  | "profile";

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
  firstQuest: "First quest created",
  firstQuestMilestone: "First quest step done",
  levelFive: "Level 5 in a life area",
};

const STAT_CARD_CLASSES: Record<StatName, string> = {
  Health: "bg-[#ff4d8b] text-white",
  Knowledge: "bg-[#b8a4ed] text-[#0a0a0a]",
  Career: "bg-[#1a3a3a] text-white",
  Social: "bg-[#ffb084] text-[#0a0a0a]",
  Creativity: "bg-[#e8b94a] text-[#0a0a0a]",
};

const STAT_PROGRESS_CLASSES: Record<StatName, string> = {
  Health: "bg-[#ff4d8b]",
  Knowledge: "bg-[#b8a4ed]",
  Career: "bg-[#1a3a3a]",
  Social: "bg-[#ffb084]",
  Creativity: "bg-[#e8b94a]",
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

function getDayStatus(now: Date) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setHours(24, 0, 0, 0);

  const totalMs = end.getTime() - start.getTime();
  const elapsedMs = now.getTime() - start.getTime();
  const remainingMs = Math.max(0, end.getTime() - now.getTime());
  const hoursLeft = Math.floor(remainingMs / 3_600_000);
  const minutesLeft = Math.floor((remainingMs % 3_600_000) / 60_000);

  return {
    dayProgress: Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100)),
    timeLeft:
      hoursLeft > 0
        ? `${hoursLeft}h ${minutesLeft}m left today`
        : `${minutesLeft}m left today`,
  };
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
    quests: [],
    activity: [],
    achievements: [],
  };
}

function unlock(achievements: string[], achievement: string) {
  return achievements.includes(achievement)
    ? achievements
    : [achievement, ...achievements];
}

function normalizeState(saved: AppState) {
  return {
    ...saved,
    quests: saved.quests ?? [],
  };
}

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0a0a0a] text-sm font-semibold text-white">
        S
      </span>
      <span className="text-sm font-semibold">SCUP</span>
    </div>
  );
}

function HeroArtifact() {
  return (
    <aside className="clay-orbit">
      <span className="clay-shape clay-hero-one" />
      <span className="clay-shape clay-hero-two" />
      <span className="clay-shape clay-hero-three" />
      <span className="clay-shape clay-hero-four" />
      <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-[#e5e5e5] bg-[#fffaf0]/90 p-4 backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold">Today run</p>
          <span className="rounded-full bg-[#a4d4c5] px-3 py-1 text-xs font-semibold">
            live
          </span>
        </div>
        <div className="grid gap-3">
          <div className="mock-row">
            <span className="mock-line" />
            <span className="mock-chip" />
          </div>
          <div className="mock-row">
            <span className="mock-line w-4/5" />
            <span className="mock-chip bg-[#ffb084]" />
          </div>
          <div className="mock-row">
            <span className="mock-line w-3/5" />
            <span className="mock-chip bg-[#b8a4ed]" />
          </div>
        </div>
      </div>
    </aside>
  );
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
  const [questTitle, setQuestTitle] = useState("");
  const [questStat, setQuestStat] = useState<StatName>("Knowledge");
  const [questMilestones, setQuestMilestones] = useState("");
  const [activeView, setActiveView] = useState<DashboardView>("today");
  const [now, setNow] = useState(() => new Date());
  const [notice, setNotice] = useState("");

  useEffect(() => {
    window.queueMicrotask(() => {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          setState(normalizeState(JSON.parse(saved)));
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

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  const overallLevel = useMemo(() => {
    if (!state) {
      return 1;
    }

    const levels = STAT_NAMES.map((stat) => levelFromXp(state.stats[stat].xp));
    return Math.max(
      1,
      Math.round(levels.reduce((a, b) => a + b, 0) / levels.length),
    );
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
  const dayStatus = useMemo(() => getDayStatus(now), [now]);
  const nextQuestSteps = useMemo(() => {
    if (!state) {
      return [];
    }

    return state.quests
      .map((quest) => {
        const milestone = quest.milestones.find((step) => !step.completed);
        return milestone ? { quest, milestone } : null;
      })
      .filter((item): item is { quest: Quest; milestone: QuestMilestone } =>
        Boolean(item),
      )
      .slice(0, 2);
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

  function addQuest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = questTitle.trim();
    const milestones = questMilestones
      .split("\n")
      .map((milestone) => milestone.trim())
      .filter(Boolean)
      .slice(0, 6);

    if (!title || milestones.length === 0) {
      return;
    }

    setState((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        quests: [
          ...current.quests,
          {
            id: uid("quest"),
            title,
            stat: questStat,
            xp: 35,
            milestones: milestones.map((milestone) => ({
              id: uid("milestone"),
              title: milestone,
              completed: false,
            })),
          },
        ],
        achievements: unlock(current.achievements, ACHIEVEMENTS.firstQuest),
      };
    });

    setQuestTitle("");
    setQuestStat("Knowledge");
    setQuestMilestones("");
  }

  function completeQuestMilestone(questId: string, milestoneId: string) {
    setState((current) => {
      if (!current) {
        return current;
      }

      const quest = current.quests.find((item) => item.id === questId);
      const milestone = quest?.milestones.find(
        (item) => item.id === milestoneId,
      );

      if (!quest || !milestone || milestone.completed) {
        return current;
      }

      const nextStatXp = current.stats[quest.stat].xp + quest.xp;
      let achievements = unlock(
        current.achievements,
        ACHIEVEMENTS.firstQuestMilestone,
      );

      if (levelFromXp(nextStatXp) >= 5) {
        achievements = unlock(achievements, ACHIEVEMENTS.levelFive);
      }

      setNotice(`+${quest.xp} progress in ${quest.stat}`);
      window.setTimeout(() => setNotice(""), 1800);

      return {
        ...current,
        stats: {
          ...current.stats,
          [quest.stat]: {
            ...current.stats[quest.stat],
            xp: nextStatXp,
          },
        },
        quests: current.quests.map((item) =>
          item.id === questId
            ? {
                ...item,
                milestones: item.milestones.map((step) =>
                  step.id === milestoneId
                    ? {
                        ...step,
                        completed: true,
                      }
                    : step,
                ),
              }
            : item,
        ),
        activity: [
          {
            id: uid("activity"),
            text: `Finished quest step: ${milestone.title}`,
            date: new Date().toISOString(),
            xp: quest.xp,
            stat: quest.stat,
          },
          ...current.activity,
        ].slice(0, 12),
        achievements,
      };
    });
  }

  function deleteQuest(questId: string) {
    setState((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        quests: current.quests.filter((quest) => quest.id !== questId),
      };
    });
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
    setQuestTitle("");
    setQuestStat("Knowledge");
    setQuestMilestones("");
    setSelectedHabits(STARTER_HABITS.slice(0, 3).map((habit) => habit.title));
  }

  function goToHabitStep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOnboardingStep("habits");
  }

  if (!isLoaded) {
    return <main className="min-h-screen bg-[#fffaf0]" />;
  }

  if (!state) {
    return (
      <main className="min-h-screen bg-[#fffaf0] px-5 py-5 text-[#0a0a0a] sm:px-8">
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between">
          <BrandMark />
          <button
            className="button-secondary hidden h-11 rounded-xl border border-[#e5e5e5] bg-[#fffaf0] px-5 text-sm font-semibold sm:block"
            onClick={() => setOnboardingStep("profile")}
            type="button"
          >
            Start setup
          </button>
        </nav>

        <section className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl gap-10 py-10 lg:grid-cols-[1fr_0.82fr] lg:items-center">
          <div className="max-w-2xl">
            <p className="quiet-label mb-4 text-[#6a6a6a]">
              Personal growth tracker
            </p>
            <div className="flex gap-2" aria-label="Setup progress">
              {(["welcome", "profile", "habits"] as OnboardingStep[]).map(
                (step, index) => (
                  <span
                    className={`h-1.5 max-w-24 flex-1 rounded-full transition-colors ${
                      step === onboardingStep ? "bg-[#0a0a0a]" : "bg-[#ebe6d6]"
                    }`}
                    key={step}
                    title={`Step ${index + 1}`}
                  />
                ),
              )}
            </div>

            {onboardingStep === "welcome" ? (
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

                <button
                  className="button-primary h-11 rounded-xl px-5 text-sm font-semibold"
                  onClick={() => setOnboardingStep("profile")}
                >
                  Get started
                </button>
              </div>
            ) : null}

            {onboardingStep === "profile" ? (
              <form className="mt-12 space-y-8" onSubmit={goToHabitStep}>
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
                      onChange={(event) => setName(event.target.value)}
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
                      onChange={(event) => setAge(event.target.value)}
                      inputMode="numeric"
                      placeholder="For example, 42"
                    />
                  </label>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    className="button-secondary h-11 rounded-xl border border-[#e5e5e5] bg-[#fffaf0] px-5 text-sm font-semibold"
                    onClick={() => setOnboardingStep("welcome")}
                    type="button"
                  >
                    Back
                  </button>
                  <button className="button-primary h-11 rounded-xl px-5 text-sm font-semibold">
                    Continue
                  </button>
                </div>
              </form>
            ) : null}

            {onboardingStep === "habits" ? (
              <form className="mt-12 space-y-8" onSubmit={handleOnboarding}>
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
                        onClick={() => toggleStarterHabit(habit.title)}
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
                    onClick={() => setOnboardingStep("profile")}
                    type="button"
                  >
                    Back
                  </button>
                  <button className="button-primary h-11 rounded-xl px-5 text-sm font-semibold">
                    Start my dashboard
                  </button>
                </div>
              </form>
            ) : null}
          </div>

          <HeroArtifact />
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffaf0] px-5 py-5 text-[#0a0a0a] sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex min-h-16 items-center justify-between gap-4 py-2">
          <BrandMark />
          <button
            className="button-secondary h-11 rounded-xl border border-[#e5e5e5] bg-[#fffaf0] px-4 text-sm font-semibold text-[#1a1a1a]"
            onClick={resetPrototype}
          >
            Reset
          </button>
        </header>

        <nav className="mt-4 flex gap-2 overflow-x-auto rounded-2xl bg-[#f5f0e0] p-1">
          {[
            ["today", "Today"],
            ["quests", "Quests"],
            ["progress", "Progress"],
            ["activity", "Activity"],
            ["pricing", "Pricing"],
            ["profile", "Profile"],
          ].map(([view, label]) => (
            <button
              className={`h-10 min-w-28 rounded-xl px-4 text-sm font-semibold ${
                activeView === view
                  ? "bg-[#0a0a0a] text-white"
                  : "text-[#3a3a3a] hover:bg-[#fffaf0]"
              }`}
              key={view}
              onClick={() => setActiveView(view as DashboardView)}
            >
              {label}
            </button>
          ))}
        </nav>

        {notice ? (
          <div className="fixed left-1/2 top-5 z-10 -translate-x-1/2 rounded-xl bg-[#0a0a0a] px-5 py-2.5 text-sm font-semibold text-white shadow-xl">
            {notice}
          </div>
        ) : null}

        {activeView === "today" ? (
        <section className="py-8">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
            <div className="rounded-3xl bg-[#f5f0e0] p-6 sm:p-8">
              <p className="quiet-label text-[#6a6a6a]">{todayLabel}</p>
              <h2 className="editorial-title mt-4 text-6xl sm:text-7xl">
                Today
              </h2>
                  <p className="mt-5 max-w-sm text-base leading-7 text-[#3a3a3a]">
                    Do these small things today. The list resets tonight.
                  </p>

              <div className="mt-10 rounded-2xl border border-[#e5e5e5] bg-[#fffaf0] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-[#6a6a6a]">Day progress</p>
                    <p className="mt-1 text-base font-semibold">
                      {dayStatus.timeLeft}
                    </p>
                  </div>
                  <p className="text-sm text-[#6a6a6a]">
                    {Math.round(dayStatus.dayProgress)}%
                  </p>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#ebe6d6]">
                  <div
                    className="h-full rounded-full bg-[#1a3a3a] transition-all"
                    style={{ width: `${dayStatus.dayProgress}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-[#e5e5e5] bg-[#fffaf0] p-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm text-[#6a6a6a]">Done today</p>
                    <p className="editorial-number mt-2 text-5xl">
                      {completedToday}/{state.habits.length}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[#6a6a6a]">Progress earned</p>
                    <p className="editorial-number mt-2 text-4xl">{xpToday}</p>
                  </div>
                </div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#ebe6d6]">
                  <div
                    className="h-full rounded-full bg-[#ff4d8b] transition-all"
                    style={{ width: `${dailyProgress}%` }}
                  />
                </div>
                <p className="mt-3 text-sm text-[#6a6a6a]">
                  {completedToday === state.habits.length && state.habits.length > 0
                    ? "Everything for today is done."
                    : "One tap is enough after you finish something."}
                </p>
              </div>
            </div>

            <div className="rounded-3xl bg-[#1a3a3a] p-6 text-white sm:p-8">
              <div>
                <h3 className="editorial-heading text-3xl">
                  Your things for today
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  Keep it simple. Tap Done when it is finished.
                </p>
              </div>

              <div className="mt-6 grid gap-3">
                {state.habits.length === 0 ? (
                  <div className="rounded-2xl bg-white/10 p-6">
                    <h3 className="font-semibold">Add one small thing to start.</h3>
                    <p className="mt-2 text-sm leading-6 text-white/70">
                      A short walk, a glass of water, or ten minutes of reading
                      is enough.
                    </p>
                  </div>
                ) : null}

                {state.habits.map((habit) => {
                  const doneToday = habit.lastCompletedDate === todayKey();

                  return (
                    <article
                      className={`rounded-2xl p-5 ${
                        doneToday
                          ? "done-card bg-[#a4d4c5] text-[#0a0a0a]"
                          : "bg-white/10 text-white"
                      }`}
                      key={habit.id}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="font-semibold">{habit.title}</h3>
                          <p className="mt-1 text-sm opacity-75">
                            {habit.stat} progress / {habit.streak} day streak
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-2 sm:flex sm:shrink-0 sm:items-center">
                          <button
                            className="button-on-dark h-10 rounded-xl bg-white px-4 text-sm font-semibold text-[#0a0a0a] disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/45"
                            disabled={doneToday}
                            onClick={() => completeHabit(habit.id)}
                          >
                            Done
                          </button>
                          <button
                            className="button-ghost-dark h-10 rounded-xl bg-white/15 px-4 text-sm font-semibold"
                            onClick={() => startEditingHabit(habit)}
                          >
                            Edit
                          </button>
                          <button
                            className="button-ghost-dark h-10 rounded-xl bg-white/15 px-4 text-sm font-semibold"
                            onClick={() => deleteHabit(habit.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}

                {nextQuestSteps.length ? (
                  <div className="mt-4 rounded-2xl bg-white/10 p-5">
                    <p className="text-sm font-semibold text-white/70">
                      One step toward a bigger goal
                    </p>
                    <div className="mt-3 grid gap-3">
                      {nextQuestSteps.map(({ quest, milestone }) => (
                        <article
                          className="rounded-2xl bg-white p-4 text-[#0a0a0a]"
                          key={`${quest.id}-${milestone.id}`}
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <h4 className="font-semibold">
                                {milestone.title}
                              </h4>
                              <p className="mt-1 text-sm text-[#6a6a6a]">
                                From: {quest.title}
                              </p>
                            </div>
                            <button
                              className="h-10 rounded-xl bg-[#0a0a0a] px-4 text-sm font-semibold text-white"
                              onClick={() =>
                                completeQuestMilestone(quest.id, milestone.id)
                              }
                            >
                              Done
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                    <p className="mt-3 text-xs leading-5 text-white/60">
                      These are optional today. Daily things stay separate.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>
        ) : null}

        {activeView === "quests" ? (
          <section className="grid gap-6 py-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <h2 className="editorial-title text-5xl sm:text-6xl">Quests</h2>
              <p className="mt-4 max-w-md text-base leading-7 text-[#3a3a3a]">
                A quest is a bigger goal that takes more than one day. Break it
                into small steps, finish the steps one by one, and earn progress
                as the goal moves forward.
              </p>

              {state.quests.length === 0 ? (
                <div className="mt-8 rounded-3xl bg-[#f5f0e0] p-6">
                  <p className="quiet-label text-[#6a6a6a]">First quest</p>
                  <h3 className="editorial-heading mt-3 text-3xl">
                    Start with one bigger goal.
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#3a3a3a]">
                    Example: “Learn basic Spanish” with steps like “Finish
                    lesson 1,” “Practice three days,” and “Have one short
                    conversation.”
                  </p>
                  <div className="mt-5 grid gap-2 text-sm text-[#3a3a3a]">
                    <p>
                      <span className="font-semibold">Goal:</span> what you want
                      to finish.
                    </p>
                    <p>
                      <span className="font-semibold">Steps:</span> the small
                      pieces you can mark done.
                    </p>
                    <p>
                      <span className="font-semibold">Progress:</span> each done
                      step grows one life area.
                    </p>
                  </div>
                </div>
              ) : null}

              <form
                className="mt-8 grid gap-4 rounded-2xl border border-[#e5e5e5] bg-[#fffaf0] p-5"
                onSubmit={addQuest}
              >
                <label className="space-y-2">
                  <span className="text-sm font-semibold">Quest name</span>
                  <input
                    className="h-12 w-full rounded-xl border border-[#e5e5e5] bg-[#fffaf0] px-4 text-sm outline-none transition placeholder:text-[#9a9a9a] focus:border-[#0a0a0a]"
                    onChange={(event) => setQuestTitle(event.target.value)}
                    placeholder="Example: Learn basic Spanish"
                    value={questTitle}
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold">Life area</span>
                  <select
                    className="h-12 w-full appearance-none rounded-xl border border-[#e5e5e5] bg-[#fffaf0] px-4 text-sm outline-none transition focus:border-[#0a0a0a]"
                    onChange={(event) =>
                      setQuestStat(event.target.value as StatName)
                    }
                    value={questStat}
                  >
                    {STAT_NAMES.map((stat) => (
                      <option key={stat}>{stat}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold">
                    Milestones, one per line
                  </span>
                  <textarea
                    className="min-h-32 w-full rounded-xl border border-[#e5e5e5] bg-[#fffaf0] px-4 py-3 text-sm outline-none transition placeholder:text-[#9a9a9a] focus:border-[#0a0a0a]"
                    onChange={(event) => setQuestMilestones(event.target.value)}
                    placeholder={"Finish lesson 1\nPractice three days\nHave one short conversation"}
                    value={questMilestones}
                  />
                </label>

                <button className="button-primary h-12 rounded-xl px-5 text-sm font-semibold">
                  Create quest
                </button>
              </form>
            </div>

            <div className="grid content-start gap-4">
              {state.quests.length === 0 ? (
                <div className="rounded-3xl bg-[#1a3a3a] p-8 text-white">
                  <p className="quiet-label text-white/65">Preview</p>
                  <h3 className="editorial-heading mt-3 text-3xl">
                    Your quest will appear here.
                  </h3>
                  <div className="mt-6 grid gap-3">
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-sm font-semibold">Learn basic Spanish</p>
                      <div className="mt-3 h-2 rounded-full bg-white/20">
                        <div className="h-full w-1/3 rounded-full bg-white" />
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4 text-sm text-white/75">
                      Finish lesson 1
                    </div>
                  </div>
                </div>
              ) : null}

              {state.quests.map((quest) => {
                const completed = quest.milestones.filter(
                  (milestone) => milestone.completed,
                ).length;
                const progress = Math.round(
                  (completed / quest.milestones.length) * 100,
                );

                return (
                  <article
                    className={`rounded-3xl p-5 ${STAT_CARD_CLASSES[quest.stat]}`}
                    key={quest.id}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold opacity-75">
                          {quest.stat} quest
                        </p>
                        <h3 className="mt-1 text-2xl font-semibold">
                          {quest.title}
                        </h3>
                        <p className="mt-2 text-sm opacity-75">
                          {completed}/{quest.milestones.length} steps complete
                        </p>
                      </div>
                      <button
                        className="h-10 rounded-xl bg-white/25 px-4 text-sm font-semibold"
                        onClick={() => deleteQuest(quest.id)}
                      >
                        Delete
                      </button>
                    </div>

                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/25">
                      <div
                        className="h-full rounded-full bg-white"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="mt-5 grid gap-2">
                      {quest.milestones.map((milestone) => (
                        <div
                          className="flex items-center justify-between gap-3 rounded-2xl bg-white/20 p-3"
                          key={milestone.id}
                        >
                          <span
                            className={`text-sm font-semibold ${
                              milestone.completed ? "line-through opacity-60" : ""
                            }`}
                          >
                            {milestone.title}
                          </span>
                          <button
                            className="h-9 shrink-0 rounded-xl bg-white px-3 text-sm font-semibold text-[#0a0a0a] disabled:bg-white/30 disabled:text-current"
                            disabled={milestone.completed}
                            onClick={() =>
                              completeQuestMilestone(quest.id, milestone.id)
                            }
                          >
                            {milestone.completed ? "Done" : `+${quest.xp}`}
                          </button>
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        {activeView === "pricing" ? (
          <section className="py-8">
            <div className="mb-8 max-w-3xl">
              <p className="quiet-label text-[#6a6a6a]">Simple pricing</p>
              <h2 className="editorial-title mt-4 text-5xl sm:text-6xl">
                Pick the plan that keeps your progress moving.
              </h2>
              <p className="mt-5 text-base leading-7 text-[#3a3a3a]">
                A classic three-tier setup for solo tracking, premium daily
                systems, and shared accountability.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {[
                {
                  name: "Starter",
                  price: "$0",
                  cadence: "forever",
                  description: "For trying the daily loop and tracking a few habits.",
                  features: [
                    "3 active habits",
                    "Daily completion tracking",
                    "Basic life-area levels",
                    "Local browser storage",
                  ],
                  action: "Start free",
                  featured: false,
                },
                {
                  name: "Premium",
                  price: "$8",
                  cadence: "per month",
                  description: "For a richer system with deeper streaks and planning.",
                  features: [
                    "Unlimited habits",
                    "Advanced streak insights",
                    "Weekly review prompts",
                    "Priority feature access",
                  ],
                  action: "Upgrade to Premium",
                  featured: true,
                },
                {
                  name: "Team",
                  price: "$18",
                  cadence: "per month",
                  description: "For partners, families, or small accountability groups.",
                  features: [
                    "Shared progress boards",
                    "Group milestones",
                    "Private member profiles",
                    "Exportable activity history",
                  ],
                  action: "Create a team",
                  featured: false,
                },
              ].map((plan) => (
                <article
                  className={`relative flex min-h-[30rem] flex-col rounded-2xl p-6 ${
                    plan.featured
                      ? "bg-[#1a3a3a] text-white"
                      : "border border-[#e5e5e5] bg-[#fffaf0] text-[#0a0a0a]"
                  }`}
                  key={plan.name}
                >
                  {plan.featured ? (
                    <span className="absolute right-5 top-5 rounded-full bg-[#e8b94a] px-3 py-1 text-xs font-semibold text-[#0a0a0a]">
                      Popular
                    </span>
                  ) : null}

                  <div>
                    <h3 className="text-2xl font-semibold">{plan.name}</h3>
                    <div className="mt-6 flex items-end gap-2">
                      <span className="editorial-number text-6xl">
                        {plan.price}
                      </span>
                      <span
                        className={`pb-2 text-sm ${
                          plan.featured ? "text-white/65" : "text-[#6a6a6a]"
                        }`}
                      >
                        {plan.cadence}
                      </span>
                    </div>
                    <p
                      className={`mt-5 text-sm leading-6 ${
                        plan.featured ? "text-white/72" : "text-[#3a3a3a]"
                      }`}
                    >
                      {plan.description}
                    </p>
                  </div>

                  <ul className="mt-8 grid gap-3">
                    {plan.features.map((feature) => (
                      <li className="flex items-start gap-3 text-sm" key={feature}>
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-bold ${
                            plan.featured
                              ? "bg-white text-[#1a3a3a]"
                              : "bg-[#f5f0e0] text-[#0a0a0a]"
                          }`}
                        >
                          on
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`mt-auto h-11 rounded-xl px-5 text-sm font-semibold ${
                      plan.featured
                        ? "button-on-dark bg-white text-[#0a0a0a]"
                        : "button-primary"
                    }`}
                  >
                    {plan.action}
                  </button>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {activeView === "profile" ? (
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
        ) : null}

        {activeView !== "pricing" &&
        activeView !== "quests" &&
        activeView !== "profile" ? (
        <section
          className={`grid gap-6 py-6 ${
            activeView === "today" ? "" : "lg:grid-cols-2"
          }`}
        >
          <div className="space-y-6">
            {activeView === "today" ? (
            <section>
              <h2 className="editorial-heading mb-4 text-3xl">
                {editingHabitId ? "Change a daily thing" : "Add a daily thing"}
              </h2>
              <form
                className="grid gap-3 rounded-2xl border border-[#e5e5e5] bg-[#fffaf0] p-5 sm:grid-cols-[1fr_150px_100px_auto]"
                onSubmit={saveHabit}
              >
                <input
                  className="h-12 rounded-xl border border-[#e5e5e5] bg-[#fffaf0] px-4 text-sm outline-none transition placeholder:text-[#9a9a9a] focus:border-[#0a0a0a]"
                  onChange={(event) => setHabitTitle(event.target.value)}
                  placeholder="Example: Take a short walk"
                  value={habitTitle}
                />
                <select
                  className="h-12 appearance-none rounded-xl border border-[#e5e5e5] bg-[#fffaf0] px-4 text-sm outline-none transition focus:border-[#0a0a0a]"
                  onChange={(event) => setHabitStat(event.target.value as StatName)}
                  value={habitStat}
                >
                  {STAT_NAMES.map((stat) => (
                    <option key={stat}>{stat}</option>
                  ))}
                </select>
                <input
                  className="h-12 rounded-xl border border-[#e5e5e5] bg-[#fffaf0] px-4 text-sm outline-none transition placeholder:text-[#9a9a9a] focus:border-[#0a0a0a]"
                  inputMode="numeric"
                  placeholder="20"
                  onChange={(event) => setHabitXp(event.target.value)}
                  value={habitXp}
                />
                <button className="button-primary h-12 rounded-xl px-5 text-sm font-semibold">
                  {editingHabitId ? "Save" : "Add"}
                </button>
                {editingHabitId ? (
                  <button
                    className="button-secondary h-12 rounded-xl border border-[#e5e5e5] bg-[#fffaf0] px-5 text-sm font-semibold text-[#1a1a1a] sm:col-start-4"
                    onClick={cancelEditingHabit}
                    type="button"
                  >
                    Cancel
                  </button>
                ) : null}
              </form>
            </section>
            ) : null}

            {activeView === "progress" ? (
              <section>
                <h2 className="editorial-heading mb-4 text-3xl">
                  Character snapshot
                </h2>
                <div className="grid gap-3">
                  <div className="rounded-2xl bg-[#ffb084] p-5">
                    <p className="text-sm text-[#3a3a3a]">Life experience</p>
                    <p className="editorial-number mt-2 text-4xl">
                      {state.profile.age}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#b8a4ed] p-5">
                    <p className="text-sm text-[#3a3a3a]">Growth level</p>
                    <p className="editorial-number mt-2 text-4xl">
                      {overallLevel}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#e8b94a] p-5">
                    <p className="text-sm text-[#3a3a3a]">Progress today</p>
                    <p className="editorial-number mt-2 text-4xl">{xpToday}</p>
                  </div>
                </div>
              </section>
            ) : null}

            {activeView === "activity" ? (
              <section>
                <h2 className="editorial-heading mb-4 text-3xl">Milestones</h2>
                <div className="rounded-2xl bg-[#f5f0e0] p-5">
                  {state.achievements.length ? (
                    <div className="flex flex-wrap gap-2">
                      {state.achievements.map((achievement) => (
                        <span
                          className="rounded-full bg-[#fffaf0] px-4 py-1.5 text-sm font-semibold text-[#0a0a0a]"
                          key={achievement}
                        >
                          {achievement}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#6a6a6a]">
                      Finish one thing today to unlock your first milestone.
                    </p>
                  )}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-6">
            {activeView === "progress" ? (
            <section>
              <h2 className="editorial-heading mb-4 text-3xl">Life areas</h2>
              <div className="grid gap-3">
                {STAT_NAMES.map((statName) => {
                  const stat = state.stats[statName];
                  const level = levelFromXp(stat.xp);
                  const progress = progressToNextLevel(stat.xp);

                  return (
                    <article
                      className="rounded-2xl border border-[#e5e5e5] bg-[#fffaf0] p-5"
                      key={stat.name}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-[#1a1a1a]">{stat.name}</h3>
                        <span className="rounded-full bg-[#f5f0e0] px-3 py-1 text-sm font-semibold text-[#3a3a3a]">
                          Level {level}
                        </span>
                      </div>
                      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#ebe6d6]">
                        <div
                          className={`h-full rounded-full ${STAT_PROGRESS_CLASSES[stat.name]}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="mt-3 text-sm text-[#6a6a6a]">
                        {stat.xp} progress / {100 - progress} to next level
                      </p>
                    </article>
                  );
                })}
              </div>
            </section>
            ) : null}

            {activeView === "activity" ? (
            <section>
              <h2 className="editorial-heading mb-4 text-3xl">Recent wins</h2>
              <div className="rounded-2xl border border-[#e5e5e5] bg-[#fffaf0] p-5">
                {state.activity.length ? (
                  <div className="space-y-4">
                    {state.activity.map((item) => (
                      <div
                        className="border-b border-[#e5e5e5] pb-3 last:border-0 last:pb-0"
                        key={item.id}
                      >
                        <p className="text-sm font-semibold text-[#1a1a1a]">
                          {item.text}
                        </p>
                        <p className="mt-1 text-xs text-[#6a6a6a]">
                          +{item.xp} {item.stat} progress
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#6a6a6a]">
                    Things you finish will appear here.
                  </p>
                )}
              </div>
            </section>
            ) : null}
          </aside>
        </section>
        ) : null}
      </div>
    </main>
  );
}
