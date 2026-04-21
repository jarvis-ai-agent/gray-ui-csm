export type CustomerHealth = "healthy" | "watch" | "at_risk"

export type CustomerLifecycle =
  | "onboarding"
  | "active"
  | "renewal"
  | "paused"
  | "archived"

export type CustomerPlan = "Starter" | "Growth" | "Scale" | "Enterprise"

export type CustomerViewKey =
  | "all"
  | "mine"
  | "at-risk"
  | "renewal"
  | "high-touch"

export type CustomerOwner = {
  name: string
  email: string
  avatarUrl?: string
}

export type CustomerTicketStatus = "open" | "pending" | "resolved"

export type CustomerTicketPriority = "high" | "medium" | "low"

export type CustomerRecentTicket = {
  id: string
  subject: string
  status: CustomerTicketStatus
  priority: CustomerTicketPriority
}

export type Customer = {
  id: string
  companyName: string
  primaryContactName: string
  primaryContactEmail: string
  website: string
  region: string
  segment: string
  plan: CustomerPlan
  lifecycle: CustomerLifecycle
  health: CustomerHealth
  owner: CustomerOwner
  openTickets: number
  csat: number
  annualValue: number
  seats: number
  lastTouchLabel: string
  lastTouchDate: string
  lastTouchSortValue: number
  nextRenewalLabel: string
  summary: string
  notes: string
  productAreas: string[]
  riskSignals: string[]
  recentTickets: CustomerRecentTicket[]
}

export interface CustomerSidebarItem {
  key: string
  label: string
  count: number
}

export interface CustomerSidebarGroup {
  key: "views" | "segment" | "lifecycle"
  label: string
  items: CustomerSidebarItem[]
}

export const customerHealthLabels: Record<CustomerHealth, string> = {
  healthy: "Healthy",
  watch: "Watch",
  at_risk: "At risk",
}

export const customerLifecycleLabels: Record<CustomerLifecycle, string> = {
  onboarding: "Onboarding",
  active: "Active",
  renewal: "Renewal",
  paused: "Paused",
  archived: "Archived",
}

export const customerHealthOptions: CustomerHealth[] = [
  "healthy",
  "watch",
  "at_risk",
]

export const customerLifecycleOptions: CustomerLifecycle[] = [
  "onboarding",
  "active",
  "renewal",
  "paused",
  "archived",
]
