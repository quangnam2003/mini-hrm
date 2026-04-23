"use client";

import * as React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Eye, EyeOff, AlertCircle, Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { TextFieldInputProps } from "@/types/form";

export function TextFieldInput({
  name,
  label,
  placeholder,
  required,
  type,
  className,
  ...props
}: TextFieldInputProps) {
  const { control } = useFormContext();
  const [showPassword, setShowPassword] = React.useState(false);

  const isPassword = type === "password";
  const isTime = type === "time";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className={cn("space-y-1.5", className)}>
          <div className="flex items-center justify-between">
            <Label
              htmlFor={name}
              className={cn(
                "text-[12px] font-semibold tracking-wide text-muted-foreground",
                error && "text-red-500",
              )}
            >
              {label}{" "}
              {required && <span className="text-red-500 ml-0.5">*</span>}
            </Label>
          </div>

          <div className="relative group">
            <Input
              {...field}
              {...props}
              id={name}
              type={inputType}
              placeholder={placeholder}
              value={field.value ?? ""}
              autoComplete={isPassword ? "current-password" : "off"}
              className={cn(
                "h-10 rounded-lg border-black/40 bg-white px-3 py-2 text-sm transition-all focus:border-primary focus:ring-4 focus:ring-primary/10",
                isPassword && "pr-10",
                isTime && "pr-10 [&::-webkit-calendar-picker-indicator]:hidden",
                error &&
                  "border-red-500 focus:border-red-500 focus:ring-red-500/10",
                className,
              )}
            />
            {isPassword && field.value && (
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors outline-none z-20"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            )}
            {isTime && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-0">
                <Clock size={16} className="text-slate-500" />
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle size={12} className="text-red-500" />
              <p className="text-[11px] font-medium text-red-500 leading-none">
                {error.message}
              </p>
            </div>
          )}
        </div>
      )}
    />
  );
}
