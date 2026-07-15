"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TicketForm, type TicketFormValues } from "@/components/tickets/TicketForm";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageHeader } from "@/components/ui/PageHeader";
import { useActingUser } from "@/context/ActingUserContext";
import { useUsers } from "@/hooks/useUsers";
import { ApiError } from "@/lib/errors";
import {
  getErrorMessage,
  mapApiDetailsToFieldErrors,
  type FieldErrors,
} from "@/lib/form-errors";
import { createTicket } from "@/lib/api/tickets";
import { TicketPriority } from "@/types";

const emptyValues: TicketFormValues = {
  title: "",
  description: "",
  priority: TicketPriority.MEDIUM,
  createdById: "",
  assignedToId: "",
};

export function CreateTicketView() {
  const router = useRouter();
  const { users, loading: usersLoading, error: usersError, reload: reloadUsers } = useUsers();
  const { resolveActingUser } = useActingUser();
  const [values, setValues] = useState<TicketFormValues>(emptyValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const actingUser = resolveActingUser(users);
    if (actingUser && !values.createdById) {
      setValues((current) => ({ ...current, createdById: actingUser.id }));
    }
  }, [users, resolveActingUser, values.createdById]);

  async function handleSubmit() {
    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    try {
      const ticket = await createTicket({
        title: values.title.trim(),
        description: values.description.trim(),
        priority: values.priority,
        createdById: values.createdById,
        assignedToId: values.assignedToId || undefined,
      });

      router.push(`/tickets/${ticket.id}`);
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
        setFieldErrors(mapApiDetailsToFieldErrors(error.details));
      } else {
        setFormError(getErrorMessage(error, "Failed to create ticket"));
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (usersLoading) {
    return <LoadingSpinner label="Loading form..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Ticket"
        description="Open a new support ticket."
      />

      {usersError ? (
        <ErrorBanner message={usersError.message} onRetry={() => void reloadUsers()} />
      ) : null}

      {formError ? <ErrorBanner message={formError} onDismiss={() => setFormError(null)} /> : null}

      <TicketForm
        values={values}
        users={users}
        fieldErrors={fieldErrors}
        submitting={submitting}
        submitLabel="Create Ticket"
        onChange={setValues}
        onSubmit={() => void handleSubmit()}
        onCancel={() => router.push("/tickets")}
      />
    </div>
  );
}
