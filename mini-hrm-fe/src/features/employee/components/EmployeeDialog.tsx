"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Pencil, UserPlus } from "lucide-react";
import { useEffect } from "react";
import {
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from "react-hook-form";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { TextFieldInput } from "@/components/common/form/TextFieldInput";
import { TextFieldNumber } from "@/components/common/form/TextFieldNumber";

import {
  addEmployeeSchema,
  editEmployeeSchema,
  type AddEmployeeValues,
  type EditEmployeeValues,
} from "../schemas";

import { AVATAR_COLORS } from "../constants";
import type { Employee } from "../types";
import { Infer } from "next/dist/compiled/superstruct";

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

type DialogMode = "add" | "edit";

interface EmployeeDialogProps {
  mode: DialogMode;
  employee?: Employee | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (values: any) => void;
}

function EmployeeInfoFields({ mode }: { mode: DialogMode }) {
  const isAdd = mode === "add";
  return (
    <>
      <TextFieldInput
        name="name"
        label="Họ và tên"
        required
        placeholder="Nguyễn Văn A"
      />

      <div className="grid grid-cols-2 gap-3">
        <TextFieldInput
          name="email"
          label="Email"
          disabled={mode === "edit"}
          placeholder="email@hrm.vn"
        />
        <TextFieldNumber
          name="phone"
          label="Số điện thoại"
          placeholder="0901234567"
          maxLength={10}
        />
      </div>

      <TextFieldInput
        name="address"
        label="Địa chỉ"
        placeholder="123 Đường ABC, Quận 1, TP.HCM"
      />

      {isAdd && (
        <div className="grid grid-cols-2 gap-3 pt-1">
          <TextFieldInput
            name="password"
            label="Mật khẩu"
            type="password"
            required
            placeholder="Tối thiểu 6 ký tự"
          />
          <TextFieldInput
            name="password_confirmation"
            label="Xác nhận mật khẩu"
            type="password"
            required
            placeholder="Nhập lại mật khẩu"
          />
        </div>
      )}
    </>
  );
}

function LeaveManagementContent() {
  const { control, watch } = useFormContext();
  const { fields } = useFieldArray({
    control,
    name: "leave_balances",
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100/60">
        <div className="flex items-center gap-2">
          <CalendarDays size={14} className="text-primary" />
          <Typography
            variant="label"
            className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider"
          >
            Danh sách hạn mức nghỉ phép
          </Typography>
        </div>
      </div>

      {fields.length === 0 ? (
        <div className="py-10 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <Typography variant="small" className="text-muted-foreground italic">
            Chưa có dữ liệu nghỉ phép
          </Typography>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {fields.map((field, index) => {
            return (
              <div
                key={field.id}
                className="p-4 pb-10 rounded-xl border border-slate-200/60 bg-white"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
                      <CalendarDays size={18} />
                    </div>
                    <div className="space-y-0.5">
                      <Typography
                        variant="h4"
                        className="text-[14px] font-bold text-slate-800"
                      >
                        {(field as any).leave_type?.name}
                      </Typography>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        <Typography
                          variant="small"
                          className="text-[10px] text-emerald-600 font-medium uppercase tracking-widest leading-none"
                        >
                          Năm {(field as any).year}
                        </Typography>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Typography
                      variant="h4"
                      className="text-xl font-bold text-primary tabular-nums leading-none"
                    >
                      {(() => {
                        const bal =
                          watch(`leave_balances.${index}.balance`) || 0;
                        const used =
                          watch(`leave_balances.${index}.used_days`) || 0;
                        return Math.max(0, Number(bal) - Number(used));
                      })()}
                    </Typography>
                    <Typography
                      variant="small"
                      className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-tighter transition-colors"
                    >
                      Ngày khả dụng
                    </Typography>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <TextFieldNumber
                    name={`leave_balances.${index}.balance`}
                    label="Tổng hạn mức"
                    placeholder="0"
                    className="h-10 text-sm bg-white border-slate-200 focus:border-primary/40"
                  />
                  <TextFieldNumber
                    name={`leave_balances.${index}.used_days`}
                    label="Số ngày đã nghỉ"
                    placeholder="0"
                    className="h-10 text-sm bg-white border-slate-200 focus:border-primary/40"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function EmployeeDialog({
  mode,
  employee,
  open,
  onOpenChange,
  onSubmit,
}: EmployeeDialogProps) {
  const isAdd = mode === "add";

  const form = useForm<AddEmployeeValues | EditEmployeeValues>({
    resolver: zodResolver(
      (isAdd ? addEmployeeSchema : editEmployeeSchema) as Infer<
        typeof addEmployeeSchema | typeof editEmployeeSchema
      >,
    ),
    defaultValues: isAdd
      ? {
          name: "",
          email: "",
          phone: "",
          address: "",
          password: "",
          password_confirmation: "",
        }
      : {
          name: "",
          email: "",
          phone: "",
          address: "",
          is_active: true,
          leave_balances: [],
        },
  });

  useEffect(() => {
    if (open) {
      if (isAdd) {
        form.reset({
          name: "",
          email: "",
          phone: "",
          address: "",
          password: "",
          password_confirmation: "",
        } as AddEmployeeValues);
      } else if (employee) {
        form.reset({
          name: employee.name || "",
          email: employee.email || "",
          phone: employee.phone || "",
          address: employee.address || "",
          is_active: employee.is_active,
          leave_balances: (employee.leave_balances || []).map((lb) => ({
            ...lb,
            balance: lb.balance ?? 0,
            used_days: lb.used_days ?? 0,
            year: lb.year ?? new Date().getFullYear(),
          })),
        } as EditEmployeeValues);
      }
    }
  }, [open, employee, isAdd, form]);

  const handleSubmit = (values: AddEmployeeValues | EditEmployeeValues) => {
    onSubmit(values);
    if (isAdd) {
      form.reset();
    }
    onOpenChange(false);
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            {isAdd ? (
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <UserPlus size={15} className="text-primary" />
              </div>
            ) : employee ? (
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-semibold shrink-0",
                  AVATAR_COLORS[employee.id % AVATAR_COLORS.length],
                )}
              >
                {employee.avatar_url ? (
                  <img
                    src={employee.avatar_url}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getInitials(employee.name)
                )}
              </div>
            ) : null}
            <div>
              <DialogTitle asChild>
                <Typography variant="h3" className="text-[15px]">
                  {isAdd ? "Thêm nhân viên mới" : "Chỉnh sửa nhân viên"}
                </Typography>
              </DialogTitle>
              <Typography variant="small" className="text-xs leading-none">
                {isAdd ? (
                  "Tạo tài khoản và cung cấp thông tin đăng nhập"
                ) : (
                  <span className="font-mono">
                    {employee?.empCode.replaceAll("-", "")}
                  </span>
                )}
              </Typography>
            </div>
          </div>
          <Typography variant="small" className="sr-only">
            {isAdd
              ? "Biểu mẫu để thêm một nhân viên mới vào hệ thống."
              : "Biểu mẫu để chỉnh sửa thông tin nhân viên hiện có."}
          </Typography>
        </DialogHeader>

        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col h-full overflow-hidden"
          >
            {isAdd ? (
              <div className="space-y-4 pr-0.5 mt-4">
                <EmployeeInfoFields mode={mode} />
              </div>
            ) : (
              <Tabs
                defaultValue="info"
                className="flex-1 overflow-hidden flex flex-col mt-2"
              >
                <TabsList className="grid w-full grid-cols-2 bg-slate-100/60 p-1 rounded-xl border border-slate-200/40">
                  <TabsTrigger
                    value="info"
                    className="rounded-lg py-2 text-slate-500 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                  >
                    Thông tin chung
                  </TabsTrigger>
                  <TabsTrigger
                    value="leave"
                    className="rounded-lg py-2 text-slate-500 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm gap-2 transition-all"
                  >
                    <CalendarDays size={14} />
                    Quản lý nghỉ phép
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-y-auto pr-0.5 mt-4">
                  <TabsContent
                    value="info"
                    className="space-y-4 pb-4 focus-visible:outline-none mt-0"
                  >
                    <EmployeeInfoFields mode={mode} />
                  </TabsContent>

                  <TabsContent
                    value="leave"
                    className="pb-4 focus-visible:outline-none mt-0"
                  >
                    <LeaveManagementContent />
                  </TabsContent>
                </div>
              </Tabs>
            )}

            <DialogFooter className="gap-2 pt-1 mt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                size="sm"
                className="gap-1.5"
                disabled={!form.formState.isDirty}
              >
                {isAdd ? (
                  <>
                    <UserPlus size={13} />
                    Tạo tài khoản
                  </>
                ) : (
                  <>
                    <Pencil size={13} />
                    Lưu thay đổi
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
