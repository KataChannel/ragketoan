#!/bin/bash

# =============================================================================
# RAG Ketoan - Start Script
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Default profile
PROFILE="cpu"
SERVICE=""

# Function to show banner
show_banner() {
    echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}${BOLD}         🚀 RAG Ketoan - Self-hosted AI Kit 🚀            ${NC}${BLUE}║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Function to show menu
show_menu() {
    echo -e "${CYAN}Chọn service bạn muốn chạy:${NC}"
    echo ""
    echo -e "  ${GREEN}1)${NC} 🤖 N8N + AI Stack     (n8n, Ollama, Qdrant, PostgreSQL)"
    echo -e "  ${GREEN}2)${NC} 📊 Ketoan Frontend    (Next.js App)"
    echo -e "  ${GREEN}3)${NC} 🔥 Tất cả             (N8N + AI + Ketoan)"
    echo -e "  ${GREEN}4)${NC} 🛑 Dừng tất cả        (Stop all services)"
    echo -e "  ${GREEN}5)${NC} 🔫 Kill ports         (Giải phóng ports)"
    echo -e "  ${GREEN}6)${NC} 📊 Xem trạng thái     (Status)"
    echo -e "  ${GREEN}7)${NC} 📜 Xem logs           (Logs)"
    echo -e "  ${GREEN}8)${NC} ❌ Thoát"
    echo ""
}

# Function to show GPU menu
show_gpu_menu() {
    echo -e "${CYAN}Chọn cấu hình GPU:${NC}"
    echo ""
    echo -e "  ${GREEN}1)${NC} 💻 CPU only (mặc định)"
    echo -e "  ${GREEN}2)${NC} 🎮 Nvidia GPU"
    echo -e "  ${GREEN}3)${NC} 🔴 AMD GPU"
    echo ""
}

# Function to check prerequisites
check_prerequisites() {
    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}[ERROR] Docker chưa được cài đặt!${NC}"
        exit 1
    fi

    # Check Docker Compose
    if ! docker compose version &> /dev/null; then
        echo -e "${RED}[ERROR] Docker Compose chưa được cài đặt!${NC}"
        exit 1
    fi
}

# Function to check .env file
check_env() {
    if [ ! -f "$SCRIPT_DIR/.env" ]; then
        echo -e "${YELLOW}[INFO] File .env không tồn tại. Đang tạo từ .env.example...${NC}"
        if [ -f "$SCRIPT_DIR/.env.example" ]; then
            cp "$SCRIPT_DIR/.env.example" "$SCRIPT_DIR/.env"
            echo -e "${GREEN}[OK] File .env đã được tạo. Hãy cập nhật các secrets!${NC}"
        else
            echo -e "${RED}[ERROR] File .env.example không tồn tại!${NC}"
            exit 1
        fi
    fi
}

# Function to start N8N + AI Stack
start_n8n() {
    echo -e "${GREEN}[INFO] Đang khởi động N8N + AI Stack với profile: ${PROFILE}${NC}"
    echo ""
    cd "$SCRIPT_DIR"
    docker compose --profile "$PROFILE" up -d
    
    echo ""
    echo -e "${GREEN}✅ N8N + AI Stack đã khởi động!${NC}"
    echo ""
    echo -e "  📊 n8n:        ${BLUE}http://localhost:5678${NC}"
    echo -e "  🔍 Qdrant:     ${BLUE}http://localhost:6333${NC}"
    echo -e "  🤖 Ollama:     ${BLUE}http://localhost:11434${NC}"
}

# Function to start Ketoan
start_ketoan() {
    echo -e "${GREEN}[INFO] Đang khởi động Ketoan Frontend...${NC}"
    echo ""
    
    cd "$SCRIPT_DIR/ketoan"
    
    # Kill any existing Next.js processes
    echo -e "${YELLOW}[INFO] Đang dừng các process Next.js cũ...${NC}"
    pkill -9 -f "next dev" 2>/dev/null || true
    pkill -9 -f "next-server" 2>/dev/null || true
    pkill -9 -f "next-router-worker" 2>/dev/null || true
    
    # Kill port 3000 if in use
    local port_pids=$(lsof -t -i:3000 2>/dev/null)
    if [ -n "$port_pids" ]; then
        echo -e "${YELLOW}[INFO] Đang giải phóng port 3000...${NC}"
        for pid in $port_pids; do
            kill -9 $pid 2>/dev/null || true
        done
    fi
    
    # Remove Next.js lock file if exists
    if [ -f "$SCRIPT_DIR/ketoan/.next/dev/lock" ]; then
        echo -e "${YELLOW}[INFO] Đang xóa lock file...${NC}"
        rm -f "$SCRIPT_DIR/ketoan/.next/dev/lock"
    fi
    
    # Wait a moment for ports to be released
    sleep 1
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}[INFO] Đang cài đặt dependencies...${NC}"
        npm install
    fi
    
    # Start Next.js dev server in background
    echo -e "${GREEN}[INFO] Đang khởi động Next.js development server...${NC}"
    npm run dev &
    KETOAN_PID=$!
    echo $KETOAN_PID > "$SCRIPT_DIR/.ketoan.pid"
    
    echo ""
    echo -e "${GREEN}✅ Ketoan Frontend đã khởi động!${NC}"
    echo ""
    echo -e "  📊 Ketoan:     ${BLUE}http://localhost:3000${NC}"
}

# Function to start all services
start_all() {
    start_n8n
    echo ""
    start_ketoan
}

# Parse arguments for non-interactive mode
while [[ $# -gt 0 ]]; do
    case $1 in
        --gpu|--nvidia)
            PROFILE="gpu-nvidia"
            shift
            ;;
        --amd)
            PROFILE="gpu-amd"
            shift
            ;;
        --cpu)
            PROFILE="cpu"
            shift
            ;;
        --n8n)
            SERVICE="n8n"
            shift
            ;;
        --ketoan)
            SERVICE="ketoan"
            shift
            ;;
        --all)
            SERVICE="all"
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Service Options:"
            echo "  --n8n       Chạy N8N + AI Stack"
            echo "  --ketoan    Chạy Ketoan Frontend"
            echo "  --all       Chạy tất cả services"
            echo ""
            echo "GPU Options:"
            echo "  --cpu       Chạy với CPU (mặc định)"
            echo "  --gpu       Chạy với Nvidia GPU"
            echo "  --nvidia    Giống --gpu"
            echo "  --amd       Chạy với AMD GPU"
            echo ""
            echo "Other:"
            echo "  -h, --help  Hiển thị trợ giúp"
            echo ""
            echo "Nếu không có tham số, script sẽ hiển thị menu tương tác."
            exit 0
            ;;
        *)
            echo -e "${RED}Tùy chọn không hợp lệ: $1${NC}"
            exit 1
            ;;
    esac
done

# Main script
show_banner
check_prerequisites
check_env

# Non-interactive mode
if [ -n "$SERVICE" ]; then
    case $SERVICE in
        n8n)
            start_n8n
            ;;
        ketoan)
            start_ketoan
            ;;
        all)
            start_all
            ;;
    esac
    exit 0
fi

# Interactive mode
while true; do
    show_menu
    read -p "Nhập lựa chọn của bạn [1-8]: " choice
    echo ""
    
    case $choice in
        1)
            # Show GPU menu for N8N
            show_gpu_menu
            read -p "Nhập lựa chọn GPU [1-3]: " gpu_choice
            case $gpu_choice in
                1) PROFILE="cpu" ;;
                2) PROFILE="gpu-nvidia" ;;
                3) PROFILE="gpu-amd" ;;
                *) PROFILE="cpu" ;;
            esac
            echo ""
            start_n8n
            break
            ;;
        2)
            start_ketoan
            break
            ;;
        3)
            # Show GPU menu for all
            show_gpu_menu
            read -p "Nhập lựa chọn GPU [1-3]: " gpu_choice
            case $gpu_choice in
                1) PROFILE="cpu" ;;
                2) PROFILE="gpu-nvidia" ;;
                3) PROFILE="gpu-amd" ;;
                *) PROFILE="cpu" ;;
            esac
            echo ""
            start_all
            break
            ;;
        4)
            # Stop all services
            "$SCRIPT_DIR/stop.sh"
            echo ""
            ;;
        5)
            # Kill ports
            "$SCRIPT_DIR/kill-ports.sh"
            echo ""
            ;;
        6)
            # Show status
            "$SCRIPT_DIR/status.sh"
            echo ""
            ;;
        7)
            # Show logs
            "$SCRIPT_DIR/logs.sh"
            break
            ;;
        8)
            echo -e "${YELLOW}Tạm biệt! 👋${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Lựa chọn không hợp lệ. Vui lòng chọn 1-8.${NC}"
            echo ""
            ;;
    esac
done

echo ""
echo -e "${YELLOW}[TIP] Dùng './stop.sh' để dừng tất cả services${NC}"
echo -e "${YELLOW}[TIP] Dùng './logs.sh' để xem logs${NC}"
echo -e "${YELLOW}[TIP] Dùng './status.sh' để xem trạng thái${NC}"
