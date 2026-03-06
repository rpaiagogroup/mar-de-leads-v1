import { Suspense } from "react"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { CompanyList } from "@/components/CompanyList"

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Carregando Mar de Leads...</p>
      </div>
    </div>
  )
}

export default async function Page() {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <Suspense fallback={<LoadingFallback />}>
      <CompanyList />
    </Suspense>
  )
}
