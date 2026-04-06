import { ticketBoardColumns } from "@/lib/tickets/mock-data"
import type { Ticket } from "@/lib/tickets/types"
import { TicketColumn } from "@/components/tickets/ticket-column"

type TicketBoardProps = {
  tickets: Ticket[]
}

export function TicketBoard({ tickets }: TicketBoardProps) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-[1161px] gap-4">
        {ticketBoardColumns.map((column) => (
          <TicketColumn
            key={column.key}
            title={column.label}
            tickets={tickets.filter(
              (ticket) => ticket.queueStatus === column.key
            )}
          />
        ))}
      </div>
    </div>
  )
}
