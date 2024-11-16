"use client"
import Image from "next/image"
import { LoadingPage } from "~/components/loading"
import { api } from "~/trpc/react"

export default function ProfilePage() {
    const {data, isLoading} = api.profile.getUserByUsername.useQuery({username: "flackcode"})

    if (isLoading) return <LoadingPage />

    if (!data) return <div>404</div>

    return (
        <div className="h-36 bg-slate-700 relative">
                <Image 
                src={data.imageUrl}
                alt={`${data.username}'s profile picture`}
                width={128}
                height={128}
                className="-mb-16 absolute bottom-0 left-0 ml-4 border-4 border-black rounded-full"/>
                <div className="h-48"></div>
                <div className="p-4 text-2xl font-bold">{`@${data.username}`}</div>
                <div className="border-b border-slate-400 w-full"></div>
        </div>
    )
}