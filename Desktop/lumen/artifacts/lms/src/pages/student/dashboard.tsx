import { Link } from "wouter";
import { BookOpen, CheckSquare, Clock, FileText, Trophy, ArrowRight } from "lucide-react";
import { 
  useGetStudentDashboard, 
  useGetRecentActivity,
  ActivityItemType 
} from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/page-header";
import { LoadingState } from "@/components/loading-state";

export default function StudentDashboard() {
  const { data: dashboard, isLoading: isLoadingDashboard } = useGetStudentDashboard();
  const { data: activity, isLoading: isLoadingActivity } = useGetRecentActivity();

  if (isLoadingDashboard || isLoadingActivity) {
    return <LoadingState message="Loading your studio workspace..." />;
  }

  if (!dashboard) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Welcome back" 
        description="Here's what's happening across your studio training path." 
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary/5 border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Modules in Progress</CardTitle>
            <BookOpen className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{dashboard.enrolledCourses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Lessons Completed</CardTitle>
            <CheckSquare className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.completedLessons}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending Project Tasks</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.pendingAssignments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Avg Knowledge Score</CardTitle>
            <Trophy className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.averageQuizScore}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Continue Learning */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Continue Training</h2>
            <Link href="/my-courses">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>
          
          {dashboard.currentEnrollments.length === 0 ? (
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <BookOpen className="w-8 h-8 text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">You are not enrolled in any modules yet.</p>
                <Link href="/courses">
                  <Button>Browse Library</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {dashboard.currentEnrollments.slice(0, 3).map((enrollment) => (
                <Card key={enrollment.id} className="overflow-hidden hover:border-primary/30 transition-colors">
                  <div className="flex p-4 gap-4">
                    <div 
                      className="w-16 h-16 rounded-md shrink-0 bg-primary/20"
                      style={{ backgroundColor: enrollment.course.coverColor || undefined }}
                    />
                    <div className="flex-1 min-w-0">
                      <Link href={`/courses/${enrollment.course.id}`} className="font-semibold hover:underline decoration-primary underline-offset-2 truncate block">
                        {enrollment.course.title}
                      </Link>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1 mb-2">
                        <span>{enrollment.completedLessons} / {enrollment.totalLessons} lessons</span>
                        <span>{Math.round(enrollment.progressPercent)}%</span>
                      </div>
                      <Progress value={enrollment.progressPercent} className="h-1.5" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Assignments & Activity */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">Upcoming Project Tasks</h2>
              <Link href="/assignments">
                <Button variant="ghost" size="sm">View all</Button>
              </Link>
            </div>
            
            {dashboard.upcomingAssignments.length === 0 ? (
              <Card className="bg-muted/50 border-dashed">
                <CardContent className="p-6 text-center text-muted-foreground text-sm">
                  No pending assignments right now.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {dashboard.upcomingAssignments.slice(0, 3).map((assignment) => (
                  <Link key={assignment.id} href={`/assignments/${assignment.id}`} className="block">
                    <Card className="hover:border-primary/30 transition-colors">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{assignment.title}</p>
                          <p className="text-xs text-muted-foreground">{assignment.courseTitle}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Recent Activity</h2>
            <Card>
              <CardContent className="p-0">
                {(!activity || activity.length === 0) ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    No recent activity.
                  </div>
                ) : (
                  <div className="divide-y">
                    {activity.slice(0, 5).map((item) => (
                      <div key={item.id} className="p-4 flex items-start gap-3">
                        <div className="mt-0.5 p-1.5 bg-primary/10 text-primary rounded-full">
                          {item.type === ActivityItemType.enrollment && <BookOpen className="w-3.5 h-3.5" />}
                          {item.type === ActivityItemType.lesson_completion && <CheckSquare className="w-3.5 h-3.5" />}
                          {item.type === ActivityItemType.submission && <FileText className="w-3.5 h-3.5" />}
                          {item.type === ActivityItemType.quiz_attempt && <Trophy className="w-3.5 h-3.5" />}
                        </div>
                        <div className="text-sm">
                          <p className="text-foreground">{item.description}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(item.occurredAt).toLocaleDateString(undefined, { 
                              month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
