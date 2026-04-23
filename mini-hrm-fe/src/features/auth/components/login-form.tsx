"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Typography } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LoginFormValues } from "@/features/auth/types/auth";
import { loginSchema } from "@/features/auth/schemas/auth";
import { useLogin } from "@/features/auth/hooks/use-login";

export function LoginForm() {
  const [showPassword, setShowPassword] = React.useState(false);

  const form = useForm<LoginFormValues>({
    resolver: standardSchemaResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate: login, isPending: isLoading } = useLogin();

  const onSubmit = (data: LoginFormValues) => {
    login(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 mt-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-1.5 gap-0">
              <FormLabel className="ml-1 text-base/80">
                <Typography variant="label" as="span" className="text-inherit">
                  Email
                </Typography>
                <span className="text-destructive font-bold ml-1">*</span>
              </FormLabel>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <FormControl>
                  <Input
                    placeholder="hrm@gmail.com"
                    className="h-11 pl-10 bg-subtle border-line-subtle focus-visible:border-primary focus-visible:ring-primary-tint transition-all"
                    {...field}
                  />
                </FormControl>
              </div>
              <div className="h-5">
                <FormMessage className="text-xs ml-1" />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="space-y-1.5 gap-0">
              <FormLabel className="ml-1 text-base/80">
                <Typography variant="label" as="span" className="text-inherit">
                  Mật khẩu
                </Typography>
                <span className="text-destructive font-bold ml-1">*</span>
              </FormLabel>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <FormControl>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-11 pl-10 pr-10 bg-subtle border-line-subtle focus-visible:border-primary focus-visible:ring-primary-tint transition-all"
                    {...field}
                  />
                </FormControl>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="h-5">
                <FormMessage className="text-xs ml-1" />
              </div>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 mt-2 bg-primary text-primary-fg hover:bg-primary-hover text-base font-bold shadow-md transition-all active:scale-[0.98]"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Đang xử lý...</span>
            </div>
          ) : (
            "Đăng nhập hệ thống"
          )}
        </Button>
      </form>
    </Form>
  );
}
