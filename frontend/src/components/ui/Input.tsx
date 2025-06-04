import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", ...props }, ref) => {
    const inputClasses = [
      "block w-full px-3 py-2 border rounded-md shadow-sm",
      "focus:outline-none focus:ring-2 focus:ring-tennis-green focus:border-tennis-green",
      "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
      error
        ? "border-match-lose text-match-lose focus:ring-match-lose focus:border-match-lose"
        : "border-gray-300",
      className,
    ].join(" ");

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-match-lose ml-1">*</span>}
          </label>
        )}
        <input ref={ref} className={inputClasses} {...props} />
        {error && <p className="text-sm text-match-lose">{error}</p>}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
