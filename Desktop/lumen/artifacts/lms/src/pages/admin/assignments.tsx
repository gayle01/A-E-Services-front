import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useListAssignments, 
  useCreateAssignment, 
  useUpdateAssignment, 
  useDeleteAssignment,
  useListCourses,
  getListAssignmentsQueryKey,
  getGetAdminDashboardQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Edit, Trash2, Plus, Calendar, Users } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { LoadingState } from "@/components/loading-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const assignmentSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  courseId: z.string().min(1, "Course is required."),
  instructions: z.string().min(10, "Instructions are required."),
  points: z.coerce.number().min(1, "Points must be at least 1."),
  dueAt: z.string().optional(),
});

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

export default function AdminAssignmentsList() {
  const { data: assignments, isLoading: isAssignmentsLoading } = useListAssignments();
  const { data: courses, isLoading: isCoursesLoading } = useListCourses();
  
  const createMutation = useCreateAssignment();
  const updateMutation = useUpdateAssignment();
  const deleteMutation = useDeleteAssignment();
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: "",
      courseId: "",
      instructions: "",
      points: 100,
      dueAt: "",
    },
  });

  const openCreateDialog = () => {
    setEditingId(null);
    form.reset({
      title: "",
      courseId: "",
      instructions: "",
      points: 100,
      dueAt: "",
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (assignment: any) => {
    setEditingId(assignment.id);
    form.reset({
      title: assignment.title,
      courseId: assignment.courseId,
      instructions: assignment.instructions,
      points: assignment.points,
      dueAt: assignment.dueAt ? new Date(assignment.dueAt).toISOString().split('T')[0] : "", // Simplified date mapping
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (values: AssignmentFormValues) => {
    const payload = {
      ...values,
      dueAt: values.dueAt ? new Date(values.dueAt).toISOString() : undefined,
    };

    if (editingId) {
      updateMutation.mutate(
        { assignmentId: editingId, data: payload },
        {
          onSuccess: () => {
            toast({ title: "Assignment updated successfully" });
            setIsDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: getListAssignmentsQueryKey() });
          },
          onError: (err) => toast({ title: "Error", description: String(err), variant: "destructive" })
        }
      );
    } else {
      createMutation.mutate(
        { data: payload },
        {
          onSuccess: () => {
            toast({ title: "Assignment created successfully" });
            setIsDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: getListAssignmentsQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetAdminDashboardQueryKey() });
          },
          onError: (err) => toast({ title: "Error", description: String(err), variant: "destructive" })
        }
      );
    }
  };

  const confirmDelete = () => {
    if (!deletingId) return;
    deleteMutation.mutate(
      { assignmentId: deletingId },
      {
        onSuccess: () => {
          toast({ title: "Assignment deleted successfully" });
          setIsDeleteDialogOpen(false);
          setDeletingId(null);
          queryClient.invalidateQueries({ queryKey: getListAssignmentsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetAdminDashboardQueryKey() });
        },
        onError: (err) => toast({ title: "Error", description: String(err), variant: "destructive" })
      }
    );
  };

  if (isAssignmentsLoading || isCoursesLoading) return <LoadingState message="Loading project tasks..." />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <PageHeader 
        title="Manage Project Tasks" 
        description="Create studio tasks and deliverables for learners." 
        action={
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" /> Create Task
          </Button>
        }
      />

      {(!assignments || assignments.length === 0) ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <p className="text-muted-foreground mb-4">No tasks exist yet.</p>
          <Button variant="outline" onClick={openCreateDialog}>Create Your First Task</Button>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="overflow-hidden hover:border-primary/30 transition-colors">
              <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-medium text-xs uppercase tracking-wider">
                      {assignment.courseTitle}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-medium">{assignment.points} points</span>
                  </div>
                  <h3 className="font-semibold text-lg truncate">{assignment.title}</h3>
                  {assignment.dueAt && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Due {new Date(assignment.dueAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2 shrink-0 border-t pt-4 sm:border-t-0 sm:pt-0">
                  <Link href={`/admin/assignments/${assignment.id}/submissions`}>
                    <Button variant="secondary" size="sm">
                      <Users className="h-4 w-4 mr-2" /> Submissions
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(assignment)}>
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => { setDeletingId(assignment.id); setIsDeleteDialogOpen(true); }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog for Create/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Assignment" : "Create New Assignment"}</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto pr-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4 pb-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Final Essay" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="courseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={!!editingId} // Don't allow changing course after creation for simplicity
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a course" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {courses?.map(course => (
                            <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructions</FormLabel>
                      <FormControl>
                        <Textarea placeholder="What should the students do?" rows={5} className="resize-y" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="points"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Points</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dueAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end pt-4 border-t mt-6">
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : "Save Assignment"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the assignment. Submissions from students will be lost. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Assignment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
