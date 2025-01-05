import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import authClient from "~/lib/utils/auth-client";

export function SideNav() {
  return (
    <Sheet>
      <div className="flex h-16 items-center justify-between gap-4 px-4">
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <span>Fitt.Buzz</span>
        <div />
      </div>
      <SheetContent side="left" className="flex flex-col">
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Fitt.Buzz</h2>
        </div>
        <Button
          onClick={async () => {
            await authClient.signOut();
            window.location.reload();
          }}
          variant="destructive"
          className="mt-auto"
        >
          Sign out
        </Button>
      </SheetContent>
    </Sheet>
  );
}
