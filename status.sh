#!/bin/bash

# =============================================================================
# RAG Ketoan - Status Script
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

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}         📊 RAG Ketoan - Service Status 📊               ${BLUE}║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check Ketoan status
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}   Ketoan Frontend (Next.js)${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -f "$SCRIPT_DIR/.ketoan.pid" ]; then
    KETOAN_PID=$(cat "$SCRIPT_DIR/.ketoan.pid")
    if ps -p $KETOAN_PID > /dev/null 2>&1; then
        echo -e "  Status: ${GREEN}● Running${NC} (PID: $KETOAN_PID)"
        echo -e "  URL:    ${BLUE}http://localhost:3000${NC}"
    else
        echo -e "  Status: ${RED}● Stopped${NC}"
    fi
else
    # Check if Next.js is running anyway
    if pgrep -f "next dev" > /dev/null 2>&1; then
        echo -e "  Status: ${GREEN}● Running${NC}"
        echo -e "  URL:    ${BLUE}http://localhost:3000${NC}"
    else
        echo -e "  Status: ${RED}● Stopped${NC}"
    fi
fi

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}   Docker Services${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Show Docker containers
cd "$SCRIPT_DIR"
docker compose ps 2>/dev/null || echo -e "  ${YELLOW}Không có Docker container nào đang chạy${NC}"

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}   RAG Service & LLM Provider${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check RAG Service
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "  RAG Service: ${GREEN}● Running${NC}"
    
    # Get LLM info
    llm_info=$(curl -s http://localhost:8000/llm-info 2>/dev/null)
    if [ -n "$llm_info" ]; then
        llm_provider=$(echo "$llm_info" | grep -o '"provider":"[^"]*"' | cut -d'"' -f4)
        llm_model=$(echo "$llm_info" | grep -o '"model":"[^"]*"' | cut -d'"' -f4)
        llm_type=$(echo "$llm_info" | grep -o '"type":"[^"]*"' | cut -d'"' -f4)
        is_available=$(echo "$llm_info" | grep -o '"is_available":[^,}]*' | cut -d':' -f2)
        
        if [ "$llm_type" == "cloud" ]; then
            echo -e "  LLM Provider: ${CYAN}☁️  $llm_provider${NC} ($llm_model)"
        else
            echo -e "  LLM Provider: ${GREEN}🏠 $llm_provider${NC} ($llm_model)"
        fi
        
        if [ "$is_available" == "true" ]; then
            echo -e "  LLM Status:   ${GREEN}● Available${NC}"
        else
            echo -e "  LLM Status:   ${RED}● Not Available${NC}"
        fi
    fi
else
    echo -e "  RAG Service: ${RED}● Stopped${NC}"
fi

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}   Available Endpoints${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  📊 Ketoan:     ${GREEN}http://localhost:3000${NC}"
echo -e "  🧠 RAG API:    ${GREEN}http://localhost:8000${NC}"
echo -e "  📚 RAG Docs:   ${GREEN}http://localhost:8000/docs${NC}"
echo -e "  📊 n8n:        ${GREEN}http://localhost:5678${NC}"
echo -e "  🔍 Qdrant:     ${GREEN}http://localhost:6333${NC}"
echo -e "  🤖 Ollama:     ${GREEN}http://localhost:11434${NC}"
echo ""
