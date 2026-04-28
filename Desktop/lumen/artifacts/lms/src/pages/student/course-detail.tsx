import { useParams, Link, useLocation } from "wouter";
import { CheckCircle2, PlayCircle, BookOpen, Clock, AlertCircle } from "lucide-react";
import { 
  useGetCourse, 
  useListEnrollments, 
  useEnrollInCourse,
  getListEnrollmentsQueryKey,
  getGetStudentDashboardQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { LoadingState } from "@/components/loading-state";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function CourseDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: course, isLoading: isCourseLoading } = useGetCourse(params.courseId || "");
  const { data: enrollments, isLoading: isEnrollmentsLoading } = useListEnrollments();
  
  const enrollMutation = useEnrollInCourse();

  if (isCourseLoading || isEnrollmentsLoading) {
    return <LoadingState message="Loading course details..." />;
  }

  if (!course) {
    return <div className="text-center py-20 text-muted-foreground">Course not found.</div>;
  }

  const enrollment = enrollments?.find(e => e.courseId === course.id);
  const isEnrolled = !!enrollment;

  const handleEnroll = () => {
    enrollMutation.mutate(
      { data: { courseId: course.id } },
      {
        onSuccess: () => {
          toast({ title: "Successfully enrolled in course!" });
          queryClient.invalidateQueries({ queryKey: getListEnrollmentsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStudentDashboardQueryKey() });
          
          if (course.lessons && course.lessons.length > 0) {
            setLocation(`/lessons/${course.lessons[0].id}`);
          }
        },
        onError: (err) => {
          toast({ title: "Failed to enroll", description: String(err), variant: "destructive" });
        }
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <PageHeader backHref="/courses" backLabel="Library" title="" />
      
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg border">
        <div 
          className="h-64 md:h-80 w-full relative"
          style={{ backgroundColor: course.coverColor || "hsl(var(--primary))" }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 w-full">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
                {course.category}
              </Badge>
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm capitalize">
                {course.level}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              {course.title}
            </h1>
            <p className="text-white/80 max-w-2xl text-lg line-clamp-2">
              {course.description}
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4 tracking-tight">About this course</h2>
            <p className="text-muted-foreground leading-relaxed">
              {course.description}
            </p>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Curriculum</h2>
            
            {!course.lessons || course.lessons.length === 0 ? (
              <div className="p-8 border border-dashed rounded-xl text-center text-muted-foreground">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Lessons are still being created for this course.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {course.lessons.map((lesson, index) => (
                  <div 
                    key={lesson.id}
                    className="flex items-center p-4 border rounded-xl hover:border-primary/50 transition-colors bg-card"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium shrink-0 mr-4">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{lesson.title}</h4>
                      {lesson.durationMinutes && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" /> {lesson.durationMinutes} min read
                        </p>
                      )}
                    </div>
                    {isEnrolled ? (
                      <Link href={`/lessons/${lesson.id}`}>
                        <Button variant="ghost" size="sm" className="ml-4">
                          <PlayCircle className="w-4 h-4 mr-2" /> Start
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="ghost" size="sm" disabled className="ml-4 opacity-50">
                        Locked
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="p-6 rounded-xl border bg-card sticky top-8 shadow-sm">
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <BookOpen className="w-4 h-4 text-primary" />
                <span>{course.lessonCount} Lessons</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 text-primary" />
                <span>Self-paced</span>
              </div>
            </div>
            
            {isEnrolled ? (
              <div className="space-y-4">
                <div className="bg-primary/10 text-primary p-3 rounded-lg flex items-center justify-center gap-2 font-medium">
                  <CheckCircle2 className="w-5 h-5" /> Enrolled
                </div>
                {course.lessons && course.lessons.length > 0 && (
                  <Link href={`/lessons/${course.lessons[0].id}`} className="w-full block">
                    <Button className="w-full">Continue Learning</Button>
                  </Link>
                )}
              </div>
            ) : (
              <Button 
                className="w-full text-lg h-12" 
                size="lg"
                onClick={handleEnroll}
                disabled={enrollMutation.isPending}
              >
                {enrollMutation.isPending ? "Enrolling..." : "Enroll Now"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
