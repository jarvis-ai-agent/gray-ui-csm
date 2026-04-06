"use client"

import { useMemo, useState } from "react"
import { IconChevronDown, IconDownload, IconPlus } from "@tabler/icons-react"

import { TicketBoard } from "@/components/tickets/ticket-board"
import { TicketSearchToolbar } from "@/components/tickets/ticket-search-toolbar"
import { TicketStats } from "@/components/tickets/ticket-stats"
import { Button } from "@/components/ui/button"
import { filterTicketsByView, tickets } from "@/lib/tickets/mock-data"
import type {
  TicketQueueStatus,
  TicketStat,
  TicketViewKey,
} from "@/lib/tickets/types"

const ALLOWED_VIEWS: TicketViewKey[] = [
  "all",
  "mine",
  "unassigned",
  "past-due",
  "escalated",
]

function getViewFromSearchParam(view: string | null): TicketViewKey {
  if (view && ALLOWED_VIEWS.includes(view as TicketViewKey)) {
    return view as TicketViewKey
  }

  return "all"
}

function buildStats(sourceTickets: typeof tickets): TicketStat[] {
  const total = sourceTickets.length
  const open = sourceTickets.filter(
    (ticket) => ticket.queueStatus === "open"
  ).length
  const pending = sourceTickets.filter(
    (ticket) => ticket.queueStatus === "pending"
  ).length
  const resolved = sourceTickets.filter(
    (ticket) => ticket.queueStatus === "resolved"
  ).length

  return [
    {
      key: "total",
      label: "Total Tickets",
      value: total,
      comparison: "vs last week",
    },
    { key: "open", label: "Open", value: open, comparison: "vs last week" },
    {
      key: "pending",
      label: "Pending",
      value: pending,
      comparison: "vs last week",
    },
    {
      key: "resolved",
      label: "Resolved",
      value: resolved,
      comparison: "vs last week",
    },
  ]
}

type TicketsPageProps = {
  initialView?: string | null
}

export function TicketsPage({ initialView = "all" }: TicketsPageProps) {
  const activeView = getViewFromSearchParam(initialView)

  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | TicketQueueStatus>(
    "all"
  )

  const visibleByView = useMemo(
    () => filterTicketsByView(tickets, activeView),
    [activeView]
  )

  const stats = useMemo(() => buildStats(visibleByView), [visibleByView])

  const filteredTickets = useMemo(() => {
    return visibleByView.filter((ticket) => {
      const matchesStatus =
        statusFilter === "all" ? true : ticket.queueStatus === statusFilter
      const normalizedQuery = query.trim().toLowerCase()
      const matchesQuery =
        normalizedQuery.length === 0
          ? true
          : `${ticket.subject} ${ticket.ticketNumber}`
              .toLowerCase()
              .includes(normalizedQuery)

      return matchesStatus && matchesQuery
    })
  }, [query, statusFilter, visibleByView])

  return (
    <div className="space-y-4">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[30px] leading-[1.2] font-semibold tracking-tight text-foreground">
          Tickets
        </h1>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 rounded-xl">
            <IconDownload className="size-4" />
            Export
          </Button>
          <Button size="sm" className="h-9 rounded-xl">
            <IconPlus className="size-4" />
            New Ticket
          </Button>
          <Button variant="ghost" size="icon-sm" className="size-9 rounded-xl">
            <IconChevronDown className="size-4" />
            <span className="sr-only">Open more actions</span>
          </Button>
        </div>
      </section>

      <TicketStats stats={stats} />

      <TicketSearchToolbar
        query={query}
        onQueryChange={setQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <TicketBoard tickets={filteredTickets} />
    </div>
  )
}
