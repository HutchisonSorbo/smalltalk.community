"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";

const ISSUE_OPTIONS = [
    { value: "anxiety", label: "Feeling anxious or worried" },
    { value: "depression", label: "Feeling depressed or really down" },
    { value: "trauma", label: "Dealing with trauma or difficult experiences" },
    { value: "selfharm", label: "Self-harm or thoughts of suicide" },
    { value: "relationships", label: "Relationship or family problems" },
    { value: "eating", label: "Eating difficulties" },
    { value: "substance", label: "Substance use" },
    { value: "identity", label: "Gender or sexuality questions" },
    { value: "stress", label: "School or work stress" },
    { value: "sleep", label: "Sleep problems" },
    { value: "grief", label: "Grief or loss" },
    { value: "unsure", label: "Not sure, just need someone to talk to" },
];

const URGENCY_OPTIONS = [
    { value: "crisis", label: "I need help right now or very soon", description: "Crisis support services" },
    { value: "urgent", label: "Within the next few days", description: "Urgent support services" },
    { value: "standard", label: "Within the next few weeks", description: "Standard support services" },
    { value: "ongoing", label: "I'm planning ahead for ongoing support", description: "Long-term services and programs" },
];

function IntakeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isSupporter = searchParams.get("supporter") === "true";

    const [step, setStep] = useState(1);
    const [answers, setAnswers] = useState({
        age: "",
        location: "",
        issues: [] as string[],
        urgency: "",
        bulkBilledOnly: false,
        lgbtiqSupport: false,
    });

    const totalSteps = 5;
    const progress = (step / totalSteps) * 100;

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            // Navigate to results with query params
            const params = new URLSearchParams({
                age: answers.age,
                location: answers.location,
                issues: answers.issues.join(","),
                urgency: answers.urgency,
                bulk: answers.bulkBilledOnly ? "1" : "0",
                lgbtiq: answers.lgbtiqSupport ? "1" : "0",
            });
            router.push(`/youth-service-navigator/results?${params.toString()}`);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            router.push("/youth-service-navigator");
        }
    };

    const toggleIssue = (issue: string) => {
        setAnswers((prev) => ({
            ...prev,
            issues: prev.issues.includes(issue)
                ? prev.issues.filter((i) => i !== issue)
                : [...prev.issues, issue],
        }));
    };

    const canProceed = () => {
        switch (step) {
            case 1: return answers.age !== "";
            case 2: return answers.location !== "";
            case 3: return answers.issues.length > 0;
            case 4: return answers.urgency !== "";
            case 5: return true; // Preferences are optional
            default: return false;
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Step {step} of {totalSteps}</span>
                    <span className="text-sm text-primary font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            {/* Step Content */}
            <Card className="border-secondary">
                <CardHeader>
                    {step === 1 && (
                        <>
                            <CardTitle>
                                {isSupporter ? "How old is the person you're helping?" : "How old are you?"}
                            </CardTitle>
                            <CardDescription>
                                Different services support different age groups.
                            </CardDescription>
                        </>
                    )}
                    {step === 2 && (
                        <>
                            <CardTitle>
                                {isSupporter ? "Where are they located?" : "Where are you located?"}
                            </CardTitle>
                            <CardDescription>
                                We'll show you services in your area.
                            </CardDescription>
                        </>
                    )}
                    {step === 3 && (
                        <>
                            <CardTitle>What are you looking for support with?</CardTitle>
                            <CardDescription>Select all that apply</CardDescription>
                        </>
                    )}
                    {step === 4 && (
                        <>
                            <CardTitle>How urgent is your situation?</CardTitle>
                            <CardDescription>This determines which pathway will be fastest.</CardDescription>
                        </>
                    )}
                    {step === 5 && (
                        <>
                            <CardTitle>Do you have any preferences?</CardTitle>
                            <CardDescription>Optional - helps us show the best matches</CardDescription>
                        </>
                    )}
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Step 1: Age */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="age">Age</Label>
                                <Input
                                    id="age"
                                    type="number"
                                    placeholder="Enter your age"
                                    min={10}
                                    max={30}
                                    value={answers.age}
                                    onChange={(e) => setAnswers({ ...answers, age: e.target.value })}
                                    className="mt-2"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground italic">
                                This tool is designed for young people aged 12-25. If you're outside this range,
                                we'll still show you relevant services.
                            </p>
                        </div>
                    )}

                    {/* Step 2: Location */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="location">Suburb, town or postcode</Label>
                                <Input
                                    id="location"
                                    type="text"
                                    placeholder="e.g., Geelong, 3000, Ballarat"
                                    value={answers.location}
                                    onChange={(e) => setAnswers({ ...answers, location: e.target.value })}
                                    className="mt-2"
                                />
                            </div>
                            <Button variant="outline" className="w-full" type="button">
                                <MapPin className="w-4 h-4 mr-2" />
                                Use my current location
                            </Button>
                        </div>
                    )}

                    {/* Step 3: Issues */}
                    {step === 3 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {ISSUE_OPTIONS.map((option) => (
                                <label
                                    key={option.value}
                                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${answers.issues.includes(option.value)
                                        ? "border-primary bg-primary/5"
                                        : "border-secondary hover:border-primary/50"
                                        }`}
                                >
                                    <Checkbox
                                        checked={answers.issues.includes(option.value)}
                                        onCheckedChange={() => toggleIssue(option.value)}
                                        className="mr-3"
                                    />
                                    <span className="text-sm">{option.label}</span>
                                </label>
                            ))}
                        </div>
                    )}

                    {/* Step 4: Urgency */}
                    {step === 4 && (
                        <RadioGroup
                            value={answers.urgency}
                            onValueChange={(value) => setAnswers({ ...answers, urgency: value })}
                            className="space-y-3"
                        >
                            {URGENCY_OPTIONS.map((option) => (
                                <label
                                    key={option.value}
                                    className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${answers.urgency === option.value
                                        ? "border-primary bg-primary/5"
                                        : "border-secondary hover:border-primary/50"
                                        }`}
                                >
                                    <RadioGroupItem
                                        value={option.value}
                                        className="mt-1 mr-4"
                                    />
                                    <div>
                                        <div className="font-medium">{option.label}</div>
                                        <div className="text-sm text-muted-foreground">{option.description}</div>
                                    </div>
                                </label>
                            ))}
                        </RadioGroup>
                    )}

                    {/* Step 5: Preferences */}
                    {step === 5 && (
                        <div className="space-y-4">
                            <label className="flex items-center p-4 border-2 border-secondary rounded-lg cursor-pointer hover:border-primary/50">
                                <Checkbox
                                    checked={answers.bulkBilledOnly}
                                    onCheckedChange={(checked) =>
                                        setAnswers({ ...answers, bulkBilledOnly: checked === true })
                                    }
                                    className="mr-3"
                                />
                                <span>Free/bulk-billed services only</span>
                            </label>
                            <label className="flex items-center p-4 border-2 border-secondary rounded-lg cursor-pointer hover:border-primary/50">
                                <Checkbox
                                    checked={answers.lgbtiqSupport}
                                    onCheckedChange={(checked) =>
                                        setAnswers({ ...answers, lgbtiqSupport: checked === true })
                                    }
                                    className="mr-3"
                                />
                                <span>LGBTIQ+ specialised support</span>
                            </label>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-4 pt-4">
                        <Button variant="outline" onClick={handleBack} className="flex-1">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <Button onClick={handleNext} disabled={!canProceed()} className="flex-1">
                            {step === totalSteps ? "Show my options" : "Next"}
                            {step < totalSteps && <ArrowRight className="w-4 h-4 ml-2" />}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function IntakePage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
            <IntakeContent />
        </Suspense>
    );
}
