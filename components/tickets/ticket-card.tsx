import { IconBrandSlack, IconMail, IconMessage2 } from "@tabler/icons-react"

import { TicketPriorityIndicator } from "@/components/tickets/ticket-priority-indicator"
import { TicketTag } from "@/components/tickets/ticket-tag"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import type { Ticket } from "@/lib/tickets/types"

type TicketCardProps = {
  ticket: Ticket
}

function TicketChannelIcon({ channel }: { channel: Ticket["channel"] }) {
  if (channel === "email") {
    return <IconMail className="size-4 text-muted-foreground" />
  }

  if (channel === "slack") {
    return <IconBrandSlack className="size-4 text-muted-foreground" />
  }

  return <IconMessage2 className="size-4 text-muted-foreground" />
}

export function TicketCard({ ticket }: TicketCardProps) {
  const initials = ticket.assignee?.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <Card className="gap-0 rounded-2xl border bg-card py-0 shadow-none ring-0">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-muted-foreground">
            <TicketChannelIcon channel={ticket.channel} />
            <TicketPriorityIndicator priority={ticket.priority} />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {ticket.ticketNumber}
          </span>
        </div>

        <p className="line-clamp-2 text-[15px] leading-6 font-medium text-card-foreground">
          {ticket.subject}
        </p>

        <div className="flex items-center justify-between">
          <Avatar className="size-6 border bg-background">
            <AvatarFallback className="text-[10px]">
              {initials || "--"}
            </AvatarFallback>
          </Avatar>
          <TicketTag tone={ticket.health} />
        </div>
      </CardContent>
    </Card>
  )
}
