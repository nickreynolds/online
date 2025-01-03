import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { useState } from "react";
import { createUserTask, getUserTasks, toggleUserTask } from "../server/tasks.js";

interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
}

export function Tasks() {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const queryClient = useQueryClient();

  const { data: tasks, isLoading, error } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      console.log("Fetching tasks...");
      const tasks = await getUserTasks();
      console.log("tasks: ", tasks);
      return tasks;
    },
  });

  
  const createTaskMutation = useMutation({
    mutationFn: async (title: string) => {
    console.log("title: ", title)
      const response = await createUserTask({ data: { title } })
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setNewTaskTitle("");
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ id }: { id: string; completed: boolean }) => {
      const response = await toggleUserTask({ data: { id }})
        return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  if (error) {
    return <div>Error loading tasks: {error.message}</div>;
  }


  if (isLoading) return <div>Loading tasks...</div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="New task title..."
          className="rounded-md border px-3 py-2"
        />
        <Button
          onClick={() => {
            createTaskMutation.mutate(newTaskTitle)
        }}
          disabled={!newTaskTitle.trim()}
        >
          Add Task
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {tasks?.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-2 rounded-md border p-3"
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => {
                toggleTaskMutation.mutate({
                  id: task.id,
                  completed: !task.completed,
                })
            }
              }
              className="h-4 w-4"
            />
            <span className={task.completed ? "line-through opacity-50" : ""}>
              {task.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
} 