"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

const ACCOUNT_TYPES = [
    "Individual",
    "Business",
    "Government Organisation",
    "Charity",
    "Other",
];

export function CreateUserModal() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Form state
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [accountType, setAccountType] = useState("Individual");
    const [isAdmin, setIsAdmin] = useState(false);
    const [isMinor, setIsMinor] = useState(false);
    const [onboardingCompleted, setOnboardingCompleted] = useState(true);

    const resetForm = () => {
        setEmail("");
        setFirstName("");
        setLastName("");
        setAccountType("Individual");
        setIsAdmin(false);
        setIsMinor(false);
        setOnboardingCompleted(true);
    };

    const handleCreate = async () => {
        if (!email || !firstName || !lastName) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsCreating(true);
        try {
            const response = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    firstName,
                    lastName,
                    accountType,
                    isAdmin,
                    isMinor,
                    onboardingCompleted,
                    onboardingStep: onboardingCompleted ? 7 : 0,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to create user");
            }

            const data = await response.json();
            toast.success(`Successfully created user: ${data.user.email}`);
            setOpen(false);
            resetForm();
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to create user");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) resetForm();
        }}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create User
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                        Create a new user account. The user will receive no email notification.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input
                                id="firstName"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="John"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input
                                id="lastName"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Doe"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john.doe@example.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="accountType">Account Type</Label>
                        <Select value={accountType} onValueChange={setAccountType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select account type" />
                            </SelectTrigger>
                            <SelectContent>
                                {ACCOUNT_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-3">
                        <Label>User Settings</Label>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="onboardingCompleted"
                                    checked={onboardingCompleted}
                                    onCheckedChange={(checked) => setOnboardingCompleted(checked === true)}
                                />
                                <Label htmlFor="onboardingCompleted" className="text-sm font-normal cursor-pointer">
                                    Onboarding completed
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="isMinor"
                                    checked={isMinor}
                                    onCheckedChange={(checked) => setIsMinor(checked === true)}
                                />
                                <Label htmlFor="isMinor" className="text-sm font-normal cursor-pointer">
                                    User is a minor (under 18)
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="isAdmin"
                                    checked={isAdmin}
                                    onCheckedChange={(checked) => setIsAdmin(checked === true)}
                                />
                                <Label htmlFor="isAdmin" className="text-sm font-normal cursor-pointer">
                                    Grant administrator access
                                </Label>
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isCreating}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreate} disabled={isCreating}>
                        {isCreating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-4 h-4 mr-2" />
                                Create User
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
