# 🎮 Neon Landing - TON Gaming Platform

![Version](https://img.shields.io/badge/version-1.0.0-blue)

A modern, full-stack gaming platform built with React, TypeScript, and Express, featuring TON blockchain integration and real-time gaming experiences.

---

## 🚀 Features

- **🎲 Gaming Platform**: Roulette, item trading, and more
- **🔗 TON Integration**: Wallet connection and blockchain transactions
- **⚡ Real-time**: WebSocket-powered live updates
- **🎨 Modern UI**: Beautiful, responsive design with Tailwind CSS
- **🔒 Secure**: JWT authentication and rate limiting
- **📱 Mobile-first**: Optimized for all devices
- **🐳 Docker Ready**: Easy deployment with Docker

## 🛠️ Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Framer Motion** for animations
- **React Query** for data fetching
- **React Router** for navigation

### Backend

- **Express.js** with TypeScript
- **WebSocket** for real-time communication
- **JWT** for authentication
- **Rate limiting** for security
- **Session management**
- **CORS** configuration

### Blockchain

- **TON Connect** for wallet integration
- **TON SDK** for blockchain interactions

## 📦 Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker (optional)

### Quick Start

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd neon-landing
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8080`

### Using Setup Script (Linux/macOS)

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

## 🏗️ Build & Deploy

### Development

```bash
npm run dev          # Start development server
npm run typecheck    # Run TypeScript checks
npm run format.fix   # Format code with Prettier
```

### Production

```bash
npm run build        # Build for production
npm start           # Start production server
```

### Docker Deployment

#### Using Docker Compose (Recommended)

```bash
docker-compose up -d
```

#### Manual Docker Build

---

### Docker Networking: A Deeper Dive

This project's architecture relies on Docker Compose to manage services in an isolated and predictable network environment. Here’s a detailed breakdown of how containers communicate.

#### The Big Picture: Isolated Virtual Network

When you execute `docker compose up`, Docker Compose performs a critical setup step: it creates a **private virtual network** (by default, named `neon-landing_neon-network`). Every service defined in `docker-compose.yml` (like `neon-landing`, `postgres`, and `migrate`) is automatically connected to this network.

This creates a self-contained ecosystem where our services can operate securely, isolated from your host machine's network and other Docker projects.

---

#### 1. Internal Communication: How Services Talk to Each Other

Inside this private network, containers communicate using a powerful feature: **service discovery via Docker's internal DNS**.

- **How it Works**: Docker runs a DNS resolver on the network. When one container tries to connect to another, it uses the service name from `docker-compose.yml` as a hostname. Docker's DNS automatically resolves this hostname to the correct internal IP address of the target container.

- **Practical Example (`neon-landing` -> `postgres`)**:
  The `neon-landing` application needs to connect to the database. Its connection string is:

  ```
  DATABASE_URL=postgresql://postgres:postgres@postgres:5432/neon_landing?schema=public
  ```

  - **`postgres` (as hostname)**: This is not `localhost`. It's the service name of the database container. When the `neon-landing` container makes a request to `postgres`, Docker's DNS says, "I know `postgres`! Its internal IP is `172.x.x.x`." The connection is then established internally.
  - **`5432` (as port)**: This is the port that the PostgreSQL server is listening on _inside_ its container.

- **Key Benefit**: This system is incredibly robust. If a container restarts and gets a new internal IP, Docker's DNS automatically updates. Your application code doesn't need to change, as it always refers to the stable service name (`postgres`).

---

#### 2. External Communication: How You Access the Application

While internal communication is isolated, we need a way to access the web application from the outside world (i.e., your browser).

- **Port Mapping (`ports: ["HOST:CONTAINER"]`)**: This is the bridge between your machine (the host) and the isolated container network. The configuration in `docker-compose.yml`:

  ```yaml
  services:
    neon-landing:
      ports:
        - "3000:3000"
  ```

  - **`3000` (Host Port)**: The first value is the port on your local machine. This is the port you use in your browser (`http://localhost:3000`).
  - **`3000` (Container Port)**: The second value is the port _inside_ the `neon-landing` container that the Express server is bound to.
    Docker creates a forwarding rule: any network traffic arriving at port `3000` on your machine is instantly routed to port `3000` of the `neon-landing` container.

- **Security by Default**: Notice that the `postgres` service has **no `ports` mapping**. This is intentional. By not exposing port `5432` to the host, we make it impossible to connect to the database from anywhere _except_ from within the dedicated Docker network. This is a fundamental security measure to protect your data.

#### Data Flow Summary

A typical request follows this path:

1.  **User's Browser** -> `http://localhost:3000`
2.  **Docker Port Mapping** -> Forwards request to `neon-landing` container on port `3000`.
3.  **Express Server** (in `neon-landing` container) -> Receives request, processes logic.
4.  **Prisma Client** (in Express) -> Needs data, sends query to `postgres:5432`.
5.  **Docker DNS** -> Resolves `postgres` to the database container's internal IP.
6.  **PostgreSQL Server** (in `postgres` container) -> Receives query, executes it, and returns data back along the same path.

```bash
# Build image
docker build -t neon-landing .

---

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

# Run container
docker run -d \
  --name neon-landing \
  -p 3000:3000 \
  -e NODE_ENV=production \
  neon-landing
```

#### Using Scripts (Linux/macOS)

```bash
chmod +x scripts/docker-build.sh scripts/docker-run.sh
./scripts/docker-build.sh
./scripts/docker-run.sh
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Security
SESSION_SECRET=your-super-secret-key-change-in-production
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# TON Connect
TON_CONNECT_MANIFEST_URL=https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=30
```

### Project Structure

```
neon-landing/
├── client/                 # Frontend React application
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and API client
│   └── data/             # Static data and types
├── server/                # Backend Express application
│   ├── routes/           # API route handlers
│   ├── utils/            # Server utilities
│   └── types/            # TypeScript type definitions
├── shared/                # Shared code between client and server
├── scripts/              # Build and deployment scripts
├── public/               # Static assets
└── dist/                 # Built application
```

## 🎮 API Endpoints

### Authentication

- `GET /api/v1/auth/challenge` - Get authentication challenge
- `POST /api/v1/auth/verify` - Verify wallet signature

### Games

- `GET /api/v1/games` - Get available games
- `GET /api/v1/stats` - Get game statistics

### User (Protected)

- `GET /api/v1/user/profile` - Get user profile
- `GET /api/v1/user/history` - Get game history
- `GET /api/v1/user/inventory` - Get user inventory
- `GET /api/v1/user/earnings` - Get earnings data
- `POST /api/v1/user/claim-earnings` - Claim earnings

### Shop

- `GET /api/v1/shop/items` - Get shop items
- `POST /api/v1/shop/purchase/:itemId` - Purchase item
- `POST /api/v1/shop/sell/:itemId` - Sell item

### Roulette

- `GET /api/v1/roulette/seed` - Get provably fair seed
- `POST /api/v1/roulette/spin` - Spin roulette

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents abuse and spam
- **CORS Configuration**: Controlled cross-origin requests
- **Helmet**: Security headers
- **Input Validation**: Zod schema validation
- **Session Management**: Secure session handling

## 🎨 UI Components

Built with modern, accessible components:

- **Radix UI**: Accessible primitives
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **Lucide Icons**: Beautiful icons
- **Custom Components**: Game-specific UI elements

## 🧪 Testing

```bash
npm test           # Run tests
npm run test:watch # Run tests in watch mode
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:client` - Build client only
- `npm run build:server` - Build server only
- `npm start` - Start production server
- `npm run typecheck` - Run TypeScript checks
- `npm run format.fix` - Format code

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and type checks
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Check the documentation
- Review the API endpoints

---

Built with ❤️ for the TON ecosystem
