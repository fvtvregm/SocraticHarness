import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2",
        "text-sm text-white placeholder:text-white/30",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 focus-visible:border-cyan-400/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "resize-y transition-colors",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
