import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useGetQuiz, 
  useCreateQuiz, 
  useUpdateQuiz, 
  useListCourses,
  getListQuizzesQueryKey,
  getGetAdminDashboardQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, GripVertical, AlertCircle } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { LoadingState } from "@/components/loading-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
import { Alert, AlertDescription } from "@/components/ui/alert";

const questionSchema = z.object({
  prompt: z.string().min(3, "Prompt is required"),
  options: z.array(z.string().min(1, "Option text cannot be empty")).min(2, "At least 2 options required"),
  correctIndex: z.coerce.number().min(0),
  points: z.coerce.number().min(1, "Points required"),
});

const quizSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(5, "Description is required."),
  courseId: z.string().min(1, "Course is required."),
  questions: z.array(questionSchema).min(1, "At least one question is required"),
});

type QuizFormValues = z.infer<typeof quizSchema>;

export default function AdminQuizBuilder() {
  const params = useParams();
  const isEditing = !!params.quizId;
  const [, setLocation] = useLocation();
  
  const { data: courses, isLoading: isCoursesLoading } = useListCourses();
  const { data: quiz, isLoading: isQuizLoading } = useGetQuiz(params.quizId || "", {
    query: { enabled: isEditing }
  });
  
  const createMutation = useCreateQuiz();
  const updateMutation = useUpdateQuiz();
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: "",
      description: "",
      courseId: "",
      questions: [
        { prompt: "", options: ["", ""], correctIndex: 0, points: 10 }
      ],
    },
  });

  const { fields: questions, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  // Populate form when editing
  useEffect(() => {
    if (isEditing && quiz) {
      form.reset({
        title: quiz.title,
        description: quiz.description,
        courseId: quiz.courseId,
        questions: quiz.questions as any, // Simple mapping since internal API types align well enough here
      });
    }
  }, [isEditing, quiz, form]);

  const onSubmit = (values: QuizFormValues) => {
    if (isEditing && params.quizId) {
      updateMutation.mutate(
        { quizId: params.quizId, data: values },
        {
          onSuccess: () => {
            toast({ title: "Quiz updated successfully" });
            queryClient.invalidateQueries({ queryKey: getListQuizzesQueryKey() });
            setLocation("/admin/quizzes");
          },
          onError: (err) => toast({ title: "Error", description: String(err), variant: "destructive" })
        }
      );
    } else {
      createMutation.mutate(
        { data: values },
        {
          onSuccess: () => {
            toast({ title: "Quiz created successfully" });
            queryClient.invalidateQueries({ queryKey: getListQuizzesQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetAdminDashboardQueryKey() });
            setLocation("/admin/quizzes");
          },
          onError: (err) => toast({ title: "Error", description: String(err), variant: "destructive" })
        }
      );
    }
  };

  if ((isEditing && isQuizLoading) || isCoursesLoading) {
    return <LoadingState message="Loading builder..." />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-32">
      <PageHeader 
        backHref="/admin/quizzes"
        backLabel="Quizzes"
        title={isEditing ? "Edit Quiz" : "Build Quiz"} 
        description="Design your assessment." 
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
          
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quiz Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Midterm Assessment" {...field} />
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
                        disabled={isEditing}
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
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Instructions for students" rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">Questions</h2>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => appendQuestion({ prompt: "", options: ["", ""], correctIndex: 0, points: 10 })}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Question
              </Button>
            </div>

            {form.formState.errors.questions?.root && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{form.formState.errors.questions.root.message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-6">
              {questions.map((question, qIndex) => (
                <Card key={question.id} className="relative border-2 border-muted hover:border-primary/20 transition-colors">
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                      onClick={() => removeQuestion(qIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                        {qIndex + 1}
                      </div>
                      <CardTitle className="text-base font-semibold">Question Setup</CardTitle>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-[1fr_120px] gap-4">
                      <FormField
                        control={form.control}
                        name={`questions.${qIndex}.prompt`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prompt</FormLabel>
                            <FormControl>
                              <Textarea placeholder="What is the..." rows={2} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`questions.${qIndex}.points`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Points</FormLabel>
                            <FormControl>
                              <Input type="number" min={1} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-3 p-4 bg-muted/20 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-medium">Multiple Choice Options</Label>
                        <span className="text-xs text-muted-foreground italic">Select the radio button to mark the correct answer</span>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name={`questions.${qIndex}.correctIndex`}
                        render={({ field: correctIndexField }) => (
                          <RadioGroup 
                            value={correctIndexField.value?.toString() || "0"}
                            onValueChange={(val) => correctIndexField.onChange(parseInt(val))}
                            className="space-y-3"
                          >
                            {[0, 1, 2, 3].map((optIndex) => (
                              <div key={optIndex} className="flex items-center gap-3">
                                <RadioGroupItem value={optIndex.toString()} id={`q${qIndex}-opt${optIndex}`} />
                                <FormField
                                  control={form.control}
                                  name={`questions.${qIndex}.options.${optIndex}`}
                                  render={({ field: optionField }) => (
                                    <FormItem className="flex-1 space-y-0">
                                      <FormControl>
                                        <Input 
                                          placeholder={`Option ${optIndex + 1}`} 
                                          {...optionField} 
                                          value={optionField.value || ''}
                                          className={correctIndexField.value === optIndex ? "border-green-500/50 focus-visible:ring-green-500" : ""}
                                        />
                                      </FormControl>
                                      {/* Only show message if it's the first two options (required) or if they typed something invalid */}
                                      {(optIndex < 2 || optionField.value) && <FormMessage className="mt-1 text-xs" />}
                                    </FormItem>
                                  )}
                                />
                              </div>
                            ))}
                          </RadioGroup>
                        )}
                      />
                      
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="fixed bottom-0 left-64 right-0 p-4 bg-background/80 backdrop-blur-md border-t flex justify-end gap-4">
            <Link href="/admin/quizzes">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
            <Button 
              type="submit" 
              size="lg"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : "Save Quiz"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
