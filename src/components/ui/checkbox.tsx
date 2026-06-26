import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ className, checked, disabled, ...props }, ref) => {
  return (
    <label
      className={cn(
        "relative inline-flex h-4 w-4 items-center justify-center rounded-sm border border-primary bg-background shadow-sm",
        checked ? "bg-primary text-primary-foreground" : "text-transparent",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        className,
      )}
    >
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        className="sr-only"
        {...props}
      />
      {checked ? <Check className="h-3 w-3" /> : null}
    </label>
  );
});

Checkbox.displayName = "Checkbox";

export { Checkbox };
