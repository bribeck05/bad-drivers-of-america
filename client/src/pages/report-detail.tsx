import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link, useParams } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MapPin, ThumbsUp, ThumbsDown, MessageCircle, Eye, Clock, Car, Send } from "lucide-react";
import type { Report, Comment } from "@shared/schema";
import { INCIDENT_LABELS, INCIDENT_COLORS, formatTimeAgo } from "@/lib/utils";

export default function ReportDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("Anonymous Driver");

  const { data: report, isLoading } = useQuery<Report>({
    queryKey: ["/api/reports", id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/reports/${id}`);
      return res.json();
    },
  });

  const { data: comments, isLoading: commentsLoading } = useQuery<Comment[]>({
    queryKey: ["/api/reports", id, "comments"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/reports/${id}/comments`);
      return res.json();
    },
  });

  const upvoteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/reports/${id}/upvote`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
    },
    onError: () => {
      toast({ title: "Failed to upvote", variant: "destructive" });
    },
  });

  const downvoteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/reports/${id}/downvote`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
    },
    onError: () => {
      toast({ title: "Failed to downvote", variant: "destructive" });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (data: { authorName: string; content: string }) => {
      const res = await apiRequest("POST", `/api/reports/${id}/comments`, {
        ...data,
        reportId: id,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports", id, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      setCommentText("");
      toast({ title: "Comment added" });
    },
    onError: () => {
      toast({ title: "Failed to add comment", variant: "destructive" });
    },
  });

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    commentMutation.mutate({
      authorName: commentAuthor.trim() || "Anonymous Driver",
      content: commentText.trim(),
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center text-center px-8 py-20">
        <h3 className="font-display font-bold text-lg mb-2">Report not found</h3>
        <p className="text-sm text-muted-foreground mb-4">This report may have been removed.</p>
        <Link href="/" className="text-primary font-medium text-sm">Back to Feed</Link>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-4">
      {/* Back button */}
      <Link href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Feed
      </Link>

      {/* Media */}
      {report.mediaData && (
        <div className="rounded-xl overflow-hidden border border-border">
          {report.mediaType === "video" ? (
            <video src={report.mediaData} className="w-full aspect-video object-cover" controls />
          ) : (
            <img src={report.mediaData} alt={report.title} className="w-full aspect-video object-cover" />
          )}
        </div>
      )}

      {/* Title & Badge */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge className={`${INCIDENT_COLORS[report.incidentType as keyof typeof INCIDENT_COLORS] || "bg-gray-500 text-white"} border-0`}>
            {INCIDENT_LABELS[report.incidentType as keyof typeof INCIDENT_LABELS] || "Other"}
          </Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
            <Clock className="w-3 h-3" />
            {formatTimeAgo(report.createdAt)}
          </span>
        </div>
        <h1 className="font-display font-black text-xl leading-tight">{report.title}</h1>
        {report.description && (
          <p className="text-sm text-foreground/80 leading-relaxed">{report.description}</p>
        )}
      </div>

      {/* Vehicle Info Card */}
      <Card className="p-4 space-y-3 border-card-border">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <Car className="w-3.5 h-3.5" />
          Vehicle Details
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">License Plate</div>
            <div className="font-mono font-bold tracking-wider text-base">{report.licensePlate}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">Make / Model</div>
            <div className="font-medium">{report.make || "Unknown"} {report.model || ""}</div>
          </div>
          <div className="col-span-2">
            <div className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Location
            </div>
            <div className="font-medium">{report.location}{report.state ? `, ${report.state}` : ""}</div>
          </div>
        </div>
      </Card>

      {/* Reporter */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold">
          {report.authorName.charAt(0).toUpperCase()}
        </div>
        <span>Reported by <span className="font-medium text-foreground">{report.authorName}</span></span>
      </div>

      {/* Vote Bar */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          data-testid="button-upvote"
          onClick={() => upvoteMutation.mutate()}
          disabled={upvoteMutation.isPending}
          className="flex items-center gap-1.5"
        >
          <ThumbsUp className="w-4 h-4" />
          {report.upvotes}
        </Button>
        <Button
          variant="outline"
          size="sm"
          data-testid="button-downvote"
          onClick={() => downvoteMutation.mutate()}
          disabled={downvoteMutation.isPending}
          className="flex items-center gap-1.5"
        >
          <ThumbsDown className="w-4 h-4" />
          {report.downvotes}
        </Button>
        <div className="flex items-center gap-3 text-xs text-muted-foreground ml-auto">
          <span className="flex items-center gap-1">
            <MessageCircle className="w-3.5 h-3.5" />
            {report.commentCount}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {report.views}
          </span>
        </div>
      </div>

      {/* Comments */}
      <div className="space-y-3 pt-2">
        <h2 className="font-display font-bold text-base flex items-center gap-2">
          Comments
          <span className="text-sm text-muted-foreground font-normal">({report.commentCount})</span>
        </h2>

        {/* Comment form */}
        <form onSubmit={handleComment} className="space-y-2">
          <Input
            data-testid="input-comment-author"
            placeholder="Your name (optional)"
            value={commentAuthor}
            onChange={(e) => setCommentAuthor(e.target.value)}
            maxLength={50}
          />
          <div className="flex gap-2">
            <Input
              data-testid="input-comment-text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              maxLength={300}
            />
            <Button
              type="submit"
              size="icon"
              data-testid="button-submit-comment"
              disabled={commentMutation.isPending || !commentText.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>

        {/* Comment list */}
        {commentsLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        ) : comments && comments.length > 0 ? (
          <div className="space-y-2">
            {comments.map((comment) => (
              <Card key={comment.id} className="p-3 border-card-border" data-testid={`card-comment-${comment.id}`}>
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-xs font-bold shrink-0">
                    {comment.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold">{comment.authorName}</span>
                      <span className="text-xs text-muted-foreground">{formatTimeAgo(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-foreground/90 mt-0.5">{comment.content}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Start the conversation.</p>
        )}
      </div>
    </div>
  );
}
