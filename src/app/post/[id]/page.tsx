"use client"
import { useParams } from "next/navigation"
import { LoadingPage } from "~/components/loading"
import { PostView } from "~/components/PostView"
import { api } from "~/trpc/react"

export default function SinglePostPage() {
    const params = useParams()
    const postId = Array.isArray(params.id) ? params.id[0] : params.id;
    if (!postId) return <div>404</div>;

    const { data, isLoading } = api.post.getById.useQuery({ postId });

    if (isLoading) return <LoadingPage />

    if (!data) return <div>404</div>

    return (
        <div>
            <PostView post={data.post} author={data.author}/>
        </div>
    )
}