import { auth } from "@/auth"
import { redirect } from "next/navigation"
import DashboardChina3 from "./DashboardChina3"

export default async function China3Page() {
    const session = await auth()
    if (!session) redirect("/login")

    return <DashboardChina3 />
}
