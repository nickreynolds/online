// import { betterAuth } from "better-auth";
// import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "./db";
import { createServerFn } from "@tanstack/start";
import { authMiddleware } from "../middleware/auth-guard.js";
import { task } from "./schema/tasks.schema.js";
import { and, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export const getUserTasks = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(async ({ context }) => {
  console.log("getUserTasks context: ", context)
  const { user } = context
  if (!user) {
    throw new Error("Unauthorized");
  }
  const userTasks = await db
    .select()
    .from(task)
    .where(eq(task.creatorId, user.id))
    .orderBy(desc(task.createdAt));

  return userTasks;
});

type CreateTaskBody = {
  title: string;
}

export const createUserTask = createServerFn({ method: "POST" }).middleware([authMiddleware])  .validator((createGame: unknown): CreateTaskBody => {
  return createGame as CreateTaskBody;
}).handler(async ({ context, data }) => {
  console.log("createUserTask context: ", context)
  const { user } = context
  if (!user) {
    throw new Error("Unauthorized");
  }
  
  const userTask = await db.insert(task).values({
        id: nanoid(),
        title: data.title,
        creatorId: context.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
  })

  return userTask[0];
});


type ToggleTaskBody = {
  id: string;
}

export const toggleUserTask = createServerFn({ method: "POST" }).middleware([authMiddleware])  .validator((toggleTask: unknown): ToggleTaskBody => {
  return toggleTask as ToggleTaskBody;
}).handler(async ({ context, data }) => {
  console.log("toggleUserTask context: ", context)
  const { user } = context
  if (!user) {
    throw new Error("Unauthorized");
  }
  
  const userTask = await db.update(task).set({ completed: true }).where(and(eq(task.id, data.id), eq(task.creatorId, user.id)))

  return userTask[0];
});