import React, { useState, useRef, useEffect } from "react";
import { Send, FileText, Upload, Mic, Square, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThinkingLogo, AnimatedLogo } from "@/components/ui/animated-logo";
import { cn } from "@/lib/utils";
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";

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

interface MarkdownProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownProps) {
  return (
    <div className="prose prose-sm max-w-full break-words dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          p: ({ node, children, ...props }) => (
            <p
              className="text-sm leading-relaxed whitespace-pre-wrap mb-2"
              {...props}
            >
              {children}
            </p>
          ),
          code({ node, className, children, ...props }) {
            return (
              <code
                className={`bg-secondary/30 rounded px-1 py-0.5 text-sm font-mono ${className || ""}`}
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ node, children, ...props }) => (
            <pre
              className="bg-gray-100 dark:bg-gray-800 rounded p-2 overflow-x-auto text-sm mb-2"
              {...props}
            >
              {children}
            </pre>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string, attachments?: File[]) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

export function ChatInterface({
  messages,
  onSendMessage,
  isLoading = false,
  placeholder = "Ask any legal question...",
  className = ""
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if (!input.trim() && attachments.length === 0) return;
    
    onSendMessage(input.trim(), attachments);
    setInput("");
    setAttachments([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Card className={cn("flex flex-col flex-1 min-h-0 glass-morphism", className)}>
      <CardContent className="flex-1 p-0 overflow-auto">
        {/* Messages area with fixed height scroll */}
        <div className="flex flex-col max-h-[70vh] overflow-y-auto px-6 pt-6 space-y-6">
            {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[61vh] text-center space-y-4">
              <AnimatedLogo size="lg" className="opacity-50" />
              <div>
              <h3 className="text-xl font-semibold text-gradient mb-2">
                Ready to assist with your legal questions
              </h3>
              <p className="text-muted-foreground">
                Ask about laws, contracts, legal procedures, or upload documents for analysis
              </p>
              </div>
            </div>
            ) : (
            <>
              <div className="flex flex-col min-h-[61vh] max-h-[61vh] space-y-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex justify-start">
                <div className="flex items-center space-x-3 max-w-xs">
                  <Avatar className="h-8 w-8 bg-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    AI
                  </AvatarFallback>
                  </Avatar>
                  <ThinkingLogo />
                </div>
                </div>
              )}
              </div>
            </>
            )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>

      {/* Input area */}
      <div className="border-t border-border/50 p-4 space-y-4 bg-background">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center space-x-2 bg-secondary rounded-lg px-3 py-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm truncate max-w-32">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAttachment(index)}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="min-h-[60px] max-h-32 resize-none pr-20 glass-morphism"
              disabled={isLoading}
            />
            <div className="absolute bottom-2 right-2 flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 w-8 p-0"
                disabled={isLoading}
              >
                <Upload className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsRecording(!isRecording)}
                className={cn("h-8 w-8 p-0", isRecording && "text-red-500")}
                disabled={isLoading}
              >
                {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <Button
            onClick={handleSend}
            disabled={(!input.trim() && attachments.length === 0) || isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 premium-glow"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </Card>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={cn(
      "flex items-start space-x-3",
      isUser ? "justify-end" : "justify-start"
    )}>
      {!isUser && (
        <Avatar className="h-8 w-8 bg-primary">
          <AvatarFallback className="bg-primary text-primary-foreground">
            AI
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        "max-w-[80%] rounded-2xl px-4 py-3 chat-message",
        isUser 
          ? "bg-primary text-primary-foreground rounded-tr-none" 
          : "glass-morphism rounded-tl-none"
      )}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeRaw, rehypeHighlight]}
          components={{
            p: ({ node, children, ...props }) => (
              <p className="text-sm leading-relaxed whitespace-pre-wrap mb-2" {...props}>
                {children}
              </p>
            ),
            code({ node, className, children, ...props }) {
              return (
                <code
                  className={`bg-secondary/30 rounded px-1 py-0.5 text-sm font-mono ${className || ""}`}
                  {...props}
                >
                  {children}
                </code>
              );
            },
            pre: ({ node, children, ...props }) => (
              <pre
                className="bg-gray-100 dark:bg-gray-800 rounded p-2 overflow-x-auto text-sm mb-2"
                {...props}
              >
                {children}
              </pre>
            ),
          }}
        >
          {message.content}
        </ReactMarkdown>
        
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.attachments.map((attachment, index) => (
              <div key={index} className="flex items-center space-x-2 text-xs opacity-80">
                <FileText className="w-3 h-3" />
                <span>{attachment.name}</span>
              </div>
            ))}
          </div>
        )}
        
        <div className="text-xs opacity-60 mt-2">
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 bg-secondary">
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

export function QuickPrompts({ 
  onPromptSelect 
}: { 
  onPromptSelect: (prompt: string) => void 
}) {
  const prompts = [
    "Explain contract termination clauses",
    "What are my rights during a police stop?",
    "How to file a small claims lawsuit?",
    "Employment law basics for startups",
    "Intellectual property protection guide",
    "Real estate purchase agreement review"
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {prompts.map((prompt, index) => (
        <Button
          key={index}
          variant="outline"
          onClick={() => onPromptSelect(prompt)}
          className="justify-start text-left h-auto py-3 px-4 glass-morphism hover:border-primary/50"
        >
          <span className="text-sm">{prompt}</span>
        </Button>
      ))}
    </div>
  );
}
