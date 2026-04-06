import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { TicketHealth } from "@/lib/tickets/types"

type TicketTagProps = {
  tone: TicketHealth
  className?: string
}

const toneLabel: Record<TicketHealth, string> = {
  warning: "Warning",
  breached: "Breached",
  "on-track": "On Track",
}

const toneClassName: Record<TicketHealth, string> = {
  warning:
    "border-amber-200 bg-amber-100 text-orange-800 dark:border-orange-900/60 dark:bg-orange-950/60 dark:text-orange-300",
  breached:
    "border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-300",
  "on-track":
    "border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
}

const dotClassName: Record<TicketHealth, string> = {
  warning: "bg-orange-500 dark:bg-orange-400",
  breached: "bg-rose-600 dark:bg-rose-400",
  "on-track": "bg-zinc-700 dark:bg-zinc-300",
}

export function TicketTag({ tone, className }: TicketTagProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-5 gap-1 rounded-full px-2 text-[10px] font-medium",
        toneClassName[tone],
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", dotClassName[tone])} />
      {toneLabel[tone]}
    </Badge>
  )
}
