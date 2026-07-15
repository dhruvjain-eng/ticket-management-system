import Link from "next/link";
import { ActingUserSelect } from "@/components/layout/ActingUserSelect";

const primaryLinkClassName =
  "inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700";

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/tickets" className="text-base font-semibold text-slate-900">
            Support Ticket Management
          </Link>
          <nav aria-label="Main navigation" className="flex items-center gap-3 text-sm">
            <Link href="/tickets" className="text-slate-600 hover:text-slate-900">
              All Tickets
            </Link>
          </nav>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <ActingUserSelect />
          <Link href="/tickets/new" className={primaryLinkClassName}>
            New Ticket
          </Link>
        </div>
      </div>
    </header>
  );
}
