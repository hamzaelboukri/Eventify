import React from "react";
import { cn } from "@/lib/utils";
import type { InputProps } from "@/types";

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  className,
  icon,
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={cn(
            "w-full bg-slate-800/50 text-white placeholder-slate-400 rounded-xl",
            "py-4 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500",
            "border border-slate-700 hover:border-slate-600 transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            icon && "pl-12",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Input;
