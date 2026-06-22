import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Loading({ size = "md", className }: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  return (
    <Loader2
      className={cn("animate-spin text-[#ff385c]", sizeClasses[size], className)}
    />
  )
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <Loading size="lg" />
    </div>
  )
}
