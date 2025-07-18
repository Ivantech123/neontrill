import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { verifyJWT } from "./utils/auth";
import { gameState, Game, Player } from "./utils/gameState";

interface AuthenticatedWebSocket extends WebSocket {
  userAddress?: string;
  isAlive?: boolean;
}

interface WebSocketMessage {
  type: string;
  data?: any;
}

export class GameWebSocketServer {
  private wss: WebSocketServer;
  private clients: Map<string, AuthenticatedWebSocket> = new Map();

  constructor(server: any) {
    this.wss = new WebSocketServer({
      server,
      path: "/game",
    });

    this.setupWebSocketServer();
  }

  private setupWebSocketServer(): void {
    this.wss.on(
      "connection",
      (ws: AuthenticatedWebSocket, request: IncomingMessage) => {
        console.log("New WebSocket connection");

        // Set up ping/pong for connection health
        ws.isAlive = true;
        ws.on("pong", () => {
          ws.isAlive = true;
        });

        // Handle authentication and messages
        ws.on("message", (data: Buffer) => {
          try {
            const message: WebSocketMessage = JSON.parse(data.toString());
            this.handleMessage(ws, message);
          } catch (error) {
            console.error("Invalid WebSocket message:", error);
            this.sendError(ws, "Invalid message format");
          }
        });

        ws.on("close", () => {
          if (ws.userAddress) {
            this.clients.delete(ws.userAddress);
            console.log(`User ${ws.userAddress} disconnected`);
          }
        });

        ws.on("error", (error) => {
          console.error("WebSocket error:", error);
        });
      },
    );

    // Set up connection health check
    setInterval(() => {
      this.wss.clients.forEach((ws: AuthenticatedWebSocket) => {
        if (!ws.isAlive) {
          ws.terminate();
          return;
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);

    // Set up game state broadcast
    setInterval(() => {
      this.broadcastGameUpdates();
    }, 1000);
  }

  private handleMessage(
    ws: AuthenticatedWebSocket,
    message: WebSocketMessage,
  ): void {
    switch (message.type) {
      case "auth":
        this.handleAuth(ws, message.data);
        break;
      case "game:create":
        this.handleCreateGame(ws, message.data);
        break;
      case "game:join":
        this.handleJoinGame(ws, message.data);
        break;
      default:
        this.sendError(ws, `Unknown message type: ${message.type}`);
    }
  }

  private handleAuth(
    ws: AuthenticatedWebSocket,
    data: { token: string },
  ): void {
    if (!data?.token) {
      this.sendError(ws, "Token required for authentication");
      return;
    }

    const decoded = verifyJWT(data.token);
    if (!decoded) {
      this.sendError(ws, "Invalid or expired token");
      ws.close();
      return;
    }

    ws.userAddress = decoded.address;
    this.clients.set(decoded.address, ws);

    this.send(ws, {
      type: "auth:success",
      data: { address: decoded.address },
    });

    // Send current game state
    this.sendGamesList(ws);

    console.log(`User ${decoded.address} authenticated via WebSocket`);
  }

  private handleCreateGame(
    ws: AuthenticatedWebSocket,
    data: { betRange: [number, number]; maxPlayers: number },
  ): void {
    if (!ws.userAddress) {
      this.sendError(ws, "Authentication required");
      return;
    }

    if (!data?.betRange || !data?.maxPlayers) {
      this.sendError(ws, "betRange and maxPlayers are required");
      return;
    }

    if (data.maxPlayers < 2 || data.maxPlayers > 10) {
      this.sendError(ws, "maxPlayers must be between 2 and 10");
      return;
    }

    if (data.betRange[0] <= 0 || data.betRange[1] <= data.betRange[0]) {
      this.sendError(ws, "Invalid bet range");
      return;
    }

    try {
      const game = gameState.createGame(
        ws.userAddress,
        data.betRange,
        data.maxPlayers,
      );

      this.broadcast({
        type: "game:created",
        data: this.formatGameForClient(game),
      });

      console.log(`Game ${game.id} created by ${ws.userAddress}`);
    } catch (error) {
      console.error("Create game error:", error);
      this.sendError(ws, "Failed to create game");
    }
  }

  private handleJoinGame(
    ws: AuthenticatedWebSocket,
    data: { gameId: string; betAmount: number },
  ): void {
    if (!ws.userAddress) {
      this.sendError(ws, "Authentication required");
      return;
    }

    if (!data?.gameId || !data?.betAmount) {
      this.sendError(ws, "gameId and betAmount are required");
      return;
    }

    const game = gameState.getGame(data.gameId);
    if (!game) {
      this.sendError(ws, "Game not found");
      return;
    }

    const player: Player = {
      address: ws.userAddress,
      betAmount: data.betAmount,
      joinedAt: Date.now(),
    };

    const success = gameState.joinGame(data.gameId, player);
    if (!success) {
      this.sendError(
        ws,
        "Failed to join game (invalid bet amount or game full)",
      );
      return;
    }

    this.broadcast({
      type: "game:playerJoined",
      data: {
        gameId: data.gameId,
        player: {
          address: player.address,
          betAmount: player.betAmount,
        },
        game: this.formatGameForClient(game),
      },
    });

    console.log(`Player ${ws.userAddress} joined game ${data.gameId}`);
  }

  private sendGamesList(ws: AuthenticatedWebSocket): void {
    const games = gameState.getAllActiveGames();
    this.send(ws, {
      type: "games:list",
      data: games.map((game) => this.formatGameForClient(game)),
    });
  }

  private broadcastGameUpdates(): void {
    const games = gameState.getAllActiveGames();
    const finishedGames = Array.from(gameState["games"].values()).filter(
      (game) =>
        game.status === "finished" &&
        game.finishedAt &&
        Date.now() - game.finishedAt < 5000, // Recently finished games
    );

    // Broadcast game updates
    games.forEach((game) => {
      this.broadcast({
        type: "game:updated",
        data: this.formatGameForClient(game),
      });

      // Check for game starting
      if (game.status === "starting" && !game.startedAt) {
        this.broadcast({
          type: "game:starting",
          data: { gameId: game.id },
        });
      }
    });

    // Broadcast finished game results
    finishedGames.forEach((game) => {
      if (game.winner && game.winnings) {
        this.broadcast({
          type: "game:result",
          data: {
            gameId: game.id,
            winner: {
              address: game.winner.address,
              username: game.winner.username || game.winner.address.slice(0, 8),
            },
            winnings: game.winnings,
          },
        });
      }
    });
  }

  private formatGameForClient(game: Game) {
    return {
      id: game.id,
      pot: game.pot,
      betRange: game.betRange,
      players: game.players.length,
      maxPlayers: game.maxPlayers,
      timeLeft: game.timeLeft,
      status: game.status,
    };
  }

  private send(ws: AuthenticatedWebSocket, message: WebSocketMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private sendError(ws: AuthenticatedWebSocket, message: string): void {
    this.send(ws, {
      type: "error",
      data: { message },
    });
  }

  private broadcast(message: WebSocketMessage): void {
    this.clients.forEach((ws) => {
      this.send(ws, message);
    });
  }

  public getConnectedUsers(): number {
    return this.clients.size;
  }
}
