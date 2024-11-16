import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";

import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

export const profileRouter = createTRPCRouter({
    getUserByUsername: publicProcedure
    .input(z.object({username: z.string()}))
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .query(async ({ctx, input}) => {
        const client = await clerkClient();
        const users = await client.users.getUserList({
          username: [input.username],
        });

        if (users.totalCount === 0 || users.data.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        const user = users.data[0];
        
        if (!user) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "User data is undefined",
          });
        }

        return filterUserForClient(user);
    })
});

