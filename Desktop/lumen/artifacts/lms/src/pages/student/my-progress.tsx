import { useListMyQuizAttempts } from "@workspace/api-client-react";
import { Trophy, History, Award } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { LoadingState } from "@/components/loading-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MyProgress() {
  const { data: attempts, isLoading } = useListMyQuizAttempts();

  if (isLoading) return <LoadingState message="Loading your progress..." />;

  const sortedAttempts = [...(attempts || [])].sort((a, b) => 
    new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="My Progress" 
        description="Review your quiz history and achievements." 
      />

      {!attempts || attempts.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <Trophy className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No quiz attempts yet</h3>
          <p className="text-muted-foreground">Take quizzes to track your knowledge over time.</p>
        </div>
      ) : (
        <div className="max-w-4xl space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold tracking-tight">Quiz History</h2>
          </div>
          
          <div className="space-y-3">
            {sortedAttempts.map((attempt) => {
              const isPassed = attempt.percent >= 70;
              return (
                <Card key={attempt.id}>
                  <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        {attempt.courseTitle}
                      </p>
                      <h3 className="font-semibold text-lg">{attempt.quizTitle}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Taken on {new Date(attempt.submittedAt).toLocaleDateString()} at {new Date(attempt.submittedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-6 shrink-0 border-t sm:border-t-0 sm:border-l pt-4 sm:pt-0 sm:pl-6">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground mb-1">Score</div>
                        <div className="text-2xl font-bold font-mono tracking-tight">
                          {attempt.score} <span className="text-sm text-muted-foreground">/ {attempt.totalPoints}</span>
                        </div>
                      </div>
                      <div className="w-[60px] h-[60px] rounded-full flex flex-col items-center justify-center font-bold relative shrink-0">
                        {/* Circular progress visual illusion using border */}
                        <div className={`absolute inset-0 rounded-full border-4 ${isPassed ? 'border-green-100 dark:border-green-900/50' : 'border-amber-100 dark:border-amber-900/50'}`}></div>
                        <div className={`${isPassed ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                          {Math.round(attempt.percent)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
