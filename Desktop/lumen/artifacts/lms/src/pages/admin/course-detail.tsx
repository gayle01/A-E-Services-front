import { useState } from "react";
import { useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useGetCourse, 
  useCreateLesson, 
  useUpdateLesson, 
  useDeleteLesson,
  getGetCourseQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Edit, Trash2, Plus, Clock, GripVertical } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { LoadingState } from "@/components/loading-state";
import { Button } from "@/components/ui/button";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { extractTextFromUpload } from "@/lib/upload-text";

const lessonSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  content: z.string().min(10, "Content is required."),
  durationMinutes: z.coerce.number().min(1, "Duration must be at least 1 minute.").optional(),
  orderIndex: z.coerce.number().min(0).default(0),
});

type LessonFormValues = z.infer<typeof lessonSchema>;

export default function AdminCourseDetail() {
  const params = useParams();
  const courseId = params.courseId || "";
  
  const { data: course, isLoading } = useGetCourse(courseId);
  const createMutation = useCreateLesson();
  const updateMutation = useUpdateLesson();
  const deleteMutation = useDeleteLesson();
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [contentInputMode, setContentInputMode] = useState<"type" | "upload">("type");
  const [uploadedFileLabel, setUploadedFileLabel] = useState("");

  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: "",
      content: "",
      durationMinutes: undefined,
      orderIndex: 0,
    },
  });

  const openCreateDialog = () => {
    setEditingId(null);
    form.reset({
      title: "",
      content: "",
      durationMinutes: undefined,
      orderIndex: (course?.lessons?.length || 0),
    });
    setIsDialogOpen(true);
    setContentInputMode("type");
    setUploadedFileLabel("");
  };

  const openEditDialog = (lesson: any) => {
    setEditingId(lesson.id);
    form.reset({
      title: lesson.title,
      content: lesson.content,
      durationMinutes: lesson.durationMinutes,
      orderIndex: lesson.orderIndex,
    });
    setIsDialogOpen(true);
    setContentInputMode("type");
    setUploadedFileLabel("");
  };

  const handleLessonFileUpload = async (file: File | null) => {
    if (!file) return;

    const uploadedContent = await extractTextFromUpload(file);
    form.setValue("content", uploadedContent, { shouldValidate: true, shouldDirty: true });
    setUploadedFileLabel(`${file.name} (${Math.round(file.size / 1024)} KB)`);
    setContentInputMode("upload");
  };

  const onSubmit = (values: LessonFormValues) => {
    if (editingId) {
      updateMutation.mutate(
        { lessonId: editingId, data: values },
        {
          onSuccess: () => {
            toast({ title: "Lesson updated successfully" });
            setIsDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: getGetCourseQueryKey(courseId) });
          },
          onError: (err) => toast({ title: "Error", description: String(err), variant: "destructive" })
        }
      );
    } else {
      createMutation.mutate(
        { courseId, data: values },
        {
          onSuccess: () => {
            toast({ title: "Lesson created successfully" });
            setIsDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: getGetCourseQueryKey(courseId) });
          },
          onError: (err) => toast({ title: "Error", description: String(err), variant: "destructive" })
        }
      );
    }
  };

  const confirmDelete = () => {
    if (!deletingId) return;
    deleteMutation.mutate(
      { lessonId: deletingId },
      {
        onSuccess: () => {
          toast({ title: "Lesson deleted successfully" });
          setIsDeleteDialogOpen(false);
          setDeletingId(null);
          queryClient.invalidateQueries({ queryKey: getGetCourseQueryKey(courseId) });
        },
        onError: (err) => toast({ title: "Error", description: String(err), variant: "destructive" })
      }
    );
  };

  if (isLoading) return <LoadingState message="Loading course data..." />;
  if (!course) return <div className="text-center py-20 text-muted-foreground">Course not found.</div>;

  const lessons = course.lessons ? [...course.lessons].sort((a, b) => a.orderIndex - b.orderIndex) : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <PageHeader 
        backHref="/admin/courses"
        backLabel="Courses"
        title={course.title} 
        description="Manage curriculum and lessons for this course." 
        action={
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add Lesson
          </Button>
        }
      />

      <div className="max-w-4xl space-y-4">
        {lessons.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
            <p className="text-muted-foreground mb-4">No lessons added yet.</p>
            <Button variant="outline" onClick={openCreateDialog}>Create First Lesson</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson, index) => (
              <div 
                key={lesson.id} 
                className="flex items-center gap-4 p-4 bg-card border rounded-xl shadow-sm hover:border-primary/30 transition-colors"
              >
                <div className="text-muted-foreground cursor-move p-2 hover:bg-muted rounded">
                  <GripVertical className="h-5 w-5" />
                </div>
                
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium shrink-0">
                  {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-lg">{lesson.title}</h4>
                  {lesson.durationMinutes && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="w-3.5 h-3.5" /> {lesson.durationMinutes} min read
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(lesson)}>
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => { setDeletingId(lesson.id); setIsDeleteDialogOpen(true); }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog for Create/Edit Lesson */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Lesson" : "Create New Lesson"}</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto pr-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4 pb-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lesson Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Introduction to the topic" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="durationMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (Minutes)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Optional" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="orderIndex"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order (Position)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Content (Markdown supported)</FormLabel>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={contentInputMode === "type" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setContentInputMode("type")}
                        >
                          Type content
                        </Button>
                        <Button
                          type="button"
                          variant={contentInputMode === "upload" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setContentInputMode("upload")}
                        >
                          Upload file
                        </Button>
                      </div>
                      {contentInputMode === "upload" && (
                        <div className="rounded-md border border-dashed p-3 text-sm">
                          <Input
                            type="file"
                            accept=".txt,.md,.json,.csv,.html,.xml,.pdf,.doc,.docx"
                            onChange={(event) =>
                              handleLessonFileUpload(event.target.files?.[0] ?? null)
                            }
                          />
                          {uploadedFileLabel ? (
                            <p className="mt-2 text-muted-foreground">
                              Uploaded: {uploadedFileLabel}
                            </p>
                          ) : (
                            <p className="mt-2 text-muted-foreground">
                              Upload a file to prefill lesson content.
                            </p>
                          )}
                        </div>
                      )}
                      <FormControl>
                        <Textarea 
                          placeholder="Write the lesson content here..." 
                          className="min-h-[300px] resize-y font-mono text-sm" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-4 border-t">
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : "Save Lesson"}
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
              This will permanently delete this lesson. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Lesson"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
