"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/common/feedback/ConfirmDialog";
import { LeavePolicyTable } from "./components/LeavePolicyTable";
import { LeavePolicyDialog } from "./components/LeavePolicyDialog";
import { useLeavePolicy } from "./hooks/use-leave-policy";
import type {
  CreateLeaveTypePayload,
  LeaveType,
  UpdateLeaveTypePayload,
} from "./types";

export function LeavePolicyPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LeaveType | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [confirmToggleTarget, setConfirmToggleTarget] =
    useState<LeaveType | null>(null);

  const {
    leaveTypes,
    isLoading,
    createLeaveType: createType,
    updateLeaveType: updateType,
    deleteLeaveType: deleteType,
    isCreating,
    isUpdating,
    isDeleting,
  } = useLeavePolicy();

  const handleCreate = () => {
    setSelectedItem(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: LeaveType) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setDeleteTargetId(id);
  };

  const onConfirmDelete = () => {
    if (deleteTargetId) {
      deleteType(deleteTargetId, {
        onSuccess: () => setDeleteTargetId(null),
      });
    }
  };

  const handleToggleActive = (item: LeaveType) => {
    setConfirmToggleTarget(item);
  };

  const onConfirmToggle = () => {
    if (confirmToggleTarget) {
      updateType(
        {
          id: confirmToggleTarget.id,
          is_active: confirmToggleTarget.is_active === 1 ? 0 : 1,
        },
        {
          onSuccess: () => setConfirmToggleTarget(null),
        },
      );
    }
  };

  const handleSubmit = (
    values: CreateLeaveTypePayload | UpdateLeaveTypePayload,
  ) => {
    if (selectedItem) {
      updateType({ id: selectedItem.id, ...values });
    } else {
      createType(values as CreateLeaveTypePayload);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Typography variant="h3" className="text-lg font-bold">
            Danh sách loại nghỉ phép
          </Typography>
          <Typography variant="small" className="text-muted-foreground">
            Quản lý các loại hình và chính sách nghỉ phép của công ty.
          </Typography>
        </div>
        <Button onClick={handleCreate} className="gap-2 h-9 text-xs">
          <Plus size={14} />
          Thêm loại nghỉ
        </Button>
      </div>

      <div
        className={cn(
          "transition-opacity duration-200",
          isLoading ? "opacity-60" : "opacity-100",
        )}
      >
        <LeavePolicyTable
          data={leaveTypes}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
          isLoading={isLoading}
        />
      </div>

      <LeavePolicyDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={selectedItem}
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
      />

      <ConfirmDialog
        open={!!deleteTargetId}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        title="Xóa loại nghỉ phép?"
        description="Bạn có chắc chắn muốn xóa loại nghỉ phép này? Hành động này sẽ gỡ bỏ loại nghỉ khỏi hệ thống và không thể hoàn tác."
        variant="danger"
        confirmText="Xóa dữ liệu"
        onConfirm={onConfirmDelete}
        isLoading={isDeleting}
      />

      <ConfirmDialog
        open={!!confirmToggleTarget}
        onOpenChange={(open) => !open && setConfirmToggleTarget(null)}
        title={
          confirmToggleTarget?.is_active === 1
            ? "Vô hiệu hóa loại nghỉ?"
            : "Kích hoạt loại nghỉ?"
        }
        description={
          confirmToggleTarget?.is_active === 1
            ? `Bạn có chắc chắn muốn vô hiệu hóa loại nghỉ "${confirmToggleTarget?.name}"? Nhân viên sẽ không thể chọn loại nghỉ này khi tạo đơn.`
            : `Hành động này sẽ kích hoạt lại loại nghỉ "${confirmToggleTarget?.name}" để nhân viên có thể sử dụng.`
        }
        variant={confirmToggleTarget?.is_active === 1 ? "danger" : "primary"}
        confirmText={
          confirmToggleTarget?.is_active === 1 ? "Vô hiệu hóa" : "Kích hoạt"
        }
        onConfirm={onConfirmToggle}
        isLoading={isUpdating}
      />
    </div>
  );
}
