import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";
import { type Post } from "@prisma/client";

const addUserDataToPosts = async (posts: Post[]) => {
  try {
    console.log(`Fetching user data for ${posts.length} posts`);
    const users = (await ((await clerkClient()).users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
    }))).data.map(filterUserForClient);
    console.log(`Fetched data for ${users.length} users`);

    return posts.map((post) => {
      const author = users.find((user) => user.id === post.authorId);

      if (!author?.username) {
        console.error(`Author not found for post ${post.id}`);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Author not found for post ${post.id}`,
        });
      }

      return { 
        post, 
        author: {
          ...author,
          username: author.username
        } 
      };
    });
  } catch (error) {
    console.error("Error in addUserDataToPosts:", error);
    throw error;
  }
}

// 3 requests per 1 min
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true
})

export const postsRouter = createTRPCRouter({
  getById: publicProcedure.input(z.object({postId: z.string()})).query(async ({ctx, input}) => {
    const post = await ctx.db.post.findUnique({
      where: {
        id: input.postId
      }
    })

    if (!post) throw new TRPCError({ code: "NOT_FOUND" });

    return (await addUserDataToPosts([post]))[0];
  }
  ),
  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      console.log("Fetching posts...");
      const posts = await ctx.db.post.findMany({      
        take: 100,
        orderBy: [
          {createdAt: "desc"}
        ]
      });
      console.log(`Fetched ${posts.length} posts`);
  
      console.log("Adding user data to posts...");
      const postsWithUserData = await addUserDataToPosts(posts);
      console.log(`Added user data to ${postsWithUserData.length} posts`);
  
      return postsWithUserData;
    } catch (error) {
      console.error("Error in getAll procedure:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "An error occurred while fetching posts",
        cause: error,
      });
    }
  }),
  getPostsByUserId: publicProcedure.input(z.object({ userId: z.string()})).query(({ctx, input}) => ctx.db.post.findMany({
    where: {
      authorId: input.userId,
    },
    take: 100,
    orderBy: [{ createdAt: "desc" }]
    }).then(addUserDataToPosts)
  ),
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
