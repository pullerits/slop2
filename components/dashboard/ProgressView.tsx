import {
  AppState,
  STAT_NAMES,
  STAT_PROGRESS_CLASSES,
} from "../../lib/types";
import { levelFromXp, progressToNextLevel } from "../../lib/utils";

interface ProgressViewProps {
  state: AppState;
  overallLevel: number;
  xpToday: number;
}

export function ProgressViewLeft({
  state,
  overallLevel,
  xpToday,
}: ProgressViewProps) {
  return (
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
  );
}

export function ProgressViewRight({
  state,
}: {
  state: AppState;
}) {
  return (
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
  );
}
