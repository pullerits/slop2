import { FormEvent } from "react";
import { StatName } from "../lib/types";
import { StatPicker } from "./StatPicker";

export function HabitForm({
  editingHabitId,
  habitTitle,
  habitStat,
  habitXp,
  onTitleChange,
  onStatChange,
  onXpChange,
  onSave,
  onCancel,
}: {
  editingHabitId: string | null;
  habitTitle: string;
  habitStat: StatName;
  habitXp: string;
  onTitleChange: (value: string) => void;
  onStatChange: (value: StatName) => void;
  onXpChange: (value: string) => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  return (
    <section>
      <h2 className="editorial-heading mb-4 text-3xl">
        {editingHabitId ? "Change a daily thing" : "Add a daily thing"}
      </h2>
      <form
        className="grid gap-3 rounded-2xl border border-[#e5e5e5] bg-[#fffaf0] p-5 lg:grid-cols-[minmax(0,1fr)_110px_auto]"
        onSubmit={onSave}
      >
        <input
          className="h-12 rounded-xl border border-[#e5e5e5] bg-[#fffaf0] px-4 text-sm outline-none transition placeholder:text-[#9a9a9a] focus:border-[#0a0a0a] lg:col-span-3"
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="Example: Take a short walk"
          value={habitTitle}
        />
        <div className="lg:col-span-3">
          <StatPicker
            label="Life area"
            onChange={onStatChange}
            value={habitStat}
          />
        </div>
        <input
          className="h-12 rounded-xl border border-[#e5e5e5] bg-[#fffaf0] px-4 text-sm outline-none transition placeholder:text-[#9a9a9a] focus:border-[#0a0a0a]"
          inputMode="numeric"
          placeholder="20"
          onChange={(event) => onXpChange(event.target.value)}
          value={habitXp}
        />
        <button className="button-primary h-12 rounded-xl px-5 text-sm font-semibold">
          {editingHabitId ? "Save" : "Add"}
        </button>
        {editingHabitId ? (
          <button
            className="button-secondary h-12 rounded-xl border border-[#e5e5e5] bg-[#fffaf0] px-5 text-sm font-semibold text-[#1a1a1a] lg:col-start-3"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
        ) : null}
      </form>
    </section>
  );
}
