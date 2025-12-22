import Link from "next/link";
import { MapPin, Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReportDialog } from "@/components/vic-band/ReportDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { RatingBadge } from "@/components/RatingBadge"; // Temporarily omit if not ready, or enable if it works generically
import type { ProfessionalProfile } from "@shared/schema";

interface ProfessionalCardProps {
    professional: ProfessionalProfile;
}

export function ProfessionalCard({ professional }: ProfessionalCardProps) {
    return (
        <Link href={`/professionals/${professional.id}`}>
            <Card className="hover-elevate cursor-pointer h-full transition-transform duration-200 relative group" data-testid={`card-professional-${professional.id}`}>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-background/50 backdrop-blur-sm rounded-full" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                    <ReportDialog targetType="user" targetId={professional.userId} />
                </div>
                <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <Avatar className="h-24 w-24">
                            <AvatarImage
                                src={professional.profileImageUrl || undefined}
                                alt={professional.businessName || "Professional"}
                                className="object-cover"
                            />
                            <AvatarFallback className="text-2xl bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-300">
                                {(professional.businessName || "Pro").substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div className="space-y-2 w-full">
                            <h3 className="font-semibold text-lg truncate">{professional.businessName}</h3>

                            {/* Rating Badge could go here if reviews are supported */}

                            <div className="flex items-center justify-center gap-2">
                                <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300">
                                    {professional.role}
                                </Badge>
                            </div>

                            {professional.location && (
                                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                                    <MapPin className="h-3.5 w-3.5" />
                                    <span className="truncate">{professional.location}</span>
                                </div>
                            )}
                        </div>

                        {professional.services && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {professional.services}
                            </p>
                        )}

                        {professional.rates && (
                            <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                {professional.rates}
                            </div>
                        )}

                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
