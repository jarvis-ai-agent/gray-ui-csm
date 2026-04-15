"use client"

import { IconPlus } from "@tabler/icons-react"

import { TicketBoard } from "@/components/tickets/ticket-board"
import { TicketDrawer } from "@/components/tickets/ticket-drawer"
import { TicketSearchToolbar } from "@/components/tickets/ticket-search-toolbar"
import {
  TicketsPageHeader,
  TicketsTableActions,
} from "@/components/tickets/tickets-page-sections"
import { TicketStats } from "@/components/tickets/ticket-stats"
import { TicketTable } from "@/components/tickets/ticket-table"
import { useTicketsPageState } from "@/components/tickets/use-tickets-page-state"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

type TicketsPageProps = {
  initialView?: string | null
  initialLayout?: string | null
}

export function TicketsPage({
  initialView = "all",
  initialLayout = "board",
}: TicketsPageProps) {
  const {
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
  } = useTicketsPageState({ initialView, initialLayout })

  return (
    <div className="space-y-4 max-sm:space-y-3">
      <TicketsPageHeader
        isStatsExpanded={isStatsExpanded}
        onToggleStats={() =>
          setIsStatsExpanded((previousValue) => !previousValue)
        }
        onCreateTicket={handleCreateTicket}
      />

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
            <TicketsTableActions
              tableToolbarProps={tableToolbarProps}
              sortPreset={sortPreset}
              onSortPresetChange={setSortPreset}
              visibleAssigneeOptions={visibleAssigneeOptions}
              onBulkStatusChange={(status) =>
                updateSelectedTickets((ticket) => ({
                  ...ticket,
                  queueStatus: status,
                }))
              }
              onBulkPriorityChange={(priority) =>
                updateSelectedTickets((ticket) => ({
                  ...ticket,
                  priority,
                }))
              }
              onBulkAssigneeChange={(assignee) =>
                updateSelectedTickets((ticket) => ({
                  ...ticket,
                  assignee,
                }))
              }
            />
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
