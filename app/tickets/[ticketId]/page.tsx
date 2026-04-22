import { Suspense } from "react"
import { notFound } from "next/navigation"

import { TicketDetailPage } from "@/components/tickets/ticket-detail-page"
import { buildTicketDetail } from "@/lib/tickets/detail-data"
import { tickets } from "@/lib/tickets/mock-data"

export async function generateStaticParams() {
  return tickets.map((ticket) => ({
    ticketId: ticket.id,
  }))
}

type TicketDetailRouteProps = {
  params: Promise<{
    ticketId: string
  }>
}

export default async function Page({
  params,
}: TicketDetailRouteProps) {
  const resolvedParams = await params
  const ticket = tickets.find((entry) => entry.id === resolvedParams.ticketId)

  if (!ticket) {
    notFound()
  }

  const detail = buildTicketDetail(ticket)

  return (
    <Suspense fallback={null}>
      <TicketDetailPage
        key={ticket.id}
        ticket={ticket}
        detail={detail}
        initialTab="conversation"
      />
    </Suspense>
  )
}
