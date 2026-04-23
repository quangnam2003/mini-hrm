"use client";

import * as React from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon, AlertCircle } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

interface DatePickerInputProps {
  name?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean | ((date: Date) => boolean);
  value?: Date | string | null;
  onChange?: (date: string | null) => void;
}

export function DatePickerInput({
  name,
  label,
  placeholder = "Chọn ngày",
  required,
  className,
  disabled,
  value: controlledValue,
  onChange: controlledOnChange,
}: DatePickerInputProps) {
  const formContext = useFormContext();
  const isFormMode = !!formContext && !!name;

  const renderContent = (
    value: any,
    onChange: (val: any) => void,
    error?: any
  ) => (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <Label
          htmlFor={name}
          className={cn(
            "text-[12px] font-semibold tracking-wide text-muted-foreground",
            error && "text-red-500"
          )}
        >
          {label} {required && <span className="text-red-500 ml-0.5">*</span>}
        </Label>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled === true}
            className={cn(
              "w-full h-10 justify-start text-left font-normal bg-white border-black/40 rounded-lg hover:bg-slate-50 transition-all",
              !value && "text-muted-foreground",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/10"
            )}
          >
            <CalendarIcon size={14} className="mr-2 text-primary shrink-0" />
            <span className="text-sm truncate">
              {value
                ? format(new Date(value), "dd/MM/yyyy", {
                    locale: vi,
                  })
                : placeholder}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 border border-black/40 bg-white shadow-xl rounded-xl z-[100]"
          align="start"
          sideOffset={4}
        >
          <Calendar
            mode="single"
            selected={value ? new Date(value) : undefined}
            onSelect={(date) => {
              onChange(date ? date.toISOString() : null);
            }}
            disabled={disabled}
            className="p-3"
            classNames={{
              today:
                "border border-primary bg-primary/5 text-primary font-bold rounded-md",
            }}
          />
        </PopoverContent>
      </Popover>

      {error && (
        <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle size={12} className="text-red-500" />
          <p className="text-[11px] font-medium text-red-500 leading-none">
            {error.message}
          </p>
        </div>
      )}
    </div>
  );

  if (isFormMode) {
    return (
      <Controller
        name={name!}
        control={formContext.control}
        render={({ field, fieldState: { error } }) =>
          renderContent(field.value, field.onChange, error)
        }
      />
    );
  }

  return renderContent(controlledValue, (date) => controlledOnChange?.(date));
}
