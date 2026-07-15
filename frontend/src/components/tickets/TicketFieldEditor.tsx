import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { formatPriorityLabel } from "@/lib/labels";
import type { FieldErrors } from "@/lib/form-errors";
import { isEditTicketFormValid } from "@/lib/form-validation";
import { TicketPriority } from "@/types";
import type { UserSummary } from "@/types";

export interface TicketEditValues {
  title: string;
  description: string;
  priority: TicketPriority;
  assignedToId: string;
}

interface TicketFieldEditorProps {
  values: TicketEditValues;
  users: UserSummary[];
  fieldErrors: FieldErrors;
  saving: boolean;
  successMessage: string | null;
  onChange: (values: TicketEditValues) => void;
  onSave: () => void;
}

const priorityOptions = Object.values(TicketPriority).map((priority) => ({
  value: priority,
  label: formatPriorityLabel(priority),
}));

export function TicketFieldEditor({
  values,
  users,
  fieldErrors,
  saving,
  successMessage,
  onChange,
  onSave,
}: TicketFieldEditorProps) {
  const assigneeOptions = [
    { value: "", label: "Unassigned" },
    ...users.map((user) => ({
      value: user.id,
      label: user.name,
    })),
  ];

  const canSave = isEditTicketFormValid(values);

  function updateField<K extends keyof TicketEditValues>(
    field: K,
    value: TicketEditValues[K],
  ) {
    onChange({ ...values, [field]: value });
  }

  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900">Edit Ticket</h2>
        {successMessage ? (
          <p role="status" aria-live="polite" className="text-sm font-medium text-green-700">
            {successMessage}
          </p>
        ) : null}
      </div>

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSave();
        }}
      >
        <Input
          label="Title"
          name="title"
          value={values.title}
          maxLength={200}
          hint="Maximum 200 characters"
          onChange={(event) => updateField("title", event.target.value)}
          error={fieldErrors.title}
          required
        />
        <Textarea
          label="Description"
          name="description"
          value={values.description}
          maxLength={10000}
          hint="Maximum 10,000 characters"
          onChange={(event) => updateField("description", event.target.value)}
          error={fieldErrors.description}
          required
        />
        <Select
          label="Priority"
          name="priority"
          value={values.priority}
          onChange={(event) =>
            updateField("priority", event.target.value as TicketPriority)
          }
          options={priorityOptions}
          error={fieldErrors.priority}
          required
        />
        <Select
          label="Assignee"
          name="assignedToId"
          value={values.assignedToId}
          onChange={(event) => updateField("assignedToId", event.target.value)}
          options={assigneeOptions}
          error={fieldErrors.assignedToId}
        />

        <Button type="submit" loading={saving} disabled={!canSave}>
          Save Changes
        </Button>
      </form>
    </section>
  );
}
