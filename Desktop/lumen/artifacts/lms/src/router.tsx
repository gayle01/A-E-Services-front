import { Switch, Route } from "wouter";
import { Layout } from "./components/layout";
import NotFound from "./pages/not-found";
import LandingPage from "./pages/landing";

// Student pages
import StudentDashboard from "./pages/student/dashboard";
import CoursesList from "./pages/student/courses";
import CourseDetail from "./pages/student/course-detail";
import LessonView from "./pages/student/lesson";
import MyCourses from "./pages/student/my-courses";
import AssignmentsList from "./pages/student/assignments";
import AssignmentDetail from "./pages/student/assignment-detail";
import QuizzesList from "./pages/student/quizzes";
import QuizView from "./pages/student/quiz-view";
import MyProgress from "./pages/student/my-progress";

// Admin pages
import AdminDashboard from "./pages/admin/dashboard";
import AdminCoursesList from "./pages/admin/courses";
import AdminCourseDetail from "./pages/admin/course-detail";
import AdminAssignmentsList from "./pages/admin/assignments";
import AdminAssignmentSubmissions from "./pages/admin/assignment-submissions";
import AdminQuizzesList from "./pages/admin/quizzes";
import AdminQuizBuilder from "./pages/admin/quiz-builder";

function MainApp() {
  return (
    <Layout>
      <Switch>
        {/* Student Routes */}
        <Route path="/dashboard" component={StudentDashboard} />
        <Route path="/courses" component={CoursesList} />
        <Route path="/courses/:courseId" component={CourseDetail} />
        <Route path="/lessons/:lessonId" component={LessonView} />
        <Route path="/my-courses" component={MyCourses} />
        <Route path="/assignments" component={AssignmentsList} />
        <Route path="/assignments/:assignmentId" component={AssignmentDetail} />
        <Route path="/quizzes" component={QuizzesList} />
        <Route path="/quizzes/:quizId" component={QuizView} />
        <Route path="/my-progress" component={MyProgress} />

        {/* Admin Routes */}
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/courses" component={AdminCoursesList} />
        <Route path="/admin/courses/:courseId" component={AdminCourseDetail} />
        <Route path="/admin/assignments" component={AdminAssignmentsList} />
        <Route
          path="/admin/assignments/:assignmentId/submissions"
          component={AdminAssignmentSubmissions}
        />
        <Route path="/admin/quizzes" component={AdminQuizzesList} />
        <Route path="/admin/quizzes/new" component={AdminQuizBuilder} />
        <Route path="/admin/quizzes/:quizId/edit" component={AdminQuizBuilder} />

        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

export function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route component={MainApp} />
    </Switch>
  );
}
