"use client";

import * as React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface TextareaFieldInputProps extends React.ComponentProps<"textarea"> {
  name: string;
  label: string;
  required?: boolean;
}

export function TextareaFieldInput({
  name,
  label,
  placeholder,
  required,
  className,
  ...props
}: TextareaFieldInputProps) {
  const { control } = useFormContext();

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

          <Textarea
            {...field}
            {...props}
            id={name}
            placeholder={placeholder}
            value={field.value ?? ""}
            className={cn(
              "min-h-[100px] rounded-lg border-black/40 bg-white px-3 py-2 text-sm transition-all focus:border-primary focus:ring-4 focus:ring-primary/10",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/10",
              className,
            )}
          />

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
