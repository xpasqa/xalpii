import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

type CardPartProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

type CardTextProps = HTMLAttributes<HTMLHeadingElement> & {
  children: ReactNode;
};

export function Card({ className, children, ...props }: CardPartProps) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-travel-lg border border-travel-border bg-white shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: CardPartProps) {
  return (
    <div className={cn("space-y-1.5 p-5", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: CardTextProps) {
  return (
    <h3 className={cn("font-brand text-base font-semibold text-travel-dark", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement> & { children: ReactNode }) {
  return (
    <p
      className={cn(
        "break-words font-interface text-sm font-normal leading-6 text-travel-muted",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }: CardPartProps) {
  return (
    <div className={cn("px-5 pb-5", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: CardPartProps) {
  return (
    <div
      className={cn("flex items-center gap-3 border-t border-travel-border px-5 py-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}
