"use client";

import React, { useState, Dispatch, SetStateAction } from "react";
import { COSCard } from "@/components/communityos/ui/cos-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RiskMatrix, getRiskLevel } from "./risk-matrix";
import { Shield, ChevronRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { RiskAssessmentInput } from "@/lib/communityos/safeguarding/types";

interface RiskAssessmentInputState {
    activity_name: string;
    description: string;
    likelihood: number;
    impact: number;
    controls: string;
    residual_likelihood: number;
    residual_impact: number;
}

interface RiskAssessmentWizardProps {
    onComplete: (data: RiskAssessmentInput) => Promise<void>;
    onCancel: () => void;
}

export function RiskAssessmentWizard({ onComplete, onCancel }: RiskAssessmentWizardProps) {
    const [step, setStep] = useState(1);
    const [data, setData] = useState<RiskAssessmentInputState>({
        activity_name: "",
        description: "",
        likelihood: 3,
        impact: 3,
        controls: "",
        residual_likelihood: 2,
        residual_impact: 2,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const inherentLevel = getRiskLevel(data.likelihood, data.impact);

    const sanitizeData = (raw: RiskAssessmentInputState): RiskAssessmentInput => {
        return {
            activity_name: raw.activity_name.trim().slice(0, 100),
            description: raw.description.trim().slice(0, 1000),
            likelihood: Math.max(1, Math.min(5, Math.floor(raw.likelihood))),
            impact: Math.max(1, Math.min(5, Math.floor(raw.impact))),
            controls: raw.controls.trim().slice(0, 500),
            residual_likelihood: Math.max(1, Math.min(5, Math.floor(raw.residual_likelihood))),
            residual_impact: Math.max(1, Math.min(5, Math.floor(raw.residual_impact))),
        };
    };

    const handleSubmit = async () => {
        const sanitized = sanitizeData(data);
        if (!sanitized.activity_name) return;

        setIsSubmitting(true);
        try {
            await onComplete(sanitized);
        } catch (error) {
            console.error("Risk wizard onComplete failed:", error);
            // Optionally show a toast here, but SafeguardingCentre manages these
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <COSCard variant="elevated" className="max-w-2xl w-full mx-auto overflow-hidden">
            <div className="flex border-b border-border -mx-6 -mt-6 mb-6">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className={cn(
                            "flex-1 text-center py-3 text-[10px] font-bold uppercase tracking-wider transition-colors",
                            step === i ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                        )}
                    >
                        Step {i}
                    </div>
                ))}
            </div>

            <div className="min-h-[300px] flex flex-col justify-between">
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {step === 1 && <ActivityStep data={data} setData={setData} />}
                    {step === 2 && <InherentRiskStep data={data} setData={setData} inherentLevel={inherentLevel} />}
                    {step === 3 && <ControlsStep data={data} setData={setData} />}
                    {step === 4 && <ReviewStep data={data} inherentLevel={inherentLevel} />}
                </div>

                <div className="flex justify-between pt-8 border-t border-border mt-8">
                    <Button variant="ghost" onClick={step === 1 ? onCancel : prevStep} disabled={isSubmitting}>
                        {step === 1 ? "Cancel" : "Back"}
                    </Button>
                    <Button
                        onClick={step === 4 ? handleSubmit : nextStep}
                        disabled={(step === 1 && !data.activity_name.trim()) || isSubmitting}
                    >
                        {isSubmitting ? "Submitting..." : step === 4 ? "Submit Assessment" : "Continue"}
                        {step < 4 && !isSubmitting && <ChevronRight className="h-4 w-4 ml-2" />}
                    </Button>
                </div>
            </div>
        </COSCard>
    );
}

function ActivityStep({ data, setData }: { data: RiskAssessmentInputState, setData: Dispatch<SetStateAction<RiskAssessmentInputState>> }) {
    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h3 className="text-lg font-bold">Activity Description</h3>
                <p className="text-sm text-muted-foreground">Define what activity or area you are assessing for risk.</p>
            </div>
            <div className="space-y-2">
                <label htmlFor="activity-name" className="text-xs font-bold uppercase text-muted-foreground cursor-pointer">Activity Name</label>
                <Input
                    id="activity-name"
                    placeholder="e.g., Youth Summer Camp 2026"
                    value={data.activity_name}
                    onChange={(e) => setData({ ...data, activity_name: e.target.value.slice(0, 100) })}
                    maxLength={100}
                />
            </div>
            <div className="space-y-2">
                <label htmlFor="activity-desc" className="text-xs font-bold uppercase text-muted-foreground cursor-pointer">Context / Details</label>
                <Textarea
                    id="activity-desc"
                    placeholder="Describe the setting, participants, and potential hazards..."
                    className="min-h-[100px]"
                    value={data.description}
                    onChange={(e) => setData({ ...data, description: e.target.value.slice(0, 1000) })}
                    maxLength={1000}
                />
            </div>
        </div>
    );
}

function InherentRiskStep({ data, setData, inherentLevel }: { data: RiskAssessmentInputState, setData: Dispatch<SetStateAction<RiskAssessmentInputState>>, inherentLevel: string }) {
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h3 className="text-lg font-bold">Inherent Risk Assessment</h3>
                <p className="text-sm text-muted-foreground">Assess the risk assuming no controls are in place.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs font-bold">
                            <label htmlFor="likelihood-range">Likelihood ({data.likelihood})</label>
                            <span className="text-muted-foreground">Rare → Almost Certain</span>
                        </div>
                        <input
                            id="likelihood-range"
                            type="range" min="1" max="5"
                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                            value={data.likelihood}
                            onChange={(e) => setData({ ...data, likelihood: parseInt(e.target.value) })}
                            title="Likelihood score from 1 to 5"
                        />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs font-bold">
                            <label htmlFor="impact-range">Impact ({data.impact})</label>
                            <span className="text-muted-foreground">Insignificant → Critical</span>
                        </div>
                        <input
                            id="impact-range"
                            type="range" min="1" max="5"
                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                            value={data.impact}
                            onChange={(e) => setData({ ...data, impact: parseInt(e.target.value) })}
                            title="Impact score from 1 to 5"
                        />
                    </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <RiskMatrix
                        risks={[{ id: 'curr', label: 'Inherent Risk', likelihood: data.likelihood, impact: data.impact }]}
                        activeRiskId="curr"
                    />
                    <div className={cn(
                        "px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-white shadow-sm",
                        inherentLevel === 'extreme' ? "bg-red-600" :
                            inherentLevel === 'high' ? "bg-orange-500" :
                                inherentLevel === 'medium' ? "bg-yellow-400" :
                                    "bg-green-500"
                    )}>
                        {inherentLevel}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ControlsStep({ data, setData }: { data: RiskAssessmentInputState, setData: Dispatch<SetStateAction<RiskAssessmentInputState>> }) {
    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h3 className="text-lg font-bold">Risk Controls</h3>
                <p className="text-sm text-muted-foreground">What measures will you implement to mitigate this risk?</p>
            </div>
            <div className="space-y-2">
                <label htmlFor="risk-controls" className="text-xs font-bold uppercase text-muted-foreground cursor-pointer">Mitigation Strategy</label>
                <Textarea
                    id="risk-controls"
                    placeholder="e.g., Staff training, sign-in procedures, enhanced supervision ratios..."
                    className="min-h-[150px]"
                    value={data.controls}
                    onChange={(e) => setData({ ...data, controls: e.target.value.slice(0, 500) })}
                    maxLength={500}
                />
            </div>
        </div>
    );
}

function ReviewStep({ data, inherentLevel }: { data: RiskAssessmentInputState, inherentLevel: string }) {
    return (
        <div className="space-y-6">
            <div className="space-y-1 text-center">
                <CheckCircle2 className="h-10 w-10 text-primary mx-auto mb-2" />
                <h3 className="text-lg font-bold">Final Review</h3>
                <p className="text-sm text-muted-foreground">Verify assessment details before finalizing.</p>
            </div>

            <div className="bg-muted/50 p-4 rounded-xl border border-border space-y-3">
                <div className="flex justify-between items-center border-b pb-2 gap-4">
                    <span className="text-xs font-bold text-muted-foreground shrink-0 uppercase">Activity</span>
                    <span className="text-sm font-semibold truncate flex-1 text-right" title={data.activity_name}>
                        {data.activity_name}
                    </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Inherent Level</span>
                    <span className="text-xs font-bold capitalize">{inherentLevel}</span>
                </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">
                    By submitting this assessment, you confirm that the proposed controls are feasible and will be communicated to relevant staff.
                </p>
            </div>
        </div>
    );
}
