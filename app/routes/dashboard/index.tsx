import { createFileRoute } from "@tanstack/react-router";
import { Tasks } from "~/lib/components/Tasks";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndex,
});

function DashboardIndex() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Your Tasks</h2>
      <Tasks />
    </div>
  );
}
