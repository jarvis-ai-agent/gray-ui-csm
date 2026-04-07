import { useState } from "react"

import { ticketBoardColumns } from "@/lib/tickets/mock-data"
import type { Ticket, TicketQueueStatus } from "@/lib/tickets/types"
import { TicketColumn } from "@/components/tickets/ticket-column"

type TicketBoardProps = {
  tickets: Ticket[]
  onMoveTicket: (ticketId: string, queueStatus: TicketQueueStatus) => void
}

export function TicketBoard({ tickets, onMoveTicket }: TicketBoardProps) {
  const [draggingTicketId, setDraggingTicketId] = useState<string | null>(null)
  const [dropTargetColumn, setDropTargetColumn] =
    useState<TicketQueueStatus | null>(null)

  const handleTicketDragStart = (
    ticketId: string,
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/ticket-id", ticketId)
    setDraggingTicketId(ticketId)
  }

  const handleTicketDragEnd = () => {
    setDraggingTicketId(null)
    setDropTargetColumn(null)
  }

  const handleColumnDragOver =
    (columnKey: TicketQueueStatus) => (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault()
      event.dataTransfer.dropEffect = "move"
      setDropTargetColumn(columnKey)
    }

  const handleColumnDrop =
    (columnKey: TicketQueueStatus) => (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault()
      const ticketId = event.dataTransfer.getData("text/ticket-id")
      if (!ticketId) return

      onMoveTicket(ticketId, columnKey)
      setDraggingTicketId(null)
      setDropTargetColumn(null)
    }

  return (
    <div className="pb-2">
      <div className="mx-auto grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {ticketBoardColumns.map((column) => (
          <TicketColumn
            key={column.key}
            columnKey={column.key}
            title={column.label}
            tickets={tickets.filter(
              (ticket) => ticket.queueStatus === column.key
            )}
            draggingTicketId={draggingTicketId}
            isDropTarget={dropTargetColumn === column.key}
            onTicketDragStart={handleTicketDragStart}
            onTicketDragEnd={handleTicketDragEnd}
            onColumnDragOver={handleColumnDragOver(column.key)}
            onColumnDrop={handleColumnDrop(column.key)}
          />
        ))}
      </div>
    </div>
  )
}
