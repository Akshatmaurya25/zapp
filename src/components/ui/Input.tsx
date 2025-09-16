import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

const inputVariants = cva(
  // Base input styles using design tokens
  "flex w-full rounded-lg border bg-background-tertiary px-3 py-2 text-text-primary placeholder-text-muted shadow-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-border-primary hover:border-border-secondary focus-visible:border-primary-500",
        error: "border-error-500 focus-visible:ring-error-500 text-error-300",
        success:
          "border-success-500 focus-visible:ring-success-500 text-success-300",
        ghost:
          "border-transparent bg-transparent hover:bg-background-tertiary focus-visible:bg-background-tertiary",
      },
      size: {
        sm: "h-8 px-3 py-1 text-xs rounded-md",
        default: "h-10 px-3 py-2 text-sm rounded-lg",
        lg: "h-12 px-4 py-3 text-base rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  label?: string;
  helperText?: string;
  error?: string;
  success?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      type,
      label,
      helperText,
      error,
      success,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const generatedId = React.useId();
    const inputId = id || generatedId;

    // Determine the actual variant based on error/success states
    const actualVariant = error ? "error" : success ? "success" : variant;

    const inputType = type === "password" && showPassword ? "text" : type;

    return (
      <div className="w-full space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted">
              {leftIcon}
            </div>
          )}

          <input
            type={inputType}
            id={inputId}
            className={cn(
              inputVariants({ variant: actualVariant, size, className }),
              leftIcon && "pl-10",
              (rightIcon || type === "password") && "pr-10"
            )}
            ref={ref}
            {...props}
          />

          {type === "password" && (
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}

          {rightIcon && type !== "password" && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted">
              {rightIcon}
            </div>
          )}
        </div>

        {(error || success || helperText) && (
          <p
            className={cn(
              "text-xs",
              error && "text-error-400",
              success && "text-success-400",
              !error && !success && "text-text-muted"
            )}
          >
            {error || success || helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

// Textarea component
export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  variant?: "default" | "error" | "success" | "ghost";
  size?: "sm" | "default" | "lg";
  label?: string;
  helperText?: string;
  error?: string;
  success?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant,
      size,
      label,
      helperText,
      error,
      success,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const actualVariant = error ? "error" : success ? "success" : variant;

    return (
      <div className="w-full space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}

        <textarea
          id={inputId}
          className={cn(
            inputVariants({ variant: actualVariant, size }),
            "min-h-[80px] resize-y",
            className
          )}
          ref={ref}
          {...props}
        />

        {(error || success || helperText) && (
          <p
            className={cn(
              "text-xs",
              error && "text-error-400",
              success && "text-success-400",
              !error && !success && "text-text-muted"
            )}
          >
            {error || success || helperText}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Input, Textarea, inputVariants };
