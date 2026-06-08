"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type AdminManagementTab = {
  value: string;
  label: string;
  content: ReactNode;
};

export function AdminManagementTabs({
  defaultTab,
  tabs,
}: {
  defaultTab: string;
  tabs: AdminManagementTab[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentTab = searchParams.get("tab");
  const activeTab = tabs.some((tab) => tab.value === currentTab) ? currentTab! : defaultTab;

  return (
    <Tabs
      value={activeTab}
      onValueChange={(nextTab) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", nextTab);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }}
      className="space-y-5"
    >
      <TabsList className="h-auto flex-wrap justify-start gap-2 rounded-2xl bg-muted/50 p-2">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="rounded-xl px-4 py-2 text-sm font-semibold"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="mt-0">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
