#!/bin/bash

# Script dừng môi trường development

echo "🛑 Dừng môi trường development..."

# Dừng Next.js server
if [ -f /tmp/ketoan-dev.pid ]; then
    PID=$(cat /tmp/ketoan-dev.pid)
    if ps -p $PID > /dev/null 2>&1; then
        kill $PID
        echo "✅ Next.js server đã dừng"
    else
        echo "⚠️  Next.js server không chạy"
    fi
    rm -f /tmp/ketoan-dev.pid
else
    # Fallback: kill by name
    if pgrep -f "next dev" > /dev/null; then
        pkill -f "next dev"
        echo "✅ Next.js server đã dừng"
    else
        echo "⚠️  Next.js server không chạy"
    fi
fi

# Dừng PostgreSQL (optional)
read -p "Bạn có muốn dừng PostgreSQL? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd /chikiet/kata2025/ragketoan
    docker compose down postgres
    echo "✅ PostgreSQL đã dừng"
fi

echo "✨ Đã dừng môi trường development"
