import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton, UserProfile } from "@clerk/nextjs";

export default async function Home() {
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
    </div>
  );
}
