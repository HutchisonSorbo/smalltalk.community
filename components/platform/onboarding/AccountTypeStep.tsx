"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AccountType, AccountTypeSelector } from "@/components/platform/AccountTypeSelector";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ArrowRight } from "lucide-react";

export function AccountTypeStep() {
    const [selectedType, setSelectedType] = useState<AccountType | null>(null);
    const [specification, setSpecification] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleNext = async () => {
        if (!selectedType) return;
        if (selectedType === "Other" && !specification.trim()) {
            toast({
                title: "Specification required",
                description: "Please specify your organisation type.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch("/api/user/account-type", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    accountType: selectedType,
                    accountTypeSpecification: selectedType === "Other" ? specification : null
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update account type");
            }

            router.push("/onboarding/apps");
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            });
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">How do you identify?</h1>
                <p className="text-muted-foreground text-lg">
                    Select the option that best describes you or your organisation.
                </p>
            </div>

            <AccountTypeSelector
                selectedType={selectedType}
                specification={specification}
                onSelect={setSelectedType}
                onSpecify={setSpecification}
            />

            <div className="flex justify-end pt-4">
                <Button
                    size="lg"
                    onClick={handleNext}
                    disabled={!selectedType || isSubmitting}
                    className="w-full sm:w-auto min-w-[150px]"
                >
                    {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            Next Step <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
