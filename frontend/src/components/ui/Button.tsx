import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary:
      "bg-tennis-green text-white hover:bg-tennis-green-dark focus:ring-tennis-green",
    secondary:
      "bg-clay-orange text-white hover:bg-clay-orange-dark focus:ring-clay-orange",
    outline:
      "border border-tennis-green text-tennis-green hover:bg-tennis-green hover:text-white focus:ring-tennis-green",
    ghost:
      "text-tennis-green hover:bg-tennis-green hover:text-white focus:ring-tennis-green",
    destructive:
      "bg-match-lose text-white hover:bg-red-600 focus:ring-match-lose",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg",
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className,
  ].join(" ");

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && (
        <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
