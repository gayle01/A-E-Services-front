import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useListCourses, 
  useCreateCourse, 
  useUpdateCourse, 
  useDeleteCourse,
  CourseLevel,
  getListCoursesQueryKey,
  getGetAdminDashboardQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Edit, Trash2, Plus, Settings } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { LoadingState } from "@/components/loading-state";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
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

const courseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description is required."),
  category: z.string().min(2, "Category is required."),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  instructor: z.string().optional(),
  coverColor: z.string().optional(),
});

type CourseFormValues = z.infer<typeof courseSchema>;

export default function AdminCoursesList() {
  const { data: courses, isLoading } = useListCourses();
  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();
  const deleteMutation = useDeleteCourse();
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      level: "beginner",
      instructor: "",
      coverColor: "hsl(var(--primary))",
    },
  });

  const openCreateDialog = () => {
    setEditingId(null);
    form.reset({
      title: "",
      description: "",
      category: "",
      level: "beginner",
      instructor: "",
      coverColor: "hsl(var(--primary))",
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (course: any) => {
    setEditingId(course.id);
    form.reset({
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      instructor: course.instructor || "",
      coverColor: course.coverColor || "hsl(var(--primary))",
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (values: CourseFormValues) => {
    if (editingId) {
      updateMutation.mutate(
        { courseId: editingId, data: values },
        {
          onSuccess: () => {
            toast({ title: "Course updated successfully" });
            setIsDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: getListCoursesQueryKey() });
          },
          onError: (err) => toast({ title: "Error", description: String(err), variant: "destructive" })
        }
      );
    } else {
      createMutation.mutate(
        { data: values },
        {
          onSuccess: () => {
            toast({ title: "Course created successfully" });
            setIsDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: getListCoursesQueryKey() });
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
      { courseId: deletingId },
      {
        onSuccess: () => {
          toast({ title: "Course deleted successfully" });
          setIsDeleteDialogOpen(false);
          setDeletingId(null);
          queryClient.invalidateQueries({ queryKey: getListCoursesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetAdminDashboardQueryKey() });
        },
        onError: (err) => toast({ title: "Error", description: String(err), variant: "destructive" })
      }
    );
  };

  if (isLoading) return <LoadingState message="Loading learning modules..." />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <PageHeader 
        title="Manage Learning Modules" 
        description="Create and manage architecture training content." 
        action={
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" /> Create Module
          </Button>
        }
      />

      {(!courses || courses.length === 0) ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <p className="text-muted-foreground mb-4">No modules exist yet.</p>
          <Button variant="outline" onClick={openCreateDialog}>Create Your First Module</Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="flex flex-col overflow-hidden">
              <div 
                className="h-24 w-full relative"
                style={{ backgroundColor: course.coverColor || "hsl(var(--primary))" }}
              />
              <CardHeader className="pb-3 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="font-medium capitalize">
                    {course.level}
                  </Badge>
                  <Badge variant="secondary" className="font-medium text-xs">
                    {course.category}
                  </Badge>
                </div>
                <h3 className="font-semibold text-lg line-clamp-1">{course.title}</h3>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {course.description}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{course.lessonCount} lessons</span>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between bg-muted/20 border-t pt-4">
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEditDialog(course)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive" 
                    onClick={() => { setDeletingId(course.id); setIsDeleteDialogOpen(true); }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Link href={`/admin/courses/${course.id}`}>
                  <Button variant="secondary" size="sm" className="h-8">
                    <Settings className="h-3.5 w-3.5 mr-1" /> Manage Lessons
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog for Create/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Course" : "Create New Course"}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Intro to Design" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="What will students learn?" rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Design, Engineering" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="instructor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructor Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="coverColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Color (CSS value)</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <div 
                            className="w-9 h-9 rounded border"
                            style={{ backgroundColor: field.value || "transparent" }}
                          />
                          <Input className="flex-1" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : "Save Course"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the course, all its lessons, and remove it from enrolled students' dashboards. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Course"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
