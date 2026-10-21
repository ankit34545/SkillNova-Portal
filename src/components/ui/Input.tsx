"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, leftIcon, rightElement, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-slate-300"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-slate-400 pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full rounded-xl border bg-midnight-800/60 backdrop-blur-sm text-slate-100 placeholder:text-slate-500",
              "px-4 py-2.5 text-sm transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/60",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error
                ? "border-red-500/60 focus:ring-red-500/40"
                : "border-white/10 hover:border-white/20",
              leftIcon && "pl-10",
              rightElement && "pr-12",
              className
            )}
            {...props}
          />
          {rightElement && (
            <span className="absolute right-3 text-slate-400">
              {rightElement}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-red-400 mt-0.5">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
export default Input;

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, helperText, error, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-300">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-xl border bg-midnight-800/60 backdrop-blur-sm text-slate-100 placeholder:text-slate-500",
            "px-4 py-3 text-sm transition-all duration-200 resize-none",
            "focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/60",
            error ? "border-red-500/60" : "border-white/10 hover:border-white/20",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400 mt-0.5">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-500">{helperText}</p>}
      </div>
    );
  }
);
TextArea.displayName = "TextArea";
