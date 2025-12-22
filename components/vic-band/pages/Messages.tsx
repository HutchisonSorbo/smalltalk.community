import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MessageCircle, Send, ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Header } from "@/components/vic-band/Header";
import { Footer } from "@/components/vic-band/Footer";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import type { Conversation, Message, User as UserType } from "@shared/schema";

function ConversationList({
  conversations,
  isLoading,
  selectedUserId,
  onSelect,
}: {
  conversations: Conversation[];
  isLoading: boolean;
  selectedUserId: string | null;
  onSelect: (userId: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center">
        <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground text-sm">No conversations yet</p>
        <p className="text-muted-foreground text-xs mt-1">
          Start by messaging a musician or seller
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="space-y-1 p-2">
        {conversations.map((conv) => (
          <button
            key={conv.otherUser.id}
            onClick={() => onSelect(conv.otherUser.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-md transition-colors text-left hover-elevate ${selectedUserId === conv.otherUser.id
                ? "bg-accent"
                : ""
              }`}
            data-testid={`conversation-${conv.otherUser.id}`}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={conv.otherUser.profileImageUrl || undefined} />
              <AvatarFallback>
                {conv.otherUser.firstName?.[0]}
                {conv.otherUser.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium truncate">
                  {conv.otherUser.firstName} {conv.otherUser.lastName}
                </p>
                {conv.unreadCount > 0 && (
                  <Badge variant="default" className="text-xs">
                    {conv.unreadCount}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {conv.lastMessage.content}
              </p>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}

function MessageThread({
  userId,
  currentUserId,
}: {
  userId: string;
  currentUserId: string;
}) {
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, refetch } = useQuery<{
    messages: Message[];
    otherUser: UserType;
  }>({
    queryKey: ["/api/messages", userId],
    enabled: !!userId,
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", "/api/messages", { receiverId: userId, content });
    },
    onSuccess: () => {
      setNewMessage("");
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Your message couldn't be sent. Please try again.";
      toast({
        title: "Failed to send",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [data?.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMutation.mutate(newMessage.trim());
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="border-b p-4 flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
            >
              <Skeleton className="h-12 w-48 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Failed to load conversation
      </div>
    );
  }

  const { messages, otherUser } = data;

  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b p-4 flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={otherUser.profileImageUrl || undefined} />
          <AvatarFallback>
            {otherUser.firstName?.[0]}
            {otherUser.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">
            {otherUser.firstName} {otherUser.lastName}
          </p>
          <p className="text-sm text-muted-foreground">{otherUser.email}</p>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No messages yet. Start the conversation!
            </p>
          ) : (
            messages.map((message) => {
              const isOwn = message.senderId === currentUserId;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${isOwn
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                      }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    <p
                      className={`text-xs mt-1 ${isOwn
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                        }`}
                    >
                      {new Date(message.createdAt!).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSend} className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            data-testid="input-message"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || sendMutation.isPending}
            data-testid="button-send-message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function Messages() {
  const { user, isLoading: authLoading } = useAuth();
  const params = useParams();
  const userIdParam = params?.userId as string | undefined;
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    userIdParam || null
  );

  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<
    Conversation[]
  >({
    queryKey: ["/api/messages/conversations"],
    enabled: !!user,
  });

  useEffect(() => {
    if (userIdParam) {
      setSelectedUserId(userIdParam);
    }
  }, [userIdParam]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header showSearch={false} />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-[600px] w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header showSearch={false} />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center py-12">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h1 className="text-2xl font-bold mb-4">Sign In to Message</h1>
            <p className="text-muted-foreground mb-6">
              You need to be signed in to access your messages.
            </p>
            <Button asChild>
              <a href="/api/login">Sign In</a>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header showSearch={false} />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Messages</h1>

            <Card className="overflow-hidden">
              <div className="flex h-[600px]">
                <div className="w-80 border-r">
                  <div className="p-4 border-b">
                    <h2 className="font-semibold">Conversations</h2>
                  </div>
                  <ConversationList
                    conversations={conversations}
                    isLoading={conversationsLoading}
                    selectedUserId={selectedUserId}
                    onSelect={setSelectedUserId}
                  />
                </div>

                <div className="flex-1 flex flex-col">
                  {selectedUserId ? (
                    <MessageThread
                      userId={selectedUserId}
                      currentUserId={user.id}
                    />
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                      <MessageCircle className="h-12 w-12 mb-3" />
                      <p>Select a conversation to view messages</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
