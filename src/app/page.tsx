"use client"

import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { api, type RouterOutputs } from "~/trpc/react";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const {user} = useUser();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const ctx = api.useUtils()

  const {mutate} = api.post.create.useMutation({
    onSuccess: () => {
      setInput("")
      setIsLoading(false);
      void ctx.post.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.formErrors;
      if (errorMessage?.[0]) {
        toast.error(errorMessage[0])
      } else {
        toast.error("Failed to create post. Try again later")
      }
      
    },
    onMutate: () => {
      setIsLoading(true);
    }
  });

  if (!user) return null;

  return (
    <div className="flex gap-3 w-full">
      <Image src={user.imageUrl} alt="Profile Image" className="w-14 h-14 rounded-full" width={56} height={56}/>
      <input 
      placeholder="Type some emojis!" 
      className="bg-transparent grow outline-none"
      type="text"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (input !== "") {
            mutate(input);
          }
        }
      }}
      disabled={isLoading}
      />
      {input !== "" && !isLoading && (
        <button 
        onClick={() => mutate(input)}
        >Post</button>
      )}

      {isLoading && (
        <div className="flex justify-center items-center"><LoadingSpinner size={20}/></div>
      )}
    </div>
  )
}

type PostWithUser = RouterOutputs["post"]["getAll"][number]; //useful for getting type easily
const PostView = (props: PostWithUser) => {
  const {post, author} = props;
  return (
    <div key={post.id} className="flex p-4 border-b border-slate-400 gap-3">
      <Image src={author.imageUrl} alt={`@${author.username}'s profile picture`} className="w-14 h-14 rounded-full" width={56} height={56}/>
      <div className="flex flex-col">
        <div className="flex text-slate-300 gap-1">
          <Link href={`/@${author.username}`}><span>{`@${author.username} `}</span></Link>
          <Link href={`/post/${post.id}`}><span className="font-thin">{` · ${dayjs(post.createdAt).fromNow()}`}</span></Link>
        </div>
        <span className="text-2xl">
          {post.content}
        </span>
      </div>
      
    </div>
  )
}

export default function Home() {
  const { data, isLoading } = api.post.getAll.useQuery();
  if (isLoading) return <LoadingPage />
  if (!data) return <div>Something went wrong...</div>

  return (
        <div>
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
            {data.map((fullPost) => (
              <PostView {...fullPost} key={fullPost.post.id} />
            ))}
          </div>
        </div>
  );
}
