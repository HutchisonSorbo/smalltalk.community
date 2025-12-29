"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Copy, Share2 } from "lucide-react";
import { FaTwitter, FaFacebook, FaInstagram, FaLinkedin, FaWhatsapp, FaEnvelope } from "react-icons/fa";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ShareDialogProps {
    title: string;
    description?: string;
    url?: string;
    trigger?: React.ReactNode;
}

export function ShareDialog({ title, description, url, trigger }: ShareDialogProps) {
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    // Use current window URL if not provided (client-side only)
    const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title);

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleInstagram = () => {
        navigator.clipboard.writeText(shareUrl);
        toast({ title: "Link copied!", description: "Paste it in your Instagram story or DM." });
        window.open("https://instagram.com", "_blank");
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="secondary" className="w-full">
                        <Share2 className="mr-2 h-4 w-4" />
                        Share Event
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share Event</DialogTitle>
                    <DialogDescription>
                        Share this gig with your friends and followers.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center space-x-2 my-2">
                    <div className="grid flex-1 gap-2">
                        <Label htmlFor="link" className="sr-only">
                            Link
                        </Label>
                        <Input
                            id="link"
                            defaultValue={shareUrl}
                            readOnly
                        />
                    </div>
                    <Button type="button" size="sm" className="px-3" onClick={handleCopy}>
                        <span className="sr-only">Copy</span>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>

                <div className="grid grid-cols-5 gap-2 pt-2">
                    {/* Twitter */}
                    <Button variant="outline" size="icon" className="w-full" asChild>
                        <a
                            href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Share on Twitter"
                        >
                            <FaTwitter className="h-4 w-4 text-[#1DA1F2]" />
                        </a>
                    </Button>

                    {/* Facebook */}
                    <Button variant="outline" size="icon" className="w-full" asChild>
                        <a
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Share on Facebook"
                        >
                            <FaFacebook className="h-4 w-4 text-[#4267B2]" />
                        </a>
                    </Button>

                    {/* Instagram */}
                    <Button variant="outline" size="icon" className="w-full" onClick={handleInstagram}>
                        <FaInstagram className="h-4 w-4 text-[#E1306C]" />
                    </Button>

                    {/* WhatsApp */}
                    <Button variant="outline" size="icon" className="w-full" asChild>
                        <a
                            href={`https://wa.me/?text=${encodedTitle} ${encodedUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Share on WhatsApp"
                        >
                            <FaWhatsapp className="h-4 w-4 text-[#25D366]" />
                        </a>
                    </Button>

                    {/* LinkedIn */}
                    <Button variant="outline" size="icon" className="w-full" asChild>
                        <a
                            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Share on LinkedIn"
                        >
                            <FaLinkedin className="h-4 w-4 text-[#0077b5]" />
                        </a>
                    </Button>
                </div>

                {/* Email - Full Width */}
                <Button variant="outline" className="w-full mt-2" asChild>
                    <a
                        href={`mailto:?subject=${encodedTitle}&body=Check out this gig: ${encodedUrl}`}
                        aria-label="Share via Email"
                    >
                        <FaEnvelope className="mr-2 h-4 w-4" />
                        Share via Email
                    </a>
                </Button>
            </DialogContent>
        </Dialog>
    );
}

// CodeRabbit Audit Trigger
