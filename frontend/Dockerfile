# ---- Build Stage ----
FROM node:22-alpine AS builder
WORKDIR /app

# Add build argument for backend URL
ARG VITE_BACKEND_URL 
ARG VITE_SUPPORT_MAIL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_SUPPORT_MAIL=$VITE_SUPPORT_MAIL

# Copy package files first
COPY package*.json ./

# Install dependencies with production flag
RUN npm ci -legacy-peer-deps

# Copy the rest of the app files
COPY . .

# Build the app
RUN NODE_OPTIONS=--max-old-space-size=4096 npm run build

# ---- Run Stage ----
FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production
# Install serve for production
RUN npm install -g serve

# Copy only the built app from the builder stage
COPY --from=builder /app/build ./build

# Set non-root user Alpine syntax for creating a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Start the app
CMD ["serve", "-s", "build", "-l", "3000"]

EXPOSE 3000
