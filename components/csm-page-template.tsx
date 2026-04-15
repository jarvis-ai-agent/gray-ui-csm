import { IconDots, IconPlus } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type CsmPageTemplateProps = {
  title: string
  description: string
}

export function CsmPageTemplate({ title, description }: CsmPageTemplateProps) {
  return (
    <>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-4 text-card-foreground">
          <p className="text-sm text-muted-foreground">Open Items</p>
          <p className="mt-2 text-2xl font-semibold">24</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-card-foreground">
          <p className="text-sm text-muted-foreground">Resolved Today</p>
          <p className="mt-2 text-2xl font-semibold">18</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-card-foreground">
          <p className="text-sm text-muted-foreground">SLA Health</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600">98.2%</p>
        </div>
      </div>

      <section className="rounded-xl border bg-background p-6">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl font-semibold">{title}</h1>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-9 rounded-xl sm:hidden"
                  aria-label="Page actions"
                />
              }
            >
              <IconDots className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44 sm:hidden">
              <DropdownMenuItem>
                <IconPlus className="size-4" />
                Create New
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {description}
        </p>
        <Button className="mt-4 hidden sm:inline-flex">Create New</Button>
      </section>

      <Button
        size="icon"
        className="fixed right-4 z-40 size-12 rounded-full shadow-lg sm:hidden"
        style={{
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)",
        }}
        aria-label="Create new item"
      >
        <IconPlus className="size-5" />
        <span className="sr-only">Create New</span>
      </Button>
    </>
  )
}
