import * as React from "react";

export interface TextFieldInputProps extends React.ComponentProps<"input"> {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
}

export interface TextFieldNumberProps extends Omit<React.ComponentProps<"input">, "type" | "onChange"> {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectFieldInputProps {
  name?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  options: SelectOption[];
  className?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}
