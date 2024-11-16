"use client"
import Image from "next/image"
import { LoadingPage } from "~/components/loading"
import { PostView } from "~/components/PostView"
import { api } from "~/trpc/react"

const ProfileFeed = (props: {userId: string}) => {
    const { data, isLoading } = api.post.getPostsByUserId.useQuery({
        userId: props.userId
    })

    if (isLoading) return <LoadingPage />

    if (!data || data.length === 0) return <div>User has no posts.</div>

    return <div className="flex flex-col">
        {data.map((fullPost) => (
              <PostView post={fullPost} author={fullPost.authorId} key={fullPost.id} />
        ))}
    </div>
}

export default function ProfilePage() {
    const {data, isLoading} = api.profile.getUserByUsername.useQuery({username: "flackcode"})

    if (isLoading) return <LoadingPage />

    if (!data) return <div>404</div>

    return (
        <div>
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
            <ProfileFeed />
        </div>
    )
}