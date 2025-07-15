import React, { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { 
  MessageSquare, 
  Plus, 
  Search, 
  MoreVertical, 
  Star, 
  Trash2,
  Download,
  Share,
  Clock,
  Filter,
  Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatInterface, QuickPrompts } from "@/components/ui/chat-interface";
import { UsageProgress, UsageWarning } from "@/components/ui/usage-progress";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useRealTimeChat } from "@/hooks/useWebSocket";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { title } from "process";

interface Conversation {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  messageCount: number;
  category: "general" | "contract" | "employment" | "criminal" | "business";
  starred: boolean;
}

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  attachments?: Array<{
    name: string;
    type: string;
    size: number;
  }>;
}

export default function Chat() {
  const [, params] = useRoute("/chat/:conversationId?");
  const currentConversationId = params?.conversationId;
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(currentConversationId || null);
  const [favorites, setFavorites] = useState<string[]>(JSON.parse(localStorage.getItem('favorites') || '[]'));
  
  const { usage, canMakeRequest, incrementUsage } = useUsageTracking();
  const { messages, sendChatMessage, isConnected } = useRealTimeChat(currentConversationId);
  const { toast } = useToast();
  const [lastConversationId, setLastConversationId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserConversations = async () => {
      try {
        const response = await fetch("/api/conversations");
        if (!response.ok) throw new Error("Failed to load conversations");

        const data = await response.json();
        setConversations(
          data.map((conv: any) => ({
            id: conv.id,
            title: conv.title,
            preview: "", // можно будет заменить на последнее сообщение при необходимости
            timestamp: new Date(conv.createdAt),
            messageCount: conv.messageCount || 0,
            category: conv.category || "general",
            starred: conv.starred || false,
          }))
        );
      } catch (error) {
        console.error("Failed to fetch conversations", error);
      }
    };

    const maybeDeleteEmptyChat = async () => {
      if (
        lastConversationId &&
        lastConversationId !== currentConversationId &&
        currentMessages.length === 0
      ) {
        try {
          const res = await fetch(`/api/conversations/${lastConversationId}`, {
            method: "DELETE",
          });
          if (res.ok) {
            setConversations(prev => prev.filter(c => c.id !== lastConversationId));
          }
        } catch (error) {
          console.warn("Failed to delete empty conversation:", error);
        }
      }
      setLastConversationId(currentConversationId || null);
    };

    maybeDeleteEmptyChat();
    fetchUserConversations();
    if (currentConversationId) {
      loadConversation(currentConversationId);
    }
  }, [currentConversationId]);

  const addToFavorites = () => {
    const newFavorites = [...favorites];
    if (newFavorites.includes(currentChatId || '')) {
      newFavorites.splice(newFavorites.indexOf(currentChatId || ''), 1);
    } else {
      newFavorites.push(currentChatId || '');
    }
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const exportChat = () => {
    const messagesToExport = currentMessages.map(msg => ({
      id: msg.id,
      content: msg.content,
      role: msg.role,
      timestamp: msg.timestamp?.toISOString(),
      attachments: msg.attachments
    }));
    
    const data = {
      title: conversations.find(c => c.id === currentChatId)?.title || 'Untitled Chat',
      messages: messagesToExport,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`);
      if (response.ok) {
        const messages = await response.json();
        setCurrentMessages(messages.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          role: msg.role,
          timestamp: new Date(msg.createdAt),
          attachments: msg.attachments || [],
          metadata: msg.metadata || {},
        })));
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      setCurrentMessages([]);
    }
  };

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!canMakeRequest()) {
      toast({
        title: "Usage Limit Reached",
        description: "You've reached your monthly question limit. Upgrade to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await sendMessageToAPI(content, attachments);

      toast({
        title: "Message Sent",
        description: "Your legal question has been processed successfully.",
        variant: "default",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessageToAPI = async (content: string, attachments?: File[]) => {
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      content,
      role: "user",
      timestamp: new Date(),
      attachments: attachments?.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
      })) || [],
    };

    // Отображаем сразу сообщение пользователя
    setCurrentMessages(prev => [...prev, tempUserMessage]);
    
    try {
      const body: any = {
        message: content,
        attachments: tempUserMessage.attachments,
      };

      // Только если conversationId уже существует на сервере
      if (currentConversationId && currentConversationId.startsWith("conv-")) {
        body.conversationId = currentConversationId;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      if (data.conversation && !currentConversationId) {
        window.history.pushState({}, "", `/chat/${data.conversation.id}`);
      }
      
      setCurrentMessages(prev =>
        prev.filter(m => m.id !== tempUserMessage.id).concat([
          {
            id: data.userMessage.id,
            content: data.userMessage.content,
            role: "user",
            timestamp: new Date(data.userMessage.createdAt),
            attachments: data.userMessage.attachments || [],
          },
          {
            id: data.aiMessage.id,
            content: data.aiMessage.content,
            role: "assistant",
            timestamp: new Date(data.aiMessage.createdAt),
          }
        ])
      );

      if (data.conversation && !conversations.find(c => c.id === data.conversation.id)) {
        setConversations(prev => [
          {
            id: data.conversation.id,
            title: data.conversation.title,
            preview: content.substring(0, 100),
            timestamp: new Date(data.conversation.createdAt),
            messageCount: 2,
            category: data.conversation.category,
            starred: data.conversation.starred,
          },
          ...prev
        ]);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePromptSelect = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const createNewConversation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: "New conversation",
          attachments: [],
        }),
      });

      if (!response.ok) throw new Error("Failed to create conversation");

      const data = await response.json();

      const newConv: Conversation = {
        id: data.id,
        title: data.title,
        preview: "",
        timestamp: new Date(data.createdAt),
        messageCount: 0,
        category: data.category,
        starred: data.starred,
      };

      setConversations(prev => [newConv, ...prev]);
      setCurrentMessages([]);
      window.history.pushState({}, "", `/chat/${newConv.id}`);
    } catch (err) {
      console.error("Create conversation error:", err);
      toast({
        title: "Error",
        description: "Failed to start new chat",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this conversation?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const err = await response.json();
        toast({
          title: "Could not delete",
          description: err.message || "Failed to delete conversation.",
          variant: "destructive",
        });
        return;
      }

      // Удалить из UI
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));

      // Если удаляем активный чат — перейти на пустой экран
      if (currentConversationId === conversationId) {
        setCurrentMessages([]);
        window.history.pushState({}, "", "/chat");
      }

      toast({
        title: "Chat deleted",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      });
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conv.preview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || conv.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: "all", label: "All Conversations" },
    { value: "general", label: "General Legal" },
    { value: "contract", label: "Contracts" },
    { value: "employment", label: "Employment" },
    { value: "criminal", label: "Criminal Law" },
    { value: "business", label: "Business Law" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <div className="flex h-screen">
        <div className="w-80 border-r border-border bg-secondary/20 flex flex-col">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-6">
              <AnimatedLogo size="md" />
              <Button
                onClick={createNewConversation}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Chat
              </Button>
            </div>

            {usage && (
              <div className="mb-4">
                <UsageProgress
                  current={usage.current}
                  limit={usage.limit}
                  period={usage.period}
                  planType={usage.planType}
                />
              </div>
            )}

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass-morphism"
              />
            </div>

            <div className="mb-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-between glass-morphism">
                    <span>{categories.find(c => c.value === selectedCategory)?.label}</span>
                    <Filter className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  {categories.map((category) => (
                    <DropdownMenuItem
                      key={category.value}
                      onClick={() => setSelectedCategory(category.value)}
                    >
                      {category.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              {filteredConversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isActive={conversation.id === currentConversationId}
                  onClick={async () => {
                    // Перед переходом проверим, был ли предыдущий чат пустым
                    if (currentConversationId) {
                      try {
                        const response = await fetch(`/api/conversations/${currentConversationId}/messages`);
                        if (response.ok) {
                          const messages = await response.json();
                          if (messages.length === 0) {
                            await fetch(`/api/conversations/${currentConversationId}`, {
                              method: "DELETE",
                            });
                            setConversations(prev => prev.filter(c => c.id !== currentConversationId));
                          }
                        }
                      } catch (err) {
                        console.error("Failed to auto-delete empty conversation:", err);
                      }
                    }

                    await loadConversation(conversation.id);
                    window.history.pushState({}, "", `/chat/${conversation.id}`);
                  }}
                />
              ))}
              
              {filteredConversations.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No conversations found</p>
                  <p className="text-sm">Start a new chat to begin</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1 flex flex-col">
          {currentConversationId ? (
            <>
              <div className="p-6 border-b border-border bg-secondary/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-semibold text-gradient">
                      {conversations.find(c => c.id === currentConversationId)?.title || "Legal Consultation"}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      AI-powered legal assistance • {isConnected ? "Connected" : "Offline"}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Star className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={addToFavorites}>
                          <Star className="w-4 h-4 mr-2" />
                          Add to Favorites
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={exportChat}>
                          <Download className="w-4 h-4 mr-2" />
                          Export Chat
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteConversation(currentConversationId)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Chat
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              {usage && (
                <UsageWarning
                  current={usage.current}
                  limit={usage.limit}
                  onUpgrade={() => window.location.href = "/#pricing"}
                />
              )}

              <div className="flex-1 p-6">
                <ChatInterface
                  messages={currentMessages}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  placeholder="Ask any legal question..."
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="max-w-2xl text-center space-y-8">
                <div>
                  <AnimatedLogo size="xl" className="mb-6" />
                  <h1 className="text-4xl font-bold mb-4">
                    <span className="text-gradient">Welcome to LexAI</span>
                  </h1>
                  <p className="text-xl text-muted-foreground mb-8">
                    Your AI-powered legal assistant is ready to help with any legal questions or document analysis.
                  </p>
                </div>

                {usage && (
                  <div className="flex justify-center">
                    <Badge 
                      className={cn(
                        "px-4 py-2 text-sm",
                        usage.planType === "premium" 
                          ? "bg-primary/20 text-primary border-primary/30" 
                          : "bg-secondary border-border"
                      )}
                    >
                      {usage.planType === "premium" && <Crown className="w-4 h-4 mr-2" />}
                      {usage.planType === "premium" ? "LexAI Elite" : "Free Plan"}
                      <span className="ml-2 opacity-60">
                        {usage.current}/{usage.limit} questions used
                      </span>
                    </Badge>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold mb-4">Popular Legal Questions</h3>
                  <QuickPrompts onPromptSelect={handlePromptSelect} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                  <Card className="glass-morphism text-center">
                    <CardContent className="pt-6">
                      <MessageSquare className="w-8 h-8 text-primary mx-auto mb-4" />
                      <h4 className="font-semibold mb-2">Smart Legal Chat</h4>
                      <p className="text-sm text-muted-foreground">
                        Ask complex legal questions in plain English
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="glass-morphism text-center">
                    <CardContent className="pt-6">
                      <Clock className="w-8 h-8 text-primary mx-auto mb-4" />
                      <h4 className="font-semibold mb-2">24/7 Availability</h4>
                      <p className="text-sm text-muted-foreground">
                        Get legal guidance anytime, anywhere
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="glass-morphism text-center">
                    <CardContent className="pt-6">
                      <Crown className="w-8 h-8 text-primary mx-auto mb-4" />
                      <h4 className="font-semibold mb-2">Expert Accuracy</h4>
                      <p className="text-sm text-muted-foreground">
                        99.9% accuracy with GPT-4o Turbo
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ConversationItem({ 
  conversation, 
  isActive, 
  onClick 
}: { 
  conversation: Conversation; 
  isActive: boolean; 
  onClick: () => void; 
}) {
  const getCategoryColor = (category: string) => {
    const colors = {
      general: "bg-blue-500/20 text-blue-400",
      contract: "bg-green-500/20 text-green-400",
      employment: "bg-purple-500/20 text-purple-400",
      criminal: "bg-red-500/20 text-red-400",
      business: "bg-yellow-500/20 text-yellow-400",
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 rounded-xl cursor-pointer transition-all duration-200",
        isActive 
          ? "bg-primary/20 border border-primary/30" 
          : "hover:bg-secondary/50 glass-morphism"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className={cn(
          "font-medium text-sm truncate flex-1",
          isActive ? "text-primary" : "text-foreground"
        )}>
          {conversation.title}
        </h3>
        <div className="flex items-center space-x-1 ml-2">
          {conversation.starred && (
            <Star className="w-3 h-3 text-yellow-500 fill-current" />
          )}
          <Badge 
            className={cn(
              "text-xs px-2 py-0",
              getCategoryColor(conversation.category)
            )}
          >
            {conversation.category}
          </Badge>
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground truncate mb-2">
        {conversation.preview}
      </p>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center">
          <MessageSquare className="w-3 h-3 mr-1" />
          {conversation.messageCount}
        </span>
        <span>{formatTime(conversation.timestamp)}</span>
      </div>
    </div>
  );
}
