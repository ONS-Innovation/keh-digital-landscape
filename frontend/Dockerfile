# ---- Build Stage ----
FROM node:24-alpine AS builder
WORKDIR /app

# Add build argument for backend URL
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV NODE_OPTIONS="--max-old-space-size=512"

# Copy dependency files first
COPY package.json package-lock.json ./

# Install dependencies with production flag
# RUN npm install --legacy-peer-deps --prefer-offline
RUN echo "Starting npm install: $(date)" && npm install --legacy-peer-deps --prefer-offline && echo "Finished npm install: $(date)"

# Copy the rest of the app files
COPY . .

# Build the app
ENV DEBUG=true
RUN npm run build

# ---- Run Stage ----
FROM node:24-slim
WORKDIR /app

# Install serve for production
RUN npm install -g serve

# Copy only the built app from the builder stage
COPY --from=builder /app/build ./build

# Set non-root user
RUN addgroup --system appgroup && adduser --system --group appuser
USER appuser

# Start the app
CMD ["serve", "-s", "build", "-l", "3000"]

EXPOSE 3000
