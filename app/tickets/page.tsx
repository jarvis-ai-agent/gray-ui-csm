import { TicketsPage } from "@/components/tickets/tickets-page"

export const dynamic = 'force-static'

export default async function Page() {
  return (
    <TicketsPage
      initialView={null}
      initialLayout={null}
    />
  )
}
