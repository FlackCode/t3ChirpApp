import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import Image from "next/image";
import Link from "next/link";
import { type RouterOutputs } from "~/trpc/react";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["post"]["getAll"][number]; //useful for getting type easily
export const PostView = (props: PostWithUser) => {
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