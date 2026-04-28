import { useParams, Link } from "wouter";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useGetAssignment, 
  useSubmitAssignment,
  AssignmentWithStatusStatus,
  getListMyAssignmentsQueryKey,
  getGetStudentDashboardQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { LoadingState } from "@/components/loading-state";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { extractTextFromUpload } from "@/lib/upload-text";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

const submitSchema = z.object({
  mode: z.enum(["text", "link", "upload"]),
  content: z.string().optional(),
  link: z.string().optional(),
  uploadName: z.string().optional(),
  uploadMimeType: z.string().optional(),
  uploadSize: z.number().optional(),
  uploadBase64Data: z.string().optional(),
  uploadBody: z.string().optional(),
}).superRefine((values, ctx) => {
  if (values.mode === "text" && (!values.content || values.content.trim().length < 10)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Submission must be at least 10 characters long.",
      path: ["content"],
    });
  }

  if (values.mode === "link") {
    const link = values.link?.trim() ?? "";
    if (!link) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please add a link.",
        path: ["link"],
      });
      return;
    }
    if (!/^https?:\/\//i.test(link)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Link must start with http:// or https://",
        path: ["link"],
      });
    }
  }

  if (
    values.mode === "upload" &&
    (!values.uploadName || !values.uploadMimeType || !values.uploadSize || !values.uploadBase64Data)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please upload a file before submitting.",
      path: ["uploadName"],
    });
  }
});

export default function AssignmentDetail() {
  const params = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: assignment, isLoading } = useGetAssignment(params.assignmentId || "");
  const submitMutation = useSubmitAssignment();

  const form = useForm<z.infer<typeof submitSchema>>({
    resolver: zodResolver(submitSchema),
    defaultValues: {
      mode: "text",
      content: "",
      link: "",
      uploadName: "",
      uploadMimeType: "",
      uploadSize: undefined,
      uploadBase64Data: "",
      uploadBody: "",
    },
  });

  if (isLoading) return <LoadingState message="Loading assignment..." />;
  if (!assignment) return <div className="text-center py-20 text-muted-foreground">Assignment not found.</div>;

  const status = assignment.status ?? AssignmentWithStatusStatus.pending;
  const isPending = status === AssignmentWithStatusStatus.pending;
  const isSubmitted = status === AssignmentWithStatusStatus.submitted;
  const isGraded = status === AssignmentWithStatusStatus.graded;

  const onSubmit = (values: z.infer<typeof submitSchema>) => {
    let submissionContent = "";

    if (values.mode === "text") {
      submissionContent = values.content?.trim() ?? "";
    } else if (values.mode === "link") {
      submissionContent = `Submission link:\n${values.link?.trim() ?? ""}`;
    } else {
      submissionContent = [
        `Uploaded file: ${values.uploadName ?? "unknown"}`,
        "",
        values.uploadBody?.trim() || "No file preview available.",
      ].join("\n");
    }

    submitMutation.mutate(
      {
        assignmentId: assignment.id,
        data: {
          content: submissionContent,
          attachment:
            values.mode === "upload"
              ? {
                  fileName: values.uploadName ?? "uploaded-file",
                  mimeType: values.uploadMimeType ?? "application/octet-stream",
                  size: values.uploadSize ?? 0,
                  base64Data: values.uploadBase64Data ?? "",
                }
              : undefined,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Assignment submitted successfully!" });
          queryClient.invalidateQueries({ queryKey: getListMyAssignmentsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStudentDashboardQueryKey() });
        },
        onError: (err) => {
          toast({ title: "Failed to submit", description: String(err), variant: "destructive" });
        }
      }
    );
  };

  const handleFileChange = async (file: File | null) => {
    if (!file) return;

    const body = await extractTextFromUpload(file);
    const bytes = new Uint8Array(await file.arrayBuffer());
    let binary = "";
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }
    const base64Data = btoa(binary);

    form.setValue("uploadName", file.name, { shouldDirty: true, shouldValidate: true });
    form.setValue("uploadMimeType", file.type || "application/octet-stream", {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("uploadSize", file.size, { shouldDirty: true, shouldValidate: true });
    form.setValue("uploadBase64Data", base64Data, { shouldDirty: true, shouldValidate: true });
    form.setValue("uploadBody", body, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/assignments" className="hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" /> All Assignments
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{assignment.courseTitle}</span>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{assignment.title}</h1>
          <Badge 
            variant="secondary" 
            className={`uppercase tracking-wider font-semibold border-0 ${
              isPending ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" :
              isGraded ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" :
              "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
            }`}
          >
            {status}
          </Badge>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <FileText className="w-4 h-4" /> {assignment.points} points possible
          </div>
          {assignment.dueAt && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> Due {new Date(assignment.dueAt).toLocaleString()}
            </div>
          )}
          {assignment.submittedAt && (
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <CheckCircle2 className="w-4 h-4" /> Submitted {new Date(assignment.submittedAt).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      <Card className="bg-card">
        <CardContent className="p-8 prose prose-slate dark:prose-invert max-w-none">
          <h3>Instructions</h3>
          <div className="whitespace-pre-wrap">{assignment.instructions}</div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-bold tracking-tight">Your Submission</h3>
        
        {isPending ? (
          <Card>
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="mode"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant={field.value === "text" ? "default" : "outline"}
                              onClick={() => field.onChange("text")}
                            >
                              Type response
                            </Button>
                            <Button
                              type="button"
                              variant={field.value === "link" ? "default" : "outline"}
                              onClick={() => field.onChange("link")}
                            >
                              Submit link
                            </Button>
                            <Button
                              type="button"
                              variant={field.value === "upload" ? "default" : "outline"}
                              onClick={() => field.onChange("upload")}
                            >
                              Upload file
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {form.watch("mode") === "text" && (
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="Write your submission here..."
                              className="min-h-[200px] resize-y"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  {form.watch("mode") === "link" && (
                    <FormField
                      control={form.control}
                      name="link"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="https://github.com/your-repo or other URL"
                              className="min-h-[120px] resize-y"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  {form.watch("mode") === "upload" && (
                    <div className="space-y-3 rounded-md border border-dashed p-4">
                      <Input
                        type="file"
                        onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
                      />
                      <FormField
                        control={form.control}
                        name="uploadName"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input readOnly value={field.value || ""} placeholder="No file selected yet" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      size="lg" 
                      disabled={submitMutation.isPending}
                    >
                      {submitMutation.isPending ? "Submitting..." : "Submit Assignment"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-medium">Assignment Submitted</h4>
              <p className="text-muted-foreground max-w-md mx-auto">
                Your work has been submitted for grading. Check back later for your results.
              </p>
              
              {isGraded && assignment.grade !== undefined && (
                <div className="mt-8 p-6 bg-background rounded-xl border max-w-xs mx-auto shadow-sm">
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2">Final Grade</div>
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                    {assignment.grade} <span className="text-lg text-muted-foreground font-normal">/ {assignment.points}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
