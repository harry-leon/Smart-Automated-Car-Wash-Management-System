import { Lock } from "lucide-react";
import { Card } from "@/shared/ui/ui/card";

export function AccessDenied({
  title,
  description,
  role,
}: {
  title: string;
  description: string;
  role: string;
}) {
  return (
    <Card className="mx-auto flex max-w-2xl flex-col items-center justify-center p-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
        <Lock className="h-6 w-6" />
      </div>
      <h1 className="mt-4 text-lg font-semibold">{title}</h1>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
        Current role: {role}
      </div>
    </Card>
  );
}
