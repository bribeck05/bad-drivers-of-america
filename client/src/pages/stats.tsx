import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, ThumbsUp, MessageCircle, FileText, TrendingUp, MapPin } from "lucide-react";
import { FlagShieldCar, FlagStripes, StarDivider, RouteMarker, StarRow } from "@/components/americana";
import { TrafficLight, RoadDivider, CarSide } from "@/components/clipart";

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
      <div className="relative overflow-hidden rounded-2xl shadow-lg">
        <div className="hero-asphalt">
          <div className="star-field">
            <div className="road-texture px-5 py-6 flex items-center gap-4">
              <FlagShieldCar className="w-16 h-[72px] shrink-0 text-white/25 drop-shadow-lg" />
              <div className="min-w-0 flex-1">
                <StarRow count={3} className="text-red-400/80 mb-1.5" />
                <div className="text-4xl font-display font-black text-white tabular-nums leading-none">
                  {(stats?.totalReports || 0).toLocaleString()}
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-white/50 mt-1.5">
                  Bad Drivers Reported
                </div>
                <div className="text-[11px] text-white/45 mt-1">
                  Nationwide, and counting.
                </div>
              </div>
              <TrafficLight className="w-9 h-9 shrink-0 opacity-80 drop-shadow" />
            </div>
          </div>
        </div>
        <FlagStripes />
      </div>

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
      <StarDivider label="Across the Nation" className="pt-1" />

      <Card className="p-4 border-card-border">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-display font-bold text-sm">Top Reported States</h2>
        </div>

        {stats?.topStates && stats.topStates.length > 0 ? (
          <div className="space-y-3">
            {stats.topStates.map((item, index) => (
              <div key={item.state} className="flex items-center gap-3">
                <RouteMarker
                  label={item.state}
                  className="w-8 h-9 shrink-0 text-primary"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium flex items-center gap-1">
                      <span className="text-[10px] font-black text-muted-foreground tabular-nums">
                        #{index + 1}
                      </span>
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      {item.state}
                    </span>
                    <span className="text-xs text-muted-foreground">{item.count} reports</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-red-500 transition-all"
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
      <Card className="relative p-4 border-card-border overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-primary" />
          <h2 className="font-display font-bold text-sm">About Bad Drivers of America</h2>
          <CarSide className="w-10 h-5 ml-auto text-primary/50" />
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Bad Drivers of America is a community-driven platform where citizens can report dangerous driving behavior. 
          Upload photos or videos, track license plates, and help make our roads safer for everyone. 
          Together, we can hold bad drivers accountable.
        </p>
        <FlagStripes className="absolute bottom-0 left-0 right-0" />
      </Card>

      <RoadDivider className="w-full h-3 rounded-full overflow-hidden opacity-60" />
    </div>
  );
}
