import * as React from "react";
import { cn } from "@/app/lib/utils";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 select-none",
          className
        )}
        {...props}
      />
    );
  }
);
Label.displayName = "Label";

export { Label };
