"use client"

import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { api, type RouterOutputs } from "~/trpc/react";

const CreatePostWizard = () => {
  const {user} = useUser();
  if (!user) return null;
  console.log(user)

  return (
    <div className="flex gap-3 w-full">
      <Image src={user.imageUrl} alt="Profile Image" className="w-14 h-14 rounded-full" width={56} height={56}/>
      <input placeholder="Type some emojis!" className="bg-transparent grow outline-none"/>
    </div>
  )
}

type PostWithUser = RouterOutputs["post"]["getAll"][number]; //useful for getting type easily
const PostView = (props: PostWithUser) => {
  const {post, author} = props;
  return (
    <div key={post.id} className="p-8 border-b border-slate-400">{post.content}</div>
  )
}

export default function Home() {
  const { data, isLoading } = api.post.getAll.useQuery();
  if (isLoading) return <div>Loading...</div>
  if (!data) return <div>Something went wrong...</div>

  return (
    <div className="flex justify-center h-screen">
      <div className="w-full md:max-w-2xl border-x border-slate-400">
        <div className="border-b border-slate-400 p-4 flex">
          <SignedOut>
            <div className="flex justify-center">
              <SignInButton />
            </div>
          </SignedOut>
          <SignedIn>
            <div className="flex justify-center grow">
              <CreatePostWizard />
            </div>
          </SignedIn>
        </div>
        <div className="flex flex-col">
          {data?.map((fullPost) => (
            <PostView {...fullPost} key={fullPost.post.id} />
          ))}
        </div>
      </div>
    </div>
  );
}
