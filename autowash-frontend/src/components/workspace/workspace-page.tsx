import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type WorkspacePageProps = {
  children: ReactNode;
  className?: string;
  /** Tighter padding for dense dashboards */
  compact?: boolean;
};

export function WorkspacePage({ children, className, compact }: WorkspacePageProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl",
        compact ? "px-4 py-5 sm:px-6 lg:px-8" : "px-4 py-6 sm:px-6 lg:px-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function WorkspaceLoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <WorkspacePage>
      <div className="flex min-h-[40vh] items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 p-8">
        <p className="text-sm font-medium text-muted-foreground">{message}</p>
      </div>
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
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function WorkspaceErrorState({
  title = "Something went wrong",
  description = "We could not load this section. Please try again.",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center">
      <h3 className="text-base font-bold text-destructive">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
