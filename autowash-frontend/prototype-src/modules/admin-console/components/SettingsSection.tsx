import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function SettingsSection({ title, description, icon, children }: Props) {
  return (
    <Card className="border-border/50 bg-card/60 shadow-lg backdrop-blur-xl">
      <CardHeader className="border-b border-border/50 bg-accent/20 py-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          {icon}
          <span>{title}</span>
        </CardTitle>
        {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
      </CardHeader>
      <CardContent className="space-y-4 p-5">{children}</CardContent>
    </Card>
  );
}
