"use client"

import Link from "next/link"
import {
  IconAlertCircle,
  IconCircleDot,
  IconClock,
  IconCreditCard,
  IconLock,
  IconReceipt2,
  IconTicket,
  IconTool,
  IconUser,
  IconUserQuestion,
} from "@tabler/icons-react"

import { TicketPriorityIndicator } from "@/components/tickets/ticket-priority-indicator"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ticketSidebarGroups } from "@/lib/tickets/mock-data"
import type { TicketPriority, TicketSidebarGroup } from "@/lib/tickets/types"
import { cn } from "@/lib/utils"

const PRIORITY_KEYS: TicketPriority[] = [
  "urgent",
  "high",
  "medium",
  "low",
  "todo",
]

function buildFilterHref(groupKey: string, itemKey: string) {
  if (groupKey === "views") {
    return `/tickets?view=${itemKey}`
  }

  return "/tickets"
}

function TicketFilterIcon({
  groupKey,
  itemKey,
}: {
  groupKey: TicketSidebarGroup["key"]
  itemKey: string
}) {
  if (groupKey === "views") {
    if (itemKey === "all") return <IconTicket className="size-4" />
    if (itemKey === "mine") return <IconUser className="size-4" />
    if (itemKey === "unassigned") return <IconUserQuestion className="size-4" />
    if (itemKey === "past-due") return <IconClock className="size-4" />
    if (itemKey === "escalated") return <IconAlertCircle className="size-4" />
  }

  if (groupKey === "categories") {
    if (itemKey === "billing") return <IconReceipt2 className="size-4" />
    if (itemKey === "technical") return <IconTool className="size-4" />
    if (itemKey === "account-login") return <IconLock className="size-4" />
    if (itemKey === "subscription") return <IconCreditCard className="size-4" />
  }

  if (groupKey === "priority") {
    if (PRIORITY_KEYS.includes(itemKey as TicketPriority)) {
      return (
        <TicketPriorityIndicator
          priority={itemKey as TicketPriority}
          className="size-4"
        />
      )
    }
  }

  return <IconCircleDot className="size-4" />
}

export function TicketSidebarFilters() {
  const activeView = "all"

  return (
    <div className="px-3 py-1">
      {ticketSidebarGroups.map((group) => (
        <SidebarGroup key={group.key} className="p-2 pb-3">
          <SidebarGroupLabel className="py-2 px-2 text-xs tracking-wide text-sidebar-foreground/65 uppercase">
            {group.label}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => {
                const isActive =
                  group.key === "views" && item.key === activeView

                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      render={
                        <Link href={buildFilterHref(group.key, item.key)} />
                      }
                      isActive={isActive}
                      className="h-8 rounded-lg px-2"
                    >
                      <TicketFilterIcon
                        groupKey={group.key}
                        itemKey={item.key}
                      />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                    <SidebarMenuBadge
                      className={cn(
                        "top-1.5 rounded-full px-1.5 text-xs font-medium",
                        isActive
                          ? "bg-background text-sidebar-accent-foreground"
                          : "bg-muted-foreground/10 text-sidebar-foreground/80"
                      )}
                    >
                      {item.count}
                    </SidebarMenuBadge>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </div>
  )
}
