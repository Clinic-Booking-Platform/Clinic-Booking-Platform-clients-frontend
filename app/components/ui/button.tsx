import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/app/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600/30 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-teal-700 hover:bg-teal-800 text-white shadow-sm shadow-teal-700/20 active:scale-[0.99]",
        destructive:
          "bg-rose-600 hover:bg-rose-700 text-white shadow-xs active:scale-[0.99]",
        outline:
          "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:border-slate-300 shadow-2xs active:scale-[0.99]",
        secondary:
          "bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-[0.99]",
        ghost:
          "hover:bg-slate-100 hover:text-slate-900 text-slate-600",
        link:
          "text-teal-700 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-3.5 text-xs",
        lg: "h-12 rounded-xl px-7 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
