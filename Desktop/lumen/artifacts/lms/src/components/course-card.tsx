import { Link } from "wouter";
import { BookOpen, Clock, Signal, GraduationCap, ChevronRight } from "lucide-react";
import { Course } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface CourseCardProps {
  course: Course;
  progress?: number;
  href: string;
}

export function CourseCard({ course, progress, href }: CourseCardProps) {
  const levelColor = {
    beginner: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    intermediate: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    advanced: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  }[course.level];

  return (
    <Link href={href} className="block group">
      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/50 group-hover:-translate-y-1">
        <div 
          className="h-32 w-full relative"
          style={{ backgroundColor: course.coverColor || "hsl(var(--primary))" }}
        >
          <div className="absolute inset-0 bg-black/10 mix-blend-multiply" />
          {course.category && (
            <Badge variant="secondary" className="absolute top-4 left-4 bg-white/90 text-black hover:bg-white border-0">
              {course.category}
            </Badge>
          )}
        </div>
        
        <CardHeader className="pb-3 pt-5">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className={levelColor + " border-0 font-medium capitalize"}>
              <Signal className="mr-1 h-3 w-3" />
              {course.level}
            </Badge>
          </div>
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
        </CardHeader>
        
        <CardContent className="pb-4">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {course.description}
          </p>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              <span>{course.lessonCount} lessons</span>
            </div>
            {course.instructor && (
              <div className="flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4" />
                <span className="truncate max-w-[100px]">{course.instructor}</span>
              </div>
            )}
          </div>
          
          {progress !== undefined && (
            <div className="mt-5 space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">Progress</span>
                <span className="text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
