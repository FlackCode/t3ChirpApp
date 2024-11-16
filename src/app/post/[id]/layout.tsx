import { type Metadata } from "next";

export const metadata: Metadata = {
    title: "Post",
    description: "Post page for Chirp",
  };
  
  export default function RootLayout({
    children,
  }: Readonly<{ children: React.ReactNode }>) {
    return (
        <body>
            {children}
        </body>
    );
  }