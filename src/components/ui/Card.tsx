import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  // Enhanced base card styles with gaming aesthetics
  "rounded-xl border text-white shadow-lg transition-all duration-300 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gray-900/70 border-gray-700/80 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.3)]",
        elevated: "bg-gray-800/80 border-gray-600/60 shadow-xl backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.4)]",
        gradient: "bg-gradient-to-br from-gray-800/90 via-gray-900/80 to-gray-950/90 border-gray-600/50 shadow-xl backdrop-blur-md",
        outline: "bg-transparent border-2 border-gray-700/80 hover:border-gray-600/80 backdrop-blur-sm",
        glass: "bg-gray-800/40 backdrop-blur-xl border-gray-700/30 shadow-[0_8px_32px_rgba(0,0,0,0.2)]",
        gaming: "bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-gray-900/90 border-primary-500/30 shadow-glow-sm backdrop-blur-md",
        cyber: "bg-gradient-to-br from-gray-900/95 to-gray-800/90 border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.2)] backdrop-blur-lg",
      },
      padding: {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
      hover: {
        none: "",
        subtle: "hover:shadow-xl hover:border-gray-600/60 hover:bg-opacity-90",
        lift: "hover:shadow-2xl hover:-translate-y-2 hover:border-gray-600/80 hover:scale-[1.02]",
        glow: "hover:shadow-glow-lg hover:border-primary-400/60 hover:bg-opacity-95",
        cyber: "hover:shadow-[0_0_40px_rgba(6,182,212,0.3)] hover:border-cyan-400/60 hover:-translate-y-1",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "none",
      hover: "subtle",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hover, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, hover, className }))}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 p-6 pb-4", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  }
>(({ className, as: Comp = "h3", ...props }, ref) => (
  <Comp
    ref={ref}
    className={cn(
      "font-semibold leading-none tracking-tight text-white",
      "text-lg md:text-xl",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-400 leading-relaxed", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0 mt-auto", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
