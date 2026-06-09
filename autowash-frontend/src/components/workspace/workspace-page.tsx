import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type WorkspacePageProps = {
  children: ReactNode;
  className?: string;
  compact?: boolean;
};

export function WorkspacePage({ children, className, compact }: WorkspacePageProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
        compact ? "py-5" : "py-6 lg:py-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function WorkspaceLoadingState({ message = "Đang tải khu vực làm việc..." }: { message?: string }) {
  return (
    <WorkspacePage>
      <Card className="flex min-h-[260px] items-center justify-center border-dashed border-border/70 bg-card/80 p-8">
        <p className="text-sm font-medium text-muted-foreground">{message}</p>
      </Card>
    </WorkspacePage>
  );
}

export function WorkspaceEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
      <h3 className="text-base font-bold text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function WorkspaceErrorState({
  title = "Something went wrong",
  description = "We could not load this section. Please try again.",
  retryLabel,
  onRetry,
}: {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center">
      <h3 className="text-base font-bold text-destructive">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      {onRetry ? (
        <Button type="button" variant="outline" className="mt-5" onClick={onRetry}>
          {retryLabel ?? "Try again"}
        </Button>
      ) : null}
    </div>
  );
}
