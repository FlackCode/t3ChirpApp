"use client"
import { LoadingPage } from "~/components/loading"
import { api } from "~/trpc/react"

export default function ProfilePage() {
    const {data, isLoading} = api.profile.getUserByUsername.useQuery({username: "flackcode"})

    if (isLoading) return <LoadingPage />

    if (!data) return <div>404</div>

    return (
        <div className="border-b border-slate-400 p-4 flex">
                Hello {data.username}
        </div>
    )
}