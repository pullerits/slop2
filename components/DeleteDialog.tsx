import { PendingDelete, ItemKey } from "../lib/types";

export function DeleteDialog({
  pendingDelete,
  onClose,
  onConfirm,
  keepRef,
  deleteRefs,
  itemKey,
}: {
  pendingDelete: PendingDelete;
  onClose: () => void;
  onConfirm: () => void;
  keepRef: React.RefObject<HTMLButtonElement | null>;
  deleteRefs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>;
  itemKey: (kind: PendingDelete["kind"], id: string) => ItemKey;
}) {
  return (
    <div
      className="confirm-backdrop fixed inset-0 z-50 flex items-end justify-center bg-[rgba(10,10,10,0.42)] px-4 py-6 sm:items-center"
      onClick={onClose}
    >
      <div
        className="confirm-dialog w-full max-w-md rounded-[28px] bg-[#fffaf0] p-6 text-[#0a0a0a] shadow-[0_32px_80px_rgba(10,10,10,0.24)] sm:p-7"
        onClick={(event) => event.stopPropagation()}
        aria-describedby="confirm-delete-description"
        aria-labelledby="confirm-delete-title"
        aria-modal="true"
        role="dialog"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#ffede3] text-xl">
            !
          </div>
          <div>
            <p className="quiet-label text-[#6a6a6a]">Confirm delete</p>
            <h3
              className="editorial-heading mt-2 text-3xl leading-none"
              id="confirm-delete-title"
            >
              Delete this {pendingDelete.kind}?
            </h3>
            <p
              className="mt-3 text-sm leading-6 text-[#3a3a3a]"
              id="confirm-delete-description"
            >
              <span className="font-semibold text-[#0a0a0a]">
                {pendingDelete.title}
              </span>{" "}
              will be removed from your tracker.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-[#f5f0e0] p-4 text-sm leading-6 text-[#3a3a3a]">
          Progress already earned stays on your profile, but this item and
          its future check-ins will be gone.
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            className="button-secondary h-11 rounded-xl border border-[#e5e5e5] bg-[#fffaf0] px-4 text-sm font-semibold"
            onClick={onClose}
            ref={keepRef}
            type="button"
          >
            Keep it
          </button>
          <button
            className="h-11 rounded-xl bg-[#ff6b5a] px-4 text-sm font-semibold text-white hover:bg-[#ef5846]"
            onClick={onConfirm}
            type="button"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
