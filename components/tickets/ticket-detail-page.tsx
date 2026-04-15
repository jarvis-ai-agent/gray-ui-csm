"use client"

import { useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { IconArrowLeft, IconChevronDown, IconDots } from "@tabler/icons-react"

import {
  detailTabs,
  getAssigneePerson,
  getTicketNumberLabel,
  getTicketTypeLabel,
  type RightPanelSection,
  statusLabel,
  statusToneClassName,
  channelLabel,
  priorityLabel,
} from "@/components/tickets/ticket-detail-helpers"
import {
  ActivityTabContent,
  ConversationTabContent,
  NotesTabContent,
  TaskTabContent,
  TicketDetailRightPanel,
} from "@/components/tickets/ticket-detail-sections"
import { TicketPriorityIndicator } from "@/components/tickets/ticket-priority-indicator"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { currentUser, replyFromAccounts } from "@/lib/current-user"
import type { Ticket, TicketQueueStatus } from "@/lib/tickets/types"
import type {
  TicketDetail,
  TicketDetailTab,
  TicketNote,
  TicketTimelineEvent,
  TicketTimelineItem,
} from "@/lib/tickets/detail-data"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

type TicketDetailPageProps = {
  ticket: Ticket
  detail: TicketDetail
  initialTab?: TicketDetailTab
}

export function TicketDetailPage({
  ticket,
  detail,
  initialTab = "conversation",
}: TicketDetailPageProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchTab = searchParams.get("tab")
  const isMobile = useIsMobile()

  const [queueStatus, setQueueStatus] = useState<TicketQueueStatus>(
    ticket.queueStatus
  )
  const [timeline, setTimeline] = useState(detail.timeline)
  const [tasks, setTasks] = useState(detail.tasks)
  const [notes, setNotes] = useState(detail.notes)
  const [draftMessage, setDraftMessage] = useState("")
  const [noteDraft, setNoteDraft] = useState("")
  const [isDesktopRightPanelOpen, setIsDesktopRightPanelOpen] = useState(true)
  const [activeRightPanelSection, setActiveRightPanelSection] =
    useState<RightPanelSection>("details")
  const [replyFrom, setReplyFrom] = useState<string>(
    replyFromAccounts[0]?.address ?? ""
  )
  const [templateQuery, setTemplateQuery] = useState("")

  const isRightPanelOpen = !isMobile && isDesktopRightPanelOpen

  const selectedReplyAccount =
    replyFromAccounts.find((account) => account.address === replyFrom) ??
    replyFromAccounts[0]

  const conversationItems = timeline.filter(
    (item) => item.kind === "message" || item.kind === "event"
  )
  const activityItems = timeline.filter(
    (item): item is TicketTimelineEvent => item.kind === "event"
  )

  const agent = ticket.assignee ?? {
    name: currentUser.name,
    avatarUrl: currentUser.avatar,
    email: currentUser.email,
  }

  const activeTab = detailTabs.some((tab) => tab.value === searchTab)
    ? (searchTab as TicketDetailTab)
    : initialTab

  const updateTab = (nextTab: TicketDetailTab) => {
    const nextSearchParams = new URLSearchParams(searchParams.toString())
    nextSearchParams.set("tab", nextTab)

    router.replace(`${pathname}?${nextSearchParams.toString()}`, {
      scroll: false,
    })
  }

  const appendTimelineEvent = (event: TicketTimelineItem) => {
    setTimeline((currentTimeline) => [...currentTimeline, event])
  }

  const handleSubmitReply = (nextStatus?: TicketQueueStatus) => {
    const trimmedDraft = draftMessage.trim()

    if (trimmedDraft) {
      appendTimelineEvent({
        id: `${ticket.id}-reply-${Date.now()}`,
        kind: "message",
        timestamp: "Now",
        direction: "outbound",
        author: agent,
        channel: ticket.channel,
        body: trimmedDraft,
      })
      setDraftMessage("")
    }

    if (nextStatus) {
      setQueueStatus(nextStatus)
      appendTimelineEvent({
        id: `${ticket.id}-status-${Date.now()}`,
        kind: "event",
        timestamp: "Now",
        title: `Ticket status changed to ${statusLabel[nextStatus]}`,
        detail: `The ticket is now marked as ${statusLabel[nextStatus].toLowerCase()}.`,
        tone:
          nextStatus === "closed" || nextStatus === "resolved"
            ? "success"
            : "neutral",
      })
    }
  }

  const handleAddInternalNote = () => {
    const trimmedNote = noteDraft.trim()
    if (!trimmedNote) return

    const nextNote: TicketNote = {
      id: `${ticket.id}-note-${Date.now()}`,
      author: agent,
      timestamp: "Now",
      body: trimmedNote,
    }

    setNotes((currentNotes) => [nextNote, ...currentNotes])
    appendTimelineEvent({
      id: `${ticket.id}-internal-note-${Date.now()}`,
      kind: "note",
      timestamp: "Now",
      author: agent,
      body: trimmedNote,
    })
    setNoteDraft("")
  }

  const handleMacroInsert = (macro: string) => {
    setDraftMessage((currentDraft) =>
      [currentDraft.trim(), macro].filter(Boolean).join("\n\n")
    )
  }

  const ticketNumberLabel = getTicketNumberLabel(ticket)
  const assignee = getAssigneePerson(ticket)

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <header className="flex shrink-0 items-center justify-between gap-2 sm:gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 rounded-xl px-2 sm:px-3"
          onClick={() => router.push("/tickets")}
          aria-label="Back to tickets"
        >
          <IconArrowLeft className="size-4" />
          <span className="hidden sm:inline">Back to Tickets</span>
          <span className="sr-only sm:hidden">Back to Tickets</span>
        </Button>
        <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="size-9 rounded-xl"
                  aria-label="More actions"
                />
              }
            >
              <IconDots className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48">
              <DropdownMenuItem onClick={() => updateTab("activity")}>
                View activity log
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateTab("notes")}>
                Open internal notes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/tickets")}>
                Back to ticket list
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="inline-flex overflow-hidden rounded-2xl border border-transparent">
            <Button
              type="button"
              className="flex-1 rounded-r-none sm:flex-none"
              onClick={() => handleSubmitReply("closed")}
            >
              <span className="sm:hidden">Close</span>
              <span className="hidden sm:inline">Submit as Closed</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="default"
                    size="icon-sm"
                    className="btn-primary-chrome h-9 rounded-l-none border-l border-l-white/10 px-2"
                    aria-label="More submit actions"
                  />
                }
              >
                <IconChevronDown className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-52">
                <DropdownMenuItem onClick={() => handleSubmitReply("pending")}>
                  Submit as Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSubmitReply("resolved")}>
                  Submit as Resolved
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSubmitReply(undefined)}>
                  Send reply only
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <section className="shrink-0">
        <div className="space-y-3 px-1 pt-1 sm:pt-5 sm:pl-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              {ticketNumberLabel}
            </span>
            <Badge
              variant="outline"
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                statusToneClassName[queueStatus]
              )}
            >
              {statusLabel[queueStatus]}
            </Badge>
            {ticket.escalated ? (
              <Badge
                variant="destructive"
                className="rounded-full px-2.5 py-1 text-[11px]"
              >
                Escalated
              </Badge>
            ) : null}
          </div>

          <h1 className="max-w-5xl text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {ticket.subject}
          </h1>

          <div className="flex items-center gap-4 overflow-x-auto whitespace-nowrap text-sm text-muted-foreground max-sm:[scrollbar-width:none] max-sm:[&::-webkit-scrollbar]:hidden">
            <div className="inline-flex items-center gap-2">
              <span>Channel</span>
              <Badge variant="outline" className="h-5 rounded-full px-2 text-[11px]">
                {channelLabel[ticket.channel]}
              </Badge>
            </div>
            <Separator orientation="vertical" className="hidden h-4 sm:block" />
            <div className="inline-flex items-center gap-2">
              <span>Type</span>
              <span className="font-medium text-foreground">
                {getTicketTypeLabel(ticket)}
              </span>
            </div>
            <Separator orientation="vertical" className="hidden h-4 sm:block" />
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-1">
                <TicketPriorityIndicator priority={ticket.priority} />
                Priority
              </span>
              <span className="font-medium text-foreground">
                {priorityLabel[ticket.priority]}
              </span>
            </div>
            <Separator orientation="vertical" className="hidden h-4 sm:block" />
            <div className="inline-flex items-center gap-2">
              <span>Account</span>
              <span className="font-medium text-foreground">{detail.accountName}</span>
            </div>
          </div>
        </div>
      </section>

      <div
        className={cn(
          "grid min-h-0 flex-1 gap-4",
          isRightPanelOpen
            ? "xl:grid-cols-[minmax(0,1fr)_minmax(18rem,28rem)]"
            : "xl:grid-cols-[minmax(0,1fr)_3.5rem]"
        )}
      >
        <section className="min-h-0 overflow-hidden pt-4 sm:pt-8 lg:pt-10">
          <Tabs
            value={activeTab}
            onValueChange={(value) => updateTab(value as TicketDetailTab)}
            className="mx-auto flex h-full min-h-0 w-full max-w-4xl flex-col"
          >
            <div className="shrink-0 border-b px-4">
              <TabsList
                variant="line"
                className="w-full justify-start gap-2 rounded-none p-0"
              >
                {detailTabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent
              value="conversation"
              className="mt-0 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden"
            >
              <ConversationTabContent
                conversationItems={conversationItems}
                ticket={ticket}
                currentUser={{
                  name: currentUser.name,
                  avatarUrl: currentUser.avatar,
                  email: currentUser.email,
                }}
                replyAccounts={replyFromAccounts}
                selectedReplyAccount={selectedReplyAccount}
                replyFrom={replyFrom}
                onReplyFromChange={setReplyFrom}
                onManageAccounts={() => router.push("/accounts")}
                draftMessage={draftMessage}
                onDraftMessageChange={setDraftMessage}
                templateQuery={templateQuery}
                onTemplateQueryChange={setTemplateQuery}
                onMacroInsert={handleMacroInsert}
                onSubmitReply={handleSubmitReply}
              />
            </TabsContent>

            <TabsContent
              value="task"
              className="mt-0 min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden"
            >
              <TaskTabContent
                tasks={tasks}
                onToggleTask={(taskId) =>
                  setTasks((currentTasks) =>
                    currentTasks.map((currentTask) =>
                      currentTask.id === taskId
                        ? {
                            ...currentTask,
                            completed: !currentTask.completed,
                          }
                        : currentTask
                    )
                  )
                }
              />
            </TabsContent>

            <TabsContent
              value="activity"
              className="mt-0 min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden"
            >
              <ActivityTabContent activityItems={activityItems} />
            </TabsContent>

            <TabsContent
              value="notes"
              className="mt-0 min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden"
            >
              <NotesTabContent
                notes={notes}
                currentUser={{
                  name: currentUser.name,
                  avatarUrl: currentUser.avatar,
                  email: currentUser.email,
                }}
                noteDraft={noteDraft}
                onNoteDraftChange={setNoteDraft}
                onAddNote={handleAddInternalNote}
              />
            </TabsContent>
          </Tabs>
        </section>

        <TicketDetailRightPanel
          open={isRightPanelOpen}
          onToggleOpen={() => setIsDesktopRightPanelOpen((isOpen) => !isOpen)}
          activeSection={activeRightPanelSection}
          onSelectSection={(nextSection) => {
            setActiveRightPanelSection(nextSection)
            setIsDesktopRightPanelOpen(true)
          }}
          queueStatus={queueStatus}
          ticket={ticket}
          detail={detail}
          assignee={assignee}
          selectedReplyAccountLabel={selectedReplyAccount?.label}
        />
      </div>
    </div>
  )
}
