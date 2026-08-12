"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { NoteRoleBadge } from "@/components/members/detail/MemberDetailBadges";
import { createMemberNote, fetchMemberNotes } from "@/lib/api/member-detail";
import type { MemberNote } from "@/lib/types/member-detail";

interface MemberDetailNotesTabProps {
  userId: string;
  onNotesCountChange?: (count: number) => void;
}

export function MemberDetailNotesTab({
  userId,
  onNotesCountChange,
}: MemberDetailNotesTabProps) {
  const [notes, setNotes] = useState<MemberNote[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const data = await fetchMemberNotes(userId);
        if (!cancelled) {
          setNotes(data);
          onNotesCountChange?.(data.length);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [userId, onNotesCountChange]);

  async function handleAddNote() {
    const trimmed = draft.trim();
    if (!trimmed || isSaving) return;

    setIsSaving(true);
    try {
      const note = await createMemberNote(userId, trimmed);
      setNotes((current) => {
        const next = [note, ...current];
        onNotesCountChange?.(next.length);
        return next;
      });
      setDraft("");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
        <Loader2 className="size-4 animate-spin" />
        Loading notes…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="text-base font-bold text-slate-900">Add Note</h2>
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Write a note about this member..."
          rows={4}
          className="mt-4 w-full resize-none rounded-lg border border-neutral-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
        <div className="mt-4">
          <button
            type="button"
            onClick={() => void handleAddNote()}
            disabled={!draft.trim() || isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
            Add Note
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="text-base font-bold text-slate-900">Existing Notes</h2>
        {notes.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No notes yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {notes.map((note) => (
              <li
                key={note.id}
                className="flex gap-3 rounded-xl border border-neutral-200 p-4"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
                  {note.authorName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {note.authorName}
                      </p>
                      <NoteRoleBadge role={note.roleBadge} />
                    </div>
                    <p className="text-xs text-slate-500">{note.createdAt}</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {note.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
