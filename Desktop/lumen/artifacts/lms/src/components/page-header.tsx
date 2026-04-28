import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, backHref, backLabel = "Back", action }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
      <div className="space-y-2">
        {backHref && (
          <Link href={backHref}>
            <Button variant="ghost" size="sm" className="-ml-3 h-8 text-muted-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {backLabel}
            </Button>
          </Link>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
        {description && <p className="text-lg text-muted-foreground">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
