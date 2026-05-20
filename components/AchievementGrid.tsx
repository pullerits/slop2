import { AppState } from "../lib/types";
import { ACHIEVEMENT_DEFS } from "../lib/achievements";

interface AchievementGridProps {
  state: AppState;
}

export function AchievementGrid({ state }: AchievementGridProps) {
  return (
    <section className="py-8">
      <div className="mb-6">
        <p className="quiet-label text-[#6a6a6a]">Accomplishments</p>
        <h2 className="editorial-title mt-2 text-4xl sm:text-5xl">Badges</h2>
        <p className="mt-3 max-w-md text-base leading-7 text-[#3a3a3a]">
          Complete habits, quests, and workouts to unlock badges. Keep your streaks alive to earn more.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENT_DEFS.map((def) => {
          const unlocked = state.achievements.includes(def.id);
          const progress = def.getProgress(state);
          const safeMax = def.maxProgress > 0 ? def.maxProgress : 1;
          const pct = Math.min(100, Math.round((progress / safeMax) * 100));

          return (
            <article
              key={def.id}
              className={`relative flex flex-col rounded-2xl border p-5 transition-all ${
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
                    style={unlocked ? { border: `2px solid ${def.color}` } : undefined}
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

              {!unlocked ? (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#6a6a6a]">
                    <span>Progress</span>
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
              ) : (
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#ebe6d6]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: "100%",
                      backgroundColor: def.color,
                    }}
                  />
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
