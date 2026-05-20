"use client";

import { useMemo, useState } from "react";
import {
  AppState,
  Habit,
  WorkoutTemplate,
  STAT_PROGRESS_CLASSES,
} from "../../lib/types";

interface CalendarViewProps {
  state: AppState;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getMonthData(year: number, month: number) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  return { daysInMonth, firstDayOfWeek };
}

export function CalendarView({ state }: CalendarViewProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const { daysInMonth, firstDayOfWeek } = getMonthData(viewYear, viewMonth);

  const monthLabel = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(new Date(viewYear, viewMonth, 1));

  const completionsByDate = useMemo(() => {
    const map = new Map<
      string,
      { habits: Habit[]; workouts: WorkoutTemplate[]; totalXp: number }
    >();

    for (const habit of state.habits) {
      const dates = [...new Set(habit.completedDates || [])];
      for (const date of dates) {
        if (!map.has(date)) {
          map.set(date, { habits: [], workouts: [], totalXp: 0 });
        }
        const entry = map.get(date)!;
        entry.habits.push(habit);
        entry.totalXp += habit.xp;
      }
    }

    for (const workout of state.workouts) {
      const dates = [...new Set(workout.completedDates || [])];
      for (const date of dates) {
        if (!map.has(date)) {
          map.set(date, { habits: [], workouts: [], totalXp: 0 });
        }
        const entry = map.get(date)!;
        entry.workouts.push(workout);
        entry.totalXp += workout.xp;
      }
    }

    return map;
  }, [state]);

  const todayKey = formatDateKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  function goToPreviousMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
    setSelectedDateKey(null);
  }

  function goToNextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
    setSelectedDateKey(null);
  }

  function goToToday() {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setSelectedDateKey(todayKey);
  }

  const selectedData = selectedDateKey
    ? completionsByDate.get(selectedDateKey)
    : null;

  const cells: React.ReactNode[] = [];

  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push(<div key={`empty-${i}`} className="h-12 sm:h-14" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = formatDateKey(viewYear, viewMonth, day);
    const data = completionsByDate.get(dateKey);
    const isToday = dateKey === todayKey;
    const isSelected = dateKey === selectedDateKey;
    const habitCount = data?.habits.length || 0;
    const workoutCount = data?.workouts.length || 0;
    const hasActivity = habitCount + workoutCount > 0;
    const isFuture = dateKey > todayKey;

    cells.push(
      <button
        key={dateKey}
        className={`relative flex h-12 flex-col items-center justify-center rounded-xl text-sm font-semibold transition-all sm:h-14 ${
          isSelected
            ? "bg-[#1a3a3a] text-white"
            : isToday
              ? "bg-[#ff4d8b] text-white"
              : hasActivity
                ? "bg-[#f5f0e0] text-[#0a0a0a] hover:bg-[#ebe6d6]"
                : "bg-[#fffaf0] text-[#3a3a3a] hover:bg-[#f5f0e0]"
        } ${isFuture ? "cursor-default opacity-30" : "cursor-pointer"}`}
        disabled={isFuture}
        onClick={() => setSelectedDateKey(dateKey)}
        type="button"
      >
        <span>{day}</span>
        {hasActivity && !isSelected && !isToday ? (
          <span className="mt-0.5 flex gap-0.5">
            {data!
              .habits.slice(0, 3)
              .map((h, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full ${STAT_PROGRESS_CLASSES[h.stat]}`}
                />
              ))}
            {data!
              .workouts.slice(0, Math.max(0, 4 - habitCount))
              .map((w, i) => (
                <span
                  key={`w-${i}`}
                  className={`h-1.5 w-1.5 rounded-full ${STAT_PROGRESS_CLASSES[w.stat]}`}
                />
              ))}
          </span>
        ) : null}
      </button>,
    );
  }

  return (
    <section className="py-8">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        {/* Left: Calendar */}
        <div className="rounded-3xl bg-[#f5f0e0] p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="quiet-label text-[#6a6a6a]">History</p>
              <h2 className="editorial-title mt-2 text-4xl sm:text-5xl">
                Calendar
              </h2>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between gap-2">
            <button
              className="h-10 rounded-xl border border-[#e5e5e5] bg-[#fffaf0] px-4 text-sm font-semibold text-[#3a3a3a] hover:bg-[#ebe6d6]"
              onClick={goToPreviousMonth}
              type="button"
            >
              Previous
            </button>
            <span className="text-base font-semibold sm:text-lg">
              {monthLabel}
            </span>
            <button
              className="h-10 rounded-xl border border-[#e5e5e5] bg-[#fffaf0] px-4 text-sm font-semibold text-[#3a3a3a] hover:bg-[#ebe6d6]"
              onClick={goToNextMonth}
              type="button"
            >
              Next
            </button>
          </div>

          <button
            className="mt-3 h-9 rounded-lg border border-[#e5e5e5] bg-[#fffaf0] px-3 text-xs font-semibold text-[#6a6a6a] hover:bg-[#ebe6d6]"
            onClick={goToToday}
            type="button"
          >
            Today
          </button>

          <div className="mt-4 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-xs font-semibold text-[#6a6a6a]"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">{cells}</div>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-[#6a6a6a]">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-md bg-[#ff4d8b]" />
              Today
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-md bg-[#1a3a3a]" />
              Selected
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-md border border-[#e5e5e5] bg-[#f5f0e0]" />
              Activity
            </span>
          </div>
        </div>

        {/* Right: Day details */}
        <div className="rounded-3xl bg-[#1a3a3a] p-6 text-white sm:p-8">
          {selectedDateKey ? (
            <>
              <p className="quiet-label text-white/65">
                {new Intl.DateTimeFormat("en", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }).format(parseDateKey(selectedDateKey))}
              </p>
              <h3 className="editorial-heading mt-3 text-3xl">
                {selectedData ? "Day in review" : "Nothing logged"}
              </h3>

              {selectedData ? (
                <div className="mt-6 grid gap-4">
                  {selectedData.habits.length > 0 ? (
                    <div>
                      <p className="mb-3 text-sm font-semibold text-white/70">
                        Habits ({selectedData.habits.length})
                      </p>
                      <div className="grid gap-2">
                        {selectedData.habits.map((habit) => (
                          <div
                            key={habit.id}
                            className="flex items-center justify-between rounded-2xl bg-white/10 p-4"
                          >
                            <div>
                              <p className="font-semibold">{habit.title}</p>
                              <p className="mt-1 text-sm text-white/60">
                                {habit.stat} +{habit.xp} XP
                              </p>
                            </div>
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${STAT_PROGRESS_CLASSES[habit.stat]}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {selectedData.workouts.length > 0 ? (
                    <div
                      className={
                        selectedData.habits.length > 0 ? "mt-2" : ""
                      }
                    >
                      <p className="mb-3 text-sm font-semibold text-white/70">
                        Workouts ({selectedData.workouts.length})
                      </p>
                      <div className="grid gap-2">
                        {selectedData.workouts.map((workout) => (
                          <div
                            key={workout.id}
                            className="flex items-center justify-between rounded-2xl bg-white/10 p-4"
                          >
                            <div>
                              <p className="font-semibold">{workout.title}</p>
                              <p className="mt-1 text-sm text-white/60">
                                {workout.stat} +{workout.xp} XP
                              </p>
                            </div>
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${STAT_PROGRESS_CLASSES[workout.stat]}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-2 rounded-2xl bg-white/10 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Total progress</p>
                      <p className="editorial-number text-2xl">
                        +{selectedData.totalXp}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-6 text-white/60">
                  No habits or workouts were completed on this day.
                </p>
              )}
            </>
          ) : (
            <>
              <p className="quiet-label text-white/65">Select a day</p>
              <h3 className="editorial-heading mt-3 text-3xl">
                Pick a date to see what you did.
              </h3>
              <p className="mt-4 text-sm leading-6 text-white/60">
                Tap any day on the calendar to review your habits and workouts
                from that day.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
