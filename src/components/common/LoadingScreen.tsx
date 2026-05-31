import { Ticket } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-background animate-in fade-in duration-500">
      <div className="relative">
        <div className="h-20 w-20 rounded-full border-b-2 border-primary animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Ticket className="h-8 w-8 text-primary animate-pulse" />
        </div>
      </div>
      <div className="mt-8 flex flex-col items-center gap-2">
        <h2 className="text-xl font-bold tracking-tight">World Ticket</h2>
        <div className="flex gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
        </div>
      </div>
    </div>
  );
}
