import { Button } from "@/components/ui/Button";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { formatStatusLabel } from "@/lib/labels";
import { getAllowedTransitions } from "@/lib/status-machine";
import type { TicketStatus } from "@/types";
import { StatusBadge } from "./TicketBadges";

interface StatusTransitionControlProps {
  currentStatus: TicketStatus;
  transitioning: boolean;
  error: string | null;
  onTransition: (status: TicketStatus) => void;
  onDismissError: () => void;
}

export function StatusTransitionControl({
  currentStatus,
  transitioning,
  error,
  onTransition,
  onDismissError,
}: StatusTransitionControlProps) {
  const allowedTransitions = getAllowedTransitions(currentStatus);

  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Status</h2>
        <StatusBadge status={currentStatus} />
      </div>

      {error ? (
        <ErrorBanner message={error} onDismiss={onDismissError} />
      ) : null}

      {allowedTransitions.length === 0 ? (
        <p className="text-sm text-slate-600">
          {formatStatusLabel(currentStatus)} is a terminal status. No further
          transitions are available.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {allowedTransitions.map((status) => (
            <Button
              key={status}
              variant={status === "CANCELLED" ? "danger" : "secondary"}
              loading={transitioning}
              onClick={() => {
                if (
                  status === "CANCELLED" &&
                  !window.confirm("Cancel this ticket?")
                ) {
                  return;
                }

                onTransition(status);
              }}
            >
              Move to {formatStatusLabel(status)}
            </Button>
          ))}
        </div>
      )}
    </section>
  );
}
