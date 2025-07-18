import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

export interface GameEvent {
  type: string;
  data?: any;
}

export interface GameSocketHook {
  isConnected: boolean;
  sendEvent: (type: string, data?: any) => void;
  lastMessage: GameEvent | null;
  connectionError: string | null;
  reconnect: () => void;
}

export function useGameSocket(): GameSocketHook {
  const { token, isAuthenticated } = useAuth();
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const isConnectingRef = useRef(false);

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<GameEvent | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const connect = useCallback(() => {
    if (!isAuthenticated || !token) {
      setConnectionError("Authentication required");
      return;
    }

    if (ws.current?.readyState === WebSocket.OPEN || isConnectingRef.current) {
      return; // Already connected or connecting
    }

    isConnectingRef.current = true;

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/game`;

      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttemptsRef.current = 0;
        isConnectingRef.current = false;

        // Authenticate immediately after connection
        if (token && ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({ type: "auth", data: { token } }));
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const message: GameEvent = JSON.parse(event.data);
          setLastMessage(message);

          // Handle specific message types
          switch (message.type) {
            case "error":
              toast.error(message.data?.message || "Unknown error");
              setConnectionError(message.data?.message);
              break;
            case "auth:success":
              toast.success("Connected to game server");
              break;
            case "game:result":
              toast.success(
                `Game finished! Winner: ${message.data?.winner?.username || "Unknown"}`,
              );
              break;
            case "game:playerJoined":
              toast.success("Player joined the game!");
              break;
          }
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };

      ws.current.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason);
        setIsConnected(false);
        isConnectingRef.current = false;

        // Attempt to reconnect if not a clean close
        if (
          event.code !== 1000 &&
          reconnectAttemptsRef.current < maxReconnectAttempts
        ) {
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttemptsRef.current),
            30000,
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            console.log(
              `Reconnection attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`,
            );
            connect();
          }, delay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setConnectionError("Max reconnection attempts reached");
          toast.error("Connection lost. Please refresh the page.");
        }
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionError("Connection error");
        setIsConnected(false);
        isConnectingRef.current = false;
      };
    } catch (err) {
      console.error("Failed to connect to WebSocket:", err);
      setConnectionError("Failed to connect");
    }
  }, [isAuthenticated, token]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (ws.current) {
      ws.current.close(1000, "Component unmounting");
      ws.current = null;
    }

    setIsConnected(false);
  }, []);

  const sendEvent = useCallback((type: string, data?: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type, data }));
    } else {
      toast.error("Not connected to game server");
      setConnectionError("Not connected");
    }
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    setConnectionError(null);
    setTimeout(connect, 1000);
  }, [connect, disconnect]);

  // Temporarily disable auto-connect to fix infinite renders
  useEffect(() => {
    // TODO: Re-enable WebSocket connection later
    console.log("WebSocket temporarily disabled to prevent infinite renders");
  }, []);

  return {
    isConnected,
    sendEvent,
    lastMessage,
    connectionError,
    reconnect,
  };
}
