import { IconDots, IconPlus, IconStack2 } from "@tabler/icons-react"

import { TicketCard } from "@/components/tickets/ticket-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Ticket } from "@/lib/tickets/types"

type TicketColumnProps = {
  title: string
  tickets: Ticket[]
}

export function TicketColumn({ title, tickets }: TicketColumnProps) {
  return (
    <section className="flex w-[278px] shrink-0 flex-col gap-2">
      <header className="flex h-9 items-center justify-between">
        <div className="flex items-center gap-1.5">
          <IconStack2 className="size-4 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">{title}</span>
          <Badge
            variant="ghost"
            className="h-4 px-0 text-xs text-muted-foreground"
          >
            {tickets.length}
          </Badge>
        </div>
        <div className="flex items-center">
          <Button variant="ghost" size="icon-sm" className="size-7 rounded-xl">
            <IconPlus className="size-4" />
            <span className="sr-only">Create ticket in {title}</span>
          </Button>
          <Button variant="ghost" size="icon-sm" className="size-7 rounded-xl">
            <IconDots className="size-4" />
            <span className="sr-only">Column options for {title}</span>
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-2 pb-2">
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>
    </section>
  )
}
