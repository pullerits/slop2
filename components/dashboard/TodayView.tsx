import {
  AppState,
  Habit,
  Quest,
  QuestMilestone,
  ItemKey,
  PendingDelete,
  STAT_CARD_CLASSES,
} from "../../lib/types";
import { todayKey } from "../../lib/utils";
import { XPRing } from "../XPRing";

interface TodayViewProps {
  state: AppState;
  todayLabel: string;
  dayStatus: { dayProgress: number; timeLeft: string };
  completedToday: number;
  xpToday: number;
  dailyProgress: number;
  dailyGoal: number;
  nextQuestSteps: { quest: Quest; milestone: QuestMilestone }[];
  celebratingHabitId: string | null;
  newHabitId: string | null;
  deletingItemKey: ItemKey | null;
  editingHabitId: string | null;
  onCompleteHabit: (id: string) => void;
  onStartEditingHabit: (habit: Habit) => void;
  onRequestDeleteHabit: (id: string, title: string) => void;
  onCompleteQuestMilestone: (questId: string, milestoneId: string) => void;
  onStartWorkoutSession: (workoutId: string) => void;
  onGoToWorkout: () => void;
  itemKey: (kind: PendingDelete["kind"], id: string) => ItemKey;
}

export function TodayView({
  state,
  todayLabel,
  dayStatus,
  completedToday,
  xpToday,
  dailyProgress,
  dailyGoal,
  nextQuestSteps,
  celebratingHabitId,
  newHabitId,
  deletingItemKey,
  editingHabitId,
  onCompleteHabit,
  onStartEditingHabit,
  onRequestDeleteHabit,
  onCompleteQuestMilestone,
  onStartWorkoutSession,
  onGoToWorkout,
  itemKey,
}: TodayViewProps) {
  return (
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
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-[#6a6a6a]">Daily goal</p>
                <p className="editorial-number mt-2 text-5xl">
                  {completedToday}/{state.habits.length}
                </p>
                <p className="mt-1 text-xs text-[#6a6a6a]">habits done</p>
              </div>
              <XPRing current={xpToday} goal={dailyGoal} />
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#ebe6d6]">
              <div
                className="h-full rounded-full bg-[#ff4d8b] transition-all"
                style={{ width: `${Math.min(100, Math.round((xpToday / dailyGoal) * 100))}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-[#6a6a6a]">
              {completedToday === state.habits.length && state.habits.length > 0
                ? "Everything for today is done."
                : "One tap is enough after you finish something."}
            </p>
          </div>

          {state.activeSession ? (
            <div className="mt-4 rounded-2xl bg-[#ff4d8b] p-5 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">Workout in progress</p>
                  <p className="mt-1 text-sm opacity-80">
                    {
                      state.workouts.find(
                        (w) => w.id === state.activeSession!.workoutId,
                      )?.title
                    }
                  </p>
                </div>
                <button
                  className="h-10 rounded-xl bg-white px-4 text-sm font-semibold text-[#ff4d8b]"
                  onClick={onGoToWorkout}
                  type="button"
                >
                  Resume
                </button>
              </div>
            </div>
          ) : state.workouts.length > 0 ? (
            <div className="mt-4 rounded-2xl border border-[#e5e5e5] bg-[#fffaf0] p-5">
              <p className="text-sm font-semibold text-[#3a3a3a]">
                Quick workout
              </p>
              <div className="mt-3 grid gap-2">
                {state.workouts.slice(0, 2).map((workout) => (
                  <button
                    key={workout.id}
                    className="flex items-center justify-between rounded-xl bg-[#f5f0e0] px-4 py-3 text-left text-sm font-semibold text-[#3a3a3a] transition-colors hover:bg-[#ebe6d6]"
                    onClick={() => onStartWorkoutSession(workout.id)}
                    type="button"
                  >
                    <span>{workout.title}</span>
                    <span className="text-xs text-[#6a6a6a]">
                      {workout.xp} XP
                    </span>
                  </button>
                ))}
                <button
                  className="h-10 rounded-xl border border-[#e5e5e5] bg-transparent text-sm font-semibold text-[#6a6a6a] transition-colors hover:bg-[#f5f0e0]"
                  onClick={onGoToWorkout}
                  type="button"
                >
                  See all workouts
                </button>
              </div>
            </div>
          ) : null}
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
              const justCompleted = celebratingHabitId === habit.id;
              const justAdded = newHabitId === habit.id;
              const isDeleting = deletingItemKey === itemKey("habit", habit.id);

              return (
                <article
                  className={`relative overflow-hidden rounded-2xl p-5 ${
                    justCompleted ? "completion-pop" : ""
                  } ${justAdded ? "task-enter" : ""} ${
                    isDeleting ? "task-exit" : ""
                  } ${
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
                        className={`button-on-dark h-10 rounded-xl bg-white px-4 text-sm font-semibold text-[#0a0a0a] disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/45 ${
                          justCompleted ? "done-button-pop" : ""
                        }`}
                        disabled={doneToday}
                        onClick={() => onCompleteHabit(habit.id)}
                      >
                        {doneToday ? (
                          <span className="inline-flex items-center gap-2">
                            <span
                              aria-hidden="true"
                              className="completion-check"
                            />
                            Done
                          </span>
                        ) : (
                          "Done"
                        )}
                      </button>
                      <button
                        className="button-ghost-dark h-10 rounded-xl bg-white/15 px-4 text-sm font-semibold"
                        onClick={() => onStartEditingHabit(habit)}
                      >
                        Edit
                      </button>
                      <button
                        className="button-ghost-dark h-10 rounded-xl bg-white/15 px-4 text-sm font-semibold"
                        onClick={() =>
                          onRequestDeleteHabit(habit.id, habit.title)
                        }
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
                            onCompleteQuestMilestone(quest.id, milestone.id)
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
  );
}
