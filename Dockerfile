# 1. Builder Stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json .npmrc ./
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build client and server
RUN npm run build

# 2. Production Stage
FROM node:20-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy production dependencies
COPY --from=builder /app/node_modules ./node_modules

# Copy built application and necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000

CMD ["npm", "run", "start"]
