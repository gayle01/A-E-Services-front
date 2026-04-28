import { Loader2 } from "lucide-react";

export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center space-y-4 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
