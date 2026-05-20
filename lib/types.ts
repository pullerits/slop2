export type StatName = "Health" | "Knowledge" | "Career" | "Social" | "Creativity";

export type Habit = {
  id: string;
  title: string;
  stat: StatName;
  xp: number;
  streak: number;
  lastCompletedDate?: string;
  completedDates?: string[];
};

export type QuestMilestone = {
  id: string;
  title: string;
  completed: boolean;
};

export type Quest = {
  id: string;
  title: string;
  stat: StatName;
  xp: number;
  milestones: QuestMilestone[];
};

export type Stat = {
  name: StatName;
  xp: number;
};

export type Activity = {
  id: string;
  text: string;
  date: string;
  xp: number;
  stat: StatName;
};

export type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: string;
};

export type WorkoutTemplate = {
  id: string;
  title: string;
  stat: StatName;
  xp: number;
  exercises: Exercise[];
  streak: number;
  lastCompletedDate?: string;
  completedDates?: string[];
};

export type ActiveWorkoutSession = {
  workoutId: string;
  startedAt: string;
  completedExerciseIds: string[];
  restEndTime?: string;
};

export type AppState = {
  profile: {
    name: string;
    age: number;
  };
  stats: Record<StatName, Stat>;
  habits: Habit[];
  quests: Quest[];
  workouts: WorkoutTemplate[];
  activeSession: ActiveWorkoutSession | null;
  activity: Activity[];
  achievements: string[];
  dailyGoal: number;
};

export type OnboardingStep = "welcome" | "profile" | "habits";
export type DashboardView =
  | "today"
  | "workout"
  | "quests"
  | "progress"
  | "activity"
  | "calendar"
  | "pricing"
  | "achievements"
  | "profile";
export type PendingDelete =
  | { kind: "habit"; id: string; title: string }
  | { kind: "quest"; id: string; title: string };
export type ItemKey = `habit:${string}` | `quest:${string}`;

export const STORAGE_KEY = "scup:mvp";
export const STAT_NAMES: StatName[] = [
  "Health",
  "Knowledge",
  "Career",
  "Social",
  "Creativity",
];

export const STARTER_HABITS: Array<Pick<Habit, "title" | "stat" | "xp">> = [
  { title: "Take a short walk", stat: "Health", xp: 25 },
  { title: "Read for 10 minutes", stat: "Knowledge", xp: 20 },
  { title: "Finish one important task", stat: "Career", xp: 25 },
  { title: "Call or message someone", stat: "Social", xp: 15 },
  { title: "Make or write something", stat: "Creativity", xp: 20 },
];

export const STARTER_WORKOUTS: Array<Omit<WorkoutTemplate, "id" | "streak">> = [
  {
    title: "Push Day",
    stat: "Health",
    xp: 75,
    exercises: [
      { id: "ex-bench", name: "Bench Press", sets: 3, reps: "10" },
      { id: "ex-overhead", name: "Overhead Press", sets: 3, reps: "10" },
      { id: "ex-dips", name: "Tricep Dips", sets: 3, reps: "12" },
      { id: "ex-flys", name: "Chest Flys", sets: 3, reps: "12" },
    ],
  },
  {
    title: "Quick Cardio",
    stat: "Health",
    xp: 40,
    exercises: [
      { id: "ex-warmup", name: "Warm-up jog", sets: 1, reps: "5 min" },
      { id: "ex-run", name: "Run", sets: 1, reps: "20 min" },
      { id: "ex-cool", name: "Cool-down stretch", sets: 1, reps: "5 min" },
    ],
  },
  {
    title: "Bodyweight Basics",
    stat: "Health",
    xp: 50,
    exercises: [
      { id: "ex-pushup", name: "Push-ups", sets: 3, reps: "15" },
      { id: "ex-squat", name: "Air Squats", sets: 3, reps: "20" },
      { id: "ex-lunge", name: "Lunges", sets: 3, reps: "12 each" },
      { id: "ex-plank", name: "Plank", sets: 3, reps: "45s" },
    ],
  },
];

export const ACHIEVEMENTS = {
  firstHabit: "First thing done",
  threeDayStreak: "Three-day streak",
  firstQuest: "First quest created",
  firstQuestMilestone: "First quest step done",
  levelFive: "Level 5 in a life area",
  firstWorkout: "First workout",
  workoutStreak: "Three workout streak",
};

export const STAT_CARD_CLASSES: Record<StatName, string> = {
  Health: "bg-[#ff4d8b] text-white",
  Knowledge: "bg-[#b8a4ed] text-[#0a0a0a]",
  Career: "bg-[#1a3a3a] text-white",
  Social: "bg-[#ffb084] text-[#0a0a0a]",
  Creativity: "bg-[#e8b94a] text-[#0a0a0a]",
};

export const STAT_PROGRESS_CLASSES: Record<StatName, string> = {
  Health: "bg-[#ff4d8b]",
  Knowledge: "bg-[#b8a4ed]",
  Career: "bg-[#1a3a3a]",
  Social: "bg-[#ffb084]",
  Creativity: "bg-[#e8b94a]",
};
