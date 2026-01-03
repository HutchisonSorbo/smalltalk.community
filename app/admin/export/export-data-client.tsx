"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileJson, Sheet, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ExportDataClientProps {
    exportId: string;
    name: string;
}

export function ExportDataClient({ exportId, name }: ExportDataClientProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleExport = async (format: "csv" | "json") => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/admin/export/${exportId}?format=${format}`);

            if (!response.ok) {
                throw new Error("Export failed");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${exportId}_export_${new Date().toISOString().split("T")[0]}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success(`${name} exported successfully`);
        } catch (error) {
            toast.error("Export failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isLoading}>
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                    <Sheet className="h-4 w-4 mr-2" />
                    Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("json")}>
                    <FileJson className="h-4 w-4 mr-2" />
                    Export as JSON
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
