#!/bin/bash

# Script khởi động môi trường development cho ứng dụng Kế Toán

set -e

echo "🚀 Khởi động môi trường development..."
echo ""

# Kiểm tra PostgreSQL
echo "📊 Kiểm tra PostgreSQL..."
if docker ps | grep -q "ragketoan-postgres-1"; then
    echo "✅ PostgreSQL đang chạy"
else
    echo "⚠️  PostgreSQL chưa chạy. Đang khởi động..."
    cd /chikiet/kata2025/ragketoan
    docker compose --profile cpu up -d postgres
    sleep 5
    echo "✅ PostgreSQL đã khởi động"
fi

echo ""

# Kiểm tra database ketoan
echo "🗄️  Kiểm tra database ketoan..."
if docker exec ragketoan-postgres-1 psql -U root -d n8n -tAc "SELECT 1 FROM pg_database WHERE datname='ketoan'" | grep -q 1; then
    echo "✅ Database ketoan đã tồn tại"
else
    echo "⚠️  Tạo database ketoan..."
    docker exec ragketoan-postgres-1 psql -U root -d n8n -c "CREATE DATABASE ketoan;"
    echo "✅ Database ketoan đã được tạo"
fi

echo ""

# Chạy Prisma migration
echo "🔄 Chạy Prisma migration..."
cd /chikiet/kata2025/ragketoan/ketoan
npx prisma db push --skip-generate
echo "✅ Database schema đã được cập nhật"

echo ""

# Kiểm tra Next.js server
echo "🌐 Kiểm tra Next.js server..."
if pgrep -f "next dev" > /dev/null; then
    echo "⚠️  Next.js server đã đang chạy. Dừng instance cũ..."
    pkill -f "next dev" || true
    sleep 2
fi

echo "🚀 Khởi động Next.js dev server với Bun..."
nohup bun run dev > /tmp/ketoan-dev.log 2>&1 &
echo $! > /tmp/ketoan-dev.pid

sleep 4

# Kiểm tra server
if pgrep -f "bun --bun next dev" > /dev/null; then
    echo "✅ Next.js server đang chạy tại http://localhost:3100"
    echo "⚡ Runtime: Bun.js"
    echo "🎨 UI: Tailwind CSS v4 + shadcn Dashboard"
    echo ""
    echo "📝 Logs: tail -f /tmp/ketoan-dev.log"
    echo "🛑 Stop: kill \$(cat /tmp/ketoan-dev.pid)"
else
    echo "❌ Lỗi khởi động Next.js server. Kiểm tra log tại /tmp/ketoan-dev.log"
    exit 1
fi

echo ""
echo "✨ Môi trường development đã sẵn sàng!"
echo ""
echo "📌 Thông tin:"
echo "   - Ứng dụng: http://localhost:3100"
echo "   - Trang quản lý hóa đơn: http://localhost:3100/hoadon"
echo "   - API: http://localhost:3100/api/invoices"
echo "   - PostgreSQL: localhost:5432"
echo ""
