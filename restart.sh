#!/bin/bash

# =============================================================================
# RAG Ketoan - Restart Script
# =============================================================================

set -e

# Colors for output
BLUE='\033[0;34m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}         🔄 RAG Ketoan - Restarting Services 🔄           ${BLUE}║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Stop services
"$SCRIPT_DIR/stop.sh"

echo ""
echo -e "${CYAN}Đang chờ 3 giây...${NC}"
sleep 3
echo ""

# Start services with same arguments
"$SCRIPT_DIR/start.sh" "$@"
