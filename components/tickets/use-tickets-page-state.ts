"use client"

import { startTransition, useEffect, useMemo, useState } from "react"
import type { MouseEvent } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  buildStats,
  createDraftTicket,
  getLayoutFromSearchParam,
  getNextTicketSequence,
  getViewFromSearchParam,
  NEW_TICKET_ID,
  sortTicketsByBoardOrder,
} from "@/components/tickets/tickets-page-helpers"
import {
  filterTicketsByView,
  tickets as initialTickets,
} from "@/lib/tickets/mock-data"
import { currentUser } from "@/lib/current-user"
import type {
  Ticket,
  TicketAssignee,
  TicketDrawerOrigin,
  TicketLayoutMode,
  TicketPerson,
  TicketQueueStatus,
  TicketSubmitAction,
} from "@/lib/tickets/types"
import { useIsMobile } from "@/hooks/use-mobile"
import type { DataGridToolbarRenderProps } from "@/components/data-grid"
import type { TicketColumnId, TicketSortPreset } from "./ticket-table"

type UseTicketsPageStateArgs = {
  initialView?: string | null
  initialLayout?: string | null
}

export function useTicketsPageState({
  initialView = "all",
  initialLayout = "board",
}: UseTicketsPageStateArgs = {}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeView = getViewFromSearchParam(searchParams.get("view") ?? initialView)
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
  const [activeLayout, setActiveLayout] = useState<TicketLayoutMode>(resolvedLayout)
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
  const drawerMode: "create" | "edit" =
    activeTicketId === NEW_TICKET_ID ? "create" : "edit"

  const activeDraft = activeTicketId ? (messageDrafts[activeTicketId] ?? "") : ""
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

  const handleCreateTicket = (event?: MouseEvent<HTMLButtonElement>) => {
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

  return {
    isMobile,
    activeLayout,
    handleLayoutModeChange,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    sortPreset,
    setSortPreset,
    stats,
    isStatsExpanded,
    setIsStatsExpanded,
    filteredTickets,
    tableToolbarProps,
    setTableToolbarProps,
    visibleAssigneeOptions,
    updateSelectedTickets,
    handleOpenTicket,
    handleVisibleTicketsChange,
    handleMoveTicket,
    activeTicket,
    drawerMode,
    drawerAssigneeOptions,
    drawerPeopleOptions,
    activeDraft,
    activeReplyFrom,
    drawerOrigin,
    handleDraftMessageChange,
    handleDrawerOpenChange,
    updateTicketItem,
    handleSubmitMessage,
    handleReplyFromAddressChange,
    isDiscardDraftDialogOpen,
    setIsDiscardDraftDialogOpen,
    closeTicketImmediately,
    handleCreateTicket,
  }
}
