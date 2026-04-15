import { IconArrowsSort, IconChevronDown, IconDownload, IconPlus } from "@tabler/icons-react"
import type { MouseEvent } from "react"

import { DataGridColumnOptionsMenu, type DataGridToolbarRenderProps } from "@/components/data-grid"
import {
  bulkPriorityOptions,
  bulkStatusLabel,
  bulkStatusOptions,
} from "@/components/tickets/tickets-page-helpers"
import {
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
import type { TicketAssignee, TicketPriority, TicketQueueStatus } from "@/lib/tickets/types"

type TicketsPageHeaderProps = {
  isStatsExpanded: boolean
  onToggleStats: () => void
  onCreateTicket: (event?: MouseEvent<HTMLButtonElement>) => void
}

export function TicketsPageHeader({
  isStatsExpanded,
  onToggleStats,
  onCreateTicket,
}: TicketsPageHeaderProps) {
  return (
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
          <Button size="sm" className="h-9 rounded-xl" onClick={onCreateTicket}>
            <IconPlus className="size-4" />
            New Ticket
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-9 rounded-xl"
            onClick={onToggleStats}
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
            onClick={onToggleStats}
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
  )
}

type TicketsTableActionsProps = {
  tableToolbarProps: DataGridToolbarRenderProps<TicketColumnId> | null
  sortPreset: TicketSortPreset
  onSortPresetChange: (nextPreset: TicketSortPreset) => void
  visibleAssigneeOptions: TicketAssignee[]
  onBulkStatusChange: (status: TicketQueueStatus) => void
  onBulkPriorityChange: (priority: TicketPriority) => void
  onBulkAssigneeChange: (assignee?: TicketAssignee) => void
}

export function TicketsTableActions({
  tableToolbarProps,
  sortPreset,
  onSortPresetChange,
  visibleAssigneeOptions,
  onBulkStatusChange,
  onBulkPriorityChange,
  onBulkAssigneeChange,
}: TicketsTableActionsProps) {
  return (
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
                  onClick={() => onBulkStatusChange(status)}
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
                  onClick={() => onBulkPriorityChange(priority)}
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
              <DropdownMenuItem onClick={() => onBulkAssigneeChange(undefined)}>
                Unassigned
              </DropdownMenuItem>
              {visibleAssigneeOptions.map((assignee) => (
                <DropdownMenuItem
                  key={assignee.name}
                  onClick={() => onBulkAssigneeChange(assignee)}
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
            onValueChange={(value) => onSortPresetChange(value as TicketSortPreset)}
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
  )
}
