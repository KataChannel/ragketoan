#!/bin/bash

# =============================================================================
# RAG Ketoan - View Logs Script
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

SERVICE=$1

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}         📜 RAG Ketoan - Viewing Logs 📜                  ${BLUE}║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ -z "$SERVICE" ]; then
    echo -e "${CYAN}Chọn service để xem logs:${NC}"
    echo ""
    echo -e "  ${GREEN}1)${NC} 📊 n8n"
    echo -e "  ${GREEN}2)${NC} 🐘 PostgreSQL"
    echo -e "  ${GREEN}3)${NC} 🤖 Ollama"
    echo -e "  ${GREEN}4)${NC} 🔍 Qdrant"
    echo -e "  ${GREEN}5)${NC} 🔥 Tất cả Docker services"
    echo ""
    read -p "Nhập lựa chọn của bạn [1-5]: " choice
    echo ""
    
    case $choice in
        1) SERVICE="n8n" ;;
        2) SERVICE="postgres" ;;
        3) SERVICE="ollama-cpu" ;;
        4) SERVICE="qdrant" ;;
        5) SERVICE="" ;;
        *) 
            echo -e "${RED}Lựa chọn không hợp lệ${NC}"
            exit 1
            ;;
    esac
fi

cd "$SCRIPT_DIR"

if [ -z "$SERVICE" ]; then
    echo "Đang xem logs tất cả services (Ctrl+C để thoát)..."
    echo ""
    docker compose logs -f
else
    echo "Đang xem logs cho: $SERVICE (Ctrl+C để thoát)..."
    echo ""
    docker compose logs -f "$SERVICE"
fi
