import React from 'react'
import { cn } from '@/lib/utils'

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  center?: boolean
}

export function Container({
  size = 'lg',
  padding = 'md',
  center = false,
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        // Base container styles
        'w-full',

        // Size variants
        {
          'max-w-2xl': size === 'sm',
          'max-w-4xl': size === 'md',
          'max-w-6xl': size === 'lg',
          'max-w-7xl': size === 'xl',
          'max-w-none': size === 'full',
        },

        // Padding variants
        {
          'px-0': padding === 'none',
          'px-4': padding === 'sm',
          'px-6': padding === 'md',
          'px-8': padding === 'lg',
          'px-12': padding === 'xl',
        },

        // Center the container
        center && 'mx-auto',

        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Grid container for responsive layouts
export function GridContainer({
  cols = 'auto',
  gap = 'md',
  className,
  children,
  ...props
}: {
  cols?: '1' | '2' | '3' | '4' | '6' | '12' | 'auto'
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  children: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'grid',

        // Column variants
        {
          'grid-cols-1': cols === '1',
          'grid-cols-1 md:grid-cols-2': cols === '2',
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-3': cols === '3',
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-4': cols === '4',
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6': cols === '6',
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-12': cols === '12',
          'grid-cols-[repeat(auto-fit,minmax(250px,1fr))]': cols === 'auto',
        },

        // Gap variants
        {
          'gap-0': gap === 'none',
          'gap-2': gap === 'sm',
          'gap-4': gap === 'md',
          'gap-6': gap === 'lg',
          'gap-8': gap === 'xl',
        },

        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Section container with proper spacing
export function Section({
  spacing = 'md',
  className,
  children,
  ...props
}: {
  spacing?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  children: React.ReactNode
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn(
        'w-full',

        // Spacing variants
        {
          'py-8': spacing === 'sm',
          'py-12': spacing === 'md',
          'py-16': spacing === 'lg',
          'py-24': spacing === 'xl',
        },

        className
      )}
      {...props}
    >
      {children}
    </section>
  )
}

// Stack container for vertical layouts
export function Stack({
  gap = 'md',
  align = 'stretch',
  className,
  children,
  ...props
}: {
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  align?: 'start' | 'center' | 'end' | 'stretch'
  className?: string
  children: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col',

        // Gap variants
        {
          'space-y-0': gap === 'none',
          'space-y-2': gap === 'sm',
          'space-y-4': gap === 'md',
          'space-y-6': gap === 'lg',
          'space-y-8': gap === 'xl',
        },

        // Alignment variants
        {
          'items-start': align === 'start',
          'items-center': align === 'center',
          'items-end': align === 'end',
          'items-stretch': align === 'stretch',
        },

        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Flex container for horizontal layouts
export function Flex({
  gap = 'md',
  align = 'center',
  justify = 'start',
  wrap = false,
  direction = 'row',
  className,
  children,
  ...props
}: {
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  wrap?: boolean
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse'
  className?: string
  children: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex',

        // Direction variants
        {
          'flex-row': direction === 'row',
          'flex-col': direction === 'col',
          'flex-row-reverse': direction === 'row-reverse',
          'flex-col-reverse': direction === 'col-reverse',
        },

        // Gap variants
        {
          'gap-0': gap === 'none',
          'gap-2': gap === 'sm',
          'gap-4': gap === 'md',
          'gap-6': gap === 'lg',
          'gap-8': gap === 'xl',
        },

        // Alignment variants
        {
          'items-start': align === 'start',
          'items-center': align === 'center',
          'items-end': align === 'end',
          'items-stretch': align === 'stretch',
          'items-baseline': align === 'baseline',
        },

        // Justify variants
        {
          'justify-start': justify === 'start',
          'justify-center': justify === 'center',
          'justify-end': justify === 'end',
          'justify-between': justify === 'between',
          'justify-around': justify === 'around',
          'justify-evenly': justify === 'evenly',
        },

        // Wrap
        wrap && 'flex-wrap',

        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}