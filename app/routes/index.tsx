import { createFileRoute } from "@tanstack/react-router";
import { Tasks } from "~/lib/components/Tasks";
import { Button } from "~/lib/components/ui/button";
import authClient from "~/lib/utils/auth-client";
import { SideNav } from "~/lib/components/SideNav";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { user } = Route.useRouteContext();

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-8 rounded-xl border bg-card p-10">
          <h1 className="text-4xl font-bold">Task Manager</h1>
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => {
                authClient.signIn.social({ provider: "discord" });
              }}
              type="button"
              variant="outline"
              size="lg"
            >
              Sign in with Discord
            </Button>
            <Button
              onClick={() => {
                authClient.signIn.social({ provider: "github" });
              }}
              type="button"
              variant="outline"
              size="lg"
            >
              Sign in with GitHub
            </Button>
            <Button
              onClick={() => {
                authClient.signIn.social({ provider: "google" });
              }}
              type="button"
              variant="outline"
              size="lg"
            >
              Sign in with Google
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <SideNav />
      </header>
      <main className="flex-1 p-6">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">Your Tasks</h2>
          <Tasks />
        </div>
      </main>
    </div>
  );
}
