import { FormEvent, RefObject } from "react";
import {
  AppState,
  Quest,
  StatName,
  ItemKey,
  PendingDelete,
  STAT_CARD_CLASSES,
} from "../../lib/types";
import { StatPicker } from "../StatPicker";

interface QuestsViewProps {
  state: AppState;
  questTitle: string;
  questStat: StatName;
  questMilestones: string;
  deletingItemKey: ItemKey | null;
  celebratingMilestoneId: string | null;
  onQuestTitleChange: (value: string) => void;
  onQuestStatChange: (value: StatName) => void;
  onQuestMilestonesChange: (value: string) => void;
  onAddQuest: (event: FormEvent<HTMLFormElement>) => void;
  onCompleteMilestone: (questId: string, milestoneId: string) => void;
  onRequestDeleteQuest: (id: string, title: string) => void;
  deleteRefs: RefObject<Record<string, HTMLButtonElement | null>>;
  itemKey: (kind: PendingDelete["kind"], id: string) => ItemKey;
}

export function QuestsView({
  state,
  questTitle,
  questStat,
  questMilestones,
  deletingItemKey,
  celebratingMilestoneId,
  onQuestTitleChange,
  onQuestStatChange,
  onQuestMilestonesChange,
  onAddQuest,
  onCompleteMilestone,
  onRequestDeleteQuest,
  deleteRefs,
  itemKey,
}: QuestsViewProps) {
  return (
    <section className="grid gap-6 py-8 lg:grid-cols-[0.85fr_1.15fr]">
      <div>
        <h2 className="editorial-title text-5xl sm:text-6xl">Quests</h2>
        <p className="mt-4 max-w-md text-base leading-7 text-[#3a3a3a]">
          A quest is a bigger goal that takes more than one day. Break it
          into small steps, finish the steps one by one, and earn progress
          as the goal moves forward.
        </p>

        {state.quests.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-[#f5f0e0] p-6">
            <p className="quiet-label text-[#6a6a6a]">First quest</p>
            <h3 className="editorial-heading mt-3 text-3xl">
              Start with one bigger goal.
            </h3>
            <p className="mt-3 text-sm leading-6 text-[#3a3a3a]">
              Example: "Learn basic Spanish" with steps like "Finish
              lesson 1," "Practice three days," and "Have one short
              conversation."
            </p>
            <div className="mt-5 grid gap-2 text-sm text-[#3a3a3a]">
              <p>
                <span className="font-semibold">Goal:</span> what you want
                to finish.
              </p>
              <p>
                <span className="font-semibold">Steps:</span> the small
                pieces you can mark done.
              </p>
              <p>
                <span className="font-semibold">Progress:</span> each done
                step grows one life area.
              </p>
            </div>
          </div>
        ) : null}

        <form
          className="mt-8 grid gap-4 rounded-2xl border border-[#e5e5e5] bg-[#fffaf0] p-5"
          onSubmit={onAddQuest}
        >
          <label className="space-y-2">
            <span className="text-sm font-semibold">Quest name</span>
            <input
              className="h-12 w-full rounded-xl border border-[#e5e5e5] bg-[#fffaf0] px-4 text-sm outline-none transition placeholder:text-[#9a9a9a] focus:border-[#0a0a0a]"
              onChange={(event) => onQuestTitleChange(event.target.value)}
              placeholder="Example: Learn basic Spanish"
              value={questTitle}
            />
          </label>

          <StatPicker
            label="Life area"
            onChange={onQuestStatChange}
            value={questStat}
          />

          <label className="space-y-2">
            <span className="text-sm font-semibold">
              Milestones, one per line
            </span>
            <textarea
              className="min-h-32 w-full rounded-xl border border-[#e5e5e5] bg-[#fffaf0] px-4 py-3 text-sm outline-none transition placeholder:text-[#9a9a9a] focus:border-[#0a0a0a]"
              onChange={(event) => onQuestMilestonesChange(event.target.value)}
              placeholder={"Finish lesson 1\nPractice three days\nHave one short conversation"}
              value={questMilestones}
            />
          </label>

          <button className="button-primary h-12 rounded-xl px-5 text-sm font-semibold">
            Create quest
          </button>
        </form>
      </div>

      <div className="grid content-start gap-4">
        {state.quests.length === 0 ? (
          <div className="rounded-3xl bg-[#1a3a3a] p-8 text-white">
            <p className="quiet-label text-white/65">Preview</p>
            <h3 className="editorial-heading mt-3 text-3xl">
              Your quest will appear here.
            </h3>
            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-sm font-semibold">Learn basic Spanish</p>
                <div className="mt-3 h-2 rounded-full bg-white/20">
                  <div className="h-full w-1/3 rounded-full bg-white" />
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 text-sm text-white/75">
                Finish lesson 1
              </div>
            </div>
          </div>
        ) : null}

        {state.quests.map((quest) => {
          const completed = quest.milestones.filter(
            (milestone) => milestone.completed,
          ).length;
          const progress = Math.round(
            (completed / quest.milestones.length) * 100,
          );
          const isDeleting = deletingItemKey === itemKey("quest", quest.id);

          return (
            <article
              className={`rounded-3xl p-5 ${
                isDeleting ? "task-exit" : ""
              } ${STAT_CARD_CLASSES[quest.stat]}`}
              key={quest.id}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold opacity-75">
                    {quest.stat} quest
                  </p>
                  <h3 className="mt-1 text-2xl font-semibold">
                    {quest.title}
                  </h3>
                  <p className="mt-2 text-sm opacity-75">
                    {completed}/{quest.milestones.length} steps complete
                  </p>
                </div>
                <button
                  className="h-10 rounded-xl bg-white/25 px-4 text-sm font-semibold"
                  onClick={() =>
                    onRequestDeleteQuest(quest.id, quest.title)
                  }
                  ref={(node) => {
                    deleteRefs.current[itemKey("quest", quest.id)] = node;
                  }}
                >
                  Delete
                </button>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/25">
                <div
                  className="h-full rounded-full bg-white"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mt-5 grid gap-2">
                {quest.milestones.map((milestone) => {
                  const justCompleted =
                    celebratingMilestoneId === milestone.id;

                  return (
                    <div
                      className={`relative flex items-center justify-between gap-3 overflow-hidden rounded-2xl bg-white/20 p-3 ${
                        justCompleted ? "completion-pop" : ""
                      }`}
                      key={milestone.id}
                    >
                      <span
                        className={`text-sm font-semibold ${
                          milestone.completed
                            ? "line-through opacity-60"
                            : ""
                        }`}
                      >
                        {milestone.title}
                      </span>
                      <button
                        className={`h-9 shrink-0 rounded-xl bg-white px-3 text-sm font-semibold text-[#0a0a0a] disabled:bg-white/30 disabled:text-current ${
                          justCompleted ? "done-button-pop" : ""
                        }`}
                        disabled={milestone.completed}
                        onClick={() =>
                          onCompleteMilestone(quest.id, milestone.id)
                        }
                      >
                        {milestone.completed ? (
                          <span className="inline-flex items-center gap-2">
                            <span
                              aria-hidden="true"
                              className="completion-check"
                            />
                            Done
                          </span>
                        ) : (
                          `+${quest.xp}`
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
