#!/bin/bash

echo "🚀 Starting MinusMail Backend..."

# Check if Redis is running
if ! pgrep -x "redis-server" > /dev/null; then
    echo "📦 Starting Redis..."
    redis-server --daemonize yes
    sleep 2
    echo "✅ Redis started"
else
    echo "✅ Redis already running"
fi

# Start the main application with all services
echo "🌐 Starting NestJS application with all services..."
npm run start:dev 