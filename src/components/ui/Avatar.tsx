import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { clsx } from "clsx"
import { User } from "lucide-react"
import { generatePlaceholderAvatar } from "@/lib/utils"

interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  src?: string
  alt?: string
  fallbackText?: string
  size?: "sm" | "md" | "lg" | "xl"
  identifier?: string // For generating consistent placeholder avatars
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
  xl: "h-12 w-12"
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, src, alt, fallbackText, identifier, size = "lg", ...props }, ref) => {
  const [imageError, setImageError] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [placeholderError, setPlaceholderError] = React.useState(false)

  // Determine the best image source to use
  const primarySrc = src
  const placeholderSrc = identifier ? generatePlaceholderAvatar(identifier, 'avataaars') : undefined
  const currentSrc = !imageError && primarySrc ? primarySrc : placeholderSrc

  const handleImageLoad = () => {
    setIsLoading(false)
    setImageError(false)
  }

  const handleImageError = () => {
    setIsLoading(false)
    if (src && !imageError) {
      // Primary image failed, try placeholder
      console.log('Primary avatar image failed to load:', src)
      setImageError(true)
    } else {
      // Placeholder also failed
      console.log('Placeholder avatar image failed to load:', placeholderSrc)
      setPlaceholderError(true)
    }
  }

  React.useEffect(() => {
    if (currentSrc) {
      setIsLoading(true)
      if (src !== currentSrc) {
        // Reset states when switching to placeholder
        setImageError(false)
        setPlaceholderError(false)
      }
    } else {
      setIsLoading(false)
    }
  }, [src, currentSrc])

  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={clsx(
        "relative flex shrink-0 overflow-hidden rounded-full border-2 border-gray-600/80 bg-gray-800 shadow-lg transition-all duration-300 hover:border-gray-500/80 hover:shadow-xl",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {currentSrc && !placeholderError && (
        <AvatarPrimitive.Image
          src={currentSrc}
          alt={alt || "Avatar"}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className="aspect-square h-full w-full object-cover transition-opacity duration-300"
        />
      )}

      <AvatarPrimitive.Fallback
        className={clsx(
          "flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-gray-700 to-gray-800 text-gray-300 transition-all duration-300",
          isLoading && "animate-pulse"
        )}
      >
        {isLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
        ) : fallbackText ? (
          <span className={clsx(
            "font-semibold uppercase",
            size === "sm" ? "text-xs" :
            size === "md" ? "text-sm" :
            size === "lg" ? "text-base" : "text-lg"
          )}>
            {fallbackText.slice(0, 2)}
          </span>
        ) : (
          <User className={clsx(
            "text-gray-400",
            size === "sm" ? "h-3 w-3" :
            size === "md" ? "h-4 w-4" :
            size === "lg" ? "h-5 w-5" : "h-6 w-6"
          )} />
        )}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
})
Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={clsx("aspect-square h-full w-full object-cover transition-opacity duration-300", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={clsx(
      "flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-gray-700 to-gray-800 text-gray-300",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
export type { AvatarProps }