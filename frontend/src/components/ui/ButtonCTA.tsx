"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { cn } from "../../lib/utils";

type ButtonCTAVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonCTASize = "sm" | "md" | "lg";

type ButtonCTAProps = {
  children: ReactNode;
  variant?: ButtonCTAVariant;
  size?: ButtonCTASize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
  href?: string;
} & Pick<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "disabled" | "type" | "onClick" | "className" | "aria-label"
>;

const variants: Record<ButtonCTAVariant, string> = {
  primary:
    "bg-travel-primary text-white shadow-[0_8px_18px_rgba(185,34,22,0.16)] hover:bg-[#A51E14] hover:shadow-[0_10px_22px_rgba(185,34,22,0.20)] active:bg-[#8F1A12]",
  secondary:
    "bg-travel-secondary text-white shadow-[0_8px_18px_rgba(0,113,235,0.16)] hover:bg-[#0067D8] hover:shadow-[0_10px_22px_rgba(0,113,235,0.20)] active:bg-[#0058B8]",
  outline:
    "border border-travel-border bg-white text-travel-dark shadow-sm hover:border-travel-primary/40 hover:bg-[#FBEAE8] hover:text-travel-primary active:bg-[#F7D8D4]",
  ghost:
    "bg-transparent text-travel-dark hover:bg-travel-bg hover:text-travel-primary active:bg-[#FBEAE8]",
  danger:
    "bg-[#D92D20] text-white shadow-[0_8px_18px_rgba(217,45,32,0.14)] hover:bg-[#B42318] active:bg-[#912018]"
};

const sizes: Record<ButtonCTASize, string> = {
  sm: "h-9 gap-2 rounded-travel-md px-3.5 text-sm",
  md: "h-10 gap-2 rounded-[10px] px-4 text-sm",
  lg: "h-12 gap-2.5 rounded-[10px] px-5 text-[15px]"
};

export function ButtonCTA({
  children,
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  isLoading = false,
  disabled,
  fullWidth = false,
  href,
  type = "button",
  className,
  ...buttonProps
}: ButtonCTAProps) {
  const isDisabled = disabled || isLoading;
  const showLeftSlot = isLoading || Boolean(leftIcon);
  const content = (
    <>
      {showLeftSlot ? (
        <span className="inline-flex size-4 items-center justify-center">
          {isLoading ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            leftIcon
          )}
        </span>
      ) : null}
      <span>{children}</span>
      {rightIcon ? (
        <span className="inline-flex size-4 items-center justify-center">{rightIcon}</span>
      ) : null}
    </>
  );

  const classes = cn(
    "inline-flex shrink-0 items-center justify-center font-interface font-semibold transition duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-travel-primary/30 focus-visible:ring-offset-2",
    "active:translate-y-px disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-travel-border disabled:bg-travel-bg disabled:text-travel-muted disabled:shadow-none",
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
    className
  );

  if (href && !isDisabled) {
    return (
      <Link className={classes} href={href}>
        {content}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      disabled={isDisabled}
      type={type}
      {...buttonProps}
    >
      {content}
    </button>
  );
}
