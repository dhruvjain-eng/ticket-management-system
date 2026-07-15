import type { CommentFormValues } from "@/components/tickets/CommentForm";
import type { TicketFormValues } from "@/components/tickets/TicketForm";
import type { TicketEditValues } from "@/components/tickets/TicketFieldEditor";

function hasText(value: string): boolean {
  return value.trim().length > 0;
}

export function isCreateTicketFormValid(values: TicketFormValues): boolean {
  return (
    hasText(values.title) &&
    hasText(values.description) &&
    values.priority.length > 0 &&
    values.createdById.length > 0
  );
}

export function isEditTicketFormValid(values: TicketEditValues): boolean {
  return hasText(values.title) && hasText(values.description) && values.priority.length > 0;
}

export function isCommentFormValid(values: CommentFormValues): boolean {
  return hasText(values.message) && values.createdById.length > 0;
}
