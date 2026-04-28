import { useState } from "react";
import { Link } from "wouter";
import { 
  useListQuizzes, 
  useDeleteQuiz,
  getListQuizzesQueryKey,
  getGetAdminDashboardQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Edit, Trash2, Plus, FileQuestion } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { LoadingState } from "@/components/loading-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminQuizzesList() {
  const { data: quizzes, isLoading } = useListQuizzes();
  const deleteMutation = useDeleteQuiz();
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const confirmDelete = () => {
    if (!deletingId) return;
    deleteMutation.mutate(
      { quizId: deletingId },
      {
        onSuccess: () => {
          toast({ title: "Quiz deleted successfully" });
          setIsDeleteDialogOpen(false);
          setDeletingId(null);
          queryClient.invalidateQueries({ queryKey: getListQuizzesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetAdminDashboardQueryKey() });
        },
        onError: (err) => toast({ title: "Error", description: String(err), variant: "destructive" })
      }
    );
  };

  if (isLoading) return <LoadingState message="Loading knowledge checks..." />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <PageHeader 
        title="Manage Knowledge Checks" 
        description="Create and manage assessments for your learning modules." 
        action={
          <Link href="/admin/quizzes/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Check
            </Button>
          </Link>
        }
      />

      {(!quizzes || quizzes.length === 0) ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <p className="text-muted-foreground mb-4">No knowledge checks exist yet.</p>
          <Link href="/admin/quizzes/new">
            <Button variant="outline">Create Your First Check</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="overflow-hidden hover:border-primary/30 transition-colors">
              <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <Badge variant="secondary" className="font-medium text-xs uppercase tracking-wider mb-1">
                    {quiz.courseTitle}
                  </Badge>
                  <h3 className="font-semibold text-lg truncate">{quiz.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileQuestion className="w-3.5 h-3.5" />
                      {quiz.questionCount} questions
                    </span>
                    <span>{quiz.totalPoints} points</span>
                  </div>
                </div>
                
                <div className="flex gap-2 shrink-0 border-t pt-4 sm:border-t-0 sm:pt-0">
                  <Link href={`/admin/quizzes/${quiz.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => { setDeletingId(quiz.id); setIsDeleteDialogOpen(true); }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the quiz. All student attempts will be lost. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Quiz"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
