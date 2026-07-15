import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTime } from "@/lib/labels";
import type { Comment } from "@/types";

interface CommentListProps {
  comments: Comment[];
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return <EmptyState title="No comments yet" />;
  }

  return (
    <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
      {comments.map((comment) => (
        <li key={comment.id} className="px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-900">
              {comment.createdBy.name}
            </p>
            <time className="text-xs text-slate-500" dateTime={comment.createdAt}>
              {formatDateTime(comment.createdAt)}
            </time>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
            {comment.message}
          </p>
        </li>
      ))}
    </ul>
  );
}
