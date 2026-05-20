"use client";

import {
  AppState,
  WorkoutTemplate,
  Exercise,
  ActiveWorkoutSession,
  STAT_CARD_CLASSES,
  STAT_PROGRESS_CLASSES,
} from "../../lib/types";
import { useWorkoutTimer } from "../../hooks/useWorkoutTimer";

interface WorkoutViewProps {
  state: AppState;
  celebratingWorkoutId: string | null;
  onStartSession: (workoutId: string) => void;
  onToggleExercise: (exerciseId: string) => void;
  onFinishSession: (workoutId: string) => void;
  onCancelSession: () => void;
}

const DARK_CARD = "rounded-3xl bg-[#141414] border border-white/5";
const DARK_CARD_INNER = "rounded-2xl bg-[#1a1a1a] border border-white/5";
const ACCENT = "#ff4d8b";
const GOLD = "#e8b94a";

function RestTimer() {
  const { formatted, isRunning, isComplete, start, secondsLeft } = useWorkoutTimer(60);

  if (isComplete) {
    return (
      <div className="rounded-xl bg-[#a4d4c5]/20 border border-[#a4d4c5]/30 px-4 py-3 text-center text-sm font-semibold text-[#a4d4c5]">
        Rest complete
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[#1a1a1a] border border-[#e8b94a]/20 px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[#e8b94a]">Rest</span>
        <span className="text-2xl font-bold tabular-nums text-[#e8b94a]">
          {formatted}
        </span>
      </div>
      {!isRunning && (
        <button
          className="mt-2 h-9 rounded-lg bg-[#e8b94a] px-4 text-xs font-semibold text-[#0a0a0a] hover:bg-[#d4a83e] transition-colors"
          onClick={start}
          type="button"
        >
          Start rest timer
        </button>
      )}
      {isRunning && (
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e8b94a]/10">
          <div
            className="h-full rounded-full bg-[#e8b94a] transition-all duration-1000"
            style={{
              width: `${((60 - secondsLeft) / 60) * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}

function ExerciseRow({
  exercise,
  completed,
  onToggle,
  index,
}: {
  exercise: Exercise;
  completed: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <div
      className={`flex items-center gap-4 rounded-2xl p-4 border transition-all duration-300 ${
        completed
          ? "bg-[#ff4d8b]/5 border-[#ff4d8b]/20"
          : "bg-[#1a1a1a] border-white/5 hover:border-white/10"
      }`}
    >
      <button
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
          completed
            ? "border-[#ff4d8b] bg-[#ff4d8b] text-[#0a0a0a]"
            : "border-white/20 bg-transparent text-transparent hover:border-[#ff4d8b]/60"
        }`}
        onClick={onToggle}
        type="button"
        aria-label={completed ? "Mark incomplete" : "Mark complete"}
      >
        {completed ? (
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : null}
      </button>
      <div className="min-w-0 flex-1">
        <h4
          className={`font-semibold ${
            completed ? "text-white/40 line-through" : "text-white"
          }`}
        >
          {exercise.name}
        </h4>
        <p className="mt-0.5 text-sm text-white/40">
          {exercise.sets} sets x {exercise.reps}
        </p>
      </div>
      <span className="text-xs font-semibold text-white/20">
        {String(index + 1).padStart(2, "0")}
      </span>
    </div>
  );
}

function ActiveSessionView({
  workout,
  session,
  onToggleExercise,
  onFinishSession,
  onCancelSession,
}: {
  workout: WorkoutTemplate;
  session: ActiveWorkoutSession;
  onToggleExercise: (exerciseId: string) => void;
  onFinishSession: (workoutId: string) => void;
  onCancelSession: () => void;
}) {
  const completedCount = session.completedExerciseIds.length;
  const totalCount = workout.exercises.length;
  const allDone = completedCount === totalCount;
  const lastCompleted =
    completedCount > 0
      ? session.completedExerciseIds[session.completedExerciseIds.length - 1]
      : null;

  return (
    <section className="py-8">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
        {/* Left panel - Stats */}
        <div className={`${DARK_CARD} p-6 sm:p-8`}>
          <p className="text-xs font-bold tracking-wider text-[#ff4d8b] uppercase">
            Active Workout
          </p>
          <h2 className="editorial-title mt-4 text-5xl sm:text-6xl text-white">
            {workout.title}
          </h2>
          <p className="mt-5 max-w-sm text-base leading-7 text-white/50">
            Check off each exercise as you finish it. Tap the rest timer
            between sets.
          </p>

          <div className="mt-10 ${DARK_CARD_INNER} p-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-white/40">Exercises done</p>
                <p className="editorial-number mt-2 text-5xl text-white">
                  {completedCount}/{totalCount}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/40">Reward</p>
                <p className="editorial-number mt-2 text-4xl text-[#ff4d8b]">
                  +{workout.xp}
                </p>
              </div>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-[#ff4d8b] transition-all"
                style={{
                  width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              className="flex-1 rounded-xl border border-white/10 bg-transparent py-3 text-sm font-semibold text-white/60 hover:bg-white/5 transition-colors"
              onClick={onCancelSession}
              type="button"
            >
              Cancel
            </button>
            {allDone ? (
              <button
                className="flex-1 rounded-xl bg-[#ff4d8b] py-3 text-sm font-semibold text-[#0a0a0a] hover:bg-[#ff6b5a] transition-colors"
                onClick={() => onFinishSession(workout.id)}
                type="button"
              >
                Finish Workout
              </button>
            ) : null}
          </div>
        </div>

        {/* Right panel - Exercise list */}
        <div className={`${DARK_CARD} p-6 text-white sm:p-8`}>
          <div>
            <h3 className="editorial-heading text-3xl text-white">
              Exercises
            </h3>
            <p className="mt-2 text-sm leading-6 text-white/40">
              Tap the circle to mark each exercise complete.
            </p>
          </div>

          <div className="mt-6 grid gap-3">
            {workout.exercises.map((exercise, index) => {
              const completed = session.completedExerciseIds.includes(
                exercise.id,
              );
              const isLastCompleted = lastCompleted === exercise.id;

              return (
                <div key={exercise.id} className="space-y-2">
                  <ExerciseRow
                    exercise={exercise}
                    completed={completed}
                    onToggle={() => onToggleExercise(exercise.id)}
                    index={index}
                  />
                  {isLastCompleted && !allDone ? <RestTimer /> : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function TemplateCard({
  workout,
  onStart,
}: {
  workout: WorkoutTemplate;
  onStart: () => void;
}) {
  return (
    <article
      className={`${DARK_CARD_INNER} p-5 transition-all hover:border-[#ff4d8b]/30 hover:bg-[#1f1f1f]`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-white">{workout.title}</h3>
          <p className="mt-1 text-sm text-white/40">
            {workout.exercises.length} exercises ·{" "}
            <span className="text-[#ff4d8b]">{workout.xp} XP</span>
          </p>
        </div>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${STAT_CARD_CLASSES[workout.stat]}`}
        >
          {workout.streak > 0 ? workout.streak : "·"}
        </span>
      </div>
      <div className="mt-4 space-y-2">
        {workout.exercises.slice(0, 3).map((exercise) => (
          <div
            key={exercise.id}
            className="flex items-center gap-2 text-sm text-white/50"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${STAT_PROGRESS_CLASSES[workout.stat]}`}
            />
            {exercise.name} ({exercise.sets}x{exercise.reps})
          </div>
        ))}
        {workout.exercises.length > 3 ? (
          <p className="text-xs text-white/30">
            +{workout.exercises.length - 3} more
          </p>
        ) : null}
      </div>
      <button
        className="mt-5 h-10 w-full rounded-xl bg-[#ff4d8b] text-sm font-semibold text-[#0a0a0a] hover:bg-[#ff6b5a] transition-colors"
        onClick={onStart}
        type="button"
      >
        Start Workout
      </button>
    </article>
  );
}

function TemplateSelectionView({
  workouts,
  onStart,
}: {
  workouts: WorkoutTemplate[];
  onStart: (workoutId: string) => void;
}) {
  const bestStreak = Math.max(...workouts.map((w) => w.streak), 0);

  return (
    <section className="py-8">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
        {/* Left panel - Overview */}
        <div className={`${DARK_CARD} p-6 sm:p-8`}>
          <p className="text-xs font-bold tracking-wider text-[#ff4d8b] uppercase">
            Workouts
          </p>
          <h2 className="editorial-title mt-4 text-6xl sm:text-7xl text-white">
            Train
          </h2>
          <p className="mt-5 max-w-sm text-base leading-7 text-white/50">
            Pick a routine and track your sets. Every finished workout earns
            Health progress.
          </p>

          <div className={`mt-10 ${DARK_CARD_INNER} p-5`}>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-white/40">Best streak</p>
                <p className="editorial-number mt-2 text-5xl text-white">
                  {bestStreak}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/40">Routines</p>
                <p className="editorial-number mt-2 text-4xl text-white">
                  {workouts.length}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-[#ff4d8b]/20 bg-[#ff4d8b]/5 p-4">
            <p className="text-sm text-white/60">
              <span className="font-semibold text-[#ff4d8b]">Tip:</span> Tap
              the circle on each exercise as you finish it. Rest timer appears
              after each completion.
            </p>
          </div>
        </div>

        {/* Right panel - Workout list */}
        <div className={`${DARK_CARD} p-6 text-white sm:p-8`}>
          <div>
            <h3 className="editorial-heading text-3xl text-white">
              Your routines
            </h3>
            <p className="mt-2 text-sm leading-6 text-white/40">
              Tap a workout to begin.
            </p>
          </div>

          <div className="mt-6 grid gap-4">
            {workouts.length === 0 ? (
              <div className="rounded-2xl bg-white/5 p-6 border border-white/5">
                <h3 className="font-semibold text-white">No workouts yet.</h3>
                <p className="mt-2 text-sm leading-6 text-white/40">
                  Workouts will appear here once added.
                </p>
              </div>
            ) : null}

            {workouts.map((workout) => (
              <TemplateCard
                key={workout.id}
                workout={workout}
                onStart={() => onStart(workout.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function WorkoutView({
  state,
  celebratingWorkoutId,
  onStartSession,
  onToggleExercise,
  onFinishSession,
  onCancelSession,
}: WorkoutViewProps) {
  if (state.activeSession) {
    const workout = state.workouts.find(
      (w) => w.id === state.activeSession!.workoutId,
    );
    if (!workout) {
      onCancelSession();
      return null;
    }

    return (
      <ActiveSessionView
        workout={workout}
        session={state.activeSession}
        onToggleExercise={onToggleExercise}
        onFinishSession={onFinishSession}
        onCancelSession={onCancelSession}
      />
    );
  }

  return (
    <TemplateSelectionView
      workouts={state.workouts}
      onStart={onStartSession}
    />
  );
}
