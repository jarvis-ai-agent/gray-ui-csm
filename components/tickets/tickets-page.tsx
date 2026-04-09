"use client"

import { startTransition, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  IconArrowsSort,
  IconChevronDown,
  IconDownload,
  IconPlus,
} from "@tabler/icons-react"

import {
  DataGridColumnOptionsMenu,
  type DataGridToolbarRenderProps,
} from "@/components/data-grid"
import { TicketBoard } from "@/components/tickets/ticket-board"
import { TicketDrawer } from "@/components/tickets/ticket-drawer"
import { TicketSearchToolbar } from "@/components/tickets/ticket-search-toolbar"
import { TicketStats } from "@/components/tickets/ticket-stats"
import {
  TicketTable,
  type TicketColumnId,
  ticketSortLabels,
  ticketSortPresets,
  type TicketSortPreset,
} from "@/components/tickets/ticket-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  filterTicketsByView,
  tickets as initialTickets,
} from "@/lib/tickets/mock-data"
import { currentUser } from "@/lib/current-user"
import type {
  TicketAssignee,
  TicketLayoutMode,
  Ticket,
  TicketPerson,
  TicketPriority,
  TicketQueueStatus,
  TicketStat,
  TicketSubmitAction,
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

const ALLOWED_LAYOUTS: TicketLayoutMode[] = ["board", "table"]
const bulkStatusOptions: TicketQueueStatus[] = [
  "open",
  "pending",
  "resolved",
  "closed",
]
const bulkPriorityOptions: TicketPriority[] = [
  "urgent",
  "high",
  "medium",
  "low",
  "todo",
]
const bulkStatusLabel: Record<TicketQueueStatus, string> = {
  open: "Open",
  pending: "Pending",
  resolved: "Resolved",
  closed: "Closed",
}
const NEW_TICKET_ID = "__new-ticket__"

function createDraftTicket(nextIndex: number): Ticket {
  const paddedIndex = String(nextIndex).padStart(3, "0")

  return {
    id: NEW_TICKET_ID,
    ticketNumber: `#-${paddedIndex}`,
    subject: "",
    queueStatus: "open",
    boardOrder: 0,
    health: "on-track",
    channel: "email",
    trend: "flat",
    requester: undefined,
    assignee: {
      name: currentUser.name,
      avatarUrl: currentUser.avatar,
      email: currentUser.email,
    },
    followers: [],
    tags: [],
    ticketType: "incident",
    category: "other",
    priority: "medium",
    mine: true,
    escalated: false,
    pastDue: false,
  }
}

function getNextTicketSequence(sourceTickets: Ticket[]) {
  return (
    sourceTickets.reduce((maxValue, ticket) => {
      const numericPart = Number(ticket.id.replace(/[^\d]/g, ""))
      return Number.isFinite(numericPart)
        ? Math.max(maxValue, numericPart)
        : maxValue
    }, 0) + 1
  )
}

function getViewFromSearchParam(view: string | null): TicketViewKey {
  if (view && ALLOWED_VIEWS.includes(view as TicketViewKey)) {
    return view as TicketViewKey
  }

  return "all"
}

function getLayoutFromSearchParam(layout: string | null): TicketLayoutMode {
  if (layout && ALLOWED_LAYOUTS.includes(layout as TicketLayoutMode)) {
    return layout as TicketLayoutMode
  }

  return "board"
}

function calculateTrend(
  current: number,
  previous: number
): Pick<TicketStat, "delta" | "deltaPercent" | "trend"> {
  const delta = current - previous
  const deltaPercent =
    previous === 0
      ? current === 0
        ? 0
        : 100
      : Number(((delta / previous) * 100).toFixed(1))
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
  initialLayout?: string | null
}

export function TicketsPage({
  initialView = "all",
  initialLayout = "board",
}: TicketsPageProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeView = getViewFromSearchParam(
    searchParams.get("view") ?? initialView
  )
  const resolvedLayout = getLayoutFromSearchParam(
    searchParams.get("layout") ?? initialLayout
  )
  const activeTicketId = searchParams.get("ticket")

  const [ticketItems, setTicketItems] = useState(initialTickets)
  const [isStatsExpanded, setIsStatsExpanded] = useState(true)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | TicketQueueStatus>(
    "all"
  )
  const [sortPreset, setSortPreset] = useState<TicketSortPreset>("boardOrder")
  const [activeLayout, setActiveLayout] =
    useState<TicketLayoutMode>(resolvedLayout)
  const [tableToolbarProps, setTableToolbarProps] =
    useState<DataGridToolbarRenderProps<TicketColumnId> | null>(null)
  const [messageDrafts, setMessageDrafts] = useState<Record<string, string>>({})
  const [replyFromByTicketId, setReplyFromByTicketId] = useState<
    Record<string, string>
  >({})
  const [createTicketDraft, setCreateTicketDraft] = useState<Ticket | null>(
    null
  )

  useEffect(() => {
    setActiveLayout(resolvedLayout)
  }, [resolvedLayout])

  const handleLayoutModeChange = (layoutMode: TicketLayoutMode) => {
    if (layoutMode === activeLayout) return

    setActiveLayout(layoutMode)

    const nextSearchParams = new URLSearchParams(searchParams.toString())
    nextSearchParams.set("view", activeView)
    nextSearchParams.set("layout", layoutMode)

    startTransition(() => {
      router.replace(`${pathname}?${nextSearchParams.toString()}`, {
        scroll: false,
      })
    })
  }

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

  const visibleAssigneeOptions = useMemo(() => {
    const optionsMap = new Map<string, TicketAssignee>()

    filteredTickets.forEach((ticket) => {
      if (!ticket.assignee) return
      if (optionsMap.has(ticket.assignee.name)) return
      optionsMap.set(ticket.assignee.name, ticket.assignee)
    })

    return Array.from(optionsMap.values()).sort((left, right) =>
      left.name.localeCompare(right.name)
    )
  }, [filteredTickets])

  const drawerAssigneeOptions = useMemo(() => {
    const optionsMap = new Map<string, TicketAssignee>()

    ticketItems.forEach((ticket) => {
      if (!ticket.assignee) return
      if (optionsMap.has(ticket.assignee.name)) return
      optionsMap.set(ticket.assignee.name, ticket.assignee)
    })

    return Array.from(optionsMap.values()).sort((left, right) =>
      left.name.localeCompare(right.name)
    )
  }, [ticketItems])

  const drawerPeopleOptions = useMemo(() => {
    const optionsMap = new Map<string, TicketPerson>()

    ticketItems.forEach((ticket) => {
      const candidates = [
        ticket.requester,
        ticket.assignee,
        ...(ticket.followers ?? []),
      ].filter(Boolean) as TicketPerson[]

      candidates.forEach((person) => {
        if (!optionsMap.has(person.name)) {
          optionsMap.set(person.name, person)
        }
      })
    })

    if (!optionsMap.has(currentUser.name)) {
      optionsMap.set(currentUser.name, {
        name: currentUser.name,
        avatarUrl: currentUser.avatar,
        email: currentUser.email,
      })
    }

    return Array.from(optionsMap.values()).sort((left, right) =>
      left.name.localeCompare(right.name)
    )
  }, [ticketItems])

  const activeTicket = useMemo(
    () =>
      activeTicketId === NEW_TICKET_ID
        ? createTicketDraft
        : activeTicketId
          ? (ticketItems.find((ticket) => ticket.id === activeTicketId) ?? null)
          : null,
    [activeTicketId, createTicketDraft, ticketItems]
  )
  const drawerMode = activeTicketId === NEW_TICKET_ID ? "create" : "edit"

  const activeDraft = activeTicketId
    ? (messageDrafts[activeTicketId] ?? "")
    : ""
  const activeReplyFrom = activeTicketId
    ? replyFromByTicketId[activeTicketId]
    : undefined

  const replaceSearchParams = (nextSearchParams: URLSearchParams) => {
    startTransition(() => {
      router.replace(`${pathname}?${nextSearchParams.toString()}`, {
        scroll: false,
      })
    })
  }

  const handleVisibleTicketsChange = (nextVisibleTickets: Ticket[]) => {
    const updates = new Map(
      nextVisibleTickets.map((ticket) => [ticket.id, ticket] as const)
    )

    setTicketItems((previousTickets) =>
      previousTickets.map((ticket) => updates.get(ticket.id) ?? ticket)
    )
  }

  const updateTicketItem = (
    ticketId: string,
    updater: (currentTicket: Ticket) => Ticket
  ) => {
    if (ticketId === NEW_TICKET_ID) {
      setCreateTicketDraft((currentDraft) =>
        currentDraft ? updater(currentDraft) : currentDraft
      )
      return
    }

    setTicketItems((previousTickets) =>
      previousTickets.map((ticket) =>
        ticket.id === ticketId ? updater(ticket) : ticket
      )
    )
  }

  const updateSelectedTickets = (updater: (ticket: Ticket) => Ticket) => {
    const selectedRowIds = tableToolbarProps?.selectedRowIds ?? []
    if (selectedRowIds.length === 0) return

    const selectedIds = new Set(selectedRowIds)

    setTicketItems((previousTickets) =>
      previousTickets.map((ticket) =>
        selectedIds.has(ticket.id) ? updater(ticket) : ticket
      )
    )
  }

  const handleMoveTicket = (
    ticketId: string,
    queueStatus: TicketQueueStatus,
    insertBeforeTicketId?: string | null
  ) => {
    setTicketItems((previousTickets) => {
      const movingTicket = previousTickets.find(
        (ticket) => ticket.id === ticketId
      )
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
          (ticket) =>
            ticket.queueStatus === queueStatus && ticket.id !== ticketId
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
          queueStatus:
            sourceQueueStatus === queueStatus ? queueStatus : sourceQueueStatus,
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

  const handleOpenTicket = (ticketId: string) => {
    const nextSearchParams = new URLSearchParams(searchParams.toString())
    nextSearchParams.set("view", activeView)
    nextSearchParams.set("layout", activeLayout)
    nextSearchParams.set("ticket", ticketId)
    replaceSearchParams(nextSearchParams)
  }

  const handleCreateTicket = () => {
    const nextSequence = getNextTicketSequence(ticketItems)
    setCreateTicketDraft(createDraftTicket(nextSequence))

    const nextSearchParams = new URLSearchParams(searchParams.toString())
    nextSearchParams.set("view", activeView)
    nextSearchParams.set("layout", activeLayout)
    nextSearchParams.set("ticket", NEW_TICKET_ID)
    replaceSearchParams(nextSearchParams)
  }

  const handleCloseTicket = () => {
    if (
      activeTicketId &&
      activeDraft.trim().length > 0 &&
      !window.confirm("You have an unsent draft. Close the drawer anyway?")
    ) {
      return
    }

    const nextSearchParams = new URLSearchParams(searchParams.toString())
    nextSearchParams.delete("ticket")
    nextSearchParams.set("view", activeView)
    nextSearchParams.set("layout", activeLayout)

    if (activeTicketId === NEW_TICKET_ID) {
      setCreateTicketDraft(null)
      setMessageDrafts((currentDrafts) => {
        const nextDrafts = { ...currentDrafts }
        delete nextDrafts[NEW_TICKET_ID]
        return nextDrafts
      })
      setReplyFromByTicketId((currentAddresses) => {
        const nextAddresses = { ...currentAddresses }
        delete nextAddresses[NEW_TICKET_ID]
        return nextAddresses
      })
    }

    replaceSearchParams(nextSearchParams)
  }

  const handleDrawerOpenChange = (open: boolean) => {
    if (!open) {
      handleCloseTicket()
    }
  }

  const handleDraftMessageChange = (nextDraft: string) => {
    if (!activeTicketId) return

    setMessageDrafts((currentDrafts) => ({
      ...currentDrafts,
      [activeTicketId]: nextDraft,
    }))
  }

  const handleSubmitMessage = (
    ticketId: string,
    action: TicketSubmitAction = "send"
  ) => {
    if (ticketId === NEW_TICKET_ID) {
      if (!createTicketDraft) return

      const subject = createTicketDraft.subject.trim()
      if (!subject) return

      setTicketItems((previousTickets) => {
        const nextSequence = getNextTicketSequence(previousTickets)
        const paddedIndex = String(nextSequence).padStart(3, "0")
        const openTicketCount = previousTickets.filter(
          (ticket) => ticket.queueStatus === "open"
        ).length

        return [
          {
            ...createTicketDraft,
            id: `t-${paddedIndex}`,
            ticketNumber: `#-${paddedIndex}`,
            subject,
            boardOrder: openTicketCount,
          },
          ...previousTickets,
        ]
      })

      setCreateTicketDraft(null)
      setMessageDrafts((currentDrafts) => {
        const nextDrafts = { ...currentDrafts }
        delete nextDrafts[NEW_TICKET_ID]
        return nextDrafts
      })
      setReplyFromByTicketId((currentAddresses) => {
        const nextAddresses = { ...currentAddresses }
        delete nextAddresses[NEW_TICKET_ID]
        return nextAddresses
      })

      const nextSearchParams = new URLSearchParams(searchParams.toString())
      nextSearchParams.delete("ticket")
      nextSearchParams.set("view", activeView)
      nextSearchParams.set("layout", activeLayout)
      replaceSearchParams(nextSearchParams)
      return
    }

    const draft = messageDrafts[ticketId]?.trim()
    if (!draft) return

    setMessageDrafts((currentDrafts) => ({
      ...currentDrafts,
      [ticketId]: "",
    }))

    updateTicketItem(ticketId, (ticket) => ({
      ...ticket,
      queueStatus:
        action === "resolved"
          ? "resolved"
          : action === "pending"
            ? "pending"
            : ticket.queueStatus === "open"
              ? "pending"
              : ticket.queueStatus,
    }))
  }

  const handleReplyFromAddressChange = (
    ticketId: string,
    nextAddress: string
  ) => {
    setReplyFromByTicketId((currentAddresses) => ({
      ...currentAddresses,
      [ticketId]: nextAddress,
    }))
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
          <Button
            size="sm"
            className="h-9 rounded-xl"
            onClick={handleCreateTicket}
          >
            <IconPlus className="size-4" />
            New Ticket
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-9 rounded-xl"
            onClick={() =>
              setIsStatsExpanded((previousValue) => !previousValue)
            }
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
        layoutMode={activeLayout}
        onLayoutModeChange={handleLayoutModeChange}
        tableActions={
          activeLayout === "table" ? (
            <>
              {tableToolbarProps && tableToolbarProps.selectedRowCount > 0 ? (
                <>
                  <div className="rounded-xl border bg-muted px-3 py-2 text-sm font-medium text-foreground">
                    {tableToolbarProps.selectedRowCount} selected
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 rounded-xl"
                          aria-label="Bulk change status"
                        />
                      }
                    >
                      Status
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-40">
                      {bulkStatusOptions.map((status) => (
                        <DropdownMenuItem
                          key={status}
                          onClick={() =>
                            updateSelectedTickets((ticket) => ({
                              ...ticket,
                              queueStatus: status,
                            }))
                          }
                        >
                          {bulkStatusLabel[status]}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 rounded-xl"
                          aria-label="Bulk change priority"
                        />
                      }
                    >
                      Priority
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-40">
                      {bulkPriorityOptions.map((priority) => (
                        <DropdownMenuItem
                          key={priority}
                          onClick={() =>
                            updateSelectedTickets((ticket) => ({
                              ...ticket,
                              priority,
                            }))
                          }
                        >
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 rounded-xl"
                          aria-label="Bulk assign tickets"
                        />
                      }
                    >
                      Assignee
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-48">
                      <DropdownMenuItem
                        onClick={() =>
                          updateSelectedTickets((ticket) => ({
                            ...ticket,
                            assignee: undefined,
                          }))
                        }
                      >
                        Unassigned
                      </DropdownMenuItem>
                      {visibleAssigneeOptions.map((assignee) => (
                        <DropdownMenuItem
                          key={assignee.name}
                          onClick={() =>
                            updateSelectedTickets((ticket) => ({
                              ...ticket,
                              assignee,
                            }))
                          }
                        >
                          {assignee.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 rounded-xl"
                    onClick={() => tableToolbarProps.clearSelection()}
                  >
                    Clear
                  </Button>
                </>
              ) : null}

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 rounded-xl"
                      aria-label="Open sort menu"
                    />
                  }
                >
                  <IconArrowsSort className="size-4" />
                  {ticketSortLabels[sortPreset]}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-48">
                  <DropdownMenuRadioGroup
                    value={sortPreset}
                    onValueChange={(value) =>
                      setSortPreset(value as TicketSortPreset)
                    }
                  >
                    {ticketSortPresets.map((preset) => (
                      <DropdownMenuRadioItem key={preset} value={preset}>
                        {ticketSortLabels[preset]}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {tableToolbarProps ? (
                <DataGridColumnOptionsMenu
                  {...tableToolbarProps}
                  triggerLabel="Table options"
                />
              ) : null}
            </>
          ) : null
        }
      />

      {activeLayout === "table" ? (
        <TicketTable
          tickets={filteredTickets}
          sortPreset={sortPreset}
          onOpenTicket={handleOpenTicket}
          onTicketsChange={handleVisibleTicketsChange}
          onToolbarPropsChange={setTableToolbarProps}
        />
      ) : (
        <TicketBoard
          tickets={filteredTickets}
          onOpenTicket={handleOpenTicket}
          onMoveTicket={handleMoveTicket}
        />
      )}

      <TicketDrawer
        open={activeTicket !== null}
        mode={drawerMode}
        ticket={activeTicket}
        assigneeOptions={drawerAssigneeOptions}
        peopleOptions={drawerPeopleOptions}
        draftMessage={activeDraft}
        replyFromAddress={activeReplyFrom}
        onDraftMessageChange={handleDraftMessageChange}
        onOpenChange={handleDrawerOpenChange}
        onUpdateTicket={updateTicketItem}
        onSubmitMessage={handleSubmitMessage}
        onReplyFromAddressChange={handleReplyFromAddressChange}
      />
    </div>
  )
}
