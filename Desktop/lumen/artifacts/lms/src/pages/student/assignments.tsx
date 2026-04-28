import { Link } from "wouter";
import { useListMyAssignments, AssignmentWithStatusStatus } from "@workspace/api-client-react";
import { FileText, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { LoadingState } from "@/components/loading-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AssignmentsList() {
  const { data: assignments, isLoading } = useListMyAssignments();

  if (isLoading) return <LoadingState message="Loading project tasks..." />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Project Tasks" 
        description="Track and submit studio task deliverables." 
      />

      {!assignments || assignments.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-4" />
          <p className="text-muted-foreground">No tasks found for your enrolled modules.</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {assignments.map((assignment) => {
            const isPending = assignment.status === AssignmentWithStatusStatus.pending;
            const isGraded = assignment.status === AssignmentWithStatusStatus.graded;
            
            return (
              <Link key={assignment.id} href={`/assignments/${assignment.id}`} className="block group">
                <Card className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
                          {assignment.courseTitle}
                        </span>
                        <Badge 
                          variant="secondary" 
                          className={`text-[10px] uppercase tracking-wider font-semibold border-0 ${
                            isPending ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" :
                            isGraded ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" :
                            "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                          }`}
                        >
                          {assignment.status}
                        </Badge>
                        {isGraded && assignment.grade !== undefined && (
                          <Badge variant="outline" className="border-green-200 text-green-700 bg-white ml-2">
                            {assignment.grade} / {assignment.points} pts
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                        {assignment.title}
                      </h3>
                      {assignment.dueAt && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Due {new Date(assignment.dueAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    
                    <div className="shrink-0 pt-2 sm:pt-0">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {isPending ? (
                          <ArrowRight className="w-5 h-5" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
