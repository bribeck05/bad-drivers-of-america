import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, ThumbsUp, MessageCircle, FileText, TrendingUp, MapPin } from "lucide-react";

interface Stats {
  totalReports: number;
  totalUpvotes: number;
  totalComments: number;
  topStates: { state: string; count: number }[];
}

export default function Stats() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  const cards = [
    { label: "Total Reports", value: stats?.totalReports || 0, icon: FileText, color: "text-primary" },
    { label: "Community Upvotes", value: stats?.totalUpvotes || 0, icon: ThumbsUp, color: "text-orange-500" },
    { label: "Comments", value: stats?.totalComments || 0, icon: MessageCircle, color: "text-blue-500" },
  ];

  const maxStateCount = stats?.topStates?.[0]?.count || 1;

  return (
    <div className="p-4 space-y-4">
      <div className="mb-2">
        <h1 className="font-display font-black text-xl">Community Stats</h1>
        <p className="text-sm text-muted-foreground mt-1">The state of bad driving in America.</p>
      </div>

      {/* Hero stat */}
      <Card className="p-5 border-card-border bg-gradient-to-br from-card to-accent">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <div className="text-3xl font-display font-black">{stats?.totalReports || 0}</div>
            <div className="text-xs text-muted-foreground font-medium">Bad Drivers Reported</div>
          </div>
        </div>
      </Card>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="p-3 border-card-border">
              <Icon className={`w-5 h-5 ${card.color} mb-2`} />
              <div className="text-xl font-display font-black">{card.value.toLocaleString()}</div>
              <div className="text-[10px] text-muted-foreground font-medium leading-tight mt-0.5">{card.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Top States */}
      <Card className="p-4 border-card-border">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-display font-bold text-sm">Top Reported States</h2>
        </div>

        {stats?.topStates && stats.topStates.length > 0 ? (
          <div className="space-y-3">
            {stats.topStates.map((item, index) => (
              <div key={item.state} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-xs font-bold text-muted-foreground">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      {item.state}
                    </span>
                    <span className="text-xs text-muted-foreground">{item.count} reports</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${(item.count / maxStateCount) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">No state data yet.</p>
        )}
      </Card>

      {/* About */}
      <Card className="p-4 border-card-border">
        <h2 className="font-display font-bold text-sm mb-2">About Bad Drivers of America</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Bad Drivers of America is a community-driven platform where citizens can report dangerous driving behavior. 
          Upload photos or videos, track license plates, and help make our roads safer for everyone. 
          Together, we can hold bad drivers accountable.
        </p>
      </Card>
    </div>
  );
}
