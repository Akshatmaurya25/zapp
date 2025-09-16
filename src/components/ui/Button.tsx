import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  // Enhanced base styles with gaming/cyber aesthetics
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        // Enhanced primary button with improved gradient
        default:
          "bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 text-white shadow-glow-sm hover:shadow-glow hover:from-primary-700 hover:to-secondary-700 hover:scale-105 active:scale-95 font-semibold",

        // Enhanced destructive button
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] hover:scale-105 active:scale-95 font-semibold",

        // Enhanced outline button with better hover states
        outline:
          "border-2 border-gray-600/80 bg-gray-900/20 backdrop-blur-sm text-gray-200 hover:bg-gray-800/60 hover:border-gray-500/80 hover:shadow-lg hover:scale-105 active:scale-95",

        // Enhanced secondary button with subtle gradient
        secondary:
          "bg-gradient-to-r from-gray-800 to-gray-700 text-white border border-gray-600/50 hover:from-gray-700 hover:to-gray-600 hover:border-gray-500/60 hover:shadow-lg hover:scale-105 active:scale-95",

        // Enhanced ghost button
        ghost:
          "text-gray-300 hover:bg-gray-800/60 hover:text-white backdrop-blur-sm hover:shadow-md hover:scale-105 active:bg-gray-700/80 active:scale-95",

        // Enhanced success button
        success:
          "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] hover:scale-105 active:scale-95 font-semibold",

        // Enhanced warning button
        warning:
          "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:scale-105 active:scale-95 font-semibold",

        // Enhanced link button
        link: "text-primary-400 underline-offset-4 hover:underline hover:text-primary-300 hover:shadow-glow-sm",

        // Enhanced gradient outline with glow effect
        gradientOutline:
          "bg-transparent border-2 border-primary-500/60 text-primary-400 hover:bg-primary-500/10 hover:text-primary-300 hover:border-primary-400/80 hover:shadow-glow-sm hover:scale-105 active:scale-95 backdrop-blur-sm",

        // New cyber variant
        cyber:
          "bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-105 active:scale-95 font-bold",

        // New gaming variant
        gaming:
          "bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:shadow-[0_0_30px_rgba(147,51,234,0.6)] hover:scale-105 active:scale-95 font-bold",
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
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      loadingText,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? loadingText || children : children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
