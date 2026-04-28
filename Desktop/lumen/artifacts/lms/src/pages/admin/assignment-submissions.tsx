import { useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { useGetAssignment, useListSubmissionsForAssignment } from "@workspace/api-client-react";
import { ClipboardCheck, Download, ExternalLink, FileText, Search, Users } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { LoadingState } from "@/components/loading-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type StatusFilter = "all" | "graded" | "ungraded";

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AdminAssignmentSubmissions() {
  const params = useParams();
  const assignmentId = params.assignmentId ?? "";

  const { data: assignment, isLoading: isLoadingAssignment } = useGetAssignment(assignmentId);
  const { data: submissions, isLoading: isLoadingSubmissions } =
    useListSubmissionsForAssignment(assignmentId);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const summary = useMemo(() => {
    const all = submissions ?? [];
    const total = all.length;
    const graded = all.filter((s) => s.grade !== undefined).length;
    const withAttachments = all.filter((s) => !!s.attachment).length;

    return { total, graded, withAttachments };
  }, [submissions]);

  const filteredSubmissions = useMemo(() => {
    const all = submissions ?? [];
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return all.filter((submission) => {
      const isGraded = submission.grade !== undefined;
      const statusMatches =
        statusFilter === "all" ||
        (statusFilter === "graded" && isGraded) ||
        (statusFilter === "ungraded" && !isGraded);
      const searchMatches =
        normalizedSearch.length === 0 ||
        submission.studentName.toLowerCase().includes(normalizedSearch);

      return statusMatches && searchMatches;
    });
  }, [submissions, searchTerm, statusFilter]);

  const exportCsv = () => {
    if (!assignment || filteredSubmissions.length === 0) return;

    const escapeCsv = (value: string) => `"${value.replace(/"/g, "\"\"")}"`;
    const header = [
      "Student Name",
      "Submitted At",
      "Status",
      "Grade",
      "Attachment URL",
      "Content",
    ].join(",");

    const rows = filteredSubmissions.map((submission) => {
      const isGraded = submission.grade !== undefined;
      return [
        escapeCsv(submission.studentName),
        escapeCsv(formatDate(submission.submittedAt)),
        escapeCsv(isGraded ? "Graded" : "Submitted"),
        escapeCsv(isGraded ? `${submission.grade}/${assignment.points}` : ""),
        escapeCsv(submission.attachment?.publicUrl ?? ""),
        escapeCsv(submission.content),
      ].join(",");
    });

    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeTitle = assignment.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    link.href = url;
    link.download = `submissions-${safeTitle || assignment.id}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoadingAssignment || isLoadingSubmissions) {
    return <LoadingState message="Loading learner submissions..." />;
  }

  if (!assignment) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <PageHeader
          title="Submissions"
          description="This assignment could not be loaded."
          backHref="/admin/assignments"
          backLabel="Back to Project Tasks"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <PageHeader
        title="Learner Submissions"
        description={`Track progress for "${assignment.title}".`}
        backHref="/admin/assignments"
        backLabel="Back to Project Tasks"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-2xl font-bold">{summary.total}</div>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Graded</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-2xl font-bold">{summary.graded}</div>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">With Attachments</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-2xl font-bold">{summary.withAttachments}</div>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submission List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative w-full md:w-72">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by learner name..."
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                >
                  All
                </Button>
                <Button
                  type="button"
                  variant={statusFilter === "graded" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("graded")}
                >
                  Graded
                </Button>
                <Button
                  type="button"
                  variant={statusFilter === "ungraded" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("ungraded")}
                >
                  Ungraded
                </Button>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={exportCsv}
              disabled={filteredSubmissions.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {!submissions || submissions.length === 0 ? (
            <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
              No submissions yet for this task.
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
              No submissions match your current filters.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Learner</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Attachment</TableHead>
                  <TableHead>Content</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => {
                  const isGraded = submission.grade !== undefined;

                  return (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">{submission.studentName}</TableCell>
                      <TableCell>{formatDate(submission.submittedAt)}</TableCell>
                      <TableCell>
                        <Badge variant={isGraded ? "secondary" : "outline"}>
                          {isGraded ? "Graded" : "Submitted"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {isGraded ? `${submission.grade} / ${assignment.points}` : "-"}
                      </TableCell>
                      <TableCell>
                        {submission.attachment?.publicUrl ? (
                          <a
                            href={submission.attachment.publicUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            View file
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="max-w-[320px]">
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {submission.content}
                        </p>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Link href="/admin/assignments">
          <Button variant="outline">Done</Button>
        </Link>
      </div>
    </div>
  );
}
