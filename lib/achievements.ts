import { AppState, STAT_NAMES } from "../lib/types";
import { levelFromXp } from "../lib/utils";

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  maxProgress: number;
  getProgress: (state: AppState) => number;
  checkUnlock: (state: AppState) => boolean;
  color: string;
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: "firstHabit",
    title: "First thing done",
    description: "Complete your first daily habit",
    icon: "⭐",
    maxProgress: 1,
    getProgress: (state) =>
      state.activity.filter(
        (a) => a.text.startsWith("Finished") && !a.text.includes("workout") && !a.text.includes("quest"),
      ).length,
    checkUnlock: (state) =>
      state.activity.some(
        (a) => a.text.startsWith("Finished") && !a.text.includes("workout") && !a.text.includes("quest"),
      ),
    color: "#e8b94a",
  },
  {
    id: "threeDayStreak",
    title: "Three-day streak",
    description: "Complete a habit 3 days in a row",
    icon: "🔥",
    maxProgress: 3,
    getProgress: (state) => Math.max(...state.habits.map((h) => h.streak), 0),
    checkUnlock: (state) => state.habits.some((h) => h.streak >= 3),
    color: "#ff6b5a",
  },
  {
    id: "sevenDayStreak",
    title: "Seven-day streak",
    description: "Complete a habit 7 days in a row",
    icon: "🚀",
    maxProgress: 7,
    getProgress: (state) => Math.max(...state.habits.map((h) => h.streak), 0),
    checkUnlock: (state) => state.habits.some((h) => h.streak >= 7),
    color: "#ff4d8b",
  },
  {
    id: "firstQuest",
    title: "First quest created",
    description: "Create your first quest",
    icon: "🗺️",
    maxProgress: 1,
    getProgress: (state) => state.quests.length,
    checkUnlock: (state) => state.quests.length > 0,
    color: "#b8a4ed",
  },
  {
    id: "firstQuestMilestone",
    title: "First quest step done",
    description: "Complete a quest milestone",
    icon: "🎯",
    maxProgress: 1,
    getProgress: (state) =>
      state.activity.filter((a) => a.text.startsWith("Finished quest step")).length,
    checkUnlock: (state) =>
      state.activity.some((a) => a.text.startsWith("Finished quest step")),
    color: "#a4d4c5",
  },
  {
    id: "levelFive",
    title: "Level 5 in a life area",
    description: "Reach level 5 in any stat",
    icon: "📈",
    maxProgress: 5,
    getProgress: (state) =>
      Math.max(...STAT_NAMES.map((s) => levelFromXp(state.stats[s].xp)), 0),
    checkUnlock: (state) =>
      STAT_NAMES.some((s) => levelFromXp(state.stats[s].xp) >= 5),
    color: "#1a3a3a",
  },
  {
    id: "firstWorkout",
    title: "First workout",
    description: "Complete your first workout",
    icon: "💪",
    maxProgress: 1,
    getProgress: (state) =>
      state.activity.filter((a) => a.text.startsWith("Finished workout")).length,
    checkUnlock: (state) =>
      state.activity.some((a) => a.text.startsWith("Finished workout")),
    color: "#ff4d8b",
  },
  {
    id: "workoutStreak",
    title: "Three workout streak",
    description: "Complete workouts 3 days in a row",
    icon: "🏋️",
    maxProgress: 3,
    getProgress: (state) => Math.max(...state.workouts.map((w) => w.streak), 0),
    checkUnlock: (state) => state.workouts.some((w) => w.streak >= 3),
    color: "#ffb084",
  },
  {
    id: "perfectWeek",
    title: "Perfect week",
    description: "Complete all habits for 7 days",
    icon: "🏆",
    maxProgress: 7,
    getProgress: (state) => {
      const habitDates = new Set<string>();
      state.habits.forEach((h) => {
        (h.completedDates || []).forEach((d) => habitDates.add(d));
      });
      // Find longest consecutive streak of days where ALL habits were done
      if (state.habits.length === 0) return 0;
      const sorted = Array.from(habitDates).sort();
      let maxStreak = 0;
      let currentStreak = 0;
      let prevDate: Date | null = null;
      for (const dateStr of sorted) {
        const date = new Date(dateStr);
        const doneCount = state.habits.filter((h) =>
          (h.completedDates || []).includes(dateStr)
        ).length;
        if (doneCount === state.habits.length) {
          if (prevDate) {
            const diff = (date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
            if (diff === 1) {
              currentStreak++;
            } else {
              currentStreak = 1;
            }
          } else {
            currentStreak = 1;
          }
          maxStreak = Math.max(maxStreak, currentStreak);
          prevDate = date;
        }
      }
      return maxStreak;
    },
    checkUnlock: (state) => {
      if (state.habits.length === 0) return false;
      const habitDates = new Set<string>();
      state.habits.forEach((h) => {
        (h.completedDates || []).forEach((d) => habitDates.add(d));
      });
      const sorted = Array.from(habitDates).sort();
      let currentStreak = 0;
      let prevDate: Date | null = null;
      for (const dateStr of sorted) {
        const date = new Date(dateStr);
        const doneCount = state.habits.filter((h) =>
          (h.completedDates || []).includes(dateStr)
        ).length;
        if (doneCount === state.habits.length) {
          if (prevDate) {
            const diff = (date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
            if (diff === 1) {
              currentStreak++;
            } else {
              currentStreak = 1;
            }
          } else {
            currentStreak = 1;
          }
          if (currentStreak >= 7) return true;
          prevDate = date;
        }
      }
      return false;
    },
    color: "#e8b94a",
  },
  {
    id: "habitMaster",
    title: "Habit Master",
    description: "Complete 50 habits total",
    icon: "🧘",
    maxProgress: 50,
    getProgress: (state) =>
      state.activity.filter(
        (a) => a.text.startsWith("Finished") && !a.text.includes("workout") && !a.text.includes("quest"),
      ).length,
    checkUnlock: (state) =>
      state.activity.filter(
        (a) => a.text.startsWith("Finished") && !a.text.includes("workout") && !a.text.includes("quest"),
      ).length >= 50,
    color: "#b8a4ed",
  },
  {
    id: "xpHundred",
    title: "Century",
    description: "Earn 100 XP in a single day",
    icon: "💯",
    maxProgress: 100,
    getProgress: (state) => {
      const byDate = new Map<string, number>();
      state.activity.forEach((a) => {
        const date = a.date.slice(0, 10);
        byDate.set(date, (byDate.get(date) || 0) + a.xp);
      });
      return Math.max(0, ...Array.from(byDate.values()));
    },
    checkUnlock: (state) => {
      const byDate = new Map<string, number>();
      state.activity.forEach((a) => {
        const date = a.date.slice(0, 10);
        byDate.set(date, (byDate.get(date) || 0) + a.xp);
      });
      return Array.from(byDate.values()).some((v) => v >= 100);
    },
    color: "#ff4d8b",
  },
  {
    id: "questCompleter",
    title: "Quest Completer",
    description: "Complete all milestones in a quest",
    icon: "🎖️",
    maxProgress: 1,
    getProgress: (state) =>
      state.quests.filter((q) => q.milestones.every((m) => m.completed)).length,
    checkUnlock: (state) =>
      state.quests.some((q) => q.milestones.every((m) => m.completed)),
    color: "#a4d4c5",
  },
  {
    id: "balancedLife",
    title: "Balanced Life",
    description: "Reach level 3 in all 5 areas",
    icon: "⚖️",
    maxProgress: 5,
    getProgress: (state) =>
      STAT_NAMES.filter((s) => levelFromXp(state.stats[s].xp) >= 3).length,
    checkUnlock: (state) =>
      STAT_NAMES.every((s) => levelFromXp(state.stats[s].xp) >= 3),
    color: "#1a3a3a",
  },
];
