"use client";

import { PageHeader } from "@/components/common/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeavePolicyPage } from "@/features/leave-policy/page";
import { WorkSchedulePage } from "@/features/work-schedule/page";
import { CalendarDays, ClipboardList, Settings2 } from "lucide-react";

export default function WorkSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Cấu hình làm việc và loại nghỉ"
        description="Quản lý các thiết lập về chính sách nghỉ phép và lịch trình làm việc của doanh nghiệp."
        icon={Settings2}
      />

      <Tabs defaultValue="leave-policy" className="space-y-6 flex flex-col">
        <TabsList className="bg-slate-100/60 p-1 rounded-xl border border-slate-200/40 w-fit">
          <TabsTrigger
            value="leave-policy"
            className="rounded-lg py-1.5 px-6 text-slate-500 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all gap-2"
          >
            <ClipboardList size={16} />
            Loại nghỉ phép
          </TabsTrigger>
          <TabsTrigger
            value="work-schedule"
            className="rounded-lg py-1.5 px-6 text-slate-500 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all gap-2"
          >
            <CalendarDays size={16} />
            Lịch làm việc
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
          <TabsContent
            value="leave-policy"
            className="mt-0 focus-visible:outline-none"
          >
            <LeavePolicyPage />
          </TabsContent>

          <TabsContent
            value="work-schedule"
            className="mt-0 focus-visible:outline-none"
          >
            <WorkSchedulePage />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
