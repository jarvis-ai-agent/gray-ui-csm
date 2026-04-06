import type {
  Ticket,
  TicketBoardColumn,
  TicketSidebarGroup,
  TicketStat,
  TicketViewKey,
} from "@/lib/tickets/types"

export const ticketStats: TicketStat[] = [
  {
    key: "total",
    label: "Total Tickets",
    value: 7,
    comparison: "vs last week",
  },
  { key: "open", label: "Open", value: 4, comparison: "vs last week" },
  { key: "pending", label: "Pending", value: 1, comparison: "vs last week" },
  { key: "resolved", label: "Resolved", value: 2, comparison: "vs last week" },
]

export const ticketBoardColumns: TicketBoardColumn[] = [
  { key: "open", label: "Open" },
  { key: "pending", label: "Pending" },
  { key: "resolved", label: "Resolved" },
  { key: "closed", label: "Closed" },
]

export const ticketSidebarGroups: TicketSidebarGroup[] = [
  {
    key: "views",
    label: "Views",
    items: [
      { key: "all", label: "All Tickets", count: 7 },
      { key: "mine", label: "My Tickets", count: 4 },
      { key: "unassigned", label: "Unassigned", count: 1 },
      { key: "past-due", label: "Past Due", count: 2 },
      { key: "escalated", label: "Escalated", count: 2 },
    ],
  },
  {
    key: "categories",
    label: "Categories",
    items: [
      { key: "billing", label: "Billing", count: 1 },
      { key: "technical", label: "Technical Issue", count: 4 },
      { key: "account-login", label: "Account & Login", count: 1 },
      { key: "subscription", label: "Subscription", count: 1 },
      { key: "other", label: "Other", count: 0 },
    ],
  },
  {
    key: "priority",
    label: "Priority",
    items: [
      { key: "urgent", label: "Urgent", count: 1 },
      { key: "high", label: "High", count: 2 },
      { key: "medium", label: "Medium", count: 2 },
      { key: "low", label: "Low", count: 1 },
      { key: "todo", label: "Todo", count: 1 },
    ],
  },
]

export const tickets: Ticket[] = [
  {
    id: "t-001",
    ticketNumber: "#-001",
    subject: "SSO SAML configuration failing on IdP callback",
    queueStatus: "open",
    health: "warning",
    channel: "email",
    trend: "up",
    assignee: { name: "Jason Duong" },
    category: "technical",
    priority: "high",
    mine: true,
    escalated: false,
    pastDue: true,
  },
  {
    id: "t-002",
    ticketNumber: "#-002",
    subject: "Webhook delivery delays to our Salesforce endpoint",
    queueStatus: "open",
    health: "on-track",
    channel: "slack",
    trend: "up",
    assignee: { name: "Jason Duong" },
    category: "technical",
    priority: "urgent",
    mine: true,
    escalated: true,
    pastDue: false,
  },
  {
    id: "t-003",
    ticketNumber: "#-003",
    subject: "Can we get custom roles and permissions on Growth plan?",
    queueStatus: "pending",
    health: "breached",
    channel: "email",
    trend: "flat",
    assignee: { name: "Jason Duong" },
    category: "account-login",
    priority: "high",
    mine: true,
    escalated: true,
    pastDue: true,
  },
  {
    id: "t-004",
    ticketNumber: "#-004",
    subject: "Rate limiting our batch export API calls unexpectedly",
    queueStatus: "open",
    health: "on-track",
    channel: "email",
    trend: "up",
    assignee: { name: "Annie Nguyen" },
    category: "technical",
    priority: "medium",
    mine: false,
    escalated: false,
    pastDue: false,
  },
  {
    id: "t-005",
    ticketNumber: "#-005",
    subject: "Need proration breakdown for yearly invoice",
    queueStatus: "open",
    health: "warning",
    channel: "chat",
    trend: "flat",
    category: "billing",
    priority: "medium",
    mine: false,
    escalated: false,
    pastDue: false,
  },
  {
    id: "t-006",
    ticketNumber: "#-006",
    subject: "How to set up conditional workflow triggers?",
    queueStatus: "resolved",
    health: "on-track",
    channel: "chat",
    trend: "flat",
    assignee: { name: "Jason Duong" },
    category: "subscription",
    priority: "low",
    mine: true,
    escalated: false,
    pastDue: false,
  },
  {
    id: "t-007",
    ticketNumber: "#-007",
    subject: "Deactivate unused seats without closing the account",
    queueStatus: "closed",
    health: "on-track",
    channel: "chat",
    trend: "flat",
    assignee: { name: "Lam Tran" },
    category: "other",
    priority: "todo",
    mine: false,
    escalated: false,
    pastDue: false,
  },
]

export function filterTicketsByView(allTickets: Ticket[], view: TicketViewKey) {
  switch (view) {
    case "mine":
      return allTickets.filter((ticket) => ticket.mine)
    case "unassigned":
      return allTickets.filter((ticket) => !ticket.assignee)
    case "past-due":
      return allTickets.filter((ticket) => ticket.pastDue)
    case "escalated":
      return allTickets.filter((ticket) => ticket.escalated)
    case "all":
    default:
      return allTickets
  }
}
