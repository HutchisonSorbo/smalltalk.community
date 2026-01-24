import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { MapPin, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Gig } from "@shared/schema";

import { ReportDialog } from "@/components/local-music-network/ReportDialog";

export function GigCard({ gig }: { gig: Gig }) {
    const date = new Date(gig.date);
    return (
        <div className="flex flex-col h-full border rounded-lg bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow overflow-hidden relative group">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <ReportDialog targetType="gig" targetId={gig.id} />
            </div>
            {gig.imageUrl && (
                <Link href={`/gigs/${gig.id}`} className="block h-48 w-full bg-muted overflow-hidden relative">
                    <Image 
                        src={gig.imageUrl} 
                        alt={gig.title} 
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-500" 
                    />
                </Link>
            )}
            <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-sm font-semibold text-primary dark:text-blue-400 uppercase tracking-wider">
                            {format(date, 'MMM d, yyyy • h:mm a')}
                        </p>
                        <Link href={`/gigs/${gig.id}`}>
                            <h3 className="text-xl font-bold mt-1 line-clamp-2 hover:text-primary/80 transition-colors">{gig.title}</h3>
                        </Link>
                    </div>
                </div>

                <div className="space-y-2 mb-4 flex-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{gig.location}</span>
                    </div>
                    {gig.genre && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Music className="h-4 w-4" />
                            <span className="truncate">{gig.genre}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t">
                    <span className="font-medium">
                        {gig.price ? (typeof gig.price === 'number' ? `$${(gig.price / 100).toFixed(2)}` : gig.price) : "Free / TBA"}
                    </span>
                    <div className="flex gap-2">
                        <Button asChild size="sm" variant="secondary">
                            <Link href={`/gigs/${gig.id}`}>View</Link>
                        </Button>
                        {gig.ticketUrl && (
                            <Button asChild size="sm" variant="outline">
                                <a href={gig.ticketUrl} target="_blank" rel="noopener noreferrer">Tickets</a>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// CodeRabbit Audit Trigger
