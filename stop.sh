#!/bin/bash

# =============================================================================
# RAG Ketoan - Stop Script
# =============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Ports to kill
PORTS=(3000 5678 6333 11434 5432)

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}         🛑 RAG Ketoan - Stopping Services 🛑             ${BLUE}║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to kill process on a specific port
kill_port() {
    local port=$1
    local pids=$(lsof -t -i:$port 2>/dev/null)
    
    if [ -n "$pids" ]; then
        echo -e "${YELLOW}[INFO] Đang kill processes trên port $port (PIDs: $pids)...${NC}"
        for pid in $pids; do
            kill -9 $pid 2>/dev/null || true
        done
        echo -e "${GREEN}[OK] Port $port đã được giải phóng${NC}"
    fi
}

# Stop Ketoan (Next.js)
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}   Dừng Ketoan Frontend${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -f "$SCRIPT_DIR/.ketoan.pid" ]; then
    KETOAN_PID=$(cat "$SCRIPT_DIR/.ketoan.pid")
    if ps -p $KETOAN_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}[INFO] Đang dừng Ketoan Frontend (PID: $KETOAN_PID)...${NC}"
        kill -9 $KETOAN_PID 2>/dev/null || true
        # Also kill any child processes
        pkill -9 -P $KETOAN_PID 2>/dev/null || true
    fi
    rm -f "$SCRIPT_DIR/.ketoan.pid"
fi

# Kill any remaining Next.js processes
echo -e "${YELLOW}[INFO] Đang dừng các process Next.js còn lại...${NC}"
pkill -9 -f "next dev" 2>/dev/null || true
pkill -9 -f "next-server" 2>/dev/null || true
pkill -9 -f "next-router-worker" 2>/dev/null || true
pkill -9 -f "/ketoan/.next" 2>/dev/null || true

# Kill Node.js processes related to ketoan
pkill -9 -f "node.*ketoan" 2>/dev/null || true

echo -e "${GREEN}[OK] Ketoan Frontend đã dừng${NC}"

# Stop Docker services
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}   Dừng Docker Services${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "${YELLOW}[INFO] Đang dừng Docker services...${NC}"
cd "$SCRIPT_DIR"
docker compose --profile cpu --profile gpu-nvidia --profile gpu-amd down 2>/dev/null || true
echo -e "${GREEN}[OK] Docker services đã dừng${NC}"

# Kill remaining processes on ports
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}   Giải phóng các ports${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

for port in "${PORTS[@]}"; do
    kill_port $port
done

# Wait a moment for ports to be released
sleep 1

# Verify ports are free
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}   Kiểm tra trạng thái ports${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

all_free=true
for port in "${PORTS[@]}"; do
    if lsof -i:$port > /dev/null 2>&1; then
        echo -e "  Port $port: ${RED}● Vẫn đang sử dụng${NC}"
        all_free=false
    else
        echo -e "  Port $port: ${GREEN}● Đã giải phóng${NC}"
    fi
done

echo ""
if [ "$all_free" = true ]; then
    echo -e "${GREEN}✅ Tất cả services và ports đã được dừng thành công!${NC}"
else
    echo -e "${YELLOW}⚠️  Một số ports vẫn đang được sử dụng. Có thể cần chạy lại với sudo.${NC}"
fi
