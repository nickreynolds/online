import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { useState } from "react";
import {
  createUserTask,
  getUserTasks,
  createRecurringTask,
  getRecurringTasks,
} from "../server/tasks";
import { TaskItem } from "./TaskItem";
import { RecurringTaskItem } from "./RecurringTaskItem";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
}

export interface RecurringTask extends Task {
  frequencyHours: number;
  lastCompleted: Date | null;
  nextDue: Date;
}

export const COMMON_INTERVALS = [
  { label: "Every 12 hours", hours: 12 },
  { label: "Daily", hours: 24 },
  { label: "Every 2 days", hours: 48 },
  { label: "Weekly", hours: 168 },
  { label: "Monthly", hours: 720 },
] as const;

export function Tasks() {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequencyHours, setFrequencyHours] = useState<number | string>(24);
  const [customFrequency, setCustomFrequency] = useState<number | "">("");
  const queryClient = useQueryClient();

  const { data: regularTasks, isLoading: regularTasksLoading } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      console.log("Fetching tasks...");
      const tasks = await getUserTasks();
      console.log("tasks: ", tasks);
      return tasks;
    },
  });

  const { data: recurringTasks, isLoading: recurringTasksLoading } = useQuery<
    RecurringTask[]
  >({
    queryKey: ["recurring-tasks"],
    queryFn: async () => {
      console.log("Fetching tasks...");
      const tasks = await getRecurringTasks();
      console.log("tasks: ", tasks);
      return tasks;
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (title: string) => {
      if (isRecurring) {
        const hours = customFrequency ? Number(customFrequency) : frequencyHours;
        return createRecurringTask({ data: { title, frequencyHours: hours } });
      }
      return createUserTask({ data: { title } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["recurring-tasks"] });
      setNewTaskTitle("");
      setCustomFrequency("");
    },
  });

  if (regularTasksLoading || recurringTasksLoading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="New task title..."
          className="rounded-md border bg-background px-3 py-2"
        />
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="h-4 w-4"
            />
            Recurring Task
          </label>
          {isRecurring && (
            <div className="flex gap-2">
              <select
                value={frequencyHours}
                onChange={(e) => {
                  setFrequencyHours(Number(e.target.value));
                  setCustomFrequency("");
                }}
                className="rounded-md border bg-background px-3 py-2"
              >
                {COMMON_INTERVALS.map((interval) => (
                  <option key={interval.hours} value={interval.hours}>
                    {interval.label}
                  </option>
                ))}
                <option value="custom">Custom</option>
              </select>
              {frequencyHours === "custom" && (
                <input
                  type="number"
                  value={customFrequency}
                  onChange={(e) => setCustomFrequency(Number.parseInt(e.target.value))}
                  placeholder="Hours"
                  min="1"
                  className="w-24 rounded-md border bg-background px-3 py-2 text-foreground"
                />
              )}
            </div>
          )}
        </div>
        <Button
          onClick={() => createTaskMutation.mutate(newTaskTitle)}
          disabled={
            !newTaskTitle.trim() ||
            (isRecurring && frequencyHours === "custom" && !customFrequency)
          }
        >
          Add Task
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-semibold">Regular Tasks</h3>
          <div className="flex flex-col gap-2">
            {regularTasks?.map((task) => <TaskItem key={task.id} task={task} />)}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Recurring Tasks</h3>
          <div className="flex flex-col gap-2">
            {recurringTasks?.map((task) => (
              <RecurringTaskItem key={task.id} task={task} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
