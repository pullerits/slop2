import { AppState } from "../../lib/types";

interface ActivityViewProps {
  state: AppState;
}

export function ActivityViewLeft({ state }: ActivityViewProps) {
  return (
    <section>
      <h2 className="editorial-heading mb-4 text-3xl">Milestones</h2>
      <div className="rounded-2xl bg-[#f5f0e0] p-5">
        {state.achievements.length ? (
          <div className="flex flex-wrap gap-2">
            {state.achievements.map((achievement) => (
              <span
                className="rounded-full bg-[#fffaf0] px-4 py-1.5 text-sm font-semibold text-[#0a0a0a]"
                key={achievement}
              >
                {achievement}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#6a6a6a]">
            Finish one thing today to unlock your first milestone.
          </p>
        )}
      </div>
    </section>
  );
}

export function ActivityViewRight({ state }: ActivityViewProps) {
  return (
    <section>
      <h2 className="editorial-heading mb-4 text-3xl">Recent wins</h2>
      <div className="rounded-2xl border border-[#e5e5e5] bg-[#fffaf0] p-5">
        {state.activity.length ? (
          <div className="space-y-4">
            {state.activity.map((item) => (
              <div
                className="border-b border-[#e5e5e5] pb-3 last:border-0 last:pb-0"
                key={item.id}
              >
                <p className="text-sm font-semibold text-[#1a1a1a]">
                  {item.text}
                </p>
                <p className="mt-1 text-xs text-[#6a6a6a]">
                  +{item.xp} {item.stat} progress
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#6a6a6a]">
            Things you finish will appear here.
          </p>
        )}
      </div>
    </section>
  );
}
