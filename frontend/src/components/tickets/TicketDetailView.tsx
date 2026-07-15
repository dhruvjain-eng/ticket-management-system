"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CommentForm, type CommentFormValues } from "@/components/tickets/CommentForm";
import { CommentList } from "@/components/tickets/CommentList";
import { TicketDetailHeader } from "@/components/tickets/TicketDetailHeader";
import {
  TicketFieldEditor,
  type TicketEditValues,
} from "@/components/tickets/TicketFieldEditor";
import { StatusTransitionControl } from "@/components/tickets/StatusTransitionControl";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useActingUser } from "@/context/ActingUserContext";
import { useTicket } from "@/hooks/useTicket";
import { useUsers } from "@/hooks/useUsers";
import { ApiError } from "@/lib/errors";
import {
  getErrorMessage,
  mapApiDetailsToFieldErrors,
  type FieldErrors,
} from "@/lib/form-errors";
import { addComment, transitionTicketStatus, updateTicket } from "@/lib/api/tickets";
import type { TicketDetail, TicketStatus } from "@/types";

interface TicketDetailViewProps {
  ticketId: string;
}

function toEditValues(ticket: TicketDetail): TicketEditValues {
  return {
    title: ticket.title,
    description: ticket.description,
    priority: ticket.priority,
    assignedToId: ticket.assignedTo?.id ?? "",
  };
}

const emptyCommentValues: CommentFormValues = {
  message: "",
  createdById: "",
};

export function TicketDetailView({ ticketId }: TicketDetailViewProps) {
  const { ticket, loading, error, reload, setTicket } = useTicket(ticketId);
  const { users, loading: usersLoading, error: usersError, reload: reloadUsers } = useUsers();
  const { resolveActingUser } = useActingUser();
  const [editValues, setEditValues] = useState<TicketEditValues | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [transitionError, setTransitionError] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [commentValues, setCommentValues] = useState<CommentFormValues>(emptyCommentValues);
  const [commentFieldErrors, setCommentFieldErrors] = useState<FieldErrors>({});
  const [commentError, setCommentError] = useState<string | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (ticket) {
      setEditValues(toEditValues(ticket));
    }
  }, [ticket]);

  useEffect(() => {
    const actingUser = resolveActingUser(users);
    if (actingUser && !commentValues.createdById) {
      setCommentValues((current) => ({ ...current, createdById: actingUser.id }));
    }
  }, [users, resolveActingUser, commentValues.createdById]);

  async function handleSave() {
    if (!editValues) {
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);
    setFieldErrors({});

    try {
      const updated = await updateTicket(ticketId, {
        title: editValues.title.trim(),
        description: editValues.description.trim(),
        priority: editValues.priority,
        assignedToId: editValues.assignedToId || null,
      });

      setTicket(updated);
      setEditValues(toEditValues(updated));
      setSaveSuccess("Changes saved.");
    } catch (err) {
      if (err instanceof ApiError) {
        setSaveError(err.message);
        setFieldErrors(mapApiDetailsToFieldErrors(err.details));
      } else {
        setSaveError(getErrorMessage(err, "Failed to update ticket"));
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleTransition(nextStatus: TicketStatus) {
    setTransitioning(true);
    setTransitionError(null);

    try {
      const updated = await transitionTicketStatus(ticketId, nextStatus);
      setTicket(updated);
      setEditValues(toEditValues(updated));
      setSaveSuccess(null);
    } catch (err) {
      setTransitionError(
        err instanceof ApiError
          ? err.message
          : getErrorMessage(err, "Failed to update status"),
      );
    } finally {
      setTransitioning(false);
    }
  }

  async function handleAddComment() {
    setSubmittingComment(true);
    setCommentError(null);
    setCommentFieldErrors({});

    try {
      await addComment(ticketId, {
        message: commentValues.message.trim(),
        createdById: commentValues.createdById,
      });

      setCommentValues((current) => ({
        ...emptyCommentValues,
        createdById: current.createdById,
      }));

      await reload();
    } catch (err) {
      if (err instanceof ApiError) {
        setCommentError(err.message);
        setCommentFieldErrors(mapApiDetailsToFieldErrors(err.details));
      } else {
        setCommentError(getErrorMessage(err, "Failed to add comment"));
      }
    } finally {
      setSubmittingComment(false);
    }
  }

  if (loading || usersLoading) {
    return <LoadingSpinner label="Loading ticket..." />;
  }

  if (error?.statusCode === 404) {
    return (
      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-8 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Ticket not found</h1>
        <p className="text-sm text-slate-600">
          The ticket you are looking for does not exist.
        </p>
        <Link href="/tickets" className="text-sm font-medium text-slate-900 underline">
          Back to tickets
        </Link>
      </div>
    );
  }

  if (error || !ticket || !editValues) {
    return (
      <ErrorBanner
        message={error?.message ?? "Failed to load ticket"}
        onRetry={() => void reload()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {usersError ? (
        <ErrorBanner message={usersError.message} onRetry={() => void reloadUsers()} />
      ) : null}

      {saveError ? (
        <ErrorBanner message={saveError} onDismiss={() => setSaveError(null)} />
      ) : null}

      <TicketDetailHeader ticket={ticket} />

      <TicketFieldEditor
        values={editValues}
        users={users}
        fieldErrors={fieldErrors}
        saving={saving}
        successMessage={saveSuccess}
        onChange={setEditValues}
        onSave={() => void handleSave()}
      />

      <StatusTransitionControl
        currentStatus={ticket.status}
        transitioning={transitioning}
        error={transitionError}
        onTransition={(status) => void handleTransition(status)}
        onDismissError={() => setTransitionError(null)}
      />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Comments ({ticket.comments.length})
        </h2>

        {commentError ? (
          <ErrorBanner message={commentError} onDismiss={() => setCommentError(null)} />
        ) : null}

        <CommentList comments={ticket.comments} />
        <CommentForm
          values={commentValues}
          users={users}
          fieldErrors={commentFieldErrors}
          submitting={submittingComment}
          onChange={setCommentValues}
          onSubmit={() => void handleAddComment()}
        />
      </section>
    </div>
  );
}
