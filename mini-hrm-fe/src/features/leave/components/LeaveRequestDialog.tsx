"use client";

import React, { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TextFieldInput } from "@/components/common/form/TextFieldInput";
import { SelectFieldInput } from "@/components/common/form/SelectFieldInput";
import { DatePickerInput } from "@/components/common/form/DatePickerInput";
import { TextareaFieldInput } from "@/components/common/form/TextareaFieldInput";
import { leaveRequestSchema, LeaveRequestFormValues } from "../schemas";
import { useLeave } from "../hooks/use-leave";
import { useProfile } from "../../employee/hooks/use-profile";
import { CreateLeaveRequestPayload } from "../types";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Infer } from "next/dist/compiled/superstruct";

interface LeaveRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (data: any) => void;
}

export function LeaveRequestDialog({
  open,
  onOpenChange,
  onSuccess,
}: LeaveRequestDialogProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { profileQuery } = useProfile(userId);
  const employeeData = profileQuery.data;

  const { createLeave, isCreating } = useLeave();

  const methods = useForm<LeaveRequestFormValues>({
    resolver: zodResolver(
      leaveRequestSchema as Infer<typeof leaveRequestSchema>,
    ),
    defaultValues: {
      request_scope: "full_day",
      reason: "",
      is_paid: false,
    },
  });

  const { watch, setValue, reset, handleSubmit } = methods;
  const requestScope = watch("request_scope");
  const leaveTypeId = watch("leave_type_id");
  const isPaidRequest = watch("is_paid");

  const unpaidLeaveBalance = (employeeData?.leave_balances || []).find(
    (b: any) => b.leave_type.is_paid === 0,
  );

  const selectedBalance = (employeeData?.leave_balances || []).find(
    (b: any) => String(b.leave_type.id) === String(leaveTypeId),
  );

  useEffect(() => {
    if (!isPaidRequest && unpaidLeaveBalance) {
      setValue("leave_type_id", unpaidLeaveBalance.leave_type.id);
    } else if (isPaidRequest) {
      const firstPaid = (employeeData?.leave_balances || []).find(
        (b: any) => b.leave_type.is_paid === 1,
      );
      if (firstPaid) setValue("leave_type_id", firstPaid.leave_type.id);
    }
  }, [isPaidRequest, unpaidLeaveBalance, setValue, employeeData]);

  useEffect(() => {
    if (isPaidRequest && requestScope === "hourly") {
      setValue("request_scope", "full_day");
    }
  }, [isPaidRequest, requestScope, setValue]);

  const onSubmit = (values: LeaveRequestFormValues) => {
    const isHourly = values.request_scope === "hourly";
    const isHalfDay = values.request_scope === "half_day";

    let startTime = values.start_time;
    let endTime = values.end_time;

    if (isHourly) {
      const date = values.start_time
        ? format(new Date(values.start_time), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd");
      startTime = `${date} ${values.start_hour}`;
      endTime = `${date} ${values.end_hour}`;
    } else {
      if (values.start_time) {
        startTime = format(new Date(values.start_time), "yyyy-MM-dd");
      }
      if (values.end_time) {
        endTime = format(new Date(values.end_time), "yyyy-MM-dd");
      }
    }

    const payload: CreateLeaveRequestPayload = {
      leave_type_id: values.leave_type_id ? Number(values.leave_type_id) : null,
      request_scope: values.request_scope,
      start_time: startTime ?? "",
      end_time: endTime ?? "",
      amount_unit: isHourly ? "hours" : "days",
      reason: values.reason,
      ...(isHalfDay && values.half_day_period
        ? { half_day_period: values.half_day_period }
        : {}),
    };

    createLeave(payload, {
      onSuccess: (data) => {
        onOpenChange(false);
        reset();

        const enrichedData = {
          ...data,
          leave_type: selectedBalance?.leave_type || { name: "N/A" },
        };

        if (onSuccess) onSuccess(enrichedData);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-bold text-xl">
            Tạo đơn xin nghỉ phép
          </DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="space-y-3">
              <Label className="text-slate-700 font-semibold mb-2 block">
                Hình thức lương
              </Label>
              <div className="flex gap-6">
                <div
                  className={cn(
                    "flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all",
                    isPaidRequest
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-slate-200 hover:bg-slate-50",
                  )}
                  onClick={() => setValue("is_paid", true)}
                >
                  <Checkbox
                    id="paid"
                    checked={isPaidRequest}
                    onChange={() => setValue("is_paid", true)}
                  />
                  <Label htmlFor="paid" className="cursor-pointer font-medium">
                    Có lương
                  </Label>
                </div>
                <div
                  className={cn(
                    "flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all",
                    !isPaidRequest
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-slate-200 hover:bg-slate-50",
                  )}
                  onClick={() => setValue("is_paid", false)}
                >
                  <Checkbox
                    id="unpaid"
                    checked={!isPaidRequest}
                    onChange={() => setValue("is_paid", false)}
                  />
                  <Label
                    htmlFor="unpaid"
                    className="cursor-pointer font-medium"
                  >
                    Không lương
                  </Label>
                </div>
              </div>
            </div>

            {isPaidRequest && (
              <SelectFieldInput
                name="leave_type_id"
                label="Loại nghỉ phép"
                required
                options={(employeeData?.leave_balances || [])
                  .filter((b: any) => b.leave_type.is_paid === 1)
                  .map((b: any) => ({
                    label: `${b.leave_type.name} (Còn ${b.remaining_days} ngày)`,
                    value: String(b.leave_type.id),
                  }))}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <SelectFieldInput
                name="request_scope"
                label="Hình thức nghỉ"
                required
                options={[
                  { label: "Cả ngày", value: "full_day" },
                  { label: "Nửa ngày", value: "half_day" },
                  ...(!isPaidRequest ? [{ label: "Theo giờ", value: "hourly" }] : []),
                ]}
              />

              {requestScope === "half_day" && (
                <SelectFieldInput
                  name="half_day_period"
                  label="Buổi nghỉ"
                  required
                  options={[
                    { label: "Sáng", value: "morning" },
                    { label: "Chiều", value: "afternoon" },
                  ]}
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <DatePickerInput
                name="start_time"
                label="Từ ngày"
                required
                disabled={(date) =>
                  date < new Date(new Date().setHours(0, 0, 0, 0))
                }
              />
              <DatePickerInput
                name="end_time"
                label="Đến ngày"
                required
                disabled={(date) =>
                  date < new Date(new Date().setHours(0, 0, 0, 0))
                }
              />
            </div>

            {requestScope === "hourly" && (
              <div className="grid grid-cols-2 gap-4">
                <TextFieldInput
                  name="start_hour"
                  label="Từ giờ"
                  type="time"
                  required
                />
                <TextFieldInput
                  name="end_hour"
                  label="Đến giờ"
                  type="time"
                  required
                />
              </div>
            )}

            <TextareaFieldInput
              name="reason"
              label="Lý do xin nghỉ"
              required
              placeholder="Nhập lý do..."
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit" isLoading={isCreating}>
                Gửi đơn
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
