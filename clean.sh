#!/bin/bash

# =============================================================================
# RAG Ketoan - Clean Script (Remove volumes and reset)
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${RED}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║${NC}         ⚠️  RAG Ketoan - Clean All Data ⚠️               ${RED}║${NC}"
echo -e "${RED}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}⚠️  CẢNH BÁO: Thao tác này sẽ xóa tất cả dữ liệu bao gồm:${NC}"
echo -e "   - n8n workflows và credentials"
echo -e "   - PostgreSQL database"
echo -e "   - Qdrant vector store"
echo -e "   - Ollama models"
echo -e "   - Ketoan node_modules"
echo ""
read -p "Bạn có chắc chắn muốn tiếp tục? (y/N): " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo -e "${GREEN}[OK] Đã hủy thao tác.${NC}"
    exit 0
fi

echo ""

# Stop all services first
"$SCRIPT_DIR/stop.sh"

echo ""
echo -e "${YELLOW}[INFO] Đang xóa Docker volumes...${NC}"
cd "$SCRIPT_DIR"
docker compose --profile cpu --profile gpu-nvidia --profile gpu-amd down -v 2>/dev/null || true

# Clean Ketoan node_modules
read -p "Bạn có muốn xóa node_modules của Ketoan? (y/N): " clean_node
if [ "$clean_node" = "y" ] || [ "$clean_node" = "Y" ]; then
    echo -e "${YELLOW}[INFO] Đang xóa ketoan/node_modules...${NC}"
    rm -rf "$SCRIPT_DIR/ketoan/node_modules"
    rm -rf "$SCRIPT_DIR/ketoan/.next"
fi

# Clean PID file
rm -f "$SCRIPT_DIR/.ketoan.pid"

echo ""
echo -e "${GREEN}✅ Tất cả services và volumes đã được xóa thành công!${NC}"
echo -e "${YELLOW}[TIP] Chạy './start.sh' để bắt đầu lại từ đầu${NC}"
