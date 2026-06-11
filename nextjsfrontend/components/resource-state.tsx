"use client";

import { ApiError } from "@/lib/api";
import { EmptyState, ErrorState, LoadingRows } from "./dashboard-ui";

export function ResourceState({
  isLoading,
  error,
  isEmpty,
  emptyTitle,
  emptyDescription,
  forbiddenTitle,
  forbiddenDescription,
  errorTitle,
  retryLabel,
  onRetry,
  children,
}: {
  isLoading: boolean;
  error: Error | null;
  isEmpty: boolean;
  emptyTitle: string;
  emptyDescription: string;
  forbiddenTitle: string;
  forbiddenDescription: string;
  errorTitle: string;
  retryLabel: string;
  onRetry: () => void;
  children: React.ReactNode;
}) {
  if (isLoading) {
    return <LoadingRows />;
  }

  if (error instanceof ApiError && error.status === 403) {
    return (
      <ErrorState
        title={forbiddenTitle}
        description={forbiddenDescription}
        actionLabel={retryLabel}
        onRetry={onRetry}
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        title={errorTitle}
        description={error.message}
        actionLabel={retryLabel}
        onRetry={onRetry}
      />
    );
  }

  if (isEmpty) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return children;
}
