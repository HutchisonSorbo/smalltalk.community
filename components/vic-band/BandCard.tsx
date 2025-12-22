import Link from "next/link";
import { MapPin, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Band } from "@shared/schema";

import { ReportDialog } from "@/components/ReportDialog";

interface BandCardProps {
    band: Band;
}

export function BandCard({ band }: BandCardProps) {
    return (
        <Link href={`/bands/${band.id}`} className="block h-full">
            <Card className="hover-elevate h-full transition-all hover:scale-[1.02] relative group">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                    <ReportDialog targetType="band" targetId={band.id} />
                </div>
                <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <Avatar className="h-24 w-24">
                            <AvatarImage
                                src={band.profileImageUrl || undefined}
                                alt={band.name}
                                className="object-cover"
                            />
                            <AvatarFallback className="text-xl bg-primary/10 text-primary">
                                {band.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div className="space-y-2 w-full">
                            <h3 className="font-semibold text-lg truncate">{band.name}</h3>

                            {band.location && (
                                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                                    <MapPin className="h-3.5 w-3.5" />
                                    <span className="truncate">{band.location}</span>
                                </div>
                            )}

                            {band.websiteUrl && (
                                <div className="flex items-center justify-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                    <Globe className="h-3.5 w-3.5" />
                                    <span className="truncate max-w-[200px]">
                                        {band.websiteUrl.replace(/^https?:\/\//, '')}
                                    </span>
                                </div>
                            )}
                        </div>

                        {band.genres && band.genres.length > 0 && (
                            <div className="flex flex-wrap gap-1 justify-center">
                                {band.genres.slice(0, 3).map((genre) => (
                                    <Badge key={genre} variant="secondary">
                                        {genre}
                                    </Badge>
                                ))}
                                {band.genres.length > 3 && (
                                    <Badge variant="outline">
                                        +{band.genres.length - 3}
                                    </Badge>
                                )}
                            </div>
                        )}

                        {band.bio && (
                            <p className="text-sm text-muted-foreground line-clamp-3">
                                {band.bio}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
