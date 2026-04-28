import { Link } from "wouter";
import { useListQuizzes, useListMyQuizAttempts } from "@workspace/api-client-react";
import { CheckSquare, ArrowRight, CheckCircle2, History } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { LoadingState } from "@/components/loading-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function QuizzesList() {
  const { data: quizzes, isLoading: isQuizzesLoading } = useListQuizzes();
  const { data: attempts, isLoading: isAttemptsLoading } = useListMyQuizAttempts();

  if (isQuizzesLoading || isAttemptsLoading) return <LoadingState message="Loading knowledge checks..." />;

  const getBestAttempt = (quizId: string) => {
    if (!attempts) return null;
    const quizAttempts = attempts.filter(a => a.quizId === quizId);
    if (quizAttempts.length === 0) return null;
    return quizAttempts.reduce((best, curr) => (curr.score > best.score ? curr : best));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Knowledge Checks" 
        description="Test your understanding of architecture module content." 
      />

      {!quizzes || quizzes.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <CheckSquare className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-4" />
          <p className="text-muted-foreground">No knowledge checks available for your modules yet.</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {quizzes.map((quiz) => {
            const bestAttempt = getBestAttempt(quiz.id);
            const isCompleted = !!bestAttempt;
            
            return (
              <Link key={quiz.id} href={`/quizzes/${quiz.id}`} className="block group">
                <Card className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
                          {quiz.courseTitle}
                        </span>
                        {isCompleted ? (
                          <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50 dark:bg-green-900/20 ml-2">
                            Best Score: {bestAttempt.percent}%
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-0 text-[10px] uppercase tracking-wider">
                            New
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                        {quiz.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                        <span>{quiz.questionCount} questions</span>
                        <span>•</span>
                        <span>{quiz.totalPoints} points</span>
                      </div>
                    </div>
                    
                    <div className="shrink-0 pt-2 sm:pt-0">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {isCompleted ? (
                          <History className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ArrowRight className="w-5 h-5" />
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
