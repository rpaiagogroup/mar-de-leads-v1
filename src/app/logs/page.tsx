import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { LogsView } from "@/components/LogsView"
import { Suspense } from "react"

export default async function LogsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <Suspense>
      <LogsView />
    </Suspense>
  )
}
