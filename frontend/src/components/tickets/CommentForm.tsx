import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { FieldErrors } from "@/lib/form-errors";
import { isCommentFormValid } from "@/lib/form-validation";
import type { UserSummary } from "@/types";

export interface CommentFormValues {
  message: string;
  createdById: string;
}

interface CommentFormProps {
  values: CommentFormValues;
  users: UserSummary[];
  fieldErrors: FieldErrors;
  submitting: boolean;
  onChange: (values: CommentFormValues) => void;
  onSubmit: () => void;
}

export function CommentForm({
  values,
  users,
  fieldErrors,
  submitting,
  onChange,
  onSubmit,
}: CommentFormProps) {
  const userOptions = users.map((user) => ({
    value: user.id,
    label: `${user.name} (${user.role})`,
  }));

  function updateField<K extends keyof CommentFormValues>(
    field: K,
    value: CommentFormValues[K],
  ) {
    onChange({ ...values, [field]: value });
  }

  const canSubmit = isCommentFormValid(values);

  return (
    <form
      className="space-y-4 rounded-lg border border-slate-200 bg-white p-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Textarea
        label="Message"
        name="message"
        value={values.message}
        maxLength={5000}
        hint="Maximum 5,000 characters"
        onChange={(event) => updateField("message", event.target.value)}
        error={fieldErrors.message}
        required
      />
      <Select
        label="Author"
        name="createdById"
        value={values.createdById}
        onChange={(event) => updateField("createdById", event.target.value)}
        options={userOptions}
        error={fieldErrors.createdById}
        required
      />
      <Button type="submit" loading={submitting} disabled={!canSubmit}>
        Add Comment
      </Button>
    </form>
  );
}
