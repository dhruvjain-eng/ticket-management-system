interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <h3 className="text-base font-medium text-slate-900">{title}</h3>
      {description ? <p className="mt-2 text-sm text-slate-600">{description}</p> : null}
    </div>
  );
}
