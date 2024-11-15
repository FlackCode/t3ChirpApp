import { clerkClient, type User } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    imageUrl: user.imageUrl
  }
}


// 3 requests per 1 min
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true
})

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async({ ctx }) => {
    const posts = await ctx.db.post.findMany({      
      take: 100,
      orderBy: [
        {createdAt: "desc"}
      ]
    }); 

    const users = (await ((await clerkClient()).users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
    }))).data.map(filterUserForClient);

    return posts.map((post) => {
      const author = users.find((user) => user.id === post.authorId);

      if (!author?.username) throw new TRPCError({code: "INTERNAL_SERVER_ERROR", message: "Author not found"})

      return { post, author: {
        ...author,
        username: author.username
      } };
    });
  }),
  create: privateProcedure.input(z.string().emoji().min(1).max(280)).mutation(async ({ctx, input}) => {
    const authorId = ctx.currentUser.id;

    const {success} = await ratelimit.limit(authorId);

    if (!success) throw new TRPCError({code: "TOO_MANY_REQUESTS"});

    const post = await ctx.db.post.create({
      data: {
        authorId,
        content: input,
      },
    });

    return post;
  })
});
