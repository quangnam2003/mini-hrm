"use client";

import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TextFieldInput } from "@/components/common/form/TextFieldInput";
import { SelectFieldInput } from "@/components/common/form/SelectFieldInput";
import { DatePickerInput } from "@/components/common/form/DatePickerInput";
import { workScheduleSchema, type WorkScheduleFormValues } from "../schemas";
import type { RuleWorkSetting } from "../types";
import { Typography } from "@/components/ui/typography";
import { Clock, Calendar, Settings2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Infer } from "next/dist/compiled/superstruct";

interface WorkScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: any) => void;
  initialData?: RuleWorkSetting | null;
  isLoading?: boolean;
}

export function WorkScheduleDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
}: WorkScheduleDialogProps) {
  const form = useForm<WorkScheduleFormValues>({
    resolver: zodResolver(
      workScheduleSchema as Infer<typeof workScheduleSchema>,
    ),
    defaultValues: {
      name: "",
      setting: {
        shifts: {
          office_hours: {
            name: "Ca hành chính",
            work_start: "08:30",
            work_end: "17:30",
            break_start: "12:00",
            break_end: "13:00",
            half_day_split: "12:00",
          },
        },
        saturday_config: {
          type: "bi_weekly",
          reference_date: null,
          reference_type: "off",
        },
      },
    },
  });

  const { watch } = form;
  const satType = watch("setting.saturday_config.type");

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          name: initialData.name,
          setting: initialData.setting,
        });
      } else {
        form.reset({
          name: "",
          setting: {
            shifts: {
              office_hours: {
                name: "Ca hành chính",
                work_start: "08:30",
                work_end: "17:30",
                break_start: "12:00",
                break_end: "13:00",
                half_day_split: "12:00",
              },
            },
            saturday_config: {
              type: "bi_weekly",
              reference_date: null,
              reference_type: "off",
            },
          },
        });
      }
    }
  }, [open, initialData, form]);

  const handleFormSubmit = (values: WorkScheduleFormValues) => {
    onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden flex flex-col max-h-[80vh]">
        <DialogHeader className="px-6 pt-4 pb-2 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Settings2 size={15} className="text-primary" />
            </div>
            <div>
              <DialogTitle asChild>
                <Typography variant="h3" className="text-[15px]">
                  {initialData
                    ? "Chỉnh sửa cấu hình"
                    : "Thêm cấu hình làm việc"}
                </Typography>
              </DialogTitle>
              <Typography variant="small" className="text-xs leading-none">
                Thiết lập thời gian làm việc và chính sách thứ 7
              </Typography>
            </div>
          </div>
        </DialogHeader>

        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Typography
                    variant="small"
                    className="text-[11px] font-bold text-slate-400 uppercase tracking-widest"
                  >
                    Thông tin chung
                  </Typography>
                  <Separator className="flex-1" />
                </div>
                <TextFieldInput
                  name="name"
                  label="Tên cấu hình"
                  placeholder="VD: Cấu hình năm 2026, Ca gãy..."
                  required
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-slate-400" />
                  <Typography
                    variant="small"
                    className="text-[11px] font-bold text-slate-400 uppercase tracking-widest"
                  >
                    Thời gian ca làm việc
                  </Typography>
                  <Separator className="flex-1" />
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-4 p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                  <TextFieldInput
                    name="setting.shifts.office_hours.work_start"
                    label="Giờ vào làm"
                    type="time"
                    required
                  />
                  <TextFieldInput
                    name="setting.shifts.office_hours.work_end"
                    label="Giờ tan làm"
                    type="time"
                    required
                  />
                  <TextFieldInput
                    name="setting.shifts.office_hours.break_start"
                    label="Bắt đầu nghỉ trưa"
                    type="time"
                    required
                  />
                  <TextFieldInput
                    name="setting.shifts.office_hours.break_end"
                    label="Kết thúc nghỉ trưa"
                    type="time"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400" />
                  <Typography
                    variant="small"
                    className="text-[11px] font-bold text-slate-400 uppercase tracking-widest"
                  >
                    Chính sách làm việc thứ 7
                  </Typography>
                  <Separator className="flex-1" />
                </div>

                <div className="space-y-4 p-4 rounded-xl bg-slate-50/50 border border-slate-100 ">
                  <SelectFieldInput
                    name="setting.saturday_config.type"
                    label="Kiểu làm việc"
                    options={[
                      { label: "Làm tất cả thứ 7", value: "every_week" },
                      { label: "Nghỉ tất cả thứ 7", value: "none" },
                      { label: "Làm việc cách tuần", value: "bi_weekly" },
                    ]}
                    required
                  />

                  {satType === "bi_weekly" && (
                    <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <DatePickerInput
                        name="setting.saturday_config.reference_date"
                        label="Ngày mốc (thứ 7)"
                        placeholder="Chọn một ngày thứ 7"
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date <= today || date.getDay() !== 6;
                        }}
                      />
                      <SelectFieldInput
                        name="setting.saturday_config.reference_type"
                        label="Trạng thái ngày mốc"
                        options={[
                          { label: "Đi làm", value: "on" },
                          { label: "Nghỉ", value: "off" },
                        ]}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="px-6 py-4 shrink-0 flex items-center justify-end gap-2 bg-slate-50/30">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isLoading || !form.formState.isDirty}
                className="gap-1.5"
              >
                {isLoading ? (
                  "Đang xử lý..."
                ) : (
                  <>
                    <Settings2 size={13} />
                    {initialData ? "Lưu thay đổi" : "Lưu cấu hình"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
