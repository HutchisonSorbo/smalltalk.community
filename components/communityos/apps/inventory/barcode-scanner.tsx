"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Camera, X, RefreshCw, Search } from "lucide-react";

interface BarcodeScannerProps {
    onScan: (code: string) => void;
    onClose: () => void;
    className?: string;
}

export function BarcodeScanner({ onScan, onClose, className }: BarcodeScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [isScanning, setIsScanning] = useState(true);
    const [manualCode, setManualCode] = useState("");

    useEffect(() => {
        let stream: MediaStream | null = null;

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setHasPermission(true);
                }
            } catch (err) {
                console.error("Failed to access camera:", err);
                setHasPermission(false);
            }
        };

        if (isScanning) {
            startCamera();
        }

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isScanning]);

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualCode.trim()) {
            onScan(manualCode.trim());
        }
    };

    // Mock scanning effect - placeholder for future BarcodeDetector logic
    useEffect(() => {
        if (!isScanning || !hasPermission) return;

        // TODO: Implement BarcodeDetector API or scanning library loop here
        // Currently disabled to avoid wasteful no-op timer
        const interval = null;

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isScanning, hasPermission]);

    return (
        <div className={cn("fixed inset-0 z-50 bg-black flex flex-col", className)}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 text-white z-10">
                <h3 className="text-lg font-semibold">Scan Barcode</h3>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20"
                    title="Close Scanner"
                    aria-label="Close Scanner"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Camera View */}
            <div className="flex-1 relative overflow-hidden bg-gray-900">
                {hasPermission === false ? (
                    <div className="absolute inset-0 flex items-center justify-center text-white p-6 text-center">
                        <div className="max-w-xs">
                            <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Camera access denied or unavailable.</p>
                            <p className="text-sm opacity-70 mt-2">Please enter the code manually below.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 border-[40px] border-black/50">
                            <div className="w-full h-full border-2 border-primary/50 relative">
                                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
                                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
                                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500 animate-pulse opacity-50" />
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Manual Entry */}
            <div className="p-4 bg-black/80 backdrop-blur-sm pb-8">
                <form onSubmit={handleManualSubmit} className="flex gap-2">
                    <input
                        id="manual-barcode-input"
                        type="text"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        placeholder="Or enter code manually..."
                        aria-label="Manual barcode input"
                        className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                        type="submit"
                        className="bg-primary text-white p-3 rounded-md font-medium hover:bg-primary/90"
                        title="Search Code"
                        aria-label="Search Code"
                    >
                        <Search className="w-5 h-5" />
                    </button>
                </form>
                {/* Demo Helpers */}
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                        type="button"
                        onClick={() => onScan("INV-2024-001")}
                        className="px-3 py-1 bg-white/5 rounded-full text-xs text-white/70 whitespace-nowrap hover:bg-white/10"
                    >
                        Demo: INV-001
                    </button>
                    <button
                        type="button"
                        onClick={() => onScan("INV-2024-002")}
                        className="px-3 py-1 bg-white/5 rounded-full text-xs text-white/70 whitespace-nowrap hover:bg-white/10"
                    >
                        Demo: INV-002
                    </button>
                </div>
            </div>
        </div>
    );
}
