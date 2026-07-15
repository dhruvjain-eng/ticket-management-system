interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, onRetry, onDismiss }: ErrorBannerProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      <p>{message}</p>
      <div className="flex shrink-0 gap-2">
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="font-medium underline underline-offset-2"
          >
            Retry
          </button>
        ) : null}
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className="font-medium underline underline-offset-2"
          >
            Dismiss
          </button>
        ) : null}
      </div>
    </div>
  );
}
