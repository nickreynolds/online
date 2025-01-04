import { Button } from "./ui/button";
import type { RecurringTask } from "./Tasks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeRecurringTask } from "../server/tasks.js";

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

  return (
    <div className="flex items-center gap-2 rounded-md border p-3">
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
    </div>
  );
}
