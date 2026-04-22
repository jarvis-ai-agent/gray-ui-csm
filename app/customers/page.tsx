import { CustomersPage as CustomersPageView } from "@/components/customers/customers-page"

export const dynamic = 'force-static'

export default async function CustomersPage() {
  return (
    <CustomersPageView
      initialView={null}
      initialLayout={null}
    />
  )
}
