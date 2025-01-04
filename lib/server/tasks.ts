// import { betterAuth } from "better-auth";
// import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "./db";
import { createServerFn } from "@tanstack/start";
import { authMiddleware } from "../middleware/auth-guard.js";
import { task } from "./schema/tasks.schema.js";
import { and, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { recurringTask } from "./schema/recurring-tasks.schema.js";

export const getUserTasks = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    console.log("getUserTasks context: ", context);
    const { user } = context;
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
};

export const createUserTask = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((createGame: unknown): CreateTaskBody => {
    return createGame as CreateTaskBody;
  })
  .handler(async ({ context, data }) => {
    console.log("createUserTask context: ", context);
    const { user } = context;
    if (!user) {
      throw new Error("Unauthorized");
    }

    const userTask = await db.insert(task).values({
      id: nanoid(),
      title: data.title,
      creatorId: context.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return userTask[0];
  });

type ToggleTaskBody = {
  id: string;
};

export const toggleUserTask = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((toggleTask: unknown): ToggleTaskBody => {
    return toggleTask as ToggleTaskBody;
  })
  .handler(async ({ context, data }) => {
    console.log("toggleUserTask context: ", context);
    const { user } = context;
    if (!user) {
      throw new Error("Unauthorized");
    }

    const userTask = await db
      .update(task)
      .set({ completed: true })
      .where(and(eq(task.id, data.id), eq(task.creatorId, user.id)));

    return userTask[0];
  });
type CreateRecurringTaskBody = {
  title: string;
  frequencyHours: number;
};

export const createRecurringTask = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((createTask: unknown): CreateRecurringTaskBody => {
    return createTask as CreateRecurringTaskBody;
  })
  .handler(async ({ context, data }) => {
    const { user } = context;
    if (!user) {
      throw new Error("Unauthorized");
    }

    const now = new Date();
    const nextDue = new Date(now.getTime() + data.frequencyHours * 60 * 60 * 1000);

    const task = await db.insert(recurringTask).values({
      id: nanoid(),
      title: data.title,
      frequencyHours: data.frequencyHours,
      nextDue,
      creatorId: user.id,
      createdAt: now,
      updatedAt: now,
    });

    return task[0];
  });

export const completeRecurringTask = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: unknown): { id: string } => {
    return data as { id: string };
  })
  .handler(async ({ context, data }) => {
    const { user } = context;
    if (!user) {
      throw new Error("Unauthorized");
    }

    const task = await db
      .select()
      .from(recurringTask)
      .where(and(eq(recurringTask.id, data.id), eq(recurringTask.creatorId, user.id)))
      .then((rows) => rows[0]);

    if (!task) {
      throw new Error("Task not found");
    }

    const now = new Date();
    const nextDue = new Date(now.getTime() + task.frequencyHours * 60 * 60 * 1000);

    const updatedTask = await db
      .update(recurringTask)
      .set({
        lastCompleted: now,
        nextDue,
        updatedAt: now,
      })
      .where(eq(recurringTask.id, data.id))
      .returning();

    return updatedTask[0];
  });

export const getRecurringTasks = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { user } = context;
    if (!user) {
      throw new Error("Unauthorized");
    }

    const tasks = await db
      .select()
      .from(recurringTask)
      .where(eq(recurringTask.creatorId, user.id))
      .orderBy(desc(recurringTask.createdAt));

    return tasks;
  });
