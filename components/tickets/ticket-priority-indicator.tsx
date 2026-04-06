import {
  IconArrowDown,
  IconArrowUp,
  IconCircle,
  IconMinus,
} from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import type { TicketPriority } from "@/lib/tickets/types"

type TicketPriorityIndicatorProps = {
  priority: TicketPriority
  className?: string
}

type PriorityVisualConfig = {
  label: string
  icon: React.ReactNode
}

const PRIORITY_VISUAL: Record<TicketPriority, PriorityVisualConfig> = {
  urgent: {
    label: "Urgent",
    icon: <IconArrowUp className="size-4 text-red-600 dark:text-red-400" />,
  },
  high: {
    label: "High",
    icon: (
      <IconArrowUp className="size-4 text-orange-600 dark:text-orange-400" />
    ),
  },
  medium: {
    label: "Normal",
    icon: <IconMinus className="size-4 text-sky-600 dark:text-sky-400" />,
  },
  low: {
    label: "Low",
    icon: <IconArrowDown className="size-4 text-zinc-500 dark:text-zinc-400" />,
  },
  todo: {
    label: "Todo",
    icon: <IconCircle className="size-4 text-zinc-500 dark:text-zinc-400" />,
  },
}

export function TicketPriorityIndicator({
  priority,
  className,
}: TicketPriorityIndicatorProps) {
  const visual = PRIORITY_VISUAL[priority]

  return (
    <span
      className={cn("inline-flex items-center justify-center", className)}
      title={`${visual.label} priority`}
      aria-label={`${visual.label} priority`}
    >
      {visual.icon}
    </span>
  )
}
