import { IconAdjustmentsHorizontal, IconSearch } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import type { TicketQueueStatus } from "@/lib/tickets/types"

type TicketStatusFilter = "all" | TicketQueueStatus

type TicketSearchToolbarProps = {
  query: string
  onQueryChange: (query: string) => void
  statusFilter: TicketStatusFilter
  onStatusFilterChange: (status: TicketStatusFilter) => void
}

const statusLabels: Record<TicketStatusFilter, string> = {
  all: "All Statuses",
  open: "Open",
  pending: "Pending",
  resolved: "Resolved",
  closed: "Closed",
}

const statusItems: TicketStatusFilter[] = [
  "all",
  "open",
  "pending",
  "resolved",
  "closed",
]

export function TicketSearchToolbar({
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
}: TicketSearchToolbarProps) {
  return (
    <section className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full max-w-md">
        <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search tickets by subject, customer, or ID..."
          className="h-10 rounded-xl border bg-background pl-9"
        />
      </div>

      <div className="flex items-center gap-2 self-end">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm" className="h-9 rounded-xl" />
            }
          >
            <IconAdjustmentsHorizontal className="size-4" />
            {statusLabels[statusFilter]}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-40">
            {statusItems.map((statusItem) => (
              <DropdownMenuItem
                key={statusItem}
                onClick={() => onStatusFilterChange(statusItem)}
              >
                {statusLabels[statusItem]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </section>
  )
}
