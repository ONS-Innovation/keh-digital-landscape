# ---- Build Stage ----
FROM node:20-slim AS builder
WORKDIR /app

# Add build argument for backend URL
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

# Copy package files first
COPY package*.json ./

# Install dependencies with production flag
RUN npm ci --omit=dev --legacy-peer-deps

# Copy the rest of the app files
COPY . .

# Build the app
RUN NODE_OPTIONS=--max-old-space-size=4096 npm run build

# ---- Run Stage ----
FROM node:20-slim
WORKDIR /app

ENV NODE_ENV=production
# Install serve for production
RUN npm install -g serve

# Copy only the built app from the builder stage
# COPY --from=builder /app/build ./build
COPY --from=builder /app/dist ./dist

# Set non-root user
RUN addgroup --system appgroup && adduser --system --group appuser
USER appuser

# Start the app
# CMD ["serve", "-s", "build", "-l", "3000"]
CMD ["serve", "-s", "dist", "-l", "3000"]

EXPOSE 3000
