"use client";

import { TextFieldInput } from "@/components/common/form/TextFieldInput";
import { TextFieldNumber } from "@/components/common/form/TextFieldNumber";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { useProfile } from "@/features/employee/hooks/use-profile";
import {
  ChangePasswordFormValues,
  changePasswordSchema,
  ProfileFormValues,
  profileSchema,
} from "@/features/employee/schemas";
import { ChangePasswordPayload } from "@/features/employee/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, KeyRound, Loader2, Save } from "lucide-react";
import { useSession } from "next-auth/react";
import { Infer } from "next/dist/compiled/superstruct";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

export default function ProfilePage() {
  const { data: session, status: sessionStatus, update } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema as Infer<typeof profileSchema>),
    defaultValues: {
      empCode: "",
      email: "",
      name: "",
      phone: "",
      address: "",
    },
  });

  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(
      changePasswordSchema as Infer<typeof changePasswordSchema>,
    ),
    defaultValues: {
      old_password: "",
      new_password: "",
      new_password_confirmation: "",
    },
  });

  const {
    profileQuery,
    updateProfile,
    changePassword,
    isUpdatingProfile,
    isChangingPassword,
  } = useProfile();
  const { data: employeeData, isPending: isProfileFetching } = profileQuery;

  const showLoading =
    sessionStatus === "loading" ||
    (sessionStatus === "authenticated" && isProfileFetching);

  useEffect(() => {
    if (employeeData) {
      form.reset({
        empCode: employeeData.empCode || "",
        email: employeeData.email || "",
        name: employeeData.name || "",
        phone: employeeData.phone || "",
        address: employeeData.address || "",
      });
      setAvatarPreview(employeeData.avatar_url || null);
    }
  }, [employeeData, form]);

  const handleProfileSubmit = async (values: ProfileFormValues) => {
    const isUpdatingAvatar = avatarFile !== null;
    const isProfileDirty = form.formState.isDirty || isUpdatingAvatar;

    if (!isProfileDirty) {
      return;
    }

    const formData = new FormData();
    formData.append("name", values.name);
    if (values.phone) formData.append("phone", values.phone);
    if (values.address) formData.append("address", values.address);
    if (avatarFile) {
      formData.append("avatar", avatarFile);
      formData.append("avatar_url", avatarFile);
    }

    updateProfile(formData, {
      onSuccess: async (responseData: any) => {
        console.log(responseData);
        const updatedEmployee = responseData.user;
        await update({
          name: values.name,
          ...(updatedEmployee.avatar_url && {
            avatar: updatedEmployee.avatar_url,
          }),
        });
        setAvatarFile(null);
        form.reset({}, { keepValues: true });
      },
    });
  };

  const handlePasswordSubmit = async (values: ChangePasswordFormValues) => {
    const passPayload: ChangePasswordPayload = {
      old_password: values.old_password,
      new_password: values.new_password,
      new_password_confirmation: values.new_password_confirmation,
    };
    changePassword(passPayload, {
      onSuccess: () => {
        passwordForm.reset();
      },
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh (jpg, png,...)");
      return;
    }

    const maxFileSize = 5 * 1024 * 1024;
    if (file.size > maxFileSize) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatarPreview(event.target.result as string);
        setAvatarFile(file);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  if (showLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <Typography variant="small" className="text-muted-foreground">
          Đang tải thông tin cá nhân...
        </Typography>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-5 md:p-8 min-h-full bg-background max-w-4xl mx-auto w-full ">
      <div className="flex flex-col gap-1">
        <Typography variant="h3" className="text-2xl font-bold">
          Hồ Sơ Của Tôi
        </Typography>
        <Typography variant="small" className="text-muted-foreground">
          Quản lý thông tin cá nhân và cài đặt tài khoản của bạn
        </Typography>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mt-4 bg-white rounded-xl border border-black/40 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col items-center shrink-0 w-full md:w-64">
          <div className="relative group">
            <Avatar className="h-40 w-40 shadow-sm transition-all duration-200">
              <AvatarImage src={avatarPreview || ""} className="object-cover" />
              <AvatarFallback className="bg-primary/10 text-primary text-3xl font-semibold">
                {employeeData?.name
                  ? employeeData.name.charAt(0).toUpperCase()
                  : "?"}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2.5 rounded-full bg-primary text-white shadow-md hover:bg-primary/90 transition-all cursor-pointer group-hover:scale-105 active:scale-95 border-2 border-white"
            >
              <Camera size={16} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/jpeg, image/png, image/webp"
              onChange={handleFileChange}
            />
          </div>
          <Typography
            variant="small"
            className="text-sm font-semibold mt-4 text-center"
          >
            {employeeData?.name || "Người dùng"}
          </Typography>
          <Typography
            variant="small"
            className="text-xs text-muted-foreground text-center"
          >
            {employeeData?.role === "admin" ? "Quản trị viên" : "Nhân viên"}
          </Typography>
        </div>

        <div className="hidden md:block w-px bg-border my-2" />

        <div className="flex-1 space-y-12">
          <FormProvider {...form}>
            <form
              onSubmit={form.handleSubmit(handleProfileSubmit)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <TextFieldInput
                  name="empCode"
                  label="Mã nhân viên"
                  placeholder="EMP-..."
                  disabled
                />
                <TextFieldInput
                  name="email"
                  label="Email"
                  placeholder="email@hrm.vn"
                  type="email"
                  disabled
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <TextFieldInput
                  name="name"
                  label="Họ và tên"
                  required
                  placeholder="Nhập họ tên của bạn"
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
                placeholder="Nhập địa chỉ của bạn"
              />

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  className="gap-2 px-6"
                  disabled={
                    isUpdatingProfile ||
                    (!form.formState.isDirty && !avatarFile)
                  }
                >
                  {isUpdatingProfile ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  Lưu thay đổi
                </Button>
              </div>
            </form>
          </FormProvider>

          <FormProvider {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
              className="space-y-6"
            >
              <div>
                <Typography variant="h4" className="text-lg font-semibold mb-4">
                  Đổi Mật Khẩu
                </Typography>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <TextFieldInput
                      name="old_password"
                      label="Mật khẩu cũ"
                      type="password"
                      placeholder="Nhập mật khẩu cũ"
                    />
                  </div>
                  <TextFieldInput
                    name="new_password"
                    label="Mật khẩu mới"
                    type="password"
                    placeholder="Mật khẩu mới"
                  />
                  <TextFieldInput
                    name="new_password_confirmation"
                    label="Xác nhận mật khẩu"
                    type="password"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  className="gap-2 px-6 text-white bg-primary"
                  disabled={
                    isChangingPassword || !passwordForm.formState.isDirty
                  }
                >
                  {isChangingPassword ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <KeyRound size={16} />
                  )}
                  Xác nhận đổi mật khẩu
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}
