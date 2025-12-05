import { Link } from "wouter";
import { MapPin, Music } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { MusicianProfile } from "@shared/schema";

interface MusicianCardProps {
  musician: MusicianProfile;
}

export function MusicianCard({ musician }: MusicianCardProps) {
  return (
    <Link href={`/musicians/${musician.id}`}>
      <Card className="hover-elevate cursor-pointer h-full transition-transform duration-200" data-testid={`card-musician-${musician.id}`}>
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage 
                src={musician.profileImageUrl || undefined} 
                alt={musician.name} 
                className="object-cover"
              />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {musician.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-2 w-full">
              <h3 className="font-semibold text-lg truncate">{musician.name}</h3>
              
              {musician.location && (
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="truncate">{musician.location}</span>
                </div>
              )}
              
              {musician.experienceLevel && (
                <Badge variant="secondary" size="sm">
                  {musician.experienceLevel}
                </Badge>
              )}
            </div>
            
            {musician.instruments && musician.instruments.length > 0 && (
              <div className="flex flex-wrap gap-1 justify-center">
                {musician.instruments.slice(0, 3).map((instrument) => (
                  <Badge key={instrument} variant="outline" size="sm">
                    <Music className="h-3 w-3 mr-1" />
                    {instrument}
                  </Badge>
                ))}
                {musician.instruments.length > 3 && (
                  <Badge variant="outline" size="sm">
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
