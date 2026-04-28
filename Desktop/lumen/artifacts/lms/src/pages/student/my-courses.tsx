import { Link } from "wouter";
import { Trophy } from "lucide-react";
import { useGetStudentDashboard } from "@workspace/api-client-react";
import { PageHeader } from "@/components/page-header";
import { CourseCard } from "@/components/course-card";
import { LoadingState } from "@/components/loading-state";

export default function MyCourses() {
  const { data: dashboard, isLoading } = useGetStudentDashboard();

  if (isLoading) return <LoadingState message="Loading your studio modules..." />;

  const enrollments = dashboard?.currentEnrollments || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="My Studio Learning" 
        description="Pick up right where you left off." 
      />

      {enrollments.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <Trophy className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-lg font-medium mb-2">You have not started any modules</h3>
          <p className="text-muted-foreground mb-6">Pick an architecture topic and begin your training.</p>
          <Link href="/courses" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
            Browse Library
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => (
            <CourseCard 
              key={enrollment.course.id} 
              course={enrollment.course} 
              progress={enrollment.progressPercent}
              href={`/courses/${enrollment.course.id}`} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
