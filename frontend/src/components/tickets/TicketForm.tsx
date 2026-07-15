import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { formatPriorityLabel } from "@/lib/labels";
import type { FieldErrors } from "@/lib/form-errors";
import { TicketPriority } from "@/types";
import type { UserSummary } from "@/types";

export interface TicketFormValues {
  title: string;
  description: string;
  priority: TicketPriority;
  createdById: string;
  assignedToId: string;
}

interface TicketFormProps {
  values: TicketFormValues;
  users: UserSummary[];
  fieldErrors: FieldErrors;
  submitting: boolean;
  submitLabel: string;
  onChange: (values: TicketFormValues) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const priorityOptions = Object.values(TicketPriority).map((priority) => ({
  value: priority,
  label: formatPriorityLabel(priority),
}));

export function TicketForm({
  values,
  users,
  fieldErrors,
  submitting,
  submitLabel,
  onChange,
  onSubmit,
  onCancel,
}: TicketFormProps) {
  const userOptions = users.map((user) => ({
    value: user.id,
    label: `${user.name} (${user.role})`,
  }));

  const assigneeOptions = [
    { value: "", label: "Unassigned" },
    ...userOptions,
  ];

  function updateField<K extends keyof TicketFormValues>(
    field: K,
    value: TicketFormValues[K],
  ) {
    onChange({ ...values, [field]: value });
  }

  return (
    <form
      className="space-y-4 rounded-lg border border-slate-200 bg-white p-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Input
        label="Title"
        name="title"
        value={values.title}
        maxLength={200}
        onChange={(event) => updateField("title", event.target.value)}
        error={fieldErrors.title}
        required
      />
      <Textarea
        label="Description"
        name="description"
        value={values.description}
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
      />
      <Select
        label="Created By"
        name="createdById"
        value={values.createdById}
        onChange={(event) => updateField("createdById", event.target.value)}
        options={userOptions}
        error={fieldErrors.createdById}
      />
      <Select
        label="Assignee"
        name="assignedToId"
        value={values.assignedToId}
        onChange={(event) => updateField("assignedToId", event.target.value)}
        options={assigneeOptions}
        error={fieldErrors.assignedToId}
      />

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
