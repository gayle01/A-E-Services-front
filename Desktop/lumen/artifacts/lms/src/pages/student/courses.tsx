import { useState } from "wouter";
import { useListCourses } from "@workspace/api-client-react";
import { PageHeader } from "@/components/page-header";
import { CourseCard } from "@/components/course-card";
import { LoadingState } from "@/components/loading-state";

export default function CoursesList() {
  const { data: courses, isLoading } = useListCourses();

  if (isLoading) return <LoadingState message="Loading design modules..." />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Design Library" 
        description="Browse architecture-focused learning modules and studio guides." 
      />

      {!courses || courses.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <p className="text-muted-foreground">No learning modules available at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              href={`/courses/${course.id}`} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
