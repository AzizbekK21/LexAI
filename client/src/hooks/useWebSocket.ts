import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp?: number;
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<"connecting" | "connected" | "disconnected">("disconnected");
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const { toast } = useToast();

  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
  } = options;

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionState("connecting");

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setConnectionState("connected");
        reconnectAttemptsRef.current = 0;
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          onMessage?.(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        setConnectionState("disconnected");
        wsRef.current = null;
        onDisconnect?.();

        // Attempt to reconnect if not closed intentionally
        if (!event.wasClean && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          toast({
            title: "Connection Lost",
            description: "Unable to maintain connection to the server. Please refresh the page.",
            variant: "destructive",
          });
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        onError?.(error);
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      setConnectionState("disconnected");
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, "Manual disconnect");
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionState("disconnected");
  };

  const sendMessage = (message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        ...message,
        timestamp: Date.now(),
      }));
      return true;
    }
    return false;
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    connectionState,
    connect,
    disconnect,
    sendMessage,
  };
}

export function useRealTimeChat(conversationId?: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const handleMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case "new_message":
        if (!conversationId || message.data.conversationId === conversationId) {
          setMessages(prev => [...prev, message.data]);
        }
        break;
      case "typing_start":
        setTypingUsers(prev => [...prev.filter(id => id !== message.data.userId), message.data.userId]);
        break;
      case "typing_stop":
        setTypingUsers(prev => prev.filter(id => id !== message.data.userId));
        break;
      case "message_updated":
        setMessages(prev => prev.map(msg => 
          msg.id === message.data.id ? { ...msg, ...message.data } : msg
        ));
        break;
    }
  };

  const { sendMessage, isConnected, connectionState } = useWebSocket({
    onMessage: handleMessage,
  });

  const sendChatMessage = (content: string) => {
    return sendMessage({
      type: "send_message",
      data: {
        conversationId,
        content,
      },
    });
  };

  const startTyping = () => {
    sendMessage({
      type: "typing_start",
      data: { conversationId },
    });
  };

  const stopTyping = () => {
    sendMessage({
      type: "typing_stop",
      data: { conversationId },
    });
  };

  return {
    messages,
    typingUsers,
    sendChatMessage,
    startTyping,
    stopTyping,
    isConnected,
    connectionState,
  };
}
