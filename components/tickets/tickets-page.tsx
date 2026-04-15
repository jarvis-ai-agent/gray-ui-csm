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
import {
  bulkPriorityOptions,
  bulkStatusLabel,
  bulkStatusOptions,
  buildStats,
  createDraftTicket,
  getLayoutFromSearchParam,
  getNextTicketSequence,
  getViewFromSearchParam,
  NEW_TICKET_ID,
  sortTicketsByBoardOrder,
} from "@/components/tickets/tickets-page-helpers"
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
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
  TicketDrawerOrigin,
  TicketPerson,
  TicketQueueStatus,
  TicketSubmitAction,
} from "@/lib/tickets/types"
import { useIsMobile } from "@/hooks/use-mobile"

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
  const isMobile = useIsMobile()

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
  const [drawerOrigin, setDrawerOrigin] = useState<TicketDrawerOrigin | null>(
    null
  )
  const [isDiscardDraftDialogOpen, setIsDiscardDraftDialogOpen] =
    useState(false)

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

  const handleOpenTicket = (ticketId: string, origin?: TicketDrawerOrigin) => {
    setDrawerOrigin(origin ?? null)
    const nextSearchParams = new URLSearchParams(searchParams.toString())
    nextSearchParams.set("view", activeView)
    nextSearchParams.set("layout", activeLayout)
    nextSearchParams.set("ticket", ticketId)
    replaceSearchParams(nextSearchParams)
  }

  const handleCreateTicket = (event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) {
      const rect = event.currentTarget.getBoundingClientRect()
      setDrawerOrigin({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      })
    }

    const nextSequence = getNextTicketSequence(ticketItems)
    setCreateTicketDraft(createDraftTicket(nextSequence))

    const nextSearchParams = new URLSearchParams(searchParams.toString())
    nextSearchParams.set("view", activeView)
    nextSearchParams.set("layout", activeLayout)
    nextSearchParams.set("ticket", NEW_TICKET_ID)
    replaceSearchParams(nextSearchParams)
  }

  const closeTicketImmediately = () => {
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

  const handleCloseTicket = () => {
    if (activeTicketId && activeDraft.trim().length > 0) {
      setIsDiscardDraftDialogOpen(true)
      return
    }

    closeTicketImmediately()
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
    <div className="space-y-4 max-sm:space-y-3">
      <section className="flex items-center justify-between gap-2 max-sm:py-1">
        <h1 className="min-w-0 text-xl leading-tight font-semibold tracking-tight text-foreground max-sm:text-lg max-sm:leading-6 sm:text-3xl">
          Tickets
        </h1>

        <div className="flex shrink-0 items-center gap-2 max-sm:gap-1.5">
          <div className="hidden items-center gap-2 sm:flex">
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

          <div className="flex items-center gap-2 sm:hidden">
            <Button
              variant="outline"
              size="icon-sm"
              className="size-9 rounded-xl max-sm:size-8"
              aria-label="Export tickets"
            >
              <IconDownload className="size-4" />
              <span className="sr-only">Export</span>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-9 rounded-xl max-sm:size-8"
              onClick={() =>
                setIsStatsExpanded((previousValue) => !previousValue)
              }
              aria-expanded={isStatsExpanded}
              aria-controls="ticket-metrics"
              aria-label="Toggle ticket metrics"
            >
              <IconChevronDown
                className={`size-4 transition-transform ${
                  isStatsExpanded ? "rotate-180" : ""
                }`}
              />
              <span className="sr-only">Toggle ticket metrics</span>
            </Button>
          </div>
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
          compactColumns={isMobile}
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
        origin={drawerOrigin}
        onDraftMessageChange={handleDraftMessageChange}
        onOpenChange={handleDrawerOpenChange}
        onUpdateTicket={updateTicketItem}
        onSubmitMessage={handleSubmitMessage}
        onReplyFromAddressChange={handleReplyFromAddressChange}
      />

      <ConfirmDialog
        open={isDiscardDraftDialogOpen}
        onOpenChange={setIsDiscardDraftDialogOpen}
        title="Discard unsent draft?"
        description="Your current reply has not been sent yet. If you close the drawer now, the draft will be lost."
        cancelLabel="Keep editing"
        confirmLabel="Discard draft"
        confirmVariant="default"
        onConfirm={() => {
          setIsDiscardDraftDialogOpen(false)
          closeTicketImmediately()
        }}
      />

      {isMobile && activeTicket === null ? (
        <Button
          size="icon"
          className="fixed right-4 z-40 size-11 rounded-full shadow-lg"
          style={{
            bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)",
          }}
          onClick={handleCreateTicket}
          aria-label="Create new ticket"
        >
          <IconPlus className="size-[18px]" />
          <span className="sr-only">New Ticket</span>
        </Button>
      ) : null}

    </div>
  )
}
