import { useEffect, useRef, useState, useCallback } from "react";
import { apiClient } from "@/lib/api";

export interface WebSocketMessage {
  type: string;
  data?: any;
}

export interface GameEvent {
  type:
    | "game:created"
    | "game:updated"
    | "game:playerJoined"
    | "game:starting"
    | "game:result"
    | "error"
    | "auth:success"
    | "games:list";
  data: any;
}

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<GameEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(() => {
    if (!apiClient.isAuthenticated()) {
      setError("Authentication required");
      return;
    }

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/game`;

      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        setError(null);

        // Authenticate immediately
        const token = localStorage.getItem("authToken");
        if (token) {
          sendMessage("auth", { token });
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const message: GameEvent = JSON.parse(event.data);
          setLastMessage(message);

          if (message.type === "error") {
            setError(message.data.message);
          }
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };

      ws.current.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
      };

      ws.current.onerror = (err) => {
        console.error("WebSocket error:", err);
        setError("Connection error");
        setIsConnected(false);
      };
    } catch (err) {
      console.error("Failed to connect to WebSocket:", err);
      setError("Failed to connect");
    }
  }, []);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((type: string, data?: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type, data }));
    } else {
      console.warn("WebSocket not connected");
    }
  }, []);

  const createGame = useCallback(
    (betRange: [number, number], maxPlayers: number) => {
      sendMessage("game:create", { betRange, maxPlayers });
    },
    [sendMessage],
  );

  const joinGame = useCallback(
    (gameId: string, betAmount: number) => {
      sendMessage("game:join", { gameId, betAmount });
    },
    [sendMessage],
  );

  // Auto-connect when component mounts and we have auth
  useEffect(() => {
    if (apiClient.isAuthenticated() && !isConnected) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect, isConnected]);

  return {
    isConnected,
    lastMessage,
    error,
    connect,
    disconnect,
    sendMessage,
    createGame,
    joinGame,
  };
}
