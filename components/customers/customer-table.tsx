"use client"

import * as React from "react"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import {
  IconAlertTriangle,
  IconBuilding,
  IconClockExclamation,
  IconCurrencyDollar,
  IconLayoutList,
  IconMail,
  IconUser,
  IconX,
} from "@tabler/icons-react"

import {
  DataGrid,
  type DataGridColumn,
  type DataGridDrawerPanelProps,
  type DataGridToolbarRenderProps,
} from "@/components/data-grid"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getCustomerBrandPresentation } from "@/components/customers/customer-brand"
import { customerHealthLabels, customerLifecycleLabels } from "@/lib/customers/types"
import type {
  Customer,
  CustomerHealth,
  CustomerLifecycle,
} from "@/lib/customers/types"
import { cn } from "@/lib/utils"

export type CustomerColumnId =
  | "customer"
  | "email"
  | "organization"
  | "segment"
  | "health"
  | "openTickets"
  | "annualValue"
  | "lastTouch"
  | "owner"

type CustomersTableProps = {
  customers: Customer[]
  onCustomersChange: (customers: Customer[]) => void
  onToolbarPropsChange?: (
    props: DataGridToolbarRenderProps<CustomerColumnId> | null
  ) => void
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat("en-US")

const customerColumns: DataGridColumn<CustomerColumnId>[] = [
  {
    id: "customer",
    label: "Name",
    icon: IconUser,
    defaultWidth: 220,
    minWidth: 200,
  },
  {
    id: "email",
    label: "Email",
    icon: IconMail,
    defaultWidth: 250,
    minWidth: 220,
  },
  {
    id: "organization",
    label: "Organization",
    icon: IconBuilding,
    defaultWidth: 230,
    minWidth: 200,
  },
  {
    id: "segment",
    label: "Plan",
    icon: IconLayoutList,
    defaultWidth: 152,
    minWidth: 132,
  },
  {
    id: "health",
    label: "Health",
    icon: IconAlertTriangle,
    defaultWidth: 148,
    minWidth: 132,
  },
  {
    id: "openTickets",
    label: "Open tickets",
    icon: IconClockExclamation,
    defaultWidth: 132,
    minWidth: 120,
  },
  {
    id: "annualValue",
    label: "ARR",
    icon: IconCurrencyDollar,
    defaultWidth: 144,
    minWidth: 132,
  },
  {
    id: "lastTouch",
    label: "Last touch",
    icon: IconClockExclamation,
    defaultWidth: 156,
    minWidth: 140,
  },
  {
    id: "owner",
    label: "Owner",
    icon: IconUser,
    defaultWidth: 160,
    minWidth: 140,
  },
]

const healthToneClassName: Record<CustomerHealth, string> = {
  healthy:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
  watch:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300",
  at_risk:
    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300",
}

const lifecycleToneClassName: Record<CustomerLifecycle, string> = {
  onboarding:
    "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300",
  active:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
  renewal:
    "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-300",
  paused:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300",
  archived:
    "border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300",
}

function getInitials(value: string) {
  return value
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function formatCompactCurrency(value: number) {
  if (value >= 1000) {
    return `$${Math.round(value / 1000)}k`
  }

  return currencyFormatter.format(value)
}

function CustomerHealthBadge({ health }: { health: CustomerHealth }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "justify-center rounded-full px-2.5 py-1 text-[11px] font-medium",
        healthToneClassName[health]
      )}
    >
      {customerHealthLabels[health]}
    </Badge>
  )
}

function CustomerLifecycleBadge({
  lifecycle,
}: {
  lifecycle: CustomerLifecycle
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "justify-center rounded-full px-2.5 py-1 text-[11px] font-medium",
        lifecycleToneClassName[lifecycle]
      )}
    >
      {customerLifecycleLabels[lifecycle]}
    </Badge>
  )
}

function renderStaticCustomerCell(
  customer: Customer,
  columnId: CustomerColumnId
): React.ReactNode {
  if (columnId === "customer") {
    return (
      <div className="flex min-w-0 items-center gap-3">
        <Avatar className="size-6 border bg-background" size="sm">
          <AvatarFallback className="text-[10px] font-semibold">
            {getInitials(customer.primaryContactName)}
          </AvatarFallback>
        </Avatar>
        <div className="truncate text-sm font-medium text-foreground">
          {customer.primaryContactName}
        </div>
      </div>
    )
  }

  if (columnId === "email") {
    return (
      <div className="truncate text-sm font-medium text-foreground">
        {customer.primaryContactEmail}
      </div>
    )
  }

  if (columnId === "organization") {
    const brand = getCustomerBrandPresentation(customer.id, customer.companyName)

    return (
      <div className="flex min-w-0 items-center gap-3">
        <Avatar className="size-6 border bg-background" size="sm">
          <AvatarFallback
            className={cn("text-[10px] font-semibold", brand.className)}
          >
            {brand.fallback}
          </AvatarFallback>
        </Avatar>
        <div className="truncate text-sm font-medium text-foreground">
          {customer.companyName}
        </div>
      </div>
    )
  }

  if (columnId === "segment") {
    return (
      <div className="truncate text-sm font-medium text-foreground">
        {customer.plan} · {customer.segment}
      </div>
    )
  }

  if (columnId === "health") {
    return <CustomerHealthBadge health={customer.health} />
  }

  if (columnId === "openTickets") {
    return (
      <div className="text-sm font-medium text-foreground">
        {numberFormatter.format(customer.openTickets)}
      </div>
    )
  }

  if (columnId === "annualValue") {
    return (
      <div className="text-sm font-medium text-foreground">
        {formatCompactCurrency(customer.annualValue)}
      </div>
    )
  }

  if (columnId === "lastTouch") {
    return (
      <div className="text-sm font-medium text-foreground">
        {customer.lastTouchLabel}
      </div>
    )
  }

  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar size="sm">
        {customer.owner.avatarUrl ? (
          <AvatarImage src={customer.owner.avatarUrl} alt={customer.owner.name} />
        ) : null}
        <AvatarFallback className="text-[10px] font-semibold">
          {getInitials(customer.owner.name)}
        </AvatarFallback>
      </Avatar>
      <div className="truncate text-sm font-medium text-foreground">
        {customer.owner.name}
      </div>
    </div>
  )
}

function CustomerDrawerPanel({
  drawerRow,
  closeDrawer,
}: Pick<
  DataGridDrawerPanelProps<Customer, CustomerColumnId>,
  "drawerRow" | "closeDrawer"
>) {
  const customer = drawerRow

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Popup className="data-open:translate-x-0 data-closed:translate-x-full fixed top-0 right-0 z-50 flex h-dvh w-full max-w-xl translate-x-full flex-col border-l bg-background shadow-xl ring-1 ring-foreground/10 outline-none transition-transform duration-200">
        <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
          <div className="min-w-0">
            <DialogPrimitive.Title className="truncate text-base font-semibold">
              {customer?.companyName ?? "Customer profile"}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-sm text-muted-foreground">
              {customer?.summary ?? "Customer quick view"}
            </DialogPrimitive.Description>
          </div>
          <DialogPrimitive.Close
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-full"
                aria-label="Close drawer"
                onClick={closeDrawer}
              />
            }
          >
            <IconX className="size-4" />
          </DialogPrimitive.Close>
        </div>

        {customer ? (
          <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
            <section className="rounded-2xl border bg-card p-4">
              <div className="flex items-start gap-4">
                <Avatar className="size-12">
                  {customer.owner.avatarUrl ? (
                    <AvatarImage
                      src={customer.owner.avatarUrl}
                      alt={customer.companyName}
                    />
                  ) : null}
                  <AvatarFallback className="font-semibold">
                    {getInitials(customer.companyName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold">
                      {customer.primaryContactName}
                    </h2>
                    <CustomerHealthBadge health={customer.health} />
                    <CustomerLifecycleBadge lifecycle={customer.lifecycle} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {customer.primaryContactEmail}
                  </p>
                  <p className="mt-3 text-sm text-foreground">
                    {customer.notes}
                  </p>
                </div>
              </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-2">
              <QuickFact
                label="Annual value"
                value={currencyFormatter.format(customer.annualValue)}
              />
              <QuickFact
                label="Open tickets"
                value={numberFormatter.format(customer.openTickets)}
              />
              <QuickFact label="Plan" value={`${customer.plan} · ${customer.segment}`} />
              <QuickFact label="Next renewal" value={customer.nextRenewalLabel} />
              <QuickFact label="Region" value={customer.region} />
              <QuickFact label="Workspace owner" value={customer.owner.name} />
            </section>

            <section className="rounded-2xl border bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground">
                Product footprint
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {customer.productAreas.map((area) => (
                  <Badge key={area} variant="secondary" className="rounded-full">
                    {area}
                  </Badge>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground">
                Risk signals
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {customer.riskSignals.map((riskSignal) => (
                  <li key={riskSignal} className="flex gap-2">
                    <span className="mt-1 size-1.5 rounded-full bg-amber-500" />
                    <span>{riskSignal}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Recent tickets
                </h3>
                <span className="text-xs text-muted-foreground">
                  Last touch {customer.lastTouchDate}
                </span>
              </div>

              {customer.recentTickets.length > 0 ? (
                <div className="mt-3 space-y-3">
                  {customer.recentTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="rounded-xl border bg-muted/20 px-3 py-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">
                          {ticket.subject}
                        </p>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {ticket.id}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="rounded-full capitalize">
                          {ticket.status}
                        </Badge>
                        <Badge variant="secondary" className="rounded-full capitalize">
                          {ticket.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  No active ticket threads. This account is currently running
                  clean.
                </p>
              )}
            </section>
          </div>
        ) : null}

        <div className="flex items-center justify-end border-t px-5 py-4">
          <DialogPrimitive.Close
            render={<Button variant="outline" onClick={closeDrawer}>Close</Button>}
          />
        </div>
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  )
}

function QuickFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
    </div>
  )
}

export function CustomersTable({
  customers,
  onCustomersChange,
  onToolbarPropsChange,
}: CustomersTableProps) {
  return (
    <div className="h-full min-h-0 overflow-hidden rounded-xl bg-card ring-1 ring-foreground/5 dark:ring-foreground/10">
      <DataGrid<Customer, CustomerColumnId>
        rows={customers}
        columns={customerColumns}
        getRowLabel={(customer) => customer.companyName}
        renderCell={(customer, column) =>
          renderStaticCustomerCell(customer, column.id)
        }
        isEditableColumn={(columnId) =>
          columnId === "customer" ||
          columnId === "email" ||
          columnId === "organization"
        }
        getCellEditValue={(customer, columnId) => {
          if (columnId === "customer") return customer.primaryContactName
          if (columnId === "email") return customer.primaryContactEmail
          if (columnId === "organization") return customer.companyName
          return ""
        }}
        applyCellEdit={(customer, columnId, nextValue) => {
          const normalizedValue = nextValue.trim()
          if (normalizedValue.length === 0) return customer

          if (columnId === "customer") {
            return {
              ...customer,
              primaryContactName: normalizedValue,
            }
          }

          if (columnId === "email") {
            return {
              ...customer,
              primaryContactEmail: normalizedValue,
            }
          }

          if (columnId === "organization") {
            return {
              ...customer,
              companyName: normalizedValue,
            }
          }

          return customer
        }}
        onRowsChange={onCustomersChange}
        onToolbarPropsChange={onToolbarPropsChange ?? undefined}
        canOpenDrawer={(columnId) => columnId === "customer"}
        getDrawerCellValue={(customer, columnId) =>
          renderStaticCustomerCell(customer, columnId)
        }
        renderDrawerPanel={({ drawerRow, closeDrawer }) => (
          <CustomerDrawerPanel drawerRow={drawerRow} closeDrawer={closeDrawer} />
        )}
        renderSummary={(column, visibleRows) => {
          const visibleAverageCsat =
            visibleRows.length > 0
              ? visibleRows.reduce((sum, customer) => sum + customer.csat, 0) /
                visibleRows.length
              : 0

          if (column.id === "organization") {
            return `${visibleRows.length} accounts`
          }

          if (column.id === "openTickets") {
            return numberFormatter.format(
              visibleRows.reduce((sum, customer) => sum + customer.openTickets, 0)
            )
          }

          if (column.id === "annualValue") {
            return formatCompactCurrency(
              visibleRows.reduce((sum, customer) => sum + customer.annualValue, 0)
            )
          }

          if (column.id === "health") {
            return `${visibleAverageCsat.toFixed(1)} avg CSAT`
          }

          return ""
        }}
        stickySummaryFooter
        fillAvailableHeight
        tableContainerClassName="h-full"
      />
    </div>
  )
}
