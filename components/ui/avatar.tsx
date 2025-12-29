"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

type AvatarStatus = "loading" | "loaded" | "error"

const AvatarContext = React.createContext<{
  status: AvatarStatus
  setStatus: (status: AvatarStatus) => void
} | null>(null)

function useAvatarContext() {
  const context = React.useContext(AvatarContext)
  if (!context) {
    throw new Error("Avatar components must be used within an Avatar")
  }
  return context
}

const Avatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const [status, setStatus] = React.useState<AvatarStatus>("loading")

  return (
    <AvatarContext.Provider value={{ status, setStatus }}>
      <div
        ref={ref}
        className={cn(
          "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-black/10 dark:border-white/10",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </AvatarContext.Provider>
  )
})
Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  Omit<React.ComponentPropsWithoutRef<typeof Image>, "src" | "alt"> & {
    src?: string | import("next/dist/shared/lib/get-img-props").StaticImport | null
    alt?: string
  }
>(({ className, src, alt, onLoadingComplete, onError, ...props }, ref) => {
  const { setStatus } = useAvatarContext()

  // If no src, immediately set error to show fallback
  React.useEffect(() => {
    if (!src) setStatus("error")
  }, [src, setStatus])

  if (!src) return null

  return (
    <div className={cn("aspect-square h-full w-full relative", className)}>
      <Image
        src={src}
        alt={alt || "Avatar"}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={false}
        onLoad={() => setStatus("loaded")}
        onError={(e) => {
          setStatus("error")
          if (onError) onError(e)
        }}
        {...props}
      />
    </div>
  )
})
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { status } = useAvatarContext()

  if (status === "loaded") return null

  return (
    <div
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted",
        className
      )}
      {...props}
    />
  )
})
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }

// CodeRabbit Audit Trigger
