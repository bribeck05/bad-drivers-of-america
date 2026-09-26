import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Search, AlertTriangle, CheckCircle, MapPin, Clock, ThumbsUp, MessageCircle } from "lucide-react";
import type { Report } from "@shared/schema";
import { INCIDENT_LABELS, INCIDENT_COLORS, formatTimeAgo } from "@/lib/utils";

export default function PlateLookup() {
  const [plate, setPlate] = useState("");
  const [searchPlate, setSearchPlate] = useState("");

  const { data: result, isLoading, isFetching } = useQuery<{
    reports: Report[];
    lookupCount: number;
  }>({
    queryKey: ["/api/plates", searchPlate],
    enabled: searchPlate.length > 0,
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/plates/${encodeURIComponent(searchPlate)}`);
      return res.json();
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (plate.trim().length < 2) return;
    setSearchPlate(plate.trim().toUpperCase());
  };

  return (
    <div className="p-4 space-y-4">
      <div className="mb-2">
        <h1 className="font-display font-black text-xl">Plate Lookup</h1>
        <p className="text-sm text-muted-foreground mt-1">Search any license plate to see if it's been reported.</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          data-testid="input-plate-search"
          placeholder="Enter license plate..."
          value={plate}
          onChange={(e) => setPlate(e.target.value.toUpperCase())}
          className="font-mono font-bold uppercase tracking-wider"
          maxLength={15}
        />
        <Button type="submit" size="icon" data-testid="button-search-plate">
          <Search className="w-4 h-4" />
        </Button>
      </form>

      {/* Results */}
      {isLoading || isFetching ? (
        <div className="space-y-3">
          <Card className="p-4 border-card-border">
            <div className="skeleton h-6 w-3/4 rounded mb-3" />
            <div className="skeleton h-4 w-1/2 rounded" />
          </Card>
        </div>
      ) : result ? (
        <div className="space-y-3">
          {/* Result summary */}
          <Card className={`p-4 border-2 ${result.reports.length > 0 ? "border-destructive/30 bg-destructive/5" : "border-green-500/30 bg-green-500/5"}`}>
            <div className="flex items-start gap-3">
              {result.reports.length > 0 ? (
                <AlertTriangle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-mono font-bold text-lg tracking-wider">{searchPlate}</div>
                {result.reports.length > 0 ? (
                  <p className="text-sm text-destructive font-medium">
                    {result.reports.length} {result.reports.length === 1 ? "report" : "reports"} found
                  </p>
                ) : (
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                    No reports found — clean record
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Looked up {result.lookupCount} {result.lookupCount === 1 ? "time" : "times"}
                </p>
              </div>
            </div>
          </Card>

          {/* Report list */}
          {result.reports.map((report) => (
            <Link key={report.id} href={`/reports/${report.id}`}>
              <Card
                data-testid={`card-plate-report-${report.id}`}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border-card-border animate-fade-in-up"
              >
                {report.mediaData && (
                  <div className="relative aspect-video bg-black">
                    <img
                      src={report.mediaData}
                      alt={report.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge className={`${INCIDENT_COLORS[report.incidentType as keyof typeof INCIDENT_COLORS] || "bg-gray-500 text-white"} border-0`}>
                        {INCIDENT_LABELS[report.incidentType as keyof typeof INCIDENT_LABELS] || "Other"}
                      </Badge>
                    </div>
                  </div>
                )}
                <div className="p-3 space-y-2">
                  <h3 className="font-display font-bold text-sm leading-tight">{report.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="flex items-center gap-0.5 text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {report.location}{report.state ? `, ${report.state}` : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 border-t border-border/50">
                    <span className="flex items-center gap-0.5">
                      <ThumbsUp className="w-3 h-3" />
                      {report.upvotes}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <MessageCircle className="w-3 h-3" />
                      {report.commentCount}
                    </span>
                    <span className="flex items-center gap-0.5 ml-auto">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(report.createdAt)}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4">
          <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-display font-bold text-lg mb-1">Search a Plate</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Enter any license plate number to check if that driver has been reported by the community.
          </p>
        </div>
      )}
    </div>
  );
}
