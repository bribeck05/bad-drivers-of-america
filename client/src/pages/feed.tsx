import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-provider";
import { persistentStorage } from "@/lib/persistent-storage";
import { requestNotificationPermission, sendNotification, getCurrentPosition } from "@/lib/native-notifications";
import { Link, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, ThumbsUp, ThumbsDown, MessageCircle, Eye, Clock, Car, Send, Lock, ChevronDown, ChevronUp, Bell, BellOff, Navigation } from "lucide-react";
import type { Report, Comment } from "@shared/schema";
import { INCIDENT_LABELS, INCIDENT_COLORS, formatTimeAgo } from "@/lib/utils";
import { FlagShieldCar, FlagStripes, StarRow, Star } from "@/components/americana";
import { RoadScene, RoadDivider, INCIDENT_ART } from "@/components/clipart";

/**
 * Patriotic hero banner shown at the top of the feed. Deep asphalt surface with
 * a faint star field so the flag shield reads as the focal point.
 */
function UsaHero({ reportCount }: { reportCount: number }) {
  return (
    <div className="relative overflow-hidden rounded-2xl shadow-lg">
      <div className="hero-asphalt">
        <div className="star-field">
          <div className="road-texture px-4 py-5">
            <div className="flex items-center gap-4">
              <FlagShieldCar className="w-14 h-16 shrink-0 text-white/25 drop-shadow-lg" />

              <div className="min-w-0 flex-1">
                <StarRow count={3} className="text-red-400/80 mb-1.5" />
                <h1 className="font-display font-black text-white text-lg leading-none tracking-tight">
                  Bad Drivers
                  <span className="block text-[11px] font-bold tracking-[0.3em] text-white/50 mt-1">
                    OF AMERICA
                  </span>
                </h1>
                <p className="text-[11px] text-white/60 mt-2 leading-snug">
                  Coast to coast, neighbors keeping neighbors safe.
                </p>
              </div>

              <div className="text-right shrink-0 pl-2 border-l border-white/10">
                <div className="font-display font-black text-2xl text-white tabular-nums leading-none">
                  {reportCount.toLocaleString()}
                </div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-white/45 mt-1">
                  {reportCount === 1 ? "Report" : "Reports"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <RoadDivider className="w-full h-3" />
      <FlagStripes />
    </div>
  );
}


function NearbyAlerts() {
  const { toast } = useToast();
  const [alertsOn, setAlertsOn] = useState(false);
  const [location, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState(false);
  const [nearbyCount, setNearbyCount] = useState(0);
  const [radius, setRadius] = useState(25); // miles
  const [radiusLoaded, setRadiusLoaded] = useState(false);
  const [showRadiusPicker, setShowRadiusPicker] = useState(false);
  const lastSeenIds = useRef<Set<number>>(new Set());
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const RADIUS_OPTIONS = [5, 10, 25, 50, 100];
  const RADIUS_STORAGE_KEY = "bd_alert_radius";

  // Load saved radius on mount
  useEffect(() => {
    persistentStorage.getItem(RADIUS_STORAGE_KEY).then((saved) => {
      if (saved) {
        const parsed = parseInt(saved);
        if (!isNaN(parsed) && RADIUS_OPTIONS.includes(parsed)) {
          setRadius(parsed);
        }
      }
      setRadiusLoaded(true);
    });
  }, []);

  const startAlerts = useCallback(() => {
    if (!("geolocation" in navigator)) {
      toast({ title: "Not supported", description: "Location alerts need GPS access.", variant: "destructive" });
      return;
    }

    // Request notification permission
    requestNotificationPermission();

    getCurrentPosition().then((coords) => {
      if (!coords) {
        setLocationError(true);
        toast({ title: "Location denied", description: "Allow location access to get nearby alerts.", variant: "destructive" });
        return;
      }
      setGpsLocation(coords);
      setLocationError(false);
      setAlertsOn(true);

      // Initial check — seed the known IDs so we don't notify about old reports
      apiRequest("GET", `/api/reports/nearby?lat=${coords.lat}&lng=${coords.lng}&radius=${radius}`)
        .then((res) => res.json())
        .then((nearby: Report[]) => {
          lastSeenIds.current = new Set(nearby.map((rep) => rep.id));
          setNearbyCount(nearby.length);
        })
        .catch(() => {});
    });
  }, [toast, radius]);

  const stopAlerts = useCallback(() => {
    setAlertsOn(false);
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setGpsLocation(null);
    setNearbyCount(0);
    lastSeenIds.current.clear();
  }, []);

  // When radius changes, persist it and re-seed if alerts are on
  const handleRadiusChange = useCallback((newRadius: number) => {
    setRadius(newRadius);
    setShowRadiusPicker(false);
    // Persist to storage
    persistentStorage.setItem(RADIUS_STORAGE_KEY, String(newRadius));
    if (alertsOn && location) {
      // Clear seen IDs and re-seed with new radius
      lastSeenIds.current.clear();
      apiRequest("GET", `/api/reports/nearby?lat=${location.lat}&lng=${location.lng}&radius=${newRadius}`)
        .then((res) => res.json())
        .then((nearby: Report[]) => {
          lastSeenIds.current = new Set(nearby.map((r) => r.id));
          setNearbyCount(nearby.length);
        })
        .catch(() => {});
    }
  }, [alertsOn, location]);

  // Poll for new nearby reports every 60 seconds
  useEffect(() => {
    if (!alertsOn || !location || !radiusLoaded) return;

    const check = async () => {
      try {
        const res = await apiRequest(
          "GET",
          `/api/reports/nearby?lat=${location.lat}&lng=${location.lng}&radius=${radius}`
        );
        const nearby: Report[] = await res.json();
        setNearbyCount(nearby.length);

        // Find new reports we haven't seen before
        const newReports = nearby.filter((r) => !lastSeenIds.current.has(r.id));
        if (newReports.length > 0) {
          // Update seen set
          newReports.forEach((r) => lastSeenIds.current.add(r.id));

          const title = newReports.length === 1
            ? "Bad Driver nearby!"
            : "Bad Drivers nearby!";
          const body = newReports.length === 1
            ? `${newReports[0].title} — ${newReports[0].location}${newReports[0].state ? ", " + newReports[0].state : ""}`
            : `${newReports.length} new reports within ${radius} miles of you.`;

          // Send native-compatible notification
          sendNotification(title, body, `report-${newReports[0].id}`);

          toast({
            title: `${newReports.length} new report${newReports.length > 1 ? "s" : ""} nearby!`,
            description: newReports.length === 1
              ? `${newReports[0].title} — ${newReports[0].location}`
              : `${newReports.length} reports within ${radius} miles of you.`,
          });
        }
      } catch {
        // silently skip on error
      }
    };

    // Poll every 60 seconds
    pollRef.current = setInterval(check, 60000);
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [alertsOn, location, radius, radiusLoaded, toast]);

  return (
    <div className="px-3 py-2.5 rounded-xl border border-border bg-card/50">
      <div className="flex items-center gap-2">
        <button
          onClick={alertsOn ? stopAlerts : () => startAlerts()}
          data-testid="button-toggle-nearby-alerts"
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            alertsOn
              ? "bg-red-500/15 text-red-600"
              : "bg-accent text-foreground hover:bg-accent/80"
          }`}
        >
          {alertsOn ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
          {alertsOn ? "Alerts On" : "Nearby Alerts"}
        </button>

        {/* Radius selector button */}
        <button
          onClick={() => setShowRadiusPicker(!showRadiusPicker)}
          data-testid="button-radius-picker"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            showRadiusPicker
              ? "bg-accent text-foreground"
              : "bg-muted/50 text-muted-foreground hover:bg-accent"
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          {radius} mi
          {showRadiusPicker ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {alertsOn && (
          <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
            {nearbyCount} nearby
          </span>
        )}

        {locationError && (
          <span className="text-xs text-red-500 ml-auto">Location denied</span>
        )}
      </div>

      {/* Radius options dropdown */}
      {showRadiusPicker && (
        <div className="mt-2 pt-2 border-t border-border/50">
          <div className="text-xs text-muted-foreground mb-2">Alert radius</div>
          <div className="flex flex-wrap gap-2">
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r}
                onClick={() => handleRadiusChange(r)}
                data-testid={`button-radius-${r}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  radius === r
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground hover:bg-accent"
                }`}
              >
                {r} mi
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Reports within this distance from you will trigger a notification. Your choice is saved for next time.
          </p>
        </div>
      )}
    </div>
  );
}

function FeedCard({ report, index }: { report: Report; index: number }) {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("");

  // Load comments when expanded
  const { data: comments, isLoading: commentsLoading } = useQuery<Comment[]>({
    queryKey: ["/api/reports", report.id, "comments"],
    enabled: showComments,
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/reports/${report.id}/comments`);
      return res.json();
    },
  });

  const upvoteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/reports/${report.id}/upvote`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports", report.id] });
    },
    onError: () => toast({ title: "Failed to upvote", variant: "destructive" }),
  });

  const downvoteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/reports/${report.id}/downvote`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports", report.id] });
    },
    onError: () => toast({ title: "Failed to downvote", variant: "destructive" }),
  });

  const commentMutation = useMutation({
    mutationFn: async (data: { authorName: string; content: string }) => {
      const res = await apiRequest("POST", `/api/reports/${report.id}/comments`, {
        ...data,
        reportId: report.id,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports", report.id, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports", report.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      setCommentText("");
      toast({ title: "Comment added" });
    },
    onError: () => toast({ title: "Failed to add comment", variant: "destructive" }),
  });

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const name = isAuthenticated
      ? (user?.displayName || "Anonymous Driver")
      : (commentAuthor.trim() || "Anonymous Driver");
    commentMutation.mutate({
      authorName: name,
      content: commentText.trim(),
    });
  };

  const handleVote = (type: "up" | "down") => {
    if (!isAuthenticated) {
      setLocation("/auth");
      return;
    }
    if (type === "up") upvoteMutation.mutate();
    else downvoteMutation.mutate();
  };

  return (
    <Card
      data-testid={`card-report-${report.id}`}
      className="overflow-hidden border-card-border animate-fade-in-up card-hover shadow-sm"
      style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
    >
      {/* Media */}
      {report.mediaData ? (
        <div className="relative aspect-video bg-black">
          {report.mediaType === "video" ? (
            <video src={report.mediaData} className="w-full h-full object-cover" preload="metadata" muted />
          ) : (
            <img src={report.mediaData} alt={report.title} className="w-full h-full object-cover" loading="lazy" />
          )}
          <div className="absolute top-2 left-2">
            <Badge className={`${INCIDENT_COLORS[report.incidentType as keyof typeof INCIDENT_COLORS] || "bg-gray-500 text-white"} border-0`}>
              {INCIDENT_LABELS[report.incidentType as keyof typeof INCIDENT_LABELS] || "Other"}
            </Badge>
          </div>
          {report.mediaType === "video" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 ml-0.5">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative h-36 hazard-stripes flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-card/90 to-card/60" />
          <Badge className={`absolute top-2 left-2 z-10 ${INCIDENT_COLORS[report.incidentType as keyof typeof INCIDENT_COLORS] || "bg-gray-500 text-white"} border-0 shadow-md`}>
            {INCIDENT_LABELS[report.incidentType as keyof typeof INCIDENT_LABELS] || "Other"}
          </Badge>
          {(() => {
            const Art = INCIDENT_ART[report.incidentType] || INCIDENT_ART.other;
            const isVehicle = report.incidentType === "reckless";
            return (
              <Art
                className={`relative text-primary/70 drop-shadow-sm ${
                  isVehicle ? "w-28 h-14" : "w-12 h-12"
                }`}
              />
            );
          })()}
          <span className="relative mt-2 plate-chip px-2.5 py-1 rounded-md font-bold text-sm text-muted-foreground">
            {report.licensePlate}
          </span>
          <RoadDivider className="absolute bottom-0 left-0 w-full h-2.5" />
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-display font-bold text-base leading-tight" data-testid={`text-title-${report.id}`}>
            {report.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{report.description}</p>
        </div>

        {/* Vehicle info */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg plate-chip text-xs font-bold">
            {report.licensePlate}
          </div>
          {report.make && (
            <span className="text-muted-foreground">
              {report.make}{report.model ? ` ${report.model}` : ""}
            </span>
          )}
          <span className="flex items-center gap-0.5 text-muted-foreground ml-auto">
            <MapPin className="w-3 h-3" />
            {report.location}{report.state ? `, ${report.state}` : ""}
          </span>
        </div>

        {/* Like / Dislike / Comment buttons */}
        <div className="flex items-center gap-1 pt-2 border-t border-border/50">
          <button
            onClick={() => handleVote("up")}
            data-testid={`button-feed-upvote-${report.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-green-500/10 hover:text-green-600 active:scale-95"
          >
            <ThumbsUp className="w-4 h-4" />
            {report.upvotes}
          </button>
          <button
            onClick={() => handleVote("down")}
            data-testid={`button-feed-downvote-${report.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-red-500/10 hover:text-red-600 active:scale-95"
          >
            <ThumbsDown className="w-4 h-4" />
            {report.downvotes}
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            data-testid={`button-feed-comments-${report.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-accent active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            {report.commentCount}
            {showComments ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <div className="flex items-center gap-3 text-xs text-muted-foreground ml-auto">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {report.views}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(report.createdAt)}
            </span>
          </div>
        </div>

        {/* Expandable comment section */}
        {showComments && (
          <div className="space-y-3 pt-2 border-t border-border/50 animate-fade-in-up">
            {/* Comment input — open to all */}
            <form onSubmit={handleComment} className="space-y-2">
              {!isAuthenticated && (
                <Input
                  data-testid={`input-feed-comment-name-${report.id}`}
                  placeholder="Your name (optional)"
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  maxLength={50}
                  className="text-sm"
                />
              )}
              <div className="flex gap-2">
                <Input
                  data-testid={`input-feed-comment-${report.id}`}
                  placeholder="Share your opinion..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  maxLength={300}
                />
                <Button
                  type="submit"
                  size="icon"
                  data-testid={`button-feed-submit-comment-${report.id}`}
                  disabled={commentMutation.isPending || !commentText.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>

            {/* Comment list */}
            {commentsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ) : comments && comments.length > 0 ? (
              <div className="space-y-2">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50">
                    <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-xs font-bold shrink-0">
                      {comment.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-semibold">{comment.authorName}</span>
                        <span className="text-[10px] text-muted-foreground">{formatTimeAgo(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-foreground/90 mt-0.5">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-3">
                No opinions yet. Be the first to share.
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

export default function Feed() {
  const { isAuthenticated } = useAuth();
  const { data: reports, isLoading } = useQuery<Report[]>({
    queryKey: ["/api/reports"],
  });

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="p-4 space-y-5">
        <UsaHero reportCount={0} />
        <div className="flex flex-col items-center justify-center text-center px-6 py-6">
          <RoadScene className="w-full max-w-[300px] h-auto mb-5" />
          <h3 className="font-display font-black text-lg mb-1">
            No reports yet
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
            Be the first in the nation. Snap a photo, add the plate, and let
            your community know.
          </p>
          <Link
            href="/create"
            data-testid="link-create-first"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold text-sm px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <Star className="w-3.5 h-3.5" />
            Report a Bad Driver
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <UsaHero reportCount={reports.length} />
      <NearbyAlerts />
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full bg-red-500 live-dot" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live Feed</span>
        <span className="text-xs text-muted-foreground ml-auto">{reports.length} {reports.length === 1 ? "report" : "reports"}</span>
      </div>

      {/* Guest mode banner */}
      {!isAuthenticated && (
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-amber-600 dark:text-amber-400">Browsing as Guest</div>
            <div className="text-[11px] text-amber-600/60 dark:text-amber-400/60">Sign in to vote, report, and comment</div>
          </div>
          <Link href="/auth" className="text-xs font-bold text-primary hover:underline shrink-0 px-2.5 py-1.5 rounded-lg bg-primary/10 transition-colors">
            Sign In
          </Link>
        </div>
      )}

      {reports.map((report, index) => (
        <FeedCard key={report.id} report={report} index={index} />
      ))}
    </div>
  );
}
