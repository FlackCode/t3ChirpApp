"use client"

import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton } from "@clerk/nextjs";
import { api } from "~/trpc/react";

export default function Home() {
  const { data } = api.post.getAll.useQuery();

  return (
    <div>
      <h1>Hello World</h1>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <SignOutButton />
        <UserButton />
      </SignedIn>
      <div>
        {data?.map((post) => (
          <div key={post.id}>{post.content}</div>
        ))}
      </div>
    </div>
  );
}
