import { useParams, Link, useLocation } from "wouter";
import { useState, useMemo } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { 
  useGetQuiz, 
  useSubmitQuizAttempt,
  getListMyQuizAttemptsQueryKey,
  getGetStudentDashboardQueryKey,
  getGetRecentActivityQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/loading-state";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function QuizView() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: quiz, isLoading } = useGetQuiz(params.quizId || "");
  const submitMutation = useSubmitQuizAttempt();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<any>(null); // Type any for brevity, matches API QuizAttemptResult

  if (isLoading) return <LoadingState message="Loading quiz..." />;
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return <div className="text-center py-20 text-muted-foreground">Quiz not found or empty.</div>;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const progressPercent = ((currentQuestionIndex) / quiz.questions.length) * 100;
  const isAllAnswered = Object.keys(answers).length === quiz.questions.length;

  const handleSelect = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: parseInt(value) }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    const formattedAnswers = Object.entries(answers).map(([questionId, selectedIndex]) => ({
      questionId,
      selectedIndex
    }));

    submitMutation.mutate(
      { quizId: quiz.id, data: { answers: formattedAnswers } },
      {
        onSuccess: (data) => {
          setResult(data);
          queryClient.invalidateQueries({ queryKey: getListMyQuizAttemptsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStudentDashboardQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetRecentActivityQueryKey() });
        },
        onError: (err) => {
          toast({ title: "Failed to submit quiz", description: String(err), variant: "destructive" });
        }
      }
    );
  };

  // Result View
  if (result) {
    const isPassed = result.percent >= 70;
    
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="text-center py-12 space-y-6">
          <div className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6",
            isPassed ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"
          )}>
            {isPassed ? <CheckCircle2 className="w-12 h-12" /> : <AlertCircle className="w-12 h-12" />}
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight">Quiz Completed</h1>
          <p className="text-xl text-muted-foreground">You scored {result.score} out of {result.totalPoints} ({Math.round(result.percent)}%)</p>
          
          <div className="pt-4 space-x-4">
            <Button onClick={() => setLocation("/quizzes")} variant="outline">Back to Quizzes</Button>
            <Button onClick={() => { setResult(null); setAnswers({}); setCurrentQuestionIndex(0); }}>Retake Quiz</Button>
          </div>
        </div>

        <div className="space-y-6 mt-12">
          <h2 className="text-2xl font-bold">Review Answers</h2>
          {result.breakdown.map((item: any, i: number) => (
            <Card key={item.questionId} className={cn("border-l-4", item.isCorrect ? "border-l-green-500" : "border-l-red-500")}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-start gap-3 leading-relaxed">
                  <span className="text-muted-foreground font-normal shrink-0">{i + 1}.</span>
                  {item.prompt}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quiz.questions.find((q) => q.id === item.questionId)?.options.map((opt, optIndex) => {
                  const isSelected = item.selectedIndex === optIndex;
                  const isCorrectAnswer = item.correctIndex === optIndex;
                  
                  let bgClass = "bg-muted/30 border-transparent";
                  let icon = null;
                  
                  if (isCorrectAnswer) {
                    bgClass = "bg-green-100/50 border-green-200 dark:bg-green-900/20 dark:border-green-800";
                    icon = <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />;
                  } else if (isSelected && !item.isCorrect) {
                    bgClass = "bg-red-100/50 border-red-200 dark:bg-red-900/20 dark:border-red-800";
                    icon = <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />;
                  }

                  return (
                    <div key={optIndex} className={cn("flex items-start gap-3 p-3 rounded-lg border", bgClass)}>
                      <div className="w-6 shrink-0 flex justify-center">{icon}</div>
                      <span className={cn(isSelected && "font-medium")}>{opt}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Active Quiz View
  return (
    <div className="max-w-3xl mx-auto py-8 animate-in fade-in duration-300">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/quizzes" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Exit
        </Link>
        <span className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </span>
      </div>

      <Progress value={progressPercent} className="h-2 mb-12" />

      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0 pb-8">
          <CardTitle className="text-2xl md:text-3xl leading-snug tracking-tight font-medium">
            {currentQuestion.prompt}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <RadioGroup 
            value={answers[currentQuestion.id]?.toString()} 
            onValueChange={handleSelect}
            className="space-y-4"
          >
            {currentQuestion.options.map((option, index) => (
              <div 
                key={index} 
                className={cn(
                  "flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer",
                  answers[currentQuestion.id] === index 
                    ? "border-primary bg-primary/5" 
                    : "border-muted hover:border-primary/30 hover:bg-muted/50"
                )}
                onClick={() => handleSelect(index.toString())}
              >
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-base font-normal leading-relaxed">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="mt-12 flex items-center justify-between border-t pt-8">
        <Button 
          variant="ghost" 
          onClick={handlePrev} 
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>
        
        {isLastQuestion ? (
          <Button 
            size="lg" 
            onClick={handleSubmit} 
            disabled={!isAllAnswered || submitMutation.isPending}
          >
            {submitMutation.isPending ? "Submitting..." : "Submit Quiz"}
          </Button>
        ) : (
          <Button size="lg" onClick={handleNext} disabled={answers[currentQuestion.id] === undefined}>
            Next Question <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
