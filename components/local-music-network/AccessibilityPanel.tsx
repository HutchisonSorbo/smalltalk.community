"use client";

import React, { useState } from "react";
import { useAccessibility } from "@/components/providers/AccessibilityContext";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { RotateCcw, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function AccessibilityPanel({ variant = "fixed" }: { variant?: "fixed" | "inline" }) {
    const {
        highContrast, setHighContrast,
        dyslexiaFont, setDyslexiaFont,
        textScale, setTextScale,
        lineSpacing, setLineSpacing,
        saturation, setSaturation,
        linkHighlight, setLinkHighlight,
        stopAnimations, setStopAnimations,
        cursorSize, setCursorSize,
        resetDefaults
    } = useAccessibility();

    const [open, setOpen] = useState(false);

    const buttonClass = variant === "fixed"
        ? "fixed bottom-6 right-6 z-[100] h-12 w-12 rounded-full shadow-lg border-2 border-primary bg-primary text-primary-foreground hover:bg-primary/90 transition-all p-0 overflow-hidden"
        : "h-9 w-9 hover:bg-muted rounded-full p-0 overflow-hidden";

    const buttonVariant = variant === "fixed" ? "default" : "ghost";

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <SheetTrigger asChild>
                        <Button
                            variant={buttonVariant}
                            size="icon"
                            className={buttonClass}
                            aria-label="Open accessibility settings"
                        >
                            <div className="relative h-full w-full bg-white rounded-full flex items-center justify-center p-0.5">
                                <Image
                                    src="/accessibility-icon.png"
                                    alt="Accessibility"
                                    width={48}
                                    height={48}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </Button>
                    </SheetTrigger>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Accessibility Options</p>
                </TooltipContent>
            </Tooltip>
            <SheetContent side="right" className="w-full sm:w-[400px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>
                        Accessibility Settings
                    </SheetTitle>
                    <SheetDescription>
                        Customize your viewing experience. Settings are saved automatically.
                    </SheetDescription>
                </SheetHeader>

                <div className="grid gap-6 py-6">
                    {/* Visuals Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Visuals
                        </h3>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="high-contrast" className="flex flex-col gap-1">
                                <span>High Contrast</span>
                                <span className="font-normal text-xs text-muted-foreground">Increase color contrast</span>
                            </Label>
                            <Switch
                                id="high-contrast"
                                checked={highContrast}
                                onCheckedChange={setHighContrast}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="saturation">Color Saturation</Label>
                            <Select value={saturation} onValueChange={(v: any) => setSaturation(v)}>
                                <SelectTrigger id="saturation">
                                    <SelectValue placeholder="Select saturation" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="standard">Standard</SelectItem>
                                    <SelectItem value="low">Low Saturation</SelectItem>
                                    <SelectItem value="monochrome">Monochrome (Grayscale)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Typography Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Typography
                        </h3>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="dyslexia-font" className="flex flex-col gap-1">
                                <span>Dyslexia Friendly Font</span>
                                <span className="font-normal text-xs text-muted-foreground">Use OpenDyslexic or similar</span>
                            </Label>
                            <Switch
                                id="dyslexia-font"
                                checked={dyslexiaFont}
                                onCheckedChange={setDyslexiaFont}
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <Label htmlFor="text-scale">Text Scaling ({Math.round(textScale * 100)}%)</Label>
                            </div>
                            <Slider
                                id="text-scale"
                                min={1}
                                max={2}
                                step={0.1}
                                value={[textScale]}
                                onValueChange={(val) => setTextScale(val[0])}
                                className="py-1"
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <Label htmlFor="line-spacing">Line Spacing ({lineSpacing})</Label>
                            </div>
                            <Slider
                                id="line-spacing"
                                min={1}
                                max={2.5}
                                step={0.1}
                                value={[lineSpacing]}
                                onValueChange={(val) => setLineSpacing(val[0])}
                                className="py-1"
                            />
                        </div>
                    </div>

                    {/* Interaction Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Interaction
                        </h3>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="link-highlight" className="flex flex-col gap-1">
                                <span>Highlight Links</span>
                                <span className="font-normal text-xs text-muted-foreground">Underline and color links</span>
                            </Label>
                            <Switch
                                id="link-highlight"
                                checked={linkHighlight}
                                onCheckedChange={setLinkHighlight}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="stop-animations" className="flex flex-col gap-1">
                                <span>Stop Animations</span>
                                <span className="font-normal text-xs text-muted-foreground">Pause all animations</span>
                            </Label>
                            <Switch
                                id="stop-animations"
                                checked={stopAnimations}
                                onCheckedChange={setStopAnimations}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="cursor-size" className="flex flex-col gap-1">
                                <span>Large Cursor</span>
                                <span className="font-normal text-xs text-muted-foreground">Increase mouse cursor size</span>
                            </Label>
                            <Switch
                                id="cursor-size"
                                checked={cursorSize === "large"}
                                onCheckedChange={(c) => setCursorSize(c ? "large" : "normal")}
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t">
                        <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={resetDefaults}
                        >
                            <RotateCcw className="h-4 w-4" />
                            Reset Controls
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

// CodeRabbit Audit Trigger
