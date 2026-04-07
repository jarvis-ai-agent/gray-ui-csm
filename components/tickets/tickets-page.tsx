"use client"

import { useMemo, useState } from "react"
import { IconChevronDown, IconDownload, IconPlus } from "@tabler/icons-react"

import { TicketBoard } from "@/components/tickets/ticket-board"
import { TicketSearchToolbar } from "@/components/tickets/ticket-search-toolbar"
import { TicketStats } from "@/components/tickets/ticket-stats"
import { Button } from "@/components/ui/button"
import { filterTicketsByView, tickets as initialTickets } from "@/lib/tickets/mock-data"
import type {
  Ticket,
  TicketQueueStatus,
  TicketStat,
  TicketTrend,
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

function calculateTrend(current: number, previous: number): Pick<TicketStat, "delta" | "deltaPercent" | "trend"> {
  const delta = current - previous
  const deltaPercent =
    previous === 0 ? (current === 0 ? 0 : 100) : Number(((delta / previous) * 100).toFixed(1))
  const trend: TicketTrend = delta > 0 ? "up" : delta < 0 ? "down" : "flat"

  return { delta, deltaPercent, trend }
}

function buildStats(sourceTickets: typeof initialTickets): TicketStat[] {
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

  const previousByKey = {
    total: Math.max(total - 3, 0),
    open: Math.max(open + 2, 0),
    pending: Math.max(pending + 1, 0),
    resolved: Math.max(resolved - 2, 0),
  }

  const totalTrend = calculateTrend(total, previousByKey.total)
  const openTrend = calculateTrend(open, previousByKey.open)
  const pendingTrend = calculateTrend(pending, previousByKey.pending)
  const resolvedTrend = calculateTrend(resolved, previousByKey.resolved)

  return [
    {
      key: "total",
      label: "Total Tickets",
      value: total,
      previousValue: previousByKey.total,
      ...totalTrend,
      comparison: "vs last week",
    },
    {
      key: "open",
      label: "Open",
      value: open,
      previousValue: previousByKey.open,
      ...openTrend,
      comparison: "vs last week",
    },
    {
      key: "pending",
      label: "Pending",
      value: pending,
      previousValue: previousByKey.pending,
      ...pendingTrend,
      comparison: "vs last week",
    },
    {
      key: "resolved",
      label: "Resolved",
      value: resolved,
      previousValue: previousByKey.resolved,
      ...resolvedTrend,
      comparison: "vs last week",
    },
  ]
}

function sortTicketsByBoardOrder(sourceTickets: Ticket[]) {
  return [...sourceTickets].sort((leftTicket, rightTicket) => {
    if (leftTicket.boardOrder === rightTicket.boardOrder) {
      return leftTicket.id.localeCompare(rightTicket.id)
    }

    return leftTicket.boardOrder - rightTicket.boardOrder
  })
}

type TicketsPageProps = {
  initialView?: string | null
}

export function TicketsPage({ initialView = "all" }: TicketsPageProps) {
  const activeView = getViewFromSearchParam(initialView)

  const [ticketItems, setTicketItems] = useState(initialTickets)
  const [isStatsExpanded, setIsStatsExpanded] = useState(true)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | TicketQueueStatus>(
    "all"
  )

  const visibleByView = useMemo(
    () => filterTicketsByView(ticketItems, activeView),
    [activeView, ticketItems]
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

  const handleMoveTicket = (
    ticketId: string,
    queueStatus: TicketQueueStatus,
    insertBeforeTicketId?: string | null
  ) => {
    setTicketItems((previousTickets) => {
      const movingTicket = previousTickets.find((ticket) => ticket.id === ticketId)
      if (!movingTicket) return previousTickets

      const sourceQueueStatus = movingTicket.queueStatus
      const sourceColumnTickets = sortTicketsByBoardOrder(
        previousTickets.filter(
          (ticket) =>
            ticket.queueStatus === sourceQueueStatus && ticket.id !== ticketId
        )
      )
      const targetColumnTickets = sortTicketsByBoardOrder(
        previousTickets.filter(
          (ticket) => ticket.queueStatus === queueStatus && ticket.id !== ticketId
        )
      )
      const nextTargetColumnTickets =
        sourceQueueStatus === queueStatus
          ? [...sourceColumnTickets]
          : [...targetColumnTickets]
      const insertIndex = insertBeforeTicketId
        ? nextTargetColumnTickets.findIndex(
            (ticket) => ticket.id === insertBeforeTicketId
          )
        : nextTargetColumnTickets.length
      const nextMovingTicket = {
        ...movingTicket,
        queueStatus,
      }

      nextTargetColumnTickets.splice(
        insertIndex === -1 ? nextTargetColumnTickets.length : insertIndex,
        0,
        nextMovingTicket
      )

      const nextSourceColumnTickets =
        sourceQueueStatus === queueStatus
          ? nextTargetColumnTickets
          : sourceColumnTickets
      const orderUpdates = new Map<
        string,
        Pick<Ticket, "queueStatus" | "boardOrder">
      >()

      nextSourceColumnTickets.forEach((ticket, index) => {
        orderUpdates.set(ticket.id, {
          queueStatus: sourceQueueStatus === queueStatus ? queueStatus : sourceQueueStatus,
          boardOrder: index,
        })
      })

      if (sourceQueueStatus !== queueStatus) {
        nextTargetColumnTickets.forEach((ticket, index) => {
          orderUpdates.set(ticket.id, {
            queueStatus,
            boardOrder: index,
          })
        })
      }

      return previousTickets.map((ticket) => {
        const update = orderUpdates.get(ticket.id)

        if (!update) return ticket

        return {
          ...ticket,
          queueStatus: update.queueStatus,
          boardOrder: update.boardOrder,
        }
      })
    })
  }

  return (
    <div className="space-y-4">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl leading-tight font-semibold tracking-tight text-foreground">
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
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-9 rounded-xl"
            onClick={() => setIsStatsExpanded((previousValue) => !previousValue)}
            aria-expanded={isStatsExpanded}
            aria-controls="ticket-metrics"
          >
            <IconChevronDown
              className={`size-4 transition-transform ${
                isStatsExpanded ? "rotate-180" : ""
              }`}
            />
            <span className="sr-only">Toggle ticket metrics</span>
          </Button>
        </div>
      </section>

      {isStatsExpanded ? (
        <div id="ticket-metrics">
          <TicketStats stats={stats} />
        </div>
      ) : null}

      <TicketSearchToolbar
        query={query}
        onQueryChange={setQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <TicketBoard tickets={filteredTickets} onMoveTicket={handleMoveTicket} />
    </div>
  )
}
