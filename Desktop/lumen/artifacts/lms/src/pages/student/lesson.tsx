import { useParams, Link, useLocation } from "wouter";
import { useMemo } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Clock } from "lucide-react";
import { 
  useGetLesson, 
  useGetCourse,
  useCompleteLesson,
  useListEnrollments,
  getListEnrollmentsQueryKey,
  getGetStudentDashboardQueryKey,
  getGetRecentActivityQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/loading-state";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function LessonView() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: lesson, isLoading: isLessonLoading } = useGetLesson(params.lessonId || "");
  const { data: course, isLoading: isCourseLoading } = useGetCourse(lesson?.courseId || "", {
    query: { enabled: !!lesson?.courseId }
  });
  
  const completeMutation = useCompleteLesson();

  const currentIndex = useMemo(() => {
    if (!course?.lessons || !lesson) return -1;
    return course.lessons.findIndex(l => l.id === lesson.id);
  }, [course, lesson]);

  const prevLesson = useMemo(() => {
    if (currentIndex > 0 && course?.lessons) return course.lessons[currentIndex - 1];
    return null;
  }, [currentIndex, course]);

  const nextLesson = useMemo(() => {
    if (course?.lessons && currentIndex < course.lessons.length - 1) return course.lessons[currentIndex + 1];
    return null;
  }, [currentIndex, course]);

  if (isLessonLoading || isCourseLoading) {
    return <LoadingState message="Loading lesson..." />;
  }

  if (!lesson || !course) {
    return <div className="text-center py-20 text-muted-foreground">Lesson not found.</div>;
  }

  const handleComplete = () => {
    completeMutation.mutate(
      { lessonId: lesson.id },
      {
        onSuccess: () => {
          toast({ title: "Lesson completed! 🎉" });
          queryClient.invalidateQueries({ queryKey: getListEnrollmentsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStudentDashboardQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetRecentActivityQueryKey() });
          
          if (nextLesson) {
            setLocation(`/lessons/${nextLesson.id}`);
          } else {
            setLocation(`/courses/${course.id}`);
          }
        },
        onError: (err) => {
          toast({ title: "Failed to mark complete", description: String(err), variant: "destructive" });
        }
      }
    );
  };

  return (
    <div className="max-w-3xl mx-auto py-8 pb-32 animate-in fade-in duration-500">
      {/* Header breadcrumb */}
      <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={`/courses/${course.id}`} className="hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" /> {course.title}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Lesson {currentIndex + 1}</span>
      </div>
      
      <div className="space-y-2 mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">{lesson.title}</h1>
        {lesson.durationMinutes && (
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <Clock className="w-4 h-4" /> {lesson.durationMinutes} min read
          </div>
        )}
      </div>

      {/* Content - simplistic rendering for now */}
      <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary">
        {lesson.content.split('\n').map((paragraph, i) => (
          paragraph.trim() ? <p key={i}>{paragraph}</p> : <br key={i} />
        ))}
      </div>

      <div className="mt-16 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex w-full sm:w-auto gap-2">
          {prevLesson ? (
            <Link href={`/lessons/${prevLesson.id}`} className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" /> Previous
              </Button>
            </Link>
          ) : (
            <Button variant="outline" disabled className="w-full sm:w-auto opacity-50">
              <ArrowLeft className="w-4 h-4 mr-2" /> Previous
            </Button>
          )}
        </div>
        
        <Button 
          size="lg"
          onClick={handleComplete}
          disabled={completeMutation.isPending}
          className="w-full sm:w-auto text-base h-12"
        >
          {completeMutation.isPending ? "Marking..." : "Complete & Continue"}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
