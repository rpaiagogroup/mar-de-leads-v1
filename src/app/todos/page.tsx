import { auth } from "@/auth"
import { redirect } from "next/navigation"
import DashboardTodos from "./DashboardTodos"

export default async function TodosPage() {
    const session = await auth()
    if (!session) redirect("/login")

    return <DashboardTodos />
}
