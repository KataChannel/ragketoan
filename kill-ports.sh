#!/bin/bash

# =============================================================================
# RAG Ketoan - Kill Ports Script
# =============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default ports used by the project
DEFAULT_PORTS=(3000 5678 6333 11434 5432)

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}         🔫 RAG Ketoan - Kill Ports 🔫                     ${BLUE}║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to kill process on a specific port
kill_port() {
    local port=$1
    local pids=$(lsof -t -i:$port 2>/dev/null)
    
    if [ -n "$pids" ]; then
        echo -e "${YELLOW}[KILLING] Port $port - PIDs: $pids${NC}"
        for pid in $pids; do
            # Get process name for logging
            local pname=$(ps -p $pid -o comm= 2>/dev/null || echo "unknown")
            echo -e "  → Killing PID $pid ($pname)..."
            kill -9 $pid 2>/dev/null || true
        done
        
        # Verify
        sleep 0.5
        if lsof -i:$port > /dev/null 2>&1; then
            echo -e "  ${RED}✗ Port $port vẫn đang sử dụng${NC}"
            return 1
        else
            echo -e "  ${GREEN}✓ Port $port đã giải phóng${NC}"
            return 0
        fi
    else
        echo -e "${GREEN}[OK] Port $port đã trống${NC}"
        return 0
    fi
}

# Function to show port status
show_port_status() {
    local port=$1
    local info=$(lsof -i:$port 2>/dev/null | tail -n +2)
    
    if [ -n "$info" ]; then
        local pid=$(echo "$info" | awk '{print $2}' | head -1)
        local pname=$(echo "$info" | awk '{print $1}' | head -1)
        echo -e "  Port $port: ${RED}● Đang sử dụng${NC} (PID: $pid, Process: $pname)"
    else
        echo -e "  Port $port: ${GREEN}● Trống${NC}"
    fi
}

# Parse arguments
if [ $# -eq 0 ]; then
    # Interactive mode
    echo -e "${CYAN}Chọn tùy chọn:${NC}"
    echo ""
    echo -e "  ${GREEN}1)${NC} Kill tất cả ports mặc định (3000, 5678, 6333, 11434, 5432)"
    echo -e "  ${GREEN}2)${NC} Kill port cụ thể"
    echo -e "  ${GREEN}3)${NC} Xem trạng thái tất cả ports"
    echo -e "  ${GREEN}4)${NC} Thoát"
    echo ""
    read -p "Nhập lựa chọn [1-4]: " choice
    echo ""
    
    case $choice in
        1)
            echo -e "${CYAN}━━━ Killing tất cả ports mặc định ━━━${NC}"
            echo ""
            for port in "${DEFAULT_PORTS[@]}"; do
                kill_port $port
            done
            ;;
        2)
            read -p "Nhập port cần kill (vd: 3000 hoặc 3000,5678,8080): " ports_input
            IFS=',' read -ra PORTS <<< "$ports_input"
            echo ""
            for port in "${PORTS[@]}"; do
                port=$(echo "$port" | tr -d ' ')
                if [[ "$port" =~ ^[0-9]+$ ]]; then
                    kill_port $port
                else
                    echo -e "${RED}[ERROR] Port không hợp lệ: $port${NC}"
                fi
            done
            ;;
        3)
            echo -e "${CYAN}━━━ Trạng thái các ports ━━━${NC}"
            echo ""
            for port in "${DEFAULT_PORTS[@]}"; do
                show_port_status $port
            done
            ;;
        4)
            echo -e "${YELLOW}Tạm biệt! 👋${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Lựa chọn không hợp lệ${NC}"
            exit 1
            ;;
    esac
else
    # Command line mode
    case $1 in
        --all|-a)
            echo -e "${CYAN}━━━ Killing tất cả ports mặc định ━━━${NC}"
            echo ""
            for port in "${DEFAULT_PORTS[@]}"; do
                kill_port $port
            done
            ;;
        --status|-s)
            echo -e "${CYAN}━━━ Trạng thái các ports ━━━${NC}"
            echo ""
            for port in "${DEFAULT_PORTS[@]}"; do
                show_port_status $port
            done
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS] [PORTS]"
            echo ""
            echo "Options:"
            echo "  --all, -a      Kill tất cả ports mặc định"
            echo "  --status, -s   Xem trạng thái ports"
            echo "  --help, -h     Hiển thị trợ giúp"
            echo ""
            echo "Examples:"
            echo "  $0              Chế độ tương tác"
            echo "  $0 --all       Kill tất cả ports mặc định"
            echo "  $0 3000        Kill port 3000"
            echo "  $0 3000 5678   Kill ports 3000 và 5678"
            echo ""
            echo "Default ports: ${DEFAULT_PORTS[*]}"
            ;;
        *)
            # Treat all arguments as port numbers
            for port in "$@"; do
                if [[ "$port" =~ ^[0-9]+$ ]]; then
                    kill_port $port
                else
                    echo -e "${RED}[ERROR] Port không hợp lệ: $port${NC}"
                fi
            done
            ;;
    esac
fi

echo ""
echo -e "${GREEN}✅ Hoàn tất!${NC}"
