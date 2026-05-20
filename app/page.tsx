"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  AppState,
  DashboardView,
  Habit,
  ItemKey,
  OnboardingStep,
  PendingDelete,
  Quest,
  QuestMilestone,
  StatName,
  STORAGE_KEY,
  STAT_NAMES,
  STARTER_HABITS,
} from "../lib/types";
import {
  createInitialState,
  createStats,
  getDayStatus,
  levelFromXp,
  normalizeState,
  todayKey,
  uid,
  unlock,
  yesterdayKey,
} from "../lib/utils";
import { BrandMark } from "../components/BrandMark";
import { HeroArtifact } from "../components/HeroArtifact";
import { StatPicker } from "../components/StatPicker";
import { DeleteDialog } from "../components/DeleteDialog";
import { HabitForm } from "../components/HabitForm";
import { OnboardingWelcome } from "../components/onboarding/OnboardingWelcome";
import { OnboardingProfile } from "../components/onboarding/OnboardingProfile";
import { OnboardingHabits } from "../components/onboarding/OnboardingHabits";
import { TodayView } from "../components/dashboard/TodayView";
import { QuestsView } from "../components/dashboard/QuestsView";
import { ProgressViewLeft, ProgressViewRight } from "../components/dashboard/ProgressView";
import { ActivityViewLeft, ActivityViewRight } from "../components/dashboard/ActivityView";
import { PricingView } from "../components/dashboard/PricingView";
import { ProfileView } from "../components/dashboard/ProfileView";
import { WorkoutView } from "../components/dashboard/WorkoutView";
import { CalendarView } from "../components/dashboard/CalendarView";
import { AchievementsView } from "../components/dashboard/AchievementsView";
import { ConfettiCanvas } from "../components/ConfettiCanvas";

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
  const [celebratingHabitId, setCelebratingHabitId] = useState<string | null>(
    null,
  );
  const [celebratingMilestoneId, setCelebratingMilestoneId] = useState<
    string | null
  >(null);
  const [celebratingWorkoutId, setCelebratingWorkoutId] = useState<
    string | null
  >(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [newHabitId, setNewHabitId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(
    null,
  );
  const [pendingWorkoutSwitch, setPendingWorkoutSwitch] = useState<string | null>(null);
  const [deletingItemKey, setDeletingItemKey] = useState<ItemKey | null>(null);
  const deleteButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const keepDeleteButtonRef = useRef<HTMLButtonElement | null>(null);

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

  useEffect(() => {
    if (!pendingDelete) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [pendingDelete]);

  useEffect(() => {
    if (!pendingDelete) {
      return;
    }

    const { kind, id } = pendingDelete;
    const frame = window.requestAnimationFrame(() => {
      keepDeleteButtonRef.current?.focus();
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setPendingDelete(null);
        const key = `${kind}:${id}`;
        window.setTimeout(() => {
          deleteButtonRefs.current[key]?.focus();
        }, 0);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [pendingDelete]);

  const confettiFiredToday = useRef<string | null>(null);

  useEffect(() => {
    if (!state) return;
    const allDone =
      state.habits.length > 0 &&
      state.habits.every((h) => h.lastCompletedDate === todayKey());
    if (allDone && confettiFiredToday.current !== todayKey()) {
      confettiFiredToday.current = todayKey();
      setShowConfetti(true);
    }
  }, [state]);

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

    const habitId = uid("habit");

    setState((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        habits: [
          ...current.habits,
          {
            id: habitId,
            title,
            stat: habitStat,
            xp,
            streak: 0,
          },
        ],
      };
    });

    setNewHabitId(habitId);
    window.setTimeout(() => setNewHabitId(null), 800);
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

  function requestDeleteHabit(habitId: string, title: string) {
    setPendingDelete({ kind: "habit", id: habitId, title });
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
        achievements: unlock(current.achievements, "firstQuest"),
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
        "firstQuestMilestone",
      );

      if (levelFromXp(nextStatXp) >= 5) {
        achievements = unlock(achievements, "levelFive");
      }

      const updatedQuests = current.quests.map((item) =>
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
      );

      const thisQuest = updatedQuests.find((q) => q.id === questId);
      if (thisQuest && thisQuest.milestones.every((m) => m.completed)) {
        achievements = unlock(achievements, "questCompleter");
      }

      const updatedStats = {
        ...current.stats,
        [quest.stat]: {
          ...current.stats[quest.stat],
          xp: nextStatXp,
        },
      };
      if (
        Object.values(updatedStats).every((s) => levelFromXp(s.xp) >= 3)
      ) {
        achievements = unlock(achievements, "balancedLife");
      }

      setNotice(`+${quest.xp} progress in ${quest.stat}`);
      setCelebratingMilestoneId(milestoneId);
      window.setTimeout(() => setNotice(""), 1800);
      window.setTimeout(() => setCelebratingMilestoneId(null), 900);

      return {
        ...current,
        stats: updatedStats,
        quests: updatedQuests,
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

  function requestDeleteQuest(questId: string, title: string) {
    setPendingDelete({ kind: "quest", id: questId, title });
  }

  function itemKey(kind: PendingDelete["kind"], id: string): ItemKey {
    return `${kind}:${id}`;
  }

  function focusDeleteTrigger(kind: PendingDelete["kind"], id: string) {
    const key = itemKey(kind, id);
    window.setTimeout(() => {
      deleteButtonRefs.current[key]?.focus();
    }, 0);
  }

  function closeDeleteDialog() {
    if (!pendingDelete) {
      return;
    }

    const { kind, id } = pendingDelete;
    setPendingDelete(null);
    focusDeleteTrigger(kind, id);
  }

  function confirmDelete() {
    if (!pendingDelete) {
      return;
    }

    const deletion = pendingDelete;
    const key = itemKey(deletion.kind, deletion.id);
    setPendingDelete(null);
    setDeletingItemKey(key);

    window.setTimeout(() => {
      if (deletion.kind === "habit") {
        setState((current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            habits: current.habits.filter((habit) => habit.id !== deletion.id),
          };
        });

        if (editingHabitId === deletion.id) {
          cancelEditingHabit();
        }
      } else {
        setState((current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            quests: current.quests.filter((quest) => quest.id !== deletion.id),
          };
        });
      }

      setDeletingItemKey(null);
    }, 260);
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
        "firstHabit",
      );

      if (nextStreak >= 3) {
        achievements = unlock(achievements, "threeDayStreak");
      }

      if (nextStreak >= 7) {
        achievements = unlock(achievements, "sevenDayStreak");
      }

      if (levelFromXp(nextStatXp) >= 5) {
        achievements = unlock(achievements, "levelFive");
      }

      const totalHabitCompletions =
        current.activity.filter(
          (a) =>
            a.text.startsWith("Finished") &&
            !a.text.includes("workout") &&
            !a.text.includes("quest"),
        ).length + 1;
      if (totalHabitCompletions >= 50) {
        achievements = unlock(achievements, "habitMaster");
      }

      const todayXp =
        current.activity
          .filter((a) => a.date.slice(0, 10) === todayKey())
          .reduce((sum, a) => sum + a.xp, 0) + habit.xp;
      if (todayXp >= 100) {
        achievements = unlock(achievements, "xpHundred");
      }

      const updatedHabits = current.habits.map((item) =>
        item.id === habitId
          ? {
              ...item,
              streak: nextStreak,
              lastCompletedDate: todayKey(),
              completedDates: [
                ...(item.completedDates || []),
                todayKey(),
              ],
            }
          : item,
      );

      const allDates = new Set<string>();
      updatedHabits.forEach((h) => {
        (h.completedDates || []).forEach((d) => allDates.add(d));
      });
      const sorted = Array.from(allDates).sort();
      let maxStreak = 0;
      let curStreak = 0;
      let prev: Date | null = null;
      for (const d of sorted) {
        const date = new Date(d);
        const doneCount = updatedHabits.filter((h) =>
          (h.completedDates || []).includes(d),
        ).length;
        if (doneCount === updatedHabits.length) {
          if (prev) {
            const diff =
              (date.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
            if (diff === 1) {
              curStreak++;
            } else {
              curStreak = 1;
            }
          } else {
            curStreak = 1;
          }
          maxStreak = Math.max(maxStreak, curStreak);
          prev = date;
        }
      }
      if (maxStreak >= 7) {
        achievements = unlock(achievements, "perfectWeek");
      }

      const updatedStats = {
        ...current.stats,
        [habit.stat]: {
          ...current.stats[habit.stat],
          xp: nextStatXp,
        },
      };
      if (
        Object.values(updatedStats).every((s) => levelFromXp(s.xp) >= 3)
      ) {
        achievements = unlock(achievements, "balancedLife");
      }

      setNotice(`+${habit.xp} progress in ${habit.stat}`);
      setCelebratingHabitId(habitId);
      window.setTimeout(() => setNotice(""), 1800);
      window.setTimeout(() => setCelebratingHabitId(null), 900);

      return {
        ...current,
        stats: updatedStats,
        habits: updatedHabits,
        activity: [activity, ...current.activity].slice(0, 12),
        achievements,
      };
    });
  }

  function startWorkoutSession(workoutId: string) {
    if (state?.activeSession) {
      setPendingWorkoutSwitch(workoutId);
      return;
    }

    setState((current) => {
      if (!current) return current;
      return {
        ...current,
        activeSession: {
          workoutId,
          startedAt: new Date().toISOString(),
          completedExerciseIds: [],
        },
      };
    });
    setActiveView("workout");
  }

  function confirmWorkoutSwitch() {
    if (!pendingWorkoutSwitch) return;
    const workoutId = pendingWorkoutSwitch;
    setPendingWorkoutSwitch(null);
    setState((current) => {
      if (!current) return current;
      return {
        ...current,
        activeSession: {
          workoutId,
          startedAt: new Date().toISOString(),
          completedExerciseIds: [],
        },
      };
    });
    setActiveView("workout");
  }

  function cancelWorkoutSwitch() {
    setPendingWorkoutSwitch(null);
  }

  function toggleExercise(exerciseId: string) {
    setState((current) => {
      if (!current || !current.activeSession) return current;

      const completed = current.activeSession.completedExerciseIds.includes(
        exerciseId,
      );
      const nextCompletedIds = completed
        ? current.activeSession.completedExerciseIds.filter(
            (id) => id !== exerciseId,
          )
        : [...current.activeSession.completedExerciseIds, exerciseId];

      return {
        ...current,
        activeSession: {
          ...current.activeSession,
          completedExerciseIds: nextCompletedIds,
        },
      };
    });
  }

  function finishWorkoutSession(workoutId: string) {
    const workout = state?.workouts.find((w) => w.id === workoutId);
    if (!workout || workout.lastCompletedDate === todayKey()) {
      return;
    }

    setState((current) => {
      if (!current) return current;

      const freshWorkout = current.workouts.find((w) => w.id === workoutId);
      if (!freshWorkout || freshWorkout.lastCompletedDate === todayKey()) {
        return current;
      }

      const nextStreak =
        freshWorkout.lastCompletedDate === yesterdayKey()
          ? freshWorkout.streak + 1
          : 1;
      const nextStatXp = current.stats[freshWorkout.stat].xp + freshWorkout.xp;
      const activity = {
        id: uid("activity"),
        text: `Finished workout: ${freshWorkout.title}`,
        date: new Date().toISOString(),
        xp: freshWorkout.xp,
        stat: freshWorkout.stat,
      };

      let achievements = unlock(
        current.achievements,
        "firstWorkout",
      );

      if (nextStreak >= 3) {
        achievements = unlock(achievements, "workoutStreak");
      }

      if (levelFromXp(nextStatXp) >= 5) {
        achievements = unlock(achievements, "levelFive");
      }

      const updatedStats = {
        ...current.stats,
        [freshWorkout.stat]: {
          ...current.stats[freshWorkout.stat],
          xp: nextStatXp,
        },
      };
      if (
        Object.values(updatedStats).every((s) => levelFromXp(s.xp) >= 3)
      ) {
        achievements = unlock(achievements, "balancedLife");
      }

      return {
        ...current,
        stats: updatedStats,
        workouts: current.workouts.map((w) =>
          w.id === workoutId
            ? {
                ...w,
                streak: nextStreak,
                lastCompletedDate: todayKey(),
                completedDates: [
                  ...(w.completedDates || []),
                  todayKey(),
                ],
              }
            : w,
        ),
        activeSession: null,
        activity: [activity, ...current.activity].slice(0, 12),
        achievements,
      };
    });

    setNotice(`+${workout.xp} progress in ${workout.stat}`);
    setCelebratingWorkoutId(workoutId);
    window.setTimeout(() => setNotice(""), 1800);
    window.setTimeout(() => setCelebratingWorkoutId(null), 900);
    setActiveView("today");
  }

  function cancelWorkoutSession() {
    setState((current) => {
      if (!current) return current;
      return {
        ...current,
        activeSession: null,
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
    setNewHabitId(null);
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
          <BrandMark name="" onNavigate={() => {}} />
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

            <OnboardingWelcome
              onboardingStep={onboardingStep}
              onNext={() => setOnboardingStep("profile")}
            />

            <OnboardingProfile
              onboardingStep={onboardingStep}
              name={name}
              age={age}
              onNameChange={setName}
              onAgeChange={setAge}
              onBack={() => setOnboardingStep("welcome")}
              onSubmit={goToHabitStep}
            />

            <OnboardingHabits
              onboardingStep={onboardingStep}
              selectedHabits={selectedHabits}
              onToggle={toggleStarterHabit}
              onBack={() => setOnboardingStep("profile")}
              onSubmit={handleOnboarding}
            />
          </div>

          <HeroArtifact />
        </section>
      </main>
    );
  }

  return (
    <main className={`min-h-screen px-5 py-5 pb-24 sm:px-8 sm:pb-5 transition-colors duration-300 ${
      activeView === "workout"
        ? "bg-[#0a0a0a] text-white"
        : "bg-[#fffaf0] text-[#0a0a0a]"
    }`}>
      <div className="mx-auto w-full max-w-6xl">
        <header className="grid min-h-16 grid-cols-3 items-center gap-4 py-2">
          <BrandMark
            name={state.profile.name}
            onNavigate={(view) => setActiveView(view)}
          />
          <div className="text-center text-sm font-semibold">SCUP</div>
          <div className="flex justify-end">
            <button
            className={`button-secondary h-11 rounded-xl border px-4 text-sm font-semibold ${
              activeView === "workout"
                ? "border-white/10 bg-[#1a1a1a] text-white"
                : "border-[#e5e5e5] bg-[#fffaf0] text-[#1a1a1a]"
            }`}
            onClick={resetPrototype}
          >
            Reset
          </button>
          </div>
        </header>

        <nav className={`mt-4 hidden grid-cols-4 gap-1.5 rounded-2xl p-1.5 sm:grid sm:grid-cols-4 md:grid-cols-8 sm:gap-2 sm:p-1 lg:flex lg:flex-row ${
          activeView === "workout" ? "bg-[#1a1a1a]" : "bg-[#f5f0e0]"
        }`}>
          {[
            ["today", "Today"],
            ["workout", "Workout"],
            ["quests", "Quests"],
            ["progress", "Progress"],
            ["activity", "Activity"],
            ["calendar", "Calendar"],
            ["achievements", "Achievements"],
            ["profile", "Profile"],
          ].map(([view, label]) => {
            const isActive = activeView === view;
            const isWorkoutView = activeView === "workout";
            return (
              <button
                className={`h-10 rounded-xl px-3 text-sm font-semibold lg:min-w-28 lg:px-4 transition-colors ${
                  isActive
                    ? isWorkoutView
                      ? "bg-[#ff4d8b] text-[#0a0a0a]"
                      : "bg-[#0a0a0a] text-white"
                    : isWorkoutView
                      ? "text-white/50 hover:bg-white/10"
                      : "text-[#3a3a3a] hover:bg-[#fffaf0]"
                }`}
                key={view}
                onClick={() => setActiveView(view as DashboardView)}
              >
                {label}
              </button>
            );
          })}
        </nav>

        {notice ? (
          <div className="fixed left-1/2 top-5 z-10 -translate-x-1/2 rounded-xl bg-[#0a0a0a] px-5 py-2.5 text-sm font-semibold text-white shadow-xl">
            {notice}
          </div>
        ) : null}

        <ConfettiCanvas
          active={showConfetti}
          onDone={() => setShowConfetti(false)}
        />

        {pendingDelete ? (
          <DeleteDialog
            pendingDelete={pendingDelete}
            onClose={closeDeleteDialog}
            onConfirm={confirmDelete}
            keepRef={keepDeleteButtonRef}
            deleteRefs={deleteButtonRefs}
            itemKey={itemKey}
          />
        ) : null}

        {pendingWorkoutSwitch ? (
          <div
            className="confirm-backdrop fixed inset-0 z-50 flex items-end justify-center bg-[rgba(10,10,10,0.42)] px-4 py-6 sm:items-center"
            onClick={cancelWorkoutSwitch}
          >
            <div
              className="confirm-dialog w-full max-w-md rounded-[28px] bg-[#fffaf0] p-6 text-[#0a0a0a] shadow-[0_32px_80px_rgba(10,10,10,0.24)] sm:p-7"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#ff4d8b]/10 text-xl">
                  !
                </div>
                <div>
                  <p className="quiet-label text-[#6a6a6a]">Active workout</p>
                  <h3 className="editorial-heading mt-2 text-3xl leading-none">
                    Switch workout?
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#3a3a3a]">
                    You already have a workout in progress. Starting a new one
                    will cancel your current session.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  className="button-secondary h-11 rounded-xl border border-[#e5e5e5] bg-[#fffaf0] px-4 text-sm font-semibold"
                  onClick={cancelWorkoutSwitch}
                  type="button"
                >
                  Keep current
                </button>
                <button
                  className="h-11 rounded-xl bg-[#ff4d8b] px-4 text-sm font-semibold text-white hover:bg-[#ff6b5a]"
                  onClick={confirmWorkoutSwitch}
                  type="button"
                >
                  Switch
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {activeView === "today" ? (
          <TodayView
            state={state}
            todayLabel={todayLabel}
            dayStatus={dayStatus}
            completedToday={completedToday}
            xpToday={xpToday}
            dailyProgress={dailyProgress}
            dailyGoal={state.dailyGoal}
            nextQuestSteps={nextQuestSteps}
            celebratingHabitId={celebratingHabitId}
            newHabitId={newHabitId}
            deletingItemKey={deletingItemKey}
            editingHabitId={editingHabitId}
            onCompleteHabit={completeHabit}
            onStartEditingHabit={startEditingHabit}
            onRequestDeleteHabit={requestDeleteHabit}
            onCompleteQuestMilestone={completeQuestMilestone}
            onStartWorkoutSession={startWorkoutSession}
            onGoToWorkout={() => setActiveView("workout")}
            itemKey={itemKey}
          />
        ) : null}

        {activeView === "workout" ? (
          <WorkoutView
            state={state}
            celebratingWorkoutId={celebratingWorkoutId}
            onStartSession={startWorkoutSession}
            onToggleExercise={toggleExercise}
            onFinishSession={finishWorkoutSession}
            onCancelSession={cancelWorkoutSession}
          />
        ) : null}

        {activeView === "quests" ? (
          <QuestsView
            state={state}
            questTitle={questTitle}
            questStat={questStat}
            questMilestones={questMilestones}
            deletingItemKey={deletingItemKey}
            celebratingMilestoneId={celebratingMilestoneId}
            onQuestTitleChange={setQuestTitle}
            onQuestStatChange={setQuestStat}
            onQuestMilestonesChange={setQuestMilestones}
            onAddQuest={addQuest}
            onCompleteMilestone={completeQuestMilestone}
            onRequestDeleteQuest={requestDeleteQuest}
            deleteRefs={deleteButtonRefs}
            itemKey={itemKey}
          />
        ) : null}

        {activeView === "achievements" ? (
          <AchievementsView state={state} />
        ) : null}

        {activeView === "pricing" ? (
          <PricingView />
        ) : null}

        {activeView === "profile" ? (
          <ProfileView
            state={state}
            overallLevel={overallLevel}
            dailyProgress={dailyProgress}
            xpToday={xpToday}
          />
        ) : null}

        {activeView === "calendar" ? (
          <CalendarView state={state} />
        ) : null}

        {activeView !== "achievements" &&
        activeView !== "pricing" &&
        activeView !== "workout" &&
        activeView !== "quests" &&
        activeView !== "profile" &&
        activeView !== "calendar" ? (
        <section
          className={`grid gap-6 py-6 ${
            activeView === "today" ? "" : "lg:grid-cols-2"
          }`}
        >
          <div className="space-y-6">
            {activeView === "today" ? (
              <HabitForm
                editingHabitId={editingHabitId}
                habitTitle={habitTitle}
                habitStat={habitStat}
                habitXp={habitXp}
                onTitleChange={setHabitTitle}
                onStatChange={setHabitStat}
                onXpChange={setHabitXp}
                onSave={saveHabit}
                onCancel={cancelEditingHabit}
              />
            ) : null}

            {activeView === "progress" ? (
              <ProgressViewLeft
                state={state}
                overallLevel={overallLevel}
                xpToday={xpToday}
              />
            ) : null}

            {activeView === "activity" ? (
              <ActivityViewLeft state={state} />
            ) : null}
          </div>

          <aside className="space-y-6">
            {activeView === "progress" ? (
              <ProgressViewRight state={state} />
            ) : null}

            {activeView === "activity" ? (
              <ActivityViewRight state={state} />
            ) : null}
          </aside>
        </section>
        ) : null}
      </div>

      <nav className={`fixed bottom-0 left-0 right-0 z-40 grid h-16 grid-cols-4 border-t pb-[env(safe-area-inset-bottom)] sm:hidden ${
        activeView === "workout" ? "border-white/10 bg-[#0a0a0a]" : "border-[#e5e5e5] bg-[#fffaf0]"
      }`}>
        {[
          ["today", "Today"],
          ["workout", "Gym"],
          ["quests", "Quests"],
          ["achievements", "Badges"],
        ].map(([view, label]) => {
          const isActive = activeView === view;
          const isWorkoutView = activeView === "workout";
          return (
            <button
              className={`relative flex flex-col items-center justify-end pb-3 text-[11px] font-semibold leading-tight ${
                isActive
                  ? isWorkoutView
                    ? "text-white"
                    : "text-[#0a0a0a]"
                  : isWorkoutView
                    ? "text-white/50"
                    : "text-[#9a9a9a]"
              }`}
              key={view}
              onClick={() => setActiveView(view as DashboardView)}
            >
              <span>{label}</span>
              <span
                className={`mt-1 h-1 w-4 rounded-full ${
                  isActive
                    ? isWorkoutView
                      ? "bg-[#ff4d8b]"
                      : "bg-[#0a0a0a]"
                    : "bg-transparent"
                }`}
              />
            </button>
          );
        })}
      </nav>
    </main>
  );
}
