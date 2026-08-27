"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { sendClassMessage } from "@/lib/api/communication";
import { ApiClientError } from "@/lib/api/client";

interface ClassMessagePanelProps {
  sessionId: string;
  className: string;
  rosterSize: number;
}

export function ClassMessagePanel({
  sessionId,
  className,
  rosterSize,
}: ClassMessagePanelProps) {
  const [title, setTitle] = useState(`${className} update`);
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await sendClassMessage(sessionId, {
        title: title.trim(),
        body: body.trim(),
      });
      setSuccess(
        `Message sent to ${result.recipientCount} confirmed attendee${
          result.recipientCount === 1 ? "" : "s"
        }.`,
      );
      setBody("");
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Unable to send class message.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <MessageSquare className="size-4 text-primary-600" />
        <h2 className="text-base font-bold text-slate-900">Message roster</h2>
      </div>
      <p className="mt-2 text-sm text-slate-500">
        Send a targeted update to {rosterSize} confirmed attendee
        {rosterSize === 1 ? "" : "s"} on this roster.
      </p>
      <form className="mt-4 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
        <Input
          label="Subject"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
        <Textarea
          label="Message"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Parking update, room change, or class reminder."
          rows={4}
          required
        />
        {error ? <p className="text-sm text-danger-700">{error}</p> : null}
        {success ? (
          <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            <span>{success}</span>
          </div>
        ) : null}
        <Button type="submit" disabled={isSubmitting || !title.trim() || !body.trim()}>
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          Send message
        </Button>
      </form>
    </Card>
  );
}
