import { AppState } from "../../lib/types";
import { ACHIEVEMENT_DEFS } from "../../lib/achievements";

interface AchievementsViewProps {
  state: AppState;
}

export function AchievementsView({ state }: AchievementsViewProps) {
  const total = ACHIEVEMENT_DEFS.length;
  const unlockedCount = state.achievements.length;

  return (
    <section className="py-8">
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <p className="quiet-label text-[#6a6a6a]">Accomplishments</p>
          <h2 className="editorial-title mt-2 text-5xl sm:text-6xl">Badges</h2>
          <p className="mt-4 max-w-md text-base leading-7 text-[#3a3a3a]">
            Complete habits, quests, and workouts to unlock badges. Keep your
            streaks alive to earn more.
          </p>

          <div className="mt-8 rounded-3xl bg-[#f5f0e0] p-6">
            <p className="quiet-label text-[#6a6a6a]">Progress</p>
            <p className="editorial-number mt-3 text-5xl">
              {unlockedCount}
              <span className="text-3xl text-[#9a9a9a]">/{total}</span>
            </p>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#ebe6d6]">
              <div
                className="h-full rounded-full bg-[#0a0a0a] transition-all"
                style={{
                  width: `${total ? Math.round((unlockedCount / total) * 100) : 0}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid content-start gap-4 sm:grid-cols-2">
          {ACHIEVEMENT_DEFS.map((def) => {
            const unlocked = state.achievements.includes(def.id);
            const progress = def.getProgress(state);
            const safeMax = def.maxProgress > 0 ? def.maxProgress : 1;
            const pct = Math.min(
              100,
              Math.round((progress / safeMax) * 100),
            );

            return (
              <article
                key={def.id}
                className={`flex flex-col rounded-2xl border p-5 transition-all ${
                  unlocked
                    ? "border-transparent bg-[#fffaf0] shadow-sm"
                    : "border-[#e5e5e5] bg-[#faf5e8]/60 opacity-70"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${
                        unlocked ? "bg-white shadow-sm" : "bg-[#ebe6d6]"
                      }`}
                      style={
                        unlocked ? { border: `2px solid ${def.color}` } : undefined
                      }
                    >
                      {unlocked ? def.icon : "🔒"}
                    </span>
                    <div>
                      <h3 className="font-semibold text-[#1a1a1a]">
                        {def.title}
                      </h3>
                      <p className="mt-0.5 text-sm text-[#6a6a6a]">
                        {def.description}
                      </p>
                    </div>
                  </div>
                  {unlocked ? (
                    <span
                      className="shrink-0 rounded-full px-2.5 py-1 text-xs font-bold text-white"
                      style={{ backgroundColor: def.color }}
                    >
                      Done
                    </span>
                  ) : null}
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#6a6a6a]">
                    <span>{unlocked ? "Complete" : "Progress"}</span>
                    <span>
                      {progress} / {def.maxProgress}
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#ebe6d6]">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: def.color,
                      }}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
