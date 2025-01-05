import { Button } from "./ui/button";
import type { RecurringTask } from "./Tasks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeRecurringTask, deleteRecurringTask } from "../server/tasks";
import { Trash2 } from "lucide-react";

interface RecurringTaskItemProps {
  task: RecurringTask;
}

function formatTimeUntil(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 24) {
    return `${hours} hours`;
  }
  const days = Math.floor(hours / 24);
  return `${days} days`;
}

export function RecurringTaskItem({ task }: RecurringTaskItemProps) {
  const isOverdue = new Date() > new Date(task.nextDue);
  const queryClient = useQueryClient();

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await completeRecurringTask({ data: { id } });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-tasks"] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await deleteRecurringTask({ data: { id } });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-tasks"] });
    },
  });

  return (
    <div className="group -mx-6 flex items-center gap-2 rounded-md border p-3 md:mx-0">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          toggleTaskMutation.mutate({
            id: task.id,
          });
        }}
        className={isOverdue ? "text-red-500" : ""}
      >
        Complete
      </Button>
      <span>
        {task.title}
        <span className="ml-2 text-sm text-gray-500">
          {isOverdue
            ? `Overdue by ${formatTimeUntil(new Date(task.nextDue))}`
            : `Due in ${formatTimeUntil(new Date(task.nextDue))}`}
        </span>
      </span>
      <span className="ml-auto text-sm text-gray-500">
        Every {task.frequencyHours} hours
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          if (confirm("Are you sure you want to delete this recurring task?")) {
            deleteTaskMutation.mutate({ id: task.id });
          }
        }}
        className="text-destructive opacity-0 transition-opacity hover:bg-destructive/10 group-hover:opacity-100"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
