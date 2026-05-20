import { StatName, Stat, Habit, AppState } from "./types";
import { STAT_NAMES, STARTER_HABITS, STARTER_WORKOUTS } from "./types";

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function yesterdayKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

export function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function levelFromXp(xp: number) {
  return Math.floor(xp / 100) + 1;
}

export function progressToNextLevel(xp: number) {
  return xp % 100;
}

export function getDayStatus(now: Date) {
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

export function createStats(): Record<StatName, Stat> {
  return STAT_NAMES.reduce(
    (stats, name) => ({
      ...stats,
      [name]: { name, xp: 0 },
    }),
    {} as Record<StatName, Stat>,
  );
}

export function createInitialState(name: string, age: number, habitTitles: string[]) {
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
      completedDates: [],
    })),
    quests: [],
    workouts: STARTER_WORKOUTS.map((workout) => ({
      ...workout,
      id: uid("workout"),
      streak: 0,
      completedDates: [],
    })),
    activeSession: null,
    activity: [],
    achievements: [],
    dailyGoal: 150,
  };
}

export function unlock(achievements: string[], achievement: string) {
  return achievements.includes(achievement)
    ? achievements
    : [achievement, ...achievements];
}

const LEGACY_ACHIEVEMENT_MAP: Record<string, string> = {
  "First thing done": "firstHabit",
  "Three-day streak": "threeDayStreak",
  "First quest created": "firstQuest",
  "First quest step done": "firstQuestMilestone",
  "Level 5 in a life area": "levelFive",
  "First workout": "firstWorkout",
  "Three workout streak": "workoutStreak",
};

export function normalizeState(saved: AppState) {
  const workouts =
    saved.workouts ??
    STARTER_WORKOUTS.map((workout) => ({
      ...workout,
      id: uid("workout"),
      streak: 0,
      completedDates: [],
    }));

  const achievements = (saved.achievements || [])
    .map((a) => LEGACY_ACHIEVEMENT_MAP[a] || a)
    .filter(Boolean);

  return {
    ...saved,
    quests: saved.quests ?? [],
    habits: (saved.habits || []).map((h) => ({
      ...h,
      completedDates:
        h.completedDates ?? (h.lastCompletedDate ? [h.lastCompletedDate] : []),
    })),
    workouts: workouts.map((w) => ({
      ...w,
      completedDates:
        w.completedDates ?? (w.lastCompletedDate ? [w.lastCompletedDate] : []),
    })),
    activeSession: saved.activeSession ?? null,
    dailyGoal: saved.dailyGoal ?? 150,
    achievements,
  };
}
