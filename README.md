# 🎮 Neon Landing - TON Gaming Platform

A modern, full-stack gaming platform built with React, TypeScript, and Express, featuring TON blockchain integration and real-time gaming experiences.

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
```bash
# Build image
docker build -t neon-landing .

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
