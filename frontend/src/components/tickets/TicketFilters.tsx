import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatStatusLabel } from "@/lib/labels";
import { TicketStatus } from "@/types";

interface TicketFiltersProps {
  search: string;
  status: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

const statusOptions = [
  { value: "", label: "All Statuses" },
  ...Object.values(TicketStatus).map((status) => ({
    value: status,
    label: formatStatusLabel(status),
  })),
];

export function TicketFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: TicketFiltersProps) {
  return (
    <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2">
      <Input
        label="Search"
        name="search"
        placeholder="Search by title..."
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      <Select
        label="Status"
        name="status"
        value={status}
        onChange={(event) => onStatusChange(event.target.value)}
        options={statusOptions}
      />
    </div>
  );
}
