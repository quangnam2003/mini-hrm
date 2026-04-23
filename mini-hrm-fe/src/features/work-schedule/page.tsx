"use client";

import { ConfirmDialog } from "@/components/common/feedback/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { useState } from "react";
import { WorkScheduleDialog } from "./components/WorkScheduleDialog";
import { WorkScheduleTable } from "./components/WorkScheduleTable";
import { useWorkSchedule } from "./hooks/use-work-schedule";
import type {
  CreateWorkSchedulePayload,
  RuleWorkSetting,
  UpdateWorkSchedulePayload,
} from "./types";
import { WorkScheduleFormValues } from "./schemas";

export function WorkSchedulePage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RuleWorkSetting | null>(
    null,
  );
  const [confirmToggleTarget, setConfirmToggleTarget] =
    useState<RuleWorkSetting | null>(null);

  const {
    workSchedules,
    isLoading,
    createWorkSchedule,
    updateWorkSchedule,
    toggleActive,
    isCreating,
    isUpdating,
    isToggling,
  } = useWorkSchedule();

  const handleCreate = () => {
    setSelectedItem(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: RuleWorkSetting) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleToggleActive = (item: RuleWorkSetting) => {
    setConfirmToggleTarget(item);
  };

  const onConfirmToggle = () => {
    if (confirmToggleTarget) {
      toggleActive(confirmToggleTarget.id, {
        onSuccess: () => setConfirmToggleTarget(null),
      });
    }
  };

  const handleSubmit = (values: WorkScheduleFormValues) => {
    const formatDate = (dateStr?: string | null) => {
      if (!dateStr) return null;
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return null;
        return format(date, "yyyy-MM-dd");
      } catch {
        return null;
      }
    };

    const saturdayConfig = {
      type: values.setting.saturday_config.type,
      ...(values.setting.saturday_config.type === "bi_weekly"
        ? {
            reference_date: formatDate(
              values.setting.saturday_config.reference_date,
            ),
            reference_type: values.setting.saturday_config.reference_type,
          }
        : {}),
    };

    const transformedValues = {
      ...values,
      setting: {
        ...values.setting,
        saturday_config: saturdayConfig,
      },
    };

    if (selectedItem) {
      updateWorkSchedule({
        id: selectedItem.id,
        ...transformedValues,
      } as UpdateWorkSchedulePayload);
    } else {
      createWorkSchedule({
        ...transformedValues,
        is_active: false,
      } as CreateWorkSchedulePayload);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Typography variant="h3" className="text-lg font-bold">
              Cấu hình làm việc
            </Typography>
            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase">
              Hệ thống
            </span>
          </div>
          <Typography variant="small" className="text-muted-foreground">
            Quản lý khung giờ làm việc, giờ nghỉ và chính sách ngày nghỉ hàng
            tuần.
          </Typography>
        </div>
        <Button
          onClick={handleCreate}
          className="gap-2 h-9 text-xs rounded-xl shadow-lg shadow-primary/20"
        >
          <Plus size={14} />
          Thêm cấu hình
        </Button>
      </div>

      <div
        className={cn(
          "transition-opacity duration-200",
          isLoading ? "opacity-60" : "opacity-100",
        )}
      >
        <WorkScheduleTable
          data={workSchedules}
          onEdit={handleEdit}
          onToggleActive={handleToggleActive}
        />
      </div>

      <WorkScheduleDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={selectedItem}
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
      />

      <ConfirmDialog
        open={!!confirmToggleTarget}
        onOpenChange={(open) => !open && setConfirmToggleTarget(null)}
        title="Kích hoạt cấu hình?"
        description={`Hành động này sẽ kích hoạt cấu hình "${confirmToggleTarget?.name}" làm khung giờ làm việc chính thức.`}
        variant="primary"
        confirmText="Kích hoạt ngay"
        onConfirm={onConfirmToggle}
        isLoading={isToggling}
      />
    </div>
  );
}
