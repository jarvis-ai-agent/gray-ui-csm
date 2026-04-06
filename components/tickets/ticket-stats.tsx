import { IconInfoCircle } from "@tabler/icons-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { TicketStat } from "@/lib/tickets/types"

type TicketStatsProps = {
  stats: TicketStat[]
}

export function TicketStats({ stats }: TicketStatsProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.key}
          className="gap-0 rounded-2xl border py-0 shadow-none ring-0"
        >
          <CardHeader className="border-b px-3 py-2">
            <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              <IconInfoCircle className="size-3.5" />
              {stat.label}
            </div>
          </CardHeader>
          <CardContent className="space-y-1 px-3 py-3">
            <p className="text-3xl leading-8 font-medium text-foreground">
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground">{stat.comparison}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  )
}
