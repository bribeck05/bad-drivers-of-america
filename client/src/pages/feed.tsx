import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, ThumbsUp, ThumbsDown, MessageCircle, Eye, Clock } from "lucide-react";
import type { Report } from "@shared/schema";
import { INCIDENT_LABELS, INCIDENT_COLORS, formatTimeAgo } from "@/lib/utils";

export default function Feed() {
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
      <div className="flex flex-col items-center justify-center text-center px-8 py-20">
        <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-4">
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-muted-foreground" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 17l2-5h14l2 5v3H3z" />
            <circle cx="7.5" cy="20" r="1.5" />
            <circle cx="16.5" cy="20" r="1.5" />
          </svg>
        </div>
        <h3 className="font-display font-bold text-lg mb-1">No reports yet</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-xs">
          Be the first to report a bad driver. Snap a photo, add the plate, and let the community know.
        </p>
        <Link
          href="/create"
          data-testid="link-create-first"
          className="bg-primary text-primary-foreground font-medium text-sm px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-shadow"
        >
          Report a Bad Driver
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full bg-red-500 live-dot" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live Feed</span>
        <span className="text-xs text-muted-foreground ml-auto">{reports.length} reports</span>
      </div>

      {reports.map((report, index) => (
        <Link key={report.id} href={`/reports/${report.id}`}>
          <Card
            data-testid={`card-report-${report.id}`}
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow animate-fade-in-up border-card-border"
            style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
          >
            {/* Media */}
            {report.mediaData ? (
              <div className="relative aspect-video bg-black">
                {report.mediaType === "video" ? (
                  <video
                    src={report.mediaData}
                    className="w-full h-full object-cover"
                    preload="metadata"
                    muted
                  />
                ) : (
                  <img
                    src={report.mediaData}
                    alt={report.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
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
              <div className="relative h-32 bg-gradient-to-br from-accent to-muted flex items-center justify-center">
                <Badge className={`absolute top-2 left-2 ${INCIDENT_COLORS[report.incidentType as keyof typeof INCIDENT_COLORS] || "bg-gray-500 text-white"} border-0`}>
                  {INCIDENT_LABELS[report.incidentType as keyof typeof INCIDENT_LABELS] || "Other"}
                </Badge>
                <span className="font-display font-bold text-2xl text-muted-foreground/40">
                  {report.licensePlate}
                </span>
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
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted font-mono font-bold tracking-wider">
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

              {/* Stats bar */}
              <div className="flex items-center gap-4 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  {report.upvotes}
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsDown className="w-3.5 h-3.5" />
                  {report.downvotes}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5" />
                  {report.commentCount}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {report.views}
                </span>
                <span className="flex items-center gap-1 ml-auto">
                  <Clock className="w-3 h-3" />
                  {formatTimeAgo(report.createdAt)}
                </span>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
