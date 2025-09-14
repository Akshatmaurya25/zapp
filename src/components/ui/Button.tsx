import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
  // Base styles using design tokens
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary button with gradient background
        default:
          "bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-md hover:from-primary-700 hover:to-secondary-700 hover:shadow-lg active:scale-95",

        // Destructive/danger button
        destructive:
          "bg-error-500 text-white shadow-md hover:bg-error-600 hover:shadow-lg active:scale-95",

        // Outline button
        outline:
          "border-2 border-border-primary bg-transparent text-text-primary hover:bg-background-tertiary hover:border-border-secondary active:scale-95",

        // Secondary button
        secondary:
          "bg-background-tertiary text-text-primary border border-border-primary hover:bg-background-elevated hover:border-border-secondary active:scale-95",

        // Ghost button
        ghost:
          "text-text-primary hover:bg-background-tertiary active:bg-background-elevated active:scale-95",

        // Success button
        success:
          "bg-success-500 text-white shadow-md hover:bg-success-600 hover:shadow-lg active:scale-95",

        // Warning button
        warning:
          "bg-warning-500 text-white shadow-md hover:bg-warning-600 hover:shadow-lg active:scale-95",

        // Link styled button
        link:
          "text-primary-500 underline-offset-4 hover:underline hover:text-primary-400",

        // Gradient outline
        gradientOutline:
          "bg-transparent border-2 border-transparent bg-clip-padding text-transparent bg-gradient-to-r from-primary-500 to-secondary-500 hover:shadow-glow relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary-500 before:to-secondary-500 before:rounded-[inherit] before:-z-10 before:m-[2px] before:bg-background-primary",
      },
      size: {
        sm: "h-8 px-3 py-1 text-xs rounded-md",
        default: "h-10 px-4 py-2 text-sm rounded-lg",
        lg: "h-12 px-6 py-3 text-base rounded-xl",
        xl: "h-14 px-8 py-4 text-lg rounded-xl",
        icon: "h-10 w-10 rounded-lg",
        "icon-sm": "h-8 w-8 rounded-md",
        "icon-lg": "h-12 w-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    asChild = false,
    loading = false,
    loadingText,
    children,
    disabled,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        {loading ? loadingText || children : children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }