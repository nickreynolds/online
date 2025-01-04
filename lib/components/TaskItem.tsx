import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleUserTask } from "../server/tasks";
import type { Task } from "./Tasks";

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

  return (
    <div className="flex items-center gap-2 rounded-md border p-3">
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
    </div>
  );
}
