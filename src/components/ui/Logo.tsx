"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "full" | "icon-only";
  href?: string;
  className?: string;
  showText?: boolean;
}

const sizeClasses = {
  sm: {
    container: "gap-2",
    image: "h-6 w-6",
    text: "text-lg",
  },
  md: {
    container: "gap-3",
    image: "h-8 w-8",
    text: "text-xl",
  },
  lg: {
    container: "gap-3",
    image: "h-10 w-10",
    text: "text-2xl",
  },
  xl: {
    container: "gap-4",
    image: "h-12 w-12",
    text: "text-3xl",
  },
};

export function Logo({
  size = "md",
  variant = "full",
  href = "/dashboard",
  className = "",
  showText = false,
}: LogoProps) {
  const sizes = sizeClasses[size];
  const showTextContent = variant === "full" && showText;

  const logoContent = (
    <div
      className={cn(
        "flex items-center transition-opacity hover:opacity-80",
        sizes.container,
        className
      )}
    >
      <div className="relative">
        <Image
          src="/logo.png"
          alt="Zapp Logo"
          width={48}
          height={48}
          className={cn("object-contain", sizes.image)}
        />
      </div>
      {showTextContent && (
        <span className={cn("font-bold text-text-primary", sizes.text)}>
          Zapp
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
