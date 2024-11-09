"use client"

import { SignedIn, SignedOut, SignInButton, SignOutButton } from "@clerk/nextjs";
import { api } from "~/trpc/react";

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
            <div className="flex justify-center">
              <SignOutButton />
            </div>
          </SignedIn>
        </div>
        <div className="flex flex-col">
          {data?.map((post) => (
            <div key={post.id} className="p-8 border-b border-slate-400">{post.content}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
