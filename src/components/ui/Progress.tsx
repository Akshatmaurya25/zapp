import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const progressVariants = cva(
  "relative h-2 w-full overflow-hidden rounded-full bg-gray-800",
  {
    variants: {
      variant: {
        default: "bg-gray-800",
        success: "bg-green-900/50",
        warning: "bg-yellow-900/50",
        danger: "bg-red-900/50",
        info: "bg-blue-900/50",
      },
      size: {
        sm: "h-1",
        default: "h-2",
        lg: "h-3",
        xl: "h-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const progressBarVariants = cva(
  "h-full w-full flex-1 transition-all duration-300 ease-in-out",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary-600 to-secondary-600",
        success: "bg-gradient-to-r from-green-500 to-emerald-500",
        warning: "bg-gradient-to-r from-yellow-500 to-orange-500",
        danger: "bg-gradient-to-r from-red-500 to-red-600",
        info: "bg-gradient-to-r from-blue-500 to-cyan-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  value?: number;
  max?: number;
  showValue?: boolean;
  animated?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      variant,
      size,
      value = 0,
      max = 100,
      showValue = false,
      animated = false,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div className="w-full space-y-1">
        <div
          ref={ref}
          className={cn(progressVariants({ variant, size, className }))}
          {...props}
        >
          <div
            className={cn(
              progressBarVariants({ variant }),
              animated && "animate-pulse",
              "transition-all duration-500 ease-out"
            )}
            style={{
              transform: `translateX(-${100 - percentage}%)`,
            }}
          />
        </div>
        {showValue && (
          <div className="flex justify-between text-xs text-gray-400">
            <span>{value}</span>
            <span>{max}</span>
          </div>
        )}
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress, progressVariants };
