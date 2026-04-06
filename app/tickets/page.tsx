import { TicketsPage } from "@/components/tickets/tickets-page"

type TicketsRouteProps = {
  searchParams: Promise<{
    view?: string
  }>
}

export default async function Page({ searchParams }: TicketsRouteProps) {
  const params = await searchParams

  return <TicketsPage initialView={params.view ?? null} />
}
