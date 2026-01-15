/**
 * Community Insights AI Component
 * Provides a chat-like interface for querying community data
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { useTenant } from "./TenantProvider";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    demographics?: Record<string, unknown>;
    amenities?: Record<string, unknown>;
    sources?: { demographics: string | null; amenities: string | null };
}

interface CommunityInsightsAIProps {
    defaultPostcode?: string;
    defaultLocation?: { lat: number; lon: number };
}

export function CommunityInsightsAI({
    defaultPostcode,
    defaultLocation,
}: CommunityInsightsAIProps) {
    const { tenant } = useTenant();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [postcode, setPostcode] = useState(defaultPostcode ?? "");
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !tenant) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/community-insights", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: userMessage.content,
                    tenantId: tenant.id,
                    postcode: postcode || undefined,
                    location: defaultLocation || undefined,
                }),
            });

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error("Rate limit exceeded. Please wait a moment and try again.");
                }
                throw new Error("Failed to get insights. Please try again.");
            }

            const data = await response.json();

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: data.insights,
                demographics: data.demographics,
                amenities: data.amenities,
                sources: data.sources,
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const suggestedQuestions = [
        "What age groups are most represented in this area?",
        "What community facilities are nearby?",
        "How can we better serve culturally diverse communities?",
        "What programs might benefit local families?",
    ];

    return (
        <div className="flex h-[600px] flex-col rounded-lg border bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            {/* Header */}
            <div className="flex items-center gap-3 border-b p-4 dark:border-gray-700">
                <span className="text-2xl">🤖</span>
                <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                        Community Insights AI
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Ask questions about your community demographics and local amenities
                    </p>
                </div>
            </div>

            {/* Postcode Input */}
            <div className="border-b p-3 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">
                        Postcode:
                    </label>
                    <input
                        type="text"
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        placeholder="e.g., 3000"
                        className="w-24 rounded border px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700"
                    />
                    <span className="text-xs text-gray-400">
                        (optional - enables demographic data)
                    </span>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                        <span className="text-4xl">💡</span>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Ask me anything about your community!
                        </p>
                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                            {suggestedQuestions.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => setInput(q)}
                                    className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${msg.role === "user"
                                    ? "bg-primary text-white"
                                    : "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                                }`}
                        >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            {msg.sources && (msg.sources.demographics || msg.sources.amenities) && (
                                <p className="mt-2 text-xs opacity-70">
                                    Sources: {[msg.sources.demographics, msg.sources.amenities].filter(Boolean).join(", ")}
                                </p>
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="rounded-lg bg-gray-100 px-4 py-2 dark:bg-gray-700">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0.2s]" />
                                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0.4s]" />
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
                        {error}
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="border-t p-4 dark:border-gray-700">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your community..."
                        disabled={isLoading}
                        className="flex-1 rounded-lg border px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90 disabled:opacity-50"
                    >
                        {isLoading ? "..." : "Send"}
                    </button>
                </div>
            </form>
        </div>
    );
}
