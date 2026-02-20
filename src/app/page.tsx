import { auth } from "@/auth"
import { redirect } from "next/navigation"
import DashboardChina from "./DashboardChina"

export default async function Page() {
  const session = await auth()
  if (!session) redirect("/login")

  return <DashboardChina />
}
