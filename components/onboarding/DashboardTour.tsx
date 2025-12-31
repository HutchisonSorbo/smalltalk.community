"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useState, useEffect } from "react";

export function DashboardTour() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        // Check if tour has been seen? 
        // Usually stored in localstorage or user prefs. 
        // For now, let's just show it if we land on dashboard with a query param ?tour=true or similar.
        const visited = localStorage.getItem("onboarding_tour_seen");
        if (!visited) {
            setOpen(true);
        }
    }, []);

    const handleClose = () => {
        localStorage.setItem("onboarding_tour_seen", "true");
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Welcome to your Dashboard!</DialogTitle>
                    <DialogDescription>
                        This is your central hub for everything. You can customize your apps, view recommendations, and manage your profile here.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p>Click "Edit Apps" to rearrange your dashboard.</p>
                </div>
                <DialogFooter>
                    <Button onClick={handleClose}>Got it</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
