import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteUserTask, toggleUserTask } from "../server/tasks";
import type { Task } from "./Tasks";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const queryClient = useQueryClient();

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await toggleUserTask({ data: { id } });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await deleteUserTask({ data: { id } });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  return (
    <div className="group flex items-center gap-2 rounded-md border p-3">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => {
          toggleTaskMutation.mutate({
            id: task.id,
          });
        }}
        className="h-4 w-4"
      />
      <span className={task.completed ? "line-through opacity-50" : ""}>
        {task.title}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          if (confirm("Are you sure you want to delete this task?")) {
            deleteTaskMutation.mutate({ id: task.id });
          }
        }}
        className="ml-auto text-destructive opacity-0 transition-opacity hover:bg-destructive/10 group-hover:opacity-100"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
