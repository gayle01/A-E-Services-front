import { useGetAdminDashboard } from "@workspace/api-client-react";
import { BookOpen, Users, FileText, CheckSquare, FileSignature, LayoutDashboard, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { LoadingState } from "@/components/loading-state";

export default function AdminDashboard() {
  const { data: dashboard, isLoading } = useGetAdminDashboard();

  if (isLoading) return <LoadingState message="Loading studio overview..." />;
  if (!dashboard) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <PageHeader 
        title="Studio Admin Overview" 
        description="Monitor architecture training activity and content metrics." 
      />

      {/* High-level metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.totalCourses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
            <FileSignature className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.totalLessons}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.totalAssignments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
            <CheckSquare className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.totalQuizzes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.totalEnrollments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Submissions</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.totalSubmissions}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Modules by Category</CardTitle>
            <CardDescription>Distribution of architecture content across categories.</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboard.coursesByCategory.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-6">No category data available.</div>
            ) : (
              <div className="space-y-4">
                {dashboard.coursesByCategory.map((cat) => (
                  <div key={cat.category} className="flex items-center justify-between">
                    <span className="font-medium text-sm">{cat.category}</span>
                    <span className="text-sm text-muted-foreground">{cat.count} courses</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Submissions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
            <CardDescription>Latest student assignment submissions.</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboard.recentSubmissions.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-6">No recent submissions.</div>
            ) : (
              <div className="space-y-6">
                {dashboard.recentSubmissions.map((sub) => (
                  <div key={sub.id} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">{sub.studentName}</p>
                      <p className="text-xs text-muted-foreground">{sub.assignmentTitle || 'Unknown Assignment'}</p>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
