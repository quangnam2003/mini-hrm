"use client";

import { useEffect } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormDescription, FormItem, FormLabel } from "@/components/ui/form";
import { TextFieldInput } from "@/components/common/form/TextFieldInput";
import { TextFieldNumber } from "@/components/common/form/TextFieldNumber";
import { leaveTypeSchema, type LeaveTypeFormValues } from "../schemas";
import type { LeaveType } from "../types";
import { cn } from "@/lib/utils";
import { Infer } from "next/dist/compiled/superstruct";

interface LeavePolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: any) => void;
  initialData?: LeaveType | null;
  isLoading?: boolean;
}

export function LeavePolicyDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
}: LeavePolicyDialogProps) {
  const form = useForm<LeaveTypeFormValues>({
    resolver: zodResolver(leaveTypeSchema as Infer<typeof leaveTypeSchema>),
    defaultValues: {
      name: "",
      is_paid: false,
      default_days: 0,
      allow_half_day: false,
      allow_hourly: false,
    },
  });

  const isPaid = form.watch("is_paid");

  useEffect(() => {
    if (isPaid) {
      form.setValue("allow_hourly", false);
    } else {
      form.setValue("default_days", 0);
    }
  }, [isPaid, form]);

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          name: initialData.name,
          is_paid: initialData.is_paid === 1,
          default_days: initialData.default_days,
          allow_half_day: initialData.allow_half_day === 1,
          allow_hourly: initialData.allow_hourly === 1,
        });
      } else {
        form.reset({
          name: "",
          is_paid: false,
          default_days: 0,
          allow_half_day: false,
          allow_hourly: false,
        });
      }
    }
  }, [open, initialData, form]);

  const handleFormSubmit = (v: LeaveTypeFormValues) => {
    const payload = {
      ...v,
      is_paid: v.is_paid ? 1 : 0,
      allow_half_day: v.allow_half_day ? 1 : 0,
      allow_hourly: v.allow_hourly ? 1 : 0,
      is_active: initialData ? initialData.is_active : 1,
    };
    onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:rounded-2xl border-none shadow-2xl overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl font-bold text-slate-900">
            {initialData
              ? "Chỉnh sửa loại nghỉ phép"
              : "Thêm loại nghỉ phép mới"}
          </DialogTitle>
        </DialogHeader>

        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-6 px-6 pb-6"
          >
            <div className="space-y-4">
              <TextFieldInput
                name="name"
                label="Tên loại nghỉ phép"
                placeholder="VD: Nghỉ phép năm, Nghỉ bệnh..."
                required
              />

              {isPaid && (
                <TextFieldNumber
                  name="default_days"
                  label="Số ngày mặc định (năm)"
                  placeholder="0"
                />
              )}

              <div className="space-y-3 pt-1">
                <Controller
                  name="is_paid"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem
                      className={cn(
                        "flex flex-col rounded-xl border p-4 transition-all cursor-pointer",
                        field.value
                          ? "border-emerald-500 bg-emerald-50/10 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]"
                          : "border-slate-200 bg-white hover:bg-slate-50/80",
                      )}
                      onClick={() => field.onChange(!field.value)}
                    >
                      <FormLabel className="text-[14px] font-bold text-slate-800 cursor-pointer mb-0.5">
                        Có lương
                      </FormLabel>
                      <FormDescription className="text-[11px] text-slate-500 leading-relaxed">
                        Nhân viên có được hưởng lương khi nghỉ loại này.
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <div
                  className={cn(
                    "grid gap-3",
                    isPaid ? "grid-cols-1" : "grid-cols-2",
                  )}
                >
                  <Controller
                    name="allow_half_day"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem
                        className={cn(
                          "flex flex-col items-center justify-center rounded-xl border p-4 h-16 transition-all cursor-pointer text-center",
                          field.value
                            ? "border-emerald-500 bg-emerald-50/10 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]"
                            : "border-slate-200 bg-white hover:bg-slate-50/80",
                        )}
                        onClick={() => field.onChange(!field.value)}
                      >
                        <FormLabel className="text-[13px] font-bold text-slate-800 cursor-pointer">
                          Nửa ngày
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  {!isPaid && (
                    <Controller
                      name="allow_hourly"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem
                          className={cn(
                            "flex flex-col items-center justify-center rounded-xl border p-4 h-16 transition-all cursor-pointer text-center",
                            field.value
                              ? "border-emerald-500 bg-emerald-50/10 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]"
                              : "border-slate-200 bg-white hover:bg-slate-50/80",
                          )}
                          onClick={() => field.onChange(!field.value)}
                        >
                          <FormLabel className="text-[13px] font-bold text-slate-800 cursor-pointer">
                            Theo giờ
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className=" flex items-center gap-2 pt-1 mt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={
                  isLoading || (!!initialData && !form.formState.isDirty)
                }
              >
                {isLoading
                  ? "Đang xử lý..."
                  : initialData
                    ? "Lưu thay đổi"
                    : "Thêm mới"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
