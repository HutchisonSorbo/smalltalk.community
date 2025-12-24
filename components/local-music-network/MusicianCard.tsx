import Link from "next/link";
import { MapPin, Music } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReportDialog } from "@/components/Local Music Network/ReportDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RatingBadge } from "@/components/Local Music Network/RatingBadge";
import type { MusicianProfile } from "@shared/schema";

interface MusicianCardProps {
  musician: MusicianProfile;
}

export function MusicianCard({ musician }: MusicianCardProps) {
  return (
    <Link href={`/musicians/${musician.id}`}>
      <Card className="hover-elevate cursor-pointer h-full transition-transform duration-200 relative group" data-testid={`card-musician-${musician.id}`}>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-background/50 backdrop-blur-sm rounded-full" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
          <ReportDialog targetType="user" targetId={musician.userId} />
        </div>
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <Avatar className={`h-24 w-24 ${musician.isLookingForGroup ? "border-4" : ""}`} style={musician.isLookingForGroup ? { borderColor: "#7bbf6a" } : undefined}>
              <AvatarImage
                src={musician.profileImageUrl || undefined}
                alt={musician.name}
                className="object-cover"
              />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {musician.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {musician.isLookingForGroup && (
              <Badge className="bg-[#7bbf6a] hover:bg-[#6aa65a] text-white">
                Looking For Group
              </Badge>
            )}

            <div className="space-y-2 w-full">
              <h3 className="font-semibold text-lg truncate">{musician.name}</h3>

              <div className="flex justify-center">
                <RatingBadge targetType="musician" targetId={musician.id} />
              </div>

              {musician.location && (
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="truncate">{musician.location}</span>
                </div>
              )}

              {musician.experienceLevel && (
                <Badge variant="secondary">
                  {musician.experienceLevel}
                </Badge>
              )}
            </div>

            {musician.instruments && musician.instruments.length > 0 && (
              <div className="flex flex-wrap gap-1 justify-center">
                {musician.instruments.slice(0, 3).map((instrument) => (
                  <Badge key={instrument} variant="outline">
                    <Music className="h-3 w-3 mr-1" />
                    {instrument}
                  </Badge>
                ))}
                {musician.instruments.length > 3 && (
                  <Badge variant="outline">
                    +{musician.instruments.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {musician.genres && musician.genres.length > 0 && (
              <div className="flex flex-wrap gap-1 justify-center">
                {musician.genres.slice(0, 2).map((genre) => (
                  <span key={genre} className="text-xs text-muted-foreground">
                    {genre}
                  </span>
                ))}
                {musician.genres.length > 2 && (
                  <span className="text-xs text-muted-foreground">
                    +{musician.genres.length - 2} more
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
